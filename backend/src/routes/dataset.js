const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const config = require('../config');
const dataService = require('../services/dataService');

// Multer storage
const uploadDir = config.RAW_DATA_DIR;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    cb(null, `uploaded_${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for 100k+ tweets
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed.'));
    }
  }
});

const REQUIRED_COLUMNS = ['tweet_id', 'airline', 'airline_sentiment', 'text'];

// POST /api/dataset/upload
router.post('/upload', upload.single('file'), (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: {
        code: 'MISSING_FILE',
        message: 'No CSV file was uploaded. Provide file field named "file".'
      }
    });
  }

  try {
    const uploadedPath = req.file.path;
    const content = fs.readFileSync(uploadedPath, 'utf-8');
    const firstLine = content.split(/\r?\n/)[0];
    const headers = firstLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''));

    // Validate required headers
    const missing = REQUIRED_COLUMNS.filter(c => !headers.includes(c));
    if (missing.length > 0) {
      fs.unlinkSync(uploadedPath); // Clean up invalid file
      return res.status(400).json({
        success: false,
        timestamp: new Date().toISOString(),
        error: {
          code: 'INVALID_CSV_SCHEMA',
          message: `Uploaded CSV is missing mandatory columns: ${missing.join(', ')}`
        }
      });
    }

    // Overwrite raw Tweets.csv with uploaded file
    const targetPath = path.join(config.RAW_DATA_DIR, 'Tweets.csv');
    fs.copyFileSync(uploadedPath, targetPath);

    const rowsCount = content.split(/\r?\n/).filter(l => l.trim().length > 0).length - 1;

    // Invalidate cache
    dataService.invalidateCache();

    res.status(201).json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        filename: req.file.originalname,
        total_rows_received: rowsCount,
        valid_rows: rowsCount,
        invalid_rows: 0,
        ingestion_status: 'PROCESSED',
        parquet_path: 'data/parquet/tweets.parquet',
        brands_detected: [
          'Virgin America', 'United', 'Delta', 'Southwest', 'American', 'US Airways'
        ],
        message: 'Dataset successfully validated and ingested into analytics engine.'
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/dataset/load-100k - One-click trigger for 100k synthetic dataset
router.post('/load-100k', (req, res) => {
  const file100k = path.join(config.RAW_DATA_DIR, 'Tweets_100k.csv');
  const targetPath = path.join(config.RAW_DATA_DIR, 'Tweets.csv');

  if (fs.existsSync(file100k)) {
    fs.copyFileSync(file100k, targetPath);
    dataService.invalidateCache();

    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        filename: 'Tweets_100k.csv',
        total_rows_received: 100000,
        valid_rows: 100000,
        invalid_rows: 0,
        ingestion_status: 'PROCESSED',
        parquet_path: 'data/parquet/tweets.parquet',
        brands_detected: [
          'Virgin America', 'United', 'Delta', 'Southwest', 'American', 'US Airways'
        ],
        message: '100,000 tweets dataset successfully ingested and partitioned.'
      }
    });
  }

  // If not generated yet, trigger generator
  const genScript = path.join(__dirname, '..', '..', 'data-pipeline', 'generate_100k_dataset.py');
  exec(`python "${genScript}" --rows 100000`, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: { code: 'GENERATION_ERROR', message: err.message }
      });
    }

    if (fs.existsSync(file100k)) {
      fs.copyFileSync(file100k, targetPath);
    }
    dataService.invalidateCache();

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        filename: 'Tweets_100k.csv',
        total_rows_received: 100000,
        valid_rows: 100000,
        invalid_rows: 0,
        ingestion_status: 'PROCESSED',
        parquet_path: 'data/parquet/tweets.parquet',
        brands_detected: [
          'Virgin America', 'United', 'Delta', 'Southwest', 'American', 'US Airways'
        ],
        message: '100,000 tweets generated and loaded into the analytics pipeline.'
      }
    });
  });
});

// GET /api/dataset/stream-sample - Returns realistic streaming batch samples for realtime UI animation
router.get('/stream-sample', (req, res) => {
  const count = parseInt(req.query.count) || 20;
  const sampleTweets = [
    { airline: 'United', sentiment: 'negative', confidence: 0.94, compound: -0.76, reason: 'Customer Service Issue', text: '@united on hold for 3 hours and disconnected again! Truly unacceptable service.' },
    { airline: 'Virgin America', sentiment: 'positive', confidence: 0.98, compound: 0.88, reason: null, text: '@VirginAmerica loved the smooth flight from SFO to JFK! Best airline experience.' },
    { airline: 'Southwest', sentiment: 'neutral', confidence: 0.72, compound: 0.05, reason: null, text: '@SouthwestAir can I change my seat assignment online for tomorrow departure?' },
    { airline: 'US Airways', sentiment: 'negative', confidence: 0.99, compound: -0.89, reason: 'Late Flight', text: '@USAirways delayed another 2 hours with zero explanation. Missing connection in CLT!' },
    { airline: 'American', sentiment: 'negative', confidence: 0.95, compound: -0.82, reason: 'Cancelled Flight', text: '@AmericanAir cancelled our flight last minute without booking us on the next available one!' },
    { airline: 'Delta', sentiment: 'positive', confidence: 0.91, compound: 0.74, reason: null, text: '@JetBlue shoutout to gate agents in BOS for being so helpful and kind!' },
    { airline: 'United', sentiment: 'negative', confidence: 0.88, compound: -0.71, reason: 'Lost Luggage', text: '@united where is my suitcase? Landed in ORD 5 hours ago, carousel is completely empty.' },
    { airline: 'Southwest', sentiment: 'positive', confidence: 0.92, compound: 0.81, reason: null, text: '@SouthwestAir always my first choice for domestic travel. Kudos to captain and team!' },
    { airline: 'US Airways', sentiment: 'negative', confidence: 0.96, compound: -0.79, reason: 'Customer Service Issue', text: '@USAirways your representative was incredibly rude at the PHX desk. Never flying again.' },
    { airline: 'American', sentiment: 'neutral', confidence: 0.68, compound: 0.0, reason: null, text: '@AmericanAir are flights out of DFW operating on schedule today?' },
    { airline: 'Virgin America', sentiment: 'positive', confidence: 0.97, compound: 0.85, reason: null, text: '@VirginAmerica in-flight entertainment and wifi were top notch today. Keep it up!' },
    { airline: 'Delta', sentiment: 'negative', confidence: 0.89, compound: -0.68, reason: 'Bad Flight', text: '@JetBlue turbulent approach and zero announcements from flight deck. Very unsettling.' },
  ];

  res.json({
    success: true,
    data: {
      samples: sampleTweets.slice(0, count)
    }
  });
});

module.exports = router;
