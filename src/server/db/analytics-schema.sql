-- Analytics tables for WhatsApp Automation

-- Message analytics table
CREATE TABLE analytics_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  total_received INTEGER NOT NULL DEFAULT 0,
  total_sent INTEGER NOT NULL DEFAULT 0,
  ai_generated INTEGER NOT NULL DEFAULT 0,
  template_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Response time analytics table
CREATE TABLE analytics_response_times (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  avg_response_time_seconds FLOAT NOT NULL DEFAULT 0,
  min_response_time_seconds FLOAT NOT NULL DEFAULT 0,
  max_response_time_seconds FLOAT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User engagement analytics table
CREATE TABLE analytics_engagement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  active_conversations INTEGER NOT NULL DEFAULT 0,
  new_conversations INTEGER NOT NULL DEFAULT 0,
  conversation_duration_avg_seconds FLOAT NOT NULL DEFAULT 0,
  messages_per_conversation_avg FLOAT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Template performance analytics
CREATE TABLE analytics_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  times_used INTEGER NOT NULL DEFAULT 0,
  response_rate FLOAT, -- percentage of times user responded after template
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_analytics_messages_date ON analytics_messages(date);
CREATE INDEX idx_analytics_response_times_date ON analytics_response_times(date);
CREATE INDEX idx_analytics_engagement_date ON analytics_engagement(date);
CREATE INDEX idx_analytics_templates_date ON analytics_templates(date);
CREATE INDEX idx_analytics_templates_template_id ON analytics_templates(template_id);
