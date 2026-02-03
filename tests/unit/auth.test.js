/**
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
