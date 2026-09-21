const mongoose = require('mongoose');

const prescriptionAnalysisSchema = new mongoose.Schema(
  {
    prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription', required: true },
    aiProvider: { type: String, default: 'google-gemini' },
    aiModel: { type: String, default: 'gemini-2.0-flash' },
    extractedDoctorName: { type: String },
    extractedDate: { type: String },
    rawAiOutput: { type: mongoose.Schema.Types.Mixed },
    extractedMedicines: [
      {
        recognizedText: { type: String, required: true },
        matchedMedicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
        matchedMedicineName: { type: String },
        strength: { type: String },
        dosage: { type: String },
        frequency: { type: String },
        duration: { type: String },
        quantity: { type: Number, default: 1 },
        confidence: { type: Number, default: 0 },
        matchStatus: {
          type: String,
          enum: ['HIGH_CONFIDENCE', 'MEDIUM_CONFIDENCE', 'LOW_CONFIDENCE'],
          default: 'LOW_CONFIDENCE',
        },
        alternativeCandidates: [
          {
            medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
            name: { type: String },
            sellingPrice: { type: Number },
            quantity: { type: Number },
            score: { type: Number },
          },
        ],
        uncertainReason: { type: String },
        isHandwritten: { type: Boolean, default: true },
      },
    ],
    overallConfidence: { type: Number, default: 0 },
    uncertainFields: [{ type: String }],
    requiresPharmacistReview: { type: Boolean, default: true },
    pharmacistCorrections: [
      {
        field: { type: String },
        originalValue: { type: mongoose.Schema.Types.Mixed },
        correctedValue: { type: mongoose.Schema.Types.Mixed },
        correctedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        correctedAt: { type: Date, default: Date.now },
        reason: { type: String },
      },
    ],
    fairnessAudit: {
      protectedAttributesUsed: { type: Boolean, default: false },
      decisionBasedOnPrescriptionEvidence: { type: Boolean, default: true },
      humanReviewRequired: { type: Boolean, default: true },
      aiConfidence: { type: Number },
      auditTimestamp: { type: Date, default: Date.now },
      auditNotes: [{ type: String }],
    },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PrescriptionAnalysis', prescriptionAnalysisSchema);
