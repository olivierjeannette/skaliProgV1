# 📁 Dossier SQL - Migrations et Scripts

Ce dossier contient tous les fichiers SQL pour la base de données Supabase.

## 📂 Structure

```
sql/
├── migrations/          # Scripts de migration (ordre chronologique)
├── seeds/              # Données d'initialisation
├── queries/            # Requêtes SQL réutilisables
└── README.md           # Ce fichier
```

## 🚀 Migrations

Les migrations sont numérotées dans l'ordre chronologique et doivent être exécutées dans cet ordre.

### Migrations Disponibles

1. **001_initial_schema.sql** - Schéma initial de la base de données
2. **002_add_nutrition_tables.sql** - Tables pour le module nutrition
3. **003_add_programs_tables.sql** - Tables pour les programmes d'entraînement
4. **004_add_performances_tables.sql** - Tables pour les métriques de performance
5. **005_create_api_keys_table.sql** - 🔑 **Table pour les clés API centralisées**

### Comment exécuter une migration

1. Connectez-vous à votre dashboard Supabase : https://app.supabase.com
2. Sélectionnez votre projet
3. Allez dans **SQL Editor** (menu latéral)
4. Cliquez sur **New Query**
5. Copiez le contenu du fichier de migration
6. Collez-le dans l'éditeur
7. Cliquez sur **Run** (ou Ctrl+Enter)
8. Vérifiez qu'il n'y a pas d'erreurs

### ⚠️ Important

- **Exécutez les migrations dans l'ordre** (001, 002, 003, etc.)
- **Ne modifiez jamais** une migration déjà exécutée
- **Créez une nouvelle migration** pour tout changement de schéma
- **Testez d'abord en local** avant de migrer en production

## 🆕 Migration 005 : Clés API Supabase

### Description

Cette migration crée la table `api_keys` qui permet de stocker toutes vos clés API de manière centralisée dans Supabase.

### Avantages

✅ Plus besoin de ressaisir les clés à chaque fois
✅ Accessibles en local et en production
✅ Sécurisées avec Row Level Security (RLS)
✅ Cache local pour fonctionnement offline

### Clés stockées

- Claude AI API Key
- Discord Webhook URL
- Discord Client ID & Secret
- Supabase URL & Key
- OpenWeather API Key
- Proxy URLs (dev & prod)

### Utilisation

Après avoir exécuté la migration :

1. Ouvrez Skali Prog
2. Connectez-vous en tant qu'Admin
3. Allez dans **Configuration** → Onglet **🔑 Clés API**
4. Remplissez vos clés
5. Cliquez sur **Enregistrer dans Supabase**

📖 **Documentation complète** : [docs/guides/GUIDE-CLES-API-SUPABASE.md](../docs/guides/GUIDE-CLES-API-SUPABASE.md)

## 🔄 Rollback

Chaque migration contient un script de rollback en commentaire à la fin du fichier.

Pour annuler une migration :

1. Copiez le script de rollback (les lignes commentées à la fin)
2. Décommentez-les
3. Exécutez dans SQL Editor

⚠️ **Attention** : Le rollback supprime les tables/données créées par la migration !

## 🌱 Seeds (Données d'initialisation)

Le dossier `seeds/` contient des données d'exemple pour démarrer rapidement.

### Seeds disponibles

- **exercises_seed.sql** - Base de données d'exercices
- **equipment_seed.sql** - Équipement de la salle

### Comment charger les seeds

1. **Après avoir exécuté toutes les migrations**
2. SQL Editor → New Query
3. Copiez le contenu du fichier seed
4. Exécutez

⚠️ Les seeds sont **optionnels** et à utiliser uniquement en développement ou pour tester.

## 📊 Queries (Requêtes réutilisables)

Le dossier `queries/` contient des requêtes SQL courantes que vous pouvez réutiliser.

### Queries disponibles

- **analytics_queries.sql** - Requêtes pour les analytics
- **reports_queries.sql** - Requêtes pour les rapports

### Utilisation

Copiez/collez les requêtes dans SQL Editor ou utilisez-les dans vos scripts backend.

## 🛠️ Maintenance

### Vérifier l'état des migrations

```sql
-- Lister toutes les tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Vérifier une table spécifique
SELECT * FROM api_keys LIMIT 10;
```

### Backup avant migration

Toujours faire un backup avant d'exécuter une migration :

1. Dashboard Supabase → Database → Backups
2. Cliquez sur **Create backup**
3. Attendez la confirmation
4. Exécutez la migration

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [SQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)

---

**Dernière mise à jour** : 2025-01-15
