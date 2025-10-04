const express = require('express');
const {
  getPendingApprovals,
  processApproval,
  createApprovalRule,
  getApprovalRules,
  updateApprovalRule,
  deleteApprovalRule,
} = require('../controllers/approvalController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const router = express.Router();

// Anyone can get pending approvals if they're a manager or admin
router.get('/pending', protect, checkRole('Manager', 'Admin'), getPendingApprovals);

// Anyone can process approvals if they're a manager or admin
router.post('/process', protect, checkRole('Manager', 'Admin'), processApproval);

// Get rules - Allow Managers to view rules too (needed for workflow)
router.get('/rules', protect, getApprovalRules);

// Only Admin can create/update/delete rules
router.post('/rules', protect, checkRole('Admin'), createApprovalRule);
router.put('/rules/:id', protect, checkRole('Admin'), updateApprovalRule);
router.delete('/rules/:id', protect, checkRole('Admin'), deleteApprovalRule);

module.exports = router;
