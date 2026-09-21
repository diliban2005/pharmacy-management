const express = require('express');
const router = express.Router();
const {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
  updateCustomerProfile,
} = require('../controllers/customerAuthController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);

router.get('/me', protect, authorize('customer'), getCustomerProfile);
router.put('/profile', protect, authorize('customer'), updateCustomerProfile);

module.exports = router;
