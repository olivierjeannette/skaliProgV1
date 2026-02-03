#!/usr/bin/env node

/**
 * SKALI QUALITY MASTER
 *
 * Script maître pour gérer tous les outils de qualité
 *
 * Features:
 * - Setup complet automatique (ESLint, Prettier, Jest)
 * - Audit complet automatique
 * - Check qualité complet (lint + format + test)
 * - Dashboard interactif
 *
 * Usage:
 *   node scripts/utilities/skali-quality-master.js [command]
 *
 * Commands:
 *   setup          Configure tous les outils (première utilisation)
 *   audit          Exécute l'audit complet
 *   check          Lint + Format + Test
 *   fix            Corrige automatiquement tout
 *   report         Génère tous les rapports
 *   dashboard      Lance le dashboard interactif
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const PROJECT_ROOT = path.resolve(__dirname, '../..');

// ==================== COLORS ====================

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n' + '='.repeat(60));
    log(title, 'bright');
    console.log('='.repeat(60) + '\n');
}

// ==================== UTILITIES ====================

function exec(command, options = {}) {
    const defaultOptions = {
        cwd: PROJECT_ROOT,
        stdio: 'inherit',
        ...options
    };

    try {
        execSync(command, defaultOptions);
        return true;
    } catch (error) {
        return false;
    }
}

function fileExists(filePath) {
    return fs.existsSync(path.join(PROJECT_ROOT, filePath));
}

function askQuestion(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question(question, answer => {
            rl.close();
            resolve(answer.trim().toLowerCase());
        });
    });
}

// ==================== COMMANDS ====================

class QualityMaster {
    constructor() {
        this.isSetup = this.checkSetup();
    }

    checkSetup() {
        const requiredFiles = ['.eslintrc.json', '.prettierrc.json', 'jest.config.js'];

        return requiredFiles.every(file => fileExists(file));
    }

    async setup() {
        logSection('🔧 SETUP - Configuration des Outils de Qualité');

        if (this.isSetup) {
            log('⚠️  Les outils semblent déjà configurés.', 'yellow');
            const answer = await askQuestion('Reconfigurer? (y/n): ');

            if (answer !== 'y' && answer !== 'yes') {
                log('❌ Setup annulé.', 'red');
                return;
            }
        }

        // 1. ESLint
        log('\n📦 1/3: Configuration ESLint...', 'cyan');
        const eslintSuccess = exec('node scripts/utilities/setup-eslint.js');

        if (!eslintSuccess) {
            log('❌ Erreur ESLint setup', 'red');
            return;
        }

        // 2. Prettier
        log('\n✨ 2/3: Configuration Prettier...', 'cyan');
        const prettierSuccess = exec('node scripts/utilities/setup-prettier.js');

        if (!prettierSuccess) {
            log('❌ Erreur Prettier setup', 'red');
            return;
        }

        // 3. Jest
        log('\n🧪 3/3: Configuration Jest...', 'cyan');
        const jestSuccess = exec('node scripts/utilities/setup-jest.js');

        if (!jestSuccess) {
            log('❌ Erreur Jest setup', 'red');
            return;
        }

        logSection('✅ SETUP TERMINÉ AVEC SUCCÈS');

        log('\n🎯 Prochaines étapes recommandées:', 'green');
        log('   1. npm run format          (Formater tout le code)', 'cyan');
        log('   2. npm run lint:fix        (Corriger les erreurs)', 'cyan');
        log('   3. npm test                (Lancer les tests)', 'cyan');
        log('   4. node scripts/utilities/skali-quality-master.js audit', 'cyan');

        this.isSetup = true;
    }

    async audit() {
        if (!this.isSetup) {
            log('⚠️  Outils non configurés. Exécuter: setup', 'yellow');
            return;
        }

        logSection('🔍 AUDIT - Analyse Complète du Code');

        log('🤖 Lancement du Skali Audit Bot...', 'cyan');
        log('   (Cela peut prendre quelques minutes)\n', 'yellow');

        const success = exec('node scripts/utilities/skali-audit-bot.js --report');

        if (success) {
            logSection('✅ AUDIT TERMINÉ');

            log('\n📊 Rapports générés:', 'green');
            log('   • temp/audit-report.json', 'cyan');
            log('   • temp/audit-report.html', 'cyan');

            log('\n💡 Pour voir le rapport visuel:', 'magenta');
            log('   Ouvrir: temp/audit-report.html dans votre navigateur', 'cyan');

            log('\n🔧 Pour corriger automatiquement:', 'magenta');
            log('   node scripts/utilities/skali-quality-master.js fix', 'cyan');
        } else {
            log("❌ Erreur durant l'audit", 'red');
        }
    }

    async check() {
        if (!this.isSetup) {
            log('⚠️  Outils non configurés. Exécuter: setup', 'yellow');
            return;
        }

        logSection('✅ CHECK - Vérification Qualité Complète');

        let allSuccess = true;

        // 1. Format check
        log('\n✨ 1/3: Vérification formatage (Prettier)...', 'cyan');
        const formatSuccess = exec('npm run format:check', { stdio: 'pipe' });

        if (formatSuccess) {
            log('   ✅ Formatage OK', 'green');
        } else {
            log('   ⚠️  Formatage non conforme', 'yellow');
            log('   💡 Corriger avec: npm run format', 'magenta');
            allSuccess = false;
        }

        // 2. Lint check
        log('\n🔍 2/3: Vérification code (ESLint)...', 'cyan');
        const lintSuccess = exec('npm run lint', { stdio: 'pipe' });

        if (lintSuccess) {
            log('   ✅ Lint OK', 'green');
        } else {
            log('   ⚠️  Erreurs ESLint détectées', 'yellow');
            log('   💡 Corriger avec: npm run lint:fix', 'magenta');
            allSuccess = false;
        }

        // 3. Tests
        log('\n🧪 3/3: Exécution des tests (Jest)...', 'cyan');
        const testSuccess = exec('npm test', { stdio: 'pipe' });

        if (testSuccess) {
            log('   ✅ Tests OK', 'green');
        } else {
            log('   ❌ Tests échoués', 'red');
            log('   💡 Vérifier avec: npm run test:verbose', 'magenta');
            allSuccess = false;
        }

        // Summary
        logSection(allSuccess ? '✅ CHECK RÉUSSI' : '⚠️  CHECK INCOMPLET');

        if (!allSuccess) {
            log('\n🔧 Correction automatique disponible:', 'magenta');
            log('   node scripts/utilities/skali-quality-master.js fix', 'cyan');
        }
    }

    async fix() {
        if (!this.isSetup) {
            log('⚠️  Outils non configurés. Exécuter: setup', 'yellow');
            return;
        }

        logSection('🔧 FIX - Correction Automatique');

        log('⚠️  ATTENTION: Ce script va modifier votre code!', 'yellow');
        log("   Assurez-vous d'avoir commité vos changements.\n", 'yellow');

        const answer = await askQuestion('Continuer? (y/n): ');

        if (answer !== 'y' && answer !== 'yes') {
            log('❌ Fix annulé.', 'red');
            return;
        }

        // 1. Format
        log('\n✨ 1/4: Formatage du code (Prettier)...', 'cyan');
        exec('npm run format');
        log('   ✅ Code formaté', 'green');

        // 2. Lint fix
        log('\n🔍 2/4: Correction ESLint automatique...', 'cyan');
        exec('npm run lint:fix');
        log('   ✅ ESLint fix appliqué', 'green');

        // 3. Audit fix
        log("\n🤖 3/4: Correction des problèmes détectés par l'audit...", 'cyan');
        exec('node scripts/utilities/skali-audit-bot.js --fix --live');
        log('   ✅ Problèmes corrigés', 'green');

        // 4. Re-check
        log('\n✅ 4/4: Vérification finale...', 'cyan');
        const checkSuccess = exec('npm run lint', { stdio: 'pipe' });

        if (checkSuccess) {
            log('   ✅ Vérification réussie', 'green');
        } else {
            log('   ⚠️  Quelques erreurs restantes (correction manuelle requise)', 'yellow');
        }

        logSection('✅ FIX TERMINÉ');

        log('\n💡 Prochaines étapes:', 'magenta');
        log('   1. git diff              (Vérifier les changements)', 'cyan');
        log('   2. npm test              (Vérifier les tests)', 'cyan');
        log('   3. git add . && git commit', 'cyan');
    }

    async report() {
        if (!this.isSetup) {
            log('⚠️  Outils non configurés. Exécuter: setup', 'yellow');
            return;
        }

        logSection('📊 REPORT - Génération de Tous les Rapports');

        // 1. Audit report
        log("\n🤖 1/4: Rapport d'audit...", 'cyan');
        exec('node scripts/utilities/skali-audit-bot.js --report');

        // 2. ESLint report
        log('\n🔍 2/4: Rapport ESLint...', 'cyan');
        exec('npm run lint:report');

        // 3. Test coverage
        log('\n🧪 3/4: Coverage des tests...', 'cyan');
        exec('npm run test:coverage');

        // 4. Create summary
        log('\n📝 4/4: Création du résumé...', 'cyan');
        this.createSummaryReport();

        logSection('✅ RAPPORTS GÉNÉRÉS');

        log('\n📊 Rapports disponibles:', 'green');
        log('   • temp/audit-report.html      (Audit complet)', 'cyan');
        log('   • temp/eslint-report.html     (Erreurs ESLint)', 'cyan');
        log('   • temp/coverage/index.html    (Coverage tests)', 'cyan');
        log('   • temp/quality-summary.html   (Résumé)', 'cyan');

        log('\n💡 Ouvrir le résumé:', 'magenta');
        log('   Ouvrir: temp/quality-summary.html dans votre navigateur', 'cyan');
    }

    createSummaryReport() {
        const tempDir = path.join(PROJECT_ROOT, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Skali Prog - Quality Summary</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', -apple-system, sans-serif;
            background: linear-gradient(135deg, #0a0f0a 0%, #0f1810 50%, #0a0f0a 100%);
            color: #ffffff;
            padding: 40px 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #3e8e41, #2563eb);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 40px;
        }
        .card {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 24px;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
        }
        .card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 32px rgba(62,142,65,0.2);
        }
        .card h2 {
            font-size: 1.5rem;
            margin-bottom: 16px;
            color: #3e8e41;
        }
        .card p { color: #aaa; margin-bottom: 16px; line-height: 1.6; }
        .card a {
            display: inline-block;
            background: rgba(62,142,65,0.2);
            border: 1px solid rgba(62,142,65,0.5);
            color: #3e8e41;
            padding: 8px 16px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        .card a:hover {
            background: rgba(62,142,65,0.3);
            transform: scale(1.05);
        }
        .commands {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 30px;
            margin-top: 40px;
        }
        .commands h2 { margin-bottom: 20px; }
        .command {
            background: rgba(0,0,0,0.3);
            padding: 12px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 0.9rem;
            margin-bottom: 12px;
            border-left: 3px solid #3e8e41;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 Skali Prog - Quality Dashboard</h1>
        <p style="color: #666; margin-bottom: 20px;">
            Généré le ${new Date().toLocaleString('fr-FR')}
        </p>

        <div class="grid">
            <div class="card">
                <h2>🔍 Audit Complet</h2>
                <p>
                    Analyse complète du code: doublons, imports cassés, dead code,
                    fichiers mal placés, problèmes de qualité.
                </p>
                <a href="audit-report.html">Voir le Rapport →</a>
            </div>

            <div class="card">
                <h2>🔧 Rapport ESLint</h2>
                <p>
                    Détection automatique d'erreurs JavaScript: syntaxe, imports,
                    sécurité, style de code.
                </p>
                <a href="eslint-report.html">Voir le Rapport →</a>
            </div>

            <div class="card">
                <h2>🧪 Coverage Tests</h2>
                <p>
                    Couverture des tests: pourcentage de code testé, branches,
                    fonctions, lignes couvertes.
                </p>
                <a href="coverage/index.html">Voir le Coverage →</a>
            </div>
        </div>

        <div class="commands">
            <h2>💻 Commandes Utiles</h2>

            <h3 style="margin: 20px 0 12px 0; color: #3e8e41;">Setup (Première Utilisation)</h3>
            <div class="command">node scripts/utilities/skali-quality-master.js setup</div>

            <h3 style="margin: 20px 0 12px 0; color: #3e8e41;">Audit & Analyse</h3>
            <div class="command">node scripts/utilities/skali-quality-master.js audit</div>

            <h3 style="margin: 20px 0 12px 0; color: #3e8e41;">Vérification Qualité</h3>
            <div class="command">node scripts/utilities/skali-quality-master.js check</div>

            <h3 style="margin: 20px 0 12px 0; color: #3e8e41;">Correction Automatique</h3>
            <div class="command">node scripts/utilities/skali-quality-master.js fix</div>

            <h3 style="margin: 20px 0 12px 0; color: #3e8e41;">Génération Rapports</h3>
            <div class="command">node scripts/utilities/skali-quality-master.js report</div>

            <h3 style="margin: 20px 0 12px 0; color: #3e8e41;">Workflow Complet</h3>
            <div class="command">npm run format && npm run lint:fix && npm test</div>
        </div>

        <div class="commands" style="background: rgba(62,142,65,0.1); border-color: rgba(62,142,65,0.3);">
            <h2>🎯 Prochaines Étapes Recommandées</h2>
            <ul style="list-style: none; padding: 0; margin-top: 16px;">
                <li style="padding: 8px 0; color: #aaa;">
                    1. Consulter le rapport d'audit et corriger les issues critiques
                </li>
                <li style="padding: 8px 0; color: #aaa;">
                    2. Améliorer le coverage des tests (objectif: > 50%)
                </li>
                <li style="padding: 8px 0; color: #aaa;">
                    3. Éliminer les fichiers dupliqués et backups
                </li>
                <li style="padding: 8px 0; color: #aaa;">
                    4. Corriger les imports cassés
                </li>
                <li style="padding: 8px 0; color: #aaa;">
                    5. Configurer pre-commit hooks pour automatiser les checks
                </li>
            </ul>
        </div>
    </div>
</body>
</html>`;

        fs.writeFileSync(path.join(tempDir, 'quality-summary.html'), html);
        log('   ✅ Résumé créé: temp/quality-summary.html', 'green');
    }

    async dashboard() {
        logSection('📊 DASHBOARD - Menu Interactif');

        log('Que voulez-vous faire?\n', 'cyan');
        log('1. Setup - Configurer tous les outils', 'yellow');
        log('2. Audit - Analyser le code', 'yellow');
        log('3. Check - Vérifier la qualité', 'yellow');
        log('4. Fix - Corriger automatiquement', 'yellow');
        log('5. Report - Générer tous les rapports', 'yellow');
        log('6. Quitter\n', 'yellow');

        const choice = await askQuestion('Votre choix (1-6): ');

        switch (choice) {
            case '1':
                await this.setup();
                break;
            case '2':
                await this.audit();
                break;
            case '3':
                await this.check();
                break;
            case '4':
                await this.fix();
                break;
            case '5':
                await this.report();
                break;
            case '6':
                log('\n👋 Au revoir!', 'green');
                return;
            default:
                log('\n❌ Choix invalide', 'red');
                await this.dashboard();
        }

        // Redemander après chaque action
        const continueAnswer = await askQuestion('\nAutre action? (y/n): ');
        if (continueAnswer === 'y' || continueAnswer === 'yes') {
            await this.dashboard();
        } else {
            log('\n👋 Au revoir!', 'green');
        }
    }

    printHelp() {
        logSection('🤖 SKALI QUALITY MASTER - Aide');

        log('Usage:', 'cyan');
        log('   node scripts/utilities/skali-quality-master.js [command]\n', 'white');

        log('Commands:', 'cyan');
        log('   setup          Configure tous les outils (première fois)', 'white');
        log("   audit          Exécute l'audit complet du code", 'white');
        log('   check          Vérifie la qualité (lint + format + test)', 'white');
        log('   fix            Corrige automatiquement les problèmes', 'white');
        log('   report         Génère tous les rapports HTML', 'white');
        log('   dashboard      Lance le menu interactif', 'white');
        log('   help           Affiche cette aide\n', 'white');

        log('Exemples:', 'cyan');
        log('   node scripts/utilities/skali-quality-master.js setup', 'yellow');
        log('   node scripts/utilities/skali-quality-master.js audit', 'yellow');
        log('   node scripts/utilities/skali-quality-master.js fix\n', 'yellow');

        log('Documentation:', 'cyan');
        log('   scripts/utilities/README-QUALITY-TOOLS.md\n', 'yellow');
    }
}

// ==================== MAIN ====================

async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'dashboard';

    const master = new QualityMaster();

    switch (command) {
        case 'setup':
            await master.setup();
            break;
        case 'audit':
            await master.audit();
            break;
        case 'check':
            await master.check();
            break;
        case 'fix':
            await master.fix();
            break;
        case 'report':
            await master.report();
            break;
        case 'dashboard':
            await master.dashboard();
            break;
        case 'help':
        case '--help':
        case '-h':
            master.printHelp();
            break;
        default:
            log(`❌ Commande inconnue: ${command}\n`, 'red');
            master.printHelp();
            process.exit(1);
    }
}

// Error handling
process.on('unhandledRejection', error => {
    log('\n❌ Erreur non gérée:', 'red');
    console.error(error);
    process.exit(1);
});

// Run
if (require.main === module) {
    main();
}

module.exports = { QualityMaster };
