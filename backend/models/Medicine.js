const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    genericName: { type: String, trim: true },
    brandName: { type: String, trim: true },
    strength: { type: String, trim: true },
    dosageForm: { type: String, trim: true },
    activeIngredients: [{ type: String, trim: true }],
    aliases: [{ type: String, trim: true }],
    commonMisspellings: [{ type: String, trim: true }],
    searchableNames: [{ type: String, trim: true }],
    manufacturer: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Inhaler', 'Other'],
    },
    batchNumber: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    purchasePrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    description: { type: String },
    requiresPrescription: { type: Boolean, default: false },
    scheduleType: {
      type: String,
      enum: ['OTC', 'SCHEDULE_H', 'SCHEDULE_H1', 'SCHEDULE_X', 'SCHEDULE_G', 'GENERAL'],
      default: 'OTC',
    },
    therapeuticClass: { type: String, default: 'General' },
    dosageInstructions: { type: String },
    sideEffects: { type: String },
    imageUrl: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

medicineSchema.virtual('isPrescriptionRequired').get(function () {
  return (
    this.requiresPrescription === true ||
    ['SCHEDULE_H', 'SCHEDULE_H1', 'SCHEDULE_X'].includes(this.scheduleType)
  );
});

medicineSchema.virtual('isLowStock').get(function () {
  return this.quantity <= this.lowStockThreshold;
});

medicineSchema.virtual('isExpired').get(function () {
  return new Date() > this.expiryDate;
});

medicineSchema.virtual('isExpiringSoon').get(function () {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  return this.expiryDate <= thirtyDaysFromNow && !this.isExpired;
});

medicineSchema.set('toJSON', { virtuals: true });
medicineSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Medicine', medicineSchema);
