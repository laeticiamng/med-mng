import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import {
  Brain, Bell, BellRing, Calendar, TrendingDown, TrendingUp,
  Clock, CheckCircle2, AlertTriangle, BarChart3, Loader2
} from 'lucide-react';

interface TopicMemory {
  id: string;
  topic: string;
  specialty: string;
  learnedAt: Date;
  lastReviewedAt: Date;
  reviewCount: number;
  retentionNow: number;
  nextReviewAt: Date;
  status: 'strong' | 'fading' | 'critical';
}

// Map item_code prefixes to specialties
function getSpecialtyFromItemCode(itemCode: string): string {
  const prefix = itemCode.split('-')[0]?.toUpperCase() || '';
  const map: Record<string, string> = {
    'CARD': 'Cardiologie', 'NEURO': 'Neurologie', 'PHARMA': 'Pharmacologie',
    'CHIR': 'Chirurgie', 'PED': 'Pédiatrie', 'URG': 'Urgences',
    'IMMUNO': 'Immunologie', 'PNEUMO': 'Pneumologie', 'GASTRO': 'Gastro-entérologie',
    'NEPHRO': 'Néphrologie', 'HEMATO': 'Hématologie', 'ENDOC': 'Endocrinologie',
    'DERMATO': 'Dermatologie', 'ORL': 'ORL', 'OPHTA': 'Ophtalmologie',
  };
  for (const [key, value] of Object.entries(map)) {
    if (prefix.startsWith(key)) return value;
  }
  return 'Médecine générale';
}

// Calculate Ebbinghaus retention from SRS data
function calculateRetention(easeFactor: number, intervalDays: number, daysSinceReview: number): number {
  const strength = intervalDays * (easeFactor / 2.5);
  const effectiveStrength = Math.max(1, strength);
  const retention = 100 * Math.exp(-daysSinceReview / effectiveStrength);
  return Math.max(5, Math.min(99, Math.round(retention)));
}

// SVG Ebbinghaus curve
const ForgettingCurve = ({ retention, daysAgo, reviewCount }: { retention: number; daysAgo: number; reviewCount: number }) => {
  const width = 280;
  const height = 80;
  const padding = 4;

  const points = useMemo(() => {
    const pts: string[] = [];
    const strength = 3 + reviewCount * 2.5;
    for (let d = 0; d <= daysAgo + 5; d++) {
      const x = padding + (d / (daysAgo + 5)) * (width - padding * 2);
      const y = padding + (1 - Math.exp(-d / strength)) * (height - padding * 2);
      pts.push(`${x},${y}`);
    }
    return pts.join(' ');
  }, [daysAgo, reviewCount]);

  const currentX = padding + (daysAgo / (daysAgo + 5)) * (width - padding * 2);
  const currentY = padding + (1 - retention / 100) * (height - padding * 2);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-16" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${retention}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon
        points={`${padding},${padding} ${points} ${width - padding},${height - padding} ${padding},${height - padding}`}
        fill={`url(#grad-${retention})`}
      />
      <polyline points={points} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" />
      <circle
        cx={currentX} cy={currentY} r="4"
        fill={retention >= 70 ? 'hsl(142, 76%, 36%)' : retention >= 40 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))'}
        stroke="white" strokeWidth="2"
      />
      <text x={padding} y={height - 2} fontSize="8" fill="hsl(var(--muted-foreground))" opacity="0.6">J0</text>
      <text x={width - 20} y={height - 2} fontSize="8" fill="hsl(var(--muted-foreground))" opacity="0.6">J{daysAgo + 5}</text>
    </svg>
  );
};

export const MemoryAnalytics = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<TopicMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: progressData, error } = await supabase
          .from('user_item_progress')
          .select('id, item_code, ease_factor, interval_days, repetitions, total_reviews, last_review_date, next_review_date, created_at')
          .eq('user_id', user.id)
          .order('next_review_date', { ascending: true });

        if (error) throw error;

        const now = new Date();
        const mapped: TopicMemory[] = (progressData || []).map((item) => {
          const learnedAt = new Date(item.created_at);
          const lastReviewedAt = item.last_review_date ? new Date(item.last_review_date) : learnedAt;
          const nextReviewAt = new Date(item.next_review_date);
          const daysSinceReview = Math.max(0, Math.round((now.getTime() - lastReviewedAt.getTime()) / 86400000));
          const retention = calculateRetention(item.ease_factor, item.interval_days, daysSinceReview);
          const status: TopicMemory['status'] =
            retention >= 70 ? 'strong' : retention >= 40 ? 'fading' : 'critical';

          return {
            id: item.id,
            topic: item.item_code.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            specialty: getSpecialtyFromItemCode(item.item_code),
            learnedAt,
            lastReviewedAt,
            reviewCount: item.total_reviews,
            retentionNow: retention,
            nextReviewAt,
            status,
          };
        });

        setTopics(mapped);
      } catch {
        // Silently handle — empty state will show
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const specialties = useMemo(() =>
    ['all', ...new Set(topics.map(t => t.specialty))],
  [topics]);

  const filtered = useMemo(() =>
    topics
      .filter(t => filterSpecialty === 'all' || t.specialty === filterSpecialty)
      .filter(t => filterStatus === 'all' || t.status === filterStatus)
      .sort((a, b) => a.retentionNow - b.retentionNow),
  [topics, filterSpecialty, filterStatus]);

  const avgRetention = topics.length > 0
    ? Math.round(topics.reduce((sum, t) => sum + t.retentionNow, 0) / topics.length)
    : 0;
  const criticalCount = topics.filter(t => t.status === 'critical').length;
  const dueToday = topics.filter(t => t.nextReviewAt <= new Date()).length;

  const getStatusConfig = (status: TopicMemory['status']) => {
    switch (status) {
      case 'strong': return { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Solide' };
      case 'fading': return { icon: TrendingDown, color: 'text-warning', bg: 'bg-warning/10', label: 'S\'efface' };
      case 'critical': return { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Critique' };
    }
  };

  const formatRelativeDate = (date: Date) => {
    const now = new Date();
    const diff = Math.round((date.getTime() - now.getTime()) / 86400000);
    if (diff < 0) return `il y a ${Math.abs(diff)}j`;
    if (diff === 0) return 'Aujourd\'hui';
    if (diff === 1) return 'Demain';
    return `dans ${diff}j`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          Memory Analytics
        </h2>
        <p className="text-muted-foreground">
          Courbe d'oubli d'Ebbinghaus & rappels de révision optimaux
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold">{avgRetention}%</p>
            <p className="text-xs text-muted-foreground">Rétention moyenne</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Brain className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-2xl font-bold">{topics.length}</p>
            <p className="text-xs text-muted-foreground">Items appris</p>
          </CardContent>
        </Card>
        <Card className={criticalCount > 0 ? 'border-destructive/30' : ''}>
          <CardContent className="p-4 text-center">
            <AlertTriangle className={`h-5 w-5 mx-auto mb-1 ${criticalCount > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
            <p className="text-2xl font-bold">{criticalCount}</p>
            <p className="text-xs text-muted-foreground">En zone critique</p>
          </CardContent>
        </Card>
        <Card className={dueToday > 0 ? 'border-warning/30' : ''}>
          <CardContent className="p-4 text-center">
            <Clock className={`h-5 w-5 mx-auto mb-1 ${dueToday > 0 ? 'text-warning' : 'text-muted-foreground'}`} />
            <p className="text-2xl font-bold">{dueToday}</p>
            <p className="text-xs text-muted-foreground">À réviser aujourd'hui</p>
          </CardContent>
        </Card>
      </div>

      {/* Empty state */}
      {topics.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center space-y-4">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground/40" />
            <div>
              <h3 className="font-semibold text-lg">Aucun item révisé pour l'instant</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Commencez à réviser des items pour voir votre courbe de mémorisation ici.
              </p>
            </div>
            <Button onClick={() => navigate(ROUTE_PATHS.srsReview)} className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Commencer une révision
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filters + reminder toggle */}
      {topics.length > 0 && (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex gap-3">
              <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Spécialité" /></SelectTrigger>
                <SelectContent>
                  {specialties.map(s => <SelectItem key={s} value={s}>{s === 'all' ? 'Toutes spécialités' : s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Statut" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="strong">Solide</SelectItem>
                  <SelectItem value="fading">S'efface</SelectItem>
                  <SelectItem value="critical">Critique</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={remindersEnabled} onCheckedChange={setRemindersEnabled} />
              <label className="text-sm flex items-center gap-1.5">
                {remindersEnabled ? <BellRing className="h-4 w-4 text-primary" /> : <Bell className="h-4 w-4 text-muted-foreground" />}
                Rappels de révision
              </label>
            </div>
          </div>

          {/* Topic cards */}
          <div className="space-y-3">
            {filtered.map(topic => {
              const statusConfig = getStatusConfig(topic.status);
              const StatusIcon = statusConfig.icon;
              const daysAgo = Math.round((Date.now() - topic.learnedAt.getTime()) / 86400000);
              const isPastDue = topic.nextReviewAt <= new Date();

              return (
                <Card key={topic.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex items-center gap-3 lg:w-1/4">
                        <div className={`p-2 rounded-lg ${statusConfig.bg}`}>
                          <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{topic.topic}</h3>
                          <Badge variant="outline" className="text-[10px] mt-0.5">{topic.specialty}</Badge>
                        </div>
                      </div>

                      <div className="lg:flex-1">
                        <ForgettingCurve retention={topic.retentionNow} daysAgo={daysAgo} reviewCount={topic.reviewCount} />
                      </div>

                      <div className="flex items-center gap-4 lg:w-1/3">
                        <div className="text-center">
                          <p className={`text-lg font-bold ${
                            topic.retentionNow >= 70 ? 'text-green-500' :
                            topic.retentionNow >= 40 ? 'text-warning' : 'text-destructive'
                          }`}>{topic.retentionNow}%</p>
                          <p className="text-[10px] text-muted-foreground">Rétention</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">{topic.reviewCount}×</p>
                          <p className="text-[10px] text-muted-foreground">Révisions</p>
                        </div>
                        <div className="text-center flex-1">
                          <div className="flex items-center gap-1 justify-center">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <p className={`text-xs font-medium ${isPastDue ? 'text-destructive' : 'text-muted-foreground'}`}>
                              {formatRelativeDate(topic.nextReviewAt)}
                            </p>
                          </div>
                          <p className="text-[10px] text-muted-foreground">Prochaine révision</p>
                        </div>
                        <Button
                          size="sm"
                          variant={isPastDue ? 'default' : 'outline'}
                          className="gap-1"
                          onClick={() => navigate(ROUTE_PATHS.srsReview)}
                        >
                          <TrendingUp className="h-3 w-3" />
                          Réviser
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
