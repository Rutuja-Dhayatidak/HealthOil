const jwt = require('jsonwebtoken');

const protectVendor = (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (decoded.role !== 'VENDOR') {
      return res.status(403).json({ success: false, message: 'Not authorized as Vendor' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Vendor auth middleware error:', error);
    res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

module.exports = { protectVendor };
