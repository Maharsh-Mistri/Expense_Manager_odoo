const Expense = require('../models/Expense');
const Company = require('../models/Company');
const User = require('../models/User');
const axios = require('axios');
const approvalService = require('../services/approvalService');

// Submit expense
const submitExpense = async (req, res) => {
  try {
    const { amount, currency, category, description, date, merchantName, expenseLines } = req.body;

    console.log('Submit expense request:', req.body);

    // Validate required fields
    if (!amount || !currency || !category || !description || !date) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Get company currency
    const company = await Company.findById(req.user.company);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Convert to company currency
    let amountInCompanyCurrency = parseFloat(amount);
    if (currency !== company.currency) {
      try {
        const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${currency}`);
        const rate = response.data.rates[company.currency];
        if (rate) {
          amountInCompanyCurrency = parseFloat(amount) * rate;
        }
      } catch (error) {
        console.log('Currency conversion failed, using original amount:', error.message);
      }
    }

    const expense = await Expense.create({
      employee: req.user._id,
      company: req.user.company,
      amount: parseFloat(amount),
      currency,
      amountInCompanyCurrency,
      category,
      description,
      date,
      receipt: req.file ? req.file.path : null,
      merchantName: merchantName || null,
      expenseLines: expenseLines || [],
      status: 'Pending',
    });

    console.log('Expense created:', expense._id);

    // Initiate approval workflow
    try {
      await approvalService.initiateWorkflow(expense);
      console.log('Workflow initiated for expense:', expense._id);
    } catch (workflowError) {
      console.error('Workflow initiation error:', workflowError);
      // Don't fail the expense creation if workflow fails
      expense.status = 'Pending';
      await expense.save();
    }

    const populatedExpense = await Expense.findById(expense._id).populate('employee', 'name email');

    res.status(201).json(populatedExpense);
  } catch (error) {
    console.error('Submit expense error:', error);
    res.status(500).json({ message: error.message || 'Failed to submit expense' });
  }
};

// Get user expenses
const getMyExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ employee: req.user._id })
      .populate('employee', 'name email')
      .sort('-createdAt');
    
    console.log('Fetched expenses for user:', req.user._id, 'Count:', expenses.length);
    res.json(expenses);
  } catch (error) {
    console.error('Get my expenses error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all expenses (Admin/Manager)
const getAllExpenses = async (req, res) => {
  try {
    let query = { company: req.user.company };

    // If manager, only show team expenses
    if (req.user.role === 'Manager') {
      const teamMembers = await User.find({ manager: req.user._id });
      const teamIds = teamMembers.map((member) => member._id);
      teamIds.push(req.user._id); // Include manager's own expenses
      query.employee = { $in: teamIds };
    }

    const expenses = await Expense.find(query)
      .populate('employee', 'name email')
      .sort('-createdAt');
    
    console.log('Fetched all expenses, count:', expenses.length);
    res.json(expenses);
  } catch (error) {
    console.error('Get all expenses error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get expense by ID
const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('employee', 'name email')
      .populate('approvalHistory.approver', 'name email role');

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    console.error('Get expense by ID error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitExpense, getMyExpenses, getAllExpenses, getExpenseById };
