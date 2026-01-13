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
      // For now, generate sample mentors since table may not exist
      const sampleMentors: MentorProfile[] = [
        {
          id: '1',
          userId: 'user-1',
          name: 'Dr. Marie Dupont',
          specialty: 'Cardiologie',
          experience: 'doctor',
          expertise: ['IC-78', 'IC-79', 'IC-80'],
          availability: 'Disponible les soirs',
          bio: 'Cardiologue avec 10 ans d\'expérience, passionnée par la transmission du savoir.',
          rating: 4.8,
          reviewCount: 24,
          isAvailable: true,
        },
        {
          id: '2',
          userId: 'user-2',
          name: 'Prof. Jean Martin',
          specialty: 'Neurologie',
          experience: 'professor',
          expertise: ['IC-87', 'IC-88', 'IC-89'],
          availability: 'Weekends uniquement',
          bio: 'Professeur agrégé de neurologie, auteur de nombreuses publications.',
          rating: 4.9,
          reviewCount: 56,
          isAvailable: true,
        },
        {
          id: '3',
          userId: 'user-3',
          name: 'Dr. Sophie Bernard',
          specialty: 'Pédiatrie',
          experience: 'resident',
          expertise: ['IC-23', 'IC-45'],
          availability: 'Flexible',
          bio: 'Interne en dernière année, je souhaite aider les étudiants en difficulté.',
          rating: 4.6,
          reviewCount: 12,
          isAvailable: true,
        },
      ];

      // Apply filters
      let filtered = sampleMentors;
      if (filters?.specialty) {
        filtered = filtered.filter(m => m.specialty.toLowerCase().includes(filters.specialty!.toLowerCase()));
      }
      if (filters?.experience) {
        filtered = filtered.filter(m => m.experience === filters.experience);
      }

      setMentors(filtered);
    } catch (error) {
      console.error('Error loading mentors:', error);
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
