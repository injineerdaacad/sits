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
  email: process.env.SEED_SUPERADMIN_EMAIL || 'injineerdaacad@gmail.com',
  password: process.env.SEED_SUPERADMIN_PASSWORD || '123456',
  firstName: process.env.SEED_SUPERADMIN_FIRST_NAME || 'Injineer',
  lastName: process.env.SEED_SUPERADMIN_LAST_NAME || 'Daacad',
  phone: process.env.SEED_SUPERADMIN_PHONE || '+252615600765',
}

async function seedSuperAdmin() {
  try {
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
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            role: 'SUPER_ADMIN',
            first_name: USER_CONFIG.firstName,
            last_name: USER_CONFIG.lastName,
            phone: USER_CONFIG.phone,
          })
          .eq('id', userId)

        if (updateError) {
          console.error('Error: Failed to update profile -', updateError.message)
          process.exit(1)
        }

        console.log('Success: Super Admin updated')
      } else {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: userId,
          first_name: USER_CONFIG.firstName,
          last_name: USER_CONFIG.lastName,
          role: 'SUPER_ADMIN',
          phone: USER_CONFIG.phone,
        })

        if (profileError) {
          console.error('Error: Failed to create profile -', profileError.message)
          process.exit(1)
        }

        console.log('Success: Super Admin profile created')
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

      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        first_name: USER_CONFIG.firstName,
        last_name: USER_CONFIG.lastName,
        role: 'SUPER_ADMIN',
        phone: USER_CONFIG.phone,
      })

      if (profileError) {
        console.error('Error: Failed to create profile -', profileError.message)
        process.exit(1)
      }

      console.log('Success: Super Admin created successfully')
    }
  } catch (error) {
    console.error('Error: Unexpected error -', error.message)
    process.exit(1)
  }
}

seedSuperAdmin()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error: Seed process failed -', error.message)
    process.exit(1)
  })