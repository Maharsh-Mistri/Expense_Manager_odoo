import React, { useState, useEffect, useContext } from 'react';
import approvalService from '../../services/approvalService';
import { AuthContext } from '../../context/AuthContext';

const PendingApprovals = () => {
  const { user } = useContext(AuthContext);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState({});
  const [processing, setProcessing] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPendingApprovals();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingApprovals, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const data = await approvalService.getPendingApprovals();
      console.log('Pending approvals:', data);
      setWorkflows(data);
      setError('');
    } catch (error) {
      console.error('Failed to fetch pending approvals:', error);
      if (!loading) {
        setError('Failed to fetch pending approvals');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (expenseId, action) => {
    if (processing) return;
    
    setProcessing(expenseId);
    setError('');
    setMessage('');

    try {
      const comment = comments[expenseId] || '';
      console.log('Processing approval:', { expenseId, action, comment });
      
      const result = await approvalService.processApproval(expenseId, action, comment);
      
      setMessage(
        action === 'Approved' 
          ? `✅ Expense approved successfully! ${result.isFullyApproved ? '(Fully Approved)' : '(Awaiting more approvals)'}`
          : '❌ Expense rejected successfully!'
      );
      
      setComments({ ...comments, [expenseId]: '' });
      await fetchPendingApprovals();
      
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Failed to process approval:', error);
      setError(error.response?.data?.message || 'Failed to process approval');
      setTimeout(() => setError(''), 5000);
    } finally {
      setProcessing(null);
    }
  };

  const handleCommentChange = (expenseId, value) => {
    setComments({ ...comments, [expenseId]: value });
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Travel: '✈️',
      Food: '🍔',
      Accommodation: '🏨',
      'Office Supplies': '📎',
      Entertainment: '🎬',
      Other: '📋',
    };
    return icons[category] || '📋';
  };

  if (loading) {
    return <div className="loading">Loading pending approvals...</div>;
  }

  return (
    <div className="pending-approvals">
      <div className="approvals-header">
        <div>
          <h2>⏳ Pending Approvals</h2>
          <p className="subtitle">Review and approve expense requests requiring your approval</p>
        </div>
        <button className="btn-secondary" onClick={fetchPendingApprovals} disabled={loading}>
          🔄 Refresh
        </button>
      </div>

      {message && <div className="message">{message}</div>}
      {error && <div className="error">{error}</div>}

      {workflows.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <p>No pending approvals</p>
          <p>All expenses have been reviewed or no expenses require your approval!</p>
        </div>
      ) : (
        <div className="approvals-grid">
          {workflows.map((workflow) => {
            const expense = workflow.expense;
            const isProcessing = processing === expense._id;
            
            return (
              <div key={workflow._id} className="approval-card-modern">
                <div className="approval-card-header">
                  <div className="employee-info">
                    <div className="employee-avatar" style={{ backgroundColor: '#3498db' }}>
                      {expense.employee.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3>{expense.employee.name}</h3>
                      <p className="employee-email">{expense.employee.email}</p>
                    </div>
                  </div>
                  <span className={`status-badge status-${expense.status.toLowerCase().replace(' ', '-')}`}>
                    {expense.status}
                  </span>
                </div>

                <div className="expense-details-grid">
                  <div className="detail-item">
                    <span className="detail-label">💰 Amount</span>
                    <span className="detail-value">
                      ${expense.amount} {expense.currency}
                      {expense.currency !== expense.company?.currency && (
                        <small> (≈ ${expense.amountInCompanyCurrency.toFixed(2)})</small>
                      )}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">📂 Category</span>
                    <span className="detail-value">
                      {getCategoryIcon(expense.category)} {expense.category}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">📅 Date</span>
                    <span className="detail-value">
                      {new Date(expense.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  {expense.receipt && (
                    <div className="detail-item">
                      <span className="detail-label">📎 Receipt</span>
                      <span className="detail-value">Attached</span>
                    </div>
                  )}
                </div>

                <div className="expense-description">
                  <strong>📝 Description:</strong>
                  <p>{expense.description}</p>
                </div>

                {workflow.approvalSteps && workflow.approvalSteps.length > 1 && (
                  <div className="workflow-info">
                    <strong>🔄 Approval Workflow:</strong>
                    <div className="workflow-steps">
                      {workflow.approvalSteps.map((step, index) => (
                        <div 
                          key={index} 
                          className={`workflow-step ${
                            step.status === 'Approved' ? 'approved' : 
                            step.status === 'Rejected' ? 'rejected' : 
                            step.approver.toString() === user._id.toString() ? 'current' : 'pending'
                          }`}
                        >
                          <span className="step-number">{index + 1}</span>
                          <span className="step-status">
                            {step.status === 'Approved' ? '✅' : 
                             step.status === 'Rejected' ? '❌' : 
                             step.approver.toString() === user._id.toString() ? '👉' : '⏳'}
                          </span>
                        </div>
                      ))}
                    </div>
                    <small>Step {workflow.approvalSteps.filter(s => s.status === 'Approved').length + 1} of {workflow.approvalSteps.length}</small>
                  </div>
                )}

                <div className="comment-section">
                  <label>💬 Add Comment (Optional)</label>
                  <textarea
                    placeholder="Add your comments or feedback..."
                    value={comments[expense._id] || ''}
                    onChange={(e) => handleCommentChange(expense._id, e.target.value)}
                    disabled={isProcessing}
                    rows="3"
                  />
                </div>

                <div className="approval-actions-modern">
                  <button 
                    className="btn-approve"
                    onClick={() => handleApproval(expense._id, 'Approved')}
                    disabled={isProcessing}
                  >
                    {isProcessing ? '⏳ Processing...' : '✅ Approve'}
                  </button>
                  <button 
                    className="btn-reject"
                    onClick={() => handleApproval(expense._id, 'Rejected')}
                    disabled={isProcessing}
                  >
                    {isProcessing ? '⏳ Processing...' : '❌ Reject'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PendingApprovals;
