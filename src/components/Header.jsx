import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
 faBell,
 faUser,
 faSignOutAlt,
 faCog,
 faBars,
 faTimes,
} from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../context/AuthContext'
import { IconButton } from './IconButton'
import { cn } from '../utils/helpers'
import { getWorkingAvatarUrl, getAvatarSignedUrl } from '../lib/storageApi'

export default function Header({ onMenuToggle }) {
 const { profile, logout } = useAuth()
 const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
 const [avatarUrl, setAvatarUrl] = useState(null)
 const [imageError, setImageError] = useState(false)
 const navigate = useNavigate()

 const handleLogout = async () => {
 try {
 await logout()
 navigate('/auth/login')
 } catch (error) {
 console.error('Logout error:', error)
 }
 }

 const getInitials = () => {
 if (!profile) return 'U'
 const firstName = profile.first_name || ''
 const lastName = profile.last_name || ''
 return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U'
 }

 const fullName = profile
 ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User'
 : 'User'


 const normalizeAvatarUrl = (url) => {
 if (!url) return null
 

 if (url.includes('/avatars/avatars/')) {

 return url.replace('/avatars/avatars/', '/avatars/')
 }
 
 return url
 }


 useEffect(() => {
 if (profile?.avatar_url) {
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
 setAvatarUrl(null)
 setImageError(false)
 }
 }, [profile?.avatar_url])

 return (
 <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
 <div className="flex items-center justify-between h-16 px-4 lg:px-6">
 
 <div className="flex items-center gap-4">
 <button
 onClick={onMenuToggle}
 className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
 aria-label="Toggle menu"
 >
 <FontAwesomeIcon icon={isProfileMenuOpen ? faTimes : faBars} />
 </button>

 <Link
 to="/"
 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent"
 >
 SITS
 </Link>
 </div>

 
 <div className="flex items-center gap-2">
 
 <IconButton
 aria-label="Notifications"
 className="text-gray-600 relative"
 >
 <FontAwesomeIcon icon={faBell} />
 
 
 </IconButton>

 
 <div className="relative">
 <button
 onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
 className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
 >
 <div className="h-8 w-8 rounded-full bg-sky-600 flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
 {avatarUrl && !imageError ? (
 <img
 src={avatarUrl}
 alt={fullName}
 className="w-full h-full object-cover"
 onLoad={() => {
 setImageError(false)
 }}
 onError={async (e) => {
 console.error('Header avatar image failed to load:', avatarUrl)
 

 if (avatarUrl && !avatarUrl.includes('token=')) {
 try {
 const urlMatch = avatarUrl.match(/\/avatars\/([^?]+)/)
 if (urlMatch) {
 const filePath = urlMatch[1]
 console.log('Trying signed URL for header avatar:', filePath)
 const signedUrl = await getAvatarSignedUrl(filePath)
 setAvatarUrl(signedUrl)
 setImageError(false)
 return
 }
 } catch (error) {
 console.error('Failed to get signed URL for header avatar:', error)
 }
 }
 

 setImageError(true)
 }}
 />
 ) : (
 <span>{getInitials()}</span>
 )}
 </div>
 <span className="hidden sm:block text-sm font-medium text-gray-700">
 {fullName}
 </span>
 </button>

 
 {isProfileMenuOpen && (
 <>
 <div
 className="fixed inset-0 z-10"
 onClick={() => setIsProfileMenuOpen(false)}
 />
 <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
 <div className="py-1">
 <div className="px-4 py-2 border-b border-gray-200">
 <p className="text-sm font-medium text-gray-900">
 {fullName}
 </p>
 <p className="text-xs text-gray-500">
 {profile?.role || 'User'}
 </p>
 </div>

 <Link
 to="/settings/profile"
 onClick={() => setIsProfileMenuOpen(false)}
 className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
 >
 <FontAwesomeIcon icon={faUser} className="w-4" />
 Profile
 </Link>

 <Link
 to="/settings"
 onClick={() => setIsProfileMenuOpen(false)}
 className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
 >
 <FontAwesomeIcon icon={faCog} className="w-4" />
 Settings
 </Link>

 <button
 onClick={handleLogout}
 className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
 >
 <FontAwesomeIcon icon={faSignOutAlt} className="w-4" />
 Sign Out
 </button>
 </div>
 </div>
 </>
 )}
 </div>
 </div>
 </div>
 </header>
 )
}

