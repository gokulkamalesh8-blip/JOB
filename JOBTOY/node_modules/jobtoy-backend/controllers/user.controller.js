const User = require('../models/User.model');
const SavedJob = require('../models/SavedJob.model');
const aiService = require('../services/ai.service');

// Get User Profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// Update User Profile
exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    // Asynchronously upsert to Pinecone
    aiService.upsertCandidate(user).catch(err => console.error('AI upsert failed:', err));

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// Save a Job
exports.saveJob = async (req, res, next) => {
  try {
    const savedJob = new SavedJob({
      userId: req.user._id,
      jobId: req.params.jobId,
    });

    await savedJob.save();
    res.status(201).json({ success: true, message: 'Job saved' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Already saved' });
    }
    next(error);
  }
};

// Get Saved Jobs
exports.getSavedJobs = async (req, res, next) => {
  try {
    const savedJobs = await SavedJob.find({
      userId: req.user._id,
    })
      .populate('jobId')
      .sort({ savedAt: -1 });

    res.json({ success: true, savedJobs: savedJobs.map((s) => s.jobId) });
  } catch (error) {
    next(error);
  }
};

// --- New Features: Resumes & Badges ---

// Upload a new resume
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const user = await User.findById(req.user._id);
    
    // If it's their first resume, make it primary automatically
    const isFirstResume = user.resumes.length === 0;

    user.resumes.push({
      name: req.file.originalname || 'Resume',
      url: req.file.path,
      isPrimary: isFirstResume
    });

    await user.save();

    res.status(201).json({ success: true, resumes: user.resumes });
  } catch (error) {
    next(error);
  }
};

// Set a resume as primary
exports.setPrimaryResume = async (req, res, next) => {
  try {
    const { id } = req.params; // resume subdocument ID
    const user = await User.findById(req.user._id);

    const resumeExists = user.resumes.some(r => r._id.toString() === id);
    if (!resumeExists) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // Set all to false, then target to true
    user.resumes.forEach(r => {
      r.isPrimary = r._id.toString() === id;
    });

    await user.save();

    res.json({ success: true, resumes: user.resumes });
  } catch (error) {
    next(error);
  }
};

// Delete a resume
exports.deleteResume = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    const initialLength = user.resumes.length;
    user.resumes = user.resumes.filter(r => r._id.toString() !== id);

    if (user.resumes.length === initialLength) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // If we deleted the primary resume, make the first available one primary
    if (initialLength > 0 && user.resumes.length > 0 && !user.resumes.some(r => r.isPrimary)) {
      user.resumes[0].isPrimary = true;
    }

    await user.save();

    res.json({ success: true, resumes: user.resumes });
  } catch (error) {
    next(error);
  }
};

// Add a skill badge (Mocked external assessment call)
exports.addSkillBadge = async (req, res, next) => {
  try {
    const { skillName, issuer, score } = req.body;

    if (!skillName || !issuer || score == null) {
      return res.status(400).json({ success: false, message: 'Please provide skillName, issuer, and score' });
    }

    const user = await User.findById(req.user._id);
    
    user.skillBadges.push({
      skillName,
      issuer,
      score,
      dateEarned: new Date()
    });

    await user.save();

    // Asynchronously upsert to Pinecone
    aiService.upsertCandidate(user).catch(err => console.error('AI upsert failed:', err));

    res.status(201).json({ success: true, skillBadges: user.skillBadges });
  } catch (error) {
    next(error);
  }
};
