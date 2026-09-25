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
      const user = await Model.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      if (user.status === 'suspended') {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended. Please contact the administrator.'
        });
      }

      req.user = user;
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
