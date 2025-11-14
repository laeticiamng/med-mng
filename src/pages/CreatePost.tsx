import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTE_PATHS } from '@/config/routes'
import { Button } from '@/components/ui/button'
import { CreatePostForm } from '@/components/posts/CreatePostForm'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent } from '@/components/ui/card'

export default function CreatePost() {
  const navigate = useNavigate()
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Veuillez vous connecter pour créer un post.
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
      <div className="container max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link to={ROUTE_PATHS.posts}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux posts
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Créer un post</h1>
          <p className="text-muted-foreground mt-2">
            Partagez votre histoire, expérience ou idée avec la communauté
          </p>
        </div>

        {/* Form */}
        <CreatePostForm
          onSuccess={() => {
            navigate(ROUTE_PATHS.posts)
          }}
        />
      </div>
    </div>
  )
}
