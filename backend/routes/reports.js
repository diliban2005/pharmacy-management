const express = require('express');
const router = express.Router();
const {
  getDailySales,
  getMonthlySales,
  getTopMedicines,
  getLowStockMedicines,
  getDashboardStats,
  getAiReports,
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/dashboard', getDashboardStats);
router.get('/daily', getDailySales);
router.get('/monthly', getMonthlySales);
router.get('/top-medicines', getTopMedicines);
router.get('/low-stock', getLowStockMedicines);
router.get('/ai-performance', getAiReports);

module.exports = router;
