/**
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
