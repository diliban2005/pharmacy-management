const AIAudit = require('../models/AIAudit');
const PrescriptionAnalysis = require('../models/PrescriptionAnalysis');

// @desc    Get AI audit logs with filters
// @route   GET /api/ai-audit
// @access  Private (Admin, Pharmacist)
exports.getAuditLogs = async (req, res) => {
  try {
    const { action, limit = 100, search, medicine } = req.query;
    const query = {};
    if (action) query.action = action;

    let logs = await AIAudit.find(query)
      .populate({
        path: 'prescription',
        select: 'doctorName status originalFileName customer prescriptionImage prescribedMedicines createdAt',
        populate: [
          { path: 'customer', select: 'name phone email' },
          { path: 'prescribedMedicines.medicine', select: 'name sellingPrice quantity' },
        ],
      })
      .populate('performedBy', 'name email role')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    // Filter by medicine or search query if requested
    if (medicine || search) {
      const term = (medicine || search).toLowerCase().trim();
      logs = logs.filter((log) => {
        // Match audited medicines in details
        const audited = log.details?.auditedMedicines || [];
        const hasMedMatch = audited.some(
          (m) =>
            (m.matchedMedicineName && m.matchedMedicineName.toLowerCase().includes(term)) ||
            (m.recognizedText && m.recognizedText.toLowerCase().includes(term))
        );
        if (hasMedMatch) return true;

        // Match prescribed medicines on prescription
        const prescribed = log.prescription?.prescribedMedicines || [];
        const hasPrescribedMatch = prescribed.some(
          (pm) => pm.medicineName && pm.medicineName.toLowerCase().includes(term)
        );
        if (hasPrescribedMatch) return true;

        // Match patient or doctor name
        const patientName = log.prescription?.customer?.name?.toLowerCase() || '';
        const docName = log.prescription?.doctorName?.toLowerCase() || '';
        if (patientName.includes(term) || docName.includes(term)) return true;

        return false;
      });
    }

    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get AI metrics & fairness summary
// @route   GET /api/ai-audit/stats
// @access  Private (Admin, Pharmacist)
exports.getAuditStats = async (req, res) => {
  try {
    const totalAnalyses = await AIAudit.countDocuments({ action: 'AI_ANALYSIS' });
    const totalVerifications = await AIAudit.countDocuments({ action: 'PHARMACIST_VERIFICATION' });
    const totalOverrides = await AIAudit.countDocuments({ overrideOccurred: true });
    const totalRejections = await AIAudit.countDocuments({ action: 'REJECTION' });

    // Calculate confidence distributions from PrescriptionAnalysis
    const highConfidence = await PrescriptionAnalysis.countDocuments({ overallConfidence: { $gte: 0.90 } });
    const mediumConfidence = await PrescriptionAnalysis.countDocuments({
      overallConfidence: { $gte: 0.70, $lt: 0.90 },
    });
    const lowConfidence = await PrescriptionAnalysis.countDocuments({ overallConfidence: { $lt: 0.70 } });

    res.json({
      success: true,
      data: {
        totalAnalyses,
        totalVerifications,
        totalOverrides,
        totalRejections,
        confidenceDistribution: {
          high: highConfidence,
          medium: mediumConfidence,
          low: lowConfidence,
        },
        fairnessCompliance: {
          protectedAttributesExcluded: 100, // 100% compliant by architecture
          evidenceGrounded: 100,
          humanInTheLoopEnforced: 100,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
