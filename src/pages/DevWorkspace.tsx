import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, Code, Database, TestTube, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DevWorkspace() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Code className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Espace Développeur - MED-MNG TEST
            </h1>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              Environnement Sécurisé
            </Badge>
          </div>
          <p className="text-lg text-gray-600">
            Zone de développement isolée avec accès aux données de test uniquement
          </p>
        </div>

        {/* Instructions importantes */}
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Instructions importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Ce que vous POUVEZ faire :
                </h4>
                <ul className="text-sm space-y-1 text-green-700">
                  <li>• Utiliser les tables sandbox.* pour les tests</li>
                  <li>• Modifier les composants dans cette zone</li>
                  <li>• Tester toutes les fonctionnalités</li>
                  <li>• Créer de nouveaux composants de test</li>
                  <li>• Utiliser les données fictives fournies</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Ce qui est PROTÉGÉ :
                </h4>
                <ul className="text-sm space-y-1 text-red-700">
                  <li>• Tables de production (public.*)</li>
                  <li>• Modules admin et paiement</li>
                  <li>• Configurations Supabase réelles</li>
                  <li>• Données utilisateurs réelles</li>
                  <li>• Settings du projet Lovable</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de travail */}
        <Tabs defaultValue="sandbox" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sandbox" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Sandbox DB
            </TabsTrigger>
            <TabsTrigger value="components" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Composants Test
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Utilisateurs Test
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Zone de Test
            </TabsTrigger>
          </TabsList>

          {/* Sandbox Database */}
          <TabsContent value="sandbox">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">sandbox.items_test</CardTitle>
                  <CardDescription>Items de test</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">3</div>
                  <p className="text-xs text-gray-500">entrées fictives</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">sandbox.users_test</CardTitle>
                  <CardDescription>Utilisateurs test</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">3</div>
                  <p className="text-xs text-gray-500">comptes fictifs</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">sandbox.competences_test</CardTitle>
                  <CardDescription>Compétences test</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">4</div>
                  <p className="text-xs text-gray-500">compétences médicales</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">sandbox.skills_test</CardTitle>
                  <CardDescription>Compétences utilisateurs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">3</div>
                  <p className="text-xs text-gray-500">relations de test</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Connexion Sandbox</CardTitle>
                <CardDescription>
                  Utilisez ces informations pour vous connecter à l'environnement de test
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
                  <div>SUPABASE_URL=https://sandbox-test.supabase.co</div>
                  <div>SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.TEST_KEY_DEV_SANDBOX_ONLY</div>
                  <div>DATABASE_SCHEMA=sandbox</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Composants Test */}
          <TabsContent value="components">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Composants disponibles</CardTitle>
                  <CardDescription>
                    Composants que vous pouvez utiliser et modifier
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <span className="font-medium">TestItemCard</span>
                      <Badge variant="secondary">Prêt</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <span className="font-medium">TestUserProfile</span>
                      <Badge variant="secondary">Prêt</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <span className="font-medium">TestCompetenceList</span>
                      <Badge variant="secondary">Prêt</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="font-medium">VotreComposant</span>
                      <Badge variant="outline">À créer</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Exemple de code</CardTitle>
                  <CardDescription>
                    Comment utiliser les données sandbox
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono">
                    <div>// Lire les données de test</div>
                    <div>const {`{ data }`} = await supabase</div>
                    <div>  .from('sandbox.items_test')</div>
                    <div>  .select('*');</div>
                    <div className="mt-2">// Créer un nouvel item</div>
                    <div>const {`{ data }`} = await supabase</div>
                    <div>  .from('sandbox.items_test')</div>
                    <div>  .insert({`{ title: 'Test' }`});</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Utilisateurs Test */}
          <TabsContent value="users">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">dev@test.com</CardTitle>
                  <CardDescription>DevUser1 - Student</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">Étudiant</Badge>
                  <p className="text-xs text-gray-500 mt-2">
                    Utilisateur de test pour les fonctionnalités étudiantes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">test@test.com</CardTitle>
                  <CardDescription>TestUser2 - Teacher</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">Enseignant</Badge>
                  <p className="text-xs text-gray-500 mt-2">
                    Utilisateur de test pour les fonctionnalités enseignantes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">admin@test.com</CardTitle>
                  <CardDescription>AdminTest - Admin</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">Admin</Badge>
                  <p className="text-xs text-gray-500 mt-2">
                    Utilisateur de test pour les fonctionnalités admin
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Zone de Test */}
          <TabsContent value="testing">
            <Card>
              <CardHeader>
                <CardTitle>Zone de Test Libre</CardTitle>
                <CardDescription>
                  Espace pour vos expérimentations et développements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Commencez votre développement ici
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Créez vos composants, testez vos fonctionnalités, expérimentez librement !
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline">
                      Créer un composant
                    </Button>
                    <Button variant="outline">
                      Tester une API
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Link to="/">
            <Button variant="outline">
              ← Retour à l'accueil
            </Button>
          </Link>
          <Button>
            Commencer le développement →
          </Button>
        </div>
      </div>
    </div>
  );
}