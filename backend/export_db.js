const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const User = require('./models/User');
const Medicine = require('./models/Medicine');
const Customer = require('./models/Customer');
const Prescription = require('./models/Prescription');
const PrescriptionAnalysis = require('./models/PrescriptionAnalysis');
const AIAudit = require('./models/AIAudit');
const Sale = require('./models/Sale');

const connectDB = require('./config/db');

async function exportDatabase() {
  await connectDB();
  console.log('📦 Connected to MongoDB. Exporting pharmacy_db collections...');

  const backupDir = path.join(__dirname, 'mongodb_backup');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const collections = [
    { name: 'users', model: User },
    { name: 'medicines', model: Medicine },
    { name: 'customers', model: Customer },
    { name: 'prescriptions', model: Prescription },
    { name: 'prescriptionanalyses', model: PrescriptionAnalysis },
    { name: 'aiaudits', model: AIAudit },
    { name: 'sales', model: Sale },
  ];

  for (const col of collections) {
    const data = await col.model.find({}).lean();
    const filePath = path.join(backupDir, `${col.name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✓ Exported ${data.length} records to ${col.name}.json`);
  }

  console.log('🎉 MongoDB export completed successfully to:', backupDir);
  process.exit(0);
}

exportDatabase().catch((err) => {
  console.error('Export failed:', err);
  process.exit(1);
});
