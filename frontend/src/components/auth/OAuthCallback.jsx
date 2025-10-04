import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [status, setStatus] = useState('Processing...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log('OAuth Callback: Started');
        console.log('URL:', window.location.href);
        
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');
        const errorParam = searchParams.get('error');

        console.log('OAuth Callback: Params', { 
          hasToken: !!token, 
          hasRefreshToken: !!refreshToken, 
          error: errorParam 
        });

        if (errorParam) {
          setStatus('Authentication failed');
          setError(errorParam);
          console.error('OAuth error:', errorParam);
          setTimeout(() => navigate('/login?error=' + errorParam), 2000);
          return;
        }

        if (!token || !refreshToken) {
          setStatus('Missing credentials');
          setError('No tokens received');
          console.error('Missing tokens');
          setTimeout(() => navigate('/login?error=missing_tokens'), 2000);
          return;
        }

        setStatus('Saving credentials...');
        console.log('OAuth Callback: Saving tokens to localStorage');
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);

        setStatus('Fetching user data...');
        console.log('OAuth Callback: Fetching user data from API');
        
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('OAuth Callback: API response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('OAuth Callback: API error', errorData);
          throw new Error(errorData.message || 'Failed to fetch user data');
        }

        const userData = await response.json();
        console.log('OAuth Callback: User data received:', userData);

        setStatus('Logging in...');
        
        // Login with user data
        const userWithTokens = {
          ...userData,
          token,
          refreshToken
        };
        
        console.log('OAuth Callback: Calling login with:', userWithTokens);
        login(userWithTokens);

        setStatus('Success! Redirecting...');
        
        // Redirect based on role
        setTimeout(() => {
          console.log('OAuth Callback: Redirecting user, role:', userData.role);
          
          if (userData.role === 'Admin') {
            console.log('Redirecting to: /dashboard');
            navigate('/dashboard', { replace: true });
          } else if (userData.role === 'Manager') {
            console.log('Redirecting to: /pending-approvals');
            navigate('/pending-approvals', { replace: true });
          } else {
            console.log('Redirecting to: /submit-expense');
            navigate('/submit-expense', { replace: true });
          }
        }, 500);

      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('Error occurred');
        setError(error.message);
        setTimeout(() => navigate('/login?error=callback_failed'), 2000);
      }
    };

    processCallback();
  }, [searchParams, navigate, login]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '1.5rem',
      padding: '2rem'
    }}>
      <div className="spinner"></div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#333' }}>
        {status}
      </h2>
      {error && (
        <p style={{ fontSize: '1rem', color: '#e74c3c', textAlign: 'center' }}>
          Error: {error}
        </p>
      )}
      <p style={{ fontSize: '0.9rem', color: '#666' }}>
        Please wait while we complete your sign-in...
      </p>
    </div>
  );
};

export default OAuthCallback;
