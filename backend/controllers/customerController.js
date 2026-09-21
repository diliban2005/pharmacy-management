const Customer = require('../models/Customer');

exports.getCustomers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { isActive: true };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const customers = await Customer.find(query)
      .select('-password')
      .populate('prescriptions')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .select('-password')
      .populate({
        path: 'prescriptions',
        populate: { path: 'prescribedMedicines.medicine' },
      });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const safeData = { ...req.body };
    delete safeData.password;
    delete safeData.hasAccount;
    delete safeData.lastLoginAt;

    const customer = await Customer.create(safeData);
    const result = customer.toObject();
    delete result.password;
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const safeData = { ...req.body };
    delete safeData.password;
    delete safeData.hasAccount;
    delete safeData.lastLoginAt;

    const customer = await Customer.findByIdAndUpdate(req.params.id, safeData, {
      new: true,
      runValidators: true,
    }).select('-password');
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    await Customer.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
