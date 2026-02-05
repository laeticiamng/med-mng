# 🚀 Action requise: Configuration Chromatic

## ⚡ Configuration express (5 minutes)

### 1. Ajouter le script Chromatic

**Vous devez ajouter manuellement cette ligne dans `package.json`**:

```json
{
  "scripts": {
    "chromatic": "chromatic"
  }
}
```

Ou demandez à Lovable: "Ajoute le script chromatic dans package.json"

### 2. Obtenir vos credentials Chromatic

1. **Créez un compte**: https://www.chromatic.com/
2. **Nouveau projet** → Sélectionnez "Storybook"
3. **Copiez le Project Token** (commence par `chpt_`)
4. **Notez le Project ID** (visible dans l'URL)

### 3. Configuration locale

Créez `.env.local` à la racine:

```bash
CHROMATIC_PROJECT_TOKEN=chpt_votre_token_ici
```

### 4. Mise à jour du config

Éditez `chromatic.config.json`, ligne 2:

```json
{
  "projectId": "votre_project_id_ici"
}
```

### 5. Testez!

```bash
npm run chromatic
```

✅ **C'est tout!** Chromatic va:
- Build votre Storybook
- Capturer tous les composants
- Les publier pour review

## 📖 Documentation complète

- **Guide visuel**: Ouvrez Storybook → "Documentation/Chromatic & Visual Testing"
- **Guide technique**: `docs/CHROMATIC_SETUP.md`

## 🤖 GitHub Actions (Optionnel)

Pour automatiser les tests sur chaque PR:

1. **GitHub** → **Settings** → **Secrets** → **Actions**
2. Ajoutez `CHROMATIC_PROJECT_TOKEN`
3. Le workflow est déjà documenté dans le guide Storybook

---

**Questions?** Consultez le guide complet dans Storybook ou lisez `docs/CHROMATIC_SETUP.md`
