const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/couponController');

router.get('/me',       protect, ctrl.getMyCoupons);
router.get('/validate', protect, ctrl.validateCoupon);

module.exports = router;
