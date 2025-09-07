-- Database schema for Routing Rules Engine

-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create routing_rules table with foreign key to members
CREATE TABLE IF NOT EXISTS routing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  default_member_id INTEGER NOT NULL REFERENCES members(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create rules table with foreign key to members
CREATE TABLE IF NOT EXISTS rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routing_rules_id UUID NOT NULL REFERENCES routing_rules(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  conditions JSONB NOT NULL,
  member_id INTEGER NOT NULL REFERENCES members(id),
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rules_routing_rules_id ON rules(routing_rules_id);
CREATE INDEX IF NOT EXISTS idx_rules_priority ON rules(priority);
CREATE INDEX IF NOT EXISTS idx_routing_rules_name ON routing_rules(name);
CREATE INDEX IF NOT EXISTS idx_members_name ON members(name);
CREATE INDEX IF NOT EXISTS idx_members_active ON members(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_members_updated_at ON members;
CREATE TRIGGER update_members_updated_at 
  BEFORE UPDATE ON members 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_routing_rules_updated_at ON routing_rules;
CREATE TRIGGER update_routing_rules_updated_at 
  BEFORE UPDATE ON routing_rules 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rules_updated_at ON rules;
CREATE TRIGGER update_rules_updated_at 
  BEFORE UPDATE ON rules 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
-- First, clear any existing data to ensure fresh start
DELETE FROM rules;
DELETE FROM routing_rules;
DELETE FROM members;

-- Insert sample members
INSERT INTO members (id, name, email) VALUES 
(1, 'Stav', 'stav@company.com'),
(2, 'Eldad', 'eldad@company.com'),
(3, 'Alon', 'alon@company.com'),
(4, 'Shira', 'shira@company.com');

-- Insert sample routing rules
INSERT INTO routing_rules (id, name, default_member_id) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Sample Routing Rules', 1);

-- Insert sample rules
INSERT INTO rules (routing_rules_id, name, conditions, member_id, priority) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440000', 
  'Eldad Rule', 
  '[
    {"field": "contact_country", "operator": "=", "value": "US"},
    {"field": "contact_country", "operator": "=", "value": "IL"},
    {"field": "company_name", "operator": "=", "value": "WIX"},
    {"field": "company_hq_country", "operator": "=", "value": "DE"}
  ]'::jsonb, 
  2, 
  0
);

INSERT INTO rules (routing_rules_id, name, conditions, member_id, priority) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440000', 
  'Alon Rule', 
  '[
    {"field": "company_industry", "operator": "=", "value": "ACCOUNTING"},
    {"field": "company_hq_country", "operator": "=", "value": "DE"}
  ]'::jsonb, 
  3, 
  1
);

INSERT INTO rules (routing_rules_id, name, conditions, member_id, priority) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440000', 
  'Shira Rule', 
  '[
    {"field": "first_page", "operator": "=", "value": "/pricing"},
    {"field": "company_size", "operator": ">", "value": 100},
    {"field": "first_seen", "operator": ">", "value": "2024-01-01"},
    {"field": "last_seen", "operator": "<", "value": "2024-12-31"}
  ]'::jsonb, 
  4, 
  2
);
