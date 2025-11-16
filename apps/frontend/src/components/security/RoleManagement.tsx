import { Shield, UserPlus, UserMinus, Crown, Eye, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUserRoles, AppRole } from '@/hooks/useUserRoles';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const RoleManagement = () => {
  const { isAdmin, allUsers, loadingUsers, assignRole, removeRole, isAssigning } = useUserRoles();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('viewer');

  if (!isAdmin) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Accès refusé. Seuls les administrateurs peuvent gérer les rôles.
        </AlertDescription>
      </Alert>
    );
  }

  const getRoleIcon = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-destructive" />;
      case 'security_analyst':
        return <Shield className="h-4 w-4 text-primary" />;
      case 'viewer':
        return <Eye className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRoleBadge = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive">Admin</Badge>;
      case 'security_analyst':
        return <Badge className="bg-primary text-primary-foreground">Analyste</Badge>;
      case 'viewer':
        return <Badge variant="outline">Viewer</Badge>;
    }
  };

  const getRoleDescription = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return 'Accès complet - Gestion des rôles et toutes les fonctionnalités';
      case 'security_analyst':
        return 'Peut gérer les incidents et alertes de sécurité';
      case 'viewer':
        return 'Lecture seule - Consultation des métriques et alertes';
    }
  };

  const handleAssignRole = () => {
    if (!selectedUserId || !selectedRole) return;
    assignRole({ userId: selectedUserId, role: selectedRole });
    setSelectedUserId('');
  };

  return (
    <div className="space-y-6">
      {/* Role Definitions */}
      <Card>
        <CardHeader>
          <CardTitle>Définition des Rôles</CardTitle>
          <CardDescription>
            Trois niveaux de permissions pour l'accès aux fonctionnalités de sécurité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-destructive" />
                <h3 className="font-semibold">Admin</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Accès complet à toutes les fonctionnalités, gestion des rôles et permissions
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Gérer les rôles utilisateurs</li>
                <li>• Modifier toutes les alertes</li>
                <li>• Supprimer des incidents</li>
                <li>• Accès aux métriques avancées</li>
              </ul>
            </div>

            <div className="border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Security Analyst</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Gestion des incidents et alertes de sécurité
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Créer et modifier des incidents</li>
                <li>• Mettre à jour les alertes</li>
                <li>• Escalader les problèmes</li>
                <li>• Consulter les rapports</li>
              </ul>
            </div>

            <div className="border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Viewer</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Accès en lecture seule aux métriques et alertes
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Consulter les métriques</li>
                <li>• Voir les alertes</li>
                <li>• Lire les incidents</li>
                <li>• Télécharger les rapports</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assign Role */}
      <Card>
        <CardHeader>
          <CardTitle>Assigner un Rôle</CardTitle>
          <CardDescription>
            Attribuez des permissions à un utilisateur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Sélectionner un utilisateur" />
              </SelectTrigger>
              <SelectContent>
                {allUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-destructive" />
                    Admin
                  </div>
                </SelectItem>
                <SelectItem value="security_analyst">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Security Analyst
                  </div>
                </SelectItem>
                <SelectItem value="viewer">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    Viewer
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={handleAssignRole}
              disabled={!selectedUserId || isAssigning}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Assigner
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs et Rôles</CardTitle>
          <CardDescription>
            {allUsers.length} utilisateur(s) enregistré(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loadingUsers ? (
              <div className="text-center py-8 text-muted-foreground">
                Chargement des utilisateurs...
              </div>
            ) : allUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun utilisateur trouvé
              </div>
            ) : (
              allUsers.map(user => (
                <div 
                  key={user.id} 
                  className="border border-border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">{user.email}</div>
                      <div className="text-sm text-muted-foreground">
                        Créé {formatDistanceToNow(new Date(user.created_at), { 
                          addSuffix: true, 
                          locale: fr 
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {user.roles.length === 0 ? (
                      <div className="text-sm text-muted-foreground italic">
                        Aucun rôle assigné
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {user.roles.map(role => (
                          <div key={role} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2">
                              {getRoleIcon(role)}
                              {getRoleBadge(role)}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRole({ userId: user.id, role })}
                              disabled={isAssigning}
                              className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <UserMinus className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {user.roles.map(role => getRoleDescription(role)).join(' • ')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
