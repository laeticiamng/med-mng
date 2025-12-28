import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Eye, Heart, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ContentFormatSelector } from './ContentFormatSelector';

interface ContentFormat {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  example: string;
}

interface ContentGeneratorProps {
  itemData: {
    title: string;
    item_code: string;
    tableau_rang_a?: any;
    tableau_rang_b?: any;
  };
}

export const ContentGenerator: React.FC<ContentGeneratorProps> = ({ itemData }) => {
  const [selectedFormat, setSelectedFormat] = useState<ContentFormat | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInLibrary, setIsInLibrary] = useState(false);
  const { toast } = useToast();

  const generateAdvancedContent = (format: ContentFormat): string => {
    const rangAData = itemData.tableau_rang_a || {};
    const rangBData = itemData.tableau_rang_b || {};
    
    switch (format.id) {
      case 'bande-dessinee':
        return generateBandeDessinee(rangAData, rangBData);
      case 'roman':
        return generateRoman(rangAData, rangBData);
      case 'poesie':
        return generatePoesie(rangAData, rangBData);
      case 'nouvelle':
        return generateNouvelle(rangAData, rangBData);
      case 'fable':
        return generateFable(rangAData, rangBData);
      case 'conte':
        return generateConte(rangAData, rangBData);
      case 'rap':
        return generateRap(rangAData, rangBData);
      case 'théâtre':
        return generateTheatre(rangAData, rangBData);
      default:
        return `Contenu généré pour ${itemData.title} en format ${format.name}`;
    }
  };

  const generateBandeDessinee = (rangA: any, rangB: any): string => {
    return `BANDE DESSINÉE - ${itemData.title}

🎨 VIGNETTE 1 - Introduction
[Décor: Cabinet médical moderne]
DR. MARTIN: "Bonjour ! Aujourd'hui nous allons explorer ${itemData.title}"
PATIENT: "Parfait docteur, j'ai hâte d'apprendre !"

🎨 VIGNETTE 2 - Rang A (Compétences de base)
[Décor: Tableau explicatif en arrière-plan]
DR. MARTIN: "Commençons par les fondamentaux..."
NARRATION: Les concepts de base s'affichent clairement

🎨 VIGNETTE 3 - Cas pratique Rang A
[Décor: Situation clinique]
PATIENT: "Et dans mon cas, comment ça s'applique ?"
DR. MARTIN: "Excellente question ! Voyons..."

🎨 VIGNETTE 4 - Transition vers Rang B
[Décor: Le cabinet se transforme]
NARRATION: "Maintenant, approfondissons avec les compétences avancées..."

🎨 VIGNETTE 5 - Rang B (Compétences avancées)
[Décor: Équipements plus sophistiqués]
DR. MARTIN: "Pour les cas complexes, nous devons maîtriser..."
PATIENT: "Ah, je vois la différence maintenant !"

🎨 VIGNETTE 6 - Synthèse finale
[Décor: Vue d'ensemble du cabinet]
DR. MARTIN: "Rang A et B combinés donnent une expertise complète !"
PATIENT: "Merci docteur, c'est très clair maintenant !"

🎨 VIGNETTE 7 - Conclusion
[Décor: Poignée de main]
NARRATION: "${itemData.title} : Maîtrisé de A à B !"
DR. MARTIN: "N'hésitez pas à revenir si vous avez des questions !"`;
  };

  const generateRoman = (rangA: any, rangB: any): string => {
    return `ROMAN MÉDICAL - ${itemData.title}

CHAPITRE 1 : L'ÉVEIL DES COMPÉTENCES

Dr. Sophie Durand regardait par la fenêtre de son bureau. Trois années d'études l'avaient menée jusqu'ici, mais aujourd'hui marquait le début d'une nouvelle aventure : la maîtrise complète de ${itemData.title}.

"Chaque concept a son importance," se dit-elle en ouvrant son manuel. Les compétences de Rang A s'étalaient devant elle comme une carte routière vers l'excellence médicale.

CHAPITRE 2 : LES FONDATIONS (RANG A)

Les premières notions semblaient familières. Sophie avait déjà croisé ces concepts durant ses stages, mais jamais avec cette profondeur. Chaque page révélait une nouvelle facette de ${itemData.title}, construisant méthodiquement son savoir.

"Il faut d'abord maîtriser les bases," murmura-t-elle, traçant des schémas dans son carnet. Les compétences fondamentales prenaient forme dans son esprit, créant un socle solide pour la suite.

CHAPITRE 3 : L'ASCENSION (RANG B)

Semaines après semaines, Sophie sentait son expertise grandir. Les compétences avancées du Rang B ne lui faisaient plus peur. Elle comprenait désormais les subtilités, les nuances qui échappaient aux débutants.

Un jour, face à un cas complexe, elle réalisa qu'elle appliquait naturellement l'ensemble des concepts appris. Rang A et Rang B se complétaient parfaitement dans sa pratique.

ÉPILOGUE : LA MAÎTRISE COMPLÈTE

Dr. Sophie Durand était devenue une experte de ${itemData.title}. Ses patients bénéficiaient de cette expertise complète, fruit d'un apprentissage méthodique et passionné. 

"De novice à experte," pensa-t-elle avec fierté, "le voyage en valait la peine."`;
  };

  const generatePoesie = (rangA: any, rangB: any): string => {
    return `POÉSIE MÉDICALE - ${itemData.title}

🎼 STROPHE I - L'APPEL DU SAVOIR
Ô ${itemData.title}, noble science,
Tu guides nos pas avec élégance,
Dans les méandres de la médecine,
Chaque concept est une vitamine.

🎼 STROPHE II - RANG A (LES BASES)
Rang A, fondation de l'édifice,
Tes compétences sont un office,
Elles construisent jour après jour,
Le savoir médical et l'amour.

Chaque notion apprise avec soin,
Devient un outil, devient un coin,
De l'expertise qui se dessine,
Dans l'esprit qui se discipline.

🎼 STROPHE III - RANG B (L'EXCELLENCE)
Rang B, sommet de la montagne,
Tes secrets illuminent la campagne,
De nos connaissances médicales,
Rendant nos pratiques magistrales.

Compétences fines et nuancées,
Aux débutants inaccessibles,
Se révèlent aux initiés,
Comme des trésors indicibles.

🎼 STROPHE IV - L'UNION PARFAITE
Rang A et B, couple éternel,
L'un sans l'autre reste partiel,
Ensemble ils forment l'excellence,
La parfaite compétence.

🎼 STROPHE V - LA CÉLÉBRATION
Chantons donc ${itemData.title},
Cette science si fertile,
Qui fait de nous des soignants,
Compétents et bienveillants !

🎵 Car celui qui maîtrise A et B,
Détient la clé de la réussite ! 🎵`;
  };

  const generateNouvelle = (rangA: any, rangB: any): string => {
    return `NOUVELLE MÉDICALE - ${itemData.title}

LA RÉVÉLATION DU DR. LAMBERT

3h47 du matin. Le biper de garde retentit dans le silence de l'hôpital. Dr. Lambert se réveille en sursaut. Urgence en cardiologie.

En se dirigeant vers l'ascenseur, il repense à ses cours sur ${itemData.title}. Ces notions qu'il avait apprises théoriquement allaient-elles suffire face à la réalité ?

Arrivé au chevet du patient, le tableau clinique est complexe. Rang A : il applique d'abord les compétences fondamentales. Diagnostic initial, protocoles de base, gestes essentiels. Tout ce qu'il a appris résonne dans ses gestes.

Mais la situation se complique. C'est là que le Rang B prend tout son sens. Les compétences avancées, ces subtilités qu'il avait parfois trouvées théoriques, deviennent soudain vitales. Chaque détail compte, chaque nuance peut faire la différence.

Deux heures plus tard, le patient est stabilisé. Dr. Lambert réalise alors la beauté de ${itemData.title} : l'harmonie parfaite entre les bases solides du Rang A et la finesse experte du Rang B.

En retournant vers sa chambre de garde, il sourit. Cette nuit, il n'a pas seulement sauvé une vie. Il a compris ce que signifie vraiment maîtriser ${itemData.title}.

Demain, il enseignera à son tour cette leçon si précieuse : l'excellence naît de l'union parfaite des fondamentaux et de l'expertise.`;
  };

  const generateFable = (rangA: any, rangB: any): string => {
    return `FABLE MÉDICALE - ${itemData.title}

LE JEUNE MÉDECIN ET LE MAÎTRE

Il était une fois un jeune médecin impatient qui voulait tout apprendre d'un coup. Il négligeait les bases du Rang A de ${itemData.title}, préférant se concentrer sur les aspects avancés du Rang B.

"Pourquoi perdre du temps avec ces notions élémentaires ?" disait-il. "Je veux immédiatement maîtriser les compétences expertes !"

Un jour, un patient complexe se présenta. Le jeune médecin, confiant dans ses connaissances partielles, tenta d'appliquer directement les techniques avancées.

Mais sans les fondations solides du Rang A, ses efforts furent vains. Il se trouvait comme un architecte tentant de construire un toit sans avoir posé les fondations.

Un maître médecin l'observait. "Mon jeune confrère," dit-il doucement, "regardez-moi faire."

Le maître commença par appliquer méthodiquement les compétences de Rang A. Chaque geste était précis, chaque décision fondée sur les bases solides. Puis, naturellement, il intégra les subtilités du Rang B.

Le patient fut rapidement stabilisé.

"Voyez-vous," expliqua le maître, "les compétences de ${itemData.title} sont comme un arbre. Le Rang A forme les racines et le tronc, le Rang B fait s'épanouir les branches et les feuilles. L'un sans l'autre ne peut donner de fruits."

Le jeune médecin comprit alors sa leçon.

MORALE : Il n'y a pas d'expertise sans maîtrise des fondamentaux. Dans ${itemData.title}, Rang A et Rang B sont indissociables pour atteindre l'excellence.`;
  };

  const generateConte = (rangA: any, rangB: any): string => {
    return `CONTE MÉDICAL - ${itemData.title}

LE ROYAUME DE LA CONNAISSANCE

Il était une fois, dans le lointain Royaume de la Connaissance, une discipline magique nommée ${itemData.title}. Cette science était gardée par deux gardiens mystérieux : Rang A et Rang B.

Rang A, le gardien des Fondamentaux, était un être bienveillant aux robes bleues. Il enseignait aux apprentis les premiers secrets, les bases essentielles que tout praticien devait connaître.

Rang B, le gardien de l'Excellence, portait des robes dorées scintillantes. Il ne révélait ses mystères qu'à ceux qui avaient d'abord honoré les enseignements de Rang A.

Un jour, une jeune apprentie nommée Clara arriva au royaume. Elle souhaitait plus que tout maîtriser ${itemData.title} pour aider les gens de son village.

"Patience, jeune Clara," dit Rang A. "Commence par comprendre mes enseignements. Ils sont la clé qui ouvrira toutes les portes."

Clara étudia avec diligence. Jour après jour, elle assimilait les compétences fondamentales. Chaque notion était comme une perle précieuse qu'elle ajoutait à son collier de savoir.

Quand Rang A jugea qu'elle était prête, il la conduisit vers son frère. Rang B sourit en voyant Clara : "Tu as bien travaillé. Maintenant, découvre les secrets les plus profonds."

Les enseignements de Rang B étaient éblouissants. Ils transformaient les bases solides de Clara en véritable expertise. Les deux savoirs se mélangèrent harmonieusement dans son esprit.

Lorsque Clara retourna dans son village, elle était devenue une maîtresse de ${itemData.title}. Grâce à l'union parfaite des enseignements des deux gardiens, elle put aider tous ceux qui en avaient besoin.

Et ils vécurent tous en bonne santé pour l'éternité.

FIN

Morale : La véritable maîtrise naît de l'alliance parfaite entre les fondamentaux et l'expertise.`;
  };

  const generateRap = (rangA: any, rangB: any): string => {
    return `RAP MÉDICAL - ${itemData.title}

[Intro]
Yo, yo ! On est là pour rapper
${itemData.title}, on va tout expliquer
Du Rang A au Rang B, sans s'arrêter
L'expertise médicale, on va la déclencher !

[Couplet 1 - Rang A]
Rang A dans la place, les bases on pose
Fondamentaux solides, c'est pas du morose
Chaque compétence compte, chaque notion précise
Avant de voler haut, faut qu'on maîtrise

Apprentissage méthodique, pas de précipitation
${itemData.title}, ça demande concentration
Étape par étape, on construit l'savoir
Rang A c'est la base, faut y croire !

[Refrain]
${itemData.title}, c'est notre science
De A jusqu'à B, on prend l'excellence
Rang après rang, on monte niveau
Expertise médicale, on est au top !

[Couplet 2 - Rang B]
Rang B maintenant, on passe au niveau expert
Compétences pointues, ça devient plus ouvert
Subtilités fines, nuances avancées
Seuls les meilleurs peuvent les maîtriser

Cas complexes, situations critiques
Rang B répond présent, c'est fantastique
Union avec Rang A, combo parfait
${itemData.title}, on a tout maîtrisé !

[Pont]
De novice à expert, le chemin est tracé
Rang A puis Rang B, tout est organisé
Médecine moderne, science d'excellence
${itemData.title}, notre référence !

[Refrain Final]
${itemData.title}, c'est notre science
De A jusqu'à B, on prend l'excellence
Rang après rang, on monte niveau
Expertise médicale, on est au top !

[Outro]
Rang A, Rang B, unis pour la vie
${itemData.title}, notre thérapie
Pour tous les patients, on sera là
C'est ça l'expertise, c'est ça le rap !

Peace ! ✋`;
  };

  const generateTheatre = (rangA: any, rangB: any): string => {
    return `PIÈCE DE THÉÂTRE - ${itemData.title}

ACTE I - LA DÉCOUVERTE

SCÈNE 1
[Décor : Amphithéâtre de médecine]

PROFESSEUR : (s'avançant vers le public) Mesdames et messieurs, étudiants en médecine, nous voici réunis pour découvrir les mystères de ${itemData.title}.

ÉTUDIANT 1 : (levant la main) Professeur, par où commencer ?

PROFESSEUR : Excellente question ! Tout commence par le Rang A, les compétences fondamentales.

[Éclairage qui se concentre sur le tableau]

PROFESSEUR : (pointant le tableau) Voyez ces concepts comme les fondations d'une cathédrale. Sans elles, impossible de construire l'édifice.

ÉTUDIANT 2 : (perplexe) Mais professeur, quand pourrons-nous aborder les cas complexes ?

PROFESSEUR : (souriant) Patience, jeune disciple. Le Rang B viendra en son temps.

SCÈNE 2
[Décor : Même amphithéâtre, quelques mois plus tard]

PROFESSEUR : (triomphant) Mes chers étudiants, vous avez maîtrisé le Rang A ! Il est temps de découvrir le Rang B.

ÉTUDIANT 1 : (confiant) Nous sommes prêts !

PROFESSEUR : Le Rang B, ce sont les compétences expertes, les subtilités que seule l'expérience peut enseigner.

[Entre un nouveau personnage : MAÎTRE EXPERT]

MAÎTRE EXPERT : (voix grave) ${itemData.title} dans sa forme la plus pure... Rang A et Rang B unis dans une danse éternelle.

ÉTUDIANT 2 : (émerveillé) Je commence à comprendre !

ACTE II - LA RÉVÉLATION

SCÈNE 1
[Décor : Cabinet médical]

MAÎTRE EXPERT : (aux étudiants) Observez bien cette consultation. Rang A et Rang B vont se révéler naturellement.

[Entre un PATIENT]

PATIENT : Docteur, j'ai un problème complexe...

MAÎTRE EXPERT : (appliquant Rang A) Commençons par les fondamentaux... (puis Rang B) Maintenant, approfondissons avec l'expertise avancée.

ÉTUDIANT 1 : (à part) Incroyable ! Tout s'emboîte parfaitement !

SCÈNE 2 - FINALE
[Décor : L'amphithéâtre, tous les personnages présents]

PROFESSEUR : (solennellement) Ainsi se termine votre initiation à ${itemData.title}.

MAÎTRE EXPERT : Rang A vous a donné les clés...

ÉTUDIANT 2 : Rang B nous a ouvert les portes !

TOUS EN CHŒUR : Et l'union des deux nous mène vers l'excellence !

[Rideau tombe sous les applaudissements]

FIN

Note de mise en scène : Cette pièce peut être adaptée avec des éléments visuels, des projections médicales et des démonstrations pratiques pour renforcer l'impact pédagogique.`;
  };

  const handleGenerate = async () => {
    if (!selectedFormat) {
      toast({
        title: "Format requis",
        description: "Veuillez sélectionner un format de contenu",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simuler un temps de génération réaliste
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const content = generateAdvancedContent(selectedFormat);
      setGeneratedContent(content);
      
      toast({
        title: "Contenu généré !",
        description: `${selectedFormat.name} créé avec succès pour ${itemData.title}`,
        variant: "default"
      });
      
    } catch {
      toast({
        title: "Erreur de génération",
        description: "Impossible de générer le contenu",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToLibrary = () => {
    setIsInLibrary(true);
    toast({
      title: "Ajouté à la bibliothèque !",
      description: `${selectedFormat?.name} - ${itemData.title} sauvegardé`,
      variant: "default"
    });
  };

  const handleDownload = () => {
    if (!generatedContent || !selectedFormat) return;
    
    const blob = new Blob([generatedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${itemData.item_code}-${selectedFormat.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Téléchargement lancé",
      description: "Le fichier a été téléchargé",
      variant: "default"
    });
  };

  return (
    <div className="space-y-6">
      <ContentFormatSelector
        itemData={itemData}
        onFormatSelect={setSelectedFormat}
        selectedFormat={selectedFormat?.id || null}
      />

      {selectedFormat && (
        <Card className="bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <selectedFormat.icon className="h-6 w-6" />
              Génération de contenu - {selectedFormat.name}
            </CardTitle>
            <CardDescription>
              Création d'un {selectedFormat.name.toLowerCase()} complet pour {itemData.title} (Rangs A & B)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Générer le {selectedFormat.name}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {generatedContent && (
        <Card className="bg-background border-success/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-success">
              <span className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Contenu généré - {selectedFormat?.name}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddToLibrary}
                  disabled={isInLibrary}
                  className="border-success/20 text-success hover:bg-success/10"
                >
                  {isInLibrary ? (
                    <>
                      <Heart className="h-4 w-4 mr-1 fill-current" />
                      Dans la bibliothèque
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4 mr-1" />
                      Ajouter à ma bibliothèque
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="border-primary/20 text-primary hover:bg-primary/10"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Télécharger
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-6 rounded-lg border max-h-96 overflow-y-auto">
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
                {generatedContent}
              </pre>
            </div>
            <div className="mt-4 flex gap-2 flex-wrap">
              <Badge variant="secondary" className="bg-success/10 text-success">
                ✓ Rang A inclus
              </Badge>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                ✓ Rang B inclus
              </Badge>
              <Badge variant="secondary" className="bg-accent/10 text-accent">
                ✓ Synthèse A+B
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};