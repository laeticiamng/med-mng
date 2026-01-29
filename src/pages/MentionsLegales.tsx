import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building, Globe, Shield, Scale, Mail, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { PremiumPageLayout } from '@/components/layout/PremiumPageLayout';

const MentionsLegales = () => {
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    logActivity({ activity_type: 'study', metadata: { action: 'view_mentions_legales' } });
  }, []);

  return (
    <PremiumPageLayout gradient="default" showOrbs={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link to={ROUTE_PATHS.home} className="flex items-center space-x-2 text-primary hover:text-primary/80">
              <ArrowLeft className="h-4 w-4" />
              <span>Retour à l'accueil</span>
            </Link>
            <div className="h-6 border-l border-border" />
            <h1 className="text-3xl font-bold text-foreground">Mentions Légales</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* En-tête avec logo */}
          <Card className="p-6 bg-gradient-to-r from-primary to-accent text-primary-foreground">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Globe className="h-8 w-8" />
                <h2 className="text-2xl font-bold">MED MNG</h2>
              </div>
              <p className="text-primary-foreground/80">https://medmng.com</p>
              <p className="text-sm text-primary-foreground/60">Version officielle – conforme RGPD et droit français</p>
            </div>
          </Card>

          {/* 1. Éditeur du site */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Building className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">1. ÉDITEUR DU SITE</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>Le site medmng.com est édité par la société :</p>
              <div className="bg-primary/10 p-4 rounded-lg space-y-2">
                <p><strong className="text-foreground">EMOTIONSCARE</strong>, SASU au capital de 100 €</p>
                <p>Immatriculée au Registre du Commerce et des Sociétés (RCS) d'Amiens sous le numéro <strong className="text-foreground">981 065 820</strong></p>
                <p>N° SIRET : <strong className="text-foreground">981 065 820 00013</strong></p>
                <p>TVA intracommunautaire : <strong className="text-foreground">FR20981065820</strong></p>
                <p>Siège social : <strong className="text-foreground">5 rue Caudron, 80000 Amiens, France</strong></p>
                <div className="flex items-center space-x-4 pt-2">
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>contact@emotionscare.com</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>medmng@emotionscare.com</span>
                  </div>
                </div>
                <p className="pt-2"><strong className="text-foreground">Responsable de la publication :</strong> Laëticia Motongane (Présidente d'EMOTIONSCARE)</p>
              </div>
            </div>
          </Card>

          {/* 2. Hébergement et technique */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="h-5 w-5 text-success" />
              <h3 className="text-xl font-semibold text-foreground">2. HÉBERGEMENT ET TECHNIQUE</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-success/10 p-4 rounded-lg">
                  <p><strong className="text-foreground">Hébergeur des données :</strong></p>
                  <p>Supabase (serveurs sécurisés et scalables)</p>
                </div>
                <div className="bg-accent/10 p-4 rounded-lg">
                  <p><strong className="text-foreground">Prototypage UX/UI :</strong></p>
                  <p>Réalisé via Lovable.dev</p>
                </div>
                <div className="bg-warning/10 p-4 rounded-lg">
                  <p><strong className="text-foreground">Versionnement & sécurité :</strong></p>
                  <p>GitHub</p>
                </div>
              </div>
              <p className="text-center text-sm text-success font-medium">Données stockées et traitées dans le respect du RGPD.</p>
            </div>
          </Card>

          {/* 3. Objet de la plateforme */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="h-5 w-5 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">3. OBJET DE LA PLATEFORME</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>MED MNG est une plateforme immersive dédiée à l'apprentissage médical via la méthode exclusive <strong className="text-foreground">MNG – Music Neuro Learning Generator</strong>, développée par Laëticia Motongane.</p>
              <p>Elle combine des contenus musicaux, visuels et interactifs pour renforcer l'apprentissage cognitif dans les parcours de formation médicale post-bac (EDN, ECOS).</p>
            </div>
          </Card>

          {/* 4. Contenu pédagogique */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">4. CONTENU PÉDAGOGIQUE DISPONIBLE</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Parcours EDN */}
              <div className="bg-primary/10 p-6 rounded-lg">
                <h4 className="font-semibold text-primary mb-3 text-lg">🎓 Parcours EDN :</h4>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• Sélection de l'item selon la base nationale LISA</li>
                  <li>• Choix du niveau (📒 Rang A ou 📘 Rang B)</li>
                  <li>• Choix du style musical (trap, lofi, jazz, afrobeat, etc.)</li>
                  <li>• Génération automatique d'une chanson pédagogique (format MNG)</li>
                  <li>• Tableaux récapitulatifs conformes aux attendus EDN</li>
                  <li>• Bande dessinée (mémorisation visuelle)</li>
                  <li>• QCM, QRU et QROC d'entraînement</li>
                </ul>
              </div>

              {/* Parcours ECOS */}
              <div className="bg-success/10 p-6 rounded-lg">
                <h4 className="font-semibold text-success mb-3 text-lg">🩺 Parcours ECOS :</h4>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• Fiches cliniques spécifiques à chaque situation de départ (SD)</li>
                  <li>• Une chanson MNG dédiée par SD (sans distinction A/B)</li>
                  <li>• Simulation clinique immersive, orientée prise de décision</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* 5. Propriété intellectuelle */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-warning" />
              <h3 className="text-xl font-semibold text-foreground">5. PROPRIÉTÉ INTELLECTUELLE</h3>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>Tous les contenus du site MED MNG sont protégés au titre de la propriété intellectuelle :</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-warning/10 p-3 rounded text-center text-sm">Chansons générées</div>
                <div className="bg-warning/10 p-3 rounded text-center text-sm">Visuels, tableaux, BD</div>
                <div className="bg-warning/10 p-3 rounded text-center text-sm">Fiches pédagogiques</div>
                <div className="bg-warning/10 p-3 rounded text-center text-sm">Noms, concepts, logos</div>
              </div>
              <div className="bg-warning/20 p-4 rounded-lg border-l-4 border-warning">
                <p className="font-semibold text-foreground">La méthode MNG – Music Neuro Learning Generator est protégée par dépôt de brevet en cours auprès de l'INPI.</p>
                <p className="text-sm mt-2">Le suffixe "MNG" désigne tout format pédagogique utilisant la génération musicale pour la mémorisation cognitive, dans tous les domaines de formation post-bac diplômante.</p>
              </div>
              <p className="text-destructive font-medium">Tout usage, reproduction ou adaptation sans autorisation expresse est interdit.</p>
              <p>La créatrice Laëticia Motongane reste l'unique titulaire des droits d'auteur.</p>
            </div>
          </Card>

          {/* 6. Données personnelles */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-success" />
              <h3 className="text-xl font-semibold text-foreground">6. DONNÉES PERSONNELLES</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p className="font-medium text-success">Traitement conforme au RGPD.</p>
              <p>Les seules données collectées sont nécessaires à la bonne expérience utilisateur :</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-success/10 p-3 rounded text-center">Adresse email</div>
                <div className="bg-success/10 p-3 rounded text-center">Historique d'apprentissage</div>
                <div className="bg-success/10 p-3 rounded text-center">Préférences musicales et pédagogiques</div>
              </div>
              <p className="text-success font-medium">Aucune revente ou partage des données à des tiers.</p>
              <p className="text-sm">Politique de confidentialité complète disponible [sur demande ou lien externe].</p>
            </div>
          </Card>

          {/* 7. Médiateur de la consommation */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Scale className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">7. MÉDIATEUR DE LA CONSOMMATION</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>Conformément à l'article L.612-1 du Code de la consommation, en cas de litige vous pouvez recourir à un médiateur :</p>
              <div className="bg-primary/10 p-4 rounded-lg">
                <p><strong className="text-foreground">Médiateur :</strong> Plateforme européenne de règlement des litiges en ligne</p>
                <p className="text-sm mt-2">🔗 <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener" className="text-primary hover:underline">https://ec.europa.eu/consumers/odr</a></p>
                <p className="text-sm mt-2">📧 Email : mediation@emotionscare.com</p>
              </div>
            </div>
          </Card>

          {/* 8. Juridiction compétente */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Scale className="h-5 w-5 text-destructive" />
              <h3 className="text-xl font-semibold text-foreground">8. JURIDICTION COMPÉTENTE</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>Les présentes mentions sont régies par le droit français.</p>
              <p>En cas de litige, les tribunaux compétents sont ceux du ressort de la <strong className="text-foreground">Cour d'Appel d'Amiens</strong>.</p>
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
    </PremiumPageLayout>
  );
};

export default MentionsLegales;