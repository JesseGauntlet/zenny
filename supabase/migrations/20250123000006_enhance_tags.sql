-- Enhance tags table with new columns
ALTER TABLE tags
ADD COLUMN color varchar(7) NOT NULL DEFAULT '#6B7280',
ADD COLUMN description text,
ADD COLUMN created_by uuid REFERENCES auth.users(id);

-- Add RLS policies for tags table
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Everyone can view tags
CREATE POLICY "Everyone can view tags" ON tags
    FOR SELECT
    USING (true);

-- Only employees can create tags
CREATE POLICY "Only employees can create tags" ON tags
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM employees
        WHERE employees.id = auth.uid()
    ));

-- Only employees can update tags
CREATE POLICY "Only employees can update tags" ON tags
    FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM employees
        WHERE employees.id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM employees
        WHERE employees.id = auth.uid()
    ));

-- Only employees can delete tags
CREATE POLICY "Only employees can delete tags" ON tags
    FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM employees
        WHERE employees.id = auth.uid()
    ));

-- Add unique constraint on tag names
ALTER TABLE tags ADD CONSTRAINT tags_name_unique UNIQUE (name);

-- Update ticket_tags table policies
ALTER TABLE ticket_tags ENABLE ROW LEVEL SECURITY;

-- Everyone can view ticket tags
CREATE POLICY "Everyone can view ticket tags" ON ticket_tags
    FOR SELECT
    USING (true);

-- Only employees can manage ticket tags
CREATE POLICY "Only employees can manage ticket tags" ON ticket_tags
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM employees
        WHERE employees.id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM employees
        WHERE employees.id = auth.uid()
    )); 