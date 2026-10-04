import { Card } from '@/components/ui/card';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Stethoscope, Flame } from 'lucide-react';
import { sanitizeHtml } from '@/utils/sanitize';

/** Balises gardées dans le dossier de la situation (aucun attribut, aucun lien). */
const BALISES_DOSSIER = ['h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'br'];

interface Patient {
  name: string;
  age: number | null;
  sex: string | null;
  avatar: string;
  /** Thèmes de la situation (ex. « Urgences, Cardiologie »). */
  background: string;
  /** Dossier de la situation de départ (HTML de la base, nettoyé avant affichage). */
  dossierHtml?: string | null;
}

interface PatientCardProps {
  patient: Patient;
}

export const PatientCard = ({ patient }: PatientCardProps) => {
  const { logActivity } = useActivityTracking();
  const { stats, loadStats, addPoints } = useGamification();
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
          await addPoints(user.id, 10, 'patient_card_view');
        }
      }
    };
    trackView();
  }, [patient.name]);

  const dossier = patient.dossierHtml
    ? sanitizeHtml(patient.dossierHtml, { ALLOWED_TAGS: BALISES_DOSSIER, ALLOWED_ATTR: [] }).trim()
    : '';

  return (
    <Card className="bg-card/10 backdrop-blur-sm border-border/20 mb-8">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{patient.avatar}</div>
            <div>
              <h3 className="text-xl font-bold text-foreground">{patient.name}</h3>
              {(patient.age || patient.sex) && (
                <p className="text-success">{[patient.age ? `${patient.age} ans` : null, patient.sex].filter(Boolean).join(' • ')}</p>
              )}
            </div>
          </div>
          {stats && (
            <div className="flex items-center gap-2 px-3 py-1 bg-muted/30 rounded-full">
              <Stethoscope className="h-4 w-4 text-primary" />
              <Flame className="h-4 w-4 text-warning" />
              <span className="text-sm font-bold text-warning">{stats.currentStreak}j</span>
            </div>
          )}
        </div>
        {patient.background && (
          <p className="text-foreground/80 text-sm">{patient.background}</p>
        )}
        {dossier && (
          <section
            aria-label="Dossier du patient"
            className="mt-4 rounded-lg border border-border bg-background/80 p-4 text-sm leading-relaxed text-foreground [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold [&_h4]:text-sm [&_h4]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-2"
            dangerouslySetInnerHTML={{ __html: dossier }}
          />
        )}
      </div>
    </Card>
  );
};
