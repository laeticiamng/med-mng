import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { toast } from "sonner";
import {
  Search,
  Filter,
  Book,
  Clock,
  Eye,
  Loader2,
  RefreshCw,
  Grid,
  List
} from "lucide-react";
import { ecosService, EcosSituation, EcosSearchResult } from '@shared/services/ecosService';
import { createSafeHtml } from '@/utils/sanitize';

interface EcosExplorerProps {
  className?: string;
}

export const EcosExplorer: React.FC<EcosExplorerProps> = ({ className }) => {
  const [situations, setSituations] = useState<EcosSituation[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompetence, setSelectedCompetence] = useState('');
  const [competences, setCompetences] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedSituation, setSelectedSituation] = useState<EcosSituation | null>(null);

  useEffect(() => {
    loadCompetences();
    loadSituations();
  }, []);

  useEffect(() => {
    loadSituations();
  }, [pagination.page, searchTerm, selectedCompetence]);

  const loadCompetences = async () => {
    try {
      const competencesList = await ecosService.getCompetences();
      setCompetences(competencesList);
    } catch (error) {
      console.error('Error loading competences:', error);
    }
  };

  const loadSituations = async () => {
    try {
      setLoading(true);
      const result: EcosSearchResult = await ecosService.getSituations(
        pagination.page,
        pagination.limit,
        searchTerm,
        selectedCompetence
      );
      
      setSituations(result.situations);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error loading situations:', error);
      toast.error('Erreur lors du chargement des situations ECOS');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCompetenceFilter = (competence: string) => {
    setSelectedCompetence(competence);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleSituationClick = (situation: EcosSituation) => {
    setSelectedSituation(situation);
  };

  const SituationCard = ({ situation }: { situation: EcosSituation }) => {
    const readingTime = ecosService.calculateReadingTime(situation.contenu_complet_html);
    const previewText = ecosService.parseHtmlContent(situation.contenu_complet_html).substring(0, 200);

    return (
      <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-sm font-semibold line-clamp-2 mb-2">
                ECOS {situation.sd_id}: {situation.intitule_sd}
              </CardTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{readingTime} min de lecture</span>
              </div>
            </div>
            <Badge variant="outline" className="ml-2">
              #{situation.sd_id}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {previewText}...
          </p>
          
          {situation.competences_associees && situation.competences_associees.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium mb-2">Compétences associées:</p>
              <div className="flex flex-wrap gap-1">
                {situation.competences_associees.slice(0, 3).map((comp, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className={`text-xs ${ecosService.getCompetenceColor(comp)}`}
                  >
                    {comp}
                  </Badge>
                ))}
                {situation.competences_associees.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{situation.competences_associees.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          <Button 
            size="sm" 
            className="w-full"
            onClick={() => handleSituationClick(situation)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Voir la situation
          </Button>
        </CardContent>
      </Card>
    );
  };

  const SituationListItem = ({ situation }: { situation: EcosSituation }) => {
    const readingTime = ecosService.calculateReadingTime(situation.contenu_complet_html);
    const previewText = ecosService.parseHtmlContent(situation.contenu_complet_html).substring(0, 300);

    return (
      <Card className="mb-4 hover:shadow-md transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">
                ECOS {situation.sd_id}: {situation.intitule_sd}
              </h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{readingTime} min</span>
                </div>
                <Badge variant="outline">#{situation.sd_id}</Badge>
              </div>
            </div>
            <Button onClick={() => handleSituationClick(situation)}>
              <Eye className="h-4 w-4 mr-2" />
              Voir
            </Button>
          </div>
          
          <p className="text-muted-foreground mb-4">
            {previewText}...
          </p>
          
          {situation.competences_associees && situation.competences_associees.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {situation.competences_associees.slice(0, 5).map((comp, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className={ecosService.getCompetenceColor(comp)}
                >
                  {comp}
                </Badge>
              ))}
              {situation.competences_associees.length > 5 && (
                <Badge variant="outline">
                  +{situation.competences_associees.length - 5} autres
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading && situations.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Chargement des situations ECOS...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            Explorateur ECOS
            <Badge variant="secondary">{pagination.total} situations</Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des situations..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCompetence} onValueChange={handleCompetenceFilter}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrer par compétence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les compétences</SelectItem>
                {competences.map((comp) => (
                  <SelectItem key={comp} value={comp}>
                    {comp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={loadSituations}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {situations.length === 0 ? (
        <Card>
          <CardContent className="text-center p-12">
            <Book className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Aucune situation trouvée</h3>
            <p className="text-muted-foreground">
              Essayez de modifier vos critères de recherche
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {situations.map((situation) => (
                <SituationCard key={situation.sd_id} situation={situation} />
              ))}
            </div>
          ) : (
            <div className="mb-6">
              {situations.map((situation) => (
                <SituationListItem key={situation.sd_id} situation={situation} />
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Card>
              <CardContent className="flex justify-center p-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                        className={pagination.page === 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const page = Math.max(1, pagination.page - 2) + i;
                      if (page <= pagination.totalPages) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => handlePageChange(page)}
                              isActive={page === pagination.page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                        className={pagination.page === pagination.totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Modal pour afficher une situation (implémentation simplifiée) */}
      {selectedSituation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                ECOS {selectedSituation.sd_id}: {selectedSituation.intitule_sd}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose max-w-none mb-4"
                dangerouslySetInnerHTML={createSafeHtml(selectedSituation.contenu_complet_html)}
              />
              
              {selectedSituation.competences_associees && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Compétences associées:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSituation.competences_associees.map((comp, index) => (
                      <Badge key={index} variant="secondary">
                        {comp}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <Button onClick={() => setSelectedSituation(null)}>
                Fermer
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};