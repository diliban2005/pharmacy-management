const express = require('express');
const router = express.Router();
const {
  getPharmacists,
  createPharmacist,
  updatePharmacist,
  deletePharmacist,
} = require('../controllers/pharmacistController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.route('/')
  .get(getPharmacists)
  .post(createPharmacist);

router.route('/:id')
  .put(updatePharmacist)
  .delete(deletePharmacist);

module.exports = router;
