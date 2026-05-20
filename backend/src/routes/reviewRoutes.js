const express = require('express');
const router = express.Router();
const { createReview, getRestaurantReviews, getRiderReviews, getMyRiderReviews, respondToReview } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('customer'), createReview);
router.get('/restaurant/:restaurantId', getRestaurantReviews);
router.get('/rider/me',         protect, authorize('rider'), getMyRiderReviews);
router.get('/rider/:riderId',                                getRiderReviews);
router.put('/:id/respond', protect, authorize('restaurant'), respondToReview);

module.exports = router;
