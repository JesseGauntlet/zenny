-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'role' = 'employee' THEN
    INSERT INTO public.employees (id, name, role)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'name', 'agent');
  ELSE
    INSERT INTO public.customers (id, name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'name');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user(); 