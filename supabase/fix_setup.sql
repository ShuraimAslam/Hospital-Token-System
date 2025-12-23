-- 1. Insert roles if they don't exist
INSERT INTO roles (role_name)
SELECT 'admin'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE role_name = 'admin');

INSERT INTO roles (role_name)
SELECT 'public_user'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE role_name = 'public_user');

-- 2. Grant permissions just in case (usually not needed for service_role but good for clarity)
GRANT USAGE ON SEQUENCE roles_id_seq TO postgres, anon, authenticated, service_role;
GRANT SELECT ON roles TO postgres, anon, authenticated, service_role;

-- 3. Verify the trigger exists and is valid
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
