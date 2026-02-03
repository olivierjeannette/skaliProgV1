/**
 * PERFORMANCE NORMALIZER
 * Système de normalisation des performances pour égalité homme/femme
 * Basé sur les MEILLEURES PERFORMANCES RÉELLES des adhérents (système relatif)
 */

const PerformanceNormalizer = {
    // Cache des meilleures performances par exercice et genre
    bestPerformances: {
        male: {},
        female: {}
    },

    // Flag pour savoir si les références ont été chargées
    referencesLoaded: false,
    /**
     * Coefficients Wilks pour la force (Powerlifting)
     * Source: https://en.wikipedia.org/wiki/Wilks_Coefficient
     */
    WILKS_COEFFICIENTS: {
        male: {
            a: -216.0475144,
            b: 16.2606339,
            c: -0.002388645,
            d: -0.00113732,
            e: 7.01863e-6,
            f: -1.291e-8
        },
        female: {
            a: 594.31747775582,
            b: -27.23842536447,
            c: 0.82112226871,
            d: -0.00930733913,
            e: 0.00004731582,
            f: -0.00000009054
        }
    },

    /**
     * Calculer le coefficient Wilks
     * @param {number} bodyWeight - Poids de corps en kg
     * @param {string} gender - 'male' ou 'female'
     * @returns {number} - Coefficient Wilks
     */
    calculateWilksCoefficient(bodyWeight, gender) {
        const coef = this.WILKS_COEFFICIENTS[gender] || this.WILKS_COEFFICIENTS.male;
        const bw = bodyWeight;

        const denominator =
            coef.a +
            coef.b * bw +
            coef.c * Math.pow(bw, 2) +
            coef.d * Math.pow(bw, 3) +
            coef.e * Math.pow(bw, 4) +
            coef.f * Math.pow(bw, 5);

        return 500 / denominator;
    },

    /**
     * Normaliser une performance de force (kg soulevés)
     * @param {number} weight - Poids soulevé en kg
     * @param {number} bodyWeight - Poids de corps en kg
     * @param {string} gender - 'male' ou 'female'
     * @param {number} height - Taille en cm (optionnel)
     * @returns {number} - Score normalisé (0-100)
     */
    normalizeStrength(weight, bodyWeight, gender, height = null) {
        if (!weight || !bodyWeight) {
            return 0;
        }

        // Coefficient Wilks
        const wilksCoef = this.calculateWilksCoefficient(bodyWeight, gender);
        const wilksScore = weight * wilksCoef;

        // Normaliser sur échelle 0-100
        // Standards ajustés pour CrossFit/athlètes de force
        // Elite crossfit: ~400-450 Wilks, Champion monde: ~600 Wilks
        // On cible les standards CrossFit elite pour avoir 100
        const maxWilks = gender === 'female' ? 400 : 450; // Plus réaliste pour athlètes crossfit
        let normalized = (wilksScore / maxWilks) * 100;

        // Ajustement taille (optionnel): plus la personne est grande, plus c'est difficile
        if (height) {
            const heightFactor = 1 + ((height - 170) / 100) * 0.1; // ±10% pour ±30cm
            normalized = normalized / heightFactor;
        }

        return Math.min(100, Math.max(0, normalized));
    },

    /**
     * Normaliser une performance de cardio (temps en secondes)
     * @param {number} timeSeconds - Temps en secondes
     * @param {string} exerciseType - Type d'exercice (ex: '600m Run')
     * @param {number} bodyWeight - Poids de corps en kg
     * @param {string} gender - 'male' ou 'female'
     * @returns {number} - Score normalisé (0-100)
     */
    normalizeCardio(timeSeconds, exerciseType, bodyWeight, gender) {
        if (!timeSeconds || !bodyWeight) {
            return 0;
        }

        // Standards de référence (temps en secondes pour athlète moyen)
        const standards = this.getCardioStandards(exerciseType, gender);
        if (!standards) {
            return 50;
        } // Valeur par défaut si exercice inconnu

        const { elite, good, average } = standards;

        // Ajustement poids: plus lourd = plus difficile
        // Formule: temps_ajusté = temps_réel * (poids_référence / poids_réel)^0.33
        const referenceWeight = gender === 'female' ? 60 : 75;
        const weightFactor = Math.pow(referenceWeight / bodyWeight, 0.33);
        const adjustedTime = timeSeconds * weightFactor;

        // Calculer le score sur échelle 0-100
        let score;
        if (adjustedTime <= elite) {
            score = 100;
        } else if (adjustedTime <= good) {
            score = 80 + ((good - adjustedTime) / (good - elite)) * 20;
        } else if (adjustedTime <= average) {
            score = 50 + ((average - adjustedTime) / (average - good)) * 30;
        } else {
            score = Math.max(0, 50 - ((adjustedTime - average) / average) * 50);
        }

        return Math.min(100, Math.max(0, score));
    },

    /**
     * Standards cardio par exercice et genre
     * @param exerciseType
     * @param gender
     */
    getCardioStandards(exerciseType, gender) {
        const standards = {
            '600m Run': {
                male: { elite: 95, good: 125, average: 160 },
                female: { elite: 115, good: 145, average: 185 }
            },
            '800m Run': {
                male: { elite: 130, good: 170, average: 220 },
                female: { elite: 155, good: 200, average: 255 }
            },
            '1200m Run': {
                male: { elite: 225, good: 290, average: 360 },
                female: { elite: 270, good: 340, average: 420 }
            },
            '2000m Run': {
                male: { elite: 420, good: 540, average: 690 },
                female: { elite: 510, good: 650, average: 820 }
            },
            '5km Run': {
                male: { elite: 1050, good: 1350, average: 1680 },
                female: { elite: 1260, good: 1600, average: 2000 }
            },
            '1km Skierg': {
                male: { elite: 180, good: 235, average: 295 },
                female: { elite: 220, good: 280, average: 350 }
            },
            '1km Rameur': {
                male: { elite: 180, good: 225, average: 280 },
                female: { elite: 215, good: 270, average: 335 }
            },
            '2km Bikerg': {
                male: { elite: 270, good: 340, average: 420 },
                female: { elite: 325, good: 410, average: 510 }
            }
        };

        const key = Object.keys(standards).find(k => exerciseType.includes(k.split(' ')[0]));
        return key ? standards[key][gender] : null;
    },

    /**
     * Normaliser des répétitions (pullups, dips, etc.)
     * @param {number} reps - Nombre de répétitions
     * @param {string} exerciseType - Type d'exercice
     * @param {number} bodyWeight - Poids de corps en kg
     * @param {string} gender - 'male' ou 'female'
     * @returns {number} - Score normalisé (0-100)
     */
    normalizeReps(reps, exerciseType, bodyWeight, gender) {
        if (!reps) {
            return 0;
        }

        // Standards par exercice (ajustés pour CrossFit)
        const standards = {
            pullups: {
                male: { elite: 30, good: 20, average: 10 },
                female: { elite: 20, good: 12, average: 5 }
            },
            toes: {
                male: { elite: 30, good: 20, average: 10 },
                female: { elite: 20, good: 12, average: 5 }
            },
            dips: {
                male: { elite: 40, good: 25, average: 12 },
                female: { elite: 25, good: 15, average: 7 }
            },
            pushups: {
                male: { elite: 70, good: 50, average: 30 },
                female: { elite: 50, good: 35, average: 20 }
            },
            burpees: {
                male: { elite: 50, good: 40, average: 25 }, // en 2 min
                female: { elite: 40, good: 30, average: 20 }
            },
            handstand: {
                male: { elite: 120, good: 60, average: 30 }, // secondes
                female: { elite: 90, good: 45, average: 20 }
            }
        };

        // Trouver le standard correspondant
        const key = Object.keys(standards).find(k =>
            exerciseType.toLowerCase().includes(k.toLowerCase())
        );

        if (!key) {
            return 50;
        }

        const std = standards[key][gender];

        // Calculer le score
        let score;
        if (reps >= std.elite) {
            score = 100;
        } else if (reps >= std.good) {
            score = 80 + ((reps - std.good) / (std.elite - std.good)) * 20;
        } else if (reps >= std.average) {
            score = 50 + ((reps - std.average) / (std.good - std.average)) * 30;
        } else {
            score = Math.max(0, (reps / std.average) * 50);
        }

        return Math.min(100, Math.max(0, score));
    },

    /**
     * Normaliser une performance complète (fonction principale)
     * @param {object} performance - Objet performance
     * @param {object} member - Objet membre
     * @returns {number} - Score normalisé (0-100)
     */
    normalizePerformance(performance, member) {
        if (!performance || !member) {
            return 0;
        }

        const { exercise_type, value, unit } = performance;
        const { weight, height, gender } = member;

        // Déterminer le sexe (fallback: male)
        const memberGender = (gender || 'male').toLowerCase();

        // Router vers la bonne fonction de normalisation
        if (unit === 'kg') {
            // Force
            return this.normalizeStrength(value, weight, memberGender, height);
        } else if (unit === 'sec') {
            // Cardio
            return this.normalizeCardio(value, exercise_type, weight, memberGender);
        } else if (unit === 'reps') {
            // Répétitions
            return this.normalizeReps(value, exercise_type, weight, memberGender);
        } else if (unit === 'W') {
            // Watts (puissance)
            // Normaliser par rapport au poids: W/kg
            const wattsPerKg = value / weight;
            const elite = memberGender === 'female' ? 8 : 10; // W/kg élite
            return Math.min(100, (wattsPerKg / elite) * 100);
        } else if (unit === 'cm') {
            // Saut vertical
            // Ajusté par la taille
            const relativeJump = (value / height) * 100;
            const elite = 40; // 40% de sa taille
            return Math.min(100, (relativeJump / elite) * 100);
        }

        return 50; // Valeur par défaut
    },

    /**
     * Calculer le niveau Pokemon basé sur les scores normalisés
     * @param {Array} normalizedScores - Tableau de scores normalisés
     * @returns {number} - Niveau Pokemon (1-100)
     */
    calculatePokemonLevel(normalizedScores) {
        if (!normalizedScores || normalizedScores.length === 0) {
            return 1;
        }

        // Moyenne des scores normalisés (0-100)
        const avgScore = normalizedScores.reduce((sum, s) => sum + s, 0) / normalizedScores.length;

        // Bonus pour le nombre de performances (diversité)
        // Plus de performances = meilleur athlète complet
        const diversityBonus = Math.min(25, normalizedScores.length * 2.5);

        // Calcul du niveau avec pondération améliorée
        // 85% basé sur la performance moyenne (au lieu de 70%)
        const baseLevel = avgScore * 0.85;
        const level = baseLevel + diversityBonus;

        // Bonus élite: si moyenne > 80, boost supplémentaire
        let finalLevel = level;
        if (avgScore >= 80) {
            finalLevel += (avgScore - 80) * 0.5; // Bonus pour les athlètes élites
        }

        return Math.round(Math.min(100, Math.max(1, finalLevel)));
    },

    /**
     * NOUVEAU: Charger les meilleures performances de tous les adhérents
     * Pour créer un système de référence relatif
     */
    async loadBestPerformances() {
        try {
            // Vérifier si on a un cache valide (moins de 5 minutes)
            const cached = localStorage.getItem('pokemonReferences');
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                const age = Date.now() - timestamp;
                if (age < 5 * 60 * 1000) {
                    // 5 minutes
                    console.log('⚡ Utilisation du cache (', Math.round(age / 1000), 's)');
                    this.bestPerformances = data;
                    this.referencesLoaded = true;
                    return;
                }
            }

            console.log('📊 Chargement des meilleures performances...');

            // OPTIMISATION: Récupérer tout en parallèle
            const [members, allPerfs] = await Promise.all([
                SupabaseManager.getMembers(),
                SupabaseManager.getPerformances()
            ]);

            // Créer un map des membres par ID pour lookup rapide
            const memberMap = new Map(members.map(m => [m.id, m]));

            // Enrichir les performances avec les données du membre
            const allPerformances = allPerfs.map(p => {
                const member = memberMap.get(p.member_id);
                return {
                    ...p,
                    memberGender: member?.gender || 'male',
                    memberWeight: member?.weight,
                    memberHeight: member?.height
                };
            });

            // Grouper par exercice et genre, garder la meilleure perf
            this.bestPerformances = { male: {}, female: {} };

            allPerformances.forEach(perf => {
                const gender = perf.memberGender === 'female' ? 'female' : 'male';
                const exerciseKey = `${perf.exercise_type}_${perf.unit}`;

                if (!this.bestPerformances[gender][exerciseKey]) {
                    this.bestPerformances[gender][exerciseKey] = perf;
                } else {
                    const current = this.bestPerformances[gender][exerciseKey];

                    // Pour le temps (sec), le plus petit est le meilleur
                    if (perf.unit === 'sec') {
                        if (perf.value < current.value) {
                            this.bestPerformances[gender][exerciseKey] = perf;
                        }
                    } else {
                        // Pour kg et reps, le plus grand est le meilleur
                        if (perf.value > current.value) {
                            this.bestPerformances[gender][exerciseKey] = perf;
                        }
                    }
                }
            });

            this.referencesLoaded = true;

            // Mettre en cache dans localStorage pour ne pas recharger à chaque fois
            try {
                localStorage.setItem(
                    'pokemonReferences',
                    JSON.stringify({
                        data: this.bestPerformances,
                        timestamp: Date.now()
                    })
                );
            } catch (e) {
                console.warn('Cache localStorage impossible:', e);
            }

            console.log('✅ Références chargées et mises en cache');
        } catch (error) {
            console.error('❌ Erreur chargement références:', error);
            this.referencesLoaded = false;
        }
    },

    /**
     * NOUVEAU: Normaliser une performance par rapport aux meilleures performances réelles
     * @param performance
     * @param member
     */
    normalizePerformanceRelative(performance, member) {
        if (!performance || !member) {
            return 0;
        }

        const { exercise_type, value, unit } = performance;
        const gender = (member.gender || 'male').toLowerCase() === 'female' ? 'female' : 'male';
        const exerciseKey = `${exercise_type}_${unit}`;

        // Vérifier si on a une référence pour cet exercice et ce genre
        const bestPerf = this.bestPerformances[gender]?.[exerciseKey];

        if (!bestPerf) {
            console.warn(`⚠️ Pas de référence pour ${exerciseKey} (${gender})`);
            return 50; // Score neutre si pas de référence
        }

        let score = 0;

        if (unit === 'sec') {
            // Pour le temps: score = (meilleur_temps / ton_temps) * 100
            // Si tu fais mieux que la référence, tu peux dépasser 100
            score = (bestPerf.value / value) * 100;
        } else {
            // Pour kg et reps: score = (ta_valeur / meilleure_valeur) * 100
            score = (value / bestPerf.value) * 100;
        }

        // Permettre de dépasser 100 si on bat le record (jusqu'à 120 max)
        return Math.min(120, Math.max(0, score));
    }
};

// Exposer globalement
window.PerformanceNormalizer = PerformanceNormalizer;
