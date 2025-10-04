import React, { useState, useEffect } from 'react';
import expenseService from '../../services/expenseService';

const ExpenseHistory = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [selectedExpense, setSelectedExpense] = useState(null);

  useEffect(() => {
    fetchExpenses();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchExpenses, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchExpenses = async () => {
    try {
      const data = await expenseService.getMyExpenses();
      console.log('My expenses:', data);
      setExpenses(data);
      setError('');
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      if (!loading) {
        setError('Failed to fetch expenses');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      Pending: '⏳',
      Approved: '✅',
      Rejected: '❌',
      'In Progress': '🔄',
    };
    return icons[status] || '⏳';
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

  const filteredExpenses = expenses.filter((exp) => {
    if (filter === 'all') return true;
    return exp.status === filter;
  });

  const getStats = () => {
    return {
      total: expenses.length,
      pending: expenses.filter((e) => e.status === 'Pending' || e.status === 'In Progress').length,
      approved: expenses.filter((e) => e.status === 'Approved').length,
      rejected: expenses.filter((e) => e.status === 'Rejected').length,
    };
  };

  const stats = getStats();

  const viewDetails = (expense) => {
    setSelectedExpense(expense);
  };

  const closeModal = () => {
    setSelectedExpense(null);
  };

  if (loading) {
    return <div className="loading">Loading expenses...</div>;
  }

  return (
    <div className="expense-history">
      <div className="history-header">
        <div>
          <h2>📊 My Expense History</h2>
          <p className="subtitle">Track all your submitted expenses and their approval status</p>
        </div>
        <button className="btn-secondary" onClick={fetchExpenses} disabled={loading}>
          🔄 Refresh
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Expenses</p>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card approved">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.approved}</h3>
            <p>Approved</p>
          </div>
        </div>
        <div className="stat-card rejected">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <h3>{stats.rejected}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      <div className="filter-buttons" style={{ marginBottom: '1.5rem' }}>
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
          All ({expenses.length})
        </button>
        <button className={filter === 'Pending' ? 'active' : ''} onClick={() => setFilter('Pending')}>
          Pending ({expenses.filter(e => e.status === 'Pending').length})
        </button>
        <button className={filter === 'In Progress' ? 'active' : ''} onClick={() => setFilter('In Progress')}>
          In Progress ({expenses.filter(e => e.status === 'In Progress').length})
        </button>
        <button className={filter === 'Approved' ? 'active' : ''} onClick={() => setFilter('Approved')}>
          Approved ({expenses.filter(e => e.status === 'Approved').length})
        </button>
        <button className={filter === 'Rejected' ? 'active' : ''} onClick={() => setFilter('Rejected')}>
          Rejected ({expenses.filter(e => e.status === 'Rejected').length})
        </button>
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No expenses found</p>
          <p>{filter === 'all' ? 'Submit your first expense to get started!' : `No ${filter.toLowerCase()} expenses`}</p>
        </div>
      ) : (
        <div className="expenses-table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => (
                <tr key={expense._id}>
                  <td>{new Date(expense.date).toLocaleDateString()}</td>
                  <td>
                    <span className="category-badge">
                      {getCategoryIcon(expense.category)} {expense.category}
                    </span>
                  </td>
                  <td className="description-cell">{expense.description}</td>
                  <td className="amount-cell">
                    <strong>${expense.amount} {expense.currency}</strong>
                  </td>
                  <td>
                    <span className={`status-badge status-${expense.status.toLowerCase().replace(' ', '-')}`}>
                      {getStatusIcon(expense.status)} {expense.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-view" onClick={() => viewDetails(expense)} title="View Details">
                      👁️ View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Expense Details Modal */}
      {selectedExpense && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Expense Details</h3>
              <button className="btn-close" onClick={closeModal}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="expense-detail-grid">
                <div className="detail-row">
                  <strong>Category:</strong>
                  <span>{getCategoryIcon(selectedExpense.category)} {selectedExpense.category}</span>
                </div>
                <div className="detail-row">
                  <strong>Amount:</strong>
                  <span>${selectedExpense.amount} {selectedExpense.currency}</span>
                </div>
                <div className="detail-row">
                  <strong>Date:</strong>
                  <span>{new Date(selectedExpense.date).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <strong>Status:</strong>
                  <span className={`status-badge status-${selectedExpense.status.toLowerCase().replace(' ', '-')}`}>
                    {getStatusIcon(selectedExpense.status)} {selectedExpense.status}
                  </span>
                </div>
                <div className="detail-row full-width">
                  <strong>Description:</strong>
                  <p>{selectedExpense.description}</p>
                </div>
              </div>

              {selectedExpense.approvalHistory && selectedExpense.approvalHistory.length > 0 && (
                <div className="approval-history">
                  <h4>Approval History</h4>
                  <div className="timeline">
                    {selectedExpense.approvalHistory.map((history, index) => (
                      <div key={index} className={`timeline-item ${history.action.toLowerCase()}`}>
                        <div className="timeline-icon">
                          {history.action === 'Approved' ? '✅' : '❌'}
                        </div>
                        <div className="timeline-content">
                          <strong>{history.action}</strong> by approver
                          <p className="timeline-date">
                            {new Date(history.timestamp).toLocaleString()}
                          </p>
                          {history.comment && (
                            <p className="timeline-comment">💬 {history.comment}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseHistory;
