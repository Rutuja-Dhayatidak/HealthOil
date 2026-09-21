const Order = require('../models/Order');

exports.getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { page, limit = 15, status, search } = req.query;

    const WebsiteUser = require('../models/WebsiteUser');
    const MobileUser = require('../models/MobileUser');

    const query = { vendor: vendorId };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      
      const [webUsers, mobUsers] = await Promise.all([
        WebsiteUser.find({
          $or: [
            { name: searchRegex },
            { phone: searchRegex },
            { email: searchRegex }
          ]
        }).select('_id'),
        MobileUser.find({
          $or: [
            { name: searchRegex },
            { phone: searchRegex },
            { email: searchRegex }
          ]
        }).select('_id')
      ]);

      const userIds = [...webUsers.map(u => u._id), ...mobUsers.map(u => u._id)];

      query.$or = [
        { orderId: searchRegex },
        { 'deliveryAddress.addressText': searchRegex },
        { 'deliveryAddress.name': searchRegex },
        { 'deliveryAddress.phone': searchRegex },
        { 'items.productName': searchRegex },
        { user: { $in: userIds } }
      ];
    }

    if (page !== undefined && page !== null && page !== '') {
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.max(1, parseInt(limit) || 15);
      const skip = (pageNum - 1) * limitNum;

      const [ordersRaw, totalCount] = await Promise.all([
        Order.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Order.countDocuments(query)
      ]);

      for (let order of ordersRaw) {
        if (order.user) {
          let userDoc = await WebsiteUser.findById(order.user).select('name phone email').lean();
          if (!userDoc) {
            userDoc = await MobileUser.findById(order.user).select('name phone email').lean();
          }
          order.user = userDoc || null;
        }
      }

      const totalPages = Math.ceil(totalCount / limitNum) || 1;

      return res.status(200).json({
        success: true,
        orders: ordersRaw,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalOrders: totalCount,
          limit: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      });
    }

    const ordersRaw = await Order.find(query)
      .sort({ createdAt: -1 })
      .lean();
      
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
    res.status(200).json({
      success: true,
      orders,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalOrders: orders.length,
        limit: orders.length,
        hasNextPage: false,
        hasPrevPage: false
      }
    });
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
