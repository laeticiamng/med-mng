import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Music, Brain, Target, Eye, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useEdnItem } from '@/hooks/useEdnItem';

export default function EdnCompleteDetail() {
  const { slug } = useParams();
  const { item, loading } = useEdnItem(slug);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-10 w-80 mb-2" />
            <Skeleton className="h-6 w-64" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Item EDN non trouvé.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="container mx-auto px-6 py-8">
        {/* Header avec navigation */}
        <div className="mb-8">
          <Link to="/edn" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la liste
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <Badge variant="secondary" className="mb-2">
                {item.item_code}
              </Badge>
              <h1 className="text-3xl font-bold text-slate-900">
                {item.title}
              </h1>
              {item.subtitle && (
                <p className="text-lg text-slate-600 mt-1">
                  {item.subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Compétences OIC */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Compétences OIC
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.competences_oic_rang_a && (
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">Rang A</h4>
                  <div className="space-y-2">
                    {Object.entries(item.competences_oic_rang_a).map(([key, value]) => (
                      <div key={key} className="p-3 bg-green-50 rounded-lg">
                        <p className="font-medium text-green-800">{key}</p>
                        <p className="text-sm text-green-600">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {item.competences_oic_rang_b && (
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">Rang B</h4>
                  <div className="space-y-2">
                    {Object.entries(item.competences_oic_rang_b).map(([key, value]) => (
                      <div key={key} className="p-3 bg-blue-50 rounded-lg">
                        <p className="font-medium text-blue-800">{key}</p>
                        <p className="text-sm text-blue-600">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!item.competences_oic_rang_a && !item.competences_oic_rang_b && (
                <p className="text-slate-500 text-center py-4">
                  Aucune compétence OIC disponible
                </p>
              )}
            </CardContent>
          </Card>

          {/* Contenu musical */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5 text-orange-600" />
                Contenu Musical
              </CardTitle>
            </CardHeader>
            <CardContent>
              {item.paroles_musicales && item.paroles_musicales.length > 0 ? (
                <div className="space-y-3">
                  {item.paroles_musicales.map((parole, index) => (
                    <div key={index} className="p-3 bg-orange-50 rounded-lg">
                      <p className="text-orange-800">{parole}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-4">
                  Aucune parole musicale disponible
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tableaux */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Tableaux EDN
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.tableau_rang_a && (
                <div>
                  <h4 className="font-semibold text-indigo-700 mb-2">Tableau Rang A</h4>
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <pre className="text-sm text-indigo-800 whitespace-pre-wrap">
                      {JSON.stringify(item.tableau_rang_a, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {item.tableau_rang_b && (
                <div>
                  <h4 className="font-semibold text-indigo-700 mb-2">Tableau Rang B</h4>
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <pre className="text-sm text-indigo-800 whitespace-pre-wrap">
                      {JSON.stringify(item.tableau_rang_b, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {!item.tableau_rang_a && !item.tableau_rang_b && (
                <p className="text-slate-500 text-center py-4">
                  Aucun tableau disponible
                </p>
              )}
            </CardContent>
          </Card>

          {/* Questions et Scène */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-green-600" />
                Questions & Scène
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.quiz_questions && (
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">Questions Quiz</h4>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <pre className="text-sm text-green-800 whitespace-pre-wrap">
                      {JSON.stringify(item.quiz_questions, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {item.scene_immersive && (
                <div>
                  <h4 className="font-semibold text-purple-700 mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Scène Immersive
                  </h4>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <pre className="text-sm text-purple-800 whitespace-pre-wrap">
                      {JSON.stringify(item.scene_immersive, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {!item.quiz_questions && !item.scene_immersive && (
                <p className="text-slate-500 text-center py-4">
                  Aucune question ou scène disponible
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4 justify-center">
          <Link to="/edn">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la liste
            </Button>
          </Link>
          <Button>
            Commencer l'apprentissage
          </Button>
        </div>
      </div>
    </div>
  );
}