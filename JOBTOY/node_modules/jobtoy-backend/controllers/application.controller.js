const Application = require('../models/Application.model');
const Job = require('../models/Job.model');
const User = require('../models/User.model');
const { sendApplicationEmail, sendStatusUpdateEmail } = require('../utils/email.util');

exports.apply = async (req, res, next) => {
  try {
    const { jobId, coverLetter } = req.body;

    // Use uploaded resume OR fall back to profile primary resume
    let resumeUrl = req.file?.path;
    if (!resumeUrl) {
      const user = await User.findById(req.user._id);
      const primaryResume = user?.resumes?.find(r => r.isPrimary);
      resumeUrl = primaryResume?.url;
    }

    if (!resumeUrl) {
      return res.status(400).json({ success: false, message: 'Please upload a resume or set a primary one in your profile first.' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const application = await Application.create({
      jobId,
      candidateId: req.user._id,
      companyId: job.company,
      resumeUrl,
      coverLetter,
    });

    // Increment applicants count
    await Job.findByIdAndUpdate(jobId, { $inc: { applicants: 1 } });

    // Fire email asynchronously
    const employer = await User.findById(job.postedBy);
    if (employer) {
      sendApplicationEmail({
        employerEmail: employer.email,
        candidateName: req.user.name,
        jobTitle:      job.title,
        resumeUrl,
      }).catch(err => console.error('Email send failed:', err));
    }

    res.status(201).json({ success: true, data: application });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ success: false, message: 'You have already applied for this job' });
    next(err);
  }
};

exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ candidateId: req.user._id })
      .populate({ path: 'jobId', select: 'title location type status salary company', populate: { path: 'company', select: 'name logoUrl' } })
      .sort('-createdAt');
    res.json({ success: true, data: applications });
  } catch (err) { next(err); }
};

exports.getJobApplicants = async (req, res, next) => {
  try {
    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('candidateId', 'name email profile resumeUrl')
      .sort('-createdAt');
    res.json({ success: true, data: applications });
  } catch (err) { next(err); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('candidateId', 'name email').populate('jobId', 'title');

    sendStatusUpdateEmail({
      candidateEmail: application.candidateId.email,
      jobTitle:       application.jobId.title,
      status:         application.status,
    }).catch(err => console.error('Email send failed:', err));

    res.json({ success: true, data: application });
  } catch (err) { next(err); }
};
