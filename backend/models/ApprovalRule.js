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
    enum: ['sequential', 'percentage', 'specific', 'hybrid', 'any'],
    required: true,
  },
  approvers: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      sequence: {
        type: Number,
        default: 0,
      },
    },
  ],
  percentageThreshold: {
    type: Number,
    min: 0,
    max: 100,
    default: null, // Allow null for rules that don't need percentage
  },
  specificApprover: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  amountThreshold: {
    min: {
      type: Number,
      required: true,
      default: 0,
    },
    max: {
      type: Number,
      required: true,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  requireAllApprovers: {
    type: Boolean,
    default: false, // If false, any approver can approve (for 'any' type)
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ApprovalRule', approvalRuleSchema);
