const Job = require('../models/Job.model');

exports.getJobs = async (req, res, next) => {
  try {
    const {
      keyword, location, type, remote, postedBy,
      category, minExp, maxExp, minSalary, maxSalary,
      page = 1, limit = 20, sort = '-createdAt'
    } = req.query;

    const filter = {};

    if (postedBy) {
      filter.postedBy = postedBy;
    } else {
      filter.status = 'open';
    }

    if (keyword) filter.$text = { $search: keyword };
    if (location) filter.location = new RegExp(location, 'i');
    if (type) filter.type = type;
    if (remote !== undefined) filter.remote = remote === 'true';
    if (category) filter.category = new RegExp(category, 'i');
    if (minExp !== undefined) filter['experience.min'] = { $lte: Number(minExp) };
    if (maxExp !== undefined) filter['experience.max'] = { $gte: Number(maxExp) };
    if (minSalary) filter['salary.min'] = { $gte: Number(minSalary) };
    if (maxSalary) filter['salary.max'] = { $lte: Number(maxSalary) };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Job.countDocuments(filter);

    const jobs = await Job.find(filter)
      .populate('company', 'name logoUrl location industry size')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: jobs,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      }
    });
  } catch (err) { next(err); }
};

exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company')
      .populate('postedBy', 'name email');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, data: job });
  } catch (err) { next(err); }
};

exports.createJob = async (req, res, next) => {
  try {
    const job = await Job.create({ ...req.body, postedBy: req.user._id });
    res.status(201).json({ success: true, data: job });
  } catch (err) { next(err); }
};

exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, postedBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, data: job });
  } catch (err) { next(err); }
};

exports.deleteJob = async (req, res, next) => {
  try {
    await Job.findOneAndDelete({ _id: req.params.id, postedBy: req.user._id });
    res.json({ success: true, message: 'Job deleted' });
  } catch (err) { next(err); }
};
