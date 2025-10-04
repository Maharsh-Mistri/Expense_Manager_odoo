const User = require('../models/User');
const Company = require('../models/Company');
const jwt = require('jsonwebtoken');
const { getCurrencyFromCountry } = require('../utils/currencies');

// Generate JWT Token
const generateToken = (id, expiresIn = '7d') => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn,
  });
};

// Generate Refresh Token
const generateRefreshToken = (id) => {
  return jwt.sign({ id, type: 'refresh' }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Signup (Company Registration)
const signup = async (req, res) => {
  try {
    const { name, email, password, country } = req.body;

    console.log('Signup request:', { name, email, country });

    if (!name || !email || !password || !country) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Get currency from country
    const currency = getCurrencyFromCountry(country);
    console.log('Currency for', country, ':', currency);

    // Create company
    const company = await Company.create({
      name: name + "'s Company",
      country,
      currency,
    });

    // Create admin user
    const user = await User.create({
      name,
      email,
      password,
      role: 'Admin',
      company: company._id,
    });

    // Generate tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: {
        _id: company._id,
        name: company.name,
        country: company.country,
        currency: company.currency,
      },
      token: accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).populate('company').populate('manager', 'name email');

    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if password matches
    const isPasswordMatch = await user.matchPassword(password);
    console.log('Password match:', isPasswordMatch);

    if (!isPasswordMatch) {
      console.log('Password mismatch for:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    console.log('Login successful for:', email);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      manager: user.manager,
      isManagerApprover: user.isManagerApprover,
      token: accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Refresh Token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Get user
    const user = await User.findById(decoded.id).populate('company');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Generate new access token
    const newAccessToken = generateToken(user._id);

    res.json({
      token: newAccessToken,
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

// Check if user exists (for OAuth users)
const checkUser = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email }).select('email name role');

    if (!user) {
      return res.json({ exists: false });
    }

    res.json({
      exists: true,
      name: user.name,
      email: user.email,
      role: user.role,
      message: 'This account was created using Google Sign-In. Please use "Sign in with Google" button.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { signup, login, refreshToken, checkUser };
