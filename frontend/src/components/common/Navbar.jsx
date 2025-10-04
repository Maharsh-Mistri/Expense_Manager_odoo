import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <div className="nav-brand">Expense Management</div>
      {user && (
        <div className="nav-links">
          {user.role === 'Admin' && (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/user-management">Users</Link>
              <Link to="/approval-rules">Approval Rules</Link>
              <Link to="/team-expenses">All Expenses</Link>
              <Link to="/pending-approvals">Pending Approvals</Link>
            </>
          )}
          {user.role === 'Manager' && (
            <>
              <Link to="/pending-approvals">Pending Approvals</Link>
              <Link to="/team-expenses">Team Expenses</Link>
              <Link to="/submit-expense">Submit Expense</Link>
              <Link to="/my-expenses">My Expenses</Link>
            </>
          )}
          {user.role === 'Employee' && (
            <>
              <Link to="/submit-expense">Submit Expense</Link>
              <Link to="/my-expenses">My Expenses</Link>
            </>
          )}
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
