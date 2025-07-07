const User = require('../models/User');
const bcrypt = require('bcryptjs');
const logActivity = require('../utils/logActivity');

// Get all users (excluding super admin)
exports.getAllUsers = async (req, res) => {
  const users = await User.find({ role: { $ne: 'super-admin' } }).select('-password');
  res.json(users);
};

// Create new user (sub-admin or support-agent)
exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!['sub-admin', 'support-agent'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already exists' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role });

  // Log activity: who created this user
  await logActivity(req.user.id, `Created new user: ${email}`);

  res.status(201).json({ message: 'User created', user });
};

// Update user (name, email, role, password)
exports.updateUser = async (req, res) => {
  const { name, email, role, password } = req.body;
  const userId = req.params.id;

  try {
    const emailOwner = await User.findOne({ email });
    if (emailOwner && emailOwner._id.toString() !== userId) {
      return res.status(400).json({ message: 'Email is already used by another user' });
    }

    const updateData = { name, email, role };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    // Log activity
    await logActivity(req.user.id, `Updated user: ${email}`);

    res.json({ message: 'User updated', user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update failed' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await User.findByIdAndDelete(req.params.id);

    // Log deletion activity
    await logActivity(req.user.id, `Deleted user: ${user.email}`);

    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Delete failed' });
  }
};


exports.getUserLogs = async (req, res) => {
  const user = await User.findById(req.params.id).select('name email activityLogs');
  if (!user) return res.status(404).json({ message: 'User not found' });

  res.json({
    name: user.name,
    email: user.email,
    logs: user.activityLogs || []
  });
};

exports.getSupportAgents = async (req, res) => {
  const agents = await User.find({ role: 'support-agent' }).select('name _id');
  res.json(agents);
};
