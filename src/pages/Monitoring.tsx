import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import StatusWidget from '@/components/StatusWidget';
import { useSystemStatus } from '@/hooks/useSystemStatus';
import { useExtractionMonitoring } from '@/hooks/useExtractionMonitoring';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Activity, BarChart3 } from 'lucide-react';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { PageHeader } from '@/components/layout/PageHeader';

const StatCard = ({ title, value, hint }: { title: string; value: string | number; hint?: string }) => (
  <div className="rounded-xl border border-border p-4 bg-card/80 backdrop-blur-sm shadow-sm">
    <div className="text-sm text-muted-foreground mb-1">{title}</div>
    <div className="text-2xl font-semibold text-foreground">{value}</div>
    {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
  </div>
);

const Section = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <section className="mb-10">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    {children}
  </section>
);

const Monitoring: React.FC = () => {
  const navigate = useNavigate();
  const { isOperational } = useSystemStatus({ silent: true });
  const { stats, recentExtractions, refresh, loading } = useExtractionMonitoring();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      refresh();
      setTick((t) => t + 1);
    }, 15000);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <ConsistentBackground variant="secondary">
      <Helmet>
        <title>Monitoring plateforme | MED MNG</title>
        <meta name="description" content="Monitoring temps réel: statut, complétude et extractions. MED MNG." />
        <link rel="canonical" href="/monitoring" />
      </Helmet>

      <PageHeader
        title="Monitoring plateforme"
        subtitle="Surveillance en temps réel du système et des extractions"
        icon={Activity}
        badge={{
          text: isOperational ? 'Opérationnel' : 'Vérification…',
          variant: isOperational ? 'default' : 'secondary'
        }}
        showBackButton
        backTo="/"
      />

      <div className="container mx-auto px-4 py-8">
        <Section title="Santé et complétude">
          <StatusWidget />
        </Section>

        <Section title="Extractions en direct">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Total extr." value={stats?.total_extractions ?? '—'} hint="sur la période récente" />
            <StatCard title="En cours" value={stats?.running_extractions ?? '—'} />
            <StatCard title="Taux de succès" value={`${(stats as any)?.success_rate ?? 0}%`} />
          </div>

          <div className="mt-6 rounded-xl border border-border bg-card/80 backdrop-blur-sm">
            <div className="p-4 border-b border-border text-sm text-muted-foreground">Derniers événements</div>
            <ul className="divide-y divide-border">
              {(recentExtractions ?? []).slice(0, 8).map((e) => (
                <li key={e.id} className="p-4 text-sm flex items-center justify-between">
                  <span className="font-medium text-foreground">{e.status}</span>
                  <span className="text-muted-foreground">{new Date((e as any).created_at ?? Date.now()).toLocaleTimeString()}</span>
                </li>
              ))}
              {(!recentExtractions || recentExtractions.length === 0) && (
                <li className="p-4 text-sm text-muted-foreground">Aucune extraction récente.</li>
              )}
            </ul>
          </div>
        </Section>

        <footer className="text-xs text-muted-foreground">Auto‑refresh 15s — tick {tick}</footer>
      </div>
    </ConsistentBackground>
  );
};

export default Monitoring;
