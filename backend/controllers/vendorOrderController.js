const Order = require('../models/Order');

exports.getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user.id;
    console.log(`[getVendorOrders] Fetching orders for vendor: ${vendorId}`);
    
    const WebsiteUser = require('../models/WebsiteUser');
    const MobileUser = require('../models/MobileUser');

    const ordersRaw = await Order.find({ vendor: vendorId })
      .sort({ createdAt: -1 })
      .lean();
      
    // Manually populate user to handle both WebsiteUser and MobileUser
    for (let order of ordersRaw) {
      if (order.user) {
        let userDoc = await WebsiteUser.findById(order.user).select('name phone email').lean();
        if (!userDoc) {
          userDoc = await MobileUser.findById(order.user).select('name phone email').lean();
        }
        order.user = userDoc || null;
      }
    }
    
    const orders = ordersRaw;
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
const Product = require('../models/VendorProduct');

exports.getVendorDashboardStats = async (req, res) => {
  try {
    const vendorId = req.user.id;
    
    // Total Orders and Sales
    const orders = await Order.find({ vendor: vendorId });
    const totalOrders = orders.length;
    
    let totalSales = 0;
    let pendingOrders = 0;
    let returns = 0;
    
    orders.forEach(order => {
      if (order.paymentStatus === 'Success' && order.status !== 'Returned' && order.status !== 'Refunded') {
        totalSales += order.totalAmount;
      }
      if (order.status === 'New' || order.status === 'Accepted' || order.status === 'Preparing') {
        pendingOrders++;
      }
      if (order.status === 'Returned' || order.status === 'Refunded' || order.status === 'Cancelled') {
        returns++;
      }
    });

    // Low stock products
    const products = await Product.find({ vendor: vendorId });
    const lowStock = products.filter(p => {
      if (p.variants && p.variants.length > 0) {
         return p.variants.some(v => v.stock < 10);
      }
      return false;
    }).length;

    // Recent orders (last 5)
    const recentOrdersRaw = await Order.find({ vendor: vendorId }).sort({ createdAt: -1 }).limit(5).lean();
      
    const WebsiteUser = require('../models/WebsiteUser');
    const MobileUser = require('../models/MobileUser');
    for (let order of recentOrdersRaw) {
      if (order.user) {
        let userDoc = await WebsiteUser.findById(order.user).select('name phone email').lean();
        if (!userDoc) {
          userDoc = await MobileUser.findById(order.user).select('name phone email').lean();
        }
        order.user = userDoc || null;
      }
    }
    
    res.json({
      success: true,
      data: {
        totalSales,
        totalOrders,
        pendingOrders,
        lowStock,
        returns,
        recentOrders: recentOrdersRaw
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
