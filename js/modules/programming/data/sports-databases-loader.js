/**
 * SPORTS DATABASES LOADER
 * Système centralisé de chargement et gestion des bases de données sportives
 *
 * Architecture:
 * - Chaque sport a sa propre base de données détaillée
 * - Ce loader les charge et les rend accessibles globalement
 * - Intégration avec real-session-generator.js
 */

const SportsDatabasesLoader = {
    databases: {},
    loadedSports: [],

    /**
     * Configuration des sports disponibles
     */
    availableSports: {
        trail: {
            name: 'Trail Running',
            file: 'trail-running-database.js',
            globalVar: 'TrailRunningDatabase',
            loaded: false
        },
        hyrox: {
            name: 'HYROX',
            file: 'hyrox-database.js',
            globalVar: 'HyroxDatabase',
            loaded: false
        },
        crossfit: {
            name: 'CrossFit',
            file: 'crossfit-database.js',
            globalVar: 'CrossFitDatabase',
            loaded: false
        },
        build: {
            name: 'Musculation/Bodybuilding',
            file: 'bodybuilding-database.js',
            globalVar: 'BodybuildingDatabase',
            loaded: false
        },
        running: {
            name: 'Running Route',
            file: 'running-database.js',
            globalVar: 'RunningDatabase',
            loaded: false
        }
    },

    /**
     * Initialisation : charge toutes les bases
     */
    async init() {
        console.log('🗄️ Chargement des bases de données sportives...');

        const basePath = 'js/modules/programming/data/';
        const loadPromises = [];

        for (const [sportId, config] of Object.entries(this.availableSports)) {
            // Vérifier si déjà chargé globalement
            if (window[config.globalVar]) {
                console.log(`✓ ${config.name} déjà chargé`);
                this.databases[sportId] = window[config.globalVar];
                this.loadedSports.push(sportId);
                config.loaded = true;
                continue;
            }

            // Charger le script
            const promise = this.loadScript(basePath + config.file, config.globalVar)
                .then(() => {
                    this.databases[sportId] = window[config.globalVar];
                    this.loadedSports.push(sportId);
                    config.loaded = true;
                    console.log(`✅ ${config.name} chargé`);
                })
                .catch(error => {
                    console.warn(`⚠️ Impossible de charger ${config.name}:`, error);
                });

            loadPromises.push(promise);
        }

        await Promise.all(loadPromises);

        console.log(`✅ ${this.loadedSports.length} bases sportives chargées`);
        return this.databases;
    },

    /**
     * Chargement dynamique d'un script
     * @param src
     * @param globalVarName
     */
    loadScript(src, globalVarName) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                if (window[globalVarName]) {
                    resolve(window[globalVarName]);
                } else {
                    reject(
                        new Error(`Variable globale ${globalVarName} non trouvée après chargement`)
                    );
                }
            };
            script.onerror = () => reject(new Error(`Erreur chargement ${src}`));
            document.head.appendChild(script);
        });
    },

    /**
     * Récupérer une base de données sportive
     * @param sportId
     */
    getDatabase(sportId) {
        if (!this.databases[sportId]) {
            console.warn(`⚠️ Base de données pour "${sportId}" non chargée`);
            return null;
        }
        return this.databases[sportId];
    },

    /**
     * Récupérer une séance spécifique
     * @param sportId
     * @param sessionType
     * @param phase
     * @param level
     */
    getSession(sportId, sessionType, phase, level) {
        const db = this.getDatabase(sportId);
        if (!db) {
            return null;
        }

        const sessionData = db.sessionTypes?.[sessionType];
        if (!sessionData) {
            console.warn(`Type de séance "${sessionType}" introuvable pour ${sportId}`);
            return null;
        }

        // Navigation dans la structure
        const phaseData = sessionData[phase]; // ppg, ppo, pps
        if (!phaseData) {
            return null;
        }

        const levelData = phaseData[level]; // beginner, intermediate, advanced, elite
        if (!levelData) {
            // Fallback vers "all_levels" si existe
            return phaseData.all_levels || null;
        }

        return levelData;
    },

    /**
     * Lister tous les types de séances pour un sport
     * @param sportId
     */
    getSessionTypes(sportId) {
        const db = this.getDatabase(sportId);
        if (!db || !db.sessionTypes) {
            return [];
        }

        return Object.keys(db.sessionTypes).map(key => ({
            id: key,
            name: db.sessionTypes[key].name,
            category: db.sessionTypes[key].category
        }));
    },

    /**
     * Récupérer les zones d'intensité d'un sport
     * @param sportId
     */
    getZones(sportId) {
        const db = this.getDatabase(sportId);
        return db?.zones || null;
    },

    /**
     * Récupérer les méthodologies d'un sport
     * @param sportId
     */
    getMethodologies(sportId) {
        const db = this.getDatabase(sportId);
        return db?.methodologies || null;
    },

    /**
     * Récupérer les exercices de renforcement
     * @param sportId
     * @param category
     */
    getStrengthExercises(sportId, category = null) {
        const db = this.getDatabase(sportId);
        if (!db?.strength_exercises) {
            return [];
        }

        if (category) {
            return db.strength_exercises[category] || [];
        }

        return db.strength_exercises;
    },

    /**
     * Récupérer les plans type par objectif
     * @param sportId
     */
    getRacePlans(sportId) {
        const db = this.getDatabase(sportId);
        return db?.race_plans || null;
    },

    /**
     * Générer une séance complète depuis la base
     * @param params
     */
    async generateSessionFromDatabase(params) {
        const {
            sport,
            sessionType,
            phase = 'ppg',
            level = 'intermediate',
            duration = 60,
            rpe_target = '7/10'
        } = params;

        // Récupérer les données de la séance
        const sessionData = this.getSession(sport, sessionType, phase, level);
        if (!sessionData) {
            console.warn('Séance introuvable, utilisation fallback');
            return this.generateFallbackSession(params);
        }

        // Sélectionner une séance aléatoire parmi les sessions disponibles
        const sessions = sessionData.sessions || [];
        if (sessions.length === 0) {
            return this.generateFallbackSession(params);
        }

        // Choisir une séance adaptée à la durée demandée
        let selectedSession =
            sessions.find(s => Math.abs(s.duration - duration) <= 15) || sessions[0];

        // Enrichir avec les métadonnées
        const enrichedSession = {
            title: selectedSession.name,
            sport: sport,
            session_type: sessionType,
            phase: phase,
            level: level,
            duration_minutes: selectedSession.duration || duration,
            rpe_target: sessionData.rpe || rpe_target,
            structure: selectedSession.structure,
            notes: selectedSession.notes || sessionData.description
        };

        return enrichedSession;
    },

    /**
     * Session fallback si base non disponible
     * @param params
     */
    generateFallbackSession(params) {
        return {
            title: `Séance ${params.sport}`,
            duration_minutes: params.duration,
            rpe_target: params.rpe_target,
            warmup: {
                duration_minutes: 10,
                exercises: [{ name: 'Échauffement général', duration: '10min' }]
            },
            main_work: {
                duration_minutes: params.duration - 15,
                exercises: [{ name: 'Travail principal', duration: `${params.duration - 15}min` }]
            },
            cooldown: {
                duration_minutes: 5,
                exercises: [{ name: 'Retour au calme', duration: '5min' }]
            }
        };
    },

    /**
     * Stats des bases chargées
     */
    getStats() {
        const stats = {
            total_sports: Object.keys(this.availableSports).length,
            loaded_sports: this.loadedSports.length,
            databases: {}
        };

        for (const sportId of this.loadedSports) {
            const db = this.databases[sportId];
            stats.databases[sportId] = {
                name: db.name,
                session_types: Object.keys(db.sessionTypes || {}).length,
                zones: Object.keys(db.zones || {}).length,
                has_methodologies: !!db.methodologies,
                has_strength: !!db.strength_exercises,
                has_plans: !!db.race_plans
            };
        }

        return stats;
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SportsDatabasesLoader;
} else {
    window.SportsDatabasesLoader = SportsDatabasesLoader;
}
