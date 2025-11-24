import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import logger from '@/lib/logger';

// Types pour l'internationalisation
export type Language = 'fr' | 'en' | 'es' | 'de' | 'it';

export interface TranslationData {
  // Navigation
  navigation: {
    home: string;
    dashboard: string;
    library: string;
    profile: string;
    settings: string;
    admin: string;
    logout: string;
  };
  
  // Common UI
  common: {
    loading: string;
    error: string;
    success: string;
    warning: string;
    cancel: string;
    confirm: string;
    save: string;
    delete: string;
    edit: string;
    view: string;
    search: string;
    filter: string;
    sort: string;
    actions: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    retry: string;
  };
  
  // Medical Content
  medical: {
    item: string;
    items: string;
    course: string;
    courses: string;
    quiz: string;
    score: string;
    competence: string;
    competences: string;
    objective: string;
    objectives: string;
    module: string;
    modules: string;
    progress: string;
    revision: string;
    studying: string;
    completed: string;
    inProgress: string;
    notStarted: string;
  };
  
  // Music & Audio
  music: {
    play: string;
    pause: string;
    stop: string;
    volume: string;
    mute: string;
    unmute: string;
    playlist: string;
    song: string;
    lyrics: string;
    generate: string;
    generating: string;
    library: string;
    favorite: string;
    share: string;
    download: string;
  };
  
  // Errors
  errors: {
    general: string;
    network: string;
    server: string;
    authentication: string;
    authorization: string;
    validation: string;
    fileUpload: string;
    audioGeneration: string;
    loadingContent: string;
  };
  
  // Success Messages
  success: {
    saved: string;
    updated: string;
    deleted: string;
    uploaded: string;
    shared: string;
    completed: string;
    generated: string;
  };
  
  // Performance & Accessibility
  performance: {
    loading: string;
    optimizing: string;
    highContrast: string;
    reducedMotion: string;
    fontSize: string;
    screenReader: string;
  };
}

const translations: Record<Language, TranslationData> = {
  fr: {
    navigation: {
      home: 'Accueil',
      dashboard: 'Tableau de bord',
      library: 'Bibliothèque',
      profile: 'Profil',
      settings: 'Paramètres',
      admin: 'Administration',
      logout: 'Déconnexion',
    },
    common: {
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      warning: 'Attention',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      save: 'Sauvegarder',
      delete: 'Supprimer',
      edit: 'Modifier',
      view: 'Voir',
      search: 'Rechercher',
      filter: 'Filtrer',
      sort: 'Trier',
      actions: 'Actions',
      close: 'Fermer',
      back: 'Retour',
      next: 'Suivant',
      previous: 'Précédent',
      retry: 'Réessayer',
    },
    medical: {
      item: 'Item',
      items: 'Items',
      course: 'Cours',
      courses: 'Cours',
      quiz: 'Quiz',
      score: 'Score',
      competence: 'Compétence',
      competences: 'Compétences',
      objective: 'Objectif',
      objectives: 'Objectifs',
      module: 'Module',
      modules: 'Modules',
      progress: 'Progression',
      revision: 'Révision',
      studying: 'En cours d\'étude',
      completed: 'Terminé',
      inProgress: 'En cours',
      notStarted: 'Non commencé',
    },
    music: {
      play: 'Lecture',
      pause: 'Pause',
      stop: 'Arrêt',
      volume: 'Volume',
      mute: 'Couper le son',
      unmute: 'Activer le son',
      playlist: 'Liste de lecture',
      song: 'Chanson',
      lyrics: 'Paroles',
      generate: 'Générer',
      generating: 'Génération en cours...',
      library: 'Bibliothèque musicale',
      favorite: 'Favori',
      share: 'Partager',
      download: 'Télécharger',
    },
    errors: {
      general: 'Une erreur est survenue',
      network: 'Erreur de connexion réseau',
      server: 'Erreur du serveur',
      authentication: 'Erreur d\'authentification',
      authorization: 'Accès non autorisé',
      validation: 'Données invalides',
      fileUpload: 'Erreur lors du téléchargement du fichier',
      audioGeneration: 'Erreur lors de la génération audio',
      loadingContent: 'Erreur lors du chargement du contenu',
    },
    success: {
      saved: 'Sauvegardé avec succès',
      updated: 'Mis à jour avec succès',
      deleted: 'Supprimé avec succès',
      uploaded: 'Téléchargé avec succès',
      shared: 'Partagé avec succès',
      completed: 'Terminé avec succès',
      generated: 'Généré avec succès',
    },
    performance: {
      loading: 'Chargement en cours...',
      optimizing: 'Optimisation en cours...',
      highContrast: 'Contraste élevé',
      reducedMotion: 'Mouvement réduit',
      fontSize: 'Taille de police',
      screenReader: 'Lecteur d\'écran',
    },
  },
  en: {
    navigation: {
      home: 'Home',
      dashboard: 'Dashboard',
      library: 'Library',
      profile: 'Profile',
      settings: 'Settings',
      admin: 'Administration',
      logout: 'Logout',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      actions: 'Actions',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      retry: 'Retry',
    },
    medical: {
      item: 'Item',
      items: 'Items',
      course: 'Course',
      courses: 'Courses',
      quiz: 'Quiz',
      score: 'Score',
      competence: 'Competence',
      competences: 'Competences',
      objective: 'Objective',
      objectives: 'Objectives',
      module: 'Module',
      modules: 'Modules',
      progress: 'Progress',
      revision: 'Revision',
      studying: 'Studying',
      completed: 'Completed',
      inProgress: 'In Progress',
      notStarted: 'Not Started',
    },
    music: {
      play: 'Play',
      pause: 'Pause',
      stop: 'Stop',
      volume: 'Volume',
      mute: 'Mute',
      unmute: 'Unmute',
      playlist: 'Playlist',
      song: 'Song',
      lyrics: 'Lyrics',
      generate: 'Generate',
      generating: 'Generating...',
      library: 'Music Library',
      favorite: 'Favorite',
      share: 'Share',
      download: 'Download',
    },
    errors: {
      general: 'An error occurred',
      network: 'Network connection error',
      server: 'Server error',
      authentication: 'Authentication error',
      authorization: 'Unauthorized access',
      validation: 'Invalid data',
      fileUpload: 'File upload error',
      audioGeneration: 'Audio generation error',
      loadingContent: 'Content loading error',
    },
    success: {
      saved: 'Successfully saved',
      updated: 'Successfully updated',
      deleted: 'Successfully deleted',
      uploaded: 'Successfully uploaded',
      shared: 'Successfully shared',
      completed: 'Successfully completed',
      generated: 'Successfully generated',
    },
    performance: {
      loading: 'Loading...',
      optimizing: 'Optimizing...',
      highContrast: 'High Contrast',
      reducedMotion: 'Reduced Motion',
      fontSize: 'Font Size',
      screenReader: 'Screen Reader',
    },
  },
  es: {
    navigation: {
      home: 'Inicio',
      dashboard: 'Panel',
      library: 'Biblioteca',
      profile: 'Perfil',
      settings: 'Configuración',
      admin: 'Administración',
      logout: 'Cerrar sesión',
    },
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      warning: 'Advertencia',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      view: 'Ver',
      search: 'Buscar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      actions: 'Acciones',
      close: 'Cerrar',
      back: 'Volver',
      next: 'Siguiente',
      previous: 'Anterior',
      retry: 'Reintentar',
    },
    medical: {
      item: 'Elemento',
      items: 'Elementos',
      course: 'Curso',
      courses: 'Cursos',
      quiz: 'Examen',
      score: 'Puntuación',
      competence: 'Competencia',
      competences: 'Competencias',
      objective: 'Objetivo',
      objectives: 'Objetivos',
      module: 'Módulo',
      modules: 'Módulos',
      progress: 'Progreso',
      revision: 'Revisión',
      studying: 'Estudiando',
      completed: 'Completado',
      inProgress: 'En progreso',
      notStarted: 'No iniciado',
    },
    music: {
      play: 'Reproducir',
      pause: 'Pausar',
      stop: 'Detener',
      volume: 'Volumen',
      mute: 'Silenciar',
      unmute: 'Activar sonido',
      playlist: 'Lista de reproducción',
      song: 'Canción',
      lyrics: 'Letras',
      generate: 'Generar',
      generating: 'Generando...',
      library: 'Biblioteca musical',
      favorite: 'Favorito',
      share: 'Compartir',
      download: 'Descargar',
    },
    errors: {
      general: 'Ocurrió un error',
      network: 'Error de conexión de red',
      server: 'Error del servidor',
      authentication: 'Error de autenticación',
      authorization: 'Acceso no autorizado',
      validation: 'Datos inválidos',
      fileUpload: 'Error al subir archivo',
      audioGeneration: 'Error en generación de audio',
      loadingContent: 'Error al cargar contenido',
    },
    success: {
      saved: 'Guardado exitosamente',
      updated: 'Actualizado exitosamente',
      deleted: 'Eliminado exitosamente',
      uploaded: 'Subido exitosamente',
      shared: 'Compartido exitosamente',
      completed: 'Completado exitosamente',
      generated: 'Generado exitosamente',
    },
    performance: {
      loading: 'Cargando...',
      optimizing: 'Optimizando...',
      highContrast: 'Alto contraste',
      reducedMotion: 'Movimiento reducido',
      fontSize: 'Tamaño de fuente',
      screenReader: 'Lector de pantalla',
    },
  },
  de: {
    navigation: {
      home: 'Startseite',
      dashboard: 'Dashboard',
      library: 'Bibliothek',
      profile: 'Profil',
      settings: 'Einstellungen',
      admin: 'Verwaltung',
      logout: 'Abmelden',
    },
    common: {
      loading: 'Lädt...',
      error: 'Fehler',
      success: 'Erfolg',
      warning: 'Warnung',
      cancel: 'Abbrechen',
      confirm: 'Bestätigen',
      save: 'Speichern',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      view: 'Anzeigen',
      search: 'Suchen',
      filter: 'Filtern',
      sort: 'Sortieren',
      actions: 'Aktionen',
      close: 'Schließen',
      back: 'Zurück',
      next: 'Weiter',
      previous: 'Vorherige',
      retry: 'Wiederholen',
    },
    medical: {
      item: 'Element',
      items: 'Elemente',
      course: 'Kurs',
      courses: 'Kurse',
      quiz: 'Quiz',
      score: 'Punktzahl',
      competence: 'Kompetenz',
      competences: 'Kompetenzen',
      objective: 'Ziel',
      objectives: 'Ziele',
      module: 'Modul',
      modules: 'Module',
      progress: 'Fortschritt',
      revision: 'Überarbeitung',
      studying: 'Studieren',
      completed: 'Abgeschlossen',
      inProgress: 'In Bearbeitung',
      notStarted: 'Nicht begonnen',
    },
    music: {
      play: 'Abspielen',
      pause: 'Pausieren',
      stop: 'Stoppen',
      volume: 'Lautstärke',
      mute: 'Stumm',
      unmute: 'Ton einschalten',
      playlist: 'Wiedergabeliste',
      song: 'Lied',
      lyrics: 'Liedtext',
      generate: 'Generieren',
      generating: 'Generiert...',
      library: 'Musikbibliothek',
      favorite: 'Favorit',
      share: 'Teilen',
      download: 'Herunterladen',
    },
    errors: {
      general: 'Ein Fehler ist aufgetreten',
      network: 'Netzwerkverbindungsfehler',
      server: 'Serverfehler',
      authentication: 'Authentifizierungsfehler',
      authorization: 'Unbefugter Zugriff',
      validation: 'Ungültige Daten',
      fileUpload: 'Datei-Upload-Fehler',
      audioGeneration: 'Audio-Generierungsfehler',
      loadingContent: 'Fehler beim Laden des Inhalts',
    },
    success: {
      saved: 'Erfolgreich gespeichert',
      updated: 'Erfolgreich aktualisiert',
      deleted: 'Erfolgreich gelöscht',
      uploaded: 'Erfolgreich hochgeladen',
      shared: 'Erfolgreich geteilt',
      completed: 'Erfolgreich abgeschlossen',
      generated: 'Erfolgreich generiert',
    },
    performance: {
      loading: 'Lädt...',
      optimizing: 'Optimiert...',
      highContrast: 'Hoher Kontrast',
      reducedMotion: 'Reduzierte Bewegung',
      fontSize: 'Schriftgröße',
      screenReader: 'Bildschirmleser',
    },
  },
  it: {
    navigation: {
      home: 'Home',
      dashboard: 'Dashboard',
      library: 'Biblioteca',
      profile: 'Profilo',
      settings: 'Impostazioni',
      admin: 'Amministrazione',
      logout: 'Logout',
    },
    common: {
      loading: 'Caricamento...',
      error: 'Errore',
      success: 'Successo',
      warning: 'Avvertimento',
      cancel: 'Annulla',
      confirm: 'Conferma',
      save: 'Salva',
      delete: 'Elimina',
      edit: 'Modifica',
      view: 'Visualizza',
      search: 'Cerca',
      filter: 'Filtra',
      sort: 'Ordina',
      actions: 'Azioni',
      close: 'Chiudi',
      back: 'Indietro',
      next: 'Avanti',
      previous: 'Precedente',
      retry: 'Riprova',
    },
    medical: {
      item: 'Elemento',
      items: 'Elementi',
      course: 'Corso',
      courses: 'Corsi',
      quiz: 'Quiz',
      score: 'Punteggio',
      competence: 'Competenza',
      competences: 'Competenze',
      objective: 'Obiettivo',
      objectives: 'Obiettivi',
      module: 'Modulo',
      modules: 'Moduli',
      progress: 'Progresso',
      revision: 'Revisione',
      studying: 'Studiando',
      completed: 'Completato',
      inProgress: 'In corso',
      notStarted: 'Non iniziato',
    },
    music: {
      play: 'Riproduci',
      pause: 'Pausa',
      stop: 'Stop',
      volume: 'Volume',
      mute: 'Muto',
      unmute: 'Attiva audio',
      playlist: 'Playlist',
      song: 'Canzone',
      lyrics: 'Testi',
      generate: 'Genera',
      generating: 'Generazione...',
      library: 'Biblioteca musicale',
      favorite: 'Preferito',
      share: 'Condividi',
      download: 'Scarica',
    },
    errors: {
      general: 'Si è verificato un errore',
      network: 'Errore di connessione di rete',
      server: 'Errore del server',
      authentication: 'Errore di autenticazione',
      authorization: 'Accesso non autorizzato',
      validation: 'Dati non validi',
      fileUpload: 'Errore nel caricamento del file',
      audioGeneration: 'Errore nella generazione audio',
      loadingContent: 'Errore nel caricamento del contenuto',
    },
    success: {
      saved: 'Salvato con successo',
      updated: 'Aggiornato con successo',
      deleted: 'Eliminato con successo',
      uploaded: 'Caricato con successo',
      shared: 'Condiviso con successo',
      completed: 'Completato con successo',
      generated: 'Generato con successo',
    },
    performance: {
      loading: 'Caricamento...',
      optimizing: 'Ottimizzazione...',
      highContrast: 'Alto contrasto',
      reducedMotion: 'Movimento ridotto',
      fontSize: 'Dimensione font',
      screenReader: 'Lettore di schermo',
    },
  },
};

interface InternationalizationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  formatNumber: (number: number) => string;
  formatDate: (date: Date) => string;
  formatTime: (date: Date) => string;
  direction: 'ltr' | 'rtl';
  languages: Array<{ code: Language; name: string; nativeName: string }>;
}

const InternationalizationContext = createContext<InternationalizationContextType | undefined>(undefined);

export const useInternationalization = () => {
  const context = useContext(InternationalizationContext);
  if (!context) {
    throw new Error('useInternationalization must be used within InternationalizationProvider');
  }
  return context;
};

// Raccourci pour la traduction
export const useTranslation = () => {
  const { t } = useInternationalization();
  return { t };
};

interface InternationalizationProviderProps {
  children: ReactNode;
}

export const InternationalizationProvider: React.FC<InternationalizationProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Détecter la langue du navigateur
    const browserLanguage = navigator.language.split('-')[0] as Language;
    const savedLanguage = localStorage.getItem('med-mng-language') as Language;
    
    // Vérifier si la langue est supportée
    const supportedLanguages = ['fr', 'en', 'es', 'de', 'it'];
    
    if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
      return savedLanguage;
    }
    
    if (supportedLanguages.includes(browserLanguage)) {
      return browserLanguage;
    }
    
    return 'fr'; // Langue par défaut
  });

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('med-mng-language', newLanguage);
    document.documentElement.lang = newLanguage;
    
    // Mettre à jour la direction du texte si nécessaire
    document.documentElement.dir = 'ltr'; // Toutes nos langues sont LTR pour l'instant
  };

  // Fonction de traduction avec support des clés imbriquées
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        logger.warn(`Translation key not found: ${key} for language: ${language}`);
        return key; // Retourne la clé si la traduction n'existe pas
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  // Formatage des nombres selon la locale
  const formatNumber = (number: number): string => {
    return new Intl.NumberFormat(language === 'en' ? 'en-US' : language).format(number);
  };

  // Formatage des dates selon la locale
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Formatage de l'heure selon la locale
  const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : language, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Liste des langues supportées
  const languages = [
    { code: 'fr' as Language, name: 'French', nativeName: 'Français' },
    { code: 'en' as Language, name: 'English', nativeName: 'English' },
    { code: 'es' as Language, name: 'Spanish', nativeName: 'Español' },
    { code: 'de' as Language, name: 'German', nativeName: 'Deutsch' },
    { code: 'it' as Language, name: 'Italian', nativeName: 'Italiano' },
  ];

  // Mettre à jour la langue du document au montage
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = 'ltr';
  }, [language]);

  const value: InternationalizationContextType = {
    language,
    setLanguage,
    t,
    formatNumber,
    formatDate,
    formatTime,
    direction: 'ltr',
    languages,
  };

  return (
    <InternationalizationContext.Provider value={value}>
      {children}
    </InternationalizationContext.Provider>
  );
};