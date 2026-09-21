const express = require('express');
const router = express.Router();
const { getAuditLogs, getAuditStats } = require('../controllers/aiAuditController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin', 'pharmacist'));

router.get('/', getAuditLogs);
router.get('/stats', getAuditStats);

module.exports = router;
