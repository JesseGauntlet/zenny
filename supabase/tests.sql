-- psql -h localhost -p 54322 -U postgres -d postgres -f supabase/tests.sql
-- 1. Create a test user
INSERT INTO users (
    name,
    email,
    password_hash  -- In production, this would be properly hashed
) VALUES (
    'Test Customer',
    'customer@test.com',
    'password123'
) RETURNING *;

-- 2. Create a test employee (agent)
INSERT INTO employees (
    name,
    email,
    password_hash,
    role
) VALUES (
    'Test Agent',
    'agent@test.com',
    'password123',
    'agent'
) RETURNING *;

-- 3. Create a test team
INSERT INTO teams (
    name,
    description,
    coverage_hours
) VALUES (
    'Customer Support',
    'General customer support team',
    '{"weekdays": {"start": "09:00", "end": "17:00"}, "timezone": "UTC"}'::jsonb
) RETURNING *;

-- 4. Assign employee to team (save the IDs from steps 2 and 3)
INSERT INTO employees_teams (
    employee_id,
    team_id
) VALUES (
    -- Replace with actual UUIDs from steps 2 and 3
    (SELECT id FROM employees WHERE email = 'agent@test.com'),
    (SELECT id FROM teams WHERE name = 'Customer Support')
);

-- 5. Create a test ticket
INSERT INTO tickets (
    subject,
    description,
    status,
    priority,
    customer_id,
    assigned_team_id
) VALUES (
    'Test Ticket',
    'This is a test ticket description',
    'open',
    'medium',
    (SELECT id FROM users WHERE email = 'customer@test.com'),
    (SELECT id FROM teams WHERE name = 'Customer Support')
) RETURNING *;

-- 6. Add a message to the ticket
INSERT INTO ticket_messages (
    ticket_id,
    sender_id,
    sender_type,
    content
) VALUES (
    (SELECT id FROM tickets WHERE subject = 'Test Ticket' LIMIT 1),
    (SELECT id FROM users WHERE email = 'customer@test.com'),
    'customer',
    'This is a test message from the customer'
) RETURNING *;

-- 7. Add an internal note
INSERT INTO ticket_notes (
    ticket_id,
    author_id,
    content
) VALUES (
    (SELECT id FROM tickets WHERE subject = 'Test Ticket' LIMIT 1),
    (SELECT id FROM employees WHERE email = 'agent@test.com'),
    'Internal note for testing'
) RETURNING *;

-- Verification queries:

-- Check user creation
SELECT * FROM users WHERE email = 'customer@test.com';

-- Check employee and team assignment
SELECT 
    e.name as employee_name,
    t.name as team_name
FROM employees e
JOIN employees_teams et ON e.id = et.employee_id
JOIN teams t ON t.id = et.team_id
WHERE e.email = 'agent@test.com';

-- Check ticket creation and assignment
SELECT 
    t.subject,
    t.status,
    t.priority,
    u.name as customer_name,
    team.name as assigned_team
FROM tickets t
JOIN users u ON t.customer_id = u.id
JOIN teams team ON t.assigned_team_id = team.id
WHERE t.subject = 'Test Ticket';

-- Check messages and notes
SELECT 
    tm.content as message_content,
    tm.sender_type,
    u.name as sender_name
FROM ticket_messages tm
JOIN users u ON tm.sender_id = u.id
WHERE tm.ticket_id = (SELECT id FROM tickets WHERE subject = 'Test Ticket' LIMIT 1);

SELECT 
    tn.content as note_content,
    e.name as author_name
FROM ticket_notes tn
JOIN employees e ON tn.author_id = e.id
WHERE tn.ticket_id = (SELECT id FROM tickets WHERE subject = 'Test Ticket' LIMIT 1); 