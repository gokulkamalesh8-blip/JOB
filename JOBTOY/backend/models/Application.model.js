const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    resumeUrl: String,
    useProfileResume: { type: Boolean, default: false },
    profileResumeUrl: String,
    coverLetter: String,
    customResponses: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        response: String,
      },
    ],
    status: {
      type: String,
      enum: [
        'Applied',
        'Under Review',
        'Shortlisted',
        'Interview Scheduled',
        'Offered',
        'Rejected',
        'Withdrawn',
      ],
      default: 'Applied',
    },
    appliedDate: { type: Date, default: Date.now },
    firstReviewedDate: Date,
    shortlistedDate: Date,
    interviewDate: Date,
    offerDate: Date,
    rejectionDate: Date,
    reviewerNotes: String,
    rating: { type: Number, min: 1, max: 5 },
    feedback: String,
    appliedFrom: {
      type: String,
      enum: ['Web', 'Mobile', 'API'],
      default: 'Web',
    },
    ipAddress: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Unique index - one application per user per job
applicationSchema.index(
  { jobId: 1, candidateId: 1 },
  { unique: true }
);
applicationSchema.index({ candidateId: 1, appliedDate: -1 });
applicationSchema.index({ companyId: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);