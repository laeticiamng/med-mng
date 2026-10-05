import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, WifiOff } from 'lucide-react';
import React, { Component, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Coupure de réseau pendant le chargement d'une page (critique finale, 05.10.2026).
 *
 * CONSTAT en production : hors connexion, ouvrir un onglet d'item pas encore chargé
 * (« Quiz »…) remplaçait TOUTE l'application (en-tête compris) par la page générale
 * « Oops ! Une erreur est survenue — Ne t'inquiète pas, ça arrive » : le fichier
 * JavaScript de la page (chargé à la demande) n'avait pas pu être téléchargé.
 *
 * Cette barrière, placée autour de chaque page chargée à la demande, garde l'en-tête et
 * la navigation, dit ce qui se passe, et recharge la page dès le retour du réseau.
 * Toute autre erreur est transmise à la barrière générale (GlobalErrorBoundary).
 */
const MOTIFS_CHARGEMENT = [
  /Failed to fetch dynamically imported module/i,
  /error loading dynamically imported module/i,
  /Importing a module script failed/i,
  /Loading (CSS )?chunk [\w-]+ failed/i,
  /ChunkLoadError/i,
];

export function estErreurDeChargement(erreur: unknown): boolean {
  if (!erreur) return false;
  const e = erreur as { name?: unknown; message?: unknown };
  const texte = `${String(e.name ?? '')} ${String(e.message ?? erreur)}`;
  return MOTIFS_CHARGEMENT.some((m) => m.test(texte));
}

interface Props {
  children: ReactNode;
}
interface PropsBarriere extends Props {
  adresse: string;
}
interface State {
  erreur: unknown;
}

class BarriereChargement extends Component<PropsBarriere, State> {
  state: State = { erreur: null };

  static getDerivedStateFromError(erreur: unknown): State {
    return { erreur };
  }

  componentDidUpdate(propsAvant: PropsBarriere, avant: State) {
    if (!avant.erreur && this.state.erreur && estErreurDeChargement(this.state.erreur)) {
      window.addEventListener('online', this.recharger);
    }
    // Autre adresse : on retente (sans démonter les pages qui fonctionnent).
    if (propsAvant.adresse !== this.props.adresse && this.state.erreur) {
      window.removeEventListener('online', this.recharger);
      this.setState({ erreur: null });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.recharger);
  }

  recharger = () => {
    window.location.reload();
  };

  render() {
    const { erreur } = this.state;
    if (!erreur) return this.props.children;
    // Autre erreur : la barrière générale s'en charge.
    if (!estErreurDeChargement(erreur)) throw erreur;
    return (
      <div className="container mx-auto px-4 py-10 flex justify-center">
        <Card className="max-w-lg w-full">
          <CardContent className="p-6 text-center space-y-4" role="alert">
            <div className="mx-auto w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
              <WifiOff className="h-6 w-6 text-warning" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold">Connexion interrompue</h2>
            <p className="text-sm text-muted-foreground">
              Cette page n'a pas pu se charger : la connexion Internet semble coupée. Elle se
              rechargera automatiquement dès le retour du réseau.
            </p>
            <Button onClick={this.recharger} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}

/** Une erreur de chargement ne « colle » pas à la page suivante : elle est oubliée au changement d'adresse. */
export function ChargementPageBoundary({ children }: Props) {
  const { pathname } = useLocation();
  return <BarriereChargement adresse={pathname}>{children}</BarriereChargement>;
}

export default ChargementPageBoundary;
