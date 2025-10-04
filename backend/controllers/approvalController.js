const Expense = require('../models/Expense');
const ApprovalRule = require('../models/ApprovalRule');
const ApprovalWorkflow = require('../models/ApprovalWorkflow');
const approvalService = require('../services/approvalService');
const User = require('../models/User');

// ==================== GET PENDING APPROVALS ====================
const getPendingApprovals = async (req, res) => {
  try {
    console.log('\n=== FETCHING PENDING APPROVALS ===');
    console.log('User ID:', req.user._id);
    console.log('User Name:', req.user.name);
    console.log('User Role:', req.user.role);

    // Find all workflows where this user is an approver with pending status
    const workflows = await ApprovalWorkflow.find({
      'approvalSteps.approver': req.user._id,
      'approvalSteps.status': 'Pending',
      status: 'In Progress',
    })
      .populate({
        path: 'expense',
        populate: { path: 'employee', select: 'name email' },
      })
      .populate('approvalSteps.approver', 'name email role')
      .sort('-createdAt');

    console.log('Found Workflows:', workflows.length);
    
    workflows.forEach((wf, index) => {
      console.log(`\nWorkflow ${index + 1}:`);
      console.log('  Expense ID:', wf.expense._id);
      console.log('  Employee:', wf.expense.employee.name);
      console.log('  Amount:', wf.expense.amount);
      console.log('  Status:', wf.expense.status);
      console.log('  Total Steps:', wf.approvalSteps.length);
      
      wf.approvalSteps.forEach((step, i) => {
        console.log(`  Step ${i + 1}:`, step.approver.name, '-', step.status);
      });
    });

    console.log('=== END PENDING APPROVALS ===\n');

    res.json(workflows);
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== PROCESS APPROVAL ====================
const processApproval = async (req, res) => {
  try {
    const { expenseId, action, comment } = req.body;

    console.log('\n=== PROCESSING APPROVAL REQUEST ===');
    console.log('Expense ID:', expenseId);
    console.log('User ID:', req.user._id);
    console.log('Action:', action);
    console.log('Comment:', comment);

    if (!expenseId || !action) {
      return res.status(400).json({ message: 'Expense ID and action are required' });
    }

    if (!['Approved', 'Rejected'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be Approved or Rejected' });
    }

    const result = await approvalService.processApproval(
      expenseId,
      req.user._id,
      action,
      comment
    );

    console.log('Approval Result:', result.finalStatus);
    console.log('=== END PROCESSING APPROVAL ===\n');

    res.json(result);
  } catch (error) {
    console.error('Process approval error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== CREATE APPROVAL RULE ====================
const createApprovalRule = async (req, res) => {
  try {
    const {
      name,
      ruleType,
      approvers,
      percentageThreshold,
      specificApprover,
      amountThreshold,
      requireAllApprovers,
    } = req.body;

    console.log('\n=== CREATING APPROVAL RULE ===');
    console.log('Rule Name:', name);
    console.log('Rule Type:', ruleType);
    console.log('Amount Range:', amountThreshold);

    // Validate required fields
    if (!name || !ruleType || !amountThreshold) {
      return res.status(400).json({ 
        message: 'Please provide name, rule type, and amount threshold' 
      });
    }

    if (amountThreshold.min === undefined || amountThreshold.max === undefined) {
      return res.status(400).json({ 
        message: 'Amount threshold must have min and max values' 
      });
    }

    if (amountThreshold.min < 0 || amountThreshold.max < 0) {
      return res.status(400).json({ 
        message: 'Amount threshold cannot be negative' 
      });
    }

    if (amountThreshold.min >= amountThreshold.max) {
      return res.status(400).json({ 
        message: 'Minimum amount must be less than maximum amount' 
      });
    }

    // Validate based on rule type
    if (ruleType === 'percentage' || ruleType === 'hybrid') {
      if (percentageThreshold === null || percentageThreshold === undefined || percentageThreshold < 0 || percentageThreshold > 100) {
        return res.status(400).json({ 
          message: 'Percentage threshold must be between 0 and 100 for percentage/hybrid rules' 
        });
      }
    }

    if (ruleType === 'specific' || ruleType === 'hybrid') {
      if (!specificApprover) {
        return res.status(400).json({ 
          message: 'Specific approver is required for specific/hybrid rule types' 
        });
      }
    }

    if (ruleType === 'sequential' || ruleType === 'percentage' || ruleType === 'any') {
      if (!approvers || approvers.length === 0) {
        return res.status(400).json({ 
          message: 'At least one approver is required for this rule type' 
        });
      }
    }

    // Create rule with proper defaults
    const ruleData = {
      company: req.user.company,
      name,
      ruleType,
      approvers: approvers || [],
      percentageThreshold: (ruleType === 'percentage' || ruleType === 'hybrid') ? percentageThreshold : null,
      specificApprover: (ruleType === 'specific' || ruleType === 'hybrid') ? specificApprover : null,
      amountThreshold,
      isActive: true,
      requireAllApprovers: requireAllApprovers || false,
    };

    console.log('Creating rule with data:', JSON.stringify(ruleData, null, 2));

    const rule = await ApprovalRule.create(ruleData);

    const populatedRule = await ApprovalRule.findById(rule._id)
      .populate('approvers.user', 'name email role')
      .populate('specificApprover', 'name email role');

    console.log('Rule Created Successfully:', populatedRule._id);
    console.log('=== END CREATING RULE ===\n');

    res.status(201).json(populatedRule);
  } catch (error) {
    console.error('Create approval rule error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== GET APPROVAL RULES ====================
const getApprovalRules = async (req, res) => {
  try {
    const rules = await ApprovalRule.find({ company: req.user.company })
      .populate('approvers.user', 'name email role')
      .populate('specificApprover', 'name email role')
      .sort('-createdAt');
    
    console.log('Fetched Rules:', rules.length, 'for company:', req.user.company);
    res.json(rules);
  } catch (error) {
    console.error('Get approval rules error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== UPDATE APPROVAL RULE ====================
const updateApprovalRule = async (req, res) => {
  try {
    const rule = await ApprovalRule.findById(req.params.id);

    if (!rule) {
      return res.status(404).json({ message: 'Rule not found' });
    }

    if (rule.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this rule' });
    }

    // Update fields
    const {
      name,
      ruleType,
      approvers,
      percentageThreshold,
      specificApprover,
      amountThreshold,
      isActive,
      requireAllApprovers,
    } = req.body;

    if (name) rule.name = name;
    if (ruleType) rule.ruleType = ruleType;
    if (approvers) rule.approvers = approvers;
    if (percentageThreshold !== undefined) rule.percentageThreshold = percentageThreshold;
    if (specificApprover !== undefined) rule.specificApprover = specificApprover;
    if (amountThreshold) rule.amountThreshold = amountThreshold;
    if (isActive !== undefined) rule.isActive = isActive;
    if (requireAllApprovers !== undefined) rule.requireAllApprovers = requireAllApprovers;

    const updatedRule = await rule.save();

    const populatedRule = await ApprovalRule.findById(updatedRule._id)
      .populate('approvers.user', 'name email role')
      .populate('specificApprover', 'name email role');

    res.json(populatedRule);
  } catch (error) {
    console.error('Update approval rule error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== DELETE APPROVAL RULE ====================
const deleteApprovalRule = async (req, res) => {
  try {
    const rule = await ApprovalRule.findById(req.params.id);

    if (!rule) {
      return res.status(404).json({ message: 'Rule not found' });
    }

    if (rule.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this rule' });
    }

    await ApprovalRule.findByIdAndDelete(req.params.id);
    
    console.log('Rule deleted:', req.params.id);
    
    res.json({ message: 'Approval rule deleted successfully' });
  } catch (error) {
    console.error('Delete approval rule error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPendingApprovals,
  processApproval,
  createApprovalRule,
  getApprovalRules,
  updateApprovalRule,
  deleteApprovalRule,
};
