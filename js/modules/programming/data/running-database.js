/**
 * RUNNING (ROUTE) DATABASE
 * Base de données complète pour l'entraînement en course à pied sur route
 *
 * Standards internationaux basés sur:
 * - Jack Daniels Running Formula
 * - Pete Pfitzinger Advanced Marathoning
 * - Renato Canova methodology
 * - Hansons Marathon Method
 * - Lydiard System
 * - IAAF / World Athletics standards
 */

const RunningDatabase = {
    sport: 'running',
    name: 'Running (Route)',
    description: 'Course à pied sur route - 5km à Marathon',

    /**
     * ZONES D'INTENSITÉ RUNNING (Jack Daniels + Pfitzinger)
     */
    zones: {
        recovery: {
            name: 'Récupération',
            code: 'R',
            intensity: '59-74% VO2max',
            heart_rate: '65-75% FCmax',
            rpe: '3-4/10',
            pace_reference: '+90s à +2min /km vs seuil',
            lactate: '< 2 mmol/L',
            purpose: 'Récupération active, capillarisation',
            duration_typical: '30-60min',
            breathing: 'Très confortable, conversation facile',
            example: "Footing de récupération le lendemain d'une séance dure"
        },
        easy: {
            name: 'Endurance Fondamentale / Easy',
            code: 'E',
            intensity: '65-79% VO2max',
            heart_rate: '70-80% FCmax',
            rpe: '4-5/10',
            pace_reference: '+60s à +90s /km vs seuil',
            lactate: '< 2 mmol/L',
            purpose: 'Base aérobie, économie de course, adaptation musculaire',
            duration_typical: '45-150min',
            breathing: 'Confortable, respiration nasale possible',
            benefits: [
                'Développement mitochondrial',
                'Capillarisation',
                'Économie de course',
                'Utilisation lipides comme carburant',
                'Adaptation tendons/ligaments'
            ],
            notes: 'Zone la plus importante pour coureurs de fond. 70-80% du volume total.'
        },
        marathon_pace: {
            name: 'Allure Marathon',
            code: 'M',
            intensity: '80-90% VO2max',
            heart_rate: '80-88% FCmax',
            rpe: '6-7/10',
            pace_reference: 'Allure objectif marathon',
            lactate: '2-3 mmol/L',
            purpose: 'Spécifique marathon, habitude allure course',
            duration_typical: '30-110min (dans runs longs)',
            breathing: 'Confortable mais soutenu',
            notes: 'Séances spécifiques 8-12 semaines avant marathon'
        },
        threshold: {
            name: 'Seuil Lactique / Tempo',
            code: 'T',
            intensity: '88-92% VO2max',
            heart_rate: '88-92% FCmax',
            rpe: '7-8/10',
            pace_reference: 'Allure tenable 60min (~ semi +10s/km)',
            lactate: '4 mmol/L (seuil anaérobie)',
            purpose: 'Améliorer seuil lactique, endurance à haute intensité',
            duration_typical: '20-60min total (en continu ou fractionné)',
            breathing: 'Difficile mais contrôlé, phrases courtes',
            formats: [
                'Tempo run: 20-40min continu',
                'Cruise intervals: 3-5 x 8-10min avec 1-2min récup',
                '2 x 20min avec 3min récup'
            ],
            benefits: [
                'Augmente seuil lactique',
                'Améliore clearance lactate',
                'Mental toughness',
                'Économie à haute allure'
            ],
            notes: 'Crucial pour performance 10km à marathon. Allure "comfortably hard".'
        },
        vo2max: {
            name: 'VO2max / Intervalles',
            code: 'I',
            intensity: '95-100% VO2max',
            heart_rate: '95-100% FCmax',
            rpe: '9/10',
            pace_reference: 'Allure 5km',
            lactate: '5-7 mmol/L',
            purpose: 'Développer VO2max, capacité aérobie maximale',
            duration_typical: '3-5min par rep, 12-20min total',
            breathing: 'Très difficile, respiration profonde',
            formats: [
                '5-6 x 1000m récup 2-3min',
                '4-5 x 1200m récup 2-3min',
                '10-12 x 400m récup 1min (floating intervals)',
                '3-4 x 1600m récup 3-4min'
            ],
            recovery: "Récup = 50-90% du temps d'effort",
            notes: 'Maximum 8-10% du volume hebdo. Très exigeant.'
        },
        repetition: {
            name: 'Répétitions / Speed',
            code: 'R',
            intensity: '105-120% VO2max',
            heart_rate: 'Non pertinent (trop court)',
            rpe: '9-10/10',
            pace_reference: 'Allure 1500m-3km',
            lactate: '> 7 mmol/L',
            purpose: 'Vitesse, économie de course, puissance anaérobie',
            duration_typical: '200m-1200m, récup complète',
            breathing: 'Maximal',
            formats: [
                '8-12 x 400m récup 3-4min',
                '6-8 x 600m récup 4-5min',
                '5-6 x 800m récup 5-6min',
                '12-16 x 200m récup 1-2min'
            ],
            recovery: 'Récup complète (ratio 1:2 à 1:4)',
            notes: 'Qualité > quantité. Technique de course optimale.'
        },
        strides: {
            name: 'Lignes Droites / Strides',
            code: 'S',
            intensity: '85-95% vitesse max',
            duration: '20-30s',
            purpose: 'Technique, vitesse, activation neuromusculaire',
            format: '4-8 x 20-30s, récup marche retour',
            frequency: '2-3x par semaine après easy runs',
            notes: 'Contrôlé, décontracté, accélération progressive'
        }
    },

    /**
     * TYPES DE SÉANCES
     */
    sessionTypes: {
        /**
         * 1. ENDURANCE FONDAMENTALE
         */
        endurance_fondamentale: {
            name: 'Endurance Fondamentale',
            category: 'aerobic',
            description: 'Base aérobie, volume',

            ppg: {
                beginner: {
                    duration: [30, 60],
                    rpe: '4-5/10',
                    frequency_per_week: 3,
                    sessions: [
                        {
                            name: 'EF Courte',
                            duration: 40,
                            structure: {
                                warmup: {
                                    duration_minutes: 5,
                                    exercises: [
                                        { name: 'Marche rapide', duration: '2min' },
                                        { name: 'Footing très léger', duration: '3min' }
                                    ]
                                },
                                main_work: {
                                    title: 'Run continu',
                                    duration_minutes: 30,
                                    zone: 'Easy (E)',
                                    pace: '+90s à +120s /km vs allure semi',
                                    heart_rate: '70-78% FCmax',
                                    breathing: 'Confortable, conversation possible',
                                    notes: 'Rester très confortable, ne pas forcer'
                                },
                                cooldown: {
                                    duration_minutes: 5,
                                    exercises: [
                                        { name: 'Marche', duration: '3min' },
                                        { name: 'Étirements légers', duration: '2min' }
                                    ]
                                }
                            },
                            notes: 'Base construction. Priorité à la régularité.'
                        }
                    ]
                },
                intermediate: {
                    duration: [60, 90],
                    rpe: '4-5/10',
                    frequency_per_week: 4,
                    sessions: [
                        {
                            name: 'EF Moyenne',
                            duration: 75,
                            structure: {
                                warmup: {
                                    duration_minutes: 5,
                                    exercises: [
                                        { name: 'Échauffement progressif', duration: '5min' }
                                    ]
                                },
                                main_work: {
                                    title: 'Run continu',
                                    duration_minutes: 60,
                                    zone: 'Easy',
                                    pace: '+75s à +90s /km vs allure semi',
                                    heart_rate: '72-80% FCmax',
                                    structure_options: [
                                        { type: 'Plat', description: 'Allure constante' },
                                        {
                                            type: 'Vallonné',
                                            description: 'Effort constant (allure varie)'
                                        }
                                    ],
                                    include: { strides: '6 x 20s en fin de sortie' }
                                },
                                cooldown: {
                                    duration_minutes: 10,
                                    exercises: [
                                        { name: 'Retour au calme', duration: '5min' },
                                        { name: 'Étirements', duration: '5min' }
                                    ]
                                }
                            }
                        }
                    ]
                },
                advanced: {
                    duration: [90, 150],
                    rpe: '5-6/10',
                    sessions: [
                        {
                            name: 'EF Longue',
                            duration: 120,
                            structure: {
                                warmup: {
                                    duration_minutes: 10,
                                    exercises: [{ name: 'Warm-up progressif', duration: '10min' }]
                                },
                                main_work: {
                                    title: 'Long Run',
                                    duration_minutes: 100,
                                    distance_reference: '20-25km',
                                    zone: 'Easy',
                                    pace: '+60s à +80s /km vs allure semi',
                                    heart_rate: '72-80% FCmax',
                                    variations: [
                                        {
                                            name: 'Progression run',
                                            structure: '70% easy → 20% moderate → 10% tempo'
                                        },
                                        {
                                            name: 'Fast finish',
                                            structure:
                                                "Easy jusqu'à derniers 3-5km à allure marathon"
                                        }
                                    ],
                                    nutrition: {
                                        hydration: 'Eau toutes les 15-20min',
                                        energy: 'Gel/snack si > 90min'
                                    }
                                },
                                cooldown: {
                                    duration_minutes: 10,
                                    exercises: [
                                        { name: 'Cool down', duration: '5min' },
                                        { name: 'Étirements + foam roller', duration: '5min' }
                                    ]
                                }
                            }
                        }
                    ]
                },
                elite: {
                    duration: [120, 180],
                    rpe: '5-7/10',
                    sessions: [
                        {
                            name: 'Long Run Elite',
                            duration: 150,
                            structure: {
                                warmup: { duration_minutes: 10 },
                                main_work: {
                                    title: 'Long run with progression or tempo',
                                    duration_minutes: 130,
                                    distance_reference: '30-38km',
                                    variations: [
                                        {
                                            name: 'Long run with tempo',
                                            structure:
                                                '10km easy + 16-20km @ marathon pace + 4-6km easy',
                                            notes: 'Spécifique marathon'
                                        },
                                        {
                                            name: 'Progression long run',
                                            structure: '60min easy → 40min moderate → 30min tempo',
                                            notes: 'Fatigue progressante, mental'
                                        },
                                        {
                                            name: 'Lydiard long run',
                                            duration_minutes: 150,
                                            effort: 'Effort constant (pas allure), sur terrain vallonné',
                                            notes: 'Adaptation musculaire maximale'
                                        }
                                    ]
                                },
                                cooldown: { duration_minutes: 10 }
                            },
                            notes: 'Volume élevé. Nutrition et hydratation cruciales.'
                        }
                    ]
                }
            },

            ppo: {
                all_levels: {
                    description: 'Réduction volume EF, maintien qualité',
                    notes: 'EF plus courtes (60-80min max), focus sur séances qualité'
                }
            },

            pps: {
                all_levels: {
                    description: 'Tapering - Réduction progressive volume',
                    notes: 'EF très courtes (30-45min), maintien fréquence mais baisse volume 40-60%'
                }
            }
        },

        /**
         * 2. SEUIL / TEMPO
         */
        seuil_tempo: {
            name: 'Seuil / Tempo',
            category: 'threshold',
            description: 'Développement seuil lactique',

            ppg: {
                beginner: {
                    duration: [45, 60],
                    rpe: '7/10',
                    sessions: [
                        {
                            name: 'Tempo Run Débutant',
                            duration: 50,
                            structure: {
                                warmup: {
                                    duration_minutes: 15,
                                    exercises: [
                                        { name: 'Footing léger', duration: '10min' },
                                        { name: 'Gammes athlétiques', duration: '3min' },
                                        { name: '2 x strides', duration: '2min' }
                                    ]
                                },
                                main_work: {
                                    title: 'Tempo continu',
                                    duration_minutes: 20,
                                    zone: 'Threshold (T)',
                                    pace: 'Allure semi +10 à +15s/km',
                                    heart_rate: '88-92% FCmax',
                                    rpe: '7/10',
                                    effort: 'Comfortably hard - soutenable 60min théoriquement',
                                    notes: 'Rester constant, ne pas partir trop vite'
                                },
                                cooldown: {
                                    duration_minutes: 15,
                                    exercises: [
                                        { name: 'Footing très léger', duration: '10min' },
                                        { name: 'Étirements', duration: '5min' }
                                    ]
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
                            name: 'Cruise Intervals',
                            duration: 70,
                            structure: {
                                warmup: {
                                    duration_minutes: 15,
                                    exercises: [
                                        { name: 'Warm up', duration: '12min' },
                                        { name: 'Drills + strides', duration: '3min' }
                                    ]
                                },
                                main_work: {
                                    title: 'Cruise Intervals (Daniels)',
                                    intervals: [
                                        {
                                            work: '3 x 10min',
                                            recovery: '2min jog',
                                            pace: 'Threshold',
                                            notes: 'Allure constante, récup active courte'
                                        }
                                    ],
                                    alternative: {
                                        format: '2 x 15min',
                                        recovery: '3min jog',
                                        notes: 'Pour coureurs expérimentés'
                                    },
                                    heart_rate: '88-92% FCmax',
                                    total_time_at_threshold: '30min'
                                },
                                cooldown: {
                                    duration_minutes: 15,
                                    exercises: [{ name: 'Cool down + stretch', duration: '15min' }]
                                }
                            },
                            notes: 'Cruise intervals = tempo fractionné, meilleur pour qualité'
                        },
                        {
                            name: 'Tempo Run Long',
                            duration: 65,
                            structure: {
                                warmup: { duration_minutes: 15 },
                                main_work: {
                                    title: 'Tempo continu',
                                    duration_minutes: 35,
                                    distance: '8-10km',
                                    pace: 'Allure semi + 5-10s/km',
                                    zone: 'Threshold',
                                    notes: 'Effort soutenu mais contrôlé'
                                },
                                cooldown: { duration_minutes: 15 }
                            }
                        }
                    ]
                },
                advanced: {
                    duration: [75, 90],
                    rpe: '8/10',
                    sessions: [
                        {
                            name: 'Tempo Run Avancé',
                            duration: 85,
                            structure: {
                                warmup: { duration_minutes: 20 },
                                main_work: {
                                    title: 'Extended tempo',
                                    duration_minutes: 50,
                                    distance: '12-15km',
                                    pace: 'Allure semi',
                                    zone: 'Threshold',
                                    variations: [
                                        {
                                            name: 'Tempo with surges',
                                            structure:
                                                '40min tempo avec 4-5 surges de 1min à allure 10km'
                                        },
                                        {
                                            name: 'Progressive tempo',
                                            structure:
                                                '15min @ tempo +10s → 20min @ tempo → 15min @ tempo -10s'
                                        }
                                    ]
                                },
                                cooldown: { duration_minutes: 15 }
                            }
                        },
                        {
                            name: 'Lactate Clearance Intervals',
                            duration: 80,
                            structure: {
                                warmup: { duration_minutes: 20 },
                                main_work: {
                                    title: 'Threshold intervals with short recovery',
                                    intervals: [
                                        {
                                            work: '5-6 x 2km',
                                            recovery: '90s jog',
                                            pace: 'Threshold',
                                            notes: 'Récup très courte = clearance lactate'
                                        }
                                    ],
                                    alternative: '8-10 x 1km récup 60s',
                                    goal: 'Entraîner le corps à recycler lactate rapidement'
                                },
                                cooldown: { duration_minutes: 15 }
                            }
                        }
                    ]
                },
                elite: {
                    duration: [90, 105],
                    rpe: '8-9/10',
                    sessions: [
                        {
                            name: 'Renato Canova Special Block',
                            duration: 100,
                            structure: {
                                warmup: { duration_minutes: 25 },
                                main_work: {
                                    title: 'Special Block - Marathon specificity',
                                    protocol: '10km @ marathon pace + 5km @ threshold',
                                    recovery: '5min jog entre blocs',
                                    repeat: '1-2x le bloc complet selon capacité',
                                    notes: 'Spécifique marathon, mental + physiologique',
                                    example: '10km @ 3:30/km + 5km @ 3:20/km, récup 5min, repeat'
                                },
                                cooldown: { duration_minutes: 20 }
                            },
                            notes: 'Canova methodology: blocs longs à allures variées'
                        },
                        {
                            name: 'Pfitzinger Lactate Threshold',
                            duration: 95,
                            structure: {
                                warmup: { duration_minutes: 25 },
                                main_work: {
                                    title: 'LT workout',
                                    format_options: [
                                        {
                                            name: 'Option 1',
                                            intervals: '5 x 3km @ threshold',
                                            recovery: '1min jog'
                                        },
                                        {
                                            name: 'Option 2',
                                            intervals: '15km continu @ threshold',
                                            notes: 'Version tempo long'
                                        },
                                        {
                                            name: 'Option 3',
                                            intervals: '3 x 5km @ threshold',
                                            recovery: '2min jog'
                                        }
                                    ],
                                    pace: '15-20s/km plus rapide que marathon pace',
                                    purpose: 'Augmenter seuil, prépa marathon'
                                },
                                cooldown: { duration_minutes: 20 }
                            }
                        }
                    ]
                }
            }
        },

        /**
         * 3. VMA / VO2MAX
         */
        vma_vo2max: {
            name: 'VMA / VO2max',
            category: 'intervals',
            description: 'Développement VO2max et VMA',

            ppg: {
                beginner: {
                    duration: [50, 60],
                    rpe: '8-9/10',
                    sessions: [
                        {
                            name: 'VMA Courte Débutant',
                            duration: 55,
                            structure: {
                                warmup: {
                                    duration_minutes: 20,
                                    exercises: [
                                        { name: 'Footing', duration: '15min' },
                                        { name: 'Gammes', duration: '3min' },
                                        { name: 'Strides', reps: 2 }
                                    ]
                                },
                                main_work: {
                                    title: 'Intervalles VMA courts',
                                    format: '8-10 x 400m',
                                    pace: 'Allure 5km',
                                    recovery: '1min-1min30 jog',
                                    zone: 'VO2max (I)',
                                    heart_rate: '95-98% FCmax',
                                    notes: 'Rester contrôlé, toutes reps à même allure'
                                },
                                cooldown: {
                                    duration_minutes: 15,
                                    exercises: [{ name: 'Cool down', duration: '15min' }]
                                }
                            }
                        }
                    ]
                },
                intermediate: {
                    duration: [60, 75],
                    rpe: '9/10',
                    sessions: [
                        {
                            name: '1000m Intervals',
                            duration: 70,
                            structure: {
                                warmup: { duration_minutes: 20 },
                                main_work: {
                                    title: '1000m repeats',
                                    format: '5-6 x 1000m',
                                    pace: 'Allure 5km (ou légèrement plus rapide)',
                                    recovery: '2-3min jog',
                                    target_time_1000m: 'Basé sur VDOT',
                                    total_distance: '5-6km',
                                    notes: 'Classic VO2max workout. Pas trop vite sur 1ères reps.'
                                },
                                cooldown: { duration_minutes: 15 }
                            },
                            notes: 'Une des séances VO2max les plus efficaces'
                        },
                        {
                            name: 'Pyramide VMA',
                            duration: 70,
                            structure: {
                                warmup: { duration_minutes: 20 },
                                main_work: {
                                    title: 'Pyramid',
                                    format: '400m - 800m - 1200m - 1600m - 1200m - 800m - 400m',
                                    pace: 'Allure 5km (ajuster légèrement selon distance)',
                                    recovery: '1/1 ratio (durée effort = durée récup)',
                                    total_distance: '6.4km',
                                    notes: 'Variation mentalement engageante'
                                },
                                cooldown: { duration_minutes: 15 }
                            }
                        }
                    ]
                },
                advanced: {
                    duration: [70, 85],
                    rpe: '9/10',
                    sessions: [
                        {
                            name: '1600m / Mile Repeats',
                            duration: 80,
                            structure: {
                                warmup: { duration_minutes: 25 },
                                main_work: {
                                    title: 'Mile repeats',
                                    format: '4-5 x 1600m (1 mile)',
                                    pace: 'Allure 5km à 10km',
                                    recovery: '3-4min jog',
                                    total_distance: '6.4-8km',
                                    notes: 'Classique VO2max. Maintenir allure constante toutes reps.',
                                    mental: 'Douloureux mais gérable'
                                },
                                cooldown: { duration_minutes: 20 }
                            }
                        },
                        {
                            name: 'VO2max Mixed',
                            duration: 75,
                            structure: {
                                warmup: { duration_minutes: 25 },
                                main_work: {
                                    title: 'Mixed intervals',
                                    format: '3 x (1200m - 800m - 400m)',
                                    pace: 'Allure 5km',
                                    recovery: '400m jog entre reps, 3min entre sets',
                                    total_distance: '7.2km',
                                    notes: 'Variation distances = stimulus différent'
                                },
                                cooldown: { duration_minutes: 15 }
                            }
                        }
                    ]
                },
                elite: {
                    duration: [80, 100],
                    rpe: '9-10/10',
                    sessions: [
                        {
                            name: 'Canova Long Intervals',
                            duration: 95,
                            structure: {
                                warmup: { duration_minutes: 30 },
                                main_work: {
                                    title: 'Long VO2max',
                                    format: '3-4 x 2000m',
                                    pace: 'Allure 10km',
                                    recovery: '3-4min jog',
                                    total_distance: '6-8km',
                                    notes: 'Renato Canova: longs intervalles pour marathoniens',
                                    purpose: 'VO2max + résistance'
                                },
                                cooldown: { duration_minutes: 20 }
                            }
                        },
                        {
                            name: 'Jack Daniels VO2max Session',
                            duration: 90,
                            structure: {
                                warmup: { duration_minutes: 30 },
                                main_work: {
                                    title: 'Optimal VO2max stimulus',
                                    format_options: [
                                        {
                                            format: '6 x 1000m',
                                            recovery: '2-3min',
                                            pace: 'I pace (VO2max)'
                                        },
                                        {
                                            format: '5 x 1200m',
                                            recovery: '2.5-3min',
                                            pace: 'I pace'
                                        },
                                        {
                                            format: '10-12 x 600m',
                                            recovery: '90s-2min',
                                            pace: 'I pace'
                                        }
                                    ],
                                    total_time_at_intensity: '12-20min optimal',
                                    notes: 'Daniels: 12-20min à VO2max = stimulus optimal sans fatigue excessive',
                                    recovery_ratio: '1:1 ou moins (récup < durée effort)'
                                },
                                cooldown: { duration_minutes: 20 }
                            }
                        }
                    ]
                }
            }
        },

        /**
         * 4. ALLURE SPÉCIFIQUE MARATHON
         */
        marathon_pace: {
            name: 'Allure Marathon',
            category: 'specific',
            description: 'Séances spécifiques allure objectif marathon',

            ppg: {
                intermediate: {
                    sessions: [
                        {
                            name: 'Marathon Pace Introduction',
                            duration: 75,
                            structure: {
                                warmup: { duration_minutes: 15 },
                                main_work: {
                                    title: 'MP segments in long run',
                                    format: '5km easy + 3 x 3km @ MP + 5km easy',
                                    recovery: '1km jog entre segments MP',
                                    total_distance: '18km',
                                    notes: 'Habituer corps et mental à allure objectif'
                                },
                                cooldown: { duration_minutes: 10 }
                            }
                        }
                    ]
                },
                advanced: {
                    sessions: [
                        {
                            name: 'Marathon Pace Long Segments',
                            duration: 95,
                            structure: {
                                warmup: { duration_minutes: 15 },
                                main_work: {
                                    title: 'Extended MP work',
                                    format: '3km easy + 2 x 10km @ MP + 3km easy',
                                    recovery: '2km easy entre segments',
                                    total_distance: '28km',
                                    pace: 'Allure objectif marathon exacte',
                                    notes: 'Spécifique 6-8 semaines pré-marathon'
                                },
                                cooldown: { duration_minutes: 10 }
                            }
                        }
                    ]
                },
                elite: {
                    sessions: [
                        {
                            name: 'Pfitzinger Marathon Simulator',
                            duration: 120,
                            structure: {
                                warmup: { duration_minutes: 10 },
                                main_work: {
                                    title: 'Marathon simulation',
                                    format: '18-23km @ marathon pace',
                                    context: 'Dans long run de 30-35km',
                                    example: '5km easy + 20km @ MP + 5-8km easy',
                                    notes: 'Simule fatigue marathon, mental + physique',
                                    timing: '3-4 semaines avant marathon'
                                },
                                cooldown: { duration_minutes: 10 }
                            }
                        },
                        {
                            name: 'Hanson Marathon Method Long Run',
                            duration: 110,
                            structure: {
                                warmup: { duration_minutes: 10 },
                                main_work: {
                                    title: 'Hanson 16-miler',
                                    distance: '25-26km',
                                    pace: 'Marathon pace + 10-15s/km',
                                    philosophy: 'Pas de runs > 26km, mais à allure proche MP',
                                    cumulative_fatigue:
                                        'Fatigue cumulée du training = simulation marathon',
                                    notes: 'Controverse mais efficace pour certains'
                                },
                                cooldown: { duration_minutes: 10 }
                            }
                        }
                    ]
                }
            }
        },

        /**
         * 5. FARTLEK
         */
        fartlek: {
            name: 'Fartlek',
            category: 'mixed',
            description: "Jeu d'allures, travail varié non structuré",

            ppg: {
                all_levels: {
                    sessions: [
                        {
                            name: 'Fartlek Suédois Classique',
                            duration: 60,
                            structure: {
                                warmup: { duration_minutes: 15 },
                                main_work: {
                                    title: 'Fartlek libre',
                                    duration_minutes: 35,
                                    format: 'Accélérations variées selon ressenti et terrain',
                                    examples: [
                                        "Sprinter jusqu'au prochain arbre",
                                        "Tempo jusqu'en haut de la côte",
                                        'Accélération 2min puis récup 1min'
                                    ],
                                    philosophy: 'Play with speed, pas de structure rigide',
                                    benefits: 'Mental, fun, adaptation variée'
                                },
                                cooldown: { duration_minutes: 10 }
                            }
                        },
                        {
                            name: 'Fartlek Structuré',
                            duration: 70,
                            structure: {
                                warmup: { duration_minutes: 15 },
                                main_work: {
                                    title: 'Structured fartlek',
                                    format: '2 x (5min tempo, 4min easy, 3min hard, 2min easy, 1min sprint, 3min easy)',
                                    total_time: 36,
                                    notes: 'Structure mais allures varient',
                                    terrain: 'Idéal en nature, terrain varié'
                                },
                                cooldown: { duration_minutes: 15 }
                            }
                        }
                    ]
                }
            }
        },

        /**
         * 6. CÔTES
         */
        cotes: {
            name: 'Côtes / Hills',
            category: 'strength',
            description: 'Renforcement spécifique, puissance',

            ppg: {
                beginner: {
                    sessions: [
                        {
                            name: 'Côtes Courtes',
                            duration: 55,
                            structure: {
                                warmup: { duration_minutes: 15 },
                                main_work: {
                                    title: 'Short hills',
                                    format: '6-8 x 60-90s en côte',
                                    grade: '4-6% pente',
                                    effort: '85-90% effort max',
                                    recovery: 'Descente en trottinant + 1min',
                                    focus: 'Puissance, technique montée'
                                },
                                cooldown: { duration_minutes: 15 }
                            }
                        }
                    ]
                },
                intermediate: {
                    sessions: [
                        {
                            name: 'Hill Repeats Medium',
                            duration: 70,
                            structure: {
                                warmup: { duration_minutes: 20 },
                                main_work: {
                                    title: 'Hill intervals',
                                    format: '8-10 x 2-3min en côte',
                                    grade: '4-7% pente',
                                    effort: 'Threshold à VO2max effort',
                                    recovery: 'Descente facile + 90s',
                                    notes: 'Renfo + cardio combinés'
                                },
                                cooldown: { duration_minutes: 15 }
                            }
                        }
                    ]
                },
                advanced: {
                    sessions: [
                        {
                            name: 'Lydiard Hill Circuit',
                            duration: 80,
                            structure: {
                                warmup: { duration_minutes: 20 },
                                main_work: {
                                    title: 'Hill sprints + circuit',
                                    format: 'Répétitions courtes (30-60s) en côte raide',
                                    reps: '10-15',
                                    grade: '8-15% pente',
                                    effort: '95% effort',
                                    recovery: 'Descente marche + jog',
                                    benefits: 'Force spécifique, puissance, économie'
                                },
                                cooldown: { duration_minutes: 20 }
                            },
                            notes: 'Lydiard: hills = gym du coureur'
                        }
                    ]
                }
            }
        }
    },

    /**
     * MÉTHODOLOGIES
     */
    methodologies: {
        jack_daniels: {
            name: 'Jack Daniels Running Formula',
            philosophy: 'VDOT-based training, specific intensities for specific adaptations',
            key_concepts: [
                'VDOT = VO2max corrigé par économie de course',
                'Chaque zone = adaptation spécifique',
                'Quality > quantity',
                'Progression basée sur VDOT'
            ],
            zones: 'E (Easy), M (Marathon), T (Threshold), I (Intervals), R (Repetitions)',
            volume_distribution: '70-80% Easy, 20-30% Quality (T/I/R)',
            notes: 'Approche scientifique, très structurée'
        },
        pfitzinger: {
            name: 'Pete Pfitzinger Advanced Marathoning',
            philosophy: 'High mileage, lactate threshold focus, long runs with quality',
            key_features: [
                'Volume élevé (100-130km/semaine pour marathon)',
                'Beaucoup de tempo / LT work',
                'Long runs avec portions à MP',
                'Mesocycles de 3 semaines + 1 recovery',
                'Taper 2-3 semaines'
            ],
            typical_week: '1 LT, 1 VO2max, 1-2 MLR (medium long run), 1 long run, rest easy',
            best_for: 'Marathoniens expérimentés, objectif performance'
        },
        lydiard: {
            name: 'Arthur Lydiard System',
            philosophy: 'Base aerobic énorme, puis spécialisation progressive',
            phases: {
                phase1: 'Base building (12 weeks): volume élevé, easy running, long hills',
                phase2: 'Hill training (4 weeks): renforcement spécifique',
                phase3: 'Anaerobic (4 weeks): VMA, vitesse',
                phase4: 'Taper + race (2 weeks)'
            },
            volume: 'Très élevé en base (120-160km/semaine pour élite)',
            legacy: 'A formé champions olympiques (Snell, Halberg)',
            notes: 'Base aérobie = fondation de tout'
        },
        canova: {
            name: 'Renato Canova',
            philosophy: 'Specific blocks, long intervals, progression sophistiquée',
            key_features: [
                'Special blocks: combinaisons allures variées',
                'Longs intervalles (2-3km) pour marathoniens',
                'Variation stimuli chaque semaine',
                'Adaptation individualisée extrême'
            ],
            example_workout: '10km @ MP + 5km @ threshold, repeat',
            coached: 'Champions mondiaux marathon (Kiprotich, Kirui)',
            complexity: 'Très avancé, nécessite expérience'
        },
        hansons: {
            name: 'Hansons Marathon Method',
            philosophy: 'Cumulative fatigue, no 30+km runs, specific pace work',
            unique_approach: [
                'Long run max = 25km (vs 32-35km autres méthodes)',
                'Volume total élevé mais distributed',
                'Beaucoup de MP work',
                'Fatigue cumulée simule fin marathon'
            ],
            volume: '90-110km/semaine',
            controversy: 'Pas de 30km+ contesté, mais results probants',
            best_for: 'Runners avec peu temps pour très longs runs'
        }
    },

    /**
     * PLANS D'ENTRAÎNEMENT PAR OBJECTIF
     */
    training_plans: {
        '5km': {
            name: 'Plan 5km',
            duration_weeks: 8,
            phases: {
                weeks_1_4: 'PPG - Base aérobie + introduction VMA',
                weeks_5_7: 'PPO - Volume VMA augmenté, spécifique 5km',
                week_8: 'PPS - Taper, course'
            },
            weekly_structure: {
                sessions_per_week: '4-5',
                distribution: '1 long run, 1 tempo, 1-2 VMA, 1-2 easy'
            },
            key_sessions: ['1000m repeats @ 5km pace', '400m repeats @ 3km pace', 'Tempo 20-30min']
        },
        '10km': {
            name: 'Plan 10km',
            duration_weeks: 10,
            phases: {
                weeks_1_5: 'PPG - Base + threshold development',
                weeks_6_9: 'PPO - VO2max + spécifique 10km',
                week_10: 'PPS - Taper'
            },
            weekly_structure: {
                sessions_per_week: '5-6',
                distribution: '1 long run, 1-2 tempo/threshold, 1 VO2max, 2-3 easy'
            },
            key_sessions: ['Cruise intervals 3-4 x 10min', '1600m repeats', 'Tempo 30-40min']
        },
        semi_marathon: {
            name: 'Plan Semi-Marathon',
            duration_weeks: 12,
            phases: {
                weeks_1_6: 'PPG - Base aérobie, volume',
                weeks_7_11: 'PPO - Threshold, spécifique semi',
                week_12: 'PPS - Taper'
            },
            weekly_structure: {
                sessions_per_week: '5-6',
                distribution: '1 long run (18-22km), 1-2 threshold, 1 VO2max, 3-4 easy'
            },
            key_sessions: [
                'Long run avec tempo finish',
                'Tempo 40-50min',
                'Cruise intervals 4 x 10-12min',
                'Long run progression'
            ],
            volume_peak: '65-90km/semaine'
        },
        marathon: {
            name: 'Plan Marathon',
            duration_weeks: 16,
            phases: {
                weeks_1_8: 'PPG - Base building, volume progression',
                weeks_9_14: 'PPO - Spécifique marathon, MP work',
                weeks_15_16: 'PPS - Taper'
            },
            weekly_structure: {
                sessions_per_week: '5-7',
                distribution: '1 long run (28-35km), 1-2 threshold/MP, 1 VO2max (early), 4-5 easy'
            },
            key_sessions: [
                'Long run 28-35km',
                'Long run avec 15-20km @ MP',
                'Tempo 50-60min ou cruise intervals',
                '2 x 10km @ MP',
                'Medium-long run 20-23km'
            ],
            volume_peak: '90-130km/semaine (selon niveau)',
            taper: 'Réduction 20-30% semaine -2, 40-50% semaine -1'
        }
    },

    /**
     * STANDARDS ÉLITE
     */
    elite_standards: {
        male: {
            '5km': {
                elite: '< 13:30',
                world_class: '< 13:00',
                world_record: '12:35 (Joshua Cheptegei, 2020)'
            },
            '10km': {
                elite: '< 28:00',
                world_class: '< 27:00',
                world_record: '26:11 (Joshua Cheptegei, 2020)'
            },
            semi_marathon: {
                elite: '< 1h02',
                world_class: '< 59:00',
                world_record: '57:31 (Jacob Kiplimo, 2021)'
            },
            marathon: {
                elite: '< 2h10',
                world_class: '< 2h05',
                world_record: '2:00:35 (Kelvin Kiptum, 2023)'
            },
            vo2max: '> 75 ml/kg/min',
            running_economy: '< 180 ml/kg/km',
            weekly_volume: '150-220km'
        },
        female: {
            '5km': {
                elite: '< 15:30',
                world_class: '< 14:30',
                world_record: '14:00 (Beatrice Chebet, 2024)'
            },
            '10km': {
                elite: '< 32:00',
                world_class: '< 30:30',
                world_record: '28:54 (Beatrice Chebet, 2024)'
            },
            semi_marathon: {
                elite: '< 1h09',
                world_class: '< 1h05',
                world_record: '1:02:52 (Letesenbet Gidey, 2021)'
            },
            marathon: {
                elite: '< 2h25',
                world_class: '< 2h17',
                world_record: '2:11:53 (Tigst Assefa, 2023)'
            },
            vo2max: '> 70 ml/kg/min',
            running_economy: '< 200 ml/kg/km',
            weekly_volume: '120-180km'
        }
    },

    /**
     * PÉRIODISATION EXEMPLE
     */
    periodization_example: {
        marathon_16_weeks: {
            name: 'Périodisation Marathon 16 semaines',
            phase_1: {
                name: 'PPG - Base Building',
                weeks: '1-8',
                focus: 'Volume, endurance aérobie',
                sessions_type: 'Mainly easy runs, 1 long run, 1 tempo, optional VO2max',
                volume: 'Progressive: 70km → 110km',
                long_run: '18km → 30km'
            },
            phase_2: {
                name: 'PPO - Specific Preparation',
                weeks: '9-14',
                focus: 'Marathon specific work, threshold, MP',
                sessions_type: 'Long run avec MP, tempo/threshold, reduced VO2max',
                volume: 'Peak: 100-130km',
                long_run: '30-35km avec portions MP',
                key_sessions: [
                    'Week 10: 32km avec 16km @ MP',
                    'Week 12: 2 x 10km @ MP',
                    'Week 14: 35km avec 20km @ MP (peak workout)'
                ]
            },
            phase_3: {
                name: 'PPS - Taper',
                weeks: '15-16',
                focus: 'Récupération, fraîcheur, confiance',
                week_15: 'Volume -30%, maintien intensité',
                week_16: 'Volume -50%, très léger',
                notes: 'Taper = réduction volume, pas intensité. Dernière quality session = J-10 à J-7.'
            }
        }
    }
};

// Export global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RunningDatabase;
} else {
    window.RunningDatabase = RunningDatabase;
}
