
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, Target, Award, AlertCircle } from 'lucide-react';

interface AuditComparatifProps {
  itemCode?: string;
}

export const AuditComparatif = ({ itemCode = 'IC-4' }: AuditComparatifProps) => {
  const donneesComparatives = [
    { item: 'IC-1', conformite: 88, completude: 85, pedagogie: 90, actualite: 82, global: 86 },
    { item: 'IC-2', conformite: 92, completude: 89, pedagogie: 87, actualite: 88, global: 89 },
    { item: 'IC-3', conformite: 85, completude: 82, pedagogie: 84, actualite: 80, global: 83 },
    { item: 'IC-4', conformite: 95, completude: 98, pedagogie: 92, actualite: 94, global: 95 },
    { item: 'IC-5', conformite: 87, completude: 84, pedagogie: 86, actualite: 83, global: 85 }
  ];

  const donneesRadar = [
    { critere: 'Conformité E-LiSA', IC4: 95, Moyenne: 87 },
    { critere: 'Complétude', IC4: 98, Moyenne: 85 },
    { critere: 'Pédagogie', IC4: 92, Moyenne: 87 },
    { critere: 'Actualité', IC4: 94, Moyenne: 83 },
    { critere: 'Innovation', IC4: 96, Moyenne: 82 },
    { critere: 'Différenciation', IC4: 94, Moyenne: 84 }
  ];

  const itemIC4 = donneesComparatives.find(item => item.item === itemCode);
  const moyenneGenerale = Math.round(
    donneesComparatives.reduce((sum, item) => sum + item.global, 0) / donneesComparatives.length
  );

  const avantages = [
    {
      titre: "Leader conformité E-LiSA",
      description: "95% vs 87% moyenne - Respect intégral des référentiels",
      icon: <Award className="h-5 w-5 text-gold-500" />
    },
    {
      titre: "Complétude exceptionnelle", 
      description: "98% vs 85% moyenne - 52 concepts exhaustifs",
      icon: <Target className="h-5 w-5 text-blue-500" />
    },
    {
      titre: "Innovation pédagogique",
      description: "96% vs 82% moyenne - Approches différenciantes",
      icon: <TrendingUp className="h-5 w-5 text-green-500" />
    }
  ];

  return (
    <div className="space-y-6 p-4">
      {/* En-tête comparatif */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Audit Comparatif - Items IC-1 à IC-5</h2>
        <div className="flex justify-center space-x-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{itemIC4?.global}%</div>
            <div className="text-sm text-gray-600">IC-4 Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-600">{moyenneGenerale}%</div>
            <div className="text-sm text-gray-600">Moyenne Items</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">+{itemIC4 ? itemIC4.global - moyenneGenerale : 0}</div>
            <div className="text-sm text-gray-600">Écart positif</div>
          </div>
        </div>
      </div>

      {/* Graphique en barres comparatives */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Scores par item EDN</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={donneesComparatives}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="item" />
            <YAxis domain={[70, 100]} />
            <Tooltip />
            <Bar dataKey="global" fill="#3B82F6" name="Score Global" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Radar chart détaillé */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Analyse multidimensionnelle IC-4</h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={donneesRadar}>
            <PolarGrid />
            <PolarAngleAxis dataKey="critere" />
            <PolarRadiusAxis domain={[70, 100]} />
            <Radar name="IC-4" dataKey="IC4" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
            <Radar name="Moyenne" dataKey="Moyenne" stroke="#6B7280" fill="#6B7280" fillOpacity={0.1} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </Card>

      {/* Avantages concurrentiels */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-green-50">
        <h3 className="text-lg font-semibold mb-4">Avantages concurrentiels IC-4</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {avantages.map((avantage, index) => (
            <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                {avantage.icon}
                <h4 className="font-medium text-gray-800">{avantage.titre}</h4>
              </div>
              <p className="text-sm text-gray-600">{avantage.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Tableau détaillé */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Comparaison détaillée par critère</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Item</th>
                <th className="text-center p-2">Conformité</th>
                <th className="text-center p-2">Complétude</th>
                <th className="text-center p-2">Pédagogie</th>
                <th className="text-center p-2">Actualité</th>
                <th className="text-center p-2">Global</th>
                <th className="text-center p-2">Rang</th>
              </tr>
            </thead>
            <tbody>
              {donneesComparatives
                .sort((a, b) => b.global - a.global)
                .map((item, index) => (
                <tr key={item.item} className={`border-b ${item.item === 'IC-4' ? 'bg-blue-50 font-medium' : ''}`}>
                  <td className="p-2">{item.item}</td>
                  <td className="text-center p-2">
                    <Badge className={item.conformite >= 90 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {item.conformite}%
                    </Badge>
                  </td>
                  <td className="text-center p-2">
                    <Badge className={item.completude >= 90 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {item.completude}%
                    </Badge>
                  </td>
                  <td className="text-center p-2">
                    <Badge className={item.pedagogie >= 90 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {item.pedagogie}%
                    </Badge>
                  </td>
                  <td className="text-center p-2">
                    <Badge className={item.actualite >= 90 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {item.actualite}%
                    </Badge>
                  </td>
                  <td className="text-center p-2">
                    <Badge className={item.global >= 90 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                      {item.global}%
                    </Badge>
                  </td>
                  <td className="text-center p-2">
                    {index === 0 && <Award className="h-4 w-4 text-gold-500 mx-auto" />}
                    {index > 0 && <span className="text-gray-500">#{index + 1}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recommandations stratégiques */}
      <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <h3 className="text-lg font-semibold text-gray-800">Recommandations stratégiques</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-green-700 mb-2">✅ Maintenir l'excellence IC-4</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Capitaliser sur le leadership conformité E-LiSA</li>
              <li>• Exploiter l'avance pédagogique différenciante</li>
              <li>• Renforcer position référence qualité-sécurité</li>
              <li>• Partager bonnes pratiques autres items</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-700 mb-2">🎯 Opportunités d'amélioration</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Harmoniser niveau autres items IC sur IC-4</li>
              <li>• Développer synergies inter-items</li>
              <li>• Étendre innovations pédagogiques IC-4</li>
              <li>• Créer parcours transversal qualité-sécurité</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
