import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import authService from '../../services/authService';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthEnabled, setOauthEnabled] = useState(false);
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (user) {
      console.log('Already logged in, redirecting...');
      if (user.role === 'Admin') {
        navigate('/dashboard');
      } else if (user.role === 'Manager') {
        navigate('/pending-approvals');
      } else {
        navigate('/submit-expense');
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    fetch('http://localhost:5000/api/auth/oauth-status')
      .then(res => res.json())
      .then(data => {
        setOauthEnabled(data.googleOAuth);
      })
      .catch(() => {
        setOauthEnabled(false);
      });

    const oauthError = searchParams.get('error');
    if (oauthError) {
      const errorMessages = {
        'oauth_failed': '❌ Google authentication failed. Please try again.',
        'oauth_not_configured': '❌ Google OAuth is not configured on server.',
        'token_generation_failed': '❌ Failed to generate authentication token.',
        'callback_failed': '❌ Authentication callback failed. Please try again.',
        'missing_tokens': '❌ Missing authentication credentials.',
      };
      const message = errorMessages[oauthError] || '❌ Authentication failed.';
      setError(message);
      window.history.replaceState({}, document.title, '/login');
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setInfo('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');

    try {
      console.log('Attempting login with email:', formData.email);
      const response = await authService.login(formData);
      console.log('Login successful:', response);
      
      login(response);
    } catch (error) {
      console.error('Login error:', error);
      
      const errorMsg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      
      // Check if this might be an OAuth user
      if (errorMsg.includes('Invalid email or password')) {
        setError('❌ ' + errorMsg);
        setInfo('💡 If you signed up using Google, please use the "Continue with Google" button instead.');
      } else {
        setError('❌ ' + errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (oauthEnabled) {
      console.log('Initiating Google OAuth...');
      window.location.href = 'http://localhost:5000/api/auth/google';
    } else {
      setError('❌ Google OAuth is not configured. Please use email/password login.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>💼 Expense Management</h2>
          <h3>Welcome Back!</h3>
          <p className="subtitle">Sign in to manage your expenses</p>
        </div>

        {error && (
          <div className="error" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {info && (
          <div className="info-box" style={{ 
            marginBottom: '1rem',
            padding: '1rem',
            background: '#e3f2fd',
            border: '1px solid #2196f3',
            borderRadius: '8px',
            color: '#1976d2'
          }}>
            {info}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>📧 Email</label>
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>🔒 Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '⏳ Signing In...' : '🔐 Sign In'}
          </button>
        </form>

        {oauthEnabled && (
          <>
            <div className="divider">
              <span>OR</span>
            </div>

            <button 
              type="button" 
              className="btn-google" 
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Google
            </button>

            <p style={{
              textAlign: 'center',
              fontSize: '0.85rem',
              color: '#666',
              marginTop: '1rem'
            }}>
              💡 If you signed up with Google, use the Google button
            </p>
          </>
        )}

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
