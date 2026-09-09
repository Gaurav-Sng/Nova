const config = require('../config/env');

/**
 * 404 Not Found handler for undefined routes
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
};

/**
 * Global centralized error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error internally
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  // Handle SQLite constraint errors gracefully
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(400).json({
      error: 'Database constraint violation. Duplicate or invalid reference.',
    });
  }

  // Handle JSON parsing errors in body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON payload.' });
  }

  const statusCode = err.statusCode || 500;
  const message = config.isProduction && statusCode === 500
    ? 'Internal Server Error. Please contact support.'
    : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: message,
    ...(config.isProduction ? {} : { stack: err.stack }),
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
