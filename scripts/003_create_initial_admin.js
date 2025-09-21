// Script to create initial admin user
// Run this script to create your first admin user

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createInitialAdmin() {
  const username = process.argv[2]
  const password = process.argv[3]

  if (!username || !password) {
    console.error("Usage: node scripts/003_create_initial_admin.js <username> <password>")
    console.error("Example: node scripts/003_create_initial_admin.js admin mySecurePassword123")
    process.exit(1)
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters long")
    process.exit(1)
  }

  try {
    const { data, error } = await supabase.rpc("create_admin_user", {
      username_param: username,
      password_param: password,
    })

    if (error) {
      console.error("Error creating admin user:", error)
      process.exit(1)
    }

    console.log(`✅ Admin user "${username}" created successfully with ID: ${data}`)
    console.log("You can now log in to the admin panel with these credentials.")
  } catch (err) {
    console.error("Unexpected error:", err)
    process.exit(1)
  }
}

createInitialAdmin()
