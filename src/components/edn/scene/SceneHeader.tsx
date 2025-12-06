import { SceneTheme } from './sceneTypes';

interface SceneHeaderProps {
  theme: SceneTheme;
  description: string;
  setting?: string | { location?: string; atmosphere?: string; characters?: any[] };
}

export const SceneHeader = ({ theme, description, setting }: SceneHeaderProps) => {
  const getSettingText = (): string => {
    if (!setting) return '';
    if (typeof setting === 'string') return setting;
    if (typeof setting === 'object' && 'location' in setting) {
      return setting.location || 'Scène médicale';
    }
    return String(setting);
  };

  return (
    <div className="text-center relative z-10 pt-20">
      <div className={`inline-block bg-gradient-to-r ${theme.primary} text-primary-foreground px-12 py-6 rounded-full ${theme.glowColor} shadow-2xl mb-12 transform hover:scale-105 transition-all duration-500`}>
        <h2 className="text-5xl font-bold flex items-center gap-4">
          <span className="text-6xl">{theme.uniqueElement}</span>
          {theme.name}
          <span className="text-6xl">{theme.uniqueElement}</span>
        </h2>
      </div>
      <div className={`max-w-5xl mx-auto bg-card/95 backdrop-blur-lg p-10 rounded-3xl ${theme.glowColor} shadow-2xl border-4 border-border/30`}>
        <p className={`text-2xl leading-relaxed ${theme.accent} font-medium`}>
          {description}
        </p>
        {setting && (
          <div className={`mt-6 text-lg ${theme.accent} opacity-90 italic flex items-center justify-center gap-3`}>
            <span className="text-2xl">📍</span>
            <span>{getSettingText()}</span>
            <span className="text-2xl">📍</span>
          </div>
        )}
      </div>
    </div>
  );
};
