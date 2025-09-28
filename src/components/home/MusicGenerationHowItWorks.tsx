
import { TranslatedText } from '@/components/TranslatedText';

export const MusicGenerationHowItWorks = () => {
  const steps = [
    {
      number: "1",
      title: "Sélectionnez votre Item EDN",
      description: "Choisissez parmi IC-1 à IC-5 selon votre spécialité"
    },
    {
      number: "2",
      title: "Choisissez Rang A ou B",
      description: "Adaptez le niveau selon vos besoins de formation"
    },
    {
      number: "3",
      title: "Personnalisez le Style",
      description: "Choisissez votre style musical préféré pour apprendre"
    },
    {
      number: "4",
      title: "Sauvegardez dans votre Bibliothèque",
      description: "Organisez vos créations et créez vos favoris"
    }
  ];

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        <TranslatedText text="Comment ça marche ?" />
      </h3>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-amber-600 font-bold">{step.number}</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                <TranslatedText text={step.title} />
              </h4>
              <p className="text-gray-600 text-sm">
                <TranslatedText text={step.description} />
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
