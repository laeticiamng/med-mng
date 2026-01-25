import { Card } from '@/components/ui/card';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Stethoscope, Flame } from 'lucide-react';

interface Patient {
  name: string;
  age: number;
  sex: string;
  avatar: string;
  background: string;
}

interface PatientCardProps {
  patient: Patient;
}

export const PatientCard = ({ patient }: PatientCardProps) => {
  const { logActivity } = useActivityTracking();
  const { _stats, loadStats, _addPoints } = useGamification();
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) loadStats(user.id);
    };
    load();
  }, [loadStats]);

  useEffect(() => {
    const trackView = async () => {
      if (!hasTrackedRef.current) {
        hasTrackedRef.current = true;
        logActivity({
          activity_type: 'study',
          count: 1,
          metadata: { component: 'patient_card', action: 'view', patientName: patient.name }
        });
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await _addPoints(user.id, 'itemReviewed');
        }
      }
    };
    trackView();
  }, [patient.name]);

  return (
    <Card className="bg-card/10 backdrop-blur-sm border-border/20 mb-8">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{patient.avatar}</div>
            <div>
              <h3 className="text-xl font-bold text-foreground">{patient.name}</h3>
              <p className="text-success">{patient.age} ans • {patient.sex}</p>
            </div>
          </div>
          {_stats && (
            <div className="flex items-center gap-2 px-3 py-1 bg-muted/30 rounded-full">
              <Stethoscope className="h-4 w-4 text-primary" />
              <Flame className="h-4 w-4 text-warning" />
              <span className="text-sm font-bold text-warning">{_stats.currentStreak}j</span>
            </div>
          )}
        </div>
        <p className="text-foreground/80 text-sm">{patient.background}</p>
      </div>
    </Card>
  );
};
