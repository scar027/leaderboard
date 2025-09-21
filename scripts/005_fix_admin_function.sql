-- Enable the pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop the function if it exists to recreate it
DROP FUNCTION IF EXISTS create_admin_user(TEXT, TEXT);

-- Create the admin user creation function with correct parameter order
CREATE OR REPLACE FUNCTION create_admin_user(admin_username TEXT, admin_password TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if username already exists
  IF EXISTS (SELECT 1 FROM admin_users WHERE username = admin_username) THEN
    RETURN 'Error: Username already exists';
  END IF;
  
  -- Insert new admin user with hashed password
  INSERT INTO admin_users (username, password_hash)
  VALUES (admin_username, crypt(admin_password, gen_salt('bf')));
  
  RETURN 'Admin user created successfully';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error: ' || SQLERRM;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_admin_user(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION create_admin_user(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_admin_user(TEXT, TEXT) TO service_role;
