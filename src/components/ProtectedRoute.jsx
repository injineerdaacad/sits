import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

export default function ProtectedRoute({ children, redirectTo = '/auth/login' }) {
 const { isLoggedIn, isLoading } = useAuth()

 if (isLoading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-gray-50">
 <LoadingSpinner />
 </div>
 )
 }

 if (!isLoggedIn) {
 return <Navigate to={redirectTo} replace />
 }

 return children
}

