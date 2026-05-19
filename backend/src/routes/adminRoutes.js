const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const admin = require('../controllers/adminController');

router.use(protect, authorize('admin'));

router.get('/overview',    admin.getOverview);
router.get('/customers',   admin.getCustomers);
router.get('/restaurants', admin.getRestaurants);
router.get('/riders',      admin.getRiders);

module.exports = router;
