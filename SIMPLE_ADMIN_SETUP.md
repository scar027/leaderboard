# Simple Admin Setup Guide

## Quick Setup (3 Easy Steps)

### Step 1: Run Database Scripts
Make sure these scripts have been executed in order:
1. `scripts/001_create_leaderboard.sql` 
2. `scripts/002_create_admin_users.sql`
3. `scripts/004_add_admin_creation_function.sql` (new)

### Step 2: Create Your Admin User
1. Go to `/admin/setup` in your browser
2. Fill in your desired username and password
3. Click "Create Admin User"

### Step 3: Login
1. Go to `/admin` 
2. Use the credentials you just created
3. Access your admin dashboard!

## That's it! 🎉

No command line needed, no complex scripts - just use the web interface.

## Security Notes
- Remove the `/admin/setup` page in production by deleting `app/admin/setup/page.tsx`
- Use strong passwords (minimum 8 characters)
- Only create admin accounts for trusted users

## Troubleshooting
- If you get database errors, make sure all SQL scripts have been run
- If the setup page doesn't work, check that your Supabase integration is connected
- For production, you may want to restrict access to the setup page
