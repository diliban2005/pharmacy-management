const Sale = require('../models/Sale');
const Medicine = require('../models/Medicine');
const Customer = require('../models/Customer');
const Prescription = require('../models/Prescription');

exports.getSales = async (req, res) => {
  try {
    const { startDate, endDate, customerId } = req.query;
    let query = {};
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (customerId) query.customer = customerId;

    const sales = await Sale.find(query)
      .populate('customer', 'name phone')
      .populate('soldBy', 'name')
      .sort({ date: -1 });

    res.json({ success: true, count: sales.length, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customer', 'name phone email address')
      .populate('soldBy', 'name')
      .populate('prescription');
    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
    res.json({ success: true, data: sale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSale = async (req, res) => {
  try {
    const { items, customer, customerName, discount, tax, paymentMethod, prescription, notes } =
      req.body;

    // Validate prescription if supplied: must be VERIFIED before dispensing!
    let rxRecord = null;
    if (prescription) {
      rxRecord = await Prescription.findById(prescription);
      if (!rxRecord) {
        return res.status(404).json({ success: false, message: 'Referenced prescription not found' });
      }
      const isVerified = rxRecord.status === 'VERIFIED' || rxRecord.status === 'verified';
      if (!isVerified) {
        return res.status(400).json({
          success: false,
          message: `Cannot dispense unverified prescription (status: ${rxRecord.status}). Pharmacist verification is mandatory before dispensing.`,
        });
      }
    }

    // Validate stock and calculate totals
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const medicine = await Medicine.findById(item.medicine);
      if (!medicine) {
        return res.status(404).json({ success: false, message: `Medicine ${item.medicine} not found` });
      }
      if (medicine.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${medicine.name}. Available: ${medicine.quantity}`,
        });
      }
      const itemTotal = medicine.sellingPrice * item.quantity;
      subtotal += itemTotal;
      processedItems.push({
        medicine: medicine._id,
        medicineName: medicine.name,
        quantity: item.quantity,
        unitPrice: medicine.sellingPrice,
        totalPrice: itemTotal,
      });
    }

    const discountAmount = (subtotal * (discount || 0)) / 100;
    const taxAmount = ((subtotal - discountAmount) * (tax || 0)) / 100;
    const totalAmount = subtotal - discountAmount + taxAmount;

    // Create sale
    const sale = await Sale.create({
      items: processedItems,
      customer,
      customerName,
      subtotal,
      discount: discount || 0,
      tax: tax || 0,
      totalAmount,
      paymentMethod,
      prescription,
      notes,
      soldBy: req.user._id,
    });

    // Deduct inventory
    for (const item of items) {
      await Medicine.findByIdAndUpdate(item.medicine, { $inc: { quantity: -item.quantity } });
    }

    // Update customer total purchases
    if (customer) {
      await Customer.findByIdAndUpdate(customer, { $inc: { totalPurchases: totalAmount } });
    }

    // Transition verified prescription to DISPENSED
    if (rxRecord) {
      rxRecord.status = 'DISPENSED';
      await rxRecord.save();
    }

    const populatedSale = await Sale.findById(sale._id)
      .populate('customer', 'name phone')
      .populate('soldBy', 'name');

    res.status(201).json({ success: true, data: populatedSale });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
