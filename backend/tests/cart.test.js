const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/db');

// Integration tests for the shopping cart - add, update, remove, total.
describe('Cart API', () => {
  const testUser = {
    name: 'Cart Tester',
    email: `cart-tester-${Date.now()}@example.com`,
    password: 'Password123!',
  };
  let token;
  let categoryId;
  let productId;

  beforeAll(async () => {
    const registerRes = await request(app).post('/api/auth/register').send(testUser);
    token = registerRes.body.token;

    const category = await prisma.category.create({ data: { name: `Test Category ${Date.now()}` } });
    categoryId = category.id;

    const product = await prisma.product.create({
      data: { name: 'Cart Test Product', description: 'For cart tests', price: 25, stock: 10, categoryId },
    });
    productId = product.id;
  });

  afterAll(async () => {
    await prisma.cartItem.deleteMany({ where: { productId } });
    await prisma.product.delete({ where: { id: productId } });
    await prisma.category.delete({ where: { id: categoryId } });
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  });

  it('rejects cart access without a token', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.statusCode).toBe(401);
  });

  it('starts with an empty cart', async () => {
    const res = await request(app).get('/api/cart').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.items).toHaveLength(0);
    expect(res.body.total).toBe(0);
  });

  it('adds a product to the cart', async () => {
    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId, quantity: 2 });

    expect(res.statusCode).toBe(201);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].quantity).toBe(2);
    expect(res.body.total).toBe(50);
  });

  it('updates the quantity of a cart item', async () => {
    const res = await request(app)
      .put(`/api/cart/${productId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 5 });

    expect(res.statusCode).toBe(200);
    expect(res.body.items[0].quantity).toBe(5);
    expect(res.body.total).toBe(125);
  });

  it('removes a product from the cart', async () => {
    const res = await request(app)
      .delete(`/api/cart/${productId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.items).toHaveLength(0);
    expect(res.body.total).toBe(0);
  });
});
