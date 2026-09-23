import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../hooks/useToast'
import { supabase } from '../../lib/supabaseClient'
import { getDashboardPath } from '../../utils/navigation'
import { getErrorMessage } from '../../utils/errorHelpers'

export default function LoginPage() {
 const [email, setEmail] = useState('')
 const [password, setPassword] = useState('')
 const [isLoading, setIsLoading] = useState(false)
 const { refreshProfile } = useAuth()
 const { showToast } = useToast()
 const navigate = useNavigate()

 const handleSubmit = async (e) => {
 e.preventDefault()
 setIsLoading(true)

 try {
 const { data, error } = await supabase.auth.signInWithPassword({
 email,
 password,
 })

 if (error) throw error

 console.log('User info:', data)

 if (data?.user) {
 try {
 const profile = await refreshProfile()
 console.log('Profile info:', profile)
 } catch (profileError) {
 console.warn('Error with profile during signin:', profileError)
 }
 }

 showToast('Login successful!', 'success')
 
 const { data: { user } } = await supabase.auth.getUser()
 if (user) {
 const { data: profile } = await supabase
 .from('profiles')
 .select('role')
 .eq('id', user.id)
 .single()

 const dashboardPath = getDashboardPath(profile?.role || 'USER')
 navigate(dashboardPath)
 } else {
 navigate('/dashboard/user')
 }
 } catch (error) {
 console.error('Login error:', error)
 const errorMessage = getErrorMessage(error)
 showToast(errorMessage, 'error')
 } finally {
 setIsLoading(false)
 }
 }

 return (
 <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
 <div className="w-full max-w-md">
 <div className="text-center mb-8">
 <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
 SITS
 </h1>
 <p className="text-sm text-gray-600 mt-2">
 Somali Intercity Transport System
 </p>
 </div>

 <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
 <h2 className="text-2xl font-bold text-gray-900 mb-6">
 Sign In
 </h2>

 <form onSubmit={handleSubmit} className="space-y-4">
 <Input
 type="email"
 label="Email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="Enter your email"
 required
 icon={faEnvelope}
 />

 <Input
 type="password"
 label="Password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 placeholder="Enter your password"
 required
 icon={faLock}
 showPasswordToggle={true}
 />

 <div className="flex items-center justify-between">
 <label className="flex items-center">
 <input
 type="checkbox"
 className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
 />
 <span className="ml-2 text-sm text-gray-600">
 Remember me
 </span>
 </label>
 <Link
 to="/auth/forgot-password"
 className="text-sm text-sky-600 hover:underline"
 >
 Forgot password?
 </Link>
 </div>

 <Button type="submit" className="w-full" loading={isLoading}>
 Sign In
 </Button>
 </form>

 <p className="mt-6 text-center text-sm text-gray-600">
 Don't have an account?{' '}
 <Link
 to="/auth/register"
 className="text-sky-600 font-medium hover:underline"
 >
 Sign up
 </Link>
 </p>
 </div>
 </div>
 </div>
 )
}

