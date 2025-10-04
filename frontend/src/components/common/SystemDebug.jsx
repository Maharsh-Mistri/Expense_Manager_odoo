import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import expenseService from '../../services/expenseService';
import approvalService from '../../services/approvalService';
import userService from '../../services/userService';

const SystemDebug = () => {
  const { user } = useContext(AuthContext);
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const [users, expenses, rules, pendingApprovals] = await Promise.all([
        userService.getUsers(),
        expenseService.getAllExpenses(),
        approvalService.getApprovalRules(),
        approvalService.getPendingApprovals().catch(() => []),
      ]);

      const currentUser = users.find(u => u._id === user._id);
      const teamMembers = users.filter(u => u.manager?._id === user._id);
      const myExpenses = expenses.filter(e => e.employee._id === user._id);
      const teamExpenses = expenses.filter(e => 
        teamMembers.some(tm => tm._id === e.employee._id)
      );

      setDebugInfo({
        currentUser: {
          name: currentUser?.name,
          role: currentUser?.role,
          email: currentUser?.email,
          hasManager: !!currentUser?.manager,
          managerName: currentUser?.manager?.name,
          isManagerApprover: currentUser?.isManagerApprover,
        },
        teamMembers: teamMembers.map(tm => ({
          name: tm.name,
          email: tm.email,
          isManagerApprover: tm.isManagerApprover,
        })),
        expenses: {
          total: expenses.length,
          myExpenses: myExpenses.length,
          teamExpenses: teamExpenses.length,
          pending: expenses.filter(e => e.status === 'Pending' || e.status === 'In Progress').length,
          approved: expenses.filter(e => e.status === 'Approved').length,
          rejected: expenses.filter(e => e.status === 'Rejected').length,
        },
        rules: {
          total: rules.length,
          active: rules.filter(r => r.isActive).length,
          rulesList: rules.map(r => ({
            name: r.name,
            type: r.ruleType,
            range: `$${r.amountThreshold?.min} - $${r.amountThreshold?.max}`,
            approvers: r.approvers?.length || 0,
          })),
        },
        pendingApprovals: {
          count: pendingApprovals.length,
          details: pendingApprovals.map(pa => ({
            expenseId: pa.expense._id,
            employee: pa.expense.employee.name,
            amount: pa.expense.amount,
            status: pa.expense.status,
          })),
        },
      });
    } catch (error) {
      console.error('Debug error:', error);
      setDebugInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      zIndex: 9999 
    }}>
      <button 
        onClick={runDiagnostics}
        disabled={loading}
        style={{
          padding: '10px 20px',
          background: '#e74c3c',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        🔍 Debug System
      </button>

      {debugInfo && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'auto',
          zIndex: 10000,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3>System Diagnostics</h3>
            <button onClick={() => setDebugInfo(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
          </div>

          <pre style={{ 
            background: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '5px', 
            fontSize: '12px',
            overflow: 'auto',
            maxHeight: '60vh',
          }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>

          <div style={{ marginTop: '20px', padding: '15px', background: '#fff3cd', borderRadius: '5px' }}>
            <strong>Troubleshooting Tips:</strong>
            <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
              <li>If <strong>pendingApprovals.count = 0</strong>: No expenses need your approval</li>
              <li>Check <strong>isManagerApprover</strong> is <strong>true</strong> for team members</li>
              <li>Ensure approval <strong>rules</strong> exist for expense amounts</li>
              <li>Verify team members have you set as their <strong>manager</strong></li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemDebug;
