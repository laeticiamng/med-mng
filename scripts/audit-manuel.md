# 🔍 Guide d'Audit Lighthouse Manuel

## Méthode 1: Chrome DevTools (Recommandée)

### Étapes:
1. **Ouvrir votre application** dans Chrome
   - Accédez à: `https://med-mng.lovable.app` (ou votre URL locale)

2. **Ouvrir les DevTools**
   - Windows/Linux: `F12` ou `Ctrl+Shift+I`
   - Mac: `Cmd+Option+I`

3. **Accéder à Lighthouse**
   - Cliquez sur l'onglet "Lighthouse" dans DevTools
   - Si non visible, cliquez sur `>>` et sélectionnez "Lighthouse"

4. **Configurer l'audit**
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO
   - Device: Desktop ET Mobile (faire 2 audits)

5. **Lancer l'audit**
   - Cliquer sur "Analyze page load"
   - Attendre 30-60 secondes

6. **Analyser les résultats**
   - Voir les scores détaillés
   - Examiner les opportunités d'amélioration
   - Télécharger le rapport (icône ⬇️)

---

## Méthode 2: PageSpeed Insights (Google)

### Étapes:
1. Aller sur: https://pagespeed.web.dev/
2. Entrer l'URL: `https://med-mng.lovable.app`
3. Cliquer sur "Analyser"
4. Obtenir scores pour Desktop ET Mobile

**Avantages:**
- Données réelles d'utilisateurs (CrUX)
- Pas besoin d'installer quoi que ce soit
- Partage facile des résultats

---

## Méthode 3: Lighthouse CI (Automatisé)

### Installation:
```bash
npm install -g @lhci/cli
```

### Configuration:
Créer `.lighthouserc.json`:
```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:5173"],
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.85}],
        "categories:accessibility": ["error", {"minScore": 0.95}],
        "categories:seo": ["error", {"minScore": 0.95}],
        "categories:best-practices": ["error", {"minScore": 0.90}]
      }
    }
  }
}
```

### Lancer l'audit:
```bash
lhci autorun
```

---

## 🎯 Scores Cibles

### Objectifs MED-MNG:

| Catégorie | Score Minimum | Score Idéal |
|-----------|---------------|-------------|
| **Performance** | 85 | 95+ |
| **Accessibility** | 95 | 100 |
| **Best Practices** | 90 | 100 |
| **SEO** | 95 | 100 |

---

## 📊 Checklist Post-Audit

### Performance
- [ ] FCP < 1.8s (First Contentful Paint)
- [ ] LCP < 2.5s (Largest Contentful Paint)
- [ ] TBT < 300ms (Total Blocking Time)
- [ ] CLS < 0.1 (Cumulative Layout Shift)
- [ ] SI < 3.4s (Speed Index)

### Accessibilité
- [ ] Tous les boutons ont des aria-labels
- [ ] Images ont des attributs alt descriptifs
- [ ] Contraste WCAG AAA (7:1 pour texte normal)
- [ ] Navigation au clavier fonctionnelle
- [ ] Screen reader compatible

### SEO
- [ ] Balise `<title>` unique et descriptive
- [ ] Meta description < 160 caractères
- [ ] Une seule balise `<h1>` par page
- [ ] Liens crawlables (pas de JavaScript)
- [ ] Sitemap.xml présent

### Best Practices
- [ ] HTTPS activé
- [ ] Pas d'erreurs console
- [ ] Images optimisées (WebP)
- [ ] CSP (Content Security Policy) configuré

---

## 🔧 Corrections Rapides

### Si Performance < 85:
```bash
# Optimiser les images
npm run optimize-images

# Analyser le bundle
npm run build -- --analyze

# Activer la compression
# Vérifier dans netlify.toml ou vercel.json
```

### Si Accessibility < 95:
- Ajouter `aria-label` aux boutons icon-only
- Vérifier contraste avec https://webaim.org/resources/contrastchecker/
- Tester navigation clavier (Tab, Enter, Esc)

### Si SEO < 95:
- Vérifier robots.txt
- Ajouter sitemap.xml
- Valider meta tags avec https://metatags.io/

---

## 📱 Audit Mobile

**Important:** Toujours tester en mode mobile!

### Checklist Mobile:
- [ ] Score Lighthouse Mobile > 85
- [ ] Touch targets ≥ 48x48px
- [ ] Texte lisible sans zoom (16px min)
- [ ] Pas de scroll horizontal
- [ ] Viewport meta tag configuré

---

## 🚀 Automatisation GitHub Actions

Pour automatiser les audits à chaque déploiement:

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://med-mng.lovable.app
          uploadArtifacts: true
```

---

## 📈 Suivi des Métriques

### Outils recommandés:
1. **Google Analytics 4** - Core Web Vitals
2. **Sentry** - Performance monitoring
3. **WebPageTest** - Tests détaillés
4. **Calibre** - Monitoring continu

### Fréquence:
- **Développement:** Avant chaque PR
- **Staging:** Chaque déploiement
- **Production:** Hebdomadaire

---

## ✅ Rapport d'Audit

Après chaque audit, documenter:
```markdown
## Audit Lighthouse - [Date]

### Scores
- Performance: XX/100
- Accessibility: XX/100
- Best Practices: XX/100
- SEO: XX/100

### Problèmes Critiques
1. [Description]
2. [Description]

### Actions
- [ ] Action 1
- [ ] Action 2

### Prochaines Étapes
[Plan d'amélioration]
```

---

## 🆘 Support

Si scores < objectifs:
1. Consulter le rapport détaillé
2. Prioriser les items "Opportunities"
3. Implémenter les corrections
4. Re-tester
5. Documenter les améliorations

**Ressources:**
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)
- [Web.dev Learn](https://web.dev/learn/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
