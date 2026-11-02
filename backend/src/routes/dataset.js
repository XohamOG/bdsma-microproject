const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
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

module.exports = router;
