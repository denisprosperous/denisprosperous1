-- Scheduled messages tables for WhatsApp Automation

-- Scheduled messages table
CREATE TABLE scheduled_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  scheduled_time TIMESTAMPTZ NOT NULL,
  recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_pattern TEXT, -- 'daily', 'weekly', 'monthly', 'custom'
  recurrence_config JSONB, -- Configuration for custom recurrence
  next_run TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'cancelled'
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Scheduled message logs table
CREATE TABLE scheduled_message_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scheduled_message_id UUID REFERENCES scheduled_messages(id) ON DELETE CASCADE,
  status TEXT NOT NULL, -- 'success', 'failed'
  error TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_scheduled_messages_team_id ON scheduled_messages(team_id);
CREATE INDEX idx_scheduled_messages_next_run ON scheduled_messages(next_run);
CREATE INDEX idx_scheduled_messages_status ON scheduled_messages(status);
CREATE INDEX idx_scheduled_message_logs_scheduled_message_id ON scheduled_message_logs(scheduled_message_id);
