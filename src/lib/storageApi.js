import { supabase } from './supabaseClient'

export async function uploadAvatar(file, userId) {
 try {
 if (file.size > 2 * 1024 * 1024) {
 throw new Error('File size must be less than 2MB')
 }

 if (!file.type.startsWith('image/')) {
 throw new Error('File must be an image')
 }

 const fileExt = file.name.split('.').pop().toLowerCase()
 const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`
 const filePath = fileName

 const { data: uploadData, error: uploadError } = await supabase.storage
 .from('avatars')
 .upload(filePath, file, {
 contentType: file.type,
 cacheControl: '3600',
 upsert: true,
 })

 if (uploadError) {
 console.error('Storage upload error:', uploadError)
 if (uploadError.message?.includes('Bucket not found') || 
 uploadError.message?.includes('does not exist') ||
 uploadError.statusCode === '404') {
 throw new Error('Storage bucket "avatars" does not exist. Please create it in Supabase Storage.')
 }
 if (uploadError.message?.includes('permission') || 
 uploadError.message?.includes('policy') ||
 uploadError.message?.includes('row-level security') ||
 uploadError.statusCode === '403') {
 throw new Error('Permission denied. Please disable RLS on storage.objects table in Supabase SQL Editor.')
 }
 throw uploadError
 }

 const { data: urlData } = supabase.storage
 .from('avatars')
 .getPublicUrl(filePath)

 if (!urlData?.publicUrl) {
 throw new Error('Failed to get public URL for uploaded avatar')
 }

 return {
 path: filePath,
 url: urlData.publicUrl,
 }
 } catch (error) {
 console.error('Error uploading avatar:', error)
 const errorMessage = error.message || 'Failed to upload avatar. Please try again.'
 throw new Error(errorMessage)
 }
}

export async function getAvatarSignedUrl(filePath, expiresIn = 3600) {
 try {
 const { data, error } = await supabase.storage
 .from('avatars')
 .createSignedUrl(filePath, expiresIn)

 if (error) throw error
 if (!data?.signedUrl) {
 throw new Error('Failed to create signed URL for avatar')
 }

 return data.signedUrl
 } catch (error) {
 console.error('Error creating signed URL:', error)
 throw error
 }
}

export async function getWorkingAvatarUrl(avatarUrl) {
 if (!avatarUrl) return null

 try {
 let normalizedUrl = avatarUrl
 if (avatarUrl.includes('/avatars/avatars/')) {
 normalizedUrl = avatarUrl.replace('/avatars/avatars/', '/avatars/')
 }

 const urlMatch = normalizedUrl.match(/\/avatars\/([^?]+)/)
 if (!urlMatch) {
 console.error('Could not extract file path from URL:', normalizedUrl)
 return null
 }

 const filePath = urlMatch[1]

 const { data: fileData, error: fileError } = await supabase.storage
 .from('avatars')
 .list(filePath.split('/').slice(0, -1).join('/') || '', {
 limit: 1,
 search: filePath.split('/').pop()
 })

 if (fileError || !fileData || fileData.length === 0) {
 const oldPath = `avatars/${filePath}`
 const { data: oldFileData } = await supabase.storage
 .from('avatars')
 .list('avatars', {
 limit: 1,
 search: filePath.split('/').pop()
 })

 if (oldFileData && oldFileData.length > 0) {
 console.log('File found with old path format, using signed URL')
 return await getAvatarSignedUrl(oldPath)
 }

 console.error('Avatar file not found at path:', filePath)
 return null
 }

 return normalizedUrl
 } catch (error) {
 console.error('Error checking avatar file:', error)
 return null
 }
}

export async function deleteAvatar(filePath) {
 try {
 const { error } = await supabase.storage
 .from('avatars')
 .remove([filePath])

 if (error) throw error
 } catch (error) {
 console.error('Error deleting avatar:', error)
 throw error
 }
}