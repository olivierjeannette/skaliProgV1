/**
 * SPÉCIFICATIONS DÉTAILLÉES PAR TYPE D'ENTRAÎNEMENT
 * Fil rouge pour chaque typologie Skàli
 */

const TypeSpecifications = {
    /**
     * SPÉ RUN/BIKE - Athlétisme
     */
    'Run/Bike': {
        nom: 'Spé Run/Bike',
        objectif: 'Technique course + Fractionné comme en athlétisme',

        mouvementsAutorises: [
            'Course (600m, 800m, 1200m)',
            'Vélo',
            'Rameur',
            'Assault Bike',
            'SkiErg',
            'Drills athlé (talons-fesses, montées genoux, skipping, griffé)',
            'Foulées bondissantes',
            'Gammes athlétiques',
            'Sprint départ arrêté',
            'Accélérations progressives'
        ],

        mouvementsInterdits: [
            'Barbells',
            'Dumbbells',
            'Kettlebells',
            'Box jumps',
            'Burpees',
            'GHD',
            'Farmers carry',
            'Sleds',
            'Wall balls',
            'Tout mouvement Tactical/Crossfit'
        ],

        structure: {
            warmup: '8min - Mobilité + Drills légers',
            bloc1: '12-15min - Technique (gammes, drills, éducatifs)',
            bloc2: '15-20min - Fractionné principal'
        },

        exemples: [
            {
                titre: 'Vitesse Soutenue',
                warmup: 'Mobilité chevilles/hanches + 3x30m accélérations',
                bloc1: 'Drills: 3 rounds (30m talons-fesses, 30m montées genoux, 30m skipping, 30m griffé)',
                bloc2: '8x600m @ 90% effort, récup 01:15 marche active'
            },
            {
                titre: 'Seuil Lactique',
                warmup: 'Mobilité + 2x50m foulées bondissantes',
                bloc1: 'Gammes: 4 rounds (20m chaque drill)',
                bloc2: '5x800m @ 85-88% effort, récup 01:45'
            },
            {
                titre: 'Endurance Tempo',
                warmup: 'Mobilité + drills légers',
                bloc1: 'Technique pieds: 10min travail posture et appuis',
                bloc2: '4x1200m @ 80-85% effort, récup 02:00'
            }
        ],

        styleEcriture: 'Simple, direct, comme un coach athlé qui parle à ses athlètes'
    },

    /**
     * BARBELLS CLUB - Force Max
     */
    Barbells: {
        nom: 'Barbells Club',
        objectif: 'Force maximale, Olympic lifting, SBD',

        mouvementsAutorises: [
            'Back squat',
            'Front squat',
            'Overhead squat',
            'Bench press',
            'Deadlift',
            'Strict press',
            'Push press',
            'Snatch (power, full, hang)',
            'Clean (power, full, hang)',
            'Jerk',
            'Romanian deadlift',
            'Good mornings',
            'Rows (bent over, pendlay)',
            'Pull-ups stricts (accessoires)'
        ],

        mouvementsInterdits: [
            'Cardio machines (rameur, bike)',
            'Box jumps',
            'Burpees',
            'Double unders',
            'GHD sit-ups',
            'Tout mouvement metcon/cardio'
        ],

        pourcentages: {
            principal: '85-95% 1RM',
            accessoires: '60-70% 1RM'
        },

        structure: {
            warmup: '8min - Mobilité + Montée en charge',
            bloc1: '15-18min - Force max (85-95% 1RM)',
            bloc2: '12-15min - Accessoires (60-70% 1RM)'
        },

        exemples: [
            {
                titre: 'Squat Day',
                warmup: 'Mobilité hanches + Montée: 5@20%, 5@40%, 3@60%, 1@70%',
                bloc1: 'Back squat 5x3 @ 85% 1RM, repos 03:00',
                bloc2: '3 rounds: 10 Romanian deadlift @ 60% 1RM + 12 GHD back extensions, repos 01:30'
            },
            {
                titre: 'Olympic Day',
                warmup: 'Mobilité thoracique + Snatch pull 3x5 @ 60%',
                bloc1: 'Power snatch 6x2 @ 75% 1RM, repos 02:30',
                bloc2: 'EMOM 10min: 3 hang squat snatch @ 65% 1RM'
            }
        ],

        styleEcriture: 'Pro mais accessible, comme un coach haltéro qui sait vulgariser'
    },

    /**
     * HYROX - Endurance + Stations
     */
    Hyrox: {
        nom: 'Hyrox',
        objectif: 'Préparation compétition Hyrox (run + 8 stations)',

        stations: [
            '1000m SkiErg',
            '50m Sled push',
            '50m Sled pull',
            '80m Burpees broad jump',
            '1000m Rameur',
            '200m Farmers carry',
            '100m Sandbag lunges',
            '75-100 Wall balls'
        ],

        structure: {
            warmup: '8min - Mobilité + Cardio léger',
            bloc1: '15-20min - Simulation partielle Hyrox',
            bloc2: '10-15min - Travail spécifique stations'
        },

        exemples: [
            {
                titre: 'Hyrox Simulation',
                warmup: 'Mobilité + 400m run easy',
                bloc1: '3 rounds: 600m run + 20 burpees + 500m row + 15 wall balls 9kg, repos 02:00',
                bloc2: 'EMOM 12min: Min impair 40m sled push, Min pair 40m farmers carry'
            }
        ],

        styleEcriture: 'Motivant, compétitif, comme un coach Hyrox qui prépare pour la course'
    },

    /**
     * TACTICAL - Circuits Intenses
     */
    Tactical: {
        nom: 'Tactical',
        objectif: 'Circuits grind, style militaire, haute intensité',

        mouvementsAutorises: 'TOUT (mix barbells, cardio, gym, KB, etc.)',

        structure: {
            warmup: '8min - Mobilité + Activation',
            bloc1: '15-20min - Metcon principal',
            bloc2: '10-12min - Finisher ou Chipper'
        },

        exemples: [
            {
                titre: 'Grind',
                warmup: 'Mobilité + 2 rounds légers (5 squats, 5 push-ups, 5 sit-ups)',
                bloc1: 'For Time 21-15-9: Thrusters @ 50% 1RM front squat + Pull-ups + 600m row',
                bloc2: '100 burpees for time'
            }
        ],

        styleEcriture: 'Intense, motivant, comme un coach militaire mais sympa'
    },

    /**
     * BUILD - Hypertrophie
     */
    Build: {
        nom: 'Build',
        objectif:
            '100% muscle building, hypertrophie, style Ronnie Coleman/Schwarzenegger - ZERO cardio',

        mouvementsAutorises: [
            'Barbell movements (squat, bench, deadlift, rows, curls)',
            'Dumbbell work (toutes variantes)',
            'Machines (leg press, hack squat, pec deck, etc.)',
            'Cable work (flies, triceps, curls)',
            'Isolation exercises',
            'Supersets, tri-sets, drop sets, rest-pause',
            'Pull-ups stricts (accessoires dos)',
            'Dips (accessoires chest/triceps)'
        ],

        mouvementsInterdits: [
            '❌ ZERO CARDIO - Pas de rameur, bike, assault bike, skierg',
            '❌ Pas de running, burpees',
            '❌ Pas de circuits cardio ou metcon',
            '❌ Pas de box jumps',
            '❌ Pas de double unders',
            '❌ UNIQUEMENT musculation pure bodybuilding'
        ],

        pourcentages: {
            principal: '65-75% 1RM',
            tempo: '3-0-2 (lent-pause-moyen)',
            repos: '01:00-01:30',
            volume: 'Élevé (10-15 reps)',
            intensite: 'Tension continue, pompe musculaire'
        },

        structure: {
            warmup: '8min - Mobilité + Activation + Séries légères',
            bloc1: '15min - Mouvement principal (squat/bench/deadlift variant)',
            bloc2: '15min - Supersets/tri-sets accessoires isolation'
        },

        exemples: [
            {
                titre: 'Chest Day (Coleman Style)',
                warmup: 'Mobilité épaules + Activation pecs (3x10 bench @ 20-40%)',
                bloc1: 'Bench press 5x8 @ 70% 1RM, tempo 3-0-2, repos 01:30',
                bloc2: '4 rounds: 12 incline DB press @ 65% + 15 cable flies + 20 push-ups, repos 01:15'
            },
            {
                titre: 'Legs Hypertrophie',
                warmup: 'Mobilité hanches + Activation glutes + Séries légères squat',
                bloc1: 'Front squat 4x10 @ 70% 1RM, tempo 3-0-2, repos 01:30',
                bloc2: '4 rounds: 12 Bulgarian split squats @ 55% 1RM + 15 leg curls + 20 leg extensions, repos 01:15'
            },
            {
                titre: 'Back Day (Schwarzenegger Style)',
                warmup: 'Mobilité thoracique + Activation dorsaux + Pull-ups légers',
                bloc1: 'Bent over row 5x8 @ 75% 1RM, tempo 3-0-2, repos 01:30',
                bloc2: '5 rounds: 10 pull-ups stricts + 12 DB rows @ 60% + 15 cable rows, repos 01:00'
            }
        ],

        styleEcriture:
            'Bodybuilding pur, style Ronnie Coleman/Schwarzenegger - Volume massif, isolation, pompe musculaire, ZERO cardio'
    },

    /**
     * POWER - Explosivité
     */
    Power: {
        nom: 'Power',
        objectif: 'Explosivité, vitesse, puissance',

        mouvementsAutorises: [
            'Olympic lifts (60-75% vitesse max)',
            'Box jumps',
            'Broad jumps',
            'Med ball slams/throws',
            'Kettlebell swings',
            'Sprint courte distance',
            'Assault bike sprints'
        ],

        pourcentages: '60-75% 1RM (explosif)',

        structure: {
            warmup: '8min - Mobilité + Activation explosive',
            bloc1: '15min - Olympic lifts explosifs',
            bloc2: '15min - Pliométrie + Power conditioning'
        },

        styleEcriture: 'Énergique, explosif, comme un coach qui pousse à la vitesse max'
    },

    /**
     * GYM SKILLS - Gymnastique
     */
    'Gym Skills': {
        nom: 'Gym Skills',
        objectif: 'Technique gymnastique pure',

        mouvementsAutorises: [
            'Handstand (hold, walk, push-ups)',
            'Muscle-ups (ring, bar)',
            'Pull-ups (strict, chest-to-bar, butterfly)',
            'Dips (ring, bar)',
            'Toes-to-bar',
            'L-sits',
            'Levers (front, back)',
            'Skin the cat',
            'Kipping variations'
        ],

        mouvementsInterdits: ['Barbells', 'Cardio machines', 'GHD sit-ups'],

        structure: {
            warmup: '8min - Mobilité épaules + Activation scapulaire',
            bloc1: '15min - Skill work (technique pure)',
            bloc2: '15min - Volume (reps, EMOM, etc.)'
        },

        styleEcriture: 'Patient, technique, comme un coach gym qui décompose les mouvements'
    },

    /**
     * PILATES - Renforcement Profond
     */
    Pilates: {
        nom: 'Pilates',
        objectif: 'Renforcement core, mobilité, posture',

        mouvementsAutorises: [
            'Dead bug variations',
            'Bird dog',
            'Plank variations',
            'Hollow hold',
            'Superman',
            'Glute bridge',
            'Cat-cow',
            'Thread the needle',
            'Hip flexor stretches',
            'Thoracic rotations'
        ],

        mouvementsInterdits: ['Barbells', 'Cardio machines', 'GHD sit-ups', 'Mouvements à impact'],

        structure: {
            warmup: '8min - Respiration + Mobilité douce',
            bloc1: '15min - Core profond',
            bloc2: '15min - Mobilité + Étirements actifs'
        },

        styleEcriture: 'Calme, précis, comme un prof de Pilates qui insiste sur la qualité'
    }
};

// Export
if (typeof window !== 'undefined') {
    window.TypeSpecifications = TypeSpecifications;
}

console.log('✅ Type Specifications chargées');
