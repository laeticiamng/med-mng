import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "@/config/routes";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/40 text-muted-foreground">
      <div className="container mx-auto flex flex-col gap-4 px-6 py-8 text-sm md:flex-row md:items-center md:justify-between">
        <p className="font-medium text-foreground">© {new Date().getFullYear()} Med-MNG</p>
        <nav aria-label="Liens légaux" className="flex flex-wrap gap-x-6 gap-y-2">
          <Link className="transition hover:text-foreground" to={ROUTE_PATHS.mentionsLegales}>
            Mentions légales
          </Link>
          <Link className="transition hover:text-foreground" to={ROUTE_PATHS.politiqueConfidentialite}>
            Politique de confidentialité
          </Link>
          <Link className="transition hover:text-foreground" to={ROUTE_PATHS.cgu}>
            Conditions générales d'utilisation
          </Link>
          <Link className="transition hover:text-foreground" to={ROUTE_PATHS.declarationAccessibilite}>
            Déclaration d'accessibilité
          </Link>
          <Link className="transition hover:text-foreground" to={ROUTE_PATHS.mesDonneesRgpd}>
            Mes données RGPD
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
