-- Events & Calendar System Migration
-- Enables event management, calendar views, and attendee tracking

-- Create event_categories table
CREATE TABLE IF NOT EXISTS event_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color code
  icon_name VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES event_categories(id) ON DELETE SET NULL,
  event_type VARCHAR(50) NOT NULL DEFAULT 'event', -- 'event', 'meeting', 'task', 'reminder'
  location VARCHAR(255),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  all_day BOOLEAN DEFAULT false,
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  is_private BOOLEAN DEFAULT false,
  max_attendees INT,
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
  event_url VARCHAR(255), -- For virtual events (Zoom, Teams, etc.)
  image_url TEXT,
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create event_attendees table
CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'maybe'
  role VARCHAR(50) DEFAULT 'attendee', -- 'organizer', 'speaker', 'attendee', 'volunteer'
  rsvp_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Create event_reminders table
CREATE TABLE IF NOT EXISTS event_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_type VARCHAR(50) NOT NULL DEFAULT 'notification', -- 'notification', 'email', 'sms'
  reminder_time INT NOT NULL DEFAULT 15, -- Minutes before event
  is_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id, reminder_type)
);

-- Create event_comments table
CREATE TABLE IF NOT EXISTS event_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_team_id ON events(team_id);
CREATE INDEX IF NOT EXISTS idx_events_category_id ON events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_end ON events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id ON event_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_status ON event_attendees(status);
CREATE INDEX IF NOT EXISTS idx_event_reminders_event_id ON event_reminders(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reminders_user_id ON event_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_event_reminders_is_sent ON event_reminders(is_sent);
CREATE INDEX IF NOT EXISTS idx_event_comments_event_id ON event_comments(event_id);

-- Create triggers for timestamps
CREATE OR REPLACE FUNCTION update_events_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION update_event_attendees_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION update_event_comments_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL;

DROP TRIGGER IF EXISTS update_events_timestamp ON events;
CREATE TRIGGER update_events_timestamp
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_events_timestamp();

DROP TRIGGER IF EXISTS update_event_attendees_timestamp ON event_attendees;
CREATE TRIGGER update_event_attendees_timestamp
  BEFORE UPDATE ON event_attendees
  FOR EACH ROW
  EXECUTE FUNCTION update_event_attendees_timestamp();

DROP TRIGGER IF EXISTS update_event_comments_timestamp ON event_comments;
CREATE TRIGGER update_event_comments_timestamp
  BEFORE UPDATE ON event_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_event_comments_timestamp();

-- RLS Policies
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view public event categories
CREATE POLICY "Anyone can view event categories" ON event_categories
  FOR SELECT USING (true);

-- Anyone can view public events, organizer can view private events
CREATE POLICY "Anyone can view public events" ON events
  FOR SELECT USING (
    is_private = false
    OR auth.uid() = organizer_id
    OR auth.uid() IN (SELECT user_id FROM event_attendees WHERE event_id = events.id)
  );

-- Organizer can create events
CREATE POLICY "Authenticated users can create events" ON events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = organizer_id);

-- Organizer can update their own events
CREATE POLICY "Organizer can update events" ON events
  FOR UPDATE USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

-- Organizer can delete their own events
CREATE POLICY "Organizer can delete events" ON events
  FOR DELETE USING (auth.uid() = organizer_id);

-- Users can view/manage their attendee status
CREATE POLICY "Users can view attendee records" ON event_attendees
  FOR SELECT USING (
    auth.uid() = user_id
    OR auth.uid() IN (SELECT organizer_id FROM events WHERE id = event_id)
  );

-- Users can create attendee records (RSVP)
CREATE POLICY "Users can RSVP to events" ON event_attendees
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Users can update their own RSVP
CREATE POLICY "Users can update their RSVP" ON event_attendees
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can view/manage reminders
CREATE POLICY "Users can view reminders" ON event_reminders
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create reminders for events they attend
CREATE POLICY "Users can create reminders" ON event_reminders
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.uid() = user_id
    AND auth.uid() IN (SELECT user_id FROM event_attendees WHERE event_id = event_id)
  );

-- Anyone can view event comments for public events
CREATE POLICY "Anyone can view event comments" ON event_comments
  FOR SELECT USING (
    auth.uid() IN (SELECT organizer_id FROM events WHERE id = event_id)
    OR auth.uid() IN (SELECT user_id FROM event_attendees WHERE event_id = event_id)
    OR (SELECT is_private FROM events WHERE id = event_id) = false
  );

-- Users can create comments on events they can view
CREATE POLICY "Users can create event comments" ON event_comments
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.uid() = author_id
    AND auth.uid() IN (
      SELECT organizer_id FROM events WHERE id = event_id
      UNION
      SELECT user_id FROM event_attendees WHERE event_id = event_id
    )
  );

-- Create function to get calendar events for date range
CREATE OR REPLACE FUNCTION get_calendar_events(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  all_day BOOLEAN,
  category_id UUID,
  event_type VARCHAR(50),
  organizer_id UUID,
  location VARCHAR(255),
  status VARCHAR(50),
  attendee_status VARCHAR(50)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.title,
    e.description,
    e.start_date,
    e.end_date,
    e.all_day,
    e.category_id,
    e.event_type,
    e.organizer_id,
    e.location,
    e.status,
    COALESCE(ea.status, 'not_invited'::VARCHAR(50)) as attendee_status
  FROM events e
  LEFT JOIN event_attendees ea ON e.id = ea.event_id AND ea.user_id = p_user_id
  WHERE DATE(e.start_date) >= p_start_date
    AND DATE(e.start_date) <= p_end_date
    AND (
      e.organizer_id = p_user_id
      OR ea.user_id = p_user_id
      OR e.is_private = false
    )
  ORDER BY e.start_date ASC;
END;
$$ LANGUAGE PLPGSQL;

-- Create function to get upcoming events for user
CREATE OR REPLACE FUNCTION get_upcoming_events(
  p_user_id UUID,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  event_type VARCHAR(50),
  organizer_id UUID,
  location VARCHAR(255),
  attendee_status VARCHAR(50)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.title,
    e.start_date,
    e.event_type,
    e.organizer_id,
    e.location,
    COALESCE(ea.status, 'not_invited'::VARCHAR(50)) as attendee_status
  FROM events e
  LEFT JOIN event_attendees ea ON e.id = ea.event_id AND ea.user_id = p_user_id
  WHERE e.start_date > NOW()
    AND (
      e.organizer_id = p_user_id
      OR ea.user_id = p_user_id
      OR e.is_private = false
    )
  ORDER BY e.start_date ASC
  LIMIT p_limit;
END;
$$ LANGUAGE PLPGSQL;

-- Insert default event categories
INSERT INTO event_categories (name, description, color, icon_name)
VALUES
  ('Work', 'Work-related meetings and events', '#EF4444', 'briefcase'),
  ('Personal', 'Personal events and activities', '#8B5CF6', 'user'),
  ('Wellness', 'Wellness and health events', '#10B981', 'heart'),
  ('Social', 'Social gatherings and meetups', '#F59E0B', 'users'),
  ('Learning', 'Educational and learning events', '#3B82F6', 'book'),
  ('Holiday', 'Holidays and special occasions', '#EC4899', 'cake'),
  ('Meeting', 'Business meetings and calls', '#6366F1', 'video'),
  ('Deadline', 'Project deadlines and due dates', '#DC2626', 'alert-circle')
ON CONFLICT (name) DO NOTHING;

COMMIT;
