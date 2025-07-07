# 🔐 Guide Environnement Sandbox Supabase - MED-MNG

## 🎯 Environnement de test sécurisé créé

Un environnement Supabase complètement isolé a été mis en place pour le développement sécurisé.

---

## 📊 Structure créée

### Schéma `sandbox` avec 4 tables de test :

| Table | Description | Données |
|-------|-------------|---------|
| `sandbox.items_test` | Items de test | 3 entrées fictives |
| `sandbox.users_test` | Utilisateurs de test | 3 utilisateurs fictifs |
| `sandbox.competences_test` | Compétences médicales | 4 compétences de base |
| `sandbox.skills_test` | Compétences utilisateurs | 3 relations de test |

### Rôle de développement : `dev_sandbox_role`
- ✅ Accès complet au schéma `sandbox` uniquement
- ❌ Aucun accès aux tables de production
- ❌ Aucun accès aux données sensibles

---

## 🛠️ Utilisation pour le développeur

### 1. Connexion à l'environnement test
```javascript
// Utiliser les clés du fichier .env.test
const supabase = createClient(
  process.env.SUPABASE_URL, // sandbox-test.supabase.co
  process.env.SUPABASE_ANON_KEY // clé test uniquement
);
```

### 2. Requêtes sur les tables de test
```javascript
// Lire les items de test
const { data } = await supabase
  .from('sandbox.items_test')
  .select('*');

// Créer un nouvel utilisateur de test
const { data } = await supabase
  .from('sandbox.users_test')
  .insert({ 
    email: 'nouveau@test.com', 
    username: 'TestUser' 
  });
```

### 3. Utiliser la vue de monitoring
```javascript
// Voir les statistiques des tables de test
const { data } = await supabase
  .from('sandbox.test_stats')
  .select('*');
```

### 4. Reset des données de test
```javascript
// Remettre à zéro toutes les données de test
const { data } = await supabase
  .rpc('sandbox.reset_test_data');
```

---

## 🔒 Sécurité garantie

### ✅ Ce que le développeur PEUT faire :
- Lire/écrire/modifier les tables `sandbox.*_test`
- Exécuter `sandbox.reset_test_data()`
- Consulter `sandbox.test_stats`
- Tester toutes les fonctionnalités sur données fictives

### ❌ Ce que le développeur NE PEUT PAS faire :
- Accéder aux tables de production (`public.*`)
- Voir les vraies données utilisateurs
- Modifier la structure des tables de production
- Accéder aux clés `service_role` ou secrets

---

## 📋 Données de test disponibles

### Utilisateurs de test :
- `dev@test.com` (student)
- `test@test.com` (teacher)  
- `admin@test.com` (admin)

### Compétences de test :
- Communication médicale (beginner)
- Diagnostic clinique (intermediate)
- Pharmacologie (advanced)
- Éthique médicale (beginner)

### Items de test :
- Item test 1, 2, 3 avec catégories diverses

---

## 🚨 Règles importantes

1. **Toujours utiliser le schéma `sandbox`** pour les tests
2. **Ne jamais essayer d'accéder aux tables `public.*`**
3. **Utiliser uniquement les clés du fichier `.env.test`**
4. **Réinitialiser les données avec `reset_test_data()` si besoin**

---

## 📞 En cas de problème

Si l'environnement sandbox ne fonctionne pas :
1. Vérifier que les clés `.env.test` sont bien utilisées
2. S'assurer que les requêtes ciblent bien `sandbox.*_test`
3. Utiliser `sandbox.reset_test_data()` pour remettre à zéro

**✅ Environnement 100% sécurisé et isolé pour le développement !**