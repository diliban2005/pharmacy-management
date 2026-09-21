const Prescription = require('../models/Prescription');
const Sale = require('../models/Sale');
const Customer = require('../models/Customer');
const aiPrescriptionService = require('../services/aiPrescriptionService');
const medicineMatchingService = require('../services/medicineMatchingService');
const fairnessAuditService = require('../services/fairnessAuditService');
const PrescriptionAnalysis = require('../models/PrescriptionAnalysis');

// @desc    Customer uploads a prescription
// @route   POST /api/customer/prescriptions/upload
// @access  Private (Customer only)
exports.uploadPrescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please attach a prescription document (JPG, PNG, or PDF)' });
    }

    const customerId = req.user._id;
    const { doctorName, notes } = req.body;

    // Normalizing file path with forward slashes
    const normalizedFilePath = req.file.path.replace(/\\/g, '/');

    const prescription = await Prescription.create({
      customer: customerId,
      doctorName: doctorName?.trim() || 'Pending AI Extraction',
      prescriptionImage: normalizedFilePath,
      originalFileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: customerId,
      uploadedByModel: 'Customer',
      notes: notes || '',
      status: 'UPLOADED',
    });

    // Link prescription to Customer document
    await Customer.findByIdAndUpdate(customerId, {
      $push: { prescriptions: prescription._id },
    });

    // Optionally kick off async background image preprocessing & AI analysis
    // Run asynchronously without blocking customer response
    (async () => {
      try {
        await Prescription.findByIdAndUpdate(prescription._id, { status: 'AI_ANALYZING' });

        const processedPath = await aiPrescriptionService.preprocessImage(req.file.path);
        if (processedPath) {
          await Prescription.findByIdAndUpdate(prescription._id, {
            processedImage: processedPath.replace(/\\/g, '/'),
          });
        }

        const aiResult = await aiPrescriptionService.analyzePrescription({
          filePath: processedPath || req.file.path,
          originalFileName: req.file.originalname,
        });

        // Match extracted medicines with inventory
        const matchedMedicines = await medicineMatchingService.matchAllMedicines(aiResult.medicines);

        // Generate fairness audit object
        const fairnessReport = fairnessAuditService.createFairnessReport(
          aiResult.overallConfidence,
          aiResult.uncertainFields
        );

        // Create PrescriptionAnalysis
        const analysis = await PrescriptionAnalysis.create({
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

        // Update Prescription with analysis and set status to UNDER_PHARMACIST_REVIEW
        const updateFields = {
          status: 'UNDER_PHARMACIST_REVIEW',
          aiAnalysis: analysis._id,
          prescribedMedicines: matchedMedicines.map((m) => ({
            medicine: m.matchedMedicine,
            medicineName: m.matchedMedicineName || m.recognizedText,
            dosage: m.dosage,
            frequency: m.frequency,
            duration: m.duration,
            quantity: m.quantity,
            confidence: m.confidence,
            matchStatus: m.matchStatus,
            isVerified: false,
          })),
        };

        if (aiResult.doctorName && prescription.doctorName === 'Pending AI Extraction') {
          updateFields.doctorName = aiResult.doctorName;
        }

        await Prescription.findByIdAndUpdate(prescription._id, updateFields);

        // Log to AIAudit
        await fairnessAuditService.logAudit({
          prescriptionId: prescription._id,
          action: 'AI_ANALYSIS',
          aiConfidence: aiResult.overallConfidence,
          performedByName: 'AI Vision Engine',
          performedByRole: 'system',
          details: {
            model: aiResult.model,
            medicinesExtracted: matchedMedicines.length,
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
      } catch (bgErr) {
        console.error('Background AI analysis error:', bgErr.message);
        // Ensure status safely lands on UNDER_PHARMACIST_REVIEW even if AI fails
        await Prescription.findByIdAndUpdate(prescription._id, {
          status: 'UNDER_PHARMACIST_REVIEW',
          pharmacistNotes: 'AI analysis encountered an issue. Manual pharmacist review required.',
        });
      }
    })();

    res.status(201).json({
      success: true,
      message: 'Prescription uploaded successfully. Pharmacy verification is under review.',
      data: prescription,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged-in customer's own prescriptions
// @route   GET /api/customer/prescriptions
// @access  Private (Customer only)
exports.getCustomerPrescriptions = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { status } = req.query;

    const query = { customer: customerId };
    if (status) query.status = status;

    const prescriptions = await Prescription.find(query)
      .populate('prescribedMedicines.medicine', 'name sellingPrice manufacturer')
      .populate('verifiedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: prescriptions.length,
      data: prescriptions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single prescription detail for logged-in customer
// @route   GET /api/customer/prescriptions/:id
// @access  Private (Customer only)
exports.getCustomerPrescription = async (req, res) => {
  try {
    const customerId = req.user._id;
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      customer: customerId,
    })
      .populate('prescribedMedicines.medicine', 'name sellingPrice manufacturer category')
      .populate('verifiedBy', 'name')
      .populate('aiAnalysis');

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    res.json({ success: true, data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged-in customer's purchase history and invoices
// @route   GET /api/customer/purchases
// @access  Private (Customer only)
exports.getCustomerPurchases = async (req, res) => {
  try {
    const customerId = req.user._id;
    const sales = await Sale.find({ customer: customerId })
      .populate('soldBy', 'name')
      .populate('prescription', 'doctorName date')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: sales.length,
      data: sales,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single invoice detail for customer
// @route   GET /api/customer/purchases/:id
// @access  Private (Customer only)
exports.getCustomerInvoice = async (req, res) => {
  try {
    const customerId = req.user._id;
    const sale = await Sale.findOne({ _id: req.params.id, customer: customerId })
      .populate('soldBy', 'name')
      .populate('prescription');

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({ success: true, data: sale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Customer deletes their own uploaded prescription (if not dispensed)
// @route   DELETE /api/customer/prescriptions/:id
// @access  Private (Customer only)
exports.deleteCustomerPrescription = async (req, res) => {
  try {
    const customerId = req.user._id;
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      customer: customerId,
    });

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    // Remove from Customer array
    await Customer.findByIdAndUpdate(customerId, {
      $pull: { prescriptions: prescription._id },
    });

    // Remove AI analysis if exists
    if (prescription.aiAnalysis) {
      await PrescriptionAnalysis.findByIdAndDelete(prescription.aiAnalysis);
    }

    await Prescription.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Prescription deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

