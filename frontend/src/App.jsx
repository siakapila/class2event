import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import RoleSelection from './pages/RoleSelection'
import Login from './pages/Login'
import Signup from './pages/Signup'
import DashboardRouter from './pages/DashboardRouter'
import CreateEvent from './pages/CreateEvent'
import EventDetails from './pages/EventDetails'

// Student paths
import StudentEvents from './pages/StudentEvents'
import RegisterEvent from './pages/RegisterEvent'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-ink-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/role-selection" replace />
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/dashboard" replace />
  return children
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return !user ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <div className="noise min-h-screen">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="/role-selection" element={<GuestRoute><RoleSelection /></GuestRoute>} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
        
        {/* Dynamic Dashboard Routing */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
        
        {/* Club Only Routes */}
        <Route path="/events/new" element={<ProtectedRoute allowedRoles={['club']}><CreateEvent /></ProtectedRoute>} />
        <Route path="/events/:id/edit" element={<ProtectedRoute allowedRoles={['club']}><CreateEvent /></ProtectedRoute>} />
        
        {/* Student Only Routes */}
        <Route path="/events" element={<ProtectedRoute allowedRoles={['student']}><StudentEvents /></ProtectedRoute>} />
        <Route path="/events/:id/register" element={<ProtectedRoute allowedRoles={['student']}><RegisterEvent /></ProtectedRoute>} />

        {/* Shared / Dynamic Views */}
        <Route path="/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}
