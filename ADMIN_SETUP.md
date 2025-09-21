# Admin Setup Instructions

## Overview
This leaderboard application now uses secure, database-backed admin authentication instead of hardcoded credentials.

## Prerequisites
- Supabase project connected
- Database scripts executed (001_create_leaderboard.sql and 002_create_admin_users.sql)

## Local Development Setup

### 1. Run Database Migrations
First, ensure all database scripts have been executed:
- `scripts/001_create_leaderboard.sql` (creates leaderboard table)
- `scripts/002_create_admin_users.sql` (creates admin authentication system)

### 2. Create Initial Admin User
Run the admin creation script with your desired credentials:

\`\`\`bash
node scripts/003_create_initial_admin.js <username> <password>
\`\`\`

Example:
\`\`\`bash
node scripts/003_create_initial_admin.js admin mySecurePassword123
\`\`\`

**Important Security Notes:**
- Use a strong password (minimum 8 characters)
- Don't use common passwords like "password123"
- Consider using a password manager to generate secure passwords

### 3. Environment Variables
Ensure these environment variables are set in your Vercel project:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (needed for admin user creation)

## GitHub/Production Deployment

### 1. Deploy to Vercel
1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Ensure all environment variables are configured in Vercel project settings

### 2. Run Database Migrations in Production
1. Go to your Vercel project dashboard
2. Navigate to the Functions tab or use Vercel CLI
3. Execute the database scripts in order:
   - First: `scripts/001_create_leaderboard.sql`
   - Second: `scripts/002_create_admin_users.sql`

### 3. Create Production Admin User
After deployment, create your admin user by running the script with production environment variables:

\`\`\`bash
# Set environment variables
export NEXT_PUBLIC_SUPABASE_URL="your-production-supabase-url"
export SUPABASE_SERVICE_ROLE_KEY="your-production-service-role-key"

# Create admin user
node scripts/003_create_initial_admin.js admin yourProductionPassword
\`\`\`

## Security Features

### Password Hashing
- Passwords are hashed using bcrypt with salt
- No plaintext passwords stored in database
- Secure password verification function

### Database Security
- Row Level Security (RLS) enabled on admin_users table
- Service role required for admin user management
- Prepared statements prevent SQL injection

### Session Management
- Client-side session storage (localStorage)
- Session verification on protected routes
- Automatic redirect for unauthorized access

## Managing Admin Users

### Adding New Admin Users
Use the same script to add additional admin users:
\`\`\`bash
node scripts/003_create_initial_admin.js newadmin newSecurePassword
\`\`\`

### Removing Admin Users
Connect to your Supabase database and run:
\`\`\`sql
DELETE FROM admin_users WHERE username = 'username_to_remove';
\`\`\`

### Changing Admin Passwords
\`\`\`sql
UPDATE admin_users 
SET password_hash = crypt('new_password', gen_salt('bf')), 
    updated_at = NOW()
WHERE username = 'admin_username';
\`\`\`

## Troubleshooting

### Common Issues
1. **"Function verify_admin_credentials does not exist"**
   - Ensure `scripts/002_create_admin_users.sql` has been executed

2. **"Authentication failed"**
   - Verify admin user exists in database
   - Check username/password are correct
   - Ensure environment variables are properly set

3. **"Missing Supabase environment variables"**
   - Verify all required environment variables are configured
   - Check variable names match exactly (case-sensitive)

### Database Verification
To verify your setup, check if tables exist:
\`\`\`sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('leaderboard', 'admin_users');

-- Check if admin users exist
SELECT username, created_at FROM admin_users;
