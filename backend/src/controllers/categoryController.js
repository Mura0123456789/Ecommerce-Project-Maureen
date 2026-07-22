const prisma = require('../config/db');
const ActivityLog = require('../models/mongo/ActivityLog');

async function getCategories(req, res) {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
  });
  res.json(categories);
}

async function createCategory(req, res) {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Category name is required' });

  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) return res.status(400).json({ message: 'Category already exists' });

  const category = await prisma.category.create({ data: { name } });

  await ActivityLog.create({ userId: req.user.id, action: 'CATEGORY_CREATED', details: { categoryId: category.id, name } });

  res.status(201).json(category);
}

module.exports = { getCategories, createCategory };
