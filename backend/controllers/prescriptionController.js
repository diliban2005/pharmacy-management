const Prescription = require('../models/Prescription');
const Customer = require('../models/Customer');
const PrescriptionAnalysis = require('../models/PrescriptionAnalysis');
const aiPrescriptionService = require('../services/aiPrescriptionService');
const medicineMatchingService = require('../services/medicineMatchingService');
const fairnessAuditService = require('../services/fairnessAuditService');

// @desc    Get all prescriptions (for staff: pharmacist & admin)
// @route   GET /api/prescriptions
// @access  Private (Staff only)
exports.getPrescriptions = async (req, res) => {
  try {
    const { customerId, status, search } = req.query;
    let query = {};
    if (customerId) query.customer = customerId;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { doctorName: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    const prescriptions = await Prescription.find(query)
      .populate('customer', 'name phone email')
      .populate('prescribedMedicines.medicine', 'name sellingPrice quantity manufacturer')
      .populate('verifiedBy', 'name email')
      .populate('aiAnalysis', 'overallConfidence uncertainFields fairnessAudit')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: prescriptions.length, data: prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single prescription with full details
// @route   GET /api/prescriptions/:id
// @access  Private (Staff only)
exports.getPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('customer')
      .populate('prescribedMedicines.medicine')
      .populate('verifiedBy', 'name email role')
      .populate({
        path: 'aiAnalysis',
        populate: {
          path: 'extractedMedicines.matchedMedicine extractedMedicines.alternativeCandidates.medicine',
          select: 'name sellingPrice quantity manufacturer batchNumber expiryDate',
        },
      });

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    res.json({ success: true, data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create prescription manually (by staff)
// @route   POST /api/prescriptions
// @access  Private (Staff only)
exports.createPrescription = async (req, res) => {
  try {
    const prescriptionData = { ...req.body };
    if (req.file) {
      prescriptionData.prescriptionImage = req.file.path.replace(/\\/g, '/');
      prescriptionData.originalFileName = req.file.originalname;
      prescriptionData.fileType = req.file.mimetype;
      prescriptionData.fileSize = req.file.size;
    }

    if (typeof req.body.prescribedMedicines === 'string') {
      try {
        prescriptionData.prescribedMedicines = JSON.parse(req.body.prescribedMedicines);
      } catch (e) {
        prescriptionData.prescribedMedicines = [];
      }
    }

    prescriptionData.uploadedBy = req.user._id;
    prescriptionData.uploadedByModel = 'User';
    prescriptionData.status = prescriptionData.status || 'UNDER_PHARMACIST_REVIEW';

    const prescription = await Prescription.create(prescriptionData);

    // Link to customer
    if (prescription.customer) {
      await Customer.findByIdAndUpdate(prescription.customer, {
        $push: { prescriptions: prescription._id },
      });
    }

    res.status(201).json({ success: true, data: prescription });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Run / Re-run AI vision prescription analysis
// @route   POST /api/prescriptions/:id/analyze
// @access  Private (Pharmacist, Admin)
exports.analyzePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    if (!prescription.prescriptionImage) {
      return res.status(400).json({ success: false, message: 'No prescription document uploaded to analyze' });
    }

    // Set temporary status
    prescription.status = 'AI_ANALYZING';
    await prescription.save();

    // Preprocess image
    const processedPath = await aiPrescriptionService.preprocessImage(prescription.prescriptionImage);
    if (processedPath) {
      prescription.processedImage = processedPath.replace(/\\/g, '/');
    }

    // Run AI analysis
    const aiResult = await aiPrescriptionService.analyzePrescription({
      filePath: processedPath || prescription.prescriptionImage,
      originalFileName: prescription.originalFileName || 'prescription.jpg',
    });

    // Match recognized text against pharmacy inventory
    const matchedMedicines = await medicineMatchingService.matchAllMedicines(aiResult.medicines);

    // Fairness audit creation
    const fairnessReport = fairnessAuditService.createFairnessReport(
      aiResult.overallConfidence,
      aiResult.uncertainFields
    );

    // Create or update PrescriptionAnalysis
    let analysis;
    if (prescription.aiAnalysis) {
      analysis = await PrescriptionAnalysis.findByIdAndUpdate(
        prescription.aiAnalysis,
        {
          aiProvider: aiResult.provider,
          aiModel: aiResult.model,
          extractedDoctorName: aiResult.doctorName,
          extractedDate: aiResult.prescriptionDate,
          rawAiOutput: aiResult.rawAiOutput,
          extractedMedicines: matchedMedicines,
          overallConfidence: aiResult.overallConfidence,
          uncertainFields: aiResult.uncertainFields,
          requiresPharmacistReview: true,
          fairnessAudit: fairnessReport,
        },
        { new: true }
      );
    } else {
      analysis = await PrescriptionAnalysis.create({
        prescription: prescription._id,
        aiProvider: aiResult.provider,
        aiModel: aiResult.model,
        extractedDoctorName: aiResult.doctorName,
        extractedDate: aiResult.prescriptionDate,
        rawAiOutput: aiResult.rawAiOutput,
        extractedMedicines: matchedMedicines,
        overallConfidence: aiResult.overallConfidence,
        uncertainFields: aiResult.uncertainFields,
        requiresPharmacistReview: true,
        fairnessAudit: fairnessReport,
      });
    }

    // Update prescription
    prescription.aiAnalysis = analysis._id;
    if (aiResult.doctorName && (!prescription.doctorName || prescription.doctorName === 'Pending AI Extraction')) {
      prescription.doctorName = aiResult.doctorName;
    }
    prescription.prescribedMedicines = matchedMedicines.map((m) => ({
      medicine: m.matchedMedicine,
      medicineName: m.matchedMedicineName || m.recognizedText,
      dosage: m.dosage,
      frequency: m.frequency,
      duration: m.duration,
      quantity: m.quantity,
      confidence: m.confidence,
      matchStatus: m.matchStatus,
      isVerified: false,
    }));
    prescription.status = 'UNDER_PHARMACIST_REVIEW';
    await prescription.save();

    // Log to AIAudit
    await fairnessAuditService.logAudit({
      prescriptionId: prescription._id,
      action: 'AI_ANALYSIS',
      aiConfidence: aiResult.overallConfidence,
      performedBy: req.user._id,
      performedByName: req.user.name,
      performedByRole: req.user.role,
      details: {
        medicinesCount: matchedMedicines.length,
        overallConfidence: aiResult.overallConfidence,
        auditedMedicines: matchedMedicines.map((m) => ({
          recognizedText: m.recognizedText,
          matchedMedicineName: m.matchedMedicineName || m.recognizedText,
          medicineId: m.matchedMedicine,
          strength: m.strength,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          quantity: m.quantity,
          confidence: m.confidence,
          matchStatus: m.matchStatus,
          matchMethod: m.matchMethod,
          uncertainReason: m.uncertainReason,
        })),
      },
    });

    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate('customer')
      .populate('prescribedMedicines.medicine')
      .populate('aiAnalysis');

    res.json({
      success: true,
      message: 'AI analysis completed successfully. Ready for pharmacist verification.',
      data: populatedPrescription,
    });
  } catch (error) {
    console.error('Prescription analysis error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Pharmacist confirms and verifies prescription (Human-in-the-Loop)
// @route   PUT /api/prescriptions/:id/verify
// @access  Private (Pharmacist, Admin)
exports.verifyPrescription = async (req, res) => {
  try {
    const { verifiedMedicines, doctorName, pharmacistNotes, corrections } = req.body;

    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    if (doctorName) prescription.doctorName = doctorName;
    if (pharmacistNotes) prescription.pharmacistNotes = pharmacistNotes;

    if (Array.isArray(verifiedMedicines) && verifiedMedicines.length > 0) {
      prescription.prescribedMedicines = verifiedMedicines.map((m) => ({
        medicine: m.medicine || null,
        medicineName: m.medicineName || m.name,
        dosage: m.dosage || '1 tablet',
        frequency: m.frequency || 'Once daily',
        duration: m.duration || '5 days',
        quantity: Number(m.quantity) || 1,
        confidence: m.confidence || 1.0,
        matchStatus: 'HIGH_CONFIDENCE',
        isVerified: true,
      }));
    }

    prescription.status = 'VERIFIED';
    prescription.verifiedBy = req.user._id;
    prescription.verifiedAt = new Date();
    await prescription.save();

    // If corrections occurred, record them in PrescriptionAnalysis and AIAudit
    let overrideOccurred = false;
    if (prescription.aiAnalysis) {
      const analysis = await PrescriptionAnalysis.findById(prescription.aiAnalysis);
      if (analysis) {
        analysis.verifiedBy = req.user._id;
        analysis.verifiedAt = new Date();

        if (Array.isArray(corrections) && corrections.length > 0) {
          overrideOccurred = true;
          for (const cor of corrections) {
            analysis.pharmacistCorrections.push({
              field: cor.field || 'medicine',
              originalValue: cor.originalValue,
              correctedValue: cor.correctedValue,
              correctedBy: req.user._id,
              correctedAt: new Date(),
              reason: cor.reason || 'Pharmacist clinical correction',
            });
          }
        }
        await analysis.save();
      }
    }

    // Log to AIAudit
    await fairnessAuditService.logAudit({
      prescriptionId: prescription._id,
      action: overrideOccurred ? 'PHARMACIST_OVERRIDE' : 'PHARMACIST_VERIFICATION',
      aiConfidence: 1.0,
      overrideOccurred,
      performedBy: req.user._id,
      performedByName: req.user.name,
      performedByRole: req.user.role,
      details: {
        medicinesVerified: prescription.prescribedMedicines.length,
        notes: pharmacistNotes,
        auditedMedicines: prescription.prescribedMedicines.map((m) => ({
          recognizedText: m.medicineName,
          matchedMedicineName: m.medicineName,
          medicineId: m.medicine,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          quantity: m.quantity,
          confidence: m.confidence || 1.0,
          matchStatus: 'HIGH_CONFIDENCE',
        })),
      },
    });

    const updated = await Prescription.findById(prescription._id)
      .populate('customer')
      .populate('prescribedMedicines.medicine')
      .populate('verifiedBy', 'name');

    res.json({
      success: true,
      message: 'Prescription successfully verified and approved for dispensing.',
      data: updated,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Pharmacist rejects prescription
// @route   PUT /api/prescriptions/:id/reject
// @access  Private (Pharmacist, Admin)
exports.rejectPrescription = async (req, res) => {
  try {
    const { rejectionReason, pharmacistNotes } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ success: false, message: 'Please provide a rejection reason' });
    }

    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    prescription.status = 'REJECTED';
    prescription.rejectionReason = rejectionReason;
    if (pharmacistNotes) prescription.pharmacistNotes = pharmacistNotes;
    prescription.verifiedBy = req.user._id;
    await prescription.save();

    await fairnessAuditService.logAudit({
      prescriptionId: prescription._id,
      action: 'REJECTION',
      aiConfidence: 0,
      performedBy: req.user._id,
      performedByName: req.user.name,
      performedByRole: req.user.role,
      details: { reason: rejectionReason },
    });

    res.json({
      success: true,
      message: 'Prescription rejected.',
      data: prescription,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Pharmacist requests clarification from customer
// @route   PUT /api/prescriptions/:id/clarification
// @access  Private (Pharmacist, Admin)
exports.requestClarification = async (req, res) => {
  try {
    const { clarificationMessage } = req.body;

    if (!clarificationMessage) {
      return res.status(400).json({ success: false, message: 'Please provide clarification instructions' });
    }

    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    prescription.status = 'NEEDS_CLARIFICATION';
    prescription.clarificationMessage = clarificationMessage;
    await prescription.save();

    await fairnessAuditService.logAudit({
      prescriptionId: prescription._id,
      action: 'CLARIFICATION_REQUESTED',
      aiConfidence: 0,
      performedBy: req.user._id,
      performedByName: req.user.name,
      performedByRole: req.user.role,
      details: { message: clarificationMessage },
    });

    res.json({
      success: true,
      message: 'Clarification request recorded.',
      data: prescription,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Generic prescription update
// @route   PUT /api/prescriptions/:id
// @access  Private (Staff only)
exports.updatePrescription = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.body.status === 'VERIFIED' || req.body.status === 'verified') {
      updateData.verifiedBy = req.user._id;
      updateData.verifiedAt = new Date();
    }

    const prescription = await Prescription.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('customer', 'name phone');

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }
    res.json({ success: true, data: prescription });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete prescription (Staff: Pharmacist, Admin)
// @route   DELETE /api/prescriptions/:id
// @access  Private (Staff only)
exports.deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    // Remove associated PrescriptionAnalysis
    if (prescription.aiAnalysis) {
      await PrescriptionAnalysis.findByIdAndDelete(prescription.aiAnalysis);
    }

    // Remove from Customer.prescriptions array
    if (prescription.customer) {
      await Customer.findByIdAndUpdate(prescription.customer, {
        $pull: { prescriptions: prescription._id },
      });
    }

    // Log deletion action
    await fairnessAuditService.logAudit({
      prescriptionId: prescription._id,
      action: 'PRESCRIPTION_DELETED',
      aiConfidence: 0,
      performedBy: req.user._id,
      performedByName: req.user.name,
      performedByRole: req.user.role,
      details: { deletedAt: new Date(), originalStatus: prescription.status },
    });

    await Prescription.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Prescription deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

