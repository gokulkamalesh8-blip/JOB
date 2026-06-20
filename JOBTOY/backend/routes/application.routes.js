const express = require('express');
const router = express.Router();
const { apply, getMyApplications, getJobApplicants, updateStatus } = require('../controllers/application.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary');

router.post('/',                protect, restrictTo('candidate'), upload.single('resume'), apply);
router.get('/me',               protect, restrictTo('candidate'), getMyApplications);
router.get('/job/:jobId',       protect, restrictTo('employer'),  getJobApplicants);
router.put('/:id/status',       protect, restrictTo('employer'),  updateStatus);

module.exports = router;
