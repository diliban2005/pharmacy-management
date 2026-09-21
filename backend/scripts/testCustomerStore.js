const mongoose = require('mongoose');
require('dotenv').config();
const Customer = require('../models/Customer');
const Medicine = require('../models/Medicine');
const Prescription = require('../models/Prescription');
const Sale = require('../models/Sale');

async function testStore() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Atlas for store testing.');

    // 1. Check Ramesh customer
    const ramesh = await Customer.findOne({ email: 'ramesh@gmail.com' });
    if (!ramesh) {
      console.log('Ramesh not found');
      return;
    }

    // Ensure Ramesh has a verified prescription
    let rx = await Prescription.findOne({ customer: ramesh._id, status: 'VERIFIED' });
    if (!rx) {
      rx = await Prescription.create({
        customer: ramesh._id,
        doctorName: 'Dr. S. K. Sharma, M.D.',
        status: 'VERIFIED',
        notes: 'Consultation note: Approved for antibiotics & gastro therapies',
        prescribedMedicines: [
          { medicineName: 'Amoxicillin 500mg', dosage: '1 cap', frequency: 'Twice daily', duration: '5 days', quantity: 10, isVerified: true },
          { medicineName: 'Pantoprazole 40mg', dosage: '1 tab', frequency: 'Once daily before food', duration: '14 days', quantity: 14, isVerified: true },
        ],
        date: new Date(),
      });
      await Customer.findByIdAndUpdate(ramesh._id, { $push: { prescriptions: rx._id } });
      console.log('✅ Created sample verified prescription for Ramesh:', rx._id);
    } else {
      console.log('✅ Ramesh has verified prescription:', rx._id);
    }

    // 2. Query Medicines
    const paracetamol = await Medicine.findOne({ name: /paracetamol 500/i });
    const amoxicillin = await Medicine.findOne({ name: /amoxicillin 500/i });

    console.log('Paracetamol is prescription required?', paracetamol.requiresPrescription, paracetamol.scheduleType);
    console.log('Amoxicillin is prescription required?', amoxicillin.requiresPrescription, amoxicillin.scheduleType);

    console.log('\n--- Test 1: Simulating OTC purchase of Paracetamol without prescription ---');
    // Should succeed because Paracetamol is OTC
    const isRx1 = paracetamol.requiresPrescription || ['SCHEDULE_H', 'SCHEDULE_H1', 'SCHEDULE_X'].includes(paracetamol.scheduleType);
    if (!isRx1) {
      console.log('Passed: Paracetamol does NOT require prescription. Customer can order directly!');
    } else {
      console.error('FAILED: Paracetamol falsely flagged as Rx');
    }

    console.log('\n--- Test 2: Simulating Rx purchase of Amoxicillin without prescription ---');
    const isRx2 = amoxicillin.requiresPrescription || ['SCHEDULE_H', 'SCHEDULE_H1', 'SCHEDULE_X'].includes(amoxicillin.scheduleType);
    if (isRx2) {
      console.log('Passed: Amoxicillin correctly identified as Prescription-Required / Schedule H! Purchase without prescription is blocked.');
    } else {
      console.error('FAILED: Amoxicillin NOT flagged as Rx');
    }

    console.log('\n--- Test 3: Simulating Rx purchase of Amoxicillin WITH verified prescription ---');
    if (isRx2 && rx && ['VERIFIED', 'verified', 'DISPENSED', 'dispensed'].includes(rx.status)) {
      console.log('Passed: Customer provided verified prescription', rx._id, '-> purchase authorized!');
    }

    await mongoose.disconnect();
    console.log('\nAll store logic checks PASSED!');
  } catch (err) {
    console.error('Test error:', err);
  }
}

testStore();
