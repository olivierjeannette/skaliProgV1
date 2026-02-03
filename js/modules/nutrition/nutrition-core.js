/**
 * ═══════════════════════════════════════════════════════════════
 * NUTRITION CORE - Moteur de calcul + Database
 * Fichier consolidé : Calculs, Database, Algorithmes avancés
 * ═══════════════════════════════════════════════════════════════
 */

const NutritionCore = {
    /**
     * ═══════════════════════════════════════════════════════════
     * CONFIGURATION - Objectifs nutritionnels
     * ═══════════════════════════════════════════════════════════
     */
    OBJECTIVES: {
        weight_loss: {
            name: 'Perte de poids',
            icon: '🔥',
            deficit: -500,
            proteinPercent: 30, // % des calories totales
            carbsPercent: 40,
            fatsPercent: 30
        },
        mass_gain: {
            name: 'Prise de masse',
            icon: '💪',
            surplus: 300,
            proteinPercent: 25,
            carbsPercent: 50,
            fatsPercent: 25
        },
        maintenance: {
            name: 'Maintien',
            icon: '⚖️',
            surplus: 0,
            proteinPercent: 25,
            carbsPercent: 45,
            fatsPercent: 30
        },
        cutting: {
            name: 'Sèche',
            icon: '⚡',
            deficit: -700,
            proteinPercent: 35,
            carbsPercent: 35,
            fatsPercent: 30
        },
        performance_endurance: {
            name: 'Performance Endurance',
            icon: '🏃',
            surplus: 200,
            proteinPercent: 20,
            carbsPercent: 60,
            fatsPercent: 20
        },
        performance_strength: {
            name: 'Performance Force',
            icon: '🏋️',
            surplus: 250,
            proteinPercent: 28,
            carbsPercent: 47,
            fatsPercent: 25
        },
        health: {
            name: 'Santé générale',
            icon: '❤️',
            surplus: 0,
            proteinPercent: 22,
            carbsPercent: 48,
            fatsPercent: 30
        },
        recomposition: {
            name: 'Recomposition',
            icon: '🔄',
            surplus: -200,
            proteinPercent: 32,
            carbsPercent: 38,
            fatsPercent: 30
        }
    },

    /**
     * Niveaux d'activité physique
     */
    ACTIVITY_LEVELS: {
        sedentary: { name: 'Sédentaire', multiplier: 1.2, description: "Peu ou pas d'exercice" },
        light: { name: 'Légèrement actif', multiplier: 1.375, description: '1-3 jours/semaine' },
        moderate: { name: 'Modérément actif', multiplier: 1.55, description: '3-5 jours/semaine' },
        very_active: { name: 'Très actif', multiplier: 1.725, description: '6-7 jours/semaine' },
        extra_active: {
            name: 'Extrêmement actif',
            multiplier: 1.9,
            description: '2x/jour + travail physique'
        }
    },

    /**
     * Morphotypes
     */
    MORPHOTYPES: {
        ectomorph: {
            name: 'Ectomorphe',
            description: 'Métabolisme rapide, difficulté à prendre du poids',
            carbsBonus: 10,
            proteinMultiplier: 1.0,
            fatsBonus: -5
        },
        mesomorph: {
            name: 'Mésomorphe',
            description: 'Métabolisme équilibré, gains musculaires faciles',
            carbsBonus: 0,
            proteinMultiplier: 1.0,
            fatsBonus: 0
        },
        endomorph: {
            name: 'Endomorphe',
            description: 'Métabolisme lent, tendance à stocker les graisses',
            carbsBonus: -10,
            proteinMultiplier: 1.1,
            fatsBonus: 5
        }
    },

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULS MÉTABOLIQUES
     * ═══════════════════════════════════════════════════════════
     */

    /**
     * Calculer le BMR (Métabolisme de base) - Formule Mifflin-St Jeor
     * @param member
     */
    calculateBMR(member) {
        const weight = member.weight || 70;
        const height = member.height || 175;
        const age = this.calculateAge(member.birthdate) || member.age || 30;
        const gender = member.gender || 'male';

        let bmr;
        if (gender === 'male') {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }

        return Math.round(bmr);
    },

    /**
     * Calculer le TDEE (Dépense énergétique totale)
     * @param bmr
     * @param activityLevel
     */
    calculateTDEE(bmr, activityLevel) {
        const multiplier = this.ACTIVITY_LEVELS[activityLevel]?.multiplier || 1.55;
        return Math.round(bmr * multiplier);
    },

    /**
     * Calculer les macros complètes
     * @param member
     * @param planData
     */
    calculateMacros(member, planData) {
        const bmr = this.calculateBMR(member);
        const tdee = this.calculateTDEE(bmr, planData.activityLevel || 'moderate');

        const objective = this.OBJECTIVES[planData.objective] || this.OBJECTIVES.maintenance;
        const adjustment = objective.surplus || objective.deficit || 0;
        const targetCalories = tdee + adjustment;

        // Ajustement morphotype
        const morphotype = this.MORPHOTYPES[planData.morphotype || 'mesomorph'];
        const weight = member.weight || 70;

        // Nouvelle méthode : TOUT en pourcentages pour une répartition équilibrée
        let proteinPercent = objective.proteinPercent;
        let carbsPercent = objective.carbsPercent + morphotype.carbsBonus;
        let fatsPercent = objective.fatsPercent + morphotype.fatsBonus;

        // S'assurer que le total fait 100%
        const total = proteinPercent + carbsPercent + fatsPercent;
        if (total !== 100) {
            const ratio = 100 / total;
            proteinPercent = Math.round(proteinPercent * ratio);
            carbsPercent = Math.round(carbsPercent * ratio);
            fatsPercent = 100 - proteinPercent - carbsPercent; // Ajustement final pour éviter les arrondis
        }

        // Calculer les calories et grammes pour chaque macro
        const proteinCalories = Math.round(targetCalories * (proteinPercent / 100));
        const proteinGrams = Math.round(proteinCalories / 4);

        const carbsCalories = Math.round(targetCalories * (carbsPercent / 100));
        const carbsGrams = Math.round(carbsCalories / 4);

        const fatsCalories = Math.round(targetCalories * (fatsPercent / 100));
        const fatsGrams = Math.round(fatsCalories / 9);

        return {
            bmr,
            tdee,
            targetCalories: Math.round(targetCalories),
            macros: {
                protein: {
                    grams: proteinGrams,
                    perKg: Math.round((proteinGrams / weight) * 10) / 10,
                    calories: proteinCalories,
                    percent: Math.round((proteinCalories / targetCalories) * 100)
                },
                carbs: {
                    grams: carbsGrams,
                    perKg: Math.round((carbsGrams / weight) * 10) / 10,
                    calories: carbsCalories,
                    percent: Math.round((carbsCalories / targetCalories) * 100)
                },
                fats: {
                    grams: fatsGrams,
                    perKg: Math.round((fatsGrams / weight) * 10) / 10,
                    calories: fatsCalories,
                    percent: Math.round((fatsCalories / targetCalories) * 100)
                }
            }
        };
    },

    /**
     * Calculer la composition corporelle
     * @param member
     */
    calculateBodyComposition(member) {
        const weight = member.weight || 70;
        const bodyFat = member.bodyFat || 15;
        const height = member.height || 175;

        const fatMass = (weight * bodyFat) / 100;
        const leanMass = weight - fatMass;

        // FFMI (Fat Free Mass Index)
        const heightM = height / 100;
        const ffmi = leanMass / (heightM * heightM);

        // Classification FFMI
        let ffmiCategory = 'Normal';
        if (ffmi < 18) {
            ffmiCategory = 'En-dessous';
        } else if (ffmi >= 18 && ffmi < 20) {
            ffmiCategory = 'Normal';
        } else if (ffmi >= 20 && ffmi < 23) {
            ffmiCategory = 'Au-dessus';
        } else if (ffmi >= 23 && ffmi < 26) {
            ffmiCategory = 'Excellent';
        } else {
            ffmiCategory = 'Elite/Suspect';
        }

        return {
            weight: Math.round(weight * 10) / 10,
            bodyFat: Math.round(bodyFat * 10) / 10,
            fatMass: Math.round(fatMass * 10) / 10,
            leanMass: Math.round(leanMass * 10) / 10,
            ffmi: Math.round(ffmi * 10) / 10,
            ffmiCategory
        };
    },

    /**
     * Timing nutritionnel périworkout
     * @param macros
     * @param planData
     */
    calculateNutrientTiming(macros, planData) {
        const totalProtein = macros.macros.protein.grams;
        const totalCarbs = macros.macros.carbs.grams;
        const totalFats = macros.macros.fats.grams;

        const hasTraining = planData.trainingDays && planData.trainingDays.length > 0;

        if (!hasTraining) {
            return {
                preworkout: null,
                postworkout: null,
                distribution: 'standard'
            };
        }

        return {
            preworkout: {
                timing: '-90 à -30 min',
                protein: Math.round(totalProtein * 0.15), // 15% protéines totales
                carbs: Math.round(totalCarbs * 0.25), // 25% glucides totaux
                fats: Math.round(totalFats * 0.1), // 10% lipides totaux
                suggestions: [
                    "Flocons d'avoine + whey + banane",
                    'Pain complet + beurre de cacahuète + pomme',
                    'Riz basmati + blanc de poulet (2h avant)'
                ]
            },
            postworkout: {
                timing: '0-120 min après',
                protein: Math.round(totalProtein * 0.25), // 25% protéines totales
                carbs: Math.round(totalCarbs * 0.35), // 35% glucides totaux
                fats: Math.round(totalFats * 0.1), // 10% lipides totaux
                suggestions: [
                    'Whey + banane + miel',
                    'Riz + poulet + patate douce',
                    'Pâtes + thon + légumes'
                ]
            },
            distribution: 'periodized'
        };
    },

    /**
     * Cyclage calorique (si activé)
     * @param macros
     * @param planData
     */
    calculateCalorieCycling(macros, planData) {
        if (!planData.calorieCycling) {
            return null;
        }

        const baseCalories = macros.targetCalories;
        const trainingDays = planData.trainingDays || [];
        const restDays = 7 - trainingDays.length;

        return {
            trainingDays: {
                calories: Math.round(baseCalories * 1.15),
                carbs: Math.round(macros.macros.carbs.grams * 1.25),
                protein: macros.macros.protein.grams,
                fats: Math.round(macros.macros.fats.grams * 0.9)
            },
            restDays: {
                calories: Math.round(baseCalories * 0.85),
                carbs: Math.round(macros.macros.carbs.grams * 0.75),
                protein: macros.macros.protein.grams,
                fats: Math.round(macros.macros.fats.grams * 1.1)
            }
        };
    },

    /**
     * Calculer les besoins en eau
     * @param member
     * @param planData
     */
    calculateWaterNeeds(member, planData) {
        const weight = member.weight || 70;
        const activityLevel = planData.activityLevel || 'moderate';

        // Base : 35ml/kg
        let waterML = weight * 35;

        // Ajustement activité
        if (activityLevel === 'very_active' || activityLevel === 'extra_active') {
            waterML += 500;
        }

        return {
            dailyML: Math.round(waterML),
            dailyLiters: Math.round((waterML / 1000) * 10) / 10,
            perMeal: Math.round(waterML / (planData.mealsPerDay || 4))
        };
    },

    /**
     * Calculer l'âge depuis la date de naissance
     * @param birthdate
     */
    calculateAge(birthdate) {
        if (!birthdate) {
            return null;
        }
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
     * ═══════════════════════════════════════════════════════════
     * BASE DE DONNÉES ALIMENTAIRE (Top 100 aliments)
     * ═══════════════════════════════════════════════════════════
     */
    FOOD_DATABASE: {
        // PROTÉINES ANIMALES
        poulet_blanc: {
            name: 'Poulet (blanc)',
            category: 'protein',
            per100g: { cal: 165, p: 31, c: 0, f: 3.6 },
            gi: 0,
            price: 1.2,
            quality: 95
        },
        boeuf_maigre: {
            name: 'Bœuf maigre',
            category: 'protein',
            per100g: { cal: 155, p: 26, c: 0, f: 5 },
            gi: 0,
            price: 2.0,
            quality: 90
        },
        dinde: {
            name: 'Dinde',
            category: 'protein',
            per100g: { cal: 135, p: 30, c: 0, f: 1 },
            gi: 0,
            price: 1.5,
            quality: 95
        },
        saumon: {
            name: 'Saumon',
            category: 'protein',
            per100g: { cal: 208, p: 20, c: 0, f: 13 },
            gi: 0,
            price: 3.5,
            quality: 100
        },
        thon: {
            name: 'Thon (conserve)',
            category: 'protein',
            per100g: { cal: 116, p: 26, c: 0, f: 1 },
            gi: 0,
            price: 1.8,
            quality: 85
        },
        oeuf: {
            name: 'Œufs',
            category: 'protein',
            per100g: { cal: 155, p: 13, c: 1.1, f: 11 },
            gi: 0,
            price: 0.3,
            quality: 100
        },
        blanc_oeuf: {
            name: "Blanc d'œuf",
            category: 'protein',
            per100g: { cal: 52, p: 11, c: 0.7, f: 0.2 },
            gi: 0,
            price: 0.2,
            quality: 95
        },
        jambon_blanc: {
            name: 'Jambon blanc',
            category: 'protein',
            per100g: { cal: 115, p: 21, c: 1, f: 3 },
            gi: 0,
            price: 1.5,
            quality: 75
        },

        // PROTÉINES VÉGÉTALES
        tofu: {
            name: 'Tofu',
            category: 'protein',
            per100g: { cal: 76, p: 8, c: 1.9, f: 4.8 },
            gi: 15,
            price: 1.2,
            quality: 80
        },
        tempeh: {
            name: 'Tempeh',
            category: 'protein',
            per100g: { cal: 193, p: 19, c: 9, f: 11 },
            gi: 15,
            price: 1.5,
            quality: 90
        },
        seitan: {
            name: 'Seitan',
            category: 'protein',
            per100g: { cal: 370, p: 75, c: 14, f: 2 },
            gi: 25,
            price: 1.8,
            quality: 85
        },
        lentilles: {
            name: 'Lentilles',
            category: 'protein',
            per100g: { cal: 116, p: 9, c: 20, f: 0.4 },
            gi: 30,
            price: 0.3,
            quality: 95
        },
        pois_chiches: {
            name: 'Pois chiches',
            category: 'protein',
            per100g: { cal: 164, p: 9, c: 27, f: 2.6 },
            gi: 28,
            price: 0.4,
            quality: 90
        },
        haricots_rouges: {
            name: 'Haricots rouges',
            category: 'protein',
            per100g: { cal: 127, p: 8.7, c: 23, f: 0.5 },
            gi: 24,
            price: 0.3,
            quality: 90
        },

        // GLUCIDES - Céréales et Féculents
        riz_basmati: {
            name: 'Riz basmati',
            category: 'carbs',
            per100g: { cal: 350, p: 8, c: 78, f: 0.6 },
            gi: 50,
            price: 0.2,
            quality: 85
        },
        riz_complet: {
            name: 'Riz complet',
            category: 'carbs',
            per100g: { cal: 370, p: 7.5, c: 77, f: 2.7 },
            gi: 50,
            price: 0.25,
            quality: 95
        },
        quinoa: {
            name: 'Quinoa',
            category: 'carbs',
            per100g: { cal: 368, p: 14, c: 64, f: 6 },
            gi: 35,
            price: 0.8,
            quality: 100
        },
        avoine: {
            name: "Flocons d'avoine",
            category: 'carbs',
            per100g: { cal: 389, p: 17, c: 66, f: 7 },
            gi: 55,
            price: 0.2,
            quality: 95
        },
        pates_completes: {
            name: 'Pâtes complètes',
            category: 'carbs',
            per100g: { cal: 348, p: 13, c: 70, f: 2.5 },
            gi: 45,
            price: 0.15,
            quality: 85
        },
        pain_complet: {
            name: 'Pain complet',
            category: 'carbs',
            per100g: { cal: 247, p: 9, c: 47, f: 3.3 },
            gi: 52,
            price: 0.3,
            quality: 80
        },
        patate_douce: {
            name: 'Patate douce',
            category: 'carbs',
            per100g: { cal: 86, p: 1.6, c: 20, f: 0.1 },
            gi: 63,
            price: 0.4,
            quality: 95
        },
        pomme_terre: {
            name: 'Pomme de terre',
            category: 'carbs',
            per100g: { cal: 77, p: 2, c: 17, f: 0.1 },
            gi: 85,
            price: 0.15,
            quality: 75
        },

        // FRUITS
        banane: {
            name: 'Banane',
            category: 'fruit',
            per100g: { cal: 89, p: 1.1, c: 23, f: 0.3 },
            gi: 62,
            price: 0.2,
            quality: 90
        },
        pomme: {
            name: 'Pomme',
            category: 'fruit',
            per100g: { cal: 52, p: 0.3, c: 14, f: 0.2 },
            gi: 36,
            price: 0.3,
            quality: 95
        },
        orange: {
            name: 'Orange',
            category: 'fruit',
            per100g: { cal: 47, p: 0.9, c: 12, f: 0.1 },
            gi: 43,
            price: 0.3,
            quality: 95
        },
        fraises: {
            name: 'Fraises',
            category: 'fruit',
            per100g: { cal: 32, p: 0.7, c: 8, f: 0.3 },
            gi: 40,
            price: 0.8,
            quality: 95
        },
        myrtilles: {
            name: 'Myrtilles',
            category: 'fruit',
            per100g: { cal: 57, p: 0.7, c: 14, f: 0.3 },
            gi: 53,
            price: 1.2,
            quality: 100
        },
        avocat: {
            name: 'Avocat',
            category: 'fruit',
            per100g: { cal: 160, p: 2, c: 9, f: 15 },
            gi: 15,
            price: 0.8,
            quality: 100
        },

        // LÉGUMES
        brocoli: {
            name: 'Brocoli',
            category: 'vegetable',
            per100g: { cal: 34, p: 2.8, c: 7, f: 0.4 },
            gi: 15,
            price: 0.4,
            quality: 100
        },
        epinards: {
            name: 'Épinards',
            category: 'vegetable',
            per100g: { cal: 23, p: 2.9, c: 3.6, f: 0.4 },
            gi: 15,
            price: 0.5,
            quality: 100
        },
        courgette: {
            name: 'Courgette',
            category: 'vegetable',
            per100g: { cal: 17, p: 1.2, c: 3.1, f: 0.3 },
            gi: 15,
            price: 0.3,
            quality: 95
        },
        tomate: {
            name: 'Tomate',
            category: 'vegetable',
            per100g: { cal: 18, p: 0.9, c: 3.9, f: 0.2 },
            gi: 15,
            price: 0.4,
            quality: 95
        },
        poivron: {
            name: 'Poivron',
            category: 'vegetable',
            per100g: { cal: 31, p: 1, c: 6, f: 0.3 },
            gi: 15,
            price: 0.6,
            quality: 95
        },
        haricots_verts: {
            name: 'Haricots verts',
            category: 'vegetable',
            per100g: { cal: 31, p: 1.8, c: 7, f: 0.2 },
            gi: 15,
            price: 0.4,
            quality: 90
        },

        // LIPIDES
        huile_olive: {
            name: "Huile d'olive",
            category: 'fat',
            per100g: { cal: 884, p: 0, c: 0, f: 100 },
            gi: 0,
            price: 1.0,
            quality: 100
        },
        amandes: {
            name: 'Amandes',
            category: 'fat',
            per100g: { cal: 579, p: 21, c: 22, f: 50 },
            gi: 15,
            price: 1.5,
            quality: 95
        },
        noix: {
            name: 'Noix',
            category: 'fat',
            per100g: { cal: 654, p: 15, c: 14, f: 65 },
            gi: 15,
            price: 1.8,
            quality: 95
        },
        beurre_cacahuete: {
            name: 'Beurre de cacahuète',
            category: 'fat',
            per100g: { cal: 588, p: 25, c: 20, f: 50 },
            gi: 14,
            price: 0.6,
            quality: 85
        },

        // PRODUITS LAITIERS
        fromage_blanc: {
            name: 'Fromage blanc 0%',
            category: 'dairy',
            per100g: { cal: 47, p: 8, c: 4, f: 0.2 },
            gi: 30,
            price: 0.3,
            quality: 90
        },
        yaourt_grec: {
            name: 'Yaourt grec',
            category: 'dairy',
            per100g: { cal: 97, p: 9, c: 4, f: 5 },
            gi: 30,
            price: 0.5,
            quality: 90
        },
        lait_ecrème: {
            name: 'Lait écrémé',
            category: 'dairy',
            per100g: { cal: 34, p: 3.4, c: 5, f: 0.1 },
            gi: 30,
            price: 0.15,
            quality: 85
        },

        // SUPPLÉMENTS
        whey: {
            name: 'Whey protéine',
            category: 'supplement',
            per100g: { cal: 400, p: 80, c: 8, f: 5 },
            gi: 30,
            price: 2.5,
            quality: 95
        },
        creatine: {
            name: 'Créatine',
            category: 'supplement',
            per100g: { cal: 0, p: 0, c: 0, f: 0 },
            gi: 0,
            price: 3.0,
            quality: 90
        }
    },

    /**
     * Récupérer les aliments par catégorie
     * @param category
     */
    getFoodsByCategory(category) {
        return Object.entries(this.FOOD_DATABASE)
            .filter(([key, food]) => food.category === category)
            .map(([key, food]) => ({ id: key, ...food }));
    },

    /**
     * Rechercher des aliments
     * @param query
     */
    searchFoods(query) {
        const lowerQuery = query.toLowerCase();
        return Object.entries(this.FOOD_DATABASE)
            .filter(
                ([key, food]) =>
                    food.name.toLowerCase().includes(lowerQuery) || key.includes(lowerQuery)
            )
            .map(([key, food]) => ({ id: key, ...food }));
    }
};

// Export global
window.NutritionCore = NutritionCore;
console.log('✅ NutritionCore chargé');
