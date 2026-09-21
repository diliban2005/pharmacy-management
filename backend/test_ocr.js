const { createWorker } = require('tesseract.js');
const path = require('path');
const fs = require('fs');

async function testOCR() {
  const imagePath = path.join(__dirname, 'uploads', 'prescriptions', 'customer-rx-1789665292181-830124917.jpg');
  console.log('Testing OCR on:', imagePath);
  console.log('File exists:', fs.existsSync(imagePath));

  const worker = await createWorker('eng');
  const ret = await worker.recognize(imagePath);
  console.log('--- OCR EXTRACTED TEXT START ---');
  console.log(ret.data.text);
  console.log('--- OCR EXTRACTED TEXT END ---');
  await worker.terminate();
}

testOCR().catch(console.error);
