function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  if (status >= 500) {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
    if (process.env.NODE_ENV !== 'production') {
      console.error(err.stack);
    }
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  if (err.code === '23505') {
    return res.status(409).json({ error: 'Email already registered' });
  }

  res.status(status).json({
    error: status >= 500 ? 'Internal server error' : message,
    ...(err.needsVerification ? { needsVerification: true } : {}),
    ...(err.email ? { email: err.email } : {}),
  });
}

module.exports = errorHandler;
