const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/db');

// NOTE: these integration tests expect a running test database
// (set DATABASE_URL to a test DB before running `npm test`).

describe('Auth API', () => {
  const testUser = {
    name: 'Jest Tester',
    email: `jest-${Date.now()}@example.com`,
    password: 'Password123!',
  };

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  });

  it('registers a new user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('rejects registration with a duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.statusCode).toBe(400);
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rejects login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'WrongPassword',
    });
    expect(res.statusCode).toBe(401);
  });
});
