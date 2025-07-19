interface TranslatedTextProps {
  text: string;
  className?: string;
}

export const TranslatedText = ({ text, className = "" }: TranslatedTextProps) => {
  return <span className={className}>{text}</span>;
};