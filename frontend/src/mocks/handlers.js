import { rest } from 'msw';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Mock data used across tests so the frontend can be tested
// without a real backend running.
export const mockProducts = [
  {
    id: 1,
    name: 'Aurora Phone X',
    description: 'A sleek flagship smartphone.',
    price: 799.99,
    stock: 25,
    category: { id: 1, name: 'Phones' },
    images: [{ id: 1, url: 'https://placehold.co/400x400?text=Aurora+Phone+X' }],
  },
  {
    id: 2,
    name: 'Nimbus Laptop 14',
    description: 'Lightweight laptop for everyday work.',
    price: 1099.5,
    stock: 15,
    category: { id: 2, name: 'Laptops' },
    images: [{ id: 2, url: 'https://placehold.co/400x400?text=Nimbus+Laptop' }],
  },
];

export const mockCategories = [
  { id: 1, name: 'Phones', _count: { products: 2 } },
  { id: 2, name: 'Laptops', _count: { products: 1 } },
];

export const handlers = [
  rest.get(`${API_URL}/products`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json({
      products: mockProducts,
      pagination: { page: 1, limit: 8, total: mockProducts.length, totalPages: 1 },
    }))
  ),

  rest.get(`${API_URL}/products/:id`, (req, res, ctx) => {
    const product = mockProducts.find((p) => p.id === Number(req.params.id));
    if (!product) return res(ctx.status(404), ctx.json({ message: 'Product not found' }));
    return res(ctx.status(200), ctx.json(product));
  }),

  rest.get(`${API_URL}/products/:id/reviews`, (req, res, ctx) => res(ctx.status(200), ctx.json([]))),

  rest.get(`${API_URL}/categories`, (req, res, ctx) => res(ctx.status(200), ctx.json(mockCategories))),

  rest.get(`${API_URL}/cart`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json({ id: 1, items: [], total: 0 }))
  ),

  rest.post(`${API_URL}/auth/login`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json({
      token: 'fake-jwt-token',
      user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'CUSTOMER' },
    }))
  ),

  rest.post(`${API_URL}/auth/register`, (req, res, ctx) =>
    res(ctx.status(201), ctx.json({
      token: 'fake-jwt-token',
      user: { id: 2, name: 'New User', email: 'new@example.com', role: 'CUSTOMER' },
    }))
  ),
];
