const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

router.get('/', (req, res) => {
  const brands = dataService.getBrands();
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data: {
      status: 'healthy',
      version: '1.0.0',
      dataset: {
        name: 'Twitter US Airline Sentiment',
        total_records: 14640,
        cleaned_records: 14485,
        brands_count: brands.length,
        date_range: {
          start: '2015-02-17',
          end: '2015-02-24'
        }
      }
    }
  });
});

module.exports = router;
