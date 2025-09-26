import React, { useState } from 'react';
import { Bell, Check, X, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Helmet } from 'react-helmet-async';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Nouvel item EDN disponible',
      message: 'Un nouveau contenu de cardiologie vient d\'être ajouté.',
      timestamp: new Date(),
      read: false,
      type: 'info'
    }
  ]);

  return (
    <>
      <Helmet>
        <title>Notifications - MED-MNG</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Bell className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Notifications</h1>
        </div>
        
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{notification.title}</h3>
                    <p className="text-muted-foreground">{notification.message}</p>
                  </div>
                  <Badge variant={notification.read ? "secondary" : "default"}>
                    {notification.read ? "Lu" : "Nouveau"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default Notifications;