const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, required: true },
  customer:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  rider:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    menuItemId: mongoose.Schema.Types.ObjectId,
    name:   String,
    price:  Number,
    quantity: { type: Number, required: true, min: 1 },
    specialInstructions: String,
    subtotal: Number,
  }],
  pricing: {
    subtotal:    { type: Number, required: true },
    platformFee: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 50 },
    tax:         { type: Number, default: 0 },
    discount:    { type: Number, default: 0 },
    total:       { type: Number, required: true },
  },
  deliveryAddress: {
    street: { type: String, required: true },
    city:   { type: String, required: true },
    zipCode: String,
    coordinates: { lat: Number, lng: Number },
    instructions: String,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready-for-pickup', 'picked-up', 'on-the-way', 'delivered', 'cancelled'],
    default: 'pending',
  },
  statusHistory: [{
    status:    String,
    timestamp: { type: Date, default: Date.now },
    note:      String,
  }],
  payment: {
    method: { type: String, enum: ['cash', 'card', 'wallet'], required: true },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    transactionId: String,
    paidAt: Date,
  },
  promoCode: { code: String, discount: Number },
  timing: {
    ordered:          { type: Date, default: Date.now },
    confirmed:        Date,
    preparing:        Date,
    readyForPickup:   Date,
    pickedUp:         Date,
    onTheWay:         Date,
    delivered:        Date,
    estimatedDelivery: Date,
  },
  rating: {
    food:     { type: Number, min: 1, max: 5 },
    delivery: { type: Number, min: 1, max: 5 },
    overall:  { type: Number, min: 1, max: 5 },
    review:   String,
    reviewedAt: Date,
  },
  cancellation: {
    reason: String,
    cancelledBy: { type: String, enum: ['customer', 'restaurant', 'rider', 'admin'] },
    cancelledAt: Date,
  },
}, { timestamps: true });

orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const date = new Date();
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `FB${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${random}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
