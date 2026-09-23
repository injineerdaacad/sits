import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDashboardPath } from '../utils/navigation'
import LoadingSpinner from './LoadingSpinner'

export default function UnAuthenticatedRoute({ children, redirectTo = null }) {
 const { isLoggedIn, profile, isLoading } = useAuth()

 if (isLoading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-gray-50">
 <LoadingSpinner />
 </div>
 )
 }

 if (isLoggedIn && profile) {

 const dashboardPath = redirectTo || getDashboardPath(profile.role)
 return <Navigate to={dashboardPath} replace />
 }

 return children
}

