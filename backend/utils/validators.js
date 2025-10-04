 const { body, validationResult } = require('express-validator');

const validateExpense = [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('currency').notEmpty().withMessage('Currency is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
];

const validateUser = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['Admin', 'Manager', 'Employee']).withMessage('Invalid role'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validateExpense,
  validateUser,
  handleValidationErrors,
};

