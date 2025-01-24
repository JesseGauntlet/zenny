-- Create ticket_notes table
CREATE TABLE ticket_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add updated_at trigger
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON ticket_notes
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Enable RLS
ALTER TABLE ticket_notes ENABLE ROW LEVEL SECURITY;

-- RLS policies
-- Only employees can view notes
CREATE POLICY "Employees can view all notes"
  ON ticket_notes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees WHERE id = auth.uid()
    )
  );

-- Only the note creator can update their notes
CREATE POLICY "Employees can update their own notes"
  ON ticket_notes
  FOR UPDATE
  TO authenticated
  USING (employee_id = auth.uid())
  WITH CHECK (employee_id = auth.uid());

-- Only employees can create notes
CREATE POLICY "Employees can create notes"
  ON ticket_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees WHERE id = auth.uid()
    )
  );

-- Only the note creator can delete their notes
CREATE POLICY "Employees can delete their own notes"
  ON ticket_notes
  FOR DELETE
  TO authenticated
  USING (employee_id = auth.uid());

-- Add type definitions to existing types
CREATE TYPE public.ticket_notes_with_employee AS (
  id UUID,
  ticket_id UUID,
  employee_id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  employee employees
); 