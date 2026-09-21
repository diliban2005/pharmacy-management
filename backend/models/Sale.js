const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema(
  {
    invoiceId: { type: String, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String },
    items: [
      {
        medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
        medicineName: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Card', 'UPI', 'Insurance'],
      required: true,
    },
    paymentStatus: { type: String, enum: ['paid', 'pending', 'partial'], default: 'paid' },
    prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
    soldBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Auto-generate invoice ID
saleSchema.pre('save', async function (next) {
  if (!this.invoiceId) {
    const count = await this.constructor.countDocuments();
    this.invoiceId = `INV-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Sale', saleSchema);
