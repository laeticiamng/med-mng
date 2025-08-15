import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Music, Target, CheckCircle, GraduationCap, Brain, Stethoscope } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface OicCompetence {
  objectif_id: string;
  intitule: string;
  description: string;
  rang: string;  // Changé de 'A' | 'B' à string pour éviter l'erreur de type
  rubrique: string;
  item_parent: string;
}

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
  competences_count_rang_a: number;
  competences_count_rang_b: number;
  competences_count_total: number;
  scene_immersive?: any;
  quiz_questions?: any;
  completeness_score: number;
  is_validated: boolean;
}

export default function EdnItemDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [item, setItem] = useState<EdnItemDetail | null>(null);
  const [competencesRangA, setCompetencesRangA] = useState<OicCompetence[]>([]);
  const [competencesRangB, setCompetencesRangB] = useState<OicCompetence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItemAndCompetences = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);

        // Charger l'item EDN
        const { data: itemData, error: itemError } = await supabase
          .from('edn_items_complete')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (itemError) {
          console.error('Erreur item:', itemError);
          setError('Erreur de chargement de l\'item');
          return;
        }

        if (!itemData) {
          setError('Item non trouvé');
          return;
        }

        setItem(itemData);

        // Extraire le numéro d'item pour récupérer les compétences OIC
        const itemNum = itemData.item_code.replace('IC-', '');
        
        // Formater le numéro d'item pour la requête (IC-1 -> 001)
        const itemNumber = itemNum.padStart(3, '0');
        
        // Charger les compétences OIC réelles depuis la table backup
        const { data: competences, error: compError } = await supabase
          .from('backup_oic_competences')
          .select('objectif_id, intitule, description, rang, rubrique, item_parent')
          .eq('item_parent', itemNumber)
          .order('objectif_id');

        if (!compError && competences) {
          const rangA = competences.filter(c => c.rang === 'A');
          const rangB = competences.filter(c => c.rang === 'B');
          
          setCompetencesRangA(rangA);
          setCompetencesRangB(rangB);
          
          console.log(`✅ Item ${itemData.item_code}: ${rangA.length} compétences Rang A, ${rangB.length} compétences Rang B`);
        }

      } catch (err) {
        console.error('Erreur:', err);
        setError('Erreur de réseau');
      } finally {
        setLoading(false);
      }
    };

    fetchItemAndCompetences();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-12 bg-slate-200 rounded-xl w-48 mb-8" />
            <div className="flex gap-6 mb-8">
              <div className="w-20 h-20 bg-slate-200 rounded-2xl" />
              <div className="flex-1">
                <div className="h-8 bg-slate-200 rounded-lg w-96 mb-4" />
                <div className="h-6 bg-slate-200 rounded-lg w-64" />
              </div>
            </div>
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-48 bg-slate-200 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border-2 border-slate-200 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            {error || 'Item non trouvé'}
          </h2>
          <p className="text-slate-600 mb-6">
            L'item EDN demandé n'existe pas ou n'a pas pu être chargé.
          </p>
          <Link 
            to="/edn"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-6 py-8">
        
        {/* Navigation de retour */}
        <Link 
          to="/edn"
          className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste EDN
        </Link>

        {/* Header de l'item */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-xl">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-lg font-bold rounded-xl">
                  {item.item_code}
                </span>
                <span className={`px-4 py-2 text-lg font-bold rounded-xl ${
                  (item.completeness_score || 0) >= 80 
                    ? 'bg-green-100 text-green-700' 
                    : (item.completeness_score || 0) >= 60
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {item.completeness_score || 0}% complété
                </span>
                {item.is_validated && (
                  <span className="px-4 py-2 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-xl">
                    ✓ Validé
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-slate-900 mb-3 leading-tight">
                {item.title}
              </h1>
              
              {item.subtitle && (
                <p className="text-xl text-slate-600 font-medium">
                  {item.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Statistiques des compétences */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{competencesRangA.length}</div>
              <div className="text-sm text-slate-600 font-medium">Compétences Rang A</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{competencesRangB.length}</div>
              <div className="text-sm text-slate-600 font-medium">Compétences Rang B</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{item.paroles_musicales?.length || 0}</div>
              <div className="text-sm text-slate-600 font-medium">Paroles musicales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{item.competences_count_total || 0}</div>
              <div className="text-sm text-slate-600 font-medium">Total compétences</div>
            </div>
          </div>
        </div>

        {/* Introduction */}
        {item.pitch_intro && (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <GraduationCap className="w-7 h-7 text-blue-600" />
              Introduction
            </h2>
            <p className="text-lg text-slate-700 leading-relaxed">
              {item.pitch_intro}
            </p>
          </div>
        )}

        {/* Compétences OIC Rang A */}
        {competencesRangA.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <CheckCircle className="w-7 h-7 text-green-600" />
              Compétences OIC Rang A ({competencesRangA.length})
            </h2>
            <div className="grid gap-4">
              {competencesRangA.map((comp, index) => (
                <div key={comp.objectif_id} className="p-6 bg-green-50 border-2 border-green-200 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-green-800 mb-2">
                        {comp.objectif_id} - {comp.intitule}
                      </h3>
                      {comp.description && (
                        <p className="text-green-700 leading-relaxed">
                          {comp.description}
                        </p>
                      )}
                      {comp.rubrique && (
                        <div className="mt-3">
                          <span className="px-3 py-1 bg-green-200 text-green-800 text-sm font-medium rounded-lg">
                            {comp.rubrique}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compétences OIC Rang B */}
        {competencesRangB.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <CheckCircle className="w-7 h-7 text-blue-600" />
              Compétences OIC Rang B ({competencesRangB.length})
            </h2>
            <div className="grid gap-4">
              {competencesRangB.map((comp, index) => (
                <div key={comp.objectif_id} className="p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-blue-800 mb-2">
                        {comp.objectif_id} - {comp.intitule}
                      </h3>
                      {comp.description && (
                        <p className="text-blue-700 leading-relaxed">
                          {comp.description}
                        </p>
                      )}
                      {comp.rubrique && (
                        <div className="mt-3">
                          <span className="px-3 py-1 bg-blue-200 text-blue-800 text-sm font-medium rounded-lg">
                            {comp.rubrique}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paroles musicales */}
        {item.paroles_musicales && item.paroles_musicales.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <Music className="w-7 h-7 text-purple-600" />
              Paroles Musicales ({item.paroles_musicales.length})
            </h2>
            <div className="space-y-4">
              {item.paroles_musicales.map((parole, index) => (
                <div key={index} className="p-6 bg-purple-50 border-2 border-purple-200 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                      ♪
                    </div>
                    <p className="text-lg text-purple-800 font-medium leading-relaxed">
                      {parole}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-6">
          <Link 
            to="/edn"
            className="px-8 py-3 border-2 border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all duration-200"
          >
            Retour à la liste
          </Link>
          {item.scene_immersive && (
            <Link 
              to={`/edn/${item.slug}/immersive`}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200"
            >
              Mode Immersif
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}