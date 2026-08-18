import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import AdminPanel from './admin/AdminPanel'
import Login from './pages/Login'
import { Toaster } from 'react-hot-toast'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken')
  const location = useLocation()
  
  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }
  
  return children
}

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/:tab" element={
        <PrivateRoute>
          <AdminPanel />
        </PrivateRoute>
      } />
    </Routes>
    </>
  )
}

export default App
