const Application = require('../models/Application.model');
const Job = require('../models/Job.model');
const User = require('../models/User.model');
const { sendApplicationEmail, sendStatusUpdateEmail } = require('../utils/email.util');

exports.apply = async (req, res, next) => {
  try {
    const { jobId, coverLetter } = req.body;

    // Use uploaded resume OR fall back to profile resume
    const resumeUrl = req.file?.path || req.user.resumeUrl;

    if (!resumeUrl)
      return res.status(400).json({ success: false, message: 'Please upload a resume or add one to your profile first.' });

    const application = await Application.create({
      job: jobId,
      candidate: req.user._id,
      resumeUrl,
      coverLetter,
    });

    // Increment applicants count
    await Job.findByIdAndUpdate(jobId, { $inc: { applicants: 1 } });

    // Fire email asynchronously
    const job = await Job.findById(jobId);
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
    const applications = await Application.find({ candidate: req.user._id })
      .populate({ path: 'job', select: 'title location type status salary company', populate: { path: 'company', select: 'name logoUrl' } })
      .sort('-createdAt');
    res.json({ success: true, data: applications });
  } catch (err) { next(err); }
};

exports.getJobApplicants = async (req, res, next) => {
  try {
    const applications = await Application.find({ job: req.params.jobId })
      .populate('candidate', 'name email profile resumeUrl')
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
    ).populate('candidate', 'name email').populate('job', 'title');

    sendStatusUpdateEmail({
      candidateEmail: application.candidate.email,
      jobTitle:       application.job.title,
      status:         application.status,
    }).catch(err => console.error('Email send failed:', err));

    res.json({ success: true, data: application });
  } catch (err) { next(err); }
};
