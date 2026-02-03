/**
 * ===================================================================
 * PERFORMANCE STATS V2 - Système de calcul avec 4 catégories
 * ===================================================================
 *
 * Calcule les stats des cartes Pokémon basées sur :
 * - CARDIO : Endurance cardiovasculaire (courses, vélo, natation)
 * - FORCE : Force pure (squats, deadlifts, bench press lourds)
 * - GYM : Musculation et volume (tous exercices muscu)
 * - PUISSANCE : Explosivité (mouvements olympiques, sprints)
 *
 * Chaque stat est calculée en % par rapport au meilleur de la salle
 * Séparé hommes/femmes pour plus d'équité
 * Niveau global = moyenne des 4 stats
 */

const PerformanceStatsV2 = {
    /**
     * Mapper les exercices vers les 4 catégories
     */
    exerciseMapping: {
        // CARDIO : Endurance cardiovasculaire (courses, rameur, skierg temps, bikerg, burpees)
        cardio: [
            'run',
            '600m',
            '800m',
            '1200m',
            '2000m',
            '1km skierg',
            'skierg',
            'rameur',
            '1km rameur',
            'row',
            '2km bikerg',
            'bikerg',
            'burpees'
        ],

        // FORCE (Musculation) : 1RM exercices de force
        force: [
            'bench press',
            '1rm bench',
            'deadlift',
            '1rm deadlift',
            'squat',
            'front squat',
            'back squat',
            '1rm squat',
            'strict press',
            '1rm strict press',
            'snatch',
            '1rm snatch',
            'clean & jerk',
            'clean and jerk',
            '1rm clean'
        ],

        // GYM : Exercices au poids du corps / max reps
        gym: [
            'pullups',
            'pull ups',
            'max pullups',
            'toes to bar',
            'max toes',
            'dips',
            'max dips',
            'pushups',
            'push ups',
            'max pushups',
            'handstand',
            'handstand hold'
        ],

        // PUISSANCE : Watts et sauts
        puissance: [
            'pic watts',
            'watts',
            'assault bike',
            'skierg (pic',
            'jump',
            'broad jump',
            'box jump',
            'cm'
        ]
    },

    /**
     * Calculer les stats pour UN adhérent
     * @param {Object} member - Adhérent
     * @param {Array} memberPerformances - Performances de cet adhérent
     * @param {Array} allPerformances - Toutes les performances (pour trouver les meilleurs)
     * @param {Array} allMembers - Tous les adhérents (pour filtrer par genre)
     * @returns {Object} { cardio: 0-100, force: 0-100, gym: 0-100, puissance: 0-100, niveau: 1-100 }
     */
    calculateMemberStats(member, memberPerformances, allPerformances, allMembers) {
        // Obtenir le genre de l'adhérent
        const memberGender = this.getMemberGender(member);

        // Filtrer les adhérents du même genre
        const sameGenderMembers = allMembers.filter(m => this.getMemberGender(m) === memberGender);
        const sameGenderMemberIds = new Set(sameGenderMembers.map(m => m.id));

        // Filtrer les performances du même genre
        const sameGenderPerformances = allPerformances.filter(p =>
            sameGenderMemberIds.has(p.member_id)
        );

        // Calculer les meilleures performances PAR EXERCICE
        const globalBestByExercise =
            this.calculateBestPerformancesByExercise(sameGenderPerformances);
        const memberBestByExercise = this.calculateBestPerformancesByExercise(memberPerformances);

        // DEBUG CARDIO pour Olivier et Nicolas
        if (member.firstName === 'Olivier' || member.firstName === 'Nicolas') {
            console.log(`\n🔍 DEBUG CARDIO - ${member.firstName} ${member.lastName || ''}`);
            console.log(
                "Exercices cardio de l'adhérent:",
                Array.from(memberBestByExercise.entries()).filter(
                    ([ex, data]) => data.category === 'cardio'
                )
            );
            console.log(
                'Exercices cardio globaux:',
                Array.from(globalBestByExercise.entries()).filter(
                    ([ex, data]) => data.category === 'cardio'
                )
            );
        }

        // Calculer les % pour chaque catégorie en comparant exercice par exercice
        const stats = {
            cardio: this.calculateCategoryScore(
                memberBestByExercise,
                globalBestByExercise,
                'cardio'
            ),
            force: this.calculateCategoryScore(memberBestByExercise, globalBestByExercise, 'force'),
            gym: this.calculateCategoryScore(memberBestByExercise, globalBestByExercise, 'gym'),
            puissance: this.calculateCategoryScore(
                memberBestByExercise,
                globalBestByExercise,
                'puissance'
            )
        };

        // Calculer le niveau global (1-100) basé sur la moyenne des 4 stats
        const moyenne = (stats.cardio + stats.force + stats.gym + stats.puissance) / 4;
        stats.niveau = Math.round(Math.max(1, Math.min(100, moyenne)));

        if (member.firstName === 'Olivier' || member.firstName === 'Nicolas') {
            console.log(`📊 Stats finales ${member.firstName}:`, stats);
        }

        return stats;
    },

    /**
     * Obtenir le genre d'un adhérent
     */
    getMemberGender(member) {
        const gender = (member.gender || member.sexe || '').toLowerCase();

        if (
            gender.includes('f') ||
            gender.includes('femme') ||
            gender.includes('woman') ||
            gender.includes('female')
        ) {
            return 'female';
        }

        // Par défaut : male
        return 'male';
    },

    /**
     * Calculer les meilleures performances PAR EXERCICE SPÉCIFIQUE
     * @param {Array} performances - Liste des performances
     * @returns {Object} - Map des meilleurs par exercice
     */
    calculateBestPerformancesByExercise(performances) {
        const bestByExercise = new Map();

        performances.forEach(perf => {
            const exercise = (perf.exercise_type || '').toLowerCase().trim();
            const value = parseFloat(perf.value) || 0;

            if (value === 0 || !exercise) return;

            // Déterminer la catégorie
            let category = null;
            if (this.isExerciseInCategory(exercise, 'puissance')) category = 'puissance';
            else if (this.isExerciseInCategory(exercise, 'cardio')) category = 'cardio';
            else if (this.isExerciseInCategory(exercise, 'force')) category = 'force';
            else if (this.isExerciseInCategory(exercise, 'gym')) category = 'gym';

            if (!category) return;

            // Initialiser si nécessaire
            if (!bestByExercise.has(exercise)) {
                bestByExercise.set(exercise, {
                    category: category,
                    best: category === 'cardio' ? Infinity : 0,
                    count: 0
                });
            }

            const current = bestByExercise.get(exercise);

            // Mettre à jour le meilleur
            if (category === 'cardio') {
                // Cardio : plus petit = meilleur
                current.best = Math.min(current.best, value);
            } else {
                // Autres : plus grand = meilleur
                current.best = Math.max(current.best, value);
            }
            current.count++;
        });

        return bestByExercise;
    },

    /**
     * Calculer les meilleures performances par catégorie (groupées)
     * Compare exercice par exercice puis fait la moyenne par catégorie
     */
    calculateBestPerformancesByCategory(performances) {
        const bestByExercise = this.calculateBestPerformancesByExercise(performances);

        // Regrouper par catégorie
        const byCategory = {
            cardio: [],
            force: [],
            gym: [],
            puissance: []
        };

        bestByExercise.forEach((data, exercise) => {
            byCategory[data.category].push({ exercise, ...data });
        });

        return byCategory;
    },

    /**
     * Vérifier si un exercice appartient à une catégorie
     */
    isExerciseInCategory(exerciseName, category) {
        const keywords = this.exerciseMapping[category] || [];
        return keywords.some(keyword => exerciseName.includes(keyword));
    },

    /**
     * Calculer le score d'une catégorie en comparant EXERCICE PAR EXERCICE
     * @param {Map} memberExercises - Map(exercice => {best, count, category})
     * @param {Map} globalExercises - Map(exercice => {best, count, category})
     * @param {string} category - 'cardio', 'force', 'gym', ou 'puissance'
     * @returns {Number} - Score 0-100
     */
    calculateCategoryScore(memberExercises, globalExercises, category) {
        const memberInCategory = Array.from(memberExercises.entries()).filter(
            ([_, data]) => data.category === category
        );

        // Si l'adhérent n'a aucune perf dans cette catégorie
        if (memberInCategory.length === 0) {
            return 5; // Score minimal
        }

        let totalPercentage = 0;
        let validComparisons = 0;

        // Pour chaque exercice de l'adhérent dans cette catégorie
        memberInCategory.forEach(([exercise, memberData]) => {
            // Trouver le meilleur global pour CET exercice spécifique
            const globalData = globalExercises.get(exercise);

            if (!globalData) {
                // Si personne d'autre n'a fait cet exercice, donner 50%
                totalPercentage += 50;
                validComparisons++;
                return;
            }

            let percentage;
            if (category === 'cardio') {
                // Cardio : plus petit = meilleur
                // Ex: meilleur 1200m = 240s, moi = 300s → 240/300 = 80%
                percentage = (globalData.best / memberData.best) * 100;

                console.log(
                    `🔢 ${exercise}: ${globalData.best}s / ${memberData.best}s = ${percentage.toFixed(1)}%`
                );
            } else {
                // Autres : plus grand = meilleur
                // Ex: meilleur squat = 150kg, moi = 120kg → 120/150 = 80%
                percentage = (memberData.best / globalData.best) * 100;
            }

            // Limiter à 100% max par exercice
            totalPercentage += Math.min(100, percentage);
            validComparisons++;
        });

        if (validComparisons === 0) {
            return 5;
        }

        // Moyenne des pourcentages de tous les exercices de la catégorie
        const avgPercentage = totalPercentage / validComparisons;

        // Bonus pour la diversité (avoir fait plusieurs exercices différents)
        const diversityBonus = Math.min(5, validComparisons * 1); // +1% par exercice, max +5%

        // Score final
        const finalScore = avgPercentage + diversityBonus;

        console.log(
            `🎯 Score ${category}: moyenne ${avgPercentage.toFixed(1)}% + bonus ${diversityBonus}% = ${finalScore.toFixed(1)}% (arrondi: ${Math.round(Math.max(5, Math.min(100, finalScore)))})`
        );

        // Limiter entre 5 et 100
        return Math.round(Math.max(5, Math.min(100, finalScore)));
    },

    /**
     * Calculer toutes les stats pour tous les adhérents
     * @param {Array} members - Tous les adhérents
     * @param {Array} performances - Toutes les performances
     * @returns {Map} - Map(memberId => stats)
     */
    calculateAllMembersStats(members, performances) {
        const statsMap = new Map();

        members.forEach(member => {
            const memberPerfs = performances.filter(p => p.member_id === member.id);
            const stats = this.calculateMemberStats(member, memberPerfs, performances, members);
            statsMap.set(member.id, stats);
        });

        return statsMap;
    },

    /**
     * Obtenir le niveau basé sur les stats (compatible avec l'ancien système)
     */
    getLevelFromStats(stats) {
        return stats.niveau || 1;
    },

    /**
     * Obtenir les stats formatées pour la carte Pokémon
     * Convertit les 4 catégories en format compatible avec l'affichage
     */
    getFormattedStatsForCard(stats) {
        return {
            // Nouvelles stats (4 catégories)
            cardio: stats.cardio || 5,
            force: stats.force || 5,
            gym: stats.gym || 5,
            puissance: stats.puissance || 5,

            // Anciennes stats pour compatibilité (à supprimer plus tard)
            atk: stats.puissance || 5, // ATK = Puissance
            def: stats.gym || 5, // DEF = Gym
            spd: stats.cardio || 5 // SPD = Cardio
        };
    }
};

// Exposer globalement
window.PerformanceStatsV2 = PerformanceStatsV2;
