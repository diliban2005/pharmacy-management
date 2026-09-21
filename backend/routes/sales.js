const express = require('express');
const router = express.Router();
const { getSales, getSale, createSale } = require('../controllers/salesController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getSales).post(createSale);
router.route('/:id').get(getSale);

module.exports = router;
