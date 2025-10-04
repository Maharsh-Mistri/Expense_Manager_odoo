import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import SystemDebug from './components/common/SystemDebug';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Navbar from './components/common/Navbar';
import Dashboard from './components/admin/Dashboard';
import ExpenseSubmission from './components/employee/ExpenseSubmission';
import ExpenseHistory from './components/employee/ExpenseHistory';
import PendingApprovals from './components/manager/PendingApprovals';
import TeamExpenses from './components/manager/TeamExpenses';
import UserManagement from './components/admin/UserManagement';
import ApprovalRuleConfig from './components/admin/ApprovalRuleConfig';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <SystemDebug /> {/* Debug tool */}
          <div className="container">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute roles={['Admin']}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/submit-expense"
                element={
                  <ProtectedRoute roles={['Employee', 'Manager', 'Admin']}>
                    <ExpenseSubmission />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/my-expenses"
                element={
                  <ProtectedRoute roles={['Employee', 'Manager', 'Admin']}>
                    <ExpenseHistory />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/pending-approvals"
                element={
                  <ProtectedRoute roles={['Manager', 'Admin']}>
                    <PendingApprovals />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/team-expenses"
                element={
                  <ProtectedRoute roles={['Manager', 'Admin']}>
                    <TeamExpenses />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/user-management"
                element={
                  <ProtectedRoute roles={['Admin']}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/approval-rules"
                element={
                  <ProtectedRoute roles={['Admin']}>
                    <ApprovalRuleConfig />
                  </ProtectedRoute>
                }
              />
              
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
