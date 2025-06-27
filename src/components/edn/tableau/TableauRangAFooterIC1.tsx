
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, BookOpen, Target } from 'lucide-react';

export const TableauRangAFooterIC1 = () => {
  return (
    <div className="mt-8 space-y-6">
      {/* Points clés PARSEMA */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <div className="flex items-start gap-3 mb-4">
          <Target className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-bold text-purple-900 mb-2">
              Points clés PARSEMA - Prise en charge maladies chroniques
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Badge variant="outline" className="text-purple-700 border-purple-300">
                  <span className="font-bold text-purple-600">P</span>rogramme de soin
                </Badge>
                <Badge variant="outline" className="text-purple-700 border-purple-300">
                  <span className="font-bold text-purple-600">A</span>nnonce diagnostic
                </Badge>
                <Badge variant="outline" className="text-purple-700 border-purple-300">
                  <span className="font-bold text-purple-600">R</span>CP si maladie complexe
                </Badge>
                <Badge variant="outline" className="text-purple-700 border-purple-300">
                  <span className="font-bold text-purple-600">S</span>outien psychologique
                </Badge>
              </div>
              <div className="space-y-2">
                <Badge variant="outline" className="text-purple-700 border-purple-300">
                  <span className="font-bold text-purple-600">E</span>ducation du patient
                </Badge>
                <Badge variant="outline" className="text-purple-700 border-purple-300">
                  <span className="font-bold text-purple-600">M</span>ultidisciplinaire
                </Badge>
                <Badge variant="outline" className="text-purple-700 border-purple-300">
                  <span className="font-bold text-purple-600">A</span>LD
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Coups de pouce du rédacteur */}
      <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-bold text-amber-900 mb-3">
              💡 Coups de pouce du rédacteur
            </h3>
            <ul className="space-y-2 text-amber-800">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>Savoir que la relation médecin-malade est une relation asymétrique et spécifique</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>Savoir que le patient a le droit de disposer d'une information claire et loyale de son état de santé en toute circonstance, mais qu'il peut refuser cette information sous certaines conditions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>Savoir que les modèles autonomistes et les programmes d'éducation thérapeutiques permettent une meilleure compliance et une meilleure autonomie des patients surtout dans le cadre des maladies chroniques</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Référence */}
      <Card className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
        <div className="flex items-center gap-2 text-gray-600">
          <BookOpen className="w-4 h-4" />
          <span className="text-sm">
            Référence : Item de connaissance 2C - OIC-001 - Version imprimable
          </span>
        </div>
      </Card>
    </div>
  );
};
