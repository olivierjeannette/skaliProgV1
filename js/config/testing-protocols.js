/**
 * PROTOCOLES DE TESTS SPORTIFS
 * Tests standardisés pour évaluer les capacités physiques
 */

const TestingProtocols = {
    // ==================== FORCE ====================
    force: {
        '1rm_test': {
            name: 'Test 1RM (One Rep Max)',
            description: 'Charge maximale pour 1 répétition',
            exercises: ['Squat', 'Bench Press', 'Deadlift', 'Overhead Press'],
            protocol: [
                'Échauffement général 10min',
                'Série 1: 8 reps @ 50% 1RM estimé',
                'Série 2: 5 reps @ 70% 1RM estimé',
                'Série 3: 2-3 reps @ 85% 1RM estimé',
                'Série 4: 1 rep @ 95% 1RM estimé',
                'Tentatives 1RM avec augmentations 2.5-5kg'
            ],
            rest_between_attempts: '3-5min',
            max_attempts: 3,
            safety: 'Spotters obligatoires'
        },
        estimated_1rm: {
            name: '1RM Estimé (formule Epley)',
            description: 'Calcul 1RM via séries à échec',
            formula: '1RM = poids × (1 + reps/30)',
            reps_range: [4, 10],
            accuracy: '±5%'
        }
    },

    // ==================== VMA (Vitesse Maximale Aérobie) ====================
    vma: {
        vameval: {
            name: 'Test VAMEVAL',
            description: 'Test progressif sur piste 400m',
            equipment: 'Piste + plot tous les 20m',
            protocol: [
                'Échauffement 15min',
                'Départ 8 km/h',
                'Augmentation 0.5 km/h chaque minute',
                'Arrêt quand incapable suivre allure'
            ],
            duration_max: '20min',
            calculation: 'VMA = vitesse dernière minute complète'
        },
        demi_cooper: {
            name: 'Test Demi-Cooper',
            description: 'Distance maximale en 6min',
            equipment: 'Piste ou tapis mesure GPS',
            protocol: ['Échauffement 15min', 'Courir distance max en 6min', 'All-out constant'],
            calculation: 'VMA = (distance en km / 100) × 10'
        },
        '45_15': {
            name: 'Test 45-15 (Gacon)',
            description: "45sec effort / 15sec récup jusqu'à échec",
            equipment: 'Piste + plots tous les 10m',
            protocol: [
                'Départ 8 km/h',
                'Augmentation 0.5 km/h chaque palier',
                'Format: 45sec run / 15sec statique'
            ],
            calculation: 'VMA = vitesse dernier palier validé'
        }
    },

    // ==================== VO2MAX ====================
    vo2max: {
        direct_measurement: {
            name: 'Mesure Directe VO2max',
            description: 'Test laboratoire avec analyseur gaz',
            equipment: 'Tapis + K4/K5 ou similaire',
            protocol: "Test progressif jusqu'à épuisement",
            gold_standard: true,
            cost: 'Élevé (150-300€)'
        },
        cooper_12min: {
            name: 'Test Cooper 12min',
            description: 'Distance maximale en 12min',
            equipment: 'Piste 400m',
            protocol: 'Courir distance max en 12min',
            calculation: 'VO2max = (distance - 504.9) / 44.73',
            accuracy: '±10%'
        },
        astrand_test: {
            name: 'Test Åstrand (vélo)',
            description: 'Test sous-maximal vélo',
            equipment: 'Vélo ergomètre + cardiofréquencemètre',
            duration: '6min',
            workload: 'Ajusté pour FC 120-170 bpm',
            calculation: 'Nomogramme Åstrand'
        }
    },

    // ==================== FTP (Functional Threshold Power) ====================
    ftp: {
        '20min_test': {
            name: 'Test FTP 20min',
            description: 'Puissance moyenne max sur 20min',
            equipment: 'Vélo + capteur puissance',
            protocol: [
                'Échauffement 20min progressif',
                '5min all-out',
                '10min récupération facile',
                '20min test (puissance max soutenue)',
                'Retour calme 10min'
            ],
            calculation: 'FTP = Puissance moy 20min × 0.95'
        },
        ramp_test: {
            name: 'Ramp Test (8-20min)',
            description: "Test progressif jusqu'à échec",
            protocol: ['Départ 100W', 'Augmentation 20W chaque minute', "Jusqu'à échec"],
            calculation: 'FTP = Puissance max × 0.75'
        }
    },

    // ==================== DÉTENTE VERTICALE ====================
    verticalJump: {
        countermovement_jump: {
            name: 'CMJ (CounterMovement Jump)',
            description: 'Saut vertical avec contremouvement',
            equipment: 'Tapis de force / Vertec / My Jump app',
            protocol: [
                'Debout, mains sur hanches',
                'Flexion rapide genoux',
                'Extension explosive maximale',
                '3 tentatives'
            ],
            measurement: 'Hauteur max en cm'
        },
        squat_jump: {
            name: 'Squat Jump',
            description: 'Saut vertical depuis position squat',
            equipment: 'Tapis de force / My Jump app',
            protocol: [
                'Position squat 90°',
                'Maintien 3sec',
                'Extension explosive sans contremouvement'
            ],
            measurement: 'Hauteur max en cm'
        }
    },

    // ==================== SPRINT ====================
    sprint: {
        '30m_sprint': {
            name: 'Sprint 30m',
            description: 'Temps sur 30m départ arrêté',
            equipment: 'Cellules photoélectriques ou chrono manuel',
            protocol: [
                'Échauffement complet',
                'Départ pied avant à 30cm ligne',
                '3 tentatives',
                'Récup 3-5min entre tentatives'
            ],
            splits: ['10m', '20m', '30m'],
            measurement: 'Temps en secondes (±0.01s)'
        },
        flying_20m: {
            name: 'Sprint Lancé 20m',
            description: 'Vitesse max pure sur 20m',
            protocol: ['20m accélération', '20m sprint max (chronométré)'],
            measurement: 'Vitesse max en km/h'
        }
    },

    // ==================== ENDURANCE ANAÉROBIE ====================
    anaerobicCapacity: {
        wingate_test: {
            name: 'Test Wingate',
            description: 'Test puissance anaérobie 30sec vélo',
            equipment: 'Vélo ergomètre',
            protocol: [
                'Échauffement 5min',
                '2-3 sprints 5sec',
                'Repos 5min',
                '30sec sprint maximal contre résistance'
            ],
            measurements: ['Pic puissance', 'Puissance moyenne', 'Index fatigue']
        }
    },

    // ==================== TESTS SPÉCIFIQUES SPORTS ====================
    sportSpecific: {
        yo_yo_test: {
            name: 'Yo-Yo Intermittent Recovery Test',
            description: 'Test endurance intermittente (football, rugby)',
            equipment: 'Piste 20m + audio',
            protocol: [
                'Navettes 2×20m',
                'Vitesse progressive',
                '10sec récup active entre navettes'
            ],
            levels: 'Niveau 1 à 23',
            sports: ['Football', 'Rugby', 'Basketball', 'Handball']
        },
        beep_test: {
            name: 'Beep Test (Léger)',
            description: 'Test navettes progressif',
            equipment: 'Piste 20m + audio',
            protocol: 'Navettes 20m synchronisées sur bips',
            calculation: 'VO2max via table conversion'
        },
        css_swim: {
            name: 'CSS (Critical Swim Speed)',
            description: 'Vitesse critique nage',
            protocol: ['400m temps maximal', 'Récup 20min', '200m temps maximal'],
            calculation: 'CSS = 200m / (T400 - T200)'
        },
        tactical_fitness_test: {
            name: 'Test Tactical Fitness',
            description: 'HYROX / Tactical athletes',
            exercises: ['1RM Deadlift', 'Pull-ups max', '5km run', '1000m Row']
        }
    },

    // ==================== COMPOSITION CORPORELLE ====================
    bodyComposition: {
        skinfold_caliper: {
            name: 'Plis Cutanés (Caliper)',
            description: 'Mesure % masse grasse via plis',
            sites: ['Triceps', 'Biceps', 'Subscapulaire', 'Supra-iliaque'],
            formula: ['Jackson-Pollock 3 sites', 'Jackson-Pollock 7 sites'],
            accuracy: '±3-4%'
        },
        bioimpedance: {
            name: 'Bio-impédancemétrie',
            description: 'Balance impédance',
            accuracy: '±5%',
            conditions: ['À jeun', 'Hydratation stable', "Pas d'exercice 12h avant"]
        },
        dexa_scan: {
            name: 'DEXA Scan',
            description: 'Gold standard composition corporelle',
            measurements: ['% graisse', 'Masse maigre', 'Densité osseuse'],
            accuracy: '±1-2%',
            cost: 'Élevé'
        }
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestingProtocols;
} else {
    window.TestingProtocols = TestingProtocols;
}
