const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');
const Company = require('../models/Company.model');

router.post('/', protect, restrictTo('employer'), async (req, res, next) => {
  try {
    const company = await Company.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ success: true, data: company });
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.owner) filter.owner = req.query.owner;
    const companies = await Company.find(filter);
    res.json({ success: true, data: companies });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id).populate('owner', 'name email');
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    res.json({ success: true, data: company });
  } catch (err) { next(err); }
});

router.put('/:id', protect, restrictTo('employer'), async (req, res, next) => {
  try {
    const company = await Company.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true }
    );
    res.json({ success: true, data: company });
  } catch (err) { next(err); }
});

module.exports = router;
