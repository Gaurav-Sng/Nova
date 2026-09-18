const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_key_please_set_in_env',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  dbPath: process.env.DB_PATH || path.resolve(__dirname, '../../database.sqlite'),
  tursoUrl: process.env.TURSO_URL,
  tursoToken: process.env.TURSO_TOKEN,
  isProduction: process.env.NODE_ENV === 'production',
};

// Security check in production
if (config.isProduction && config.jwtSecret === 'fallback_secret_key_please_set_in_env') {
  console.error('FATAL ERROR: JWT_SECRET environment variable is not configured for production.');
  process.exit(1);
}

module.exports = config;
