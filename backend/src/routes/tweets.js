const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

// GET /api/tweets - Paginated tweets list with search & filters
router.get('/', (req, res) => {
  const { page, limit, brand, sentiment, reason, search } = req.query;
  const result = dataService.getTweetsPaginated({
    page,
    limit,
    brand,
    sentiment,
    reason,
    search
  });

  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data: result
  });
});

// GET /api/tweets/:id - Single tweet lookup
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const result = dataService.getTweetsPaginated({ limit: 100000 });
  const match = result.tweets.find(t => t.tweet_id === id);

  if (!match) {
    return res.status(404).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: {
        code: 'NOT_FOUND',
        message: `Tweet with ID ${id} was not found.`
      }
    });
  }

  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data: match
  });
});

module.exports = router;
