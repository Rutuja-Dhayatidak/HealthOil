const mongoose = require('mongoose');

const mobileUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  status: { type: String, default: 'active', enum: ['active', 'suspended'] }
}, { timestamps: true });

module.exports = mongoose.model('MobileUser', mobileUserSchema, 'mobileUser');
