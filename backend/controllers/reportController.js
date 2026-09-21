const Sale = require('../models/Sale');
const Medicine = require('../models/Medicine');
const Prescription = require('../models/Prescription');
const PrescriptionAnalysis = require('../models/PrescriptionAnalysis');
const AIAudit = require('../models/AIAudit');

exports.getDailySales = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const start = new Date(targetDate.setHours(0, 0, 0, 0));
    const end = new Date(targetDate.setHours(23, 59, 59, 999));

    const sales = await Sale.find({ date: { $gte: start, $lte: end } }).populate('customer', 'name');
    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalTransactions = sales.length;

    res.json({ success: true, data: { sales, totalRevenue, totalTransactions, date: start } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMonthlySales = async (req, res) => {
  try {
    const { year, month } = req.query;
    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) || new Date().getMonth() + 1;
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    const sales = await Sale.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dayOfMonth: '$date' },
          totalRevenue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totalRevenue = sales.reduce((sum, s) => sum + s.totalRevenue, 0);
    res.json({ success: true, data: { dailyBreakdown: sales, totalRevenue, month: m, year: y } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTopMedicines = async (req, res) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;
    let matchQuery = {};
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }

    const topMedicines = await Sale.aggregate([
      { $match: matchQuery },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.medicineName',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' },
          medicineId: { $first: '$items.medicine' },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: parseInt(limit) },
    ]);

    res.json({ success: true, data: topMedicines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLowStockMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({ isActive: true });
    const lowStock = medicines.filter((m) => m.quantity <= m.lowStockThreshold);
    res.json({ success: true, count: lowStock.length, data: lowStock });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));

    const [
      todaySales,
      totalMedicines,
      lowStockCount,
      expiringCount,
      recentSales,
      pendingPrescriptionsCount,
      verifiedPrescriptionsCount,
      recentPrescriptions,
    ] = await Promise.all([
      Sale.aggregate([
        { $match: { date: { $gte: todayStart, $lte: todayEnd } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      ]),
      Medicine.countDocuments({ isActive: true }),
      Medicine.countDocuments({ isActive: true, $expr: { $lte: ['$quantity', '$lowStockThreshold'] } }),
      Medicine.countDocuments({
        isActive: true,
        expiryDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      }),
      Sale.find().populate('customer', 'name').sort({ date: -1 }).limit(5),
      Prescription.countDocuments({
        status: { $in: ['UPLOADED', 'AI_ANALYZING', 'UNDER_PHARMACIST_REVIEW', 'pending'] },
      }),
      Prescription.countDocuments({
        status: { $in: ['VERIFIED', 'DISPENSED', 'verified', 'dispensed'] },
      }),
      Prescription.find()
        .populate('customer', 'name phone')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.json({
      success: true,
      data: {
        todayRevenue: todaySales[0]?.total || 0,
        todayTransactions: todaySales[0]?.count || 0,
        totalMedicines,
        lowStockCount,
        expiringCount,
        recentSales,
        pendingPrescriptionsCount,
        verifiedPrescriptionsCount,
        recentPrescriptions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAiReports = async (req, res) => {
  try {
    const totalPrescriptions = await Prescription.countDocuments();
    const analyzedPrescriptions = await PrescriptionAnalysis.countDocuments();
    const highConfidence = await PrescriptionAnalysis.countDocuments({ overallConfidence: { $gte: 0.90 } });
    const mediumConfidence = await PrescriptionAnalysis.countDocuments({
      overallConfidence: { $gte: 0.70, $lt: 0.90 },
    });
    const lowConfidence = await PrescriptionAnalysis.countDocuments({ overallConfidence: { $lt: 0.70 } });
    const pharmacistOverrides = await AIAudit.countDocuments({ overrideOccurred: true });
    const rejections = await AIAudit.countDocuments({ action: 'REJECTION' });

    res.json({
      success: true,
      data: {
        totalPrescriptions,
        analyzedPrescriptions,
        highConfidence,
        mediumConfidence,
        lowConfidence,
        pharmacistOverrides,
        rejections,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
