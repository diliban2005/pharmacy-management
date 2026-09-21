import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import Layout from './components/layout/Layout';
import CustomerLayout from './components/customer/CustomerLayout';

// Staff Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Medicines from './pages/Medicines';
import MedicineForm from './pages/MedicineForm';
import Customers from './pages/Customers';
import CustomerForm from './pages/CustomerForm';
import Prescriptions from './pages/Prescriptions';
import PrescriptionForm from './pages/PrescriptionForm';
import PrescriptionReview from './pages/PrescriptionReview';
import Billing from './pages/Billing';
import SalesHistory from './pages/SalesHistory';
import Reports from './pages/Reports';
import Pharmacists from './pages/Pharmacists';
import AIAuditLogs from './pages/AIAuditLogs';
import Settings from './pages/Settings';

// Customer Pages
import CustomerLogin from './pages/customer/CustomerLogin';
import CustomerRegister from './pages/customer/CustomerRegister';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerPrescriptions from './pages/customer/CustomerPrescriptions';
import CustomerUploadPrescription from './pages/customer/CustomerUploadPrescription';
import CustomerPurchases from './pages/customer/CustomerPurchases';
import CustomerProfile from './pages/customer/CustomerProfile';
import CustomerStore from './pages/customer/CustomerStore';
import LandingPage from './pages/LandingPage';

const StaffRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'customer') return <Navigate to="/customer/dashboard" replace />;
  return children;
};

const AdminOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const CustomerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent" />
      </div>
    );
  }
  if (!user) return <Navigate to="/customer/login" replace />;
  if (user.role !== 'customer') return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    return user.role === 'customer' ? (
      <Navigate to="/customer/dashboard" replace />
    ) : (
      <Navigate to="/dashboard" replace />
    );
  }
  return children;
};

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'customer' ? (
    <Navigate to="/customer/dashboard" replace />
  ) : (
    <Navigate to="/dashboard" replace />
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {/* Public Auth Routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/customer/login" element={<PublicRoute><CustomerLogin /></PublicRoute>} />
      <Route path="/customer/register" element={<PublicRoute><CustomerRegister /></PublicRoute>} />

      {/* Staff Routes (Admin & Pharmacist) */}
      <Route element={<StaffRoute><Layout /></StaffRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/prescriptions" element={<Prescriptions />} />
        <Route path="/prescriptions/new" element={<PrescriptionForm />} />
        <Route path="/prescriptions/:id/review" element={<PrescriptionReview />} />
        <Route path="/medicines" element={<Medicines />} />
        <Route path="/medicines/new" element={<MedicineForm />} />
        <Route path="/medicines/edit/:id" element={<MedicineForm />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/new" element={<CustomerForm />} />
        <Route path="/customers/edit/:id" element={<CustomerForm />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/sales" element={<SalesHistory />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/ai-audit" element={<AIAuditLogs />} />
        <Route path="/pharmacists" element={<AdminOnlyRoute><Pharmacists /></AdminOnlyRoute>} />
        <Route path="/settings" element={<AdminOnlyRoute><Settings /></AdminOnlyRoute>} />
      </Route>

      {/* Customer Portal Routes */}
      <Route element={<CustomerRoute><CustomerLayout /></CustomerRoute>}>
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/customer/store" element={<CustomerStore />} />
        <Route path="/customer/medicines" element={<CustomerStore />} />
        <Route path="/customer/prescriptions" element={<CustomerPrescriptions />} />
        <Route path="/customer/upload" element={<CustomerUploadPrescription />} />
        <Route path="/customer/purchases" element={<CustomerPurchases />} />
        <Route path="/customer/profile" element={<CustomerProfile />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
