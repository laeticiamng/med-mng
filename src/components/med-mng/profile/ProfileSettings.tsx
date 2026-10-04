import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Download, Globe, Trash2 } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';

interface ProfileSettingsProps {
  profile?: unknown;
}

/**
 * Profil › Paramètres.
 *
 * CONSTAT (vague 2, 04.10.2026) : cet onglet affichait des réglages qui
 * n'étaient enregistrés nulle part (notifications, e-mails, effets sonores,
 * lecture automatique, qualité audio, mode sombre, langue) : un état local
 * perdu au rechargement, avec le message « Vos préférences ont été
 * sauvegardées ». « Exporter mes données » n'exportait rien (simple message)
 * et « Vider le cache » effaçait tout le stockage local, session comprise.
 *
 * Ne restent que des actions réelles : l'export et la suppression du compte
 * (page « Mes données », export JSON et suppression confirmée), et l'indication
 * du seul réglage d'affichage qui existe vraiment (le thème, en en-tête).
 * Le sélecteur de langue a été retiré (D42) : Med MNG est en français.
 */
export const ProfileSettings: React.FC<ProfileSettingsProps> = () => {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Affichage
          </CardTitle>
          <CardDescription>
            Le thème clair ou sombre se change avec le bouton « Changer de thème » en haut de page.
            Med MNG est entièrement en français.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Gestion des données
          </CardTitle>
          <CardDescription>Exportez ou supprimez vos données (RGPD, articles 15, 17 et 20)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild variant="outline" className="flex items-center gap-2 w-full md:w-auto">
            <Link to={ROUTE_PATHS.mesDonneesRgpd}>
              <Download className="h-4 w-4" />
              Exporter mes données
            </Link>
          </Button>

          <Separator />

          <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/30">
            <h4 className="font-semibold text-destructive mb-2">Zone de danger</h4>
            <p className="text-sm text-destructive/80 mb-4">
              Cette action supprimera définitivement votre compte et toutes vos données.
            </p>
            {/* La suppression réelle (avec confirmation) est sur la page « Mes données ». */}
            <Button asChild variant="destructive" size="sm" className="flex items-center gap-2">
              <Link to={ROUTE_PATHS.mesDonneesRgpd}>
                <Trash2 className="h-4 w-4" />
                Supprimer mon compte
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
