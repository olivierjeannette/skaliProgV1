/**
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
