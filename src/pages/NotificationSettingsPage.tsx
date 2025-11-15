import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ROUTE_PATHS } from '@/config/routes'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import NotificationPreferences from '@/components/notifications/NotificationPreferences'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'

export default function NotificationSettingsPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Veuillez vous connecter pour accéder aux paramètres de notification.
            </p>
            <Link to={ROUTE_PATHS.medMngLogin}>
              <Button className="w-full">Se connecter</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Paramètres de Notification - Med-Mng</title>
        <meta
          name="description"
          content="Gérez vos préférences de notification et vos paramètres d'alerte"
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to={ROUTE_PATHS.notifications}>
              <Button variant="ghost" size="icon" data-testid="back-button">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Paramètres de notification</h1>
              <p className="text-muted-foreground mt-2">
                Personnalisez vos préférences d'alerte et de communication
              </p>
            </div>
          </div>

          {/* Preferences Component */}
          <NotificationPreferences userId={user.id} />
        </div>
      </div>
    </>
  )
}
