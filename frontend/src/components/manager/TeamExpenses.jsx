import React, { useState, useEffect, useContext } from 'react';
import expenseService from '../../services/expenseService';
import { AuthContext } from '../../context/AuthContext';

const TeamExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const data = await expenseService.getAllExpenses();
      setExpenses(data);
    } catch (error) {
      console.error('Failed to fetch expenses');
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

  const filteredExpenses = expenses
    .filter((exp) => {
      if (filter === 'all') return true;
      return exp.status === filter;
    })
    .filter((exp) => {
      if (!searchTerm) return true;
      return (
        exp.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  const getStats = () => {
    const total = expenses.length;
    const pending = expenses.filter((e) => e.status === 'Pending' || e.status === 'In Progress').length;
    const approved = expenses.filter((e) => e.status === 'Approved').length;
    const rejected = expenses.filter((e) => e.status === 'Rejected').length;
    const totalAmount = expenses
      .filter((e) => e.status === 'Approved')
      .reduce((sum, e) => sum + e.amountInCompanyCurrency, 0);

    return { total, pending, approved, rejected, totalAmount };
  };

  const stats = getStats();

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="team-expenses-container">
      <div className="expenses-header">
        <div>
          <h2>📊 Team Expenses</h2>
          <p className="subtitle">
            {user.role === 'Admin' ? 'All company expenses' : 'Your team expenses'}
          </p>
        </div>
      </div>

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
            <p>Pending Review</p>
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

        <div className="stat-card amount">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>${stats.totalAmount.toFixed(2)}</h3>
            <p>Approved Amount</p>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search by employee, description, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={filter === 'Pending' ? 'active' : ''}
            onClick={() => setFilter('Pending')}
          >
            Pending
          </button>
          <button
            className={filter === 'In Progress' ? 'active' : ''}
            onClick={() => setFilter('In Progress')}
          >
            In Progress
          </button>
          <button
            className={filter === 'Approved' ? 'active' : ''}
            onClick={() => setFilter('Approved')}
          >
            Approved
          </button>
          <button
            className={filter === 'Rejected' ? 'active' : ''}
            onClick={() => setFilter('Rejected')}
          >
            Rejected
          </button>
        </div>
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No expenses found</p>
          <p>Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <div className="expenses-table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => (
                <tr key={expense._id}>
                  <td>
                    <div className="employee-cell">
                      <div className="employee-avatar">
                        {expense.employee.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong>{expense.employee.name}</strong>
                        <br />
                        <small>{expense.employee.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="category-badge">
                      {getCategoryIcon(expense.category)} {expense.category}
                    </span>
                  </td>
                  <td className="description-cell">{expense.description}</td>
                  <td className="amount-cell">
                    <strong>
                      ${expense.amount} {expense.currency}
                    </strong>
                    {expense.currency !== expense.company?.currency && (
                      <small>
                        <br />(${expense.amountInCompanyCurrency.toFixed(2)})
                      </small>
                    )}
                  </td>
                  <td>{new Date(expense.date).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge status-${expense.status.toLowerCase().replace(' ', '-')}`}>
                      {getStatusIcon(expense.status)} {expense.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-view" title="View Details">
                      👁️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeamExpenses;
