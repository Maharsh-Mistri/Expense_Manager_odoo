const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const Company = require('../models/Company');

console.log('\n=== PASSPORT CONFIGURATION ===');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET ✓' : 'NOT SET ✗');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET ✓' : 'NOT SET ✗');

// Only configure Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('Configuring Google OAuth Strategy...');
  
  try {
    passport.use('google', new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('\n=== GOOGLE OAUTH LOGIN ===');
        console.log('Email:', profile.emails[0].value);
        console.log('Name:', profile.displayName);

        // Check if user exists
        let user = await User.findOne({ email: profile.emails[0].value }).populate('company');

        if (!user) {
          console.log('New user - creating company and user...');
          
          // Create new company for new user
          const company = await Company.create({
            name: profile.displayName + "'s Company",
            country: 'United States',
            currency: 'USD',
          });

          // Create new user as Admin
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: Math.random().toString(36).slice(-8) + 'Aa1!',
            role: 'Admin',
            company: company._id,
            avatar: profile.photos?.[0]?.value || null,
          });

          user = await User.findById(user._id).populate('company');
          console.log('✅ New user created:', user.email);
        } else {
          console.log('✅ Existing user found:', user.email);
        }

        console.log('=== END GOOGLE OAUTH ===\n');
        return done(null, user);
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, null);
      }
    }));
    
    console.log('✅ Google OAuth Strategy configured successfully');
  } catch (error) {
    console.error('❌ Error configuring Google OAuth:', error.message);
  }
} else {
  console.log('⚠️  Google OAuth not configured - credentials missing in .env');
}

console.log('=== END PASSPORT CONFIGURATION ===\n');

module.exports = passport;
