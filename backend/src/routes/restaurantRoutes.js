const express = require('express');
const router = express.Router();
const {
  getRestaurants, getRestaurant, createRestaurant, updateRestaurant, deleteRestaurant,
  addMenuItem, updateMenuItem, deleteMenuItem,
} = require('../controllers/restaurantController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getRestaurants)
  .post(protect, authorize('restaurant', 'admin'), createRestaurant);

router.route('/:id')
  .get(getRestaurant)
  .put(protect, authorize('restaurant', 'admin'), updateRestaurant)
  .delete(protect, authorize('restaurant', 'admin'), deleteRestaurant);

// Menu routes
router.route('/:id/menu')
  .post(protect, authorize('restaurant', 'admin'), addMenuItem);

router.route('/:id/menu/:itemId')
  .put(protect, authorize('restaurant', 'admin'), updateMenuItem)
  .delete(protect, authorize('restaurant', 'admin'), deleteMenuItem);

module.exports = router;
