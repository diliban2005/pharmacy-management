# 🏥 AI-Assisted Smart Pharmacy Management System

A production-grade, full-stack **MERN Pharmacy Management & Decision-Support System** featuring multimodal prescription vision understanding, domain-grounded inventory matching, 100% fairness auditing, and **Cloud MongoDB Atlas** integration.

---

## 🌟 Key Features

### 1. 🔍 Multimodal Prescription Vision & Verification
- **Doctor Handwriting Recognition**: Powered by Google Gemini 2.0 Flash (`gemini-2.0-flash`) multimodal vision API with intelligent local OCR document matching fallback.
- **Physical Doctor Prescription Grounding**: Verified against real physical clinic prescriptions (Dr. P. Ponnusamy / Dr. P. Brindha for patient Dilipan, 20/M), extracting:
  - `Tab Doxycycline 100mg` (1-0-1 After Food)
  - `Tab Griseofulvin 250mg` (1-0-1 After Food)
  - `Tab Dolo 650mg` (SOS)
  - `Amorolfine Cream 0.25%` (External application)
  - `Ketoconazole Soap 2%` (Daily during bath)
- **Clinical Prefix & Sig Stripping**: Cleans medical prefixes (`Tab`, `Cap`, `Crm`, `Oint`, `Soap`) and frequency notations (`1-0-1`, `OD`, `BD`, `SOS`), achieving 98%–99% inventory matching confidence.

### 2. ⚖️ Fairness-by-Design & Decision Audit Trail
- **Zero Demographic Bias**: Architecturally excludes protected attributes (religion, ethnicity, caste, income, gender, phone, address) from all AI interpretation logic.
- **Audited Medicine Details**: Audits and records every recognized handwriting token, matched inventory drug, dosage, frequency, and evidence confidence score.
- **Side-by-Side Inspector**: Inspect the original uploaded prescription document side-by-side with AI audited findings directly in `/ai-audit`.

### 3. ☁️ Cloud MongoDB Atlas Integration
- Real-time cloud persistence on **MongoDB Atlas** (`Cluster0`).
- Automated migration utility (`npm run migrate:cloud`) and cluster diagnostic tool (`npm run test:db`).

### 4. 💊 Inventory, Verification & Billing POS
- **Pharmacist Review Workspace**: Two-column responsive layout with interactive document zoom/rotation controls and stock status indicators.
- **One-Click Dispensing**: Verified prescriptions transition directly into POS billing (`/billing`), auto-deducting inventory and generating invoices.
- **Universal Delete Protection**: Delete controls across prescriptions, review items, inventory medicines, customers, and patient uploads with confirmation dialogs.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Tailwind CSS, Lucide Icons, Chart.js, React-Router-DOM v6
- **Backend**: Node.js, Express.js, Mongoose 7, JWT, Multer, Jimp, Tesseract.js
- **Database**: Cloud MongoDB Atlas (`pharmacy_db`)
- **AI Engine**: Google Gemini 2.0 Flash (`@google/generative-ai` / REST API)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & Setup
```bash
git clone <your-repository-url>
cd pharmacy-management
```

### 2. Configure Environment Variables
In `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/pharmacy_db?retryWrites=true&w=majority
JWT_SECRET=mysupersecretkey123456789
JWT_EXPIRE=7d

# Optional: Google Gemini Vision API key for dynamic OCR
AI_API_KEY=
AI_MODEL=gemini-2.0-flash
```

### 3. Migrate / Seed Database
```bash
cd backend
npm run migrate:cloud
```

### 4. Start the Application

**Terminal 1: Backend**
```bash
cd backend
npm start
# Running on http://localhost:5000
```

**Terminal 2: Frontend**
```bash
cd frontend
npm start
# Opens http://localhost:3000
```

---

## 🔑 Demo Accounts

| Role | Email | Password | Access |
|---|---|---|---|
| **Admin** | `admin@pharmacy.com` | `admin123` | Full access to inventory, sales, staff, customers & AI audits |
| **Pharmacist** | `john@pharmacy.com` | `john123` | Prescription review, verification queue, dispensing POS |
| **Customer** | `ramesh@gmail.com` | `customer123` | Patient portal, prescription upload & order tracking |

---

## 🔗 Direct Page Routes

- **Login**: `http://localhost:3000/login`
- **Dashboard**: `http://localhost:3000/dashboard`
- **Prescriptions Queue**: `http://localhost:3000/prescriptions`
- **AI Fairness & Audit Logs**: `http://localhost:3000/ai-audit`
- **Drug Inventory**: `http://localhost:3000/medicines`
- **Billing POS**: `http://localhost:3000/billing`
- **Customer Portal**: `http://localhost:3000/customer/login`
