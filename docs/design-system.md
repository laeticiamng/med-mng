# 🎨 MED-MNG Design System

## Vue d'ensemble

Le design system MED-MNG est conçu spécifiquement pour une application médicale professionnelle, alliant crédibilité médicale et expérience utilisateur moderne.

## 🎯 Philosophie de Design

- **Professionnel & Rassurant** : Couleurs apaisantes inspirées du domaine médical
- **Accessible** : Contrastes optimisés et navigation intuitive
- **Cohérent** : Même expérience sur tous les devices
- **Performant** : Animations fluides et interactions responsives

## 🎨 Palette de Couleurs

### Couleurs Principales (Medical Theme)

```css
/* Bleu médical professionnel */
--primary: 213 94% 68%;           /* #4F90F8 - Bleu confiance */
--primary-hover: 213 94% 58%;     /* #1E6BF0 - Hover état */
--primary-muted: 213 94% 85%;     /* #C5DEFF - Version légère */

/* Vert de guérison */
--accent: 142 76% 36%;            /* #16A34A - Vert médical */
--accent-hover: 142 76% 31%;      /* #15803D - Hover état */
--accent-muted: 142 76% 85%;      /* #BBF7D0 - Version légère */
```

### Couleurs de Status

```css
--success: 142 71% 45%;           /* Succès - Vert */
--warning: 48 96% 53%;            /* Attention - Jaune */
--destructive: 0 84% 60%;         /* Erreur - Rouge */
```

### Couleurs Neutres

```css
--background: 250 250 250;        /* Arrière-plan principal */
--foreground: 15 23 42;           /* Texte principal */
--muted: 210 40% 96%;            /* Éléments discrets */
--border: 213 27% 84%;            /* Bordures */
```

## 🔧 Utilisation des Tokens

### ✅ Correct - Utilisation des tokens sémantiques
```tsx
<Button className="bg-primary text-primary-foreground hover:bg-primary-hover">
  Action principale
</Button>

<Card className="medical-card">
  <CardContent className="text-foreground">
    Contenu de la carte
  </CardContent>
</Card>
```

### ❌ Incorrect - Couleurs directes
```tsx
<Button className="bg-blue-500 text-white hover:bg-blue-600">
  Action principale
</Button>
```

## 🏗️ Composants du Design System

### Boutons Médicaux

```tsx
// Bouton principal
<Button className="medical-btn-primary">Action Principale</Button>

// Bouton secondaire  
<Button className="medical-btn-secondary">Action Secondaire</Button>

// Bouton outline
<Button className="medical-btn-outline">Action Tertiaire</Button>
```

### Cartes Médicales

```tsx
// Carte standard
<Card className="medical-card">
  <CardContent>Contenu standard</CardContent>
</Card>

// Carte premium
<Card className="medical-card-premium">
  <CardContent>Contenu premium</CardContent>
</Card>
```

### Formulaires Médicaux

```tsx
<div>
  <Label className="medical-label">Nom du champ</Label>
  <Input className="medical-input" placeholder="Saisir..." />
</div>
```

### Indicateurs de Status

```tsx
<Badge className="status-success">Succès</Badge>
<Badge className="status-warning">Attention</Badge>
<Badge className="status-error">Erreur</Badge>
```

## 🎬 Animations & Effets

### Animations Médicales

```css
.animate-fade-in-up          /* Apparition douce */
.animate-scale-in            /* Zoom d'entrée */
.animate-medical-pulse       /* Pulsation médicale */
.animate-gentle-float        /* Flottement doux */
.animate-shimmer-medical     /* Effet de brillance */
```

### Effets Visuels

```css
.glass-medical               /* Effet verre dépoli */
.medical-skeleton           /* Loading states */
.medical-focus-ring         /* Focus accessible */
```

## 📏 Espacements & Tailles

### Grid & Layout

```css
.medical-container          /* Container responsive */
.medical-section           /* Section avec padding */
.medical-grid              /* Grille adaptative */
```

### Radius

```css
--radius-sm: 0.5rem;        /* Petit radius */
--radius: 0.75rem;          /* Radius par défaut */
--radius-lg: 1rem;          /* Grand radius */
```

### Ombres

```css
--shadow-soft               /* Ombre douce */
--shadow-medium             /* Ombre moyenne */
--shadow-large              /* Ombre prononcée */
```

## 🌙 Mode Sombre

Le design system supporte automatiquement le mode sombre avec des ajustements spécifiques :

- **Arrière-plans** : Tons sombres avec maintien du contraste
- **Couleurs primaires** : Légèrement plus claires pour la lisibilité
- **Ombres** : Adaptées aux fonds sombres

## 📱 Responsive Design

### Breakpoints

```css
xs: 475px    /* Petit mobile */
sm: 640px    /* Mobile */
md: 768px    /* Tablette */
lg: 1024px   /* Desktop */
xl: 1280px   /* Large desktop */
2xl: 1400px  /* Extra large */
```

### Zones Tactiles

- **Minimum** : 44x44px sur mobile
- **Recommandé** : 48x48px pour le confort
- **Desktop** : Peut être réduit à 40x40px

## 🎯 Guidelines d'Usage

### Navigation

```tsx
// Navigation médicale avec état actif
<nav className="medical-nav">
  <a className="medical-nav-item active">Accueil</a>
  <a className="medical-nav-item">Bibliothèque</a>
</nav>
```

### Gradients Médicaux

```css
background: var(--gradient-medical);    /* Gradient principal */
background: var(--gradient-header);     /* Gradient header */
background: var(--gradient-card);       /* Gradient carte */
```

## ♿ Accessibilité

### Contrastes

- **AA** : Ratio minimum 4.5:1 pour le texte normal
- **AAA** : Ratio minimum 7:1 pour le texte important
- **Focus** : Indicateurs visuels clairs avec `.medical-focus-ring`

### Navigation Clavier

- Tous les éléments interactifs sont accessibles au clavier
- Ordre de tabulation logique
- Skip links disponibles

## 🚀 Performance

### Optimisations

- **CSS Variables** : Changements de thème instantanés
- **Animations** : GPU-accelerated avec `transform`
- **Loading States** : Skeletons avec animation shimmer

### Lazy Loading

```tsx
// Skeleton pendant le chargement
{isLoading && <div className="medical-skeleton h-20 w-full" />}
```

## 📋 Checklist Qualité

### ✅ Avant Release

- [ ] Tous les composants utilisent les tokens du design system
- [ ] Tests responsive sur tous les breakpoints
- [ ] Validation accessibilité (contraste, clavier, screen reader)
- [ ] Performance des animations (60fps)
- [ ] Cohérence visuelle desktop/mobile/tablette
- [ ] Mode sombre fonctionnel
- [ ] Loading states présents partout

### 🔧 Maintenance

- [ ] Documentation à jour avec nouveaux composants
- [ ] Tests visuels automatisés
- [ ] Audit régulier des couleurs non-semantiques
- [ ] Feedback utilisateurs intégré

## 🎨 Exemples d'Intégration

### Page Complète

```tsx
<div className="medical-container">
  <header className="medical-nav">
    {/* Navigation */}
  </header>
  
  <main className="medical-section">
    <div className="medical-grid grid-cols-1 md:grid-cols-3">
      <Card className="medical-card">
        <CardHeader>
          <CardTitle>Titre Médical</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="medical-btn-primary">
            Action
          </Button>
        </CardContent>
      </Card>
    </div>
  </main>
</div>
```

### Formulaire Médical

```tsx
<form className="space-y-4">
  <div>
    <Label className="medical-label">Diagnostic</Label>
    <Input className="medical-input" />
  </div>
  
  <div className="flex gap-2">
    <Button type="submit" className="medical-btn-primary">
      Valider
    </Button>
    <Button type="button" className="medical-btn-secondary">
      Annuler
    </Button>
  </div>
</form>
```

## 📞 Support

Pour toute question sur le design system :

1. **Documentation** : Consultez ce guide complet
2. **Exemples** : Voir les composants existants dans l'app
3. **Tests** : Utilisez les tests visuels automatisés
4. **Feedback** : Proposez des améliorations via les issues

---

*Design System MED-MNG v1.0 - Conçu pour l'excellence médicale* 🏥