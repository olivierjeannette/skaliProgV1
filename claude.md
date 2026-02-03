# CLAUDE.MD - Instructions de Développement Skali Prog

## 📋 CONTEXTE GLOBAL DE L'APPLICATION

### Identité du Projet

- **Nom**: Skali Prog - Performance Training System
- **Version**: 2.4 Dev
- **Type**: Progressive Web Application (PWA) de gestion d'entraînement sportif
- **Taille**: 11 MB (8.1 MB de JavaScript, 592 KB de CSS)
- **Gym**: La Skàli Laval

### Mission

Système complet de gestion d'entraînement sportif incluant:

1. Génération de programmes d'entraînement par IA (5 sports)
2. Planification nutritionnelle personnalisée
3. Suivi de performances et analytics
4. Gestion d'équipe et membres
5. Intégration Discord pour notifications
6. Export PDF professionnel
7. Mode TV pour affichage en salle
8. Intégration objets connectés (Apple Watch)

---

## 🏗️ ARCHITECTURE TECHNIQUE

### Stack Technologique OBLIGATOIRE

#### Frontend (Browser-Based)

```javascript
- Vanilla JavaScript (pas de React/Vue/Angular)
- Tailwind CSS v4.4.0 pour le styling
- Font Awesome v6.4.0 pour les icônes
- jsPDF v2.5.1 pour la génération PDF
- Chart.js v4.4.0 pour la visualisation
- Supabase JS Client v2 pour la base de données
```

#### Backend/Services

```javascript
- Supabase (PostgreSQL + REST API) - Base de données principale
- Node.js Proxy Server (port 3001) - Proxy pour Claude API
- Claude AI API (claude-3.5-haiku) - Génération de contenu
- Discord API - Notifications et OAuth
- OpenWeather API - Données météo
```

#### Hébergement

```javascript
- Frontend: Netlify (production) / http-server (dev sur port 8080)
- Backend: Supabase Cloud
- API Proxy: ngrok tunnel en production, localhost:3001 en dev
```

### URLs et Endpoints

#### Développement Local

```
Frontend: http://localhost:8080
API Proxy: http://localhost:3001
```

#### Production

```
Frontend: [URL Netlify]
API Proxy: https://nonintrospective-rosella-kiddingly.ngrok-free.dev
```

---

## 📁 STRUCTURE DE FICHIERS ET ORGANISATION

### Règles de Structure STRICTES

#### 1. Organisation des Modules JavaScript

```
js/
├── core/                    ← Modules fondamentaux (20 fichiers)
│   ├── auth.js             ← Authentification (ADMIN/COACH/ATHLETE)
│   ├── config.js           ← Configuration globale
│   ├── api-config.js       ← Configuration API (dev/prod)
│   ├── api-keys-manager.js ← Gestion centralisée des clés API
│   ├── env.js              ← Chargement variables environnement
│   ├── utils.js            ← Fonctions utilitaires
│   ├── performance-*.js    ← Optimisation performance
│   ├── module-loader-*.js  ← Chargement modules
│   ├── thememanager.js     ← Gestion thème (dark/light)
│   └── discord-*.js        ← Configuration Discord
│
├── managers/               ← Gestionnaires business logic (6 fichiers)
│   ├── viewmanager.js      ← Gestion des vues/pages
│   ├── syncmanager.js      ← Synchronisation données
│   ├── backupmanager.js    ← Backup et restore
│   ├── permissionmanager.js ← Contrôle d'accès rôles
│   ├── userManager.js      ← Gestion utilisateurs
│   └── tvmode.js           ← Mode TV
│
├── modules/                ← Fonctionnalités (80+ fichiers)
│   ├── admin/              ← Modules administrateur
│   ├── calendar/           ← Calendrier sessions
│   ├── cardio/             ← Monitoring cardio
│   ├── members/            ← Gestion membres
│   ├── nutrition/          ← Système nutrition (5 fichiers)
│   ├── performance/        ← Suivi performances
│   ├── pokemon/            ← Cartes performances
│   ├── programming/        ← Génération programmes (30+ fichiers)
│   ├── portal/             ← Portails membres
│   └── reports/            ← Rapports et analytics
│
├── integrations/           ← Intégrations externes (13 fichiers)
│   ├── supabasemanager.js  ← Gestion Supabase
│   ├── discordnotifier.js  ← Notifications Discord
│   ├── ai-*.js             ← Générateurs IA
│   └── wearables-*.js      ← Objets connectés
│
├── services/               ← Services métier (2 fichiers)
│   ├── program-pdf-generator-v3.js
│   └── session-generator-specialized.js
│
└── config/                 ← Fichiers de configuration (4+ fichiers)
    ├── skali-equipment.js  ← Base de données équipement
    ├── sports-matrix.js    ← Catégorisation sports
    └── methodologies-database.js ← Méthodologies entraînement
```

#### 2. Organisation CSS

```
css/
├── master-theme.css              ← Système de design principal (49 KB)
├── programming-pro.css           ← UI module programmation (53 KB)
├── modules-pages.css             ← Layouts pages (41 KB)
├── modules-config.css            ← Interfaces configuration (35 KB)
├── member-portal.css             ← Portail membre (15 KB)
├── nutrition-portal.css          ← UI nutrition (21 KB)
├── calendar-mobile-fullpage.css  ← Calendrier (21 KB)
├── tvmode-1080p.css              ← Mode TV (15 KB)
└── [autres modules spécifiques]
```

#### 3. Organisation Data

```
data/
├── laskali-inventory.json                    ← Inventaire équipement gym
├── exercises-complete-enriched.json          ← Base de données exercices
└── [autres fichiers de données statiques]
```

#### 4. Organisation SQL

```
sql/
├── migrations/                               ← Migrations base de données
│   ├── 001_initial_schema.sql
│   ├── 002_add_nutrition_tables.sql
│   └── ...
├── seeds/                                    ← Données d'initialisation
│   ├── exercises_seed.sql
│   └── equipment_seed.sql
├── queries/                                  ← Requêtes SQL réutilisables
│   ├── reports.sql
│   └── analytics.sql
└── README.md                                 ← Documentation structure SQL
```

#### 5. Organisation Documentation

```
docs/                                         ← TOUS les fichiers .md et .txt (SAUF claude.md)
├── project/                                  ← Documentation projet
│   ├── CHANGELOG_PDF_GENERATION.md
│   ├── RESUME_CORRECTIONS.md
│   ├── RESUME_CORRECTIONS_2025-11-22.md
│   └── TOKENS_ET_MODELES.md
├── guides/                                   ← Guides utilisateur/dev
│   ├── GUIDE_GENERATION_PROGRAMMES.md
│   └── SPORTS_DATABASES_DOCUMENTATION.md
├── modules/                                  ← Docs spécifiques modules
│   ├── nutrition/
│   │   ├── README.md
│   │   ├── QUICK-START.md
│   │   └── FICHIERS-A-ARCHIVER.md
│   ├── programming/
│   │   └── README_PROGRAMMING_PRO.md
│   └── core/
│       └── README.md
├── assets/                                   ← Fichiers texte divers
│   └── logo-base64.txt
└── README.md                                 ← Index de toute la documentation
```

#### 6. Organisation Scripts

```
scripts/
├── database/                                 ← Scripts base de données
│   ├── setup-database.js
│   ├── check-supabase-schema.js
│   ├── full-audit-supabase.js
│   └── import-exercises-to-supabase.js
├── python/                                   ← Scripts Python
│   └── enrich-exercises.py
├── deployment/                               ← Scripts déploiement
│   ├── deploy-prod.sh
│   └── deploy-dev.sh
└── utilities/                                ← Scripts utilitaires
    └── clean-backups.js
```

---

## 📂 RÈGLES D'ORGANISATION DES FICHIERS - STRICTES ET OBLIGATOIRES

### 🎯 Principe Fondamental : "Une Place Pour Chaque Chose, Chaque Chose à Sa Place"

#### ❌ INTERDIT ABSOLUMENT

```
❌ Fichiers SQL à la racine du projet
❌ Fichiers .md à la racine (SAUF claude.md)
❌ Fichiers .txt dispersés n'importe où
❌ Scripts dans le dossier racine
❌ Fichiers de backup/archive sans dossier dédié
❌ Fichiers temporaires non nettoyés
```

#### ✅ ORGANISATION OBLIGATOIRE

### 1. Fichiers SQL - Dossier `sql/`

```bash
# TOUS les fichiers .sql DOIVENT être dans sql/

✅ CORRECT:
sql/
├── migrations/
│   ├── 001_create_members_table.sql
│   ├── 002_create_sessions_table.sql
│   └── 003_add_nutrition_tables.sql
├── seeds/
│   ├── exercises_seed.sql
│   └── equipment_seed.sql
└── queries/
    ├── analytics_queries.sql
    └── reports_queries.sql

❌ INTERDIT:
create_tables.sql              ← Racine du projet
backup_2025.sql               ← Racine du projet
test.sql                      ← N'importe où ailleurs
```

#### Règles SQL Spécifiques

```sql
-- 1. Nommage des migrations: [numéro]_[description].sql
-- Format: 001_create_members_table.sql
-- Ordre chronologique strict

-- 2. Un fichier = Une opération logique
-- ✅ BON: 001_create_members_table.sql
-- ❌ MAUVAIS: all_tables.sql (trop général)

-- 3. Toujours inclure commentaires
-- Début de chaque fichier SQL:
/*
 * Migration: Create Members Table
 * Date: 2025-01-15
 * Author: Team Skali
 * Description: Crée la table members avec tous les champs nécessaires
 */

-- 4. Inclure rollback
CREATE TABLE IF NOT EXISTS members (...);

-- Rollback (en commentaire à la fin):
-- DROP TABLE IF EXISTS members;
```

### 2. Fichiers Documentation - Dossier `docs/`

```bash
# TOUS les .md et .txt DOIVENT être dans docs/ (SAUF claude.md)

✅ CORRECT:
docs/
├── project/
│   ├── CHANGELOG_PDF_GENERATION.md
│   ├── RESUME_CORRECTIONS.md
│   └── TOKENS_ET_MODELES.md
├── guides/
│   ├── GUIDE_GENERATION_PROGRAMMES.md
│   └── SPORTS_DATABASES_DOCUMENTATION.md
├── modules/
│   ├── nutrition/
│   │   ├── README.md
│   │   ├── QUICK-START.md
│   │   └── ARCHITECTURE.md
│   └── programming/
│       └── README_PROGRAMMING_PRO.md
└── assets/
    ├── logo-base64.txt
    └── notes.txt

❌ INTERDIT:
RESUME_CORRECTIONS.md         ← Racine du projet
notes.txt                     ← Racine du projet
README_OLD.md                 ← Racine du projet
```

#### Règles Documentation Spécifiques

```markdown
# 1. Structure standardisée pour tous les README.md

# Titre du Module

## Description

Courte description (2-3 lignes)

## Responsabilités

- Liste des responsabilités

## Dépendances

- Liste des dépendances

## API / Utilisation

Code examples

## Notes

Notes importantes

---

# 2. Nommage des fichiers documentation

✅ BON:

- README.md (index du dossier)
- QUICK-START.md (guide rapide)
- CHANGELOG.md (historique changements)
- ARCHITECTURE.md (architecture technique)
- API-REFERENCE.md (référence API)

❌ MAUVAIS:

- readme.txt (mauvaise extension)
- Readme.MD (casse incohérente)
- doc.md (nom trop vague)
- notes_diverses.txt (non descriptif)

# 3. Exception UNIQUE: claude.md

claude.md DOIT rester à la racine du projet C'est le SEUL fichier .md autorisé à la racine
```

### 3. Fichiers Scripts - Dossier `scripts/`

```bash
# TOUS les scripts (.js, .py, .sh, .bat) utilitaires dans scripts/

✅ CORRECT:
scripts/
├── database/
│   ├── setup-database.js
│   ├── migrate.js
│   └── seed.js
├── python/
│   ├── enrich-exercises.py
│   └── data-processing.py
├── deployment/
│   ├── deploy-prod.sh
│   ├── deploy-dev.sh
│   └── build.sh
└── utilities/
    ├── clean-backups.js
    ├── optimize-images.js
    └── generate-sitemap.js

❌ INTERDIT:
setup.js                      ← Racine du projet
test.py                       ← Racine du projet
deploy.sh                     ← Racine du projet

✅ EXCEPTION AUTORISÉE (Scripts de démarrage):
START-SERVER.bat              ← Racine (script de démarrage rapide)
```

#### Règles Scripts Spécifiques

```javascript
// 1. Toujours inclure shebang pour scripts exécutables
#!/usr/bin/env node

// 2. Toujours inclure header descriptif
/**
 * Script: Setup Database
 * Description: Initialise la base de données Supabase
 * Usage: node scripts/database/setup-database.js
 * Requires: SUPABASE_URL, SUPABASE_KEY dans .env
 */

// 3. Toujours gérer les erreurs
process.on('unhandledRejection', (error) => {
    console.error('Erreur non gérée:', error);
    process.exit(1);
});

// 4. Toujours logger les étapes
console.log('[INFO] Démarrage du script...');
console.log('[SUCCESS] Script terminé avec succès');
console.error('[ERROR] Erreur:', error.message);
```

### 4. Fichiers Temporaires et Archives - Dossier `temp/` et `archive/`

```bash
# Fichiers temporaires: temp/ (ignoré par Git)
# Fichiers archivés: archive/ (historique)

✅ STRUCTURE:
temp/                         ← .gitignore DOIT ignorer ce dossier
├── uploads/                  ← Uploads temporaires
├── exports/                  ← Exports temporaires
└── cache/                    ← Cache

archive/                      ← Anciens fichiers (à garder pour historique)
├── 2024/
│   ├── old-modules/
│   └── deprecated-features/
└── 2025/
    └── migration-backups/

❌ INTERDIT:
file-backup.js               ← Racine
old-version.js              ← N'importe où
temp.txt                    ← Racine
test123.js                  ← N'importe où
```

### 5. Règles pour les Sous-dossiers de Modules

```bash
# Modules JS peuvent avoir leur propre structure

js/modules/nutrition/
├── nutrition-core.js         ← Fichier principal
├── nutrition-meals-database.js
├── nutrition-planner.js
├── README.md                 ← ❌ DÉPLACER vers docs/modules/nutrition/README.md
├── QUICK-START.md           ← ❌ DÉPLACER vers docs/modules/nutrition/QUICK-START.md
└── _archive/                ← ✅ Archives locales au module (avec underscore)
    ├── README-ARCHIVE.txt   ← OK si dans _archive/
    └── old-version.js

❌ INTERDIT dans les modules:
├── backup/                  ← Utiliser _archive/ avec underscore
├── old/                     ← Utiliser _archive/ avec underscore
├── test.js                  ← Fichier de test isolé (utiliser tests/)
└── notes.txt                ← Déplacer vers docs/
```

### 6. Checklist de Rangement OBLIGATOIRE

#### Avant CHAQUE commit, vérifier:

```bash
✅ 1. FICHIERS SQL
    □ Aucun fichier .sql à la racine?
    □ Tous dans sql/migrations/, sql/seeds/, ou sql/queries/?
    □ Nommage correct (001_description.sql)?

✅ 2. FICHIERS DOCUMENTATION
    □ Aucun .md à la racine (sauf claude.md)?
    □ Aucun .txt dispersé?
    □ Tous dans docs/ avec bonne catégorie?
    □ README.md des modules déplacés vers docs/modules/?

✅ 3. FICHIERS SCRIPTS
    □ Aucun script utilitaire à la racine?
    □ Tous dans scripts/database/, scripts/python/, etc.?
    □ Headers descriptifs présents?

✅ 4. FICHIERS TEMPORAIRES
    □ Aucun fichier temp/test/backup à la racine?
    □ temp/ est dans .gitignore?
    □ Anciens fichiers dans archive/ avec date?

✅ 5. MODULES
    □ Pas de README.md dans js/modules/[nom]/?
    □ Archives dans _archive/ (avec underscore)?
    □ Pas de fichiers -backup, -old, -v2?

✅ 6. RACINE DU PROJET (Doit être PROPRE)
    □ Seulement: index.html, manifest.json, sw.js, .env.template
    □ Seulement: START-SERVER.bat (script de démarrage)
    □ Seulement: claude.md (documentation principale)
    □ Seulement: .gitignore, .claudeignore
    □ Pas d'autres fichiers!
```

### 7. Procédure de Rangement Automatique

#### Script à exécuter régulièrement:

```javascript
// scripts/utilities/organize-files.js

/**
 * Script: Organize Project Files
 * Description: Range automatiquement les fichiers mal placés
 * Usage: node scripts/utilities/organize-files.js
 */

const fs = require('fs');
const path = require('path');

const RULES = {
  // Fichiers SQL -> sql/
  '.sql': file => {
    if (file.includes('migration')) return 'sql/migrations/';
    if (file.includes('seed')) return 'sql/seeds/';
    return 'sql/queries/';
  },

  // Fichiers Markdown -> docs/
  '.md': file => {
    if (file === 'claude.md') return null; // Exception: reste à la racine
    if (file.includes('CHANGELOG')) return 'docs/project/';
    if (file.includes('RESUME')) return 'docs/project/';
    if (file.includes('GUIDE')) return 'docs/guides/';
    if (file === 'README.md') return 'docs/';
    return 'docs/project/';
  },

  // Fichiers TXT -> docs/assets/
  '.txt': () => 'docs/assets/',

  // Scripts Python -> scripts/python/
  '.py': () => 'scripts/python/',

  // Scripts Shell -> scripts/deployment/
  '.sh': () => 'scripts/deployment/'
};

function organizeFiles() {
  console.log('[INFO] Démarrage organisation fichiers...');

  const rootFiles = fs.readdirSync('.');
  let movedCount = 0;

  rootFiles.forEach(file => {
    const ext = path.extname(file);
    const rule = RULES[ext];

    if (rule) {
      const targetDir = rule(file);

      if (targetDir) {
        // Créer le dossier si nécessaire
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        // Déplacer le fichier
        const target = path.join(targetDir, file);
        console.log(`[MOVE] ${file} -> ${target}`);
        fs.renameSync(file, target);
        movedCount++;
      }
    }
  });

  console.log(`[SUCCESS] ${movedCount} fichiers rangés`);
}

organizeFiles();
```

### 8. Commande Git Pre-Commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Vérifier qu'aucun fichier mal placé n'est commité

echo "🔍 Vérification organisation fichiers..."

# Vérifier fichiers SQL à la racine
SQL_IN_ROOT=$(git diff --cached --name-only | grep "^[^/]*\.sql$")
if [ ! -z "$SQL_IN_ROOT" ]; then
    echo "❌ ERREUR: Fichiers SQL à la racine détectés:"
    echo "$SQL_IN_ROOT"
    echo "   Déplacer vers sql/migrations/ ou sql/seeds/"
    exit 1
fi

# Vérifier fichiers .md à la racine (sauf claude.md)
MD_IN_ROOT=$(git diff --cached --name-only | grep "^[^/]*\.md$" | grep -v "^claude\.md$")
if [ ! -z "$MD_IN_ROOT" ]; then
    echo "❌ ERREUR: Fichiers .md à la racine détectés:"
    echo "$MD_IN_ROOT"
    echo "   Déplacer vers docs/"
    exit 1
fi

# Vérifier fichiers .txt à la racine
TXT_IN_ROOT=$(git diff --cached --name-only | grep "^[^/]*\.txt$")
if [ ! -z "$TXT_IN_ROOT" ]; then
    echo "❌ ERREUR: Fichiers .txt à la racine détectés:"
    echo "$TXT_IN_ROOT"
    echo "   Déplacer vers docs/assets/"
    exit 1
fi

# Vérifier fichiers backup
BACKUP_FILES=$(git diff --cached --name-only | grep -E "(backup|old|v[0-9]+|copy)\.(js|css)$")
if [ ! -z "$BACKUP_FILES" ]; then
    echo "❌ ERREUR: Fichiers backup détectés:"
    echo "$BACKUP_FILES"
    echo "   Supprimer ou déplacer vers archive/"
    exit 1
fi

echo "✅ Organisation fichiers OK"
exit 0
```

### 9. .gitignore à Jour

```bash
# .gitignore - OBLIGATOIRE

# Temporaires
temp/
*.tmp
*.temp

# Backups
*.bak
*-backup.*
*-old.*
*-copy.*

# OS
.DS_Store
Thumbs.db
desktop.ini

# IDE
.vscode/
.idea/
*.swp
*.swo

# Logs
*.log
logs/

# Environment
.env
.env.local

# Node modules
node_modules/

# Build
dist/
build/

# Cache
.cache/
*.cache
```

### 10. Structure Racine Finale IDÉALE

```
skaliprog.2.4Dev/
├── .claude/                  ← Configuration Claude Code
├── .vscode/                  ← Configuration VSCode
├── archive/                  ← Anciens fichiers (historique)
├── css/                      ← Tous les fichiers CSS
├── data/                     ← Données JSON statiques
├── docs/                     ← TOUTE la documentation (.md et .txt)
├── js/                       ← Tout le JavaScript
├── scripts/                  ← Tous les scripts utilitaires
├── sql/                      ← Tous les fichiers SQL
├── temp/                     ← Fichiers temporaires (gitignored)
├── .env.template             ← Template environnement
├── .gitignore                ← Git ignore rules
├── .claudeignore             ← Claude ignore rules
├── claude.md                 ← 🔥 SEUL .md autorisé à la racine
├── index.html                ← Page principale
├── manifest.json             ← PWA manifest
├── member-portal.html        ← Portail membre
├── nutrition-pro.html        ← Module nutrition
├── sw.js                     ← Service Worker
└── START-SERVER.bat          ← Script démarrage rapide

❌ RIEN D'AUTRE à la racine !
```

---

## 🚫 RÈGLES CRITIQUES - FICHIERS ET DOUBLONS

### ❌ INTERDICTIONS ABSOLUES

#### 1. NE JAMAIS créer de fichiers de backup automatiques

```javascript
❌ INTERDIT:
- fichier-backup.js
- fichier-v2.js
- fichier-old.js
- fichier-copy.js
- fichier.bak

✅ À LA PLACE:
- Utiliser Git pour l'historique
- Supprimer proprement l'ancien code
- Refactoriser directement dans le fichier existant
```

#### 2. NE JAMAIS dupliquer du code

```javascript
❌ INTERDIT:
- Copier-coller des fonctions entre modules
- Créer des versions "-enhanced" ou "-pro" sans supprimer l'ancienne
- Avoir plusieurs fonctions qui font la même chose

✅ À LA PLACE:
- Extraire dans utils.js si fonction utilitaire
- Créer un module partagé dans core/
- Refactoriser pour réutiliser le code existant
```

#### 3. NE JAMAIS créer de fichiers inutiles

```javascript
❌ INTERDIT:
- Fichiers de test sans framework (test-something.js)
- Fichiers de documentation markdown redondants
- Fichiers de config dupliqués
- Fichiers temporaires non supprimés

✅ À VÉRIFIER avant toute création:
1. Ce fichier existe-t-il déjà sous un autre nom?
2. Cette fonctionnalité peut-elle être ajoutée à un fichier existant?
3. Ce fichier sera-t-il réellement utilisé?
```

### ✅ RÈGLES DE NOMMAGE STRICTES

#### Fichiers JavaScript

```javascript
// Format: [nom-descriptif].js (kebab-case)

✅ BON:
- programming-pro.js
- nutrition-member-manager.js
- ai-session-generator.js

❌ MAUVAIS:
- programmingPro.js (camelCase)
- Programming_Pro.js (snake_case avec majuscules)
- prog.js (non descriptif)
- programming-pro-final-v2.js (avec version)
```

#### Fichiers CSS

```javascript
// Format: [module-name].css (kebab-case)

✅ BON:
- nutrition-portal.css
- tvmode-1080p.css
- pokemon-cards.css

❌ MAUVAIS:
- style.css (trop générique)
- nutritionPortal.css (camelCase)
- nutrition_portal_v2.css (snake_case avec version)
```

#### Fonctions

```javascript
// Format: camelCase, verbe + nom

✅ BON:
function generateProgram(data) { }
function validateFormData(form) { }
async function fetchMemberData(memberId) { }

❌ MAUVAIS:
function Program() { } // Manque verbe
function generate_program() { } // snake_case
function gp() { } // Non descriptif
```

#### Variables

```javascript
// Format: camelCase, nom descriptif

✅ BON:
const memberData = { };
let currentSessionId = null;
const apiEndpoint = 'https://...';

❌ MAUVAIS:
const data = { }; // Trop générique
let x = null; // Non descriptif
const API_ENDPOINT = 'https://...'; // SCREAMING_SNAKE_CASE réservé aux constantes vraiment globales
```

---

## 🔒 SYSTÈME D'AUTHENTIFICATION ET PERMISSIONS

### Trois Rôles Stricts

#### 1. ADMIN (Administrateur)

```javascript
Permissions: ['all'] // Accès complet

Accès exclusif:
- Configuration système (api-keys, environnement)
- Contrôles Discord Bot
- Gestion inventaire gym
- Gestion sessions cardio
- Tous les modules

Mot de passe par défaut: "skaliprog"
Couleur: Rouge (#dc2626)
Icône: fas fa-crown
```

#### 2. COACH

```javascript
Permissions: [
    'view_calendar',       // Voir le calendrier
    'create_sessions',     // Créer des sessions
    'edit_sessions',       // Modifier des sessions
    'view_members',        // Voir les membres
    'create_athlete',      // Créer un athlète
    'view_performances',   // Voir les performances
    'export_pdf',          // Exporter en PDF
    'notifications',       // Recevoir notifications
    'tv_mode',            // Utiliser mode TV
    'import_csv'          // Importer CSV
]

Restrictions:
- Ne peut pas modifier la configuration système
- Ne peut pas créer d'autres coachs
- Ne peut créer que des athlètes

Mot de passe par défaut: "coach2024"
Couleur: Bleu (#2563eb)
Icône: fas fa-user-tie
```

#### 3. ATHLETE (Athlète)

```javascript
Permissions: [
    'view_calendar',          // Voir le calendrier
    'view_sessions',          // Voir les sessions
    'view_own_performances',  // Voir SES performances uniquement
    'auto_sync',             // Sync automatique
    'export_pdf',            // Exporter en PDF
    'tv_mode'                // Utiliser mode TV
]

Restrictions strictes:
- Aucune modification de session
- Pas de sync manuel
- Pas de backup manuel
- Pas de gestion de membres
- Voit uniquement SES données

Mot de passe par défaut: "athlete2024"
Couleur: Vert (#059669)
Icône: fas fa-running
```

### Implémentation Obligatoire

#### Dans chaque module qui gère des données sensibles:

```javascript
// TOUJOURS vérifier les permissions au début de chaque fonction critique

// Exemple 1: Fonction de modification
async function updateSession(sessionId, data) {
  // Vérification permission
  if (!PermissionManager.hasPermission('edit_sessions')) {
    PermissionManager.showPermissionError(
      'edit_sessions',
      "Vous n'avez pas la permission de modifier des sessions."
    );
    return;
  }

  // Suite de la fonction...
}

// Exemple 2: Affichage conditionnel d'UI
function renderSessionControls(session) {
  const html = `
        <div class="session-controls">
            <button onclick="viewSession('${session.id}')">Voir</button>

            <!-- Boutons conditionnels selon rôle -->
            ${
              PermissionManager.hasPermission('edit_sessions')
                ? `<button onclick="editSession('${session.id}')">Modifier</button>`
                : ''
            }
            ${
              PermissionManager.hasPermission('delete_sessions')
                ? `<button onclick="deleteSession('${session.id}')">Supprimer</button>`
                : ''
            }
        </div>
    `;
  return html;
}

// Exemple 3: Filtrage de données selon rôle
async function getPerformances() {
  const role = sessionStorage.getItem('skaliUserRole');

  if (role === 'ATHLETE') {
    // Athlète voit uniquement SES performances
    const userId = sessionStorage.getItem('skaliUserId');
    return SupabaseManager.getPerformances({ user_id: userId });
  } else {
    // Admin/Coach voient toutes les performances
    return SupabaseManager.getPerformances();
  }
}
```

---

## 🗄️ BASE DE DONNÉES - SUPABASE

### Tables Principales

#### 1. members (Membres/Athlètes)

```sql
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    weight DECIMAL(5,2),
    body_fat_percentage DECIMAL(4,2),
    phone TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. sessions (Sessions d'entraînement)

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    type TEXT NOT NULL, -- 'trail', 'hyrox', 'crossfit', 'bodybuilding', 'running'
    category TEXT, -- 'endurance', 'strength', 'mixed', etc.
    duration INTEGER, -- en minutes
    exercises JSONB, -- Structure détaillée des exercices
    created_by UUID REFERENCES members(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. performances (Métriques de performance)

```sql
CREATE TABLE performances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id),
    metric_name TEXT NOT NULL, -- 'vo2max', 'ftp', '1rm_squat', etc.
    value DECIMAL(10,2) NOT NULL,
    unit TEXT, -- 'ml/kg/min', 'watts', 'kg', etc.
    date DATE NOT NULL,
    sport_type TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. nutrition_programs (Programmes nutrition)

```sql
CREATE TABLE nutrition_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id),
    objective TEXT NOT NULL, -- 'perte_poids', 'prise_masse', etc.
    calories INTEGER NOT NULL,
    macros JSONB, -- { "proteins": 150, "carbs": 250, "fats": 70 }
    meal_plan JSONB, -- Plan détaillé des repas
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 5. programs (Programmes d'entraînement)

```sql
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id),
    sport TEXT NOT NULL, -- 'trail', 'hyrox', etc.
    duration INTEGER NOT NULL, -- Durée en semaines
    weeks JSONB NOT NULL, -- Structure complète du programme
    status TEXT DEFAULT 'active', -- 'active', 'completed', 'archived'
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 6. exercises (Base de données exercices)

```sql
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'strength', 'cardio', 'mobility', etc.
    equipment TEXT[], -- Array d'équipements requis
    difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
    technique_notes TEXT,
    variations JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Règles d'Accès (RLS - Row Level Security)

```sql
-- Exemple: Les athlètes ne voient que LEURS données

-- Pour la table performances
CREATE POLICY "Athletes can view only their own performances"
ON performances
FOR SELECT
TO authenticated
USING (
    member_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM members
        WHERE id = auth.uid()
        AND role IN ('ADMIN', 'COACH')
    )
);

-- Pour la table programs
CREATE POLICY "Athletes can view only their own programs"
ON programs
FOR SELECT
TO authenticated
USING (
    member_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM members
        WHERE id = auth.uid()
        AND role IN ('ADMIN', 'COACH')
    )
);
```

### Interactions avec Supabase

#### TOUJOURS utiliser SupabaseManager

```javascript
// ❌ INTERDIT: Appeler directement l'API Supabase
const { data } = await supabase.from('members').select('*');

// ✅ CORRECT: Utiliser SupabaseManager
const members = await SupabaseManager.getMembers();
```

#### Fonctions SupabaseManager disponibles

```javascript
// Membres
await SupabaseManager.getMembers();
await SupabaseManager.getMember(id);
await SupabaseManager.createMember(data);
await SupabaseManager.updateMember(id, data);
await SupabaseManager.deleteMember(id);

// Sessions
await SupabaseManager.getSessions(filters);
await SupabaseManager.createSession(data);
await SupabaseManager.updateSession(id, data);

// Performances
await SupabaseManager.getPerformances(filters);
await SupabaseManager.createPerformance(data);

// Nutrition
await SupabaseManager.getNutritionProgram(memberId);
await SupabaseManager.createNutritionProgram(data);

// Programmes
await SupabaseManager.getPrograms(memberId);
await SupabaseManager.createProgram(data);
```

---

## 🤖 INTÉGRATION CLAUDE AI

### Endpoints Proxy

#### Configuration

```javascript
// Fichier: js/core/api-config.js

const API_CONFIG = {
  dev: {
    PROXY_URL: 'http://localhost:3001'
  },
  prod: {
    PROXY_URL: 'https://nonintrospective-rosella-kiddingly.ngrok-free.dev'
  }
};

// Détection automatique selon hostname
const CURRENT_API = window.location.hostname === 'localhost' ? API_CONFIG.dev : API_CONFIG.prod;
```

#### Utilisation Claude AI

##### 1. Génération de Texte

```javascript
// TOUJOURS utiliser cette structure

async function generateProgramWithAI(promptData) {
  try {
    const response = await fetch(`${CURRENT_API.PROXY_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: promptData.prompt
          }
        ],
        model: 'claude-3.5-haiku', // Modèle par défaut
        max_tokens: 4000 // Ajuster selon besoin
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('Erreur génération IA:', error);
    throw error;
  }
}
```

##### 2. Analyse d'Image (Vision)

```javascript
async function analyzeImageWithAI(imageBase64, prompt) {
  try {
    const response = await fetch(`${CURRENT_API.PROXY_URL}/api/vision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: imageBase64,
        prompt: prompt
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur API Vision: ${response.status}`);
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('Erreur analyse image:', error);
    throw error;
  }
}
```

### Gestion des Prompts - SYSTÈME STRICT

#### Structure de Prompt pour Génération de Programme

```javascript
// Fichier: js/modules/programming/ai-prompt-builder.js

function buildProgramPrompt(questionnaireData) {
  // Structure OBLIGATOIRE du prompt

  const prompt = `
Tu es un coach sportif expert spécialisé en ${questionnaireData.sport}.

DONNÉES ATHLÈTE:
- Sport/Objectif: ${questionnaireData.sport} - ${questionnaireData.competition}
- Niveau: ${questionnaireData.level}
- Expérience: ${questionnaireData.experience} ans
- Données physio: VO2max ${questionnaireData.vo2max}, FC max ${questionnaireData.fcMax}
- Disponibilité: ${questionnaireData.sessionsPerWeek} sessions/semaine
- Contraintes: ${questionnaireData.constraints}

PHASE DE PÉRIODISATION:
${questionnaireData.periodization.phase} (${questionnaireData.periodization.weeks} semaines)
- Objectif: ${questionnaireData.periodization.objective}
- Intensité: ${questionnaireData.periodization.intensity}

BASE DE DONNÉES À UTILISER:
Utilise EXCLUSIVEMENT les formats de séance de la base de données ${questionnaireData.sport}.
NE JAMAIS inventer de formats. TOUJOURS utiliser les formats existants.

FORMATS DISPONIBLES:
${JSON.stringify(questionnaireData.availableFormats, null, 2)}

CONSIGNES DE GÉNÉRATION:
1. Générer ${questionnaireData.periodization.weeks} semaines de programme
2. Respecter STRICTEMENT les formats de la base de données
3. Progression logique d'intensité selon la phase
4. Varier les formats pour éviter monotonie
5. Équilibrer volume et intensité selon niveau

FORMAT DE SORTIE OBLIGATOIRE:
Retourne un JSON structuré ainsi:
{
    "program_name": "Nom du programme",
    "duration_weeks": ${questionnaireData.periodization.weeks},
    "weeks": [
        {
            "week_number": 1,
            "theme": "Thème de la semaine",
            "sessions": [
                {
                    "day": "Lundi",
                    "format_name": "Nom exact du format",
                    "duration": "Durée",
                    "description": "Description détaillée",
                    "zones": "Zones d'intensité",
                    "notes": "Notes spécifiques"
                }
            ]
        }
    ]
}
`;

  return prompt;
}
```

#### Validation Post-Génération OBLIGATOIRE

```javascript
// Fichier: js/modules/programming/program-validation.js

async function validateGeneratedProgram(program, database) {
  const errors = [];
  const warnings = [];

  // 1. Vérifier structure JSON
  if (!program.weeks || !Array.isArray(program.weeks)) {
    errors.push('Structure JSON invalide: manque propriété "weeks"');
  }

  // 2. Vérifier que tous les formats existent dans la base
  program.weeks.forEach((week, weekIndex) => {
    week.sessions.forEach((session, sessionIndex) => {
      const formatExists = database.formats.some(f => f.name === session.format_name);

      if (!formatExists) {
        errors.push(
          `Semaine ${weekIndex + 1}, Session ${sessionIndex + 1}: ` +
            `Format "${session.format_name}" n'existe pas dans la base de données`
        );
      }
    });
  });

  // 3. Vérifier progression logique
  const intensities = program.weeks.map(w => w.average_intensity);
  const hasProgression = validateProgression(intensities);
  if (!hasProgression) {
    warnings.push("La progression d'intensité n'est pas optimale");
  }

  // 4. Vérifier volume hebdomadaire
  program.weeks.forEach((week, index) => {
    if (week.sessions.length < 2) {
      warnings.push(`Semaine ${index + 1}: Moins de 2 sessions`);
    }
    if (week.sessions.length > 7) {
      warnings.push(`Semaine ${index + 1}: Plus de 7 sessions (surcharge)`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
```

---

## 🎨 SYSTÈME DE DESIGN - GORILLA GLASS

### Variables CSS Obligatoires

#### Fichier: css/master-theme.css

```css
:root {
  /* === GORILLA GLASS EFFECT === */
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  --glass-backdrop: blur(10px) saturate(180%);

  /* === COULEURS PRINCIPALES === */
  --color-primary: #3e8e41; /* Vert Skali */
  --color-secondary: #2563eb; /* Bleu */
  --color-accent: #dc2626; /* Rouge */
  --color-success: #059669; /* Vert succès */
  --color-warning: #f59e0b; /* Orange */
  --color-danger: #ef4444; /* Rouge danger */

  /* === COULEURS DE RÔLES === */
  --color-admin: #dc2626;
  --color-coach: #2563eb;
  --color-athlete: #059669;

  /* === BACKGROUNDS === */
  --bg-primary: #0a0a0a; /* Noir principal */
  --bg-secondary: #1a1a1a; /* Gris foncé */
  --bg-tertiary: #2a2a2a; /* Gris moyen */

  /* === TEXTE === */
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --text-tertiary: #606060;

  /* === SPACING === */
  --spacing-xs: 0.25rem; /* 4px */
  --spacing-sm: 0.5rem; /* 8px */
  --spacing-md: 1rem; /* 16px */
  --spacing-lg: 1.5rem; /* 24px */
  --spacing-xl: 2rem; /* 32px */
  --spacing-2xl: 3rem; /* 48px */

  /* === BORDER RADIUS === */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* === TRANSITIONS === */
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
  --transition-slow: 500ms ease;
}
```

### Classes Utilitaires Gorilla Glass

```css
/* Carte Gorilla Glass Standard */
.glass-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  backdrop-filter: var(--glass-backdrop);
  -webkit-backdrop-filter: var(--glass-backdrop);
  box-shadow: var(--glass-shadow);
  padding: var(--spacing-lg);
  transition: all var(--transition-normal);
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.5);
}

/* Bouton Gorilla Glass */
.glass-button {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  backdrop-filter: var(--glass-backdrop);
  color: var(--text-primary);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.glass-button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.02);
}

.glass-button:active {
  transform: scale(0.98);
}

/* Modal Gorilla Glass */
.glass-modal {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  backdrop-filter: var(--glass-backdrop);
  box-shadow: 0 20px 60px 0 rgba(0, 0, 0, 0.6);
  max-width: 600px;
  padding: var(--spacing-2xl);
}

/* Input Gorilla Glass */
.glass-input {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  padding: var(--spacing-sm) var(--spacing-md);
  transition: all var(--transition-fast);
}

.glass-input:focus {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(62, 142, 65, 0.2);
}
```

### Règles d'Application du Design

#### 1. TOUJOURS utiliser les classes Gorilla Glass

```html
<!-- ❌ INTERDIT -->
<div style="background: rgba(255,255,255,0.05); border-radius: 8px;">
  <!-- ✅ CORRECT -->
  <div class="glass-card"></div>
</div>
```

#### 2. TOUJOURS utiliser les variables CSS

```css
/* ❌ INTERDIT */
.custom-button {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  padding: 8px 16px;
}

/* ✅ CORRECT */
.custom-button {
  background: var(--glass-bg);
  color: var(--text-primary);
  padding: var(--spacing-sm) var(--spacing-lg);
}
```

#### 3. Thème Sombre par Défaut

```javascript
// L'application est DARK MODE par défaut
// Le light mode est une option secondaire

// Si création d'un nouveau module, TOUJOURS tester en dark mode d'abord
```

---

## 📱 RESPONSIVE DESIGN

### Breakpoints Obligatoires

```css
/* Mobile First Approach */

/* Mobile (par défaut) */
/* 320px - 767px */

/* Tablet */
@media (min-width: 768px) {
  /* Styles tablette */
}

/* Desktop */
@media (min-width: 1024px) {
  /* Styles desktop */
}

/* Large Desktop */
@media (min-width: 1440px) {
  /* Styles grand écran */
}

/* TV Mode (1080p) */
@media (min-width: 1920px) and (orientation: landscape) {
  /* Styles mode TV */
}
```

### Règles Responsive STRICTES

#### 1. Mobile First OBLIGATOIRE

```css
/* ❌ INTERDIT: Desktop First */
.my-component {
  width: 1200px; /* Desktop d'abord */
}

@media (max-width: 768px) {
  .my-component {
    width: 100%; /* Mobile après */
  }
}

/* ✅ CORRECT: Mobile First */
.my-component {
  width: 100%; /* Mobile d'abord */
}

@media (min-width: 768px) {
  .my-component {
    width: 600px; /* Tablette après */
  }
}

@media (min-width: 1024px) {
  .my-component {
    width: 1200px; /* Desktop après */
  }
}
```

#### 2. Toujours Tester Sur Mobile

```javascript
// Avant de considérer une fonctionnalité comme terminée:
// 1. Tester sur Chrome DevTools Mobile Emulator
// 2. Tester sur vraie tablette si possible
// 3. Vérifier que tous les boutons sont cliquables (taille min 44x44px)
// 4. Vérifier que le texte est lisible (taille min 16px)
```

#### 3. Utiliser ResponsiveManager

```javascript
// Fichier: js/core/responsive-manager.js

// Détecter le type d'appareil
const device = ResponsiveManager.getDeviceType();
// Retourne: 'mobile', 'tablet', 'desktop', ou 'tv'

// Adapter l'UI selon l'appareil
if (device === 'mobile') {
  // Afficher menu hamburger
  showMobileMenu();
} else {
  // Afficher menu complet
  showDesktopMenu();
}

// Écouter les changements de taille
ResponsiveManager.onResize(() => {
  // Réorganiser l'UI si nécessaire
  adjustLayout();
});
```

---

## ⚡ PERFORMANCES ET OPTIMISATION

### Règles de Performance CRITIQUES

#### 1. Lazy Loading OBLIGATOIRE pour les Modules

```javascript
// ❌ INTERDIT: Charger tous les modules au démarrage
import NutritionManager from './modules/nutrition/nutrition-core.js';
import ProgrammingPro from './modules/programming/programming-pro.js';
// ... tous les modules

// ✅ CORRECT: Lazy loading à la demande
async function loadNutritionModule() {
  if (!window.NutritionManager) {
    const module = await import('./modules/nutrition/nutrition-core.js');
    window.NutritionManager = module.default;
  }
  return window.NutritionManager;
}

// Utilisation
document.querySelector('#nutrition-button').addEventListener('click', async () => {
  const NutritionManager = await loadNutritionModule();
  NutritionManager.init();
});
```

#### 2. Optimisation DOM - TOUJOURS Utiliser DocumentFragment

```javascript
// ❌ INTERDIT: Manipulations DOM multiples
function renderMembers(members) {
  const container = document.getElementById('members-list');
  members.forEach(member => {
    const div = document.createElement('div');
    div.innerHTML = `<p>${member.name}</p>`;
    container.appendChild(div); // Reflow à chaque itération !
  });
}

// ✅ CORRECT: Utiliser DocumentFragment
function renderMembers(members) {
  const fragment = document.createDocumentFragment();

  members.forEach(member => {
    const div = document.createElement('div');
    div.innerHTML = `<p>${member.name}</p>`;
    fragment.appendChild(div);
  });

  // Un seul reflow
  document.getElementById('members-list').appendChild(fragment);
}
```

#### 3. Debounce pour les Événements Fréquents

```javascript
// Fichier: js/core/utils.js contient la fonction debounce

// ❌ INTERDIT: Appeler une fonction à chaque keypress
searchInput.addEventListener('input', e => {
  searchMembers(e.target.value); // Appelé 50 fois si on tape 50 caractères !
});

// ✅ CORRECT: Debounce
import { debounce } from './core/utils.js';

const debouncedSearch = debounce(value => {
  searchMembers(value);
}, 300); // Attendre 300ms après la dernière frappe

searchInput.addEventListener('input', e => {
  debouncedSearch(e.target.value);
});
```

#### 4. Images - TOUJOURS Optimiser

```html
<!-- ❌ INTERDIT: Image non optimisée -->
<img src="large-image.png" alt="Photo" />

<!-- ✅ CORRECT: Image optimisée avec lazy loading -->
<img
  src="large-image-small.webp"
  srcset="large-image-small.webp 400w, large-image-medium.webp 800w, large-image-large.webp 1200w"
  sizes="(max-width: 768px) 100vw,
           (max-width: 1024px) 50vw,
           800px"
  alt="Photo"
  loading="lazy"
  decoding="async"
/>
```

#### 5. Monitoring Performance

```javascript
// Fichier: js/core/performance-monitor.js

// TOUJOURS monitorer les Core Web Vitals
PerformanceMonitor.init({
  onLCP: lcp => {
    console.log('LCP:', lcp, 'ms');
    // Objectif: < 2500ms
    if (lcp > 2500) {
      console.warn('LCP trop élevé !');
    }
  },
  onFID: fid => {
    console.log('FID:', fid, 'ms');
    // Objectif: < 100ms
  },
  onCLS: cls => {
    console.log('CLS:', cls);
    // Objectif: < 0.1
  }
});
```

### Checklist Performance pour Chaque Nouveau Module

```javascript
// Avant de considérer un module comme terminé:

✅ 1. Lazy loading implémenté?
✅ 2. Images optimisées (WebP, lazy loading)?
✅ 3. Debounce sur inputs/scroll/resize?
✅ 4. DocumentFragment pour rendering de listes?
✅ 5. Event delegation plutôt que listeners multiples?
✅ 6. Pas de requêtes API en boucle?
✅ 7. CSS critique inline, reste en async?
✅ 8. Pas de layout thrashing (lecture/écriture DOM alternées)?
✅ 9. Console.log retirés en production?
✅ 10. Performance testée sur mobile?
```

---

## 🔌 INTÉGRATIONS EXTERNES

### 1. Discord API

#### Configuration

```javascript
// Fichier: js/core/discord-config.js

const DISCORD_CONFIG = {
  // Webhook pour notifications
  WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,

  // OAuth pour authentification
  CLIENT_ID: process.env.DISCORD_CLIENT_ID,
  CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
  REDIRECT_URI: 'https://[your-app]/api/discord/callback',

  // Channels
  CHANNELS: {
    PROGRAMS: '1234567890', // Channel notifications programmes
    PERFORMANCES: '0987654321', // Channel performances
    GENERAL: '1122334455' // Channel général
  }
};
```

#### Notifications Discord

```javascript
// Fichier: js/integrations/discordnotifier.js

// TOUJOURS utiliser DiscordNotifier pour envoyer des notifications

// Exemple: Notifier création de programme
await DiscordNotifier.sendProgramCreated({
  athleteName: 'Jean Dupont',
  sport: 'Trail Running',
  duration: '12 semaines',
  startDate: '2025-01-15'
});

// Exemple: Notifier nouvelle performance
await DiscordNotifier.sendPerformanceUpdate({
  athleteName: 'Jean Dupont',
  metric: 'VO2max',
  value: 58,
  improvement: '+3%'
});

// Format du message Discord (Embed)
const embed = {
  title: '🏃 Nouveau Programme Créé',
  description: `Programme ${sport} pour ${athleteName}`,
  color: 0x3e8e41, // Vert Skali
  fields: [
    { name: 'Durée', value: duration, inline: true },
    { name: 'Début', value: startDate, inline: true }
  ],
  timestamp: new Date(),
  footer: {
    text: 'Skali Prog - Performance Training System'
  }
};
```

#### OAuth Discord (Authentification)

```javascript
// Fichier: js/modules/portal/portal-auth-oauth.js

// Flow OAuth pour connexion membre
async function loginWithDiscord() {
  // 1. Rediriger vers Discord
  const authUrl =
    `https://discord.com/api/oauth2/authorize?` +
    `client_id=${DISCORD_CONFIG.CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(DISCORD_CONFIG.REDIRECT_URI)}&` +
    `response_type=code&` +
    `scope=identify email`;

  window.location.href = authUrl;
}

// 2. Callback après autorisation Discord
async function handleDiscordCallback(code) {
  // Échanger le code contre un token
  const token = await exchangeCodeForToken(code);

  // Récupérer infos utilisateur
  const user = await getDiscordUser(token);

  // Créer/mettre à jour le membre
  await SupabaseManager.upsertMember({
    discord_id: user.id,
    name: user.username,
    email: user.email,
    avatar: user.avatar
  });

  // Connecter l'utilisateur
  sessionStorage.setItem('skaliAuth', 'true');
  sessionStorage.setItem('skaliUserRole', 'ATHLETE');
  sessionStorage.setItem('skaliUserId', user.id);
}
```

### 2. Objets Connectés (Wearables)

#### Support Apple Watch

```javascript
// Fichier: js/integrations/wearables-integration.js

class WearablesManager {
  // Connexion Apple Watch via Web Bluetooth API
  async connectAppleWatch() {
    try {
      // Demander accès Bluetooth
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service']
      });

      // Se connecter au device
      const server = await device.gatt.connect();

      // Obtenir le service heart rate
      const hrService = await server.getPrimaryService('heart_rate');
      const hrCharacteristic = await hrService.getCharacteristic('heart_rate_measurement');

      // Écouter les changements
      hrCharacteristic.addEventListener('characteristicvaluechanged', event => {
        const heartRate = this.parseHeartRate(event.target.value);
        this.broadcastHeartRate(heartRate);
      });

      await hrCharacteristic.startNotifications();

      console.log('Apple Watch connectée');
      return true;
    } catch (error) {
      console.error('Erreur connexion Apple Watch:', error);
      return false;
    }
  }

  // Parser les données heart rate
  parseHeartRate(value) {
    const flags = value.getUint8(0);
    const is16Bit = flags & 0x01;

    if (is16Bit) {
      return value.getUint16(1, true);
    } else {
      return value.getUint8(1);
    }
  }

  // Diffuser la fréquence cardiaque
  broadcastHeartRate(hr) {
    // Émettre un événement personnalisé
    window.dispatchEvent(
      new CustomEvent('heartrate', {
        detail: { value: hr, timestamp: Date.now() }
      })
    );

    // Afficher en mode TV si actif
    if (window.TVMode && window.TVMode.isActive) {
      window.TVMode.updateHeartRate(hr);
    }
  }
}
```

#### Synchronisation Automatique

```javascript
// Auto-sync des données depuis Apple Health / Google Fit

async function syncWearableData() {
  // Cette fonction est appelée automatiquement toutes les 5 minutes
  // pour les athlètes connectés

  const role = sessionStorage.getItem('skaliUserRole');
  if (role !== 'ATHLETE') return; // Sync auto uniquement pour athlètes

  try {
    // Récupérer données récentes
    const recentData = await WearablesManager.getRecentData();

    // Sauvegarder dans Supabase
    for (const dataPoint of recentData) {
      await SupabaseManager.createPerformance({
        member_id: sessionStorage.getItem('skaliUserId'),
        metric_name: dataPoint.type, // 'heart_rate', 'steps', 'calories'
        value: dataPoint.value,
        unit: dataPoint.unit,
        date: dataPoint.date
      });
    }

    console.log(`${recentData.length} données synchronisées`);
  } catch (error) {
    console.error('Erreur sync wearables:', error);
  }
}

// Lancer la sync auto
if (sessionStorage.getItem('skaliUserRole') === 'ATHLETE') {
  setInterval(syncWearableData, 5 * 60 * 1000); // Toutes les 5 minutes
}
```

### 3. OpenWeather API (Optionnel)

```javascript
// Intégration météo pour suggérer adaptations d'entraînement

async function getWeatherAdaptation(location) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;

  const response = await fetch(url);
  const weather = await response.json();

  // Adapter les recommandations selon météo
  if (weather.main.temp > 30) {
    return {
      warning: 'Température élevée',
      recommendation: 'Privilégier entraînement tôt le matin ou en soirée',
      hydration: 'Augmenter hydratation de 50%'
    };
  }

  if (weather.main.temp < 5) {
    return {
      warning: 'Température basse',
      recommendation: 'Échauffement prolongé nécessaire',
      equipment: 'Vêtements thermiques recommandés'
    };
  }

  return { status: 'optimal' };
}
```

---

## 📄 GÉNÉRATION PDF

### Configuration jsPDF

```javascript
// TOUJOURS utiliser cette configuration de base

import { jsPDF } from 'jspdf';

// Configuration standard
const doc = new jsPDF({
  orientation: 'landscape', // 'portrait' ou 'landscape'
  unit: 'mm',
  format: 'a4',
  compress: true // Réduire taille fichier
});

// Ajouter polices personnalisées si nécessaire
doc.addFont('path/to/font.ttf', 'CustomFont', 'normal');
```

### Templates PDF Standards

#### 1. Programme d'Entraînement

```javascript
// Fichier: js/services/program-pdf-generator-v3.js

async function generateProgramPDF(program) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Page de garde
  addCoverPage(doc, program);

  // Boucle sur les semaines
  program.weeks.forEach((week, index) => {
    if (index > 0) doc.addPage();

    // En-tête semaine
    addWeekHeader(doc, week, index + 1);

    // Sessions de la semaine
    addWeekSessions(doc, week.sessions);

    // Notes et conseils
    addWeekNotes(doc, week);
  });

  // Page de fin (récapitulatif)
  doc.addPage();
  addSummaryPage(doc, program);

  // Sauvegarder
  const filename = `Programme_${program.sport}_${program.athlete_name}_${Date.now()}.pdf`;
  doc.save(filename);

  return filename;
}

function addCoverPage(doc, program) {
  // Logo Skali
  doc.addImage('/images/logo-skali.png', 'PNG', 10, 10, 40, 40);

  // Titre
  doc.setFontSize(24);
  doc.setTextColor(62, 142, 65); // Vert Skali
  doc.text(`Programme ${program.sport}`, 148, 60, { align: 'center' });

  // Infos athlète
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(`Athlète: ${program.athlete_name}`, 148, 80, { align: 'center' });
  doc.text(`Durée: ${program.duration_weeks} semaines`, 148, 90, { align: 'center' });
  doc.text(`Début: ${program.start_date}`, 148, 100, { align: 'center' });

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text('Skali Prog - Performance Training System', 148, 200, { align: 'center' });
}
```

#### 2. Plan Nutritionnel

```javascript
// Fichier: js/modules/nutrition/nutrition-pdf-pro.js

async function generateNutritionPDF(nutritionPlan) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Page 1: Résumé
  addNutritionSummary(doc, nutritionPlan);

  // Page 2+: Plans de repas
  doc.addPage();
  addMealPlans(doc, nutritionPlan.meals);

  // Dernière page: Conseils
  doc.addPage();
  addNutritionTips(doc);

  const filename = `Nutrition_${nutritionPlan.athlete_name}_${Date.now()}.pdf`;
  doc.save(filename);

  return filename;
}
```

### Règles PDF STRICTES

#### 1. TOUJOURS Inclure Branding Skali

```javascript
// Logo, couleurs, footer sur chaque PDF généré
const SKALI_BRANDING = {
  logo: '/images/logo-skali.png',
  primaryColor: [62, 142, 65], // RGB
  secondaryColor: [37, 99, 235],
  footer: 'Skali Prog - Performance Training System'
};
```

#### 2. Format Standardisé

```javascript
// Structure obligatoire pour tous les PDFs:
// 1. Page de garde avec logo
// 2. Contenu principal
// 3. Page récapitulative
// 4. Footer sur chaque page
```

#### 3. Compression et Optimisation

```javascript
// TOUJOURS compresser les PDFs
const doc = new jsPDF({ compress: true });

// Optimiser les images avant insertion
function optimizeImageForPDF(imageBase64) {
  // Réduire qualité si > 500KB
  // Convertir en JPEG si PNG volumineux
}
```

---

## 🧪 TESTING ET VALIDATION

### Pas de Tests Automatisés (Pour l'Instant)

L'application n'a PAS de suite de tests automatisés (Jest, Mocha, etc.).

#### Procédure de Test Manuelle OBLIGATOIRE

Avant de considérer une fonctionnalité comme terminée:

```javascript
// Checklist de tests manuels

✅ 1. FONCTIONNEL
    □ La fonctionnalité fonctionne comme prévu?
    □ Tous les cas d'usage principaux testés?
    □ Gestion d'erreurs testée (mauvaises données, API down)?

✅ 2. PERMISSIONS
    □ Testé avec rôle ADMIN?
    □ Testé avec rôle COACH?
    □ Testé avec rôle ATHLETE?
    □ Les restrictions sont respectées?

✅ 3. RESPONSIVE
    □ Testé sur mobile (Chrome DevTools)?
    □ Testé sur tablette?
    □ Testé sur desktop?
    □ Testé en mode TV (1080p landscape)?

✅ 4. PERFORMANCE
    □ Pas de lag visible?
    □ Temps de chargement < 3s?
    □ Pas de layout thrashing?
    □ Console propre (pas d'erreurs)?

✅ 5. DATA
    □ Données sauvegardées correctement dans Supabase?
    □ Données affichées correctement?
    □ Synchronisation OK?

✅ 6. UI/UX
    □ Design cohérent avec le reste de l'app?
    □ Gorilla Glass effect appliqué?
    □ Feedbacks visuels présents (loading, success, error)?
    □ Navigation intuitive?

✅ 7. INTÉGRATIONS
    □ Discord notifications OK (si applicable)?
    □ Claude AI génération OK (si applicable)?
    □ PDF export OK (si applicable)?
```

### Validation Automatique (Limitée)

#### 1. Validation de Formulaire

```javascript
// TOUJOURS valider les formulaires avant soumission

function validateProgramForm(formData) {
  const errors = [];

  // Validation champs requis
  if (!formData.sport) errors.push('Sport requis');
  if (!formData.duration || formData.duration < 4) {
    errors.push('Durée minimum 4 semaines');
  }

  // Validation format données
  if (formData.sessionsPerWeek < 2 || formData.sessionsPerWeek > 7) {
    errors.push('Sessions par semaine: entre 2 et 7');
  }

  // Validation cohérence
  if (formData.level === 'beginner' && formData.sessionsPerWeek > 5) {
    errors.push('Maximum 5 sessions/semaine pour débutants');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Afficher les erreurs à l'utilisateur
function showValidationErrors(errors) {
  const errorHtml = errors
    .map(
      err => `
        <div class="glass-card bg-red-500/20 border-red-500 p-4 mb-2">
            <i class="fas fa-exclamation-circle mr-2"></i>
            ${err}
        </div>
    `
    )
    .join('');

  document.getElementById('validation-errors').innerHTML = errorHtml;
}
```

#### 2. Validation Pré-Génération IA

```javascript
// Fichier: js/modules/programming/program-validation.js

// TOUJOURS valider avant d'envoyer à Claude AI
async function validateBeforeGeneration(questionnaireData) {
  const validation = {
    errors: [],
    warnings: [],
    canProceed: true
  };

  // Vérifier données physiologiques cohérentes
  if (questionnaireData.vo2max && questionnaireData.fcMax) {
    const expectedFcMax = 220 - questionnaireData.age;
    if (Math.abs(questionnaireData.fcMax - expectedFcMax) > 20) {
      validation.warnings.push(`FC max (${questionnaireData.fcMax}) semble incohérente avec l'âge`);
    }
  }

  // Vérifier disponibilité réaliste
  if (questionnaireData.sessionsPerWeek > 6 && questionnaireData.level === 'beginner') {
    validation.errors.push('Trop de sessions pour un débutant');
    validation.canProceed = false;
  }

  // Vérifier base de données chargée
  if (!questionnaireData.availableFormats || questionnaireData.availableFormats.length === 0) {
    validation.errors.push(`Base de données ${questionnaireData.sport} non chargée`);
    validation.canProceed = false;
  }

  return validation;
}
```

### Console Logging - Règles STRICTES

```javascript
// ✅ EN DÉVELOPPEMENT: Utiliser console.log pour debugging
console.log('Données questionnaire:', questionnaireData);
console.warn('Validation warning:', warningMessage);
console.error('Erreur génération:', error);

// ❌ EN PRODUCTION: RETIRER tous les console.log
// Utiliser un système de logging propre

// Solution: Fonction de logging conditionnelle
const isDev = window.location.hostname === 'localhost';

function log(...args) {
  if (isDev) {
    console.log(...args);
  }
}

function warn(...args) {
  if (isDev) {
    console.warn(...args);
  }
}

function logError(...args) {
  console.error(...args); // Toujours logger les erreurs
  // Optionnel: envoyer à un service de monitoring
}

// Utilisation
log('Debug info'); // Visible seulement en dev
logError('Critical error'); // Toujours visible
```

---

## 🐛 GESTION DES ERREURS

### Principes de Gestion d'Erreurs

#### 1. TOUJOURS Utiliser Try/Catch pour les Opérations Async

```javascript
// ❌ INTERDIT: Pas de gestion d'erreur
async function loadMember(memberId) {
  const member = await SupabaseManager.getMember(memberId);
  displayMember(member);
}

// ✅ CORRECT: Try/Catch avec feedback utilisateur
async function loadMember(memberId) {
  try {
    showLoading('Chargement membre...');

    const member = await SupabaseManager.getMember(memberId);

    if (!member) {
      throw new Error('Membre non trouvé');
    }

    displayMember(member);
    hideLoading();
  } catch (error) {
    console.error('Erreur chargement membre:', error);
    hideLoading();
    showErrorModal('Impossible de charger le membre', error.message);
  }
}
```

#### 2. Feedbacks Utilisateur OBLIGATOIRES

```javascript
// Toujours informer l'utilisateur de l'état de l'opération

// Loading
function showLoading(message = 'Chargement...') {
  const loadingHtml = `
        <div id="loading-overlay" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div class="glass-card p-8 text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p class="text-white">${message}</p>
            </div>
        </div>
    `;
  document.body.insertAdjacentHTML('beforeend', loadingHtml);
}

function hideLoading() {
  document.getElementById('loading-overlay')?.remove();
}

// Success
function showSuccessMessage(message) {
  const successHtml = `
        <div class="glass-card bg-green-500/20 border-green-500 p-4 mb-4 animate-fade-in">
            <i class="fas fa-check-circle text-green-500 mr-2"></i>
            ${message}
        </div>
    `;
  document.getElementById('notifications').insertAdjacentHTML('beforeend', successHtml);

  // Auto-remove après 3s
  setTimeout(() => {
    document.querySelector('.animate-fade-in')?.remove();
  }, 3000);
}

// Error
function showErrorModal(title, message) {
  const errorHtml = `
        <div id="error-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div class="glass-modal max-w-md">
                <div class="flex items-center mb-4">
                    <i class="fas fa-exclamation-triangle text-red-500 text-2xl mr-3"></i>
                    <h2 class="text-xl font-bold text-white">${title}</h2>
                </div>
                <p class="text-gray-300 mb-6">${message}</p>
                <button onclick="closeErrorModal()" class="glass-button w-full">
                    Fermer
                </button>
            </div>
        </div>
    `;
  document.body.insertAdjacentHTML('beforeend', errorHtml);
}

function closeErrorModal() {
  document.getElementById('error-modal')?.remove();
}
```

#### 3. Types d'Erreurs Standards

```javascript
// Créer des classes d'erreur personnalisées

class SkaliError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'SkaliError';
    this.code = code;
    this.details = details;
  }
}

class ValidationError extends SkaliError {
  constructor(message, details) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

class APIError extends SkaliError {
  constructor(message, statusCode, details) {
    super(message, 'API_ERROR', details);
    this.name = 'APIError';
    this.statusCode = statusCode;
  }
}

class PermissionError extends SkaliError {
  constructor(message, requiredPermission) {
    super(message, 'PERMISSION_ERROR', { requiredPermission });
    this.name = 'PermissionError';
  }
}

// Utilisation
function editSession(sessionId) {
  if (!PermissionManager.hasPermission('edit_sessions')) {
    throw new PermissionError(
      "Vous n'avez pas la permission de modifier des sessions",
      'edit_sessions'
    );
  }
  // ...
}

// Gestion centralisée des erreurs
window.addEventListener('unhandledrejection', event => {
  console.error('Erreur non gérée:', event.reason);

  if (event.reason instanceof SkaliError) {
    showErrorModal(event.reason.name, event.reason.message);
  } else {
    showErrorModal('Erreur inattendue', 'Une erreur est survenue. Veuillez réessayer.');
  }
});
```

---

## 🔄 SYNCHRONISATION ET BACKUP

### SyncManager - Règles d'Utilisation

#### 1. Synchronisation Automatique pour Athlètes

```javascript
// Fichier: js/managers/syncmanager.js

// TOUJOURS activer sync auto pour les athlètes
if (sessionStorage.getItem('skaliUserRole') === 'ATHLETE') {
  SyncManager.enableAutoSync({
    interval: 5 * 60 * 1000, // 5 minutes
    syncOnChange: true // Sync immédiate après modification
  });
}

// Sync manuelle pour Admin/Coach uniquement
if (PermissionManager.hasPermission('manual_sync')) {
  document.getElementById('sync-button').style.display = 'block';
}
```

#### 2. BackupManager - Sauvegardes Automatiques

```javascript
// Fichier: js/managers/backupmanager.js

// Backup automatique toutes les heures
BackupManager.enableAutoBackup({
  interval: 60 * 60 * 1000, // 1 heure
  maxBackups: 10, // Garder 10 backups max
  location: 'supabase' // 'supabase' ou 'localStorage'
});

// Backup manuel (Admin uniquement)
document.getElementById('backup-button').addEventListener('click', async () => {
  if (!PermissionManager.hasPermission('manual_backup')) {
    PermissionManager.showPermissionError('manual_backup');
    return;
  }

  try {
    showLoading('Création du backup...');
    const backupId = await BackupManager.createBackup();
    hideLoading();
    showSuccessMessage(`Backup créé: ${backupId}`);
  } catch (error) {
    hideLoading();
    showErrorModal('Erreur backup', error.message);
  }
});
```

#### 3. Stratégie de Conflit

```javascript
// En cas de conflit entre données locales et serveur

async function resolveConflict(localData, serverData) {
  // Stratégie: Last Write Wins (LWW)
  // La donnée la plus récente gagne

  if (localData.updated_at > serverData.updated_at) {
    // Données locales plus récentes
    await SupabaseManager.update(localData);
    return localData;
  } else {
    // Données serveur plus récentes
    return serverData;
  }
}

// Alternative: Demander à l'utilisateur
async function askUserToResolveConflict(localData, serverData) {
  const choice = await showConflictModal(localData, serverData);

  if (choice === 'local') {
    await SupabaseManager.update(localData);
    return localData;
  } else if (choice === 'server') {
    return serverData;
  } else {
    // 'merge'
    const merged = mergeData(localData, serverData);
    await SupabaseManager.update(merged);
    return merged;
  }
}
```

---

## 📦 SYSTÈME DE MODULES

### Pattern de Module STANDARD

Tous les modules doivent suivre cette structure:

```javascript
// Fichier: js/modules/[category]/[module-name].js

/**
 * [Module Name] - Description courte
 *
 * Responsabilités:
 * - Responsabilité 1
 * - Responsabilité 2
 *
 * Dépendances:
 * - Module1
 * - Module2
 */

(function () {
  'use strict';

  // === PRIVATE VARIABLES ===
  let isInitialized = false;
  let moduleData = null;

  // === PRIVATE FUNCTIONS ===
  function privateFunction() {
    // Logique privée
  }

  // === PUBLIC API ===
  const ModuleName = {
    /**
     * Initialise le module
     * @param {Object} config - Configuration du module
     */
    init: async function (config = {}) {
      if (isInitialized) {
        console.warn('Module déjà initialisé');
        return;
      }

      try {
        // Vérifier permissions
        if (!PermissionManager.hasPermission('required_permission')) {
          throw new PermissionError('Permission requise');
        }

        // Charger dépendances
        await this.loadDependencies();

        // Initialiser UI
        this.renderUI();

        // Attacher event listeners
        this.attachEventListeners();

        isInitialized = true;
        console.log('Module initialisé');
      } catch (error) {
        console.error('Erreur initialisation module:', error);
        throw error;
      }
    },

    /**
     * Charge les dépendances du module
     */
    loadDependencies: async function () {
      // Charger modules nécessaires
    },

    /**
     * Rend l'interface utilisateur
     */
    renderUI: function () {
      // Générer HTML
    },

    /**
     * Attache les event listeners
     */
    attachEventListeners: function () {
      // Utiliser event delegation
      document.addEventListener('click', e => {
        if (e.target.matches('.module-button')) {
          this.handleButtonClick(e);
        }
      });
    },

    /**
     * Détruit le module et nettoie les ressources
     */
    destroy: function () {
      // Retirer event listeners
      // Nettoyer DOM
      // Réinitialiser variables
      isInitialized = false;
    }
  };

  // Exposer le module globalement
  window.ModuleName = ModuleName;
})();
```

### Chargement de Modules

#### 1. Lazy Loading via module-loader

```javascript
// Fichier: js/core/lazy-loader.js

// Utilisation du lazy loader
async function loadModule(moduleName) {
  const moduleConfig = {
    nutrition: {
      path: './modules/nutrition/nutrition-core.js',
      dependencies: ['supabasemanager']
    },
    programming: {
      path: './modules/programming/programming-pro.js',
      dependencies: ['supabasemanager', 'ai-session-generator']
    }
  };

  const config = moduleConfig[moduleName];
  if (!config) {
    throw new Error(`Module ${moduleName} inconnu`);
  }

  // Charger dépendances d'abord
  for (const dep of config.dependencies) {
    if (!window[dep]) {
      await loadModule(dep);
    }
  }

  // Charger le module
  if (!window[moduleName]) {
    await import(config.path);
  }

  return window[moduleName];
}

// Utilisation dans l'app
document.querySelector('#nutrition-button').addEventListener('click', async () => {
  showLoading('Chargement module nutrition...');
  const NutritionCore = await loadModule('nutrition');
  NutritionCore.init();
  hideLoading();
});
```

#### 2. Déclaration des Dépendances

```javascript
// TOUJOURS déclarer les dépendances en haut de fichier

// Fichier: js/modules/programming/programming-pro.js

/**
 * Programming Pro Module
 *
 * Dépendances REQUISES:
 * - SupabaseManager (js/integrations/supabasemanager.js)
 * - AISessionGenerator (js/integrations/ai-session-generator.js)
 * - ProgramValidation (js/modules/programming/program-validation.js)
 * - TrailDatabase (js/modules/programming/databases/trail-running-database.js)
 */

// Vérifier dépendances au chargement
if (!window.SupabaseManager) {
  throw new Error('SupabaseManager requis');
}
if (!window.AISessionGenerator) {
  throw new Error('AISessionGenerator requis');
}
```

---

## 🚀 DÉPLOIEMENT

### Environnements

#### 1. Développement Local

```bash
# Démarrer le serveur frontend
START-SERVER.bat
# Ou manuellement:
http-server -p 8080 -c-1 --cors

# Démarrer le proxy server (dans un autre terminal)
cd proxy-server
node server.js
# Écoute sur port 3001
```

#### 2. Production (Netlify)

```toml
# netlify.toml
[build]
  command = "echo 'No build step required'"
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### Variables d'Environnement

#### Fichier .env (NE JAMAIS committer)

```bash
# Claude AI
CLAUDE_API_KEY=sk-ant-api03-VOTRE_CLE_ICI

# Supabase
SUPABASE_URL=https://[project].supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiI...

# Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
DISCORD_CLIENT_ID=1234567890
DISCORD_CLIENT_SECRET=your_secret_here

# OpenWeather (Optionnel)
OPENWEATHER_API_KEY=your_key_here

# Proxy Server
PORT=3001

# Mots de passe par défaut (À CHANGER EN PRODUCTION)
ADMIN_PASSWORD=skaliprog
COACH_PASSWORD=coach2024
ATHLETE_PASSWORD=athlete2024
```

#### Gestion Sécurisée des Clés

```javascript
// ❌ INTERDIT: Clés en dur dans le code
const CLAUDE_API_KEY = 'sk-ant-api03-...';

// ✅ CORRECT: Via variables d'environnement
// Fichier: js/core/env.js
const ENV = {
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY || '',
  SUPABASE_URL: process.env.SUPABASE_URL || ''
  // ...
};

// Vérifier que les clés sont chargées
if (!ENV.CLAUDE_API_KEY) {
  console.error('CLAUDE_API_KEY manquante !');
}
```

### Checklist Pré-Déploiement

```javascript
// Avant chaque déploiement en production:

✅ 1. CODE
    □ Tous les console.log de debug retirés?
    □ Pas de clés API en dur?
    □ Code minifié/optimisé?
    □ Pas de fichiers de backup (.bak, -old.js)?

✅ 2. CONFIGURATION
    □ Variables d'environnement configurées sur Netlify?
    □ URLs de production correctes dans api-config.js?
    □ Service Worker à jour?
    □ Manifest.json à jour?

✅ 3. TESTS
    □ Tests manuels complets effectués?
    □ Testéavec tous les rôles (Admin/Coach/Athlete)?
    □ Testé sur mobile/tablette/desktop?
    □ Pas d'erreurs dans la console?

✅ 4. BASE DE DONNÉES
    □ Migrations Supabase appliquées?
    □ RLS policies activées?
    □ Données de test nettoyées?
    □ Backup créé?

✅ 5. INTÉGRATIONS
    □ Discord webhooks configurés?
    □ Claude AI proxy fonctionnel?
    □ Wearables integration testée?

✅ 6. PERFORMANCE
    □ Lighthouse score > 90?
    □ Core Web Vitals optimaux?
    □ Images optimisées?
    □ CSS/JS minifiés?

✅ 7. SÉCURITÉ
    □ Mots de passe par défaut changés?
    □ HTTPS activé?
    □ CORS correctement configuré?
    □ Pas de failles XSS/injection?
```

---

## 📚 DOCUMENTATION

### Règles de Documentation

#### 1. Documentation Inline (JSDoc)

```javascript
/**
 * Génère un programme d'entraînement personnalisé
 *
 * @param {Object} questionnaireData - Données du questionnaire
 * @param {string} questionnaireData.sport - Sport sélectionné ('trail', 'hyrox', etc.)
 * @param {number} questionnaireData.duration - Durée en semaines
 * @param {string} questionnaireData.level - Niveau ('beginner', 'intermediate', 'advanced')
 *
 * @returns {Promise<Object>} Programme généré
 * @returns {string} return.program_name - Nom du programme
 * @returns {number} return.duration_weeks - Durée en semaines
 * @returns {Array<Object>} return.weeks - Semaines du programme
 *
 * @throws {ValidationError} Si les données du questionnaire sont invalides
 * @throws {APIError} Si l'API Claude échoue
 *
 * @example
 * const program = await generateProgram({
 *     sport: 'trail',
 *     duration: 12,
 *     level: 'intermediate'
 * });
 */
async function generateProgram(questionnaireData) {
  // ...
}
```

#### 2. README par Module

```markdown
# Module Name

## Description

Courte description du module et de son rôle dans l'application.

## Responsabilités

- Responsabilité 1
- Responsabilité 2

## Dépendances

- `SupabaseManager` - Gestion base de données
- `PermissionManager` - Contrôle d'accès

## API Publique

### `init(config)`

Initialise le module.

**Paramètres:**

- `config` (Object) - Configuration du module

**Retour:** Promise<void>

### `destroy()`

Détruit le module et nettoie les ressources.

## Utilisation

\`\`\`javascript // Importer le module import ModuleName from './modules/module-name.js';

// Initialiser await ModuleName.init({ option1: 'value1' });

// Utiliser ModuleName.doSomething(); \`\`\`

## Événements

Le module émet les événements suivants:

- `module:ready` - Module initialisé
- `module:error` - Erreur survenue

## Notes

Notes importantes sur le module.
```

#### 3. Changelog

```markdown
# CHANGELOG

## [2.4.0] - 2025-01-15

### Ajouté

- Module nutrition avec planification repas
- Export PDF pour programmes nutrition
- Intégration Apple Watch

### Modifié

- Amélioration performances chargement modules
- Refonte UI questionnaire programmation
- Optimisation génération PDF

### Corrigé

- Bug calcul macros nutrition
- Erreur sync wearables
- Problem affichage mode TV

### Supprimé

- Ancien module nutrition (nutrition-old.js)
- Fichiers backup inutilisés
```

---

## 🎯 BONNES PRATIQUES GLOBALES

### Code Quality Checklist

#### Avant chaque commit:

```javascript
✅ 1. NOMENCLATURE
    □ Noms de variables/fonctions descriptifs?
    □ Conventions de nommage respectées?
    □ Pas d'abréviations obscures?

✅ 2. STRUCTURE
    □ Code DRY (Don't Repeat Yourself)?
    □ Fonctions courtes (< 50 lignes)?
    □ Un fichier = Une responsabilité?

✅ 3. SÉCURITÉ
    □ Pas de clés API en dur?
    □ Validation des inputs?
    □ Permissions vérifiées?
    □ Pas de failles XSS/injection?

✅ 4. PERFORMANCE
    □ Pas de boucles inutiles?
    □ Lazy loading implémenté?
    □ DOM optimisé (DocumentFragment)?
    □ Images optimisées?

✅ 5. MAINTENANCE
    □ Code commenté (pour les parties complexes)?
    □ Pas de code mort (commenté/inutilisé)?
    □ Dépendances à jour?
    □ Documentation à jour?

✅ 6. TESTING
    □ Tests manuels effectués?
    □ Testé sur différents rôles?
    □ Testé sur mobile?
    □ Console propre?
```

### Patterns à Éviter

#### ❌ Anti-Patterns

```javascript
// 1. Variables globales non contrôlées
var myGlobalVar = 'foo'; // ❌

// 2. Callbacks imbriqués (Callback Hell)
doSomething(function (result) {
  doSomethingElse(result, function (newResult) {
    doAnotherThing(newResult, function (finalResult) {
      // ❌ Illisible
    });
  });
});

// 3. Code dupliqué
function calculateBMI1(weight, height) {
  return weight / (height * height);
}
function calculateBMI2(w, h) {
  return w / (h * h);
} // ❌ Duplication

// 4. Magic Numbers
if (user.age > 18) {
} // ❌ Que représente 18?

// 5. Conditions complexes imbriquées
if (condition1) {
  if (condition2) {
    if (condition3) {
      // ❌ Difficile à lire
    }
  }
}
```

#### ✅ Solutions

```javascript
// 1. Utiliser IIFE ou modules
(function () {
  const myVar = 'foo'; // ✅ Scope limité
})();

// 2. Utiliser async/await
async function doEverything() {
  const result = await doSomething();
  const newResult = await doSomethingElse(result);
  const finalResult = await doAnotherThing(newResult);
  return finalResult; // ✅ Lisible
}

// 3. Factoriser le code
function calculateBMI(weight, height) {
  return weight / (height * height);
} // ✅ Une seule fonction

// 4. Utiliser des constantes nommées
const LEGAL_AGE = 18;
if (user.age > LEGAL_AGE) {
} // ✅ Clair

// 5. Early return
function processUser(user) {
  if (!condition1) return;
  if (!condition2) return;
  if (!condition3) return;

  // ✅ Logique principale non imbriquée
}
```

---

## 🔍 DEBUGGING ET TROUBLESHOOTING

### Outils de Debugging

#### 1. Console Structuré

```javascript
// Utiliser des logs structurés avec préfixes

const Logger = {
  debug: (module, message, data) => {
    if (isDev) {
      console.log(`[DEBUG][${module}]`, message, data);
    }
  },
  info: (module, message, data) => {
    console.info(`[INFO][${module}]`, message, data);
  },
  warn: (module, message, data) => {
    console.warn(`[WARN][${module}]`, message, data);
  },
  error: (module, message, error) => {
    console.error(`[ERROR][${module}]`, message, error);
    // Optionnel: envoyer à un service de monitoring
  }
};

// Utilisation
Logger.debug('NutritionCore', 'Calcul macros', { calories: 2500, protein: 150 });
Logger.error('ProgrammingPro', 'Échec génération', error);
```

#### 2. Performance Debugging

```javascript
// Mesurer performance d'une fonction

async function measurePerformance(fnName, fn) {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();

  const duration = end - start;
  Logger.debug('Performance', `${fnName} took ${duration.toFixed(2)}ms`);

  if (duration > 1000) {
    Logger.warn('Performance', `${fnName} is slow (> 1s)`);
  }

  return result;
}

// Utilisation
const program = await measurePerformance('generateProgram', () => {
  return generateProgram(questionnaireData);
});
```

### Problèmes Courants et Solutions

#### Problème 1: Module ne se charge pas

```javascript
// Symptôme: "Module is not defined"
// Cause: Dépendance manquante ou ordre de chargement incorrect

// Solution:
// 1. Vérifier que le module est bien importé
// 2. Vérifier l'ordre de chargement dans index.html
// 3. Utiliser le lazy loader

<script src="js/core/config.js" defer></script>
<script src="js/managers/viewmanager.js" defer></script>
<script src="js/modules/nutrition/nutrition-core.js" defer></script>
```

#### Problème 2: Erreur CORS

```javascript
// Symptôme: "CORS policy: No 'Access-Control-Allow-Origin' header"
// Cause: API appelée depuis un domaine différent

// Solution 1: Utiliser le proxy server (recommandé)
const response = await fetch(`${CURRENT_API.PROXY_URL}/api/chat`, {});

// Solution 2: Configurer CORS sur le serveur
// Dans server.js:
app.use(
  cors({
    origin: ['http://localhost:8080', 'https://your-app.netlify.app'],
    credentials: true
  })
);
```

#### Problème 3: Données ne se sauvent pas dans Supabase

```javascript
// Symptôme: Pas d'erreur mais données absentes
// Cause: RLS policies bloquent l'insertion

// Solution:
// 1. Vérifier que l'utilisateur est authentifié
const { data, error } = await supabase.auth.getUser();
if (error) {
  Logger.error('Supabase', 'User not authenticated', error);
}

// 2. Vérifier les RLS policies dans Supabase Dashboard
// 3. Temporairement désactiver RLS pour tester (SEULEMENT EN DEV)
```

#### Problème 4: PDF ne se génère pas

```javascript
// Symptôme: Erreur ou PDF vide
// Cause: Données manquantes ou format incorrect

// Solution:
// 1. Valider les données avant génération
console.log('Program data:', program); // Vérifier structure

// 2. Vérifier que jsPDF est chargé
if (typeof jsPDF === 'undefined') {
  Logger.error('PDF', 'jsPDF not loaded');
  return;
}

// 3. Gérer les erreurs de génération
try {
  const doc = new jsPDF({});
  // ... génération
  doc.save('file.pdf');
} catch (error) {
  Logger.error('PDF', 'Generation failed', error);
  showErrorModal('Erreur PDF', error.message);
}
```

---

## 🎓 FORMATION ET ONBOARDING

### Pour un Nouveau Développeur

#### Semaine 1: Découverte

```javascript
// Jour 1-2: Setup environnement
1. Cloner le repo
2. Installer http-server: npm install -g http-server
3. Copier .env.template vers .env et remplir les clés
4. Lancer START-SERVER.bat
5. Accéder à http://localhost:8080

// Jour 3-4: Explorer l'architecture
1. Lire ce claude.md en entier
2. Explorer la structure de fichiers
3. Lire les README des modules principaux
4. Tester l'application avec différents rôles

// Jour 5: Premier ticket
1. Choisir un ticket "good first issue"
2. Lire le code concerné
3. Faire une modification simple
4. Tester manuellement
5. Commit et push
```

#### Semaine 2-3: Montée en compétence

```javascript
// Approfondissement modules
1. Étudier un module en profondeur (ex: Nutrition)
2. Comprendre les interactions avec Supabase
3. Comprendre le flow de génération IA
4. Refactoriser ou améliorer un petit bout de code

// Premier feature complet
1. Prendre un ticket feature
2. Lire les spécifications
3. Concevoir la solution
4. Implémenter
5. Tester exhaustivement
6. Documenter
7. Demander code review
```

### Ressources d'Apprentissage

#### Documentation Interne

- `SPORTS_DATABASES_DOCUMENTATION.md` - Système de bases de données sports
- `GUIDE_GENERATION_PROGRAMMES.md` - Guide génération programmes
- `js/README.md` - Architecture JavaScript
- `js/modules/[module]/README.md` - Docs spécifiques modules

#### Documentation Externe

- [Supabase Docs](https://supabase.com/docs)
- [jsPDF Docs](https://github.com/parallax/jsPDF)
- [Chart.js Docs](https://www.chartjs.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Claude API Docs](https://docs.anthropic.com/)

---

## 🚨 SÉCURITÉ

### Checklist Sécurité CRITIQUE

#### 1. Authentification

```javascript
✅ Mots de passe
    □ Mots de passe par défaut changés en production?
    □ Mots de passe stockés hashés (côté serveur)?
    □ Pas de mots de passe en clair dans le code?

✅ Sessions
    □ sessionStorage utilisé (pas localStorage pour auth)?
    □ Session expiration implémentée?
    □ Logout nettoie toutes les données session?
```

#### 2. Validation des Données

```javascript
// TOUJOURS valider côté client ET serveur

// Validation côté client
function validateInput(input) {
  // Vérifier type
  if (typeof input !== 'string') return false;

  // Vérifier longueur
  if (input.length > 1000) return false;

  // Sanitizer (retirer HTML)
  input = input.replace(/<[^>]*>/g, '');

  // Échapper caractères spéciaux
  input = escapeHtml(input);

  return input;
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
```

#### 3. Prévention XSS

```javascript
// ❌ DANGER: Injection HTML directe
element.innerHTML = userInput; // Peut injecter du JavaScript !

// ✅ SÉCURISÉ: Utiliser textContent
element.textContent = userInput;

// OU sanitizer avec DOMPurify
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);
```

#### 4. Prévention Injection SQL

```javascript
// ❌ DANGER: Requête SQL avec concaténation
const query = `SELECT * FROM members WHERE name = '${userName}'`;

// ✅ SÉCURISÉ: Utiliser parameterized queries (via Supabase)
const { data } = await supabase.from('members').select('*').eq('name', userName); // Échappement automatique
```

#### 5. Protection des Clés API

```javascript
// ❌ DANGER: Clé en dur
const CLAUDE_API_KEY = 'sk-ant-api03-xxx';

// ✅ SÉCURISÉ: Proxy server
// Client envoie requête au proxy, proxy utilise la clé
fetch('http://localhost:3001/api/chat', {
  method: 'POST',
  body: JSON.stringify({ message: 'Hello' })
});

// Proxy server (server.js) possède la clé
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
```

#### 6. HTTPS Obligatoire en Production

```javascript
// Rediriger HTTP vers HTTPS
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  location.replace(`https:${location.href.substring(location.protocol.length)}`);
}
```

#### 7. Content Security Policy

```html
<!-- À ajouter dans index.html -->
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self';
               script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
               style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
               img-src 'self' data: https:;
               connect-src 'self' https://*.supabase.co https://*.ngrok-free.dev;"
/>
```

---

## 📞 SUPPORT ET AIDE

### Canaux de Communication

#### Pour Questions Techniques

- Discord: Canal #dev-questions
- GitHub Issues: Pour bugs et features requests
- Code Reviews: Via Pull Requests

#### Pour Questions Produit

- Discord: Canal #product
- Meetings hebdo: Lundi 10h

### Contact Urgence

- Admin Système: [Contact Admin]
- Lead Dev: [Contact Lead]

---

## 📝 CONCLUSION

Ce document `claude.md` est LA référence complète pour le développement de Skali Prog.

### Règles d'Or à TOUJOURS Respecter

1. **MODULARITÉ**: Un fichier = Une responsabilité
2. **PAS DE DOUBLONS**: Supprimer, ne pas dupliquer
3. **PERMISSIONS**: Vérifier à chaque opération sensible
4. **PERFORMANCE**: Lazy loading, optimisation DOM
5. **SÉCURITÉ**: Valider inputs, échapper outputs
6. **UX**: Toujours donner feedback (loading, success, error)
7. **MOBILE FIRST**: Tester sur mobile systématiquement
8. **DOCUMENTATION**: Documenter au fur et à mesure
9. **TESTS**: Tester manuellement exhaustivement
10. **GORILLA GLASS**: Respecter le design system

### Mise à Jour de ce Document

Ce document doit être mis à jour:

- Lors de l'ajout d'un nouveau module majeur
- Lors d'un changement d'architecture
- Lors de l'ajout d'une intégration externe
- Lors de la découverte d'un pattern à éviter

**Dernière mise à jour**: 2025-01-15 **Version**: 2.4.0 **Auteur**: Équipe Skali Prog

---

_"Un code propre est un code qui se lit comme une prose bien écrite."_ - Robert C. Martin
