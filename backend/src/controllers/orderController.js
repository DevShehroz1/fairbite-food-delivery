const Order      = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const Message    = require('../models/Message');
const referralCtrl = require('./referralController');
const couponCtrl   = require('./couponController');

const emit = (req, target, event, payload) => {
  const io = req.app.get('io');
  if (io) io.to(target).emit(event, payload);
};

exports.getAvailableOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAvailable();
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (err) { next(err); }
};

exports.getOrders = async (req, res, next) => {
  try {
    let restaurantId = null;
    if (req.user.role === 'restaurant') {
      const r = await Restaurant.findByOwner(req.user.id);
      restaurantId = r?.id;
    }
    const orders = await Order.findByUser({ role: req.user.role, userId: req.user.id, restaurantId });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (err) { next(err); }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const isOwner =
      order.customer?.id === req.user.id ||
      order.customer?._id === req.user.id ||
      order.rider?.id === req.user.id ||
      req.user.role === 'admin' ||
      req.user.role === 'restaurant';

    if (!isOwner) return res.status(403).json({ success: false, message: 'Not authorized' });
    res.status(200).json({ success: true, data: order });
  } catch (err) { next(err); }
};

exports.createOrder = async (req, res, next) => {
  try {
    const { restaurantId, items, deliveryAddress, payment, couponCode } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

    let subtotal = 0;
    const orderItems = items.map((item) => {
      const menuItem = (restaurant.menu || []).find(
        m => (m.id || m._id) === item.menuItemId || m._id === item.menuItemId
      );
      if (!menuItem) throw new Error(`Menu item not found: ${item.menuItemId}`);
      const lineTotal = menuItem.price * item.quantity;
      subtotal += lineTotal;
      return {
        menuItemId: menuItem.id || menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        subtotal: lineTotal,
      };
    });

    const deliveryFee = restaurant.delivery?.fee || 50;
    const platformFee = Math.round(subtotal * ((restaurant.pricing?.commissionRate || 15) / 100));

    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      try {
        const result = await couponCtrl.applyCouponToOrder({
          userId: req.user.id, code: couponCode, subtotal, deliveryFee,
        });
        discount = result.discount;
        appliedCoupon = { code: result.coupon.code, label: result.coupon.label, discount };
      } catch (e) {
        return res.status(400).json({ success: false, message: e.message });
      }
    }
    const total = Math.max(0, subtotal + deliveryFee - discount);

    const order = await Order.create({
      customer_id:     req.user.id,
      restaurant_id:   restaurantId,
      items:           orderItems,
      pricing:         { subtotal, platformFee, deliveryFee, discount, total, coupon: appliedCoupon },
      deliveryAddress,
      payment:         payment || { method: 'cash', status: 'pending' },
    });

    if (appliedCoupon) {
      try { await couponCtrl.redeemCoupon({ userId: req.user.id, code: appliedCoupon.code }); }
      catch (e) { console.error('Coupon redeem failed:', e.message); }
    }

    // Notify restaurant in real-time
    emit(req, `restaurant_${restaurantId}`, 'new_order', {
      orderId:      order.id,
      orderNumber:  order.orderNumber,
      items:        order.items,
      pricing:      order.pricing,
      deliveryAddress: order.deliveryAddress,
      customer:     { name: req.user.name },
    });

    // Also broadcast to all riders pool so they can see it (optional fallback)
    emit(req, 'riders', 'new_order', { orderId: order.id });

    res.status(201).json({ success: true, data: order });
  } catch (err) { next(err); }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    let order = await Order.updateStatus(req.params.id, status, note);

    // Credit referral rewards on the referee's first delivered order (best-effort)
    if (status === 'delivered' && order.customer?.id) {
      try { await referralCtrl.creditReferralOnFirstOrder({ refereeId: order.customer.id }); }
      catch (e) { console.error('Referral credit failed:', e.message); }

      // Milestone coupons — count how many of this customer's orders are delivered
      try {
        const all = await Order.findByUser({ role: 'customer', userId: order.customer.id });
        const deliveredCount = all.filter(o => o.status === 'delivered').length;
        await couponCtrl.grantMilestoneOnDelivery({ userId: order.customer.id, deliveredCount });
      } catch (e) { console.error('Milestone grant failed:', e.message); }
    }

    // Notify the customer watching this order
    emit(req, `order_${order.id}`, `order_${order.id}_status`, { status: order.status });

    // When the restaurant marks the order ready, broadcast it to the
    // riders pool so EVERY logged-in rider sees it in their Available
    // Orders list and can tap Accept to claim it. The previous
    // auto-assignment logic silently picked any rider in the DB which
    // meant a non-current rider account (e.g. rider@demo.com from the
    // seed) often grabbed the order and the actively-logged-in rider
    // never saw it. With the pool model the customer's progress bar
    // still flips to "Rider Assigned" because that step is gated on
    // status='ready', and once a rider taps Accept the customer's
    // rider info populates on the next poll.
    if (status === 'ready' || status === 'ready-for-pickup') {
      emit(req, 'riders', 'new_order', {
        orderId:         order.id,
        orderNumber:     order.orderNumber,
        restaurant:      order.restaurant,
        deliveryAddress: order.deliveryAddress,
        pricing:         order.pricing,
        items:           order.items,
      });
    }

    res.status(200).json({ success: true, data: order });
  } catch (err) { next(err); }
};

exports.acceptOrder = async (req, res, next) => {
  try {
    const order = await Order.acceptOrder(req.params.id, req.user.id);
    emit(req, `order_${order.id}`, `order_${order.id}_status`, { status: order.status, riderId: req.user.id });
    emit(req, 'order_taken', 'order_taken', { orderId: order.id });
    res.status(200).json({ success: true, data: order });
  } catch (err) { next(err); }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.updateStatus(req.params.id, 'cancelled', req.body.reason || 'Cancelled by user');
    emit(req, `order_${order.id}`, `order_${order.id}_status`, { status: 'cancelled' });
    res.status(200).json({ success: true, data: order });
  } catch (err) { next(err); }
};

// Demo reset — wipes every order + review in the database. Behind admin
// auth so a regular customer can't trigger it. Use this to clear the
// fixture data before a live demo.
exports.wipeAll = async (req, res, next) => {
  try {
    const removed = await Order.deleteAll();
    res.status(200).json({ success: true, message: `Wiped ${removed} orders + all reviews.` });
  } catch (err) { next(err); }
};

// Both customer (the one who placed it) and rider (the one who took it)
// can read + post to an order's chat thread. The restaurant owner is
// also allowed in case they want to pass instructions later.
const isOrderParticipant = (order, user) => {
  if (!order || !user) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'restaurant') return true; // restaurant scope covered by their dashboard's order list
  return (
    order.customer?.id === user.id ||
    order.customer?._id === user.id ||
    order.rider?.id === user.id ||
    order.rider?._id === user.id
  );
};

exports.listMessages = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!isOrderParticipant(order, req.user)) return res.status(403).json({ success: false, message: 'Not authorized' });
    const messages = await Message.listForOrder(req.params.id);
    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (err) { next(err); }
};

exports.postMessage = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!isOrderParticipant(order, req.user)) return res.status(403).json({ success: false, message: 'Not authorized' });
    const text = (req.body.text || '').toString().trim();
    if (!text) return res.status(400).json({ success: false, message: 'Empty message' });
    const message = await Message.create({
      orderId:    req.params.id,
      senderId:   req.user.id,
      senderRole: req.user.role,
      text,
    });
    res.status(201).json({ success: true, data: message });
  } catch (err) { next(err); }
};
