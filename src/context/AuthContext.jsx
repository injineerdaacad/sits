import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getUserProfile } from '../lib/api/authApi'
import { withTimeout, safeApiCall } from '../utils/apiHelpers'
import { getErrorMessage } from '../utils/errorHelpers'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
 const [user, setUser] = useState(null)
 const [profile, setProfile] = useState(null)
 const [isLoading, setIsLoading] = useState(true)

 useEffect(() => {
 let isMounted = true
 

 const maxLoadingTimeout = setTimeout(() => {
 if (isMounted) {
 console.warn('Auth loading timeout - forcing app to continue')
 setIsLoading(false)
 }
 }, 10000)
 

 const {
 data: { subscription },
 } = supabase.auth.onAuthStateChange(async (event, session) => {
 if (!isMounted) return
 
 setUser(session?.user || null)
 
 if (session?.user) {
 try {
 const userProfile = await safeApiCall(
 () => getUserProfile(session.user.id),
 null,
 5000
 )
 setProfile(userProfile)
 } catch (error) {

 const errorMessage = getErrorMessage(error)
 if (!error.message?.includes('Request timeout')) {
 console.warn('Error fetching user profile:', errorMessage)
 }
 setProfile(null)
 }
 } else {
 setProfile(null)
 }
 
 setIsLoading(false)
 clearTimeout(maxLoadingTimeout)
 })

 return () => {
 isMounted = false
 clearTimeout(maxLoadingTimeout)
 subscription.unsubscribe()
 }
 }, [])

 const loadProfile = async (userId) => {
 try {

 const userProfile = await safeApiCall(
 () => getUserProfile(userId),
 null,
 15000
 )
 setProfile(userProfile)
 } catch (error) {

 const errorMessage = getErrorMessage(error)
 if (!error.message?.includes('Request timeout')) {
 console.warn('Error fetching user profile:', errorMessage)
 }
 setProfile(null)
 } finally {
 setIsLoading(false)
 }
 }

 const logout = async () => {
 try {
 await supabase.auth.signOut()
 setUser(null)
 setProfile(null)
 } catch (error) {
 console.error('Error signing out:', error)
 throw error
 }
 }

 const refreshProfile = async () => {
 if (user?.id) {
 await loadProfile(user.id)
 }
 }

 const value = {
 user,
 profile,
 isLoading,
 isLoggedIn: !!user,
 logout,
 refreshProfile,
 isSuperAdmin: profile?.role === 'SUPER_ADMIN',
 isAdmin: profile?.role === 'ADMIN',
 isUser: profile?.role === 'USER',
 }

 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
 const context = useContext(AuthContext)
 if (context === null) {
 throw new Error('useAuth must be used within an AuthProvider')
 }
 return context
}

