const express = require('express');
const { signup, login, refreshToken } = require('../controllers/authController');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Helper to generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
  
  const refreshToken = jwt.sign(
    { id: userId, type: 'refresh' }, 
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, 
    { expiresIn: '30d' }
  );

  return { accessToken, refreshToken };
};

// Check if OAuth is configured
const isOAuthConfigured = () => {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
};

// ==================== TRADITIONAL AUTH ====================

// POST /api/auth/signup - Register new company/admin
router.post('/signup', signup);

// POST /api/auth/login - Login with email/password
router.post('/login', login);

// POST /api/auth/refresh-token - Refresh access token
router.post('/refresh-token', refreshToken);

// GET /api/auth/me - Get current user
router.get('/me', protect, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('company')
      .populate('manager', 'name email role');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/auth/oauth-status - Check if OAuth is configured
router.get('/oauth-status', (req, res) => {
  res.json({
    googleOAuth: isOAuthConfigured(),
    message: isOAuthConfigured() 
      ? 'Google OAuth is configured' 
      : 'Google OAuth is not configured. Add credentials to .env file.'
  });
});

// ==================== GOOGLE OAUTH ====================

if (isOAuthConfigured()) {
  // GET /api/auth/google - Initiate Google OAuth
  router.get('/google', (req, res, next) => {
    console.log('🔵 Google OAuth initiated');
    passport.authenticate('google', {
      session: false,
      scope: ['profile', 'email'],
    })(req, res, next);
  });

  // GET /api/auth/google/callback - Google OAuth callback
  router.get('/google/callback',
    passport.authenticate('google', {
      session: false,
      failureRedirect: 'http://localhost:3000/login?error=oauth_failed',
    }),
    (req, res) => {
      try {
        console.log('✅ Google OAuth successful for:', req.user.email);
        
        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(req.user._id);
        
        // Redirect to frontend with tokens
        const redirectUrl = `http://localhost:3000/oauth-callback?token=${accessToken}&refreshToken=${refreshToken}`;
        res.redirect(redirectUrl);
      } catch (error) {
        console.error('❌ OAuth callback error:', error);
        res.redirect('http://localhost:3000/login?error=token_generation_failed');
      }
    }
  );
} else {
  // Return error if OAuth routes are accessed without configuration
  router.get('/google', (req, res) => {
    res.status(503).json({ 
      message: 'Google OAuth is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env file.' 
    });
  });

  router.get('/google/callback', (req, res) => {
    res.redirect('http://localhost:3000/login?error=oauth_not_configured');
  });
}

// ==================== LOGOUT ====================

// POST /api/auth/logout - Logout
router.post('/logout', protect, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
