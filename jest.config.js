module.exports = {
    // Test environment
    testEnvironment: 'jsdom',

    // Roots
    roots: ['<rootDir>/tests'],

    // Test files pattern
    testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],

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

    coverageReporters: ['text', 'text-summary', 'html', 'lcov'],

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
    testPathIgnorePatterns: ['/node_modules/', '/temp/', '/archive/', '/_archive/'],

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
