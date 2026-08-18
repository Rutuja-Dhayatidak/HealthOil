const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productId: { type: String, required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true },
  image: { type: String }
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true }, // Custom readable ID like #HO-9840
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'WebsiteUser', required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true }, // Each order is specific to ONE vendor.
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  deliveryAddress: {
    name: String,
    phone: String,
    addressText: String,
    lat: Number,
    lng: Number
  },
  paymentMethod: { type: String, enum: ['Online', 'COD'], default: 'Online' },
  paymentStatus: { type: String, enum: ['Pending', 'Success', 'Failed'], default: 'Pending' },
  status: { type: String, enum: ['New', 'Accepted', 'Preparing', 'Ready for Pickup', 'Picked Up', 'Delivered', 'Cancelled', 'Returned'], default: 'New' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
