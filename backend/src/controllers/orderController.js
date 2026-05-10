const Order      = require('../models/Order');
const Restaurant = require('../models/Restaurant');

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
    const { restaurantId, items, deliveryAddress, payment } = req.body;

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
    const total       = subtotal + deliveryFee;

    const order = await Order.create({
      customer_id:     req.user.id,
      restaurant_id:   restaurantId,
      items:           orderItems,
      pricing:         { subtotal, platformFee, deliveryFee, total },
      deliveryAddress,
      payment:         payment || { method: 'cash', status: 'pending' },
    });

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

    // Notify the customer watching this order
    emit(req, `order_${order.id}`, `order_${order.id}_status`, { status: order.status });

    // Auto-assign a rider when restaurant marks order as ready
    if (status === 'ready' || status === 'ready-for-pickup') {
      const io          = req.app.get('io');
      const onlineRiders = req.app.get('onlineRiders') || new Map();
      const onlineIds   = [...onlineRiders.keys()];

      const riderId = await Order.findAvailableRider(onlineIds);
      if (riderId) {
        order = await Order.acceptOrder(order.id, riderId);

        // Tell the rider they have been assigned an order
        emit(req, `rider_${riderId}`, 'order_assigned', {
          orderId:     order.id,
          orderNumber: order.orderNumber,
          restaurant:  order.restaurant,
          deliveryAddress: order.deliveryAddress,
          pricing:     order.pricing,
          items:       order.items,
        });

        // Update customer with rider assignment
        emit(req, `order_${order.id}`, `order_${order.id}_status`, {
          status: order.status,
          rider:  order.rider,
        });
      }
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
