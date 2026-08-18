import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Import Layouts
import VendorLayout from './vendor/layouts/VendorLayout'

// Import Pages
import Login from './vendor/pages/Login'
import ForgotPassword from './vendor/pages/ForgotPassword'
import Register from './vendor/pages/Register'
import KYC from './vendor/pages/KYC'
import Dashboard from './vendor/pages/Dashboard'
import Orders from './vendor/pages/Orders'
import Products from './vendor/pages/Products'
import Inventory from './vendor/pages/Inventory'
import Shop from './vendor/pages/Shop'

// Import Additional pages
import {
  Offers,
  Settlements,
  Returns,
  Reviews,
  Reports,
  Notifications,
  Staff,
  Support,
  Settings
} from './vendor/pages/AdditionalPages'

// Protected Route Guard
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('vendorToken')
  const vendorDataStr = localStorage.getItem('vendorData')
  
  if (!token || !vendorDataStr) {
    return <Navigate to="/vendor/login" replace />
  }

  try {
    const vendorData = JSON.parse(vendorDataStr)
    if (vendorData.onboardingStatus !== 'APPROVED') {
      return <Navigate to="/vendor/kyc" replace />
    }
  } catch (err) {
    return <Navigate to="/vendor/login" replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>

        {/* Auth routes */}
        <Route path="/vendor/login" element={<Login />} />
        <Route path="/vendor/forgot-password" element={<ForgotPassword />} />
        <Route path="/vendor/register" element={<Register />} />
        <Route path="/vendor/kyc" element={<KYC />} />

        {/* Dashboard wrapper routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <VendorLayout />
          </ProtectedRoute>
        }>
          {/* Index fallback redirection */}
          <Route index element={<Navigate to="/vendor/dashboard" replace />} />
          <Route path="vendor/dashboard" element={<Dashboard />} />
          <Route path="vendor/orders" element={<Orders />} />
          <Route path="vendor/products" element={<Products />} />
          <Route path="vendor/products/add" element={<Products />} />
          <Route path="vendor/products/edit/:id" element={<Products />} />
          <Route path="vendor/inventory" element={<Inventory />} />
          <Route path="vendor/shop" element={<Shop />} />
          <Route path="vendor/offers" element={<Offers />} />
          <Route path="vendor/settlements" element={<Settlements />} />
          <Route path="vendor/returns" element={<Returns />} />
          <Route path="vendor/reviews" element={<Reviews />} />
          <Route path="vendor/reports" element={<Reports />} />
          <Route path="vendor/notifications" element={<Notifications />} />
          <Route path="vendor/staff" element={<Staff />} />
          <Route path="vendor/support" element={<Support />} />
          <Route path="vendor/contact-support" element={<Support />} />
          <Route path="vendor/settings" element={<Settings />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/vendor/login" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
