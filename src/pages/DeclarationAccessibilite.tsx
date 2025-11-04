import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, CheckCircle, XCircle, AlertTriangle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DeclarationAccessibilite = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" />
              <span>Retour à l'accueil</span>
            </Link>
            <div className="h-6 border-l border-border" />
            <h1 className="text-3xl font-bold text-foreground">Déclaration d'Accessibilité</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* En-tête */}
          <Card className="p-6 bg-gradient-to-r from-primary to-accent text-primary-foreground">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Eye className="h-8 w-8" />
                <h2 className="text-2xl font-bold">MED MNG - Accessibilité Numérique</h2>
              </div>
              <p className="text-sm opacity-90">Conformité RGAA 4.1 (Référentiel Général d'Amélioration de l'Accessibilité)</p>
              <p className="text-sm opacity-90">Dernière évaluation : 04 novembre 2025</p>
            </div>
          </Card>

          {/* État de conformité */}
          <Alert className="bg-primary/10">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <AlertDescription>
              <p className="font-semibold text-lg mb-2">📊 État de conformité actuel</p>
              <p className="text-sm">
                MED MNG est <strong>partiellement conforme</strong> avec le RGAA 4.1. 
                Nous nous engageons à atteindre une conformité totale d'ici le <strong>31 mars 2026</strong>.
              </p>
            </AlertDescription>
          </Alert>

          {/* 1. Engagement d'EmotionsCare */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Eye className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">1. NOTRE ENGAGEMENT</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                EmotionsCare s'engage à rendre MED MNG accessible à toutes et tous, conformément à l'article 47 
                de la loi n° 2005-102 du 11 février 2005 et au décret n° 2019-768 du 24 juillet 2019.
              </p>
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="font-semibold text-foreground mb-2">Notre démarche progressive :</p>
                <ul className="text-sm space-y-1">
                  <li>✅ Audit d'accessibilité réalisé le 04/11/2025</li>
                  <li>🔄 Plan d'action pluriannuel en cours (2025-2026)</li>
                  <li>📝 Formation interne de l'équipe technique</li>
                  <li>🎯 Tests utilisateurs avec personnes en situation de handicap prévus Q1 2026</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* 2. Résultats de l'audit */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">2. RÉSULTATS DE L'AUDIT D'ACCESSIBILITÉ</h3>
            </div>
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-card p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-primary">65%</p>
                  <p className="text-sm text-muted-foreground">Critères conformes</p>
                </div>
                <div className="bg-card p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-primary">13</p>
                  <p className="text-sm text-muted-foreground">Pages auditées</p>
                </div>
                <div className="bg-card p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-primary">50/106</p>
                  <p className="text-sm text-muted-foreground">Critères RGAA appliqués</p>
                </div>
              </div>

              <h4 className="font-semibold text-foreground mt-6 mb-3">Pages évaluées :</h4>
              <div className="bg-card p-4 rounded-lg">
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Page d'accueil</li>
                  <li>• Page de connexion et inscription</li>
                  <li>• Générateur de musique pédagogique</li>
                  <li>• Bibliothèque personnelle</li>
                  <li>• Page de tarification</li>
                  <li>• Lecteur audio</li>
                  <li>• Tableaux pédagogiques EDN</li>
                  <li>• Quiz d'entraînement</li>
                  <li>• Profil utilisateur</li>
                  <li>• Mentions légales et CGU</li>
                  <li>• Politique de confidentialité</li>
                  <li>• Déclaration d'accessibilité (cette page)</li>
                  <li>• Page de contact</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* 3. Points conformes */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">3. FONCTIONNALITÉS ACCESSIBLES ✅</h3>
            </div>
            <div className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Navigation au clavier</h4>
                  <p className="text-sm text-muted-foreground">
                    Tous les éléments interactifs sont accessibles via Tab, Entrée et Echap
                  </p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Contrastes respectés</h4>
                  <p className="text-sm text-muted-foreground">
                    Ratio minimum de 4.5:1 pour le texte normal, 3:1 pour le texte large
                  </p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Structure HTML sémantique</h4>
                  <p className="text-sm text-muted-foreground">
                    Utilisation correcte des balises h1-h6, nav, main, article, section
                  </p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Textes alternatifs</h4>
                  <p className="text-sm text-muted-foreground">
                    Images décoratives et informatives correctement étiquetées
                  </p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Formulaires accessibles</h4>
                  <p className="text-sm text-muted-foreground">
                    Champs de saisie avec labels explicites et messages d'erreur clairs
                  </p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Mode sombre / clair</h4>
                  <p className="text-sm text-muted-foreground">
                    Respect des préférences système (prefers-color-scheme)
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* 4. Points non conformes */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <XCircle className="h-5 w-5 text-destructive" />
              <h3 className="text-xl font-semibold text-foreground">4. PROBLÈMES IDENTIFIÉS ⚠️</h3>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                Les non-conformités suivantes ont été identifiées et seront corrigées progressivement :
              </p>
              <div className="space-y-3">
                <div className="bg-destructive/10 p-4 rounded-lg border-l-4 border-destructive">
                  <h4 className="font-semibold text-foreground mb-2">🎵 Lecteur audio</h4>
                  <p className="text-sm text-muted-foreground">
                    Les lecteurs audio générés par Suno AI manquent de contrôles natifs accessibles (vitesse de lecture, 
                    transcription des paroles). <strong>Correctif prévu : Q1 2026</strong>
                  </p>
                </div>
                <div className="bg-destructive/10 p-4 rounded-lg border-l-4 border-destructive">
                  <h4 className="font-semibold text-foreground mb-2">📊 Tableaux complexes</h4>
                  <p className="text-sm text-muted-foreground">
                    Certains tableaux EDN (Rang A/B) ont une structure complexe non optimale pour les lecteurs d'écran. 
                    <strong>Correctif en cours</strong>
                  </p>
                </div>
                <div className="bg-destructive/10 p-4 rounded-lg border-l-4 border-destructive">
                  <h4 className="font-semibold text-foreground mb-2">🖼️ Bandes dessinées IA</h4>
                  <p className="text-sm text-muted-foreground">
                    Les images générées manquent de descriptions textuelles détaillées pour les malvoyants. 
                    <strong>Correctif prévu : Génération automatique de alt-text via OpenAI Vision - Q2 2026</strong>
                  </p>
                </div>
                <div className="bg-destructive/10 p-4 rounded-lg border-l-4 border-destructive">
                  <h4 className="font-semibold text-foreground mb-2">⚡ Animations</h4>
                  <p className="text-sm text-muted-foreground">
                    Certaines animations de chargement ne respectent pas prefers-reduced-motion. 
                    <strong>Correctif en cours - déploiement prévu novembre 2025</strong>
                  </p>
                </div>
                <div className="bg-destructive/10 p-4 rounded-lg border-l-4 border-destructive">
                  <h4 className="font-semibold text-foreground mb-2">📱 Navigation mobile</h4>
                  <p className="text-sm text-muted-foreground">
                    Certaines zones tactiles sont inférieures à 44x44px (norme WCAG 2.1 AA). 
                    <strong>Correctif prévu : décembre 2025</strong>
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* 5. Dérogations */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">5. CONTENUS NON SOUMIS À L'OBLIGATION D'ACCESSIBILITÉ</h3>
            </div>
            <div className="text-muted-foreground">
              <p className="mb-3">Conformément à l'article 3 du décret n° 2019-768, sont exclus :</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong>Contenus audio générés par IA tierce (Suno AI) :</strong> La plateforme Suno AI externe 
                    n'est pas sous notre contrôle technique direct. Nous travaillons à fournir des alternatives 
                    (transcriptions textuelles des paroles).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong>Archives antérieures à septembre 2019 :</strong> Les contenus créés avant cette date 
                    (phase de prototypage) ne sont pas accessibles aux utilisateurs finaux.
                  </span>
                </li>
              </ul>
            </div>
          </Card>

          {/* 6. Technologies utilisées */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Eye className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">6. TECHNOLOGIES UTILISÉES</h3>
            </div>
            <div className="bg-card p-4 rounded-lg">
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• HTML5</li>
                <li>• CSS3 (Tailwind CSS)</li>
                <li>• JavaScript / TypeScript</li>
                <li>• React 18</li>
                <li>• ARIA (Accessible Rich Internet Applications)</li>
                <li>• Supabase (base de données)</li>
              </ul>
            </div>
          </Card>

          {/* 7. Outils de test */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">7. OUTILS ET MÉTHODES D'ÉVALUATION</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>L'audit a été réalisé avec les outils suivants :</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-card p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Outils automatisés :</h4>
                  <ul className="text-sm space-y-1">
                    <li>• axe DevTools (Deque)</li>
                    <li>• WAVE (WebAIM)</li>
                    <li>• Lighthouse (Google)</li>
                    <li>• Pa11y</li>
                  </ul>
                </div>
                <div className="bg-card p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Tests manuels :</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Lecteurs d'écran (NVDA, VoiceOver)</li>
                    <li>• Navigation clavier exclusive</li>
                    <li>• Tests de contraste colorimétrique</li>
                    <li>• Validation HTML W3C</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* 8. Amélioration continue */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">8. PLAN D'ACTION PLURIANNUEL (2025-2026)</h3>
            </div>
            <div className="space-y-3">
              <div className="bg-card p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">📅 Échéancier :</h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>
                    <strong>Q4 2025 (Nov-Déc) :</strong> Correction des animations (prefers-reduced-motion), 
                    agrandissement des zones tactiles mobiles
                  </li>
                  <li>
                    <strong>Q1 2026 (Jan-Mars) :</strong> Amélioration des tableaux EDN, ajout de transcriptions 
                    pour les chansons, tests utilisateurs avec personnes en situation de handicap
                  </li>
                  <li>
                    <strong>Q2 2026 (Avr-Juin) :</strong> Génération automatique de descriptions alt pour les BD IA 
                    via OpenAI Vision, contrôles audio avancés
                  </li>
                  <li>
                    <strong>Q3 2026 (Juil-Sept) :</strong> Audit de conformité complet RGAA 4.1, certification visée
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* 9. Retour d'information et contact */}
          <Card className="p-6 bg-primary/10">
            <div className="flex items-center space-x-2 mb-4">
              <Mail className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">9. SIGNALER UN PROBLÈME D'ACCESSIBILITÉ</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Si vous rencontrez un problème d'accessibilité sur MED MNG (contenu inaccessible, difficulté de navigation, etc.), 
                merci de nous le signaler :
              </p>
              <div className="bg-card p-4 rounded-lg">
                <p className="font-semibold text-foreground mb-2">📧 Contact accessibilité :</p>
                <ul className="text-sm space-y-1">
                  <li>• Email dédié : <strong>accessibilite@emotionscare.com</strong></li>
                  <li>• Email général : medmng@emotionscare.com (objet : "Accessibilité")</li>
                  <li>• Formulaire de contact : <Link to="/contact" className="text-primary hover:underline">Page de contact</Link></li>
                </ul>
                <p className="text-sm mt-3 italic">
                  Nous nous engageons à vous répondre sous <strong>5 jours ouvrés</strong> et à apporter une solution 
                  ou alternative accessible dans un délai raisonnable (généralement sous 1 mois).
                </p>
              </div>
            </div>
          </Card>

          {/* 10. Voies de recours */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h3 className="text-xl font-semibold text-foreground">10. VOIES DE RECOURS</h3>
            </div>
            <div className="text-muted-foreground">
              <p className="mb-3">
                Si vous constatez un défaut d'accessibilité vous empêchant d'accéder à un contenu ou une fonctionnalité, 
                que vous nous le signalez et que vous ne parvenez pas à obtenir une réponse satisfaisante, vous pouvez :
              </p>
              <div className="bg-card p-4 rounded-lg space-y-3">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">📞 Défenseur des droits</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Formulaire de contact : https://formulaire.defenseurdesdroits.fr/</li>
                    <li>• Liste des délégués : https://www.defenseurdesdroits.fr/saisir/delegues</li>
                    <li>• Téléphone : 09 69 39 00 00 (coût d'un appel local)</li>
                    <li>• Adresse postale : Le Défenseur des droits, Libre réponse 71120, 75342 Paris CEDEX 07</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* Date de publication */}
          <Card className="p-4 bg-card text-center">
            <p className="text-sm text-muted-foreground">
              <strong>Déclaration publiée le :</strong> 04 novembre 2025
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              <strong>Dernière révision le :</strong> 04 novembre 2025
            </p>
          </Card>

          {/* Retour */}
          <div className="text-center pt-6">
            <Link to="/">
              <Button className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Retour à l'accueil</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeclarationAccessibilite;
