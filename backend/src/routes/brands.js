const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

// GET /api/brands - Overview of all 6 airlines with NSS & BRI
router.get('/', (req, res) => {
  const brands = dataService.getBrands();
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data: {
      brands
    }
  });
});

// GET /api/brands/:brandId/reputation - In-depth brand metrics, complaints, timeline
router.get('/:brandId/reputation', (req, res, next) => {
  const { brandId } = req.params;
  const detail = dataService.getBrandReputation(brandId);

  if (!detail) {
    return res.status(404).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: {
        code: 'NOT_FOUND',
        message: `Brand '${brandId}' not found. Valid brands: virgin_america, united, delta, southwest, american, us_airways`
      }
    });
  }

  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data: detail
  });
});

module.exports = router;
