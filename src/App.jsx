import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import './index.css'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Customer pages
import CustomerLayout from './pages/customer/CustomerLayout'
import CustomerHome from './pages/customer/CustomerHome'
import ListingDetail from './pages/customer/ListingDetail'
import MyBookings from './pages/customer/MyBookings'

// Business pages
import BusinessLayout from './pages/business/BusinessLayout'
import BusinessDashboard from './pages/business/BusinessDashboard'
import AddListing from './pages/business/AddListing'
import EditListing from './pages/business/EditListing'
import BusinessBookings from './pages/business/BusinessBookings'

function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner" style={{ width: 36, height: 36 }} />
      </div>
    )
  }

  if (!user || !profile) return <Navigate to="/login" replace />
  if (requiredRole && profile.role !== requiredRole) {
    return <Navigate to={profile.role === 'business' ? '/business' : '/explore'} replace />
  }

  return children
}

function RootRedirect() {
  const { user, profile, loading } = useAuth()
  if (loading) return null
  if (!user || !profile) return <Navigate to="/" replace />
  if (profile.role === 'business') return <Navigate to="/business" replace />
  return <Navigate to="/explore" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Customer portal */}
          <Route path="/explore" element={
            <ProtectedRoute requiredRole="customer">
              <CustomerLayout />
            </ProtectedRoute>
          }>
            <Route index element={<CustomerHome />} />
            <Route path="listing/:id" element={<ListingDetail />} />
            <Route path="bookings" element={<MyBookings />} />
          </Route>

          {/* Business portal */}
          <Route path="/business" element={
            <ProtectedRoute requiredRole="business">
              <BusinessLayout />
            </ProtectedRoute>
          }>
            <Route index element={<BusinessDashboard />} />
            <Route path="add-listing" element={<AddListing />} />
            <Route path="edit-listing/:id" element={<EditListing />} />
            <Route path="bookings" element={<BusinessBookings />} />
          </Route>

          <Route path="/dashboard" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
