-- Fix overly permissive RLS policies for service role
-- These policies use USING(true) WITH CHECK(true) which is too permissive

-- 1. Fix accessibility_report_config - should only allow authenticated admin access
DROP POLICY IF EXISTS "Service role manages accessibility_report_config" ON accessibility_report_config;
CREATE POLICY "Admin manages accessibility_report_config" 
ON accessibility_report_config 
FOR ALL 
TO authenticated
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- 2. Fix ai_generated_content - public read is ok, but write should be restricted
DROP POLICY IF EXISTS "Service role manages ai_generated_content" ON ai_generated_content;
CREATE POLICY "Service role manages ai_generated_content" 
ON ai_generated_content 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 3. Fix ai_template_suggestions
DROP POLICY IF EXISTS "Service role manages ai_template_suggestions" ON ai_template_suggestions;
CREATE POLICY "Service role manages ai_template_suggestions" 
ON ai_template_suggestions 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 4. Fix alert_escalation_rules
DROP POLICY IF EXISTS "Service role manages alert_escalation_rules" ON alert_escalation_rules;
CREATE POLICY "Service role manages alert_escalation_rules" 
ON alert_escalation_rules 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 5. Fix admin_changelog
DROP POLICY IF EXISTS "Service role only admin_changelog" ON admin_changelog;
CREATE POLICY "Service role only admin_changelog" 
ON admin_changelog 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);