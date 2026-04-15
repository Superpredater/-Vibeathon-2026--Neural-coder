import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CompanySignup from './pages/register/CompanySignup'
import DeliveryStaffSignup from './pages/register/DeliveryStaffSignup'
import CourierSignup from './pages/register/CourierSignup'
import FinanceSignup from './pages/register/FinanceSignup'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/company" element={<CompanySignup />} />
      <Route path="/register/delivery-staff" element={<DeliveryStaffSignup />} />
      <Route path="/register/courier" element={<CourierSignup />} />
      <Route path="/register/finance" element={<FinanceSignup />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
