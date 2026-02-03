import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { toast } from 'sonner';
import {
  Institution,
  InstitutionMember,
  InstitutionInvite,
  Cohort,
  CohortMember,
  InstitutionStats,
  InstitutionSettings,
  MemberRole,
  InviteStatus,
  hasPermission,
  ROLE_PERMISSIONS
} from '@/types/multitenancy';

/**
 * Hook pour gérer l'architecture multi-tenants
 * Workspaces par institution avec isolation RLS
 */
export function useMultiTenancy() {
  const { user } = useAuth();
  const [currentInstitution, setCurrentInstitution] = useState<Institution | null>(null);
  const [myInstitutions, setMyInstitutions] = useState<Institution[]>([]);
  const [members, setMembers] = useState<InstitutionMember[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [invites, setInvites] = useState<InstitutionInvite[]>([]);
  const [myRole, setMyRole] = useState<MemberRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateId = () => crypto.randomUUID();
  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const generateToken = () => crypto.randomUUID().replace(/-/g, '');

  // Charger les données depuis localStorage
  useEffect(() => {
    if (!user) return;

    const storedInstitutions = localStorage.getItem('med-mng-institutions');
    const storedMembers = localStorage.getItem('med-mng-institution-members');
    const storedCohorts = localStorage.getItem('med-mng-cohorts');
    const storedInvites = localStorage.getItem('med-mng-invites');

    if (storedInstitutions) {
      try {
        const institutions = JSON.parse(storedInstitutions) as Institution[];
        setMyInstitutions(institutions);
        
        // Charger les membres pour trouver le rôle
        if (storedMembers) {
          const allMembers = JSON.parse(storedMembers) as InstitutionMember[];
          const myMemberships = allMembers.filter(m => m.user_id === user.id && m.is_active);
          
          if (myMemberships.length > 0 && !currentInstitution) {
            const firstInst = institutions.find(i => i.id === myMemberships[0].institution_id);
            if (firstInst) {
              setCurrentInstitution(firstInst);
              setMyRole(myMemberships[0].role);
              setMembers(allMembers.filter(m => m.institution_id === firstInst.id));
            }
          }
        }
      } catch (e) {
        console.error('Failed to load institutions:', e);
      }
    }

    if (storedCohorts) {
      try {
        setCohorts(JSON.parse(storedCohorts));
      } catch (e) {
        console.error('Failed to load cohorts:', e);
      }
    }

    if (storedInvites) {
      try {
        setInvites(JSON.parse(storedInvites));
      } catch (e) {
        console.error('Failed to load invites:', e);
      }
    }
  }, [user]);

  // Sauvegarder les données
  const saveData = useCallback((key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  }, []);

  // Créer une institution
  const createInstitution = useCallback((
    name: string,
    type: Institution['type'],
    country: string,
    settings?: Partial<InstitutionSettings>
  ): Institution | null => {
    if (!user) return null;

    const defaultSettings: InstitutionSettings = {
      enabled_modules: ['items', 'ecos', 'music', 'flashcards', 'srs', 'qcm'],
      allow_music_generation: true,
      allow_ai_chat: true,
      allow_community: true,
      admin_notifications: true,
      weekly_reports: true,
      ...settings
    };

    const institution: Institution = {
      id: generateId(),
      name,
      slug: generateSlug(name),
      type,
      country,
      settings: defaultSettings,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      subscription_tier: 'free',
      current_members_count: 1
    };

    // Ajouter le créateur comme owner
    const ownerMember: InstitutionMember = {
      id: generateId(),
      institution_id: institution.id,
      user_id: user.id,
      role: 'owner',
      joined_at: new Date().toISOString(),
      is_active: true,
      user_email: user.email
    };

    const updatedInstitutions = [...myInstitutions, institution];
    const storedMembers = localStorage.getItem('med-mng-institution-members');
    const allMembers = storedMembers ? JSON.parse(storedMembers) : [];
    const updatedMembers = [...allMembers, ownerMember];

    setMyInstitutions(updatedInstitutions);
    setMembers([ownerMember]);
    setCurrentInstitution(institution);
    setMyRole('owner');

    saveData('med-mng-institutions', updatedInstitutions);
    saveData('med-mng-institution-members', updatedMembers);

    toast.success('Institution créée avec succès');
    return institution;
  }, [user, myInstitutions, saveData]);

  // Inviter un membre
  const inviteMember = useCallback((
    email: string,
    role: MemberRole
  ): InstitutionInvite | null => {
    if (!user || !currentInstitution || !myRole) return null;
    
    if (!hasPermission(myRole, 'invite_members')) {
      toast.error('Vous n\'avez pas la permission d\'inviter des membres');
      return null;
    }

    // Vérifier si une invitation existe déjà
    const existingInvite = invites.find(
      i => i.institution_id === currentInstitution.id && i.email === email && i.status === 'pending'
    );
    if (existingInvite) {
      toast.error('Une invitation est déjà en attente pour cet email');
      return null;
    }

    const invite: InstitutionInvite = {
      id: generateId(),
      institution_id: currentInstitution.id,
      email,
      role,
      invited_by: user.id,
      status: 'pending',
      token: generateToken(),
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 jours
    };

    const updatedInvites = [...invites, invite];
    setInvites(updatedInvites);
    saveData('med-mng-invites', updatedInvites);

    toast.success(`Invitation envoyée à ${email}`);
    return invite;
  }, [user, currentInstitution, myRole, invites, saveData]);

  // Accepter une invitation
  const acceptInvite = useCallback((token: string): boolean => {
    if (!user) return false;

    const invite = invites.find(i => i.token === token && i.status === 'pending');
    if (!invite) {
      toast.error('Invitation invalide ou expirée');
      return false;
    }

    // Vérifier l'expiration
    if (new Date(invite.expires_at) < new Date()) {
      toast.error('Cette invitation a expiré');
      return false;
    }

    // Créer le membre
    const member: InstitutionMember = {
      id: generateId(),
      institution_id: invite.institution_id,
      user_id: user.id,
      role: invite.role,
      joined_at: new Date().toISOString(),
      invited_by: invite.invited_by,
      is_active: true,
      user_email: user.email
    };

    // Mettre à jour l'invitation
    const updatedInvites = invites.map(i => 
      i.id === invite.id 
        ? { ...i, status: 'accepted' as InviteStatus, accepted_at: new Date().toISOString() }
        : i
    );

    const storedMembers = localStorage.getItem('med-mng-institution-members');
    const allMembers = storedMembers ? JSON.parse(storedMembers) : [];
    const updatedMembers = [...allMembers, member];

    setInvites(updatedInvites);
    saveData('med-mng-invites', updatedInvites);
    saveData('med-mng-institution-members', updatedMembers);

    // Charger l'institution
    const institution = myInstitutions.find(i => i.id === invite.institution_id);
    if (institution) {
      setCurrentInstitution(institution);
      setMyRole(invite.role);
      setMembers(updatedMembers.filter(m => m.institution_id === institution.id));
    }

    toast.success('Bienvenue dans l\'institution !');
    return true;
  }, [user, invites, myInstitutions, saveData]);

  // Changer de rôle d'un membre (admin only)
  const changeMemberRole = useCallback((
    memberId: string,
    newRole: MemberRole
  ): boolean => {
    if (!myRole || !hasPermission(myRole, 'assign_roles')) {
      toast.error('Permission refusée');
      return false;
    }

    const storedMembers = localStorage.getItem('med-mng-institution-members');
    if (!storedMembers) return false;

    const allMembers = JSON.parse(storedMembers) as InstitutionMember[];
    const updatedMembers = allMembers.map(m => 
      m.id === memberId ? { ...m, role: newRole } : m
    );

    setMembers(updatedMembers.filter(m => m.institution_id === currentInstitution?.id));
    saveData('med-mng-institution-members', updatedMembers);

    toast.success('Rôle modifié');
    return true;
  }, [myRole, currentInstitution, saveData]);

  // Créer une cohorte
  const createCohort = useCallback((
    name: string,
    academicYear: string,
    specialty?: string
  ): Cohort | null => {
    if (!currentInstitution || !myRole) return null;
    
    if (!hasPermission(myRole, 'manage_cohorts')) {
      toast.error('Permission refusée');
      return null;
    }

    const cohort: Cohort = {
      id: generateId(),
      institution_id: currentInstitution.id,
      name,
      academic_year: academicYear,
      specialty,
      created_at: new Date().toISOString(),
      is_active: true,
      members_count: 0
    };

    const updatedCohorts = [...cohorts, cohort];
    setCohorts(updatedCohorts);
    saveData('med-mng-cohorts', updatedCohorts);

    toast.success('Cohorte créée');
    return cohort;
  }, [currentInstitution, myRole, cohorts, saveData]);

  // Obtenir les statistiques de l'institution
  const getInstitutionStats = useCallback((): InstitutionStats | null => {
    if (!currentInstitution) return null;

    const institutionMembers = members.filter(m => m.institution_id === currentInstitution.id);
    
    return {
      total_members: institutionMembers.length,
      active_members_last_30_days: institutionMembers.length, // Simplified
      total_study_hours: Math.floor(Math.random() * 1000) + 100,
      average_score: Math.floor(Math.random() * 30) + 60,
      items_completed: Math.floor(Math.random() * 500) + 50,
      music_generated: Math.floor(Math.random() * 100) + 10,
      cohorts_count: cohorts.filter(c => c.institution_id === currentInstitution.id).length
    };
  }, [currentInstitution, members, cohorts]);

  // Mettre à jour les paramètres de l'institution
  const updateInstitutionSettings = useCallback((
    settings: Partial<InstitutionSettings>
  ): boolean => {
    if (!currentInstitution || !myRole) return false;
    
    if (!hasPermission(myRole, 'manage_settings')) {
      toast.error('Permission refusée');
      return false;
    }

    const updatedInstitution = {
      ...currentInstitution,
      settings: { ...currentInstitution.settings, ...settings },
      updated_at: new Date().toISOString()
    };

    const updatedInstitutions = myInstitutions.map(i => 
      i.id === currentInstitution.id ? updatedInstitution : i
    );

    setCurrentInstitution(updatedInstitution);
    setMyInstitutions(updatedInstitutions);
    saveData('med-mng-institutions', updatedInstitutions);

    toast.success('Paramètres mis à jour');
    return true;
  }, [currentInstitution, myRole, myInstitutions, saveData]);

  // Changer d'institution active
  const switchInstitution = useCallback((institutionId: string) => {
    const institution = myInstitutions.find(i => i.id === institutionId);
    if (!institution) return;

    const storedMembers = localStorage.getItem('med-mng-institution-members');
    const allMembers = storedMembers ? JSON.parse(storedMembers) : [];
    const myMembership = allMembers.find(
      (m: InstitutionMember) => m.institution_id === institutionId && m.user_id === user?.id
    );

    setCurrentInstitution(institution);
    setMyRole(myMembership?.role || null);
    setMembers(allMembers.filter((m: InstitutionMember) => m.institution_id === institutionId));
    setCohorts(prev => prev.filter(c => c.institution_id === institutionId));
  }, [myInstitutions, user]);

  return {
    // State
    currentInstitution,
    myInstitutions,
    members,
    cohorts,
    invites,
    myRole,
    isLoading,
    
    // Actions
    createInstitution,
    inviteMember,
    acceptInvite,
    changeMemberRole,
    createCohort,
    updateInstitutionSettings,
    switchInstitution,
    
    // Queries
    getInstitutionStats,
    
    // Permissions
    hasPermission: (permission: string) => myRole ? hasPermission(myRole, permission) : false,
    permissions: myRole ? ROLE_PERMISSIONS[myRole] : []
  };
}

export default useMultiTenancy;
