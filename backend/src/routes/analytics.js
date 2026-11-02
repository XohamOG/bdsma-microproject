const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

// GET /api/analytics/sentiment
router.get('/sentiment', (req, res) => {
  const { brand, startDate, endDate } = req.query;
  const data = dataService.getSentimentOverview(brand, startDate, endDate);
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data
  });
});

// GET /api/analytics/trends
router.get('/trends', (req, res) => {
  const { brand = 'all', interval = 'daily' } = req.query;
  const data = dataService.getTrends(brand, interval);
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data
  });
});

// GET /api/analytics/complaints
router.get('/complaints', (req, res) => {
  const { brand, limit = 10 } = req.query;
  const data = dataService.getComplaints(brand, limit);
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data
  });
});

// GET /api/analytics/compare
router.get('/compare', (req, res) => {
  const { brands } = req.query;
  const brandList = brands ? brands.split(',').map(s => s.trim()) : null;
  const data = dataService.getBrandComparison(brandList);
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data
  });
});

// GET /api/analytics/anomalies
router.get('/anomalies', (req, res) => {
  const { brand, severity } = req.query;
  const data = dataService.getAnomalies(brand, severity);
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data
  });
});

// GET /api/analytics/benchmarks
router.get('/benchmarks', (req, res) => {
  const data = dataService.getBenchmarks();
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data
  });
});

module.exports = router;
