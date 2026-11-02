const path = require('path');
require('dotenv').config();

const PORT = parseInt(process.env.PORT, 10) || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const DATA_DIR = path.resolve(__dirname, '../../../data');
const PROCESSED_DATA_DIR = path.join(DATA_DIR, 'processed');
const RAW_DATA_DIR = path.join(DATA_DIR, 'raw');

module.exports = {
  PORT,
  HOST,
  DATA_DIR,
  PROCESSED_DATA_DIR,
  RAW_DATA_DIR,
  NODE_ENV: process.env.NODE_ENV || 'development',
};
