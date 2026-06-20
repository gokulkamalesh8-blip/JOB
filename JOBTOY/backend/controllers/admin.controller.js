const User = require('../models/User.model');
const Job = require('../models/Job.model');
const Application = require('../models/Application.model');

exports.getStats = async (req, res, next) => {
  try {
    const [users, jobs, applications] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
    ]);
    res.json({ success: true, data: { users, jobs, applications } });
  } catch (err) { next(err); }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort('-createdAt').select('-password');
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
};

exports.banUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isBanned = !user.isBanned;
    await user.save();
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

exports.deleteJob = async (req, res, next) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Job removed' });
  } catch (err) { next(err); }
};
