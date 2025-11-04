-- Create user_modules table for tracking activated modules
CREATE TABLE IF NOT EXISTS user_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  activated_at TIMESTAMPTZ DEFAULT now(),
  activation_source TEXT,
  order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, module_name)
);

-- Create purchase_history table
CREATE TABLE IF NOT EXISTS purchase_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  order_id TEXT NOT NULL UNIQUE,
  total_amount DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  status TEXT DEFAULT 'pending',
  modules_activated TEXT[],
  order_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create pending_activations table for users who buy before signing up
CREATE TABLE IF NOT EXISTS pending_activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  order_id TEXT NOT NULL,
  order_data JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_activations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_modules
CREATE POLICY "Users can view their own modules"
  ON user_modules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all modules"
  ON user_modules FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for purchase_history
CREATE POLICY "Users can view their own purchases"
  ON purchase_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all purchases"
  ON purchase_history FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for pending_activations
CREATE POLICY "Service role can manage pending activations"
  ON pending_activations FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_modules_user_id ON user_modules(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_history_user_id ON purchase_history(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_history_order_id ON purchase_history(order_id);
CREATE INDEX IF NOT EXISTS idx_pending_activations_email ON pending_activations(email);

-- Function to activate pending modules when user signs up
CREATE OR REPLACE FUNCTION activate_pending_modules()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for pending activations
  INSERT INTO user_modules (user_id, module_name, is_active, activated_at, activation_source, order_id)
  SELECT 
    NEW.id,
    unnest(ARRAY['focus', 'productivity', 'wellness']),
    true,
    now(),
    'pending_activation',
    pa.order_id
  FROM pending_activations pa
  WHERE pa.email = NEW.email AND pa.status = 'pending'
  ON CONFLICT (user_id, module_name) DO NOTHING;
  
  -- Mark pending activations as processed
  UPDATE pending_activations
  SET status = 'processed'
  WHERE email = NEW.email AND status = 'pending';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to activate pending modules on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION activate_pending_modules();
