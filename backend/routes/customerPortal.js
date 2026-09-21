const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  uploadPrescription,
  getCustomerPrescriptions,
  getCustomerPrescription,
  getCustomerPurchases,
  getCustomerInvoice,
  deleteCustomerPrescription,
  getCatalog,
  getCustomerVerifiedPrescriptions,
  checkoutOrder,
} = require('../controllers/customerPortalController');
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
    cb(null, `customer-rx-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|pdf/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;
  if (allowed.test(ext) && (mime.startsWith('image/') || mime === 'application/pdf')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and PDF documents are supported.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

router.use(protect, authorize('customer'));

router.post('/prescriptions/upload', upload.single('prescriptionImage'), uploadPrescription);
router.get('/prescriptions', getCustomerPrescriptions);
router.get('/prescriptions/verified', getCustomerVerifiedPrescriptions);
router.get('/prescriptions/:id', getCustomerPrescription);
router.delete('/prescriptions/:id', deleteCustomerPrescription);
router.get('/purchases', getCustomerPurchases);
router.get('/purchases/:id', getCustomerInvoice);
router.get('/catalog', getCatalog);
router.post('/orders/checkout', checkoutOrder);

module.exports = router;
