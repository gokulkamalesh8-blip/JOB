const express = require('express');
const { body } = require('express-validator');
const handleValidation = require('../middleware/validation');
const { authMiddleware, restrictTo } = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// GET /api/users/profile
router.get('/profile', authMiddleware, userController.getProfile);

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
  userController.updateProfile
);

// POST /api/users/saved-jobs/:jobId
router.post('/saved-jobs/:jobId', authMiddleware, userController.saveJob);

// GET /api/users/saved-jobs
router.get('/saved-jobs', authMiddleware, userController.getSavedJobs);

// --- New Features: Resumes & Badges ---

// POST /api/users/resumes (Upload a new resume)
router.post('/resumes', authMiddleware, upload.single('resume'), userController.uploadResume);

// PUT /api/users/resumes/:id/primary (Set a resume as primary)
router.put('/resumes/:id/primary', authMiddleware, userController.setPrimaryResume);

// DELETE /api/users/resumes/:id (Delete a resume)
router.delete('/resumes/:id', authMiddleware, userController.deleteResume);

// POST /api/users/badges (Add a skill badge - restricted to job_seekers)
router.post('/badges', authMiddleware, restrictTo('job_seeker'), userController.addSkillBadge);

module.exports = router;