const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Customer = require('../models/Customer');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === 'customer') {
      const customer = await Customer.findById(decoded.id).select('-password');
      if (!customer || !customer.isActive) {
        return res.status(401).json({ success: false, message: 'Customer account not found or deactivated' });
      }
      req.user = customer;
      req.user.role = 'customer';
      req.isCustomer = true;
    } else {
      const user = await User.findById(decoded.id).select('-password');
      if (!user || !user.isActive) {
        return res.status(401).json({ success: false, message: 'Staff account not found or deactivated' });
      }
      req.user = user;
      req.isCustomer = false;
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user ? req.user.role : 'none'}' is not authorized to access this route`,
      });
    }
    next();
  };
};
