const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');

// Helper: broadcast order event to relevant rooms
const emit = (req, event, payload) => {
  const io = req.app.get('io');
  if (!io) return;
  io.emit(event, payload); // broadcast to everyone (riders + customers)
};

exports.getOrders = async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role === 'customer') query.customer = req.user.id;
    else if (req.user.role === 'rider') query.rider = req.user.id;
    else if (req.user.role === 'restaurant') {
      const restaurant = await Restaurant.findOne({ owner: req.user.id });
      if (restaurant) query.restaurant = restaurant._id;
    }

    const orders = await Order.find(query)
      .populate('customer', 'name phone')
      .populate('restaurant', 'name address contact')
      .populate('rider', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    next(err);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name phone email')
      .populate('restaurant', 'name address contact images')
      .populate('rider', 'name phone');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const isOwner =
      order.customer._id.toString() === req.user.id ||
      (order.rider && order.rider._id.toString() === req.user.id) ||
      req.user.role === 'admin';

    if (!isOwner) return res.status(403).json({ success: false, message: 'Not authorized' });

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    const { restaurantId, items, deliveryAddress, payment, promoCode } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

    // Build items with current prices from menu
    let subtotal = 0;
    const orderItems = items.map((item) => {
      const menuItem = restaurant.menu.id(item.menuItemId);
      if (!menuItem) throw new Error(`Menu item ${item.menuItemId} not found`);
      const itemSubtotal = menuItem.price * item.quantity;
      subtotal += itemSubtotal;
      return {
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions,
        subtotal: itemSubtotal,
      };
    });

    const deliveryFee = restaurant.delivery.fee || 50;
    const platformFee = Math.round(subtotal * (restaurant.pricing.commissionRate / 100));
    const total = subtotal + deliveryFee;

    const order = await Order.create({
      customer: req.user.id,
      restaurant: restaurantId,
      items: orderItems,
      pricing: { subtotal, platformFee, deliveryFee, total },
      deliveryAddress,
      payment,
      promoCode,
      statusHistory: [{ status: 'pending', note: 'Order placed' }],
    });

    restaurant.stats.totalOrders += 1;
    await restaurant.save({ validateBeforeSave: false });

    // Notify all riders of new order
    emit(req, 'new_order', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      restaurantName: restaurant.name,
      restaurantAddress: restaurant.address,
      deliveryAddress: order.deliveryAddress,
      items: order.items,
      pricing: order.pricing,
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status, note });
    order.timing[status.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = Date.now();

    if (status === 'delivered') {
      order.payment.status = 'paid';
      order.payment.paidAt = Date.now();
      const restaurant = await Restaurant.findById(order.restaurant);
      if (restaurant) {
        restaurant.stats.totalRevenue += order.pricing.total;
        await restaurant.save({ validateBeforeSave: false });
      }
    }

    await order.save();

    // Notify customer's tracking page of status change
    emit(req, `order_${order._id}_status`, { status: order.status, riderId: order.rider });

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

exports.acceptOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.rider) return res.status(400).json({ success: false, message: 'Order already taken by another rider' });

    order.rider = req.user.id;
    order.status = 'picked-up';
    order.statusHistory.push({ status: 'picked-up', note: 'Rider accepted and picked up' });
    await order.save();

    emit(req, `order_${order._id}_status`, { status: 'picked-up', riderId: req.user.id });
    // Tell all riders this order is gone
    emit(req, 'order_taken', { orderId: order._id });

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel a ${order.status} order` });
    }

    order.status = 'cancelled';
    order.cancellation = {
      reason: req.body.reason,
      cancelledBy: req.user.role,
      cancelledAt: Date.now(),
    };
    order.statusHistory.push({ status: 'cancelled', note: req.body.reason });
    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};
