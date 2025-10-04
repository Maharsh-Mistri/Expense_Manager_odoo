import React from 'react';

const QuickSwitcher = () => {
  const testAccounts = [
    { email: 'manager@test.com', password: 'password123', role: 'Manager' },
    { email: 'employee@test.com', password: 'password123', role: 'Employee' },
  ];

  const switchAccount = (account) => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Pre-fill login form
    window.location.href = `/login?email=${account.email}`;
  };

  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      background: 'white',
      padding: '1rem',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      zIndex: 9999,
      border: '2px solid #3498db'
    }}>
      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>🔄 Quick Switch (Dev)</h4>
      {testAccounts.map((account, index) => (
        <button
          key={index}
          onClick={() => switchAccount(account)}
          style={{
            display: 'block',
            width: '100%',
            padding: '0.5rem',
            margin: '0.25rem 0',
            background: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          {account.role}: {account.email}
        </button>
      ))}
    </div>
  );
};

export default QuickSwitcher;
