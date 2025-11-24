# Scripts de Validation Frontend

Ce dossier contient des scripts utiles pour valider et tester les pages frontend complétées.

## 📜 Scripts Disponibles

### 1. `validate-pages.sh` - Validation des Pages

Vérifie que toutes les pages sont complètes et ne contiennent pas de messages "en développement".

**Usage:**
```bash
./scripts/validate-pages.sh
```

**Ce qu'il vérifie:**
- ✅ Tous les fichiers de pages existent
- ✅ Aucun message "en développement"
- ✅ Pas de types TypeScript 'any' (warning seulement)
- ✅ Tous les fichiers de documentation existent

---

### 2. `test-pages-urls.sh` - Test des URLs

Teste que toutes les pages sont accessibles via leur URL.

**Usage:**
```bash
./scripts/test-pages-urls.sh
```

**Prérequis:** Le serveur dev doit être lancé (`npm run dev`)

---

### 3. `prepare-pr.sh` - Préparation PR

Script interactif pour préparer la Pull Request.

**Usage:**
```bash
./scripts/prepare-pr.sh
```

---

## 🚀 Workflow Recommandé

```bash
# 1. Valider les pages
./scripts/validate-pages.sh

# 2. Tester les URLs
npm run dev &
./scripts/test-pages-urls.sh

# 3. Préparer la PR
./scripts/prepare-pr.sh
```

**Créé pour le projet Med-Mng - Frontend Completion**
