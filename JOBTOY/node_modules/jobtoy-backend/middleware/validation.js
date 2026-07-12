const { validationResult } = require('express-validator');
const logger = require('../config/logger');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation error:', errors.array());
    const details = {};
    errors.array().forEach((err) => {
      details[err.param] = err.msg;
    });

    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      details,
    });
  }
  next();
};

module.exports = handleValidation;