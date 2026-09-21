const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { Jimp } = require('jimp');
dotenv.config();

const User = require('./models/User');
const Medicine = require('./models/Medicine');
const Customer = require('./models/Customer');
const Prescription = require('./models/Prescription');
const PrescriptionAnalysis = require('./models/PrescriptionAnalysis');
const AIAudit = require('./models/AIAudit');
const Sale = require('./models/Sale');

const connectDB = require('./config/db');

const createSamplePrescriptionImage = async (destPath) => {
  try {
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // Create a 800x1000 white canvas using Jimp
    const image = new Jimp({ width: 800, height: 1000, color: 0xffffffff });
    await image.write(destPath);
  } catch (err) {
    console.warn('Sample image note:', err.message);
  }
};

const seedData = async () => {
  await connectDB();

  await User.deleteMany();
  await Medicine.deleteMany();
  await Customer.deleteMany();
  await Prescription.deleteMany();
  await PrescriptionAnalysis.deleteMany();
  await AIAudit.deleteMany();
  await Sale.deleteMany();

  // 1. Seed Users (Admin & Pharmacists)
  const admin = await User.create({
    name: 'Dr. Elizabeth Warren (Admin)',
    email: 'admin@pharmacy.com',
    password: 'admin123',
    role: 'admin',
    phone: '9876543210',
    isActive: true,
  });

  const pharmacist1 = await User.create({
    name: 'John Pharmacist',
    email: 'john@pharmacy.com',
    password: 'john123',
    role: 'pharmacist',
    phone: '9876543211',
    isActive: true,
  });

  const pharmacist2 = await User.create({
    name: 'Sarah Connor (R.Ph)',
    email: 'sarah@pharmacy.com',
    password: 'sarah123',
    role: 'pharmacist',
    phone: '9876543212',
    isActive: true,
  });

  // 2. Seed Medicines Knowledge Base
  const medicines = await Medicine.create([
    {
      name: 'Paracetamol 500mg',
      genericName: 'Paracetamol',
      brandName: 'Dolo 500',
      strength: '500mg',
      dosageForm: 'Tablet',
      activeIngredients: ['Paracetamol'],
      aliases: ['PCM', 'Paracet', 'Acetaminophen', 'Dolo', 'Calpol'],
      commonMisspellings: ['paracetmol', 'paracetemol', 'pcm 500', 'paracitamol'],
      searchableNames: ['paracetamol 500', 'pcm', 'dolo', 'acetaminophen'],
      manufacturer: 'GSK',
      category: 'Tablet',
      batchNumber: 'B-PCM-01',
      expiryDate: new Date('2027-12-31'),
      purchasePrice: 2,
      sellingPrice: 5,
      quantity: 450,
      lowStockThreshold: 50,
      description: 'Analgesic and antipyretic medication for pain relief and fever.',
    },
    {
      name: 'Amoxicillin 250mg',
      genericName: 'Amoxicillin',
      brandName: 'Mox 250',
      strength: '250mg',
      dosageForm: 'Capsule',
      activeIngredients: ['Amoxicillin Trihydrate'],
      aliases: ['Amox', 'Amoxil', 'Amoxycillin'],
      commonMisspellings: ['amoxilin', 'amoxy', 'amox... 500', 'amoxil 250'],
      searchableNames: ['amoxicillin', 'amoxil', 'amox 250'],
      manufacturer: 'Cipla',
      category: 'Capsule',
      batchNumber: 'B-AMX-02',
      expiryDate: new Date('2026-08-30'),
      purchasePrice: 8,
      sellingPrice: 15,
      quantity: 180,
      lowStockThreshold: 30,
      description: 'Broad-spectrum beta-lactam antibiotic.',
    },
    {
      name: 'Amoxicillin 500mg',
      genericName: 'Amoxicillin',
      brandName: 'Augmentin-AMX',
      strength: '500mg',
      dosageForm: 'Capsule',
      activeIngredients: ['Amoxicillin Trihydrate'],
      aliases: ['Amox 500', 'Amoxil 500', 'Amoxy 500'],
      commonMisspellings: ['amoxilin 500', 'amox... 500'],
      searchableNames: ['amoxicillin 500', 'amox 500'],
      manufacturer: 'Cipla',
      category: 'Capsule',
      batchNumber: 'B-AMX-05',
      expiryDate: new Date('2026-11-15'),
      purchasePrice: 14,
      sellingPrice: 26,
      quantity: 120,
      lowStockThreshold: 25,
      description: 'High-strength antibiotic for acute bacterial infections.',
    },
    {
      name: 'Cetirizine 10mg',
      genericName: 'Cetirizine Dihydrochloride',
      brandName: 'Cetzine',
      strength: '10mg',
      dosageForm: 'Tablet',
      activeIngredients: ['Cetirizine Dihydrochloride'],
      aliases: ['Cetzine', 'Alerid', 'Zyrtec', 'Cetriz'],
      commonMisspellings: ['cetrizine', 'ceterizine', 'citrizine'],
      searchableNames: ['cetirizine', 'cetzine', 'alerid'],
      manufacturer: 'Dr. Reddy',
      category: 'Tablet',
      batchNumber: 'B-CTZ-04',
      expiryDate: new Date('2026-09-20'),
      purchasePrice: 1.5,
      sellingPrice: 4,
      quantity: 320,
      lowStockThreshold: 40,
      description: 'Second-generation antihistamine for allergic rhinitis and urticaria.',
    },
    {
      name: 'Azithromycin 500mg',
      genericName: 'Azithromycin',
      brandName: 'Azithral 500',
      strength: '500mg',
      dosageForm: 'Tablet',
      activeIngredients: ['Azithromycin Dihydrate'],
      aliases: ['Azithral', 'Azee', 'Zithromax', 'Azithro'],
      commonMisspellings: ['azithromicin', 'azithro 500', 'azithromycine'],
      searchableNames: ['azithromycin 500', 'azithral', 'azee'],
      manufacturer: 'Pfizer',
      category: 'Tablet',
      batchNumber: 'B-AZI-05',
      expiryDate: new Date('2027-03-10'),
      purchasePrice: 25,
      sellingPrice: 45,
      quantity: 90,
      lowStockThreshold: 20,
      description: 'Macrolide antibiotic for respiratory and skin infections.',
    },
    {
      name: 'Cough Syrup 100ml',
      genericName: 'Dextromethorphan + Chlorpheniramine',
      brandName: 'Koflet-DX',
      strength: '100ml',
      dosageForm: 'Syrup',
      activeIngredients: ['Dextromethorphan HBr', 'Chlorpheniramine Maleate'],
      aliases: ['Cough Syr', 'Koflet', 'Benadryl', 'Ascoril'],
      commonMisspellings: ['cough sirup', 'cough syr', 'koflet dx'],
      searchableNames: ['cough syrup', 'koflet', 'cough syr'],
      manufacturer: 'Himalaya',
      category: 'Syrup',
      batchNumber: 'B-CSY-06',
      expiryDate: new Date('2026-10-30'),
      purchasePrice: 35,
      sellingPrice: 65,
      quantity: 8, // Low stock on purpose
      lowStockThreshold: 15,
      description: 'Antitussive and soothing formulation for dry cough relief.',
    },
    {
      name: 'Ibuprofen 400mg',
      genericName: 'Ibuprofen',
      brandName: 'Brufen 400',
      strength: '400mg',
      dosageForm: 'Tablet',
      activeIngredients: ['Ibuprofen'],
      aliases: ['Brufen', 'Advil', 'Motrin'],
      commonMisspellings: ['ibrufen', 'ibuprufen', 'brufin'],
      searchableNames: ['ibuprofen 400', 'brufen'],
      manufacturer: 'Sun Pharma',
      category: 'Tablet',
      batchNumber: 'B-IBU-03',
      expiryDate: new Date('2026-08-15'),
      purchasePrice: 3,
      sellingPrice: 7,
      quantity: 6, // Low stock on purpose
      lowStockThreshold: 20,
      description: 'NSAID medication for inflammation and pain relief.',
    },
    {
      name: 'Pantoprazole 40mg',
      genericName: 'Pantoprazole Sodium',
      brandName: 'Pan 40',
      strength: '40mg',
      dosageForm: 'Tablet',
      activeIngredients: ['Pantoprazole Sodium'],
      aliases: ['Pan 40', 'Pantocid', 'Protonix'],
      commonMisspellings: ['pantop', 'pantaprazole', 'pan-40'],
      searchableNames: ['pantoprazole', 'pan 40', 'pantocid'],
      manufacturer: 'Alkem',
      category: 'Tablet',
      batchNumber: 'B-PAN-09',
      expiryDate: new Date('2027-02-28'),
      purchasePrice: 6,
      sellingPrice: 12,
      quantity: 210,
      lowStockThreshold: 30,
      description: 'Proton pump inhibitor for acid reflux and GERD.',
    },
    {
      name: 'Metformin 500mg',
      genericName: 'Metformin Hydrochloride',
      brandName: 'Glycomet 500',
      strength: '500mg',
      dosageForm: 'Tablet',
      activeIngredients: ['Metformin Hydrochloride'],
      aliases: ['Glycomet', 'Glucophage'],
      commonMisspellings: ['metaformin', 'metformin', 'glycomet'],
      searchableNames: ['metformin 500', 'glycomet'],
      manufacturer: 'USV',
      category: 'Tablet',
      batchNumber: 'B-MET-08',
      expiryDate: new Date('2026-10-01'),
      purchasePrice: 5,
      sellingPrice: 10,
      quantity: 250,
      lowStockThreshold: 30,
      description: 'First-line medication for type 2 diabetes management.',
    },
  ]);

  // 3. Seed Customers (with registered portal accounts & walk-ins)
  const customer1 = await Customer.create({
    name: 'Ramesh Kumar',
    phone: '9876543001',
    email: 'ramesh@gmail.com',
    password: 'customer123',
    hasAccount: true,
    address: '12 MG Road, Chennai, Tamil Nadu',
    dateOfBirth: new Date('1988-04-12'),
    gender: 'Male',
    totalPurchases: 250,
    isActive: true,
  });

  const customer2 = await Customer.create({
    name: 'Priya Sharma',
    phone: '9876543002',
    email: 'priya@gmail.com',
    password: 'customer123',
    hasAccount: true,
    address: '45 Anna Nagar, Madurai, Tamil Nadu',
    dateOfBirth: new Date('1994-09-25'),
    gender: 'Female',
    totalPurchases: 180,
    isActive: true,
  });

  const customer3 = await Customer.create({
    name: 'Suresh Babu (Walk-in)',
    phone: '9876543003',
    email: 'suresh@gmail.com',
    hasAccount: false,
    address: '7 Gandhi Street, Coimbatore, Tamil Nadu',
    gender: 'Male',
    totalPurchases: 45,
    isActive: true,
  });

  // Create sample prescription image file
  const sampleImgPath = path.join(__dirname, 'uploads/prescriptions/sample-rx-1024.png');
  await createSamplePrescriptionImage(sampleImgPath);

  // 4. Seed Prescriptions + Analyses
  const rx1 = await Prescription.create({
    customer: customer1._id,
    doctorName: 'Dr. Arun Kumar, M.D.',
    prescriptionImage: 'uploads/prescriptions/sample-rx-1024.png',
    originalFileName: 'handwritten-prescription-ramesh.png',
    fileType: 'image/png',
    fileSize: 450000,
    uploadedBy: customer1._id,
    uploadedByModel: 'Customer',
    date: new Date(),
    notes: 'Uploaded via customer portal for seasonal flu treatment',
    status: 'UNDER_PHARMACIST_REVIEW',
    prescribedMedicines: [
      {
        medicine: medicines[0]._id, // Paracetamol 500mg
        medicineName: 'Paracetamol 500mg',
        dosage: '1 tablet',
        frequency: 'Twice daily after meals',
        duration: '5 days',
        quantity: 10,
        confidence: 0.94,
        matchStatus: 'HIGH_CONFIDENCE',
        isVerified: false,
      },
      {
        medicine: medicines[1]._id, // Amoxicillin 250mg
        medicineName: 'Amoxicillin 250mg',
        dosage: '1 capsule',
        frequency: 'Every 8 hours',
        duration: '5 days',
        quantity: 15,
        confidence: 0.74,
        matchStatus: 'MEDIUM_CONFIDENCE',
        isVerified: false,
      },
      {
        medicine: medicines[3]._id, // Cetirizine 10mg
        medicineName: 'Cetirizine 10mg',
        dosage: '1 tablet',
        frequency: 'Once daily at night',
        duration: '3 days',
        quantity: 3,
        confidence: 0.96,
        matchStatus: 'HIGH_CONFIDENCE',
        isVerified: false,
      },
    ],
  });

  const analysis1 = await PrescriptionAnalysis.create({
    prescription: rx1._id,
    aiProvider: 'google-gemini',
    aiModel: 'gemini-2.0-flash',
    extractedDoctorName: 'Dr. Arun Kumar, M.D.',
    extractedDate: new Date().toISOString().split('T')[0],
    extractedMedicines: [
      {
        recognizedText: 'Paracetmol 500',
        matchedMedicine: medicines[0]._id,
        matchedMedicineName: 'Paracetamol 500mg',
        strength: '500mg',
        dosage: '1 tablet',
        frequency: 'Twice daily after meals',
        duration: '5 days',
        quantity: 10,
        confidence: 0.94,
        matchStatus: 'HIGH_CONFIDENCE',
        alternativeCandidates: [],
        uncertainReason: null,
        isHandwritten: true,
      },
      {
        recognizedText: 'Amox... 500',
        matchedMedicine: medicines[1]._id,
        matchedMedicineName: 'Amoxicillin 250mg',
        strength: '250mg',
        dosage: '1 capsule',
        frequency: 'Every 8 hours',
        duration: '5 days',
        quantity: 15,
        confidence: 0.74,
        matchStatus: 'MEDIUM_CONFIDENCE',
        alternativeCandidates: [
          {
            medicine: medicines[2]._id,
            name: 'Amoxicillin 500mg',
            sellingPrice: 26,
            quantity: 120,
            score: 0.72,
          },
        ],
        uncertainReason: 'Handwriting is partially unclear; two inventory medicines match (Amoxicillin 250mg vs 500mg). Confirmation required.',
        isHandwritten: true,
      },
      {
        recognizedText: 'Cetirizine 10mg',
        matchedMedicine: medicines[3]._id,
        matchedMedicineName: 'Cetirizine 10mg',
        strength: '10mg',
        dosage: '1 tablet',
        frequency: 'Once daily at night',
        duration: '3 days',
        quantity: 3,
        confidence: 0.96,
        matchStatus: 'HIGH_CONFIDENCE',
        alternativeCandidates: [],
        uncertainReason: null,
        isHandwritten: true,
      },
    ],
    overallConfidence: 0.88,
    uncertainFields: ['Amox... 500 strength'],
    requiresPharmacistReview: true,
    fairnessAudit: {
      protectedAttributesUsed: false,
      decisionBasedOnPrescriptionEvidence: true,
      humanReviewRequired: true,
      aiConfidence: 0.88,
      auditTimestamp: new Date(),
      auditNotes: [
        'Verification grounded solely on prescription visual evidence and pharmacy inventory',
        'No protected personal characteristics (gender, religion, ethnicity, caste, income, address, phone) utilized in recognition or verification logic',
        'Human-in-the-loop: Pharmacist holds sole authorization to confirm, modify, or reject dispensing',
      ],
    },
  });

  rx1.aiAnalysis = analysis1._id;
  await rx1.save();
  await Customer.findByIdAndUpdate(customer1._id, { $push: { prescriptions: rx1._id } });

  // AIAudit log for rx1
  await AIAudit.create({
    prescription: rx1._id,
    action: 'AI_ANALYSIS',
    protectedAttributesUsed: false,
    decisionBasedOnPrescriptionEvidence: true,
    humanReviewRequired: true,
    aiConfidence: 0.88,
    overrideOccurred: false,
    performedBy: pharmacist1._id,
    performedByName: 'AI Vision Engine',
    performedByRole: 'system',
    details: { medicinesExtracted: 3, note: 'Initial handwritten document analysis complete' },
  });

  // 5. Seed an already-verified prescription ready for billing
  const rx2 = await Prescription.create({
    customer: customer2._id,
    doctorName: 'Dr. Priya Sundaram, MBBS',
    prescriptionImage: 'uploads/prescriptions/sample-rx-1024.png',
    originalFileName: 'priya-prescription.png',
    fileType: 'image/png',
    fileSize: 320000,
    uploadedBy: customer2._id,
    uploadedByModel: 'Customer',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    notes: 'Verified regular asthma and allergy prescription',
    status: 'VERIFIED',
    verifiedBy: pharmacist1._id,
    verifiedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
    prescribedMedicines: [
      {
        medicine: medicines[4]._id, // Azithromycin 500mg
        medicineName: 'Azithromycin 500mg',
        dosage: '1 tablet',
        frequency: 'Once daily',
        duration: '3 days',
        quantity: 3,
        confidence: 0.98,
        matchStatus: 'HIGH_CONFIDENCE',
        isVerified: true,
      },
      {
        medicine: medicines[7]._id, // Pantoprazole 40mg
        medicineName: 'Pantoprazole 40mg',
        dosage: '1 tablet',
        frequency: 'Before breakfast',
        duration: '5 days',
        quantity: 5,
        confidence: 0.95,
        matchStatus: 'HIGH_CONFIDENCE',
        isVerified: true,
      },
    ],
  });

  await Customer.findByIdAndUpdate(customer2._id, { $push: { prescriptions: rx2._id } });

  // 6. Seed a completed Sale with invoice for customer 1
  await Sale.create({
    invoiceId: 'INV-2026-0001',
    customer: customer1._id,
    customerName: customer1.name,
    items: [
      {
        medicine: medicines[0]._id,
        medicineName: 'Paracetamol 500mg',
        quantity: 20,
        unitPrice: 5,
        totalPrice: 100,
      },
      {
        medicine: medicines[7]._id,
        medicineName: 'Pantoprazole 40mg',
        quantity: 10,
        unitPrice: 12,
        totalPrice: 120,
      },
    ],
    subtotal: 220,
    discount: 5,
    tax: 5,
    totalAmount: 219.45,
    paymentMethod: 'UPI',
    paymentStatus: 'paid',
    soldBy: pharmacist1._id,
    notes: 'Regular purchase',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  });

  console.log('✅ Database seeded with production-grade AI & pharmacy test data!');
  console.log('👥 Admin:       admin@pharmacy.com  / admin123');
  console.log('💊 Pharmacist:  john@pharmacy.com   / john123');
  console.log('💊 Pharmacist:  sarah@pharmacy.com  / sarah123');
  console.log('👤 Customer:    ramesh@gmail.com    / customer123');
  console.log('👤 Customer:    priya@gmail.com     / customer123');
  process.exit(0);
};

seedData().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
