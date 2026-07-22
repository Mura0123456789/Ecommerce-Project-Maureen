const express = require('express');
const { getStoreStats } = require('../controllers/statsController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/roles');

const router = express.Router();

router.get('/', protect, restrictTo('ADMIN'), getStoreStats);

module.exports = router;
