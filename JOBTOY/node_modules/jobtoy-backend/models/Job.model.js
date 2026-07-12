const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    companyName: String,
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'],
      default: 'Full-time',
    },
    salary: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'INR' },
    },
    experienceRequired: String,
    skills: [String],
    qualifications: [String],
    responsibilities: [String],
    numberOfOpenings: { type: Number, default: 1 },
    deadline: Date,
    screeningQuestions: [
      {
        question: String,
        type: String,
      },
    ],
    isActive: { type: Boolean, default: true },
    applicationsCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    postedBy: mongoose.Schema.Types.ObjectId,
    postedDate: { type: Date, default: Date.now },
    slug: { type: String, unique: true },
    tags: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Text search index
jobSchema.index({ title: 'text', description: 'text', skills: 'text' });
jobSchema.index({ company: 1, isActive: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ postedDate: -1 });

module.exports = mongoose.model('Job', jobSchema);
