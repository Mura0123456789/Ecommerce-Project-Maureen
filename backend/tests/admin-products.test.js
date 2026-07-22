const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const prisma = require('../src/config/db');

// Full CRUD lifecycle test using a real Admin account,
// since public registration always creates a CUSTOMER.
describe('Admin Product CRUD', () => {
  const adminEmail = `admin-crud-${Date.now()}@example.com`;
  let adminToken;
  let categoryId;
  let productId;

  beforeAll(async () => {
    const hashed = await bcrypt.hash('AdminPass123!', 10);
    const admin = await prisma.user.create({
      data: { name: 'CRUD Admin', email: adminEmail, password: hashed, role: 'ADMIN' },
    });
    adminToken = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const category = await prisma.category.create({ data: { name: `CRUD Category ${Date.now()}` } });
    categoryId = category.id;
  });

  afterAll(async () => {
    await prisma.product.deleteMany({ where: { categoryId } });
    await prisma.category.deleteMany({ where: { id: categoryId } });
    await prisma.user.deleteMany({ where: { email: adminEmail } });
    await prisma.$disconnect();
  });

  it('creates a product as Admin', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'CRUD Test Product', description: 'Created by test', price: 49.99, stock: 5, categoryId });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('CRUD Test Product');
    productId = res.body.id;
  });

  it('reads the created product by id', async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(productId);
  });

  it('updates the product as Admin', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 39.99 });

    expect(res.statusCode).toBe(200);
    expect(res.body.price).toBe(39.99);
  });

  it('deletes the product as Admin', async () => {
    const res = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
  });

  it('returns 404 for the now-deleted product', async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.statusCode).toBe(404);
  });
});
