/**
 * CROSSFIT TRAINING DATABASE
 * Base de données complète pour l'entraînement CrossFit
 *
 * Standards internationaux basés sur:
 * - CrossFit Games standards
 * - Mayhem Athlete Programming
 * - CompTrain methodology
 * - Invictus Performance
 * - Ben Bergeron coaching philosophy
 */

const CrossFitDatabase = {
    sport: 'crossfit',
    name: 'CrossFit',
    description: 'Constantly varied functional movements performed at high intensity',

    /**
     * ZONES D'INTENSITÉ CROSSFIT
     */
    zones: {
        z1_recovery: {
            name: 'Récupération Active',
            intensity: '50-60% FCmax',
            rpe: '2-3/10',
            purpose: 'Active recovery, technique work',
            lactate: '< 2 mmol/L',
            duration_typical: '20-40min',
            examples: ['Easy row', 'Light bike', 'Skill practice']
        },
        z2_aerobic: {
            name: 'Capacité Aérobie',
            intensity: '60-70% FCmax',
            rpe: '4-5/10',
            purpose: 'Build aerobic base, mitochondrial density',
            lactate: '2-3 mmol/L',
            duration_typical: '30-90min',
            examples: ['Chipper WODs', 'Long EMOM', 'Sustained pace work']
        },
        z3_tempo: {
            name: 'Tempo / Threshold',
            intensity: '70-80% FCmax',
            rpe: '6-7/10',
            purpose: 'Lactate threshold, sustained intensity',
            lactate: '3-4 mmol/L',
            duration_typical: '15-30min',
            examples: ['21-15-9 schemes', 'Moderate MetCons', 'Interval work']
        },
        z4_vo2max: {
            name: 'VO2max',
            intensity: '80-90% FCmax',
            rpe: '8-9/10',
            purpose: 'Max aerobic capacity, high intensity',
            lactate: '4-7 mmol/L',
            duration_typical: '8-20min',
            examples: ['Fran', 'Heavy MetCons', 'Sprint intervals']
        },
        z5_anaerobic: {
            name: 'Puissance Anaérobie',
            intensity: '90-100% FCmax',
            rpe: '9-10/10',
            purpose: 'Max power output, sprint capacity',
            lactate: '> 7 mmol/L',
            duration_typical: '30s-8min',
            examples: ['Max effort sprints', '1RM attempts', 'All-out efforts']
        }
    },

    /**
     * TYPES DE SÉANCES CROSSFIT
     */
    sessionTypes: {
        /**
         * 1. METCON (Metabolic Conditioning)
         */
        metcon: {
            name: 'MetCon',
            category: 'conditioning',
            description: 'High-intensity metabolic conditioning workouts',

            ppg: {
                beginner: {
                    duration: [20, 30],
                    rpe: '6-7/10',
                    frequency_per_week: 3,
                    sessions: [
                        {
                            name: 'Cindy (Scaled)',
                            duration: 20,
                            format: 'AMRAP',
                            structure: {
                                warmup: {
                                    duration_minutes: 10,
                                    exercises: [
                                        { name: 'Row easy', duration: '5min', calories: 40 },
                                        { name: 'Air squats', reps: 10 },
                                        { name: 'Ring rows', reps: 10 },
                                        { name: 'Push-ups (knee)', reps: 10 },
                                        { name: 'Mobility: shoulders + hips', duration: '3min' }
                                    ]
                                },
                                main_work: {
                                    title: 'AMRAP 20min',
                                    rounds: 'As many rounds as possible',
                                    exercises: [
                                        { name: 'Pull-ups (ring rows)', reps: 5 },
                                        { name: 'Push-ups (knee or box)', reps: 10 },
                                        { name: 'Air squats', reps: 15 }
                                    ],
                                    target: '12-15 rounds',
                                    scaling: 'Ring rows instead of pull-ups, knee push-ups'
                                },
                                cooldown: {
                                    duration_minutes: 5,
                                    exercises: [
                                        { name: 'Walk/easy bike', duration: '3min' },
                                        { name: 'Static stretching', duration: '2min' }
                                    ]
                                }
                            },
                            notes: 'Focus on consistent pace, maintain form'
                        },
                        {
                            name: 'Basic Chipper',
                            duration: 25,
                            format: 'For Time',
                            structure: {
                                warmup: {
                                    duration_minutes: 10,
                                    exercises: [
                                        { name: 'Row', duration: '5min', easy_pace: true },
                                        { name: 'Movement prep', duration: '5min' }
                                    ]
                                },
                                main_work: {
                                    title: 'For Time (20min cap)',
                                    exercises: [
                                        { name: 'Cal Row', reps: 30 },
                                        { name: 'Wall balls (10/6lb)', reps: 40 },
                                        { name: 'Box step-ups (20")', reps: 50 },
                                        { name: 'Kettlebell swings (light)', reps: 60 },
                                        { name: 'Sit-ups', reps: 70 }
                                    ],
                                    target_time: '15-18min',
                                    strategy: 'Steady pace, small breaks'
                                },
                                cooldown: {
                                    duration_minutes: 5,
                                    exercises: [
                                        { name: 'Easy walk', duration: '3min' },
                                        { name: 'Stretch', duration: '2min' }
                                    ]
                                }
                            }
                        }
                    ]
                },
                intermediate: {
                    duration: [25, 35],
                    rpe: '7-8/10',
                    frequency_per_week: 4,
                    sessions: [
                        {
                            name: 'Fran (RX)',
                            duration: 30,
                            format: 'For Time',
                            structure: {
                                warmup: {
                                    duration_minutes: 15,
                                    exercises: [
                                        { name: 'Row', duration: '5min', moderate: true },
                                        {
                                            name: 'Barbell warmup',
                                            sets: 3,
                                            reps: '5-3-1',
                                            weight_progression: true
                                        },
                                        { name: 'Pull-up practice', reps: 10 },
                                        { name: 'Thrusters light', reps: 15 }
                                    ]
                                },
                                main_work: {
                                    title: 'Fran - 21-15-9',
                                    rounds: [21, 15, 9],
                                    exercises: [
                                        {
                                            name: 'Thrusters',
                                            weight_m: '95lb (43kg)',
                                            weight_f: '65lb (29kg)'
                                        },
                                        { name: 'Pull-ups', variation: 'Kipping allowed' }
                                    ],
                                    target_time: '6-10min',
                                    strategy: 'Break early: 21 (11-10), 15 (8-7), 9 (5-4)',
                                    benchmark:
                                        'Elite: < 3min, Advanced: 3-5min, Intermediate: 5-8min'
                                },
                                cooldown: {
                                    duration_minutes: 10,
                                    exercises: [
                                        { name: 'Walk', duration: '5min' },
                                        { name: 'Lat + shoulder stretch', duration: '5min' }
                                    ]
                                }
                            },
                            notes: 'Classic benchmark. Go out hard but sustainable.'
                        },
                        {
                            name: 'DT',
                            duration: 35,
                            format: 'For Time',
                            structure: {
                                warmup: {
                                    duration_minutes: 15,
                                    exercises: [
                                        { name: 'Row', duration: '5min' },
                                        { name: 'Barbell complex warmup', sets: 3 },
                                        {
                                            name: 'Deadlift + hang clean + push press',
                                            reps: 5,
                                            weight: 'empty bar then build'
                                        }
                                    ]
                                },
                                main_work: {
                                    title: 'DT - 5 Rounds For Time',
                                    rounds: 5,
                                    exercises: [
                                        {
                                            name: 'Deadlift',
                                            reps: 12,
                                            weight_m: '155lb (70kg)',
                                            weight_f: '105lb (48kg)'
                                        },
                                        { name: 'Hang power cleans', reps: 9, weight: 'same' },
                                        { name: 'Push jerks', reps: 6, weight: 'same' }
                                    ],
                                    target_time: '10-15min',
                                    strategy:
                                        'Touch-n-go deadlifts, quick singles on cleans/jerks if needed',
                                    benchmark: 'Elite: < 6min, Advanced: 6-10min'
                                },
                                cooldown: {
                                    duration_minutes: 10,
                                    exercises: [
                                        { name: 'Easy bike', duration: '5min' },
                                        { name: 'Full body stretch', duration: '5min' }
                                    ]
                                }
                            }
                        }
                    ]
                },
                advanced: {
                    duration: [30, 45],
                    rpe: '8-9/10',
                    frequency_per_week: 5,
                    sessions: [
                        {
                            name: 'Murph (RX)',
                            duration: 60,
                            format: 'For Time',
                            structure: {
                                warmup: {
                                    duration_minutes: 15,
                                    exercises: [
                                        { name: 'Run', duration: '5min', easy: true },
                                        { name: 'Pull-ups', reps: 10 },
                                        { name: 'Push-ups', reps: 15 },
                                        { name: 'Air squats', reps: 20 },
                                        { name: 'Vest adjustment', note: '20lb/14lb vest' }
                                    ]
                                },
                                main_work: {
                                    title: 'Murph - For Time',
                                    structure_order: [
                                        { exercise: 'Run', distance: '1 mile', note: 'With vest' },
                                        {
                                            exercise: 'Pull-ups',
                                            reps: 100,
                                            partitioning: 'Recommend 20 rounds of 5-10-15'
                                        },
                                        {
                                            exercise: 'Push-ups',
                                            reps: 200,
                                            partitioning: 'Same partition'
                                        },
                                        {
                                            exercise: 'Air squats',
                                            reps: 300,
                                            partitioning: 'Same partition'
                                        },
                                        { exercise: 'Run', distance: '1 mile', note: 'With vest' }
                                    ],
                                    target_time: '45-55min',
                                    strategy:
                                        'Partition: 20 rounds of (5 pull-ups, 10 push-ups, 15 squats)',
                                    benchmark: 'Elite: < 35min, Advanced: 35-45min, Good: 45-55min'
                                },
                                cooldown: {
                                    duration_minutes: 10,
                                    exercises: [
                                        { name: 'Walk', duration: '5min' },
                                        { name: 'Full body mobility', duration: '5min' }
                                    ]
                                }
                            },
                            notes: 'Memorial Day hero WOD. Pace conservatively, this is long.'
                        },
                        {
                            name: 'Heavy Chipper Pro',
                            duration: 40,
                            format: 'For Time',
                            structure: {
                                warmup: {
                                    duration_minutes: 12,
                                    exercises: [
                                        { name: 'Row', duration: '5min' },
                                        { name: 'Movement prep all exercises', duration: '7min' }
                                    ]
                                },
                                main_work: {
                                    title: 'For Time (30min cap)',
                                    exercises: [
                                        { name: 'Calorie row', reps: 50 },
                                        {
                                            name: 'Deadlifts',
                                            reps: 40,
                                            weight_m: '225lb (102kg)',
                                            weight_f: '155lb (70kg)'
                                        },
                                        {
                                            name: 'Wall balls',
                                            reps: 30,
                                            weight_m: '20lb',
                                            weight_f: '14lb'
                                        },
                                        { name: 'Chest-to-bar pull-ups', reps: 20 },
                                        { name: 'Handstand push-ups', reps: 10 }
                                    ],
                                    target_time: '20-25min',
                                    strategy: 'Smooth transitions, controlled breathing'
                                },
                                cooldown: {
                                    duration_minutes: 8,
                                    exercises: [
                                        { name: 'Bike easy', duration: '5min' },
                                        {
                                            name: 'Stretch priority: shoulders, hamstrings',
                                            duration: '3min'
                                        }
                                    ]
                                }
                            }
                        }
                    ]
                },
                elite: {
                    duration: [35, 60],
                    rpe: '9-10/10',
                    frequency_per_week: 6,
                    sessions: [
                        {
                            name: 'Games-Style Triplet',
                            duration: 50,
                            format: 'For Time',
                            structure: {
                                warmup: {
                                    duration_minutes: 15,
                                    exercises: [
                                        { name: 'Assault bike', duration: '5min', building: true },
                                        {
                                            name: 'Barbell complex',
                                            sets: 3,
                                            weight: 'build to working'
                                        },
                                        { name: 'Muscle-up skill work', reps: 5 }
                                    ]
                                },
                                main_work: {
                                    title: '3 Rounds For Time',
                                    rounds: 3,
                                    exercises: [
                                        { name: 'Calorie assault bike', reps: 30 },
                                        { name: 'Bar muscle-ups', reps: 20 },
                                        {
                                            name: 'Squat snatches',
                                            reps: 10,
                                            weight_m: '135lb (61kg)',
                                            weight_f: '95lb (43kg)'
                                        }
                                    ],
                                    target_time: '15-20min',
                                    strategy:
                                        'Bike hard but save legs for snatches. Quick singles on muscle-ups.',
                                    benchmark: 'Games level: < 12min, Elite: 12-15min'
                                },
                                cooldown: {
                                    duration_minutes: 10,
                                    exercises: [
                                        { name: 'Row easy', duration: '5min' },
                                        { name: 'Thoracic + shoulder mobility', duration: '5min' }
                                    ]
                                }
                            },
                            notes: 'Games-level intensity. Attack the bike, manage muscle-ups, smooth snatches.'
                        },
                        {
                            name: 'Amanda (RX+)',
                            duration: 45,
                            format: 'For Time',
                            structure: {
                                warmup: {
                                    duration_minutes: 15,
                                    exercises: [
                                        { name: 'Row', duration: '5min' },
                                        { name: 'Snatch skill', sets: 5, weight: 'build' },
                                        { name: 'Muscle-up practice', reps: 10 }
                                    ]
                                },
                                main_work: {
                                    title: 'Amanda - 9-7-5',
                                    rounds: [9, 7, 5],
                                    exercises: [
                                        {
                                            name: 'Squat snatches',
                                            weight_m: '135lb (61kg)',
                                            weight_f: '95lb (43kg)'
                                        },
                                        { name: 'Ring muscle-ups' }
                                    ],
                                    target_time: '4-6min',
                                    strategy:
                                        'Touch-n-go snatches if possible, quick singles on MUs',
                                    benchmark: 'Games: < 3min, Elite: 3-5min, Advanced: 5-7min'
                                },
                                cooldown: {
                                    duration_minutes: 10,
                                    exercises: [
                                        { name: 'Bike', duration: '5min' },
                                        { name: 'Full body stretch', duration: '5min' }
                                    ]
                                }
                            }
                        }
                    ]
                }
            },

            ppo: {
                beginner: {
                    duration: [25, 35],
                    rpe: '7/10',
                    sessions: [
                        {
                            name: 'Karen (Scaled)',
                            duration: 30,
                            format: 'For Time',
                            structure: {
                                warmup: {
                                    duration_minutes: 12,
                                    exercises: [
                                        { name: 'Row/bike', duration: '5min' },
                                        { name: 'Wall ball practice', reps: 20, weight: 'light' },
                                        { name: 'Squat mobility', duration: '3min' }
                                    ]
                                },
                                main_work: {
                                    title: 'Karen - 150 Wall Balls For Time',
                                    exercises: [
                                        {
                                            name: 'Wall balls',
                                            reps: 150,
                                            weight_m: '14lb',
                                            weight_f: '10lb',
                                            target: '9ft'
                                        }
                                    ],
                                    target_time: '12-15min',
                                    strategy: 'Sets of 15-20, short breaks',
                                    benchmark: 'Good finish: < 15min'
                                },
                                cooldown: {
                                    duration_minutes: 8,
                                    exercises: [
                                        { name: 'Walk', duration: '5min' },
                                        { name: 'Leg + shoulder stretch', duration: '3min' }
                                    ]
                                }
                            }
                        }
                    ]
                },
                intermediate: {
                    duration: [30, 40],
                    rpe: '8/10',
                    sessions: [
                        {
                            name: 'Grace (RX)',
                            duration: 35,
                            format: 'For Time',
                            structure: {
                                warmup: {
                                    duration_minutes: 15,
                                    exercises: [
                                        { name: 'Row', duration: '5min' },
                                        {
                                            name: 'Clean progression',
                                            sets: 5,
                                            weight: 'build to working'
                                        },
                                        { name: 'Wrist mobility', duration: '2min' }
                                    ]
                                },
                                main_work: {
                                    title: 'Grace - 30 Clean & Jerks For Time',
                                    exercises: [
                                        {
                                            name: 'Clean and jerk',
                                            reps: 30,
                                            weight_m: '135lb (61kg)',
                                            weight_f: '95lb (43kg)'
                                        }
                                    ],
                                    target_time: '5-8min',
                                    strategy: 'Fast singles or small touch-n-go sets (3-5 reps)',
                                    benchmark:
                                        'Elite: < 2min, Advanced: 2-4min, Intermediate: 4-6min'
                                },
                                cooldown: {
                                    duration_minutes: 10,
                                    exercises: [
                                        { name: 'Bike easy', duration: '5min' },
                                        { name: 'Wrist + shoulder stretch', duration: '5min' }
                                    ]
                                }
                            },
                            notes: 'Classic benchmark. Quick singles or touch-n-go if you can sustain.'
                        }
                    ]
                },
                advanced: {
                    duration: [35, 50],
                    rpe: '9/10',
                    sessions: [
                        {
                            name: 'Isabel (RX)',
                            duration: 40,
                            format: 'For Time',
                            structure: {
                                warmup: {
                                    duration_minutes: 15,
                                    exercises: [
                                        { name: 'Row', duration: '5min' },
                                        {
                                            name: 'Snatch skill work',
                                            sets: 8,
                                            weight: 'build to 135/95'
                                        }
                                    ]
                                },
                                main_work: {
                                    title: 'Isabel - 30 Snatches For Time',
                                    exercises: [
                                        {
                                            name: 'Snatch',
                                            reps: 30,
                                            weight_m: '135lb (61kg)',
                                            weight_f: '95lb (43kg)'
                                        }
                                    ],
                                    target_time: '3-5min',
                                    strategy: 'Touch-n-go sets: 10-10-10 or 15-10-5',
                                    benchmark: 'Elite: < 2min, Advanced: 2-3min, Good: 3-5min'
                                },
                                cooldown: {
                                    duration_minutes: 10,
                                    exercises: [
                                        { name: 'Bike', duration: '5min' },
                                        { name: 'Shoulder + hip mobility', duration: '5min' }
                                    ]
                                }
                            }
                        }
                    ]
                },
                elite: {
                    duration: [40, 60],
                    rpe: '10/10',
                    sessions: [
                        {
                            name: 'Double Grace',
                            duration: 50,
                            format: 'For Time',
                            structure: {
                                warmup: {
                                    duration_minutes: 15,
                                    exercises: [
                                        { name: 'Assault bike', duration: '5min', building: true },
                                        {
                                            name: 'Clean and jerk complex',
                                            sets: 5,
                                            weight: 'build to 185/135'
                                        }
                                    ]
                                },
                                main_work: {
                                    title: 'Double Grace - 60 Clean & Jerks For Time',
                                    exercises: [
                                        {
                                            name: 'Clean and jerk',
                                            reps: 60,
                                            weight_m: '185lb (84kg)',
                                            weight_f: '135lb (61kg)'
                                        }
                                    ],
                                    target_time: '8-12min',
                                    strategy: 'Fast singles. Mental game is key.',
                                    benchmark: 'Games level: < 6min, Elite: 6-10min'
                                },
                                cooldown: {
                                    duration_minutes: 10,
                                    exercises: [
                                        { name: 'Row easy', duration: '5min' },
                                        { name: 'Full body mobility', duration: '5min' }
                                    ]
                                }
                            },
                            notes: 'Brutal. Twice the volume of Grace with heavier weight.'
                        }
                    ]
                }
            },

            pps: {
                all_levels: {
                    description:
                        'Competition preparation - varied intensity based on proximity to event',
                    sessions: [
                        {
                            name: 'Competition Simulation',
                            duration: 60,
                            structure: {
                                warmup: { duration_minutes: 15 },
                                main_work: {
                                    title: 'Simulate competition day',
                                    workouts: [
                                        {
                                            time: '9:00',
                                            workout: 'Event 1 practice',
                                            rest: '30min'
                                        },
                                        { time: '10:00', workout: 'Event 2 practice', rest: '2hr' },
                                        { time: '13:00', workout: 'Event 3 practice' }
                                    ],
                                    notes: 'Practice transitions, nutrition timing, mental preparation'
                                },
                                cooldown: { duration_minutes: 15 }
                            }
                        }
                    ]
                }
            }
        },

        /**
         * 2. STRENGTH
         */
        strength: {
            name: 'Strength',
            category: 'strength',
            description: 'Barbell strength development',

            ppg: {
                beginner: {
                    duration: [45, 60],
                    rpe: '6-7/10',
                    sessions: [
                        {
                            name: 'Basic Barbell Strength',
                            duration: 50,
                            structure: {
                                warmup: {
                                    duration_minutes: 15,
                                    exercises: [
                                        { name: 'Row', duration: '5min' },
                                        { name: 'Empty bar work', sets: 3, reps: 10 },
                                        {
                                            name: 'Mobility: ankles, hips, thoracic',
                                            duration: '5min'
                                        }
                                    ]
                                },
                                main_work: {
                                    exercises: [
                                        {
                                            name: 'Back squat',
                                            sets: 5,
                                            reps: 5,
                                            intensity: '70-75% 1RM',
                                            rest: '3min',
                                            progression: 'Add 5lb per week'
                                        },
                                        {
                                            name: 'Bench press',
                                            sets: 5,
                                            reps: 5,
                                            intensity: '70-75% 1RM',
                                            rest: '3min'
                                        },
                                        {
                                            name: 'Accessory: DB rows',
                                            sets: 3,
                                            reps: 10,
                                            rest: '90s'
                                        }
                                    ]
                                },
                                cooldown: {
                                    duration_minutes: 5,
                                    exercises: [{ name: 'Stretch', duration: '5min' }]
                                }
                            }
                        }
                    ]
                },
                intermediate: {
                    duration: [60, 75],
                    rpe: '7-8/10',
                    sessions: [
                        {
                            name: 'Texas Method Style',
                            duration: 70,
                            structure: {
                                warmup: {
                                    duration_minutes: 15,
                                    exercises: [
                                        { name: 'Bike', duration: '5min' },
                                        { name: 'Barbell warmup', sets: 5, weight: 'build' }
                                    ]
                                },
                                main_work: {
                                    title: 'Volume Day',
                                    exercises: [
                                        {
                                            name: 'Back squat',
                                            sets: 5,
                                            reps: 5,
                                            intensity: '80-85% 1RM',
                                            rest: '3-4min'
                                        },
                                        {
                                            name: 'Deadlift',
                                            sets: 3,
                                            reps: 5,
                                            intensity: '75-80% 1RM',
                                            rest: '3min'
                                        },
                                        {
                                            name: 'Strict press',
                                            sets: 5,
                                            reps: 5,
                                            intensity: '75% 1RM',
                                            rest: '2min'
                                        }
                                    ]
                                },
                                cooldown: {
                                    duration_minutes: 10,
                                    exercises: [{ name: 'Mobility work', duration: '10min' }]
                                }
                            }
                        }
                    ]
                },
                advanced: {
                    duration: [75, 90],
                    rpe: '8-9/10',
                    sessions: [
                        {
                            name: 'Wendler 5/3/1 Template',
                            duration: 85,
                            structure: {
                                warmup: {
                                    duration_minutes: 15,
                                    exercises: [
                                        { name: 'General warmup', duration: '5min' },
                                        {
                                            name: 'Specific warmup',
                                            sets: 5,
                                            weight: 'build to working'
                                        }
                                    ]
                                },
                                main_work: {
                                    title: 'Week 1: 5/5/5+',
                                    exercises: [
                                        {
                                            name: 'Squat or Deadlift',
                                            set1: { reps: 5, intensity: '65% training max' },
                                            set2: { reps: 5, intensity: '75% training max' },
                                            set3: {
                                                reps: '5+',
                                                intensity: '85% training max',
                                                note: 'AMRAP'
                                            },
                                            rest: '3-5min'
                                        },
                                        {
                                            name: 'Accessory work',
                                            exercises: [
                                                {
                                                    name: 'BBB: same lift',
                                                    sets: 5,
                                                    reps: 10,
                                                    intensity: '50%'
                                                },
                                                { name: 'Core work', sets: 3 }
                                            ]
                                        }
                                    ]
                                },
                                cooldown: {
                                    duration_minutes: 10,
                                    exercises: [{ name: 'Mobility', duration: '10min' }]
                                }
                            },
                            notes: '4-week cycle: Week 1 (5/5/5+), Week 2 (3/3/3+), Week 3 (5/3/1+), Week 4 (deload)'
                        }
                    ]
                },
                elite: {
                    duration: [90, 120],
                    rpe: '9/10',
                    sessions: [
                        {
                            name: 'Conjugate Method',
                            duration: 105,
                            structure: {
                                warmup: {
                                    duration_minutes: 20,
                                    exercises: [
                                        { name: 'General warmup', duration: '10min' },
                                        { name: 'Movement prep', duration: '10min' }
                                    ]
                                },
                                main_work: {
                                    title: 'Max Effort Lower',
                                    max_effort: {
                                        exercise: 'Box squat or variation',
                                        work_up_to: '1RM',
                                        time_limit: '20min',
                                        note: 'Rotate exercises every 1-3 weeks'
                                    },
                                    supplemental: {
                                        exercises: [
                                            {
                                                name: 'Good mornings',
                                                sets: 4,
                                                reps: 8,
                                                intensity: 'moderate'
                                            },
                                            {
                                                name: 'Bulgarian split squats',
                                                sets: 3,
                                                reps: 10,
                                                per_leg: true
                                            },
                                            { name: 'Glute-ham raise', sets: 3, reps: 10 },
                                            { name: 'Abs', sets: 4, reps: 15 }
                                        ]
                                    }
                                },
                                cooldown: {
                                    duration_minutes: 15,
                                    exercises: [{ name: 'Full body mobility', duration: '15min' }]
                                }
                            },
                            notes: 'Westside Barbell style. Rotate max effort exercises weekly.'
                        }
                    ]
                }
            },

            ppo: {
                all_levels: {
                    description:
                        'Competition specific strength - maintain while increasing MetCon volume',
                    sessions: [
                        {
                            name: 'Maintenance Strength',
                            structure: {
                                main_work: {
                                    exercises: [
                                        {
                                            name: 'Main lift',
                                            sets: 3,
                                            reps: 3,
                                            intensity: '85-90% 1RM'
                                        },
                                        {
                                            name: 'Minimal accessories',
                                            sets: 2,
                                            note: "Maintain, don't build"
                                        }
                                    ]
                                }
                            }
                        }
                    ]
                }
            },

            pps: {
                all_levels: {
                    description: 'Taper - Reduce volume, maintain intensity',
                    sessions: [
                        {
                            name: 'Strength Taper',
                            structure: {
                                main_work: {
                                    exercises: [
                                        {
                                            name: 'Main lift',
                                            sets: 2,
                                            reps: 2,
                                            intensity: '90% 1RM',
                                            note: 'Feel good'
                                        },
                                        { name: 'No accessories', note: 'Rest and recover' }
                                    ]
                                }
                            }
                        }
                    ]
                }
            }
        },

        /**
         * 3. OLYMPIC WEIGHTLIFTING
         */
        olympic_weightlifting: {
            name: 'Olympic Weightlifting',
            category: 'weightlifting',
            description: 'Snatch and clean & jerk technique and strength',

            ppg: {
                beginner: {
                    duration: [60, 75],
                    rpe: '6-7/10',
                    sessions: [
                        {
                            name: 'Basic Oly Technique',
                            duration: 65,
                            structure: {
                                warmup: {
                                    duration_minutes: 15,
                                    exercises: [
                                        { name: 'Burgener warmup', sets: 2 },
                                        {
                                            name: 'Snatch balance',
                                            sets: 3,
                                            reps: 5,
                                            weight: 'PVC/empty bar'
                                        },
                                        { name: 'Overhead squat', sets: 3, reps: 5 }
                                    ]
                                },
                                main_work: {
                                    exercises: [
                                        {
                                            name: 'Power snatch',
                                            sets: 5,
                                            reps: 3,
                                            intensity: '60-70% 1RM',
                                            rest: '2min',
                                            focus: 'Speed and technique'
                                        },
                                        {
                                            name: 'Hang power clean',
                                            sets: 5,
                                            reps: 3,
                                            intensity: '65-75% 1RM',
                                            rest: '2min'
                                        },
                                        {
                                            name: 'Front squat',
                                            sets: 3,
                                            reps: 5,
                                            intensity: '70% 1RM',
                                            rest: '2min'
                                        }
                                    ]
                                },
                                cooldown: {
                                    duration_minutes: 10,
                                    exercises: [
                                        { name: 'Wrist + ankle mobility', duration: '5min' },
                                        { name: 'Thoracic extension', duration: '5min' }
                                    ]
                                }
                            }
                        }
                    ]
                },
                intermediate: {
                    duration: [75, 90],
                    rpe: '7-8/10',
                    sessions: [
                        {
                            name: 'Snatch Complex Work',
                            duration: 80,
                            structure: {
                                warmup: {
                                    duration_minutes: 20,
                                    exercises: [
                                        { name: 'Snatch warmup progression', duration: '10min' },
                                        {
                                            name: 'Build to working weight',
                                            sets: 5,
                                            weight: 'progressive'
                                        }
                                    ]
                                },
                                main_work: {
                                    exercises: [
                                        {
                                            name: 'Snatch complex',
                                            complex: 'Power snatch + Snatch + Overhead squat',
                                            sets: 5,
                                            reps: '1+1+1',
                                            intensity: '75-85% 1RM snatch',
                                            rest: '3min'
                                        },
                                        {
                                            name: 'Snatch pull',
                                            sets: 4,
                                            reps: 3,
                                            intensity: '100-110% 1RM snatch',
                                            rest: '2min'
                                        },
                                        {
                                            name: 'Overhead squat',
                                            sets: 3,
                                            reps: 3,
                                            intensity: '80% 1RM',
                                            rest: '2min'
                                        }
                                    ]
                                },
                                cooldown: {
                                    duration_minutes: 10,
                                    exercises: [{ name: 'Mobility', duration: '10min' }]
                                }
                            }
                        }
                    ]
                },
                advanced: {
                    duration: [90, 105],
                    rpe: '8-9/10',
                    sessions: [
                        {
                            name: 'Competition Lifts Heavy',
                            duration: 100,
                            structure: {
                                warmup: {
                                    duration_minutes: 25,
                                    exercises: [
                                        { name: 'General prep', duration: '10min' },
                                        { name: 'Build to opener', sets: 8, weight: 'progressive' }
                                    ]
                                },
                                main_work: {
                                    exercises: [
                                        {
                                            name: 'Snatch',
                                            protocol: 'Work up to heavy single',
                                            sets: '8-12',
                                            target: '90-95% 1RM',
                                            rest: '3-4min'
                                        },
                                        {
                                            name: 'Clean and jerk',
                                            protocol: 'Work up to heavy single',
                                            sets: '8-12',
                                            target: '90-95% 1RM',
                                            rest: '3-4min'
                                        },
                                        {
                                            name: 'Back squat',
                                            sets: 3,
                                            reps: 3,
                                            intensity: '85% 1RM',
                                            rest: '3min'
                                        }
                                    ]
                                },
                                cooldown: {
                                    duration_minutes: 10,
                                    exercises: [{ name: 'Full body stretch', duration: '10min' }]
                                }
                            }
                        }
                    ]
                },
                elite: {
                    duration: [105, 120],
                    rpe: '9-10/10',
                    sessions: [
                        {
                            name: 'Bulgarian Method Style',
                            duration: 115,
                            structure: {
                                warmup: {
                                    duration_minutes: 25,
                                    exercises: [
                                        { name: 'Extensive warmup', duration: '15min' },
                                        { name: 'Build to working weights', duration: '10min' }
                                    ]
                                },
                                main_work: {
                                    title: 'Session 1 of day (AM)',
                                    exercises: [
                                        {
                                            name: 'Snatch',
                                            work: 'Max for the day',
                                            then: 'Back down sets: 3x1 @ 90%',
                                            rest: '3-5min'
                                        },
                                        {
                                            name: 'Clean and jerk',
                                            work: 'Max for the day',
                                            then: 'Back down sets: 3x1 @ 90%',
                                            rest: '3-5min'
                                        },
                                        {
                                            name: 'Front squat',
                                            sets: 3,
                                            reps: 2,
                                            intensity: '90% 1RM',
                                            rest: '4min'
                                        }
                                    ],
                                    note_pm_session:
                                        'Second session 6 hours later: Back squat + accessories'
                                },
                                cooldown: {
                                    duration_minutes: 15,
                                    exercises: [{ name: 'Extensive mobility', duration: '15min' }]
                                }
                            },
                            notes: 'High frequency, max effort daily. Requires elite recovery capacity.'
                        }
                    ]
                }
            }
        },

        /**
         * 4. GYMNASTICS
         */
        gymnastics: {
            name: 'Gymnastics',
            category: 'bodyweight',
            description: 'Bodyweight skill and strength development',

            ppg: {
                beginner: {
                    duration: [40, 50],
                    rpe: '5-6/10',
                    sessions: [
                        {
                            name: 'Basic Gymnastics Strength',
                            duration: 45,
                            structure: {
                                warmup: {
                                    duration_minutes: 10,
                                    exercises: [
                                        { name: 'Shoulder circles, arm swings', duration: '3min' },
                                        {
                                            name: 'Hollow + arch holds',
                                            sets: 3,
                                            duration: '20s each'
                                        },
                                        { name: 'Scapular activation', duration: '3min' }
                                    ]
                                },
                                main_work: {
                                    exercises: [
                                        {
                                            name: 'Ring rows',
                                            sets: 4,
                                            reps: 10,
                                            rest: '90s',
                                            progression: 'Lower rings as you get stronger'
                                        },
                                        {
                                            name: 'Box push-ups',
                                            sets: 4,
                                            reps: 10,
                                            rest: '90s'
                                        },
                                        {
                                            name: 'Box dips',
                                            sets: 3,
                                            reps: 8,
                                            rest: '90s'
                                        },
                                        {
                                            name: 'Hollow hold',
                                            sets: 4,
                                            duration: '30s',
                                            rest: '60s'
                                        },
                                        {
                                            name: 'Handstand hold (wall)',
                                            sets: 4,
                                            duration: '20-30s',
                                            rest: '90s'
                                        }
                                    ]
                                },
                                cooldown: {
                                    duration_minutes: 5,
                                    exercises: [{ name: 'Shoulder stretch', duration: '5min' }]
                                }
                            }
                        }
                    ]
                },
                intermediate: {
                    duration: [50, 60],
                    rpe: '7/10',
                    sessions: [
                        {
                            name: 'Pulling + HSPU Strength',
                            duration: 55,
                            structure: {
                                warmup: {
                                    duration_minutes: 12,
                                    exercises: [
                                        { name: 'General prep', duration: '5min' },
                                        { name: 'Kipping practice', duration: '5min' },
                                        { name: 'HSPU progression', duration: '2min' }
                                    ]
                                },
                                main_work: {
                                    exercises: [
                                        {
                                            name: 'Strict pull-ups',
                                            sets: 5,
                                            reps: 5,
                                            weight: 'Add weight if possible',
                                            rest: '2min'
                                        },
                                        {
                                            name: 'Kipping pull-ups',
                                            sets: 4,
                                            reps: 10,
                                            rest: '90s'
                                        },
                                        {
                                            name: 'Strict HSPU (box or abmat)',
                                            sets: 5,
                                            reps: 5,
                                            rest: '2min'
                                        },
                                        {
                                            name: 'Ring dips',
                                            sets: 4,
                                            reps: 8,
                                            rest: '90s'
                                        },
                                        {
                                            name: 'L-sit (parallettes)',
                                            sets: 4,
                                            duration: '20-30s',
                                            rest: '90s'
                                        }
                                    ]
                                },
                                cooldown: {
                                    duration_minutes: 5,
                                    exercises: [{ name: 'Stretch', duration: '5min' }]
                                }
                            }
                        }
                    ]
                },
                advanced: {
                    duration: [60, 75],
                    rpe: '8/10',
                    sessions: [
                        {
                            name: 'Bar + Ring Muscle-Up Development',
                            duration: 70,
                            structure: {
                                warmup: {
                                    duration_minutes: 15,
                                    exercises: [
                                        { name: 'General warmup', duration: '5min' },
                                        { name: 'Muscle-up progressions', duration: '10min' }
                                    ]
                                },
                                main_work: {
                                    exercises: [
                                        {
                                            name: 'Bar muscle-ups',
                                            sets: 5,
                                            reps: 3,
                                            rest: '2min',
                                            note: 'Strict or kipping depending on skill'
                                        },
                                        {
                                            name: 'Ring muscle-ups',
                                            sets: 5,
                                            reps: 3,
                                            rest: '2min'
                                        },
                                        {
                                            name: 'Weighted chest-to-bar pull-ups',
                                            sets: 4,
                                            reps: 5,
                                            weight: '10-20lb',
                                            rest: '2min'
                                        },
                                        {
                                            name: 'Strict HSPU',
                                            sets: 5,
                                            reps: 8,
                                            rest: '2min'
                                        },
                                        {
                                            name: 'Toes-to-bar',
                                            sets: 4,
                                            reps: 15,
                                            rest: '90s'
                                        }
                                    ]
                                },
                                cooldown: {
                                    duration_minutes: 8,
                                    exercises: [{ name: 'Mobility', duration: '8min' }]
                                }
                            }
                        }
                    ]
                },
                elite: {
                    duration: [75, 90],
                    rpe: '9/10',
                    sessions: [
                        {
                            name: 'Advanced Gymnastic Strength',
                            duration: 85,
                            structure: {
                                warmup: {
                                    duration_minutes: 15,
                                    exercises: [{ name: 'Comprehensive warmup', duration: '15min' }]
                                },
                                main_work: {
                                    exercises: [
                                        {
                                            name: 'Weighted bar muscle-ups',
                                            sets: 5,
                                            reps: 3,
                                            weight: '10-20lb vest',
                                            rest: '2-3min'
                                        },
                                        {
                                            name: 'Strict ring muscle-ups',
                                            sets: 5,
                                            reps: 3,
                                            rest: '2-3min'
                                        },
                                        {
                                            name: 'Weighted pull-ups',
                                            sets: 5,
                                            reps: 5,
                                            weight: '25-50lb',
                                            rest: '2min'
                                        },
                                        {
                                            name: 'Freestanding HSPU',
                                            sets: 5,
                                            reps: 5,
                                            rest: '2min',
                                            note: 'No wall support'
                                        },
                                        {
                                            name: 'Ring handstand push-ups',
                                            sets: 3,
                                            reps: 3,
                                            rest: '2min'
                                        },
                                        {
                                            name: 'Front lever progression',
                                            sets: 4,
                                            duration: '10s hold',
                                            rest: '2min'
                                        }
                                    ]
                                },
                                cooldown: {
                                    duration_minutes: 10,
                                    exercises: [
                                        { name: 'Full mobility routine', duration: '10min' }
                                    ]
                                }
                            }
                        }
                    ]
                }
            }
        },

        /**
         * 5. ENGINE BUILDING (Monostructural Cardio)
         */
        engine_building: {
            name: 'Engine Building',
            category: 'conditioning',
            description: 'Aerobic capacity and endurance development',

            ppg: {
                all_levels: {
                    duration: [40, 90],
                    rpe: '5-7/10',
                    sessions: [
                        {
                            name: 'Aerobic Base - Zone 2',
                            duration: 60,
                            structure: {
                                warmup: {
                                    duration_minutes: 5,
                                    exercises: [{ name: 'Easy pace build', duration: '5min' }]
                                },
                                main_work: {
                                    title: 'Sustained Zone 2 work',
                                    options: [
                                        {
                                            modality: 'Row',
                                            duration: '45-60min',
                                            pace: '60-70% FCmax',
                                            stroke_rate: '20-24 spm'
                                        },
                                        {
                                            modality: 'Bike',
                                            duration: '45-60min',
                                            pace: '60-70% FCmax',
                                            rpm: '70-80'
                                        },
                                        {
                                            modality: 'Ski erg',
                                            duration: '30-45min',
                                            pace: '60-70% FCmax'
                                        },
                                        {
                                            modality: 'Run',
                                            duration: '30-45min',
                                            pace: 'Conversational, nose breathing'
                                        }
                                    ],
                                    target: 'Maintain conversation, nasal breathing possible'
                                },
                                cooldown: {
                                    duration_minutes: 5,
                                    exercises: [{ name: 'Easy cooldown', duration: '5min' }]
                                }
                            },
                            notes: 'Build aerobic base. Should feel easy, restorative.'
                        },
                        {
                            name: 'Threshold Intervals',
                            duration: 50,
                            structure: {
                                warmup: {
                                    duration_minutes: 10,
                                    exercises: [
                                        { name: 'Build to working pace', duration: '10min' }
                                    ]
                                },
                                main_work: {
                                    title: 'Interval work at threshold',
                                    intervals: [
                                        {
                                            work: '8min',
                                            rest: '2min',
                                            rounds: 4,
                                            intensity: '75-80% FCmax',
                                            modality: 'Choice: row, bike, ski'
                                        }
                                    ],
                                    target: 'Hold consistent pace across all intervals'
                                },
                                cooldown: {
                                    duration_minutes: 10,
                                    exercises: [{ name: 'Easy pace', duration: '10min' }]
                                }
                            }
                        }
                    ]
                }
            },

            ppo: {
                all_levels: {
                    sessions: [
                        {
                            name: 'VO2max Intervals',
                            duration: 45,
                            structure: {
                                warmup: {
                                    duration_minutes: 10,
                                    exercises: [{ name: 'Progressive build', duration: '10min' }]
                                },
                                main_work: {
                                    title: 'High intensity intervals',
                                    intervals: [
                                        {
                                            work: '2min',
                                            rest: '2min',
                                            rounds: 8,
                                            intensity: '85-90% FCmax',
                                            modality: 'Assault bike or row'
                                        }
                                    ]
                                },
                                cooldown: {
                                    duration_minutes: 10,
                                    exercises: [{ name: 'Easy recovery', duration: '10min' }]
                                }
                            }
                        }
                    ]
                }
            }
        },

        /**
         * 6. MIXED MODAL
         */
        mixed_modal: {
            name: 'Mixed Modal',
            category: 'conditioning',
            description: 'Combining different modalities and movements',

            ppg: {
                intermediate: {
                    sessions: [
                        {
                            name: 'Classic Couplet',
                            duration: 35,
                            structure: {
                                warmup: { duration_minutes: 12 },
                                main_work: {
                                    title: 'Helen - 3 Rounds For Time',
                                    rounds: 3,
                                    exercises: [
                                        { name: 'Run', distance: '400m' },
                                        {
                                            name: 'Kettlebell swings',
                                            reps: 21,
                                            weight_m: '53lb (24kg)',
                                            weight_f: '35lb (16kg)'
                                        },
                                        { name: 'Pull-ups', reps: 12 }
                                    ],
                                    target_time: '9-12min',
                                    benchmark: 'Elite: < 7min, Advanced: 7-9min, Good: 9-12min'
                                },
                                cooldown: { duration_minutes: 8 }
                            }
                        }
                    ]
                },
                advanced: {
                    sessions: [
                        {
                            name: 'Classic Triplet - Diane',
                            duration: 40,
                            structure: {
                                warmup: { duration_minutes: 15 },
                                main_work: {
                                    title: 'Diane - 21-15-9',
                                    rounds: [21, 15, 9],
                                    exercises: [
                                        {
                                            name: 'Deadlift',
                                            weight_m: '225lb (102kg)',
                                            weight_f: '155lb (70kg)'
                                        },
                                        { name: 'Handstand push-ups' }
                                    ],
                                    target_time: '5-8min',
                                    benchmark: 'Elite: < 3min, Advanced: 3-5min, Good: 5-8min'
                                },
                                cooldown: { duration_minutes: 10 }
                            }
                        }
                    ]
                }
            }
        }
    },

    /**
     * BENCHMARK WODS
     */
    benchmark_wods: {
        girls: {
            fran: {
                reps: [21, 15, 9],
                movements: ['Thruster 95/65lb', 'Pull-ups'],
                elite_time: '< 3min'
            },
            grace: { reps: 30, movements: ['Clean & Jerk 135/95lb'], elite_time: '< 2min' },
            isabel: { reps: 30, movements: ['Snatch 135/95lb'], elite_time: '< 2min' },
            helen: {
                rounds: 3,
                movements: ['400m run', '21 KB swings 53/35lb', '12 pull-ups'],
                elite_time: '< 8min'
            },
            diane: {
                reps: [21, 15, 9],
                movements: ['Deadlift 225/155lb', 'HSPU'],
                elite_time: '< 3min'
            },
            cindy: {
                format: 'AMRAP 20min',
                movements: ['5 pull-ups', '10 push-ups', '15 air squats'],
                elite_rounds: '> 25'
            },
            annie: {
                reps: [50, 40, 30, 20, 10],
                movements: ['Double-unders', 'Sit-ups'],
                elite_time: '< 8min'
            },
            karen: { reps: 150, movements: ['Wall balls 20/14lb'], elite_time: '< 5min' }
        },
        heroes: {
            murph: {
                structure: '1mi run, 100 pull-ups, 200 push-ups, 300 squats, 1mi run',
                vest: '20/14lb',
                elite_time: '< 35min'
            },
            dt: {
                rounds: 5,
                movements: ['12 deadlift', '9 hang power clean', '6 push jerk'],
                weight: '155/105lb',
                elite_time: '< 6min'
            }
        }
    },

    /**
     * MÉTHODOLOGIES
     */
    methodologies: {
        comptrain: {
            name: 'CompTrain (Ben Bergeron)',
            philosophy: 'Build the engine first, then add intensity',
            key_principles: [
                'Volume before intensity',
                'Aerobic capacity is foundation',
                'Consistent quality over sporadic heroics',
                'Mental resilience training',
                'Long-term athlete development'
            ],
            typical_week: {
                monday: 'Heavy strength + short MetCon',
                tuesday: 'Gymnastics + aerobic capacity',
                wednesday: 'Olympic lifting + moderate MetCon',
                thursday: 'Engine building (long aerobic)',
                friday: 'Mixed modal benchmark',
                saturday: 'Long chipper or Games-style workout',
                sunday: 'Active recovery or rest'
            }
        },
        mayhem: {
            name: 'Mayhem Athlete (Rich Froning)',
            philosophy: 'High volume, constantly varied, push limits daily',
            key_principles: [
                'Volume creates capacity',
                'Multiple sessions per day (elite)',
                'Embrace discomfort',
                'Competition mindset in training',
                'Maximize work capacity'
            ]
        },
        conjugate: {
            name: 'Conjugate for CrossFit',
            philosophy: 'Westside Barbell adapted for functional fitness',
            key_principles: [
                'Max effort days (work to 1RM)',
                'Dynamic effort days (speed work)',
                'Repetition method (accessories)',
                'Rotate exercises every 1-3 weeks',
                'Concurrent training of all qualities'
            ]
        },
        linchpin: {
            name: 'Linchpin (Pat Sherwood)',
            philosophy: 'Fitness for real life, sustainable programming',
            key_principles: [
                'Scalable for all levels',
                'Focus on fundamentals',
                'Avoid overtraining',
                'Quality movement patterns',
                'Long-term health over short-term performance'
            ]
        }
    },

    /**
     * MOUVEMENTS PAR CATÉGORIE
     */
    movements: {
        gymnastics: {
            basic: ['Pull-up', 'Push-up', 'Air squat', 'Sit-up', 'Box jump', 'Burpee'],
            intermediate: [
                'Chest-to-bar pull-up',
                'Handstand push-up',
                'Toes-to-bar',
                'Ring dip',
                'Pistol squat'
            ],
            advanced: ['Bar muscle-up', 'Ring muscle-up', 'Strict HSPU', 'Ring HSPU', 'Rope climb']
        },
        weightlifting: {
            barbell: [
                'Snatch',
                'Clean',
                'Jerk',
                'Clean & jerk',
                'Overhead squat',
                'Front squat',
                'Back squat',
                'Deadlift'
            ],
            variations: [
                'Power snatch',
                'Hang snatch',
                'Power clean',
                'Hang clean',
                'Push press',
                'Push jerk',
                'Split jerk'
            ]
        },
        monostructural: {
            cardio: ['Row', 'Assault bike', 'Ski erg', 'Run', 'Swim', 'Jump rope', 'Double-under']
        },
        strongman: {
            implements: ['Sled push/pull', 'Sandbag', 'Farmers carry', 'Yoke walk']
        }
    },

    /**
     * STANDARDS ÉLITE
     */
    elite_standards: {
        male: {
            bodyweight: '185-200lb (84-91kg)',
            benchmarks: {
                fran: '< 2:30',
                grace: '< 1:45',
                isabel: '< 1:30',
                murph: '< 35min with vest'
            },
            strength: {
                back_squat: '2.5x bodyweight',
                deadlift: '2.75x bodyweight',
                clean: '1.75x bodyweight',
                snatch: '1.5x bodyweight',
                strict_pullup: '+ 90lb for 1 rep'
            },
            gymnastics: {
                bar_muscle_ups: '15+ unbroken',
                ring_muscle_ups: '10+ unbroken',
                strict_hspu: '20+ unbroken'
            },
            engine: {
                '2k_row': '< 6:30',
                '5k_run': '< 18:00',
                max_cal_bike_1min: '> 40 cal'
            }
        },
        female: {
            bodyweight: '135-150lb (61-68kg)',
            benchmarks: {
                fran: '< 3:30',
                grace: '< 2:30',
                isabel: '< 2:15',
                murph: '< 40min with vest'
            },
            strength: {
                back_squat: '2x bodyweight',
                deadlift: '2.5x bodyweight',
                clean: '1.5x bodyweight',
                snatch: '1.25x bodyweight',
                strict_pullup: '+ 45lb for 1 rep'
            },
            gymnastics: {
                bar_muscle_ups: '10+ unbroken',
                ring_muscle_ups: '7+ unbroken',
                strict_hspu: '15+ unbroken'
            },
            engine: {
                '2k_row': '< 7:30',
                '5k_run': '< 21:00',
                max_cal_bike_1min: '> 30 cal'
            }
        }
    },

    /**
     * PLANS D'ENTRAÎNEMENT PAR OBJECTIF
     */
    training_plans: {
        crossfit_open: {
            name: 'CrossFit Open Preparation',
            duration_weeks: 12,
            phases: {
                weeks_1_4: 'PPG - Build base capacity',
                weeks_5_8: 'PPO - Increase intensity, practice Open-style workouts',
                weeks_9_11: 'PPS - Taper, mental preparation',
                week_12: 'Competition week'
            },
            weekly_structure: {
                sessions_per_week: 5,
                distribution: '2 MetCon, 2 Strength, 1 Mixed'
            }
        },
        crossfit_games: {
            name: 'CrossFit Games Preparation',
            duration_weeks: 24,
            phases: {
                weeks_1_8: 'PPG - Massive volume, build all qualities',
                weeks_9_18: 'PPO - High intensity, competition simulation',
                weeks_19_23: 'PPS - Taper, peaking',
                week_24: 'Games week'
            },
            weekly_structure: {
                sessions_per_week: '8-12 (multiple sessions daily)',
                distribution:
                    'Morning: Strength/Oly, Afternoon: MetCon/Gymnastics, Optional PM: Engine work'
            }
        }
    }
};

// Export global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CrossFitDatabase;
} else {
    window.CrossFitDatabase = CrossFitDatabase;
}
