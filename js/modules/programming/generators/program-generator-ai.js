/**
 * PROGRAM GENERATOR AI
 * Générateur de programme avec Claude Haiku 3.5
 * Utilise le prompt ultra-complet pour créer des programmes personnalisés
 */

const AIProgramGenerator = {
    /**
     * Génération programme complet
     * @param formData
     * @param athlete
     */
    async generateProgram(formData, athlete) {
        console.log('🤖 Début génération programme avec Claude Haiku 3.5...');

        try {
            // 1. Charger les bases de données
            const databases = await this.loadDatabases();

            // 2. Construire le prompt ultra-complet
            const prompt = await AIProgramPromptBuilder.buildPrompt(
                formData,
                athlete,
                databases.exercises,
                databases.methodologies,
                databases.inventory,
                databases.testingProtocols
            );

            console.log('📝 Prompt construit:', prompt.length, 'caractères');

            // 3. Appeler l'API Claude
            const programData = await this.callClaudeAPI(prompt);

            // 4. Valider et enrichir les données
            const validatedProgram = this.validateAndEnrichProgram(programData, formData, athlete);

            // 5. Ajouter métadonnées
            validatedProgram.id = this.generateProgramId();
            validatedProgram.created_at = new Date().toISOString();
            validatedProgram.version = '1.0';
            validatedProgram.generator = 'Claude Haiku 3.5';

            console.log('✅ Programme généré avec succès:', validatedProgram);

            return validatedProgram;
        } catch (error) {
            console.error('❌ Erreur génération programme:', error);
            throw new Error(`Échec génération programme: ${error.message}`);
        }
    },

    /**
     * Chargement bases de données
     */
    async loadDatabases() {
        console.log('📚 Chargement bases de données...');

        const databases = {
            exercises: null,
            methodologies: null,
            inventory: null,
            testingProtocols: null
        };

        try {
            // Exercices
            if (window.exercisesData) {
                databases.exercises = window.exercisesData;
            } else {
                const response = await fetch('data/exercises-complete-enriched.json');
                databases.exercises = await response.json();
            }

            // Méthodologies
            if (window.MethodologiesDatabase) {
                databases.methodologies = window.MethodologiesDatabase;
            }

            // Inventaire
            if (window.inventoryData) {
                databases.inventory = window.inventoryData;
            } else {
                const response = await fetch('data/laskali-inventory.json');
                databases.inventory = await response.json();
            }

            // Protocoles de tests
            if (window.TestingProtocols) {
                databases.testingProtocols = window.TestingProtocols;
            }

            console.log('✅ Bases de données chargées:', {
                exercises: databases.exercises?.length || 0,
                methodologies: databases.methodologies
                    ? Object.keys(databases.methodologies).length
                    : 0,
                inventory: databases.inventory ? Object.keys(databases.inventory).length : 0
            });

            return databases;
        } catch (error) {
            console.warn('⚠️ Erreur chargement bases de données:', error);
            return databases;
        }
    },

    /**
     * Appel API Claude
     * @param prompt
     */
    async callClaudeAPI(prompt) {
        console.log('🌐 Appel API Claude Haiku 3.5...');

        // Vérifier API key
        const apiKey = await this.getAPIKey();
        if (!apiKey) {
            throw new Error('Clé API Claude non configurée');
        }

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-haiku-20241022',
                    max_tokens: 64000, // Augmenté pour programmes complets et détaillés
                    temperature: 0.7,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    `API Claude error: ${errorData.error?.message || response.statusText}`
                );
            }

            const data = await response.json();
            console.log('✅ Réponse API reçue');

            // Extraire le contenu JSON
            const content = data.content[0].text;

            // Parser le JSON (retirer possibles backticks markdown)
            const jsonMatch =
                content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/{[\s\S]*}/);
            if (!jsonMatch) {
                throw new Error('Format de réponse invalide - JSON non trouvé');
            }

            const programData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
            console.log('✅ Programme parsé:', programData.program_title);

            return programData;
        } catch (error) {
            console.error('❌ Erreur API Claude:', error);

            // Fallback: générer programme basique si API échoue
            console.log('⚠️ Génération programme de secours...');
            return this.generateFallbackProgram(prompt);
        }
    },

    /**
     * Récupération clé API
     */
    async getAPIKey() {
        // Ordre de priorité:
        // 1. Variable globale window.CLAUDE_API_KEY
        // 2. localStorage
        // 3. Demander à l'utilisateur

        if (window.CLAUDE_API_KEY) {
            return window.CLAUDE_API_KEY;
        }

        const storedKey = localStorage.getItem('claude_api_key');
        if (storedKey) {
            return storedKey;
        }

        // Demander à l'utilisateur
        const key = prompt('Veuillez entrer votre clé API Claude (sera sauvegardée localement):');
        if (key) {
            localStorage.setItem('claude_api_key', key);
            return key;
        }

        return null;
    },

    /**
     * Validation et enrichissement programme
     * @param programData
     * @param formData
     * @param athlete
     */
    validateAndEnrichProgram(programData, formData, athlete) {
        console.log('🔍 Validation programme...');

        // Vérifications basiques
        if (!programData.weeks || !Array.isArray(programData.weeks)) {
            throw new Error('Format programme invalide - manque weeks[]');
        }

        if (programData.weeks.length !== parseInt(formData.duration_weeks)) {
            console.warn(
                `⚠️ Nombre de semaines incorrect: attendu ${formData.duration_weeks}, reçu ${programData.weeks.length}`
            );
        }

        // Enrichir chaque semaine
        programData.weeks.forEach((week, index) => {
            week.week_number = index + 1;

            // Calculer dates
            const startDate = new Date(formData.start_date);
            startDate.setDate(startDate.getDate() + index * 7);
            week.start_date = startDate.toISOString().split('T')[0];

            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            week.end_date = endDate.toISOString().split('T')[0];

            // Valider sessions
            if (!week.sessions || !Array.isArray(week.sessions)) {
                week.sessions = [];
            }

            // S'assurer que chaque session a une structure complète
            week.sessions.forEach(session => {
                if (!session.warmup) {
                    session.warmup = { duration_minutes: 10, exercises: [] };
                }
                if (!session.main_work) {
                    session.main_work = { duration_minutes: 40, exercises: [] };
                }
                if (!session.cooldown) {
                    session.cooldown = { duration_minutes: 10, exercises: [] };
                }
                if (!session.rpe_target) {
                    session.rpe_target = '7/10';
                }
            });
        });

        // Ajouter infos athlète
        programData.athlete_id = athlete.id;
        programData.athlete_name = athlete.name;

        // Ajouter paramètres du formulaire
        programData.sport = formData.sport;
        programData.duration_weeks = formData.duration_weeks;
        programData.start_date = formData.start_date;
        programData.competition_date = formData.competition_date;
        programData.sessions_per_week = formData.sessions_per_week;
        programData.session_duration = formData.session_duration;
        programData.periodization_type = formData.periodization_type;

        return programData;
    },

    /**
     * Programme de secours (fallback) - AVEC SÉANCES RÉELLES
     * @param promptData
     */
    async generateFallbackProgram(promptData) {
        console.log('⚠️ Génération programme de secours avec séances réelles...');

        // Extraire infos du prompt
        const durationMatch = promptData.match(/Durée totale: (\d+) semaines/);
        const sportMatch = promptData.match(/Sport principal:\*\* (.+)/);
        const sessionMatch = promptData.match(/Séances par semaine: (\d+)/);
        const levelMatch = promptData.match(/Niveau actuel:\*\* (.+)/);

        const duration = durationMatch ? parseInt(durationMatch[1]) : 12;
        const sportRaw = sportMatch ? sportMatch[1] : 'trail';
        const sessionsPerWeek = sessionMatch ? parseInt(sessionMatch[1]) : 4;
        const level = levelMatch ? levelMatch[1].toLowerCase() : 'intermediate';

        // Normaliser sport
        const sport = this.normalizeSport(sportRaw);

        const program = {
            program_title: `Programme ${sportRaw} - ${duration} semaines`,
            athlete_summary:
                'Programme personnalise genere avec SKALI Pro - Base solide de progression',
            objectives: this.getObjectivesBySport(sport),
            weeks: [],
            sport: sport
        };

        // Initialiser RealSessionGenerator si disponible
        if (window.RealSessionGenerator && !RealSessionGenerator.inventory) {
            await RealSessionGenerator.initialize();
        }

        // Obtenir types de séances pour ce sport
        const sessionTypes = this.getSessionTypesForSport(sport);

        // Générer semaines avec VRAIES séances
        for (let i = 0; i < duration; i++) {
            const weekPhase = i < duration * 0.4 ? 'PPG' : i < duration * 0.8 ? 'PPO' : 'PPS';
            const week = {
                week_number: i + 1,
                phase:
                    i < duration * 0.4
                        ? 'Base Building'
                        : i < duration * 0.8
                          ? 'Developpement'
                          : 'Affutage',
                focus: this.getFocusByPhase(weekPhase, sport),
                total_volume_minutes: sessionsPerWeek * 60,
                sessions: [],
                weekly_notes: this.getWeekNotesByPhase(weekPhase),
                recovery_recommendations:
                    'Respectez les jours de repos, sommeil 7-9h, hydratation optimale'
            };

            // Générer sessions RÉELLES
            const days = ['Monday', 'Wednesday', 'Friday', 'Saturday'];
            for (let j = 0; j < Math.min(sessionsPerWeek, 4); j++) {
                let session;

                // Utiliser RealSessionGenerator si disponible
                if (window.RealSessionGenerator && sessionTypes.length > 0) {
                    const sessionType = sessionTypes[j % sessionTypes.length];
                    try {
                        session = await RealSessionGenerator.generateRealSession({
                            sport: sport,
                            sessionType: sessionType.id,
                            duration: 60,
                            level: level,
                            day: days[j],
                            weekPhase: weekPhase
                        });
                    } catch (error) {
                        console.warn('Fallback to generic session:', error);
                        session = this.generateGenericSession(days[j], sport, j + 1);
                    }
                } else {
                    // Fallback session générique
                    session = this.generateGenericSession(days[j], sport, j + 1);
                }

                week.sessions.push(session);
            }

            program.weeks.push(week);
        }

        program.progression_strategy = this.getProgressionStrategy(sport);
        program.testing_schedule = 'Tests recommandes toutes les 4 semaines pour ajuster la charge';
        program.nutrition_recommendations =
            'Apport proteique 1.6-2.2g/kg, hydratation 2-3L/jour, glucides selon volume';
        program.key_success_factors = [
            "Consistance dans l'entrainement",
            'Recuperation adequate',
            'Nutrition optimale',
            'Ecoute de son corps',
            'Progression graduelle'
        ];

        return program;
    },

    /**
     * Normaliser nom sport
     * @param sportRaw
     */
    normalizeSport(sportRaw) {
        const mapping = {
            trail: 'trail',
            'trail running': 'trail',
            course: 'trail',
            running: 'trail',
            hyrox: 'hyrox',
            crossfit: 'crossfit',
            'cross training': 'crossfit',
            musculation: 'build',
            build: 'build',
            bodybuilding: 'build',
            cyclisme: 'cycling',
            bike: 'cycling'
        };

        const normalized = sportRaw.toLowerCase().trim();
        return mapping[normalized] || 'trail';
    },

    /**
     * Obtenir types de séances pour un sport
     * @param sport
     */
    getSessionTypesForSport(sport) {
        if (window.WorkoutFormatsDatabase) {
            return WorkoutFormatsDatabase.getWorkoutTypesForSport(sport) || [];
        }

        // Fallback types par défaut
        const defaultTypes = {
            trail: [
                { id: 'endurance_fondamentale', name: 'Endurance Fondamentale' },
                { id: 'seuil_tempo', name: 'Seuil / Tempo' },
                { id: 'fractionné_court', name: 'Fractionne Court VMA' },
                { id: 'cotes_denivele', name: 'Cotes / Denivele' }
            ],
            hyrox: [
                { id: 'simulation_complete', name: 'Simulation HYROX' },
                { id: 'stations_isolees', name: 'Travail Stations' },
                { id: 'metcon_hyrox', name: 'MetCon HYROX' },
                { id: 'transitions', name: 'Transitions' }
            ],
            crossfit: [
                { id: 'metcon_classic', name: 'MetCon Classique' },
                { id: 'strength_work', name: 'Force' },
                { id: 'gymnastics', name: 'Gymnastique' },
                { id: 'engine_building', name: 'Engine Building' }
            ],
            build: [
                { id: 'push', name: 'Push' },
                { id: 'pull', name: 'Pull' },
                { id: 'legs', name: 'Legs' }
            ]
        };

        return defaultTypes[sport] || defaultTypes.trail;
    },

    /**
     * Obtenir objectifs par sport
     * @param sport
     */
    getObjectivesBySport(sport) {
        const objectives = {
            trail: [
                'Developper endurance aerobique',
                'Ameliorer vitesse au seuil',
                'Renforcer capacites en cotes',
                'Optimiser technique trail'
            ],
            hyrox: [
                'Maitriser les 8 stations HYROX',
                'Ameliorer transitions course-station',
                'Developper endurance specifique',
                'Optimiser strategie de course'
            ],
            crossfit: [
                'Ameliorer force maximale',
                'Developper capacite metabolique',
                'Progresser en gymnastique',
                'Augmenter work capacity'
            ],
            build: [
                'Hypertrophie musculaire',
                'Augmentation force',
                'Developpement equilibre musculaire',
                'Amelioration composition corporelle'
            ]
        };

        return objectives[sport] || objectives.trail;
    },

    /**
     * Focus par phase
     * @param phase
     * @param sport
     */
    getFocusByPhase(phase, sport) {
        const focuses = {
            PPG: {
                trail: 'Volume en endurance, renforcement base',
                hyrox: 'Technique stations, endurance generale',
                crossfit: 'Force base, capacity building',
                build: 'Hypertrophie, volume eleve'
            },
            PPO: {
                trail: 'Intensite au seuil, VMA',
                hyrox: 'Simulations partielles, puissance stations',
                crossfit: 'Force maximale, MetCons intenses',
                build: 'Force maximale, intensite'
            },
            PPS: {
                trail: 'Affutage, maintien qualite',
                hyrox: 'Simulations completes, peaking',
                crossfit: 'Competition prep, peaking',
                build: 'Decharge, maintien'
            }
        };

        return focuses[phase]?.[sport] || 'Progression equilibree';
    },

    /**
     * Notes par phase
     * @param phase
     */
    getWeekNotesByPhase(phase) {
        const notes = {
            PPG: 'Phase de construction - Volume progressif, intensite moderee',
            PPO: 'Phase de developpement - Intensite elevee, qualite prioritaire',
            PPS: "Phase d'affutage - Reduction volume, maintien intensite"
        };

        return notes[phase] || 'Suivez les indications de seance';
    },

    /**
     * Stratégie progression par sport
     * @param sport
     */
    getProgressionStrategy(sport) {
        const strategies = {
            trail: 'Progression volume (10% par semaine), puis intensite, puis specifite terrain',
            hyrox: 'Maitrise technique stations, puis volume, puis intensite simulations',
            crossfit: 'Progression lineaire force, ondulation MetCons, progression skills',
            build: 'Progressive Overload - Augmentation charge 2.5-5% quand cible atteinte'
        };

        return strategies[sport] || 'Progression lineaire et graduelle';
    },

    /**
     * Générer session générique (ultime fallback)
     * @param day
     * @param sport
     * @param sessionNumber
     */
    generateGenericSession(day, sport, sessionNumber) {
        return {
            day: day,
            title: `Seance ${sessionNumber} - ${sport}`,
            duration_minutes: 60,
            type: 'Mixte',
            objectives: ['Developpement physique general'],
            warmup: {
                duration_minutes: 10,
                exercises: [
                    {
                        name: 'Echauffement cardio progressif',
                        duration: '5 min',
                        notes: 'Velo, rameur ou course legere'
                    },
                    {
                        name: 'Mobilite articulaire dynamique',
                        duration: '5 min',
                        notes: 'Rotations, cercles, stretching actif'
                    }
                ]
            },
            main_work: {
                duration_minutes: 40,
                methodology: 'Progressive Overload',
                exercises: [
                    {
                        name: 'Exercice compose principal',
                        sets: 4,
                        reps: '8-10',
                        rest_seconds: 120,
                        notes: 'Mouvement multi-articulaire'
                    },
                    {
                        name: 'Exercice assistance 1',
                        sets: 3,
                        reps: '10-12',
                        rest_seconds: 90,
                        notes: 'Renforcement specifique'
                    },
                    {
                        name: 'Exercice assistance 2',
                        sets: 3,
                        reps: '12-15',
                        rest_seconds: 60,
                        notes: 'Travail complementaire'
                    }
                ]
            },
            cooldown: {
                duration_minutes: 10,
                exercises: [
                    {
                        name: 'Retour au calme progressif',
                        duration: '5 min',
                        notes: 'Cardio intensite decroissante'
                    },
                    {
                        name: 'Etirements passifs',
                        duration: '5 min',
                        notes: 'Focus groupes musculaires travailles'
                    }
                ]
            },
            rpe_target: '7/10',
            technical_notes: 'Focus qualite execution avant quantite'
        };
    },

    /**
     * Génération ID unique
     */
    generateProgramId() {
        return `prog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIProgramGenerator;
} else {
    window.AIProgramGenerator = AIProgramGenerator;
}
