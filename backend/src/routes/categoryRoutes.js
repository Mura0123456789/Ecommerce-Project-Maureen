const express = require('express');
const { getCategories, createCategory } = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/roles');

const router = express.Router();

router.get('/', getCategories);
router.post('/', protect, restrictTo('ADMIN'), createCategory);

module.exports = router;
