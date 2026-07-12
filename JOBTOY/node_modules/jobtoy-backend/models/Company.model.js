const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      unique: true,
      trim: true,
    },
    shortName: String,
    logo: String,
    industry: String,
    size: String,
    locations: [String],
    website: String,
    description: String,
    foundedYear: Number,
    email: String,
    phone: String,
    socialLinks: {
      linkedin: String,
      twitter: String,
      github: String,
    },
    totalJobs: { type: Number, default: 0 },
    activeJobs: { type: Number, default: 0 },
    totalApplications: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    adminNotes: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index for search
companySchema.index({ name: 'text', description: 'text', industry: 1 });

module.exports = mongoose.model('Company', companySchema);