const request = require('supertest');
const app = require('../src/app');

// Basic public-endpoint integration test - no auth required.
describe('Product API', () => {
  it('returns a paginated list of products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it('returns 404 for a product that does not exist', async () => {
    const res = await request(app).get('/api/products/999999');
    expect(res.statusCode).toBe(404);
  });

  it('rejects creating a product without authentication', async () => {
    const res = await request(app).post('/api/products').send({
      name: 'Unauthorized Product',
      description: 'Should not be created',
      price: 10,
      categoryId: 1,
    });
    expect(res.statusCode).toBe(401);
  });
});
