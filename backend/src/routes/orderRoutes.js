const express = require('express');
const router = express.Router();
const { getOrders, getOrder, createOrder, updateOrderStatus, cancelOrder, getAvailableOrders, wipeAll } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.get('/available', protect, authorize('rider'), getAvailableOrders);
router.get('/restaurant', protect, authorize('restaurant', 'admin'), getOrders);

// Demo data reset — wipes EVERY order + review in the database. Admin only.
router.delete('/wipe-demo', protect, authorize('admin'), wipeAll);

router.route('/')
  .get(protect, getOrders)
  .post(protect, authorize('customer'), createOrder);

router.route('/:id')
  .get(protect, getOrder);

router.put('/:id/status', protect, authorize('restaurant', 'rider', 'admin'), updateOrderStatus);
router.put('/:id/accept', protect, authorize('rider'), require('../controllers/orderController').acceptOrder);
router.delete('/:id', protect, cancelOrder);

module.exports = router;
