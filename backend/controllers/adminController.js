const WebsiteUser = require('../models/WebsiteUser');
const MobileUser = require('../models/MobileUser');
const Admin = require('../models/Admin');
const Vendor = require('../models/Vendor');
const VendorProduct = require('../models/VendorProduct');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const getAdminStats = async (req, res) => {
  try {
    const { range = 'this_week' } = req.query;

    const totalCustomers = await WebsiteUser.countDocuments() + await MobileUser.countDocuments();
    const totalVendors = await Vendor.countDocuments({ vendorStatus: 'ACTIVE' });
    const pendingVendors = await Vendor.countDocuments({ onboardingStatus: 'PENDING' });
    const totalProducts = await VendorProduct.countDocuments({ status: 'ACTIVE' });
    const pendingProducts = await VendorProduct.countDocuments({ status: 'PENDING_APPROVAL' });

    // Calculate date range filter
    const now = new Date();
    let startDate = new Date();

    if (range === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'this_week' || range === 'week') {
      const dayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon
      const diffToMon = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
      startDate.setDate(now.getDate() + diffToMon);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'this_month' || range === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === 'this_year' || range === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else if (range === 'all') {
      startDate = new Date(0);
    }

    // Filter orders by date range
    const queryFilter = range === 'all' ? {} : { createdAt: { $gte: startDate } };
    const filteredOrders = await Order.find(queryFilter, 'totalAmount createdAt status');

    const rangeOrdersCount = filteredOrders.length;
    const rangeSalesAmount = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Lifetime totals
    const allOrders = await Order.find({}, 'totalAmount createdAt');
    const lifetimeOrders = allOrders.length;
    const lifetimeSales = allOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Build daily/period sales overview data for charts
    const salesOverview = [];

    if (range === 'this_week' || range === 'week') {
      // 7 days of current week (Mon -> Sun)
      const monday = new Date(startDate);
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const nextD = new Date(d);
        nextD.setDate(d.getDate() + 1);

        const dayOrders = filteredOrders.filter(o => {
          const oDate = new Date(o.createdAt);
          return oDate >= d && oDate < nextD;
        });

        const daySales = dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const dayLabel = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        salesOverview.push({
          day: dayLabel,
          sales: daySales,
          orders: dayOrders.length,
          fullDate: d.toISOString().split('T')[0]
        });
      }
    } else if (range === 'today') {
      for (let hour = 0; hour < 24; hour += 4) {
        const hStart = new Date(startDate);
        hStart.setHours(hour, 0, 0, 0);
        const hEnd = new Date(startDate);
        hEnd.setHours(hour + 4, 0, 0, 0);

        const hourOrders = filteredOrders.filter(o => {
          const oDate = new Date(o.createdAt);
          return oDate >= hStart && oDate < hEnd;
        });

        const hSales = hourOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        salesOverview.push({
          day: `${hour}:00`,
          sales: hSales,
          orders: hourOrders.length
        });
      }
    } else if (range === 'this_month' || range === 'month') {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      for (let week = 1; week <= Math.ceil(daysInMonth / 7); week++) {
        const wStart = new Date(now.getFullYear(), now.getMonth(), (week - 1) * 7 + 1);
        const wEnd = new Date(now.getFullYear(), now.getMonth(), Math.min(week * 7, daysInMonth) + 1);

        const wOrders = filteredOrders.filter(o => {
          const oDate = new Date(o.createdAt);
          return oDate >= wStart && oDate < wEnd;
        });

        const wSales = wOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        salesOverview.push({
          day: `W${week}`,
          sales: wSales,
          orders: wOrders.length
        });
      }
    } else {
      // Default / All Time 7-day trend
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const nextD = new Date(d);
        nextD.setDate(d.getDate() + 1);

        const dayOrders = filteredOrders.filter(o => {
          const oDate = new Date(o.createdAt);
          return oDate >= d && oDate < nextD;
        });

        const daySales = dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const dayLabel = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        salesOverview.push({
          day: dayLabel,
          sales: daySales,
          orders: dayOrders.length
        });
      }
    }

    const recentOrdersRaw = await Order.find({})
      .populate('vendor', 'business.storeName fullName')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

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
      range,
      stats: {
        customers: totalCustomers,
        vendors: totalVendors,
        vendorVerification: pendingVendors,
        products: totalProducts,
        productApproval: pendingProducts,
        orders: lifetimeOrders,
        rangeOrdersCount,
        sales: rangeSalesAmount,
        lifetimeSales,
        lifetimeOrders,
        salesOverview,
        recentOrders: recentOrdersRaw,
        returns: 0
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const websiteUsers = await WebsiteUser.find({}).select('-password');
    const mobileUsers = await MobileUser.find({}).select('-password');

    const formatUser = (user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status || 'active',
      orders: 0,
      spent: '₹0',
      date: new Date(user.createdAt).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    });

    res.json({
      success: true,
      websiteUsers: websiteUsers.map(formatUser),
      mobileUsers: mobileUsers.map(formatUser)
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (admin && (await bcrypt.compare(password, admin.password))) {
      res.json({
        success: true,
        token: jwt.sign(
          { id: admin._id, role: admin.role },
          process.env.JWT_SECRET || 'secret',
          { expiresIn: '1d' }
        ),
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query; // 'website' or 'mobile'

    const Model = type === 'mobile' ? MobileUser : WebsiteUser;
    const deletedUser = await Model.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;

    const Model = type === 'mobile' ? MobileUser : WebsiteUser;
    const user = await Model.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = user.status === 'suspended' ? 'active' : 'suspended';
    await user.save();

    res.json({
      success: true,
      message: `User ${user.status === 'suspended' ? 'suspended' : 'activated'} successfully`,
      status: user.status
    });
  } catch (error) {
    console.error('Admin toggle status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getPendingVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({ 
      onboardingStatus: { $nin: ['APPROVED', 'REJECTED'] } 
    }).sort({ createdAt: -1 });
    res.json({ success: true, vendors });
  } catch (error) {
    console.error('Admin get pending vendors error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getApprovedVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({ 
      onboardingStatus: 'APPROVED'
    }).sort({ createdAt: -1 });
    res.json({ success: true, vendors });
  } catch (error) {
    console.error('Admin get approved vendors error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const approveVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await Vendor.findById(id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    
    vendor.onboardingStatus = 'APPROVED';
    vendor.vendorStatus = 'ACTIVE';
    await vendor.save();
    
    res.json({ success: true, message: 'Vendor approved successfully', vendor });
  } catch (error) {
    console.error('Admin approve vendor error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const rejectVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const vendor = await Vendor.findById(id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    
    vendor.onboardingStatus = 'REJECTED';
    vendor.vendorStatus = 'INACTIVE';
    // Ideally save the reason somewhere in vendor model
    await vendor.save();
    
    res.json({ success: true, message: 'Vendor rejected successfully', vendor });
  } catch (error) {
    console.error('Admin reject vendor error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getVendorsAdmin = async (req, res) => {
  try {
    const { status = 'ALL', page = 1, limit = 15, search = '' } = req.query;
    
    let query = {};
    if (status === 'ACTIVE') {
      query.vendorStatus = 'ACTIVE';
    } else if (status === 'SUSPENDED') {
      query.vendorStatus = 'SUSPENDED';
    } else if (status === 'PENDING') {
      query.onboardingStatus = { $nin: ['APPROVED', 'REJECTED'] };
    }

    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      query.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { mobile: searchRegex },
        { 'business.storeName': searchRegex },
        { 'business.legalBusinessName': searchRegex }
      ];
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 15);
    const skip = (pageNum - 1) * limitNum;

    const [vendors, totalCount, allVendors] = await Promise.all([
      Vendor.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Vendor.countDocuments(query),
      Vendor.find({}, 'vendorStatus onboardingStatus')
    ]);

    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    const activeCount = allVendors.filter(v => v.vendorStatus === 'ACTIVE').length;
    const suspendedCount = allVendors.filter(v => v.vendorStatus === 'SUSPENDED').length;
    const pendingCount = allVendors.filter(v => v.onboardingStatus !== 'APPROVED' && v.onboardingStatus !== 'REJECTED').length;

    res.json({
      success: true,
      vendors,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalVendors: totalCount,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      },
      counts: {
        all: allVendors.length,
        active: activeCount,
        suspended: suspendedCount,
        pending: pendingCount
      }
    });
  } catch (error) {
    console.error('Admin get vendors error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


const toggleVendorSuspendStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await Vendor.findById(id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

    if (vendor.vendorStatus === 'SUSPENDED') {
      vendor.vendorStatus = 'ACTIVE';
      vendor.suspendedAt = null;
    } else {
      vendor.vendorStatus = 'SUSPENDED';
      vendor.suspendedAt = new Date();
    }

    await vendor.save();

    res.json({
      success: true,
      message: `Vendor account ${vendor.vendorStatus === 'SUSPENDED' ? 'suspended' : 'reactivated'} successfully.`,
      vendorStatus: vendor.vendorStatus,
      suspendedAt: vendor.suspendedAt,
      vendor
    });
  } catch (error) {
    console.error('Admin toggle vendor suspend error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const sendVendorCommunication = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, message, subject = 'HealthOil Vendor Communication' } = req.body;

    if (!type || !message) {
      return res.status(400).json({ success: false, message: 'Communication type and message are required' });
    }

    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    if (type === 'EMAIL') {
      const email = vendor.email ? vendor.email.trim().toLowerCase() : '';
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid or missing vendor email address.' });
      }

      await sendEmail(email, subject, message);

      if (!vendor.communicationHistory) vendor.communicationHistory = [];
      vendor.communicationHistory.push({
        type: 'EMAIL',
        subject,
        message,
        sentTo: email,
        sentAt: new Date(),
        status: 'SENT'
      });
      await vendor.save();

      return res.json({
        success: true,
        message: `Email sent successfully to ${email}`,
        communicationHistory: vendor.communicationHistory
      });

    } else if (type === 'WHATSAPP') {
      const mobileRaw = vendor.mobile ? String(vendor.mobile).replace(/\D/g, '') : '';
      if (!mobileRaw || mobileRaw.length < 10) {
        return res.status(400).json({ success: false, message: 'Invalid or missing 10-digit mobile number for WhatsApp.' });
      }

      const cleanMobile = mobileRaw.length === 10 ? `91${mobileRaw}` : mobileRaw;
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanMobile}&text=${encodeURIComponent(message)}`;

      if (!vendor.communicationHistory) vendor.communicationHistory = [];
      vendor.communicationHistory.push({
        type: 'WHATSAPP',
        subject: 'WhatsApp Message',
        message,
        sentTo: `+${cleanMobile}`,
        sentAt: new Date(),
        status: 'SENT'
      });
      await vendor.save();

      return res.json({
        success: true,
        whatsappUrl,
        message: `WhatsApp message prepared for +${cleanMobile}`,
        communicationHistory: vendor.communicationHistory
      });

    } else {
      return res.status(400).json({ success: false, message: 'Unsupported communication type' });
    }

  } catch (error) {
    console.error('Send vendor communication error:', error);
    res.status(500).json({ success: false, message: 'Failed to send vendor communication' });
  }
};



const getAllProducts = async (req, res) => {
  try {
    const { page, limit = 15, search, status } = req.query;

    const query = {};
    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      
      // Also match vendor store name, full name, email
      const matchingVendors = await Vendor.find({
        $or: [
          { 'business.storeName': searchRegex },
          { fullName: searchRegex },
          { email: searchRegex }
        ]
      }).select('_id');
      const vendorIds = matchingVendors.map(v => v._id);

      query.$or = [
        { 'basicDetails.name': searchRegex },
        { 'basicDetails.brandName': searchRegex },
        { 'compliance.oilType': searchRegex },
        { vendor: { $in: vendorIds } }
      ];
    }

    if (page !== undefined && page !== null && page !== '') {
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.max(1, parseInt(limit) || 15);
      const skip = (pageNum - 1) * limitNum;

      const [products, totalCount] = await Promise.all([
        VendorProduct.find(query)
          .populate('vendor', 'business.storeName fullName email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        VendorProduct.countDocuments(query)
      ]);

      const totalPages = Math.ceil(totalCount / limitNum) || 1;

      return res.json({
        success: true,
        products,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalProducts: totalCount,
          limit: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      });
    }

    const products = await VendorProduct.find(query)
      .populate('vendor', 'business.storeName fullName email')
      .sort({ createdAt: -1 });

    const totalCount = products.length;

    res.json({
      success: true,
      products,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalProducts: totalCount,
        limit: totalCount,
        hasNextPage: false,
        hasPrevPage: false
      }
    });
  } catch (error) {
    console.error('Admin get products error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const approveProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await VendorProduct.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    
    product.status = 'ACTIVE';
    product.approvedAt = new Date();
    await product.save();
    
    res.json({ success: true, message: 'Product approved successfully', product });
  } catch (error) {
    console.error('Admin approve product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const rejectProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    const product = await VendorProduct.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    
    product.status = 'REJECTED';
    product.rejectionReason = reason.trim();
    product.rejectedAt = new Date();
    await product.save();
    
    res.json({ success: true, message: 'Product rejected successfully', product });
  } catch (error) {
    console.error('Admin reject product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await VendorProduct.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Admin delete product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { basicDetails, compliance, nutrition, variants, status, approvedAt } = req.body;
    
    const product = await VendorProduct.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Update basicDetails (merge, don't replace)
    if (basicDetails) {
      if (basicDetails.name !== undefined) product.basicDetails.name = basicDetails.name;
      if (basicDetails.brandName !== undefined) product.basicDetails.brandName = basicDetails.brandName;
      if (basicDetails.description !== undefined) product.basicDetails.description = basicDetails.description;
      if (basicDetails.highlights !== undefined) product.basicDetails.highlights = basicDetails.highlights;
    }

    // Update compliance
    if (compliance) {
      Object.keys(compliance).forEach(key => {
        if (compliance[key] !== undefined) {
          product.compliance[key] = compliance[key];
        }
      });
    }

    // Update nutrition
    if (nutrition) {
      Object.keys(nutrition).forEach(key => {
        if (nutrition[key] !== undefined) {
          product.nutrition[key] = nutrition[key];
        }
      });
    }

    // Update variants (full replace)
    if (variants !== undefined) {
      product.variants = variants;
    }

    // Update status
    if (status !== undefined) {
      product.status = status;
    }

    // Update approval timestamp
    if (approvedAt !== undefined) {
      product.approvedAt = approvedAt;
    }

    // Handle dot-notation fields for backward compatibility
    const dotFields = ['basicDetails.name', 'basicDetails.brandName', 'basicDetails.description', 'compliance.oilType'];
    dotFields.forEach(field => {
      if (req.body[field] !== undefined) {
        const [parent, child] = field.split('.');
        product[parent][child] = req.body[field];
      }
    });

    await product.save();
    
    res.json({ success: true, message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Admin update product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateVendor = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'Admins are not authorized to edit vendor profile details. Vendor profile details can only be edited by the vendor from the Vendor Panel.'
  });
};


const getAllOrders = async (req, res) => {
  try {
    const ordersRaw = await Order.find({})
      .populate('vendor', 'business.storeName fullName')
      .sort({ createdAt: -1 })
      .lean();

    for (let order of ordersRaw) {
      if (order.user) {
        let userDoc = await WebsiteUser.findById(order.user).select('fullName email mobile').lean();
        if (!userDoc) {
          userDoc = await MobileUser.findById(order.user).select('name phone email').lean();
        }
        order.user = userDoc || null;
      }
    }

    res.json({ success: true, orders: ordersRaw });
  } catch (error) {
    console.error('Admin get orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateOrderStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    let order = await Order.findById(id);
    if (!order) {
      order = await Order.findOne({ orderId: id });
    }
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    order.updatedAt = new Date();
    await order.save();

    res.json({ success: true, message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Admin update order status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getAdminPayments = async (req, res) => {
  try {
    const ordersRaw = await Order.find({})
      .populate('vendor', 'business.storeName fullName email')
      .sort({ createdAt: -1 })
      .lean();

    for (let order of ordersRaw) {
      if (order.user) {
        let userDoc = await WebsiteUser.findById(order.user).select('fullName name email mobile phone').lean();
        if (!userDoc) {
          userDoc = await MobileUser.findById(order.user).select('name phone email').lean();
        }
        order.user = userDoc || null;
      }
    }

    const payments = ordersRaw.map(o => {
      const isPaid = o.paymentStatus === 'PAID' || o.status === 'Delivered' || o.status === 'Packed' || o.status === 'In Transit';
      const isRefunded = o.status === 'Cancelled' || o.status === 'Returned' || o.paymentStatus === 'REFUNDED';
      const isPending = !isPaid && !isRefunded;

      let paymentStatus = 'PAID';
      if (isRefunded) paymentStatus = 'REFUNDED';
      else if (isPending) paymentStatus = 'PENDING';

      const transactionId = o.paymentDetails?.razorpay_payment_id || `PAY-${(o._id || '').toString().slice(-8).toUpperCase()}`;
      const customerName = o.user?.fullName || o.user?.name || o.deliveryAddress?.name || 'Guest Customer';
      const storeName = o.vendor?.business?.storeName || o.vendor?.fullName || 'HealthOil Direct';

      const platformFee = Math.round((o.totalAmount || 0) * 0.05); // 5% platform fee
      const netPayout = (o.totalAmount || 0) - platformFee;

      return {
        id: transactionId,
        orderId: o.orderId || o._id,
        rawOrderId: o._id,
        date: new Date(o.createdAt).toLocaleString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }),
        createdAt: o.createdAt,
        customer: customerName,
        customerEmail: o.user?.email || o.deliveryAddress?.email || 'N/A',
        store: storeName,
        method: o.paymentMethod || 'Online (Razorpay)',
        amount: o.totalAmount || 0,
        platformFee,
        netPayout,
        status: paymentStatus,
        orderStatus: o.status || 'Pending',
        itemsCount: (o.items || []).length
      };
    });

    const totalRevenue = payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);
    const paidCount = payments.filter(p => p.status === 'PAID').length;
    const pendingAmount = payments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0);
    const refundedAmount = payments.filter(p => p.status === 'REFUNDED').reduce((sum, p) => sum + p.amount, 0);

    res.json({
      success: true,
      summary: {
        totalRevenue,
        paidCount,
        pendingAmount,
        refundedAmount,
        totalTransactions: payments.length
      },
      payments
    });
  } catch (error) {
    console.error('Admin get payments error:', error);
    res.status(500).json({ success: false, message: 'Server error loading payments' });
  }
};

module.exports = { 
  getAdminStats,
  getAllUsers, 
  loginAdmin, 
  deleteUser, 
  toggleUserStatus, 
  getPendingVendors, 
  getApprovedVendors, 
  approveVendor, 
  rejectVendor,
  getAllProducts,
  approveProduct,
  rejectProduct,
  updateProduct,
  deleteProduct,
  updateVendor,
  getAllOrders,
  updateOrderStatusAdmin,
  getAdminPayments,
  getVendorsAdmin,
  toggleVendorSuspendStatus,
  sendVendorCommunication
};



