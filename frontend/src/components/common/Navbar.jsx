import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log('Logging out...');
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to={user.role === 'Admin' ? '/dashboard' : '/my-expenses'}>
          💼 Expense Management
        </Link>
      </div>
      
      <div className="nav-links">
        {user.role === 'Admin' && (
          <>
            <Link to="/dashboard">📊 Dashboard</Link>
            <Link to="/user-management">👥 Users</Link>
            <Link to="/approval-rules">📋 Rules</Link>
            <Link to="/team-expenses">💰 All Expenses</Link>
            <Link to="/pending-approvals">⏳ Approvals</Link>
          </>
        )}
        
        {user.role === 'Manager' && (
          <>
            <Link to="/pending-approvals">⏳ Pending</Link>
            <Link to="/team-expenses">👥 Team</Link>
            <Link to="/submit-expense">➕ Submit</Link>
            <Link to="/my-expenses">📝 My Expenses</Link>
          </>
        )}
        
        {user.role === 'Employee' && (
          <>
            <Link to="/submit-expense">➕ Submit</Link>
            <Link to="/my-expenses">📝 My Expenses</Link>
          </>
        )}

        <div className="nav-user">
          <span className="user-name">👤 {user.name}</span>
          <span className="user-role">({user.role})</span>
        </div>

        <button onClick={handleLogout} className="logout-btn">
          🚪 Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
