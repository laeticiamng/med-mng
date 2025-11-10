# 🎨 Guide du Design System MED-MNG

## Table des Matières
1. [Introduction](#introduction)
2. [Principes Fondamentaux](#principes-fondamentaux)
3. [Tokens Sémantiques](#tokens-sémantiques)
4. [Exemples Avant/Après](#exemples-avantaprès)
5. [Composants UI](#composants-ui)
6. [Règles à Respecter](#règles-à-respecter)
7. [Checklist de Review](#checklist-de-review)

---

## Introduction

Le design system MED-MNG utilise des **tokens sémantiques HSL** définis dans `src/index.css` et `tailwind.config.ts`. Ces tokens garantissent:
- ✅ Cohérence visuelle sur toute l'application
- ✅ Support automatique du mode sombre
- ✅ Accessibilité (contraste minimum 4.5:1)
- ✅ Maintenabilité à long terme

**🚫 RÈGLE D'OR**: Ne jamais utiliser de couleurs hardcodées (text-white, bg-blue-500, etc.)

---

## Principes Fondamentaux

### 1. Tokens Sémantiques > Couleurs Directes

```tsx
// ❌ MAUVAIS - Couleurs hardcodées
<Button className="bg-blue-600 hover:bg-blue-700 text-white">
  Cliquer ici
</Button>

// ✅ BON - Tokens sémantiques
<Button variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90">
  Cliquer ici
</Button>

// ✅ MEILLEUR - Utiliser les variants prédéfinis
<Button variant="default">
  Cliquer ici
</Button>
```

### 2. Variants de Composants > Classes Utilitaires

```tsx
// ❌ MAUVAIS
<Badge className="bg-green-100 text-green-800 border-green-200">
  Succès
</Badge>

// ✅ BON
<Badge variant="success">
  Succès
</Badge>
```

### 3. Design System First

Avant d'ajouter du CSS custom:
1. ✅ Vérifier si un token existe dans `index.css`
2. ✅ Vérifier si un variant existe dans le composant
3. ✅ Créer un nouveau token/variant si besoin récurrent
4. ❌ Éviter le CSS inline ou les classes utilitaires hardcodées

---

## Tokens Sémantiques

### Couleurs Principales

| Token | Usage | Exemple |
|-------|-------|---------|
| `bg-background` | Fond principal | Pages, sections |
| `text-foreground` | Texte principal | Paragraphes, titres |
| `bg-card` | Fond des cartes | Cards, panels |
| `text-card-foreground` | Texte sur cartes | Contenu des cards |

### Couleurs Primaires (Médical)

```css
/* Défini dans index.css */
--primary: 213 94% 68%;              /* Bleu médical professionnel */
--primary-foreground: 0 0% 100%;     /* Texte sur primary (blanc) */
--primary-hover: 213 94% 58%;        /* État hover */
--primary-muted: 213 94% 85%;        /* Version atténuée */
```

| Classe Tailwind | Usage |
|-----------------|-------|
| `bg-primary` | Boutons principaux, liens importants |
| `text-primary` | Liens, accents |
| `bg-primary-hover` | État hover personnalisé |
| `bg-primary-muted` | Backgrounds légers |
| `text-primary-foreground` | Texte sur fond primary |

### Couleurs Secondaires

```css
--secondary: 213 27% 95%;
--secondary-foreground: 51 65% 20%;
--secondary-hover: 213 27% 88%;
```

| Classe | Usage |
|--------|-------|
| `bg-secondary` | Boutons secondaires, zones alternatives |
| `text-secondary-foreground` | Texte sur fond secondary |

### Couleurs d'Accent (Healing Green)

```css
--accent: 142 76% 36%;               /* Vert médical */
--accent-foreground: 355 7% 97%;
--accent-hover: 142 76% 31%;
--accent-muted: 142 76% 85%;
```

### Couleurs de Status

```css
--success: 142 71% 45%;              /* Vert succès */
--success-foreground: 355 7% 97%;
--warning: 48 96% 53%;               /* Jaune/Orange warning */
--warning-foreground: 213 32% 19%;
--destructive: 0 84% 60%;            /* Rouge erreur */
--destructive-foreground: 210 40% 98%;
```

### Couleurs Neutres

```css
--muted: 210 40% 96%;                /* Backgrounds atténués */
--muted-foreground: 215 16% 47%;    /* Texte secondaire */
--border: 213 27% 84%;               /* Bordures */
--input: 213 27% 84%;                /* Bordures d'input */
```

---

## Exemples Avant/Après

### 1. Badges de Status

```tsx
// ❌ AVANT - Couleurs hardcodées
<Badge className="bg-green-100 text-green-800 border-green-200">
  Validé
</Badge>
<Badge className="bg-red-100 text-red-800 border-red-200">
  Erreur
</Badge>
<Badge className="bg-blue-100 text-blue-800 border-blue-200">
  En cours
</Badge>

// ✅ APRÈS - Variants sémantiques
<Badge variant="success">Validé</Badge>
<Badge variant="destructive">Erreur</Badge>
<Badge variant="default">En cours</Badge>
<Badge variant="warning">Attention</Badge>
```

### 2. Boutons d'Action

```tsx
// ❌ AVANT
<Button className="bg-amber-600 hover:bg-amber-700 text-white">
  Générer
</Button>
<Button className="bg-blue-600 hover:bg-blue-700 text-white">
  Voir les tarifs
</Button>

// ✅ APRÈS
<Button variant="default" className="bg-warning text-warning-foreground hover:bg-warning/90">
  Générer
</Button>
<Button variant="default">
  Voir les tarifs
</Button>
```

### 3. Cards avec Couleurs

```tsx
// ❌ AVANT
<Card className="border-green-200 bg-green-50">
  <CardHeader>
    <div className="p-3 bg-green-100 rounded-lg">
      <CheckCircle className="h-6 w-6 text-green-600" />
    </div>
  </CardHeader>
</Card>

// ✅ APRÈS
<Card className="border-success/20 bg-success/5">
  <CardHeader>
    <div className="p-3 bg-success/10 rounded-lg">
      <CheckCircle className="h-6 w-6 text-success" />
    </div>
  </CardHeader>
</Card>
```

### 4. Status Indicators

```tsx
// ❌ AVANT
case 'healthy': return 'bg-green-100 text-green-800';
case 'warning': return 'bg-yellow-100 text-yellow-800';
case 'error': return 'bg-red-100 text-red-800';

// ✅ APRÈS
case 'healthy': return 'bg-success/10 text-success border-success/20';
case 'warning': return 'bg-warning/10 text-warning-foreground border-warning/20';
case 'error': return 'bg-destructive/10 text-destructive border-destructive/20';
```

### 5. Texte et Backgrounds

```tsx
// ❌ AVANT
<div className="bg-gray-50 text-gray-600">
  <p className="text-gray-900">Titre</p>
  <span className="text-gray-500">Description</span>
</div>

// ✅ APRÈS
<div className="bg-muted text-muted-foreground">
  <p className="text-foreground">Titre</p>
  <span className="text-muted-foreground">Description</span>
</div>
```

### 6. Boutons Outline

```tsx
// ❌ AVANT
<Button className="border-amber-600 text-amber-600 hover:bg-amber-50">
  Action
</Button>

// ✅ APRÈS
<Button variant="outline" className="border-warning text-warning hover:bg-warning/10">
  Action
</Button>
```

### 7. Icons et Accents

```tsx
// ❌ AVANT
<div className="w-16 h-16 bg-blue-100 rounded-full">
  <BookOpen className="text-blue-600" />
</div>

// ✅ APRÈS
<div className="w-16 h-16 bg-primary/10 rounded-full">
  <BookOpen className="text-primary" />
</div>
```

### 8. Gradients

```tsx
// ❌ AVANT
<div className="bg-gradient-to-br from-amber-100 to-orange-100">
  Contenu
</div>

// ✅ APRÈS
<div className="bg-gradient-to-br from-warning/10 to-warning/20">
  Contenu
</div>

// ✅ ENCORE MIEUX - Utiliser les gradients prédéfinis
<div className="bg-gradient-medical">
  Contenu
</div>
```

---

## Composants UI

### Button Variants

```tsx
// Variants disponibles
<Button variant="default">      {/* Primary action */}
<Button variant="secondary">    {/* Secondary action */}
<Button variant="outline">      {/* Outline style */}
<Button variant="ghost">        {/* Minimal style */}
<Button variant="destructive">  {/* Danger action */}
<Button variant="link">         {/* Link style */}

// Sizes
<Button size="sm">   {/* Small */}
<Button size="default"> {/* Default */}
<Button size="lg">   {/* Large */}
<Button size="icon"> {/* Square icon */}
```

### Badge Variants

```tsx
// Nouveaux variants sémantiques
<Badge variant="default">       {/* Primary badge */}
<Badge variant="secondary">     {/* Secondary badge */}
<Badge variant="success">       {/* Success state */}
<Badge variant="warning">       {/* Warning state */}
<Badge variant="destructive">   {/* Error state */}
<Badge variant="outline">       {/* Outline style */}
```

### Card Variants (via PremiumCard)

```tsx
<PremiumCard variant="default">   {/* Standard card */}
<PremiumCard variant="elevated">  {/* With shadow */}
<PremiumCard variant="gradient">  {/* With gradient */}
<PremiumCard variant="glass">     {/* Glassmorphism */}
```

---

## Règles à Respecter

### ✅ À FAIRE

1. **Toujours utiliser les tokens sémantiques**
   ```tsx
   bg-primary, text-foreground, border-border, bg-success
   ```

2. **Utiliser les variants de composants existants**
   ```tsx
   <Button variant="default">
   <Badge variant="success">
   ```

3. **Utiliser les opacités avec `/`**
   ```tsx
   bg-primary/10, text-success/80, border-warning/20
   ```

4. **Créer des variants pour les cas récurrents**
   ```tsx
   // Dans button.tsx
   premium: "bg-gradient-medical shadow-premium"
   ```

5. **Utiliser les classes utilitaires du design system**
   ```tsx
   .medical-card, .medical-btn-primary, .status-success
   ```

### ❌ À ÉVITER

1. **Couleurs hardcodées**
   ```tsx
   bg-blue-500, text-white, border-green-300 ❌
   ```

2. **Classes Tailwind directes pour les couleurs**
   ```tsx
   text-gray-600, bg-amber-100 ❌
   ```

3. **Styles inline**
   ```tsx
   style={{ color: '#3b82f6' }} ❌
   ```

4. **Couleurs RGB/HEX dans le code**
   ```tsx
   background: rgba(59, 130, 246, 0.1) ❌
   ```

---

## Checklist de Review

Avant de commiter du code, vérifier:

- [ ] ✅ Aucune couleur hardcodée (blue-500, green-100, etc.)
- [ ] ✅ Utilisation des tokens sémantiques (primary, success, warning)
- [ ] ✅ Variants de composants utilisés quand disponibles
- [ ] ✅ Support du mode sombre (automatique avec tokens)
- [ ] ✅ Contraste suffisant (4.5:1 minimum)
- [ ] ✅ Pas de `text-white` ou `bg-white` (utiliser tokens)
- [ ] ✅ Pas de styles inline pour les couleurs
- [ ] ✅ Classes utilitaires du design system utilisées quand approprié

---

## Mode Sombre

Le mode sombre est **automatiquement géré** par les tokens. Ne jamais utiliser `dark:` prefix avec des couleurs hardcodées:

```tsx
// ❌ MAUVAIS
<div className="bg-white dark:bg-gray-900">
  <p className="text-gray-900 dark:text-white">Texte</p>
</div>

// ✅ BON - Mode sombre automatique
<div className="bg-background">
  <p className="text-foreground">Texte</p>
</div>
```

---

## Gradients Prédéfinis

```css
/* Disponibles dans index.css */
bg-gradient-medical    /* Primary → Accent */
bg-gradient-header     /* Header gradient */
bg-gradient-card       /* Card gradient */
```

Usage:
```tsx
<div className="bg-gradient-medical">
  Contenu avec gradient
</div>
```

---

## Ombres et Effets

```css
/* Classes prédéfinies */
shadow-soft      /* Ombre douce */
shadow-medium    /* Ombre moyenne */
shadow-large     /* Ombre large */
shadow-premium   /* Ombre premium */
shadow-medical   /* Ombre thématique */
```

---

## Classes Utilitaires Personnalisées

```css
/* Boutons médicaux */
.medical-btn-primary     /* Bouton principal avec gradient */
.medical-btn-secondary   /* Bouton secondaire */
.medical-btn-outline     /* Bouton outline */

/* Cards */
.medical-card           /* Card standard */
.medical-card-premium   /* Card premium avec gradient */

/* Status */
.status-success         /* Badge succès */
.status-warning         /* Badge warning */
.status-error           /* Badge erreur */

/* Navigation */
.medical-nav           /* Navigation bar */
.medical-nav-item      /* Item de navigation */

/* Forms */
.medical-input         /* Input avec focus ring */
.medical-label         /* Label de formulaire */
```

---

## Migration d'un Composant

### Étapes:

1. **Identifier les couleurs hardcodées**
   ```bash
   # Rechercher dans le fichier
   text-white|bg-blue-|text-green-|bg-amber-
   ```

2. **Mapper vers les tokens**
   - `bg-blue-600` → `bg-primary`
   - `text-green-600` → `text-success`
   - `bg-amber-100` → `bg-warning/10`
   - `text-white` → `text-primary-foreground`

3. **Utiliser les variants existants**
   - Vérifier si un variant existe dans le composant
   - Sinon, créer un nouveau variant si usage récurrent

4. **Tester le mode sombre**
   - Vérifier que le contraste est suffisant
   - Vérifier l'apparence générale

5. **Review et commit**

---

## Ressources

- **Design System**: `src/index.css`
- **Config Tailwind**: `tailwind.config.ts`
- **Composants UI**: `src/components/ui/`
- **Badge Component**: `src/components/ui/badge.tsx`
- **Button Component**: `src/components/ui/button.tsx`

---

## Support

Pour toute question sur le design system:
1. Consulter ce guide
2. Vérifier les tokens dans `index.css`
3. Examiner les composants existants dans `src/components/ui/`
4. Créer un variant si besoin récurrent

---

**Version**: 1.0  
**Dernière mise à jour**: 2025  
**Maintenu par**: Équipe MED-MNG
