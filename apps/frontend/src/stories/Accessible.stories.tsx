import type { Meta, StoryObj } from '@storybook/react';
import { 
  AccessibleInput, 
  AccessibleSelect, 
  AccessibleTextarea, 
  AccessibleCheckbox, 
  AccessibleButton,
  SkipLink,
  AccessibleHeading 
} from '@/components/ui/accessible';
import { SelectItem } from '@/components/ui/select';

const meta = {
  title: 'UI/Accessible Components',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Composants avec accessibilité renforcée (ARIA, labels, navigation clavier).',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

export const AccessibleForm: StoryObj = {
  render: () => (
    <div className="max-w-md space-y-6">
      <SkipLink href="#main-content">Aller au contenu principal</SkipLink>
      
      <AccessibleHeading level={2} id="form-heading">
        Formulaire Accessible
      </AccessibleHeading>

      <AccessibleInput
        label="Nom complet"
        placeholder="Entrez votre nom"
        description="Nom et prénom comme sur votre pièce d'identité"
        required
      />

      <AccessibleSelect
        label="Type de contenu"
        description="Sélectionnez le type de contenu à créer"
        required
      >
        <SelectItem value="song">Chanson</SelectItem>
        <SelectItem value="podcast">Podcast</SelectItem>
        <SelectItem value="story">Histoire</SelectItem>
      </AccessibleSelect>

      <AccessibleTextarea
        label="Description"
        placeholder="Décrivez votre contenu..."
        description="Maximum 500 caractères"
        rows={4}
      />

      <AccessibleCheckbox
        label="J'accepte les conditions d'utilisation"
        description="En cochant cette case, vous acceptez nos CGU"
        required
      />

      <AccessibleButton 
        type="submit"
        ariaLabel="Soumettre le formulaire"
      >
        Créer le contenu
      </AccessibleButton>
    </div>
  ),
};

export const LoadingButton: StoryObj = {
  render: () => (
    <div className="space-y-4">
      <AccessibleButton>
        Button normal
      </AccessibleButton>
      
      <AccessibleButton loading loadingText="Génération...">
        Button en chargement
      </AccessibleButton>
      
      <AccessibleButton variant="destructive" disabled>
        Button désactivé
      </AccessibleButton>
    </div>
  ),
};

export const FormWithErrors: StoryObj = {
  render: () => (
    <div className="max-w-md space-y-6">
      <AccessibleInput
        label="Email"
        placeholder="email@example.com"
        error="Format d'email invalide"
        required
      />

      <AccessibleSelect
        label="Pays"
        error="Veuillez sélectionner un pays"
        required
      >
        <SelectItem value="fr">France</SelectItem>
        <SelectItem value="be">Belgique</SelectItem>
        <SelectItem value="ch">Suisse</SelectItem>
      </AccessibleSelect>

      <AccessibleCheckbox
        label="Newsletter"
        description="Recevoir les actualités par email"
        error="Acceptation requise pour continuer"
      />
    </div>
  ),
};