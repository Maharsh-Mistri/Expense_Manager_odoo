import api from './api';

const getPendingApprovals = async () => {
  try {
    const response = await api.get('/approvals/pending');
    return response.data;
  } catch (error) {
    console.error('Get pending approvals error:', error.response?.data || error.message);
    throw error;
  }
};

const processApproval = async (expenseId, action, comment) => {
  try {
    const response = await api.post('/approvals/process', {
      expenseId,
      action,
      comment,
    });
    return response.data;
  } catch (error) {
    console.error('Process approval error:', error.response?.data || error.message);
    throw error;
  }
};

const getApprovalRules = async () => {
  try {
    const response = await api.get('/approvals/rules');
    return response.data;
  } catch (error) {
    console.error('Get approval rules error:', error.response?.data || error.message);
    // Don't throw error, return empty array
    return [];
  }
};

const createApprovalRule = async (ruleData) => {
  try {
    const response = await api.post('/approvals/rules', ruleData);
    return response.data;
  } catch (error) {
    console.error('Create approval rule error:', error.response?.data || error.message);
    throw error;
  }
};

const deleteApprovalRule = async (ruleId) => {
  try {
    const response = await api.delete(`/approvals/rules/${ruleId}`);
    return response.data;
  } catch (error) {
    console.error('Delete approval rule error:', error.response?.data || error.message);
    throw error;
  }
};

export default {
  getPendingApprovals,
  processApproval,
  getApprovalRules,
  createApprovalRule,
  deleteApprovalRule,
};
