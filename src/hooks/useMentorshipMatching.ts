import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MentorProfile {
  id: string;
  userId: string;
  name: string;
  specialty: string;
  experience: 'student' | 'resident' | 'doctor' | 'professor';
  expertise: string[];
  availability: string;
  bio: string;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
}

export interface MentorshipRequest {
  id: string;
  mentorId: string;
  menteeId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  message: string;
  topic: string;
  createdAt: string;
}

export function useMentorshipMatching() {
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadMentors = useCallback(async (filters?: {
    specialty?: string;
    experience?: string;
    expertise?: string[];
  }) => {
    setLoading(true);
    try {
      // Charger les mentors depuis la table mentor_profiles (non typée)
      let query = (supabase as any)
        .from('mentor_profiles')
        .select('*')
        .eq('is_available', true);

      if (filters?.specialty) {
        query = query.ilike('specialty', `%${filters.specialty}%`);
      }
      if (filters?.experience) {
        query = query.eq('experience', filters.experience);
      }

      const { data: mentorsData, error } = await query;

      if (error || !mentorsData) {
        // Table n'existe pas, retourner liste vide
        setMentors([]);
        return;
      }

      const mappedMentors: MentorProfile[] = mentorsData.map((m: any) => ({
        id: m.id,
        userId: m.user_id,
        name: m.name,
        specialty: m.specialty,
        experience: m.experience,
        expertise: m.expertise || [],
        availability: m.availability,
        bio: m.bio,
        rating: m.rating || 0,
        reviewCount: m.review_count || 0,
        isAvailable: m.is_available,
      }));

      setMentors(mappedMentors);
    } catch (error) {
      console.error('Error loading mentors:', error);
      setMentors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const requestMentorship = useCallback(async (mentorId: string, message: string, topic: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Connexion requise",
          description: "Connectez-vous pour demander un mentorat",
          variant: "destructive"
        });
        return false;
      }

      const newRequest: MentorshipRequest = {
        id: crypto.randomUUID(),
        mentorId,
        menteeId: user.id,
        status: 'pending',
        message,
        topic,
        createdAt: new Date().toISOString(),
      };

      setRequests(prev => [...prev, newRequest]);

      toast({
        title: "Demande envoyée",
        description: "Le mentor sera notifié de votre demande",
      });

      return true;
    } catch (error) {
      console.error('Error requesting mentorship:', error);
      return false;
    }
  }, [toast]);

  const loadMyRequests = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Would fetch from database, for now return local state
      return requests.filter(r => r.menteeId === user.id);
    } catch (error) {
      console.error('Error loading requests:', error);
      return [];
    }
  }, [requests]);

  const acceptRequest = useCallback(async (requestId: string) => {
    setRequests(prev => prev.map(r => 
      r.id === requestId ? { ...r, status: 'accepted' as const } : r
    ));
    toast({
      title: "Demande acceptée",
      description: "Vous pouvez maintenant communiquer avec le mentee",
    });
    return true;
  }, [toast]);

  const rejectRequest = useCallback(async (requestId: string) => {
    setRequests(prev => prev.map(r => 
      r.id === requestId ? { ...r, status: 'rejected' as const } : r
    ));
    return true;
  }, []);

  const getMatchScore = useCallback((mentor: MentorProfile, userNeeds: string[]): number => {
    let score = 0;
    
    // Expertise match
    const expertiseMatch = mentor.expertise.filter(e => userNeeds.includes(e)).length;
    score += expertiseMatch * 20;
    
    // Rating bonus
    score += mentor.rating * 10;
    
    // Availability bonus
    if (mentor.isAvailable) score += 15;
    
    return Math.min(100, score);
  }, []);

  return {
    mentors,
    requests,
    loading,
    loadMentors,
    requestMentorship,
    loadMyRequests,
    acceptRequest,
    rejectRequest,
    getMatchScore,
  };
}
