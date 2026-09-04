-- Enums
CREATE TYPE role AS ENUM ('employee', 'agent', 'admin');
CREATE TYPE priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE activity_action AS ENUM ('status_changed', 'priority_changed', 'assigned', 'reassigned', 'comment_added');

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role role NOT NULL DEFAULT 'employee',
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Tickets
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority priority NOT NULL,
  status status NOT NULL DEFAULT 'open',
  created_by UUID NOT NULL REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP
);

-- Ticket comments
CREATE TABLE ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id),
  user_id UUID NOT NULL REFERENCES users(id),
  message TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Ticket attachments
CREATE TABLE ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Ticket activity log
CREATE TABLE ticket_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id),
  actor_id UUID NOT NULL REFERENCES users(id),
  action_type activity_action NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- SLA rules
CREATE TABLE sla_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  priority priority NOT NULL UNIQUE,
  response_time_minutes INTEGER NOT NULL,
  resolution_time_minutes INTEGER NOT NULL
);

-- Seed default SLA rules
INSERT INTO sla_rules (priority, response_time_minutes, resolution_time_minutes) VALUES
  ('low', 480, 4320),
  ('medium', 240, 1440),
  ('high', 60, 480),
  ('critical', 15, 240);
