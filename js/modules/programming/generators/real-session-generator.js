/**
 * REAL SESSION GENERATOR
 * Générateur de séances réelles basé sur:
 * - Templates La Skàli (laskali-session-templates.js)
 * - Formats d'entraînement (workout-formats-database.js)
 * - Inventaire exercices (laskali-inventory.json)
 * - Séances existantes dans calendar
 */

const RealSessionGenerator = {
    inventory: null,
    templates: null,
    formats: null,
    sportsDatabases: null, // NEW: référence aux bases sportives

    /**
     * Initialisation - charger toutes les données
     */
    async initialize() {
        console.log('🔧 Initialisation RealSessionGenerator...');

        // Charger inventaire
        if (window.inventoryData) {
            this.inventory = window.inventoryData;
        } else {
            try {
                const response = await fetch('data/laskali-inventory.json');
                this.inventory = await response.json();
            } catch (error) {
                console.warn('⚠️ Impossible de charger inventaire:', error);
            }
        }

        // Charger templates
        if (window.LaSkaliSessionTemplates) {
            this.templates = window.LaSkaliSessionTemplates;
        }

        // Charger formats
        if (window.WorkoutFormatsDatabase) {
            this.formats = window.WorkoutFormatsDatabase;
        }

        // NEW: Charger bases de données sportives
        if (window.SportsDatabasesLoader) {
            await window.SportsDatabasesLoader.init();
            this.sportsDatabases = window.SportsDatabasesLoader;
            console.log('✅ Bases sportives chargées:', this.sportsDatabases.getStats());
        }

        console.log('✅ RealSessionGenerator initialisé');
    },

    /**
     * Générer une séance complète avec exercices réels
     * @param params
     */
    async generateRealSession(params) {
        const {
            sport, // 'trail', 'hyrox', 'crossfit', 'build', 'running'
            sessionType, // Type spécifique (ex: 'endurance_fondamentale', 'metcon', 'push')
            duration, // Minutes
            level, // 'beginner', 'intermediate', 'advanced', 'elite'
            day, // 'Monday', 'Tuesday', etc.
            weekPhase, // 'PPG', 'PPO', 'PPS'
            customTitle // Titre personnalisé optionnel
        } = params;

        if (!this.inventory || !this.templates || !this.formats) {
            await this.initialize();
        }

        console.log('🏋️ Génération séance réelle:', {
            sport,
            sessionType,
            duration,
            level,
            weekPhase
        });

        // NOUVEAU: Essayer d'abord la génération depuis les bases complètes
        if (this.sportsDatabases) {
            const sessionFromDB = await this.generateSessionFromDatabase(params);
            if (sessionFromDB) {
                console.log('✅ Séance générée depuis base complète:', sessionFromDB.title);
                return sessionFromDB;
            }
        }

        // FALLBACK: Ancien système si base indisponible
        // 1. Obtenir structure depuis templates ou formats
        const structure = this.getSessionStructure(sport, sessionType);
        if (!structure) {
            return this.generateFallbackSession(params);
        }

        // 2. Créer séance de base
        const session = {
            day: day,
            title: customTitle || structure.name || 'Séance',
            type: sessionType,
            duration_minutes: duration || structure.duration_range?.[0] || 60,
            rpe_target: structure.rpe || '7/10',
            objectives: structure.objectives || [structure.description || 'Développement général'],
            warmup: await this.generateWarmup(sport, structure, duration, level),
            main_work: await this.generateMainWork(sport, sessionType, structure, duration, level),
            cooldown: await this.generateCooldown(sport, structure, duration, level),
            technical_notes: structure.notes || structure.description
        };

        // 3. Vérifier cohérence durées
        this.adjustDurations(session);

        console.log('✅ Séance générée (ancien système):', session.title);
        return session;
    },

    /**
     * NOUVEAU: Générer séance depuis bases de données complètes
     * @param params
     */
    async generateSessionFromDatabase(params) {
        const { sport, sessionType, duration, level, weekPhase, customTitle, day } = params;

        if (!this.sportsDatabases) {
            return null;
        }

        const phase = (weekPhase || 'ppg').toLowerCase();
        const sessionData = this.sportsDatabases.getSession(sport, sessionType, phase, level);

        if (!sessionData || !sessionData.sessions || sessionData.sessions.length === 0) {
            console.warn(`⚠️ Aucune séance trouvée pour ${sport}/${sessionType}/${phase}/${level}`);
            return null;
        }

        // Sélectionner une séance adaptée à la durée demandée
        let selectedSession =
            sessionData.sessions.find(s => Math.abs((s.duration || 60) - duration) <= 15) ||
            sessionData.sessions[0];

        // Construire l'objet séance au format attendu
        const session = {
            day: day,
            title: customTitle || selectedSession.name || sessionData.name || 'Séance',
            type: sessionType,
            duration_minutes: selectedSession.duration || duration || 60,
            rpe_target: selectedSession.rpe || sessionData.rpe || '7/10',
            objectives: this.extractObjectives(selectedSession, sessionData),
            warmup: this.formatWarmup(selectedSession.structure?.warmup),
            main_work: this.formatMainWork(selectedSession.structure?.main_work),
            cooldown: this.formatCooldown(selectedSession.structure?.cooldown),
            technical_notes: selectedSession.notes || sessionData.description || ''
        };

        return session;
    },

    /**
     * Extraire objectifs depuis la séance
     * @param session
     * @param sessionData
     */
    extractObjectives(session, sessionData) {
        const objectives = [];

        if (sessionData.description) {
            objectives.push(sessionData.description);
        }

        if (session.structure?.main_work?.purpose) {
            objectives.push(session.structure.main_work.purpose);
        }

        if (objectives.length === 0) {
            objectives.push('Développement physique');
        }

        return objectives;
    },

    /**
     * Formater warmup depuis structure base de données
     * @param warmupData
     */
    formatWarmup(warmupData) {
        if (!warmupData) {
            return {
                duration_minutes: 10,
                objectives: ['Échauffement'],
                exercises: [{ name: 'Échauffement général', duration: '10min' }]
            };
        }

        return {
            duration_minutes: warmupData.duration_minutes || 10,
            objectives: warmupData.objectives || ['Préparation physique', 'Activation'],
            exercises: warmupData.exercises || []
        };
    },

    /**
     * Formater main work depuis structure base de données
     * @param mainWorkData
     */
    formatMainWork(mainWorkData) {
        if (!mainWorkData) {
            return {
                duration_minutes: 40,
                objectives: ['Travail principal'],
                exercises: []
            };
        }

        // Adapter selon le format de main_work
        const formatted = {
            duration_minutes: mainWorkData.duration_minutes || 40,
            methodology: mainWorkData.methodology || mainWorkData.title || 'Progressive',
            objectives: []
        };

        // Extraire objectifs
        if (mainWorkData.purpose) {
            formatted.objectives.push(mainWorkData.purpose);
        }
        if (mainWorkData.goal) {
            formatted.objectives.push(mainWorkData.goal);
        }
        if (mainWorkData.title) {
            formatted.objectives.push(mainWorkData.title);
        }
        if (formatted.objectives.length === 0) {
            formatted.objectives.push('Travail principal');
        }

        // Formater exercices
        formatted.exercises = this.formatExercises(mainWorkData);

        return formatted;
    },

    /**
     * Formater exercices depuis différentes structures possibles
     * @param mainWorkData
     */
    formatExercises(mainWorkData) {
        const exercises = [];

        // Format 1: exercises array direct
        if (mainWorkData.exercises && Array.isArray(mainWorkData.exercises)) {
            return mainWorkData.exercises.map(ex => this.normalizeExercise(ex));
        }

        // Format 2: intervals (running, trail)
        if (mainWorkData.intervals) {
            mainWorkData.intervals.forEach(interval => {
                exercises.push({
                    name: interval.work || 'Interval',
                    reps: interval.rounds || interval.reps,
                    duration: interval.work,
                    recovery: interval.recovery || interval.rest,
                    intensity: interval.pace || interval.intensity,
                    notes: interval.notes || ''
                });
            });
        }

        // Format 3: rounds (CrossFit, HYROX)
        if (mainWorkData.rounds && Array.isArray(mainWorkData.rounds)) {
            exercises.push({
                name: mainWorkData.title || 'Workout',
                format: 'Rounds',
                rounds: mainWorkData.rounds,
                notes: mainWorkData.strategy || mainWorkData.notes || ''
            });
        }

        // Format 4: structure simple avec title
        if (mainWorkData.title && exercises.length === 0) {
            exercises.push({
                name: mainWorkData.title,
                duration: `${mainWorkData.duration_minutes || 30}min`,
                intensity: mainWorkData.zone || mainWorkData.pace || mainWorkData.intensity,
                notes: mainWorkData.notes || mainWorkData.strategy || ''
            });
        }

        return exercises;
    },

    /**
     * Normaliser un exercice au format standard
     * @param exercise
     */
    normalizeExercise(exercise) {
        return {
            name: exercise.name || exercise.exercise || 'Exercice',
            sets: exercise.sets,
            reps: exercise.reps,
            duration: exercise.duration,
            intensity: exercise.intensity || exercise.weight || exercise.pace,
            rest: exercise.rest || exercise.recovery,
            notes: exercise.notes || exercise.technique || exercise.focus || '',
            tempo: exercise.tempo
        };
    },

    /**
     * Formater cooldown depuis structure base de données
     * @param cooldownData
     */
    formatCooldown(cooldownData) {
        if (!cooldownData) {
            return {
                duration_minutes: 10,
                objectives: ['Retour au calme'],
                exercises: [{ name: 'Étirements', duration: '10min' }]
            };
        }

        return {
            duration_minutes: cooldownData.duration_minutes || 10,
            objectives: cooldownData.objectives || ['Retour au calme', 'Récupération'],
            exercises: cooldownData.exercises || []
        };
    },

    /**
     * Obtenir structure de séance depuis templates/formats/databases
     * @param sport
     * @param sessionType
     */
    getSessionStructure(sport, sessionType) {
        // Priorité 1: Nouvelles bases de données sportives complètes
        if (this.sportsDatabases) {
            const db = this.sportsDatabases.getDatabase(sport);
            if (db && db.sessionTypes && db.sessionTypes[sessionType]) {
                return db.sessionTypes[sessionType];
            }
        }

        // Priorité 2: Templates La Skàli
        if (this.templates && this.templates[sessionType]) {
            return this.templates[sessionType];
        }

        // Priorité 3: Formats Database (ancien système)
        if (this.formats && this.formats[sport] && this.formats[sport][sessionType]) {
            return this.formats[sport][sessionType];
        }

        return null;
    },

    /**
     * Générer échauffement
     * @param sport
     * @param structure
     * @param totalDuration
     * @param level
     */
    async generateWarmup(sport, structure, totalDuration, level) {
        const warmupDuration = Math.min(15, Math.floor(totalDuration * 0.2));

        const warmup = {
            duration_minutes: warmupDuration,
            objectives: [
                'Préparation physique',
                'Activation cardio-vasculaire',
                'Mobilité articulaire'
            ],
            exercises: []
        };

        // Exercices d'échauffement depuis inventaire
        if (this.inventory && this.inventory.warmup) {
            const warmupExercises = this.inventory.warmup.slice(0, 4);
            warmupExercises.forEach(ex => {
                warmup.exercises.push({
                    name: ex.name,
                    duration: ex.duration || '2-3 min',
                    notes: ex.description || 'Échauffement progressif',
                    category: 'warmup'
                });
            });
        } else {
            // Fallback échauffement générique
            warmup.exercises = [
                { name: 'Cardio léger', duration: '5 min', notes: 'Vélo, rameur ou course facile' },
                {
                    name: 'Mobilité articulaire',
                    duration: '5 min',
                    notes: 'Rotations, cercles, stretching dynamique'
                },
                {
                    name: 'Activation musculaire',
                    duration: '5 min',
                    notes: 'Mouvements spécifiques à la séance'
                }
            ];
        }

        return warmup;
    },

    /**
     * Générer travail principal
     * @param sport
     * @param sessionType
     * @param structure
     * @param totalDuration
     * @param level
     */
    async generateMainWork(sport, sessionType, structure, totalDuration, level) {
        const mainDuration = Math.floor(totalDuration * 0.65);

        const mainWork = {
            duration_minutes: mainDuration,
            methodology: structure.methodology || 'Progressive Overload',
            objectives: structure.objectives || ['Développement physique'],
            exercises: []
        };

        // Générer exercices selon sport et type
        if (sport === 'trail' || sport === 'running') {
            mainWork.exercises = await this.generateTrailExercises(sessionType, structure, level);
        } else if (sport === 'hyrox') {
            mainWork.exercises = await this.generateHyroxExercises(sessionType, structure, level);
        } else if (sport === 'crossfit') {
            mainWork.exercises = await this.generateCrossfitExercises(
                sessionType,
                structure,
                level
            );
        } else if (sport === 'build' || sport === 'musculation') {
            mainWork.exercises = await this.generateBuildExercises(sessionType, structure, level);
        } else {
            // Générique
            mainWork.exercises = await this.generateGenericExercises(sessionType, structure, level);
        }

        return mainWork;
    },

    /**
     * Générer retour au calme
     * @param sport
     * @param structure
     * @param totalDuration
     * @param level
     */
    async generateCooldown(sport, structure, totalDuration, level) {
        const cooldownDuration = Math.min(15, Math.floor(totalDuration * 0.15));

        const cooldown = {
            duration_minutes: cooldownDuration,
            objectives: ['Retour au calme', 'Récupération active', 'Étirements'],
            exercises: []
        };

        // Exercices cooldown depuis inventaire
        if (this.inventory && this.inventory.cooldown) {
            const cooldownExercises = this.inventory.cooldown.slice(0, 3);
            cooldownExercises.forEach(ex => {
                cooldown.exercises.push({
                    name: ex.name,
                    duration: ex.duration || '3-5 min',
                    notes: ex.description || 'Retour au calme progressif',
                    category: 'cooldown'
                });
            });
        } else {
            // Fallback cooldown générique
            cooldown.exercises = [
                {
                    name: 'Cardio décroissant',
                    duration: '5 min',
                    notes: 'Intensité décroissante progressive'
                },
                {
                    name: 'Étirements passifs',
                    duration: `${cooldownDuration - 5} min`,
                    notes: 'Étirements doux des groupes travaillés'
                }
            ];
        }

        return cooldown;
    },

    /**
     * Générer exercices TRAIL
     * @param sessionType
     * @param structure
     * @param level
     */
    async generateTrailExercises(sessionType, structure, level) {
        const exercises = [];

        if (sessionType.includes('endurance') || sessionType.includes('fondamentale')) {
            exercises.push({
                name: 'Course continue zone 2',
                duration: '45-60 min',
                intensity: '60-70% FCmax',
                notes: 'Allure conversationnelle, rythme régulier',
                metrics: { distance: 'Variable', elevation: 'Selon terrain' }
            });
        } else if (sessionType.includes('seuil') || sessionType.includes('tempo')) {
            exercises.push(
                {
                    name: 'Course progressive',
                    duration: '15 min',
                    intensity: 'Zone 2',
                    notes: 'Montée en intensité graduelle'
                },
                {
                    name: 'Bloc 1 @ seuil',
                    duration: '10 min',
                    intensity: '80-85% FCmax',
                    notes: 'Maintenir allure constante'
                },
                {
                    name: 'Récupération active',
                    duration: '3 min',
                    intensity: 'Facile',
                    notes: 'Trot léger'
                },
                {
                    name: 'Bloc 2 @ seuil',
                    duration: '10 min',
                    intensity: '80-85% FCmax',
                    notes: 'Maintenir allure constante'
                },
                {
                    name: 'Récupération active',
                    duration: '3 min',
                    intensity: 'Facile',
                    notes: 'Trot léger'
                },
                {
                    name: 'Bloc 3 @ seuil',
                    duration: '8 min',
                    intensity: '80-85% FCmax',
                    notes: 'Dernière répétition'
                }
            );
        } else if (sessionType.includes('fractionné') || sessionType.includes('vma')) {
            exercises.push(
                {
                    name: '12 x 400m',
                    sets: 12,
                    distance: '400m',
                    intensity: '95-100% VMA',
                    rest_seconds: 60,
                    notes: 'Récupération trot léger'
                },
                {
                    name: 'ou 8 x 500m',
                    sets: 8,
                    distance: '500m',
                    intensity: '90-95% VMA',
                    rest_seconds: 90,
                    notes: 'Alternative si fatigue'
                }
            );
        } else if (sessionType.includes('cotes') || sessionType.includes('denivele')) {
            exercises.push(
                {
                    name: 'Montées courtes explosives',
                    sets: '10-12',
                    duration: '30-45s',
                    intensity: 'Max',
                    rest: 'Descente récup',
                    notes: 'Puissance musculaire'
                },
                {
                    name: 'ou Montées moyennes',
                    sets: '6-8',
                    duration: '3-5 min',
                    intensity: 'Seuil',
                    rest: 'Descente récup',
                    notes: 'Endurance de force'
                }
            );
        }

        return exercises;
    },

    /**
     * Générer exercices HYROX
     * @param sessionType
     * @param structure
     * @param level
     */
    async generateHyroxExercises(sessionType, structure, level) {
        const exercises = [];

        if (sessionType.includes('simulation')) {
            // Simulation HYROX
            exercises.push(
                { name: '1km Run', distance: '1000m', notes: 'Allure compétition' },
                { name: '1000m SkiErg', distance: '1000m', notes: 'Technique + puissance' },
                { name: '1km Run', distance: '1000m' },
                {
                    name: '50m Sled Push',
                    distance: '50m',
                    load: '102kg/78kg',
                    notes: 'Poids compétition'
                },
                { name: '1km Run', distance: '1000m' },
                { name: '50m Sled Pull', distance: '50m', load: '102kg/78kg' },
                { name: '1km Run', distance: '1000m' },
                { name: '80m Burpee Broad Jump', distance: '80m', notes: 'Explosivité + cardio' }
            );
        } else if (sessionType.includes('stations')) {
            // Travail stations isolées
            const stations = [
                { name: '5 x 500m SkiErg', sets: 5, distance: '500m', rest_seconds: 120 },
                { name: '10 x 50m Sled Push', sets: 10, distance: '50m', rest_seconds: 90 },
                { name: '5 x 50 Wall Balls', sets: 5, reps: 50, load: '9kg/6kg', rest_seconds: 120 }
            ];
            exercises.push(...stations.slice(0, 2)); // 2-3 stations par séance
        } else if (sessionType.includes('metcon')) {
            // MetCon HYROX style
            exercises.push({
                name: 'AMRAP 20 min',
                format: 'As Many Rounds As Possible',
                rounds: ['400m Run', '20 Wall Balls (9kg)', '15 Cal Row', '10 Burpees'],
                notes: 'Compter nombre de tours complétés'
            });
        }

        return exercises;
    },

    /**
     * Générer exercices CROSSFIT
     * @param sessionType
     * @param structure
     * @param level
     */
    async generateCrossfitExercises(sessionType, structure, level) {
        const exercises = [];

        if (sessionType.includes('metcon')) {
            // Choisir un WOD classique ou custom
            const wods = [
                {
                    name: 'Fran',
                    format: '21-15-9 For Time',
                    movements: ['Thrusters (43kg/30kg)', 'Pull-ups'],
                    time_cap: '10 min'
                },
                {
                    name: 'Cindy',
                    format: 'AMRAP 20 min',
                    movements: ['5 Pull-ups', '10 Push-ups', '15 Air Squats']
                },
                {
                    name: 'Helen',
                    format: '3 Rounds For Time',
                    movements: ['400m Run', '21 KBS (24kg)', '12 Pull-ups']
                }
            ];
            const chosenWod = wods[Math.floor(Math.random() * wods.length)];
            exercises.push(chosenWod);
        } else if (sessionType.includes('strength')) {
            // Force
            exercises.push(
                {
                    name: 'Back Squat',
                    sets: 5,
                    reps: 5,
                    intensity: '80-85% 1RM',
                    rest_seconds: 180,
                    notes: 'Progression linéaire'
                },
                {
                    name: 'Accessoire: Front Squat',
                    sets: 3,
                    reps: 8,
                    intensity: '70%',
                    rest_seconds: 120
                },
                {
                    name: 'Accessoire: Bulgarian Split Squats',
                    sets: 3,
                    reps: '10 chaque jambe',
                    rest_seconds: 90
                }
            );
        } else if (sessionType.includes('gymnastics')) {
            // Gymnastique
            exercises.push(
                {
                    name: 'EMOM 16 min',
                    format: 'Every Minute On the Minute',
                    rounds: [
                        'Min 1: 5 Strict Pull-ups',
                        'Min 2: 8 Ring Dips',
                        'Min 3: 5 Toes to Bar',
                        'Min 4: 20s Handstand Hold'
                    ]
                },
                {
                    name: 'Skill Work: Muscle-ups',
                    sets: 4,
                    reps: 3,
                    notes: 'Progressions si nécessaire'
                }
            );
        }

        return exercises;
    },

    /**
     * Générer exercices BUILD (musculation)
     * @param sessionType
     * @param structure
     * @param level
     */
    async generateBuildExercises(sessionType, structure, level) {
        const exercises = [];

        if (sessionType === 'push') {
            exercises.push(
                {
                    name: 'Bench Press',
                    sets: 4,
                    reps: '8-10',
                    intensity: '75-80% 1RM',
                    rest_seconds: 120,
                    notes: 'Mouvement principal'
                },
                { name: 'Incline DB Press', sets: 3, reps: '10-12', rest_seconds: 90 },
                { name: 'Cable Flyes', sets: 3, reps: '12-15', rest_seconds: 60 },
                { name: 'Lateral Raises', sets: 3, reps: '12-15', rest_seconds: 60 },
                { name: 'Triceps Pushdowns', sets: 3, reps: '12-15', rest_seconds: 60 }
            );
        } else if (sessionType === 'pull') {
            exercises.push(
                {
                    name: 'Deadlift',
                    sets: 4,
                    reps: '6-8',
                    intensity: '75-80% 1RM',
                    rest_seconds: 150
                },
                { name: 'Barbell Rows', sets: 4, reps: '8-10', rest_seconds: 90 },
                { name: 'Lat Pulldowns', sets: 3, reps: '10-12', rest_seconds: 60 },
                { name: 'Face Pulls', sets: 3, reps: '15-20', rest_seconds: 60 },
                { name: 'Barbell Curls', sets: 3, reps: '10-12', rest_seconds: 60 }
            );
        } else if (sessionType === 'legs') {
            exercises.push(
                {
                    name: 'Back Squat',
                    sets: 4,
                    reps: '8-10',
                    intensity: '75-80% 1RM',
                    rest_seconds: 150
                },
                {
                    name: 'Bulgarian Split Squats',
                    sets: 3,
                    reps: '10 chaque jambe',
                    rest_seconds: 90
                },
                { name: 'Leg Press', sets: 3, reps: '12-15', rest_seconds: 90 },
                { name: 'Romanian Deadlifts', sets: 3, reps: '10', rest_seconds: 90 },
                { name: 'Leg Curls', sets: 3, reps: '12', rest_seconds: 60 },
                { name: 'Calf Raises', sets: 4, reps: '15-20', rest_seconds: 45 }
            );
        }

        return exercises;
    },

    /**
     * Générer exercices génériques
     * @param sessionType
     * @param structure
     * @param level
     */
    async generateGenericExercises(sessionType, structure, level) {
        const exercises = [];

        // Exercices génériques depuis inventaire
        if (this.inventory) {
            const categories = Object.keys(this.inventory);
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            const categoryExercises = this.inventory[randomCategory];

            if (Array.isArray(categoryExercises)) {
                categoryExercises.slice(0, 5).forEach(ex => {
                    exercises.push({
                        name: ex.name,
                        sets: 3,
                        reps: '10-12',
                        rest_seconds: 90,
                        notes: ex.description || 'Exécution contrôlée',
                        category: randomCategory
                    });
                });
            }
        }

        return exercises;
    },

    /**
     * Ajuster durées pour cohérence
     * @param session
     */
    adjustDurations(session) {
        const warmupDuration = session.warmup.duration_minutes || 10;
        const mainDuration = session.main_work.duration_minutes || 40;
        const cooldownDuration = session.cooldown.duration_minutes || 10;

        const totalCalculated = warmupDuration + mainDuration + cooldownDuration;

        if (totalCalculated !== session.duration_minutes) {
            // Ajuster proportionnellement
            const ratio = session.duration_minutes / totalCalculated;
            session.warmup.duration_minutes = Math.round(warmupDuration * ratio);
            session.main_work.duration_minutes = Math.round(mainDuration * ratio);
            session.cooldown.duration_minutes =
                session.duration_minutes -
                session.warmup.duration_minutes -
                session.main_work.duration_minutes;
        }
    },

    /**
     * Séance de secours
     * @param params
     */
    generateFallbackSession(params) {
        return {
            day: params.day,
            title: params.customTitle || "Séance d'entraînement",
            type: params.sessionType || 'mixte',
            duration_minutes: params.duration || 60,
            rpe_target: '7/10',
            objectives: ['Développement physique général'],
            warmup: {
                duration_minutes: 10,
                exercises: [
                    {
                        name: 'Échauffement cardio',
                        duration: '5 min',
                        notes: 'Vélo, rameur ou course légère'
                    },
                    {
                        name: 'Mobilité articulaire',
                        duration: '5 min',
                        notes: 'Rotations et cercles articulaires'
                    }
                ]
            },
            main_work: {
                duration_minutes: 40,
                methodology: 'Progressive Overload',
                exercises: [
                    {
                        name: 'Exercice composé principal',
                        sets: 4,
                        reps: '8-10',
                        rest_seconds: 120
                    },
                    { name: 'Exercice assistance 1', sets: 3, reps: '10-12', rest_seconds: 90 },
                    { name: 'Exercice assistance 2', sets: 3, reps: '12-15', rest_seconds: 60 }
                ]
            },
            cooldown: {
                duration_minutes: 10,
                exercises: [
                    { name: 'Retour au calme', duration: '5 min', notes: 'Cardio décroissant' },
                    { name: 'Étirements', duration: '5 min', notes: 'Étirements passifs' }
                ]
            },
            technical_notes: 'Séance générique - adapter selon niveau et objectifs'
        };
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealSessionGenerator;
} else {
    window.RealSessionGenerator = RealSessionGenerator;
}
