// Static translation dictionary for TranslatedText component
// Maps French source strings → { en, de } translations
// Used by translate() in LanguageContext for instant, no-API translations

export const TRANSLATIONS_DICT: Record<string, Record<string, string>> = {
  // ===== Navigation / Common =====
  "Accueil": { en: "Home", de: "Startseite" },
  "Retour": { en: "Back", de: "Zurück" },
  "Retour aux items EDN": { en: "Back to EDN items", de: "Zurück zu EDN-Elementen" },
  "Connexion": { en: "Login", de: "Anmelden" },
  "Connexion requise": { en: "Login required", de: "Anmeldung erforderlich" },
  "Déconnexion": { en: "Logout", de: "Abmelden" },
  "Admin": { en: "Admin", de: "Admin" },
  "Tarifs": { en: "Pricing", de: "Preise" },
  "Annuler": { en: "Cancel", de: "Abbrechen" },
  "Confirmer": { en: "Confirm", de: "Bestätigen" },
  "Sauvegarder": { en: "Save", de: "Speichern" },
  "Supprimer": { en: "Delete", de: "Löschen" },
  "Suppression...": { en: "Deleting...", de: "Wird gelöscht..." },
  "Modifier": { en: "Edit", de: "Bearbeiten" },
  "Ajouter": { en: "Add", de: "Hinzufügen" },
  "Fermer": { en: "Close", de: "Schließen" },
  "Suivant": { en: "Next", de: "Weiter" },
  "Précédent": { en: "Previous", de: "Zurück" },
  "Rechercher": { en: "Search", de: "Suchen" },
  "Filtrer": { en: "Filter", de: "Filtern" },
  "Filtres": { en: "Filters", de: "Filter" },
  "Filtres avancés": { en: "Advanced filters", de: "Erweiterte Filter" },
  "Sélectionner": { en: "Select", de: "Auswählen" },
  "Tout": { en: "All", de: "Alle" },
  "Toutes": { en: "All", de: "Alle" },
  "Oui": { en: "Yes", de: "Ja" },
  "Non": { en: "No", de: "Nein" },
  "Chargement...": { en: "Loading...", de: "Laden..." },
  "Erreur": { en: "Error", de: "Fehler" },
  "Succès": { en: "Success", de: "Erfolg" },
  "Voir": { en: "View", de: "Anzeigen" },
  "Créer": { en: "Create", de: "Erstellen" },
  "Reset": { en: "Reset", de: "Zurücksetzen" },
  "Export": { en: "Export", de: "Export" },
  "Exporter": { en: "Export", de: "Exportieren" },
  "Partager": { en: "Share", de: "Teilen" },
  "Partager...": { en: "Share...", de: "Teilen..." },
  "Effacer": { en: "Clear", de: "Löschen" },
  "Copier": { en: "Copy", de: "Kopieren" },
  "Crédits": { en: "Credits", de: "Guthaben" },
  "Confidentialité": { en: "Privacy", de: "Datenschutz" },

  // ===== Generator =====
  "Générateur Musical": { en: "Music Generator", de: "Musik-Generator" },
  "Générateur Musical IA": { en: "AI Music Generator", de: "KI-Musik-Generator" },
  "Transformez vos cours en musique": { en: "Transform your courses into music", de: "Verwandeln Sie Ihre Kurse in Musik" },
  "Configuration": { en: "Configuration", de: "Konfiguration" },
  "Type, item et style musical": { en: "Type, item and musical style", de: "Typ, Element und Musikstil" },
  "Style musical": { en: "Musical style", de: "Musikstil" },
  "Item EDN": { en: "EDN Item", de: "EDN-Element" },
  "Rang": { en: "Rank", de: "Rang" },
  "Sélectionnez le niveau": { en: "Select the level", de: "Wählen Sie die Stufe" },
  "Générer": { en: "Generate", de: "Generieren" },
  "Générer la musique": { en: "Generate music", de: "Musik generieren" },
  "Génération...": { en: "Generating...", de: "Wird generiert..." },
  "Génération en cours...": { en: "Generating...", de: "Wird generiert..." },
  "Génération Musicale IA": { en: "AI Music Generation", de: "KI-Musikgenerierung" },
  "Génération Musicale": { en: "Music Generation", de: "Musikgenerierung" },
  "Comment utiliser le générateur ?": { en: "How to use the generator?", de: "Wie benutzt man den Generator?" },
  "Comment ça marche ?": { en: "How does it work?", de: "Wie funktioniert es?" },
  "Prêt à commencer ?": { en: "Ready to start?", de: "Bereit zum Starten?" },
  "Ne fermez pas cette page": { en: "Do not close this page", de: "Schließen Sie diese Seite nicht" },

  // ===== Lyrics =====
  "Paroles de l'item": { en: "Item lyrics", de: "Element-Liedtexte" },
  "Paroles ECOS": { en: "ECOS Lyrics", de: "ECOS-Liedtexte" },
  "Paroles Synchronisées": { en: "Synchronized Lyrics", de: "Synchronisierte Liedtexte" },
  "Paroles non disponibles": { en: "Lyrics not available", de: "Liedtexte nicht verfügbar" },
  "Paroles musicales en préparation": { en: "Musical lyrics in preparation", de: "Musikalische Texte in Vorbereitung" },
  "Les paroles pour cet item sont en cours de création.": { en: "Lyrics for this item are being created.", de: "Die Liedtexte für dieses Element werden erstellt." },
  "Les paroles synchronisées ne sont pas encore disponibles pour cette chanson": { en: "Synchronized lyrics are not yet available for this song", de: "Synchronisierte Liedtexte sind für dieses Lied noch nicht verfügbar" },
  "Chargement des paroles synchronisées...": { en: "Loading synchronized lyrics...", de: "Synchronisierte Liedtexte werden geladen..." },
  "Copier les paroles": { en: "Copy lyrics", de: "Liedtexte kopieren" },
  "Télécharger (.txt)": { en: "Download (.txt)", de: "Herunterladen (.txt)" },
  "Générer paroles IA": { en: "Generate AI lyrics", de: "KI-Liedtexte generieren" },
  "Générateur de paroles IA": { en: "AI Lyrics Generator", de: "KI-Liedtext-Generator" },
  "Décrivez le thème et laissez Suno créer les paroles": { en: "Describe the theme and let Suno create the lyrics", de: "Beschreiben Sie das Thema und lassen Sie Suno die Texte erstellen" },
  "Thème / Description": { en: "Theme / Description", de: "Thema / Beschreibung" },
  "Soyez précis sur le contenu médical à inclure": { en: "Be specific about the medical content to include", de: "Seien Sie genau über den medizinischen Inhalt" },
  "Lecture audio": { en: "Audio playback", de: "Audiowiedergabe" },
  "Éditeur de paroles synchronisées": { en: "Synchronized lyrics editor", de: "Synchronisierter Liedtext-Editor" },
  "+ Timestamp": { en: "+ Timestamp", de: "+ Zeitstempel" },
  "Format: [MM:SS.XX] Texte de la ligne": { en: "Format: [MM:SS.XX] Line text", de: "Format: [MM:SS.XX] Zeilentext" },
  "Exemple: [01:23.45] Première ligne des paroles": { en: "Example: [01:23.45] First line of lyrics", de: "Beispiel: [01:23.45] Erste Zeile der Liedtexte" },

  // ===== EDN Items =====
  "Tableau Rang A": { en: "Rank A Table", de: "Rang A Tabelle" },
  "Tableau Rang B": { en: "Rank B Table", de: "Rang B Tabelle" },
  "Tableau Rang A en cours de développement": { en: "Rank A table under development", de: "Rang A Tabelle in Entwicklung" },
  "Scène Immersive": { en: "Immersive Scene", de: "Immersive Szene" },
  "Scène immersive en cours de développement": { en: "Immersive scene under development", de: "Immersive Szene in Entwicklung" },
  "Bande Dessinée": { en: "Comic Strip", de: "Comic" },
  "Quiz Final": { en: "Final Quiz", de: "Abschlussquiz" },
  "Quiz en cours de développement": { en: "Quiz under development", de: "Quiz in Entwicklung" },
  "Mode Immersif": { en: "Immersive Mode", de: "Immersiver Modus" },
  "Voir ma bibliothèque musicale": { en: "View my music library", de: "Meine Musikbibliothek anzeigen" },
  "Ma Bibliothèque Musicale": { en: "My Music Library", de: "Meine Musikbibliothek" },
  "Ma Bibliothèque": { en: "My Library", de: "Meine Bibliothek" },

  // ===== Music Library =====
  "Créer votre première chanson": { en: "Create your first song", de: "Erstellen Sie Ihr erstes Lied" },
  "Voir les Tarifs": { en: "View Pricing", de: "Preise anzeigen" },

  // ===== Advanced Options =====
  "Options avancées Suno V4.5+": { en: "Suno V4.5+ Advanced Options", de: "Suno V4.5+ Erweiterte Optionen" },
  "Paramètres avancés Suno": { en: "Suno Advanced Parameters", de: "Suno Erweiterte Parameter" },
  "Genre vocal": { en: "Vocal genre", de: "Gesangsgenre" },
  "Tags à éviter": { en: "Tags to avoid", de: "Zu vermeidende Tags" },
  "Intensité du style": { en: "Style intensity", de: "Stilintensität" },
  "Originalité / Créativité": { en: "Originality / Creativity", de: "Originalität / Kreativität" },
  "Poids audio référence": { en: "Reference audio weight", de: "Referenz-Audio-Gewicht" },
  "Réinitialiser les paramètres": { en: "Reset parameters", de: "Parameter zurücksetzen" },

  // ===== Extend Music =====
  "Étendre": { en: "Extend", de: "Erweitern" },
  "Étendre la musique": { en: "Extend the music", de: "Musik erweitern" },
  "Générer une version plus longue de": { en: "Generate a longer version of", de: "Eine längere Version generieren von" },
  "Continuer à partir de": { en: "Continue from", de: "Fortfahren ab" },
  "La musique continuera à partir de ce point": { en: "The music will continue from this point", de: "Die Musik wird ab diesem Punkt fortgesetzt" },
  "Instructions (optionnel)": { en: "Instructions (optional)", de: "Anweisungen (optional)" },
  "Laissez vide pour continuer dans le même style": { en: "Leave empty to continue in the same style", de: "Leer lassen, um im gleichen Stil fortzufahren" },
  "L'extension ajoutera environ 2-4 minutes de musique. La génération prend généralement 2-3 minutes.": { en: "The extension will add about 2-4 minutes of music. Generation typically takes 2-3 minutes.", de: "Die Erweiterung fügt ca. 2-4 Minuten Musik hinzu. Die Generierung dauert in der Regel 2-3 Minuten." },
  "Extension...": { en: "Extending...", de: "Wird erweitert..." },

  // ===== Share Music =====
  "Partager cette musique": { en: "Share this music", de: "Diese Musik teilen" },

  // ===== Generation History =====
  "Historique": { en: "History", de: "Verlauf" },
  "Connectez-vous pour voir votre historique de générations": { en: "Log in to see your generation history", de: "Melden Sie sich an, um Ihren Generierungsverlauf zu sehen" },
  "Aucune génération récente. Créez votre première musique !": { en: "No recent generations. Create your first music!", de: "Keine aktuellen Generierungen. Erstellen Sie Ihre erste Musik!" },

  // ===== Chat =====
  "Chat Intelligent": { en: "Smart Chat", de: "Intelligenter Chat" },
  "Assistant IA médical avancé": { en: "Advanced medical AI assistant", de: "Fortschrittlicher medizinischer KI-Assistent" },
  "Conversation avec l'IA": { en: "Conversation with AI", de: "Gespräch mit der KI" },
  "Appuyez sur Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne": { en: "Press Enter to send, Shift+Enter for a new line", de: "Enter zum Senden, Shift+Enter für eine neue Zeile" },

  // ===== Language Transposition =====
  "Transposer dans une autre langue": { en: "Transpose to another language", de: "In eine andere Sprache transponieren" },
  "Vous pouvez transposer vos musiques générées dans d'autres langues tout en gardant la même mélodie et le même style musical.": { en: "You can transpose your generated music to other languages while keeping the same melody and musical style.", de: "Sie können Ihre generierten Musikstücke in andere Sprachen transponieren und dabei die gleiche Melodie und den gleichen Musikstil beibehalten." },
  "Choisir la langue cible": { en: "Choose target language", de: "Zielsprache wählen" },
  "Transposition Rang A...": { en: "Transposing Rank A...", de: "Rang A wird transponiert..." },
  "Transposer Rang A": { en: "Transpose Rank A", de: "Rang A transponieren" },
  "Transposition Rang B...": { en: "Transposing Rank B...", de: "Rang B wird transponiert..." },
  "Transposer Rang B": { en: "Transpose Rank B", de: "Rang B transponieren" },

  // ===== Playlists =====
  // "Rechercher" already defined above

  // ===== Home Page =====
  "Transformez vos contenus EDN en chansons personnalisées avec l'intelligence artificielle. Apprenez en musique et créez votre bibliothèque médicale unique.": { en: "Transform your EDN content into personalized songs with artificial intelligence. Learn through music and create your unique medical library.", de: "Verwandeln Sie Ihre EDN-Inhalte mit künstlicher Intelligenz in personalisierte Lieder. Lernen Sie durch Musik und erstellen Sie Ihre einzigartige medizinische Bibliothek." },

  // ===== Batch Actions =====
  "Sélection": { en: "Selection", de: "Auswahl" },

  // ===== Confirm Delete =====
  "Confirmer la suppression": { en: "Confirm deletion", de: "Löschung bestätigen" },

  // ===== Rang Selector labels =====
  "Rang A": { en: "Rank A", de: "Rang A" },
  "Rang B": { en: "Rank B", de: "Rang B" },
  "Rang A+B": { en: "Rank A+B", de: "Rang A+B" },
  "Fondamental": { en: "Fundamental", de: "Grundlegend" },
  "Approfondi": { en: "Advanced", de: "Vertieft" },
  "Complet": { en: "Complete", de: "Vollständig" },
  "Compétences fondamentales": { en: "Fundamental competencies", de: "Grundlegende Kompetenzen" },
  "Compétences approfondies": { en: "Advanced competencies", de: "Vertiefte Kompetenzen" },
  "Compétences complètes": { en: "Complete competencies", de: "Vollständige Kompetenzen" },

  // ===== Content Type =====
  "Type de contenu": { en: "Content type", de: "Inhaltstyp" },
  "EDN": { en: "EDN", de: "EDN" },
  "ECOS": { en: "ECOS", de: "ECOS" },

  // ===== Misc Generator =====
  "Aperçu": { en: "Preview", de: "Vorschau" },
  "Ajouter à la bibliothèque": { en: "Add to library", de: "Zur Bibliothek hinzufügen" },
  "Chanson ajoutée à votre bibliothèque !": { en: "Song added to your library!", de: "Lied zu Ihrer Bibliothek hinzugefügt!" },
  "Génération musicale réussie avec les paroles de l'item !": { en: "Musical generation successful with item lyrics!", de: "Musikgenerierung mit Element-Liedtexten erfolgreich!" },
  "Erreur lors de la génération musicale": { en: "Error during musical generation", de: "Fehler bei der Musikgenerierung" },

  // ===== Pricing =====
  "Gratuit": { en: "Free", de: "Kostenlos" },
  "Premium": { en: "Premium", de: "Premium" },
  "Professionnel": { en: "Professional", de: "Professionell" },
  "Mois": { en: "Month", de: "Monat" },
  "An": { en: "Year", de: "Jahr" },
  "Choisir ce plan": { en: "Choose this plan", de: "Diesen Plan wählen" },
  "Plan actuel": { en: "Current plan", de: "Aktueller Plan" },

  // ===== Auth =====
  "Se connecter": { en: "Log in", de: "Anmelden" },
  "S'inscrire": { en: "Sign up", de: "Registrieren" },
  "Email": { en: "Email", de: "E-Mail" },
  "Mot de passe": { en: "Password", de: "Passwort" },
  "Mot de passe oublié ?": { en: "Forgot password?", de: "Passwort vergessen?" },

  // ===== Home CTA / Sections =====
  "Découvrir MED-MNG": { en: "Discover MED-MNG", de: "MED-MNG entdecken" },
  "Générer Maintenant": { en: "Generate Now", de: "Jetzt generieren" },
  "Accéder aux Items": { en: "Access Items", de: "Elemente aufrufen" },
  "Commencer ECOS": { en: "Start ECOS", de: "ECOS starten" },
  "Démarrer Chat": { en: "Start Chat", de: "Chat starten" },
  "Plateforme Premium": { en: "Premium Platform", de: "Premium-Plattform" },
  "Accès Rapide aux Outils": { en: "Quick Access to Tools", de: "Schnellzugriff auf Werkzeuge" },
  "Choisissez votre méthode d'apprentissage et commencez immédiatement": { en: "Choose your learning method and start immediately", de: "Wählen Sie Ihre Lernmethode und starten Sie sofort" },
  "Pourquoi Choisir MED MNG ?": { en: "Why Choose MED MNG?", de: "Warum MED MNG wählen?" },
  "Une plateforme complète pour l'apprentissage médical moderne": { en: "A complete platform for modern medical learning", de: "Eine vollständige Plattform für modernes medizinisches Lernen" },
  "IA Avancée": { en: "Advanced AI", de: "Fortschrittliche KI" },
  "Ciblé EDN": { en: "EDN Targeted", de: "EDN-Ausgerichtet" },
  "Qualité": { en: "Quality", de: "Qualität" },
  "Efficace": { en: "Effective", de: "Effektiv" },
  "L'apprentissage médical réinventé avec l'intelligence artificielle": { en: "Medical learning reinvented with artificial intelligence", de: "Medizinisches Lernen neu erfunden mit künstlicher Intelligenz" },

  // ===== ECOS =====
  "Simulations ECOS": { en: "ECOS Simulations", de: "ECOS-Simulationen" },
  "Examens Cliniques Objectifs Structurés": { en: "Objective Structured Clinical Examinations", de: "Objektive Strukturierte Klinische Prüfungen" },

  // ===== EDN Features =====
  "Items EDN Complets": { en: "Complete EDN Items", de: "Vollständige EDN-Elemente" },
  "Items de Connaissance": { en: "Knowledge Items", de: "Wissenselemente" },

  // ===== Music Library Loading =====
  "Chargement de votre bibliothèque musicale...": { en: "Loading your music library...", de: "Ihre Musikbibliothek wird geladen..." },

  // ===== Generator Features / Steps =====
  "Sélection rapide d'items": { en: "Quick item selection", de: "Schnelle Elementauswahl" },
  "Styles musicaux variés": { en: "Varied musical styles", de: "Vielfältige Musikstile" },
  "Génération IA instantanée": { en: "Instant AI generation", de: "Sofortige KI-Generierung" },

  // ===== Chat Features =====
  "Chat en temps réel": { en: "Real-time chat", de: "Echtzeit-Chat" },
  "Base de connaissances médicales": { en: "Medical knowledge base", de: "Medizinische Wissensbasis" },
  "Réponses instantanées": { en: "Instant responses", de: "Sofortige Antworten" },

  // ===== Additional common strings =====
  "Télécharger": { en: "Download", de: "Herunterladen" },
  "Envoyer": { en: "Send", de: "Senden" },
  "Actualiser": { en: "Refresh", de: "Aktualisieren" },
  "Détails": { en: "Details", de: "Details" },
  "Description": { en: "Description", de: "Beschreibung" },
  "Titre": { en: "Title", de: "Titel" },
  "Durée": { en: "Duration", de: "Dauer" },
  "Date": { en: "Date", de: "Datum" },
  "Statut": { en: "Status", de: "Status" },
  "Actif": { en: "Active", de: "Aktiv" },
  "Inactif": { en: "Inactive", de: "Inaktiv" },
  "Terminé": { en: "Completed", de: "Abgeschlossen" },
  "En cours": { en: "In progress", de: "In Bearbeitung" },
  "En attente": { en: "Pending", de: "Ausstehend" },
  "Résultat": { en: "Result", de: "Ergebnis" },
  "Score": { en: "Score", de: "Punktzahl" },
  "Note": { en: "Note", de: "Notiz" },
  "Commentaire": { en: "Comment", de: "Kommentar" },
  "Options": { en: "Options", de: "Optionen" },
  "Paramètres": { en: "Settings", de: "Einstellungen" },
  "Profil": { en: "Profile", de: "Profil" },
  "Aide": { en: "Help", de: "Hilfe" },
  "À propos": { en: "About", de: "Über" },
  "Contact": { en: "Contact", de: "Kontakt" },
  "Mentions légales": { en: "Legal notices", de: "Impressum" },
  "Conditions d'utilisation": { en: "Terms of use", de: "Nutzungsbedingungen" },
  "Politique de confidentialité": { en: "Privacy policy", de: "Datenschutzrichtlinie" },

  // ===== Music Player =====
  "Lecture": { en: "Play", de: "Abspielen" },
  "Pause": { en: "Pause", de: "Pause" },
  "Arrêter": { en: "Stop", de: "Stoppen" },
  "Volume": { en: "Volume", de: "Lautstärke" },
  "Muet": { en: "Mute", de: "Stumm" },
  "Répéter": { en: "Repeat", de: "Wiederholen" },
  "Aléatoire": { en: "Shuffle", de: "Zufällig" },

  // ===== Additional UI strings =====
  "Aucun résultat": { en: "No results", de: "Keine Ergebnisse" },
  "Aucune donnée disponible": { en: "No data available", de: "Keine Daten verfügbar" },
  "Veuillez patienter...": { en: "Please wait...", de: "Bitte warten..." },
  "Opération réussie": { en: "Operation successful", de: "Vorgang erfolgreich" },
  "Une erreur est survenue": { en: "An error occurred", de: "Ein Fehler ist aufgetreten" },
  "Réessayer": { en: "Retry", de: "Erneut versuchen" },
  "Fonctionnalité à venir": { en: "Feature coming soon", de: "Funktion kommt bald" },
  "Bientôt disponible": { en: "Coming soon", de: "Bald verfügbar" },
  "Nouveau": { en: "New", de: "Neu" },
  "Populaire": { en: "Popular", de: "Beliebt" },
  "Recommandé": { en: "Recommended", de: "Empfohlen" },
  "Favoris": { en: "Favorites", de: "Favoriten" },
  "Récent": { en: "Recent", de: "Kürzlich" },
  "Récents": { en: "Recent", de: "Kürzlich" },
  "Bibliothèque": { en: "Library", de: "Bibliothek" },
  "Playlist": { en: "Playlist", de: "Playlist" },
  "Playlists": { en: "Playlists", de: "Playlists" },
  "Chansons": { en: "Songs", de: "Lieder" },
  "Chanson": { en: "Song", de: "Lied" },
  "Album": { en: "Album", de: "Album" },
  "Artiste": { en: "Artist", de: "Künstler" },
  "Genre": { en: "Genre", de: "Genre" },

  // ===== Descriptions =====
  "Génération musicale intelligente pour un apprentissage optimal": { en: "Intelligent music generation for optimal learning", de: "Intelligente Musikgenerierung für optimales Lernen" },
  "Contenu adapté aux référentiels médicaux officiels IC-1 à IC-367": { en: "Content adapted to official medical standards IC-1 to IC-367", de: "Inhalte angepasst an offizielle medizinische Standards IC-1 bis IC-367" },
  "Méthode pédagogique innovante et éprouvée": { en: "Innovative and proven pedagogical method", de: "Innovative und bewährte pädagogische Methode" },
  "Amélioration mesurable des performances d'apprentissage": { en: "Measurable improvement in learning performance", de: "Messbare Verbesserung der Lernleistung" },
  "Génération rapide de musique éducative personnalisée avec intelligence artificielle": { en: "Quick generation of personalized educational music with artificial intelligence", de: "Schnelle Generierung personalisierter Bildungsmusik mit künstlicher Intelligenz" },
  "Assistant intelligent connecté à vos cours médicaux": { en: "Intelligent assistant connected to your medical courses", de: "Intelligenter Assistent, verbunden mit Ihren medizinischen Kursen" },
  "Items de Connaissance complets pour l'apprentissage médical structuré - 367 items avec compétences OIC intégrées": { en: "Complete Knowledge Items for structured medical learning - 367 items with integrated OIC competencies", de: "Vollständige Wissenselemente für strukturiertes medizinisches Lernen - 367 Elemente mit integrierten OIC-Kompetenzen" },
  "Examens Cliniques Objectifs Structurés pour la pratique clinique - 3 situations disponibles": { en: "Objective Structured Clinical Examinations for clinical practice - 3 situations available", de: "Objektive strukturierte klinische Prüfungen für die klinische Praxis - 3 Situationen verfügbar" },

  // ===== EDN Features details =====
  "367 items complets (IC-1 à IC-367)": { en: "367 complete items (IC-1 to IC-367)", de: "367 vollständige Elemente (IC-1 bis IC-367)" },
  "4,872 compétences OIC intégrées": { en: "4,872 integrated OIC competencies", de: "4.872 integrierte OIC-Kompetenzen" },
  "Tableaux Rang A et B, 50 QCM par item": { en: "Rank A and B tables, 50 MCQ per item", de: "Rang A und B Tabellen, 50 MCQ pro Element" },
  "3 scénarios cliniques complets": { en: "3 complete clinical scenarios", de: "3 vollständige klinische Szenarien" },
  "Évaluation par compétences": { en: "Competency-based evaluation", de: "Kompetenzbasierte Bewertung" },
  "Feedback détaillé": { en: "Detailed feedback", de: "Detailliertes Feedback" },

  // ===== Additional page strings =====
  "Tableau de bord": { en: "Dashboard", de: "Dashboard" },
  "Bienvenue": { en: "Welcome", de: "Willkommen" },
  "Bonjour": { en: "Hello", de: "Hallo" },
  "Commencer": { en: "Start", de: "Starten" },
  "Continuer": { en: "Continue", de: "Fortfahren" },
  "Terminer": { en: "Finish", de: "Beenden" },
  "Résumé": { en: "Summary", de: "Zusammenfassung" },
  "Statistiques": { en: "Statistics", de: "Statistiken" },
  "Progression": { en: "Progress", de: "Fortschritt" },
  "Compétences": { en: "Competencies", de: "Kompetenzen" },
  "Objectifs": { en: "Objectives", de: "Ziele" },
  "Révision": { en: "Review", de: "Wiederholung" },
  "Exercice": { en: "Exercise", de: "Übung" },
  "Examen": { en: "Exam", de: "Prüfung" },
  "Question": { en: "Question", de: "Frage" },
  "Réponse": { en: "Answer", de: "Antwort" },
  "Correct": { en: "Correct", de: "Richtig" },
  "Incorrect": { en: "Incorrect", de: "Falsch" },
  "Valider": { en: "Validate", de: "Bestätigen" },
  "Soumettre": { en: "Submit", de: "Einreichen" },
};
