/**
 * ==================================================================
 * MATRICE SPORTS ET OBJECTIFS
 * Configuration complete des sports et qualites physiques associees
 * ==================================================================
 */

const SportsMatrix = {
    // Configuration des sports avec leurs objectifs et qualites physiques
    sports: {
        crossfit: {
            name: 'CrossFit',
            icon: '🏋️‍♂️',
            description: 'Fitness fonctionnel haute intensite',
            objectives: ['force', 'explosivite', 'endurance', 'puissance', 'mobilite'],
            muscleGroups: ['full-body', 'core', 'epaules', 'jambes', 'dos'],
            mainQualities: [
                'Force maximale',
                'Puissance',
                'Endurance musculaire',
                'Capacite aerobie'
            ]
        },
        hyrox: {
            name: 'Hyrox',
            icon: '🏃‍♂️',
            description: 'Course et exercices fonctionnels',
            objectives: ['endurance', 'force-endurance', 'capacite-aerobie', 'vo2max'],
            muscleGroups: ['jambes', 'core', 'epaules', 'bras'],
            mainQualities: ['Endurance cardiorespiratoire', 'Force-endurance', 'Resistance mentale']
        },
        triathlon: {
            name: 'Triathlon',
            icon: '🏊‍♂️',
            description: 'Natation, cyclisme, course a pied',
            objectives: ['endurance', 'vo2max', 'economie-gestuelle', 'capacite-aerobie'],
            muscleGroups: ['jambes', 'epaules', 'dos', 'core'],
            mainQualities: [
                'Endurance aerobie',
                'VO2max',
                'Seuil lactique',
                'Economie de mouvement'
            ]
        },
        trail: {
            name: 'Trail',
            icon: '⛰️',
            description: 'Course en montagne',
            objectives: ['endurance', 'vma', 'force-specifique', 'resistance'],
            muscleGroups: ['jambes', 'quadriceps', 'mollets', 'core'],
            mainQualities: ['Endurance', 'VMA', 'Force specifique montee', 'Resistance descente']
        },
        ultratrail: {
            name: 'Ultra-Trail',
            icon: '🗻',
            description: 'Course longue distance montagne',
            objectives: ['endurance-longue', 'resistance', 'economie-energetique', 'mental'],
            muscleGroups: ['jambes', 'core', 'dos'],
            mainQualities: [
                'Endurance extreme',
                'Gestion energetique',
                'Resistance mentale',
                'Force-endurance'
            ]
        },
        musculation: {
            name: 'Musculation',
            icon: '💪',
            description: 'Developpement musculaire et force',
            objectives: ['force', 'hypertrophie', 'puissance', 'esthetique'],
            muscleGroups: ['pectoraux', 'dos', 'jambes', 'epaules', 'bras', 'core'],
            mainQualities: ['Force maximale', 'Hypertrophie', 'Puissance', 'Definition musculaire']
        },
        cyclisme: {
            name: 'Cyclisme',
            icon: '🚴',
            description: 'Velo route ou VTT',
            objectives: ['endurance', 'puissance-watts', 'vo2max', 'seuil-ftp'],
            muscleGroups: ['jambes', 'quadriceps', 'ischio', 'mollets', 'core'],
            mainQualities: ['Puissance (FTP)', 'VO2max', 'Endurance', 'Force specifique']
        },
        tennis: {
            name: 'Tennis / Raquettes',
            icon: '🎾',
            description: 'Sports de raquette',
            objectives: ['explosivite', 'vivacite', 'endurance-intervalles', 'puissance'],
            muscleGroups: ['jambes', 'core', 'epaules', 'bras', 'dos'],
            mainQualities: ['Explosivite', 'Vivacite', 'Puissance', 'Endurance par intervalles']
        },
        natation: {
            name: 'Natation',
            icon: '🏊',
            description: 'Nage en bassin ou eau libre',
            objectives: ['endurance', 'technique', 'puissance-traction', 'vo2max'],
            muscleGroups: ['dos', 'epaules', 'bras', 'core', 'jambes'],
            mainQualities: ['Endurance aerobie', 'Puissance de traction', 'Technique', 'Souplesse']
        },
        football: {
            name: 'Football',
            icon: '⚽',
            description: 'Football / Soccer',
            objectives: ['explosivite', 'vivacite', 'endurance-intervalles', 'force-reactive'],
            muscleGroups: ['jambes', 'ischio', 'core', 'adducteurs'],
            mainQualities: ['Explosivite', 'Vivacite', 'Endurance intervalles', 'Force reactive']
        },
        rugby: {
            name: 'Rugby',
            icon: '🏉',
            description: 'Rugby',
            objectives: ['force', 'puissance', 'explosivite', 'endurance-puissance'],
            muscleGroups: ['full-body', 'jambes', 'dos', 'epaules', 'core'],
            mainQualities: ['Force maximale', 'Puissance', 'Explosivite', 'Contacts physiques']
        },
        basketball: {
            name: 'Basketball',
            icon: '🏀',
            description: 'Basketball',
            objectives: ['explosivite', 'detente', 'vivacite', 'endurance-intervalles'],
            muscleGroups: ['jambes', 'mollets', 'core', 'epaules'],
            mainQualities: ['Detente verticale', 'Explosivite', 'Vivacite', 'Endurance par sprints']
        },
        handball: {
            name: 'Handball',
            icon: '🤾',
            description: 'Handball',
            objectives: ['explosivite', 'puissance-lancer', 'vivacite', 'endurance-intervalles'],
            muscleGroups: ['epaules', 'bras', 'core', 'jambes'],
            mainQualities: ['Puissance de lancer', 'Explosivite', 'Vivacite', 'Endurance']
        },
        volleyball: {
            name: 'Volleyball',
            icon: '🏐',
            description: 'Volleyball',
            objectives: ['detente', 'explosivite', 'puissance-frappe', 'vivacite'],
            muscleGroups: ['jambes', 'mollets', 'epaules', 'core'],
            mainQualities: ['Detente verticale', 'Explosivite', 'Puissance de frappe', 'Agilite']
        },
        boxe: {
            name: 'Boxe / Sports de combat',
            icon: '🥊',
            description: 'Boxe et arts martiaux',
            objectives: ['puissance-frappe', 'explosivite', 'endurance-anaerobie', 'vivacite'],
            muscleGroups: ['core', 'epaules', 'bras', 'jambes', 'dos'],
            mainQualities: ['Puissance de frappe', 'Explosivite', 'Endurance anaerobie', 'Vitesse']
        },
        autre: {
            name: 'Autre sport',
            icon: '🎯',
            description: 'Sport specifique',
            objectives: ['force', 'endurance', 'explosivite', 'puissance', 'vivacite'],
            muscleGroups: ['full-body', 'jambes', 'core', 'dos', 'epaules'],
            mainQualities: ['A definir selon le sport']
        }
    },

    // Definitions detaillees des objectifs/qualites physiques
    objectives: {
        // Force et puissance
        force: {
            name: 'Force Maximale',
            category: 'force-puissance',
            description: 'Capacite a produire une force maximale',
            methods: ['force-max', 'force-vitesse', 'concentrique-lourd']
        },
        puissance: {
            name: 'Puissance',
            category: 'force-puissance',
            description: 'Force x Vitesse',
            methods: ['puissance-max', 'pliometrie', 'complexe-contraste']
        },
        explosivite: {
            name: 'Explosivite',
            category: 'force-puissance',
            description: 'Acceleration maximale',
            methods: ['pliometrie', 'balistique', 'sprints']
        },
        hypertrophie: {
            name: 'Hypertrophie',
            category: 'force-puissance',
            description: 'Developpement masse musculaire',
            methods: ['hypertrophie-myo', 'hypertrophie-sarco', 'volume-total']
        },

        // Endurance
        endurance: {
            name: 'Endurance',
            category: 'endurance',
            description: 'Capacite a maintenir un effort prolonge',
            methods: ['endurance-force', 'circuits-metaboliques', 'cardio-long']
        },
        vo2max: {
            name: 'VO2max',
            category: 'endurance',
            description: 'Consommation maximale oxygene',
            methods: ['intervalles-vo2max', 'fractionnne-court', 'hill-repeats']
        },
        vma: {
            name: 'VMA',
            category: 'endurance',
            description: 'Vitesse Maximale Aerobie',
            methods: ['intervalles-vma', '30-30', 'fractionnne']
        },
        'capacite-aerobie': {
            name: 'Capacite Aerobie',
            category: 'endurance',
            description: 'Volume aerobique total',
            methods: ['endurance-fondamentale', 'tempo-run', 'sweet-spot']
        },
        'seuil-ftp': {
            name: 'Seuil (FTP)',
            category: 'endurance',
            description: 'Seuil lactique / FTP velo',
            methods: ['tempo', 'sweet-spot', 'seuil-lactique']
        },
        'endurance-longue': {
            name: 'Endurance Longue Duree',
            category: 'endurance',
            description: 'Efforts tres longs (>2h)',
            methods: ['volume-long', 'endurance-fondamentale', 'gestion-allure']
        },

        // Vitesse et vivacite
        vivacite: {
            name: 'Vivacite / Agilite',
            category: 'vitesse',
            description: 'Changements de direction rapides',
            methods: ['agilite', 'coordination', 'reactivity-drills']
        },
        detente: {
            name: 'Detente Verticale',
            category: 'vitesse',
            description: 'Saut vertical',
            methods: ['pliometrie-verticale', 'depth-jumps', 'squat-jumps']
        },

        // Specifique
        'force-reactive': {
            name: 'Force Reactive',
            category: 'force-puissance',
            description: 'Cycle etirement-raccourcissement',
            methods: ['pliometrie-reactive', 'drop-jumps', 'bounds']
        },
        'force-endurance': {
            name: 'Force-Endurance',
            category: 'endurance',
            description: 'Force maintenue sur duree',
            methods: ['circuits-force', 'tempo-training', 'emom']
        },
        'puissance-watts': {
            name: 'Puissance (Watts)',
            category: 'force-puissance',
            description: 'Puissance mecanique velo',
            methods: ['sprints-velo', 'over-unders', 'vo2max-intervals']
        },
        resistance: {
            name: 'Resistance Musculaire',
            category: 'endurance',
            description: 'Resistance a la fatigue',
            methods: ['circuits-endurance', 'emom', 'amrap']
        },
        mobilite: {
            name: 'Mobilite',
            category: 'qualite-mouvement',
            description: 'Amplitude articulaire',
            methods: ['stretching-actif', 'yoga-athletique', 'mobilite-specifique']
        },
        mental: {
            name: 'Resistance Mentale',
            category: 'mental',
            description: 'Capacite mentale effort',
            methods: ['efforts-longs', 'tempo-difficile', 'simulation-competition']
        }
    },

    /**
     * Obtenir les objectifs pour un sport specifique
     * @param sportId
     */
    getObjectivesForSport(sportId) {
        const sport = this.sports[sportId];
        if (!sport) {
            return [];
        }

        return sport.objectives
            .map(objId => ({
                id: objId,
                ...this.objectives[objId]
            }))
            .filter(obj => obj.name); // Filtrer les undefined
    },

    /**
     * Obtenir les groupes musculaires prioritaires pour un sport
     * @param sportId
     */
    getMuscleGroupsForSport(sportId) {
        const sport = this.sports[sportId];
        return sport ? sport.muscleGroups : [];
    },

    /**
     * Obtenir la liste des sports pour affichage
     */
    getSportsList() {
        return Object.keys(this.sports).map(id => ({
            id,
            ...this.sports[id]
        }));
    }
};

// Export global
window.SportsMatrix = SportsMatrix;
