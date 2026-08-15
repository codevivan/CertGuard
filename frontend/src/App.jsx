import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { EventsPage } from './pages/EventsPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { SingleGeneratePage } from './pages/SingleGeneratePage';
import { BulkGeneratePage } from './pages/BulkGeneratePage';
import { PublicVerifyPage } from './pages/PublicVerifyPage';
import { CertificateDetailPage } from './pages/CertificateDetailPage';
import { VerificationLogsPage } from './pages/VerificationLogsPage';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/generate/single" element={<SingleGeneratePage />} />
            <Route path="/generate/bulk" element={<BulkGeneratePage />} />
            <Route path="/certificates/:id" element={<CertificateDetailPage />} />
            <Route path="/logs" element={<VerificationLogsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<PublicVerifyPage />} />
          <Route path="/verify/:certCode" element={<PublicVerifyPage />} />

          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'ORGANIZER']} />}>
            <Route path="/*" element={<DashboardLayout />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/verify" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
