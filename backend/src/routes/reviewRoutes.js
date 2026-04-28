const express = require('express');
const router = express.Router();
const { createReview, getRestaurantReviews, respondToReview } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('customer'), createReview);
router.get('/restaurant/:restaurantId', getRestaurantReviews);
router.put('/:id/respond', protect, authorize('restaurant'), respondToReview);

module.exports = router;
