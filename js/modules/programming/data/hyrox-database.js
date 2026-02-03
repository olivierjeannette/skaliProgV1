/**
 * HYROX - BASE DE DONNÉES COMPLÈTE
 * Sport : Fitness Racing - 8km running + 8 stations workout
 * Standards : HYROX World Series, Hunter McIntyre, Lauren Weeks protocols
 * Format officiel : 1km run + station (x8)
 *
 * Périodisation adaptée : GPP (General) → SPP (Specific) → Competition
 * Focus : Hybrid athlete - Endurance + Force-Endurance + Transitions
 */

const HyroxDatabase = {
    sport: 'hyrox',
    name: 'HYROX',

    /**
     * FORMAT OFFICIEL HYROX
     */
    official_format: {
        total_distance: '8km running',
        stations: 8,
        layout: [
            { km: 1, station: 'SkiErg 1000m' },
            { km: 2, station: 'Sled Push 50m (M: 152kg / F: 103kg)' },
            { km: 3, station: 'Sled Pull 50m (M: 103kg / F: 78kg)' },
            { km: 4, station: 'Burpee Broad Jump 80m' },
            { km: 5, station: 'Rowing 1000m' },
            { km: 6, station: 'Farmers Carry 200m (M: 2x24kg / F: 2x16kg)' },
            { km: 7, station: 'Sandbag Lunges 100m (M: 20kg / F: 10kg)' },
            { km: 8, station: 'Wall Balls 75 reps (M: 6kg to 3m / F: 4kg to 2.5m)' }
        ],
        divisions: {
            open: { description: 'Solo', weights: 'Standard' },
            doubles: { description: '2 personnes, partage travail' },
            relay: { description: '4 personnes, 2km chacun' },
            pro: { description: 'Élite, prize money', weights: 'Plus lourds (PRO15)' }
        }
    },

    /**
     * ZONES D'INTENSITÉ HYROX (Modèle Hybrid)
     */
    zones: {
        z1_recovery: {
            name: 'Récupération Active',
            intensity: '50-60% FCmax',
            rpe: '2-3/10',
            usage: 'Active recovery entre sessions, cooldown',
            pace_run: 'Very easy jog'
        },
        z2_base: {
            name: 'Base Aérobie',
            intensity: '60-75% FCmax',
            rpe: '4-6/10',
            usage: 'Long runs, base building',
            pace_run: 'Conversational pace'
        },
        z3_tempo: {
            name: 'Tempo / Sweet Spot',
            intensity: '75-85% FCmax',
            rpe: '6-7/10',
            usage: 'Tempo runs, race pace practice',
            pace_run: 'Comfortably hard'
        },
        z4_threshold: {
            name: 'Lactate Threshold',
            intensity: '85-90% FCmax',
            rpe: '7-8/10',
            usage: 'Interval run sections, stations effort',
            pace_run: 'HYROX race pace'
        },
        z5_vo2max: {
            name: 'VO2max / Max Effort',
            intensity: '90-100% FCmax',
            rpe: '9-10/10',
            usage: 'Sprints, all-out stations',
            pace_run: 'Hard intervals, final push'
        }
    },

    /**
     * TYPES DE SÉANCES PAR PHASE
     */
    sessionTypes: {
        // ========== SIMULATION COMPLÈTE ==========
        simulation_complete: {
            name: 'Simulation HYROX Complète',
            category: 'Spécifique Race',

            ppg: {
                beginner: {
                    duration: [90, 120],
                    rpe: '7-8/10',
                    volume_week: '0.5 séance (toutes les 2 semaines)',
                    description: 'Familiarisation format, intensité modérée',
                    sessions: [
                        {
                            name: 'Half HYROX Simulation',
                            duration: 60,
                            structure: {
                                warmup: {
                                    duration: 15,
                                    exercises: [
                                        'Jogging 10min',
                                        'Mobilité dynamique',
                                        'Activation core'
                                    ]
                                },
                                main: {
                                    duration: 40,
                                    type: 'Half format (4km + 4 stations)',
                                    workout: [
                                        { run: '1km @ Z3', station: 'SkiErg 500m' },
                                        { run: '1km @ Z3', station: 'Sled Push 25m' },
                                        { run: '1km @ Z3', station: 'Burpee Broad Jump 40m' },
                                        { run: '1km @ Z3', station: 'Farmers Carry 100m' }
                                    ],
                                    notes: 'Poids réduits (70% standard), focus technique'
                                },
                                cooldown: { duration: 5, exercises: ['Walk 5min', 'Stretching'] }
                            }
                        }
                    ]
                },
                intermediate: {
                    duration: [75, 105],
                    rpe: '7-9/10',
                    volume_week: '1 séance / 2 semaines',
                    description: 'Simulation partielle ou complète avec breaks',
                    sessions: [
                        {
                            name: 'Full HYROX Modified',
                            duration: 90,
                            structure: {
                                warmup: {
                                    duration: 15,
                                    exercises: [
                                        'Run 10min progressive',
                                        'Dynamic stretching',
                                        'Light activation'
                                    ]
                                },
                                main: {
                                    duration: 70,
                                    type: 'Full 8km + 8 stations avec pauses stratégiques',
                                    workout: [
                                        {
                                            run: '1km @ Z3',
                                            station: 'SkiErg 1000m',
                                            rest: '1-2min'
                                        },
                                        {
                                            run: '1km @ Z3',
                                            station: 'Sled Push 50m (M: 120kg / F: 80kg)',
                                            rest: '1-2min'
                                        },
                                        {
                                            run: '1km @ Z3',
                                            station: 'Sled Pull 50m (M: 80kg / F: 60kg)',
                                            rest: '1-2min'
                                        },
                                        {
                                            run: '1km @ Z3',
                                            station: 'Burpee Broad Jump 80m',
                                            rest: '1-2min'
                                        },
                                        {
                                            run: '1km @ Z3',
                                            station: 'Rowing 1000m',
                                            rest: '1-2min'
                                        },
                                        {
                                            run: '1km @ Z3',
                                            station: 'Farmers Carry 200m (M: 2x20kg / F: 2x12kg)',
                                            rest: '1-2min'
                                        },
                                        {
                                            run: '1km @ Z3',
                                            station: 'Sandbag Lunges 100m (M: 15kg / F: 8kg)',
                                            rest: '1-2min'
                                        },
                                        {
                                            run: '1km @ Z3',
                                            station: 'Wall Balls 75 (M: 6kg / F: 4kg)'
                                        }
                                    ],
                                    notes: 'Poids légèrement réduits, pauses courtes autorisées, focus volume total'
                                },
                                cooldown: { duration: 5, exercises: ['Walk + stretch legs'] }
                            }
                        }
                    ]
                },
                advanced: {
                    duration: [75, 95],
                    rpe: '8-9/10',
                    volume_week: '1 séance / semaine',
                    description: 'Full simulation, poids standards, transitions réelles',
                    sessions: [
                        {
                            name: 'Race Simulation Standard',
                            duration: 85,
                            structure: {
                                warmup: {
                                    duration: 15,
                                    exercises: ['15min warmup protocol', 'Station rehearsal light']
                                },
                                main: {
                                    duration: 65,
                                    type: 'Full HYROX standard weights, minimal rest',
                                    workout: [
                                        {
                                            run: '1km @ Z3-Z4',
                                            station: 'SkiErg 1000m @ damper 7-8'
                                        },
                                        {
                                            run: '1km @ Z3-Z4',
                                            station: 'Sled Push 50m (M: 152kg / F: 103kg)'
                                        },
                                        {
                                            run: '1km @ Z3-Z4',
                                            station: 'Sled Pull 50m (M: 103kg / F: 78kg)'
                                        },
                                        { run: '1km @ Z3-Z4', station: 'Burpee Broad Jump 80m' },
                                        {
                                            run: '1km @ Z3-Z4',
                                            station: 'Rowing 1000m @ damper 5-6'
                                        },
                                        {
                                            run: '1km @ Z3-Z4',
                                            station: 'Farmers Carry 200m (M: 2x24kg / F: 2x16kg)'
                                        },
                                        {
                                            run: '1km @ Z3-Z4',
                                            station: 'Sandbag Lunges 100m (M: 20kg / F: 10kg)'
                                        },
                                        {
                                            run: '1km @ Z4',
                                            station: 'Wall Balls 75 (M: 6kg to 3m / F: 4kg to 2.5m)'
                                        }
                                    ],
                                    transitions: 'Minimiser temps transition <20s',
                                    nutrition: 'Gel 1 at km4, eau stations',
                                    notes: 'Pacing strategy: négative splits runs'
                                },
                                cooldown: { duration: 5, exercises: ['Walk off lactic acid'] }
                            }
                        }
                    ]
                },
                elite: {
                    duration: [65, 80],
                    rpe: '9-10/10',
                    volume_week: '1 séance / semaine',
                    description: 'Race simulation PRO weights, tempo compétition',
                    sessions: [
                        {
                            name: 'PRO Division Simulation',
                            duration: 75,
                            structure: {
                                warmup: {
                                    duration: 12,
                                    exercises: ['Warmup rapide comme race day']
                                },
                                main: {
                                    duration: 60,
                                    type: 'Full HYROX PRO15 ou standards compétition',
                                    target_time: {
                                        male_elite: '<60min',
                                        female_elite: '<70min'
                                    },
                                    workout: [
                                        { run: '1km @ <4:00/km', station: 'SkiErg 1000m <3:30' },
                                        { run: '1km @ <4:00/km', station: 'Sled Push 50m <60s' },
                                        { run: '1km @ <4:00/km', station: 'Sled Pull 50m <60s' },
                                        {
                                            run: '1km @ <4:00/km',
                                            station: 'Burpee Broad Jump 80m <2:30'
                                        },
                                        { run: '1km @ <4:00/km', station: 'Rowing 1000m <3:30' },
                                        {
                                            run: '1km @ <4:10/km',
                                            station: 'Farmers Carry 200m <60s'
                                        },
                                        {
                                            run: '1km @ <4:10/km',
                                            station: 'Sandbag Lunges 100m <2:00'
                                        },
                                        { run: '1km @ <4:00/km', station: 'Wall Balls 75 <2:30' }
                                    ],
                                    mental: 'Visualization race, pacing discipline',
                                    notes: 'Hunter McIntyre / Lauren Weeks level intensity'
                                },
                                cooldown: {
                                    duration: 3,
                                    exercises: ['Minimal cooldown, race style']
                                }
                            }
                        }
                    ]
                }
            },

            ppo: {
                all_levels: {
                    description: 'Simulations hebdomadaires, race pace',
                    frequency: '1x / semaine minimum',
                    notes: 'Teste nutrition, hydratation, pacing exact course'
                }
            },

            pps: {
                all_levels: {
                    description: 'Une dernière sim 10-14j avant course',
                    notes: 'Intensité race, volume réduit (6km + 6 stations)'
                }
            }
        },

        // ========== STATIONS ISOLÉES ==========
        stations_isolees: {
            name: 'Entraînement Stations Isolées',
            category: 'Technique + Force-Endurance',

            ppg: {
                all_levels: {
                    duration: [45, 60],
                    rpe: '6-8/10',
                    volume_week: '2-3 séances',
                    description: 'Développement capacité chaque station, volume élevé',
                    sessions: [
                        {
                            name: 'SkiErg Focus',
                            duration: 45,
                            structure: {
                                warmup: {
                                    duration: 10,
                                    exercises: ['Row 500m easy', 'Arm circles', 'Trunk rotations']
                                },
                                main: {
                                    duration: 30,
                                    type: 'SkiErg intervals',
                                    workout: [
                                        {
                                            work: '5x500m @ race pace',
                                            rest: '2min',
                                            notes: 'Damper 7-8, focus technique'
                                        },
                                        {
                                            work: '3x1000m @ Z3-Z4',
                                            rest: '3min',
                                            notes: 'Endurance SkiErg'
                                        },
                                        { finisher: '1x1000m max effort', notes: 'Test capacité' }
                                    ],
                                    technique_points: [
                                        'Drive legs first',
                                        'Lat engagement',
                                        'Consistent stroke rate 45-50'
                                    ],
                                    target_splits: {
                                        male_inter: '2:00-2:10 / 500m',
                                        female_inter: '2:20-2:30 / 500m'
                                    }
                                },
                                cooldown: {
                                    duration: 5,
                                    exercises: ['Easy row 500m', 'Lat stretch']
                                }
                            }
                        },
                        {
                            name: 'Sled Push/Pull Combo',
                            duration: 50,
                            structure: {
                                warmup: {
                                    duration: 15,
                                    exercises: [
                                        'Jog 10min',
                                        'Leg swings',
                                        'Hip openers',
                                        'Light sled push/pull'
                                    ]
                                },
                                main: {
                                    duration: 30,
                                    type: 'Sled work intervals',
                                    workout: [
                                        {
                                            work: '8x Push 25m @ race weight',
                                            rest: '90s walk back',
                                            notes: 'Low position, drive legs'
                                        },
                                        {
                                            work: '8x Pull 25m @ race weight',
                                            rest: '90s walk back',
                                            notes: 'Sit back, use rope length'
                                        },
                                        {
                                            work: '4x (Push 25m + Pull 25m)',
                                            rest: '2min',
                                            notes: 'Back-to-back combo'
                                        }
                                    ],
                                    weights: {
                                        push_male: '152kg',
                                        push_female: '103kg',
                                        pull_male: '103kg',
                                        pull_female: '78kg'
                                    },
                                    technique_points: [
                                        'Push: Low hips, drive through',
                                        'Pull: Sit weight back, rope taut'
                                    ]
                                },
                                cooldown: { duration: 5, exercises: ['Walk', 'Quad/hip stretch'] }
                            }
                        },
                        {
                            name: 'Burpee Broad Jump Conditioning',
                            duration: 40,
                            structure: {
                                warmup: {
                                    duration: 10,
                                    exercises: ['Jump rope', 'Burpees light x10', 'Broad jumps x5']
                                },
                                main: {
                                    duration: 25,
                                    type: 'BBJ high volume',
                                    workout: [
                                        {
                                            work: '5x 20m BBJ',
                                            rest: '90s',
                                            notes: 'Focus smooth rhythm'
                                        },
                                        {
                                            work: '3x 40m BBJ',
                                            rest: '2min',
                                            notes: 'Half distance'
                                        },
                                        {
                                            work: '2x 80m BBJ for time',
                                            rest: '3-4min',
                                            notes: 'Race simulation'
                                        }
                                    ],
                                    technique_points: [
                                        'Fast chest to deck',
                                        'Explode jump forward',
                                        'Minimize ground time'
                                    ],
                                    target_time: {
                                        male: '<2:30 for 80m',
                                        female: '<3:00 for 80m'
                                    }
                                },
                                cooldown: {
                                    duration: 5,
                                    exercises: ['Walk', 'Chest/shoulder stretch']
                                }
                            }
                        },
                        {
                            name: 'Rowing Endurance',
                            duration: 50,
                            structure: {
                                warmup: {
                                    duration: 10,
                                    exercises: ['Row 500m easy', 'Shoulder mobility']
                                },
                                main: {
                                    duration: 35,
                                    type: 'Rowing intervals race pace',
                                    workout: [
                                        {
                                            work: '4x500m @ race pace',
                                            rest: '90s',
                                            notes: 'Damper 5-6'
                                        },
                                        {
                                            work: '2x1000m @ Z3-Z4',
                                            rest: '2min',
                                            notes: 'Endurance focus'
                                        },
                                        {
                                            work: '1x1000m max effort',
                                            notes: 'Test + mental toughness'
                                        }
                                    ],
                                    technique: 'Legs→Back→Arms, reverse on recovery',
                                    target_splits: {
                                        male_inter: '1:45-1:55 / 500m',
                                        female_inter: '2:00-2:10 / 500m'
                                    }
                                },
                                cooldown: { duration: 5, exercises: ['Row easy 500m'] }
                            }
                        },
                        {
                            name: 'Farmers Carry Strength-Endurance',
                            duration: 45,
                            structure: {
                                warmup: {
                                    duration: 10,
                                    exercises: ['Run 10min', 'Grip warmup', 'Light carries']
                                },
                                main: {
                                    duration: 30,
                                    type: 'Farmers Carry high volume',
                                    workout: [
                                        {
                                            work: '6x 50m @ race weight',
                                            rest: '60s',
                                            notes: 'Standard grip'
                                        },
                                        {
                                            work: '4x 100m @ race weight',
                                            rest: '90s',
                                            notes: 'Half distance'
                                        },
                                        {
                                            work: '2x 200m @ race weight',
                                            rest: '2-3min',
                                            notes: 'Full distance race sim'
                                        }
                                    ],
                                    weights: {
                                        male: '2x24kg KB',
                                        female: '2x16kg KB'
                                    },
                                    technique_points: [
                                        'Tall posture',
                                        'Shoulders packed',
                                        'Quick turnover feet'
                                    ],
                                    grip_training: 'Add dead hangs 3x30-45s post-session'
                                },
                                cooldown: {
                                    duration: 5,
                                    exercises: ['Shake out arms', 'Forearm stretch']
                                }
                            }
                        },
                        {
                            name: 'Sandbag Lunges Torture',
                            duration: 40,
                            structure: {
                                warmup: {
                                    duration: 10,
                                    exercises: ['Jog', 'Walking lunges BW', 'Hip flexor stretch']
                                },
                                main: {
                                    duration: 25,
                                    type: 'Sandbag lunge high volume',
                                    workout: [
                                        {
                                            work: '4x 25m @ race weight',
                                            rest: '90s',
                                            notes: 'Quarter distance'
                                        },
                                        {
                                            work: '3x 50m @ race weight',
                                            rest: '2min',
                                            notes: 'Half distance'
                                        },
                                        {
                                            work: '2x 100m for time',
                                            rest: '3-4min',
                                            notes: 'Full distance race sim'
                                        }
                                    ],
                                    weights: {
                                        male: '20kg sandbag',
                                        female: '10kg sandbag'
                                    },
                                    technique:
                                        'Ruck style high on back, deep lunges, minimize rest mid-set',
                                    target_time: {
                                        male: '<2:00',
                                        female: '<2:30'
                                    }
                                },
                                cooldown: {
                                    duration: 5,
                                    exercises: ['Walk', 'Quad/hip stretch deep']
                                }
                            }
                        },
                        {
                            name: 'Wall Balls Volume',
                            duration: 40,
                            structure: {
                                warmup: {
                                    duration: 10,
                                    exercises: [
                                        'Row 500m',
                                        'Air squats',
                                        'Shoulder warmup',
                                        'Wall ball practice x10'
                                    ]
                                },
                                main: {
                                    duration: 25,
                                    type: 'Wall ball capacity building',
                                    workout: [
                                        {
                                            work: '5x 20 reps unbroken',
                                            rest: '60s',
                                            notes: 'Focus rhythm'
                                        },
                                        {
                                            work: '3x 40 reps',
                                            rest: '90s',
                                            notes: 'Allow 1-2 breaks if needed'
                                        },
                                        {
                                            work: '1x 75 reps for time',
                                            rest: 'N/A',
                                            notes: 'Full race simulation'
                                        }
                                    ],
                                    ball_weight: {
                                        male: '6kg to 3m target',
                                        female: '4kg to 2.5m target'
                                    },
                                    technique: 'Catch and ride down, explode up, quick release',
                                    target_time: {
                                        male: '<2:30',
                                        female: '<3:00'
                                    },
                                    pacing: 'Start controlled, finish strong - no early burnout'
                                },
                                cooldown: { duration: 5, exercises: ['Walk', 'Shoulder stretch'] }
                            }
                        }
                    ]
                }
            },

            ppo: {
                all_levels: {
                    description: 'Stations avec run directement après (transitions)',
                    notes: 'Simulate real race fatigue'
                }
            }
        },

        // ========== RUNNING SPÉCIFIQUE HYROX ==========
        running_hyrox: {
            name: 'Running Spécifique HYROX',
            category: 'Endurance Running + Transitions',

            ppg: {
                beginner: {
                    sessions: [
                        {
                            name: 'Base Run',
                            duration: 45,
                            structure: {
                                main: {
                                    type: '40min Z2 continuous',
                                    pace: 'Easy conversational',
                                    notes: 'Build aerobic base for 8km'
                                }
                            }
                        }
                    ]
                },
                intermediate: {
                    sessions: [
                        {
                            name: '8x1km Intervals',
                            duration: 60,
                            structure: {
                                warmup: { duration: 15, exercises: ['Jog 15min', 'Strides x4'] },
                                main: {
                                    duration: 40,
                                    type: '8x (1km @ HYROX race pace + 90s recovery jog)',
                                    target_pace: {
                                        male_inter: '4:00-4:30/km',
                                        female_inter: '4:45-5:15/km'
                                    },
                                    notes: 'Simule les 8x 1km sections de la race'
                                },
                                cooldown: { duration: 5, exercises: ['Jog easy'] }
                            }
                        },
                        {
                            name: 'Tempo Run',
                            duration: 55,
                            structure: {
                                main: {
                                    type: '15min Z2 + 25min Z3-Z4 + 10min Z2',
                                    notes: 'Sustained pace practice'
                                }
                            }
                        }
                    ]
                },
                advanced: {
                    sessions: [
                        {
                            name: '8km Time Trial',
                            duration: 50,
                            structure: {
                                warmup: { duration: 15, exercises: ['Warmup protocol', 'Strides'] },
                                main: {
                                    duration: 32,
                                    type: '8km all-out',
                                    target_time: {
                                        male: '<32min',
                                        female: '<38min'
                                    },
                                    notes: 'Test running capacity isolée'
                                },
                                cooldown: { duration: 3, exercises: ['Walk off'] }
                            }
                        }
                    ]
                }
            }
        },

        // ========== METCON HYROX ==========
        metcon_hyrox: {
            name: 'MetCon Spécifique HYROX',
            category: 'Conditioning',

            ppg: {
                all_levels: {
                    description: 'Circuits mixing run + stations alternées',
                    sessions: [
                        {
                            name: 'HYROX MetCon',
                            duration: 45,
                            structure: {
                                main: {
                                    type: '4 rounds for time',
                                    circuit: [
                                        '400m run',
                                        '15 Wall balls',
                                        '200m row',
                                        '50m sled push (lighter)',
                                        '10 Burpee broad jumps'
                                    ],
                                    rest: 'Minimal, continuous work',
                                    notes: 'High heart rate, HYROX simulation compressed'
                                }
                            }
                        }
                    ]
                }
            }
        }

        // ... (transitions, mental training, etc.)
    },

    /**
     * BENCHMARKS ÉLITE HYROX
     */
    elite_standards: {
        male: {
            total_time: '60-65min',
            run_8km: '30-32min',
            skierg_1000m: '3:20-3:30',
            sled_push: '<1:00',
            sled_pull: '<1:00',
            burpee_broad_jump: '2:15-2:30',
            row_1000m: '3:15-3:25',
            farmers_carry: '<1:00',
            sandbag_lunges: '1:45-2:00',
            wall_balls_75: '2:15-2:30'
        },
        female: {
            total_time: '70-75min',
            run_8km: '36-38min',
            skierg_1000m: '3:50-4:10',
            sled_push: '<1:15',
            sled_pull: '<1:15',
            burpee_broad_jump: '2:45-3:00',
            row_1000m: '3:45-4:00',
            farmers_carry: '<1:15',
            sandbag_lunges: '2:15-2:30',
            wall_balls_75: '2:45-3:00'
        }
    },

    /**
     * PLANS TYPE PAR OBJECTIF
     */
    race_plans: {
        first_hyrox: {
            duration_weeks: 12,
            goal: 'Finish strong, learn format',
            phases: {
                gpp: { weeks: 6, focus: 'Build base running + learn stations' },
                spp: { weeks: 5, focus: 'Race simulations, pacing practice' },
                taper: { weeks: 1, focus: 'Reduce volume, maintain intensity' }
            }
        },
        sub_90min: {
            duration_weeks: 12,
            target_time: '<90min',
            phases: {
                gpp: { weeks: 5, focus: 'Build capacity all stations' },
                spp: { weeks: 6, focus: 'Race pace practice, transitions' },
                taper: { weeks: 1 }
            }
        },
        sub_75min: {
            duration_weeks: 16,
            target_time: '<75min',
            phases: {
                gpp: { weeks: 8, focus: 'High volume stations + running base' },
                spp: { weeks: 7, focus: 'Weekly race sims, dialed nutrition' },
                taper: { weeks: 1 }
            }
        },
        elite_podium: {
            duration_weeks: 20,
            target_time: '<65min (M) / <75min (F)',
            phases: {
                gpp: { weeks: 10, focus: 'Massive volume, strength base' },
                spp: { weeks: 9, focus: 'Race sims 2x/week, speed work' },
                taper: { weeks: 1, focus: 'Minimal volume, mental prep' }
            }
        }
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HyroxDatabase;
} else {
    window.HyroxDatabase = HyroxDatabase;
}
