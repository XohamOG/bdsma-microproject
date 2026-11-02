function errorHandler(err, req, res, next) {
  console.error('[SERVER ERROR]:', err);

  const status = err.status || 500;
  const code = err.code || (status === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR');
  const message = err.message || 'An unexpected server error occurred.';

  res.status(status).json({
    success: false,
    timestamp: new Date().toISOString(),
    error: {
      code,
      message,
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
    }
  });
}

module.exports = errorHandler;
