const express = require('express');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const User = require('../models/User.model');
const Job = require('../models/Job.model');
const Company = require('../models/Company.model');
const Application = require('../models/Application.model');
const logger = require('../config/logger');

const router = express.Router();

router.use(authMiddleware, adminOnly);

// Admin Dashboard Stats
router.get('/stats', async (req, res, next) => {
  try {
    const [totalUsers, totalJobs, totalCompanies, totalApplications] =
      await Promise.all([
        User.countDocuments(),
        Job.countDocuments(),
        Company.countDocuments(),
        Application.countDocuments(),
      ]);

    const jobsPostedToday = await Job.countDocuments({
      postedDate: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    });

    const applicationsToday = await Application.countDocuments({
      appliedDate: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    });

    const applicationsByStatus = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalJobs,
        totalCompanies,
        totalApplications,
        jobsPostedToday,
        applicationsToday,
        applicationsByStatus: applicationsByStatus.reduce(
          (acc, item) => {
            acc[item._id] = item.count;
            return acc;
          },
          {}
        ),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get all users
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const users = await User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      users,
      total,
      page,
      limit,
    });
  } catch (error) {
    next(error);
  }
});

// Approve/Reject company
router.put('/companies/:id/approve', async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );

    logger.info(`Company approved: ${company.name}`);

    res.json({
      success: true,
      message: 'Company approved',
      company,
    });
  } catch (error) {
    next(error);
  }
});

// Delete job
router.delete('/jobs/:id', async (req, res, next) => {
  try {
    await Job.findByIdAndDelete(req.params.id);

    logger.info(`Job deleted: ${req.params.id}`);

    res.json({
      success: true,
      message: 'Job deleted',
    });
  } catch (error) {
    next(error);
  }
});

// Get applications
router.get('/applications', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (status) {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate('candidateId', 'name email')
      .populate('jobId', 'title')
      .populate('companyId', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ appliedDate: -1 });

    const total = await Application.countDocuments(filter);

    res.json({
      success: true,
      applications,
      total,
      page,
      limit,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;