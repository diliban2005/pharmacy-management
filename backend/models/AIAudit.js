const mongoose = require('mongoose');

const aiAuditSchema = new mongoose.Schema(
  {
    prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription', required: true },
    action: {
      type: String,
      enum: [
        'AI_ANALYSIS',
        'PHARMACIST_VERIFICATION',
        'PHARMACIST_OVERRIDE',
        'REJECTION',
        'CLARIFICATION_REQUESTED',
      ],
      required: true,
    },
    protectedAttributesUsed: { type: Boolean, default: false },
    decisionBasedOnPrescriptionEvidence: { type: Boolean, default: true },
    humanReviewRequired: { type: Boolean, default: true },
    aiConfidence: { type: Number, default: 0 },
    overrideOccurred: { type: Boolean, default: false },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    performedByName: { type: String },
    performedByRole: { type: String, default: 'pharmacist' },
    details: { type: mongoose.Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIAudit', aiAuditSchema);
