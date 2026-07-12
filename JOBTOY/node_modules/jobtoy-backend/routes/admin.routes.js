const express = require('express');
const router = express.Router();
const { getStats, getUsers, banUser, deleteJob } = require('../controllers/admin.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

router.use(protect, restrictTo('admin'));

router.get('/stats',          getStats);
router.get('/users',          getUsers);
router.put('/users/:id/ban',  banUser);
router.delete('/jobs/:id',    deleteJob);

module.exports = router;
