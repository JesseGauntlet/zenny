-- Create teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  coverage_hours JSONB DEFAULT '{"monday": {"start": "09:00", "end": "17:00"}, "tuesday": {"start": "09:00", "end": "17:00"}, "wednesday": {"start": "09:00", "end": "17:00"}, "thursday": {"start": "09:00", "end": "17:00"}, "friday": {"start": "09:00", "end": "17:00"}}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create employees_teams junction table
CREATE TABLE employees_teams (
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  is_team_lead BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (employee_id, team_id)
);

-- Add updated_at trigger for teams
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON teams
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees_teams ENABLE ROW LEVEL SECURITY;

-- RLS policies for teams

-- Only employees can view teams
CREATE POLICY "Employees can view teams"
  ON teams
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees WHERE id = auth.uid()
    )
  );

-- Only admins can manage teams
CREATE POLICY "Admins can manage teams"
  ON teams
  USING (
    EXISTS (
      SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policies for employees_teams

-- Employees can view team assignments
CREATE POLICY "Employees can view team assignments"
  ON employees_teams
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees WHERE id = auth.uid()
    )
  );

-- Only admins can manage team assignments
CREATE POLICY "Admins can manage team assignments"
  ON employees_teams
  USING (
    EXISTS (
      SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add team_id to tickets table
ALTER TABLE tickets 
ADD COLUMN assigned_team_id UUID REFERENCES teams(id),
ADD CONSTRAINT check_assignment 
  CHECK (
    (assigned_employee_id IS NULL AND assigned_team_id IS NOT NULL) OR
    (assigned_employee_id IS NOT NULL AND assigned_team_id IS NULL) OR
    (assigned_employee_id IS NULL AND assigned_team_id IS NULL)
  );

-- Add types for TypeScript
CREATE TYPE public.team_with_members AS (
  id UUID,
  name TEXT,
  description TEXT,
  coverage_hours JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  members employees[]
); 