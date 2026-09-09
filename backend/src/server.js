const app = require('./app');
const config = require('./config/env');
const db = require('./config/db');

const startServer = async () => {
  try {
    // Ensure database and schema tables are initialized
    await db.initDb();

    const server = app.listen(config.port, () => {
      console.log(`=========================================`);
      console.log(`  🚀 NOVA Backend Server is running!    `);
      console.log(`  📡 Port: ${config.port}                        `);
      console.log(`  🌐 Base URL: http://localhost:${config.port}/api`);
      console.log(`  🔒 Environment: ${config.nodeEnv}          `);
      console.log(`=========================================`);
    });

    // Graceful shutdown handling
    const handleShutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        console.log('HTTP server closed.');
        try {
          await db.close();
          console.log('SQLite database connection closed.');
          process.exit(0);
        } catch (err) {
          console.error('Error during database shutdown:', err.message);
          process.exit(1);
        }
      });
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
