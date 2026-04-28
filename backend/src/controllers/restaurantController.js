const Restaurant = require('../models/Restaurant');

exports.getRestaurants = async (req, res, next) => {
  try {
    const { city, cuisine, minRating, dietary, page = 1, limit = 10 } = req.query;
    const query = { 'status.isActive': true };

    if (city) query['address.city'] = new RegExp(city, 'i');
    if (cuisine) query.cuisine = new RegExp(cuisine, 'i');
    if (minRating) query['rating.average'] = { $gte: parseFloat(minRating) };
    if (dietary) query['menu.dietaryTags'] = dietary;

    const skip = (page - 1) * limit;
    const [restaurants, total] = await Promise.all([
      Restaurant.find(query).select('-menu').skip(skip).limit(Number(limit)).populate('owner', 'name email'),
      Restaurant.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: restaurants.length,
      total,
      pages: Math.ceil(total / limit),
      data: restaurants,
    });
  } catch (err) {
    next(err);
  }
};

exports.getRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate('owner', 'name email phone');
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    restaurant.stats.views += 1;
    await restaurant.save({ validateBeforeSave: false });
    res.status(200).json({ success: true, data: restaurant });
  } catch (err) {
    next(err);
  }
};

exports.createRestaurant = async (req, res, next) => {
  try {
    req.body.owner = req.user.id;
    const existing = await Restaurant.findOne({ owner: req.user.id });
    if (existing && req.user.role !== 'admin') {
      return res.status(400).json({ success: false, message: 'You already have a registered restaurant' });
    }
    const restaurant = await Restaurant.create(req.body);
    res.status(201).json({ success: true, data: restaurant });
  } catch (err) {
    next(err);
  }
};

exports.updateRestaurant = async (req, res, next) => {
  try {
    let restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this restaurant' });
    }
    restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: restaurant });
  } catch (err) {
    next(err);
  }
};

exports.deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await restaurant.deleteOne();
    res.status(200).json({ success: true, message: 'Restaurant deleted' });
  } catch (err) {
    next(err);
  }
};

// Menu operations
exports.addMenuItem = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    restaurant.menu.push(req.body);
    await restaurant.save();
    res.status(201).json({ success: true, data: restaurant.menu[restaurant.menu.length - 1] });
  } catch (err) {
    next(err);
  }
};

exports.updateMenuItem = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    const item = restaurant.menu.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });
    Object.assign(item, req.body);
    await restaurant.save();
    res.status(200).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

exports.deleteMenuItem = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    restaurant.menu.pull({ _id: req.params.itemId });
    await restaurant.save();
    res.status(200).json({ success: true, message: 'Menu item removed' });
  } catch (err) {
    next(err);
  }
};
