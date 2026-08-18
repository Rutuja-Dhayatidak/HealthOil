const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  id: { type: String, required: true }, // we use id as string to match frontend mapping
  name: { type: String, required: true },
  brand: { type: String, required: true },
  variant: { type: String, required: true }, // Size/Unit
  price: { type: Number, required: true },
  qty: { type: Number, required: true, default: 1 },
  image: { type: String }
});

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'WebsiteUser', required: true, unique: true },
  items: [cartItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema, 'cart');
