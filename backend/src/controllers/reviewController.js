const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');

exports.createReview = async (req, res, next) => {
  try {
    const { orderId, restaurantId, rating, comment, images } = req.body;

    const order = await Order.findById(orderId);
    if (!order || order.customer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to review this order' });
    }
    if (order.status !== 'delivered') {
      return res.status(400).json({ success: false, message: 'Can only review delivered orders' });
    }

    const existing = await Review.findOne({ order: orderId });
    if (existing) return res.status(400).json({ success: false, message: 'Order already reviewed' });

    const review = await Review.create({
      order: orderId,
      customer: req.user.id,
      restaurant: restaurantId,
      rating,
      comment,
      images,
    });

    // Update restaurant average rating
    const reviews = await Review.find({ restaurant: restaurantId });
    const avg = reviews.reduce((sum, r) => sum + r.rating.overall, 0) / reviews.length;
    await Restaurant.findByIdAndUpdate(restaurantId, {
      'rating.average': Math.round(avg * 10) / 10,
      'rating.count': reviews.length,
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

exports.getRestaurantReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ restaurant: req.params.restaurantId })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    next(err);
  }
};

exports.respondToReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id).populate('restaurant');
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.restaurant.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    review.restaurantResponse = { message: req.body.message, respondedAt: Date.now() };
    await review.save();
    res.status(200).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};
