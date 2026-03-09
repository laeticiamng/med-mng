

# Plan: Showcase 5 Features on Homepage

## Current State
- All 5 features (Content Library, Creator Studio, Memory Analytics, DPC Certification, Multilingual Toggle) already exist as components in `src/components/library/` and are accessible via the `/library` page tabs.
- The homepage (`Index.tsx`) has: Hero → MusicPlayer → FeatureShowcase → Testimonials → FinalCTA.
- **None of these 5 features are visible or linked from the homepage.**

## What to Build

### 1. New Homepage Section: `ApplePlatformFeatures.tsx`
A new section inserted between `AppleFeatureShowcase` and `AppleTestimonials` in `Index.tsx`. It will showcase the 5 platform capabilities in a visually striking bento grid layout:

- **Catalogue Medical** (BookOpen icon) — "367 items EDN organisés par spécialité, année, difficulté" → CTA links to `/library?tab=content`
- **Studio Créateur** (Wand2 icon) — "Uploadez un PDF, l'IA génère une chanson médicale" → CTA links to `/library?tab=creator`
- **Courbe de Mémoire** (Brain icon) — "Visualisez votre courbe d'Ebbinghaus par sujet" → CTA links to `/library?tab=memory`
- **Certification DPC** (GraduationCap icon) — "Suivez vos modules et téléchargez vos attestations" → CTA links to `/library?tab=dpc`
- **Multilingue** (Globe icon) — "Interface complète en FR, EN, DE, ES" → triggers language selector or links to `/library`

Each card: icon with gradient, title, short description, CTA button. Animated entrance with framer-motion. Uses `TranslatedText` for i18n. Premium glassmorphism aesthetic matching existing sections.

### 2. Update `Index.tsx`
Insert `<ApplePlatformFeatures />` between `<AppleFeatureShowcase />` and `<AppleTestimonials />`.

### 3. Update `LibraryPage.tsx`
Read `tab` from URL search params so that homepage CTAs like `/library?tab=creator` auto-select the correct tab on arrival.

### Files to Create/Edit
- **Create:** `src/components/home/ApplePlatformFeatures.tsx`
- **Edit:** `src/pages/Index.tsx` (add import + render)
- **Edit:** `src/pages/LibraryPage.tsx` (read `?tab=` from URL)

