import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/index.js';
import { validateEnv } from './config/validateEnv.js';
import { testConnection } from './config/database.js';
import { runProductionMigrations } from './database/runMigrations.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { ensureUploadDir } from './services/uploadService.js';
import { ensureDefaultRoles } from './services/roleService.js';
import logger from './utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

if (config.env === 'production') {
  app.set('trust proxy', 1);
}

try {
  validateEnv();
} catch (e) {
  logger.error(e.message);
  if (config.env === 'production') process.exit(1);
}

ensureUploadDir();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../', config.upload.dir)));

app.get('/health', async (req, res) => {
  const dbOk = await testConnection();
  res.status(dbOk ? 200 : 503).json({
    success: dbOk,
    message: dbOk ? 'MBA Path Pro API is healthy' : 'Database unavailable',
    env: config.env,
    razorpay: config.razorpay.enabled,
    email: config.email.enabled,
  });
});

app.use(config.apiPrefix, routes);

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  try {
    await runProductionMigrations();
    logger.info('Production migrations completed successfully');
  } catch (e) {
    if (config.env === 'production') {
      logger.error('Production migrations failed — cannot start', e);
      process.exit(1);
    } else {
      logger.warn('Development migrations skipped or failed:', e.message);
    }
  }
  try {
    await ensureDefaultRoles();
  } catch (e) {
    logger.warn('Role bootstrap failed:', e.message);
  }
  const connected = await testConnection();
  if (!connected) {
    if (config.env === 'production') {
      logger.error('Database connection failed — cannot start');
      process.exit(1);
    } else {
      logger.warn('Starting without DB connection - run npm run db:setup');
    }
  }
  app.listen(config.port, () => {
    logger.info(`MBA Path Pro API running on http://localhost:${config.port}${config.apiPrefix} [${config.env}]`);
  });
};

start();

export default app;
