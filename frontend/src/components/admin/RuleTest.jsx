import React, { useState, useEffect } from 'react';
import approvalService from '../../services/approvalService';
import userService from '../../services/userService';

const RuleTest = () => {
  const [rules, setRules] = useState([]);
  const [users, setUsers] = useState([]);
  const [testAmount, setTestAmount] = useState(500);
  const [matchedRule, setMatchedRule] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rulesData, usersData] = await Promise.all([
        approvalService.getApprovalRules(),
        userService.getUsers(),
      ]);
      setRules(rulesData);
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const testRule = () => {
    const matched = rules.find(
      (rule) =>
        rule.isActive &&
        rule.amountThreshold.min <= testAmount &&
        rule.amountThreshold.max >= testAmount
    );
    setMatchedRule(matched || null);
  };

  useEffect(() => {
    testRule();
  }, [testAmount, rules]);

  return (
    <div className="rule-test-container" style={{ background: 'white', padding: '2rem', borderRadius: '12px', marginTop: '2rem' }}>
      <h3>🧪 Test Approval Rules</h3>
      
      <div style={{ marginTop: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Test Expense Amount: ${testAmount}
        </label>
        <input
          type="range"
          min="0"
          max="10000"
          step="100"
          value={testAmount}
          onChange={(e) => setTestAmount(parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px' }}>
        <h4>Result for ${testAmount} expense:</h4>
        
        {matchedRule ? (
          <div style={{ marginTop: '1rem' }}>
            <div style={{ padding: '1rem', background: 'white', borderRadius: '8px', border: '2px solid #2ecc71' }}>
              <h5 style={{ color: '#2ecc71', marginBottom: '1rem' }}>✅ Matched Rule: {matchedRule.name}</h5>
              <p><strong>Type:</strong> {matchedRule.ruleType}</p>
              <p><strong>Range:</strong> ${matchedRule.amountThreshold.min} - ${matchedRule.amountThreshold.max}</p>
              
              {matchedRule.ruleType === 'sequential' && (
                <div style={{ marginTop: '1rem' }}>
                  <strong>Approval Flow:</strong>
                  <ol style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
                    {matchedRule.approvers.map((approver, index) => (
                      <li key={index}>{approver.user?.name || 'Unknown'} ({approver.user?.role})</li>
                    ))}
                  </ol>
                </div>
              )}

              {matchedRule.ruleType === 'percentage' && (
                <div style={{ marginTop: '1rem' }}>
                  <p><strong>Threshold:</strong> {matchedRule.percentageThreshold}% of {matchedRule.approvers.length} approvers</p>
                  <p><strong>Need:</strong> {Math.ceil((matchedRule.percentageThreshold / 100) * matchedRule.approvers.length)} approvals</p>
                </div>
              )}

              {matchedRule.ruleType === 'specific' && matchedRule.specificApprover && (
                <div style={{ marginTop: '1rem' }}>
                  <p><strong>Specific Approver:</strong> {matchedRule.specificApprover.name} ({matchedRule.specificApprover.role})</p>
                </div>
              )}

              {matchedRule.ruleType === 'hybrid' && (
                <div style={{ marginTop: '1rem' }}>
                  <p><strong>Option 1:</strong> {matchedRule.percentageThreshold}% of approvers</p>
                  <p><strong>Option 2:</strong> {matchedRule.specificApprover?.name} approval</p>
                  <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>Whichever happens first</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'white', borderRadius: '8px', border: '2px solid #f39c12' }}>
            <h5 style={{ color: '#f39c12' }}>⚠️ No Rule Matched</h5>
            <p>This expense will be:</p>
            <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
              <li>Auto-approved if employee has no manager</li>
              <li>OR sent to manager only (if "Manager is Approver" checked)</li>
            </ul>
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h4>All Active Rules:</h4>
        {rules.filter(r => r.isActive).length === 0 ? (
          <p style={{ color: '#e74c3c', marginTop: '1rem' }}>No active rules configured!</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            {rules.filter(r => r.isActive).map((rule) => (
              <div 
                key={rule._id} 
                style={{ 
                  padding: '1rem', 
                  background: testAmount >= rule.amountThreshold.min && testAmount <= rule.amountThreshold.max ? '#e8f5e9' : '#f8f9fa',
                  borderRadius: '8px',
                  border: testAmount >= rule.amountThreshold.min && testAmount <= rule.amountThreshold.max ? '2px solid #2ecc71' : '2px solid #ddd'
                }}
              >
                <strong>{rule.name}</strong> - {rule.ruleType} - ${rule.amountThreshold.min} to ${rule.amountThreshold.max}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RuleTest;
