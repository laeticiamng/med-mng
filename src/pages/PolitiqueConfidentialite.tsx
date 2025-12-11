import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Shield, Eye, Lock, UserCheck, Database, Globe, Clock, Mail, Info, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { useActivityTracking } from '@/hooks/useActivityTracking';

const PolitiqueConfidentialite = () => {
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    logActivity({ activity_type: 'study', metadata: { action: 'view_politique_confidentialite' } });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-success/5 via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link to={ROUTE_PATHS.home} className="flex items-center space-x-2 text-primary hover:text-primary/80">
              <ArrowLeft className="h-4 w-4" />
              <span>Retour à l'accueil</span>
            </Link>
            <div className="h-6 border-l border-border" />
            <h1 className="text-3xl font-bold text-foreground">Politique de Confidentialité</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* En-tête avec logo */}
          <Card className="p-6 bg-gradient-to-r from-success to-primary text-primary-foreground">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Shield className="h-8 w-8" />
                <h2 className="text-2xl font-bold">MED MNG - Politique de Confidentialité</h2>
              </div>
              <p className="text-primary-foreground/80">https://medmng.com</p>
              <p className="text-sm text-primary-foreground/70">Version officielle – Conformité RGPD</p>
            </div>
          </Card>

          {/* 1. Finalité */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Eye className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">1. FINALITÉ DE LA PRÉSENTE POLITIQUE</h3>
            </div>
            <div className="text-muted-foreground">
              <p>La présente politique de confidentialité a pour but d'informer les utilisateurs de la plateforme MED MNG sur la nature des données personnelles collectées, leur traitement, leur protection, et les droits des utilisateurs conformément au <strong>Règlement Général sur la Protection des Données (RGPD – UE 2016/679)</strong>.</p>
            </div>
          </Card>

          {/* 2. Responsable du traitement */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <UserCheck className="h-5 w-5 text-success" />
              <h3 className="text-xl font-semibold text-foreground">2. RESPONSABLE DU TRAITEMENT</h3>
            </div>
            <div className="text-muted-foreground">
              <p>Le traitement des données personnelles est effectué par :</p>
              <div className="bg-success/10 p-4 rounded-lg mt-3 space-y-2">
                <p><strong>EMOTIONSCARE</strong>, SASU au capital de 100 €</p>
                <p>Siège social : <strong>5 rue Caudron, 80000 Amiens, France</strong></p>
                <div className="flex items-center space-x-4 pt-2">
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4 text-success" />
                    <span>medmng@emotionscare.com</span>
                  </div>
                  <span className="text-muted-foreground">ou</span>
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4 text-success" />
                    <span>contact@emotionscare.com</span>
                  </div>
                </div>
                <p className="pt-2"><strong>Représentée par :</strong> Laëticia Motongane, Présidente et responsable de la publication</p>
              </div>
            </div>
          </Card>

          {/* 3. Données collectées */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Database className="h-5 w-5 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">3. DONNÉES COLLECTÉES</h3>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-accent/10 p-4 rounded-lg">
                  <h4 className="font-semibold text-accent mb-3">📌 Données collectées automatiquement :</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Adresse IP (à des fins de sécurité)</li>
                    <li>• Données de navigation anonymisées (cookies strictement nécessaires)</li>
                    <li>• Temps de connexion, pages visitées</li>
                  </ul>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h4 className="font-semibold text-primary mb-3">📌 Données fournies volontairement :</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Adresse email (création de compte)</li>
                    <li>• Nom ou pseudonyme (optionnel)</li>
                    <li>• Préférences pédagogiques (Rang A/B, styles musicaux)</li>
                    <li>• Progression pédagogique (historique des chansons, QCM)</li>
                  </ul>
                </div>
              </div>
              <Alert className="bg-warning/10 border-l-4 border-warning">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <AlertDescription>
                  <p className="font-medium text-warning">⚠️ DONNÉES RELATIVES À LA SANTÉ (Article 9 RGPD)</p>
                  <p className="text-sm text-warning/80 mt-2">
                    Vos progressions pédagogiques médicales (EDN, Rang A/B) sont considérées comme des 
                    <strong> données relatives à la santé</strong> car elles concernent votre formation médicale.
                    Votre consentement explicite est requis lors de l'inscription (Article 9.2.a RGPD).
                  </p>
                </AlertDescription>
              </Alert>
            </div>
          </Card>

          {/* 4. Finalité du traitement */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="h-5 w-5 text-warning" />
              <h3 className="text-xl font-semibold text-foreground">4. FINALITÉ DU TRAITEMENT</h3>
            </div>
            <div className="text-muted-foreground">
              <p className="mb-3">Les données sont collectées uniquement dans les buts suivants :</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-warning/10 p-3 rounded text-sm">• Fournir une expérience utilisateur personnalisée</div>
                <div className="bg-warning/10 p-3 rounded text-sm">• Suivre la progression pédagogique</div>
                <div className="bg-warning/10 p-3 rounded text-sm">• Générer du contenu adapté (chansons MNG)</div>
                <div className="bg-warning/10 p-3 rounded text-sm">• Améliorer les services (analyse anonyme)</div>
                <div className="bg-warning/10 p-3 rounded text-sm">• Communiquer les mises à jour</div>
                <div className="bg-warning/10 p-3 rounded text-sm">• Newsletter (si inscrite)</div>
              </div>
            </div>
          </Card>

          {/* 5. Base légale */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Lock className="h-5 w-5 text-destructive" />
              <h3 className="text-xl font-semibold text-foreground">5. BASE LÉGALE</h3>
            </div>
            <div className="text-muted-foreground">
              <p className="mb-3">Le traitement est fondé sur :</p>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                  <span>L'exécution du contrat utilisateur (accès à la plateforme MED MNG)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                  <span>L'intérêt légitime de l'éditeur (amélioration continue du service)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                  <span>Le consentement libre, éclairé et spécifique (informations marketing - opt-in)</span>
                </li>
              </ul>
            </div>
          </Card>

          {/* 6. Durée de conservation */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="h-5 w-5 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">6. DURÉE DE CONSERVATION</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-accent/10 p-4 rounded-lg text-center">
                  <p className="font-semibold text-accent">Données de compte</p>
                  <p className="text-sm mt-1">Durée d'utilisation + 3 ans</p>
                </div>
                <div className="bg-accent/10 p-4 rounded-lg text-center">
                  <p className="font-semibold text-accent">Données de navigation</p>
                  <p className="text-sm mt-1">12 mois maximum</p>
                </div>
                <div className="bg-accent/10 p-4 rounded-lg text-center">
                  <p className="font-semibold text-accent">Données pédagogiques</p>
                  <p className="text-sm mt-1">5 ans (puis anonymisées)</p>
                </div>
              </div>
              <p className="text-sm text-accent text-center">Sauf demande explicite de suppression immédiate</p>
            </div>
          </Card>

          {/* 7. Sécurité des données */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-success" />
              <h3 className="text-xl font-semibold text-foreground">7. SÉCURITÉ DES DONNÉES</h3>
            </div>
            <div className="text-muted-foreground">
              <div className="bg-success/10 p-4 rounded-lg space-y-2">
                <p>• <strong>Hébergement :</strong> Serveurs sécurisés via Supabase</p>
                <p>• <strong>Chiffrement :</strong> En transit et au repos</p>
                <p>• <strong>Sauvegardes :</strong> Automatisées et sécurisées</p>
                <p>• <strong>Accès :</strong> Restreint aux seules personnes habilitées</p>
                <p className="text-success font-medium">• <strong>Aucun prestataire tiers</strong> n'a accès aux données</p>
              </div>
            </div>
          </Card>

          {/* 8. Sous-traitants et transferts internationaux */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="h-5 w-5 text-warning" />
              <h3 className="text-xl font-semibold text-foreground">8. SOUS-TRAITANTS ET TRANSFERTS INTERNATIONAUX</h3>
            </div>
            <div className="text-muted-foreground space-y-4">
              <Alert className="bg-primary/10 border-primary/20">
                <Info className="h-4 w-4 text-primary" />
                <AlertDescription>
                  <p className="font-semibold text-primary mb-2">Sous-traitants techniques (RGPD Article 28)</p>
                  <ul className="text-sm space-y-1">
                    <li>• <strong>Supabase (États-Unis)</strong> - Hébergement données</li>
                    <li>• <strong>OpenAI (États-Unis)</strong> - Génération contenus pédagogiques IA</li>
                    <li>• <strong>Suno AI (États-Unis)</strong> - Génération musiques mnémotechniques</li>
                    <li>• <strong>ElevenLabs (États-Unis)</strong> - Synthèse vocale</li>
                    <li>• <strong>Stripe (États-Unis)</strong> - Traitement paiements</li>
                  </ul>
                  <p className="text-sm mt-2 text-primary/80">
                    Tous nos sous-traitants ont signé des <strong>Data Processing Agreements (DPA)</strong> conformes au RGPD.
                  </p>
                </AlertDescription>
              </Alert>

              <Alert className="bg-warning/10 border-warning/20">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <AlertDescription>
                  <p className="font-semibold text-warning mb-2">⚠️ Transferts internationaux vers les États-Unis</p>
                  <p className="text-sm text-warning/80">
                    Vos données peuvent être transférées aux États-Unis dans le cadre de la génération de contenus IA 
                    (OpenAI, Suno AI, ElevenLabs). Ces transferts sont protégés par:
                  </p>
                  <ul className="text-sm space-y-1 mt-2 ml-4">
                    <li>✅ <strong>Clauses Contractuelles Types UE</strong> (Standard Contractual Clauses)</li>
                    <li>✅ <strong>Data Privacy Framework UE-USA</strong> (certification des fournisseurs)</li>
                    <li>✅ <strong>Chiffrement de bout en bout</strong> en transit</li>
                    <li>✅ <strong>Minimisation des données</strong> transmises (uniquement nécessaires)</li>
                  </ul>
                  <p className="text-sm mt-2 text-warning font-medium">
                    Votre consentement explicite pour ces transferts est collecté lors de l'inscription 
                    (conformément aux Articles 44-49 du RGPD).
                  </p>
                </AlertDescription>
              </Alert>

              <div className="bg-success/10 p-4 rounded-lg border-l-4 border-success">
                <p className="font-semibold text-success mb-2">✅ Aucune vente de données</p>
                <p className="text-sm text-success/80">
                  Vos données personnelles ne sont <strong>jamais vendues, louées ou partagées</strong> avec des tiers 
                  à des fins marketing. Seuls les sous-traitants techniques listés ci-dessus y ont accès, 
                  uniquement pour fournir le service MED MNG.
                </p>
              </div>
            </div>
          </Card>

          {/* 9. Droits des utilisateurs */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <UserCheck className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">9. DROITS DES UTILISATEURS</h3>
            </div>
            <div className="text-muted-foreground">
              <p className="mb-4">Conformément au RGPD, vous disposez des droits suivants :</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-primary/10 p-3 rounded text-center text-sm">Droit d'accès</div>
                <div className="bg-primary/10 p-3 rounded text-center text-sm">Droit de rectification</div>
                <div className="bg-primary/10 p-3 rounded text-center text-sm">Droit à l'effacement</div>
                <div className="bg-primary/10 p-3 rounded text-center text-sm">Droit à la limitation</div>
                <div className="bg-primary/10 p-3 rounded text-center text-sm">Droit à la portabilité</div>
                <div className="bg-primary/10 p-3 rounded text-center text-sm">Droit d'opposition</div>
                <div className="bg-primary/10 p-3 rounded text-center text-sm">Retrait du consentement</div>
                <div className="bg-primary/10 p-3 rounded text-center text-sm">Droit à l'oubli</div>
              </div>
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="font-semibold text-primary">Pour exercer vos droits :</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>medmng@emotionscare.com</span>
                  </div>
                  <span className="text-muted-foreground">ou</span>
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>contact@emotionscare.com</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 10. Cookies */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Database className="h-5 w-5 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">10. COOKIES</h3>
            </div>
            <div className="text-muted-foreground">
              <div className="bg-accent/10 p-4 rounded-lg">
                <p><strong>Seuls des cookies strictement nécessaires</strong> au bon fonctionnement de la plateforme sont utilisés :</p>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Authentification</li>
                  <li>• Session utilisateur</li>
                  <li>• Préférences</li>
                </ul>
                <p className="mt-3 text-accent font-medium">Aucun cookie de publicité ou de tracking externe.</p>
              </div>
            </div>
          </Card>

          {/* 11. Mise à jour */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-xl font-semibold text-foreground">11. MISE À JOUR DE LA POLITIQUE</h3>
            </div>
            <div className="text-muted-foreground">
              <p>Cette politique peut être mise à jour à tout moment. La date de la dernière mise à jour sera indiquée en haut de page.</p>
            </div>
          </Card>

          {/* Retour */}
          <div className="text-center pt-6">
            <Link to={ROUTE_PATHS.home}>
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

export default PolitiqueConfidentialite;
