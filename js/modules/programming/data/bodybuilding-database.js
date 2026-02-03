/**
 * BODYBUILDING / MUSCULATION DATABASE
 * Base de données complète pour l'entraînement en musculation et bodybuilding
 *
 * Standards internationaux basés sur:
 * - IFBB Pro standards
 * - Renaissance Periodization (Dr. Mike Israetel)
 * - Mountain Dog Training (John Meadows)
 * - Dorian Yates Blood & Guts
 * - Arnold Schwarzenegger methodology
 * - Science-based hypertrophy research
 */

const BodybuildingDatabase = {
    sport: 'build',
    name: 'Musculation / Bodybuilding',
    description: 'Hypertrophy, strength, and physique development',

    /**
     * ZONES D'INTENSITÉ MUSCULATION
     */
    zones: {
        endurance_musculaire: {
            name: 'Endurance Musculaire',
            intensity: '40-60% 1RM',
            reps: '15-30',
            rpe: '5-6/10',
            rest: '30-60s',
            purpose: 'Capillarisation, endurance locale, récupération active',
            lactate: 'Modéré',
            muscle_fiber: 'Type I (slow-twitch)'
        },
        hypertrophie_metabolique: {
            name: 'Hypertrophie Métabolique',
            intensity: '60-75% 1RM',
            reps: '12-20',
            rpe: '7-8/10',
            rest: '45-90s',
            purpose: 'Stress métabolique, pompe, volume',
            lactate: 'Élevé',
            muscle_fiber: 'Type IIa',
            techniques: ['Drop sets', 'Rest-pause', 'Supersets']
        },
        hypertrophie_tension: {
            name: 'Hypertrophie par Tension Mécanique',
            intensity: '70-85% 1RM',
            reps: '6-12',
            rpe: '8-9/10',
            rest: '90-180s',
            purpose: 'Tension mécanique maximale, croissance musculaire optimale',
            lactate: 'Modéré-élevé',
            muscle_fiber: 'Type IIa/IIx',
            note: "Zone optimale pour la plupart de l'hypertrophie"
        },
        force_maximale: {
            name: 'Force Maximale',
            intensity: '85-95% 1RM',
            reps: '1-6',
            rpe: '9-10/10',
            rest: '3-5min',
            purpose: 'Force maximale, recrutement nerveux',
            lactate: 'Faible',
            muscle_fiber: 'Type IIx (fast-twitch)',
            note: "Développe la force mais moins d'hypertrophie directe"
        },
        puissance: {
            name: 'Puissance',
            intensity: '50-70% 1RM',
            reps: '3-6',
            rpe: '7-8/10',
            rest: '2-3min',
            execution: 'Explosive',
            purpose: 'Vitesse, explosivité, puissance',
            note: 'Moins utilisé en bodybuilding classique'
        }
    },

    /**
     * TYPES DE SÉANCES
     */
    sessionTypes: {
        /**
         * 1. PUSH (Poussée)
         */
        push: {
            name: 'Push (Pectoraux, Épaules, Triceps)',
            category: 'split',
            description: 'Tous les mouvements de poussée du haut du corps',

            ppg: {
                beginner: {
                    duration: [60, 75],
                    rpe: '6-7/10',
                    frequency_per_week: 2,
                    sessions: [
                        {
                            name: 'Push Débutant - Volume Modéré',
                            duration: 70,
                            structure: {
                                warmup: {
                                    duration_minutes: 10,
                                    exercises: [
                                        { name: 'Cardio léger', duration: '5min' },
                                        { name: 'Rotations épaules', reps: 20 },
                                        {
                                            name: 'Échauffement spécifique',
                                            sets: 2,
                                            note: '50% puis 70% du poids de travail'
                                        }
                                    ]
                                },
                                main_work: {
                                    exercises: [
                                        {
                                            name: 'Développé couché barre',
                                            muscle_group: 'Pectoraux',
                                            sets: 3,
                                            reps: '8-10',
                                            intensity: '70-75% 1RM',
                                            rest: '2min',
                                            tempo: '2-0-1-0',
                                            notes: 'Exercice principal, focus technique'
                                        },
                                        {
                                            name: 'Développé incliné haltères',
                                            muscle_group: 'Pectoraux (haut)',
                                            sets: 3,
                                            reps: '10-12',
                                            intensity: '70% 1RM',
                                            rest: '90s',
                                            tempo: '2-0-1-0'
                                        },
                                        {
                                            name: 'Développé militaire barre',
                                            muscle_group: 'Épaules',
                                            sets: 3,
                                            reps: '8-10',
                                            intensity: '70% 1RM',
                                            rest: '2min',
                                            tempo: '2-0-1-0'
                                        },
                                        {
                                            name: 'Élévations latérales haltères',
                                            muscle_group: 'Épaules (deltoïdes latéraux)',
                                            sets: 3,
                                            reps: '12-15',
                                            intensity: 'Modérée',
                                            rest: '60s',
                                            tempo: '1-1-1-0',
                                            notes: 'Contrôle strict, pas de balancement'
                                        },
                                        {
                                            name: 'Extension triceps poulie haute',
                                            muscle_group: 'Triceps',
                                            sets: 3,
                                            reps: '12-15',
                                            rest: '60s',
                                            tempo: '1-0-1-1',
                                            notes: 'Coudes fixes'
                                        }
                                    ],
                                    volume_total: '15 séries'
                                },
                                cooldown: {
                                    duration_minutes: 5,
                                    exercises: [
                                        { name: 'Étirements pectoraux', duration: '2min' },
                                        { name: 'Étirements épaules', duration: '2min' },
                                        { name: 'Étirements triceps', duration: '1min' }
                                    ]
                                }
                            },
                            notes: "Focus sur l'apprentissage technique. Progression linéaire."
                        }
                    ]
                },
                intermediate: {
                    duration: [75, 90],
                    rpe: '7-8/10',
                    frequency_per_week: 2,
                    sessions: [
                        {
                            name: 'Push Intermédiaire - Hypertrophie',
                            duration: 85,
                            structure: {
                                warmup: {
                                    duration_minutes: 12,
                                    exercises: [
                                        { name: 'Cardio', duration: '5min' },
                                        { name: 'Mobilité épaules', duration: '3min' },
                                        { name: 'Échauffement pyramidal', sets: 3 }
                                    ]
                                },
                                main_work: {
                                    exercises: [
                                        {
                                            name: 'Développé couché barre',
                                            muscle_group: 'Pectoraux',
                                            sets: 4,
                                            reps: '6-8',
                                            intensity: '75-80% 1RM',
                                            rest: '2-3min',
                                            tempo: '3-0-1-0',
                                            notes: 'Force + hypertrophie'
                                        },
                                        {
                                            name: 'Développé incliné haltères',
                                            muscle_group: 'Pectoraux haut',
                                            sets: 4,
                                            reps: '8-12',
                                            intensity: '70-75% 1RM',
                                            rest: '90s',
                                            tempo: '3-1-1-0',
                                            notes: 'Stretch en bas, contraction en haut'
                                        },
                                        {
                                            name: 'Écartés inclinés haltères',
                                            muscle_group: 'Pectoraux (étirement)',
                                            sets: 3,
                                            reps: '10-15',
                                            rest: '60s',
                                            tempo: '2-2-1-0',
                                            notes: "Focus sur l'étirement et la contraction"
                                        },
                                        {
                                            name: 'Développé militaire barre',
                                            muscle_group: 'Épaules',
                                            sets: 4,
                                            reps: '6-10',
                                            intensity: '75% 1RM',
                                            rest: '2min',
                                            tempo: '2-0-1-0'
                                        },
                                        {
                                            name: 'Élévations latérales',
                                            muscle_group: 'Deltoïdes latéraux',
                                            sets: 4,
                                            reps: '12-15',
                                            rest: '45s',
                                            tempo: '1-1-1-1',
                                            technique: 'Drop set sur dernière série'
                                        },
                                        {
                                            name: 'Développé Arnold',
                                            muscle_group: 'Épaules (complet)',
                                            sets: 3,
                                            reps: '10-12',
                                            rest: '90s',
                                            notes: 'Rotation complète'
                                        },
                                        {
                                            name: 'Dips lestés',
                                            muscle_group: 'Pectoraux bas + Triceps',
                                            sets: 3,
                                            reps: '8-12',
                                            rest: '90s',
                                            notes: 'Penché en avant pour pectoraux'
                                        },
                                        {
                                            name: 'Extension triceps barre EZ',
                                            muscle_group: 'Triceps (longue portion)',
                                            sets: 3,
                                            reps: '10-12',
                                            rest: '60s',
                                            tempo: '2-0-1-1'
                                        },
                                        {
                                            name: 'Extension triceps overhead haltère',
                                            muscle_group: 'Triceps',
                                            sets: 3,
                                            reps: '12-15',
                                            rest: '45s',
                                            technique: 'Unilatéral ou bilatéral'
                                        }
                                    ],
                                    volume_total: '31 séries',
                                    techniques_intensification: [
                                        'Drop sets',
                                        'Rest-pause dernière série'
                                    ]
                                },
                                cooldown: {
                                    duration_minutes: 8,
                                    exercises: [
                                        {
                                            name: 'Étirements complets haut du corps',
                                            duration: '8min'
                                        }
                                    ]
                                }
                            }
                        }
                    ]
                },
                advanced: {
                    duration: [90, 120],
                    rpe: '8-9/10',
                    frequency_per_week: 2,
                    sessions: [
                        {
                            name: 'Push Avancé - Hypertrophie Maximale',
                            duration: 105,
                            structure: {
                                warmup: {
                                    duration_minutes: 15,
                                    exercises: [
                                        { name: 'Cardio + mobilité', duration: '10min' },
                                        {
                                            name: 'Pré-activation',
                                            duration: '5min',
                                            note: 'Band work, activation deltoïdes'
                                        }
                                    ]
                                },
                                main_work: {
                                    exercises: [
                                        {
                                            name: 'Développé couché barre',
                                            muscle_group: 'Pectoraux',
                                            protocol: 'Pyramide inversée',
                                            set1: { reps: 4, intensity: '85% 1RM', rest: '3min' },
                                            set2: { reps: 6, intensity: '80% 1RM', rest: '2min' },
                                            set3: { reps: 8, intensity: '75% 1RM', rest: '2min' },
                                            set4: { reps: 12, intensity: '70% 1RM', rest: '90s' },
                                            notes: 'Pyramide inversée pour maximiser volume qualité'
                                        },
                                        {
                                            name: 'Développé incliné haltères',
                                            muscle_group: 'Pectoraux haut',
                                            sets: 4,
                                            reps: '8-12',
                                            intensity: '75% 1RM',
                                            rest: '90s',
                                            tempo: '4-1-1-0',
                                            technique: 'Dernière série: rest-pause (3 mini-sets)'
                                        },
                                        {
                                            name: 'Pec deck ou écartés câbles',
                                            muscle_group: 'Pectoraux (isolation)',
                                            sets: 4,
                                            reps: '12-20',
                                            rest: '45s',
                                            tempo: '2-2-1-1',
                                            technique: 'Double drop set dernière série',
                                            notes: 'Tension continue, squeeze contraction'
                                        },
                                        {
                                            name: 'Développé militaire assis',
                                            muscle_group: 'Épaules',
                                            sets: 5,
                                            reps: '6-10',
                                            intensity: '75-80% 1RM',
                                            rest: '2min',
                                            tempo: '2-0-1-0'
                                        },
                                        {
                                            name: 'Élévations latérales (3 variations)',
                                            muscle_group: 'Deltoïdes latéraux',
                                            variation_1: {
                                                name: 'Haltères debout',
                                                sets: 3,
                                                reps: '10-12',
                                                rest: '30s'
                                            },
                                            variation_2: {
                                                name: 'Câble unilatéral',
                                                sets: 3,
                                                reps: '12-15',
                                                rest: '30s'
                                            },
                                            variation_3: {
                                                name: 'Poulie basse penché',
                                                sets: 3,
                                                reps: '15-20',
                                                rest: '30s'
                                            },
                                            notes: 'Tri-set géant, repos minimal entre variations'
                                        },
                                        {
                                            name: 'Oiseau haltères (deltoïde postérieur)',
                                            muscle_group: 'Épaules postérieures',
                                            sets: 4,
                                            reps: '15-20',
                                            rest: '45s',
                                            tempo: '1-1-1-1',
                                            notes: 'Crucial pour équilibre épaules'
                                        },
                                        {
                                            name: 'Développé serré',
                                            muscle_group: 'Triceps',
                                            sets: 4,
                                            reps: '6-10',
                                            intensity: '75% 1RM',
                                            rest: '2min',
                                            notes: 'Exercice de base triceps'
                                        },
                                        {
                                            name: 'Barre au front (skullcrushers)',
                                            muscle_group: 'Triceps',
                                            sets: 3,
                                            reps: '10-12',
                                            rest: '90s',
                                            tempo: '3-0-1-0',
                                            notes: 'Contrôle excentrique lent'
                                        },
                                        {
                                            name: 'Superset triceps finisher',
                                            superset: [
                                                { name: 'Extension overhead câble', reps: 15 },
                                                {
                                                    name: 'Extension poulie haute pronation',
                                                    reps: 15
                                                }
                                            ],
                                            sets: 3,
                                            rest: '60s',
                                            notes: 'Sans repos entre exercices du superset'
                                        }
                                    ],
                                    volume_total: '40+ séries',
                                    techniques_avancees: [
                                        'Rest-pause',
                                        'Drop sets',
                                        'Supersets',
                                        'Tri-sets',
                                        'Pyramide inversée'
                                    ]
                                },
                                cooldown: {
                                    duration_minutes: 10,
                                    exercises: [
                                        { name: 'Étirements approfondis', duration: '10min' }
                                    ]
                                }
                            },
                            notes: "Volume élevé, techniques d'intensification, récupération cruciale"
                        }
                    ]
                },
                elite: {
                    duration: [120, 150],
                    rpe: '9-10/10',
                    frequency_per_week: 2,
                    sessions: [
                        {
                            name: 'Push Elite - FST-7 / Mountain Dog Style',
                            duration: 135,
                            structure: {
                                warmup: {
                                    duration_minutes: 20,
                                    exercises: [
                                        { name: 'Cardio + mobilité complète', duration: '12min' },
                                        { name: 'Pré-activation bandes', duration: '5min' },
                                        { name: 'Warm-up sets progressifs', duration: '3min' }
                                    ]
                                },
                                main_work: {
                                    phase_1: {
                                        title: 'Force / Tension mécanique',
                                        exercises: [
                                            {
                                                name: 'Développé couché barre',
                                                protocol: 'Heavy sets',
                                                sets: 6,
                                                reps: '3-6',
                                                intensity: '82-90% 1RM',
                                                rest: '3-4min',
                                                notes: 'Build up to top set, then back-off sets'
                                            },
                                            {
                                                name: 'Développé militaire',
                                                sets: 5,
                                                reps: '4-6',
                                                intensity: '82-87% 1RM',
                                                rest: '3min'
                                            }
                                        ]
                                    },
                                    phase_2: {
                                        title: 'Hypertrophie / Volume',
                                        exercises: [
                                            {
                                                name: 'Développé incliné haltères',
                                                sets: 5,
                                                reps: '8-12',
                                                intensity: '75% 1RM',
                                                rest: '90s',
                                                tempo: '4-0-1-1',
                                                technique: 'Myo-reps dernière série'
                                            },
                                            {
                                                name: 'Dips lestés',
                                                sets: 4,
                                                reps: '8-15',
                                                rest: '90s',
                                                notes: 'Angle pectoraux'
                                            },
                                            {
                                                name: 'Élévations latérales',
                                                protocol: 'Mechanical drop set',
                                                sets: 4,
                                                technique:
                                                    'Débuter debout → puis assis → puis penché (sans repos)',
                                                reps: '8-10 par position',
                                                rest: '90s entre sets complets'
                                            },
                                            {
                                                name: 'Face pulls',
                                                sets: 4,
                                                reps: '15-20',
                                                rest: '45s',
                                                notes: 'Santé épaules, crucial'
                                            }
                                        ]
                                    },
                                    phase_3: {
                                        title: 'FST-7 Finisher (Fascia Stretch Training)',
                                        exercise: 'Pec deck ou écartés câbles',
                                        sets: 7,
                                        reps: 12,
                                        rest: '30-45s',
                                        intensity: '60-70% 1RM',
                                        technique: 'Stretch fascia, pompe maximale',
                                        notes: "Boire de l'eau entre séries, focus connexion cerveau-muscle"
                                    },
                                    phase_4: {
                                        title: 'Triceps Destruction',
                                        exercises: [
                                            {
                                                name: 'Dips triceps (buste droit)',
                                                sets: 4,
                                                reps: '8-12',
                                                rest: '90s'
                                            },
                                            {
                                                name: 'Barre au front',
                                                sets: 4,
                                                reps: '10-12',
                                                tempo: '4-0-1-0',
                                                rest: '75s'
                                            },
                                            {
                                                name: 'FST-7 Triceps finisher',
                                                exercise: 'Extension overhead câble',
                                                sets: 7,
                                                reps: 12,
                                                rest: '30s'
                                            }
                                        ]
                                    }
                                },
                                cooldown: {
                                    duration_minutes: 15,
                                    exercises: [
                                        {
                                            name: 'Étirements FST-7 style',
                                            duration: '10min',
                                            notes: 'Stretch profonds entre chaque série FST-7'
                                        },
                                        { name: 'Automassage', duration: '5min' }
                                    ]
                                }
                            },
                            volume_total: '50+ séries',
                            notes: 'Programme élite, nécessite nutrition et récupération optimales. FST-7 = Hany Rambod methodology.'
                        }
                    ]
                }
            },

            ppo: {
                all_levels: {
                    description: 'Phase de spécialisation, intensification techniques avancées',
                    notes: 'Augmenter fréquence à 2-3x/semaine, utiliser périodisation ondulatoire'
                }
            },

            pps: {
                all_levels: {
                    description: 'Pic / Préparation compétition (physique, photo shoot)',
                    notes: 'Maintien force, réduction volume, focus définition musculaire'
                }
            }
        },

        /**
         * 2. PULL (Tirage)
         */
        pull: {
            name: 'Pull (Dos, Biceps, Arrière épaules)',
            category: 'split',
            description: 'Tous les mouvements de tirage',

            ppg: {
                beginner: {
                    duration: [60, 75],
                    rpe: '6-7/10',
                    sessions: [
                        {
                            name: 'Pull Débutant',
                            duration: 70,
                            structure: {
                                warmup: {
                                    duration_minutes: 10,
                                    exercises: [
                                        { name: 'Cardio', duration: '5min' },
                                        { name: 'Band pull-aparts', reps: 20 },
                                        { name: 'Rows légers', sets: 2 }
                                    ]
                                },
                                main_work: {
                                    exercises: [
                                        {
                                            name: 'Tractions assistées ou tirage vertical',
                                            muscle_group: 'Dorsaux (largeur)',
                                            sets: 3,
                                            reps: '8-10',
                                            rest: '2min',
                                            notes: 'Focus connexion dos'
                                        },
                                        {
                                            name: 'Rowing barre',
                                            muscle_group: 'Dos (épaisseur)',
                                            sets: 3,
                                            reps: '8-10',
                                            intensity: '70% 1RM',
                                            rest: '2min',
                                            tempo: '2-0-1-0'
                                        },
                                        {
                                            name: 'Rowing haltère unilatéral',
                                            muscle_group: 'Dorsaux',
                                            sets: 3,
                                            reps: '10-12 par bras',
                                            rest: '90s',
                                            notes: 'Support sur banc'
                                        },
                                        {
                                            name: 'Face pulls',
                                            muscle_group: 'Deltoïdes postérieurs + trapèzes',
                                            sets: 3,
                                            reps: '15-20',
                                            rest: '60s'
                                        },
                                        {
                                            name: 'Curl barre',
                                            muscle_group: 'Biceps',
                                            sets: 3,
                                            reps: '10-12',
                                            rest: '90s',
                                            tempo: '2-0-1-0'
                                        },
                                        {
                                            name: 'Curl marteau haltères',
                                            muscle_group: 'Biceps + brachiaux',
                                            sets: 3,
                                            reps: '12-15',
                                            rest: '60s'
                                        }
                                    ]
                                },
                                cooldown: {
                                    duration_minutes: 5,
                                    exercises: [
                                        { name: 'Étirements dos + biceps', duration: '5min' }
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
                            name: 'Pull Intermédiaire - Épaisseur + Largeur',
                            duration: 85,
                            structure: {
                                warmup: {
                                    duration_minutes: 12,
                                    exercises: [
                                        { name: 'Cardio + mobilité thoracique', duration: '8min' },
                                        { name: 'Activation scapulaire', duration: '4min' }
                                    ]
                                },
                                main_work: {
                                    exercises: [
                                        {
                                            name: 'Tractions lestées',
                                            muscle_group: 'Dorsaux (largeur)',
                                            sets: 4,
                                            reps: '6-10',
                                            rest: '2-3min',
                                            notes: 'Ajouter poids progressivement'
                                        },
                                        {
                                            name: 'Rowing barre (penché 45°)',
                                            muscle_group: 'Dos (épaisseur)',
                                            sets: 4,
                                            reps: '6-10',
                                            intensity: '75-80% 1RM',
                                            rest: '2min',
                                            tempo: '3-0-1-0',
                                            notes: 'Montée explosive, descente contrôlée'
                                        },
                                        {
                                            name: 'Rowing haltère support poitrine',
                                            muscle_group: 'Dorsaux milieu',
                                            sets: 4,
                                            reps: '10-12',
                                            rest: '90s',
                                            notes: 'Banc incliné, pas de triche'
                                        },
                                        {
                                            name: 'Tirage horizontal assis',
                                            muscle_group: 'Dorsaux',
                                            sets: 4,
                                            reps: '10-15',
                                            rest: '75s',
                                            tempo: '2-1-1-0',
                                            technique: 'Dernière série: drop set'
                                        },
                                        {
                                            name: 'Shrugs haltères',
                                            muscle_group: 'Trapèzes',
                                            sets: 4,
                                            reps: '12-15',
                                            rest: '60s',
                                            notes: 'Monter épaules vers oreilles, squeeze 1s'
                                        },
                                        {
                                            name: 'Face pulls + oiseau',
                                            muscle_group: 'Deltoïdes postérieurs',
                                            sets: 4,
                                            reps: '15-20',
                                            rest: '45s',
                                            technique: 'Superset'
                                        },
                                        {
                                            name: 'Curl barre EZ',
                                            muscle_group: 'Biceps',
                                            sets: 4,
                                            reps: '8-12',
                                            rest: '90s',
                                            tempo: '2-0-1-1'
                                        },
                                        {
                                            name: 'Curl incliné haltères',
                                            muscle_group: 'Biceps (stretch)',
                                            sets: 3,
                                            reps: '10-15',
                                            rest: '60s',
                                            notes: 'Banc 45°, focus stretch'
                                        },
                                        {
                                            name: 'Curl marteau corde',
                                            muscle_group: 'Brachial + biceps',
                                            sets: 3,
                                            reps: '12-15',
                                            rest: '45s'
                                        }
                                    ]
                                },
                                cooldown: {
                                    duration_minutes: 8,
                                    exercises: [{ name: 'Étirements complets', duration: '8min' }]
                                }
                            }
                        }
                    ]
                },
                advanced: {
                    duration: [90, 120],
                    rpe: '8-9/10',
                    sessions: [
                        {
                            name: 'Pull Avancé - Dorian Yates Blood & Guts Style',
                            duration: 105,
                            structure: {
                                warmup: {
                                    duration_minutes: 15,
                                    exercises: [{ name: 'Warmup complet', duration: '15min' }]
                                },
                                main_work: {
                                    philosophy:
                                        'High intensity, low volume, train to failure on working sets',
                                    exercises: [
                                        {
                                            name: 'Deadlift (Romanian ou conventional)',
                                            muscle_group: 'Dos complet + chaîne postérieure',
                                            warmup_sets: 3,
                                            working_sets: 2,
                                            reps: '6-8',
                                            intensity: '85% 1RM',
                                            rest: '3-4min',
                                            notes: "Sets à l'échec, assistance sur dernières reps si besoin"
                                        },
                                        {
                                            name: 'Tractions lestées',
                                            muscle_group: 'Dorsaux',
                                            warmup_sets: 2,
                                            working_sets: 2,
                                            reps: '6-10',
                                            rest: '2-3min',
                                            notes: 'To failure, rest-pause si nécessaire'
                                        },
                                        {
                                            name: 'Rowing barre Yates (supination)',
                                            muscle_group: 'Dorsaux bas',
                                            warmup_sets: 2,
                                            working_sets: 2,
                                            reps: '6-10',
                                            intensity: '80% 1RM',
                                            rest: '2min',
                                            notes: 'Signature Dorian, prise supination, buste + vertical'
                                        },
                                        {
                                            name: 'Rowing haltère unilatéral lourd',
                                            muscle_group: 'Dorsaux',
                                            working_sets: 2,
                                            reps: '8-12 par bras',
                                            rest: '90s',
                                            notes: 'To failure chaque bras'
                                        },
                                        {
                                            name: 'Tirage poulie basse prise serrée',
                                            working_sets: 2,
                                            reps: '10-12',
                                            rest: '90s',
                                            technique: 'Drop set sur dernière série'
                                        },
                                        {
                                            name: 'Shrugs barre derrière',
                                            muscle_group: 'Trapèzes',
                                            working_sets: 2,
                                            reps: '10-15',
                                            rest: '90s',
                                            notes: 'Barre derrière le dos, Smith machine OK'
                                        },
                                        {
                                            name: 'Curl barre stricte',
                                            muscle_group: 'Biceps',
                                            warmup_sets: 1,
                                            working_sets: 2,
                                            reps: '6-10',
                                            rest: '90s',
                                            notes: 'Dos au mur, zero momentum'
                                        },
                                        {
                                            name: 'Curl pupitre (preacher curl)',
                                            muscle_group: 'Biceps',
                                            working_sets: 2,
                                            reps: '8-12',
                                            rest: '75s',
                                            notes: 'To failure'
                                        },
                                        {
                                            name: 'Curl concentration',
                                            muscle_group: 'Biceps (pic)',
                                            working_sets: 2,
                                            reps: '10-15 par bras',
                                            rest: '60s',
                                            notes: 'Squeeze contraction maximale'
                                        }
                                    ]
                                },
                                cooldown: {
                                    duration_minutes: 10,
                                    exercises: [
                                        { name: 'Étirements + récupération', duration: '10min' }
                                    ]
                                }
                            },
                            notes: 'Blood & Guts: moins de séries, mais intensité MAXIMALE. Chaque série de travail = échec musculaire.'
                        }
                    ]
                },
                elite: {
                    duration: [120, 150],
                    rpe: '9-10/10',
                    sessions: [
                        {
                            name: 'Pull Elite - John Meadows Mountain Dog',
                            duration: 135,
                            structure: {
                                warmup: {
                                    duration_minutes: 20,
                                    exercises: [
                                        { name: 'Prep complète', duration: '15min' },
                                        { name: 'Activation bandes + câbles', duration: '5min' }
                                    ]
                                },
                                main_work: {
                                    exercises: [
                                        {
                                            name: 'Priming exercise: Straight arm pulldowns',
                                            purpose: 'Activation dorsaux avant exercices composés',
                                            sets: 3,
                                            reps: 15,
                                            rest: '30s',
                                            notes: 'Mountain Dog signature: prime the lats'
                                        },
                                        {
                                            name: 'Rack pulls ou Deadlift',
                                            sets: 5,
                                            reps: '4-6',
                                            intensity: '85-90% 1RM',
                                            rest: '3-4min'
                                        },
                                        {
                                            name: 'Tractions lestées',
                                            protocol: 'Cluster sets',
                                            sets: 4,
                                            reps: '4-6 puis mini-rest 15s puis 2-3 puis rest',
                                            rest: '2min entre clusters',
                                            notes: 'Maximise volume à haute intensité'
                                        },
                                        {
                                            name: 'Meadows Row (signature)',
                                            muscle_group: 'Dorsaux',
                                            sets: 4,
                                            reps: '10-15 par bras',
                                            rest: '75s',
                                            technique:
                                                'Barre dans landmine, rowing unilatéral, rotation complète',
                                            notes: 'John Meadows invention'
                                        },
                                        {
                                            name: 'Chest supported row',
                                            sets: 4,
                                            reps: '10-15',
                                            rest: '90s',
                                            tempo: '3-1-1-0',
                                            technique: 'Dernière série: 1.5 reps (mid-range pump)'
                                        },
                                        {
                                            name: 'Wide grip cable row',
                                            sets: 4,
                                            reps: '12-20',
                                            rest: '60s',
                                            technique: 'Double drop set dernière série'
                                        },
                                        {
                                            name: 'Trap specialization superset',
                                            superset: [
                                                { name: 'Barbell shrugs', reps: 12 },
                                                { name: 'Dumbbell shrugs (hold 3s top)', reps: 15 }
                                            ],
                                            sets: 4,
                                            rest: '90s'
                                        },
                                        {
                                            name: 'Rear delt destroyer',
                                            giant_set: [
                                                { name: 'Reverse pec deck', reps: 15 },
                                                { name: 'Cable face pulls', reps: 20 },
                                                { name: 'Bent over rear delt raise', reps: 25 }
                                            ],
                                            sets: 3,
                                            rest: '2min entre giant sets'
                                        },
                                        {
                                            name: 'Biceps phase 1: Heavy',
                                            exercise: 'Barbell curl',
                                            sets: 4,
                                            reps: '6-8',
                                            rest: '2min'
                                        },
                                        {
                                            name: 'Biceps phase 2: Stretch under load',
                                            exercise: 'Incline dumbbell curl',
                                            sets: 3,
                                            reps: '10-15',
                                            rest: '75s',
                                            tempo: '3-2-1-0',
                                            notes: 'Emphasize stretch position'
                                        },
                                        {
                                            name: 'Biceps phase 3: Peak contraction',
                                            exercise: 'Spider curls',
                                            sets: 3,
                                            reps: '12-15',
                                            rest: '60s',
                                            technique: 'Hold squeeze 2s each rep'
                                        },
                                        {
                                            name: 'Biceps finisher: FST-7',
                                            exercise: 'Cable curl',
                                            sets: 7,
                                            reps: 12,
                                            rest: '30s'
                                        }
                                    ]
                                },
                                cooldown: {
                                    duration_minutes: 15,
                                    exercises: [{ name: 'Recovery protocol', duration: '15min' }]
                                }
                            },
                            notes: 'Mountain Dog training: activation, angles variés, techniques avancées, volume élevé'
                        }
                    ]
                }
            }
        },

        /**
         * 3. LEGS (Jambes)
         */
        legs: {
            name: 'Legs (Quadriceps, Ischios, Fessiers, Mollets)',
            category: 'split',
            description: 'Entraînement complet du bas du corps',

            ppg: {
                beginner: {
                    duration: [60, 75],
                    rpe: '6-7/10',
                    sessions: [
                        {
                            name: 'Legs Débutant - Fondations',
                            duration: 70,
                            structure: {
                                warmup: {
                                    duration_minutes: 12,
                                    exercises: [
                                        { name: 'Vélo', duration: '5min' },
                                        { name: 'Mobilité hanches + chevilles', duration: '5min' },
                                        { name: 'Goblet squats', sets: 2, reps: 15 }
                                    ]
                                },
                                main_work: {
                                    exercises: [
                                        {
                                            name: 'Squat barre (back squat)',
                                            muscle_group: 'Quadriceps, fessiers',
                                            sets: 4,
                                            reps: '8-12',
                                            intensity: '65-70% 1RM',
                                            rest: '2-3min',
                                            notes: 'Focus technique, profondeur complète'
                                        },
                                        {
                                            name: 'Leg press',
                                            muscle_group: 'Quadriceps, fessiers',
                                            sets: 3,
                                            reps: '12-15',
                                            rest: '2min'
                                        },
                                        {
                                            name: 'Romanian deadlift',
                                            muscle_group: 'Ischios, fessiers',
                                            sets: 3,
                                            reps: '10-12',
                                            intensity: '65% 1RM',
                                            rest: '2min',
                                            notes: 'Stretch ischios'
                                        },
                                        {
                                            name: 'Leg curl allongé',
                                            muscle_group: 'Ischios',
                                            sets: 3,
                                            reps: '12-15',
                                            rest: '90s'
                                        },
                                        {
                                            name: 'Mollets debout machine',
                                            muscle_group: 'Mollets (gastrocnémien)',
                                            sets: 4,
                                            reps: '15-20',
                                            rest: '60s'
                                        }
                                    ]
                                },
                                cooldown: {
                                    duration_minutes: 8,
                                    exercises: [{ name: 'Étirements jambes', duration: '8min' }]
                                }
                            }
                        }
                    ]
                },
                intermediate: {
                    duration: [90, 105],
                    rpe: '7-8/10',
                    sessions: [
                        {
                            name: 'Legs Intermédiaire - Volume',
                            duration: 95,
                            structure: {
                                warmup: {
                                    duration_minutes: 15,
                                    exercises: [
                                        { name: 'Cardio léger', duration: '5min' },
                                        { name: 'Mobilité complète', duration: '7min' },
                                        {
                                            name: 'Activation fessiers',
                                            sets: 2,
                                            exercises: 'Banded walks, glute bridges'
                                        }
                                    ]
                                },
                                main_work: {
                                    exercises: [
                                        {
                                            name: 'Back squat',
                                            muscle_group: 'Quadriceps, fessiers',
                                            sets: 5,
                                            reps: '6-10',
                                            intensity: '75-80% 1RM',
                                            rest: '3min',
                                            tempo: '3-0-1-0'
                                        },
                                        {
                                            name: 'Front squat',
                                            muscle_group: 'Quadriceps (emphasis)',
                                            sets: 4,
                                            reps: '8-12',
                                            intensity: '70% 1RM',
                                            rest: '2min',
                                            notes: 'Torse vertical, quads focus'
                                        },
                                        {
                                            name: 'Romanian deadlift',
                                            muscle_group: 'Ischios, fessiers',
                                            sets: 4,
                                            reps: '8-12',
                                            intensity: '75% 1RM',
                                            rest: '2min',
                                            tempo: '3-1-1-0'
                                        },
                                        {
                                            name: 'Leg press (feet high)',
                                            muscle_group: 'Fessiers, ischios',
                                            sets: 4,
                                            reps: '12-15',
                                            rest: '90s',
                                            notes: 'Pieds haut sur plateforme'
                                        },
                                        {
                                            name: 'Leg curl assis',
                                            muscle_group: 'Ischios',
                                            sets: 4,
                                            reps: '10-15',
                                            rest: '75s',
                                            technique: 'Drop set dernière série'
                                        },
                                        {
                                            name: 'Leg extension',
                                            muscle_group: 'Quadriceps (isolation)',
                                            sets: 4,
                                            reps: '12-20',
                                            rest: '60s',
                                            tempo: '2-1-1-1',
                                            notes: 'Contraction squeeze'
                                        },
                                        {
                                            name: 'Fentes marchées haltères',
                                            muscle_group: 'Quadriceps, fessiers, équilibre',
                                            sets: 3,
                                            reps: '12-15 par jambe',
                                            rest: '90s'
                                        },
                                        {
                                            name: 'Mollets debout',
                                            muscle_group: 'Gastrocnémien',
                                            sets: 4,
                                            reps: '12-15',
                                            rest: '60s',
                                            tempo: '1-2-1-2'
                                        },
                                        {
                                            name: 'Mollets assis',
                                            muscle_group: 'Soléaire',
                                            sets: 4,
                                            reps: '15-20',
                                            rest: '45s'
                                        }
                                    ]
                                },
                                cooldown: {
                                    duration_minutes: 10,
                                    exercises: [
                                        { name: 'Étirements + foam rolling', duration: '10min' }
                                    ]
                                }
                            }
                        }
                    ]
                },
                advanced: {
                    duration: [105, 135],
                    rpe: '8-9/10',
                    sessions: [
                        {
                            name: 'Legs Avancé - Quad Emphasis',
                            duration: 120,
                            structure: {
                                warmup: {
                                    duration_minutes: 20,
                                    exercises: [{ name: 'Préparation complète', duration: '20min' }]
                                },
                                main_work: {
                                    exercises: [
                                        {
                                            name: 'Back squat (heavy)',
                                            protocol: 'Pyramide',
                                            set1: { reps: 5, intensity: '80% 1RM' },
                                            set2: { reps: 4, intensity: '85% 1RM' },
                                            set3: { reps: 3, intensity: '88% 1RM' },
                                            set4: { reps: '2-3', intensity: '90% 1RM' },
                                            backoff_sets: {
                                                sets: 2,
                                                reps: 8,
                                                intensity: '75% 1RM'
                                            },
                                            rest: '3-4min'
                                        },
                                        {
                                            name: 'Front squat',
                                            sets: 4,
                                            reps: '8-10',
                                            intensity: '75% 1RM',
                                            rest: '2-3min',
                                            tempo: '3-0-X-0'
                                        },
                                        {
                                            name: 'Hack squat',
                                            muscle_group: 'Quadriceps',
                                            sets: 4,
                                            reps: '10-15',
                                            rest: '2min',
                                            technique: 'Drop set dernière série'
                                        },
                                        {
                                            name: 'Leg press',
                                            sets: 4,
                                            reps: '15-20',
                                            rest: '90s',
                                            technique: '1.5 reps (bottom half pump)'
                                        },
                                        {
                                            name: 'Leg extension',
                                            protocol: 'FST-7',
                                            sets: 7,
                                            reps: 12,
                                            rest: '30-45s',
                                            notes: 'Peak contraction, fascia stretch'
                                        },
                                        {
                                            name: 'Romanian deadlift',
                                            muscle_group: 'Ischios',
                                            sets: 4,
                                            reps: '8-12',
                                            intensity: '75-80% 1RM',
                                            rest: '2min'
                                        },
                                        {
                                            name: 'Leg curl allongé',
                                            sets: 4,
                                            reps: '10-15',
                                            rest: '75s',
                                            tempo: '3-1-1-0'
                                        },
                                        {
                                            name: 'Superset mollets killer',
                                            superset: [
                                                { name: 'Standing calf raise', reps: 15 },
                                                { name: 'Seated calf raise', reps: 20 }
                                            ],
                                            sets: 5,
                                            rest: '60s'
                                        }
                                    ]
                                },
                                cooldown: {
                                    duration_minutes: 15,
                                    exercises: [{ name: 'Recovery extensive', duration: '15min' }]
                                }
                            }
                        },
                        {
                            name: 'Legs Avancé - Posterior Chain Emphasis',
                            duration: 115,
                            structure: {
                                warmup: { duration_minutes: 20 },
                                main_work: {
                                    exercises: [
                                        {
                                            name: 'Deadlift (conventional)',
                                            sets: 5,
                                            reps: '3-6',
                                            intensity: '82-90% 1RM',
                                            rest: '3-5min'
                                        },
                                        {
                                            name: 'Romanian deadlift',
                                            sets: 4,
                                            reps: '8-10',
                                            intensity: '75% 1RM',
                                            rest: '2min'
                                        },
                                        {
                                            name: 'Glute ham raise',
                                            sets: 4,
                                            reps: '8-12',
                                            rest: '2min',
                                            notes: 'Lesté si possible'
                                        },
                                        {
                                            name: 'Leg curl allongé',
                                            protocol: 'Drop sets',
                                            sets: 4,
                                            reps: '8-10 puis 8 puis 8',
                                            rest: '2min'
                                        },
                                        {
                                            name: 'Bulgarian split squat',
                                            muscle_group: 'Fessiers, quadriceps',
                                            sets: 4,
                                            reps: '10-15 par jambe',
                                            rest: '90s'
                                        },
                                        {
                                            name: 'Hip thrust',
                                            muscle_group: 'Fessiers',
                                            sets: 4,
                                            reps: '12-20',
                                            rest: '90s',
                                            notes: 'Pause 2s en haut'
                                        },
                                        {
                                            name: 'Back extension',
                                            sets: 3,
                                            reps: '15-20',
                                            rest: '60s'
                                        }
                                    ]
                                },
                                cooldown: { duration_minutes: 12 }
                            }
                        }
                    ]
                },
                elite: {
                    duration: [135, 180],
                    rpe: '9-10/10',
                    sessions: [
                        {
                            name: 'Legs Elite - Tom Platz Inspired',
                            duration: 155,
                            structure: {
                                warmup: {
                                    duration_minutes: 25,
                                    exercises: [
                                        { name: 'Preparation extensive', duration: '25min' }
                                    ]
                                },
                                main_work: {
                                    philosophy: 'High volume, high intensity, push past failure',
                                    exercises: [
                                        {
                                            name: 'Back squat - Volume day',
                                            protocol: 'High rep brutality',
                                            warmup_sets: 5,
                                            working_protocol: [
                                                {
                                                    set: 1,
                                                    reps: 20,
                                                    intensity: '60% 1RM',
                                                    rest: '3min'
                                                },
                                                {
                                                    set: 2,
                                                    reps: 15,
                                                    intensity: '65% 1RM',
                                                    rest: '3min'
                                                },
                                                {
                                                    set: 3,
                                                    reps: 12,
                                                    intensity: '70% 1RM',
                                                    rest: '3min'
                                                },
                                                {
                                                    set: 4,
                                                    reps: 10,
                                                    intensity: '75% 1RM',
                                                    rest: '3min'
                                                },
                                                {
                                                    set: 5,
                                                    reps: '20+',
                                                    intensity: '60% 1RM',
                                                    note: 'Widowmaker set - all out'
                                                }
                                            ],
                                            notes: "Tom Platz style: squat jusqu'au sol, reps élevées, intensité maximale"
                                        },
                                        {
                                            name: 'Front squat',
                                            sets: 5,
                                            reps: '8-12',
                                            intensity: '75% 1RM',
                                            rest: '2min'
                                        },
                                        {
                                            name: 'Hack squat',
                                            protocol: 'Rest-pause',
                                            sets: 4,
                                            technique: '10 reps, rest 15s, 5 reps, rest 15s, AMRAP',
                                            rest: '3min entre sets'
                                        },
                                        {
                                            name: 'Leg press',
                                            protocol: '50 rep challenge',
                                            sets: 3,
                                            reps: 50,
                                            intensity: '40% max',
                                            rest: '4min',
                                            notes: 'Breaks autorisés mais barre reste chargée'
                                        },
                                        {
                                            name: 'Leg extension',
                                            protocol: 'FST-7 extended',
                                            sets: 10,
                                            reps: 15,
                                            rest: '30s'
                                        },
                                        {
                                            name: 'Romanian deadlift',
                                            sets: 5,
                                            reps: '8-10',
                                            intensity: '80% 1RM',
                                            rest: '2min'
                                        },
                                        {
                                            name: 'Lying leg curl',
                                            protocol: 'Giant drop set',
                                            sets: 3,
                                            technique:
                                                '10 reps, drop 25%, 10 reps, drop 25%, 10 reps, drop 25%, AMRAP',
                                            rest: '3min'
                                        },
                                        {
                                            name: 'Walking lunges',
                                            sets: 4,
                                            distance: '40m',
                                            rest: '2min',
                                            notes: 'Haltères lourds'
                                        },
                                        {
                                            name: 'Calf destruction protocol',
                                            exercises: [
                                                {
                                                    name: 'Standing calf raise',
                                                    sets: 6,
                                                    reps: '10-12',
                                                    rest: '45s',
                                                    weight: 'Heavy'
                                                },
                                                {
                                                    name: 'Seated calf raise',
                                                    sets: 6,
                                                    reps: '15-20',
                                                    rest: '30s'
                                                },
                                                {
                                                    name: 'Single leg calf raise bodyweight',
                                                    sets: 3,
                                                    reps: 'AMRAP',
                                                    rest: '30s'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                cooldown: {
                                    duration_minutes: 20,
                                    exercises: [
                                        {
                                            name: 'Ice bath or cold therapy',
                                            duration: '10min',
                                            optional: true
                                        },
                                        { name: 'Stretching + mobility', duration: '10min' }
                                    ]
                                }
                            },
                            notes: 'Programme élite extrême. Nécessite récupération maximale. Ne pas faire si compétition proche.'
                        }
                    ]
                }
            }
        },

        /**
         * 4. FULL BODY
         */
        full_body: {
            name: 'Full Body (Corps Complet)',
            category: 'full',
            description: 'Entraînement complet du corps en une séance',

            ppg: {
                beginner: {
                    frequency_per_week: 3,
                    duration: [60, 75],
                    rpe: '6-7/10',
                    sessions: [
                        {
                            name: 'Full Body A',
                            structure: {
                                warmup: { duration_minutes: 10 },
                                main_work: {
                                    exercises: [
                                        { name: 'Squat', sets: 3, reps: '8-10' },
                                        { name: 'Bench press', sets: 3, reps: '8-10' },
                                        { name: 'Rowing', sets: 3, reps: '10-12' },
                                        { name: 'Overhead press', sets: 3, reps: '8-10' },
                                        { name: 'Romanian deadlift', sets: 2, reps: '10-12' },
                                        { name: 'Planche', sets: 3, duration: '30-45s' }
                                    ]
                                },
                                cooldown: { duration_minutes: 5 }
                            }
                        }
                    ]
                }
            }
        }
    },

    /**
     * MÉTHODOLOGIES CÉLÈBRES
     */
    methodologies: {
        arnold_blueprint: {
            name: 'Arnold Schwarzenegger Blueprint',
            philosophy: 'Volume élevé, double split, focus connexion cerveau-muscle',
            split: 'Push/Pull/Legs 2x par semaine',
            volume: 'Très élevé (20-30 séries par groupe musculaire)',
            techniques: ['Supersets', 'Drop sets', 'Pyramid sets', 'Peak contraction']
        },
        dorian_yates: {
            name: 'Dorian Yates Blood & Guts',
            philosophy: "Haute intensité, faible volume, entraînement à l'échec",
            split: 'Bro split 4 jours',
            volume: 'Faible (6-8 séries de travail par muscle)',
            techniques: ['Train to failure', 'Rest-pause', 'Forced reps', 'Negatives'],
            notes: '1-2 séries de travail maximum par exercice, mais INTENSITY maximale'
        },
        renaissance_periodization: {
            name: 'Renaissance Periodization (Dr. Mike Israetel)',
            philosophy: 'Science-based, périodisation du volume, MRV/MEV concepts',
            concepts: {
                MV: 'Maintenance Volume - volume minimum pour maintenir',
                MEV: 'Minimum Effective Volume - volume minimum pour progresser',
                MAV: 'Maximum Adaptive Volume - volume optimal pour croissance',
                MRV: 'Maximum Recoverable Volume - volume maximum récupérable'
            },
            approach: 'Start at MEV, increase weekly until MRV, then deload'
        },
        mountain_dog: {
            name: 'Mountain Dog Training (John Meadows)',
            philosophy: 'Angles variés, techniques avancées, activation pré-fatigue',
            techniques: [
                'Priming exercises',
                'Lengthened partials',
                '1.5 reps',
                'Iso-holds',
                'Cluster sets'
            ],
            signature_moves: ['Meadows Row', 'Meadows Shrugs', 'Prime then load protocol']
        },
        fst7: {
            name: 'FST-7 (Hany Rambod)',
            philosophy: 'Fascia Stretch Training - stretch fascia for growth',
            protocol: '7 sets of 12 reps, 30-45s rest on final exercise',
            application: 'Use on isolation exercises, end of workout',
            hydration: 'Drink water between sets to pump muscles'
        },
        dc_training: {
            name: 'DC Training (Doggcrapp)',
            philosophy: 'Extreme intensity, rest-pause, low frequency',
            protocol:
                'Rest-pause sets: 1 set to failure, rest 15s, continue to failure, rest 15s, final set',
            frequency: 'Each muscle 1x per 5-7 days',
            intensity: 'Extreme - not for beginners'
        }
    },

    /**
     * SPLITS D'ENTRAÎNEMENT
     */
    training_splits: {
        bro_split: {
            name: 'Bro Split (1 muscle par jour)',
            days: 5,
            split: {
                day1: 'Chest',
                day2: 'Back',
                day3: 'Shoulders',
                day4: 'Arms (Biceps + Triceps)',
                day5: 'Legs',
                weekend: 'Rest'
            },
            pros: 'Volume élevé par muscle, récupération maximale',
            cons: 'Fréquence faible (1x/semaine par muscle)',
            best_for: 'Intermédiaire à avancé'
        },
        push_pull_legs: {
            name: 'Push/Pull/Legs (PPL)',
            days: 6,
            split: {
                day1: 'Push (Chest, Shoulders, Triceps)',
                day2: 'Pull (Back, Biceps)',
                day3: 'Legs',
                day4: 'Push',
                day5: 'Pull',
                day6: 'Legs',
                day7: 'Rest'
            },
            frequency: '2x par semaine par muscle',
            pros: 'Équilibre volume/fréquence, récupération adéquate',
            best_for: 'Tous niveaux, optimal pour hypertrophie'
        },
        upper_lower: {
            name: 'Upper/Lower Split',
            days: 4,
            split: {
                day1: 'Upper A (Chest + Back focus)',
                day2: 'Lower A (Squat focus)',
                day3: 'Rest',
                day4: 'Upper B (Shoulders + Arms focus)',
                day5: 'Lower B (Deadlift focus)',
                days_6_7: 'Rest'
            },
            frequency: '2x par semaine par muscle',
            pros: 'Bon équilibre, 3 jours repos',
            best_for: 'Débutant à intermédiaire'
        },
        full_body: {
            name: 'Full Body',
            days: 3,
            split: {
                day1: 'Full A',
                day2: 'Rest',
                day3: 'Full B',
                day4: 'Rest',
                day5: 'Full C',
                weekend: 'Rest'
            },
            frequency: '3x par semaine par muscle',
            pros: 'Fréquence maximale, bon pour débutants et force',
            best_for: 'Débutants, athlètes force'
        }
    },

    /**
     * STANDARDS ÉLITE
     */
    elite_standards: {
        male: {
            bodyweight_classic: '83-93kg',
            bodyweight_heavyweight: '93-110kg+',
            strength: {
                squat: '2.5-3x bodyweight',
                deadlift: '3-3.5x bodyweight',
                bench: '1.75-2.25x bodyweight'
            },
            physique: {
                arms: '45-50cm',
                chest: '120-135cm',
                waist: '75-85cm',
                thighs: '65-75cm',
                calves: '40-45cm'
            },
            body_fat: '5-8% (competition), 10-15% (off-season)'
        },
        female: {
            bodyweight: '52-63kg',
            strength: {
                squat: '1.75-2.25x bodyweight',
                deadlift: '2-2.5x bodyweight',
                bench: '1-1.5x bodyweight'
            },
            physique: {
                arms: '30-35cm',
                chest: '90-100cm',
                waist: '60-68cm',
                thighs: '52-60cm',
                calves: '33-38cm'
            },
            body_fat: '10-15% (competition), 18-25% (off-season)'
        }
    },

    /**
     * TECHNIQUES D'INTENSIFICATION
     */
    intensity_techniques: {
        drop_sets: {
            name: 'Drop Sets',
            description: "Réduire le poids de 20-25% et continuer jusqu'à l'échec",
            protocol: 'Série normale → drop 25% → échec → drop 25% → échec',
            best_for: 'Isolation exercises, fin de séance'
        },
        rest_pause: {
            name: 'Rest-Pause',
            description: 'Micro-repos pour prolonger la série',
            protocol: 'Échec → repos 15s → continuer → repos 15s → final set',
            best_for: 'Exercices composés et isolation'
        },
        superset: {
            name: 'Superset',
            description: 'Deux exercices consécutifs sans repos',
            types: {
                antagonist: 'Muscles opposés (biceps/triceps)',
                agonist: 'Même muscle (deux exercices pectoraux)',
                compound: 'Non lié (haut/bas du corps)'
            }
        },
        giant_sets: {
            name: 'Giant Sets',
            description: '3-4 exercices consécutifs sans repos',
            protocol: 'A → B → C → D → repos → repeat',
            best_for: 'Hypertrophie métabolique, endurance'
        },
        tempo_training: {
            name: 'Tempo Training',
            description: "Contrôle vitesse d'exécution",
            notation: 'Excentrique-Pause bas-Concentrique-Pause haut',
            examples: {
                hypertrophy: '3-1-1-0 (lent excentrique)',
                explosive: '2-0-X-0 (concentrique explosif)',
                tut: '4-2-1-2 (time under tension maximal)'
            }
        },
        cluster_sets: {
            name: 'Cluster Sets',
            description: 'Mini-repos intra-série pour volume à haute intensité',
            protocol: '2 reps → 20s repos → 2 reps → 20s → 2 reps = 1 set',
            best_for: 'Force, volume qualité'
        },
        lengthened_partials: {
            name: 'Lengthened Partials',
            description: 'Reps partielles en position étirée',
            example: 'Curl incliné - travailler moitié basse du mouvement',
            benefit: "Hypertrophie en position d'étirement"
        }
    },

    /**
     * NUTRITION GUIDELINES
     */
    nutrition_guidelines: {
        bulking: {
            calories: '+300 à +500 au-dessus maintenance',
            protein: '2-2.5g/kg bodyweight',
            carbs: '4-6g/kg bodyweight',
            fats: '0.8-1.2g/kg bodyweight',
            gain_rate: '0.25-0.5kg par semaine'
        },
        cutting: {
            calories: '-300 à -500 sous maintenance',
            protein: '2.5-3g/kg bodyweight',
            carbs: '2-4g/kg bodyweight',
            fats: '0.6-1g/kg bodyweight',
            loss_rate: '0.5-1% bodyweight par semaine'
        },
        maintenance: {
            calories: 'Maintenance',
            protein: '2-2.2g/kg bodyweight',
            carbs: '3-5g/kg bodyweight',
            fats: '0.8-1g/kg bodyweight'
        }
    }
};

// Export global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BodybuildingDatabase;
} else {
    window.BodybuildingDatabase = BodybuildingDatabase;
}
