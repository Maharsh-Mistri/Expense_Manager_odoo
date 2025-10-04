const Expense = require('../models/Expense');
const ApprovalRule = require('../models/ApprovalRule');
const ApprovalWorkflow = require('../models/ApprovalWorkflow');
const User = require('../models/User');

const initiateWorkflow = async (expense) => {
  try {
    console.log('\n=== INITIATING WORKFLOW ===');
    console.log('Expense ID:', expense._id);
    console.log('Amount:', expense.amountInCompanyCurrency);
    
    const employee = await User.findById(expense.employee).populate('manager');
    console.log('Employee:', employee.name);
    console.log('Has Manager:', !!employee.manager);
    console.log('Is Manager Approver:', employee.isManagerApprover);

    // Find applicable approval rule based on amount
    const rule = await ApprovalRule.findOne({
      company: expense.company,
      isActive: true,
      'amountThreshold.min': { $lte: expense.amountInCompanyCurrency },
      'amountThreshold.max': { $gte: expense.amountInCompanyCurrency },
    })
      .populate('approvers.user')
      .populate('specificApprover');

    console.log('Found Rule:', rule ? rule.name : 'NO RULE FOUND');

    // Create approval steps array
    let approvalSteps = [];

    // Step 1: Check if manager approval is required (ALWAYS FIRST if enabled)
    if (employee.isManagerApprover && employee.manager) {
      approvalSteps.push({
        approver: employee.manager._id,
        status: 'Pending',
        stepType: 'manager',
      });
      console.log('✓ Added Manager Approver:', employee.manager.name);
    }

    // Step 2: If no rule found, check if we have any approvers
    if (!rule) {
      if (approvalSteps.length === 0) {
        // No manager and no rule = auto-approve
        console.log('⚡ AUTO-APPROVED: No approvers required');
        expense.status = 'Approved';
        await expense.save();
        return null;
      } else {
        // Only manager approval required
        console.log('✓ Only Manager Approval Required');
      }
    } else {
      // Step 3: Add approvers based on rule type
      console.log('Rule Type:', rule.ruleType);

      if (rule.ruleType === 'sequential') {
        // Sequential: Add approvers in order
        const ruleApprovers = rule.approvers
          .sort((a, b) => a.sequence - b.sequence)
          .map((approver) => ({
            approver: approver.user._id,
            status: 'Pending',
            stepType: 'rule',
            sequence: approver.sequence,
          }));
        approvalSteps = [...approvalSteps, ...ruleApprovers];
        console.log('✓ Added Sequential Approvers:', ruleApprovers.length);

      } else if (rule.ruleType === 'percentage') {
        // Percentage: Add all approvers (any X% must approve)
        const ruleApprovers = rule.approvers.map((approver) => ({
          approver: approver.user._id,
          status: 'Pending',
          stepType: 'rule',
        }));
        approvalSteps = [...approvalSteps, ...ruleApprovers];
        console.log('✓ Added Percentage Approvers:', ruleApprovers.length);
        console.log('  Threshold:', rule.percentageThreshold + '%');

      } else if (rule.ruleType === 'specific') {
        // Specific: Only one specific approver needed
        if (rule.specificApprover) {
          approvalSteps.push({
            approver: rule.specificApprover._id,
            status: 'Pending',
            stepType: 'rule',
          });
          console.log('✓ Added Specific Approver:', rule.specificApprover.name);
        }

      } else if (rule.ruleType === 'hybrid') {
        // Hybrid: Add all approvers (percentage OR specific)
        const ruleApprovers = rule.approvers.map((approver) => ({
          approver: approver.user._id,
          status: 'Pending',
          stepType: 'rule',
        }));
        approvalSteps = [...approvalSteps, ...ruleApprovers];
        console.log('✓ Added Hybrid Approvers:', ruleApprovers.length);
        console.log('  Percentage Threshold:', rule.percentageThreshold + '%');
        console.log('  OR Specific Approver:', rule.specificApprover?.name);
      }
    }

    // Create workflow
    const workflow = await ApprovalWorkflow.create({
      expense: expense._id,
      approvalRule: rule?._id || null,
      approvalSteps,
      status: 'In Progress',
      currentStep: 0,
    });

    expense.status = 'In Progress';
    await expense.save();

    console.log('✅ Workflow Created - Total Steps:', approvalSteps.length);
    console.log('=== WORKFLOW INITIATED ===\n');

    return workflow;
  } catch (error) {
    console.error('❌ Initiate workflow error:', error);
    throw new Error('Failed to initiate workflow: ' + error.message);
  }
};

const processApproval = async (expenseId, approverId, action, comment) => {
  try {
    console.log('\n=== PROCESSING APPROVAL ===');
    console.log('Expense ID:', expenseId);
    console.log('Approver ID:', approverId);
    console.log('Action:', action);

    const expense = await Expense.findById(expenseId);
    if (!expense) {
      throw new Error('Expense not found');
    }

    const workflow = await ApprovalWorkflow.findOne({
      expense: expenseId,
      status: 'In Progress',
    }).populate('approvalRule');

    if (!workflow) {
      throw new Error('Active workflow not found for this expense');
    }

    console.log('Current Workflow Status:', workflow.status);
    console.log('Total Steps:', workflow.approvalSteps.length);

    // Find the step for this approver that is pending
    const stepIndex = workflow.approvalSteps.findIndex(
      (step) => 
        step.approver.toString() === approverId.toString() && 
        step.status === 'Pending'
    );

    if (stepIndex === -1) {
      throw new Error('You are not authorized to approve this expense or it has already been processed');
    }

    console.log('Processing Step:', stepIndex + 1, 'of', workflow.approvalSteps.length);

    // Update the step
    workflow.approvalSteps[stepIndex].status = action;
    workflow.approvalSteps[stepIndex].comment = comment || '';
    workflow.approvalSteps[stepIndex].timestamp = new Date();

    // Add to expense approval history
    expense.approvalHistory.push({
      approver: approverId,
      action,
      comment: comment || '',
      timestamp: new Date(),
    });

    // Handle rejection
    if (action === 'Rejected') {
      console.log('❌ EXPENSE REJECTED');
      workflow.status = 'Rejected';
      expense.status = 'Rejected';
      await workflow.save();
      await expense.save();
      console.log('=== APPROVAL PROCESSED ===\n');
      return { 
        message: 'Expense rejected successfully', 
        expense, 
        workflow,
        finalStatus: 'Rejected'
      };
    }

    // Check if approval is complete
    const rule = workflow.approvalRule;
    let isFullyApproved = false;
    let approvalMessage = '';

    if (!rule) {
      // No rule: Just check if all steps are approved
      isFullyApproved = workflow.approvalSteps.every((step) => step.status === 'Approved');
      approvalMessage = isFullyApproved ? 
        'All approvers have approved' : 
        'Approval recorded, awaiting other approvers';
      
    } else if (rule.ruleType === 'sequential') {
      // Sequential: All must approve in order
      const allApproved = workflow.approvalSteps.every((step) => step.status === 'Approved');
      isFullyApproved = allApproved;
      
      if (isFullyApproved) {
        approvalMessage = 'All sequential approvals completed';
      } else {
        const nextPending = workflow.approvalSteps.findIndex((step) => step.status === 'Pending');
        approvalMessage = `Approved. Waiting for approver ${nextPending + 1}`;
      }
      
    } else if (rule.ruleType === 'percentage') {
      // Percentage: Check if threshold met
      const approvedCount = workflow.approvalSteps.filter((step) => step.status === 'Approved').length;
      const totalCount = workflow.approvalSteps.length;
      const approvalPercentage = (approvedCount / totalCount) * 100;
      
      isFullyApproved = approvalPercentage >= rule.percentageThreshold;
      approvalMessage = isFullyApproved ?
        `${approvalPercentage.toFixed(0)}% approval threshold met (required: ${rule.percentageThreshold}%)` :
        `${approvedCount}/${totalCount} approved (${approvalPercentage.toFixed(0)}% - need ${rule.percentageThreshold}%)`;
      
    } else if (rule.ruleType === 'specific') {
      // Specific: Check if the specific approver approved
      const specificApproved = workflow.approvalSteps.some(
        (step) =>
          step.approver.toString() === rule.specificApprover.toString() &&
          step.status === 'Approved'
      );
      isFullyApproved = specificApproved;
      approvalMessage = isFullyApproved ?
        'Approved by designated approver' :
        'Awaiting approval from designated approver';
      
    } else if (rule.ruleType === 'hybrid') {
      // Hybrid: Percentage OR specific approver
      const approvedCount = workflow.approvalSteps.filter((step) => step.status === 'Approved').length;
      const totalCount = workflow.approvalSteps.length;
      const approvalPercentage = (approvedCount / totalCount) * 100;
      
      const percentageMet = approvalPercentage >= rule.percentageThreshold;
      const specificApproved = rule.specificApprover && workflow.approvalSteps.some(
        (step) =>
          step.approver.toString() === rule.specificApprover.toString() &&
          step.status === 'Approved'
      );
      
      isFullyApproved = percentageMet || specificApproved;
      
      if (isFullyApproved) {
        if (percentageMet) {
          approvalMessage = `Approved via percentage threshold (${approvalPercentage.toFixed(0)}%)`;
        } else {
          approvalMessage = 'Approved via designated approver';
        }
      } else {
        approvalMessage = `${approvedCount}/${totalCount} approved (${approvalPercentage.toFixed(0)}% - need ${rule.percentageThreshold}% OR specific approver)`;
      }
    }

    console.log('Approval Check:', approvalMessage);

    // Update workflow and expense status
    if (isFullyApproved) {
      console.log('✅ EXPENSE FULLY APPROVED');
      workflow.status = 'Approved';
      expense.status = 'Approved';
    } else {
      console.log('⏳ PARTIAL APPROVAL - Awaiting more approvals');
      workflow.currentStep = stepIndex + 1;
    }

    await workflow.save();
    await expense.save();

    console.log('Final Expense Status:', expense.status);
    console.log('=== APPROVAL PROCESSED ===\n');

    return { 
      message: approvalMessage,
      expense, 
      workflow,
      finalStatus: expense.status,
      isFullyApproved
    };
  } catch (error) {
    console.error('❌ Process approval error:', error);
    throw new Error('Failed to process approval: ' + error.message);
  }
};

module.exports = { initiateWorkflow, processApproval };
