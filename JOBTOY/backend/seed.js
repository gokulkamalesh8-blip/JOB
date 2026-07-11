require('dotenv').config();
const dns = require('node:dns');
const mongoose = require('mongoose');
const Company = require('./models/Company.model');
const Job = require('./models/Job.model');
const User = require('./models/User.model');
const logger = require('./config/logger');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const COMPANIES = [
  { name: 'Google India', shortName: 'Google', domain: 'google.com', industry: 'Technology', size: '10K+', locations: ['Bangalore', 'Hyderabad', 'Gurugram'], isVerified: true },
  { name: 'Microsoft India', shortName: 'Microsoft', domain: 'microsoft.com', industry: 'Cloud & Software', size: '15K+', locations: ['Bangalore', 'Hyderabad', 'Noida'], isVerified: true },
  { name: 'Amazon India', shortName: 'Amazon', domain: 'amazon.com', industry: 'E-commerce & Cloud', size: '50K+', locations: ['Bangalore', 'Hyderabad', 'Chennai', 'Mumbai'], isVerified: true },
  { name: 'Tata Consultancy Services', shortName: 'TCS', domain: 'tcs.com', industry: 'IT Services', size: '500K+', locations: ['Mumbai', 'Bangalore', 'Chennai', 'Pune', 'Kolkata'], isVerified: true },
  { name: 'Infosys', shortName: 'Infosys', domain: 'infosys.com', industry: 'IT Services', size: '300K+', locations: ['Bangalore', 'Mysore', 'Pune', 'Chennai'], isVerified: true },
  { name: 'Zoho', shortName: 'Zoho', domain: 'zoho.com', industry: 'SaaS', size: '10K+', locations: ['Chennai', 'Bangalore', 'Remote'], isVerified: true },
  { name: 'Freshworks', shortName: 'Freshworks', domain: 'freshworks.com', industry: 'SaaS', size: '5K+', locations: ['Chennai', 'Bangalore', 'Hyderabad'], isVerified: true },
  { name: 'Razorpay', shortName: 'Razorpay', domain: 'razorpay.com', industry: 'Fintech', size: '3K+', locations: ['Bangalore', 'Mumbai', 'Remote'], isVerified: true },
  { name: 'PhonePe', shortName: 'PhonePe', domain: 'phonepe.com', industry: 'Fintech', size: '8K+', locations: ['Bangalore', 'Pune'], isVerified: true },
  { name: 'Flipkart', shortName: 'Flipkart', domain: 'flipkart.com', industry: 'E-commerce', size: '20K+', locations: ['Bangalore', 'Mumbai', 'Delhi'], isVerified: true },
  { name: 'Swiggy', shortName: 'Swiggy', domain: 'swiggy.com', industry: 'Consumer Tech', size: '6K+', locations: ['Bangalore', 'Mumbai', 'Hyderabad', 'Delhi'], isVerified: true },
  { name: 'Zomato', shortName: 'Zomato', domain: 'zomato.com', industry: 'Consumer Tech', size: '7K+', locations: ['Gurugram', 'Bangalore', 'Mumbai', 'Pune'], isVerified: true },
];

const JOB_ROLES = [
  { title: 'Frontend Developer', category: 'Technology', skills: ['React', 'JavaScript', 'CSS', 'TypeScript'], minSalary: 700000, maxSalary: 1800000, experience: ['1-3 Years', '2-4 Years'] },
  { title: 'Backend Engineer', category: 'Technology', skills: ['Node.js', 'MongoDB', 'APIs', 'System Design'], minSalary: 900000, maxSalary: 2400000, experience: ['2-5 Years', '3-7 Years'] },
  { title: 'Full Stack Developer', category: 'Technology', skills: ['React', 'Node.js', 'MongoDB', 'AWS'], minSalary: 800000, maxSalary: 2200000, experience: ['1-4 Years', '3-6 Years'] },
  { title: 'Data Scientist', category: 'Data & Analytics', skills: ['Python', 'Machine Learning', 'SQL', 'Statistics'], minSalary: 1000000, maxSalary: 2800000, experience: ['2-5 Years', '4-8 Years'] },
  { title: 'Data Analyst', category: 'Data & Analytics', skills: ['SQL', 'Power BI', 'Excel', 'Python'], minSalary: 500000, maxSalary: 1400000, experience: ['0-2 Years', '1-3 Years'] },
  { title: 'Product Manager', category: 'Product', skills: ['Roadmaps', 'Analytics', 'User Research', 'Strategy'], minSalary: 1400000, maxSalary: 3500000, experience: ['3-6 Years', '5-10 Years'] },
  { title: 'UI/UX Designer', category: 'Design', skills: ['Figma', 'Design Systems', 'Prototyping', 'Research'], minSalary: 600000, maxSalary: 1700000, experience: ['1-4 Years', '3-6 Years'] },
  { title: 'DevOps Engineer', category: 'Technology', skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'], minSalary: 1100000, maxSalary: 3000000, experience: ['3-7 Years', '5-10 Years'] },
  { title: 'Digital Marketing Manager', category: 'Marketing', skills: ['SEO', 'Performance Marketing', 'Analytics', 'Content'], minSalary: 700000, maxSalary: 1800000, experience: ['2-5 Years', '4-8 Years'] },
  { title: 'Business Development Executive', category: 'Sales', skills: ['Lead Generation', 'CRM', 'Negotiation', 'SaaS Sales'], minSalary: 400000, maxSalary: 1100000, experience: ['0-2 Years', '1-4 Years'] },
  { title: 'Finance Analyst', category: 'Finance', skills: ['Financial Modeling', 'Excel', 'Forecasting', 'Reporting'], minSalary: 600000, maxSalary: 1600000, experience: ['1-3 Years', '3-6 Years'] },
  { title: 'HR Business Partner', category: 'Human Resources', skills: ['Hiring', 'Employee Engagement', 'HR Ops', 'People Analytics'], minSalary: 700000, maxSalary: 1800000, experience: ['2-5 Years', '5-8 Years'] },
];

const JOB_TYPES = ['Full-time', 'Full-time', 'Full-time', 'Contract', 'Internship'];
const REMOTE_LOCATIONS = ['Remote', 'Hybrid - Bangalore', 'Hybrid - Mumbai', 'Hybrid - Hyderabad'];

const pick = (items) => items[Math.floor(Math.random() * items.length)];
const randomPastDate = (days) => new Date(Date.now() - Math.floor(Math.random() * days) * 24 * 60 * 60 * 1000);
const slugify = (value) => String(value)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const makeDescription = (role, company) => (
  `${company.name} is hiring a ${role.title} to work on high-impact products used by modern teams. ` +
  `You will collaborate with product, design, and engineering stakeholders, own measurable outcomes, ` +
  `and contribute to a strong hiring-quality culture.`
);

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobtoy');
    logger.info('Starting JOBTOY demo data seed...');

    await Promise.all([
      Company.deleteMany({}),
      Job.deleteMany({}),
    ]);

    const employer = await User.findOneAndUpdate(
      { email: 'employer@jobtoy.dev' },
      {
        name: 'Demo Employer',
        email: 'employer@jobtoy.dev',
        password: 'Password@123',
        userType: 'employer',
        isVerified: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const companies = await Company.insertMany(COMPANIES.map(company => ({
      ...company,
      logo: `https://logo.clearbit.com/${company.domain}`,
      website: `https://${company.domain}`,
      description: `${company.name} is a leading ${company.industry} company hiring across India.`,
    })));

    const jobs = [];
    for (const company of companies) {
      const jobsPerCompany = 18 + Math.floor(Math.random() * 14);

      for (let index = 0; index < jobsPerCompany; index += 1) {
        const role = pick(JOB_ROLES);
        const isRemote = Math.random() > 0.72;
        const location = isRemote ? pick(REMOTE_LOCATIONS) : pick(company.locations);
        const salaryBoost = Math.floor(Math.random() * 400000);

        jobs.push({
          title: role.title,
          company: company._id,
          companyName: company.name,
          slug: `${slugify(company.shortName)}-${slugify(role.title)}-${index + 1}`,
          location,
          description: makeDescription(role, company),
          jobType: pick(JOB_TYPES),
          salary: {
            min: role.minSalary + salaryBoost,
            max: role.maxSalary + salaryBoost,
            currency: 'INR',
          },
          experienceRequired: pick(role.experience),
          skills: role.skills,
          qualifications: ['Strong communication skills', 'Ownership mindset', 'Relevant project experience'],
          responsibilities: [
            `Deliver high-quality ${role.category.toLowerCase()} outcomes`,
            'Collaborate with cross-functional teams',
            'Track impact through clear metrics',
          ],
          tags: [role.category, ...role.skills.slice(0, 2)],
          numberOfOpenings: 1 + Math.floor(Math.random() * 5),
          applicationsCount: Math.floor(Math.random() * 240),
          viewsCount: 80 + Math.floor(Math.random() * 2400),
          postedBy: employer._id,
          isActive: true,
          postedDate: randomPastDate(35),
          createdAt: randomPastDate(35),
        });
      }
    }

    await Job.insertMany(jobs);

    const counts = await Job.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$company', activeJobs: { $sum: 1 }, totalJobs: { $sum: 1 } } },
    ]);

    await Promise.all(counts.map(count => Company.findByIdAndUpdate(count._id, {
      activeJobs: count.activeJobs,
      totalJobs: count.totalJobs,
    })));

    logger.info(`Seed complete: ${companies.length} companies and ${jobs.length} jobs created.`);
    logger.info('Demo employer: employer@jobtoy.dev / Password@123');
    process.exit(0);
  } catch (error) {
    logger.error('Seeding error:', error);
    console.error(error);
    process.exit(1);
  }
};

seedDatabase();
