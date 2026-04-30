const Review     = require('../models/Review');
const Restaurant = require('../models/Restaurant');
const Order      = require('../models/Order');

exports.createReview = async (req, res, next) => {
  try {
    const { orderId, restaurantId, rating, comment, images } = req.body;

    const order = await Order.findById(orderId);
    if (!order || (order.customer?.id || order.customer_id) !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized to review this order' });
    if (order.status !== 'delivered')
      return res.status(400).json({ success: false, message: 'Can only review delivered orders' });

    const existing = await Review.findByOrder(orderId);
    if (existing) return res.status(400).json({ success: false, message: 'Order already reviewed' });

    const review = await Review.create({
      order_id: orderId,
      customer_id: req.user.id,
      restaurant_id: restaurantId,
      rating,
      comment,
      images,
    });

    const { avg, count } = await Review.avgForRestaurant(restaurantId);
    await Restaurant.update(restaurantId, { rating: { average: avg, count } });

    res.status(201).json({ success: true, data: review });
  } catch (err) { next(err); }
};

exports.getRestaurantReviews = async (req, res, next) => {
  try {
    const reviews = await Review.findByRestaurant(req.params.restaurantId);
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (err) { next(err); }
};

exports.respondToReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    const updated = await Review.update(req.params.id, {
      restaurant_response: { message: req.body.message, responded_at: new Date().toISOString() },
    });
    res.status(200).json({ success: true, data: updated });
  } catch (err) { next(err); }
};
