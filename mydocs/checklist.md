## Phase 1: Core Authentication & Basic Ticket Flow
**Objective**: Enable users to register/login and create/view tickets.

### User Authentication
- [ ] Implement email/password signup/login
- [ ] Add role-based registration (customer vs employee)
- [ ] Set up RLS policies for auth.users, customers, and employees
- [ ] Create trigger to auto-create customer/employee records after auth signup

### Basic Ticket Creation
- [ ] Build ticket creation form (subject, description, priority)
- [ ] Create tickets table with core fields
- [ ] Add API endpoint: POST /tickets
- [ ] Implement ticket list view (customers see only their tickets)

### Basic Ticket Management
- [ ] Add ticket detail page (read-only for customers)
- [ ] Implement ticket status updates (open → pending → closed)
- [ ] Add simple ticket filtering (status, priority)

## Phase 2: Ticket Interactions & Basic Team Features
**Objective**: Enable conversations and internal notes.

### Ticket Conversations
- [ ] Create ticket_messages table
- [ ] Build message input UI
- [ ] Add real-time updates for new messages
- [ ] Implement file attachments (store in Supabase Storage)

### Internal Notes System
- [ ] Create ticket_notes table
- [ ] Add notes input UI (visible only to employees)
- [ ] Implement RLS policies for notes

### Basic Team Structure
- [ ] Create teams table
- [ ] Build team management UI (admin-only)
- [ ] Add employee → team assignment

## Phase 3: Advanced Ticket Management
**Objective**: Improve workflow with assignments and automation.

### Ticket Assignment System
- [ ] Add assigned_employee_id and assigned_team_id to tickets
- [ ] Implement assignment dropdown in ticket UI
- [ ] Add assignment notifications (email/webhook)

### Tagging System
- [ ] Create tags and ticket_tags tables
- [ ] Add tag management UI
- [ ] Implement tag filtering in ticket lists

### Custom Fields
- [ ] Add metadata JSONB column to tickets
- [ ] Build UI for custom field configuration
- [ ] Implement dynamic form rendering

## Phase 4: Team Collaboration & Reporting
**Objective**: Enhance team coordination and analytics.

### Team Queues
- [ ] Create team-specific ticket views
- [ ] Implement load balancing for team assignments
- [ ] Add team availability based on coverage_hours

### Reporting Dashboard
- [ ] Add ticket analytics (tickets created/closed per period)
- [ ] Implement agent performance metrics
- [ ] Create SLA compliance tracking

### Audit Logging
- [ ] Create audit_logs table
- [ ] Implement logging for key actions
- [ ] Add audit trail UI