const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

const listUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find().populate('company').select('-password');

    console.log('=== ALL USERS IN DATABASE ===\n');
    console.log(`Total users: ${users.length}\n`);

    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Company: ${user.company?.name || 'N/A'}`);
      console.log(`  Avatar: ${user.avatar ? 'Yes (OAuth user)' : 'No'}`);
      console.log(`  Created: ${user.createdAt}\n`);
    });

    console.log('=== INSTRUCTIONS ===');
    console.log('• Users with Avatar = "Yes" were created via Google OAuth');
    console.log('• These users should use "Sign in with Google" button');
    console.log('• Users created via signup can use email/password\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

listUsers();
