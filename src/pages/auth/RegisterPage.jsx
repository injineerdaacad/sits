import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faLock, faUser } from '@fortawesome/free-solid-svg-icons'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { useToast } from '../../hooks/useToast'
import { supabase } from '../../lib/supabaseClient'
import { createProfile } from '../../lib/api/authApi'
import { getErrorMessage } from '../../utils/errorHelpers'

export default function RegisterPage() {
 const [formData, setFormData] = useState({
 email: '',
 password: '',
 confirmPassword: '',
 firstName: '',
 lastName: '',
 })
 const [isLoading, setIsLoading] = useState(false)
 const { showToast } = useToast()
 const navigate = useNavigate()

 const handleChange = (e) => {
 setFormData({
 ...formData,
 [e.target.name]: e.target.value,
 })
 }

 const handleSubmit = async (e) => {
 e.preventDefault()

 if (formData.password !== formData.confirmPassword) {
 showToast('Passwords do not match', 'error')
 return
 }

 if (formData.password.length < 6) {
 showToast('Password must be at least 6 characters', 'error')
 return
 }

 setIsLoading(true)

 try {
 const { data: authData, error: authError } = await supabase.auth.signUp({
 email: formData.email,
 password: formData.password,
 })

 if (authError) throw authError

 if (!authData.user) {
 throw new Error('Failed to create user account')
 }

 console.log('Auth signup successful:', authData)

 const { data: sessionData } = await supabase.auth.getSession()

 if (!sessionData?.session) {
 console.log('No active session yet - profile will be created on first sign in')
 showToast('Account created successfully! Please sign in to continue.', 'success')
 navigate('/auth/login')
 return
 }

 try {
 await createProfile({
 id: authData.user.id,
 first_name: formData.firstName,
 last_name: formData.lastName,
 role: 'USER',
 })
 console.log('Profile created successfully')
 } catch (profileError) {
 console.warn('Profile creation warning:', profileError)
 }

 showToast('Account created successfully! Redirecting...', 'success')
 
 setTimeout(() => {
 navigate('/dashboard/user')
 }, 1000)
 } catch (error) {
 console.error('Registration error:', error)
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
 Create Account
 </h2>

 <form onSubmit={handleSubmit} className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <Input
 type="text"
 name="firstName"
 label="First Name"
 value={formData.firstName}
 onChange={handleChange}
 placeholder="First name"
 required
 icon={faUser}
 />

 <Input
 type="text"
 name="lastName"
 label="Last Name"
 value={formData.lastName}
 onChange={handleChange}
 placeholder="Last name"
 required
 icon={faUser}
 />
 </div>

 <Input
 type="email"
 name="email"
 label="Email"
 value={formData.email}
 onChange={handleChange}
 placeholder="Enter your email"
 required
 icon={faEnvelope}
 />

 <Input
 type="password"
 name="password"
 label="Password"
 value={formData.password}
 onChange={handleChange}
 placeholder="Create a password"
 required
 icon={faLock}
 showPasswordToggle={true}
 />

 <Input
 type="password"
 name="confirmPassword"
 label="Confirm Password"
 value={formData.confirmPassword}
 onChange={handleChange}
 placeholder="Confirm your password"
 required
 icon={faLock}
 showPasswordToggle={true}
 />

 <Button type="submit" className="w-full" loading={isLoading}>
 Create Account
 </Button>
 </form>

 <p className="mt-6 text-center text-sm text-gray-600">
 Already have an account?{' '}
 <Link
 to="/auth/login"
 className="text-sky-600 font-medium hover:underline"
 >
 Sign in
 </Link>
 </p>
 </div>
 </div>
 </div>
 )
}

