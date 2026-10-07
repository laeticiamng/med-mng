import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Search, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

/**
 * Liste des comptes (table `profiles`).
 *
 * MM-A20 (07.10.2026) : n'affiche plus que des colonnes réelles. Retirés :
 * abonnement (toujours « standard »), crédits et utilisation (calculés à partir
 * de la position dans la liste), statut (toujours « Actif »), e-mail de repli
 * `user@example.com`, avatar chargé chez dicebear.com avec le nom ou l'e-mail
 * de la personne, et les actions « Suspendre / Réactiver » (colonne
 * `profiles.is_active` absente : la requête échouait) et « Promouvoir /
 * Rétrograder » (écrivaient `profiles.role`, alors que les droits sont portés
 * par `user_roles`). Les abonnements réels sont dans Stripe et `user_subscriptions`.
 */
interface CompteProfil {
  id: string;
  email: string | null;
  name: string | null;
  role: string | null;
  created_at: string | null;
}

const initiales = (compte: CompteProfil) =>
  (compte.name || compte.email || '?').substring(0, 2).toUpperCase();

export const AdminUsersManager = () => {
  const [comptes, setComptes] = useState<CompteProfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    const charger = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, name, role, created_at')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setComptes((data as CompteProfil[]) || []);
      } catch (error) {
        console.error('Erreur chargement utilisateurs:', error);
        toast.error('Erreur lors du chargement des utilisateurs');
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, []);

  const recherche = searchTerm.toLowerCase();
  const comptesFiltres = comptes.filter((c) => {
    const correspond = !recherche
      || (c.email ?? '').toLowerCase().includes(recherche)
      || (c.name ?? '').toLowerCase().includes(recherche);
    const roleOk = roleFilter === 'all' || (c.role || 'user') === roleFilter;
    return correspond && roleOk;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Comptes
          </CardTitle>
          <CardDescription>
            Profils enregistrés (nom, e-mail, rôle de profil, date d'inscription). Les abonnements se suivent dans Stripe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher par e-mail ou nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="user">Utilisateur</SelectItem>
                <SelectItem value="moderator">Modérateur</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôle (profil)</TableHead>
                  <TableHead>Inscription</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comptesFiltres.map((compte) => (
                  <TableRow key={compte.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{initiales(compte)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{compte.name || 'Sans nom'}</div>
                          <div className="text-sm text-muted-foreground">{compte.email || 'E-mail non renseigné'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={compte.role === 'admin' ? 'destructive' : 'secondary'}>
                        {compte.role || 'user'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {compte.created_at ? new Date(compte.created_at).toLocaleDateString('fr-FR') : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {comptesFiltres.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun utilisateur trouvé avec ces critères
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Profils enregistrés</div>
            <div className="text-2xl font-bold">{comptes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Rôle de profil « admin »</div>
            <div className="text-2xl font-bold">{comptes.filter((c) => c.role === 'admin').length}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
