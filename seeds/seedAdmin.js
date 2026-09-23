import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY in .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const USER_CONFIG = {
  email: process.env.SEED_ADMIN_EMAIL || 'engmohahonest@gmail.com',
  password: process.env.SEED_ADMIN_PASSWORD || '123456',
  firstName: process.env.SEED_ADMIN_FIRST_NAME || 'Engineer',
  lastName: process.env.SEED_ADMIN_LAST_NAME || 'Honest',
  phone: process.env.SEED_ADMIN_PHONE || '+252685600765',
  stationId: process.env.SEED_ADMIN_STATION_ID || null,
}

async function seedAdmin() {
  try {
    if (USER_CONFIG.stationId) {
      const { data: station, error: stationError } = await supabase
        .from('stations')
        .select('id, name')
        .eq('id', USER_CONFIG.stationId)
        .single()

      if (stationError || !station) {
        USER_CONFIG.stationId = null
      }
    }

    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(
      (u) => u.email === USER_CONFIG.email
    )

    let userId

    if (existingUser) {
      userId = existingUser.id

      const { error: passwordError } = await supabase.auth.admin.updateUserById(
        userId,
        { password: USER_CONFIG.password }
      )

      if (passwordError) {
        console.error('Error: Failed to update password -', passwordError.message)
        process.exit(1)
      }

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (existingProfile) {
        const updates = {
          role: 'ADMIN',
          first_name: USER_CONFIG.firstName,
          last_name: USER_CONFIG.lastName,
          phone: USER_CONFIG.phone,
        }

        if (USER_CONFIG.stationId) {
          updates.station_id = USER_CONFIG.stationId
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', userId)

        if (updateError) {
          console.error('Error: Failed to update profile -', updateError.message)
          process.exit(1)
        }

        console.log('Success: Admin updated')
      } else {
        const profileData = {
          id: userId,
          first_name: USER_CONFIG.firstName,
          last_name: USER_CONFIG.lastName,
          role: 'ADMIN',
          phone: USER_CONFIG.phone,
        }

        if (USER_CONFIG.stationId) {
          profileData.station_id = USER_CONFIG.stationId
        }

        const { error: profileError } = await supabase.from('profiles').insert(profileData)

        if (profileError) {
          console.error('Error: Failed to create profile -', profileError.message)
          process.exit(1)
        }

        console.log('Success: Admin profile created')
      }
    } else {
      const { data: user, error: userError } = await supabase.auth.admin.createUser({
        email: USER_CONFIG.email,
        password: USER_CONFIG.password,
        email_confirm: true,
      })

      if (userError) {
        console.error('Error: Failed to create user -', userError.message)
        process.exit(1)
      }

      userId = user.user.id

      const profileData = {
        id: userId,
        first_name: USER_CONFIG.firstName,
        last_name: USER_CONFIG.lastName,
        role: 'ADMIN',
        phone: USER_CONFIG.phone,
      }

      if (USER_CONFIG.stationId) {
        profileData.station_id = USER_CONFIG.stationId
      }

      const { error: profileError } = await supabase.from('profiles').insert(profileData)

      if (profileError) {
        console.error('Error: Failed to create profile -', profileError.message)
        process.exit(1)
      }

      console.log('Success: Admin created successfully')
    }
  } catch (error) {
    console.error('Error: Unexpected error -', error.message)
    process.exit(1)
  }
}

seedAdmin()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error: Seed process failed -', error.message)
    process.exit(1)
  })