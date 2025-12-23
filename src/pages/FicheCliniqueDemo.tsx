import React from "react";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/seo/SEOHead";
import { ROUTE_PATHS } from "@/config/routes";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FicheClinique, FicheCliniqueProp } from "@/components/fiches/FicheClinique";

// Exemple de fiche clinique pour démonstration
const exempleFiche: FicheCliniqueProp = {
  titre: "Douleur thoracique aiguë chez l'adulte",
  niveau: "D3",
  appareil: "Cardiovasculaire",
  itemsEdn: ["Item 228", "Item 339"],
  problemeClinique: 
    "Face à une douleur thoracique aiguë, l'enjeu n'est pas de lister tous les diagnostics possibles, mais d'identifier rapidement les urgences vitales qui nécessitent une prise en charge immédiate.",
  presentation:
    "Homme de 58 ans, fumeur, consulte aux urgences pour une douleur thoracique constrictive irradiant au bras gauche, apparue il y a 2 heures au repos. Il est pâle, sudorique.",
  hypotheses: [
    {
      rang: 1,
      diagnostic: "Syndrome coronarien aigu (SCA)",
      arguments: [
        "Douleur constrictive typique, irradiation bras gauche",
        "Facteurs de risque cardiovasculaire (tabac, âge > 50 ans)",
        "Signes neurovégétatifs (pâleur, sueurs)",
        "Survenue au repos = argument de gravité"
      ],
      examensCles: ["ECG 18 dérivations", "Troponine à H0 et H3"]
    },
    {
      rang: 1,
      diagnostic: "Dissection aortique",
      arguments: [
        "Douleur thoracique aiguë intense",
        "Rechercher : asymétrie tensionnelle, souffle d'IA",
        "Irradiation dorsale migrante évocatrice"
      ],
      examensCles: ["Angio-TDM thoracique", "ETT en urgence"]
    },
    {
      rang: 1,
      diagnostic: "Embolie pulmonaire",
      arguments: [
        "Douleur thoracique + dyspnée",
        "Rechercher : facteurs de risque thromboemboliques",
        "Tachycardie, désaturation"
      ],
      examensCles: ["Angio-TDM thoracique", "D-dimères si probabilité faible"]
    },
    {
      rang: 2,
      diagnostic: "Péricardite aiguë",
      arguments: [
        "Douleur augmentée à l'inspiration et en décubitus",
        "Soulagée en antéflexion",
        "Frottement péricardique"
      ],
      examensCles: ["ECG (sus-décalage diffus)", "ETT"]
    },
    {
      rang: 3,
      diagnostic: "Causes pariétales / digestives",
      arguments: [
        "Douleur reproductible à la palpation",
        "Contexte évocateur (effort, repas)",
        "Diagnostic d'élimination après avoir écarté les urgences"
      ],
    }
  ],
  raisonnement: [
    {
      numero: 1,
      question: "Le patient est-il stable sur le plan hémodynamique ?",
      reponse: "Vérifier PA, FC, SpO2, état de conscience. Un patient instable nécessite une prise en charge immédiate et un scope.",
      conclusion: "Ici : PA 145/90, FC 95, SpO2 97% → Patient stable mais à surveiller étroitement."
    },
    {
      numero: 2,
      question: "La douleur évoque-t-elle une urgence vitale ?",
      reponse: "Douleur constrictive, irradiation bras gauche, signes neurovégétatifs, survenue au repos → Tableau hautement évocateur de SCA ST+.",
    },
    {
      numero: 3,
      question: "L'ECG est-il contributif ?",
      reponse: "ECG 18 dérivations en urgence. Rechercher : sus-décalage ST, miroir, onde Q, troubles du rythme.",
      conclusion: "Sus-décalage ST en V1-V4 → SCA ST+ antérieur = Appel cardio + salle de coronarographie."
    },
    {
      numero: 4,
      question: "Quelles actions immédiates avant la coronarographie ?",
      reponse: "Double antiagrégation (Aspirine 250mg IV + Ticagrelor 180mg), Anticoagulation (HNF), Oxygénothérapie si SpO2 < 90%, Morphine si douleur intense.",
    }
  ],
  pointsCles: [
    "Toujours éliminer les 3 urgences vitales : SCA, dissection aortique, EP",
    "ECG dans les 10 minutes suivant l'arrivée aux urgences",
    "Un ECG normal n'élimine pas un SCA → Troponine + ECG répétés",
    "Penser à la dissection si douleur migrante ou asymétrie tensionnelle",
    "Le SCA ST+ est une urgence de revascularisation (délai < 120 min)"
  ],
  pieges: [
    "Se focaliser sur une cause bénigne chez un patient à risque",
    "Oublier de répéter l'ECG (un SCA peut se démasquer)",
    "Ne pas rechercher les signes de dissection (asymétrie TA)",
    "Attribuer la douleur au stress sans examen",
    "Donner des anticoagulants avant d'avoir éliminé une dissection"
  ],
  attenduOral: {
    formulation: "Devant cette douleur thoracique typique chez ce patient à haut risque cardiovasculaire, avec signes neurovégétatifs, l'hypothèse prioritaire est le syndrome coronarien aigu. Je réalise un ECG 18 dérivations en urgence et je demande un dosage de troponine. En cas de sus-décalage ST, je contacte immédiatement la cardiologie interventionnelle pour une coronarographie en urgence.",
    motsClés: [
      "Syndrome coronarien aigu",
      "ECG 18 dérivations",
      "Troponine",
      "Coronarographie en urgence",
      "Double antiagrégation",
      "Éliminer dissection aortique"
    ]
  }
};

const FicheCliniqueDemo = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Format de fiche clinique | Med-MNG"
        description="Découvre le format de fiche clinique Med-MNG : raisonnement structuré, hypothèses hiérarchisées, pièges à éviter. Apprends à penser comme un médecin."
        keywords="fiche clinique, raisonnement médical, cas clinique, EDN, ECOS, méthodologie médicale"
        canonical="/fiche-demo"
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour
            </Button>
            <Badge variant="outline" className="font-medium">
              Format Med-MNG
            </Badge>
          </div>
        </header>

        {/* Contenu */}
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <FicheClinique {...exempleFiche} />
        </main>
      </div>
    </>
  );
};

export default FicheCliniqueDemo;
