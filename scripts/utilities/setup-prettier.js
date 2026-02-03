#!/usr/bin/env node

/**
 * PRETTIER SETUP
 *
 * Configure automatiquement Prettier pour le projet Skali Prog
 *
 * Usage: node scripts/utilities/setup-prettier.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '../..');

console.log('\n✨ Configuration Prettier pour Skali Prog\n');

// ==================== INSTALL PACKAGES ====================

console.log('📦 Installation des packages npm...');

const packages = ['prettier', 'eslint-config-prettier', 'eslint-plugin-prettier'];

try {
    execSync(`npm install --save-dev ${packages.join(' ')}`, {
        cwd: PROJECT_ROOT,
        stdio: 'inherit'
    });
    console.log('✅ Packages installés\n');
} catch (error) {
    console.error('❌ Erreur installation packages');
    process.exit(1);
}

// ==================== CREATE .prettierrc.json ====================

console.log('📝 Création .prettierrc.json...');

const prettierConfig = {
    // Basic formatting
    printWidth: 100,
    tabWidth: 4,
    useTabs: false,
    semi: true,
    singleQuote: true,
    quoteProps: 'as-needed',
    trailingComma: 'none',
    bracketSpacing: true,
    bracketSameLine: false,
    arrowParens: 'avoid',
    endOfLine: 'lf',

    // HTML
    htmlWhitespaceSensitivity: 'css',

    // Override pour certains fichiers
    overrides: [
        {
            files: '*.json',
            options: {
                tabWidth: 2
            }
        },
        {
            files: '*.md',
            options: {
                proseWrap: 'always',
                tabWidth: 2
            }
        },
        {
            files: '*.css',
            options: {
                tabWidth: 2
            }
        }
    ]
};

fs.writeFileSync(
    path.join(PROJECT_ROOT, '.prettierrc.json'),
    JSON.stringify(prettierConfig, null, 2)
);

console.log('✅ .prettierrc.json créé\n');

// ==================== CREATE .prettierignore ====================

console.log('📝 Création .prettierignore...');

const prettierIgnore = `# Dependencies
node_modules/

# Build
dist/
build/
*.min.js
*.min.css

# Temp & Archives
temp/
archive/
_archive/
**/*-backup.*
**/*-old.*

# External libraries
js/lib/
vendor/

# Lock files
package-lock.json
yarn.lock

# Logs
*.log

# IDE
.vscode/
.idea/
`;

fs.writeFileSync(path.join(PROJECT_ROOT, '.prettierignore'), prettierIgnore);

console.log('✅ .prettierignore créé\n');

// ==================== UPDATE ESLINT CONFIG ====================

console.log('📝 Mise à jour .eslintrc.json...');

const eslintConfigPath = path.join(PROJECT_ROOT, '.eslintrc.json');

if (fs.existsSync(eslintConfigPath)) {
    const eslintConfig = JSON.parse(fs.readFileSync(eslintConfigPath, 'utf-8'));

    // Ajouter Prettier aux extends
    if (!eslintConfig.extends.includes('prettier')) {
        eslintConfig.extends.push('prettier');
    }

    // Ajouter plugin Prettier
    if (!eslintConfig.plugins) {
        eslintConfig.plugins = [];
    }
    if (!eslintConfig.plugins.includes('prettier')) {
        eslintConfig.plugins.push('prettier');
    }

    // Ajouter règle Prettier
    if (!eslintConfig.rules) {
        eslintConfig.rules = {};
    }
    eslintConfig.rules['prettier/prettier'] = 'warn';

    fs.writeFileSync(eslintConfigPath, JSON.stringify(eslintConfig, null, 2));

    console.log('✅ .eslintrc.json mis à jour\n');
} else {
    console.log("⚠️  .eslintrc.json non trouvé, exécuter setup-eslint.js d'abord\n");
}

// ==================== ADD NPM SCRIPTS ====================

console.log('📝 Ajout scripts NPM...');

const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
let packageJson;

if (fs.existsSync(packageJsonPath)) {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
} else {
    packageJson = {
        name: 'skaliprog',
        version: '2.4.0',
        description: 'Skali Prog - Performance Training System',
        private: true,
        scripts: {}
    };
}

packageJson.scripts = {
    ...packageJson.scripts,
    format: 'prettier --write "**/*.{js,css,json,md,html}"',
    'format:check': 'prettier --check "**/*.{js,css,json,md,html}"',
    'format:js': 'prettier --write "js/**/*.js"',
    'format:css': 'prettier --write "css/**/*.css"'
};

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('✅ Scripts NPM ajoutés\n');

// ==================== UPDATE VS CODE SETTINGS ====================

console.log('📝 Configuration VS Code...');

const vscodeDir = path.join(PROJECT_ROOT, '.vscode');
if (!fs.existsSync(vscodeDir)) {
    fs.mkdirSync(vscodeDir);
}

const settingsPath = path.join(vscodeDir, 'settings.json');
let settings = {};

if (fs.existsSync(settingsPath)) {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
}

settings = {
    ...settings,
    'editor.formatOnSave': true,
    'editor.defaultFormatter': 'esbenp.prettier-vscode',
    'prettier.requireConfig': true,
    '[javascript]': {
        'editor.defaultFormatter': 'esbenp.prettier-vscode'
    },
    '[json]': {
        'editor.defaultFormatter': 'esbenp.prettier-vscode'
    },
    '[css]': {
        'editor.defaultFormatter': 'esbenp.prettier-vscode'
    },
    '[html]': {
        'editor.defaultFormatter': 'esbenp.prettier-vscode'
    }
};

fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4));

console.log('✅ VS Code configuré\n');

// ==================== FORMAT SAMPLE FILES ====================

console.log('🎨 Formatage des fichiers exemples...\n');

try {
    // Formater seulement quelques fichiers pour démonstration
    execSync('prettier --write "claude.md" ".eslintrc.json" ".prettierrc.json"', {
        cwd: PROJECT_ROOT,
        stdio: 'inherit'
    });
    console.log('\n✅ Fichiers de config formatés!\n');
} catch (error) {
    console.log('\n⚠️  Erreurs de formatage (vérifier la config)\n');
}

// ==================== CREATE FORMATTING GUIDE ====================

console.log('📝 Création guide de formatage...');

const formattingGuide = `# Guide de Formatage Skali Prog

## Prettier Configuration

Prettier est configuré pour formatter automatiquement le code selon les règles suivantes:

### JavaScript
- **Indentation**: 4 espaces
- **Quotes**: Single quotes ('...')
- **Semicolons**: Oui (toujours)
- **Line width**: 100 caractères
- **Trailing commas**: Aucun
- **Arrow functions**: Parenthèses uniquement si nécessaire

### JSON
- **Indentation**: 2 espaces

### CSS
- **Indentation**: 2 espaces

### Markdown
- **Indentation**: 2 espaces
- **Prose wrap**: Toujours

## Commandes

\`\`\`bash
# Formater tout le projet
npm run format

# Vérifier le formatage (sans modifier)
npm run format:check

# Formater uniquement JS
npm run format:js

# Formater uniquement CSS
npm run format:css
\`\`\`

## VS Code

Prettier est configuré pour formatter automatiquement à la sauvegarde.

Pour formater manuellement:
- **Windows/Linux**: Shift + Alt + F
- **Mac**: Shift + Option + F

## Exemples

### Avant Prettier

\`\`\`javascript
function test(a,b,c){
if(a>b){return c}
else{return a+b}}
\`\`\`

### Après Prettier

\`\`\`javascript
function test(a, b, c) {
    if (a > b) {
        return c;
    } else {
        return a + b;
    }
}
\`\`\`

## Bonnes Pratiques

1. **Toujours** formater avant de commit
2. **Ne jamais** désactiver Prettier dans le code
3. **Utiliser** les scripts NPM pour formatter
4. **Configurer** votre IDE pour format on save
5. **Vérifier** le formatage en CI/CD

## Ignorer des fichiers

Ajouter dans \`.prettierignore\`:

\`\`\`
# Ignorer un fichier spécifique
specific-file.js

# Ignorer un dossier
temp/

# Ignorer pattern
**/*.min.js
\`\`\`

## Ignorer des blocs de code

\`\`\`javascript
// prettier-ignore
const matrix = [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
];
\`\`\`

---

Dernière mise à jour: ${new Date().toISOString()}
`;

const docsDir = path.join(PROJECT_ROOT, 'docs', 'guides');
if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
}

fs.writeFileSync(path.join(docsDir, 'FORMATTING-GUIDE.md'), formattingGuide);

console.log('✅ Guide créé: docs/guides/FORMATTING-GUIDE.md\n');

// ==================== SUMMARY ====================

console.log('='.repeat(60));
console.log('✅ PRETTIER CONFIGURÉ AVEC SUCCÈS');
console.log('='.repeat(60));
console.log('\n📋 Commandes disponibles:');
console.log('   npm run format         - Formater tout le code');
console.log('   npm run format:check   - Vérifier le formatage');
console.log('   npm run format:js      - Formater JS uniquement');
console.log('   npm run format:css     - Formater CSS uniquement');
console.log('\n💡 Recommandations:');
console.log('   1. Installer extension VS Code: Prettier - Code formatter');
console.log('   2. Activer "Format on Save" (déjà configuré)');
console.log('   3. Exécuter: npm run format (formater tout le projet)');
console.log('\n🎯 Prochaines étapes:');
console.log('   1. Exécuter: npm run format');
console.log('   2. Review les changements avec git diff');
console.log('   3. Configurer Jest: node scripts/utilities/setup-jest.js');
console.log("   4. Exécuter l'audit: node scripts/utilities/skali-audit-bot.js --report\n");
