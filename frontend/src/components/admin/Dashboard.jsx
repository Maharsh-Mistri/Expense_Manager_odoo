import React, { useState, useEffect } from 'react';
import expenseService from '../../services/expenseService';
import userService from '../../services/userService';
import approvalService from '../../services/approvalService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalExpenses: 0,
    pendingExpenses: 0,
    approvedExpenses: 0,
    rejectedExpenses: 0,
    totalAmount: 0,
  });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [users, expenses, approvalRules] = await Promise.all([
        userService.getUsers(),
        expenseService.getAllExpenses(),
        approvalService.getApprovalRules(),
      ]);

      setStats({
        totalUsers: users.length,
        totalExpenses: expenses.length,
        pendingExpenses: expenses.filter(e => e.status === 'Pending' || e.status === 'In Progress').length,
        approvedExpenses: expenses.filter(e => e.status === 'Approved').length,
        rejectedExpenses: expenses.filter(e => e.status === 'Rejected').length,
        totalAmount: expenses
          .filter(e => e.status === 'Approved')
          .reduce((sum, e) => sum + e.amountInCompanyCurrency, 0),
      });

      setRecentExpenses(expenses.slice(0, 5));
      setRules(approvalRules);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>📊 Admin Dashboard</h2>
        <p className="subtitle">System overview and workflow status</p>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-stats">
        <div className="stat-card total">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pendingExpenses}</h3>
            <p>Pending Approval</p>
          </div>
        </div>

        <div className="stat-card approved">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.approvedExpenses}</h3>
            <p>Approved</p>
          </div>
        </div>

        <div className="stat-card rejected">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <h3>{stats.rejectedExpenses}</h3>
            <p>Rejected</p>
          </div>
        </div>

        <div className="stat-card amount">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>${stats.totalAmount.toFixed(2)}</h3>
            <p>Total Approved</p>
          </div>
        </div>
      </div>

      {/* Workflow Guide */}
      <div className="workflow-guide">
        <h3>🔄 How the Approval Workflow Works</h3>
        
        <div className="workflow-steps-visual">
          <div className="workflow-step-card">
            <div className="step-number">1</div>
            <h4>Employee Submits</h4>
            <p>Employee creates expense claim with receipt and details</p>
            <span className="step-icon">📝</span>
          </div>

          <div className="workflow-arrow">→</div>

          <div className="workflow-step-card">
            <div className="step-number">2</div>
            <h4>System Checks Rules</h4>
            <p>Matches expense amount with approval rules</p>
            <span className="step-icon">⚙️</span>
          </div>

          <div className="workflow-arrow">→</div>

          <div className="workflow-step-card">
            <div className="step-number">3</div>
            <h4>Manager Review</h4>
            <p>If "Manager is Approver" checked, manager approves first</p>
            <span className="step-icon">👔</span>
          </div>

          <div className="workflow-arrow">→</div>

          <div className="workflow-step-card">
            <div className="step-number">4</div>
            <h4>Rule Approvers</h4>
            <p>Additional approvers based on rule type</p>
            <span className="step-icon">✅</span>
          </div>

          <div className="workflow-arrow">→</div>

          <div className="workflow-step-card">
            <div className="step-number">5</div>
            <h4>Final Status</h4>
            <p>Approved or Rejected - employee notified</p>
            <span className="step-icon">🎉</span>
          </div>
        </div>

        <div className="workflow-rules-explanation">
          <h4>📋 Approval Rule Types Explained</h4>
          
          <div className="rule-explanation-grid">
            <div className="rule-explain-card">
              <div className="rule-explain-icon">📋</div>
              <h5>Sequential</h5>
              <p>All approvers must approve <strong>in order</strong>. If anyone rejects, workflow stops.</p>
              <div className="rule-example">
                <small>Example: Manager1 → Manager2 → Admin</small>
              </div>
            </div>

            <div className="rule-explain-card">
              <div className="rule-explain-icon">📊</div>
              <h5>Percentage</h5>
              <p>Any <strong>X% of approvers</strong> must approve. Not sequential.</p>
              <div className="rule-example">
                <small>Example: Any 2 out of 3 (60%)</small>
              </div>
            </div>

            <div className="rule-explain-card">
              <div className="rule-explain-icon">👤</div>
              <h5>Specific</h5>
              <p>Only <strong>one specific person</strong> must approve. Fast-track.</p>
              <div className="rule-example">
                <small>Example: Only CFO approval needed</small>
              </div>
            </div>

            <div className="rule-explain-card">
              <div className="rule-explain-icon">🔀</div>
              <h5>Hybrid</h5>
              <p><strong>Percentage OR specific</strong> approver. Whichever happens first.</p>
              <div className="rule-example">
                <small>Example: 70% OR CFO</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Rules */}
      <div className="active-rules-section">
        <h3>📝 Active Approval Rules ({rules.length})</h3>
        {rules.length === 0 ? (
          <div className="info-box">
            <p>⚠️ No approval rules configured. All expenses will be auto-approved!</p>
            <p>Go to <strong>Approval Rules</strong> to create your first rule.</p>
          </div>
        ) : (
          <div className="rules-table">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Rule Name</th>
                  <th>Type</th>
                  <th>Amount Range</th>
                  <th>Approvers</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule._id}>
                    <td><strong>{rule.name}</strong></td>
                    <td>
                      <span className="rule-type-badge">{rule.ruleType}</span>
                    </td>
                    <td>
                      ${rule.amountThreshold?.min || 0} - ${rule.amountThreshold?.max || 0}
                    </td>
                    <td>
                      {rule.approvers?.length || 0} approver(s)
                      {rule.percentageThreshold && ` (${rule.percentageThreshold}%)`}
                    </td>
                    <td>
                      <span className={`status-badge ${rule.isActive ? 'active' : 'inactive'}`}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Expenses */}
      <div className="recent-expenses-section">
        <h3>📋 Recent Expenses</h3>
        {recentExpenses.length === 0 ? (
          <p>No expenses submitted yet.</p>
        ) : (
          <div className="expenses-list">
            {recentExpenses.map((expense) => (
              <div key={expense._id} className="expense-item">
                <div className="expense-item-header">
                  <strong>{expense.employee.name}</strong>
                  <span className={`status-badge status-${expense.status.toLowerCase().replace(' ', '-')}`}>
                    {expense.status}
                  </span>
                </div>
                <p className="expense-item-desc">{expense.description}</p>
                <div className="expense-item-footer">
                  <span>${expense.amount} {expense.currency}</span>
                  <span>{new Date(expense.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Setup Checklist */}
      <div className="setup-checklist">
        <h3>✅ Setup Checklist</h3>
        <div className="checklist">
          <div className={`checklist-item ${stats.totalUsers > 0 ? 'complete' : ''}`}>
            <span className="check-icon">{stats.totalUsers > 0 ? '✅' : '⏳'}</span>
            <span>Create users (Employees & Managers)</span>
          </div>
          <div className={`checklist-item ${rules.length > 0 ? 'complete' : ''}`}>
            <span className="check-icon">{rules.length > 0 ? '✅' : '⏳'}</span>
            <span>Configure approval rules</span>
          </div>
          <div className={`checklist-item ${stats.totalExpenses > 0 ? 'complete' : ''}`}>
            <span className="check-icon">{stats.totalExpenses > 0 ? '✅' : '⏳'}</span>
            <span>Employees submit expenses</span>
          </div>
          <div className={`checklist-item ${stats.approvedExpenses > 0 ? 'complete' : ''}`}>
            <span className="check-icon">{stats.approvedExpenses > 0 ? '✅' : '⏳'}</span>
            <span>Managers approve expenses</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
