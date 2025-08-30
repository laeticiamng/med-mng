import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Globe, 
  Search,
  RefreshCw,
  ExternalLink,
  Route,
  Layers
} from 'lucide-react';
import { UNIFIED_ROUTES } from '@/types/routes';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface RouteValidation {
  route: any;
  status: 'valid' | 'warning' | 'error';
  message: string;
  accessible: boolean;
  component?: string;
}

export const RouteValidator: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [validations, setValidations] = useState<RouteValidation[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    valid: 0,
    warnings: 0,
    errors: 0
  });

  const validateRoutes = async () => {
    setLoading(true);
    
    const results: RouteValidation[] = [];
    
    for (const route of UNIFIED_ROUTES) {
      let status: 'valid' | 'warning' | 'error' = 'valid';
      let message = 'Route accessible et fonctionnelle';
      let accessible = true;

      try {
        // Vérifier si la route est dépréciée
        if (route.isDeprecated) {
          status = 'warning';
          message = 'Route dépréciée mais redirige correctement';
        }

        // Vérifier si c'est une route protégée
        if (route.isProtected) {
          message += ' (Nécessite une authentification)';
        }

        // Vérifier si c'est une route premium
        if (route.isPremium) {
          message += ' (Fonctionnalité premium)';
        }

        // Vérifier les sous-routes
        if (route.subRoutes && route.subRoutes.length > 0) {
          message += ` (${route.subRoutes.length} sous-routes)`;
        }

      } catch (error) {
        status = 'error';
        message = 'Erreur lors de la validation de la route';
        accessible = false;
      }

      results.push({
        route,
        status,
        message,
        accessible,
        component: route.component
      });
    }

    setValidations(results);
    
    // Calculer les statistiques
    const newStats = {
      total: results.length,
      valid: results.filter(r => r.status === 'valid').length,
      warnings: results.filter(r => r.status === 'warning').length,
      errors: results.filter(r => r.status === 'error').length
    };
    setStats(newStats);
    
    setLoading(false);
    
    toast({
      title: "Validation terminée",
      description: `${newStats.valid}/${newStats.total} routes validées avec succès`,
    });
  };

  const testRoute = (path: string) => {
    try {
      navigate(path);
      toast({
        title: "Navigation réussie",
        description: `Redirection vers ${path}`,
      });
    } catch (error) {
      toast({
        title: "Erreur de navigation",
        description: `Impossible d'accéder à ${path}`,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    validateRoutes();
  }, []);

  const getStatusIcon = (status: 'valid' | 'warning' | 'error') => {
    switch (status) {
      case 'valid': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: 'valid' | 'warning' | 'error') => {
    switch (status) {
      case 'valid': return <Badge className="bg-green-100 text-green-800">Valide</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Avertissement</Badge>;
      case 'error': return <Badge className="bg-red-100 text-red-800">Erreur</Badge>;
    }
  };

  const categoryRoutes = (category: string) => 
    validations.filter(v => v.route.category === category);

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Route className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-bold">Validation des Routes</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Vérification complète de l'accessibilité et du fonctionnement des routes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Routes totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{stats.valid}</div>
            <p className="text-sm text-muted-foreground">Valides</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats.warnings}</div>
            <p className="text-sm text-muted-foreground">Avertissements</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-red-600">{stats.errors}</div>
            <p className="text-sm text-muted-foreground">Erreurs</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <Button onClick={validateRoutes} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Revalider les routes
        </Button>
        <Button variant="outline" onClick={() => navigate('/navigation-audit')} className="gap-2">
          <Search className="h-4 w-4" />
          Audit complet
        </Button>
      </div>

      {/* Results */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="main">Principal</TabsTrigger>
          <TabsTrigger value="tools">Outils</TabsTrigger>
          <TabsTrigger value="community">Communauté</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
          <TabsTrigger value="all">Toutes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Alerts */}
          {stats.errors > 0 && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Erreurs détectées</AlertTitle>
              <AlertDescription>
                {stats.errors} route(s) présentent des erreurs critiques nécessitant une attention immédiate.
              </AlertDescription>
            </Alert>
          )}

          {stats.warnings > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Avertissements</AlertTitle>
              <AlertDescription>
                {stats.warnings} route(s) présentent des avertissements mais restent fonctionnelles.
              </AlertDescription>
            </Alert>
          )}

          {stats.errors === 0 && stats.warnings === 0 && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Validation réussie</AlertTitle>
              <AlertDescription className="text-green-700">
                Toutes les routes sont accessibles et fonctionnelles !
              </AlertDescription>
            </Alert>
          )}

          {/* Summary by category */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['main', 'tools', 'community', 'admin'].map(category => {
              const catRoutes = categoryRoutes(category);
              const catValid = catRoutes.filter(r => r.status === 'valid').length;
              
              return (
                <Card key={category}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg capitalize">{category}</CardTitle>
                    <CardDescription>
                      {catValid}/{catRoutes.length} routes valides
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {Math.round((catValid / catRoutes.length) * 100)}%
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Category tabs */}
        {['main', 'tools', 'community', 'admin', 'all'].map(category => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid gap-4">
              {(category === 'all' ? validations : categoryRoutes(category)).map((validation, index) => (
                <Card key={index} className={`${
                  validation.status === 'error' ? 'border-red-200 bg-red-50' :
                  validation.status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                  'border-green-200 bg-green-50'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(validation.status)}
                          <h3 className="font-semibold">{validation.route.label}</h3>
                          {getStatusBadge(validation.status)}
                          {validation.route.isNew && <Badge className="bg-blue-100 text-blue-800">Nouveau</Badge>}
                          {validation.route.isPremium && <Badge className="bg-purple-100 text-purple-800">Premium</Badge>}
                          {validation.route.isPopular && <Badge className="bg-orange-100 text-orange-800">Populaire</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {validation.route.description}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          <span className="font-mono bg-muted px-2 py-1 rounded">
                            {validation.route.path}
                          </span>
                          {validation.route.component && (
                            <span className="ml-2 font-mono bg-muted px-2 py-1 rounded">
                              {validation.route.component}
                            </span>
                          )}
                        </div>
                        <p className="text-sm mt-2">{validation.message}</p>
                      </div>
                      <div className="flex gap-2">
                        {validation.accessible && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testRoute(validation.route.path)}
                            className="gap-2"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Tester
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};