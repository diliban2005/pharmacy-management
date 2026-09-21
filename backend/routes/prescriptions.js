const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getPrescriptions,
  getPrescription,
  createPrescription,
  updatePrescription,
  analyzePrescription,
  verifyPrescription,
  rejectPrescription,
  requestClarification,
  deletePrescription,
} = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/auth');

// Ensure destination directory exists
const uploadDir = path.join(__dirname, '../uploads/prescriptions');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `staff-rx-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.use(protect, authorize('admin', 'pharmacist'));

router.route('/')
  .get(getPrescriptions)
  .post(upload.single('prescriptionImage'), createPrescription);

router.route('/:id')
  .get(getPrescription)
  .put(updatePrescription)
  .delete(deletePrescription);

router.post('/:id/analyze', analyzePrescription);
router.put('/:id/verify', verifyPrescription);
router.put('/:id/reject', rejectPrescription);
router.put('/:id/clarification', requestClarification);

module.exports = router;
