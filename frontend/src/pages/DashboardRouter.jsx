import { useAuth } from '../context/AuthContext'
import ClubDashboard from './ClubDashboard'
import StudentDashboard from './StudentDashboard'
import TeacherDashboard from './TeacherDashboard'
import { Navigate } from 'react-router-dom'

export default function DashboardRouter() {
  const { role } = useAuth()

  if (role === 'club') return <ClubDashboard />
  if (role === 'student') return <StudentDashboard />
  if (role === 'teacher') return <TeacherDashboard />

  return <Navigate to="/login" replace />
}
