/**
 * NUTRITION CALCULATOR - Calculs nutritionnels précis
 * Utilise la formule Mifflin-St Jeor (la plus fiable scientifiquement)
 */

const NutritionCalculator = {
    /**
     * Calculer le métabolisme de base (BMR) - Formule Mifflin-St Jeor
     * Hommes: BMR = (10 × poids en kg) + (6,25 × taille en cm) - (5 × âge en années) + 5
     * Femmes: BMR = (10 × poids en kg) + (6,25 × taille en cm) - (5 × âge en années) - 161
     * @param weight
     * @param height
     * @param age
     * @param gender
     */
    calculateBMR(weight, height, age, gender) {
        if (!weight || !height || !age) {
            throw new Error('Données manquantes pour le calcul du BMR');
        }

        const baseBMR = (10 * weight) + (6.25 * height) - (5 * age);

        if (gender === 'male') {
            return Math.round(baseBMR + 5);
        } else if (gender === 'female') {
            return Math.round(baseBMR - 161);
        } else {
            // Valeur moyenne pour 'other'
            return Math.round(baseBMR - 78);
        }
    },

    /**
     * Calculer le TDEE (Total Daily Energy Expenditure)
     * Applique le niveau d'activité au BMR
     * @param bmr
     * @param activityLevel
     */
    calculateTDEE(bmr, activityLevel = 'moderate') {
        const activityMultipliers = {
            sedentary: 1.2,      // Peu ou pas d'exercice
            light: 1.375,        // Exercice léger 1-3 jours/semaine
            moderate: 1.55,      // Exercice modéré 3-5 jours/semaine
            active: 1.725,       // Exercice intense 6-7 jours/semaine
            very_active: 1.9     // Exercice très intense ou travail physique
        };

        return Math.round(bmr * (activityMultipliers[activityLevel] || 1.55));
    },

    /**
     * Calculer la dépense calorique d'une séance selon son type
     * @param sessionCategory
     * @param duration
     * @param weight
     */
    calculateSessionCalories(sessionCategory, duration = 60, weight = 70) {
        // Dépense calorique par heure selon le type de séance (basé sur MET - Metabolic Equivalent of Task)
        const caloriesBurnRate = {
            'strength': 6.0,        // Musculation intense
            'cardio': 10.0,         // Cardio intense (course, rameur, etc.)
            'hiit': 12.0,           // HIIT très intense
            'endurance': 8.0,       // Endurance longue distance
            'crossfit': 11.0,       // CrossFit/WOD
            'gymnastic': 5.0,       // Gymnastique/Skills
            'recovery': 3.0,        // Récupération active
            'mobility': 2.5,        // Mobilité/Yoga
            'team_sport': 8.0       // Sport d'équipe
        };

        const rate = caloriesBurnRate[sessionCategory] || 7.0;
        // Formule: (MET × poids en kg × durée en heures)
        return Math.round(rate * weight * (duration / 60));
    },

    /**
     * Calculer le TDEE amélioré avec prise en compte du planning d'entraînement
     * @param bmr
     * @param weeklyTraining
     * @param weight
     */
    calculateAdvancedTDEE(bmr, weeklyTraining = null, weight = 70) {
        // Si pas de planning fourni, utiliser la méthode classique
        if (!weeklyTraining || !weeklyTraining.sessions || weeklyTraining.sessions.length === 0) {
            return this.calculateTDEE(bmr, 'moderate');
        }

        // Calculer la dépense totale hebdomadaire des séances
        let weeklySessionCalories = 0;
        weeklyTraining.sessions.forEach(session => {
            const sessionCal = this.calculateSessionCalories(
                session.category,
                session.duration || 60,
                weight
            );
            weeklySessionCalories += sessionCal;
        });

        // Moyenne journalière de la dépense des séances
        const dailySessionCalories = Math.round(weeklySessionCalories / 7);

        // TDEE de base (activité légère hors séances = 1.3)
        const baseTDEE = Math.round(bmr * 1.3);

        // TDEE total = base + séances
        return baseTDEE + dailySessionCalories;
    },

    /**
     * Adapter les calories selon le jour d'entraînement (cyclage calorique)
     * @param baseCalories
     * @param isTrainingDay
     * @param sessionIntensity
     * @param weight
     */
    adjustCaloriesForTrainingDay(baseCalories, isTrainingDay, sessionIntensity = 'moderate', weight = 70) {
        if (!isTrainingDay) {
            // Jour de repos : -10% à -15%
            return Math.round(baseCalories * 0.88);
        }

        // Jour d'entraînement : ajustement selon intensité
        const intensityAdjustments = {
            'light': 50,           // Séance légère (mobilité, récup)
            'moderate': 150,       // Séance modérée (force, skills)
            'hard': 300,           // Séance intense (WOD, HIIT)
            'very_hard': 500       // Séance très intense (2 sessions, compétition)
        };

        const adjustment = intensityAdjustments[sessionIntensity] || 150;
        return Math.round(baseCalories + adjustment);
    },

    /**
     * Calculer les macros complètes pour un objectif
     * Nouvelle version avec prise en compte du planning d'entraînement
     * @param member
     * @param objective
     * @param activityLevel
     * @param weeklyTraining
     */
    calculateMacros(member, objective, activityLevel = 'active', weeklyTraining = null) {
        const age = this.calculateAge(member.birthdate);
        if (!age) {
            throw new Error('Date de naissance requise');
        }

        // 1. Calculer le BMR
        const bmr = this.calculateBMR(
            member.weight,
            member.height,
            age,
            member.gender
        );

        // 2. Calculer le TDEE (amélioration : prise en compte du planning)
        let tdee;
        let trainingInfo = null;

        if (weeklyTraining && weeklyTraining.sessions && weeklyTraining.sessions.length > 0) {
            tdee = this.calculateAdvancedTDEE(bmr, weeklyTraining, member.weight);

            // Calculer infos sur les séances
            const totalWeeklyBurn = weeklyTraining.sessions.reduce((sum, session) => {
                return sum + this.calculateSessionCalories(session.category, session.duration || 60, member.weight);
            }, 0);

            trainingInfo = {
                sessionsPerWeek: weeklyTraining.sessions.length,
                totalWeeklyBurn: totalWeeklyBurn,
                avgDailyBurn: Math.round(totalWeeklyBurn / 7),
                sessions: weeklyTraining.sessions.map(s => ({
                    category: s.category,
                    duration: s.duration || 60,
                    calories: this.calculateSessionCalories(s.category, s.duration || 60, member.weight)
                }))
            };
        } else {
            tdee = this.calculateTDEE(bmr, activityLevel);
        }

        // 3. Appliquer l'ajustement calorique selon l'objectif
        const objectiveConfig = NutritionPro.OBJECTIVES[objective];
        const targetCalories = Math.round(tdee + objectiveConfig.calorieDeficit);

        // 4. Calculer les protéines (priorité)
        const proteinG = Math.round(member.weight * objectiveConfig.proteinMultiplier);
        const proteinCal = proteinG * 4;

        // 5. Calculer les lipides
        const fatsCal = Math.round(targetCalories * objectiveConfig.fatsRatio);
        const fatsG = Math.round(fatsCal / 9);

        // 6. Le reste en glucides
        const carbsCal = targetCalories - proteinCal - fatsCal;
        const carbsG = Math.round(carbsCal / 4);

        return {
            bmr,
            tdee,
            targetCalories,
            macros: {
                protein: {
                    grams: proteinG,
                    calories: proteinCal,
                    percentage: Math.round((proteinCal / targetCalories) * 100)
                },
                carbs: {
                    grams: carbsG,
                    calories: carbsCal,
                    percentage: Math.round((carbsCal / targetCalories) * 100)
                },
                fats: {
                    grams: fatsG,
                    calories: fatsCal,
                    percentage: Math.round((fatsCal / targetCalories) * 100)
                }
            },
            training: trainingInfo, // Nouvelles infos sur l'entraînement
            details: {
                weight: member.weight,
                height: member.height,
                age,
                gender: member.gender,
                objective: objectiveConfig.name,
                activityLevel,
                trainingBased: weeklyTraining !== null
            }
        };
    },

    /**
     * Calculer l'âge
     * @param birthdate
     */
    calculateAge(birthdate) {
        if (!birthdate) {return null;}
        const today = new Date();
        const birth = new Date(birthdate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    },

    /**
     * Suggestions d'hydratation
     * @param weight
     * @param activityLevel
     */
    calculateHydration(weight, activityLevel = 'moderate') {
        const baseWater = weight * 0.033; // 33ml par kg de poids

        const activityMultipliers = {
            sedentary: 1.0,
            light: 1.1,
            moderate: 1.2,
            active: 1.4,
            very_active: 1.6
        };

        const totalLiters = baseWater * (activityMultipliers[activityLevel] || 1.2);
        return {
            liters: Math.round(totalLiters * 10) / 10,
            glasses: Math.round(totalLiters * 4) // 1 verre = 250ml
        };
    },

    /**
     * Répartition calorique suggérée par repas
     * @param totalCalories
     * @param mealsPerDay
     */
    distributeMeals(totalCalories, mealsPerDay = 4) {
        // Répartition typique: Petit-déj 25%, Déjeuner 35%, Collation 10%, Dîner 30%
        const distributions = {
            3: [0.30, 0.40, 0.30],                    // 3 repas
            4: [0.25, 0.35, 0.10, 0.30],              // 4 repas
            5: [0.20, 0.10, 0.30, 0.10, 0.30],        // 5 repas
            6: [0.15, 0.15, 0.25, 0.10, 0.20, 0.15]   // 6 repas
        };

        const distribution = distributions[mealsPerDay] || distributions[4];
        return distribution.map(ratio => Math.round(totalCalories * ratio));
    }
};

// Exposer globalement
window.NutritionCalculator = NutritionCalculator;
