-- Add a function to create admin users securely
CREATE OR REPLACE FUNCTION create_admin_user(admin_username TEXT, admin_password TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if username already exists
  IF EXISTS (SELECT 1 FROM admin_users WHERE username = admin_username) THEN
    RAISE EXCEPTION 'Username already exists';
  END IF;
  
  -- Insert new admin user with hashed password
  INSERT INTO admin_users (username, password_hash)
  VALUES (admin_username, crypt(admin_password, gen_salt('bf')));
  
  RETURN 'Admin user created successfully';
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_admin_user(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION create_admin_user(TEXT, TEXT) TO authenticated;
