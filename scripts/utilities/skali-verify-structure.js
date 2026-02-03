#!/usr/bin/env node

/**
 * Script: Verify Project Structure
 * Description: Vérifie que la structure du projet respecte les standards claude.md
 * Usage: node scripts/utilities/skali-verify-structure.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la structure du projet Skali Prog...\n');

let errors = 0;
let warnings = 0;

// 1. Vérifier fichiers à la racine
console.log('📁 Vérification racine du projet...');
const rootFiles = fs.readdirSync('.');
const allowedAtRoot = [
    'claude.md', 'index.html', 'manifest.json', 'member-portal.html',
    'nutrition-pro.html', 'sw.js', '.env', '.env.template',
    '.gitignore', '.claudeignore', 'START-SERVER.bat',
    'package.json', 'package-lock.json'
];

const mdFiles = rootFiles.filter(f => f.endsWith('.md') && f !== 'claude.md');
const sqlFiles = rootFiles.filter(f => f.endsWith('.sql'));
const txtFiles = rootFiles.filter(f => f.endsWith('.txt'));

if (mdFiles.length > 0) {
    console.log('❌ Fichiers .md mal placés:', mdFiles.join(', '));
    errors++;
} else {
    console.log('✅ Pas de fichiers .md mal placés');
}

if (sqlFiles.length > 0) {
    console.log('❌ Fichiers .sql à la racine:', sqlFiles.join(', '));
    errors++;
} else {
    console.log('✅ Pas de fichiers .sql à la racine');
}

if (txtFiles.length > 0) {
    console.log('❌ Fichiers .txt à la racine:', txtFiles.join(', '));
    errors++;
} else {
    console.log('✅ Pas de fichiers .txt à la racine');
}

// 2. Vérifier structure docs/
console.log('\n📚 Vérification dossier docs/...');
if (fs.existsSync('docs')) {
    const requiredDirs = ['assets', 'guides', 'project'];
    requiredDirs.forEach(dir => {
        if (fs.existsSync(path.join('docs', dir))) {
            console.log(`✅ docs/${dir}/ existe`);
        } else {
            console.log(`⚠️  docs/${dir}/ manquant`);
            warnings++;
        }
    });
} else {
    console.log('❌ Dossier docs/ manquant');
    errors++;
}

// 3. Vérifier fichiers backup
console.log('\n🗑️  Vérification fichiers backup...');
const backupFiles = [];

function findBackups(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !fullPath.includes('node_modules') && !fullPath.includes('.git') && !fullPath.includes('archive')) {
            findBackups(fullPath);
        } else if (file.match(/\.(backup|bak)$/) || file.match(/-(old|copy)\./)) {
            backupFiles.push(fullPath);
        }
    });
}

findBackups('js');
findBackups('css');

if (backupFiles.length > 0) {
    console.log('❌ Fichiers backup trouvés:', backupFiles.length);
    backupFiles.slice(0, 5).forEach(f => console.log(`   - ${f}`));
    errors++;
} else {
    console.log('✅ Pas de fichiers backup hors archive/');
}

// 4. Vérifier fichiers critiques
console.log('\n🔑 Vérification fichiers critiques...');
const criticalFiles = [
    'js/core/config.js',
    'js/integrations/supabasemanager.js',
    'js/modules/pokemon/performance-stats-v2.js',
    'js/modules/reports/alluresmanager-v2.js'
];

criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} manquant`);
        errors++;
    }
});

// Résumé
console.log('\n' + '='.repeat(50));
console.log('📊 RÉSUMÉ');
console.log('='.repeat(50));
console.log(`Erreurs: ${errors}`);
console.log(`Avertissements: ${warnings}`);

if (errors === 0 && warnings === 0) {
    console.log('\n🎉 Structure du projet: PARFAITE ✅');
    process.exit(0);
} else if (errors === 0) {
    console.log('\n✅ Structure du projet: BONNE (avec avertissements)');
    process.exit(0);
} else {
    console.log('\n❌ Structure du projet: NÉCESSITE CORRECTIONS');
    process.exit(1);
}
