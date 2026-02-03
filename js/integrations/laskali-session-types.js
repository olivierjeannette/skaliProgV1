/**
 * TYPES DE SÉANCES LA SKÀLI
 * Informations complètes sur chaque type de séance
 * Source: laskali.eu
 */

const LaSkaliSessionTypes = {
    /**
     * Définitions complètes des types de séances
     */
    types: {
        hyrox: {
            id: 'hyrox',
            name: 'HYROX',
            description:
                'Entraînement spécifique HYROX combinant course à pied et exercices fonctionnels',
            qualities: [
                'Endurance cardiovasculaire',
                'Force endurance',
                'Puissance aérobie',
                'Résistance mentale'
            ],
            muscleGroups: ['Full body', 'Jambes', 'Dos', 'Épaules', 'Core'],
            characteristics: [
                'Préparation compétition HYROX',
                'Technique optimisée des stations',
                'Running intégré (1km segments)',
                'Transitions rapides'
            ],
            stations: [
                'SkiErg (1000m)',
                'Sled Push (50m)',
                'Sled Pull (50m)',
                'Burpee Broad Jump (80m)',
                'Rowing (1000m)',
                'Farmers Carry (200m)',
                'Sandbag Lunges (100m)',
                'Wall Balls (100 reps)'
            ],
            duration: 50,
            intensity: 'Haute à très haute',
            level: ['Intermédiaire', 'Avancé']
        },

        hyrox_long: {
            id: 'hyrox_long',
            name: 'HYROX LONG',
            description: 'Format HYROX complet ou half, préparation intensive à la compétition',
            qualities: [
                'Endurance extrême',
                'Force endurance prolongée',
                "Gestion de l'effort",
                "Mental d'acier"
            ],
            muscleGroups: ['Full body'],
            characteristics: [
                'Simulation complète HYROX',
                'Durée 75-90 minutes',
                'Peut accueillir +12 personnes',
                'Format compétitif'
            ],
            duration: 90,
            intensity: 'Très haute',
            level: ['Avancé']
        },

        gym_skills: {
            id: 'gym_skills',
            name: 'GYM SKILLS',
            description: 'Mouvements de gymnastique : handstand, muscle-up, pistol squat',
            qualities: [
                'Mobilité extrême',
                'Force relative (bodyweight)',
                'Coordination',
                'Équilibre',
                'Proprioception'
            ],
            muscleGroups: ['Core', 'Épaules', 'Dos', 'Bras'],
            characteristics: [
                'Technique pure',
                'Progressions adaptées',
                'Force au poids de corps',
                'Skills avancées'
            ],
            movements: [
                'Handstand / Handstand Push-Up',
                'Muscle-Up (bar & rings)',
                'Pistol Squat',
                'L-Sit',
                'Toes to Bar',
                'Pull-ups stricts',
                'Ring dips'
            ],
            duration: 50,
            intensity: 'Moyenne à haute',
            level: ['Tous niveaux avec progressions']
        },

        barbell_club: {
            id: 'barbell_club',
            name: 'BARBELLS CLUB',
            description: 'Haltérophilie & SBD (Squat, Bench, Deadlift)',
            qualities: ['Force maximale', 'Technique parfaite', 'Progression mesurée', 'Puissance'],
            muscleGroups: ['Jambes', 'Dos', 'Pectoraux', 'Épaules'],
            characteristics: [
                "Mouvements d'haltérophilie olympique",
                'SBD (Squat, Bench Press, Deadlift)',
                'Charges lourdes',
                'Repos complets entre séries'
            ],
            movements: [
                'Snatch (Arraché)',
                'Clean & Jerk (Épaulé-Jeté)',
                'Back Squat',
                'Front Squat',
                'Bench Press',
                'Deadlift',
                'Overhead Press'
            ],
            duration: 50,
            intensity: 'Haute (charges lourdes)',
            level: ['Intermédiaire', 'Avancé']
        },

        tactical: {
            id: 'tactical',
            name: 'TACTICAL',
            description: 'Cardio fonctionnel inspiré des méthodes militaires',
            qualities: [
                'Cardio intense',
                'Mental fort',
                'Condition physique globale',
                'Work capacity',
                'Résilience'
            ],
            muscleGroups: ['Full body'],
            characteristics: [
                'Circuits intensifs',
                'Combinaison force, endurance, agilité',
                'Loaded carries',
                'Formats variés (AMRAP, For Time, EMOM)'
            ],
            movements: [
                'Sandbag Carries',
                'Farmers Walks',
                'Sled Push/Pull',
                'Box Step-Ups',
                'Burpees',
                'Rowing',
                'Battle Ropes'
            ],
            duration: 50,
            intensity: 'Haute',
            level: ['Tous niveaux']
        },

        build: {
            id: 'build',
            name: 'BUILD',
            description: "Musculation pure axée sur l'hypertrophie",
            qualities: [
                'Hypertrophie musculaire',
                'Force fonctionnelle',
                'Volume de travail élevé',
                'Contrôle musculaire'
            ],
            muscleGroups: ['Tous groupes musculaires (split)'],
            characteristics: [
                'Programme structuré',
                'Séries longues (8-15 reps)',
                'Temps sous tension',
                'Focus isolation'
            ],
            movements: [
                'Romanian Deadlift',
                'Bulgarian Split Squats',
                'DB Bench Press',
                'DB Rows',
                'Lateral Raises',
                'Biceps Curls',
                'Triceps Extensions',
                'Leg Press'
            ],
            duration: 50,
            intensity: 'Moyenne à haute',
            level: ['Tous niveaux']
        },

        power: {
            id: 'power',
            name: 'POWER',
            description: 'Travail de la puissance, explosivité et tolérance lactique',
            qualities: [
                'Explosivité',
                'Puissance anaérobie',
                'Vitesse de force',
                'Production de force rapide',
                'Tolérance lactique'
            ],
            muscleGroups: ['Full body', 'Jambes dominantes'],
            characteristics: [
                'Mouvements explosifs',
                'Charges modérées',
                'Repos incomplets',
                'Complexes balistiques'
            ],
            movements: [
                'Power Clean',
                'Power Snatch',
                'Box Jumps (high)',
                'Kettlebell Swings (lourds)',
                'Med Ball Slams',
                'Sprints courts',
                'Broad Jumps',
                'Thrusters'
            ],
            duration: 50,
            intensity: 'Très haute',
            level: ['Intermédiaire', 'Avancé']
        },

        spe_run_bike: {
            id: 'spe_run_bike',
            name: 'SPÉ RUN & BIKE',
            description:
                'Spécialisation course à pied et vélo, adapté selon météo (outdoor/indoor)',
            qualities: [
                'Endurance cardiovasculaire',
                'Capacité aérobie',
                'Économie de course',
                'Puissance cycliste',
                'Résistance mentale'
            ],
            muscleGroups: ['Jambes', 'Core', 'Cardio'],
            characteristics: [
                'Intervalles course/vélo',
                'Travail zones cardio',
                'Technique de course',
                'Puissance sur vélo/ergomètre',
                'Adaptable météo'
            ],
            movements: [
                'Running (outdoor/treadmill)',
                'Cycling (outdoor/bike erg)',
                'Assault Bike',
                'SkiErg (alternative)',
                'Rowing (alternative)',
                'Hill Sprints',
                'Tempo Runs',
                'Bike Intervals'
            ],
            duration: 50,
            intensity: 'Moyenne à très haute',
            level: ['Tous niveaux'],
            weatherOptions: ['outdoor', 'indoor'] // Spécifique à ce type
        }
    },

    /**
     * Obtenir un type de séance par ID
     * @param typeId
     */
    getType(typeId) {
        return this.types[typeId] || null;
    },

    /**
     * Obtenir tous les types
     */
    getAllTypes() {
        return Object.values(this.types);
    },

    /**
     * Obtenir les types pour un select HTML
     */
    getTypesForSelect() {
        return Object.entries(this.types).map(([id, type]) => ({
            value: id,
            label: type.name,
            description: type.description
        }));
    },

    /**
     * Analyser la cohérence d'une séance par rapport au type
     * @param sessionType
     * @param sessionData
     */
    analyzeCoherence(sessionType, sessionData) {
        const type = this.getType(sessionType);
        if (!type) {
            return { coherent: false, reasons: ['Type de séance inconnu'] };
        }

        const reasons = [];
        let score = 100;

        // Vérifier les qualités physiques
        if (sessionData.qualities) {
            const missingQualities = type.qualities.filter(
                q => !sessionData.qualities.some(sq => sq.toLowerCase().includes(q.toLowerCase()))
            );
            if (missingQualities.length > 0) {
                reasons.push(`Qualités manquantes: ${missingQualities.join(', ')}`);
                score -= 20;
            }
        }

        // Vérifier les groupes musculaires
        if (sessionData.muscleGroups) {
            const expectedGroups = type.muscleGroups;
            const matchingGroups = sessionData.muscleGroups.filter(mg =>
                expectedGroups.some(
                    eg =>
                        eg.toLowerCase().includes(mg.toLowerCase()) ||
                        mg.toLowerCase().includes(eg.toLowerCase())
                )
            );
            if (matchingGroups.length === 0) {
                reasons.push('Groupes musculaires non cohérents');
                score -= 20;
            }
        }

        // Vérifier la durée
        if (sessionData.duration && Math.abs(sessionData.duration - type.duration) > 15) {
            reasons.push(`Durée non standard (attendue: ${type.duration}min)`);
            score -= 10;
        }

        return {
            coherent: score >= 70,
            score,
            reasons,
            type: type.name
        };
    }
};

// Export global
window.LaSkaliSessionTypes = LaSkaliSessionTypes;

console.log('✅ La Skàli Session Types chargé');
