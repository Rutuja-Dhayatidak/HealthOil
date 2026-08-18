import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import AdminPanel from './admin/AdminPanel'
import Login from './pages/Login'
import { Toaster } from 'react-hot-toast'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken')
  const location = useLocation()
  
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  
  return children
}

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/:tab" element={
        <PrivateRoute>
          <AdminPanel />
        </PrivateRoute>
      } />
    </Routes>
    </>
  )
}

export default App
