const prisma = require('../config/db');
const Review = require('../models/mongo/Review');
const ActivityLog = require('../models/mongo/ActivityLog');

// GET /api/stats  (Admin only)
async function getStoreStats(req, res) {
  const [userCount, productCount, categoryCount, orderCount, reviewCount, recentActivity] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
    Review.countDocuments(),
    ActivityLog.find().sort({ createdAt: -1 }).limit(10),
  ]);

  res.json({
    users: userCount,
    products: productCount,
    categories: categoryCount,
    orders: orderCount,
    reviews: reviewCount,
    recentActivity,
  });
}

module.exports = { getStoreStats };
