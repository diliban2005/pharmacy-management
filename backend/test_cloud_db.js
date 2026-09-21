const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

async function testConnection() {
  const uri = process.argv[2] || process.env.MONGO_URI;

  console.log('================================================================');
  console.log('🔍 TESTING MONGODB DATABASE CONNECTION');
  console.log('================================================================\n');

  if (!uri) {
    console.error('❌ MONGO_URI is not defined in your .env file or command line.');
    process.exit(1);
  }

  const isCloud = uri.includes('mongodb+srv') || uri.includes('mongodb.net');
  const maskedUri = uri.replace(/:(.*?)@/, ':******@');

  console.log(`Connection Type : ${isCloud ? '☁️  Cloud MongoDB Atlas' : '💻 Local MongoDB'}`);
  console.log(`URI             : ${maskedUri}\n`);
  console.log('⏳ Connecting...');

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Connection Successful!');
    console.log(`   Host:     ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}\n`);

    console.log('📊 Inspecting Database Collections & Record Counts:');
    const collections = ['users', 'medicines', 'customers', 'prescriptions', 'prescriptionanalyses', 'aiaudits', 'sales'];

    for (const name of collections) {
      const col = conn.connection.collection(name);
      const count = await col.countDocuments();
      const statusIcon = count > 0 ? '✓' : '⚠️';
      console.log(`   ${statusIcon} ${name.padEnd(24)} : ${count} records`);
    }

    console.log('\n================================================================');
    console.log('🎉 DATABASE IS OPERATIONAL AND READY FOR USE!');
    console.log('================================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection Failed:', error.message);
    if (isCloud) {
      console.error('\n⚠️  Troubleshooting Cloud MongoDB Atlas Connection:');
      console.error('   1. Network Access / IP Whitelist:');
      console.error('      In MongoDB Atlas -> Network Access -> Add IP Address -> click "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0).');
      console.error('   2. Database User & Password:');
      console.error('      Verify the username and password in your connection string.');
      console.error('   3. URL Encoding:');
      console.error('      If your password has special characters like @, #, $, %, etc., encode them or change to an alphanumeric password.');
      console.error('   4. Connection String:');
      console.error('      mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/pharmacy_db?retryWrites=true&w=majority\n');
    }
    process.exit(1);
  }
}

testConnection();
