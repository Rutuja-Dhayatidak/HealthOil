const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Vendor = require('../models/Vendor');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    // We assume the frontend passes delivery details and total amount
    const { amount } = req.body; // Amount in rupees

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay requires amount in paise
      currency: "INR",
      receipt: `rcpt_${userId}_${Date.now()}`
    };

    const order = await razorpayInstance.orders.create(options);
    
    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Razorpay Create Error:', error);
    res.status(500).json({ success: false, message: 'Error creating Razorpay order' });
  }
};

exports.verifyPaymentAndCreateOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      cartItems, 
      deliveryAddress,
      totalAmount 
    } = req.body;

    // Verify Signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Payment is verified. Now create orders per vendor.
    
    let finalDeliveryAddress = deliveryAddress;
    if (typeof deliveryAddress === 'string') {
      const latMatch = deliveryAddress.match(/Lat:\s*([0-9.-]+)/);
      const lngMatch = deliveryAddress.match(/Lng:\s*([0-9.-]+)/);
      finalDeliveryAddress = {
        name: req.user.name || 'Mobile User',
        phone: req.user.phone || 'N/A',
        addressText: deliveryAddress,
        lat: latMatch ? parseFloat(latMatch[1]) : undefined,
        lng: lngMatch ? parseFloat(lngMatch[1]) : undefined,
      };
    } else if (!deliveryAddress || Object.keys(deliveryAddress).length === 0) {
      // Fallback if mobile app doesn't send deliveryAddress or sends it empty
      finalDeliveryAddress = {
        name: req.user.name || 'Mobile User',
        phone: req.user.phone || 'N/A',
        addressText: 'Location provided via App',
        lat: 18.6298, // default Pune lat
        lng: 73.7997  // default Pune lng
      };
    } else if (typeof deliveryAddress === 'object') {
      finalDeliveryAddress = {
        name: deliveryAddress.name || req.user.name || 'Mobile User',
        phone: deliveryAddress.phone || req.user.phone || 'N/A',
        addressText: deliveryAddress.addressText || 'Location provided via App',
        lat: deliveryAddress.lat,
        lng: deliveryAddress.lng
      };
    }

    // Fetch a default vendor ID just in case an item is missing one (Assign to newest vendor)
    const defaultVendor = await Vendor.findOne().sort({ createdAt: -1 });
    const fallbackVendorId = defaultVendor ? defaultVendor._id : null;

    // Group cart items by vendorId
    const vendorGroups = {};
    cartItems.forEach(item => {
      // In cartItems, we should have vendorId from when it was added
      const vId = item.vendorId || item.vendor || fallbackVendorId; 
      
      if (!vId) {
        console.warn('Skipping item with no vendor ID:', item.name);
        return; // skip if really no vendor exists
      }

      if (!vendorGroups[vId]) vendorGroups[vId] = [];
      vendorGroups[vId].push(item);
    });

    const createdOrders = [];

    for (const vId in vendorGroups) {
      const items = vendorGroups[vId];
      const vendorTotal = items.reduce((sum, i) => sum + (i.price * i.qty), 0);
      
      const newOrder = new Order({
        orderId: `#HO-${Math.floor(1000 + Math.random() * 9000)}`,
        user: userId,
        vendor: vId,
        items: items.map(i => ({
          productName: i.name || i.productName,
          productId: i.productId || i.id,
          vendorId: vId,
          price: i.price,
          qty: i.qty,
          image: i.image
        })),
        totalAmount: vendorTotal,
        deliveryAddress: finalDeliveryAddress,
        paymentMethod: 'Online',
        paymentStatus: 'Success',
        status: 'New',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature
      });

      await newOrder.save();
      createdOrders.push(newOrder);

      // Emit socket event to the specific vendor
      const io = req.app.get('io');
      if (io) {
        io.to(vId.toString()).emit('new-order', {
          message: `New order ${newOrder.orderId} received!`,
          order: newOrder
        });
      }
    }

    // Clear user's cart
    await Cart.findOneAndUpdate({ user: userId }, { items: [] });

    res.status(200).json({
      success: true,
      message: 'Payment verified and orders created successfully',
      orders: createdOrders
    });

  } catch (error) {
    console.error('Verify Payment Error:', error);
    require('fs').writeFileSync('verify-payment-error.log', error.stack || error.toString());
    res.status(500).json({ success: false, message: 'Error verifying payment', error: error.toString() });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId })
      .populate('vendor', 'business.storeName')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.error('Get User Orders Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching orders' });
  }
};

exports.trackOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    
    let query = { user: req.user._id };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query.$or = [{ _id: id }, { orderId: id }];
    } else {
      query.orderId = id;
    }

    const order = await Order.findOne(query).populate('vendor', 'business.storeName phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Track Order Error:', error);
    res.status(500).json({ success: false, message: 'Error tracking order' });
  }
};
