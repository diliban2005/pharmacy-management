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

async function restoreDatabase() {
  await connectDB();
  console.log('🔄 Connected to MongoDB. Restoring pharmacy_db from backup JSON files...');

  const backupDir = path.join(__dirname, 'mongodb_backup');
  if (!fs.existsSync(backupDir)) {
    console.error('Backup directory not found:', backupDir);
    process.exit(1);
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
    const filePath = path.join(backupDir, `${col.name}.json`);
    if (fs.existsSync(filePath)) {
      const records = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      await col.model.deleteMany({});
      if (records.length > 0) {
        await col.model.insertMany(records);
      }
      console.log(`✓ Restored ${records.length} records into ${col.name}`);
    }
  }

  console.log('🎉 MongoDB restoration completed successfully!');
  process.exit(0);
}

restoreDatabase().catch((err) => {
  console.error('Restore failed:', err);
  process.exit(1);
});
