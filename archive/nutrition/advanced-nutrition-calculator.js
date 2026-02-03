/**
 * ADVANCED NUTRITION CALCULATOR
 * Calculs avancés : timing nutritionnel, périodisation, cyclage, refeeds
 */

const AdvancedNutritionCalculator = {
    /**
     * Timing nutritionnel - Fenêtres optimales
     */
    TIMING_WINDOWS: {
        preworkout: {
            name: 'Pré-entraînement',
            timing: '-2h à -30min',
            goals: ['Énergie', 'Performance', 'Prévention catabolisme'],
            macros: {
                protein: 'moderate', // 20-30g
                carbs: 'high', // 40-80g selon intensité
                fats: 'low' // <10g (ralentit digestion)
            },
            examples: [
                'Flocons avoine + banane + whey',
                'Pain complet + beurre cacahuète + pomme',
                'Riz + poulet + légumes (2h avant)'
            ]
        },
        intraworkout: {
            name: 'Intra-entraînement',
            timing: 'Pendant (si >90min)',
            goals: ['Maintien énergie', 'Hydratation', 'Performance endurance'],
            macros: {
                protein: 'none',
                carbs: 'moderate', // 30-60g/h (liquides)
                fats: 'none'
            },
            examples: [
                'Boisson isotonique',
                'Eau + maltodextrine',
                'Gels énergétiques (endurance)'
            ]
        },
        postworkout: {
            name: 'Post-entraînement',
            timing: '0-2h après',
            goals: ['Récupération', 'Anabolisme', 'Glycogène'],
            macros: {
                protein: 'high', // 30-40g
                carbs: 'high', // 40-100g (ratio 2-3:1)
                fats: 'low' // Retardent absorption
            },
            examples: [
                'Whey + banane + miel',
                'Riz + poulet + patate douce',
                'Pâtes + thon + légumes'
            ]
        },
        bedtime: {
            name: 'Avant coucher',
            timing: '-1h avant sommeil',
            goals: ['Anti-catabolisme nocturne', 'Récupération', 'Croissance'],
            macros: {
                protein: 'high', // 30-40g (caséine idéale)
                carbs: 'low', // <20g
                fats: 'moderate' // 10-15g
            },
            examples: [
                'Fromage blanc + amandes',
                'Caséine + beurre cacahuète',
                'Œufs + avocat'
            ]
        }
    },

    /**
     * Périodisation nutritionnelle - Cycles selon phase
     */
    PERIODIZATION_PHASES: {
        mass_building: {
            name: 'Construction musculaire',
            duration: '8-16 semaines',
            surplus: 300, // kcal/jour
            proteinMultiplier: 2.0,
            carbsEmphasis: 'high',
            training: 'Hypertrophie (8-12 reps)',
            refeedFrequency: null // Pas nécessaire en surplus
        },
        cutting: {
            name: 'Sèche',
            duration: '6-12 semaines',
            deficit: -500,
            proteinMultiplier: 2.5, // Élevé pour préserver muscle
            carbsEmphasis: 'moderate',
            training: 'Force (4-6 reps) + volume modéré',
            refeedFrequency: 'weekly' // 1 refeed/semaine
        },
        maintenance: {
            name: 'Maintenance',
            duration: '2-4 semaines',
            surplus: 0,
            proteinMultiplier: 1.8,
            carbsEmphasis: 'moderate',
            training: 'Deload / Maintenance',
            refeedFrequency: null
        },
        peaking: {
            name: 'Peak / Compétition',
            duration: '1-2 semaines',
            surplus: 200,
            proteinMultiplier: 2.0,
            carbsEmphasis: 'very_high',
            training: 'Spécifique compétition',
            refeedFrequency: null,
            notes: 'Carb loading 3 jours avant'
        }
    },

    /**
     * Cyclage calorique - Variabilité selon entraînement
     * @param baseTDEE
     * @param objective
     * @param weeklyTraining
     */
    calculateCalorieCycling(baseTDEE, objective, weeklyTraining) {
        const cycles = {};

        if (!weeklyTraining || !weeklyTraining.sessions) {
            // Cyclage simple sans planning
            cycles.training_day = {
                calories: Math.round(baseTDEE + 200),
                description: 'Jour d\'entraînement',
                carbsBoost: 50 // g
            };
            cycles.rest_day = {
                calories: Math.round(baseTDEE * 0.88),
                description: 'Jour de repos',
                carbsReduction: 50 // g
            };
        } else {
            // Cyclage avancé avec planning
            const sessionTypes = this.categorizeTrainingSessions(weeklyTraining.sessions);

            // Jour high (WOD, HIIT, Endurance longue)
            cycles.high_day = {
                calories: Math.round(baseTDEE + 400),
                description: 'Jour haute intensité',
                carbsBoost: 100,
                types: sessionTypes.high
            };

            // Jour moderate (Force, Skills)
            cycles.moderate_day = {
                calories: Math.round(baseTDEE + 150),
                description: 'Jour intensité modérée',
                carbsBoost: 40,
                types: sessionTypes.moderate
            };

            // Jour low (Mobilité, Récup)
            cycles.low_day = {
                calories: Math.round(baseTDEE),
                description: 'Jour récupération active',
                carbsBoost: 0,
                types: sessionTypes.low
            };

            // Jour repos
            cycles.rest_day = {
                calories: Math.round(baseTDEE * 0.85),
                description: 'Jour de repos complet',
                carbsReduction: 80,
                types: []
            };
        }

        // Moyenne hebdomadaire (doit correspondre à l'objectif)
        cycles.weeklyAverage = this.calculateWeeklyAverage(cycles, weeklyTraining);

        return cycles;
    },

    /**
     * Catégoriser les séances par intensité
     * @param sessions
     */
    categorizeTrainingSessions(sessions) {
        return {
            high: sessions.filter(s =>
                ['crossfit', 'hiit', 'cardio', 'endurance'].includes(s.category)
            ),
            moderate: sessions.filter(s =>
                ['strength', 'team_sport'].includes(s.category)
            ),
            low: sessions.filter(s =>
                ['mobility', 'recovery', 'gymnastic'].includes(s.category)
            )
        };
    },

    /**
     * Calculer la moyenne hebdomadaire
     * @param cycles
     * @param weeklyTraining
     */
    calculateWeeklyAverage(cycles, weeklyTraining) {
        if (!weeklyTraining || !weeklyTraining.sessions) {
            // Hypothèse : 4 training days, 3 rest days
            const weeklyTotal = (cycles.training_day.calories * 4) + (cycles.rest_day.calories * 3);
            return Math.round(weeklyTotal / 7);
        }

        // Avec planning précis
        const sessionTypes = this.categorizeTrainingSessions(weeklyTraining.sessions);
        const weeklyTotal =
            (cycles.high_day.calories * sessionTypes.high.length) +
            (cycles.moderate_day.calories * sessionTypes.moderate.length) +
            (cycles.low_day.calories * sessionTypes.low.length) +
            (cycles.rest_day.calories * (7 - weeklyTraining.sessions.length));

        return Math.round(weeklyTotal / 7);
    },

    /**
     * Refeeds stratégiques (sèche)
     * @param baseTDEE
     * @param currentDeficit
     */
    calculateRefeed(baseTDEE, currentDeficit) {
        // Refeed = journée à maintenance ou léger surplus
        // But : Relancer le métabolisme et leptine

        const refeedCalories = Math.round(baseTDEE + 200); // +200 au-dessus de maintenance
        const normalDeficitCalories = Math.round(baseTDEE + currentDeficit);

        // Macros du refeed : HIGH CARB, MODERATE PROTEIN, LOW FAT
        const protein = Math.round(normalDeficitCalories * 0.25 / 4); // 25% protéines
        const fats = Math.round(normalDeficitCalories * 0.20 / 9); // 20% lipides (bas)
        const carbsCal = refeedCalories - (protein * 4) - (fats * 9);
        const carbs = Math.round(carbsCal / 4);

        return {
            calories: refeedCalories,
            macros: {
                protein: { grams: protein },
                carbs: { grams: carbs }, // Élevé !
                fats: { grams: fats } // Bas
            },
            frequency: 'weekly', // 1x/semaine en sèche standard
            benefits: [
                'Relance métabolisme (leptine)',
                'Boost mental et motivation',
                'Reconstitution glycogène',
                'Amélioration performance'
            ],
            timing: 'Jour d\'entraînement intense',
            notes: 'Sources glucides saines (riz, patates, fruits)'
        };
    },

    /**
     * Distribution optimale des macros sur la journée
     * @param totalMacros
     * @param mealsPerDay
     * @param trainingTime
     */
    distributeMacrosOverDay(totalMacros, mealsPerDay, trainingTime = null) {
        const meals = [];
        const mealTypes = NutritionAIGenerator.getMealTypesByCount(mealsPerDay);

        // Stratégie : Plus de glucides autour de l'entraînement
        // Protéines réparties uniformément

        const proteinPerMeal = Math.round(totalMacros.protein.grams / mealsPerDay);
        const carbsPerMeal = Math.round(totalMacros.carbs.grams / mealsPerDay);
        const fatsPerMeal = Math.round(totalMacros.fats.grams / mealsPerDay);

        for (let i = 0; i < mealsPerDay; i++) {
            const mealType = mealTypes[i];
            let carbsMultiplier = 1.0;
            let fatsMultiplier = 1.0;

            // Ajustements selon le type de repas
            if (mealType === 'Petit-déjeuner') {
                carbsMultiplier = 1.2; // Boost matinal
                fatsMultiplier = 0.8;
            } else if (mealType === 'Collation matin') {
                carbsMultiplier = 0.8;
                fatsMultiplier = 1.0;
            } else if (mealType === 'Déjeuner') {
                carbsMultiplier = 1.3; // Repas principal
                fatsMultiplier = 1.0;
            } else if (mealType.includes('Collation')) {
                // Collations = pré ou post workout souvent
                carbsMultiplier = 1.2;
                fatsMultiplier = 0.6; // Bas (digestion rapide)
            } else if (mealType === 'Dîner') {
                carbsMultiplier = 0.9; // Moins le soir
                fatsMultiplier = 1.2; // Plus (satiété)
            } else if (mealType === 'Collation soir') {
                carbsMultiplier = 0.5; // Très peu
                fatsMultiplier = 1.3; // Plus (caséine)
            }

            meals.push({
                type: mealType,
                macros: {
                    protein: proteinPerMeal,
                    carbs: Math.round(carbsPerMeal * carbsMultiplier),
                    fats: Math.round(fatsPerMeal * fatsMultiplier),
                    calories: Math.round(
                        (proteinPerMeal * 4) +
                        (carbsPerMeal * carbsMultiplier * 4) +
                        (fatsPerMeal * fatsMultiplier * 9)
                    )
                },
                timing: this.getMealTiming(mealType, trainingTime)
            });
        }

        // Ajuster pour que le total corresponde exactement
        return this.adjustMealTotals(meals, totalMacros);
    },

    /**
     * Déterminer le timing optimal
     * @param mealType
     * @param trainingTime
     */
    getMealTiming(mealType, trainingTime) {
        const timings = {
            'Petit-déjeuner': '7h-9h',
            'Collation matin': '10h-11h',
            'Déjeuner': '12h-14h',
            'Collation après-midi': '16h-17h',
            'Dîner': '19h-21h',
            'Collation soir': '22h-23h'
        };

        return timings[mealType] || 'Variable';
    },

    /**
     * Ajuster les totaux pour correspondre exactement
     * @param meals
     * @param targetMacros
     */
    adjustMealTotals(meals, targetMacros) {
        const currentTotal = meals.reduce((sum, meal) => ({
            protein: sum.protein + meal.macros.protein,
            carbs: sum.carbs + meal.macros.carbs,
            fats: sum.fats + meal.macros.fats
        }), { protein: 0, carbs: 0, fats: 0 });

        // Ajustement sur le déjeuner (repas principal)
        const lunchIndex = meals.findIndex(m => m.type === 'Déjeuner');
        if (lunchIndex !== -1) {
            meals[lunchIndex].macros.protein += (targetMacros.protein.grams - currentTotal.protein);
            meals[lunchIndex].macros.carbs += (targetMacros.carbs.grams - currentTotal.carbs);
            meals[lunchIndex].macros.fats += (targetMacros.fats.grams - currentTotal.fats);

            // Recalculer calories
            meals[lunchIndex].macros.calories = Math.round(
                (meals[lunchIndex].macros.protein * 4) +
                (meals[lunchIndex].macros.carbs * 4) +
                (meals[lunchIndex].macros.fats * 9)
            );
        }

        return meals;
    },

    /**
     * Hydratation personnalisée
     * @param weight
     * @param activityLevel
     * @param climate
     * @param sessionDuration
     */
    calculateHydrationNeeds(weight, activityLevel, climate = 'temperate', sessionDuration = 0) {
        // Base : 35ml/kg
        let baseWater = weight * 0.035;

        // Ajustement activité
        const activityMultipliers = {
            sedentary: 1.0,
            light: 1.1,
            moderate: 1.25,
            active: 1.4,
            very_active: 1.6
        };
        baseWater *= (activityMultipliers[activityLevel] || 1.25);

        // Ajustement climat
        const climateMultipliers = {
            cold: 0.95,
            temperate: 1.0,
            warm: 1.15,
            hot: 1.3
        };
        baseWater *= (climateMultipliers[climate] || 1.0);

        // Ajustement séance (500ml supplémentaires par heure)
        const sessionWater = (sessionDuration / 60) * 0.5;

        const totalLiters = baseWater + sessionWater;

        return {
            daily: Math.round(baseWater * 10) / 10,
            withTraining: Math.round(totalLiters * 10) / 10,
            perSession: Math.round(sessionWater * 10) / 10,
            breakdown: {
                morning: Math.round((totalLiters * 0.25) * 10) / 10,
                afternoon: Math.round((totalLiters * 0.40) * 10) / 10,
                evening: Math.round((totalLiters * 0.25) * 10) / 10,
                session: Math.round(sessionWater * 10) / 10
            },
            tips: [
                'Boire 500ml au réveil (réhydratation)',
                'Siroter régulièrement (pas tout d\'un coup)',
                `${Math.round(sessionWater * 500)}ml pendant l'entraînement`,
                'Urine claire = bonne hydratation'
            ]
        };
    },

    /**
     * Électrolytes (sodium, potassium) pour entraînement intense
     * @param sessionDuration
     * @param intensity
     * @param climate
     */
    calculateElectrolyteNeeds(sessionDuration, intensity, climate) {
        // Pertes en sueur (estimation)
        const sweatRate = {
            light: 0.5, // L/h
            moderate: 1.0,
            high: 1.5,
            extreme: 2.0
        };

        const rate = sweatRate[intensity] || 1.0;
        const climateFactor = climate === 'hot' ? 1.4 : 1.0;
        const totalSweatLoss = (sessionDuration / 60) * rate * climateFactor;

        // Concentration électrolytes dans sueur
        const sodiumPerLiter = 1000; // mg
        const potassiumPerLiter = 200; // mg

        return {
            sodium: Math.round(totalSweatLoss * sodiumPerLiter),
            potassium: Math.round(totalSweatLoss * potassiumPerLiter),
            recommendations: [
                'Boisson isotonique si >90min',
                'Sel alimentaire après entraînement',
                'Banane (potassium) post-workout',
                'Eau de coco (électrolytes naturels)'
            ],
            sweatLoss: Math.round(totalSweatLoss * 10) / 10
        };
    },

    /**
     * Recommandations de supplémentation basées sur la science
     * @param objective
     * @param diet
     * @param budget
     */
    recommendSupplements(objective, diet, budget = 'medium') {
        const essential = []; // Vraiment essentiels
        const beneficial = []; // Prouvés scientifiquement selon objectif

        // ========== ESSENTIELS (pour tous) ==========
        essential.push({
            name: 'Vitamine D3',
            dosage: '2000-4000 UI/jour',
            timing: 'Matin avec repas gras',
            reason: 'Carence tres frequente. Essentielle pour hormones, os, immunite, performance',
            evidence: 'Fort (Meta-analyses)',
            cost: 'low',
            priority: 100
        });

        essential.push({
            name: 'Omega-3 (EPA/DHA)',
            dosage: '2-3g/jour (dont 1g EPA)',
            timing: 'Avec repas',
            reason: 'Reduit inflammation, ameliore recuperation, sante cardiovasculaire',
            evidence: 'Fort',
            cost: 'medium',
            priority: 95
        });

        // ========== PRISE DE MASSE / PERFORMANCE FORCE ==========
        if (objective === 'prise_masse' || objective === 'performance_force') {
            beneficial.push({
                name: 'Creatine monohydrate',
                dosage: '5g/jour',
                timing: 'Quotidien (peu importe l\'heure)',
                reason: '+5-15% force, +1-2kg masse musculaire, ameliore recuperation',
                evidence: 'Tres fort (supplement le plus etudie)',
                cost: 'low',
                priority: 95
            });

            beneficial.push({
                name: 'Whey Proteine',
                dosage: '25-40g post-entrainement',
                timing: '0-2h post-workout',
                reason: 'Atteindre quota proteines facilement, absorption rapide',
                evidence: 'Fort',
                cost: 'medium',
                priority: 75
            });

            beneficial.push({
                name: 'Beta-Alanine',
                dosage: '3-6g/jour',
                timing: 'Repartir dans la journee',
                reason: 'Reduit fatigue musculaire, +2-3 reps par serie',
                evidence: 'Moyen-Fort',
                cost: 'medium',
                priority: 65
            });

            beneficial.push({
                name: 'Citrulline Malate',
                dosage: '6-8g pre-workout',
                timing: '30-60min avant entrainement',
                reason: 'Ameliore pump, reduit fatigue, +1-2 reps',
                evidence: 'Moyen',
                cost: 'medium',
                priority: 55
            });
        }

        // ========== SECHE / PERTE DE POIDS ==========
        if (objective === 'seche' || objective === 'perte_poids') {
            beneficial.push({
                name: 'Cafeine',
                dosage: '200-400mg',
                timing: 'Pre-workout (avant 16h)',
                reason: '+3-5% depense energetique, reduit appetit, ameliore focus',
                evidence: 'Fort',
                cost: 'low',
                priority: 80
            });

            beneficial.push({
                name: 'Whey Proteine',
                dosage: '25-40g par collation',
                timing: 'Entre repas ou post-workout',
                reason: 'Preserve muscle en deficit, augmente satiete',
                evidence: 'Fort',
                cost: 'medium',
                priority: 75
            });

            beneficial.push({
                name: 'Extrait de The Vert (EGCG)',
                dosage: '400-500mg EGCG/jour',
                timing: 'Matin et midi',
                reason: 'Leger effet thermogenique (+3-4% metabolisme)',
                evidence: 'Moyen',
                cost: 'low',
                priority: 50
            });

            // Note: L-Carnitine volontairement OMISE - peu d'evidence scientifique
            // Elle ne fonctionne que si déficience (rare chez omnivores)
        }

        // ========== PERFORMANCE ENDURANCE ==========
        if (objective === 'performance_endurance') {
            beneficial.push({
                name: 'Beta-Alanine',
                dosage: '3-6g/jour',
                timing: 'Repartir dans la journee',
                reason: 'Ameliore capacite tampon, retarde fatigue sur efforts >60sec',
                evidence: 'Fort',
                cost: 'medium',
                priority: 85
            });

            beneficial.push({
                name: 'Sodium (electrolytes)',
                dosage: '500-1000mg/heure effort',
                timing: 'Pendant entrainement >60min',
                reason: 'Previent crampes, maintient hydratation',
                evidence: 'Fort',
                cost: 'low',
                priority: 80
            });

            beneficial.push({
                name: 'Cafeine',
                dosage: '3-6mg/kg (200-400mg)',
                timing: '45-60min avant effort',
                reason: 'Ameliore endurance, reduit perception effort',
                evidence: 'Tres fort',
                cost: 'low',
                priority: 75
            });

            beneficial.push({
                name: 'Nitrate (jus betterave)',
                dosage: '500mg nitrate (500ml jus)',
                timing: '2-3h avant effort',
                reason: 'Ameliore efficacite oxygene, -2-3% temps sur effort',
                evidence: 'Moyen-Fort',
                cost: 'medium',
                priority: 60
            });
        }

        // ========== PERFORMANCE CROSSFIT ==========
        if (objective === 'performance_crossfit') {
            beneficial.push({
                name: 'Creatine monohydrate',
                dosage: '5g/jour',
                timing: 'Quotidien',
                reason: 'Ameliore puissance repetee, recuperation inter-serie',
                evidence: 'Tres fort',
                cost: 'low',
                priority: 90
            });

            beneficial.push({
                name: 'Beta-Alanine',
                dosage: '3-6g/jour',
                timing: 'Repartir dans la journee',
                reason: 'Retarde fatigue sur WODs intenses',
                evidence: 'Fort',
                cost: 'medium',
                priority: 80
            });

            beneficial.push({
                name: 'Cafeine',
                dosage: '200-400mg',
                timing: 'Pre-WOD (avant 16h)',
                reason: 'Focus mental, ameliore force et endurance',
                evidence: 'Fort',
                cost: 'low',
                priority: 75
            });

            beneficial.push({
                name: 'Whey Proteine',
                dosage: '25-40g',
                timing: 'Post-WOD',
                reason: 'Accelere recuperation musculaire',
                evidence: 'Fort',
                cost: 'medium',
                priority: 70
            });
        }

        // ========== MAINTIEN / SANTE GENERALE ==========
        if (objective === 'maintien' || objective === 'sante_generale') {
            beneficial.push({
                name: 'Magnesium (bisglycinaté)',
                dosage: '300-400mg/jour',
                timing: 'Soir avant coucher',
                reason: 'Ameliore sommeil, reduit crampes, recuperation',
                evidence: 'Fort',
                cost: 'low',
                priority: 70
            });

            beneficial.push({
                name: 'Zinc',
                dosage: '15-30mg/jour',
                timing: 'Soir avec repas',
                reason: 'Soutient testosterone, immunite, recuperation',
                evidence: 'Moyen',
                cost: 'low',
                priority: 60
            });
        }

        // ========== SUPPLEMENTS UNIVERSELS (BENEFIQUES) ==========
        // Ajoutés pour tous les objectifs sauf si déjà présents
        const hasWhey = beneficial.some(s => s.name.includes('Whey'));
        const hasCaffeine = beneficial.some(s => s.name === 'Cafeine');

        if (!hasWhey && objective !== 'sante_generale') {
            beneficial.push({
                name: 'Whey Proteine',
                dosage: '25-40g/portion',
                timing: 'Post-workout ou collation',
                reason: 'Facilite atteinte des besoins proteiques',
                evidence: 'Fort',
                cost: 'medium',
                priority: 65
            });
        }

        // Magnésium pour tous (sauf déjà présent)
        const hasMagnesium = beneficial.some(s => s.name.includes('Magnesium'));
        if (!hasMagnesium) {
            beneficial.push({
                name: 'Magnesium (bisglycinaté)',
                dosage: '300-400mg/jour',
                timing: 'Soir avant coucher',
                reason: 'Ameliore qualite sommeil, reduit crampes',
                evidence: 'Fort',
                cost: 'low',
                priority: 60
            });
        }

        // Trier par priorité
        beneficial.sort((a, b) => b.priority - a.priority);

        // Filtrer selon budget
        let filtered = { essential, beneficial };

        if (budget === 'low') {
            // Garder seulement les suppléments low cost
            filtered.beneficial = beneficial.filter(s => s.cost === 'low').slice(0, 3);
        } else if (budget === 'medium') {
            // Garder top 5 suppléments
            filtered.beneficial = beneficial.slice(0, 5);
        } else {
            // Budget high: garder tous
            filtered.beneficial = beneficial;
        }

        return filtered;
    },

    /**
     * Génération d'un plan complet avec tous les calculs avancés
     * @param member
     * @param objective
     * @param weeklyTraining
     * @param preferences
     */
    generateCompletePlan(member, objective, weeklyTraining, preferences = {}) {
        // 1. Calculs de base
        const baseMacros = NutritionCalculator.calculateMacros(
            member,
            objective,
            'active',
            weeklyTraining
        );

        // 2. Composition corporelle
        const bodyComp = BodyAnalysis.calculateBodyComposition(member);

        // 3. Morphotype
        const morphotype = BodyAnalysis.determineMorphotype(member, preferences.morphotype);

        // 4. Ajustement morphotype
        const adjustedMacros = BodyAnalysis.adjustForMorphotype(
            baseMacros.targetCalories,
            baseMacros.macros,
            morphotype.dominant
        );

        // 5. Cyclage calorique
        const calorieCycling = this.calculateCalorieCycling(
            baseMacros.tdee,
            objective,
            weeklyTraining
        );

        // 6. Distribution repas
        const mealsDistribution = this.distributeMacrosOverDay(
            adjustedMacros.macros,
            preferences.mealsPerDay || 4,
            preferences.trainingTime
        );

        // 7. Hydratation
        const hydration = this.calculateHydrationNeeds(
            member.weight,
            'active',
            preferences.climate,
            60
        );

        // 8. Micronutriments
        const micronutrients = BodyAnalysis.calculateMicronutrientNeeds(
            member,
            objective,
            'active'
        );

        // 9. Suppléments
        const supplements = this.recommendSupplements(
            objective,
            preferences.diet,
            preferences.budget
        );

        // 10. Refeed (si sèche)
        let refeed = null;
        if (objective === 'weight_loss' || objective === 'lean_mass') {
            refeed = this.calculateRefeed(baseMacros.tdee, -500);
        }

        return {
            member: {
                name: member.name,
                age: NutritionCalculator.calculateAge(member.birthdate),
                weight: member.weight,
                height: member.height
            },
            bodyComposition: bodyComp,
            morphotype,
            baseMacros,
            adjustedMacros,
            calorieCycling,
            mealsDistribution,
            hydration,
            micronutrients,
            supplements,
            refeed,
            objective: NutritionPro.OBJECTIVES[objective]
        };
    }
};
