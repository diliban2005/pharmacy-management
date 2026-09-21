const Medicine = require('../models/Medicine');

// @desc    Get all medicines
// @route   GET /api/medicines
exports.getMedicines = async (req, res) => {
  try {
    const { search, category, lowStock, expiring } = req.query;
    let query = { isActive: true };

    if (search) query.name = { $regex: search, $options: 'i' };
    if (category) query.category = category;

    let medicines = await Medicine.find(query).sort({ createdAt: -1 });

    if (lowStock === 'true') {
      medicines = medicines.filter((m) => m.quantity <= m.lowStockThreshold);
    }
    if (expiring === 'true') {
      const thirtyDays = new Date();
      thirtyDays.setDate(thirtyDays.getDate() + 30);
      medicines = medicines.filter((m) => m.expiryDate <= thirtyDays);
    }

    res.json({ success: true, count: medicines.length, data: medicines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single medicine
// @route   GET /api/medicines/:id
exports.getMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, data: medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create medicine
// @route   POST /api/medicines
exports.createMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.create(req.body);
    res.status(201).json({ success: true, data: medicine });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update medicine
// @route   PUT /api/medicines/:id
exports.updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, data: medicine });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete medicine (soft delete)
// @route   DELETE /api/medicines/:id
exports.deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, message: 'Medicine deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
