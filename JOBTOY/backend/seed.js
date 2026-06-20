require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User.model');
const Company = require('./models/Company.model');
const Job = require('./models/Job.model');
const logger = require('./config/logger');

const COMPANIES = [
  { name: 'Tata Consultancy Services', shortName: 'TCS', logo: 'https://cdn.jobtoy.com/logos/tcs.png', industry: 'IT Services', size: '500K+', locations: ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai'] },
  { name: 'Google India', shortName: 'Google', logo: 'https://cdn.jobtoy.com/logos/google.png', industry: 'Tech', size: '10K+', locations: ['Bangalore', 'Hyderabad', 'Mumbai'] },
  { name: 'Microsoft India', shortName: 'Microsoft', logo: 'https://cdn.jobtoy.com/logos/microsoft.png', industry: 'Tech', size: '15K+', locations: ['Bangalore', 'Hyderabad', 'Pune'] },
  { name: 'Amazon India', shortName: 'Amazon', logo: 'https://cdn.jobtoy.com/logos/amazon.png', industry: 'E-commerce', size: '50K+', locations: ['Bangalore', 'Hyderabad', 'Delhi', 'Mumbai'] },
  { name: 'Swiggy', shortName: 'Swiggy', logo: 'https://cdn.jobtoy.com/logos/swiggy.png', industry: 'Food Tech', size: '5K+', locations: ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad'] },
  { name: 'Zomato', shortName: 'Zomato', logo: 'https://cdn.jobtoy.com/logos/zomato.png', industry: 'Food Tech', size: '6K+', locations: ['Bangalore', 'Mumbai', 'Delhi', 'Pune'] },
  // Add more companies...
];

const JOB_ROLES = [
  { title: 'Software Engineer', keywords: ['coding', 'development', 'backend', 'fullstack'], minSalary: 600000, maxSalary: 2000000 },
  { title: 'Senior Software Engineer', keywords: ['coding', 'development', 'leadership', 'architecture'], minSalary: 1500000, maxSalary: 4000000 },
  { title: 'Frontend Developer', keywords: ['react', 'vue', 'angular', 'javascript', 'css'], minSalary: 600000, maxSalary: 1800000 },
  { title: 'Data Scientist', keywords: ['machine learning', 'python', 'data analysis', 'ml'], minSalary: 900000, maxSalary: 2500000 },
  { title: 'Product Manager', keywords: ['product strategy', 'roadmap', 'analytics'], minSalary: 1200000, maxSalary: 3000000 },
  // Add more roles...
];

const CITIES = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Remote'];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobtoy');
    logger.info('📦 JOBTOY — Starting Database Seeding...\n');

    // Clear existing data
    await Company.deleteMany({});
    await Job.deleteMany({});
    logger.info('🗑️  Cleared existing data');

    // Create companies
    logger.info('🏢 Creating companies...');
    const companies = await Company.insertMany(
      COMPANIES.map((c) => ({
        ...c,
        description: `${c.name} is a leading company in the ${c.industry} sector.`,
        website: `https://${c.shortName.toLowerCase()}.com`,
      }))
    );
    logger.info(`✅ Created ${companies.length} companies\n`);

    // Create jobs
    logger.info('💼 Creating 5,000+ jobs...');
    const jobs = [];
    let jobCount = 0;

    for (const company of companies) {
      const jobsPerCompany = Math.floor(Math.random() * 70) + 80;

      for (let i = 0; i < jobsPerCompany; i++) {
        const role = JOB_ROLES[Math.floor(Math.random() * JOB_ROLES.length)];
        const city = company.locations[Math.floor(Math.random() * company.locations.length)];

        jobs.push({
          title: role.title,
          company: company._id,
          companyName: company.name,
          location: city,
          description: `We are looking for a talented ${role.title}...`,
          salary: {
            min: role.minSalary,
            max: role.maxSalary,
          },
          experienceRequired: ['0-1 years', '1-3 years', '3-7 years', '7-15 years'][Math.floor(Math.random() * 4)],
          jobType: ['Full-time', 'Contract', 'Part-time'][Math.floor(Math.random() * 3)],
          skills: role.keywords.slice(0, 5),
          isActive: true,
          postedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        });

        jobCount++;
        if (jobCount % 500 === 0) logger.info(`  → Generated ${jobCount} jobs...`);
      }
    }

    await Job.insertMany(jobs);
    logger.info(`✅ Created ${jobCount} jobs\n`);

    logger.info('✅ JOBTOY Database Seeding Complete!');
    logger.info(`📊 Statistics:`);
    logger.info(`   Companies: ${companies.length}`);
    logger.info(`   Jobs: ${jobCount}`);
    logger.info(`   Average jobs/company: ${Math.floor(jobCount / companies.length)}\n`);

    process.exit(0);
  } catch (error) {
    logger.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();