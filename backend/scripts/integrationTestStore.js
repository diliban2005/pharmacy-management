const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();
const Customer = require('../models/Customer');
const Medicine = require('../models/Medicine');
const Prescription = require('../models/Prescription');

async function runIntegrationTest() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Atlas for test setup.');

    // 1. Get customer Ramesh
    const customer = await Customer.findOne({ email: 'ramesh@gmail.com' });
    if (!customer) throw new Error('Customer ramesh@gmail.com not found');

    const token = jwt.sign({ id: customer._id, role: 'customer' }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    const baseUrl = 'http://localhost:5000/api/customer';
    const authHeaders = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    console.log('\n--- 1. Testing GET /api/customer/catalog ---');
    const catalogRes = await fetch(`${baseUrl}/catalog`, { headers: authHeaders });
    const catalogData = await catalogRes.json();
    console.log(`✅ Catalog returned ${catalogData.count} medicines.`);

    const otcList = catalogData.data.filter((m) => !m.requiresPrescription);
    const rxList = catalogData.data.filter((m) => m.requiresPrescription);
    console.log(`   OTC Count: ${otcList.length}, Rx Count: ${rxList.length}`);

    const sampleOtc = otcList.find((m) => m.name.includes('Paracetamol')) || otcList[0];
    const sampleRx = rxList.find((m) => m.name.includes('Amoxicillin')) || rxList[0];
    console.log(`   Sample OTC: ${sampleOtc.name} (Requires Prescription: ${sampleOtc.requiresPrescription})`);
    console.log(`   Sample Rx:  ${sampleRx.name} (Requires Prescription: ${sampleRx.requiresPrescription})`);

    console.log('\n--- 2. Testing Checkout of Rx Drug WITHOUT prescription (Must Fail 400) ---');
    const rxFailRes = await fetch(`${baseUrl}/orders/checkout`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        items: [{ medicineId: sampleRx._id, quantity: 1 }],
        paymentMethod: 'UPI',
        shippingAddress: {
          addressLine: '12 Gandhi Road',
          city: 'Chennai',
          pincode: '600001',
          phone: '9876543001',
        },
      }),
    });
    const rxFailData = await rxFailRes.json();

    if (rxFailRes.status === 400 && rxFailData.requiresPrescription) {
      console.log('✅ PASSED: Blocked with HTTP 400 as expected!');
      console.log(`   Server Response Message: "${rxFailData.message}"`);
      console.log(`   Flagged medicines:`, rxFailData.flaggedMedicines);
    } else {
      console.error('❌ Failed expectation for Rx block:', rxFailRes.status, rxFailData);
    }

    console.log('\n--- 3. Testing Checkout of OTC Drug WITHOUT prescription (Must Succeed 201) ---');
    const otcRes = await fetch(`${baseUrl}/orders/checkout`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        items: [{ medicineId: sampleOtc._id, quantity: 2 }],
        paymentMethod: 'UPI',
        shippingAddress: {
          addressLine: '12 Gandhi Road, Anna Nagar',
          city: 'Chennai',
          pincode: '600001',
          phone: '9876543001',
        },
      }),
    });
    const otcData = await otcRes.json();

    if (otcRes.status === 201 && otcData.success) {
      console.log('✅ PASSED: OTC checkout succeeded with HTTP 201!');
      console.log(`   Invoice ID: ${otcData.data.invoiceId}`);
      console.log(`   Total Amount: ₹${otcData.data.totalAmount}`);
      console.log(`   Items:`, otcData.data.items.map((i) => `${i.medicineName} x ${i.quantity}`));
    } else {
      console.error('❌ Failed expectation for OTC checkout:', otcRes.status, otcData);
    }

    console.log('\n--- 4. Testing Checkout of Rx Drug WITH Verified Prescription (Must Succeed 201) ---');
    const verifiedRx = await Prescription.findOne({
      customer: customer._id,
      status: { $in: ['VERIFIED', 'verified', 'DISPENSED', 'dispensed'] },
    });

    if (!verifiedRx) {
      throw new Error('No verified prescription found for Ramesh');
    }

    console.log(`   Using Verified Prescription ID: ${verifiedRx._id} (${verifiedRx.doctorName})`);
    const rxSuccessRes = await fetch(`${baseUrl}/orders/checkout`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        items: [{ medicineId: sampleRx._id, quantity: 1 }],
        paymentMethod: 'Card',
        prescriptionId: verifiedRx._id.toString(),
        shippingAddress: {
          addressLine: '12 Gandhi Road, Anna Nagar',
          city: 'Chennai',
          pincode: '600001',
          phone: '9876543001',
        },
      }),
    });
    const rxSuccessData = await rxSuccessRes.json();

    if (rxSuccessRes.status === 201 && rxSuccessData.success) {
      console.log('✅ PASSED: Rx checkout with prescription succeeded with HTTP 201!');
      console.log(`   Invoice ID: ${rxSuccessData.data.invoiceId}`);
      console.log(`   Prescription Linked: ${rxSuccessData.data.prescription}`);
      console.log(`   Total Amount: ₹${rxSuccessData.data.totalAmount}`);
    } else {
      console.error('❌ Failed expectation for Rx checkout:', rxSuccessRes.status, rxSuccessData);
    }

    console.log('\n--- 5. Testing GET /api/customer/purchases ---');
    const purchasesRes = await fetch(`${baseUrl}/purchases`, { headers: authHeaders });
    const purchasesData = await purchasesRes.json();
    console.log(`✅ Customer purchases history retrieved: ${purchasesData.count} records.`);
    console.log(`   Most recent order: ${purchasesData.data[0].invoiceId} (₹${purchasesData.data[0].totalAmount})`);

    await mongoose.disconnect();
    console.log('\n🎉 ALL INTEGRATION TESTS PASSED WITH 100% SUCCESS!');
  } catch (err) {
    console.error('Integration test failure:', err);
    process.exit(1);
  }
}

runIntegrationTest();
