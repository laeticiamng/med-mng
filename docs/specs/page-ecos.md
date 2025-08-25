# 🩺 PAGE ECOS - Spécifications techniques

## 1. But & User Stories

**En tant qu'utilisateur, je peux :**
- Lancer un nouveau cas clinique ECOS
- Reprendre un cas interrompu exactement où je l'ai laissé
- Naviguer entre les stations d'un cas multi-stations
- Répondre aux questions et voir mon feedback immédiat
- Consulter mon score final et les corrections détaillées
- Recommencer un cas pour améliorer mon score

**En tant qu'étudiant, je peux :**
- M'entraîner sur des cas adaptés à mon niveau (externat/internat)
- Suivre ma progression par spécialité médicale
- Accéder aux explications pédagogiques détaillées

## 2. Données & Accès

### Sources de données
```typescript
// Tables Supabase
- ecos_cases (id, title, specialty, difficulty, stations, metadata)
- ecos_stations (case_id, station_number, type, content, scoring)
- user_ecos_sessions (user_id, case_id, status, current_station, responses, score)
- ecos_responses (session_id, station_id, response_data, score, feedback)

// RPC Functions
- start_ecos_case(case_id) → session_id
- save_ecos_response(session_id, station_id, response_data)
- complete_ecos_station(session_id, station_id) → next_station | final_score
- get_ecos_case_details(case_id) → full case data
```

### Paramètres URL
```typescript
// Routes
/ecos → Liste des cas disponibles
/ecos/:caseId → Vue détail du cas (intro)
/ecos/:caseId/session/:sessionId → Session active
/ecos/:caseId/session/:sessionId/station/:stationNumber → Station spécifique
/ecos/:caseId/results/:sessionId → Résultats finaux
```

### Cache Strategy
```typescript
// Cas details : cache long (60min), pas souvent modifié
staleTime: 60 * 60 * 1000
// Session active : cache court (30s), update fréquent  
staleTime: 30 * 1000
// Responses : optimistic updates
```

## 3. États UI obligatoires

### Loading States
- Chargement initial du cas : skeleton avec structure station
- Sauvegarde response : spinner + disabled state
- Transition entre stations : loading overlay

### Empty States
- Aucun cas disponible : CTA "Nouveaux cas bientôt"
- Cas terminés : CTA "Recommencer" + "Autres cas"

### Error States
- Cas non trouvé (404) : redirect vers liste + toast
- Session expirée : modal "Reprendre" ou "Recommencer"
- Erreur de sauvegarde : retry automatique + toast warning

### États spécifiques ECOS
- **Timer states** : normal, warning (< 5min), critical (< 1min)
- **Station states** : not_started, in_progress, completed, skipped
- **Validation states** : invalid_response, partial_response, complete_response

## 4. Actions & Effets

### Actions primaires
```typescript
type EcosAction = 
  | { type: "start_case", caseId: string }
  | { type: "resume_session", sessionId: string }
  | { type: "save_response", stationId: string, data: any }
  | { type: "next_station" }
  | { type: "previous_station" }
  | { type: "submit_case" }
  | { type: "restart_case", caseId: string }

// Mutations avec optimistic updates
const saveResponse = useMutation({
  mutationFn: ({ sessionId, stationId, data }) =>
    supabase.rpc('save_ecos_response', { 
      p_session_id: sessionId, 
      p_station_id: stationId, 
      p_response_data: data 
    }),
  onMutate: async (variables) => {
    // Optimistic update de la response locale
    queryClient.setQueryData(['ecos_session', sessionId], (old) => ({
      ...old,
      responses: {
        ...old.responses,
        [variables.stationId]: variables.data
      }
    }))
  }
})
```

### Auto-save système
```typescript
// Auto-save toutes les 30 secondes
useEffect(() => {
  const interval = setInterval(() => {
    if (hasUnsavedChanges) {
      saveResponse.mutate(currentResponse)
    }
  }, 30000)
  return () => clearInterval(interval)
}, [hasUnsavedChanges])

// Auto-save avant fermeture page
useBeforeUnload(hasUnsavedChanges)
```

### Timer management
```typescript
const useEcosTimer = (initialTime: number, sessionId: string) => {
  const [timeLeft, setTimeLeft] = useState(initialTime)
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Auto-submit quand timer expire
          submitCase.mutate(sessionId)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])
  
  return { timeLeft, isWarning: timeLeft < 300, isCritical: timeLeft < 60 }
}
```

## 5. Observabilité

### Analytics events
```typescript
// Lifecycle events
track('ecos_case_started', {
  case_id: caseId,
  specialty: case.specialty,
  difficulty: case.difficulty,
  user_level: user.level
})

track('ecos_station_completed', {
  case_id: caseId,
  station_number: stationNumber,
  station_type: station.type,
  time_spent_seconds: timeSpent,
  response_completeness: completeness
})

track('ecos_case_completed', {
  case_id: caseId,
  final_score: score,
  total_time_seconds: totalTime,
  stations_completed: completedStations,
  completion_rate: completionRate
})

// Interaction events
track('ecos_response_saved', {
  station_id: stationId,
  response_type: responseType,
  auto_save: boolean
})

// Performance events
track('ecos_load_time', {
  case_id: caseId,
  load_time_ms: loadTime,
  cache_hit: boolean
})
```

### Error tracking
- Timeouts de session avec contexte (station, temps restant)
- Erreurs de validation de réponse
- Problèmes de navigation entre stations

## 6. Tests

### Tests unitaires
```typescript
describe('EcosStation', () => {
  it('validates response format correctly')
  it('shows timer warning states')
  it('auto-saves responses periodically')
  it('handles station navigation')
})

describe('EcosSession', () => {
  it('restores session state correctly')
  it('submits case when timer expires')
  it('prevents navigation with unsaved changes')
})
```

### Tests d'intégration
```typescript
describe('ECOS Flow', () => {
  it('completes full case workflow', async () => {
    // Start case → Complete stations → Submit → View results
  })
  
  it('resumes interrupted session correctly')
  it('handles auto-save and recovery')
})
```

### Tests E2E
```typescript
test('student completes ECOS case end-to-end', async ({ page }) => {
  await page.goto('/ecos/case-123')
  await page.click('[data-testid="start-case"]')
  
  // Station 1
  await page.fill('[data-testid="anamnesis-input"]', 'Patient présente...')
  await page.click('[data-testid="next-station"]')
  
  // Station 2  
  await page.check('[data-testid="examination-heart"]')
  await page.click('[data-testid="next-station"]')
  
  // Submit
  await page.click('[data-testid="submit-case"]')
  await expect(page.locator('[data-testid="final-score"]')).toBeVisible()
})
```

## 7. Contrats API

### RPC start_ecos_case
```sql
create or replace function start_ecos_case(p_case_id uuid)
returns jsonb as $$
declare
  session_id uuid;
  case_data jsonb;
begin
  -- Create new session
  insert into user_ecos_sessions (user_id, case_id, status, current_station)
  values (auth.uid(), p_case_id, 'in_progress', 1)
  returning id into session_id;
  
  -- Get case details
  select jsonb_build_object(
    'session_id', session_id,
    'case', jsonb_build_object(
      'id', c.id,
      'title', c.title,
      'specialty', c.specialty,
      'time_limit_minutes', c.time_limit_minutes,
      'stations_count', (select count(*) from ecos_stations where case_id = c.id)
    ),
    'current_station', 1
  ) into case_data
  from ecos_cases c
  where c.id = p_case_id;
  
  -- Log event
  insert into user_activity_log (user_id, activity_type, metadata)
  values (auth.uid(), 'ecos_started', jsonb_build_object('case_id', p_case_id, 'session_id', session_id));
  
  return case_data;
end;
$$ language plpgsql security definer;
```

### RPC save_ecos_response
```sql
create or replace function save_ecos_response(
  p_session_id uuid,
  p_station_id uuid, 
  p_response_data jsonb
)
returns jsonb as $$
declare
  response_score numeric;
begin
  -- Validate session ownership
  if not exists (
    select 1 from user_ecos_sessions 
    where id = p_session_id and user_id = auth.uid()
  ) then
    raise exception 'SESSION_NOT_FOUND_OR_FORBIDDEN';
  end if;
  
  -- Calculate score (simplified)
  response_score := (p_response_data->>'completeness')::numeric * 0.8 + 
                   (p_response_data->>'accuracy')::numeric * 1.2;
  
  -- Upsert response
  insert into ecos_responses (session_id, station_id, response_data, score)
  values (p_session_id, p_station_id, p_response_data, response_score)
  on conflict (session_id, station_id) 
  do update set 
    response_data = excluded.response_data,
    score = excluded.score,
    updated_at = now();
    
  -- Update session
  update user_ecos_sessions 
  set updated_at = now()
  where id = p_session_id;
  
  return jsonb_build_object(
    'success', true,
    'score', response_score,
    'saved_at', now()
  );
end;
$$ language plpgsql security definer;
```

## 8. Composants clés

### EcosTimer
```typescript
interface EcosTimerProps {
  initialTime: number
  onExpire: () => void
  showWarnings?: boolean
}

export const EcosTimer = ({ initialTime, onExpire, showWarnings = true }) => {
  const { timeLeft, isWarning, isCritical } = useEcosTimer(initialTime, onExpire)
  
  return (
    <div className={cn(
      "timer-display",
      isWarning && "text-warning",
      isCritical && "text-destructive animate-pulse"
    )}>
      {formatTime(timeLeft)}
      {isCritical && <AlertTriangle className="ml-2 h-4 w-4" />}
    </div>
  )
}
```

### EcosStationProgress
```typescript
interface Station {
  id: string
  number: number
  title: string
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped'
}

export const EcosStationProgress = ({ stations, currentStation }) => (
  <nav className="station-progress" aria-label="Progression des stations">
    {stations.map((station) => (
      <div
        key={station.id} 
        className={cn(
          "station-indicator",
          station.status === 'completed' && "bg-success",
          station.status === 'in_progress' && "bg-primary",
          station.number === currentStation && "ring-2 ring-primary"
        )}
        aria-label={`Station ${station.number}: ${station.title} - ${station.status}`}
      >
        {station.number}
      </div>
    ))}
  </nav>
)
```

## 9. Définition de Fini

✅ **ECOS page est "Done" quand :**
- [ ] Utilisateur peut démarrer, compléter et soumettre un cas complet
- [ ] Auto-save fonctionne (30s + avant fermeture)
- [ ] Timer avec warnings et auto-submit
- [ ] Navigation entre stations avec validation
- [ ] Reprise de session interrompue exacte
- [ ] Résultats avec score détaillé par station
- [ ] États loading/empty/error pour tous les cas
- [ ] Tests E2E complet workflow passent
- [ ] Performance : transitions < 200ms, auto-save < 1s
- [ ] Accessibilité : navigation clavier, screen reader
- [ ] Analytics : tous les events lifecycle trackés
- [ ] RLS : utilisateur accède seulement à ses sessions