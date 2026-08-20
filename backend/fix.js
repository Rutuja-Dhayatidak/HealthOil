const fs = require('fs');
const path = 'c:\\Users\\Admin\\Documents\\Currenr Office Folder\\HelthOil\\backend\\controllers\\vendorOrderController.js';
let content = fs.readFileSync(path, 'utf8');

const goodIdx = content.lastIndexOf('};');
if (goodIdx !== -1) {
  content = content.substring(0, goodIdx + 2);
}

const newCode = `
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
`;

fs.writeFileSync(path, content + newCode);
