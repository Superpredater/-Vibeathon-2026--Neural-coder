import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'

// Auth pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import NotFoundPage from './pages/NotFoundPage'

// Signup forms
import CompanySignup from './pages/register/CompanySignup'
import DeliveryStaffSignup from './pages/register/DeliveryStaffSignup'
import CourierSignup from './pages/register/CourierSignup'
import FinanceSignup from './pages/register/FinanceSignup'

// Dashboards
import AdminDashboard from './pages/dashboards/AdminDashboard'
import DeliveryDashboard from './pages/dashboards/DeliveryDashboard'
import CourierDashboard from './pages/dashboards/CourierDashboard'
import FinanceDashboard from './pages/dashboards/FinanceDashboard'
import OpsDashboard from './pages/dashboards/OpsDashboard'

// Admin sub-pages
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage'

// Finance sub-pages
import LedgerPage from './pages/finance/LedgerPage'
import InvoicesPage from './pages/finance/InvoicesPage'
import ReportsPage from './pages/finance/ReportsPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Registration */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/company" element={<CompanySignup />} />
        <Route path="/register/delivery-staff" element={<DeliveryStaffSignup />} />
        <Route path="/register/courier" element={<CourierSignup />} />
        <Route path="/register/finance" element={<FinanceSignup />} />

        {/* Protected dashboards */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['company_admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['company_admin']}>
            <AdminUsersPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/orders" element={
          <ProtectedRoute allowedRoles={['company_admin']}>
            <AdminOrdersPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute allowedRoles={['company_admin']}>
            <AdminAnalyticsPage />
          </ProtectedRoute>
        } />
        <Route path="/delivery/*" element={
          <ProtectedRoute allowedRoles={['delivery_staff']}>
            <DeliveryDashboard />
          </ProtectedRoute>
        } />
        <Route path="/courier/*" element={
          <ProtectedRoute allowedRoles={['courier']}>
            <CourierDashboard />
          </ProtectedRoute>
        } />
        <Route path="/finance" element={
          <ProtectedRoute allowedRoles={['finance_staff']}>
            <FinanceDashboard />
          </ProtectedRoute>
        } />
        <Route path="/finance/ledger" element={
          <ProtectedRoute allowedRoles={['finance_staff']}>
            <LedgerPage />
          </ProtectedRoute>
        } />
        <Route path="/finance/invoices" element={
          <ProtectedRoute allowedRoles={['finance_staff']}>
            <InvoicesPage />
          </ProtectedRoute>
        } />
        <Route path="/finance/reports" element={
          <ProtectedRoute allowedRoles={['finance_staff']}>
            <ReportsPage />
          </ProtectedRoute>
        } />
        <Route path="/ops" element={
          <ProtectedRoute allowedRoles={['company_admin', 'delivery_staff', 'finance_staff']}>
            <OpsDashboard />
          </ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  )
}
