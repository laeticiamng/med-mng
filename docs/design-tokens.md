# 🎨 DESIGN TOKENS - MED-MNG

## 🎯 Vue d'ensemble
Système de design cohérent avec tokens sémantiques, composants réutilisables et patterns d'interface standardisés.

## 🎨 Couleurs

### Palette principale
```css
/* Variables CSS définies dans index.css */
:root {
  /* Brand Colors */
  --primary: 220 14% 96%;           /* Bleu principal */
  --primary-foreground: 220 9% 46%; /* Texte sur primary */
  
  /* Secondary Colors */
  --secondary: 220 14% 96%;         /* Gris secondaire */
  --secondary-foreground: 220 9% 46%;
  
  /* Accent Colors */
  --accent: 220 14% 96%;            /* Couleur d'accent */
  --accent-foreground: 220 9% 46%;
  
  /* Status Colors */
  --destructive: 0 84% 60%;         /* Rouge erreur */
  --destructive-foreground: 210 40% 98%;
  
  --success: 142 76% 36%;           /* Vert succès */
  --warning: 38 92% 50%;            /* Orange avertissement */
  --info: 217 91% 60%;              /* Bleu information */
}
```

### Utilisation
```tsx
// ✅ Correct - Utiliser les tokens sémantiques
<Button variant="primary">Action</Button>
<Alert variant="destructive">Erreur</Alert>

// ❌ Incorrect - Éviter les couleurs directes
<button className="bg-red-500">Action</button>
```

## 📏 Espacements

### Échelle d'espacement
```css
/* Système d'espacement cohérent */
--spacing-xs: 0.25rem;    /* 4px */
--spacing-sm: 0.5rem;     /* 8px */
--spacing-md: 1rem;       /* 16px */
--spacing-lg: 1.5rem;     /* 24px */
--spacing-xl: 2rem;       /* 32px */
--spacing-2xl: 3rem;      /* 48px */
--spacing-3xl: 4rem;      /* 64px */
```

### Application
```tsx
// Margins et paddings
className="p-spacing-md m-spacing-lg"

// Gaps dans flexbox/grid
className="gap-spacing-sm"
```

## 🔤 Typographie

### Hiérarchie de texte
```css
/* Tailles de police */
--text-xs: 0.75rem;       /* 12px */
--text-sm: 0.875rem;      /* 14px */
--text-base: 1rem;        /* 16px */
--text-lg: 1.125rem;      /* 18px */
--text-xl: 1.25rem;       /* 20px */
--text-2xl: 1.5rem;       /* 24px */
--text-3xl: 1.875rem;     /* 30px */
--text-4xl: 2.25rem;      /* 36px */

/* Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Familles */
--font-sans: ui-sans-serif, system-ui, sans-serif;
--font-mono: ui-monospace, "Fira Code", monospace;
```

### Composants typographiques
```tsx
// Titres sémantiques
<h1 className="text-4xl font-bold">Titre Principal</h1>
<h2 className="text-2xl font-semibold">Sous-titre</h2>

// Corps de texte
<p className="text-base leading-relaxed">Paragraphe</p>
<span className="text-sm text-muted-foreground">Texte secondaire</span>
```

## 🎭 Animations

### Transitions de base
```css
/* Variables d'animation */
--transition-fast: 150ms ease-out;
--transition-normal: 300ms ease-out;
--transition-slow: 500ms ease-out;

/* Courbes d'animation */
--ease-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.6, 1);
--bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Classes utilitaires
```tsx
// Transitions
className="transition-colors duration-300"
className="hover:scale-105 transition-transform"

// Animations personnalisées
className="animate-fade-in"
className="animate-slide-in-right"
```

## 🔲 Bordures & Rayons

### Rayons de bordure
```css
--radius-none: 0;
--radius-sm: 0.125rem;    /* 2px */
--radius-md: 0.375rem;    /* 6px */
--radius-lg: 0.5rem;      /* 8px */
--radius-xl: 0.75rem;     /* 12px */
--radius-2xl: 1rem;       /* 16px */
--radius-full: 9999px;    /* Cercle complet */
```

### Épaisseurs de bordure
```css
--border-thin: 1px;
--border-normal: 2px;
--border-thick: 4px;
```

## 🌙 Modes sombre/clair

### Variables adaptatives
```css
/* Mode clair (défaut) */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
}

/* Mode sombre */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
}
```

### Utilisation
```tsx
// Couleurs adaptatives automatiques
<div className="bg-background text-foreground">
  <p className="text-muted-foreground">Texte secondaire</p>
</div>
```

## 🧩 Variants avec CVA

### Configuration cva
```tsx
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  // Classes de base
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### Utilisation des variants
```tsx
// Composant Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
}

const Button = ({ variant, size, className, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
};

// Usage
<Button variant="secondary" size="lg">Mon bouton</Button>
```

## 📐 Grilles & Layouts

### Système de grille
```css
/* Grid templates */
--grid-cols-12: repeat(12, minmax(0, 1fr));
--grid-cols-auto: repeat(auto-fit, minmax(250px, 1fr));

/* Container widths */
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;
```

### Breakpoints
```css
/* Responsive breakpoints */
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

## 🎪 Composants de design

### Status badges
```tsx
const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        error: "bg-red-100 text-red-800",
        info: "bg-blue-100 text-blue-800",
      },
    },
  }
);
```

### Cards & Containers
```tsx
const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "border-border",
        elevated: "shadow-lg border-0",
        outlined: "border-2 shadow-none",
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
  }
);
```

## 🔧 Guidelines d'utilisation

### Règles d'or
1. **Toujours utiliser les tokens** au lieu des valeurs hardcodées
2. **Respecter la hiérarchie** typographique et spatiale
3. **Maintenir la cohérence** des variants entre composants
4. **Tester en mode sombre** et clair systématiquement
5. **Documenter les nouveaux patterns** dans Storybook

### Exemples d'application
```tsx
// ✅ Bon exemple - Utilisation cohérente des tokens
<Card variant="elevated" padding="md">
  <h2 className="text-2xl font-semibold mb-spacing-md">Titre</h2>
  <p className="text-base text-muted-foreground mb-spacing-lg">Description</p>
  <Button variant="primary" size="lg">Action</Button>
</Card>

// ❌ Mauvais exemple - Styles hardcodés
<div className="bg-white p-6 rounded-lg shadow-lg">
  <h2 className="text-xl font-bold mb-4 text-gray-900">Titre</h2>
  <p className="text-gray-600 mb-6">Description</p>
  <button className="bg-blue-500 text-white px-6 py-3 rounded">Action</button>
</div>
```

---

**🎨 Ce design system garantit la cohérence visuelle et fonctionnelle de toute la plateforme MED-MNG !**