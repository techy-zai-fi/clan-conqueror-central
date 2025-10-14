-- Add balaji.g2027d@iimbg.ac.in as admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'balaji.g2027d@iimbg.ac.in'
ON CONFLICT (user_id, role) DO NOTHING;