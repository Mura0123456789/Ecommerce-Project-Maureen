const prisma = require('../config/db');
const ActivityLog = require('../models/mongo/ActivityLog');

// GET /api/products?search=&category=&sort=price_asc|price_desc|name_asc|name_desc&page=1&limit=10
async function getProducts(req, res) {
  const { search, category, sort, page = 1, limit = 10 } = req.query;

  const where = {
    AND: [
      search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }] } : {},
      category ? { category: { name: category } } : {},
    ],
  };

  let orderBy = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  if (sort === 'price_desc') orderBy = { price: 'desc' };
  if (sort === 'name_asc') orderBy = { name: 'asc' };
  if (sort === 'name_desc') orderBy = { name: 'desc' };

  const take = Number(limit);
  const skip = (Number(page) - 1) * take;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take,
      include: { category: true, images: true },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    products,
    pagination: { page: Number(page), limit: take, total, totalPages: Math.ceil(total / take) },
  });
}

// GET /api/products/:id
async function getProductById(req, res) {
  const product = await prisma.product.findUnique({
    where: { id: Number(req.params.id) },
    include: { category: true, images: true },
  });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
}

// POST /api/products (Admin only)
async function createProduct(req, res) {
  const { name, description, price, stock, categoryId } = req.body;
  if (!name || !description || price == null || !categoryId) {
    return res.status(400).json({ message: 'name, description, price, and categoryId are required' });
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price: Number(price),
      stock: Number(stock) || 0,
      categoryId: Number(categoryId),
    },
    include: { category: true, images: true },
  });

  await ActivityLog.create({ userId: req.user.id, action: 'PRODUCT_CREATED', details: { productId: product.id, name } });

  res.status(201).json(product);
}

// PUT /api/products/:id (Admin only)
async function updateProduct(req, res) {
  const id = Number(req.params.id);
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Product not found' });

  const { name, description, price, stock, categoryId } = req.body;

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description && { description }),
      ...(price != null && { price: Number(price) }),
      ...(stock != null && { stock: Number(stock) }),
      ...(categoryId && { categoryId: Number(categoryId) }),
    },
    include: { category: true, images: true },
  });

  await ActivityLog.create({ userId: req.user.id, action: 'PRODUCT_UPDATED', details: { productId: id } });

  res.json(product);
}

// DELETE /api/products/:id (Admin only)
async function deleteProduct(req, res) {
  const id = Number(req.params.id);
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Product not found' });

  await prisma.product.delete({ where: { id } });

  await ActivityLog.create({ userId: req.user.id, action: 'PRODUCT_DELETED', details: { productId: id } });

  res.json({ message: 'Product deleted successfully' });
}

// POST /api/products/:id/images (Admin only)
async function uploadProductImage(req, res) {
  const id = Number(req.params.id);
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return res.status(404).json({ message: 'Product not found' });

  if (!req.file) return res.status(400).json({ message: 'No image file was uploaded' });

  const url = `/uploads/${req.file.filename}`;
  const image = await prisma.productImage.create({ data: { url, productId: id } });

  res.status(201).json(image);
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
};
