const express = require('express');
const router = express.Router();
const { getMedicines, getMedicine, createMedicine, updateMedicine, deleteMedicine } = require('../controllers/medicineController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getMedicines).post(authorize('admin', 'pharmacist'), createMedicine);
router.route('/:id').get(getMedicine).put(authorize('admin', 'pharmacist'), updateMedicine).delete(authorize('admin', 'pharmacist'), deleteMedicine);

module.exports = router;
