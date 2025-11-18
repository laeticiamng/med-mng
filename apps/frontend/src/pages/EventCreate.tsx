import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

/**
 * EventCreate - Redirection temporaire vers EventsCalendar
 * TODO: Implémenter le formulaire de création d'événement complet
 */
export default function EventCreate() {
  const navigate = useNavigate();

  useEffect(() => {
    // Rediriger vers le calendrier des événements avec un message
    toast.info('Fonctionnalité en développement', {
      description: "La création d'événements sera bientôt disponible. Consultez les événements existants."
    });
    navigate('/events', { replace: true });
  }, [navigate]);

  return (
    <>
      <Helmet><title>Créer un Événement | Med-Mng</title></Helmet>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Redirection...</p>
      </div>
    </>
  );
}
