const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    productId: { type: Number, required: true }, // references Product.id in PostgreSQL
    userId: { type: Number, required: true },     // references User.id in PostgreSQL
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
