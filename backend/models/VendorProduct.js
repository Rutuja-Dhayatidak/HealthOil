const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  size: { type: String, default: '1' },
  unit: { type: String, default: 'Litre' },
  sku: { type: String, default: '' },
  price: { type: Number, default: 0 },
  mrp: { type: Number, default: 0 },
  initialStock: { type: Number, default: 0 },
  currentStock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 10 }
});

const highlightSchema = new mongoose.Schema({
  text: { type: String, default: '' }
});

const vendorProductSchema = new mongoose.Schema({
  vendor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vendor', 
    required: true 
  },
  
  basicDetails: {
    name: { type: String, required: true },
    brandName: { type: String, default: '' },
    description: { type: String, default: '' },
    highlights: [highlightSchema]
  },

  compliance: {
    oilType: { type: String, default: '' },
    refiningType: { type: String, default: '' },
    extractionMethod: { type: String, default: '' },
    packagingType: { type: String, default: '' },
    isOrganic: { type: Boolean, default: false },
    fssaiLicenseNo: { type: String, default: '' },
    hsnCode: { type: String, default: '' },
    shelfLifeDays: { type: Number, default: 180 }
  },

  nutrition: {
    energy: { type: Number, default: 0 },
    totalFat: { type: Number, default: 0 },
    saturatedFat: { type: Number, default: 0 },
    transFat: { type: Number, default: 0 },
    mufa: { type: Number, default: 0 },
    pufa: { type: Number, default: 0 },
    cholesterol: { type: Number, default: 0 }
  },

  variants: [variantSchema],

  images: {
    mainImage: { type: mongoose.Schema.Types.Mixed },
    gallery: [{ type: mongoose.Schema.Types.Mixed }]
  },

  status: {
    type: String,
    enum: ['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'REJECTED'],
    default: 'PENDING_APPROVAL'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('VendorProduct', vendorProductSchema);
