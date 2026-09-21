const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

const generateCustomerToken = (id) => {
  return jwt.sign({ id, role: 'customer' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register new customer portal account
// @route   POST /api/customer-auth/register
// @access  Public
exports.registerCustomer = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword, address, dateOfBirth, gender } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if an existing customer with this email already has a portal account
    let existingCustomer = await Customer.findOne({ email: normalizedEmail });

    if (existingCustomer && existingCustomer.hasAccount) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please log in.',
      });
    }

    let customer;

    if (existingCustomer) {
      // Link existing walk-in customer record to a new portal account
      existingCustomer.name = name.trim();
      existingCustomer.phone = phone.trim();
      existingCustomer.password = password;
      existingCustomer.hasAccount = true;
      existingCustomer.lastLoginAt = new Date();
      if (address) existingCustomer.address = address;
      if (dateOfBirth) existingCustomer.dateOfBirth = dateOfBirth;
      if (gender) existingCustomer.gender = gender;
      await existingCustomer.save();
      customer = existingCustomer;
    } else {
      // Create new customer portal record
      customer = await Customer.create({
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        password,
        hasAccount: true,
        lastLoginAt: new Date(),
        address: address || '',
        dateOfBirth: dateOfBirth || null,
        gender: gender || 'Other',
      });
    }

    const token = generateCustomerToken(customer._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to PharmaCare Customer Portal.',
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        role: 'customer',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Customer portal login
// @route   POST /api/customer-auth/login
// @access  Public
exports.loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const customer = await Customer.findOne({ email: normalizedEmail });

    if (!customer || !customer.hasAccount) {
      return res.status(401).json({ success: false, message: 'No registered customer account found with this email' });
    }

    if (!customer.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated. Please contact the pharmacy.' });
    }

    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    customer.lastLoginAt = new Date();
    await customer.save();

    const token = generateCustomerToken(customer._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        role: 'customer',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current customer profile
// @route   GET /api/customer-auth/me
// @access  Private (Customer only)
exports.getCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).select('-password');
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update current customer profile
// @route   PUT /api/customer-auth/profile
// @access  Private (Customer only)
exports.updateCustomerProfile = async (req, res) => {
  try {
    const { name, phone, address, dateOfBirth, gender } = req.body;
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (phone) updateData.phone = phone.trim();
    if (address !== undefined) updateData.address = address;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (gender) updateData.gender = gender;

    const customer = await Customer.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.json({ success: true, message: 'Profile updated successfully', customer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
