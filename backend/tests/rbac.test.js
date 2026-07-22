const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/db');

// Tests that Customer and Admin roles are actually enforced,
// not just present in the schema.
describe('Role-Based Access Control', () => {
  const customer = {
    name: 'RBAC Customer',
    email: `rbac-customer-${Date.now()}@example.com`,
    password: 'Password123!',
  };
  let customerToken;
  let categoryId;

  beforeAll(async () => {
    const res = await request(app).post('/api/auth/register').send(customer);
    customerToken = res.body.token;

    const category = await prisma.category.create({ data: { name: `RBAC Category ${Date.now()}` } });
    categoryId = category.id;
  });

  afterAll(async () => {
    await prisma.category.deleteMany({ where: { id: categoryId } });
    await prisma.user.deleteMany({ where: { email: customer.email } });
    await prisma.$disconnect();
  });

  it('blocks a Customer from creating a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ name: 'Should Fail', description: 'x', price: 10, categoryId });

    expect(res.statusCode).toBe(403);
  });

  it('blocks a Customer from deleting a product', async () => {
    const res = await request(app)
      .delete('/api/products/1')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(403);
  });

  it('blocks a Customer from viewing store stats', async () => {
    const res = await request(app)
      .get('/api/stats')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(403);
  });

  it('allows a Customer to reach their own profile', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(customer.email);
  });

  it('rejects requests with a malformed token', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', 'Bearer not-a-real-token');

    expect(res.statusCode).toBe(401);
  });
});
