const mongoose = require('mongoose');

const approvalWorkflowSchema = new mongoose.Schema({
  expense: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense',
    required: true,
  },
  approvalRule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApprovalRule',
  },
  currentStep: {
    type: Number,
    default: 0,
  },
  approvalSteps: [
    {
      approver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
      },
      stepType: {
        type: String,
        enum: ['manager', 'rule'],
        default: 'rule',
      },
      sequence: Number,
      comment: String,
      timestamp: Date,
    },
  ],
  status: {
    type: String,
    enum: ['In Progress', 'Approved', 'Rejected'],
    default: 'In Progress',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ApprovalWorkflow', approvalWorkflowSchema);
