/**
 * TRAIL RUNNING - BASE DE DONNÉES COMPLÈTE
 * Méthodologies internationales : ITRA, UTMB Training, Kilian Jornet, Jim Walmsley
 * Périodisation : PPG (Base) → PPO (Spécifique) → PPS (Compétition)
 *
 * Structure par :
 * - Type de séance (endurance, seuil, VMA, côtes, trail technique, force)
 * - Phase de périodisation (PPG/PPO/PPS)
 * - RPE cible (1-10)
 * - Niveau (débutant, intermédiaire, avancé, élite)
 * - Durée et volume
 */

const TrailRunningDatabase = {
    sport: 'trail',
    name: 'Trail Running',

    /**
     * ZONES D'INTENSITÉ TRAIL (basé sur modèle ITRA/Lydiard)
     */
    zones: {
        z1: {
            name: 'Récupération Active',
            intensity: '50-60% FCmax',
            rpe: '1-3/10',
            lactate: '<2 mmol/L',
            description: 'Allure très facile, conversation aisée, récupération',
            usage: 'Échauffement, cooldown, récupération entre séries'
        },
        z2: {
            name: 'Endurance Fondamentale',
            intensity: '60-70% FCmax',
            rpe: '4-5/10',
            lactate: '2-3 mmol/L',
            description: 'Allure conversationnelle, base aérobie',
            usage: 'Volume, sorties longues, trails longs (UTMB style)'
        },
        z3: {
            name: 'Tempo / Endurance Active',
            intensity: '70-80% FCmax',
            rpe: '6-7/10',
            lactate: '3-4 mmol/L',
            description: 'Allure soutenue mais contrôlée, phrases courtes',
            usage: 'Trails moyens, préparation marathon trail'
        },
        z4: {
            name: 'Seuil Lactique',
            intensity: '80-88% FCmax',
            rpe: '7-8/10',
            lactate: '4-6 mmol/L',
            description: 'Effort difficile, quelques mots possibles',
            usage: 'Trails courts, races 10-30km'
        },
        z5: {
            name: 'VMA / VO2max',
            intensity: '88-95% FCmax',
            rpe: '8-9/10',
            lactate: '>6 mmol/L',
            description: 'Effort très dur, pas de conversation',
            usage: 'Verticales, skyrunning, trails <15km'
        },
        z6: {
            name: 'Anaérobie / Sprint',
            intensity: '95-100% FCmax',
            rpe: '9-10/10',
            lactate: '>>8 mmol/L',
            description: 'Effort maximal, non soutenable',
            usage: 'Sprints finaux, entraînement puissance'
        }
    },

    /**
     * TYPES DE SÉANCES PAR PHASE
     */
    sessionTypes: {
        // ========== ENDURANCE FONDAMENTALE ==========
        endurance_fondamentale: {
            name: 'Endurance Fondamentale',
            category: 'Aérobie',
            zones: ['z1', 'z2'],

            // PPG - Base Building (Volume++)
            ppg: {
                beginner: {
                    duration: [60, 90],
                    rpe: '4-5/10',
                    volume_week: '2-3 séances',
                    description: 'Construction base aérobie, habituation volume',
                    sessions: [
                        {
                            name: 'Sortie EF Plate',
                            duration: 60,
                            structure: {
                                warmup: {
                                    duration: 10,
                                    exercises: [
                                        'Marche dynamique',
                                        'Mobilité chevilles',
                                        'Gammes légères'
                                    ]
                                },
                                main: {
                                    duration: 45,
                                    type: 'Course continue Z2',
                                    terrain: 'Plat ou vallonné léger',
                                    pace: 'Conversationnel',
                                    notes: 'Pas de D+ significatif, focus technique de course'
                                },
                                cooldown: {
                                    duration: 5,
                                    exercises: ['Marche', 'Étirements passifs']
                                }
                            }
                        },
                        {
                            name: 'Sortie EF Vallonnée',
                            duration: 75,
                            structure: {
                                warmup: {
                                    duration: 10,
                                    exercises: ['Échauffement progressif plat']
                                },
                                main: {
                                    duration: 60,
                                    type: 'Course Z2 avec D+',
                                    terrain: 'Vallonné 200-400m D+',
                                    pace: 'Z2 montées, Z1-Z2 descentes',
                                    notes: 'Marche possible dans montées raides'
                                },
                                cooldown: { duration: 5, exercises: ['Retour calme plat'] }
                            }
                        }
                    ]
                },
                intermediate: {
                    duration: [90, 150],
                    rpe: '4-6/10',
                    volume_week: '3-4 séances',
                    description: 'Développement capacité aérobie, augmentation volume',
                    sessions: [
                        {
                            name: 'Sortie Longue Trail',
                            duration: 120,
                            structure: {
                                warmup: { duration: 15, exercises: ['Progressif 15min Z1→Z2'] },
                                main: {
                                    duration: 95,
                                    type: 'Course continue Z2',
                                    terrain: 'Trail vallonné 600-1000m D+',
                                    pace: 'Z2 strict, marche montées >15%',
                                    nutrition: 'Gel toutes les 45min',
                                    hydratation: '500ml/h',
                                    notes: 'Simulation UTMB light'
                                },
                                cooldown: {
                                    duration: 10,
                                    exercises: ['Z1 plat', 'Étirements actifs']
                                }
                            }
                        },
                        {
                            name: 'EF Mixte Route/Trail',
                            duration: 90,
                            structure: {
                                warmup: { duration: 10, exercises: ['Gammes sur route'] },
                                main: {
                                    duration: 75,
                                    type: '50% route Z2 + 50% trail Z2',
                                    terrain: 'Mix asphalte/sentiers',
                                    notes: 'Adaptation surfaces variées'
                                },
                                cooldown: { duration: 5, exercises: ['Retour calme'] }
                            }
                        }
                    ]
                },
                advanced: {
                    duration: [120, 240],
                    rpe: '5-6/10',
                    volume_week: '4-5 séances',
                    description: 'Volume élevé, préparation ultras',
                    sessions: [
                        {
                            name: 'Ultra Long Trail',
                            duration: 180,
                            structure: {
                                warmup: { duration: 15, exercises: ['Progressif léger'] },
                                main: {
                                    duration: 160,
                                    type: 'Course Z2 + marche active',
                                    terrain: 'Trail montagne 1500-2500m D+',
                                    pace: 'Z2 plat, marche >12%, course descentes',
                                    nutrition: 'Stratégie ravitaillement toutes les 30-45min',
                                    mental: 'Gestion effort long, discipline allure',
                                    notes: 'Spécifique UTMB / CCC / TDS'
                                },
                                cooldown: { duration: 5, exercises: ['Marche active'] }
                            }
                        }
                    ]
                },
                elite: {
                    duration: [150, 360],
                    rpe: '5-7/10',
                    volume_week: '5-6 séances + double journée possible',
                    description: 'Volume maximal, spécifique grand trail',
                    sessions: [
                        {
                            name: 'Mega Long Trail',
                            duration: 300,
                            structure: {
                                warmup: { duration: 20, exercises: ['Progressif montée douce'] },
                                main: {
                                    duration: 270,
                                    type: 'Sortie 5h Z2-Z3 trail alpin',
                                    terrain: 'Haute montagne 3000-4000m D+',
                                    elevation: '2000-3000m altitude',
                                    pace: 'Course plat/descente, marche rapide montée',
                                    nutrition: 'Nutrition solide + liquide, 80g CHO/h',
                                    mental: 'Visualisation course, gestion fatigue',
                                    specifique: 'UTMB / Hardrock / Tor des Géants prep',
                                    notes: 'Kilian Jornet style - volume vertical'
                                },
                                cooldown: { duration: 10, exercises: ['Descente douce'] }
                            }
                        }
                    ]
                }
            },

            // PPO - Préparation Spécifique
            ppo: {
                beginner: {
                    duration: [45, 75],
                    rpe: '5-6/10',
                    description: 'EF avec spécificité terrain objectif',
                    sessions: [
                        {
                            name: 'EF Spécifique Objectif',
                            duration: 60,
                            notes: 'Même type de terrain que course objectif'
                        }
                    ]
                },
                intermediate: {
                    duration: [75, 120],
                    rpe: '5-7/10',
                    description: 'Sorties longues spécifiques avec intensité simulée',
                    sessions: [
                        {
                            name: 'Sortie Longue Race Pace',
                            duration: 105,
                            structure: {
                                warmup: { duration: 15, exercises: ['Échauffement progressif'] },
                                main: {
                                    duration: 80,
                                    type: '60min Z2 + 20min Z3 (race pace)',
                                    notes: 'Simulation allure course dans fatigue'
                                },
                                cooldown: { duration: 10, exercises: ['Retour calme'] }
                            }
                        }
                    ]
                },
                advanced: {
                    duration: [120, 180],
                    rpe: '6-7/10',
                    description: 'Longues spécifiques race pace',
                    sessions: [
                        {
                            name: 'Long Run Race Simulation',
                            duration: 150,
                            structure: {
                                main: {
                                    type: '90min Z2 + 45min Z3 + 15min Z2',
                                    notes: 'Tester nutrition/hydratation course'
                                }
                            }
                        }
                    ]
                }
            },

            // PPS - Affûtage
            pps: {
                beginner: {
                    duration: [30, 60],
                    rpe: '4-5/10',
                    description: 'Maintien forme, volume réduit',
                    notes: 'Réduction 40-50% volume'
                },
                intermediate: {
                    duration: [45, 75],
                    rpe: '4-6/10',
                    description: 'Séances courtes qualité, fraîcheur',
                    notes: 'Intensité maintenue, volume -40%'
                },
                advanced: {
                    duration: [60, 90],
                    rpe: '5-6/10',
                    description: 'Affûtage progressif, pics intensité courts',
                    notes: 'Volume -30%, intensité ponctuelle'
                }
            }
        },

        // ========== SEUIL / TEMPO ==========
        seuil_tempo: {
            name: 'Seuil Lactique / Tempo',
            category: 'Mixte Aérobie-Anaérobie',
            zones: ['z3', 'z4'],

            ppg: {
                beginner: {
                    duration: [45, 60],
                    rpe: '6-7/10',
                    volume_week: '1 séance',
                    description: 'Introduction au seuil, blocs courts',
                    sessions: [
                        {
                            name: 'Tempo Introduction',
                            duration: 50,
                            structure: {
                                warmup: {
                                    duration: 15,
                                    exercises: ['15min Z1-Z2', 'Gammes', '3x100m progressif']
                                },
                                main: {
                                    duration: 25,
                                    type: '3x (6min Z3 + 2min Z1)',
                                    total_tempo: '18min',
                                    notes: 'Allure soutenue mais contrôlée'
                                },
                                cooldown: { duration: 10, exercises: ['10min Z1', 'Étirements'] }
                            }
                        }
                    ]
                },
                intermediate: {
                    duration: [60, 75],
                    rpe: '7-8/10',
                    volume_week: '1-2 séances',
                    description: 'Développement seuil, blocs moyens',
                    sessions: [
                        {
                            name: 'Tempo Blocs',
                            duration: 70,
                            structure: {
                                warmup: {
                                    duration: 20,
                                    exercises: [
                                        '20min progressif Z1→Z2',
                                        'Éducatifs',
                                        'Accélérations'
                                    ]
                                },
                                main: {
                                    duration: 40,
                                    type: '2x (15min Z4 + 5min Z2) ou 1x20min Z4',
                                    terrain: 'Plat ou légèrement vallonné',
                                    pace: 'Seuil lactique (~marathon pace trail)',
                                    notes: 'FC stable, allure régulière'
                                },
                                cooldown: { duration: 10, exercises: ['10min Z1'] }
                            }
                        },
                        {
                            name: 'Tempo Trail',
                            duration: 65,
                            structure: {
                                warmup: { duration: 15, exercises: ['Échauffement trail'] },
                                main: {
                                    duration: 40,
                                    type: '3x (10min Z3-Z4 trail + 3min marche)',
                                    terrain: 'Trail vallonné',
                                    notes: 'Gestion allure en montée'
                                },
                                cooldown: { duration: 10, exercises: ['Retour calme'] }
                            }
                        }
                    ]
                },
                advanced: {
                    duration: [75, 90],
                    rpe: '7-9/10',
                    volume_week: '2 séances',
                    description: 'Seuil long, spécifique trail',
                    sessions: [
                        {
                            name: 'Tempo Long',
                            duration: 85,
                            structure: {
                                warmup: { duration: 20, exercises: ['Échauffement complet'] },
                                main: {
                                    duration: 55,
                                    type: '1x 40min Z4 ou 2x20min Z4',
                                    pace: 'Half-marathon trail pace',
                                    notes: 'Jim Walmsley style - rythme élevé soutenu'
                                },
                                cooldown: { duration: 10, exercises: ['Retour calme + étirements'] }
                            }
                        }
                    ]
                },
                elite: {
                    duration: [75, 105],
                    rpe: '8-9/10',
                    volume_week: '2-3 séances',
                    description: 'Seuil haute intensité, spécifique compétition',
                    sessions: [
                        {
                            name: 'Tempo Elite Trail',
                            duration: 90,
                            structure: {
                                warmup: {
                                    duration: 25,
                                    exercises: [
                                        'Échauffement progressif',
                                        'Gammes complètes',
                                        'Sprints courts'
                                    ]
                                },
                                main: {
                                    duration: 55,
                                    type: '1x 45min Z4 trail montagne',
                                    terrain: 'Trail technique avec D+',
                                    elevation_gain: '600-800m',
                                    pace: '10k-15k trail race pace',
                                    mental: 'Concentration technique + allure',
                                    notes: 'Kilian style - tempo vertical'
                                },
                                cooldown: { duration: 10, exercises: ['Descente douce'] }
                            }
                        }
                    ]
                }
            },

            ppo: {
                intermediate: {
                    sessions: [
                        {
                            name: 'Tempo Spécifique Course',
                            duration: 75,
                            structure: {
                                main: {
                                    type: '2x (15min race pace + 5min récup)',
                                    notes: 'Même D+ et terrain que objectif'
                                }
                            }
                        }
                    ]
                },
                advanced: {
                    sessions: [
                        {
                            name: 'Tempo Race Simulation',
                            duration: 90,
                            structure: {
                                main: {
                                    type: '30min Z3 + 20min Z4 + 10min Z3',
                                    notes: 'Simulation départ course + montée clé'
                                }
                            }
                        }
                    ]
                }
            },

            pps: {
                all_levels: {
                    description: 'Séances courtes haute qualité',
                    notes: 'Volume -40%, pics intensité maintenus'
                }
            }
        },

        // ========== VMA / FRACTIONNÉ ==========
        vma_fractionne: {
            name: 'VMA / Fractionnés Courts',
            category: 'VO2max',
            zones: ['z5'],

            ppg: {
                beginner: {
                    duration: [45, 60],
                    rpe: '7-8/10',
                    volume_week: '0-1 séance',
                    description: 'Introduction VMA, récup complètes',
                    sessions: [
                        {
                            name: 'VMA Découverte',
                            duration: 50,
                            structure: {
                                warmup: {
                                    duration: 20,
                                    exercises: ['20min EF', 'Gammes athlé', '3x100m accélération']
                                },
                                main: {
                                    duration: 20,
                                    type: '8-10x (30s Z5 + 30s récup marche)',
                                    total_vma: '4-5min',
                                    terrain: 'Piste ou route plate',
                                    notes: 'Introduction VMA courte'
                                },
                                cooldown: { duration: 10, exercises: ['10min footing Z1'] }
                            }
                        }
                    ]
                },
                intermediate: {
                    duration: [60, 75],
                    rpe: '8-9/10',
                    volume_week: '1 séance',
                    description: 'VMA classique piste, développement VO2max',
                    sessions: [
                        {
                            name: '400m Piste',
                            duration: 65,
                            structure: {
                                warmup: {
                                    duration: 25,
                                    exercises: [
                                        '20min EF',
                                        'Gammes complètes',
                                        'Accélérations progressives'
                                    ]
                                },
                                main: {
                                    duration: 30,
                                    type: "12x400m Z5 récup 200m trot (1'30)",
                                    pace: 'VMA (90-95% vitesse max)',
                                    total_vma: '~12min',
                                    notes: 'Séance classique Billat'
                                },
                                cooldown: {
                                    duration: 10,
                                    exercises: ['10min Z1', 'Étirements actifs']
                                }
                            }
                        },
                        {
                            name: '1000m Piste',
                            duration: 70,
                            structure: {
                                warmup: { duration: 25, exercises: ['Échauffement complet'] },
                                main: {
                                    duration: 35,
                                    type: '5-6x1000m Z5 récup 2-3min',
                                    pace: '95-100% VMA',
                                    notes: 'Développement puissance aérobie'
                                },
                                cooldown: { duration: 10, exercises: ['Retour calme'] }
                            }
                        }
                    ]
                },
                advanced: {
                    duration: [75, 90],
                    rpe: '8-9/10',
                    volume_week: '1-2 séances',
                    description: 'VMA trail spécifique, côtes',
                    sessions: [
                        {
                            name: 'Côtes Courtes VMA',
                            duration: 75,
                            structure: {
                                warmup: {
                                    duration: 25,
                                    exercises: ['Échauffement trail', 'Gammes en côte']
                                },
                                main: {
                                    duration: 40,
                                    type: '10-12x (1min30 montée Z5 + descente récup)',
                                    terrain: 'Côte 8-12% régulière',
                                    elevation_per_rep: '80-120m',
                                    notes: 'VMA spécifique trail vertical'
                                },
                                cooldown: { duration: 10, exercises: ['Footing plat Z1'] }
                            }
                        }
                    ]
                },
                elite: {
                    duration: [75, 105],
                    rpe: '9-10/10',
                    volume_week: '2 séances',
                    description: 'VMA haute intensité, spécifique skyrunning',
                    sessions: [
                        {
                            name: 'Vertical VMA Elite',
                            duration: 90,
                            structure: {
                                warmup: {
                                    duration: 30,
                                    exercises: ['Échauffement progressif montée']
                                },
                                main: {
                                    duration: 50,
                                    type: '8-10x (2-3min montée raide Z5 + descente technique)',
                                    terrain: 'Montée 15-25% trail alpin',
                                    elevation_per_rep: '150-250m',
                                    technique: 'Course/marche rapide power, bâtons possible',
                                    notes: 'Spécifique Vertical races, Skyrunner style'
                                },
                                cooldown: { duration: 10, exercises: ['Descente douce'] }
                            }
                        }
                    ]
                }
            },

            ppo: {
                all_levels: {
                    description: 'VMA spécifique profil course',
                    notes: 'Terrain et intensité = course objectif'
                }
            },

            pps: {
                all_levels: {
                    description: 'Pics VMA courts, fraîcheur',
                    notes: 'Volume total VMA -50%, intensité maintenue'
                }
            }
        }

        // ... (continuer avec côtes, trail technique, force, sortie longue ultra, etc.)
    },

    /**
     * MÉTHODOLOGIES SPÉCIFIQUES
     */
    methodologies: {
        lydiard: {
            name: 'Arthur Lydiard Method',
            focus: 'Base aérobie massive puis intensité',
            phases: {
                base: { weeks: 8, volume_increase: '10%/semaine', intensity: 'Z1-Z2 majoritaire' },
                hill: { weeks: 4, focus: 'Côtes force-endurance' },
                speed: { weeks: 4, focus: 'VMA et seuil' }
            }
        },
        utmb_training: {
            name: 'UTMB Training Plan',
            focus: 'Volume vertical, endurance ultra',
            specifiques: ['Back-to-back long runs', 'Night running', 'Nutrition strategy']
        },
        kilian_jornet: {
            name: 'Kilian Jornet Approach',
            focus: 'Volume énorme, vertical, jeu',
            philosophy: 'Trail as fun, très gros volume Z2, vertical constant',
            volume_hebdo: '150-300km selon période'
        }
    },

    /**
     * MOUVEMENTS / EXERCICES COMPLÉMENTAIRES TRAIL
     */
    strength_exercises: {
        force_generale: [
            { name: 'Squats', sets: '3-4', reps: '8-12', notes: 'Force jambes fondamentale' },
            { name: 'Fentes', sets: '3', reps: '10-12/jambe', notes: 'Unilatéral important trail' },
            { name: 'Soulevé de terre', sets: '3-4', reps: '6-10', notes: 'Chaîne postérieure' },
            { name: 'Nordic Hamstring', sets: '3', reps: '6-8', notes: 'Prévention descentes' },
            { name: 'Calf raises', sets: '3-4', reps: '15-20', notes: 'Mollets essentiels montée' },
            { name: 'Step-ups lestés', sets: '3', reps: '12-15/jambe', notes: 'Spécifique montée' },
            { name: 'Hip thrusts', sets: '3', reps: '12-15', notes: 'Puissance fessiers' }
        ],
        pliometrie: [
            { name: 'Box jumps', sets: '3-4', reps: '8-10', notes: 'Puissance verticale' },
            { name: 'Bounding', distance: '50-100m', reps: '6-8', notes: 'Économie de course' },
            { name: 'Skipping', distance: '30-50m', reps: '6-8', notes: 'Réactivité' },
            { name: 'Drop jumps', sets: '3', reps: '6-8', notes: 'Amortissement descentes' }
        ],
        proprioception: [
            {
                name: 'Single leg balance',
                duration: '30-60s/jambe',
                sets: '3',
                notes: 'Chevilles trail'
            },
            {
                name: 'Bosu squats',
                sets: '3',
                reps: '10-12',
                notes: 'Stabilité terrains instables'
            },
            { name: 'Slackline', duration: '5-10min', notes: 'Équilibre global' }
        ],
        core_specifique: [
            {
                name: 'Planche variations',
                duration: '45-90s',
                sets: '3-4',
                notes: 'Stabilité tronc course'
            },
            { name: 'Russian twists', sets: '3', reps: '20-30', notes: 'Rotation déséquilibres' },
            { name: 'Mountain climbers', duration: '30-45s', sets: '3-4', notes: 'Core dynamique' }
        ]
    },

    /**
     * PLANS TYPE PAR OBJECTIF
     */
    race_plans: {
        trail_10k: {
            duration_weeks: 8,
            profile: { distance: '10-15km', elevation: '500-800m' },
            phases: {
                ppg: { weeks: 4, focus: 'Base + VMA' },
                ppo: { weeks: 3, focus: 'Seuil + spécifique' },
                pps: { weeks: 1, focus: 'Affûtage' }
            }
        },
        trail_marathon: {
            duration_weeks: 16,
            profile: { distance: '40-50km', elevation: '2000-3000m' },
            phases: {
                ppg: { weeks: 8, focus: 'Volume base aérobie' },
                ppo: { weeks: 6, focus: 'Seuil long + sorties longues spé' },
                pps: { weeks: 2, focus: 'Taper progressif' }
            }
        },
        ultra_trail: {
            duration_weeks: 24,
            profile: { distance: '80-170km', elevation: '5000-10000m' },
            phases: {
                ppg: { weeks: 12, focus: 'Volume massif, back-to-back' },
                ppo: { weeks: 10, focus: 'Sorties ultra longues, race pace' },
                pps: { weeks: 2, focus: 'Taper strict, mental' }
            }
        }
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TrailRunningDatabase;
} else {
    window.TrailRunningDatabase = TrailRunningDatabase;
}
