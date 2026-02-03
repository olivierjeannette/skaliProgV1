/**
 * ═══════════════════════════════════════════════════════════════
 * SESSION GENERATOR - HYPER-SPÉCIALISÉ
 * Génération de séances ultra-personnalisées par typologie de cours
 * Concordance: Objectifs × Besoins × Semaine type × Équipement × Niveau
 * ═══════════════════════════════════════════════════════════════
 */

const SessionGeneratorSpecialized = {
    /**
     * GÉNÉRATION PRINCIPALE
     * Entrée: Config complète de l'adhérent + semaine type
     * Sortie: Programme de séances hyper-spécialisées
     * @param config
     */
    async generateSessionPlan(config) {
        try {
            console.log('🎯 Génération plan de séances hyper-spécialisé...');
            console.log('Config:', config);

            // 1. ANALYSER LE PROFIL
            const profile = this.analyzeAthleteProfile(config);
            console.log('📊 Profil analysé:', profile);

            // 2. CRÉER LA SEMAINE TYPE
            const weekTemplate = this.createWeekTemplate(config, profile);
            console.log('📅 Semaine type:', weekTemplate);

            // 3. CHARGER L'ÉQUIPEMENT DISPONIBLE
            const availableEquipment = await this.loadAvailableEquipment();
            console.log('🏋️ Équipement:', availableEquipment.length, 'items');

            // 4. GÉNÉRER LES SÉANCES
            const sessions = await this.generateSessions(
                config,
                profile,
                weekTemplate,
                availableEquipment
            );
            console.log('✅ Séances générées:', sessions.length);

            return {
                profile,
                week_template: weekTemplate,
                sessions,
                generated_at: new Date().toISOString()
            };
        } catch (error) {
            console.error('❌ Erreur génération:', error);
            throw error;
        }
    },

    /**
     * 1. ANALYSE DU PROFIL ATHLÈTE
     * @param config
     */
    analyzeAthleteProfile(config) {
        const { athlete, objectives, training_preferences, sport } = config;

        // Déterminer la typologie principale
        const primary_typology = this.determinePrimaryTypology(objectives, sport);

        // Déterminer les typologies secondaires
        const secondary_typologies = this.determineSecondaryTypologies(objectives, sport);

        // Analyser les besoins spécifiques
        const needs = this.analyzeNeeds(athlete, objectives);

        // Calculer les zones d'entraînement
        const training_zones = this.calculateTrainingZones(primary_typology, objectives);

        return {
            primary_typology,
            secondary_typologies,
            needs,
            training_zones,
            level: athlete.level,
            experience_years: athlete.experience_years || 2,
            recovery_capacity: athlete.recovery_capacity || 'normal',
            limitations: athlete.limitations || []
        };
    },

    /**
     * Détermine la typologie principale selon objectifs + sport
     * @param objectives
     * @param sport
     */
    determinePrimaryTypology(objectives, sport) {
        // Si sport HYROX → typologie HYROX
        if (sport === 'hyrox' || objectives.includes('hyrox_competition')) {
            return 'hyrox';
        }

        // Si objectif force maximale → Barbells Club
        if (objectives.includes('force_maximale') || objectives.includes('powerlifting')) {
            return 'barbells_club';
        }

        // Si objectif skills gymnastiques → Gym Skills
        if (objectives.includes('gymnastics') || objectives.includes('calisthenics')) {
            return 'gym_skills';
        }

        // Si objectif endurance running/bike → Spé Run/Bike
        if (sport === 'trail' || sport === 'running' || sport === 'cycling') {
            return 'spe_run_bike';
        }

        // Si objectif hypertrophie → Build
        if (objectives.includes('hypertrophie') || objectives.includes('muscle_gain')) {
            return 'build';
        }

        // Si objectif explosivité → Power
        if (objectives.includes('power') || objectives.includes('explosivite')) {
            return 'power';
        }

        // Par défaut → Tactical (polyvalence)
        return 'tactical';
    },

    /**
     * Détermine les typologies secondaires
     * @param objectives
     * @param sport
     */
    determineSecondaryTypologies(objectives, sport) {
        const secondaries = [];

        // Toujours inclure du Tactical pour work capacity
        if (!objectives.includes('hyrox_competition')) {
            secondaries.push('tactical');
        }

        // Si objectif force + hypertrophie
        if (objectives.includes('force_maximale') && objectives.includes('hypertrophie')) {
            secondaries.push('build');
        }

        // Si objectif explosivité
        if (objectives.includes('power') || objectives.includes('explosivite')) {
            secondaries.push('power');
        }

        // Si besoin mobilité
        if (objectives.includes('mobility') || objectives.includes('flexibility')) {
            secondaries.push('pilates');
        }

        return secondaries;
    },

    /**
     * Analyse les besoins spécifiques
     * @param athlete
     * @param objectives
     */
    analyzeNeeds(athlete, objectives) {
        const needs = {
            strength: 0,
            endurance: 0,
            power: 0,
            mobility: 0,
            skill: 0,
            recovery: 0
        };

        // Force
        if (objectives.includes('force_maximale')) {
            needs.strength = 0.8;
        } else if (objectives.includes('hypertrophie')) {
            needs.strength = 0.6;
        } else {
            needs.strength = 0.3;
        }

        // Endurance
        if (objectives.includes('endurance')) {
            needs.endurance = 0.8;
        } else if (objectives.includes('hyrox_competition')) {
            needs.endurance = 0.7;
        } else {
            needs.endurance = 0.2;
        }

        // Puissance
        if (objectives.includes('power')) {
            needs.power = 0.8;
        } else if (objectives.includes('explosivite')) {
            needs.power = 0.7;
        } else {
            needs.power = 0.3;
        }

        // Mobilité
        if (objectives.includes('mobility')) {
            needs.mobility = 0.8;
        } else if (athlete.limitations?.length > 0) {
            needs.mobility = 0.5;
        } else {
            needs.mobility = 0.2;
        }

        // Skills
        if (objectives.includes('gymnastics')) {
            needs.skill = 0.8;
        } else {
            needs.skill = 0.2;
        }

        // Récupération (basé sur capacité)
        if (athlete.recovery_capacity === 'slow') {
            needs.recovery = 0.7;
        } else if (athlete.recovery_capacity === 'fast') {
            needs.recovery = 0.3;
        } else {
            needs.recovery = 0.5;
        }

        return needs;
    },

    /**
     * Calcule les zones d'entraînement
     * @param typology
     * @param objectives
     */
    calculateTrainingZones(typology, objectives) {
        const typologyConfig = window.CourseTypologies[typology];
        if (!typologyConfig) {
            return { strength: 0.4, cardio: 0.3, skill: 0.2, recovery: 0.1 };
        }

        return typologyConfig.training_zones;
    },

    /**
     * 2. CRÉER LA SEMAINE TYPE
     * @param config
     * @param profile
     */
    createWeekTemplate(config, profile) {
        const { frequency, session_duration, training_preferences } = config;

        const days = [
            { day: 1, name: 'Lundi' },
            { day: 2, name: 'Mardi' },
            { day: 3, name: 'Mercredi' },
            { day: 4, name: 'Jeudi' },
            { day: 5, name: 'Vendredi' },
            { day: 6, name: 'Samedi' },
            { day: 0, name: 'Dimanche' }
        ];

        const weekTemplate = [];
        const daysPerWeek = frequency || 4;

        // Répartition intelligente selon typologie
        const distribution = this.getSessionDistribution(profile.primary_typology, daysPerWeek);

        // Créer le planning
        let sessionIndex = 0;
        for (let i = 0; i < 7 && sessionIndex < daysPerWeek; i++) {
            if (distribution.training_days.includes(i)) {
                weekTemplate.push({
                    day: days[i].day,
                    day_name: days[i].name,
                    typology: distribution.session_types[sessionIndex],
                    duration_min: session_duration || 60,
                    focus: distribution.focus[sessionIndex]
                });
                sessionIndex++;
            } else {
                weekTemplate.push({
                    day: days[i].day,
                    day_name: days[i].name,
                    typology: 'recovery',
                    duration_min: 0,
                    focus: 'Repos / Récupération active'
                });
            }
        }

        return weekTemplate;
    },

    /**
     * Distribution intelligente des séances selon typologie
     * @param typology
     * @param daysPerWeek
     */
    getSessionDistribution(typology, daysPerWeek) {
        const distributions = {
            // HYROX: alternance force/cardio
            hyrox: {
                3: {
                    training_days: [1, 3, 5],
                    session_types: ['hyrox', 'hyrox', 'hyrox'],
                    focus: ['Stations HYROX', 'Running + Force', 'MetCon Complet']
                },
                4: {
                    training_days: [1, 2, 4, 6],
                    session_types: ['hyrox', 'tactical', 'hyrox', 'spe_run_bike'],
                    focus: ['Stations lourdes', 'Work capacity', 'Stations légères', 'Running VMA']
                },
                5: {
                    training_days: [1, 2, 3, 5, 6],
                    session_types: ['hyrox', 'tactical', 'hyrox', 'power', 'spe_run_bike'],
                    focus: [
                        'Force + Running',
                        'MetCon',
                        'Stations complètes',
                        'Explosivité',
                        'Endurance'
                    ]
                }
            },

            // Barbells Club: force pure
            barbells_club: {
                3: {
                    training_days: [1, 3, 5],
                    session_types: ['barbells_club', 'barbells_club', 'barbells_club'],
                    focus: ['Squat + Bench', 'Deadlift + Press', 'Olympic Lifts']
                },
                4: {
                    training_days: [1, 2, 4, 5],
                    session_types: ['barbells_club', 'barbells_club', 'barbells_club', 'tactical'],
                    focus: ['Squat focus', 'Bench focus', 'Deadlift focus', 'Conditioning']
                },
                5: {
                    training_days: [1, 2, 3, 5, 6],
                    session_types: [
                        'barbells_club',
                        'barbells_club',
                        'build',
                        'barbells_club',
                        'tactical'
                    ],
                    focus: ['Squat', 'Bench', 'Accessoires', 'Olympic', 'Work capacity']
                }
            },

            // Gym Skills: fréquence élevée, volume modéré
            gym_skills: {
                3: {
                    training_days: [1, 3, 5],
                    session_types: ['gym_skills', 'gym_skills', 'gym_skills'],
                    focus: ['Pull focus', 'Push focus', 'Legs + Core']
                },
                4: {
                    training_days: [1, 2, 4, 5],
                    session_types: ['gym_skills', 'gym_skills', 'gym_skills', 'pilates'],
                    focus: ['Barre fixe', 'Anneaux', 'Sol + Handstand', 'Mobilité']
                },
                5: {
                    training_days: [1, 2, 3, 5, 6],
                    session_types: [
                        'gym_skills',
                        'gym_skills',
                        'tactical',
                        'gym_skills',
                        'pilates'
                    ],
                    focus: ['Pull skills', 'Push skills', 'Conditioning', 'Legs + Core', 'Mobility']
                }
            },

            // Tactical: haute fréquence possible
            tactical: {
                3: {
                    training_days: [1, 3, 5],
                    session_types: ['tactical', 'tactical', 'tactical'],
                    focus: ['MetCon Force', 'MetCon Cardio', 'MetCon Mixte']
                },
                4: {
                    training_days: [1, 2, 4, 6],
                    session_types: ['tactical', 'tactical', 'tactical', 'pilates'],
                    focus: ['Loaded carries', 'AMRAP', 'For Time', 'Récupération']
                },
                5: {
                    training_days: [1, 2, 3, 5, 6],
                    session_types: ['tactical', 'power', 'tactical', 'barbells_club', 'tactical'],
                    focus: ['Endurance', 'Explosivité', 'Strength', 'Force max', 'Long MetCon']
                }
            },

            // Build: split classique
            build: {
                3: {
                    training_days: [1, 3, 5],
                    session_types: ['build', 'build', 'build'],
                    focus: ['Push', 'Pull', 'Legs']
                },
                4: {
                    training_days: [1, 2, 4, 5],
                    session_types: ['build', 'build', 'build', 'build'],
                    focus: ['Chest + Triceps', 'Back + Biceps', 'Shoulders', 'Legs']
                },
                5: {
                    training_days: [1, 2, 3, 5, 6],
                    session_types: ['build', 'build', 'tactical', 'build', 'build'],
                    focus: ['Chest', 'Back', 'Cardio', 'Legs', 'Arms + Shoulders']
                }
            },

            // Power: intensité élevée, récup importante
            power: {
                3: {
                    training_days: [1, 3, 5],
                    session_types: ['power', 'power', 'power'],
                    focus: ['Olympic + Plio', 'Sprints + Force', 'Complexes']
                },
                4: {
                    training_days: [1, 2, 4, 6],
                    session_types: ['power', 'tactical', 'power', 'pilates'],
                    focus: ['Explosivité max', 'Work capacity', 'Speed strength', 'Mobilité']
                }
            },

            // Spé Run/Bike: volume élevé
            spe_run_bike: {
                3: {
                    training_days: [1, 3, 5],
                    session_types: ['spe_run_bike', 'spe_run_bike', 'spe_run_bike'],
                    focus: ['Tempo', 'Intervals', 'Long run']
                },
                4: {
                    training_days: [1, 2, 4, 6],
                    session_types: [
                        'spe_run_bike',
                        'barbells_club',
                        'spe_run_bike',
                        'spe_run_bike'
                    ],
                    focus: ['VMA', 'Force', 'Seuil', 'Endurance']
                },
                5: {
                    training_days: [1, 2, 3, 5, 6],
                    session_types: [
                        'spe_run_bike',
                        'barbells_club',
                        'spe_run_bike',
                        'power',
                        'spe_run_bike'
                    ],
                    focus: ['Intervals', 'Force', 'Tempo', 'Plio', 'Long run']
                }
            }
        };

        const dist = distributions[typology] || distributions.tactical;
        return dist[daysPerWeek] || dist[4];
    },

    /**
     * 3. CHARGER L'ÉQUIPEMENT DISPONIBLE
     */
    async loadAvailableEquipment() {
        // Charger depuis l'inventaire
        const equipment = window.GymInventoryManager?.state?.equipment || [];

        // Filtrer uniquement disponible
        return equipment.filter(eq => eq.is_available && eq.quantity > 0);
    },

    /**
     * 4. GÉNÉRER LES SÉANCES
     * @param config
     * @param profile
     * @param weekTemplate
     * @param availableEquipment
     */
    async generateSessions(config, profile, weekTemplate, availableEquipment) {
        const sessions = [];

        for (const dayTemplate of weekTemplate) {
            if (dayTemplate.typology === 'recovery') {
                sessions.push({
                    day: dayTemplate.day,
                    day_name: dayTemplate.day_name,
                    type: 'recovery',
                    duration_min: 0,
                    exercises: [],
                    notes: 'Jour de repos ou récupération active légère (marche, stretching)'
                });
                continue;
            }

            // Générer la séance selon la typologie
            const session = await this.generateSessionByTypology(
                dayTemplate,
                profile,
                config,
                availableEquipment
            );

            sessions.push(session);
        }

        return sessions;
    },

    /**
     * Génère une séance selon la typologie
     * @param dayTemplate
     * @param profile
     * @param config
     * @param availableEquipment
     */
    async generateSessionByTypology(dayTemplate, profile, config, availableEquipment) {
        const typology = dayTemplate.typology;
        const typologyConfig = window.CourseTypologies[typology];

        if (!typologyConfig) {
            throw new Error(`Typologie inconnue: ${typology}`);
        }

        // Construire le prompt pour Claude
        const prompt = this.buildSessionPrompt(
            dayTemplate,
            typologyConfig,
            profile,
            config,
            availableEquipment
        );

        // Appeler Claude pour génération
        const sessionData = await this.generateWithClaude(prompt);

        return {
            day: dayTemplate.day,
            day_name: dayTemplate.day_name,
            typology: typology,
            typology_name: typologyConfig.name,
            focus: dayTemplate.focus,
            duration_min: dayTemplate.duration_min,
            ...sessionData
        };
    },

    /**
     * Construit le prompt pour une séance spécifique
     * @param dayTemplate
     * @param typologyConfig
     * @param profile
     * @param config
     * @param availableEquipment
     */
    buildSessionPrompt(dayTemplate, typologyConfig, profile, config, availableEquipment) {
        // Filtrer les mouvements disponibles selon équipement
        const availableMovements = this.filterMovementsByEquipment(
            typologyConfig.specific_movements,
            availableEquipment
        );

        // Méthodologies appropriées
        const methodologies = window.GymInventoryManager?.state?.methodologies || [];
        const relevantMethodologies = methodologies.filter(
            m =>
                typologyConfig.methodologies.includes(m.slug) &&
                this.isMethodologyAppropriate(m, profile.level)
        );

        return `Tu es un coach expert en ${typologyConfig.name}.

# SÉANCE À CRÉER
- Jour: ${dayTemplate.day_name}
- Focus: ${dayTemplate.focus}
- Durée: ${dayTemplate.duration_min} minutes
- Typologie: ${typologyConfig.description}

# PROFIL ATHLÈTE
${JSON.stringify(
    {
        niveau: profile.level,
        experience: profile.experience_years,
        recuperation: profile.recovery_capacity,
        limitations: profile.limitations,
        besoins: profile.needs
    },
    null,
    2
)}

# OBJECTIFS DE LA SÉANCE
${typologyConfig.objectives.join(', ')}

# MOUVEMENTS DISPONIBLES (équipement salle)
${JSON.stringify(availableMovements, null, 2)}

# MÉTHODOLOGIES APPROPRIÉES
${JSON.stringify(
    relevantMethodologies.slice(0, 10).map(m => ({
        nom: m.name,
        reps: [m.rep_range_min, m.rep_range_max],
        series: [m.sets_min, m.sets_max],
        repos: [m.rest_seconds_min, m.rest_seconds_max],
        intensite: [m.intensity_percent_min, m.intensity_percent_max]
    })),
    null,
    2
)}

# ZONES D'ENTRAÎNEMENT CIBLES
${JSON.stringify(typologyConfig.training_zones, null, 2)}

# INSTRUCTIONS
1. Crée une séance complète de ${dayTemplate.duration_min} minutes
2. Utilise UNIQUEMENT les mouvements disponibles
3. Applique les méthodologies appropriées
4. Respecte le focus: ${dayTemplate.focus}
5. Structure: Échauffement → Partie principale → Retour au calme
6. Calcule les charges si 1RM disponibles

# FORMAT OUTPUT (JSON STRICT)
{
  "warm_up": {
    "duration_min": number,
    "exercises": [
      {
        "name": "string",
        "duration_or_reps": "string",
        "notes": "string"
      }
    ]
  },
  "main_work": {
    "duration_min": number,
    "structure": "EMOM|AMRAP|For Time|Straight Sets|Circuit",
    "exercises": [
      {
        "order": number,
        "name": "string",
        "sets": number,
        "reps_min": number,
        "reps_max": number,
        "intensity_percent": number,
        "load_kg": number,
        "rest_sec": number,
        "tempo": "string|null",
        "methodology": "string",
        "muscle_target": "string",
        "notes": "string"
      }
    ]
  },
  "cool_down": {
    "duration_min": number,
    "exercises": [
      {
        "name": "string",
        "duration_or_reps": "string",
        "notes": "string"
      }
    ]
  },
  "coaching_notes": ["string"],
  "estimated_calories": number
}

Génère maintenant la séance complète en JSON.`;
    },

    /**
     * Filtre les mouvements selon équipement disponible
     * @param movements
     * @param availableEquipment
     */
    filterMovementsByEquipment(movements, availableEquipment) {
        // Créer une map des slugs d'équipement disponibles
        const equipmentSlugs = new Set(availableEquipment.map(eq => eq.slug));

        // Toujours autoriser les mouvements au poids du corps
        equipmentSlugs.add('body_only');
        equipmentSlugs.add('bodyweight');

        const filtered = {};

        for (const [category, exerciseList] of Object.entries(movements)) {
            filtered[category] = exerciseList.filter(exercise => {
                // Pour l'instant, on garde tous les exercices
                // TODO: implémenter le matching réel avec la base d'exercices
                return true;
            });
        }

        return filtered;
    },

    /**
     * Vérifie si une méthodologie est appropriée au niveau
     * @param methodology
     * @param athleteLevel
     */
    isMethodologyAppropriate(methodology, athleteLevel) {
        const levelHierarchy = {
            beginner: ['beginner'],
            intermediate: ['beginner', 'intermediate'],
            advanced: ['beginner', 'intermediate', 'advanced']
        };

        return levelHierarchy[athleteLevel]?.includes(methodology.min_experience_level) || false;
    },

    /**
     * Génération avec Claude
     * @param prompt
     */
    async generateWithClaude(prompt) {
        // 🆕 Récupérer la clé depuis ENV (qui redirige vers APIKeysManager automatiquement)
        const API_KEY = ENV.get('claudeKey');

        if (!API_KEY) {
            console.warn(
                '⚠️ API Key Claude non configurée - Mode démo. Allez dans Configuration → Intelligence Artificielle.'
            );
            return this.generateDemoSession();
        }

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-haiku-20241022',
                    max_tokens: 4000,
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
                throw new Error('Erreur API Claude');
            }

            const data = await response.json();
            const text = data.content[0].text;

            // Parser JSON
            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('JSON non trouvé dans réponse');
            }

            const jsonStr = jsonMatch[1] || jsonMatch[0];
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error('❌ Erreur Claude:', error);
            return this.generateDemoSession();
        }
    },

    /**
     * Session démo (fallback)
     */
    generateDemoSession() {
        return {
            warm_up: {
                duration_min: 10,
                exercises: [
                    { name: 'Light cardio', duration_or_reps: '5 min', notes: 'Tapis ou rameur' },
                    {
                        name: 'Dynamic stretching',
                        duration_or_reps: '5 min',
                        notes: 'Mobilité générale'
                    }
                ]
            },
            main_work: {
                duration_min: 40,
                structure: 'Straight Sets',
                exercises: [
                    {
                        order: 1,
                        name: 'Back Squat',
                        sets: 4,
                        reps_min: 6,
                        reps_max: 8,
                        intensity_percent: 75,
                        load_kg: 0,
                        rest_sec: 180,
                        tempo: '3-0-1-0',
                        methodology: 'Force',
                        muscle_target: 'Quadriceps',
                        notes: 'Composé principal'
                    },
                    {
                        order: 2,
                        name: 'Bench Press',
                        sets: 4,
                        reps_min: 6,
                        reps_max: 8,
                        intensity_percent: 75,
                        load_kg: 0,
                        rest_sec: 180,
                        tempo: null,
                        methodology: 'Force',
                        muscle_target: 'Pectoraux',
                        notes: 'Composé principal'
                    }
                ]
            },
            cool_down: {
                duration_min: 10,
                exercises: [
                    {
                        name: 'Static stretching',
                        duration_or_reps: '10 min',
                        notes: 'Étirements complets'
                    }
                ]
            },
            coaching_notes: [
                'Session démo - configurez votre clé API Claude',
                'Respecter les tempos et repos'
            ],
            estimated_calories: 400
        };
    }
};

// Export global
window.SessionGeneratorSpecialized = SessionGeneratorSpecialized;
