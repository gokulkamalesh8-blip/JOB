const express = require('express');
const { query, param, body } = require('express-validator');
const handleValidation = require('../middleware/validation');
const { authMiddleware, employerOnly } = require('../middleware/auth.middleware');
const jobController = require('../controllers/job.controller');

const router = express.Router();

router.get(
  '/',
  [
    query('keyword').optional().trim(),
    query('q').optional().trim(),
    query('location').optional().trim(),
    query('category').optional().trim(),
    query('type').optional().trim(),
    query('job_type').optional().trim(),
    query('remote').optional().isIn(['true', 'false']),
    query('minSalary').optional().isInt().toInt(),
    query('maxSalary').optional().isInt().toInt(),
    query('salary_min').optional().isInt().toInt(),
    query('salary_max').optional().isInt().toInt(),
    query('minExp').optional().isInt().toInt(),
    query('maxExp').optional().isInt().toInt(),
    query('sort').optional().trim(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  ],
  handleValidation,
  jobController.getJobs
);

router.get('/meta', jobController.getJobMeta);
router.get('/saved', authMiddleware, jobController.getSavedJobs);
router.get('/recommended', authMiddleware, jobController.getRecommendedJobs);

router.get(
  '/:id/candidates/recommended',
  authMiddleware,
  employerOnly,
  [param('id').isMongoId().withMessage('Invalid job id')],
  handleValidation,
  jobController.getRecommendedCandidates
);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid job id')],
  handleValidation,
  jobController.getJob
);

router.post(
  '/',
  authMiddleware,
  employerOnly,
  [
    body('title').trim().notEmpty().withMessage('Job title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('salary.min').optional().isInt().withMessage('Min salary must be a number'),
    body('salary.max').optional().isInt().withMessage('Max salary must be a number'),
  ],
  handleValidation,
  jobController.createJob
);

router.put(
  '/:id',
  authMiddleware,
  employerOnly,
  [param('id').isMongoId().withMessage('Invalid job id')],
  handleValidation,
  jobController.updateJob
);

router.delete(
  '/:id',
  authMiddleware,
  employerOnly,
  [param('id').isMongoId().withMessage('Invalid job id')],
  handleValidation,
  jobController.deleteJob
);

router.post(
  '/:id/save',
  authMiddleware,
  [param('id').isMongoId().withMessage('Invalid job id')],
  handleValidation,
  jobController.saveJob
);

router.delete(
  '/:id/save',
  authMiddleware,
  [param('id').isMongoId().withMessage('Invalid job id')],
  handleValidation,
  jobController.unsaveJob
);

module.exports = router;
