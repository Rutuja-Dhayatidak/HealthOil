const jwt = require('jsonwebtoken');
const WebsiteUser = require('../models/WebsiteUser');
const MobileUser = require('../models/MobileUser');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      const Model = decoded.platform === 'mobile' ? MobileUser : WebsiteUser;
      req.user = await Model.findById(decoded.id).select('-password');
      req.user.platform = decoded.platform;
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
