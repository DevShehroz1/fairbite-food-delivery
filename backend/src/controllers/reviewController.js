const Review = require('../models/Review');
const Order  = require('../models/Order');

// Reviews are now about the rider's delivery, not the restaurant. We still
// persist restaurant_id in the row for historical context (the order it
// came from belongs to a restaurant), but the rider is what's being rated
// and what aggregations roll up.
exports.createReview = async (req, res, next) => {
  try {
    const { orderId, rating, comment, images } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const customerId   = order.customer?.id   || order.customer?._id   || order.customer_id;
    const riderId      = order.rider?.id      || order.rider?._id      || order.rider_id;
    const restaurantId = order.restaurant?.id || order.restaurant?._id || order.restaurant_id;

    if (customerId !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized to review this order' });
    if (order.status !== 'delivered')
      return res.status(400).json({ success: false, message: 'Can only review delivered orders' });
    if (!riderId)
      return res.status(400).json({ success: false, message: 'This order has no assigned rider to review yet' });

    const existing = await Review.findByOrder(orderId);
    if (existing) return res.status(400).json({ success: false, message: 'Order already reviewed' });

    const review = await Review.create({
      order_id:      orderId,
      customer_id:   req.user.id,
      restaurant_id: restaurantId || null,
      rider_id:      riderId,
      rating,
      comment,
      images,
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) { next(err); }
};

exports.getRestaurantReviews = async (req, res, next) => {
  try {
    const reviews = await Review.findByRestaurant(req.params.restaurantId);
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (err) { next(err); }
};

exports.getRiderReviews = async (req, res, next) => {
  try {
    const reviews = await Review.findByRider(req.params.riderId);
    const { avg, count } = await Review.avgForRider(req.params.riderId);
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
      summary: { average: avg, count },
    });
  } catch (err) { next(err); }
};

// Convenience for a rider to fetch their own reviews without knowing their id.
exports.getMyRiderReviews = async (req, res, next) => {
  try {
    const reviews = await Review.findByRider(req.user.id);
    const { avg, count } = await Review.avgForRider(req.user.id);
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
      summary: { average: avg, count },
    });
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
