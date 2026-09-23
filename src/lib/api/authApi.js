import { supabase } from '../supabaseClient'

export async function signUp(email, password) {
 const { data, error } = await supabase.auth.signUp({
 email,
 password,
 })

 if (error) throw error
 return data
}

export async function signIn(email, password) {
 const { data, error } = await supabase.auth.signInWithPassword({
 email,
 password,
 })

 if (error) throw error
 return data
}

export async function signOut() {
 const { error } = await supabase.auth.signOut()
 if (error) throw error
}

export async function getUserProfile(userId) {
 const { data, error } = await supabase
 .from('profiles')
 .select('*')
 .eq('id', userId)
 .single()

 if (error && error.code === 'PGRST116') {
 console.log('No profile found, attempting to create one for user:', userId)

 const { data: userData } = await supabase.auth.getUser()
 const email = userData?.user?.email || ''
 const defaultFirstName = email ? email.split('@')[0] : `user_${Date.now()}`

 const { data: newProfile, error: profileError } = await supabase
 .from('profiles')
 .insert({
 id: userId,
 first_name: defaultFirstName,
 last_name: 'User',
 role: 'USER',
 })
 .select()
 .single()

 if (profileError) {
 console.error('Profile creation error:', profileError)
 throw profileError
 } else {
 console.log('Profile created successfully', newProfile)
 }

 return newProfile
 }

 if (error) {
 console.error('Error fetching profile:', error)
 throw error
 }

 return data
}

export async function upsertProfile(profileData) {
 const { data, error } = await supabase
 .from('profiles')
 .upsert(profileData, { onConflict: 'id' })
 .select()
 .single()

 if (error) throw error
 return data
}

export async function updateProfile(userId, updates) {
 const { data, error } = await supabase
 .from('profiles')
 .update(updates)
 .eq('id', userId)
 .select()
 .single()

 if (error) {
 console.error('Update profile error:', error)
 if (error.message?.includes('permission') || 
 error.message?.includes('policy') ||
 error.message?.includes('row-level security') ||
 error.code === '42501') {
 throw new Error('Permission denied. Please run SQL to disable RLS: ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;')
 }
 throw error
 }

 return data
}

export async function createProfile(profileData) {
 const { data, error } = await supabase
 .from('profiles')
 .insert(profileData)
 .select()
 .single()

 if (error) {
 if (error.code === '23505') {
 console.log('Profile already exists, updating instead...')
 const { data: updatedData, error: updateError } = await supabase
 .from('profiles')
 .update(profileData)
 .eq('id', profileData.id)
 .select()
 .single()
 
 if (updateError) throw updateError
 return updatedData
 }
 throw error
 }
 
 return data
}

export async function getAllProfiles() {
 const { data, error } = await supabase
 .from('profiles')
 .select('*')
 .order('created_at', { ascending: false })

 if (error) throw error
 return data
}

export async function createUserWithProfile(userData) {
 const { email, password, first_name, last_name, middle_name, role, station_id, phone } = userData

 const { data: authData, error: authError } = await supabase.auth.signUp({
 email,
 password,
 })

 if (authError) throw authError

 if (!authData.user) {
 throw new Error('Failed to create user account')
 }

 const profileData = {
 id: authData.user.id,
 first_name,
 last_name,
 role: role || 'USER',
 }

 if (middle_name) profileData.middle_name = middle_name
 if (station_id) profileData.station_id = station_id
 if (phone) profileData.phone = phone

 const { data: profile, error: profileError } = await supabase
 .from('profiles')
 .insert(profileData)
 .select()
 .single()

 if (profileError) {
 console.error('Profile creation failed, auth user may need manual cleanup:', authData.user.id)
 throw profileError
 }

 return { user: authData.user, profile }
}

export async function deleteUserProfile(userId) {
 const { error } = await supabase
 .from('profiles')
 .delete()
 .eq('id', userId)

 if (error) throw error
}

