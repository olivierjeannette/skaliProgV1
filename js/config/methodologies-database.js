/**
 * BASE DE DONNÉES DES MÉTHODOLOGIES D'ENTRAÎNEMENT
 * Méthodes scientifiques pour développer les qualités physiques
 */

const MethodologiesDatabase = {
    // ==================== FORCE MAXIMALE ====================
    forceMax: [
        {
            id: 'max-effort-method',
            name: 'Méthode Efforts Maximaux',
            quality: 'force-max',
            description: '1-3 reps à 90-100% 1RM pour gains force pure',
            reps: [1, 3],
            sets: [5, 8],
            intensity: [90, 100],
            rest: [3, 5],
            tempo: '2-1-X-1',
            frequency: 'low',
            references: ['Westside Barbell', 'Louie Simmons']
        },
        {
            id: 'cluster-sets',
            name: 'Clusters Sets',
            quality: 'force-max',
            description: 'Micro-repos entre reps pour maintenir intensité maximale',
            reps: [1, 2],
            sets: [4, 6],
            intensity: [85, 95],
            rest: [2, 4],
            tempo: 'Explosif',
            notes: '10-20sec repos entre chaque rep'
        },
        {
            id: 'isometric-max',
            name: 'Isométrie Maximale',
            quality: 'force-max',
            description: 'Contractions statiques 5-10sec à intensité max',
            duration: [5, 10],
            sets: [4, 6],
            intensity: [90, 100],
            rest: [2, 3],
            angles: ['Point faible', 'Mi-parcours', 'Position forte']
        }
    ],

    // ==================== HYPERTROPHIE ====================
    hypertrophy: [
        {
            id: 'volume-method',
            name: 'Méthode du Volume (German Volume Training)',
            quality: 'hypertrophie',
            description: '10x10 avec charges modérées',
            reps: [10, 10],
            sets: [10, 10],
            intensity: [60, 70],
            rest: [1, 1.5],
            tempo: '3-0-2-0',
            references: ['Charles Poliquin', 'Rolf Feser']
        },
        {
            id: 'tut-method',
            name: 'Méthode TUT (Time Under Tension)',
            quality: 'hypertrophie',
            description: 'Tempo lent pour maximiser tension musculaire',
            reps: [8, 12],
            sets: [3, 5],
            intensity: [65, 75],
            rest: [1.5, 2],
            tempo: '4-0-2-1',
            tut_target: [40, 60]
        },
        {
            id: 'mechanical-advantage',
            name: 'Avantage Mécanique',
            quality: 'hypertrophie',
            description: 'Enchainer variations du plus dur au plus facile',
            example: 'Front Squat → Back Squat → Box Squat',
            reps: [6, 8],
            sets: [3, 4],
            intensity: [75, 85],
            rest: [2, 3]
        }
    ],

    // ==================== PUISSANCE ====================
    power: [
        {
            id: 'olympic-lifts',
            name: 'Mouvements Olympiques',
            quality: 'puissance',
            description: 'Clean, Snatch, Jerk - Triple extension explosive',
            reps: [2, 5],
            sets: [4, 6],
            intensity: [70, 85],
            rest: [2, 3],
            tempo: 'Explosif max',
            exercises: ['Power Clean', 'Hang Snatch', 'Push Jerk']
        },
        {
            id: 'ballistic-training',
            name: 'Entraînement Balistique',
            quality: 'puissance',
            description: 'Projection/lancer de charges',
            reps: [3, 6],
            sets: [4, 6],
            intensity: [30, 50],
            rest: [2, 3],
            exercises: ['Med Ball Slam', 'KB Swing', 'Jump Squat']
        },
        {
            id: 'contrast-loading',
            name: 'Chargement Contrasté (French Contrast)',
            quality: 'puissance',
            description: 'Alternance lourd/explosif/pliométrique',
            sets: [3, 5],
            rest: [3, 5],
            sequence: [
                'Lourd 85-90% (3-5 reps)',
                'Explosif 30-40% (3-5 reps)',
                'Pliométrique (5-8 reps)',
                'Vitesse assistée'
            ]
        }
    ],

    // ==================== EXPLOSIVITÉ ====================
    explosiveness: [
        {
            id: 'reactive-strength',
            name: 'Force Réactive (Pliométrie)',
            quality: 'explosivite',
            description: 'Cycle étirement-raccourcissement rapide',
            reps: [5, 10],
            sets: [3, 6],
            rest: [2, 3],
            contact_time: '<0.25sec',
            exercises: ['Depth Jump', 'Box Jump', 'Hurdle Hops']
        },
        {
            id: 'dynamic-effort',
            name: 'Méthode Efforts Dynamiques',
            quality: 'explosivite',
            description: 'Vitesse maximale avec charges légères',
            reps: [2, 3],
            sets: [8, 12],
            intensity: [50, 70],
            rest: [0.75, 1.5],
            tempo: 'Explosif maximal',
            references: ['Westside Barbell']
        }
    ],

    // ==================== ENDURANCE MUSCULAIRE ====================
    enduranceMusculaire: [
        {
            id: 'high-rep-method',
            name: 'Méthode Séries Longues',
            quality: 'endurance-musculaire',
            description: '15-30 reps avec charges légères',
            reps: [15, 30],
            sets: [3, 5],
            intensity: [40, 60],
            rest: [0.5, 1.5],
            tempo: '2-0-2-0'
        },
        {
            id: 'circuit-training',
            name: 'Circuit Training',
            quality: 'endurance-musculaire',
            description: 'Enchaînement exercices sans repos',
            exercises: '5-8 exercices',
            rounds: [3, 5],
            work_rest: '40-20 ou 45-15',
            rest_between_rounds: [1, 2]
        },
        {
            id: 'amrap',
            name: 'AMRAP (As Many Reps As Possible)',
            quality: 'endurance-musculaire',
            description: 'Maximum reps en temps donné',
            duration: [5, 20],
            intensity: [50, 70],
            rest: 'Aucun ou minimal',
            focus: 'Volume maximal'
        }
    ],

    // ==================== VO2MAX / CAPACITÉ AÉROBIE ====================
    vo2max: [
        {
            id: 'tabata',
            name: 'Tabata (HIIT)',
            quality: 'vo2max',
            description: '20sec all-out / 10sec repos x 8',
            work: 20,
            rest: 10,
            rounds: 8,
            total_time: 4,
            intensity: '170% VO2max',
            references: ['Dr. Izumi Tabata']
        },
        {
            id: 'vo2max-intervals',
            name: 'Intervalles VO2max',
            quality: 'vo2max',
            description: '3-5min @ 95-100% VMA',
            work: [3, 5],
            rest: [2, 3],
            sets: [4, 6],
            intensity: '95-105% VMA',
            total_volume: [12, 24]
        }
    ],

    // ==================== ENDURANCE AÉROBIE ====================
    enduranceAerobie: [
        {
            id: 'lsd-training',
            name: 'LSD (Long Slow Distance)',
            quality: 'endurance-aerobie',
            description: 'Longues sorties Z2 base aérobie',
            duration: [60, 180],
            intensity: [65, 75],
            hr_zone: 'Z2',
            frequency: '1-2x/semaine'
        },
        {
            id: 'tempo-runs',
            name: 'Tempo Runs',
            quality: 'endurance-aerobie',
            description: 'Allure seuil lactique soutenue',
            duration: [20, 40],
            intensity: [80, 88],
            hr_zone: 'Z3-Z4',
            pace: '85-90% VMA'
        }
    ],

    // ==================== VITESSE / SPRINT ====================
    vitesse: [
        {
            id: 'sprint-acceleration',
            name: 'Accélération Sprint',
            quality: 'vitesse',
            description: 'Sprints courts 10-30m départ arrêté',
            distance: [10, 30],
            sets: [6, 10],
            rest: [2, 3],
            recovery: 'Complète entre reps'
        },
        {
            id: 'flying-sprints',
            name: 'Sprints Lancés',
            quality: 'vitesse-max',
            description: '20m accélération + 20m vitesse max',
            build_up: 20,
            max_speed: 20,
            sets: [4, 6],
            rest: [3, 5]
        }
    ],

    // ==================== MOBILITÉ ====================
    mobilite: [
        {
            id: 'dynamic-stretching',
            name: 'Étirements Dynamiques',
            quality: 'mobilite',
            description: 'Mouvements actifs ROM complète',
            duration: [10, 15],
            exercises: "Leg swings, arm circles, world's greatest stretch"
        },
        {
            id: 'static-stretching',
            name: 'Étirements Statiques',
            quality: 'mobilite',
            description: 'Maintien position 30-60sec',
            hold_time: [30, 60],
            sets: [2, 3],
            timing: 'Post-workout uniquement'
        }
    ],

    // ==================== MÉTHODOLOGIES SPÉCIFIQUES SPORTS ====================

    // HYROX
    hyrox: [
        {
            id: 'hyrox-simulation',
            name: 'Simulation HYROX',
            quality: 'hyrox-specific',
            description: 'Enchaînement run + station',
            format: '1km run + station + repeat',
            stations: 8,
            total_distance: '8km',
            focus: 'Transitions rapides'
        },
        {
            id: 'roxzone-training',
            name: 'Entraînement Roxzone',
            quality: 'hyrox-specific',
            description: 'Minimiser temps transitions',
            work: [30, 60],
            rest: [30, 60],
            focus: 'Efficacité changement'
        }
    ],

    // TRAIL
    trail: [
        {
            id: 'hill-repeats',
            name: 'Répétitions Côtes',
            quality: 'trail-specific',
            description: 'Montées répétées avec descente récup',
            duration: [2, 5],
            sets: [6, 12],
            gradient: '6-12%',
            recovery: 'Descente jogging'
        },
        {
            id: 'downhill-running',
            name: 'Travail Descente',
            quality: 'trail-specific',
            description: 'Renforcement excentrique descente',
            duration: [3, 8],
            sets: [3, 6],
            gradient: '-8 à -15%',
            focus: 'Contrôle freinage'
        }
    ]
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MethodologiesDatabase;
} else {
    window.MethodologiesDatabase = MethodologiesDatabase;
}
