import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2, Check } from 'lucide-react';

const meta = {
  title: 'Patterns/Complete Form',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Pattern complet de formulaire avec validation Zod, react-hook-form, gestion d\'erreurs, états de chargement et toast de confirmation.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Schéma de validation Zod
const contactFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, { message: 'Le prénom doit contenir au moins 2 caractères' })
    .max(50, { message: 'Le prénom ne peut pas dépasser 50 caractères' }),
  lastName: z
    .string()
    .trim()
    .min(2, { message: 'Le nom doit contenir au moins 2 caractères' })
    .max(50, { message: 'Le nom ne peut pas dépasser 50 caractères' }),
  email: z
    .string()
    .trim()
    .email({ message: 'Email invalide' })
    .max(255, { message: 'L\'email ne peut pas dépasser 255 caractères' }),
  phone: z
    .string()
    .trim()
    .regex(/^(\+33|0)[1-9](\d{2}){4}$/, { message: 'Numéro de téléphone français invalide' })
    .optional()
    .or(z.literal('')),
  subject: z
    .string()
    .trim()
    .min(1, { message: 'Veuillez sélectionner un sujet' }),
  message: z
    .string()
    .trim()
    .min(10, { message: 'Le message doit contenir au moins 10 caractères' })
    .max(1000, { message: 'Le message ne peut pas dépasser 1000 caractères' }),
  terms: z
    .boolean()
    .refine((val) => val === true, {
      message: 'Vous devez accepter les conditions',
    }),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

// Composant de formulaire complet
const CompleteFormExample = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      terms: false,
    },
  });

  const messageValue = watch('message') || '';
  const termsValue = watch('terms');

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      // Simulation d'appel API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Validation côté serveur simulée
      if (data.email.includes('spam')) {
        throw new Error('Cette adresse email n\'est pas autorisée');
      }

      console.log('Données validées:', data);

      setSubmitSuccess(true);
      
      toast({
        title: '✅ Message envoyé avec succès!',
        description: `Merci ${data.firstName}, nous vous répondrons dans les plus brefs délais.`,
        duration: 5000,
      });

      // Reset du formulaire après succès
      setTimeout(() => {
        reset();
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      toast({
        title: '❌ Erreur lors de l\'envoi',
        description: error instanceof Error ? error.message : 'Une erreur inattendue est survenue',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Formulaire de contact</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Remplissez tous les champs pour nous contacter
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Nom et Prénom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                Prénom <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                placeholder="Jean"
                {...register('firstName')}
                disabled={isSubmitting}
                className={errors.firstName ? 'border-destructive' : ''}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Nom <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                placeholder="Dupont"
                {...register('lastName')}
                disabled={isSubmitting}
                className={errors.lastName ? 'border-destructive' : ''}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Email et Téléphone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="jean.dupont@example.com"
                {...register('email')}
                disabled={isSubmitting}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0612345678"
                {...register('phone')}
                disabled={isSubmitting}
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
              <p className="text-xs text-muted-foreground">Optionnel</p>
            </div>
          </div>

          {/* Sujet */}
          <div className="space-y-2">
            <Label htmlFor="subject">
              Sujet <span className="text-destructive">*</span>
            </Label>
            <Select
              disabled={isSubmitting}
              onValueChange={(value) => setValue('subject', value, { shouldValidate: true })}
            >
              <SelectTrigger
                id="subject"
                className={errors.subject ? 'border-destructive' : ''}
              >
                <SelectValue placeholder="Sélectionnez un sujet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Question générale</SelectItem>
                <SelectItem value="support">Support technique</SelectItem>
                <SelectItem value="billing">Facturation</SelectItem>
                <SelectItem value="partnership">Partenariat</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
            {errors.subject && (
              <p className="text-sm text-destructive">{errors.subject.message}</p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="message">
                Message <span className="text-destructive">*</span>
              </Label>
              <span className="text-xs text-muted-foreground">
                {messageValue.length} / 1000
              </span>
            </div>
            <Textarea
              id="message"
              placeholder="Décrivez votre demande en détail..."
              rows={6}
              {...register('message')}
              disabled={isSubmitting}
              className={errors.message ? 'border-destructive' : ''}
            />
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message.message}</p>
            )}
          </div>

          {/* Conditions */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={termsValue}
                onCheckedChange={(checked) =>
                  setValue('terms', checked as boolean, { shouldValidate: true })
                }
                disabled={isSubmitting}
                className={errors.terms ? 'border-destructive' : ''}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="terms"
                  className="text-sm font-normal cursor-pointer"
                >
                  J'accepte les conditions d'utilisation et la politique de confidentialité{' '}
                  <span className="text-destructive">*</span>
                </Label>
              </div>
            </div>
            {errors.terms && (
              <p className="text-sm text-destructive ml-6">{errors.terms.message}</p>
            )}
          </div>

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !isValid || !isDirty}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : submitSuccess ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Message envoyé
                </>
              ) : (
                'Envoyer le message'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={isSubmitting || !isDirty}
            >
              Réinitialiser
            </Button>
          </div>

          {/* Indicateurs d'état */}
          <div className="flex flex-wrap gap-2 text-xs">
            {!isDirty && (
              <span className="px-2 py-1 rounded bg-muted text-muted-foreground">
                Formulaire vide
              </span>
            )}
            {isDirty && !isValid && (
              <span className="px-2 py-1 rounded bg-destructive/10 text-destructive">
                Erreurs de validation
              </span>
            )}
            {isDirty && isValid && !isSubmitting && (
              <span className="px-2 py-1 rounded bg-primary/10 text-primary">
                Prêt à envoyer
              </span>
            )}
            {isSubmitting && (
              <span className="px-2 py-1 rounded bg-primary/10 text-primary">
                Envoi en cours...
              </span>
            )}
            {submitSuccess && (
              <span className="px-2 py-1 rounded bg-success/10 text-success">
                ✓ Envoyé avec succès
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

// Stories
export const Default: Story = {
  render: () => <CompleteFormExample />,
};

export const ValidationShowcase: Story = {
  render: () => (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Règles de validation</h2>
        <p className="text-sm text-muted-foreground">
          Ce formulaire implémente des validations complètes avec Zod
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ValidationRule
          field="Prénom / Nom"
          rules={[
            '2-50 caractères',
            'Espaces trimés automatiquement',
            'Champs obligatoires',
          ]}
        />
        <ValidationRule
          field="Email"
          rules={[
            'Format email valide',
            'Max 255 caractères',
            'Trim automatique',
            'Validation anti-spam côté serveur',
          ]}
        />
        <ValidationRule
          field="Téléphone"
          rules={[
            'Format français (+33 ou 0)',
            '10 chiffres',
            'Champ optionnel',
          ]}
        />
        <ValidationRule
          field="Sujet"
          rules={[
            'Sélection obligatoire',
            '5 options disponibles',
          ]}
        />
        <ValidationRule
          field="Message"
          rules={[
            '10-1000 caractères',
            'Compteur de caractères',
            'Validation en temps réel',
          ]}
        />
        <ValidationRule
          field="Conditions"
          rules={[
            'Acceptation obligatoire',
            'Boolean validation',
          ]}
        />
      </div>

      <div className="p-4 rounded-lg border bg-card space-y-3">
        <h3 className="font-semibold">Fonctionnalités implémentées</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 text-primary mt-0.5" />
            <span>Validation Zod avec messages d'erreur personnalisés</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 text-primary mt-0.5" />
            <span>React Hook Form pour gestion optimisée</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 text-primary mt-0.5" />
            <span>États de chargement avec spinner</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 text-primary mt-0.5" />
            <span>Toast de confirmation succès/erreur</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 text-primary mt-0.5" />
            <span>Validation temps réel (onChange mode)</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 text-primary mt-0.5" />
            <span>Désactivation des champs pendant soumission</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 text-primary mt-0.5" />
            <span>Reset automatique après succès</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 text-primary mt-0.5" />
            <span>Indicateurs visuels d'état du formulaire</span>
          </li>
        </ul>
      </div>
    </div>
  ),
};

const ValidationRule = ({ field, rules }: { field: string; rules: string[] }) => (
  <div className="p-4 rounded-lg border bg-card space-y-2">
    <h4 className="font-semibold text-sm">{field}</h4>
    <ul className="space-y-1">
      {rules.map((rule, index) => (
        <li key={index} className="text-xs text-muted-foreground flex items-start gap-1.5">
          <span className="text-primary mt-0.5">•</span>
          <span>{rule}</span>
        </li>
      ))}
    </ul>
  </div>
);

export const CodeExample: Story = {
  render: () => (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Exemple de code</h2>
        <p className="text-sm text-muted-foreground">
          Comment implémenter ce pattern dans votre application
        </p>
      </div>

      <div className="space-y-4">
        <CodeBlock
          title="1. Installation des dépendances"
          code={`npm install react-hook-form zod @hookform/resolvers`}
          language="bash"
        />

        <CodeBlock
          title="2. Schéma de validation Zod"
          code={`import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email({ message: 'Email invalide' }),
  name: z.string().min(2, { message: 'Min 2 caractères' }),
  message: z.string().min(10).max(1000),
});

type FormData = z.infer<typeof formSchema>;`}
          language="typescript"
        />

        <CodeBlock
          title="3. Configuration React Hook Form"
          code={`const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(formSchema),
  mode: 'onChange', // Validation temps réel
});`}
          language="typescript"
        />

        <CodeBlock
          title="4. Soumission avec états"
          code={`const onSubmit = async (data: FormData) => {
  setIsSubmitting(true);
  try {
    await api.post('/contact', data);
    toast({ title: 'Succès!', description: 'Message envoyé' });
    reset();
  } catch (error) {
    toast({ 
      title: 'Erreur', 
      variant: 'destructive',
      description: error.message 
    });
  } finally {
    setIsSubmitting(false);
  }
};`}
          language="typescript"
        />
      </div>
    </div>
  ),
};

const CodeBlock = ({
  title,
  code,
  language,
}: {
  title: string;
  code: string;
  language: string;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between px-4 py-2 bg-muted rounded-t-lg">
      <span className="text-sm font-semibold">{title}</span>
      <span className="text-xs text-muted-foreground">{language}</span>
    </div>
    <pre className="p-4 bg-muted/50 rounded-b-lg overflow-x-auto">
      <code className="text-sm font-mono">{code}</code>
    </pre>
  </div>
);
