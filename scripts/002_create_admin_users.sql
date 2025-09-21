-- Create admin_users table for secure credential management
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admin operations (you'll need to customize this based on your auth setup)
CREATE POLICY "Admin users can manage admin_users" ON admin_users
  FOR ALL USING (auth.role() = 'service_role');

-- Create a function to hash passwords (using pgcrypto extension)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to create admin user with hashed password
CREATE OR REPLACE FUNCTION create_admin_user(username_param TEXT, password_param TEXT)
RETURNS UUID AS $$
DECLARE
  user_id UUID;
BEGIN
  INSERT INTO admin_users (username, password_hash)
  VALUES (username_param, crypt(password_param, gen_salt('bf')))
  RETURNING id INTO user_id;
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify admin credentials
CREATE OR REPLACE FUNCTION verify_admin_credentials(username_param TEXT, password_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  SELECT password_hash INTO stored_hash
  FROM admin_users
  WHERE username = username_param;
  
  IF stored_hash IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN stored_hash = crypt(password_param, stored_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
