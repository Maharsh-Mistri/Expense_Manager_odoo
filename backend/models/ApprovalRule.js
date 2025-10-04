 const mongoose = require('mongoose');

const approvalRuleSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  ruleType: {
    type: String,
    enum: ['sequential', 'percentage', 'specific', 'hybrid'],
    required: true,
  },
  approvers: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      sequence: Number,
    },
  ],
  percentageThreshold: {
    type: Number,
    min: 0,
    max: 100,
  },
  specificApprover: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  amountThreshold: {
    min: Number,
    max: Number,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ApprovalRule', approvalRuleSchema);

