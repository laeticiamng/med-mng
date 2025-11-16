import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "@/config/routes";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";
import { TranslatedText } from "@/components/TranslatedText";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Music, 
  Users, 
  Library, 
  Mail, 
  Github, 
  Twitter, 
  Linkedin,
  Heart,
  Zap
} from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const productLinks = [
    { path: ROUTE_PATHS.ednComplete, label: 'Items EDN', icon: BookOpen },
    { path: ROUTE_PATHS.generator, label: 'Générateur Musical', icon: Music },
    { path: ROUTE_PATHS.ecosIndex, label: 'ECOS', icon: Users },
    { path: ROUTE_PATHS.medMngLibrary, label: 'Bibliothèque', icon: Library },
  ];

  const legalLinks = [
    { path: ROUTE_PATHS.mentionsLegales, label: 'Mentions légales' },
    { path: ROUTE_PATHS.politiqueConfidentialite, label: 'Politique de confidentialité' },
    { path: ROUTE_PATHS.cgu, label: 'CGU' },
    { path: ROUTE_PATHS.declarationAccessibilite, label: 'Accessibilité' },
    { path: ROUTE_PATHS.mesDonneesRgpd, label: 'Données RGPD' },
  ];

  const resourceLinks = [
    { path: ROUTE_PATHS.dashboard, label: 'Dashboard' },
    { path: ROUTE_PATHS.chat, label: 'Assistant IA' },
    { path: ROUTE_PATHS.store, label: 'Store' },
    { path: ROUTE_PATHS.sitemap, label: 'Plan du site' },
  ];

  const socialLinks = [
    { icon: Twitter, label: 'Twitter', href: 'https://twitter.com/medmng' },
    { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com/company/medmng' },
    { icon: Github, label: 'GitHub', href: 'https://github.com/medmng' },
    { icon: Mail, label: 'Email', href: 'mailto:contact@med-mng.com' },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-6 py-12">
        {/* Newsletter Section */}
        <div className="mb-12 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              <TranslatedText text="Restez informé" />
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            <TranslatedText text="Recevez nos dernières actualités, nouveaux items EDN et fonctionnalités directement dans votre boîte mail." />
          </p>
          <NewsletterSignup />
        </div>

        <Separator className="my-8" />

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <TranslatedText text="Produits" />
            </h4>
            <nav aria-label="Liens produits" className="flex flex-col gap-3">
              {productLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group"
                >
                  <link.icon className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                  <TranslatedText text={link.label} />
                </Link>
              ))}
            </nav>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">
              <TranslatedText text="Ressources" />
            </h4>
            <nav aria-label="Liens ressources" className="flex flex-col gap-3">
              {resourceLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <TranslatedText text={link.label} />
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">
              <TranslatedText text="Légal" />
            </h4>
            <nav aria-label="Liens légaux" className="flex flex-col gap-3">
              {legalLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <TranslatedText text={link.label} />
                </Link>
              ))}
            </nav>
          </div>

          {/* Social & About */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">
              <TranslatedText text="Suivez-nous" />
            </h4>
            <div className="flex gap-3 mb-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors group"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <TranslatedText text="MED-MNG est une plateforme d'apprentissage médical innovante avec IA pour la préparation aux examens EDN." />
            </p>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-medical rounded-lg flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-medium text-foreground">
              © {currentYear} MED-MNG
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-xs">
            <TranslatedText text="Fait avec" />
            <Heart className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" />
            <TranslatedText text="pour les étudiants en médecine" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
