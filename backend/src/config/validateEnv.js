import logger from '../utils/logger.js';

const required = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_NAME', 'CLIENT_URL'];
const requiredInProduction = ['NODE_ENV', 'DB_PASSWORD'];

export function validateEnv() {
  const env = process.env.NODE_ENV || 'development';
  const missing = required.filter((key) => !process.env[key]);
  
  if (missing.length) {
    logger.warn(`Missing env vars: ${missing.join(', ')} — using defaults where available`);
  }
  
  if (env === 'production') {
    // In production, all required vars MUST be set
    const prodMissing = [...required, ...requiredInProduction].filter((key) => !process.env[key]);
    if (prodMissing.length) {
      throw new Error(`Production requires: ${prodMissing.join(', ')}`);
    }
    
    // Validate JWT_SECRET strength
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.includes('change')) {
      throw new Error('JWT_SECRET must be secure (≥32 chars, no "change" placeholder) for production');
    }
    
    // Validate CLIENT_URL is HTTPS or localhost
    const clientUrl = process.env.CLIENT_URL;
    if (!clientUrl.startsWith('https://') && !clientUrl.includes('localhost')) {
      throw new Error('CLIENT_URL must use HTTPS in production (except localhost for testing)');
    }
  }
}

