const mongoose = require('mongoose');
const Job = require('../models/Job.model');
const Company = require('../models/Company.model');
const SavedJob = require('../models/savedjob.model');
const User = require('../models/User.model');
const aiService = require('../services/ai.service');

const JOB_TYPE_MAP = {
  'full-time': 'Full-time',
  fulltime: 'Full-time',
  'part-time': 'Part-time',
  parttime: 'Part-time',
  contract: 'Contract',
  freelance: 'Freelance',
  internship: 'Internship',
};

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getUserId = (req) => req.user?._id || req.user?.id;

const normalizeJobType = (value) => {
  if (!value) return undefined;
  const key = String(value).toLowerCase().trim();
  return JOB_TYPE_MAP[key] || value;
};

const parseExperience = (value = '') => {
  const numbers = String(value).match(/\d+/g)?.map(Number) || [];
  if (numbers.length === 0) return {};
  if (numbers.length === 1) return { min: numbers[0], max: numbers[0] };
  return { min: numbers[0], max: numbers[1] };
};

const toFrontendJob = (jobDoc) => {
  const job = typeof jobDoc.toObject === 'function' ? jobDoc.toObject() : jobDoc;
  const company = job.company && typeof job.company === 'object'
    ? {
        ...job.company,
        logoUrl: job.company.logoUrl || job.company.logo,
        location: job.company.location || job.company.locations?.[0],
      }
    : job.company;
  const experience = job.experience || parseExperience(job.experienceRequired);

  return {
    ...job,
    company,
    type: String(job.jobType || job.type || '').toLowerCase().replace(/\s+/g, '-'),
    remote: job.remote || /remote/i.test(job.location || ''),
    category: job.category || job.tags?.[0],
    experience,
    applicants: job.applicationsCount || 0,
    createdAt: job.createdAt || job.postedDate,
  };
};

const buildJobFilter = (query) => {
  const {
    keyword,
    q,
    location,
    type,
    job_type,
    remote,
    postedBy,
    category,
    minExp,
    maxExp,
    minSalary,
    maxSalary,
    salary_min,
    salary_max,
  } = query;

  const filter = {};
  if (postedBy) {
    filter.postedBy = postedBy;
  } else {
    filter.isActive = true;
  }

  const searchTerm = keyword || q;
  if (searchTerm) {
    filter.$text = { $search: searchTerm };
  }

  if (location) {
    const safeLocation = escapeRegex(location);
    filter.$or = [
      { location: new RegExp(safeLocation, 'i') },
      { 'company.locations': new RegExp(safeLocation, 'i') },
    ];
  }

  const normalizedType = normalizeJobType(type || job_type);
  if (normalizedType) filter.jobType = normalizedType;
  if (remote === 'true') filter.location = /remote/i;
  if (category) {
    const safeCategory = escapeRegex(category);
    filter.$and = [
      ...(filter.$and || []),
      {
        $or: [
          { tags: new RegExp(safeCategory, 'i') },
          { skills: new RegExp(safeCategory, 'i') },
          { title: new RegExp(safeCategory, 'i') },
        ],
      },
    ];
  }

  const minSalaryValue = minSalary || salary_min;
  const maxSalaryValue = maxSalary || salary_max;
  if (minSalaryValue || maxSalaryValue) {
    filter.$and = filter.$and || [];
    if (minSalaryValue) filter.$and.push({ 'salary.max': { $gte: Number(minSalaryValue) } });
    if (maxSalaryValue) filter.$and.push({ 'salary.min': { $lte: Number(maxSalaryValue) } });
  }

  if (minExp || maxExp) {
    const expClauses = [];
    if (minExp) expClauses.push({ experienceRequired: new RegExp(`${Number(minExp)}|${Number(minExp)}\\+`, 'i') });
    if (maxExp) expClauses.push({ experienceRequired: new RegExp(`${Number(maxExp)}|${Number(maxExp)}\\+`, 'i') });
    if (expClauses.length) filter.$and = [...(filter.$and || []), { $or: expClauses }];
  }

  return filter;
};

exports.getJobs = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
    const skip = (page - 1) * limit;
    const sort = req.query.sort || '-createdAt';
    const filter = buildJobFilter(req.query);

    const [total, jobs] = await Promise.all([
      Job.countDocuments(filter),
      Job.find(filter)
        .populate('company', 'name logo logoUrl location locations industry size website isVerified')
        .sort(sort)
        .skip(skip)
        .limit(limit),
    ]);

    const data = jobs.map(toFrontendJob);

    res.json({
      success: true,
      data,
      jobs: data,
      total,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
      facets: {
        keyword: req.query.keyword || req.query.q || '',
        location: req.query.location || '',
        type: req.query.type || req.query.job_type || '',
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'name logo logoUrl location locations industry size website description isVerified')
      .populate('postedBy', 'name email');

    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    await Job.findByIdAndUpdate(req.params.id, { $inc: { viewsCount: 1 } });

    const similarJobs = await Job.find({
      _id: { $ne: job._id },
      isActive: true,
      $or: [
        { location: job.location },
        { skills: { $in: job.skills || [] } },
        { jobType: job.jobType },
      ],
    })
      .populate('company', 'name logo logoUrl location locations industry')
      .sort('-createdAt')
      .limit(4);

    res.json({
      success: true,
      data: toFrontendJob(job),
      job: toFrontendJob(job),
      similarJobs: similarJobs.map(toFrontendJob),
    });
  } catch (err) {
    next(err);
  }
};

exports.getJobMeta = async (req, res, next) => {
  try {
    const [locations, jobTypes, skills, companies, totalJobs] = await Promise.all([
      Job.distinct('location', { isActive: true }),
      Job.distinct('jobType', { isActive: true }),
      Job.distinct('skills', { isActive: true }),
      Company.find({}).sort({ activeJobs: -1, totalJobs: -1, name: 1 }).limit(12).select('name logo industry activeJobs isVerified'),
      Job.countDocuments({ isActive: true }),
    ]);

    res.json({
      success: true,
      data: {
        totalJobs,
        locations: locations.filter(Boolean).slice(0, 25),
        jobTypes: jobTypes.filter(Boolean),
        skills: skills.filter(Boolean).slice(0, 30),
        topCompanies: companies.map(company => ({
          ...company.toObject(),
          logoUrl: company.logo,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.createJob = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const job = await Job.create({
      ...req.body,
      jobType: normalizeJobType(req.body.jobType || req.body.type),
      postedBy: userId,
      company: req.body.company || req.user.companyId,
    });

    aiService.upsertJob(job).catch(err => console.error('AI upsert failed:', err));

    res.status(201).json({ success: true, data: toFrontendJob(job), job: toFrontendJob(job) });
  } catch (err) {
    next(err);
  }
};

exports.updateJob = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const payload = {
      ...req.body,
      ...(req.body.jobType || req.body.type ? { jobType: normalizeJobType(req.body.jobType || req.body.type) } : {}),
    };
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, postedBy: userId },
      payload,
      { new: true, runValidators: true }
    ).populate('company', 'name logo logoUrl location locations industry size');

    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    aiService.upsertJob(job).catch(err => console.error('AI upsert failed:', err));

    res.json({ success: true, data: toFrontendJob(job), job: toFrontendJob(job) });
  } catch (err) {
    next(err);
  }
};

exports.deleteJob = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, postedBy: userId },
      { isActive: false },
      { new: true }
    );

    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, message: 'Job closed successfully' });
  } catch (err) {
    next(err);
  }
};

exports.saveJob = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const jobId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ success: false, message: 'Invalid job id' });
    }

    const savedJob = await SavedJob.findOneAndUpdate(
      { userId, jobId },
      { userId, jobId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await User.findByIdAndUpdate(userId, { $addToSet: { savedJobs: jobId } });
    res.status(201).json({ success: true, data: savedJob, message: 'Job saved' });
  } catch (err) {
    next(err);
  }
};

exports.unsaveJob = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const jobId = req.params.id;

    await SavedJob.findOneAndDelete({ userId, jobId });
    await User.findByIdAndUpdate(userId, { $pull: { savedJobs: jobId } });
    res.json({ success: true, message: 'Job removed from saved jobs' });
  } catch (err) {
    next(err);
  }
};

exports.getSavedJobs = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const savedJobs = await SavedJob.find({ userId })
      .sort('-savedAt')
      .populate({
        path: 'jobId',
        populate: { path: 'company', select: 'name logo logoUrl location locations industry size isVerified' },
      });

    res.json({
      success: true,
      data: savedJobs.filter(item => item.jobId).map(item => ({
        savedAt: item.savedAt,
        ...toFrontendJob(item.jobId),
      })),
    });
  } catch (err) {
    next(err);
  }
};

exports.getRecommendedJobs = async (req, res, next) => {
  try {
    const jobs = await aiService.matchJobsForCandidate(getUserId(req));
    res.json({ success: true, data: jobs });
  } catch (err) {
    next(err);
  }
};

exports.getRecommendedCandidates = async (req, res, next) => {
  try {
    const candidates = await aiService.matchCandidatesForJob(req.params.id);
    res.json({ success: true, data: candidates });
  } catch (err) {
    next(err);
  }
};
