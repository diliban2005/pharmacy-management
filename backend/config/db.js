const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('❌ MONGO_URI is missing in your environment (.env) file.');
    console.error('👉 Please set MONGO_URI in backend/.env to your MongoDB Atlas connection string.');
    process.exit(1);
  }

  const isCloud = uri.includes('mongodb+srv') || uri.includes('mongodb.net');

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });

    if (isCloud) {
      console.log(`☁️ Cloud MongoDB Atlas Connected!`);
      console.log(`   Host:     ${conn.connection.host}`);
      console.log(`   Database: ${conn.connection.name}`);
    } else {
      console.log(`💻 Local MongoDB Connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    }

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);

    if (isCloud) {
      console.error('\n⚠️  Troubleshooting Cloud MongoDB Atlas Connection:');
      console.error('   1. Network Access / IP Whitelist:');
      console.error('      In MongoDB Atlas -> Network Access -> Add IP Address -> click "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0).');
      console.error('   2. Database Credentials:');
      console.error('      In Atlas -> Database Access -> ensure your database user and password are correct.');
      console.error('   3. Special Characters in Password:');
      console.error('      If your password contains @, #, $, %, etc., URL-encode it (e.g., replace @ with %40) or use an alphanumeric password.');
      console.error('   4. Connection String Format:');
      console.error('      mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/pharmacy_db?retryWrites=true&w=majority\n');
    }

    process.exit(1);
  }
};

module.exports = connectDB;
