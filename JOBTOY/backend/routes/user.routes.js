const express = require('express');
const { body } = require('express-validator');
const handleValidation = require('../middleware/validation');
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User.model');
const SavedJob = require('../models/SavedJob.model');

const router = express.Router();

// GET /api/users/profile
router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/profile
router.put(
  '/profile',
  authMiddleware,
  [
    body('name').optional().trim(),
    body('headline').optional().trim(),
    body('bio').optional().trim(),
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.user._id,
        req.body,
        { new: true, runValidators: true }
      );

      res.json({ success: true, user });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/users/saved-jobs/:jobId
router.post('/saved-jobs/:jobId', authMiddleware, async (req, res, next) => {
  try {
    const savedJob = new SavedJob({
      userId: req.user._id,
      jobId: req.params.jobId,
    });

    await savedJob.save();
    res.status(201).json({ success: true, message: 'Job saved' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Already saved' });
    }
    next(error);
  }
});

// GET /api/users/saved-jobs
router.get('/saved-jobs', authMiddleware, async (req, res, next) => {
  try {
    const savedJobs = await SavedJob.find({
      userId: req.user._id,
    })
      .populate('jobId')
      .sort({ savedAt: -1 });

    res.json({ success: true, savedJobs: savedJobs.map((s) => s.jobId) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;