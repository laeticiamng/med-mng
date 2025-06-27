
import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Brain, ArrowLeft, Play, Pause, Volume2, CheckCircle, XCircle, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const EdnItem = () => {
  const { slug } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(240); // 4 minutes
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{[key: number]: string}>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Sample data - in real app, this would be fetched based on slug
  const itemData = {
    id: '096',
    title: 'Neuropathie périphérique',
    category: 'Neurologie',
    pitch: "Quand les nerfs murmurent leurs secrets, chaque sensation devient une énigme à résoudre.",
    ambiance: {
      colors: ['from-indigo-900', 'via-purple-800', 'to-blue-900'],
      music: 'Ambient électronique contemplatif avec des nappes synthétiques évoquant les connexions neuronales'
    },
    lyrics: `Dans les fibres qui dansent, sous la peau qui se tend
Les signaux se perdent, dans un monde troublant
Myéline qui s'efface, axones qui résistent
Polyneuropathie, ton mystère persiste

Diabète qui ronge, alcool qui détruit
Carence en B12, la route se réduit
Sensitive motrice, ou les deux à la fois
Chaque nerf raconte sa propre histoire de soi`,
    tableRangA: [
      ['Définition', 'Atteinte des nerfs périphériques', 'Motrice et/ou sensitive', 'Axonale ou démyélinisante'],
      ['Étiologies', 'Diabète (50%)', 'Alcool chronique', 'Carences vitaminiques'],
      ['Clinique', 'Paresthésies distales', 'Déficit moteur', 'Douleurs neuropathiques'],
      ['Topographie', 'Symétrique bilatérale', 'Distal > proximal', 'MI > MS'],
      ['Examen', 'ROT abolis/diminués', 'Sensibilité vibratoire ↓', 'Force musculaire ↓'],
      ['Paraclinique', 'ENMG (vitesse, amplitude)', 'Biologie étiologique', 'Parfois biopsie nerf'],
      ['Traitement', 'Étiologique si possible', 'Symptomatique douleur', 'Rééducation'],
      ['Surveillance', 'Évolution déficit', 'Compliance traitement', 'Complications']
    ],
    tableRangB: [
      ['Physiopathologie', 'Démyélinisation', 'Axonolyse', 'Processus mixte'],
      ['Diabète', 'HbA1c > 7%', 'Microangiopathie', 'Équilibre glycémique'],
      ['Alcool', 'Carence thiamine', 'Toxicité directe', 'Malabsorption'],
      ['Vitamines', 'B1, B6, B12, E', 'Dosages sanguins', 'Supplémentation'],
      ['ENMG détails', 'VC < 40 m/s démyél.', 'Amplitude ↓ axonal', 'Latences distales ↑'],
      ['Douleurs neuro.', 'Brûlures, décharges', 'Allodynie, hyperalgésie', 'Prégabaline, gabapentine'],
      ['Complications', 'Chutes, troubles marche', 'Ulcères plantaires', 'Déformation pieds'],
      ['Pronostic', 'Variable selon cause', 'Récupération lente', 'Prévention progression']
    ]
  };

  const quizQuestions = [
    {
      type: 'QCM',
      question: 'Quelle est la cause la plus fréquente de neuropathie périphérique ?',
      options: ['Alcool', 'Diabète', 'Carence en B12', 'Chimiothérapie'],
      correct: 1
    },
    {
      type: 'QCM',
      question: 'Dans l\'ENMG, quel paramètre évoque une démyélinisation ?',
      options: ['Diminution d\'amplitude', 'Ralentissement des vitesses', 'Blocs de conduction', 'Toutes les réponses'],
      correct: 3
    },
    {
      type: 'QRU',
      question: 'Citez le principal traitement symptomatique des douleurs neuropathiques',
      correct: 'prégabaline'
    },
    {
      type: 'TCS',
      question: 'Un patient diabétique de 65 ans présente des paresthésies des pieds. Votre hypothèse diagnostique principale est la neuropathie diabétique. L\'ENMG montre un ralentissement des vitesses de conduction. Cette donnée rend votre hypothèse :',
      options: ['Beaucoup plus probable', 'Plus probable', 'Ni plus ni moins probable', 'Moins probable', 'Beaucoup moins probable'],
      correct: 1
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && currentTime < duration) {
        setCurrentTime(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentTime, duration]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleQuizAnswer = (questionIndex: number, answer: string) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const submitQuiz = () => {
    let correctAnswers = 0;
    quizQuestions.forEach((q, index) => {
      const userAnswer = quizAnswers[index];
      if (q.type === 'QCM' || q.type === 'TCS') {
        if (parseInt(userAnswer) === q.correct) correctAnswers++;
      } else if (q.type === 'QRU') {
        if (userAnswer?.toLowerCase().includes(q.correct.toLowerCase())) correctAnswers++;
      }
    });
    setScore(correctAnswers);
    setShowResults(true);
  };

  const getScoreMessage = () => {
    if (score >= 8) return "🎉 Exceptionnel ! Tu viens de réparer le système nerveux périphérique !";
    if (score >= 6) return "👏 Très bien ! Les nerfs périphériques n'ont plus de secrets pour toi !";
    if (score >= 4) return "👍 Bon travail ! Continue à explorer ces connexions neuronales.";
    return "💪 Persévère ! Chaque neurone compte dans ton apprentissage.";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/edn" className="flex items-center gap-3 text-white hover:text-purple-300 transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <Brain className="h-6 w-6" />
                <span className="font-semibold">Retour aux items EDN</span>
              </Link>
              <div className="text-white/60 text-sm">
                Item {itemData.id} • {itemData.category}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Hero section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                {itemData.id}
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{itemData.title}</h1>
            <p className="text-xl text-purple-200 italic max-w-2xl mx-auto">
              "{itemData.pitch}"
            </p>
          </div>

          {/* Music player */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Button
                  onClick={togglePlayPause}
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-full"
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Piste audio immersive</span>
                    <span className="text-white/60 text-sm">{formatTime(currentTime)} / {formatTime(duration)}</span>
                  </div>
                  <Progress value={(currentTime / duration) * 100} className="h-2" />
                </div>
                <Music className="h-5 w-5 text-purple-400" />
              </div>
              
              {/* Lyrics */}
              <div className="bg-black/20 rounded-lg p-4">
                <h3 className="text-purple-300 font-semibold mb-3">Paroles mnémotechniques :</h3>
                <div className="text-white/80 text-sm leading-relaxed whitespace-pre-line">
                  {itemData.lyrics}
                </div>
              </div>
            </div>
          </Card>

          {/* Knowledge tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Rang A */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  📘 Tableau Rang A
                  <span className="text-sm text-purple-300 font-normal">(Essentiel)</span>
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody>
                      {itemData.tableRangA.map((row, i) => (
                        <tr key={i} className="border-b border-white/10">
                          <td className="py-3 pr-4 text-purple-300 font-semibold whitespace-nowrap">
                            {row[0]}
                          </td>
                          <td className="py-3 text-white/80">{row[1]}</td>
                          <td className="py-3 text-white/80">{row[2]}</td>
                          <td className="py-3 text-white/80">{row[3]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>

            {/* Rang B */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  📘 Tableau Rang B
                  <span className="text-sm text-blue-300 font-normal">(Approfondissement)</span>
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody>
                      {itemData.tableRangB.map((row, i) => (
                        <tr key={i} className="border-b border-white/10">
                          <td className="py-3 pr-4 text-blue-300 font-semibold whitespace-nowrap">
                            {row[0]}
                          </td>
                          <td className="py-3 text-white/80">{row[1]}</td>
                          <td className="py-3 text-white/80">{row[2]}</td>
                          <td className="py-3 text-white/80">{row[3]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </div>

          {/* Quiz section */}
          {!showQuiz ? (
            <div className="text-center">
              <Button
                onClick={() => setShowQuiz(true)}
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-8 py-4 text-lg"
              >
                🎮 Démarrer le Quiz Interactif
              </Button>
            </div>
          ) : (
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <div className="p-8">
                <h2 className="text-3xl font-bold text-white mb-8 text-center">
                  🎯 Quiz de validation
                </h2>
                
                {!showResults ? (
                  <>
                    <div className="space-y-8">
                      {quizQuestions.map((question, index) => (
                        <div key={index} className="bg-black/20 rounded-lg p-6">
                          <div className="flex items-start gap-3 mb-4">
                            <span className="bg-purple-600 text-white text-sm px-2 py-1 rounded">
                              {question.type}
                            </span>
                            <h3 className="text-white font-semibold flex-1">
                              {index + 1}. {question.question}
                            </h3>
                          </div>
                          
                          {(question.type === 'QCM' || question.type === 'TCS') && question.options && (
                            <div className="space-y-2">
                              {question.options.map((option, optIndex) => (
                                <label key={optIndex} className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded">
                                  <input
                                    type="radio"
                                    name={`question-${index}`}
                                    value={optIndex.toString()}
                                    onChange={(e) => handleQuizAnswer(index, e.target.value)}
                                    className="text-purple-600"
                                  />
                                  <span className="text-white/80">{option}</span>
                                </label>
                              ))}
                            </div>
                          )}
                          
                          {question.type === 'QRU' && (
                            <input
                              type="text"
                              placeholder="Votre réponse..."
                              onChange={(e) => handleQuizAnswer(index, e.target.value)}
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder:text-white/40"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-center mt-8">
                      <Button
                        onClick={submitQuiz}
                        size="lg"
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-8 py-4"
                      >
                        ✅ Valider mes réponses
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="mb-8">
                      <div className="text-6xl mb-4">
                        {score >= 8 ? '🏆' : score >= 6 ? '🎉' : score >= 4 ? '👍' : '💪'}
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">
                        Score: {score}/10
                      </h3>
                      <p className="text-lg text-purple-200 max-w-md mx-auto">
                        {getScoreMessage()}
                      </p>
                    </div>
                    
                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={() => {
                          setShowQuiz(false);
                          setShowResults(false);
                          setQuizAnswers({});
                          setScore(0);
                        }}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        🔄 Refaire le quiz
                      </Button>
                      <Link to="/edn">
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                          📚 Autres items EDN
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EdnItem;
