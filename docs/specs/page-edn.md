# 📚 PAGE EDN - Spécifications techniques

## 1. But & User Stories

**En tant qu'utilisateur, je peux :**
- Explorer les items EDN par spécialité ou par rang (A/B)
- Étudier un item avec contenu interactif (tableaux, quiz, musique)
- Marquer des items comme favoris pour révision
- Suivre ma progression d'apprentissage par item
- Rechercher des items par mots-clés ou numéro
- Accéder au mode immersif (scène 3D, audio ambiance)

**En tant qu'étudiant en médecine, je peux :**
- Réviser selon mon programme (externat Rang A, internat Rang B)
- Évaluer mes connaissances avec les quiz intégrés
- Mémoriser avec les paroles musicales générées
- Comprendre avec les interactions immersives

## 2. Données & Accès

### Sources de données
```typescript
// Tables Supabase
- edn_items_immersive (id, item_code, title, tableau_rang_a, tableau_rang_b, quiz_questions, scene_immersive)
- user_edn_progress (user_id, item_id, rang, completion_status, last_score, study_time)
- user_favorites (user_id, item_id, item_type, created_at)
- edn_suno_tracks (item_id, audio_url, lyrics, genre, status)

// RPC Functions  
- get_edn_items_filtered(specialty?, rang?, search_query?) → items list
- get_edn_item_details(item_id) → full item with progress
- update_edn_progress(item_id, rang, completion_data)
- toggle_edn_favorite(item_id) → boolean
```

### Paramètres URL & Filtrage
```typescript
// Routes avec état dans URL
/edn → Liste tous items (filtrée/paginée)
/edn?specialty=cardiologie&rang=A&search=infarctus
/edn/item/:itemCode → Détail item (ex: /edn/item/IC-234)
/edn/item/:itemCode/rang/:rang → Vue rang spécifique
/edn/item/:itemCode/quiz → Mode quiz
/edn/item/:itemCode/immersive → Mode immersif

// Query params persistés dans URL
const [filters, setFilters] = useSearchParams({
  specialty: '',
  rang: '',
  search: '',
  favorites: false,
  page: 1
})
```

### Cache Strategy
```typescript
// Liste items : cache moyen, update si changement filtres
staleTime: 5 * 60 * 1000 // 5 min
// Item details : cache long, contenu stable
staleTime: 30 * 60 * 1000 // 30 min  
// Progress : cache court, update fréquent
staleTime: 60 * 1000 // 1 min
// Audio tracks : cache très long
staleTime: 24 * 60 * 60 * 1000 // 24h
```

## 3. États UI obligatoires

### Loading States
- Liste items : skeleton cards en grid
- Item detail : skeleton pour tableaux rang A/B
- Quiz : skeleton questions
- Audio : loading spinner + waveform placeholder

### Empty States  
- Aucun item trouvé : "Aucun résultat" + reset filters
- Pas de favoris : "Commencez à marquer vos items préférés"
- Recherche vide : suggestions d'items populaires
- Audio non disponible : "Génération en cours..." + retry

### Error States
- Item non trouvé (404) : redirect vers liste + toast
- Erreur de génération audio : bouton "Régénérer"
- Quiz failed to load : fallback vers tableau statique
- Réseau : mode offline avec cache disponible

### États spécifiques EDN
- **Completion status** : not_started, studying, mastered, needs_review
- **Audio generation** : queued, generating, ready, failed
- **Quiz states** : not_attempted, in_progress, completed, retake_available

## 4. Actions & Effets

### Actions primaires
```typescript
type EdnAction = 
  | { type: "study_item", itemId: string, rang: 'A' | 'B' }
  | { type: "start_quiz", itemId: string }
  | { type: "submit_quiz", itemId: string, answers: QuizAnswer[] }
  | { type: "toggle_favorite", itemId: string }
  | { type: "play_audio", trackId: string }
  | { type: "enter_immersive", itemId: string }
  | { type: "mark_completed", itemId: string, rang: 'A' | 'B' }

// Mutations optimistes
const toggleFavorite = useMutation({
  mutationFn: (itemId: string) => 
    supabase.rpc('toggle_edn_favorite', { p_item_id: itemId }),
  onMutate: async (itemId) => {
    // Optimistic toggle
    queryClient.setQueryData(['edn_favorites', userId], (old: string[]) => 
      old.includes(itemId) 
        ? old.filter(id => id !== itemId)
        : [...old, itemId]
    )
  },
  onError: (err, itemId, context) => {
    // Rollback on error
    queryClient.setQueryData(['edn_favorites', userId], context.previousFavorites)
  }
})
```

### Progress tracking
```typescript
const updateProgress = useMutation({
  mutationFn: ({ itemId, rang, completionData }) =>
    supabase.rpc('update_edn_progress', {
      p_item_id: itemId,
      p_rang: rang, 
      p_completion_data: completionData
    }),
  onSuccess: () => {
    // Invalider cache progress
    queryClient.invalidateQueries(['edn_progress', userId])
  }
})

// Auto-track study time
const useStudyTimer = (itemId: string, rang: string) => {
  const startTime = useRef(Date.now())
  
  useEffect(() => {
    return () => {
      const studyTime = Math.floor((Date.now() - startTime.current) / 1000)
      if (studyTime > 30) { // Minimum 30s pour compter
        updateProgress.mutate({
          itemId,
          rang,
          completionData: { study_time_seconds: studyTime }
        })
      }
    }
  }, [])
}
```

### Audio management
```typescript
const useAudioPlayer = () => {
  const [currentTrack, setCurrentTrack] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  
  const playTrack = async (trackId: string, trackUrl: string) => {
    if (currentTrack && currentTrack !== trackId) {
      // Stop current track
      audioRef.current?.pause()
    }
    
    setCurrentTrack(trackId)
    
    if (!audioRef.current) {
      audioRef.current = new Audio(trackUrl)
    } else {
      audioRef.current.src = trackUrl
    }
    
    try {
      await audioRef.current.play()
      setIsPlaying(true)
      
      // Track analytics
      track('edn_audio_played', { 
        item_id: trackId, 
        track_url: trackUrl 
      })
    } catch (error) {
      toast.error("Erreur lecture audio")
    }
  }
  
  return { currentTrack, isPlaying, playTrack }
}
```

## 5. Observabilité

### Analytics events
```typescript
// Learning events
track('edn_item_viewed', {
  item_code: itemCode,
  rang: rang,
  specialty: item.specialty,
  user_level: user.level,
  came_from: referrer // search, favorites, recommendation
})

track('edn_section_studied', {
  item_code: itemCode,
  section_type: 'tableau_rang_a' | 'tableau_rang_b' | 'quiz' | 'immersive',
  study_duration_seconds: studyTime,
  completion_percentage: completion
})

track('edn_quiz_completed', {
  item_code: itemCode,
  score: finalScore,
  total_questions: questionsCount,
  time_taken_seconds: quizTime,
  attempt_number: attemptNumber
})

track('edn_audio_interaction', {
  item_code: itemCode,
  action: 'play' | 'pause' | 'complete',
  track_duration_seconds: trackDuration,
  listen_percentage: listenPercentage
})

// Search & Discovery
track('edn_search_performed', {
  query: searchQuery,
  filters: activeFilters,
  results_count: resultsCount,
  result_clicked?: itemCode
})

track('edn_filter_applied', {
  filter_type: 'specialty' | 'rang' | 'favorites',
  filter_value: filterValue,
  results_count: resultsCount
})
```

### Performance tracking
```typescript
// Load times par type de contenu
track('edn_performance', {
  content_type: 'item_list' | 'item_detail' | 'quiz' | 'audio',
  load_time_ms: loadTime,
  cache_hit: boolean,
  bundle_size_kb?: bundleSize
})
```

## 6. Tests

### Tests unitaires
```typescript
describe('EdnItemCard', () => {
  it('displays item info correctly')
  it('shows favorite status')
  it('handles click to item detail')
  it('shows progress indicator')
})

describe('EdnQuiz', () => {
  it('renders questions in order')
  it('validates answers correctly') 
  it('calculates score properly')
  it('handles quiz submission')
})

describe('EdnAudioPlayer', () => {
  it('plays audio track')
  it('shows loading state while generating')
  it('handles playback errors')
})
```

### Tests d'intégration
```typescript
describe('EDN Learning Flow', () => {
  it('completes item study workflow', async () => {
    // Browse → Select item → Study rang A → Take quiz → Mark complete
  })
  
  it('tracks progress across sessions')
  it('syncs favorites across devices')
  it('handles offline mode gracefully')
})
```

### Tests E2E
```typescript
test('student studies EDN item completely', async ({ page }) => {
  await page.goto('/edn')
  
  // Search & filter
  await page.fill('[data-testid="search-input"]', 'cardiologie')
  await page.selectOption('[data-testid="rang-filter"]', 'A')
  
  // Select item
  await page.click('[data-testid="item-IC-234"]')
  
  // Study rang A
  await expect(page.locator('[data-testid="tableau-rang-a"]')).toBeVisible()
  
  // Take quiz
  await page.click('[data-testid="start-quiz"]')
  await page.check('[data-testid="quiz-answer-0-2"]') // Question 1, option 3
  await page.click('[data-testid="submit-quiz"]')
  
  // Check score
  await expect(page.locator('[data-testid="quiz-score"]')).toContainText(/\d+/)
  
  // Add to favorites
  await page.click('[data-testid="favorite-toggle"]')
  await expect(page.locator('[data-testid="favorite-icon"]')).toHaveClass(/filled/)
})
```

## 7. Contrats API

### RPC get_edn_items_filtered
```sql
create or replace function get_edn_items_filtered(
  p_specialty text default null,
  p_rang text default null,
  p_search_query text default null,
  p_user_favorites boolean default false,
  p_limit integer default 20,
  p_offset integer default 0
)
returns jsonb as $$
declare
  items_data jsonb;
begin
  with filtered_items as (
    select 
      ei.*,
      coalesce(up.completion_status, 'not_started') as user_completion_status,
      coalesce(up.best_score, 0) as user_best_score,
      case when uf.item_id is not null then true else false end as is_favorite
    from edn_items_immersive ei
    left join user_edn_progress up on up.item_id = ei.id and up.user_id = auth.uid()
    left join user_favorites uf on uf.item_id = ei.id and uf.user_id = auth.uid()
    where
      (p_specialty is null or ei.specialite ilike '%' || p_specialty || '%') and
      (p_rang is null or 
        (p_rang = 'A' and ei.tableau_rang_a is not null) or
        (p_rang = 'B' and ei.tableau_rang_b is not null)) and
      (p_search_query is null or 
        ei.title ilike '%' || p_search_query || '%' or
        ei.item_code ilike '%' || p_search_query || '%') and
      (not p_user_favorites or uf.item_id is not null)
    order by 
      case when p_search_query is not null then
        similarity(ei.title, p_search_query) 
      else 0 end desc,
      ei.item_code
    limit p_limit offset p_offset
  )
  select jsonb_build_object(
    'items', jsonb_agg(
      jsonb_build_object(
        'id', fi.id,
        'item_code', fi.item_code,
        'title', fi.title,
        'subtitle', fi.subtitle,
        'specialite', fi.specialite,
        'completion_status', fi.user_completion_status,
        'best_score', fi.user_best_score,
        'is_favorite', fi.is_favorite,
        'has_audio', case when est.audio_url is not null then true else false end,
        'audio_status', coalesce(est.status, 'not_generated')
      )
    ),
    'total_count', (select count(*) from filtered_items),
    'has_more', (p_offset + p_limit) < (select count(*) from filtered_items)
  ) into items_data
  from filtered_items fi
  left join edn_suno_tracks est on est.lyrics_version_id = 
    (select id from edn_lyrics_versions where item_code = fi.item_code limit 1);
  
  return coalesce(items_data, '{"items": [], "total_count": 0, "has_more": false}'::jsonb);
end;
$$ language plpgsql security definer;
```

### RPC get_edn_item_details
```sql
create or replace function get_edn_item_details(p_item_code text)
returns jsonb as $$
declare
  item_data jsonb;
begin
  select jsonb_build_object(
    'item', jsonb_build_object(
      'id', ei.id,
      'item_code', ei.item_code,
      'title', ei.title,
      'subtitle', ei.subtitle,
      'pitch_intro', ei.pitch_intro,
      'tableau_rang_a', ei.tableau_rang_a,
      'tableau_rang_b', ei.tableau_rang_b,
      'quiz_questions', ei.quiz_questions,
      'scene_immersive', ei.scene_immersive,
      'paroles_musicales', ei.paroles_musicales,
      'audio_ambiance', ei.audio_ambiance,
      'visual_ambiance', ei.visual_ambiance
    ),
    'user_progress', coalesce(
      jsonb_build_object(
        'completion_status_a', up_a.completion_status,
        'completion_status_b', up_b.completion_status,
        'best_score_a', up_a.last_score,
        'best_score_b', up_b.last_score,
        'total_study_time', coalesce(up_a.study_time_seconds, 0) + coalesce(up_b.study_time_seconds, 0),
        'last_studied', greatest(up_a.updated_at, up_b.updated_at)
      ),
      '{"completion_status_a": "not_started", "completion_status_b": "not_started"}'::jsonb
    ),
    'is_favorite', case when uf.item_id is not null then true else false end,
    'audio_tracks', coalesce(
      (select jsonb_agg(jsonb_build_object(
         'id', est.id,
         'audio_url', est.audio_url,
         'status', est.status,
         'genre', est.genre,
         'duration', est.duration
       ))
       from edn_suno_tracks est 
       join edn_lyrics_versions elv on elv.id = est.lyrics_version_id
       where elv.item_code = ei.item_code),
      '[]'::jsonb
    )
  ) into item_data
  from edn_items_immersive ei
  left join user_edn_progress up_a on up_a.item_id = ei.id and up_a.user_id = auth.uid() and up_a.rang = 'A'
  left join user_edn_progress up_b on up_b.item_id = ei.id and up_b.user_id = auth.uid() and up_b.rang = 'B'
  left join user_favorites uf on uf.item_id = ei.id and uf.user_id = auth.uid()
  where ei.item_code = p_item_code;
  
  if item_data is null then
    raise exception 'ITEM_NOT_FOUND';
  end if;
  
  return item_data;
end;
$$ language plpgsql security definer;
```

## 8. Composants clés

### EdnItemCard
```typescript
interface EdnItemCardProps {
  item: EdnItem
  onStudy: (itemId: string, rang: 'A' | 'B') => void
  onFavorite: (itemId: string) => void
}

export const EdnItemCard = ({ item, onStudy, onFavorite }) => {
  const isRangAAvailable = !!item.tableau_rang_a
  const isRangBAvailable = !!item.tableau_rang_b
  
  return (
    <Card className="edn-item-card group hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <Badge variant="outline">{item.item_code}</Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFavorite(item.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart className={cn("h-4 w-4", item.is_favorite && "fill-red-500 text-red-500")} />
          </Button>
        </div>
        <CardTitle className="text-lg">{item.title}</CardTitle>
        {item.subtitle && <CardDescription>{item.subtitle}</CardDescription>}
      </CardHeader>
      
      <CardContent>
        <div className="flex gap-2 mb-4">
          {isRangAAvailable && (
            <Button 
              variant={item.completion_status_a === 'mastered' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onStudy(item.id, 'A')}
            >
              Rang A
              {item.completion_status_a === 'mastered' && <CheckCircle className="ml-1 h-3 w-3" />}
            </Button>
          )}
          {isRangBAvailable && (
            <Button
              variant={item.completion_status_b === 'mastered' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onStudy(item.id, 'B')}
            >
              Rang B
              {item.completion_status_b === 'mastered' && <CheckCircle className="ml-1 h-3 w-3" />}
            </Button>
          )}
        </div>
        
        {item.best_score > 0 && (
          <div className="text-sm text-muted-foreground">
            Meilleur score: {item.best_score}/20
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

### EdnQuizComponent
```typescript
interface EdnQuizProps {
  questions: QuizQuestion[]
  onSubmit: (answers: QuizAnswer[]) => void
  onComplete: (score: number) => void
}

export const EdnQuizComponent = ({ questions, onSubmit, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const [showResults, setShowResults] = useState(false)
  
  const handleAnswer = (questionId: string, selectedOption: number) => {
    setAnswers(prev => [
      ...prev.filter(a => a.questionId !== questionId),
      { questionId, selectedOption, timestamp: Date.now() }
    ])
  }
  
  const handleSubmit = async () => {
    const score = calculateScore(questions, answers)
    await onSubmit(answers)
    onComplete(score)
    setShowResults(true)
    
    track('edn_quiz_completed', {
      total_questions: questions.length,
      score: score,
      completion_time_ms: Date.now() - quizStartTime
    })
  }
  
  if (showResults) {
    return <EdnQuizResults questions={questions} answers={answers} />
  }
  
  const question = questions[currentQuestion]
  
  return (
    <div className="edn-quiz">
      <Progress value={(currentQuestion + 1) / questions.length * 100} />
      
      <div className="question-container">
        <h3 className="text-xl font-semibold mb-4">{question.question}</h3>
        
        <div className="options-grid">
          {question.options.map((option, index) => (
            <Button
              key={index}
              variant={answers.find(a => a.questionId === question.id)?.selectedOption === index ? 'default' : 'outline'}
              className="text-left p-4 h-auto whitespace-normal"
              onClick={() => handleAnswer(question.id, index)}
            >
              <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
              {option}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between mt-6">
        <Button 
          variant="outline"
          disabled={currentQuestion === 0}
          onClick={() => setCurrentQuestion(prev => prev - 1)}
        >
          Précédent
        </Button>
        
        {currentQuestion < questions.length - 1 ? (
          <Button 
            onClick={() => setCurrentQuestion(prev => prev + 1)}
            disabled={!answers.find(a => a.questionId === question.id)}
          >
            Suivant
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit}
            disabled={answers.length !== questions.length}
          >
            Terminer le quiz
          </Button>
        )}
      </div>
    </div>
  )
}
```

## 9. Définition de Fini

✅ **EDN page est "Done" quand :**
- [ ] Liste items avec filtres (spécialité, rang, recherche, favoris)
- [ ] Pagination et recherche temps réel fonctionnelles  
- [ ] Item detail avec tableaux rang A/B interactifs
- [ ] Quiz complet avec scoring et explications
- [ ] Système de favoris avec sync instantanée
- [ ] Lecture audio (paroles musicales) avec contrôles
- [ ] Progress tracking automatique (temps étude, scores)
- [ ] Mode immersif (scène 3D + audio ambiance)
- [ ] États loading/empty/error pour tous les contenus
- [ ] Tests E2E : browse → study → quiz → complete
- [ ] Performance : liste < 2s, item detail < 1s, quiz < 500ms
- [ ] Accessibilité : navigation complète au clavier
- [ ] Analytics : tracking complet apprentissage + interactions
- [ ] Cache intelligent : sync offline/online
- [ ] RLS : utilisateur voit seulement sa progression