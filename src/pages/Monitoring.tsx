import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import StatusWidget from '@/components/StatusWidget';
import { useSystemStatus } from '@/hooks/useSystemStatus';
import { useExtractionMonitoring } from '@/hooks/useExtractionMonitoring';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const StatCard = ({ title, value, hint }: { title: string; value: string | number; hint?: string }) => (
  <div className="rounded-xl border p-4 bg-white shadow-sm">
    <div className="text-sm text-gray-500 mb-1">{title}</div>
    <div className="text-2xl font-semibold">{value}</div>
    {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
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
    <main className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Monitoring plateforme | MED MNG</title>
        <meta name="description" content="Monitoring temps réel: statut, complétude et extractions. MED MNG." />
        <link rel="canonical" href="/monitoring" />
      </Helmet>

      <header className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
            aria-label="Retourner à la page d'accueil"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </div>
        <h1 className="text-3xl font-bold" id="main-content">Monitoring plateforme</h1>
        <div className="mt-2">
          <Badge variant={isOperational ? 'default' : 'secondary'}>
            {isOperational ? 'Opérationnel' : 'Vérification…'}
          </Badge>
        </div>
      </header>

      <Section title="Santé et complétude">
        <StatusWidget />
      </Section>

      <Section title="Extractions en direct">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Total extr." value={stats?.total_extractions ?? '—'} hint="sur la période récente" />
          <StatCard title="En cours" value={stats?.running_extractions ?? '—'} />
          <StatCard title="Taux de succès" value={`${(stats as any)?.success_rate ?? 0}%`} />
        </div>

        <div className="mt-6 rounded-xl border bg-white">
          <div className="p-4 border-b text-sm text-gray-500">Derniers événements</div>
          <ul className="divide-y">
            {(recentExtractions ?? []).slice(0, 8).map((e) => (
              <li key={e.id} className="p-4 text-sm flex items-center justify-between">
                <span className="font-medium">{e.status}</span>
                <span className="text-gray-500">{new Date((e as any).created_at ?? Date.now()).toLocaleTimeString()}</span>
              </li>
            ))}
            {(!recentExtractions || recentExtractions.length === 0) && (
              <li className="p-4 text-sm text-gray-500">Aucune extraction récente.</li>
            )}
          </ul>
        </div>
      </Section>

      <footer className="text-xs text-gray-500">Auto‑refresh 15s — tick {tick}</footer>
    </main>
  );
};

export default Monitoring;
