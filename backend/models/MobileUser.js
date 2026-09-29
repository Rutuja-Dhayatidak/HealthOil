const mongoose = require('mongoose');

const mobileUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String },
  googleId: { type: String },
  avatar: { type: String },
  status: { type: String, default: 'active', enum: ['active', 'suspended'] }
}, { timestamps: true });

module.exports = mongoose.model('MobileUser', mobileUserSchema, 'mobileUser');

