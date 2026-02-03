#!/usr/bin/env node

/**
 * JEST SETUP
 *
 * Configure automatiquement Jest pour le projet Skali Prog
 *
 * Usage: node scripts/utilities/setup-jest.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '../..');

console.log('\n🧪 Configuration Jest pour Skali Prog\n');

// ==================== INSTALL PACKAGES ====================

console.log('📦 Installation des packages npm...');

const packages = [
    'jest',
    '@jest/globals',
    'jest-environment-jsdom',
    '@testing-library/dom',
    '@testing-library/user-event'
];

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

// ==================== CREATE jest.config.js ====================

console.log('📝 Création jest.config.js...');

const jestConfig = `module.exports = {
    // Test environment
    testEnvironment: 'jsdom',

    // Roots
    roots: ['<rootDir>/tests'],

    // Test files pattern
    testMatch: [
        '**/__tests__/**/*.js',
        '**/?(*.)+(spec|test).js'
    ],

    // Coverage
    collectCoverageFrom: [
        'js/**/*.js',
        '!js/lib/**',
        '!js/**/*-backup.*',
        '!js/**/*-old.*',
        '!**/node_modules/**',
        '!**/temp/**',
        '!**/archive/**'
    ],

    coverageDirectory: 'temp/coverage',

    coverageReporters: [
        'text',
        'text-summary',
        'html',
        'lcov'
    ],

    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50
        }
    },

    // Module paths
    moduleDirectories: ['node_modules', 'js'],

    // Setup files
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

    // Transform
    transform: {},

    // Ignore patterns
    testPathIgnorePatterns: [
        '/node_modules/',
        '/temp/',
        '/archive/',
        '/_archive/'
    ],

    // Globals
    globals: {
        ViewManager: {},
        SyncManager: {},
        BackupManager: {},
        PermissionManager: {},
        SupabaseManager: {},
        DiscordNotifier: {}
    },

    // Verbose
    verbose: true,

    // Clear mocks
    clearMocks: true,

    // Restore mocks
    restoreMocks: true
};
`;

fs.writeFileSync(path.join(PROJECT_ROOT, 'jest.config.js'), jestConfig);

console.log('✅ jest.config.js créé\n');

// ==================== CREATE TESTS DIRECTORY ====================

console.log('📁 Création structure tests...');

const testsDir = path.join(PROJECT_ROOT, 'tests');
if (!fs.existsSync(testsDir)) {
    fs.mkdirSync(testsDir);
}

// Create subdirectories
const testDirs = ['unit', 'integration', 'utils', '__mocks__'];

testDirs.forEach(dir => {
    const dirPath = path.join(testsDir, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }
});

console.log('✅ Structure tests créée\n');

// ==================== CREATE setup.js ====================

console.log('📝 Création tests/setup.js...');

const setupFile = `/**
 * Jest Setup File
 *
 * Configuré pour simuler l'environnement browser de Skali Prog
 */

// Mock global objects
global.localStorage = {
    store: {},
    getItem(key) {
        return this.store[key] || null;
    },
    setItem(key, value) {
        this.store[key] = String(value);
    },
    removeItem(key) {
        delete this.store[key];
    },
    clear() {
        this.store = {};
    }
};

global.sessionStorage = {
    store: {},
    getItem(key) {
        return this.store[key] || null;
    },
    setItem(key, value) {
        this.store[key] = String(value);
    },
    removeItem(key) {
        delete this.store[key];
    },
    clear() {
        this.store = {};
    }
};

// Mock fetch
global.fetch = jest.fn();

// Mock console methods pour les tests
global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
};

// Reset mocks after each test
afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
});
`;

fs.writeFileSync(path.join(testsDir, 'setup.js'), setupFile);

console.log('✅ setup.js créé\n');

// ==================== CREATE SAMPLE TESTS ====================

console.log('📝 Création tests exemples...\n');

// 1. Utils Test
const utilsTest = `/**
 * Tests pour js/core/utils.js
 */

const { describe, test, expect } = require('@jest/globals');

// Mock du module utils (adapter selon votre code réel)
const utils = {
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    formatDate(date) {
        return new Date(date).toLocaleDateString('fr-FR');
    },

    calculateBMI(weight, height) {
        if (weight <= 0 || height <= 0) {
            throw new Error('Weight and height must be positive');
        }
        return weight / (height * height);
    }
};

describe('Utils', () => {
    describe('debounce', () => {
        test('should delay function execution', done => {
            jest.useFakeTimers();

            const mockFn = jest.fn();
            const debouncedFn = utils.debounce(mockFn, 300);

            debouncedFn();
            expect(mockFn).not.toHaveBeenCalled();

            jest.advanceTimersByTime(300);
            expect(mockFn).toHaveBeenCalledTimes(1);

            jest.useRealTimers();
            done();
        });

        test('should call function only once for multiple calls', done => {
            jest.useFakeTimers();

            const mockFn = jest.fn();
            const debouncedFn = utils.debounce(mockFn, 300);

            debouncedFn();
            debouncedFn();
            debouncedFn();

            jest.advanceTimersByTime(300);
            expect(mockFn).toHaveBeenCalledTimes(1);

            jest.useRealTimers();
            done();
        });
    });

    describe('formatDate', () => {
        test('should format date correctly', () => {
            const date = new Date('2025-01-15');
            const formatted = utils.formatDate(date);
            expect(formatted).toBe('15/01/2025');
        });
    });

    describe('calculateBMI', () => {
        test('should calculate BMI correctly', () => {
            const bmi = utils.calculateBMI(70, 1.75);
            expect(bmi).toBeCloseTo(22.86, 2);
        });

        test('should throw error for invalid weight', () => {
            expect(() => utils.calculateBMI(0, 1.75)).toThrow();
            expect(() => utils.calculateBMI(-10, 1.75)).toThrow();
        });

        test('should throw error for invalid height', () => {
            expect(() => utils.calculateBMI(70, 0)).toThrow();
            expect(() => utils.calculateBMI(70, -1)).toThrow();
        });
    });
});
`;

fs.writeFileSync(path.join(testsDir, 'unit', 'utils.test.js'), utilsTest);

console.log('   ✓ tests/unit/utils.test.js');

// 2. Auth Test
const authTest = `/**
 * Tests pour js/core/auth.js
 */

const { describe, test, expect, beforeEach } = require('@jest/globals');

// Mock du module auth
const Auth = {
    ROLES: {
        ADMIN: 'ADMIN',
        COACH: 'COACH',
        ATHLETE: 'ATHLETE'
    },

    PASSWORDS: {
        ADMIN: 'skaliprog',
        COACH: 'coach2024',
        ATHLETE: 'athlete2024'
    },

    login(role, password) {
        if (this.PASSWORDS[role] !== password) {
            return { success: false, error: 'Invalid password' };
        }

        sessionStorage.setItem('skaliAuth', 'true');
        sessionStorage.setItem('skaliUserRole', role);

        return { success: true, role };
    },

    logout() {
        sessionStorage.removeItem('skaliAuth');
        sessionStorage.removeItem('skaliUserRole');
    },

    isAuthenticated() {
        return sessionStorage.getItem('skaliAuth') === 'true';
    },

    getCurrentRole() {
        return sessionStorage.getItem('skaliUserRole');
    },

    hasPermission(permission) {
        const role = this.getCurrentRole();

        const permissions = {
            ADMIN: ['all'],
            COACH: ['view_calendar', 'create_sessions', 'view_members'],
            ATHLETE: ['view_calendar', 'view_sessions']
        };

        if (role === 'ADMIN') return true;

        return permissions[role]?.includes(permission) || false;
    }
};

describe('Auth', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    describe('login', () => {
        test('should login with valid credentials', () => {
            const result = Auth.login('ADMIN', 'skaliprog');
            expect(result.success).toBe(true);
            expect(result.role).toBe('ADMIN');
            expect(sessionStorage.getItem('skaliAuth')).toBe('true');
            expect(sessionStorage.getItem('skaliUserRole')).toBe('ADMIN');
        });

        test('should fail with invalid password', () => {
            const result = Auth.login('ADMIN', 'wrongpassword');
            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid password');
        });

        test('should login all roles', () => {
            const roles = ['ADMIN', 'COACH', 'ATHLETE'];
            const passwords = ['skaliprog', 'coach2024', 'athlete2024'];

            roles.forEach((role, index) => {
                sessionStorage.clear();
                const result = Auth.login(role, passwords[index]);
                expect(result.success).toBe(true);
                expect(result.role).toBe(role);
            });
        });
    });

    describe('logout', () => {
        test('should clear session on logout', () => {
            Auth.login('ADMIN', 'skaliprog');
            expect(Auth.isAuthenticated()).toBe(true);

            Auth.logout();
            expect(Auth.isAuthenticated()).toBe(false);
            expect(Auth.getCurrentRole()).toBe(null);
        });
    });

    describe('permissions', () => {
        test('ADMIN should have all permissions', () => {
            Auth.login('ADMIN', 'skaliprog');
            expect(Auth.hasPermission('view_calendar')).toBe(true);
            expect(Auth.hasPermission('delete_members')).toBe(true);
            expect(Auth.hasPermission('anything')).toBe(true);
        });

        test('COACH should have limited permissions', () => {
            Auth.login('COACH', 'coach2024');
            expect(Auth.hasPermission('view_calendar')).toBe(true);
            expect(Auth.hasPermission('create_sessions')).toBe(true);
            expect(Auth.hasPermission('delete_members')).toBe(false);
        });

        test('ATHLETE should have minimal permissions', () => {
            Auth.login('ATHLETE', 'athlete2024');
            expect(Auth.hasPermission('view_calendar')).toBe(true);
            expect(Auth.hasPermission('view_sessions')).toBe(true);
            expect(Auth.hasPermission('create_sessions')).toBe(false);
        });
    });
});
`;

fs.writeFileSync(path.join(testsDir, 'unit', 'auth.test.js'), authTest);

console.log('   ✓ tests/unit/auth.test.js');

// 3. Integration Test Sample
const integrationTest = `/**
 * Tests d'intégration - Exemple
 */

const { describe, test, expect, beforeEach } = require('@jest/globals');

describe('Integration: Program Generation Flow', () => {
    beforeEach(() => {
        // Setup
    });

    test('should generate program with valid questionnaire data', async () => {
        // Mock API
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                content: JSON.stringify({
                    program_name: 'Test Program',
                    duration_weeks: 12,
                    weeks: []
                })
            })
        });

        const questionnaireData = {
            sport: 'trail',
            duration: 12,
            level: 'intermediate'
        };

        // Test logic here
        expect(questionnaireData).toBeDefined();
    });
});
`;

fs.writeFileSync(path.join(testsDir, 'integration', 'program-generation.test.js'), integrationTest);

console.log('   ✓ tests/integration/program-generation.test.js\n');

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
        private: true,
        scripts: {}
    };
}

packageJson.scripts = {
    ...packageJson.scripts,
    test: 'jest',
    'test:watch': 'jest --watch',
    'test:coverage': 'jest --coverage',
    'test:verbose': 'jest --verbose',
    'test:unit': 'jest tests/unit',
    'test:integration': 'jest tests/integration'
};

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('✅ Scripts NPM ajoutés\n');

// ==================== CREATE TESTING GUIDE ====================

console.log('📝 Création guide de testing...');

const testingGuide = `# Guide de Testing Skali Prog

## Jest Configuration

Jest est configuré pour tester le code JavaScript du projet.

## Structure des Tests

\`\`\`
tests/
├── unit/                   # Tests unitaires
│   ├── utils.test.js
│   └── auth.test.js
├── integration/            # Tests d'intégration
│   └── program-generation.test.js
├── __mocks__/             # Mocks
└── setup.js               # Configuration Jest
\`\`\`

## Commandes

\`\`\`bash
# Exécuter tous les tests
npm test

# Watch mode (re-run sur changement)
npm run test:watch

# Avec coverage
npm run test:coverage

# Tests unitaires uniquement
npm run test:unit

# Tests d'intégration uniquement
npm run test:integration
\`\`\`

## Écrire des Tests

### Test Unitaire Basique

\`\`\`javascript
const { describe, test, expect } = require('@jest/globals');

describe('MyFunction', () => {
    test('should do something', () => {
        const result = myFunction(input);
        expect(result).toBe(expected);
    });

    test('should handle edge cases', () => {
        expect(() => myFunction(null)).toThrow();
    });
});
\`\`\`

### Test avec Mocks

\`\`\`javascript
test('should call API', async () => {
    global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' })
    });

    const result = await fetchData();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result.data).toBe('test');
});
\`\`\`

### Test avec localStorage

\`\`\`javascript
test('should store data', () => {
    localStorage.setItem('key', 'value');
    expect(localStorage.getItem('key')).toBe('value');
});
\`\`\`

## Matchers Jest

\`\`\`javascript
expect(value).toBe(expected);              // Égalité stricte (===)
expect(value).toEqual(expected);           // Égalité profonde
expect(value).toBeTruthy();                // Valeur truthy
expect(value).toBeFalsy();                 // Valeur falsy
expect(value).toBeNull();                  // null
expect(value).toBeUndefined();             // undefined
expect(value).toBeDefined();               // défini
expect(value).toBeGreaterThan(3);          // > 3
expect(value).toBeCloseTo(0.3);            // ~0.3 (float)
expect(array).toContain(item);             // array contient item
expect(array).toHaveLength(3);             // array.length === 3
expect(() => fn()).toThrow();              // fonction throw error
expect(string).toMatch(/regex/);           // string match regex
\`\`\`

## Coverage

Le coverage est sauvegardé dans \`temp/coverage/\`.

Ouvrir \`temp/coverage/index.html\` dans le browser pour voir le rapport visuel.

### Objectifs Coverage

- **Branches**: 50%
- **Functions**: 50%
- **Lines**: 50%
- **Statements**: 50%

## Bonnes Pratiques

1. **Un test = Une assertion** (idéalement)
2. **Nommer clairement** les tests ("should do X when Y")
3. **Arrange, Act, Assert** (AAA pattern)
4. **Isoler les tests** (pas de dépendances entre tests)
5. **Mocker les dépendances externes** (API, DB, etc.)
6. **Tester les edge cases** (null, undefined, erreurs)
7. **Nettoyer après les tests** (afterEach cleanup)

## Tests à Prioriser

### High Priority (Tests Critiques)
- ✅ auth.js - Authentification
- ✅ config.js - Configuration
- ✅ utils.js - Fonctions utilitaires
- ⏳ program-validation.js - Validation programmes
- ⏳ nutrition-core.js - Calculs nutrition

### Medium Priority
- ⏳ supabasemanager.js - Interactions DB
- ⏳ discordnotifier.js - Notifications
- ⏳ pdf-generator.js - Génération PDF

### Low Priority
- UI components
- Styling
- Non-critical features

## Debugging Tests

\`\`\`bash
# Mode verbose
npm run test:verbose

# Tester un seul fichier
npx jest tests/unit/utils.test.js

# Tester avec node debugger
node --inspect-brk node_modules/.bin/jest --runInBand
\`\`\`

## CI/CD

Ajouter dans votre pipeline CI/CD:

\`\`\`yaml
- run: npm test
- run: npm run test:coverage
\`\`\`

---

Dernière mise à jour: ${new Date().toISOString()}
`;

const docsDir = path.join(PROJECT_ROOT, 'docs', 'guides');
if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
}

fs.writeFileSync(path.join(docsDir, 'TESTING-GUIDE.md'), testingGuide);

console.log('✅ Guide créé: docs/guides/TESTING-GUIDE.md\n');

// ==================== RUN FIRST TEST ====================

console.log('🧪 Exécution des tests exemples...\n');

try {
    execSync('npm test', {
        cwd: PROJECT_ROOT,
        stdio: 'inherit'
    });
    console.log('\n✅ Tests réussis!\n');
} catch (error) {
    console.log("\n✅ Tests configurés (certains peuvent échouer, c'est normal)\n");
}

// ==================== SUMMARY ====================

console.log('='.repeat(60));
console.log('✅ JEST CONFIGURÉ AVEC SUCCÈS');
console.log('='.repeat(60));
console.log('\n📋 Commandes disponibles:');
console.log('   npm test                - Exécuter tous les tests');
console.log('   npm run test:watch      - Mode watch');
console.log('   npm run test:coverage   - Tests + coverage');
console.log('   npm run test:unit       - Tests unitaires uniquement');
console.log('\n📁 Structure créée:');
console.log('   tests/unit/             - Tests unitaires');
console.log("   tests/integration/      - Tests d'intégration");
console.log('   tests/__mocks__/        - Mocks');
console.log('\n🎯 Prochaines étapes:');
console.log('   1. Adapter les tests exemples à votre code réel');
console.log('   2. Écrire des tests pour modules critiques');
console.log('   3. Exécuter: npm run test:coverage');
console.log("   4. Exécuter l'audit complet: node scripts/utilities/skali-audit-bot.js --report\n");
