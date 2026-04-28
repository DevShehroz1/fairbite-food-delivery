const express = require('express');
const router = express.Router();
const { getOrders, getOrder, createOrder, updateOrderStatus, cancelOrder } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getOrders)
  .post(protect, authorize('customer'), createOrder);

router.route('/:id')
  .get(protect, getOrder);

router.put('/:id/status', protect, authorize('restaurant', 'rider', 'admin'), updateOrderStatus);
router.delete('/:id', protect, cancelOrder);

module.exports = router;
