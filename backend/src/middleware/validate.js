const { validationResult } = require('express-validator');

/**
 * Middleware to check for validation errors from express-validator.
 * Formats errors to match frontend { error: 'message' } expectation.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorList = errors.array();
    return res.status(400).json({
      error: errorList[0].msg,
      errors: errorList.map(e => ({ field: e.path, message: e.msg })),
    });
  }

  next();
};

module.exports = validate;
