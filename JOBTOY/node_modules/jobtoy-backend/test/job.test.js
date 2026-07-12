const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;
let Company;
let Job;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

  app = require('../src/server');
  Company = require('../models/Company.model');
  Job = require('../models/Job.model');
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Job Routes', () => {
  beforeEach(async () => {
    await Company.deleteMany({});
    await Job.deleteMany({});
  });

  test('GET /api/jobs - returns frontend-compatible job results', async () => {
    const company = await Company.create({
      name: 'Acme Careers',
      logo: 'https://example.com/logo.png',
      industry: 'Technology',
      locations: ['Bangalore'],
      isVerified: true,
    });

    await Job.create({
      title: 'React Developer',
      description: 'Build polished hiring workflows with React.',
      company: company._id,
      companyName: company.name,
      location: 'Bangalore',
      jobType: 'Full-time',
      salary: { min: 600000, max: 1200000 },
      experienceRequired: '2-4 Years',
      skills: ['React', 'JavaScript'],
      tags: ['Technology'],
      isActive: true,
    });

    const res = await request(app).get('/api/jobs?keyword=React&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
    expect(res.body.data[0]).toMatchObject({
      title: 'React Developer',
      type: 'full-time',
      company: expect.objectContaining({
        name: 'Acme Careers',
        logoUrl: 'https://example.com/logo.png',
      }),
    });
  });

  test('GET /api/jobs/meta - returns filter metadata for job-board UI', async () => {
    const company = await Company.create({
      name: 'Meta Test Co',
      logo: 'https://example.com/meta.png',
      industry: 'Product',
      activeJobs: 1,
    });

    await Job.create({
      title: 'Product Manager',
      description: 'Own product discovery and delivery.',
      company: company._id,
      location: 'Remote',
      jobType: 'Full-time',
      skills: ['Roadmaps', 'Analytics'],
      isActive: true,
    });

    const res = await request(app).get('/api/jobs/meta');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalJobs).toBe(1);
    expect(res.body.data.locations).toContain('Remote');
    expect(res.body.data.jobTypes).toContain('Full-time');
    expect(res.body.data.skills).toContain('Roadmaps');
    expect(res.body.data.topCompanies[0]).toMatchObject({
      name: 'Meta Test Co',
      logoUrl: 'https://example.com/meta.png',
    });
  });
});
