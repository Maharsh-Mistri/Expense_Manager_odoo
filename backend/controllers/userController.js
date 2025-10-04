const User = require('../models/User');

// Get all users in company
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ company: req.user.company })
      .select('-password')
      .populate('manager', 'name email role');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create user (Admin only)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, managerId, isManagerApprover } = req.body;

    console.log('\n=== CREATING USER ===');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Role:', role);
    console.log('Manager ID:', managerId);
    console.log('Is Manager Approver:', isManagerApprover);

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide name, email, password, and role' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Handle manager ID - convert empty string to null
    let managerValue = null;
    if (managerId && managerId !== '' && managerId !== 'null' && managerId !== 'undefined') {
      managerValue = managerId;
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      company: req.user.company,
      manager: managerValue,
      isManagerApprover: isManagerApprover || false,
    });

    const userResponse = await User.findById(user._id)
      .select('-password')
      .populate('manager', 'name email role');

    console.log('User created successfully:', user._id);
    console.log('=== END CREATING USER ===\n');

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }

    const { name, role, managerId, isManagerApprover, password } = req.body;

    if (name) user.name = name;
    if (role) user.role = role;
    
    // Handle manager ID - convert empty string to null
    if (managerId !== undefined) {
      if (!managerId || managerId === '' || managerId === 'null' || managerId === 'undefined') {
        user.manager = null;
      } else {
        user.manager = managerId;
      }
    }
    
    if (isManagerApprover !== undefined) user.isManagerApprover = isManagerApprover;
    if (password) user.password = password;

    const updatedUser = await user.save();

    const populatedUser = await User.findById(updatedUser._id)
      .select('-password')
      .populate('manager', 'name email role');

    res.json(populatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this user' });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete yourself' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };
