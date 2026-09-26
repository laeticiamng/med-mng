import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building, Globe, Shield, Scale, Mail, FileText, AlertTriangle } from 'lucide-react';
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
                <p>Siège social : <strong className="text-foreground">Appartement 1, 5 rue Caudron, 80000 Amiens, France</strong></p>
                <p>Immatriculée au Registre du Commerce et des Sociétés (RCS) d'Amiens sous le numéro <strong className="text-foreground">944 505 445</strong> (inscrit le 21/05/2025)</p>
                <p>N° SIRET : <strong className="text-foreground">944 505 445 00014</strong></p>
                <p>TVA intracommunautaire : <strong className="text-foreground">FR89944505445</strong></p>
                <div className="flex items-center space-x-1 pt-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>contact@emotionscare.com</span>
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
                  <p><strong className="text-foreground">Hébergeurs :</strong></p>
                  <p>Hébergement de l'application : Lovable ; base de données : Supabase Inc., région Francfort (UE)</p>
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
              <p className="text-destructive font-medium">Tout usage, reproduction ou adaptation sans autorisation expresse est interdit.</p>
              <p>EmotionsCare SASU et sa créatrice, Laëticia Moto-Ngane, sont titulaires des droits sur la plateforme, sa marque, ses paroles, récits, visuels et fiches rédigées.</p>
              <p className="text-sm">
                <strong className="text-foreground">Référentiel officiel :</strong> les intitulés des items et des objectifs de connaissance (rang A et rang B)
                proviennent du référentiel national du deuxième cycle des études médicales (R2C, plateforme LiSA / UNESS).
                Ils restent la propriété de leurs auteurs, sont reproduits pour permettre la révision, avec leur source, et ne sont pas revendiqués par MED MNG.
              </p>
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
              <p className="text-sm">
                Consultez notre{' '}
                <Link to={ROUTE_PATHS.politiqueConfidentialite} className="text-primary hover:underline">politique de confidentialité</Link>.
              </p>
            </div>
          </Card>

          {/* 6bis. Délégué à la Protection des Données (DPO) */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">6bis. DÉLÉGUÉ À LA PROTECTION DES DONNÉES (DPO)</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>Conformément à l'article 37 du RGPD (UE 2016/679), le responsable de la protection des données personnelles est :</p>
              <div className="bg-primary/10 p-4 rounded-lg space-y-2">
                <p><strong className="text-foreground">DPO :</strong> Laëticia Motongane</p>
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>dpo@emotionscare.com</span>
                </div>
                <p className="text-sm">Adresse postale : EMOTIONSCARE – DPO, Appartement 1, 5 rue Caudron, 80000 Amiens, France</p>
              </div>
              <p className="text-sm">Pour toute question relative à la protection de vos données personnelles ou pour exercer vos droits RGPD (accès, rectification, effacement, portabilité, limitation, opposition), vous pouvez contacter le DPO à l'adresse ci-dessus.</p>
              <div className="bg-success/10 p-4 rounded-lg">
                <p className="text-sm"><strong className="text-foreground">Autorité de contrôle :</strong> Vous disposez du droit d'introduire une réclamation auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL) :</p>
                <ul className="text-sm space-y-1 mt-2">
                  <li>• CNIL – 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07</li>
                  <li>• Téléphone : +33 (0)1 53 73 22 22</li>
                  <li>• Site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.cnil.fr</a></li>
                </ul>
              </div>
            </div>
          </Card>

          {/* 6ter. Sous-traitants et accords de traitement (DPA) */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="h-5 w-5 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">6ter. SOUS-TRAITANTS ET ACCORDS DE TRAITEMENT (DPA)</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>Conformément à l'article 28 du RGPD, des accords de traitement des données (Data Processing Agreements – DPA) ont été conclus avec nos sous-traitants techniques :</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 text-foreground">Sous-traitant</th>
                      <th className="text-left p-2 text-foreground">Rôle</th>
                      <th className="text-left p-2 text-foreground">Localisation</th>
                      <th className="text-left p-2 text-foreground">Garanties</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="p-2 font-semibold">Supabase Inc.</td>
                      <td className="p-2">Hébergement BDD, authentification</td>
                      <td className="p-2">Société américaine ; données hébergées dans l'UE (Francfort)</td>
                      <td className="p-2">DPA signé, SCC, DPF certifié</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-2 font-semibold">Stripe Inc.</td>
                      <td className="p-2">Traitement paiements</td>
                      <td className="p-2">USA / Irlande</td>
                      <td className="p-2">DPA signé, PCI-DSS, SCC</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-2 font-semibold">OpenAI</td>
                      <td className="p-2">Génération contenus pédagogiques</td>
                      <td className="p-2">USA</td>
                      <td className="p-2">DPA signé, SCC, chiffrement</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-2 font-semibold">Suno AI</td>
                      <td className="p-2">Génération musique IA</td>
                      <td className="p-2">USA</td>
                      <td className="p-2">DPA signé, SCC</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold">Sentry</td>
                      <td className="p-2">Monitoring erreurs techniques</td>
                      <td className="p-2">USA</td>
                      <td className="p-2">DPA signé, SCC, données anonymisées</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm italic">SCC = Standard Contractual Clauses (Clauses Contractuelles Types UE). DPF = Data Privacy Framework UE-USA.</p>
            </div>
          </Card>

          {/* 7. Médiateur de la consommation */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Scale className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">7. MÉDIATEUR DE LA CONSOMMATION</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <div className="bg-primary/10 p-4 rounded-lg">
                <p>Médiateur de la consommation : en cours de désignation ; contactez-nous à contact@emotionscare.com en cas de litige.</p>
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