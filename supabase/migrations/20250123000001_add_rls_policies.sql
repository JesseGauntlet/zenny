-- Helper function to check if a user is an employee
CREATE OR REPLACE FUNCTION is_employee(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM employees WHERE id = user_id);
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Helper function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM employees WHERE id = user_id AND role = 'admin');
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Helper function to check if a user is a customer
CREATE OR REPLACE FUNCTION is_customer(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM customers WHERE id = user_id);
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Customers table policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Add policy for initial customer creation
CREATE POLICY "Allow trigger to create customer profiles"
    ON customers FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Customers can view their own profile"
    ON customers FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Employees can view all customers"
    ON customers FOR SELECT
    USING (is_employee(auth.uid()));

CREATE POLICY "Customers can update their own profile"
    ON customers FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can manage customers"
    ON customers FOR ALL
    USING (is_admin(auth.uid()));

-- Employees table policies
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Add policy for initial employee creation
CREATE POLICY "Allow trigger to create employee profiles"
    ON employees FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Employees can view other employees"
    ON employees FOR SELECT
    USING (is_employee(auth.uid()));

CREATE POLICY "Admins can manage employees"
    ON employees FOR ALL
    USING (is_admin(auth.uid()));

-- Teams table policies
CREATE POLICY "Everyone can view teams"
    ON teams FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage teams"
    ON teams FOR ALL
    USING (is_admin(auth.uid()));

-- Tickets table policies
CREATE POLICY "Customers can view their own tickets"
    ON tickets FOR SELECT
    USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create tickets"
    ON tickets FOR INSERT
    WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update their own tickets description"
    ON tickets FOR UPDATE
    USING (auth.uid() = customer_id);

CREATE POLICY "Employees can view all tickets"
    ON tickets FOR SELECT
    USING (is_employee(auth.uid()));

CREATE POLICY "Employees can update tickets"
    ON tickets FOR UPDATE
    USING (is_employee(auth.uid()));

-- Ticket messages policies
CREATE POLICY "Customers can view messages of their tickets"
    ON ticket_messages FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM tickets
        WHERE tickets.id = ticket_id
        AND tickets.customer_id = auth.uid()
    ));

CREATE POLICY "Customers can create messages on their tickets"
    ON ticket_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tickets
            WHERE tickets.id = ticket_id
            AND tickets.customer_id = auth.uid()
        )
        AND sender_id = auth.uid()
        AND sender_type = 'customer'
        AND is_customer(auth.uid())
    );

CREATE POLICY "Employees can view all messages"
    ON ticket_messages FOR SELECT
    USING (is_employee(auth.uid()));

CREATE POLICY "Employees can create messages"
    ON ticket_messages FOR INSERT
    WITH CHECK (
        is_employee(auth.uid())
        AND sender_id = auth.uid()
        AND sender_type = 'employee'
    );

-- Ticket notes policies (internal only)
CREATE POLICY "Employees can view notes"
    ON ticket_notes FOR SELECT
    USING (is_employee(auth.uid()));

CREATE POLICY "Employees can create notes"
    ON ticket_notes FOR INSERT
    WITH CHECK (is_employee(auth.uid()) AND author_id = auth.uid());

CREATE POLICY "Employees can update their own notes"
    ON ticket_notes FOR UPDATE
    USING (author_id = auth.uid());

-- Tags policies
CREATE POLICY "Everyone can view tags"
    ON tags FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Employees can manage tags"
    ON tags FOR ALL
    USING (is_employee(auth.uid()));

-- Ticket tags policies
CREATE POLICY "Everyone can view ticket tags"
    ON ticket_tags FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Employees can manage ticket tags"
    ON ticket_tags FOR ALL
    USING (is_employee(auth.uid()));

-- Audit logs policies
CREATE POLICY "Customers can view audit logs of their tickets"
    ON audit_logs FOR SELECT
    USING (
        actor_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM tickets
            WHERE tickets.id = entity_id
            AND entity_type = 'ticket'
            AND tickets.customer_id = auth.uid()
        )
    );

CREATE POLICY "Employees can view all audit logs"
    ON audit_logs FOR SELECT
    USING (is_employee(auth.uid()));

CREATE POLICY "System can create audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (true); 

-- Allow users to read their own customer record
CREATE POLICY "Users can view own customer record"
ON customers FOR SELECT
USING (auth.uid() = id);