const User = require('../models/User');

// @desc    Get all pharmacists
// @route   GET /api/pharmacists
// @access  Private (Admin only)
exports.getPharmacists = async (req, res) => {
  try {
    const pharmacists = await User.find({ role: 'pharmacist' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: pharmacists.length, data: pharmacists });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new pharmacist
// @route   POST /api/pharmacists
// @access  Private (Admin only)
exports.createPharmacist = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    const pharmacist = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'pharmacist',
      phone: phone?.trim() || '',
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Pharmacist account created successfully',
      data: {
        id: pharmacist._id,
        name: pharmacist.name,
        email: pharmacist.email,
        phone: pharmacist.phone,
        role: pharmacist.role,
        isActive: pharmacist.isActive,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update pharmacist
// @route   PUT /api/pharmacists/:id
// @access  Private (Admin only)
exports.updatePharmacist = async (req, res) => {
  try {
    const { name, phone, isActive, password } = req.body;
    const pharmacist = await User.findById(req.params.id);

    if (!pharmacist || pharmacist.role !== 'pharmacist') {
      return res.status(404).json({ success: false, message: 'Pharmacist account not found' });
    }

    if (name) pharmacist.name = name.trim();
    if (phone !== undefined) pharmacist.phone = phone.trim();
    if (isActive !== undefined) pharmacist.isActive = isActive;
    if (password) pharmacist.password = password; // triggers pre-save hash

    await pharmacist.save();

    res.json({
      success: true,
      message: 'Pharmacist updated successfully',
      data: {
        id: pharmacist._id,
        name: pharmacist.name,
        email: pharmacist.email,
        phone: pharmacist.phone,
        role: pharmacist.role,
        isActive: pharmacist.isActive,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete pharmacist
// @route   DELETE /api/pharmacists/:id
// @access  Private (Admin only)
exports.deletePharmacist = async (req, res) => {
  try {
    const pharmacist = await User.findOneAndDelete({ _id: req.params.id, role: 'pharmacist' });

    if (!pharmacist) {
      return res.status(404).json({ success: false, message: 'Pharmacist not found' });
    }

    res.json({ success: true, message: 'Pharmacist deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
