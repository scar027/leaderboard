# Secure Admin Setup Guide

## Overview
The admin setup process is now secured with multiple layers of protection:

1. **Server-Side Setup Key Protection**: Requires environment variable `ADMIN_SETUP_KEY` (server-only)
2. **One-Time Setup**: Automatically disables after first admin is created
3. **Database Verification**: Checks for existing admins before allowing setup

## Setup Instructions

### 1. Set Environment Variable

**IMPORTANT**: Use `ADMIN_SETUP_KEY` (server-side only) to keep it secure.

**For Local Development:**
Add to your Vercel project settings:
\`\`\`
ADMIN_SETUP_KEY=your-secure-random-key-here
\`\`\`

**For Production:**
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add: `ADMIN_SETUP_KEY` with a secure random value
4. **DO NOT** use client-side prefixes - this keeps the key secure on the server

### 2. Generate a Secure Setup Key

Use a strong, random key. Examples:
\`\`\`bash
# Generate a random key (if you have openssl)
openssl rand -hex 32

# Or use a password generator
# Minimum 20 characters, mix of letters, numbers, symbols
\`\`\`

### 3. Create Your First Admin

1. Visit `/admin/setup` in your browser
2. Enter your setup key (verified server-side)
3. Create your admin username and password
4. Setup automatically disables after successful creation

### 4. Security Features

✅ **Server-Side Key Verification**: Setup key never exposed to client  
✅ **One-Time Setup**: Automatically disables after first admin  
✅ **Database Verification**: Checks for existing admins  
✅ **Strong Password Requirements**: Minimum 8 characters  
✅ **Secure Password Hashing**: Uses bcrypt with salt  
✅ **Environment Variable Based**: No hardcoded credentials

## Environment Variable Setup

**Correct (Secure):**
\`\`\`
ADMIN_SETUP_KEY=your-secret-key-here
\`\`\`


## Troubleshooting

- **"Setup key required"**: Set the `ADMIN_SETUP_KEY` environment variable (server-side only)
- **"Setup disabled"**: Admin users already exist, setup is automatically disabled
- **"Invalid setup key"**: Check your environment variable value
- **"Server error"**: Check server logs for database connection issues
