import React, { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useSystemStatus } from '@/hooks/useSystemStatus';
import { Activity } from 'lucide-react';
const dotCls = (status?: 'operational' | 'degraded' | 'maintenance') => {
  switch (status) {
    case 'operational':
      return 'bg-emerald-500';
    case 'degraded':
      return 'bg-amber-500';
    case 'maintenance':
      return 'bg-blue-500';
    default:
      return 'bg-gray-400';
  }
};
export const MiniStatusIndicator: React.FC = () => {
  const {
    status,
    completenessScore,
    refresh
  } = useSystemStatus({
    silent: true
  });
  const [oicScore, setOicScore] = useState<number | null>(null);
  const [updating, setUpdating] = useState(false);
  const global = Math.max(0, Math.min(100, Math.round(completenessScore)));
  const loadOIC = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('oic_competences').select('description,intitule').limit(10);
      if (error) {
        setOicScore(null);
        return;
      }
      let problems = 0;
      data?.forEach((comp: any) => {
        if (comp.description?.includes('&lt;') || comp.description?.includes('&gt;') || comp.description?.includes('<') || comp.description?.includes('>') || comp.description?.startsWith('-') || comp.intitule?.includes('[[')) {
          problems++;
        }
      });
      const score = (10 - problems) / 10 * 100;
      setOicScore(Math.max(0, Math.min(100, score)));
    } catch {
      setOicScore(null);
    }
  };
  useEffect(() => {
    let mounted = true;
    const tick = async () => {
      setUpdating(true);
      await Promise.allSettled([refresh(), loadOIC()]);
      if (mounted) setUpdating(false);
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [refresh]);
  const label = useMemo(() => {
    const oicStr = oicScore === null ? '—' : `${Math.round(oicScore)}%`;
    return `${global}% | OIC ${oicStr}`;
  }, [global, oicScore]);
  return;
};
export default MiniStatusIndicator;