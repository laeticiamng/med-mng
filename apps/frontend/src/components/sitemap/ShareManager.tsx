import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSitemapShares, SharePermission } from '@/hooks/useSitemapShares';
import { Share2, Trash2, UserPlus, Eye, Edit, Shield } from 'lucide-react';

export function ShareManager() {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<SharePermission>('viewer');
  const { myShares, sharedWithMe, createShare, updateShare, deleteShare, isLoading } = useSitemapShares();

  const handleCreateShare = () => {
    if (!email) return;
    createShare({ email, permission });
    setEmail('');
    setPermission('viewer');
  };

  const getPermissionIcon = (perm: SharePermission) => {
    switch (perm) {
      case 'admin': return <Shield className="w-3 h-3" />;
      case 'editor': return <Edit className="w-3 h-3" />;
      case 'viewer': return <Eye className="w-3 h-3" />;
    }
  };

  const getPermissionColor = (perm: SharePermission) => {
    switch (perm) {
      case 'admin': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'editor': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'viewer': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Partager avec des collaborateurs
          </CardTitle>
          <CardDescription>
            Invitez des membres de votre équipe à collaborer sur vos favoris, tags et notes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="email">Email du collaborateur</Label>
              <Input
                id="email"
                type="email"
                placeholder="collaborateur@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="w-48 space-y-2">
              <Label htmlFor="permission">Permission</Label>
              <Select value={permission} onValueChange={(v) => setPermission(v as SharePermission)}>
                <SelectTrigger id="permission">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Viewer
                    </div>
                  </SelectItem>
                  <SelectItem value="editor">
                    <div className="flex items-center gap-2">
                      <Edit className="w-4 h-4" />
                      Editor
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Admin
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleCreateShare} disabled={isLoading || !email}>
                <UserPlus className="w-4 h-4 mr-2" />
                Inviter
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t space-y-3">
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Viewer:</strong> Peut voir les favoris, tags et notes partagés</p>
              <p><strong>Editor:</strong> Peut modifier les favoris, tags et notes partagés</p>
              <p><strong>Admin:</strong> Peut tout modifier et gérer les partages</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mes partages ({myShares.length})</CardTitle>
          <CardDescription>
            Personnes avec qui vous avez partagé vos données
          </CardDescription>
        </CardHeader>
        <CardContent>
          {myShares.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Vous n'avez partagé avec personne pour le moment
            </p>
          ) : (
            <div className="space-y-2">
              {myShares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {share.shared_with_email[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{share.shared_with_email}</p>
                      <p className="text-xs text-muted-foreground">
                        Partagé le {new Date(share.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={share.permission}
                      onValueChange={(v) => updateShare({ shareId: share.id, permission: v as SharePermission })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge variant="outline" className={getPermissionColor(share.permission)}>
                      <div className="flex items-center gap-1">
                        {getPermissionIcon(share.permission)}
                        {share.permission}
                      </div>
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteShare(share.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Partagé avec moi ({sharedWithMe.length})</CardTitle>
          <CardDescription>
            Données que d'autres ont partagées avec vous
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sharedWithMe.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Personne n'a partagé de données avec vous
            </p>
          ) : (
            <div className="space-y-2">
              {sharedWithMe.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Share2 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Données partagées</p>
                      <p className="text-xs text-muted-foreground">
                        Partagé le {new Date(share.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getPermissionColor(share.permission)}>
                    <div className="flex items-center gap-1">
                      {getPermissionIcon(share.permission)}
                      {share.permission}
                    </div>
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
