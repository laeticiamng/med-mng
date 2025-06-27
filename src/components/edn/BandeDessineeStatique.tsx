
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BandeDessineeStatiqueProps {
  itemData: {
    title: string;
    subtitle: string;
  };
}

export const BandeDessineeStatique = ({ itemData }: BandeDessineeStatiqueProps) => {
  // Images statiques pré-générées pour la cohérence narrative
  const panelsData = [
    {
      id: 1,
      title: "La Rencontre",
      text: `Dans le cabinet médical, Dr. Martin accueille sa patiente, Mme Dubois. L'atmosphère est chaleureuse mais professionnelle, établissant les bases d'une relation de confiance essentielle à tout soin de qualité.`,
      imageUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGRkYiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEyMCIgcj0iMzAiIGZpbGw9IiNGQkI2Q0UiLz4KPGNpcmNsZSBjeD0iMjUwIiBjeT0iMTIwIiByPSIzMCIgZmlsbD0iI0ZCQjZDRSIvPgo8cmVjdCB4PSIxMjAiIHk9IjE1MCIgd2lkdGg9IjE2MCIgaGVpZ2h0PSI4MCIgZmlsbD0iI0Y5RkJGRiIgc3Ryb2tlPSIjMzMzMzMzIiBzdHJva2Utd2lkdGg9IjEiLz4KPHR4dCB4PSIyMDAiIHk9IjE5MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMzMzMzMzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Cb25qb3VyIERvY3RldXI8L3R4dD4KPHR4dCB4PSIyMDAiIHk9IjI3MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5WaWduZXR0ZSAxOiBMYSBSZW5jb250cmU8L3R4dD4KPC9zdmc+"
    },
    {
      id: 2,
      title: "L'Écoute Active",
      text: `Le médecin pratique l'écoute active, se penchant légèrement vers sa patiente, maintenant un contact visuel bienveillant. Chaque mot compte dans cette communication thérapeutique privilégiée.`,
      imageUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGRkYiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjE0MCIgY3k9IjEwMCIgcj0iMjUiIGZpbGw9IiNGQkI2Q0UiLz4KPGNpcmNsZSBjeD0iMjYwIiBjeT0iMTIwIiByPSIyNSIgZmlsbD0iI0ZCQjZDRSIvPgo8bGluZSB4MT0iMTY1IiB5MT0iMTAwIiB4Mj0iMjM1IiB5Mj0iMTIwIiBzdHJva2U9IiM2NjY2NjYiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWRhc2hhcnJheT0iNSw1Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiMzMzMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkNvbW1lbnQgdm91cyBzZW50ZXotdm91cz88L3R4dD4KPHR4dCB4PSIyMDAiIHk9IjI3MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5WaWduZXR0ZSAyOiBMJ8OJY291dGUgQWN0aXZlPC90eHQ+Cjwvc3ZnPg=="
    },
    {
      id: 3,
      title: "L'Explication Claire",
      text: `Dr. Martin explique le diagnostic avec des mots simples, utilisant des schémas et des gestes pour s'assurer que sa patiente comprend bien. La pédagogie médicale en action.`,
      imageUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGRkYiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjEyMCIgY3k9IjEwMCIgcj0iMjUiIGZpbGw9IiNGQkI2Q0UiLz4KPGNpcmNsZSBjeD0iMjgwIiBjeT0iMTIwIiByPSIyNSIgZmlsbD0iI0ZCQjZDRSIvPgo8cmVjdCB4PSIxODAiIHk9IjgwIiB3aWR0aD0iNjAiIGhlaWdodD0iNDAiIGZpbGw9IiNGOUZCRkYiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIxIi8+Cjx0ZXh0IHg9IjIxMCIgeT0iMTA1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiMzMzMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkRpYWdub3N0aWM8L3R4dD4KPHR4dCB4PSIyMDAiIHk9IjE4MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMzMzMzMzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Wb2ljaSBjZSBxdWUgY2VsYSBzaWduaWZpZS4uLjwvdHh0Pgo8dGV4dCB4PSIyMDAiIHk9IjI3MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5WaWduZXR0ZSAzOiBMJ0V4cGxpY2F0aW9uIENsYWlyZTwvdHh0Pgo8L3N2Zz4="
    },
    {
      id: 4,
      title: "L'Alliance Thérapeutique",
      text: `Patient et médecin construisent ensemble un plan de soins. Cette collaboration active améliore l'adhésion au traitement et les résultats cliniques. Une vraie partnership santé.`,
      imageUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGRkYiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEwMCIgcj0iMjUiIGZpbGw9IiNGQkI2Q0UiLz4KPGNpcmNsZSBjeD0iMjUwIiBjeT0iMTAwIiByPSIyNSIgZmlsbD0iI0ZCQjZDRSIvPgo8cGF0aCBkPSJNMTc1IDEwMCBMMjI1IDEwMCIgc3Ryb2tlPSIjNEY4QUY4IiBzdHJva2Utd2lkdGg9IjMiLz4KPGNpcmNsZSBjeD0iMjAwIiBjeT0iMTAwIiByPSI4IiBmaWxsPSIjNEY4QUY4Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiMzMzMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vdXMgYWxsb25zIHRyYXZhaWxsZXIgZW5zZW1ibGU8L3R4dD4KPHR4dCB4PSIyMDAiIHk9IjI3MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5WaWduZXR0ZSA0OiBMJ0FsbGlhbmNlIFRow6lyYXBldXRpcXVlPC90eHQ+Cjwvc3ZnPg=="
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-serif text-amber-900 mb-4">Bande Dessinée Éducative</h2>
        <p className="text-lg text-amber-700 mb-6">
          Découvrez "{itemData.title}" à travers une histoire illustrée captivante
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {panelsData.map((panel) => (
          <Card key={panel.id} className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-amber-700 border-amber-300">
                  Vignette {panel.id}
                </Badge>
                <h3 className="text-lg font-semibold text-amber-900">
                  {panel.title}
                </h3>
              </div>
              
              <div className="relative">
                <img 
                  src={panel.imageUrl} 
                  alt={panel.title}
                  className="w-full h-48 object-cover rounded-lg border-2 border-amber-200"
                />
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-amber-200">
                <p className="text-amber-900 font-medium italic">
                  {panel.text}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-amber-600 italic">
        <p>Cette bande dessinée illustre les concepts clés de la relation médecin-patient de manière narrative et engageante.</p>
      </div>
    </div>
  );
};
