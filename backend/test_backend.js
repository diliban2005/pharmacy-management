const http = require('http');
const app = require('./server');

let server;
const PORT = 5055;

async function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, text: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  server = app.listen(PORT, async () => {
    console.log(`Test server running on port ${PORT}...`);
    try {
      // 1. Staff Login: Admin
      console.log('--- Test 1: Admin Login ---');
      const adminRes = await request(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/auth/login',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        { email: 'admin@pharmacy.com', password: 'admin123' }
      );
      if (adminRes.status !== 200 || !adminRes.data.token) throw new Error('Admin login failed: ' + JSON.stringify(adminRes));
      console.log('✓ Admin login successful');
      const adminToken = adminRes.data.token;

      // 2. Staff Login: Pharmacist
      console.log('--- Test 2: Pharmacist Login ---');
      const pharmRes = await request(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/auth/login',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        { email: 'john@pharmacy.com', password: 'john123' }
      );
      if (pharmRes.status !== 200 || !pharmRes.data.token) throw new Error('Pharmacist login failed: ' + JSON.stringify(pharmRes));
      console.log('✓ Pharmacist login successful');
      const pharmToken = pharmRes.data.token;

      // 3. Customer Login
      console.log('--- Test 3: Customer Login ---');
      const custRes = await request(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/customer-auth/login',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        { email: 'ramesh@gmail.com', password: 'customer123' }
      );
      if (custRes.status !== 200 || !custRes.data.token) throw new Error('Customer login failed: ' + JSON.stringify(custRes));
      console.log('✓ Customer login successful');
      const custToken = custRes.data.token;

      // 4. Role Isolation: Customer trying to access Admin-only /api/pharmacists
      console.log('--- Test 4: Role Isolation Security Check ---');
      const forbiddenRes = await request({
        hostname: 'localhost',
        port: PORT,
        path: '/api/pharmacists',
        method: 'GET',
        headers: { Authorization: `Bearer ${custToken}` },
      });
      if (forbiddenRes.status !== 403) throw new Error('Security flaw: Customer accessed admin route! Status: ' + forbiddenRes.status);
      console.log('✓ Customer properly blocked from admin route (HTTP 403)');

      // 5. Customer Prescriptions List
      console.log('--- Test 5: Customer View Prescriptions ---');
      const myRxRes = await request({
        hostname: 'localhost',
        port: PORT,
        path: '/api/customer/prescriptions',
        method: 'GET',
        headers: { Authorization: `Bearer ${custToken}` },
      });
      if (myRxRes.status !== 200 || !Array.isArray(myRxRes.data.data)) throw new Error('Failed to get customer prescriptions');
      console.log(`✓ Customer retrieved ${myRxRes.data.count} prescriptions`);

      // 6. Pharmacist Prescriptions Queue
      console.log('--- Test 6: Pharmacist View Prescription Queue ---');
      const queueRes = await request({
        hostname: 'localhost',
        port: PORT,
        path: '/api/prescriptions',
        method: 'GET',
        headers: { Authorization: `Bearer ${pharmToken}` },
      });
      if (queueRes.status !== 200 || !Array.isArray(queueRes.data.data)) throw new Error('Failed to get staff prescriptions');
      console.log(`✓ Pharmacist retrieved queue with ${queueRes.data.count} prescriptions`);
      const sampleRx = queueRes.data.data[0];

      // 7. AI Analysis Endpoint
      console.log('--- Test 7: AI Vision & Matching Analysis ---');
      const analyzeRes = await request({
        hostname: 'localhost',
        port: PORT,
        path: `/api/prescriptions/${sampleRx._id}/analyze`,
        method: 'POST',
        headers: { Authorization: `Bearer ${pharmToken}` },
      });
      if (analyzeRes.status !== 200 || !analyzeRes.data.data.aiAnalysis) throw new Error('AI analysis failed: ' + JSON.stringify(analyzeRes));
      console.log('✓ AI Vision Analysis ran cleanly. Status:', analyzeRes.data.data.status);

      // 8. Pharmacist Verification (Human-in-the-Loop)
      console.log('--- Test 8: Pharmacist Human-in-the-Loop Verification ---');
      const verifyRes = await request(
        {
          hostname: 'localhost',
          port: PORT,
          path: `/api/prescriptions/${sampleRx._id}/verify`,
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${pharmToken}`,
          },
        },
        {
          doctorName: 'Dr. Arun Kumar, M.D.',
          pharmacistNotes: 'Verified patient dosage and confirmed formulation.',
          verifiedMedicines: sampleRx.prescribedMedicines.map((m) => ({
            medicine: m.medicine?._id || m.medicine,
            medicineName: m.medicineName,
            dosage: m.dosage,
            frequency: m.frequency,
            duration: m.duration,
            quantity: m.quantity || 1,
          })),
        }
      );
      if (verifyRes.status !== 200 || verifyRes.data.data.status !== 'VERIFIED') throw new Error('Verification failed: ' + JSON.stringify(verifyRes));
      console.log('✓ Prescription successfully transitioned to VERIFIED status');

      // 9. Billing & Dispensing of Verified Prescription
      console.log('--- Test 9: Billing & Dispensing Integration ---');
      const verifiedRx = verifyRes.data.data;
      const checkoutRes = await request(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/sales',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${pharmToken}`,
          },
        },
        {
          prescription: verifiedRx._id,
          customer: verifiedRx.customer._id || verifiedRx.customer,
          customerName: 'Ramesh Kumar',
          paymentMethod: 'Cash',
          items: [
            {
              medicine: verifiedRx.prescribedMedicines[0].medicine._id || verifiedRx.prescribedMedicines[0].medicine,
              quantity: 2,
            },
          ],
        }
      );
      if (checkoutRes.status !== 201 || !checkoutRes.data.data.invoiceId) throw new Error('Checkout failed: ' + JSON.stringify(checkoutRes));
      console.log('✓ Sale created successfully with Invoice:', checkoutRes.data.data.invoiceId);

      // 10. Verify Prescription status became DISPENSED
      const checkRxRes = await request({
        hostname: 'localhost',
        port: PORT,
        path: `/api/prescriptions/${verifiedRx._id}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${pharmToken}` },
      });
      if (checkRxRes.data.data.status !== 'DISPENSED') throw new Error('Expected status DISPENSED but found: ' + checkRxRes.data.data.status);
      console.log('✓ Prescription automatically marked as DISPENSED after billing');

      // 11. AI Audit & Fairness stats
      console.log('--- Test 11: AI Audit & Fairness Compliance Metrics ---');
      const auditRes = await request({
        hostname: 'localhost',
        port: PORT,
        path: '/api/ai-audit/stats',
        method: 'GET',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (auditRes.status !== 200 || auditRes.data.data.fairnessCompliance.protectedAttributesExcluded !== 100) {
        throw new Error('Fairness check failed');
      }
      console.log('✓ Fairness-by-design audit verified: 100% compliance');

      console.log('\n=============================================');
      console.log('🎉 ALL 11 BACKEND INTEGRATION TESTS PASSED!');
      console.log('=============================================\n');
      process.exit(0);
    } catch (err) {
      console.error('\n❌ Test failure:', err.message);
      process.exit(1);
    } finally {
      server.close();
    }
  });
}

runTests();
