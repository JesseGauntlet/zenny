-- Add email columns to customers and employees tables
ALTER TABLE customers ADD COLUMN email TEXT NOT NULL;
ALTER TABLE employees ADD COLUMN email TEXT NOT NULL;

-- Update existing records with emails from auth.users
UPDATE customers 
SET email = au.email 
FROM auth.users au 
WHERE customers.id = au.id;

UPDATE employees 
SET email = au.email 
FROM auth.users au 
WHERE employees.id = au.id;

-- Update the trigger function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'role' = 'customer' THEN
    INSERT INTO public.customers (id, email, name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  ELSIF NEW.raw_user_meta_data->>'role' = 'employee' THEN
    INSERT INTO public.employees (id, email, name, role)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), 'agent');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;