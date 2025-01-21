-- Enable read access for anonymous users
CREATE POLICY "Enable read access for all users"
ON users FOR SELECT
TO anon
USING (true);

CREATE POLICY "Enable read access for all tickets"
ON tickets FOR SELECT
TO anon
USING (true);

CREATE POLICY "Enable read access for all messages"
ON ticket_messages FOR SELECT
TO anon
USING (true);

-- Enable insert for authenticated users
CREATE POLICY "Enable insert for authenticated users"
ON tickets FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable insert for messages"
ON ticket_messages FOR INSERT
TO authenticated
WITH CHECK (true); 