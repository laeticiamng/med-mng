import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Brain, Bell, BellRing, Calendar, TrendingDown, TrendingUp,
  Clock, CheckCircle2, AlertTriangle, BarChart3
} from 'lucide-react';

interface TopicMemory {
  id: string;
  topic: string;
  specialty: string;
  learnedAt: Date;
  lastReviewedAt: Date;
  reviewCount: number;
  retentionNow: number; // 0-100
  nextReviewAt: Date;
  status: 'strong' | 'fading' | 'critical';
}

// Mock data — in production this comes from user_item_progress + review_sessions
function generateMockTopics(): TopicMemory[] {
  const topics = [
    { topic: 'Insuffisance cardiaque', specialty: 'Cardiologie' },
    { topic: 'AVC ischémique', specialty: 'Neurologie' },
    { topic: 'Pharmacocinétique', specialty: 'Pharmacologie' },
    { topic: 'Appendicite aiguë', specialty: 'Chirurgie' },
    { topic: 'Asthme de l\'enfant', specialty: 'Pédiatrie' },
    { topic: 'Choc septique', specialty: 'Urgences' },
    { topic: 'Lupus érythémateux', specialty: 'Immunologie' },
    { topic: 'Pneumopathie', specialty: 'Pneumologie' },
    { topic: 'Infarctus du myocarde', specialty: 'Cardiologie' },
    { topic: 'Épilepsie', specialty: 'Neurologie' },
    { topic: 'Antibiotiques', specialty: 'Pharmacologie' },
    { topic: 'Fractures du col fémoral', specialty: 'Chirurgie' },
  ];

  const now = new Date();
  return topics.map((t, i) => {
    const daysAgo = Math.floor(3 + Math.random() * 25);
    const learnedAt = new Date(now.getTime() - daysAgo * 86400000);
    const reviewCount = Math.floor(Math.random() * 5);
    const lastReviewDaysAgo = Math.floor(Math.random() * daysAgo);
    const lastReviewedAt = new Date(now.getTime() - lastReviewDaysAgo * 86400000);

    // Ebbinghaus: retention ≈ e^(-t/S) where S = strength
    const daysSinceReview = lastReviewDaysAgo;
    const strength = 3 + reviewCount * 2.5;
    const retention = Math.round(100 * Math.exp(-daysSinceReview / strength));
    const clampedRetention = Math.max(5, Math.min(99, retention));

    const nextReviewDays = Math.max(1, Math.round(strength * 0.7));
    const nextReviewAt = new Date(lastReviewedAt.getTime() + nextReviewDays * 86400000);

    const status: TopicMemory['status'] =
      clampedRetention >= 70 ? 'strong' : clampedRetention >= 40 ? 'fading' : 'critical';

    return {
      id: `topic-${i}`,
      ...t,
      learnedAt,
      lastReviewedAt,
      reviewCount,
      retentionNow: clampedRetention,
      nextReviewAt,
      status,
    };
  });
}

// SVG Ebbinghaus curve
const ForgettingCurve = ({ retention, daysAgo, reviewCount }: { retention: number; daysAgo: number; reviewCount: number }) => {
  const width = 280;
  const height = 80;
  const padding = 4;

  // Generate curve points
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

  // Current position
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
      {/* Fill area */}
      <polygon
        points={`${padding},${padding} ${points} ${width - padding},${height - padding} ${padding},${height - padding}`}
        fill={`url(#grad-${retention})`}
      />
      {/* Curve line */}
      <polyline
        points={points}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Current position dot */}
      <circle
        cx={currentX}
        cy={currentY}
        r="4"
        fill={retention >= 70 ? 'hsl(142, 76%, 36%)' : retention >= 40 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))'}
        stroke="white"
        strokeWidth="2"
      />
      {/* Axes labels */}
      <text x={padding} y={height - 2} fontSize="8" fill="hsl(var(--muted-foreground))" opacity="0.6">J0</text>
      <text x={width - 20} y={height - 2} fontSize="8" fill="hsl(var(--muted-foreground))" opacity="0.6">J{daysAgo + 5}</text>
    </svg>
  );
};

export const MemoryAnalytics = () => {
  const [topics] = useState<TopicMemory[]>(() => generateMockTopics());
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  const specialties = useMemo(() =>
    ['all', ...new Set(topics.map(t => t.specialty))],
  [topics]);

  const filtered = useMemo(() =>
    topics
      .filter(t => filterSpecialty === 'all' || t.specialty === filterSpecialty)
      .filter(t => filterStatus === 'all' || t.status === filterStatus)
      .sort((a, b) => a.retentionNow - b.retentionNow),
  [topics, filterSpecialty, filterStatus]);

  const avgRetention = Math.round(topics.reduce((sum, t) => sum + t.retentionNow, 0) / topics.length);
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
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-xs">
          📊 Données de démonstration — Connexion à vos données réelles bientôt
        </Badge>
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
            <p className="text-xs text-muted-foreground">Sujets appris</p>
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

      {/* Filters + reminder toggle */}
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
                  {/* Topic info */}
                  <div className="flex items-center gap-3 lg:w-1/4">
                    <div className={`p-2 rounded-lg ${statusConfig.bg}`}>
                      <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{topic.topic}</h3>
                      <Badge variant="outline" className="text-[10px] mt-0.5">{topic.specialty}</Badge>
                    </div>
                  </div>

                  {/* Forgetting curve */}
                  <div className="lg:flex-1">
                    <ForgettingCurve
                      retention={topic.retentionNow}
                      daysAgo={daysAgo}
                      reviewCount={topic.reviewCount}
                    />
                  </div>

                  {/* Stats */}
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
    </div>
  );
};
