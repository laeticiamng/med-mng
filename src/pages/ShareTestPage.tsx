import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShareManager } from '@/components/sitemap/ShareManager';
import { useSitemapShares } from '@/hooks/useSitemapShares';
import { usePageNotes } from '@/hooks/usePageNotes';
import { supabase } from '@/integrations/supabase/client';
import { 
  Share2, 
  Eye, 
  Edit, 
  Shield, 
  Star, 
  Tag, 
  FileText, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  Users,
  Database
} from 'lucide-react';
import { toast } from 'sonner';

export default function ShareTestPage() {
  const { myShares, sharedWithMe } = useSitemapShares();
  const { notes } = usePageNotes();
  
  // Query to get favorites count
  const { data: favoritesData = [] } = useQuery({
    queryKey: ['user-sitemap-favorites'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_sitemap_data' as any)
        .select('favorites')
        .eq('user_id', user.id)
        .single();
      
      if (error || !data) return [];
      const result = data as any;
      return result.favorites || [];
    },
  });
  const [testResults, setTestResults] = useState<{
    action: string;
    permission: string;
    result: 'success' | 'error';
    message: string;
  }[]>([]);

  const addTestResult = (action: string, permission: string, result: 'success' | 'error', message: string) => {
    setTestResults(prev => [...prev, { action, permission, result, message }]);
  };

  const testViewerPermissions = async () => {
    const testName = 'Viewer - Lecture seule';
    addTestResult('Test démarré', 'viewer', 'success', 'Testing viewer permissions...');

    // Test: Can read favorites
    try {
      const { data } = await supabase
        .from('user_sitemap_data' as any)
        .select('*')
        .limit(1);
      addTestResult('Lecture favoris', 'viewer', 'success', `✓ Peut lire ${data?.length || 0} favoris`);
    } catch (error: any) {
      addTestResult('Lecture favoris', 'viewer', 'error', `✗ ${error.message}`);
    }

    // Test: Can read notes
    try {
      const { data } = await supabase
        .from('page_notes' as any)
        .select('*')
        .limit(1);
      addTestResult('Lecture notes', 'viewer', 'success', `✓ Peut lire ${data?.length || 0} notes`);
    } catch (error: any) {
      addTestResult('Lecture notes', 'viewer', 'error', `✗ ${error.message}`);
    }

    // Test: Cannot update (should fail)
    try {
      const { error } = await supabase
        .from('user_sitemap_data' as any)
        .update({ is_favorite: false })
        .eq('id', 'test-id');
      
      if (error) {
        addTestResult('Tentative modification', 'viewer', 'success', '✓ Correctement bloqué (attendu)');
      } else {
        addTestResult('Tentative modification', 'viewer', 'error', '✗ Ne devrait pas pouvoir modifier!');
      }
    } catch (error: any) {
      addTestResult('Tentative modification', 'viewer', 'success', '✓ Correctement bloqué');
    }

    toast.success('Tests viewer terminés');
  };

  const testEditorPermissions = async () => {
    const testName = 'Editor - Lecture et modification';
    addTestResult('Test démarré', 'editor', 'success', 'Testing editor permissions...');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      addTestResult('Auth', 'editor', 'error', 'Non authentifié');
      return;
    }

    // Test: Can read
    try {
      const { data } = await supabase
        .from('user_sitemap_data' as any)
        .select('*')
        .eq('user_id', user.id)
        .limit(1);
      addTestResult('Lecture données', 'editor', 'success', `✓ Peut lire ${data?.length || 0} éléments`);
    } catch (error: any) {
      addTestResult('Lecture données', 'editor', 'error', `✗ ${error.message}`);
    }

    // Test: Can create a test note
    try {
      const { error } = await supabase
        .from('page_notes' as any)
        .insert({
          user_id: user.id,
          page_path: '/test-editor-permission',
          note_text: 'Test note from editor permission test',
        });

      if (error) throw error;
      addTestResult('Création note', 'editor', 'success', '✓ Peut créer des notes');
    } catch (error: any) {
      addTestResult('Création note', 'editor', 'error', `✗ ${error.message}`);
    }

    // Test: Can update own data
    try {
      const { data: testData, error: fetchError } = await supabase
        .from('user_sitemap_data' as any)
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (fetchError) throw fetchError;

      const dataRow = testData as any;
      if (dataRow && dataRow.id) {
        const currentFavs = dataRow.favorites || [];
        const { error } = await supabase
          .from('user_sitemap_data' as any)
          .update({ favorites: [...currentFavs, '/test-path'] })
          .eq('id', dataRow.id);

        if (error) throw error;
        addTestResult('Modification données', 'editor', 'success', '✓ Peut modifier les données');
      }
    } catch (error: any) {
      addTestResult('Modification données', 'editor', 'error', `✗ ${error.message}`);
    }

    toast.success('Tests editor terminés');
  };

  const testAdminPermissions = async () => {
    const testName = 'Admin - Tous les droits';
    addTestResult('Test démarré', 'admin', 'success', 'Testing admin permissions...');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      addTestResult('Auth', 'admin', 'error', 'Non authentifié');
      return;
    }

    // Test: Can read all shares
    try {
      const { data } = await supabase
        .from('sitemap_shares')
        .select('*')
        .eq('owner_id', user.id);
      addTestResult('Gestion partages', 'admin', 'success', `✓ Peut gérer ${data?.length || 0} partages`);
    } catch (error: any) {
      addTestResult('Gestion partages', 'admin', 'error', `✗ ${error.message}`);
    }

    // Test: Full CRUD on own data
    try {
      // Create
      const { data: created, error: createError } = await supabase
        .from('page_notes' as any)
        .insert({
          user_id: user.id,
          page_path: '/test-admin-crud',
          note_text: 'Admin CRUD test note',
        })
        .select()
        .single();

      if (createError) throw createError;
      
      const createdNote = created as any;
      addTestResult('Création (CRUD)', 'admin', 'success', '✓ Create OK');

      // Update
      if (createdNote && createdNote.id) {
        const { error: updateError } = await supabase
          .from('page_notes' as any)
          .update({ note_text: 'Updated by admin' })
          .eq('id', createdNote.id);

        if (updateError) throw updateError;
        addTestResult('Modification (CRUD)', 'admin', 'success', '✓ Update OK');

        // Delete
        const { error: deleteError } = await supabase
          .from('page_notes' as any)
          .delete()
          .eq('id', createdNote.id);

        if (deleteError) throw deleteError;
        addTestResult('Suppression (CRUD)', 'admin', 'success', '✓ Delete OK');
      }
    } catch (error: any) {
      addTestResult('CRUD complet', 'admin', 'error', `✗ ${error.message}`);
    }

    toast.success('Tests admin terminés');
  };

  const clearTests = () => {
    setTestResults([]);
    toast.info('Résultats effacés');
  };

  const getPermissionBadge = (permission: string) => {
    const config = {
      viewer: { icon: Eye, color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
      editor: { icon: Edit, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
      admin: { icon: Shield, color: 'bg-red-500/10 text-red-500 border-red-500/20' },
    }[permission] || { icon: AlertCircle, color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' };

    const Icon = config.icon;
    return (
      <Badge variant="outline" className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {permission}
      </Badge>
    );
  };

  return (
    <>
      <Helmet>
        <title>Test Système de Partage - Med-MNG</title>
        <meta name="description" content="Page de test pour vérifier les permissions de partage" />
      </Helmet>

      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Share2 className="w-8 h-8" />
              Test Système de Partage
            </h1>
            <p className="text-muted-foreground mt-2">
              Testez les permissions viewer, editor et admin pour la collaboration d'équipe
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="shares">Gestion des partages</TabsTrigger>
            <TabsTrigger value="tests">Tests des permissions</TabsTrigger>
            <TabsTrigger value="data">Données accessibles</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Partages créés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{myShares.length}</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Collaborateurs invités
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Partages reçus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{sharedWithMe.length}</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Accès partagés avec vous
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Données totales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {(favoritesData?.length || 0) + (notes?.length || 0)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Favoris + Notes
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Niveaux de permissions</CardTitle>
                <CardDescription>
                  Comprendre les différents niveaux d'accès
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                  <Eye className="w-6 h-6 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">Viewer</h3>
                      {getPermissionBadge('viewer')}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Accès en lecture seule. Peut consulter les favoris, tags et notes partagés.
                      Ne peut pas modifier ou supprimer.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                  <Edit className="w-6 h-6 text-blue-500 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">Editor</h3>
                      {getPermissionBadge('editor')}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Accès en lecture et écriture. Peut consulter, créer et modifier les données partagées.
                      Ne peut pas supprimer les données du propriétaire ni gérer les partages.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                  <Shield className="w-6 h-6 text-red-500 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">Admin</h3>
                      {getPermissionBadge('admin')}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Accès complet. Peut consulter, créer, modifier et supprimer toutes les données.
                      Peut également gérer les partages et inviter d'autres collaborateurs.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shares">
            <ShareManager />
          </TabsContent>

          <TabsContent value="tests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tests automatisés des permissions</CardTitle>
                <CardDescription>
                  Lancez des tests pour vérifier que chaque niveau de permission fonctionne correctement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Button onClick={testViewerPermissions} variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Eye className="w-6 h-6" />
                    <span>Tester Viewer</span>
                    <span className="text-xs text-muted-foreground">Lecture seule</span>
                  </Button>

                  <Button onClick={testEditorPermissions} variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Edit className="w-6 h-6" />
                    <span>Tester Editor</span>
                    <span className="text-xs text-muted-foreground">Lecture + Écriture</span>
                  </Button>

                  <Button onClick={testAdminPermissions} variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Shield className="w-6 h-6" />
                    <span>Tester Admin</span>
                    <span className="text-xs text-muted-foreground">Tous les droits</span>
                  </Button>
                </div>

                {testResults.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Résultats des tests</h3>
                      <Button onClick={clearTests} variant="ghost" size="sm">
                        Effacer
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {testResults.map((result, idx) => (
                        <div
                          key={idx}
                          className={`flex items-start gap-3 p-3 rounded-lg border ${
                            result.result === 'success'
                              ? 'bg-green-500/5 border-green-500/20'
                              : 'bg-red-500/5 border-red-500/20'
                          }`}
                        >
                          {result.result === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{result.action}</span>
                              {getPermissionBadge(result.permission)}
                            </div>
                            <p className="text-sm text-muted-foreground">{result.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Favoris ({favoritesData?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {favoritesData && favoritesData.length > 0 ? (
                      favoritesData.map((favPath: string, idx: number) => (
                        <div key={idx} className="p-3 rounded-lg border bg-card">
                          <div className="font-medium">{favPath}</div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Aucun favori pour le moment
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Notes ({notes?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notes && notes.length > 0 ? (
                      notes.map((note: any) => (
                        <div key={note.id} className="p-3 rounded-lg border bg-card">
                          <div className="font-medium text-sm">{note.page_path}</div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {note.note_text}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Aucune note pour le moment
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Mes partages actifs</CardTitle>
              </CardHeader>
              <CardContent>
                {myShares.length > 0 ? (
                  <div className="space-y-2">
                    {myShares.map((share) => (
                      <div key={share.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                        <div>
                          <div className="font-medium">{share.shared_with_email}</div>
                          <div className="text-sm text-muted-foreground">
                            Créé le {new Date(share.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        {getPermissionBadge(share.permission)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Aucun partage actif. Créez votre premier partage dans l'onglet "Gestion des partages".
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
