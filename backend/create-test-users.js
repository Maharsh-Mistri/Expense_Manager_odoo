const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Company = require('./models/Company');

const createTestUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    let company = await Company.findOne();
    
    if (!company) {
      console.log('No company found, creating one...');
      company = await Company.create({
        name: 'Test Company',
        country: 'United States',
        currency: 'USD',
      });
      console.log('✅ Created company:', company.name);
    } else {
      console.log('Found existing company:', company.name);
    }

    const companyId = company._id;

    // Delete old test users
    await User.deleteMany({ email: { $in: ['admin@test.com', 'manager@test.com', 'employee@test.com'] } });
    console.log('Cleaned up old test users\n');

    console.log('Creating users (password will be hashed automatically)...\n');

    // Create Admin - Let the model hash the password
    const admin = new User({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'password123', // Plain text - will be hashed by pre-save hook
      role: 'Admin',
      company: companyId,
    });
    await admin.save();
    console.log('✅ Created Admin: admin@test.com / password123');

    // Create Manager
    const manager = new User({
      name: 'Test Manager',
      email: 'manager@test.com',
      password: 'password123',
      role: 'Manager',
      company: companyId,
      isManagerApprover: true,
    });
    await manager.save();
    console.log('✅ Created Manager: manager@test.com / password123');

    // Create Employee
    const employee = new User({
      name: 'Test Employee',
      email: 'employee@test.com',
      password: 'password123',
      role: 'Employee',
      company: companyId,
      manager: manager._id,
      isManagerApprover: true,
    });
    await employee.save();
    console.log('✅ Created Employee: employee@test.com / password123\n');

    console.log('=== VERIFYING PASSWORDS ===');
    
    // Fetch users again to test password verification
    const testAdmin = await User.findOne({ email: 'admin@test.com' });
    const testManager = await User.findOne({ email: 'manager@test.com' });
    const testEmployee = await User.findOne({ email: 'employee@test.com' });

    const adminMatch = await testAdmin.matchPassword('password123');
    const managerMatch = await testManager.matchPassword('password123');
    const employeeMatch = await testEmployee.matchPassword('password123');

    console.log('Admin password check:', adminMatch ? '✅ WORKS' : '❌ FAILED');
    console.log('Manager password check:', managerMatch ? '✅ WORKS' : '❌ FAILED');
    console.log('Employee password check:', employeeMatch ? '✅ WORKS' : '❌ FAILED');

    if (adminMatch && managerMatch && employeeMatch) {
      console.log('\n🎉 SUCCESS! All accounts are ready to use!\n');
      console.log('LOGIN CREDENTIALS:');
      console.log('─────────────────────────────────────────────');
      console.log('Admin:    admin@test.com / password123');
      console.log('Manager:  manager@test.com / password123');
      console.log('Employee: employee@test.com / password123');
      console.log('─────────────────────────────────────────────\n');
    } else {
      console.log('\n⚠️  WARNING: Password verification failed!');
      console.log('There might be an issue with the User model.\n');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

createTestUsers();
