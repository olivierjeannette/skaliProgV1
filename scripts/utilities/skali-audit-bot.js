#!/usr/bin/env node

/**
 * SKALI AUDIT BOT
 *
 * Bot automatisé pour auditer, nettoyer et améliorer la qualité du code
 *
 * Features:
 * - Détection fichiers doublons
 * - Détection code mort (unused)
 * - Détection imports/appels cassés
 * - Analyse complexité code
 * - Détection fichiers mal placés
 * - Recommandations amélioration
 *
 * Usage: node scripts/utilities/skali-audit-bot.js [--fix] [--report]
 *
 * Options:
 *   --fix          Applique les corrections automatiques (mode safe)
 *   --report       Génère un rapport HTML détaillé
 *   --aggressive   Mode agressif (supprime les fichiers inutiles)
 *   --dry-run      Simule sans modifier (défaut)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ==================== CONFIGURATION ====================

const CONFIG = {
    projectRoot: path.resolve(__dirname, '../..'),

    // Dossiers à analyser
    scanDirs: ['js', 'css', 'scripts', 'data'],

    // Patterns à ignorer
    ignore: ['node_modules', '.git', 'temp', 'archive', '_archive', '.vscode', '.claude'],

    // Patterns de fichiers backup/doublons
    backupPatterns: [
        /.*-backup\.(js|css|json)$/,
        /.*-old\.(js|css|json)$/,
        /.*-copy\.(js|css|json)$/,
        /.*-v\d+\.(js|css|json)$/,
        /.*\.bak$/,
        /.*~$/
    ],

    // Extensions à analyser
    extensions: {
        code: ['.js', '.css', '.html'],
        data: ['.json'],
        docs: ['.md', '.txt']
    },

    // Seuils d'alerte
    thresholds: {
        fileSizeWarning: 100 * 1024, // 100 KB
        fileSizeCritical: 500 * 1024, // 500 KB
        duplicateSimilarity: 0.95, // 95% similaire = doublon
        complexityWarning: 20, // Cyclomatic complexity
        unusedDaysThreshold: 90 // 90 jours sans modification
    }
};

// ==================== CLASSES PRINCIPALES ====================

class AuditReport {
    constructor() {
        this.timestamp = new Date().toISOString();
        this.issues = {
            critical: [],
            warning: [],
            info: []
        };
        this.stats = {
            totalFiles: 0,
            totalSize: 0,
            codeFiles: 0,
            duplicates: 0,
            backups: 0,
            deadCode: 0,
            brokenImports: 0,
            misplacedFiles: 0
        };
        this.recommendations = [];
    }

    addIssue(severity, category, message, file, details = {}) {
        const issue = {
            severity,
            category,
            message,
            file: path.relative(CONFIG.projectRoot, file),
            details,
            timestamp: new Date().toISOString()
        };

        this.issues[severity].push(issue);
    }

    addRecommendation(title, description, impact, action) {
        this.recommendations.push({
            title,
            description,
            impact, // 'high', 'medium', 'low'
            action,
            priority: impact === 'high' ? 1 : impact === 'medium' ? 2 : 3
        });
    }

    getSummary() {
        const total =
            this.issues.critical.length + this.issues.warning.length + this.issues.info.length;

        return {
            total,
            critical: this.issues.critical.length,
            warning: this.issues.warning.length,
            info: this.issues.info.length,
            stats: this.stats,
            recommendations: this.recommendations.length
        };
    }
}

class FileAnalyzer {
    constructor(filePath) {
        this.path = filePath;
        this.ext = path.extname(filePath);
        this.name = path.basename(filePath);
        this.stats = fs.statSync(filePath);
        this.size = this.stats.size;
        this.content = null;
        this.hash = null;
    }

    loadContent() {
        if (!this.content) {
            this.content = fs.readFileSync(this.path, 'utf-8');
            this.hash = this.calculateHash();
        }
        return this.content;
    }

    calculateHash() {
        if (!this.content) {
            this.loadContent();
        }
        return crypto.createHash('md5').update(this.content).digest('hex');
    }

    // Analyse JS spécifique
    analyzeJavaScript() {
        if (this.ext !== '.js') {
            return null;
        }

        this.loadContent();

        const analysis = {
            lines: this.content.split('\n').length,
            functions: (this.content.match(/function\s+\w+/g) || []).length,
            classes: (this.content.match(/class\s+\w+/g) || []).length,
            imports: this.extractImports(),
            exports: this.extractExports(),
            consoleLog: (this.content.match(/console\.(log|warn|error)/g) || []).length,
            todos: (this.content.match(/\/\/\s*TODO:/gi) || []).length,
            complexity: this.calculateComplexity()
        };

        return analysis;
    }

    extractImports() {
        if (!this.content) {
            this.loadContent();
        }

        const imports = [];

        // import X from 'Y'
        const es6Imports = this.content.match(/import\s+.*?\s+from\s+['"](.+?)['"]/g);
        if (es6Imports) {
            es6Imports.forEach(imp => {
                const match = imp.match(/from\s+['"](.+?)['"]/);
                if (match) {
                    imports.push(match[1]);
                }
            });
        }

        // require('X')
        const requireImports = this.content.match(/require\(['"](.+?)['"]\)/g);
        if (requireImports) {
            requireImports.forEach(req => {
                const match = req.match(/require\(['"](.+?)['"]\)/);
                if (match) {
                    imports.push(match[1]);
                }
            });
        }

        return imports;
    }

    extractExports() {
        if (!this.content) {
            this.loadContent();
        }

        const exports = [];

        // export function/class/const
        const namedExports = this.content.match(/export\s+(function|class|const|let|var)\s+(\w+)/g);
        if (namedExports) {
            namedExports.forEach(exp => {
                const match = exp.match(/export\s+(?:function|class|const|let|var)\s+(\w+)/);
                if (match) {
                    exports.push(match[1]);
                }
            });
        }

        // export default
        if (this.content.includes('export default')) {
            exports.push('default');
        }

        // window.X = ou module.exports
        const globalExports = this.content.match(/(?:window|module\.exports)\.\w+\s*=/g);
        if (globalExports) {
            globalExports.forEach(exp => {
                const match = exp.match(/(?:window|module\.exports)\.(\w+)/);
                if (match) {
                    exports.push(match[1]);
                }
            });
        }

        return exports;
    }

    calculateComplexity() {
        if (!this.content) {
            this.loadContent();
        }

        // Cyclomatic complexity simplifiée
        let complexity = 1; // Base

        // +1 pour chaque structure de contrôle
        complexity += (this.content.match(/\bif\b/g) || []).length;
        complexity += (this.content.match(/\belse\b/g) || []).length;
        complexity += (this.content.match(/\bfor\b/g) || []).length;
        complexity += (this.content.match(/\bwhile\b/g) || []).length;
        complexity += (this.content.match(/\bcase\b/g) || []).length;
        complexity += (this.content.match(/\bcatch\b/g) || []).length;
        complexity += (this.content.match(/&&/g) || []).length;
        complexity += (this.content.match(/\|\|/g) || []).length;
        complexity += (this.content.match(/\?/g) || []).length;

        return complexity;
    }

    isBackupFile() {
        return CONFIG.backupPatterns.some(pattern => pattern.test(this.name));
    }

    isUnused() {
        const daysSinceModified = (Date.now() - this.stats.mtime) / (1000 * 60 * 60 * 24);
        return daysSinceModified > CONFIG.thresholds.unusedDaysThreshold;
    }
}

class DuplicateDetector {
    constructor() {
        this.files = new Map(); // hash -> [files]
        this.similarFiles = [];
    }

    addFile(fileAnalyzer) {
        const hash = fileAnalyzer.hash;

        if (!this.files.has(hash)) {
            this.files.set(hash, []);
        }

        this.files.get(hash).push(fileAnalyzer);
    }

    findDuplicates() {
        const duplicates = [];

        for (const [hash, files] of this.files.entries()) {
            if (files.length > 1) {
                duplicates.push({
                    hash,
                    count: files.length,
                    files: files.map(f => f.path),
                    size: files[0].size,
                    totalWaste: files[0].size * (files.length - 1)
                });
            }
        }

        return duplicates.sort((a, b) => b.totalWaste - a.totalWaste);
    }

    findSimilar() {
        // Détection de fichiers similaires (pas identiques mais presque)
        const allFiles = Array.from(this.files.values()).flat();
        const similar = [];

        for (let i = 0; i < allFiles.length; i++) {
            for (let j = i + 1; j < allFiles.length; j++) {
                const similarity = this.calculateSimilarity(
                    allFiles[i].content,
                    allFiles[j].content
                );

                if (similarity > CONFIG.thresholds.duplicateSimilarity) {
                    similar.push({
                        file1: allFiles[i].path,
                        file2: allFiles[j].path,
                        similarity: Math.round(similarity * 100)
                    });
                }
            }
        }

        return similar;
    }

    calculateSimilarity(str1, str2) {
        // Calcul de similarité simple (Jaccard)
        const set1 = new Set(str1.split(/\s+/));
        const set2 = new Set(str2.split(/\s+/));

        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);

        return intersection.size / union.size;
    }
}

class DependencyGraph {
    constructor() {
        this.graph = new Map(); // file -> [dependencies]
        this.reverse = new Map(); // file -> [dependents]
    }

    addDependency(from, to) {
        if (!this.graph.has(from)) {
            this.graph.set(from, new Set());
        }
        this.graph.get(from).add(to);

        // Reverse graph
        if (!this.reverse.has(to)) {
            this.reverse.set(to, new Set());
        }
        this.reverse.get(to).add(from);
    }

    getDependencies(file) {
        return Array.from(this.graph.get(file) || []);
    }

    getDependents(file) {
        return Array.from(this.reverse.get(file) || []);
    }

    findBrokenImports(projectFiles) {
        const broken = [];
        const projectFileSet = new Set(projectFiles.map(f => path.relative(CONFIG.projectRoot, f)));

        for (const [file, deps] of this.graph.entries()) {
            for (const dep of deps) {
                // Ignorer les imports externes (node_modules, CDN)
                if (dep.startsWith('http') || !dep.startsWith('.')) {
                    continue;
                }

                // Résoudre le chemin
                const fileDir = path.dirname(file);
                let resolvedDep = path.join(fileDir, dep);

                // Ajouter .js si manquant
                if (!path.extname(resolvedDep)) {
                    resolvedDep += '.js';
                }

                const relativeDep = path.relative(CONFIG.projectRoot, resolvedDep);

                if (!projectFileSet.has(relativeDep)) {
                    broken.push({
                        from: file,
                        to: dep,
                        resolved: relativeDep,
                        reason: 'File not found'
                    });
                }
            }
        }

        return broken;
    }

    findUnusedFiles(projectFiles) {
        const unused = [];
        const projectFileSet = new Set(projectFiles.map(f => path.relative(CONFIG.projectRoot, f)));

        for (const file of projectFileSet) {
            const dependents = this.getDependents(file);

            // Si pas de dépendants ET pas un point d'entrée
            if (dependents.length === 0 && !this.isEntryPoint(file)) {
                unused.push({
                    file,
                    reason: 'No imports found',
                    suggestion: 'Consider removing or archiving'
                });
            }
        }

        return unused;
    }

    isEntryPoint(file) {
        // Points d'entrée connus
        const entryPoints = [
            'index.html',
            'member-portal.html',
            'nutrition-pro.html',
            /js\/core\/.*\.js$/,
            /START-SERVER\.bat$/
        ];

        return entryPoints.some(pattern => {
            if (typeof pattern === 'string') {
                return file.includes(pattern);
            }
            return pattern.test(file);
        });
    }
}

// ==================== AUDIT PRINCIPAL ====================

class SkaliAuditBot {
    constructor(options = {}) {
        this.options = {
            fix: options.fix || false,
            report: options.report || false,
            aggressive: options.aggressive || false,
            dryRun: options.dryRun !== false
        };

        this.report = new AuditReport();
        this.allFiles = [];
        this.duplicateDetector = new DuplicateDetector();
        this.dependencyGraph = new DependencyGraph();
    }

    async run() {
        console.log('\n🤖 SKALI AUDIT BOT - Démarrage\n');
        console.log(`Mode: ${this.options.dryRun ? 'DRY RUN' : 'LIVE'}`);
        console.log(`Fix: ${this.options.fix}`);
        console.log(`Aggressive: ${this.options.aggressive}\n`);

        try {
            // Phase 1: Scan des fichiers
            console.log('📂 Phase 1: Scanning files...');
            await this.scanFiles();

            // Phase 2: Analyse des doublons
            console.log('🔍 Phase 2: Detecting duplicates...');
            await this.detectDuplicates();

            // Phase 3: Analyse des dépendances
            console.log('🔗 Phase 3: Analyzing dependencies...');
            await this.analyzeDependencies();

            // Phase 4: Analyse qualité code
            console.log('📊 Phase 4: Analyzing code quality...');
            await this.analyzeCodeQuality();

            // Phase 5: Détection fichiers mal placés
            console.log('📁 Phase 5: Detecting misplaced files...');
            await this.detectMisplacedFiles();

            // Phase 6: Génération recommandations
            console.log('💡 Phase 6: Generating recommendations...');
            await this.generateRecommendations();

            // Phase 7: Application corrections (si --fix)
            if (this.options.fix && !this.options.dryRun) {
                console.log('🔧 Phase 7: Applying fixes...');
                await this.applyFixes();
            }

            // Phase 8: Génération rapport
            console.log('📄 Phase 8: Generating report...');
            await this.generateReport();

            console.log('\n✅ Audit terminé avec succès!\n');
            this.printSummary();
        } catch (error) {
            console.error("❌ Erreur durant l'audit:", error);
            process.exit(1);
        }
    }

    async scanFiles() {
        const scan = dir => {
            if (!fs.existsSync(dir)) {
                return;
            }

            const entries = fs.readdirSync(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);

                // Ignorer les dossiers exclus
                if (CONFIG.ignore.includes(entry.name)) {
                    continue;
                }

                if (entry.isDirectory()) {
                    scan(fullPath);
                } else {
                    this.allFiles.push(fullPath);
                    this.report.stats.totalFiles++;

                    const stats = fs.statSync(fullPath);
                    this.report.stats.totalSize += stats.size;

                    if (['.js', '.css', '.html'].includes(path.extname(fullPath))) {
                        this.report.stats.codeFiles++;
                    }
                }
            }
        };

        for (const dir of CONFIG.scanDirs) {
            scan(path.join(CONFIG.projectRoot, dir));
        }

        console.log(`   ✓ ${this.report.stats.totalFiles} files found`);
        console.log(`   ✓ ${Math.round(this.report.stats.totalSize / 1024)} KB total`);
    }

    async detectDuplicates() {
        const codeFiles = this.allFiles.filter(f => ['.js', '.css'].includes(path.extname(f)));

        for (const file of codeFiles) {
            const analyzer = new FileAnalyzer(file);
            analyzer.loadContent();

            // Vérifier si backup
            if (analyzer.isBackupFile()) {
                this.report.stats.backups++;
                this.report.addIssue('warning', 'backup', 'Fichier de backup détecté', file, {
                    size: analyzer.size
                });
            }

            this.duplicateDetector.addFile(analyzer);
        }

        // Trouver les doublons exacts
        const duplicates = this.duplicateDetector.findDuplicates();
        this.report.stats.duplicates = duplicates.length;

        for (const dup of duplicates) {
            this.report.addIssue(
                'critical',
                'duplicate',
                `${dup.count} fichiers identiques détectés`,
                dup.files[0],
                {
                    files: dup.files,
                    waste: `${Math.round(dup.totalWaste / 1024)} KB`
                }
            );
        }

        console.log(`   ✓ ${duplicates.length} duplicate groups found`);
        console.log(`   ✓ ${this.report.stats.backups} backup files found`);
    }

    async analyzeDependencies() {
        const jsFiles = this.allFiles.filter(f => f.endsWith('.js'));

        for (const file of jsFiles) {
            const analyzer = new FileAnalyzer(file);
            const analysis = analyzer.analyzeJavaScript();

            if (!analysis) {
                continue;
            }

            const relPath = path.relative(CONFIG.projectRoot, file);

            // Ajouter au graphe de dépendances
            for (const imp of analysis.imports) {
                this.dependencyGraph.addDependency(relPath, imp);
            }
        }

        // Trouver les imports cassés
        const brokenImports = this.dependencyGraph.findBrokenImports(this.allFiles);
        this.report.stats.brokenImports = brokenImports.length;

        for (const broken of brokenImports) {
            this.report.addIssue(
                'critical',
                'broken_import',
                `Import cassé: ${broken.to}`,
                path.join(CONFIG.projectRoot, broken.from),
                broken
            );
        }

        // Trouver les fichiers inutilisés
        const unused = this.dependencyGraph.findUnusedFiles(this.allFiles);
        this.report.stats.deadCode = unused.length;

        for (const file of unused) {
            this.report.addIssue(
                'info',
                'unused',
                'Fichier potentiellement inutilisé',
                path.join(CONFIG.projectRoot, file.file),
                file
            );
        }

        console.log(`   ✓ ${brokenImports.length} broken imports found`);
        console.log(`   ✓ ${unused.length} potentially unused files`);
    }

    async analyzeCodeQuality() {
        const jsFiles = this.allFiles.filter(f => f.endsWith('.js'));

        for (const file of jsFiles) {
            const analyzer = new FileAnalyzer(file);
            const analysis = analyzer.analyzeJavaScript();

            if (!analysis) {
                continue;
            }

            // Taille de fichier
            if (analyzer.size > CONFIG.thresholds.fileSizeCritical) {
                this.report.addIssue(
                    'critical',
                    'file_size',
                    `Fichier trop volumineux (${Math.round(analyzer.size / 1024)} KB)`,
                    file,
                    { lines: analysis.lines }
                );
            } else if (analyzer.size > CONFIG.thresholds.fileSizeWarning) {
                this.report.addIssue(
                    'warning',
                    'file_size',
                    `Fichier volumineux (${Math.round(analyzer.size / 1024)} KB)`,
                    file,
                    { lines: analysis.lines }
                );
            }

            // Complexité
            if (analysis.complexity > CONFIG.thresholds.complexityWarning) {
                this.report.addIssue(
                    'warning',
                    'complexity',
                    `Complexité élevée (${analysis.complexity})`,
                    file,
                    { suggestion: 'Refactoriser en fonctions plus petites' }
                );
            }

            // console.log en production
            if (analysis.consoleLog > 5) {
                this.report.addIssue(
                    'info',
                    'console_log',
                    `${analysis.consoleLog} console.log détectés`,
                    file,
                    { suggestion: 'Utiliser le Logger ou retirer' }
                );
            }

            // TODOs
            if (analysis.todos > 0) {
                this.report.addIssue('info', 'todo', `${analysis.todos} TODO(s) trouvé(s)`, file);
            }
        }

        console.log(`   ✓ Code quality analyzed for ${jsFiles.length} files`);
    }

    async detectMisplacedFiles() {
        for (const file of this.allFiles) {
            const relPath = path.relative(CONFIG.projectRoot, file);
            const ext = path.extname(file);

            // Fichiers .md (sauf claude.md à la racine)
            if (ext === '.md' && !relPath.startsWith('docs/') && file !== 'claude.md') {
                this.report.stats.misplacedFiles++;
                this.report.addIssue('warning', 'misplaced', 'Fichier .md hors de docs/', file, {
                    suggestedPath: `docs/${path.basename(file)}`
                });
            }

            // Fichiers .sql
            if (ext === '.sql' && !relPath.startsWith('sql/')) {
                this.report.stats.misplacedFiles++;
                this.report.addIssue('warning', 'misplaced', 'Fichier .sql hors de sql/', file, {
                    suggestedPath: `sql/${path.basename(file)}`
                });
            }

            // Fichiers .txt
            if (ext === '.txt' && !relPath.startsWith('docs/')) {
                this.report.stats.misplacedFiles++;
                this.report.addIssue('warning', 'misplaced', 'Fichier .txt hors de docs/', file, {
                    suggestedPath: `docs/assets/${path.basename(file)}`
                });
            }
        }

        console.log(`   ✓ ${this.report.stats.misplacedFiles} misplaced files found`);
    }

    async generateRecommendations() {
        const summary = this.report.getSummary();

        // Recommandations basées sur l'analyse
        if (this.report.stats.duplicates > 0) {
            this.report.addRecommendation(
                'Éliminer les fichiers dupliqués',
                `${this.report.stats.duplicates} groupes de doublons détectés. Conserver une seule version et utiliser Git pour l'historique.`,
                'high',
                'Exécuter avec --fix --aggressive pour supprimer automatiquement'
            );
        }

        if (this.report.stats.backups > 5) {
            this.report.addRecommendation(
                'Nettoyer les fichiers backup',
                `${this.report.stats.backups} fichiers backup trouvés. Utiliser Git au lieu de créer des copies.`,
                'medium',
                'Exécuter avec --fix pour déplacer vers archive/'
            );
        }

        if (this.report.stats.brokenImports > 0) {
            this.report.addRecommendation(
                'Corriger les imports cassés',
                `${this.report.stats.brokenImports} imports cassés détectés. Cela peut causer des erreurs runtime.`,
                'high',
                'Vérifier les chemins et corriger manuellement'
            );
        }

        if (this.report.stats.deadCode > 10) {
            this.report.addRecommendation(
                'Archiver le code mort',
                `${this.report.stats.deadCode} fichiers potentiellement inutilisés détectés.`,
                'medium',
                'Déplacer vers archive/ si confirmé inutilisé'
            );
        }

        if (this.report.stats.misplacedFiles > 0) {
            this.report.addRecommendation(
                'Réorganiser les fichiers',
                `${this.report.stats.misplacedFiles} fichiers mal placés détectés.`,
                'low',
                'Exécuter avec --fix pour réorganiser automatiquement'
            );
        }

        // Recommandation générale
        this.report.addRecommendation(
            'Implémenter ESLint et Prettier',
            'Ajouter ESLint pour détecter automatiquement les erreurs et Prettier pour formater le code.',
            'high',
            'Voir scripts/utilities/setup-eslint.js'
        );

        this.report.addRecommendation(
            'Ajouter tests Jest',
            'Créer des tests unitaires pour les modules critiques.',
            'high',
            'Voir scripts/utilities/setup-jest.js'
        );

        console.log(`   ✓ ${this.report.recommendations.length} recommendations generated`);
    }

    async applyFixes() {
        console.log('\n🔧 Application des corrections...\n');

        let fixedCount = 0;

        // Fix 1: Déplacer fichiers mal placés
        for (const issue of this.report.issues.warning) {
            if (issue.category === 'misplaced' && issue.details.suggestedPath) {
                const targetDir = path.dirname(
                    path.join(CONFIG.projectRoot, issue.details.suggestedPath)
                );

                if (!fs.existsSync(targetDir)) {
                    fs.mkdirSync(targetDir, { recursive: true });
                }

                const oldPath = path.join(CONFIG.projectRoot, issue.file);
                const newPath = path.join(CONFIG.projectRoot, issue.details.suggestedPath);

                console.log(`   MOVE: ${issue.file} -> ${issue.details.suggestedPath}`);

                if (!this.options.dryRun) {
                    fs.renameSync(oldPath, newPath);
                }

                fixedCount++;
            }
        }

        // Fix 2: Déplacer backups vers archive/
        if (this.options.aggressive) {
            for (const issue of this.report.issues.warning) {
                if (issue.category === 'backup') {
                    const archiveDir = path.join(CONFIG.projectRoot, 'archive', 'backups');

                    if (!fs.existsSync(archiveDir)) {
                        fs.mkdirSync(archiveDir, { recursive: true });
                    }

                    const oldPath = path.join(CONFIG.projectRoot, issue.file);
                    const newPath = path.join(archiveDir, path.basename(issue.file));

                    console.log(`   ARCHIVE: ${issue.file}`);

                    if (!this.options.dryRun) {
                        fs.renameSync(oldPath, newPath);
                    }

                    fixedCount++;
                }
            }
        }

        console.log(`\n   ✓ ${fixedCount} corrections appliquées`);
    }

    async generateReport() {
        const summary = this.report.getSummary();

        // Console report
        console.log('\n' + '='.repeat(60));
        console.log("📊 RAPPORT D'AUDIT");
        console.log('='.repeat(60));
        console.log(`Total Issues: ${summary.total}`);
        console.log(`  🔴 Critical: ${summary.critical}`);
        console.log(`  🟡 Warning: ${summary.warning}`);
        console.log(`  🔵 Info: ${summary.info}`);
        console.log('');
        console.log(`Total Files: ${this.report.stats.totalFiles}`);
        console.log(`Total Size: ${Math.round(this.report.stats.totalSize / 1024 / 1024)} MB`);
        console.log(`Code Files: ${this.report.stats.codeFiles}`);
        console.log('');
        console.log(`Duplicates: ${this.report.stats.duplicates}`);
        console.log(`Backups: ${this.report.stats.backups}`);
        console.log(`Dead Code: ${this.report.stats.deadCode}`);
        console.log(`Broken Imports: ${this.report.stats.brokenImports}`);
        console.log(`Misplaced Files: ${this.report.stats.misplacedFiles}`);
        console.log('='.repeat(60) + '\n');

        // JSON report
        const jsonPath = path.join(CONFIG.projectRoot, 'temp', 'audit-report.json');
        const tempDir = path.dirname(jsonPath);

        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        fs.writeFileSync(jsonPath, JSON.stringify(this.report, null, 2));
        console.log('📄 JSON report saved: temp/audit-report.json');

        // HTML report
        if (this.options.report) {
            await this.generateHTMLReport();
        }
    }

    async generateHTMLReport() {
        const htmlPath = path.join(CONFIG.projectRoot, 'temp', 'audit-report.html');
        const summary = this.report.getSummary();

        const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Skali Audit Report - ${this.report.timestamp}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', -apple-system, sans-serif;
            background: linear-gradient(135deg, #0a0f0a 0%, #0f1810 50%, #0a0f0a 100%);
            color: #ffffff;
            padding: 40px 20px;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #3e8e41, #2563eb);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .timestamp { color: #666; margin-bottom: 40px; }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .stat-card {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 24px;
            backdrop-filter: blur(10px);
        }
        .stat-value {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .stat-label { color: #aaa; font-size: 0.9rem; }
        .issues {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
        }
        .issue {
            background: rgba(255,255,255,0.03);
            border-left: 4px solid;
            padding: 16px;
            margin-bottom: 12px;
            border-radius: 4px;
        }
        .issue.critical { border-color: #dc2626; }
        .issue.warning { border-color: #f59e0b; }
        .issue.info { border-color: #3b82f6; }
        .issue-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        .issue-title { font-weight: 600; }
        .issue-severity {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        .severity-critical { background: #dc2626; color: white; }
        .severity-warning { background: #f59e0b; color: white; }
        .severity-info { background: #3b82f6; color: white; }
        .issue-file { color: #888; font-size: 0.85rem; font-family: monospace; }
        .recommendations {
            background: rgba(62,142,65,0.1);
            border: 1px solid rgba(62,142,65,0.3);
            border-radius: 12px;
            padding: 30px;
        }
        .recommendation {
            background: rgba(255,255,255,0.03);
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 16px;
        }
        .rec-title {
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 8px;
            color: #3e8e41;
        }
        .rec-impact {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.75rem;
            margin-bottom: 12px;
        }
        .impact-high { background: #dc2626; color: white; }
        .impact-medium { background: #f59e0b; color: white; }
        .impact-low { background: #3b82f6; color: white; }
        .rec-action {
            background: rgba(0,0,0,0.3);
            padding: 12px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 0.9rem;
            margin-top: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 Skali Audit Report</h1>
        <div class="timestamp">${new Date(this.report.timestamp).toLocaleString('fr-FR')}</div>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-value" style="color: #dc2626">${summary.critical}</div>
                <div class="stat-label">Critical Issues</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: #f59e0b">${summary.warning}</div>
                <div class="stat-label">Warnings</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: #3b82f6">${summary.info}</div>
                <div class="stat-label">Infos</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: #3e8e41">${this.report.stats.totalFiles}</div>
                <div class="stat-label">Total Files</div>
            </div>
        </div>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-value" style="color: #dc2626">${this.report.stats.duplicates}</div>
                <div class="stat-label">Duplicates</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: #f59e0b">${this.report.stats.backups}</div>
                <div class="stat-label">Backup Files</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: #3b82f6">${this.report.stats.deadCode}</div>
                <div class="stat-label">Unused Files</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: #dc2626">${this.report.stats.brokenImports}</div>
                <div class="stat-label">Broken Imports</div>
            </div>
        </div>

        ${this.generateIssuesHTML()}
        ${this.generateRecommendationsHTML()}
    </div>
</body>
</html>`;

        fs.writeFileSync(htmlPath, html);
        console.log('🌐 HTML report saved: temp/audit-report.html\n');
    }

    generateIssuesHTML() {
        let html = '<div class="issues"><h2>Issues Detected</h2>';

        ['critical', 'warning', 'info'].forEach(severity => {
            const issues = this.report.issues[severity];

            if (issues.length > 0) {
                html += `<h3 style="margin: 20px 0 16px 0; text-transform: capitalize;">${severity} (${issues.length})</h3>`;

                issues.slice(0, 50).forEach(issue => {
                    html += `
                    <div class="issue ${severity}">
                        <div class="issue-header">
                            <div class="issue-title">${issue.message}</div>
                            <div class="issue-severity severity-${severity}">${severity}</div>
                        </div>
                        <div class="issue-file">${issue.file}</div>
                    </div>`;
                });

                if (issues.length > 50) {
                    html += `<p style="color: #888; margin-top: 16px;">... et ${issues.length - 50} autres</p>`;
                }
            }
        });

        html += '</div>';
        return html;
    }

    generateRecommendationsHTML() {
        if (this.report.recommendations.length === 0) {
            return '';
        }

        let html = '<div class="recommendations"><h2>💡 Recommendations</h2>';

        this.report.recommendations
            .sort((a, b) => a.priority - b.priority)
            .forEach(rec => {
                html += `
                <div class="recommendation">
                    <div class="rec-title">${rec.title}</div>
                    <div class="rec-impact impact-${rec.impact}">${rec.impact} impact</div>
                    <p>${rec.description}</p>
                    <div class="rec-action">💻 ${rec.action}</div>
                </div>`;
            });

        html += '</div>';
        return html;
    }

    printSummary() {
        const summary = this.report.getSummary();

        console.log('📋 TOP RECOMMENDATIONS:');
        this.report.recommendations
            .sort((a, b) => a.priority - b.priority)
            .slice(0, 5)
            .forEach((rec, i) => {
                console.log(`\n${i + 1}. ${rec.title}`);
                console.log(`   Impact: ${rec.impact.toUpperCase()}`);
                console.log(`   Action: ${rec.action}`);
            });

        console.log('\n\n🎯 NEXT STEPS:');
        console.log('1. Review the HTML report: temp/audit-report.html');
        console.log('2. Fix critical issues first');
        console.log('3. Run with --fix to auto-fix safe issues');
        console.log('4. Setup ESLint: node scripts/utilities/setup-eslint.js');
        console.log('5. Setup Jest: node scripts/utilities/setup-jest.js\n');
    }
}

// ==================== MAIN ====================

async function main() {
    const args = process.argv.slice(2);

    const options = {
        fix: args.includes('--fix'),
        report: args.includes('--report') || true, // Always generate report
        aggressive: args.includes('--aggressive'),
        dryRun: !args.includes('--live')
    };

    const bot = new SkaliAuditBot(options);
    await bot.run();
}

// Gestion des erreurs
process.on('unhandledRejection', error => {
    console.error('\n❌ Erreur non gérée:', error);
    process.exit(1);
});

// Lancer
if (require.main === module) {
    main();
}

module.exports = { SkaliAuditBot, FileAnalyzer, DuplicateDetector, DependencyGraph };
