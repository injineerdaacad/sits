import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { faLock } from '@fortawesome/free-solid-svg-icons'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { useToast } from '../../hooks/useToast'
import { supabase } from '../../lib/supabaseClient'
import { getErrorMessage } from '../../utils/errorHelpers'

// Opened from the reset email. Supabase reads the token from the URL and
// signs the user in for this one purpose; we then let them set a new password.
export default function ResetPasswordPage() {
 const [password, setPassword] = useState('')
 const [confirm, setConfirm] = useState('')
 const [isLoading, setIsLoading] = useState(false)
 const [ready, setReady] = useState(false)
 const [checked, setChecked] = useState(false)
 const { showToast } = useToast()
 const navigate = useNavigate()

 useEffect(() => {
 const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
 if (event === 'PASSWORD_RECOVERY' || session) setReady(true)
 })
 supabase.auth.getSession().then(({ data: { session } }) => {
 if (session) setReady(true)
 setChecked(true)
 })
 return () => subscription.unsubscribe()
 }, [])

 const handleSubmit = async (e) => {
 e.preventDefault()
 if (password.length < 6) {
 showToast('Password must be at least 6 characters', 'error')
 return
 }
 if (password !== confirm) {
 showToast('Passwords do not match', 'error')
 return
 }

 setIsLoading(true)
 try {
 const { error } = await supabase.auth.updateUser({ password })
 if (error) throw error
 await supabase.auth.signOut()
 showToast('Password updated. Please sign in with your new password.', 'success')
 navigate('/auth/login')
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
 <h2 className="text-2xl font-bold text-gray-900 mb-6">
 Set a new password
 </h2>

 {ready ? (
 <form onSubmit={handleSubmit} className="space-y-4">
 <Input
 type="password"
 label="New password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 placeholder="At least 6 characters"
 required
 icon={faLock}
 showPasswordToggle={true}
 />
 <Input
 type="password"
 label="Confirm new password"
 value={confirm}
 onChange={(e) => setConfirm(e.target.value)}
 placeholder="Repeat the new password"
 required
 icon={faLock}
 showPasswordToggle={true}
 />
 <Button type="submit" className="w-full" loading={isLoading}>
 Update password
 </Button>
 </form>
 ) : checked ? (
 <p className="text-sm text-gray-600">
 This reset link is invalid or has expired.{' '}
 <Link to="/auth/forgot-password" className="text-sky-600 font-medium hover:underline">
 Request a new one
 </Link>
 .
 </p>
 ) : (
 <p className="text-sm text-gray-600">Checking your reset link…</p>
 )}
 </div>
 </div>
 </div>
 )
}
