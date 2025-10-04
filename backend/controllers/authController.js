 const User = require('../models/User');
const Company = require('../models/Company');
const { generateToken } = require('../config/jwt');
const axios = require('axios');

// Signup
const signup = async (req, res) => {
  try {
    const { name, email, password, country } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Get currency for country
    const response = await axios.get(`https://restcountries.com/v3.1/all?fields=name,currencies`);
    const countryData = response.data.find(
      (c) => c.name.common === country || c.name.official === country
    );
    const currency = countryData ? Object.keys(countryData.currencies)[0] : 'USD';

    // Create company first (without admin)
    const company = new Company({
      name: `${name}'s Company`,
      country,
      currency,
      adminUser: null, // Temporary
    });

    // Create admin user
    const user = await User.create({
      name,
      email,
      password,
      role: 'Admin',
      company: company._id,
    });

    // Update company with admin user
    company.adminUser = user._id;
    await company.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: company,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('company');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { signup, login };

