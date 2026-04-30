const Restaurant = require('../models/Restaurant');

exports.getRestaurants = async (req, res, next) => {
  try {
    const { city, cuisine, minRating } = req.query;
    const restaurants = await Restaurant.findAll({ city, cuisine, minRating });
    res.status(200).json({ success: true, count: restaurants.length, data: restaurants });
  } catch (err) { next(err); }
};

exports.getRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    await Restaurant.incrementViews(restaurant.id, restaurant.stats);
    res.status(200).json({ success: true, data: restaurant });
  } catch (err) { next(err); }
};

exports.createRestaurant = async (req, res, next) => {
  try {
    const existing = await Restaurant.findByOwner(req.user.id);
    if (existing && req.user.role !== 'admin')
      return res.status(400).json({ success: false, message: 'You already have a registered restaurant' });

    const { name, description, cuisine, address, contact, images, pricing, delivery } = req.body;
    const restaurant = await Restaurant.create({
      owner_id: req.user.id,
      name, description,
      cuisine: Array.isArray(cuisine) ? cuisine : [cuisine],
      address:  address  || {},
      contact:  contact  || {},
      images:   images   || {},
      pricing:  pricing  || { commissionRate: 15, minimumOrder: 100 },
      delivery: delivery || { fee: 50, estimatedTime: 30, isAvailable: true },
    });
    res.status(201).json({ success: true, data: restaurant });
  } catch (err) { next(err); }
};

exports.updateRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    if (restaurant.owner_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });
    const updated = await Restaurant.update(req.params.id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (err) { next(err); }
};

exports.deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    if (restaurant.owner_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });
    await Restaurant.deleteById(req.params.id);
    res.status(200).json({ success: true, message: 'Restaurant deleted' });
  } catch (err) { next(err); }
};

// ── Menu operations ────────────────────────────────────────────────────────────
exports.addMenuItem = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    if (restaurant.owner_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const newItem = { ...req.body, id: require('crypto').randomUUID(), _id: undefined };
    newItem._id = newItem.id;
    const updatedMenu = [...(restaurant.menu || []), newItem];
    await Restaurant.update(req.params.id, { menu: updatedMenu });
    res.status(201).json({ success: true, data: newItem });
  } catch (err) { next(err); }
};

exports.updateMenuItem = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    const menu = (restaurant.menu || []).map(item =>
      (item.id || item._id) === req.params.itemId ? { ...item, ...req.body } : item
    );
    await Restaurant.update(req.params.id, { menu });
    res.status(200).json({ success: true, data: menu.find(i => (i.id || i._id) === req.params.itemId) });
  } catch (err) { next(err); }
};

exports.deleteMenuItem = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    const menu = (restaurant.menu || []).filter(item => (item.id || item._id) !== req.params.itemId);
    await Restaurant.update(req.params.id, { menu });
    res.status(200).json({ success: true, message: 'Menu item removed' });
  } catch (err) { next(err); }
};
