import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Music, Target, CheckCircle } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface EdnItemDetail {
  id: string;
  item_code: string;
  title: string;
  subtitle?: string;
  slug: string;
  pitch_intro?: string;
  paroles_musicales?: string[];
  tableau_rang_a?: any;
  tableau_rang_b?: any;
  competences_oic_rang_a?: any;
  competences_oic_rang_b?: any;
  scene_immersive?: any;
  quiz_questions?: any;
}

export default function EdnItemDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [item, setItem] = useState<EdnItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('edn_items_complete')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (fetchError) {
          console.error('Erreur Supabase:', fetchError);
          setError('Erreur de chargement');
          return;
        }

        if (!data) {
          setError('Item non trouvé');
          return;
        }

        setItem(data);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Erreur de réseau');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-32 mb-6" />
            <div className="h-12 bg-muted rounded w-96 mb-4" />
            <div className="h-6 bg-muted rounded w-64 mb-8" />
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-5/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {error || 'Item non trouvé'}
          </h2>
          <p className="text-muted-foreground mb-4">
            L'item EDN demandé n'existe pas ou n'a pas pu être chargé.
          </p>
          <Link 
            to="/edn"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  const getCompletionPercentage = () => {
    let score = 0;
    if (item.tableau_rang_a) score += 25;
    if (item.tableau_rang_b) score += 25;
    if (item.paroles_musicales?.length) score += 25;
    if (item.competences_oic_rang_a || item.competences_oic_rang_b) score += 25;
    return score;
  };

  const completionPercentage = getCompletionPercentage();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <Link 
          to="/edn"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
              <BookOpen className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded">
                  {item.item_code}
                </span>
                <span className={`px-3 py-1 text-sm rounded ${
                  completionPercentage >= 80 ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
                }`}>
                  {completionPercentage}% complété
                </span>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {item.title}
              </h1>
              {item.subtitle && (
                <p className="text-lg text-muted-foreground">
                  {item.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex flex-wrap gap-3 mb-6">
            {item.tableau_rang_a && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Rang A disponible</span>
              </div>
            )}
            {item.tableau_rang_b && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Rang B disponible</span>
              </div>
            )}
            {item.paroles_musicales?.length && (
              <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 text-orange-700 rounded-lg">
                <Music className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {item.paroles_musicales.length} paroles musicales
                </span>
              </div>
            )}
            {(item.competences_oic_rang_a || item.competences_oic_rang_b) && (
              <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg">
                <Target className="w-4 h-4" />
                <span className="text-sm font-medium">Compétences OIC</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {item.pitch_intro && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                {item.pitch_intro}
              </p>
            </div>
          )}

          {item.paroles_musicales && item.paroles_musicales.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Paroles Musicales</h2>
              <div className="space-y-3">
                {item.paroles_musicales.map((parole, index) => (
                  <div key={index} className="p-4 bg-muted rounded-lg">
                    <p className="text-foreground">{parole}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {item.scene_immersive && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Scène Immersive</h2>
              <Link 
                to={`/edn/${item.slug}/immersive`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Lancer l'expérience immersive
              </Link>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-border">
            <Link 
              to="/edn"
              className="px-6 py-2 border border-border rounded hover:bg-muted"
            >
              Retour à la liste
            </Link>
            {item.scene_immersive && (
              <Link 
                to={`/edn/${item.slug}/immersive`}
                className="px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Mode Immersif
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}