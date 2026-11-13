import { useState } from 'react'
import { Link } from 'react-router-dom'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { useToast } from '../../hooks/useToast'
import { supabase } from '../../lib/supabaseClient'
import { getErrorMessage } from '../../utils/errorHelpers'

export default function ForgotPasswordPage() {
 const [email, setEmail] = useState('')
 const [isLoading, setIsLoading] = useState(false)
 const [sent, setSent] = useState(false)
 const { showToast } = useToast()

 const handleSubmit = async (e) => {
 e.preventDefault()
 setIsLoading(true)

 try {
 const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
 redirectTo: `${window.location.origin}/auth/reset-password`,
 })
 if (error) throw error
 // Same message whether or not the email exists, so accounts can't be probed
 setSent(true)
 } catch (error) {
 showToast(getErrorMessage(error), 'error')
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
 <h2 className="text-2xl font-bold text-gray-900 mb-2">
 Forgot password
 </h2>

 {sent ? (
 <p className="text-sm text-gray-600 mt-4">
 If an account exists for <span className="font-medium text-gray-900">{email}</span>,
 we have sent a link to reset your password. Check your inbox and spam folder.
 </p>
 ) : (
 <>
 <p className="text-sm text-gray-600 mb-6">
 Enter your email and we will send you a link to set a new password.
 </p>
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
 <Button type="submit" className="w-full" loading={isLoading}>
 Send reset link
 </Button>
 </form>
 </>
 )}

 <p className="mt-6 text-center text-sm text-gray-600">
 Remembered it?{' '}
 <Link to="/auth/login" className="text-sky-600 font-medium hover:underline">
 Sign in
 </Link>
 </p>
 </div>
 </div>
 </div>
 )
}
