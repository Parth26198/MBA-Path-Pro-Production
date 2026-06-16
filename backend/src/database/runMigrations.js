import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import config from '../config/index.js';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runProductionMigrations() {
  const migrationsDir = path.join(__dirname, '../../database/migrations');
  if (!fs.existsSync(migrationsDir)) return;

  const connection = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    multipleStatements: true,
  });

  try {
    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean);

      for (const statement of statements) {
        try {
          await connection.query(statement);
        } catch (err) {
          if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_TABLE_EXISTS_ERROR') {
            logger.debug(`Migration skip (exists): ${err.message}`);
          } else {
            throw err;
          }
        }
      }
      logger.info(`Migration applied: ${file}`);
    }
  } finally {
    await connection.end();
  }
}

if (process.argv[1]?.includes('runMigrations')) {
  runProductionMigrations()
    .then(() => process.exit(0))
    .catch((e) => {
      logger.error(e);
      process.exit(1);
    });
}
