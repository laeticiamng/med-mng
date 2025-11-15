import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@/config/routes'
import { ArrowLeft, Upload, Loader } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/components/med-mng/AuthProvider'
import { useFetchProfileWithStats, useUpdateProfile } from '@/hooks/useUserProfile'
import { toast } from 'sonner'

export default function ProfileEdit() {
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()

  const { data: profile, isLoading: profileLoading } = useFetchProfileWithStats(currentUser?.id || '')
  const updateMutation = useUpdateProfile(currentUser?.id || '')

  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    location: '',
    occupation: '',
    website: '',
    education: '',
  })

  const [isFormReady, setIsFormReady] = useState(false)

  // Initialize form data when profile loads
  if (profile && !isFormReady) {
    setFormData({
      displayName: profile.display_name || '',
      bio: profile.bio || '',
      location: profile.location || '',
      occupation: profile.occupation || '',
      website: profile.website || '',
      education: profile.education || '',
    })
    setIsFormReady(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    updateMutation.mutate(
      {
        displayName: formData.displayName,
        bio: formData.bio,
        location: formData.location,
        occupation: formData.occupation,
        website: formData.website,
        education: formData.education,
      },
      {
        onSuccess: () => {
          toast.success('Profil mis à jour avec succès')
          navigate(ROUTE_PATHS.userProfile.replace(':userId', currentUser?.id || ''))
        },
        onError: () => {
          toast.error('Erreur lors de la mise à jour du profil')
        },
      }
    )
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Veuillez vous connecter pour modifier votre profil.
            </p>
            <Link to={ROUTE_PATHS.medMngLogin}>
              <Button className="w-full">Se connecter</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container max-w-2xl mx-auto px-4">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Profil introuvable</p>
            <Link to={ROUTE_PATHS.userProfile.replace(':userId', currentUser.id)}>
              <Button variant="outline" className="mt-4">
                Retour au profil
              </Button>
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
          <Link to={ROUTE_PATHS.userProfile.replace(':userId', currentUser.id)}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au profil
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Modifier mon profil</h1>
          <p className="text-muted-foreground mt-2">
            Personnalisez votre profil et vos informations
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="mb-8">
          <AlertDescription>
            Les modifications apparaîtront immédiatement sur votre profil public
          </AlertDescription>
        </Alert>

        {/* Profile Edit Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Informations de profil</CardTitle>
            <CardDescription>
              Mettez à jour vos informations personnelles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-2xl">
                    {(profile.display_name || 'U')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Button variant="outline" type="button" disabled={true} className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Changer la photo (Bientôt disponible)
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Formats supportés: JPG, PNG (Max 5MB)
                  </p>
                </div>
              </div>

              {/* Verification Badge */}
              {profile.verified && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-blue-100">
                    ✓ Vérifié
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Votre compte a été vérifié
                  </p>
                </div>
              )}

              {/* Display Name */}
              <div className="space-y-2">
                <label htmlFor="displayName" className="text-sm font-medium">
                  Nom d'affichage
                </label>
                <Input
                  id="displayName"
                  name="displayName"
                  placeholder="Votre nom"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  maxLength={100}
                  data-testid="display-name-input"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.displayName.length}/100 caractères
                </p>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label htmlFor="bio" className="text-sm font-medium">
                  Biographie
                </label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Parlez de vous..."
                  value={formData.bio}
                  onChange={handleInputChange}
                  maxLength={500}
                  rows={4}
                  data-testid="bio-input"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.bio.length}/500 caractères
                </p>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium">
                  Localisation
                </label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Votre localisation"
                  value={formData.location}
                  onChange={handleInputChange}
                  maxLength={100}
                  data-testid="location-input"
                />
              </div>

              {/* Occupation */}
              <div className="space-y-2">
                <label htmlFor="occupation" className="text-sm font-medium">
                  Métier/Profession
                </label>
                <Input
                  id="occupation"
                  name="occupation"
                  placeholder="Votre profession"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  maxLength={100}
                  data-testid="occupation-input"
                />
              </div>

              {/* Education */}
              <div className="space-y-2">
                <label htmlFor="education" className="text-sm font-medium">
                  Formation/Études
                </label>
                <Input
                  id="education"
                  name="education"
                  placeholder="Votre formation"
                  value={formData.education}
                  onChange={handleInputChange}
                  maxLength={100}
                  data-testid="education-input"
                />
              </div>

              {/* Website */}
              <div className="space-y-2">
                <label htmlFor="website" className="text-sm font-medium">
                  Site web / Portfolio
                </label>
                <Input
                  id="website"
                  name="website"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={handleInputChange}
                  maxLength={255}
                  type="url"
                  data-testid="website-input"
                />
                <p className="text-xs text-muted-foreground">
                  Inclure https:// ou http://
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  data-testid="save-profile-button"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer les modifications'
                  )}
                </Button>
                <Link to={ROUTE_PATHS.userProfile.replace(':userId', currentUser.id)}>
                  <Button variant="outline">Annuler</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Privacy Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Confidentialité</CardTitle>
            <CardDescription>
              Contrôlez qui peut voir votre profil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Profil public</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.is_public
                      ? 'Tout le monde peut voir votre profil'
                      : 'Seuls les utilisateurs connectés peuvent voir votre profil'}
                  </p>
                </div>
                <Badge variant={profile.is_public ? 'default' : 'secondary'}>
                  {profile.is_public ? 'Public' : 'Privé'}
                </Badge>
              </div>
              <Button
                variant="outline"
                className="w-full"
                type="button"
                disabled={true}
              >
                Gérer les paramètres de confidentialité (Bientôt disponible)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
