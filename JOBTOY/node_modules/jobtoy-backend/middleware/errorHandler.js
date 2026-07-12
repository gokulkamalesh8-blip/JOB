const logger = require('../config/logger');

const errorHandler = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;

  logger.error({
    message: error.message,
    statusCode: error.statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    stack: error.stack,
  });

  // MongoDB validation error
  if (error.name === 'ValidationError') {
    const details = {};
    Object.keys(error.errors).forEach((key) => {
      details[key] = error.errors[key].message;
    });

    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      details,
    });
  }

  // MongoDB duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
      code: 'DUPLICATE_ENTRY',
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      code: 'INVALID_TOKEN',
    });
  }

  // Generic error
  res.status(error.statusCode).json({
    success: false,
    message: error.message || 'Server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

module.exports = errorHandler;