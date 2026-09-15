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
    const totalCustomers = await WebsiteUser.countDocuments() + await MobileUser.countDocuments();
    const totalVendors = await Vendor.countDocuments({ vendorStatus: 'ACTIVE' });
    const pendingVendors = await Vendor.countDocuments({ onboardingStatus: 'PENDING' });
    const totalProducts = await VendorProduct.countDocuments({ status: 'ACTIVE' });
    const pendingProducts = await VendorProduct.countDocuments({ status: 'PENDING_APPROVAL' });

    // Calculate actual orders and sales
    const orders = await Order.find({}, 'totalAmount createdAt');
    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

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
      stats: {
        customers: totalCustomers,
        vendors: totalVendors,
        vendorVerification: pendingVendors,
        products: totalProducts,
        productApproval: pendingProducts,
        orders: totalOrders,
        sales: totalSales,
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
    const product = await VendorProduct.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    
    product.status = 'REJECTED';
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
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const vendor = await Vendor.findById(id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

    // Update personal info
    if (updateData.fullName !== undefined) vendor.fullName = updateData.fullName;
    if (updateData.email !== undefined) vendor.email = updateData.email;
    if (updateData.mobile !== undefined) vendor.mobile = updateData.mobile;

    // Update vendor/onboarding status
    if (updateData.vendorStatus !== undefined) vendor.vendorStatus = updateData.vendorStatus;
    if (updateData.onboardingStatus !== undefined) vendor.onboardingStatus = updateData.onboardingStatus;

    // Update business details (merge)
    if (updateData.business) {
      Object.keys(updateData.business).forEach(key => {
        if (key === 'address' && updateData.business.address) {
          if (!vendor.business.address) vendor.business.address = {};
          Object.keys(updateData.business.address).forEach(aKey => {
            if (updateData.business.address[aKey] !== undefined) {
              vendor.business.address[aKey] = updateData.business.address[aKey];
            }
          });
        } else if (updateData.business[key] !== undefined) {
          vendor.business[key] = updateData.business[key];
        }
      });
    }

    // Update bank details
    if (updateData.bank) {
      if (!vendor.bank) vendor.bank = {};
      Object.keys(updateData.bank).forEach(key => {
        if (updateData.bank[key] !== undefined) {
          vendor.bank[key] = updateData.bank[key];
        }
      });
    }

    // Update pickup address
    if (updateData.pickupAddress) {
      if (!vendor.pickupAddress) vendor.pickupAddress = {};
      Object.keys(updateData.pickupAddress).forEach(key => {
        if (updateData.pickupAddress[key] !== undefined) {
          vendor.pickupAddress[key] = updateData.pickupAddress[key];
        }
      });
    }

    // Update store profile
    if (updateData.storeProfile) {
      if (!vendor.storeProfile) vendor.storeProfile = {};
      Object.keys(updateData.storeProfile).forEach(key => {
        if (updateData.storeProfile[key] !== undefined) {
          vendor.storeProfile[key] = updateData.storeProfile[key];
        }
      });
    }

    await vendor.save();
    
    res.json({ success: true, message: 'Vendor updated successfully', vendor });
  } catch (error) {
    console.error('Admin update vendor error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
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
  getAllOrders
};
