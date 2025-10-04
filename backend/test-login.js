const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Company = require('./models/Company'); // IMPORTANT: Import Company model

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const email = 'manager@test.com';
    const password = 'password123';

    console.log('=== SIMULATING LOGIN ===');
    console.log('Email:', email);
    console.log('Password:', password, '\n');

    // Step 1: Find user
    console.log('Step 1: Finding user...');
    const user = await User.findOne({ email }).populate('company').populate('manager', 'name email');

    if (!user) {
      console.log('❌ User not found!');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log('✅ User found!');
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Company:', user.company?.name);
    console.log('   Password Hash:', user.password.substring(0, 30) + '...\n');

    // Step 2: Check password
    console.log('Step 2: Checking password...');
    const isMatch = await user.matchPassword(password);
    console.log('Password match:', isMatch ? '✅ YES' : '❌ NO\n');

    if (!isMatch) {
      console.log('❌ Password does not match!');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log('✅✅✅ LOGIN WORKS! ✅✅✅\n');
    console.log('You should be able to login with these credentials in the browser.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

testLogin();
