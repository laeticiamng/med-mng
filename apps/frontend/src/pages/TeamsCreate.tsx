import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Users, Globe, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCreateTeam } from '@/hooks/useTeams';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

export default function TeamsCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const createTeam = useCreateTeam();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    visibility: 'public' as 'public' | 'private',
    max_members: 50,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 50),
    });
    if (errors.name) {
      setErrors({ ...errors, name: '' });
    }
  };

  const handleSlugChange = (slug: string) => {
    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 50);

    setFormData({
      ...formData,
      slug: cleanSlug,
    });
    if (errors.slug) {
      setErrors({ ...errors, slug: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Le nom doit contenir au moins 3 caractères';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Le nom ne peut pas dépasser 100 caractères';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Le slug est requis';
    } else if (formData.slug.length < 3) {
      newErrors.slug = 'Le slug doit contenir au moins 3 caractères';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'La description ne peut pas dépasser 500 caractères';
    }

    if (formData.max_members < 2) {
      newErrors.max_members = 'Une équipe doit avoir au moins 2 membres';
    } else if (formData.max_members > 1000) {
      newErrors.max_members = 'Le nombre maximum de membres ne peut pas dépasser 1000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Erreur de validation',
        description: 'Veuillez corriger les erreurs dans le formulaire',
        variant: 'destructive',
      });
      return;
    }

    try {
      const team = await createTeam.mutateAsync(formData);

      toast({
        title: 'Équipe créée !',
        description: `L'équipe "${team.name}" a été créée avec succès.`,
      });

      navigate(`/teams/${team.slug}`);
    } catch (error: any) {
      console.error('Error creating team:', error);

      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        setErrors({ slug: 'Ce slug est déjà utilisé' });
        toast({
          title: 'Erreur',
          description: 'Ce slug est déjà utilisé. Veuillez en choisir un autre.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erreur',
          description: error.message || 'Impossible de créer l\'équipe',
          variant: 'destructive',
        });
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentification requise</CardTitle>
            <CardDescription>Connectez-vous pour créer une équipe</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/med-mng/login">
              <Button className="w-full">Se connecter</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Créer une Équipe | Med-Mng</title>
        <meta name="description" content="Créez une nouvelle équipe et commencez à collaborer" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <Link to="/teams">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux équipes
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Créer une équipe</h1>
            <p className="text-gray-600">
              Créez une équipe pour collaborer avec d'autres étudiants en médecine
            </p>
          </div>

          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de l'équipe</CardTitle>
              <CardDescription>
                Remplissez les informations ci-dessous pour créer votre équipe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nom de l'équipe <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Ex: Cardiologie 2024-2025"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {formData.name.length}/100 caractères
                  </p>
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <Label htmlFor="slug">
                    URL de l'équipe (slug) <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">/teams/</span>
                    <Input
                      id="slug"
                      placeholder="cardiologie-2024-2025"
                      value={formData.slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      className={errors.slug ? 'border-red-500' : ''}
                    />
                  </div>
                  {errors.slug && (
                    <p className="text-sm text-red-500">{errors.slug}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Lettres minuscules, chiffres et tirets uniquement
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez les objectifs de votre équipe..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {formData.description.length}/500 caractères
                  </p>
                </div>

                {/* Visibility */}
                <div className="space-y-3">
                  <Label>Visibilité</Label>
                  <RadioGroup
                    value={formData.visibility}
                    onValueChange={(value: 'public' | 'private') =>
                      setFormData({ ...formData, visibility: value })
                    }
                  >
                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="public" id="public" />
                      <Label htmlFor="public" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <Globe className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Public</span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Tout le monde peut voir et rejoindre cette équipe
                        </p>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="private" id="private" />
                      <Label htmlFor="private" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <Lock className="h-4 w-4 text-gray-600" />
                          <span className="font-medium">Privée</span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Seuls les membres invités peuvent rejoindre
                        </p>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Max Members */}
                <div className="space-y-2">
                  <Label htmlFor="max_members">Nombre maximum de membres</Label>
                  <Input
                    id="max_members"
                    type="number"
                    min="2"
                    max="1000"
                    value={formData.max_members}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_members: parseInt(e.target.value) || 50,
                      })
                    }
                    className={errors.max_members ? 'border-red-500' : ''}
                  />
                  {errors.max_members && (
                    <p className="text-sm text-red-500">{errors.max_members}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Entre 2 et 1000 membres
                  </p>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/teams')}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={createTeam.isPending}
                    className="flex-1 gap-2"
                  >
                    {createTeam.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Création...
                      </>
                    ) : (
                      <>
                        <Users className="h-4 w-4" />
                        Créer l'équipe
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">💡 Conseils</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-700">
              <p>• Choisissez un nom descriptif et facile à retenir</p>
              <p>• Le slug ne pourra pas être modifié après la création</p>
              <p>• Commencez avec une équipe publique pour attirer plus de membres</p>
              <p>• Vous pourrez inviter des membres et créer des channels après la création</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
