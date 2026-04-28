const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, maxlength: 500 },
  price: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    required: true,
    enum: ['appetizer', 'main-course', 'dessert', 'beverage', 'special'],
  },
  image: { type: String, default: 'https://via.placeholder.com/400x300?text=Food+Item' },
  isAvailable: { type: Boolean, default: true },
  preparationTime: { type: Number, default: 20 },
  dietaryTags: [{
    type: String,
    enum: ['vegan', 'vegetarian', 'gluten-free', 'halal', 'keto', 'dairy-free', 'nut-free'],
  }],
  allergens: [String],
  spiceLevel: {
    type: String,
    enum: ['mild', 'medium', 'hot', 'extra-hot'],
    default: 'mild',
  },
  calories: Number,
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
}, { timestamps: true });

const restaurantSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, maxlength: 1000 },
  cuisine: [{ type: String, required: true }],
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'Pakistan' },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  contact: {
    phone: { type: String, required: true },
    email: { type: String, match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'] },
    website: String,
  },
  images: {
    logo: { type: String, default: 'https://via.placeholder.com/200x200?text=Logo' },
    cover: { type: String, default: 'https://via.placeholder.com/1200x400?text=Cover' },
    gallery: [String],
  },
  menu: [menuItemSchema],
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
  pricing: {
    commissionRate: { type: Number, default: 15, min: 10, max: 20 },
    minimumOrder: { type: Number, default: 100 },
  },
  delivery: {
    isAvailable: { type: Boolean, default: true },
    radius: { type: Number, default: 5 },
    fee: { type: Number, default: 50 },
    estimatedTime: { type: Number, default: 30 },
  },
  openingHours: {
    monday:    { open: String, close: String, isOpen: { type: Boolean, default: true } },
    tuesday:   { open: String, close: String, isOpen: { type: Boolean, default: true } },
    wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    thursday:  { open: String, close: String, isOpen: { type: Boolean, default: true } },
    friday:    { open: String, close: String, isOpen: { type: Boolean, default: true } },
    saturday:  { open: String, close: String, isOpen: { type: Boolean, default: true } },
    sunday:    { open: String, close: String, isOpen: { type: Boolean, default: true } },
  },
  features: {
    hasDelivery: { type: Boolean, default: true },
    hasPickup:   { type: Boolean, default: false },
    hasDineIn:   { type: Boolean, default: false },
    acceptsCash: { type: Boolean, default: true },
    acceptsCard: { type: Boolean, default: true },
  },
  status: {
    isActive:   { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
  },
  stats: {
    totalOrders:  { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    views:        { type: Number, default: 0 },
  },
}, { timestamps: true });

restaurantSchema.index({ 'address.coordinates': '2dsphere' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
