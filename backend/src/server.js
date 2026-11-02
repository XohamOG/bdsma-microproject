const app = require('./app');
const config = require('./config');

const server = app.listen(config.PORT, config.HOST, () => {
  console.log(`============================================================`);
  console.log(`  🚀 Brand Reputation Monitoring API Server`);
  console.log(`  Environment: ${config.NODE_ENV}`);
  console.log(`  Listening:   http://${config.HOST === '0.0.0.0' ? 'localhost' : config.HOST}:${config.PORT}`);
  console.log(`  Endpoints:`);
  console.log(`    - Health:      http://localhost:${config.PORT}/api/health`);
  console.log(`    - Brands:      http://localhost:${config.PORT}/api/brands`);
  console.log(`    - Analytics:   http://localhost:${config.PORT}/api/analytics/sentiment`);
  console.log(`    - Trends:      http://localhost:${config.PORT}/api/analytics/trends`);
  console.log(`    - Complaints:  http://localhost:${config.PORT}/api/analytics/complaints`);
  console.log(`    - Comparison:  http://localhost:${config.PORT}/api/analytics/compare`);
  console.log(`    - Anomalies:   http://localhost:${config.PORT}/api/analytics/anomalies`);
  console.log(`    - Tweets:      http://localhost:${config.PORT}/api/tweets?page=1&limit=10`);
  console.log(`    - Benchmarks:  http://localhost:${config.PORT}/api/analytics/benchmarks`);
  console.log(`    - Upload:      POST http://localhost:${config.PORT}/api/dataset/upload`);
  console.log(`============================================================`);
});

// Graceful shutdown
function gracefulShutdown(signal) {
  console.log(`\n[INFO] Received ${signal}. Shutting down API server gracefully...`);
  server.close(() => {
    console.log('[INFO] Closed all active connections. Server terminated.');
    process.exit(0);
  });
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

module.exports = server;
