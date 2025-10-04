 const express = require('express');
const {
  submitExpense,
  getMyExpenses,
  getAllExpenses,
  getExpenseById,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const upload = require('../config/multer');
const router = express.Router();

router.post('/', protect, upload.single('receipt'), submitExpense);
router.get('/my-expenses', protect, getMyExpenses);
router.get('/all', protect, checkRole('Admin', 'Manager'), getAllExpenses);
router.get('/:id', protect, getExpenseById);

module.exports = router;

