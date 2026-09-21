const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();
connectDB();

// Ensure upload directories exist
const uploadDir = path.join(__dirname, 'uploads/prescriptions');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/customer-auth', require('./routes/customerAuth'));
app.use('/api/customer', require('./routes/customerPortal'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/pharmacists', require('./routes/pharmacists'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/ai-audit', require('./routes/aiAudit'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'AI-Assisted Pharmacy API running' }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app;
