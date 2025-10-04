const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const testWorkflow = async () => {
  await connectDB();

  const ApprovalRule = require('./models/ApprovalRule');
  const Expense = require('./models/Expense');
  const User = require('./models/User');
  const ApprovalWorkflow = require('./models/ApprovalWorkflow');

  console.log('\n========== WORKFLOW TEST ==========\n');

  // Get all rules
  const rules = await ApprovalRule.find().populate('approvers.user').populate('specificApprover');
  console.log('Total Rules:', rules.length);
  rules.forEach((rule, index) => {
    console.log(`\nRule ${index + 1}:`);
    console.log('  Name:', rule.name);
    console.log('  Type:', rule.ruleType);
    console.log('  Range: $', rule.amountThreshold.min, '-', rule.amountThreshold.max);
    console.log('  Approvers:', rule.approvers.length);
    console.log('  Active:', rule.isActive);
  });

  // Get all expenses
  const expenses = await Expense.find().populate('employee');
  console.log('\nTotal Expenses:', expenses.length);
  expenses.forEach((exp, index) => {
    console.log(`\nExpense ${index + 1}:`);
    console.log('  ID:', exp._id);
    console.log('  Employee:', exp.employee.name);
    console.log('  Amount:', exp.amountInCompanyCurrency);
    console.log('  Status:', exp.status);
  });

  // Get all workflows
  const workflows = await ApprovalWorkflow.find()
    .populate('expense')
    .populate('approvalSteps.approver');
  
  console.log('\nTotal Workflows:', workflows.length);
  workflows.forEach((wf, index) => {
    console.log(`\nWorkflow ${index + 1}:`);
    console.log('  Expense ID:', wf.expense._id);
    console.log('  Status:', wf.status);
    console.log('  Steps:', wf.approvalSteps.length);
    wf.approvalSteps.forEach((step, i) => {
      console.log(`    Step ${i + 1}:`, step.approver?.name || 'Unknown', '-', step.status);
    });
  });

  // Check which rule matches a specific amount
  console.log('\n========== RULE MATCHING TEST ==========\n');
  const testAmounts = [50, 250, 750, 5500];
  
  for (const amount of testAmounts) {
    console.log(`\nTesting Amount: $${amount}`);
    const matchingRule = await ApprovalRule.findOne({
      isActive: true,
      'amountThreshold.min': { $lte: amount },
      'amountThreshold.max': { $gte: amount },
    });
    
    if (matchingRule) {
      console.log('  ✓ Matched Rule:', matchingRule.name);
      console.log('  Type:', matchingRule.ruleType);
    } else {
      console.log('  ✗ No matching rule (will auto-approve or use manager only)');
    }
  }

  console.log('\n========== TEST COMPLETE ==========\n');
  process.exit(0);
};

testWorkflow();
