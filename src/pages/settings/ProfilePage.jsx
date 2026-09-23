import { useEffect, useState, useRef } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'
import { updateProfile } from '../../lib/api/authApi'
import { uploadAvatar, getWorkingAvatarUrl, getAvatarSignedUrl } from '../../lib/storageApi'
import { useToast } from '../../hooks/useToast'
import { getErrorMessage } from '../../utils/errorHelpers'
import { supabase } from '../../lib/supabaseClient'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faCamera, faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons'

export default function ProfilePage() {
 const { profile, user, refreshProfile } = useAuth()
 const [isLoading, setIsLoading] = useState(false)
 const [avatarFile, setAvatarFile] = useState(null)
 const [avatarUrl, setAvatarUrl] = useState(null)
 const [imageError, setImageError] = useState(false)
 const fileInputRef = useRef(null)
 const [formData, setFormData] = useState({
 first_name: '',
 middle_name: '',
 last_name: '',
 phone: '',
 })
 const { showToast } = useToast()

 const normalizeAvatarUrl = (url) => {
 if (!url) return null
 
 if (url.includes('/avatars/avatars/')) {
 const normalizedUrl = url.replace('/avatars/avatars/', '/avatars/')
 console.log('Normalized avatar URL:', normalizedUrl, 'from:', url)
 return normalizedUrl
 }
 
 return url
 }

 useEffect(() => {
 if (profile) {
 setFormData({
 first_name: profile.first_name || '',
 middle_name: profile.middle_name || '',
 last_name: profile.last_name || '',
 phone: profile.phone || '',
 })


 if (profile.avatar_url) {
 if (avatarUrl && avatarUrl.startsWith('blob:')) {
 URL.revokeObjectURL(avatarUrl)
 }
 const normalizedUrl = normalizeAvatarUrl(profile.avatar_url)
 
 getWorkingAvatarUrl(normalizedUrl).then((workingUrl) => {
 if (workingUrl) {
 setAvatarUrl(workingUrl)
 setImageError(false)
 } else {
 const urlMatch = normalizedUrl.match(/\/avatars\/([^?]+)/)
 if (urlMatch) {
 const filePath = urlMatch[1]
 getAvatarSignedUrl(filePath).then((signedUrl) => {
 setAvatarUrl(signedUrl)
 setImageError(false)
 }).catch(() => {
 setAvatarUrl(null)
 setImageError(true)
 })
 } else {
 setAvatarUrl(normalizedUrl)
 setImageError(false)
 }
 }
 }).catch(() => {
 setAvatarUrl(normalizedUrl)
 setImageError(false)
 })
 } else {
 if (avatarUrl && avatarUrl.startsWith('blob:')) {
 URL.revokeObjectURL(avatarUrl)
 }
 setAvatarUrl(null)
 setImageError(false)
 }
 }
 }, [profile])


 useEffect(() => {
 return () => {
 if (avatarUrl && avatarUrl.startsWith('blob:')) {
 URL.revokeObjectURL(avatarUrl)
 }
 }
 }, [avatarUrl])


 const getInitials = () => {
 if (!profile) return 'U'
 const first = profile.first_name?.charAt(0) || ''
 const last = profile.last_name?.charAt(0) || ''
 return (first + last).toUpperCase() || 'U'
 }


 const getFullName = () => {
 if (!profile) return 'User'
 const parts = [
 profile.first_name,
 profile.middle_name,
 profile.last_name,
 ].filter(Boolean)
 return parts.join(' ') || 'User'
 }

 const handleAvatarChange = async (e) => {
 if (!e.target.files || !e.target.files[0]) return

 const file = e.target.files[0]


 if (file.size > 2 * 1024 * 1024) {
 showToast('File size must be less than 2MB', 'error')
 return
 }

 if (!file.type.startsWith('image/')) {
 showToast('File must be an image', 'error')
 return
 }

 if (avatarUrl && avatarUrl.startsWith('blob:')) {
 URL.revokeObjectURL(avatarUrl)
 }

 setAvatarFile(file)
 setImageError(false)
 const previewURL = URL.createObjectURL(file)
 console.log('Preview URL created:', previewURL)
 setAvatarUrl(previewURL)
 }

 const handleSubmit = async (e) => {
 e.preventDefault()
 if (!user?.id) return

 try {
 setIsLoading(true)
 
 let updates = { ...formData }

 if (avatarFile) {
 try {
 const { url } = await uploadAvatar(avatarFile, user.id)

 if (avatarUrl && avatarUrl.startsWith('blob:')) {
 URL.revokeObjectURL(avatarUrl)
 }
 
 updates.avatar_url = url
 setAvatarUrl(url)
 setAvatarFile(null)
 
 console.log('Avatar uploaded successfully, URL:', url)
 } catch (error) {
 console.error('Error uploading avatar:', error)
 const errorMessage = getErrorMessage(error)
 showToast(errorMessage || 'Failed to upload avatar', 'error')
 setIsLoading(false)
 return
 }
 }


 const { data: updatedProfile, error: updateError } = await supabase
 .from('profiles')
 .update(updates)
 .eq('id', user.id)
 .select('first_name, middle_name, last_name, phone, avatar_url')
 .single()

 if (updateError) throw updateError

 
 if (updatedProfile?.avatar_url) {
 setAvatarUrl(updatedProfile.avatar_url)
 }


 if (updatedProfile) {
 setFormData({
 first_name: updatedProfile.first_name || '',
 middle_name: updatedProfile.middle_name || '',
 last_name: updatedProfile.last_name || '',
 phone: updatedProfile.phone || '',
 })
 }


 await refreshProfile()
 
 showToast('Profile updated successfully', 'success')
 } catch (error) {
 console.error('Error updating profile:', error)
 const errorMessage = getErrorMessage(error)
 showToast(errorMessage || 'Failed to update profile', 'error')
 } finally {
 setIsLoading(false)
 }
 }

 if (!profile) {
 return (
 <DashboardLayout>
 <div className="flex items-center justify-center min-h-[400px]">
 <LoadingSpinner />
 </div>
 </DashboardLayout>
 )
 }

 return (
 <DashboardLayout>
 <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div>
 <h1 className="text-3xl font-bold text-gray-900">
 My Profile
 </h1>
 <p className="text-gray-600 mt-2">
 Update your personal information
 </p>
 </div>

 <Card className="overflow-hidden">
 
 <div className="bg-gradient-to-r from-sky-600 to-emerald-600 px-6 py-8 sm:px-8 sm:py-12">
 <div className="flex flex-col items-center">
 
 <div className="relative group">
 <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
 {avatarUrl && !imageError ? (
 <img
 src={avatarUrl}
 alt={getFullName()}
 className="w-full h-full object-cover"
 onLoad={() => {
 console.log('Avatar image loaded successfully:', avatarUrl)
 setImageError(false)
 }}
 onError={async (e) => {
 console.error('Avatar image failed to load:', avatarUrl)
 

 if (avatarUrl && !avatarUrl.includes('token=')) {
 try {
 const urlMatch = avatarUrl.match(/\/avatars\/([^?]+)/)
 if (urlMatch) {
 const filePath = urlMatch[1]
 console.log('Trying signed URL for:', filePath)
 const signedUrl = await getAvatarSignedUrl(filePath)
 setAvatarUrl(signedUrl)
 setImageError(false)
 return
 }
 } catch (error) {
 console.error('Failed to get signed URL:', error)
 }
 }
 
 setImageError(true)
 }}
 />
 ) : (
 <span className="text-3xl sm:text-4xl font-bold text-gray-600">
 {getInitials()}
 </span>
 )}
 </div>

 
 <label
 htmlFor="avatar-upload"
 className="absolute bottom-0 right-0 bg-white rounded-full p-2 sm:p-3 shadow-lg cursor-pointer transform transition-transform duration-200 hover:scale-110 border-2 border-sky-600"
 >
 <FontAwesomeIcon
 icon={faCamera}
 className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600"
 />
 </label>
 <input
 ref={fileInputRef}
 type="file"
 id="avatar-upload"
 className="hidden"
 accept="image/*"
 onChange={handleAvatarChange}
 />
 </div>

 
 <h2 className="mt-4 text-xl sm:text-2xl font-bold text-white text-center">
 {getFullName()}
 </h2>
 <p className="text-sky-100 text-sm sm:text-base mt-1">
 {user?.email}
 </p>
 </div>
 </div>

 
 <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
 
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Email
 </label>
 <Input
 type="email"
 value={user?.email || ''}
 disabled
 icon={faEnvelope}
 className="bg-gray-50"
 />
 <p className="text-xs text-gray-500 mt-1">
 Email cannot be changed
 </p>
 </div>

 
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 First Name *
 </label>
 <Input
 type="text"
 value={formData.first_name}
 onChange={(e) =>
 setFormData({ ...formData, first_name: e.target.value })
 }
 icon={faUser}
 required
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Middle Name
 </label>
 <Input
 type="text"
 value={formData.middle_name}
 onChange={(e) =>
 setFormData({ ...formData, middle_name: e.target.value })
 }
 icon={faUser}
 />
 </div>

 <div className="sm:col-span-2 lg:col-span-1">
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Last Name *
 </label>
 <Input
 type="text"
 value={formData.last_name}
 onChange={(e) =>
 setFormData({ ...formData, last_name: e.target.value })
 }
 icon={faUser}
 required
 />
 </div>
 </div>

 
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Phone Number
 </label>
 <Input
 type="tel"
 value={formData.phone}
 onChange={(e) =>
 setFormData({ ...formData, phone: e.target.value })
 }
 placeholder="+252..."
 icon={faPhone}
 />
 </div>

 
 <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
 <FontAwesomeIcon
 icon={faUser}
 className="text-blue-600 text-lg"
 />
 <div className="flex-1">
 <p className="text-sm font-medium text-blue-900">
 Role: {profile.role}
 </p>
 <p className="text-xs text-blue-700">
 Your role is managed by Super Admin
 </p>
 </div>
 </div>

 
 <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
 <Button
 type="submit"
 variant="primary"
 loading={isLoading}
 disabled={isLoading}
 className="w-full sm:w-auto"
 >
 {isLoading ? 'Saving...' : 'Save Changes'}
 </Button>
 </div>
 </form>
 </Card>
 </div>
 </DashboardLayout>
 )
}