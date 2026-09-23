import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDashboardPath } from '../utils/navigation'
import LoadingSpinner from './LoadingSpinner'

export default function RoleProtectedRoute({ 
 children, 
 allowedRoles = [],
 redirectTo = null 
}) {
 const { profile, isLoading } = useAuth()

 if (isLoading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-gray-50">
 <LoadingSpinner />
 </div>
 )
 }

 if (!profile) {
 return <Navigate to="/auth/login" replace />
 }

 const userRole = profile.role

 if (!allowedRoles.includes(userRole)) {

 const dashboardPath = redirectTo || getDashboardPath(userRole)
 return <Navigate to={dashboardPath} replace />
 }

 return children
}

