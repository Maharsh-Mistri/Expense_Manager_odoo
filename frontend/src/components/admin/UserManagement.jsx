import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Employee',
    managerId: '',
    isManagerApprover: false,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers();
      console.log('Fetched users:', data);
      setUsers(data);
      setError('');
    } catch (error) {
      console.error('Fetch users error:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Clean the form data - convert empty string to null for managerId
      const cleanedData = {
        ...formData,
        managerId: formData.managerId === '' ? null : formData.managerId,
      };

      console.log('Submitting user data:', cleanedData);

      if (editingUser) {
        await userService.updateUser(editingUser._id, cleanedData);
        setMessage('User updated successfully! ✅');
      } else {
        await userService.createUser(cleanedData);
        setMessage('User created successfully! ✅');
      }
      
      resetForm();
      await fetchUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Submit error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to save user';
      setError(errorMsg);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      managerId: user.manager?._id || '',
      isManagerApprover: user.isManagerApprover || false,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      setLoading(true);
      try {
        await userService.deleteUser(id);
        setMessage(`${userName} deleted successfully! ✅`);
        await fetchUsers();
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        console.error('Delete error:', error);
        setError(error.response?.data?.message || 'Failed to delete user');
        setTimeout(() => setError(''), 5000);
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'Employee',
      managerId: '',
      isManagerApprover: false,
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const getRoleIcon = (role) => {
    const icons = {
      Admin: '👑',
      Manager: '👔',
      Employee: '👤',
    };
    return icons[role] || '👤';
  };

  const getRoleColor = (role) => {
    const colors = {
      Admin: '#e74c3c',
      Manager: '#3498db',
      Employee: '#2ecc71',
    };
    return colors[role] || '#95a5a6';
  };

  const managers = users.filter((u) => u.role === 'Manager' || u.role === 'Admin');

  if (loading && users.length === 0) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="user-management-container">
      <div className="management-header">
        <div>
          <h2>👥 User Management</h2>
          <p className="subtitle">Manage employees, managers, and their relationships</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)} disabled={loading}>
          {showForm ? '✕ Cancel' : '+ Add New User'}
        </button>
      </div>

      {message && <div className="message">{message}</div>}
      {error && <div className="error">{error}</div>}

      {showForm && (
        <div className="user-form-container">
          <h3>{editingUser ? '✏️ Edit User' : '➕ Create New User'}</h3>
          <form onSubmit={handleSubmit} className="user-form-modern">
            <div className="form-grid">
              <div className="form-group">
                <label>
                  Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  placeholder="user@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={editingUser !== null || loading}
                />
                {editingUser && <small>Email cannot be changed</small>}
              </div>

              <div className="form-group">
                <label>
                  Password {!editingUser && <span className="required">*</span>}
                </label>
                <input
                  type="password"
                  placeholder={editingUser ? 'Leave blank to keep current' : 'Enter password (min 6 characters)'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  minLength={6}
                  disabled={loading}
                />
                {editingUser && <small>Leave blank to keep current password</small>}
              </div>

              <div className="form-group">
                <label>
                  Role <span className="required">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                  disabled={loading}
                >
                  <option value="Employee">👤 Employee</option>
                  <option value="Manager">👔 Manager</option>
                  <option value="Admin">👑 Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label>Assign Manager (Optional)</label>
                <select
                  value={formData.managerId}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                  disabled={loading}
                >
                  <option value="">-- No Manager --</option>
                  {managers
                    .filter((u) => !editingUser || u._id !== editingUser._id)
                    .map((user) => (
                      <option key={user._id} value={user._id}>
                        {getRoleIcon(user.role)} {user.name} ({user.role})
                      </option>
                    ))}
                </select>
                <small>Select a manager if this user needs approval for expenses</small>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isManagerApprover}
                    onChange={(e) =>
                      setFormData({ ...formData, isManagerApprover: e.target.checked })
                    }
                    disabled={loading || !formData.managerId}
                  />
                  <span className="checkbox-text">
                    <strong>Manager is Approver</strong>
                    <small>
                      {formData.managerId 
                        ? 'Require manager approval for this user\'s expenses' 
                        : 'Select a manager first to enable this option'}
                    </small>
                  </span>
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={resetForm} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? '⏳ Saving...' : editingUser ? '💾 Update User' : '✅ Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="users-section">
        <h3>
          All Users <span className="user-count">({users.length})</span>
        </h3>

        {users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <p>No users found</p>
            <p>Click "Add New User" to create your first user</p>
          </div>
        ) : (
          <div className="users-grid">
            {users.map((user) => (
              <div key={user._id} className="user-card">
                <div className="user-card-header">
                  <div className="user-avatar" style={{ backgroundColor: getRoleColor(user.role) }}>
                    {getRoleIcon(user.role)}
                  </div>
                  <div className="user-role-badge" style={{ backgroundColor: getRoleColor(user.role) }}>
                    {user.role}
                  </div>
                </div>

                <div className="user-card-body">
                  <h4>{user.name}</h4>
                  <p className="user-email">✉️ {user.email}</p>

                  {user.manager ? (
                    <p className="user-manager">
                      👔 Reports to: <strong>{user.manager.name}</strong>
                    </p>
                  ) : (
                    <p className="user-manager" style={{ color: '#95a5a6' }}>
                      📭 No manager assigned
                    </p>
                  )}

                  {user.isManagerApprover && user.manager && (
                    <div className="user-badge">
                      <span className="badge-approver">✅ Manager Approver</span>
                    </div>
                  )}
                </div>

                <div className="user-card-actions">
                  <button 
                    className="btn-edit" 
                    onClick={() => handleEdit(user)}
                    disabled={loading}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="btn-delete" 
                    onClick={() => handleDelete(user._id, user.name)}
                    disabled={loading}
                  >
                    🗑️ Delete
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

export default UserManagement;
