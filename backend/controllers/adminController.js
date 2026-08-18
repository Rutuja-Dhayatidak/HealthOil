const WebsiteUser = require('../models/WebsiteUser');
const MobileUser = require('../models/MobileUser');
const Admin = require('../models/Admin');
const Vendor = require('../models/Vendor');
const VendorProduct = require('../models/VendorProduct');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const getAdminStats = async (req, res) => {
  try {
    const totalCustomers = (await WebsiteUser.countDocuments()) + (await MobileUser.countDocuments());
    const totalVendors = await Vendor.countDocuments();
    const pendingVendors = await Vendor.countDocuments({ onboardingStatus: { $nin: ['APPROVED', 'REJECTED'] } });
    const totalProducts = await VendorProduct.countDocuments();
    const pendingProducts = await VendorProduct.countDocuments({ status: 'PENDING_APPROVAL' });

    res.json({
      success: true,
      stats: {
        customers: totalCustomers,
        vendors: totalVendors,
        vendorVerification: pendingVendors,
        products: totalProducts,
        productApproval: pendingProducts,
        orders: 0,
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
    const products = await VendorProduct.find({})
      .populate('vendor', 'business.storeName fullName email')
      .sort({ createdAt: -1 });
    res.json({ success: true, products });
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
    await product.save();
    
    res.json({ success: true, message: 'Product rejected successfully', product });
  } catch (error) {
    console.error('Admin reject product error:', error);
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
  rejectProduct
};
