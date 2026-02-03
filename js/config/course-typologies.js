/**
 * ═══════════════════════════════════════════════════════════════
 * TYPOLOGIES DES COURS LA SKÀLI
 * Matrice complète : Cours × Mouvements × Méthodologies × Objectifs
 * ═══════════════════════════════════════════════════════════════
 */

const CourseTypologies = {
    /**
     * HYROX - Cross Training / Compétition
     */
    hyrox: {
        id: 'hyrox',
        name: 'HYROX',
        category: 'cross_training',
        description:
            'Entraînement spécifique HYROX combinant course à pied et exercices fonctionnels',

        objectives: [
            'endurance_aerobic',
            'endurance_anaerobic',
            'force_endurance',
            'power_output',
            'mental_toughness'
        ],

        // Mouvements spécifiques HYROX
        specific_movements: {
            // Course
            running: [
                'treadmill_running_1km',
                'interval_running_400m',
                'tempo_running',
                'threshold_running',
                'easy_recovery_run'
            ],

            // 8 Stations HYROX officielles
            ski_erg: ['ski_erg_1000m', 'ski_erg_intervals', 'ski_erg_technique_drills'],

            sled_push: ['sled_push_heavy', 'sled_push_speed', 'sled_push_endurance'],

            sled_pull: ['sled_pull_heavy', 'sled_pull_speed', 'rope_sled_pull'],

            burpee_broad_jump: [
                'burpee_broad_jump_80m',
                'burpee_practice',
                'broad_jump_drills',
                'burpee_box_jump_over'
            ],

            rowing: ['row_1000m', 'rowing_intervals', 'rowing_technique'],

            farmers_carry: ['farmers_carry_heavy', 'farmers_carry_speed', 'farmers_walk_200m'],

            sandbag_lunges: [
                'sandbag_walking_lunges',
                'sandbag_reverse_lunges',
                'weighted_lunges_100m'
            ],

            wall_balls: ['wall_balls_100_reps', 'wall_ball_clusters', 'wall_ball_technique'],

            // Accessoires force
            strength_accessories: [
                'goblet_squat',
                'dumbbell_thruster',
                'kettlebell_swing',
                'devil_press',
                'box_jump',
                'plank_variations'
            ]
        },

        // Méthodologies prioritaires
        methodologies: [
            'endurance_force',
            'circuits_metcon',
            'interval_training_hiit',
            'tempo_threshold',
            'force_endurance_lactic',
            'complexe_contraste'
        ],

        // Zones d'entraînement
        training_zones: {
            aerobic: 0.4, // 40% du volume
            threshold: 0.25, // 25%
            vo2max: 0.15, // 15%
            strength: 0.2 // 20%
        },

        // Phases de préparation
        preparation_phases: {
            ppg: {
                focus: 'Base aérobie + force générale',
                duration_weeks: 8,
                volume: 'high',
                intensity: 'moderate'
            },
            ppo: {
                focus: 'Spécificité HYROX + seuil',
                duration_weeks: 6,
                volume: 'medium',
                intensity: 'high'
            },
            pps: {
                focus: 'Simulation + peaking',
                duration_weeks: 4,
                volume: 'low',
                intensity: 'very_high'
            }
        },

        // Équipement requis
        required_equipment: [
            'treadmill',
            'ski_erg',
            'sled',
            'rowing_machine',
            'farmers_carry_handles',
            'sandbag',
            'wall_ball',
            'pull_up_bar'
        ]
    },

    /**
     * BARBELLS CLUB - Haltérophilie / Force
     */
    barbells_club: {
        id: 'barbells_club',
        name: 'Barbells Club',
        category: 'weightlifting',
        description: "Maîtrise des mouvements d'haltérophilie et SBD",

        objectives: [
            'force_maximale',
            'force_explosive',
            'technique_olympic_lifts',
            'power_output',
            'coordination'
        ],

        specific_movements: {
            // Haltérophilie olympique
            olympic_lifts: [
                'snatch_full', // Arraché
                'snatch_power',
                'snatch_hang',
                'snatch_blocks',
                'snatch_pull',
                'snatch_balance',
                'overhead_squat',

                'clean_and_jerk_full', // Épaulé-jeté
                'clean_power',
                'clean_hang',
                'clean_blocks',
                'clean_pull',
                'front_squat',
                'jerk_split',
                'jerk_push',
                'jerk_blocks'
            ],

            // SBD (Big 3)
            powerlifting: [
                'back_squat', // Squat
                'front_squat',
                'pause_squat',
                'box_squat',
                'tempo_squat',

                'bench_press', // Bench
                'close_grip_bench',
                'pause_bench',
                'floor_press',
                'board_press',

                'deadlift_conventional', // Deadlift
                'deadlift_sumo',
                'deadlift_deficit',
                'deadlift_blocks',
                'romanian_deadlift'
            ],

            // Accessoires force
            accessories: [
                'overhead_press',
                'push_press',
                'bent_over_row',
                'pendlay_row',
                'good_morning',
                'hip_thrust',
                'glute_ham_raise',
                'back_extension'
            ]
        },

        methodologies: [
            'force_maximale',
            'force_vitesse',
            'clusters',
            'complexe_contraste',
            'wave_loading',
            'daily_max'
        ],

        training_zones: {
            max_strength: 0.5, // 50%
            speed_strength: 0.25, // 25%
            hypertrophy: 0.15, // 15%
            technique: 0.1 // 10%
        },

        preparation_phases: {
            ppg: {
                focus: 'Hypertrophie + base force',
                duration_weeks: 6,
                volume: 'high',
                intensity: 'moderate'
            },
            ppo: {
                focus: 'Force maximale + vitesse',
                duration_weeks: 8,
                volume: 'medium',
                intensity: 'high'
            },
            pps: {
                focus: 'Peaking + compétition',
                duration_weeks: 3,
                volume: 'low',
                intensity: 'maximal'
            }
        },

        required_equipment: [
            'barbell',
            'bumper_plates',
            'power_rack',
            'bench',
            'lifting_platform',
            'weightlifting_shoes'
        ]
    },

    /**
     * GYM SKILLS - Gymnastique / Mobilité
     */
    gym_skills: {
        id: 'gym_skills',
        name: 'Gym Skills',
        category: 'gymnastics',
        description: 'Apprentissage des mouvements gymnastes',

        objectives: [
            'force_relative',
            'mobilite_extreme',
            'coordination',
            'equilibre',
            'body_awareness'
        ],

        specific_movements: {
            // Barre fixe
            pull_up_bar: [
                'pull_up_strict',
                'pull_up_weighted',
                'muscle_up_bar',
                'front_lever_progression',
                'back_lever_progression',
                'l_sit_bar',
                'toes_to_bar',
                'bar_kip'
            ],

            // Anneaux
            rings: [
                'ring_dip',
                'ring_push_up',
                'ring_row',
                'muscle_up_rings',
                'iron_cross_progression',
                'maltese_progression',
                'ring_l_sit',
                'skin_the_cat'
            ],

            // Barres parallèles
            parallel_bars: ['parallel_bar_dip', 'l_sit_parallel', 'v_sit', 'planche_progression'],

            // Sol
            floor_work: [
                'handstand_wall',
                'handstand_freestanding',
                'handstand_push_up',
                'handstand_walk',
                'pistol_squat',
                'shrimp_squat',
                'one_arm_push_up_progression',
                'planche_lean',
                'hollow_body_hold',
                'arch_hold'
            ],

            // Mobilité
            mobility: [
                'bridge_progression',
                'splits_progression',
                'shoulder_flexibility',
                'wrist_prep',
                'hip_mobility',
                'thoracic_extension'
            ]
        },

        methodologies: [
            'skill_practice',
            'tempo_eccentric',
            'isometric_holds',
            'emom_skills',
            'greasing_the_groove'
        ],

        training_zones: {
            skill_work: 0.4, // 40%
            strength: 0.3, // 30%
            mobility: 0.2, // 20%
            conditioning: 0.1 // 10%
        },

        preparation_phases: {
            ppg: {
                focus: 'Base force + mobilité',
                duration_weeks: 8,
                volume: 'high',
                intensity: 'low'
            },
            ppo: {
                focus: 'Apprentissage skills',
                duration_weeks: 12,
                volume: 'medium',
                intensity: 'medium'
            },
            pps: {
                focus: 'Maîtrise + linking',
                duration_weeks: 8,
                volume: 'medium',
                intensity: 'high'
            }
        },

        required_equipment: [
            'pull_up_bar',
            'gymnastic_rings',
            'parallel_bars',
            'parallettes',
            'mats'
        ]
    },

    /**
     * TACTICAL - Cardio Fonctionnel
     */
    tactical: {
        id: 'tactical',
        name: 'Tactical',
        category: 'functional_cardio',
        description: 'Entraînement cardio fonctionnel inspiré des méthodes militaires',

        objectives: [
            'work_capacity',
            'endurance_anaerobic',
            'mental_toughness',
            'functional_strength',
            'resilience'
        ],

        specific_movements: {
            // Cardio
            cardio: [
                'running_intervals',
                'rowing_intervals',
                'assault_bike',
                'ski_erg',
                'burpees',
                'jump_rope'
            ],

            // Ruck / Loaded carries
            loaded_carries: [
                'ruck_march',
                'weighted_vest_work',
                'farmers_carry',
                'sandbag_carry',
                'plate_carry',
                'yoke_walk'
            ],

            // Mouvements fonctionnels
            functional: [
                'burpee_variations',
                'thruster',
                'devil_press',
                'man_maker',
                'kettlebell_swing',
                'wall_ball',
                'slam_ball',
                'tire_flip',
                'sledgehammer_swings'
            ],

            // Force
            strength: [
                'deadlift',
                'squat_clean',
                'overhead_press',
                'pull_ups',
                'push_ups',
                'box_jumps'
            ],

            // Core / stabilité
            core: [
                'plank_variations',
                'farmer_walk',
                'overhead_carry',
                'turkish_get_up',
                'sandbag_over_shoulder'
            ]
        },

        methodologies: [
            'circuits_metcon',
            'emom',
            'amrap',
            'for_time',
            'tabata',
            'endurance_force'
        ],

        training_zones: {
            metcon: 0.4, // 40%
            strength: 0.25, // 25%
            endurance: 0.2, // 20%
            mental: 0.15 // 15%
        },

        preparation_phases: {
            ppg: {
                focus: 'Base work capacity',
                duration_weeks: 6,
                volume: 'high',
                intensity: 'moderate'
            },
            ppo: {
                focus: 'Intensité + charge',
                duration_weeks: 6,
                volume: 'medium',
                intensity: 'high'
            },
            pps: {
                focus: 'Test + résilience',
                duration_weeks: 3,
                volume: 'low',
                intensity: 'maximal'
            }
        },

        required_equipment: [
            'barbell',
            'kettlebells',
            'dumbbells',
            'weighted_vest',
            'sandbag',
            'wall_ball',
            'slam_ball',
            'rowing_machine',
            'assault_bike'
        ]
    },

    /**
     * BUILD - Musculation / Hypertrophie
     */
    build: {
        id: 'build',
        name: 'Build',
        category: 'bodybuilding',
        description: "Cours de musculation traditionnelle axé sur l'hypertrophie",

        objectives: [
            'hypertrophie_myofibrillaire',
            'hypertrophie_sarcoplasmique',
            'force_fonctionnelle',
            'aesthetics',
            'muscle_balance'
        ],

        specific_movements: {
            // Push
            chest: [
                'bench_press',
                'incline_bench_press',
                'decline_bench_press',
                'dumbbell_press',
                'dumbbell_flyes',
                'cable_crossover',
                'dips_chest'
            ],

            shoulders: [
                'overhead_press',
                'dumbbell_shoulder_press',
                'lateral_raise',
                'front_raise',
                'rear_delt_fly',
                'upright_row',
                'face_pulls'
            ],

            triceps: [
                'close_grip_bench',
                'tricep_dips',
                'skull_crushers',
                'overhead_extension',
                'cable_pushdown',
                'diamond_push_ups'
            ],

            // Pull
            back: [
                'deadlift',
                'bent_over_row',
                't_bar_row',
                'seated_cable_row',
                'lat_pulldown',
                'pull_ups',
                'straight_arm_pulldown',
                'face_pulls'
            ],

            biceps: [
                'barbell_curl',
                'dumbbell_curl',
                'hammer_curl',
                'preacher_curl',
                'concentration_curl',
                'cable_curl'
            ],

            // Legs
            quads: [
                'back_squat',
                'front_squat',
                'leg_press',
                'leg_extension',
                'bulgarian_split_squat',
                'lunges',
                'hack_squat'
            ],

            hamstrings: [
                'romanian_deadlift',
                'leg_curl',
                'nordic_curl',
                'good_morning',
                'glute_ham_raise'
            ],

            glutes: ['hip_thrust', 'glute_bridge', 'cable_kickback', 'sumo_deadlift'],

            calves: ['standing_calf_raise', 'seated_calf_raise', 'donkey_calf_raise'],

            // Core
            abs: [
                'cable_crunch',
                'hanging_leg_raise',
                'ab_wheel_rollout',
                'plank_variations',
                'russian_twist'
            ]
        },

        methodologies: [
            'hypertrophie_myofibrillaire',
            'hypertrophie_sarcoplasmique',
            'drop_sets',
            'super_sets',
            'giant_sets',
            'rest_pause',
            'tempo_training'
        ],

        training_zones: {
            hypertrophy: 0.7, // 70%
            strength: 0.15, // 15%
            endurance: 0.1, // 10%
            pump: 0.05 // 5%
        },

        preparation_phases: {
            ppg: {
                focus: 'Volume + base musculaire',
                duration_weeks: 8,
                volume: 'very_high',
                intensity: 'moderate'
            },
            ppo: {
                focus: 'Intensité + force',
                duration_weeks: 6,
                volume: 'high',
                intensity: 'high'
            },
            pps: {
                focus: 'Définition + pics',
                duration_weeks: 4,
                volume: 'medium',
                intensity: 'high'
            }
        },

        required_equipment: [
            'barbell',
            'dumbbells',
            'bench',
            'cable_machine',
            'leg_press',
            'leg_curl_machine',
            'leg_extension_machine',
            'smith_machine'
        ]
    },

    /**
     * POWER - Explosivité / Lactique
     */
    power: {
        id: 'power',
        name: 'Power',
        category: 'explosive',
        description: 'Travail de la puissance, explosivité et tolérance lactique',

        objectives: [
            'power_output',
            'explosive_strength',
            'speed_strength',
            'lactate_tolerance',
            'rate_of_force_development'
        ],

        specific_movements: {
            // Olympiques
            olympic: ['clean_power', 'snatch_power', 'push_jerk', 'hang_clean', 'hang_snatch'],

            // Pliométrie
            plyometrics: [
                'box_jump',
                'depth_jump',
                'broad_jump',
                'tuck_jump',
                'split_jump',
                'medicine_ball_slam',
                'medicine_ball_throw',
                'clap_push_up'
            ],

            // Balistique
            ballistic: [
                'kettlebell_swing',
                'kettlebell_snatch',
                'jump_squat',
                'bench_throw',
                'medicine_ball_chest_pass',
                'battle_ropes'
            ],

            // Sprints / vitesse
            speed: [
                'sled_sprint',
                'resisted_sprint',
                'hill_sprint',
                'assault_bike_sprint',
                'rowing_sprint',
                'ski_erg_sprint'
            ],

            // Complexes
            complexes: [
                'clean_front_squat_jerk',
                'deadlift_row_clean',
                'squat_jump_burpee',
                'thruster_burpee'
            ]
        },

        methodologies: [
            'force_vitesse',
            'clusters',
            'complexe_contraste',
            'pliometrie',
            'balistique',
            'emom_power',
            'interval_training_supra_maximal'
        ],

        training_zones: {
            explosive: 0.4, // 40%
            speed_strength: 0.3, // 30%
            lactate: 0.2, // 20%
            recovery: 0.1 // 10%
        },

        preparation_phases: {
            ppg: {
                focus: 'Force générale + base plio',
                duration_weeks: 6,
                volume: 'medium',
                intensity: 'moderate'
            },
            ppo: {
                focus: 'Puissance maximale',
                duration_weeks: 8,
                volume: 'medium',
                intensity: 'very_high'
            },
            pps: {
                focus: 'Expression + peaking',
                duration_weeks: 3,
                volume: 'low',
                intensity: 'maximal'
            }
        },

        required_equipment: [
            'barbell',
            'bumper_plates',
            'kettlebells',
            'medicine_ball',
            'plyo_boxes',
            'sled',
            'battle_ropes'
        ]
    },

    /**
     * SPÉ RUN/BIKE - Endurance / Spécialisation
     */
    spe_run_bike: {
        id: 'spe_run_bike',
        name: 'Spé Run/Bike',
        category: 'endurance_specialist',
        description: 'Spécialisation course à pied et vélo',

        objectives: [
            'vo2max',
            'vma',
            'endurance_aerobic',
            'economy_of_movement',
            'lactate_threshold',
            'ftp'
        ],

        specific_movements: {
            // Running
            running: [
                'easy_run',
                'tempo_run',
                'threshold_run',
                'interval_400m',
                'interval_800m',
                'interval_1000m',
                'fartlek',
                'long_run',
                'recovery_run',
                'hill_repeats',
                'track_intervals'
            ],

            // Running technique
            running_drills: [
                'a_skips',
                'b_skips',
                'high_knees',
                'butt_kicks',
                'carioca',
                'bounds',
                'strides'
            ],

            // Bike
            cycling: [
                'easy_ride',
                'tempo_ride',
                'ftp_intervals',
                'vo2max_intervals',
                'sweet_spot_training',
                'long_ride',
                'hill_climbs',
                'time_trial'
            ],

            // Pliométrie spécifique
            running_plyometrics: [
                'box_jump',
                'depth_jump',
                'single_leg_hop',
                'bounding',
                'ankle_hops',
                'double_leg_jump'
            ],

            // Force spécifique
            running_strength: [
                'single_leg_squat',
                'bulgarian_split_squat',
                'nordic_curl',
                'calf_raise',
                'hip_thrust',
                'glute_bridge',
                'deadlift',
                'lunge_variations'
            ]
        },

        methodologies: [
            'interval_training_hiit',
            'tempo_threshold',
            'fartlek',
            'long_slow_distance',
            'vo2max_intervals',
            'sweet_spot_training',
            'polarized_training'
        ],

        training_zones: {
            aerobic: 0.6, // 60%
            threshold: 0.2, // 20%
            vo2max: 0.1, // 10%
            strength: 0.1 // 10%
        },

        preparation_phases: {
            ppg: {
                focus: 'Base aérobie + force',
                duration_weeks: 12,
                volume: 'very_high',
                intensity: 'low'
            },
            ppo: {
                focus: 'VMA / FTP + seuil',
                duration_weeks: 8,
                volume: 'high',
                intensity: 'high'
            },
            pps: {
                focus: 'Affûtage + compétition',
                duration_weeks: 3,
                volume: 'low',
                intensity: 'race_pace'
            }
        },

        required_equipment: [
            'treadmill',
            'bike_trainer',
            'heart_rate_monitor',
            'power_meter',
            'gps_watch',
            'plyo_boxes'
        ]
    },

    /**
     * PILATES - Bien-être / Posture
     */
    pilates: {
        id: 'pilates',
        name: 'Pilates',
        category: 'wellness',
        description: 'Renforcement musculaire profond, amélioration posturale et bien-être',

        objectives: [
            'posture',
            'core_stability',
            'flexibility',
            'body_awareness',
            'stress_relief',
            'injury_prevention'
        ],

        specific_movements: {
            // Mat Pilates
            mat_work: [
                'hundred',
                'roll_up',
                'roll_over',
                'single_leg_circle',
                'rolling_like_a_ball',
                'single_leg_stretch',
                'double_leg_stretch',
                'spine_stretch_forward',
                'open_leg_rocker',
                'corkscrew',
                'saw',
                'swan_dive',
                'single_leg_kick',
                'double_leg_kick',
                'neck_pull',
                'scissors',
                'bicycle',
                'shoulder_bridge',
                'spine_twist',
                'teaser',
                'seal'
            ],

            // Core
            core: [
                'plank_variations',
                'side_plank',
                'dead_bug',
                'bird_dog',
                'toe_taps',
                'leg_lower'
            ],

            // Mobilité
            mobility: [
                'cat_cow',
                'child_pose',
                'spine_articulation',
                'hip_circles',
                'shoulder_rolls',
                'thoracic_rotation'
            ],

            // Stretching
            stretching: [
                'hamstring_stretch',
                'hip_flexor_stretch',
                'spinal_twist',
                'chest_opener',
                'shoulder_stretch'
            ]
        },

        methodologies: [
            'tempo_slow',
            'breath_work',
            'progressive_overload_light',
            'mind_muscle_connection',
            'flow_training'
        ],

        training_zones: {
            core_work: 0.4, // 40%
            flexibility: 0.3, // 30%
            stability: 0.2, // 20%
            relaxation: 0.1 // 10%
        },

        preparation_phases: {
            beginner: {
                focus: 'Fondamentaux + respiration',
                duration_weeks: 8,
                volume: 'low',
                intensity: 'light'
            },
            intermediate: {
                focus: 'Progression + contrôle',
                duration_weeks: 12,
                volume: 'medium',
                intensity: 'moderate'
            },
            advanced: {
                focus: 'Maîtrise + complexité',
                duration_weeks: 'ongoing',
                volume: 'medium',
                intensity: 'moderate'
            }
        },

        required_equipment: [
            'pilates_mat',
            'pilates_ring',
            'resistance_bands',
            'foam_roller',
            'pilates_ball'
        ]
    }
};

// Export
window.CourseTypologies = CourseTypologies;
