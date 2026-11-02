const express = require('express');
const cors = require('cors');

const healthRoutes = require('./routes/health');
const brandsRoutes = require('./routes/brands');
const analyticsRoutes = require('./routes/analytics');
const tweetsRoutes = require('./routes/tweets');
const datasetRoutes = require('./routes/dataset');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });
    next();
  });
}

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/brands', brandsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/tweets', tweetsRoutes);
app.use('/api/dataset', datasetRoutes);

// Catch 404
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    timestamp: new Date().toISOString(),
    error: {
      code: 'NOT_FOUND',
      message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist.`
    }
  });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
