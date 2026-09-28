const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protectAdmin = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized as Super Admin, no token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin account not found'
      });
    }

    req.admin = admin;
    req.user = admin;
    next();
  } catch (error) {
    console.error('Admin Auth Middleware error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized as Super Admin, token invalid or expired'
    });
  }
};

module.exports = { protectAdmin };
