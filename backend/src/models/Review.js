const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  order:      { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  customer:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  rating: {
    food:     { type: Number, required: true, min: 1, max: 5 },
    service:  { type: Number, required: true, min: 1, max: 5 },
    delivery: { type: Number, required: true, min: 1, max: 5 },
    overall:  { type: Number, required: true, min: 1, max: 5 },
  },
  comment:           { type: String, maxlength: 500 },
  images:            [String],
  isVerifiedPurchase: { type: Boolean, default: true },
  helpfulCount:      { type: Number, default: 0 },
  restaurantResponse: {
    message:     String,
    respondedAt: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
