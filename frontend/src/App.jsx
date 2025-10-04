import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import SystemDebug from './components/common/SystemDebug';
import QuickSwitcher from './components/common/QuickSwitcher';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import OAuthCallback from './components/auth/OAuthCallback';
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
          <SystemDebug />
          <QuickSwitcher />
          
          <div className="container">
            <Routes>
              {/* ==================== PUBLIC ROUTES ==================== */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/oauth-callback" element={<OAuthCallback />} />
              
              {/* ==================== ADMIN ROUTES ==================== */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute roles={['Admin']}>
                    <Dashboard />
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
              
              {/* ==================== MANAGER & ADMIN ROUTES ==================== */}
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
              
              {/* ==================== ALL AUTHENTICATED USERS ==================== */}
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
              
              {/* ==================== DEFAULT & 404 ROUTES ==================== */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
