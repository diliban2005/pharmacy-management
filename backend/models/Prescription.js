const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    doctorName: { type: String, default: 'Pending Extraction' },
    prescriptionImage: { type: String },
    processedImage: { type: String },
    originalFileName: { type: String },
    fileType: { type: String },
    fileSize: { type: Number },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'uploadedByModel' },
    uploadedByModel: { type: String, enum: ['Customer', 'User'], default: 'Customer' },
    aiAnalysis: { type: mongoose.Schema.Types.ObjectId, ref: 'PrescriptionAnalysis' },
    prescribedMedicines: [
      {
        medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
        medicineName: { type: String },
        dosage: { type: String },
        frequency: { type: String },
        duration: { type: String },
        quantity: { type: Number, default: 1 },
        confidence: { type: Number },
        matchStatus: { type: String },
        isVerified: { type: Boolean, default: false },
      },
    ],
    date: { type: Date, default: Date.now },
    notes: { type: String },
    pharmacistNotes: { type: String },
    clarificationMessage: { type: String },
    rejectionReason: { type: String },
    status: {
      type: String,
      enum: [
        'UPLOADED',
        'AI_ANALYZING',
        'UNDER_PHARMACIST_REVIEW',
        'NEEDS_CLARIFICATION',
        'VERIFIED',
        'REJECTED',
        'DISPENSED',
        'pending',
        'verified',
        'dispensed',
      ],
      default: 'UPLOADED',
    },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
