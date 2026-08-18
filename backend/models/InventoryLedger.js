const mongoose = require('mongoose');

const inventoryLedgerSchema = new mongoose.Schema({
  vendorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vendor', 
    required: true 
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VendorProduct',
    required: true
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  type: {
    type: String,
    enum: ['MANUAL_ADJUSTMENT', 'RESTOCK', 'ORDER_RESERVE', 'ORDER_FULFILLED'],
    required: true
  },
  delta: {
    type: Number,
    required: true
  },
  before: {
    type: Number,
    required: true
  },
  after: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    default: ''
  },
  actor: {
    type: String,
    default: 'System'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('InventoryLedger', inventoryLedgerSchema);
