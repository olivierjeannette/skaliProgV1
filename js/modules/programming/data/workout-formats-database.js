/**
 * WORKOUT FORMATS DATABASE
 * Base de données complète des formats d'entraînement par sport
 * Utilisé pour générer des séances réelles et variées
 */

const WorkoutFormatsDatabase = {
    /**
     * TRAIL RUNNING - Formats d'entraînement trail
     */
    trail: {
        endurance_fondamentale: {
            name: 'Endurance Fondamentale',
            description: 'Course longue en zone 2, développement base aérobie',
            duration_range: [60, 180],
            rpe: '5-6/10',
            structure: {
                warmup: { duration: 10, description: 'Course très facile progressive' },
                main_work: {
                    duration: 50,
                    methodology: 'Endurance continue',
                    format: 'Course continue zone 2 (60-70% FCmax)',
                    variations: [
                        'Terrain plat',
                        'Terrain vallonné léger',
                        'Sentiers techniques faciles',
                        'Route mixte'
                    ]
                },
                cooldown: { duration: 10, description: 'Retour au calme + étirements légers' }
            }
        },

        seuil_tempo: {
            name: 'Seuil / Tempo',
            description: 'Travail au seuil lactique, amélioration puissance aérobie',
            duration_range: [50, 90],
            rpe: '7-8/10',
            structure: {
                warmup: { duration: 15, description: 'Échauffement progressif avec accélérations' },
                main_work: {
                    duration: 30,
                    methodology: 'Threshold Training',
                    formats: [
                        '3x10min @ seuil (récup 3min)',
                        '2x15min @ seuil (récup 4min)',
                        '4x8min @ seuil (récup 2min)',
                        '20-25min continu @ seuil',
                        '5x6min @ seuil (récup 90s)'
                    ]
                },
                cooldown: { duration: 10, description: 'Retour au calme progressif' }
            }
        },

        fractionné_court: {
            name: 'Fractionné Court (VMA)',
            description: 'Développement vitesse maximale aérobie',
            duration_range: [45, 70],
            rpe: '8-9/10',
            structure: {
                warmup: { duration: 15, description: 'Échauffement + gammes athlétiques' },
                main_work: {
                    duration: 25,
                    methodology: 'VO2max Training',
                    formats: [
                        '12x400m @ 95-100% VMA (récup 1min)',
                        '8x500m @ 90-95% VMA (récup 90s)',
                        '6x800m @ 90% VMA (récup 2min)',
                        '20x200m @ 100% VMA (récup 30s)',
                        '10x300m @ 95% VMA (récup 45s)',
                        "Pyramide: 400-600-800-600-400m (récup = temps d'effort)"
                    ]
                },
                cooldown: { duration: 15, description: 'Retour au calme + étirements' }
            }
        },

        cotes_denivele: {
            name: 'Côtes / Dénivelé',
            description: 'Travail spécifique montée, puissance musculaire',
            duration_range: [50, 90],
            rpe: '7-9/10',
            formats: [
                {
                    name: 'Côtes courtes puissance',
                    format: '10-15x (30s-1min montée explosive + récup descente)',
                    focus: 'Puissance musculaire'
                },
                {
                    name: 'Côtes moyennes',
                    format: '6-8x (3-5min montée @ seuil + récup descente)',
                    focus: 'Endurance de force'
                },
                {
                    name: 'Côtes longues',
                    format: '3-4x (8-15min montée @ tempo + récup descente)',
                    focus: 'Endurance spécifique trail'
                },
                {
                    name: 'Dénivelé cumulé',
                    format: 'Enchaînement montées/descentes pour atteindre D+ cible',
                    focus: 'Volume dénivelé'
                }
            ]
        },

        sortie_longue: {
            name: 'Sortie Longue Spécifique',
            description: 'Longue durée en conditions trail',
            duration_range: [90, 300],
            rpe: '5-7/10',
            variations: [
                'Sortie longue facile (Z2)',
                'Sortie longue progressive (Z2→Z3)',
                'Sortie longue avec blocs tempo',
                'Sortie longue vallonnée',
                'Simulation course (allure objectif)'
            ]
        },

        technique_trail: {
            name: 'Technique Trail',
            description: 'Travail technique descente, agilité, coordination',
            duration_range: [50, 80],
            rpe: '6-8/10',
            exercises: [
                'Descentes techniques répétées',
                'Parcours agilité (slalom, obstacles)',
                'Technique de pied sur rochers/racines',
                'Travail bâtons (si ultra)',
                'Enchaînements montée-descente rapides',
                'Proprioception terrain instable'
            ]
        }
    },

    /**
     * HYROX - Formats spécifiques HYROX
     */
    hyrox: {
        simulation_complete: {
            name: 'Simulation HYROX Complète',
            description: 'Simulation full race ou half',
            duration_range: [60, 120],
            rpe: '8-9/10',
            formats: [
                {
                    name: 'Full Simulation',
                    structure: '8x (1km Run + Station)',
                    stations: [
                        '1000m SkiErg',
                        '50m Sled Push (poids compétition)',
                        '50m Sled Pull',
                        '80m Burpee Broad Jump',
                        '1000m Row',
                        '200m Farmers Carry',
                        '100m Sandbag Lunges',
                        '100 Wall Balls'
                    ]
                },
                {
                    name: 'Half Simulation',
                    structure: '4 stations au choix + courses',
                    duration: 45
                },
                {
                    name: 'Double Station Focus',
                    structure: '4x (1km + 2 stations spécifiques)',
                    focus: 'Renforcer stations faibles'
                }
            ]
        },

        stations_isolees: {
            name: 'Travail Stations Isolées',
            description: 'Technique et puissance par station',
            duration_range: [40, 60],
            rpe: '7-8/10',
            formats: [
                {
                    station: 'SkiErg',
                    workouts: [
                        '5x500m (récup 2min)',
                        '3x1000m (récup 3min)',
                        'EMOM 10: 200-250m SkiErg'
                    ]
                },
                {
                    station: 'Sled',
                    workouts: [
                        '10x50m Push + 50m Pull (récup 2min)',
                        '5 rounds: 2x50m Push, 2x50m Pull',
                        'EMOM 12: min paire 50m Push, min impaire 50m Pull'
                    ]
                },
                {
                    station: 'Burpee Broad Jump',
                    workouts: [
                        '5x80m (temps)',
                        '3 rounds: 40m + 30s récup + 40m',
                        'EMOM 8: 5-7 Burpee Broad Jumps'
                    ]
                },
                {
                    station: 'Row',
                    workouts: [
                        '5x500m @ 1:45-1:50/500m (récup 2min)',
                        '3x1000m @ 1:55-2:00/500m (récup 3min)',
                        '2000m For Time'
                    ]
                },
                {
                    station: 'Farmers Carry',
                    workouts: [
                        '8x200m @ poids compétition',
                        '5 rounds: 50m out + 50m back + 100m walk',
                        'EMOM 10: 50m Farmers Carry'
                    ]
                },
                {
                    station: 'Sandbag Lunges',
                    workouts: [
                        '5x100m lunges',
                        '3 rounds: 50m + 50m',
                        'EMOM 8: 12-15 sandbag lunges'
                    ]
                },
                {
                    station: 'Wall Balls',
                    workouts: [
                        '5x50 reps (récup 2min)',
                        '100-75-50-25 For Time',
                        'EMOM 10: 15-20 Wall Balls'
                    ]
                }
            ]
        },

        metcon_hyrox: {
            name: 'MetCon Style HYROX',
            description: 'Conditionnement métabolique type HYROX',
            duration_range: [30, 50],
            rpe: '8-9/10',
            formats: [
                'AMRAP 20min: 400m Run, 20 Wall Balls, 15 Cal Row, 10 Burpees',
                'For Time: 1km Run, 50 Wall Balls, 1km Row, 50 Burpees, 1km Run',
                '3 Rounds: 800m Run, 250m SkiErg, 50m Sled Push, 30 Wall Balls',
                '5 Rounds: 400m Run, 20 Burpees, 200m Farmers Carry, 15 Wall Balls',
                'Chipper: 2km Run, 1000m Row, 1000m SkiErg, 100 Wall Balls, 100 Burpees'
            ]
        },

        transitions: {
            name: 'Entraînement Transitions',
            description: 'Travail spécifique transitions rapides',
            duration_range: [40, 60],
            rpe: '7-8/10',
            focus: 'Minimiser temps de transition course→station→course',
            formats: [
                '10 rounds: 200m Run → 10 Wall Balls → 200m Run (récup 60s)',
                '8 rounds: 400m Run → Station (30s) → 400m Run',
                'Enchaînement rapide: Course → Position départ station → Exécution → Reprise course'
            ]
        }
    },

    /**
     * CROSSFIT - Formats CrossFit classiques
     */
    crossfit: {
        metcon_classic: {
            name: 'MetCon Classique',
            description: 'Conditionnement métabolique haute intensité',
            duration_range: [10, 30],
            rpe: '8-9/10',
            famous_workouts: [
                { name: 'Fran', format: '21-15-9: Thrusters (43kg), Pull-ups', time_cap: '10min' },
                { name: 'Cindy', format: 'AMRAP 20min: 5 Pull-ups, 10 Push-ups, 15 Air Squats' },
                {
                    name: 'Murph',
                    format: 'For Time: 1mi Run, 100 Pull-ups, 200 Push-ups, 300 Squats, 1mi Run'
                },
                { name: 'Helen', format: '3 Rounds: 400m Run, 21 KBS (24kg), 12 Pull-ups' },
                { name: 'Grace', format: 'For Time: 30 Clean & Jerks (60kg)' },
                { name: 'Isabel', format: 'For Time: 30 Snatches (60kg)' },
                { name: 'Karen', format: 'For Time: 150 Wall Balls (9kg)' },
                { name: 'Diane', format: '21-15-9: Deadlifts (100kg), HSPU' }
            ],
            structures: [
                'AMRAP (As Many Rounds As Possible)',
                'For Time',
                'EMOM (Every Minute On the Minute)',
                'Tabata (20s work / 10s rest x8)',
                'Chipper (liste longue exercices à terminer)',
                'Couplets (2 mouvements)',
                'Triplets (3 mouvements)'
            ]
        },

        strength_work: {
            name: 'Travail de Force',
            description: 'Force maximale et haltérophilie',
            duration_range: [30, 50],
            rpe: '7-8/10',
            programs: [
                {
                    name: 'Force 5x5',
                    structure: '5 sets x 5 reps @ 80-85% 1RM',
                    lifts: [
                        'Back Squat',
                        'Deadlift',
                        'Bench Press',
                        'Overhead Press',
                        'Front Squat'
                    ]
                },
                {
                    name: 'Force 3-3-3-3-3',
                    structure: '5 sets x 3 reps (progression 70%→85% 1RM)'
                },
                {
                    name: 'Olympic Lifting',
                    structure: 'EMOM 12-15: 2-3 reps @ 70-80%',
                    lifts: ['Snatch', 'Clean & Jerk', 'Power Clean', 'Power Snatch']
                },
                {
                    name: 'Heavy Day',
                    structure: 'Find 1RM ou 3RM',
                    description: 'Test force maximale'
                }
            ]
        },

        gymnastics: {
            name: 'Gymnastique CrossFit',
            description: 'Skills et force bodyweight',
            duration_range: [40, 60],
            rpe: '7-8/10',
            skills: [
                'Pull-ups (Strict, Kipping, Butterfly)',
                'Muscle-ups (Ring, Bar)',
                'Handstand Push-ups',
                'Handstand Walk',
                'Toes to Bar',
                'Pistol Squats',
                'Rope Climbs',
                'Ring Dips'
            ],
            formats: [
                'EMOM Progression: augmentation reps chaque minute',
                'Skill Practice: 4x max reps (récup 2min)',
                'Gymnastic Capacity: High volume sub-max',
                'Complexes: enchaînement plusieurs skills'
            ]
        },

        engine_building: {
            name: 'Engine Building (Cardio)',
            description: 'Développement capacité aérobie',
            duration_range: [30, 60],
            rpe: '6-7/10',
            formats: [
                '30-60min Assault Bike Z2',
                '5x5min Row @ seuil (récup 2min)',
                'EMOM 20: min 1 Bike, min 2 Row, min 3 SkiErg, min 4 Run',
                'Chipper cardio: 3000m Row, 2000m Ski, 1000m Run',
                '3 Rounds: 10 Cal Bike, 15 Cal Row, 20 Cal Ski (récup 3min)'
            ]
        }
    },

    /**
     * MUSCULATION / BUILD - Hypertrophie
     */
    build: {
        push: {
            name: 'Push (Pecs/Épaules/Triceps)',
            description: 'Séance poussée haut du corps',
            duration_range: [60, 90],
            rpe: '7-8/10',
            structure: {
                main_lift: {
                    exercises: ['Bench Press', 'Incline Press', 'Overhead Press'],
                    sets_reps: '4x6-8 @ 75-80% 1RM'
                },
                accessories: [
                    'Incline DB Press: 3x10-12',
                    'DB Flyes: 3x12-15',
                    'Lateral Raises: 3x12-15',
                    'Triceps Pushdowns: 3x12-15',
                    'Overhead Triceps Extension: 3x10-12'
                ]
            },
            splits: ['Chest focus', 'Shoulder focus', 'Chest+Triceps', 'Shoulders+Triceps']
        },

        pull: {
            name: 'Pull (Dos/Biceps)',
            description: 'Séance traction haut du corps',
            duration_range: [60, 90],
            rpe: '7-8/10',
            structure: {
                main_lift: {
                    exercises: ['Deadlift', 'Barbell Row', 'Pull-ups'],
                    sets_reps: '4x6-8 @ 75-80% 1RM'
                },
                accessories: [
                    'Lat Pulldowns: 3x10-12',
                    'Cable Rows: 3x12',
                    'Face Pulls: 3x15-20',
                    'Barbell Curls: 3x10-12',
                    'Hammer Curls: 3x12'
                ]
            }
        },

        legs: {
            name: 'Legs (Jambes complètes)',
            description: 'Séance jambes hypertrophie',
            duration_range: [60, 90],
            rpe: '8-9/10',
            structure: {
                main_lift: {
                    exercises: ['Back Squat', 'Front Squat', 'Deadlift'],
                    sets_reps: '4x6-8 @ 75-80% 1RM'
                },
                accessories: [
                    'Bulgarian Split Squats: 3x10 chaque jambe',
                    'Leg Press: 3x12-15',
                    'Romanian Deadlifts: 3x10',
                    'Leg Curls: 3x12',
                    'Leg Extensions: 3x15',
                    'Calf Raises: 4x15-20'
                ]
            }
        },

        upper_lower: {
            name: 'Upper/Lower Split',
            description: 'Split haut/bas du corps',
            formats: {
                upper_a: 'Pecs/Dos (Push+Pull horizontal)',
                upper_b: 'Épaules/Bras (Push+Pull vertical)',
                lower_a: 'Squat dominant',
                lower_b: 'Hinge dominant (Deadlift, RDL)'
            }
        },

        ppl: {
            name: 'Push/Pull/Legs 6 jours',
            description: 'Split classique PPL',
            schedule: [
                'Jour 1: Push A',
                'Jour 2: Pull A',
                'Jour 3: Legs A',
                'Jour 4: Push B',
                'Jour 5: Pull B',
                'Jour 6: Legs B',
                'Jour 7: Repos'
            ]
        }
    },

    /**
     * Helper: Obtenir format aléatoire pour un sport/type
     * @param sport
     * @param workoutType
     */
    getRandomFormat(sport, workoutType) {
        if (!this[sport] || !this[sport][workoutType]) {
            return null;
        }

        const format = this[sport][workoutType];

        // Si le format a des variations/formats multiples, en choisir un
        if (format.formats && Array.isArray(format.formats)) {
            return format.formats[Math.floor(Math.random() * format.formats.length)];
        }

        if (format.famous_workouts && Array.isArray(format.famous_workouts)) {
            return format.famous_workouts[
                Math.floor(Math.random() * format.famous_workouts.length)
            ];
        }

        return format;
    },

    /**
     * Helper: Obtenir tous les types de séances pour un sport
     * @param sport
     */
    getWorkoutTypesForSport(sport) {
        if (!this[sport]) {
            return [];
        }

        return Object.keys(this[sport]).map(key => ({
            id: key,
            name: this[sport][key].name,
            description: this[sport][key].description,
            rpe: this[sport][key].rpe,
            duration_range: this[sport][key].duration_range
        }));
    },

    /**
     * Helper: Créer séance depuis format
     * @param sport
     * @param workoutType
     * @param customParams
     */
    createSessionFromFormat(sport, workoutType, customParams = {}) {
        const format = this.getRandomFormat(sport, workoutType);
        if (!format) {
            return null;
        }

        const baseFormat = this[sport][workoutType];

        return {
            title: customParams.title || baseFormat.name,
            type: workoutType,
            duration_minutes: customParams.duration || baseFormat.duration_range[0],
            rpe_target: baseFormat.rpe,
            sport: sport,
            format_data: format,
            structure: baseFormat.structure || {},
            description: baseFormat.description,
            ...customParams
        };
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkoutFormatsDatabase;
} else {
    window.WorkoutFormatsDatabase = WorkoutFormatsDatabase;
}
