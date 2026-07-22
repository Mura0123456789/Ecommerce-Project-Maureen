const Review = require('../models/mongo/Review');
const prisma = require('../config/db');

// GET /api/products/:id/reviews
async function getReviews(req, res) {
  const reviews = await Review.find({ productId: Number(req.params.id) }).sort({ createdAt: -1 });
  res.json(reviews);
}

// POST /api/products/:id/reviews  { rating, comment }
async function createReview(req, res) {
  const productId = Number(req.params.id);
  const { rating, comment } = req.body;

  if (!rating || !comment) return res.status(400).json({ message: 'rating and comment are required' });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const review = await Review.create({
    productId,
    userId: req.user.id,
    userName: req.user.name,
    rating: Number(rating),
    comment,
  });

  res.status(201).json(review);
}

module.exports = { getReviews, createReview };
