const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} = require('../controllers/productController');
const { getReviews, createReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/roles');
const upload = require('../utils/upload');

const router = express.Router();

// Public
router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/:id/reviews', getReviews);

// Authenticated (any logged-in user)
router.post('/:id/reviews', protect, createReview);

// Admin only
router.post('/', protect, restrictTo('ADMIN'), createProduct);
router.put('/:id', protect, restrictTo('ADMIN'), updateProduct);
router.delete('/:id', protect, restrictTo('ADMIN'), deleteProduct);
router.post('/:id/images', protect, restrictTo('ADMIN'), upload.single('image'), uploadProductImage);

module.exports = router;
