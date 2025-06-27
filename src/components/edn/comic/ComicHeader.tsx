
interface ComicHeaderProps {
  title: string;
}

export const ComicHeader = ({ title }: ComicHeaderProps) => {
  return (
    <div className="text-center">
      <h2 className="text-4xl font-serif text-amber-900 mb-4">Bande Dessinée Éducative</h2>
      <p className="text-lg text-amber-700 mb-6">
        Découvrez "{title}" à travers une histoire illustrée captivante
      </p>
    </div>
  );
};
