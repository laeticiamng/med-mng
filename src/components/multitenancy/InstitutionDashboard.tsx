import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { 
  Building2, 
  Users, 
  UserPlus, 
  Settings, 
  GraduationCap,
  Crown,
  Shield,
  BookOpen,
  User,
  Mail,
  Plus,
  BarChart3,
  Trash2,
  Edit
} from 'lucide-react';
import { useMultiTenancy } from '@/hooks/useMultiTenancy';
import { MemberRole, InstitutionType, ROLE_PERMISSIONS } from '@/types/multitenancy';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const roleIcons: Record<MemberRole, React.ReactNode> = {
  owner: <Crown className="h-4 w-4 text-yellow-500" />,
  admin: <Shield className="h-4 w-4 text-blue-500" />,
  professor: <BookOpen className="h-4 w-4 text-purple-500" />,
  student: <GraduationCap className="h-4 w-4 text-green-500" />,
  guest: <User className="h-4 w-4 text-gray-500" />
};

const roleLabels: Record<MemberRole, string> = {
  owner: 'Propriétaire',
  admin: 'Administrateur',
  professor: 'Professeur',
  student: 'Étudiant',
  guest: 'Invité'
};

const institutionTypeLabels: Record<InstitutionType, string> = {
  university: 'Université',
  hospital: 'Hôpital',
  medical_school: 'Faculté de médecine',
  research_center: 'Centre de recherche',
  other: 'Autre'
};

export function InstitutionDashboard() {
  const {
    currentInstitution,
    myInstitutions,
    members,
    cohorts,
    invites,
    myRole,
    createInstitution,
    inviteMember,
    changeMemberRole,
    createCohort,
    updateInstitutionSettings,
    switchInstitution,
    getInstitutionStats,
    hasPermission,
    permissions
  } = useMultiTenancy();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isCohortDialogOpen, setIsCohortDialogOpen] = useState(false);

  // Create institution form
  const [newInstName, setNewInstName] = useState('');
  const [newInstType, setNewInstType] = useState<InstitutionType>('university');
  const [newInstCountry, setNewInstCountry] = useState('France');

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<MemberRole>('student');

  // Cohort form
  const [cohortName, setCohortName] = useState('');
  const [cohortYear, setCohortYear] = useState('2024-2025');

  const stats = getInstitutionStats();

  const handleCreateInstitution = () => {
    if (!newInstName) return;
    const inst = createInstitution(newInstName, newInstType, newInstCountry);
    if (inst) {
      setIsCreateDialogOpen(false);
      setNewInstName('');
    }
  };

  const handleInvite = () => {
    if (!inviteEmail) return;
    const invite = inviteMember(inviteEmail, inviteRole);
    if (invite) {
      setIsInviteDialogOpen(false);
      setInviteEmail('');
    }
  };

  const handleCreateCohort = () => {
    if (!cohortName) return;
    const cohort = createCohort(cohortName, cohortYear);
    if (cohort) {
      setIsCohortDialogOpen(false);
      setCohortName('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion Multi-Institutions</h2>
          <p className="text-muted-foreground">
            {currentInstitution 
              ? `${currentInstitution.name} - ${roleLabels[myRole || 'guest']}`
              : 'Créez ou rejoignez une institution'}
          </p>
        </div>
        <div className="flex gap-2">
          {myInstitutions.length > 1 && (
            <Select value={currentInstitution?.id} onValueChange={switchInstitution}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Changer d'institution" />
              </SelectTrigger>
              <SelectContent>
                {myInstitutions.map(inst => (
                  <SelectItem key={inst.id} value={inst.id}>
                    {inst.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Institution
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une Institution</DialogTitle>
                <DialogDescription>
                  Configurez votre espace institutionnel
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nom de l'institution</Label>
                  <Input
                    value={newInstName}
                    onChange={e => setNewInstName(e.target.value)}
                    placeholder="Faculté de Médecine Paris"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={newInstType} onValueChange={(v: InstitutionType) => setNewInstType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(institutionTypeLabels).map(([type, label]) => (
                        <SelectItem key={type} value={type}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Pays</Label>
                  <Input
                    value={newInstCountry}
                    onChange={e => setNewInstCountry(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreateInstitution} disabled={!newInstName} className="w-full">
                  Créer l'institution
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!currentInstitution ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune institution</h3>
            <p className="text-muted-foreground mb-4">
              Créez une institution pour gérer vos étudiants et professeurs
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer ma première institution
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    <Users className="h-4 w-4 inline mr-2" />
                    Membres
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_members}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    <GraduationCap className="h-4 w-4 inline mr-2" />
                    Cohortes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.cohorts_count}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    <BarChart3 className="h-4 w-4 inline mr-2" />
                    Score moyen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.average_score}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Heures d'étude
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_study_hours}h</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Tabs */}
          <Tabs defaultValue="members" className="space-y-4">
            <TabsList>
              <TabsTrigger value="members">
                <Users className="h-4 w-4 mr-2" />
                Membres
              </TabsTrigger>
              <TabsTrigger value="cohorts">
                <GraduationCap className="h-4 w-4 mr-2" />
                Cohortes
              </TabsTrigger>
              <TabsTrigger value="invites">
                <Mail className="h-4 w-4 mr-2" />
                Invitations
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </TabsTrigger>
            </TabsList>

            {/* Members Tab */}
            <TabsContent value="members">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Membres de l'institution</CardTitle>
                      <CardDescription>
                        Gérez les rôles et permissions
                      </CardDescription>
                    </div>
                    {hasPermission('invite_members') && (
                      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Inviter
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Inviter un membre</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Email</Label>
                              <Input
                                type="email"
                                value={inviteEmail}
                                onChange={e => setInviteEmail(e.target.value)}
                                placeholder="email@exemple.com"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Rôle</Label>
                              <Select value={inviteRole} onValueChange={(v: MemberRole) => setInviteRole(v)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {(['admin', 'professor', 'student', 'guest'] as MemberRole[]).map(role => (
                                    <SelectItem key={role} value={role}>
                                      <div className="flex items-center gap-2">
                                        {roleIcons[role]}
                                        {roleLabels[role]}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button onClick={handleInvite} disabled={!inviteEmail} className="w-full">
                              Envoyer l'invitation
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {members.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {member.user_email?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.user_email || 'Utilisateur'}</p>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                {roleIcons[member.role]}
                                {roleLabels[member.role]}
                              </div>
                            </div>
                          </div>
                          {hasPermission('assign_roles') && member.role !== 'owner' && (
                            <Select
                              value={member.role}
                              onValueChange={(v: MemberRole) => changeMemberRole(member.id, v)}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {(['admin', 'professor', 'student', 'guest'] as MemberRole[]).map(role => (
                                  <SelectItem key={role} value={role}>{roleLabels[role]}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cohorts Tab */}
            <TabsContent value="cohorts">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Cohortes</CardTitle>
                      <CardDescription>
                        Organisez les étudiants par promotion
                      </CardDescription>
                    </div>
                    {hasPermission('manage_cohorts') && (
                      <Dialog open={isCohortDialogOpen} onOpenChange={setIsCohortDialogOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Nouvelle cohorte
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Créer une cohorte</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Nom</Label>
                              <Input
                                value={cohortName}
                                onChange={e => setCohortName(e.target.value)}
                                placeholder="DFASM1 2024"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Année académique</Label>
                              <Input
                                value={cohortYear}
                                onChange={e => setCohortYear(e.target.value)}
                                placeholder="2024-2025"
                              />
                            </div>
                            <Button onClick={handleCreateCohort} disabled={!cohortName} className="w-full">
                              Créer la cohorte
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {cohorts.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Aucune cohorte. Créez-en une pour organiser vos étudiants.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cohorts.map(cohort => (
                        <Card key={cohort.id}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">{cohort.name}</CardTitle>
                            <CardDescription>{cohort.academic_year}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                {cohort.members_count || 0} étudiants
                              </span>
                              <Badge variant={cohort.is_active ? 'default' : 'secondary'}>
                                {cohort.is_active ? 'Active' : 'Archivée'}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Invites Tab */}
            <TabsContent value="invites">
              <Card>
                <CardHeader>
                  <CardTitle>Invitations en attente</CardTitle>
                  <CardDescription>
                    Suivez les invitations envoyées
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {invites.filter(i => i.institution_id === currentInstitution?.id).length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Aucune invitation en attente
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {invites
                        .filter(i => i.institution_id === currentInstitution?.id)
                        .map(invite => (
                          <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{invite.email}</p>
                              <p className="text-sm text-muted-foreground">
                                {roleLabels[invite.role]} • Expire le {format(new Date(invite.expires_at), 'PPP', { locale: fr })}
                              </p>
                            </div>
                            <Badge variant={invite.status === 'pending' ? 'outline' : 'default'}>
                              {invite.status === 'pending' ? 'En attente' : 
                               invite.status === 'accepted' ? 'Acceptée' : 'Expirée'}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres de l'institution</CardTitle>
                  <CardDescription>
                    Configurez les modules et fonctionnalités
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Fonctionnalités</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Génération musicale</p>
                          <p className="text-sm text-muted-foreground">Permettre aux membres de générer des chansons</p>
                        </div>
                        <Switch
                          checked={currentInstitution.settings.allow_music_generation}
                          onCheckedChange={(checked) => updateInstitutionSettings({ allow_music_generation: checked })}
                          disabled={!hasPermission('manage_settings')}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Chat IA</p>
                          <p className="text-sm text-muted-foreground">Accès au tuteur IA médical</p>
                        </div>
                        <Switch
                          checked={currentInstitution.settings.allow_ai_chat}
                          onCheckedChange={(checked) => updateInstitutionSettings({ allow_ai_chat: checked })}
                          disabled={!hasPermission('manage_settings')}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Communauté</p>
                          <p className="text-sm text-muted-foreground">Accès au forum et échanges</p>
                        </div>
                        <Switch
                          checked={currentInstitution.settings.allow_community}
                          onCheckedChange={(checked) => updateInstitutionSettings({ allow_community: checked })}
                          disabled={!hasPermission('manage_settings')}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Notifications</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Notifications admin</p>
                          <p className="text-sm text-muted-foreground">Alertes pour les administrateurs</p>
                        </div>
                        <Switch
                          checked={currentInstitution.settings.admin_notifications}
                          onCheckedChange={(checked) => updateInstitutionSettings({ admin_notifications: checked })}
                          disabled={!hasPermission('manage_settings')}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Rapports hebdomadaires</p>
                          <p className="text-sm text-muted-foreground">Envoi automatique de rapports</p>
                        </div>
                        <Switch
                          checked={currentInstitution.settings.weekly_reports}
                          onCheckedChange={(checked) => updateInstitutionSettings({ weekly_reports: checked })}
                          disabled={!hasPermission('manage_settings')}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Permissions Display */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Vos permissions</h4>
                    <div className="flex flex-wrap gap-2">
                      {permissions.map(permission => (
                        <Badge key={permission} variant="outline">
                          {permission.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

export default InstitutionDashboard;
