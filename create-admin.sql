-- Create admin user directly in database
-- Password is 'admin123' hashed with bcrypt

INSERT INTO users (username, email, password, "firstName", "lastName", "systemRole", "isActive", "createdAt", "updatedAt")
VALUES (
  'admin',
  'admin@rolloutready.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'System',
  'Administrator',
  'ADMIN',
  true,
  NOW(),
  NOW()
) ON CONFLICT (username) DO NOTHING;

-- Create a basic role
INSERT INTO roles (name, description, "createdAt", "updatedAt")
VALUES (
  'Project Manager',
  'Overall project coordination and management',
  NOW(),
  NOW()
) ON CONFLICT (name) DO NOTHING;
