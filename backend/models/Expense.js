 const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  amountInCompanyCurrency: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Travel', 'Food', 'Accommodation', 'Office Supplies', 'Entertainment', 'Other'],
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  receipt: {
    type: String, // File path
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'In Progress'],
    default: 'Pending',
  },
  currentApproverIndex: {
    type: Number,
    default: 0,
  },
  approvalHistory: [
    {
      approver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      action: {
        type: String,
        enum: ['Approved', 'Rejected'],
      },
      comment: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  merchantName: String,
  expenseLines: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Expense', expenseSchema);

