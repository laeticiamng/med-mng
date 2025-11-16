import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Timer, BookOpen, Target, Brain } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SessionsDashboard() {
  const sessionTypes = [
    { title: 'Sessions d\'Étude', icon: BookOpen, route: ROUTE_PATHS.sessionsStudy, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { title: 'Sessions de Focus', icon: Target, route: ROUTE_PATHS.sessionsFocus, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { title: 'Sessions de Méditation', icon: Brain, route: ROUTE_PATHS.sessionsMeditation, color: 'text-green-600', bgColor: 'bg-green-50' },
  ];

  return (
    <>
      <Helmet><title>Sessions | Med-Mng</title></Helmet>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Timer className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Mes Sessions</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sessionTypes.map((type) => (
            <Card key={type.route} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${type.bgColor} flex items-center justify-center mb-3`}>
                  <type.icon className={`w-6 h-6 ${type.color}`} />
                </div>
                <CardTitle>{type.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Link to={type.route}>
                  <Button className="w-full">Voir les sessions</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
