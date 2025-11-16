import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, UserPlus, UserMinus, Mail, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function RolesManagementPage() {
  const { isAdmin, loadingMyRoles, allUsers, loadingUsers, assignRole, removeRole, isAssigning } = useUserRoles();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'security_analyst' | 'viewer'>('security_analyst');

  if (loadingMyRoles) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleAssignRole = (userId: string) => {
    assignRole({ userId, role: selectedRole });
  };

  const handleRemoveRole = (userId: string, role: 'admin' | 'security_analyst' | 'viewer') => {
    removeRole({ userId, role });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'security_analyst':
        return 'default';
      case 'viewer':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Gestion des Rôles</h1>
          <p className="text-muted-foreground">
            Assignez et gérez les rôles des utilisateurs de la plateforme
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Description des Rôles</CardTitle>
            <CardDescription>
              Comprendre les permissions associées à chaque rôle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <Badge variant="destructive">Admin</Badge>
              <div>
                <p className="font-medium">Administrateur</p>
                <p className="text-sm text-muted-foreground">
                  Accès complet : gestion des utilisateurs, rôles, configuration système, et toutes les données
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <Badge variant="default">Security Analyst</Badge>
              <div>
                <p className="font-medium">Analyste de Sécurité</p>
                <p className="text-sm text-muted-foreground">
                  Accès aux logs d'audit, surveillance de sécurité, rapports et alertes (lecture seule)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <Badge variant="secondary">Viewer</Badge>
              <div>
                <p className="font-medium">Visualiseur</p>
                <p className="text-sm text-muted-foreground">
                  Accès en lecture seule aux données publiques et au contenu éducatif
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs et Rôles</CardTitle>
            <CardDescription>
              {allUsers.length} utilisateur{allUsers.length > 1 ? 's' : ''} enregistré{allUsers.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôles actuels</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {user.roles.length > 0 ? (
                            user.roles.map((role) => (
                              <div key={role} className="flex items-center gap-1">
                                <Badge variant={getRoleBadgeVariant(role)}>
                                  {role}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5"
                                  onClick={() => handleRemoveRole(user.id, role)}
                                  disabled={isAssigning}
                                >
                                  <UserMinus className="h-3 w-3" />
                                </Button>
                              </div>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">Aucun rôle</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(user.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            value={selectedRole}
                            onValueChange={(value: any) => setSelectedRole(value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Sélectionner un rôle" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="security_analyst">Security Analyst</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            onClick={() => handleAssignRole(user.id)}
                            disabled={isAssigning || user.roles.includes(selectedRole)}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Assigner
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
