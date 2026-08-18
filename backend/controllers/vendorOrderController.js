const Order = require('../models/Order');

exports.getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user.id;
    console.log(`[getVendorOrders] Fetching orders for vendor: ${vendorId}`);
    
    const orders = await Order.find({ vendor: vendorId })
      .populate('user', 'name phone email')
      .sort({ createdAt: -1 });
    
    console.log(`[getVendorOrders] Found ${orders.length} orders for vendor: ${vendorId}`);
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Get Vendor Orders Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching orders' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    // valid statuses
    const validStatuses = ['New', 'Accepted', 'Preparing', 'Ready for Pickup', 'Picked Up', 'Delivered', 'Cancelled', 'Returned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findOneAndUpdate(
      { orderId: orderId, vendor: req.user.id },
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or unauthorized' });
    }

    res.status(200).json({ success: true, message: 'Status updated', order });
  } catch (error) {
    console.error('Update Order Status Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating status' });
  }
};
