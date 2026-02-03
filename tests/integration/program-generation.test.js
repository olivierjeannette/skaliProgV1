/**
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
