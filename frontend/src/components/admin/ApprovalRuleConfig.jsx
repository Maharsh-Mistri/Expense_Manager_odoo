import React, { useState, useEffect } from 'react';
import approvalService from '../../services/approvalService';
import userService from '../../services/userService';

const ApprovalRuleConfig = () => {
  const [rules, setRules] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    ruleType: 'sequential',
    percentageThreshold: 50,
    specificApprover: '',
    amountThreshold: { min: 0, max: 10000 },
    approvers: [],
  });

  useEffect(() => {
    fetchRules();
    fetchUsers();
  }, []);

  const fetchRules = async () => {
    try {
      const data = await approvalService.getApprovalRules();
      console.log('Fetched rules:', data);
      setRules(data);
    } catch (error) {
      console.error('Fetch rules error:', error);
      setError('Failed to fetch approval rules');
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data.filter((u) => u.role === 'Manager' || u.role === 'Admin'));
    } catch (error) {
      console.error('Fetch users error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate based on rule type
      if (formData.ruleType === 'sequential' || formData.ruleType === 'percentage') {
        if (formData.approvers.length === 0) {
          setError('Please add at least one approver');
          setLoading(false);
          setTimeout(() => setError(''), 3000);
          return;
        }
      }

      if (formData.ruleType === 'specific' || formData.ruleType === 'hybrid') {
        if (!formData.specificApprover) {
          setError('Please select a specific approver');
          setLoading(false);
          setTimeout(() => setError(''), 3000);
          return;
        }
      }

      console.log('Submitting rule:', formData);
      await approvalService.createApprovalRule(formData);
      setMessage('Approval rule created successfully! ✅');
      setShowForm(false);
      resetForm();
      await fetchRules();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Create rule error:', error);
      setError(error.response?.data?.message || 'Failed to create rule');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      ruleType: 'sequential',
      percentageThreshold: 50,
      specificApprover: '',
      amountThreshold: { min: 0, max: 10000 },
      approvers: [],
    });
  };

  const addApprover = (userId) => {
    if (!userId || formData.approvers.find((a) => a.user === userId)) return;
    
    setFormData({
      ...formData,
      approvers: [
        ...formData.approvers,
        { user: userId, sequence: formData.approvers.length + 1 },
      ],
    });
  };

  const removeApprover = (userId) => {
    setFormData({
      ...formData,
      approvers: formData.approvers
        .filter((a) => a.user !== userId)
        .map((a, index) => ({ ...a, sequence: index + 1 })),
    });
  };

  const getRuleTypeDescription = (type) => {
    const descriptions = {
      sequential: 'All approvers must approve in order',
      percentage: 'A percentage of approvers must approve',
      specific: 'One specific approver must approve',
      hybrid: 'Either percentage OR specific approver must approve',
    };
    return descriptions[type];
  };

  const getRuleTypeIcon = (type) => {
    const icons = {
      sequential: '📋',
      percentage: '📊',
      specific: '👤',
      hybrid: '🔀',
    };
    return icons[type];
  };

  const handleDeleteRule = async (ruleId, ruleName) => {
    if (window.confirm(`Are you sure you want to delete the rule "${ruleName}"?`)) {
      try {
        await approvalService.deleteApprovalRule(ruleId);
        setMessage('Rule deleted successfully! ✅');
        await fetchRules();
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setError('Failed to delete rule');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  return (
    <div className="approval-rules-container">
      <div className="rules-header">
        <h2>📝 Approval Rules Configuration</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)} disabled={loading}>
          {showForm ? '✕ Cancel' : '+ Add New Rule'}
        </button>
      </div>

      {message && <div className="message">{message}</div>}
      {error && <div className="error">{error}</div>}

      {showForm && (
        <div className="rule-form-container">
          <h3>Create New Approval Rule</h3>
          <form onSubmit={handleSubmit} className="rule-form">
            <div className="form-group">
              <label>Rule Name <span className="required">*</span></label>
              <input
                type="text"
                placeholder="e.g., Small Expenses Under $100"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Rule Type <span className="required">*</span></label>
              <div className="rule-type-grid">
                {['sequential', 'percentage', 'specific', 'hybrid'].map((type) => (
                  <div
                    key={type}
                    className={`rule-type-card ${formData.ruleType === type ? 'selected' : ''}`}
                    onClick={() => !loading && setFormData({ ...formData, ruleType: type })}
                  >
                    <div className="rule-type-icon">{getRuleTypeIcon(type)}</div>
                    <div className="rule-type-name">{type}</div>
                    <div className="rule-type-desc">{getRuleTypeDescription(type)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Minimum Amount <span className="required">*</span></label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.amountThreshold.min}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amountThreshold: {
                        ...formData.amountThreshold,
                        min: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  required
                  min="0"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Maximum Amount <span className="required">*</span></label>
                <input
                  type="number"
                  placeholder="10000"
                  value={formData.amountThreshold.max}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amountThreshold: {
                        ...formData.amountThreshold,
                        max: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  required
                  min="0"
                  disabled={loading}
                />
              </div>
            </div>

            {(formData.ruleType === 'percentage' || formData.ruleType === 'hybrid') && (
              <div className="form-group">
                <label>Approval Percentage Threshold</label>
                <div className="percentage-input">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.percentageThreshold}
                    onChange={(e) =>
                      setFormData({ ...formData, percentageThreshold: parseInt(e.target.value) })
                    }
                    disabled={loading}
                  />
                  <span className="percentage-value">{formData.percentageThreshold}%</span>
                </div>
                <small>At least {formData.percentageThreshold}% of approvers must approve</small>
              </div>
            )}

            {(formData.ruleType === 'specific' || formData.ruleType === 'hybrid') && (
              <div className="form-group">
                <label>Specific Approver <span className="required">*</span></label>
                <select
                  value={formData.specificApprover}
                  onChange={(e) =>
                    setFormData({ ...formData, specificApprover: e.target.value })
                  }
                  required={formData.ruleType === 'specific'}
                  disabled={loading}
                >
                  <option value="">Select Specific Approver</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(formData.ruleType === 'sequential' || formData.ruleType === 'percentage') && (
              <div className="form-group">
                <label>Add Approvers {formData.ruleType === 'sequential' && <span className="required">*</span>}</label>
                <div className="approver-section">
                  <select
                    onChange={(e) => {
                      addApprover(e.target.value);
                      e.target.value = '';
                    }}
                    disabled={loading}
                  >
                    <option value="">Select approver to add</option>
                    {users
                      .filter((u) => !formData.approvers.find((a) => a.user === u._id))
                      .map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name} ({user.role})
                        </option>
                      ))}
                  </select>

                  {formData.approvers.length > 0 && (
                    <div className="approvers-list">
                      <h4>Selected Approvers ({formData.approvers.length})</h4>
                      {formData.approvers.map((approver) => {
                        const user = users.find((u) => u._id === approver.user);
                        return (
                          <div key={approver.user} className="approver-item">
                            <span className="approver-sequence">{approver.sequence}</span>
                            <span className="approver-name">
                              {user?.name} ({user?.role})
                            </span>
                            <button
                              type="button"
                              className="btn-remove"
                              onClick={() => removeApprover(approver.user)}
                              disabled={loading}
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? '⏳ Creating Rule...' : '✅ Create Approval Rule'}
            </button>
          </form>
        </div>
      )}

      <div className="rules-list">
        <h3>Existing Approval Rules</h3>
        {rules.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No approval rules configured yet.</p>
            <p>Click "Add New Rule" to create your first approval workflow.</p>
          </div>
        ) : (
          <div className="rules-grid">
            {rules.map((rule) => (
              <div key={rule._id} className="rule-card">
                <div className="rule-card-header">
                  <div className="rule-icon">{getRuleTypeIcon(rule.ruleType)}</div>
                  <div className="rule-status">
                    {rule.isActive ? (
                      <span className="status-badge active">Active</span>
                    ) : (
                      <span className="status-badge inactive">Inactive</span>
                    )}
                  </div>
                </div>

                <h3>{rule.name}</h3>

                <div className="rule-details">
                  <div className="rule-detail-item">
                    <span className="label">Type:</span>
                    <span className="value">{rule.ruleType}</span>
                  </div>

                  <div className="rule-detail-item">
                    <span className="label">Amount Range:</span>
                    <span className="value">
                      ${rule.amountThreshold?.min || 0} - ${rule.amountThreshold?.max || 0}
                    </span>
                  </div>

                  {rule.percentageThreshold && (
                    <div className="rule-detail-item">
                      <span className="label">Threshold:</span>
                      <span className="value">{rule.percentageThreshold}%</span>
                    </div>
                  )}

                  {rule.specificApprover && (
                    <div className="rule-detail-item">
                      <span className="label">Specific Approver:</span>
                      <span className="value">
                        {rule.specificApprover.name} ({rule.specificApprover.role})
                      </span>
                    </div>
                  )}

                  {rule.approvers && rule.approvers.length > 0 && (
                    <div className="rule-detail-item">
                      <span className="label">Approvers:</span>
                      <div className="approvers-chips">
                        {rule.approvers.map((approver, index) => (
                          <span key={index} className="approver-chip">
                            {approver.user?.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="rule-description">
                  <small>{getRuleTypeDescription(rule.ruleType)}</small>
                </div>

                <div className="user-card-actions">
                  <button 
                    className="btn-delete" 
                    onClick={() => handleDeleteRule(rule._id, rule.name)}
                    style={{ width: '100%' }}
                  >
                    🗑️ Delete Rule
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalRuleConfig;
