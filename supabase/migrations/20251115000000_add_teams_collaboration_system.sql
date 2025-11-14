-- Teams and Collaboration System

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  avatar_url TEXT,
  cover_url TEXT,
  visibility TEXT DEFAULT 'private', -- private, internal, public
  member_count INTEGER DEFAULT 1,
  max_members INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- owner, admin, moderator, member
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Team invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users ON DELETE SET NULL,
  invited_email TEXT,
  invited_user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  status TEXT DEFAULT 'pending', -- pending, accepted, declined, expired
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team channels table (discussion groups within teams)
CREATE TABLE IF NOT EXISTS team_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES auth.users ON DELETE SET NULL,
  topic TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team channel messages table
CREATE TABLE IF NOT EXISTS team_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES team_channels ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users ON DELETE SET NULL,
  content TEXT NOT NULL,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team permissions table
CREATE TABLE IF NOT EXISTS team_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams ON DELETE CASCADE,
  role TEXT NOT NULL,
  permission TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, role, permission)
);

-- Team activity log table
CREATE TABLE IF NOT EXISTS team_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  action TEXT NOT NULL, -- member_added, member_removed, member_promoted, channel_created, etc.
  resource_type TEXT,
  resource_id TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_teams_owner_id ON teams(owner_id);
CREATE INDEX idx_teams_visibility ON teams(visibility);
CREATE INDEX idx_teams_slug ON teams(slug);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_role ON team_members(role);
CREATE INDEX idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX idx_team_invitations_invited_email ON team_invitations(invited_email);
CREATE INDEX idx_team_invitations_status ON team_invitations(status);
CREATE INDEX idx_team_channels_team_id ON team_channels(team_id);
CREATE INDEX idx_team_channels_is_private ON team_channels(is_private);
CREATE INDEX idx_team_messages_channel_id ON team_messages(channel_id);
CREATE INDEX idx_team_messages_author_id ON team_messages(author_id);
CREATE INDEX idx_team_messages_created_at ON team_messages(created_at);
CREATE INDEX idx_team_activity_logs_team_id ON team_activity_logs(team_id);
CREATE INDEX idx_team_activity_logs_created_at ON team_activity_logs(created_at);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - teams
CREATE POLICY "teams_select_owner_and_members" ON teams
  FOR SELECT USING (
    auth.uid() = owner_id OR
    EXISTS(SELECT 1 FROM team_members WHERE team_members.team_id = teams.id AND team_members.user_id = auth.uid()) OR
    visibility = 'public'
  );

CREATE POLICY "teams_insert_auth" ON teams
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "teams_update_owner" ON teams
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "teams_delete_owner" ON teams
  FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies - team_members
CREATE POLICY "team_members_select_own_teams" ON team_members
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS(SELECT 1 FROM teams WHERE teams.id = team_members.team_id AND teams.owner_id = auth.uid()) OR
    EXISTS(SELECT 1 FROM team_members tm WHERE tm.team_id = team_members.team_id AND tm.user_id = auth.uid())
  );

CREATE POLICY "team_members_insert_owner" ON team_members
  FOR INSERT WITH CHECK (
    EXISTS(SELECT 1 FROM teams WHERE teams.id = team_members.team_id AND teams.owner_id = auth.uid())
  );

CREATE POLICY "team_members_update_owner" ON team_members
  FOR UPDATE USING (
    EXISTS(SELECT 1 FROM teams WHERE teams.id = team_members.team_id AND teams.owner_id = auth.uid())
  );

CREATE POLICY "team_members_delete_owner" ON team_members
  FOR DELETE USING (
    EXISTS(SELECT 1 FROM teams WHERE teams.id = team_members.team_id AND teams.owner_id = auth.uid()) OR
    auth.uid() = user_id
  );

-- RLS Policies - team_invitations
CREATE POLICY "team_invitations_select_team_members" ON team_invitations
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM team_members WHERE team_members.team_id = team_invitations.team_id AND team_members.user_id = auth.uid()) OR
    auth.uid() = invited_user_id OR
    invited_email = auth.jwt()->>'email'
  );

CREATE POLICY "team_invitations_insert_owner" ON team_invitations
  FOR INSERT WITH CHECK (
    EXISTS(SELECT 1 FROM teams WHERE teams.id = team_invitations.team_id AND teams.owner_id = auth.uid())
  );

CREATE POLICY "team_invitations_update_user" ON team_invitations
  FOR UPDATE USING (
    auth.uid() = invited_user_id OR
    invited_email = auth.jwt()->>'email'
  );

-- RLS Policies - team_channels
CREATE POLICY "team_channels_select_members" ON team_channels
  FOR SELECT USING (
    NOT is_private OR
    EXISTS(SELECT 1 FROM team_members WHERE team_members.team_id = team_channels.team_id AND team_members.user_id = auth.uid())
  );

CREATE POLICY "team_channels_insert_members" ON team_channels
  FOR INSERT WITH CHECK (
    EXISTS(SELECT 1 FROM team_members WHERE team_members.team_id = team_channels.team_id AND team_members.user_id = auth.uid())
  );

-- RLS Policies - team_messages
CREATE POLICY "team_messages_select" ON team_messages
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM team_members WHERE team_members.team_id = team_messages.team_id AND team_members.user_id = auth.uid())
  );

CREATE POLICY "team_messages_insert" ON team_messages
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    EXISTS(SELECT 1 FROM team_members WHERE team_members.team_id = team_messages.team_id AND team_members.user_id = auth.uid())
  );

CREATE POLICY "team_messages_update_author" ON team_messages
  FOR UPDATE USING (auth.uid() = author_id);

-- RLS Policies - team_activity_logs
CREATE POLICY "team_activity_logs_select_members" ON team_activity_logs
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM team_members WHERE team_members.team_id = team_activity_logs.team_id AND team_members.user_id = auth.uid())
  );

CREATE POLICY "team_activity_logs_insert_service" ON team_activity_logs
  FOR INSERT WITH CHECK (TRUE);

-- Triggers for updated_at
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_invitations_updated_at
  BEFORE UPDATE ON team_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_channels_updated_at
  BEFORE UPDATE ON team_channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_messages_updated_at
  BEFORE UPDATE ON team_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Default permissions for roles
INSERT INTO team_permissions (team_id, role, permission) VALUES
  (gen_random_uuid(), 'owner', 'manage_team'),
  (gen_random_uuid(), 'owner', 'manage_members'),
  (gen_random_uuid(), 'owner', 'manage_channels'),
  (gen_random_uuid(), 'owner', 'manage_roles'),
  (gen_random_uuid(), 'admin', 'manage_members'),
  (gen_random_uuid(), 'admin', 'manage_channels'),
  (gen_random_uuid(), 'moderator', 'manage_channels'),
  (gen_random_uuid(), 'member', 'post_message')
ON CONFLICT (team_id, role, permission) DO NOTHING;
