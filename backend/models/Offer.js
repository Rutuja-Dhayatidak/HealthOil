const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  discountType: {
    type: String,
    enum: ['PERCENTAGE', 'FLAT', 'BOGO'],
    default: 'PERCENTAGE'
  },
  discountValue: {
    type: Number,
    required: true,
    default: 0
  },
  applicableTo: {
    type: String,
    enum: ['ALL_PRODUCTS', 'SPECIFIC_PRODUCTS'],
    default: 'SPECIFIC_PRODUCTS'
  },
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VendorProduct'
  }],
  minOrderValue: {
    type: Number,
    default: 0
  },
  maxDiscountAmount: {
    type: Number,
    default: null
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number,
    default: null
  },
  usedCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'PAUSED', 'EXPIRED'],
    default: 'ACTIVE'
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Offer', offerSchema);
