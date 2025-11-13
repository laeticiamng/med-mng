-- Add missing triggers for share notifications
-- These triggers were defined in functions but not attached to tables

-- Drop existing triggers if they exist (to avoid conflicts)
DROP TRIGGER IF EXISTS on_share_created ON public.sitemap_shares;
DROP TRIGGER IF EXISTS on_share_updated ON public.sitemap_shares;
DROP TRIGGER IF EXISTS on_share_deleted ON public.sitemap_shares;

-- Create trigger for new shares
CREATE TRIGGER on_share_created
  AFTER INSERT ON public.sitemap_shares
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_share_created();

-- Create trigger for updated shares (permission changes)
CREATE TRIGGER on_share_updated
  AFTER UPDATE ON public.sitemap_shares
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_share_updated();

-- Create trigger for deleted shares
CREATE TRIGGER on_share_deleted
  AFTER DELETE ON public.sitemap_shares
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_share_deleted();