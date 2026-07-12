const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;
let User;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  process.env.NODE_ENV = 'test';
  
  // Require app and models after setting MONGODB_URI
  app = require('../src/server');
  User = require('../models/User.model');
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Auth Routes', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });


  test('POST /api/auth/register - should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Test@1234',
        userType: 'job_seeker',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  test('POST /api/auth/login - should login a user', async () => {
    await User.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'Test@1234',
      userType: 'job_seeker',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'jane@example.com',
        password: 'Test@1234',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});