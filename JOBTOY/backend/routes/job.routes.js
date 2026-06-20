const express = require('express');
const { query, param, body } = require('express-validator');
const handleValidation = require('../middleware/validation');
const { authMiddleware, employerOnly } = require('../middleware/auth.middleware');
const Job = require('../models/Job.model');
const logger = require('../config/logger');

const router = express.Router();

// GET /api/jobs
router.get(
  '/',
  [
    query('q').optional().trim(),
    query('location').optional().trim(),
    query('experience').optional().trim(),
    query('salary_min').optional().isInt().toInt(),
    query('salary_max').optional().isInt().toInt(),
    query('job_type').optional().trim(),
    query('sort').optional().default('-postedDate'),
    query('page').optional().isInt().toInt().default(1),
    query('limit').optional().isInt().toInt().default(20),
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const { q, location, experience, salary_min, salary_max, job_type, sort, page, limit } = req.query;

      let filter = { isActive: true };

      if (q) {
        filter.$text = { $search: q };
      }
      if (location) {
        filter.location = location;
      }
      if (experience) {
        filter.experienceRequired = experience;
      }
      if (salary_min || salary_max) {
        filter.$and = [];
        if (salary_min) filter.$and.push({ 'salary.min': { $gte: salary_min } });
        if (salary_max) filter.$and.push({ 'salary.max': { $lte: salary_max } });
      }
      if (job_type) {
        filter.jobType = job_type;
      }

      const skip = (page - 1) * limit;

      const jobs = await Job.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('company', 'name logo industry');

      const total = await Job.countDocuments(filter);

      logger.info(`Jobs fetched: ${jobs.length}/${total}`);

      res.json({
        success: true,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        jobs,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/jobs/:id
router.get('/:id', async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      'company',
      'name logo industry size locations website'
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
        code: 'JOB_NOT_FOUND',
      });
    }

    // Get similar jobs
    const similarJobs = await Job.find({
      _id: { $ne: job._id },
      location: job.location,
      isActive: true,
      $or: [{ skills: { $in: job.skills } }, { title: job.title }],
    })
      .limit(4)
      .select('title companyName location salary');

    // Increment views
    await Job.findByIdAndUpdate(req.params.id, { $inc: { viewsCount: 1 } });

    res.json({
      success: true,
      job,
      similarJobs,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/jobs (Employer only)
router.post(
  '/',
  authMiddleware,
  employerOnly,
  [
    body('title').trim().notEmpty().withMessage('Job title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('salary.min').isInt().withMessage('Min salary must be a number'),
    body('salary.max').isInt().withMessage('Max salary must be a number'),
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const { title, description, location, salary, jobType, skills, experienceRequired } = req.body;

      const job = new Job({
        title,
        description,
        location,
        salary,
        jobType,
        skills,
        experienceRequired,
        company: req.user.companyId,
        postedBy: req.user._id,
      });

      await job.save();

      logger.info(`New job posted: ${job._id}`);

      res.status(201).json({
        success: true,
        message: 'Job posted successfully',
        job,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;