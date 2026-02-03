/**
 * NUTRITION AI DEMO MODE
 * Génération de repas de démo sans utiliser d'API IA
 * Parfait pour les tests et développement
 */

const NutritionAIDemo = {
    /**
     * Base de données de repas types
     */
    mealTemplates: {
        'Petit-déjeuner': [
            {
                name: 'Flocons d\'avoine protéinés',
                baseCalories: 450,
                baseProtein: 30,
                baseCarbs: 55,
                baseFats: 12,
                ingredients: [
                    { name: 'Flocons d\'avoine', quantity: 80, unit: 'g' },
                    { name: 'Whey protéine vanille', quantity: 30, unit: 'g' },
                    { name: 'Banane', quantity: 1, unit: 'unité' },
                    { name: 'Amandes', quantity: 15, unit: 'g' },
                    { name: 'Miel', quantity: 10, unit: 'g' }
                ]
            },
            {
                name: 'Omelette complète',
                baseCalories: 420,
                baseProtein: 35,
                baseCarbs: 30,
                baseFats: 18,
                ingredients: [
                    { name: 'Œufs entiers', quantity: 3, unit: 'unité(s)' },
                    { name: 'Pain complet', quantity: 60, unit: 'g' },
                    { name: 'Fromage blanc 0%', quantity: 100, unit: 'g' },
                    { name: 'Tomates', quantity: 100, unit: 'g' },
                    { name: 'Jambon blanc', quantity: 50, unit: 'g' }
                ]
            },
            {
                name: 'Pancakes protéinés',
                baseCalories: 480,
                baseProtein: 32,
                baseCarbs: 58,
                baseFats: 14,
                ingredients: [
                    { name: 'Farine de blé complet', quantity: 60, unit: 'g' },
                    { name: 'Whey protéine', quantity: 30, unit: 'g' },
                    { name: 'Œufs', quantity: 2, unit: 'unité(s)' },
                    { name: 'Lait écrémé', quantity: 150, unit: 'ml' },
                    { name: 'Beurre de cacahuète', quantity: 15, unit: 'g' }
                ]
            }
        ],
        'Déjeuner': [
            {
                name: 'Poulet grillé et riz basmati',
                baseCalories: 650,
                baseProtein: 55,
                baseCarbs: 75,
                baseFats: 12,
                ingredients: [
                    { name: 'Blanc de poulet', quantity: 200, unit: 'g' },
                    { name: 'Riz basmati cru', quantity: 80, unit: 'g' },
                    { name: 'Brocolis', quantity: 200, unit: 'g' },
                    { name: 'Huile d\'olive', quantity: 10, unit: 'ml' },
                    { name: 'Épices au choix', quantity: 5, unit: 'g' }
                ]
            },
            {
                name: 'Saumon et patate douce',
                baseCalories: 620,
                baseProtein: 48,
                baseCarbs: 65,
                baseFats: 18,
                ingredients: [
                    { name: 'Filet de saumon', quantity: 180, unit: 'g' },
                    { name: 'Patate douce', quantity: 250, unit: 'g' },
                    { name: 'Haricots verts', quantity: 200, unit: 'g' },
                    { name: 'Huile de colza', quantity: 10, unit: 'ml' },
                    { name: 'Citron', quantity: 1, unit: 'unité' }
                ]
            },
            {
                name: 'Bœuf et quinoa',
                baseCalories: 680,
                baseProtein: 52,
                baseCarbs: 70,
                baseFats: 16,
                ingredients: [
                    { name: 'Steak de bœuf', quantity: 180, unit: 'g' },
                    { name: 'Quinoa cru', quantity: 70, unit: 'g' },
                    { name: 'Poivrons', quantity: 150, unit: 'g' },
                    { name: 'Courgettes', quantity: 150, unit: 'g' },
                    { name: 'Huile d\'olive', quantity: 10, unit: 'ml' }
                ]
            }
        ],
        'Collation': [
            {
                name: 'Shaker protéiné et fruits',
                baseCalories: 250,
                baseProtein: 28,
                baseCarbs: 25,
                baseFats: 5,
                ingredients: [
                    { name: 'Whey protéine', quantity: 30, unit: 'g' },
                    { name: 'Pomme', quantity: 1, unit: 'unité' },
                    { name: 'Amandes', quantity: 10, unit: 'g' }
                ]
            },
            {
                name: 'Fromage blanc et fruits secs',
                baseCalories: 280,
                baseProtein: 25,
                baseCarbs: 30,
                baseFats: 7,
                ingredients: [
                    { name: 'Fromage blanc 0%', quantity: 200, unit: 'g' },
                    { name: 'Fruits secs mélangés', quantity: 30, unit: 'g' },
                    { name: 'Miel', quantity: 10, unit: 'g' }
                ]
            },
            {
                name: 'Toast beurre de cacahuète',
                baseCalories: 290,
                baseProtein: 15,
                baseCarbs: 35,
                baseFats: 10,
                ingredients: [
                    { name: 'Pain complet', quantity: 60, unit: 'g' },
                    { name: 'Beurre de cacahuète', quantity: 25, unit: 'g' },
                    { name: 'Banane', quantity: 1, unit: 'unité' }
                ]
            }
        ],
        'Dîner': [
            {
                name: 'Dinde et pâtes complètes',
                baseCalories: 580,
                baseProtein: 48,
                baseCarbs: 65,
                baseFats: 12,
                ingredients: [
                    { name: 'Escalope de dinde', quantity: 180, unit: 'g' },
                    { name: 'Pâtes complètes crues', quantity: 80, unit: 'g' },
                    { name: 'Sauce tomate maison', quantity: 100, unit: 'g' },
                    { name: 'Épinards', quantity: 150, unit: 'g' },
                    { name: 'Parmesan', quantity: 15, unit: 'g' }
                ]
            },
            {
                name: 'Poisson blanc et légumes',
                baseCalories: 520,
                baseProtein: 45,
                baseCarbs: 50,
                baseFats: 10,
                ingredients: [
                    { name: 'Cabillaud', quantity: 200, unit: 'g' },
                    { name: 'Riz basmati cru', quantity: 70, unit: 'g' },
                    { name: 'Ratatouille', quantity: 250, unit: 'g' },
                    { name: 'Huile d\'olive', quantity: 8, unit: 'ml' }
                ]
            },
            {
                name: 'Œufs et légumes vapeur',
                baseCalories: 480,
                baseProtein: 38,
                baseCarbs: 45,
                baseFats: 15,
                ingredients: [
                    { name: 'Œufs entiers', quantity: 3, unit: 'unité(s)' },
                    { name: 'Pommes de terre', quantity: 200, unit: 'g' },
                    { name: 'Légumes vapeur mélangés', quantity: 250, unit: 'g' },
                    { name: 'Huile de colza', quantity: 10, unit: 'ml' }
                ]
            }
        ]
    },

    /**
     * Générer un plan de repas de démo
     * @param root0
     * @param root0.member
     * @param root0.macros
     * @param root0.planData
     * @param root0.days
     */
    async generateMealPlan({ member, macros, planData, days }) {
        console.log('🎭 Mode DÉMO - Génération sans IA');

        await this.simulateAIDelay(); // Simuler un délai réaliste

        const mealPlan = {
            days: []
        };

        const mealsPerDay = planData.mealsPerDay || 4;

        for (let day = 1; day <= days; day++) {
            const dayMeals = this.generateDayMeals(macros, day, mealsPerDay);
            mealPlan.days.push(dayMeals);
        }

        console.log('✅ Plan démo généré:', mealPlan);
        return mealPlan;
    },

    /**
     * Générer les repas d'une journée
     * @param macros
     * @param dayNumber
     * @param mealsPerDay
     */
    generateDayMeals(macros, dayNumber, mealsPerDay = 4) {
        const targetCalories = macros.targetCalories;

        // Répartitions caloriques selon le nombre de repas
        const distributions = {
            3: {
                'Petit-déjeuner': 0.30,
                'Déjeuner': 0.40,
                'Dîner': 0.30
            },
            4: {
                'Petit-déjeuner': 0.25,
                'Déjeuner': 0.35,
                'Collation': 0.12,
                'Dîner': 0.28
            },
            5: {
                'Petit-déjeuner': 0.22,
                'Collation matin': 0.10,
                'Déjeuner': 0.32,
                'Collation après-midi': 0.10,
                'Dîner': 0.26
            },
            6: {
                'Petit-déjeuner': 0.20,
                'Collation matin': 0.08,
                'Déjeuner': 0.30,
                'Collation après-midi': 0.08,
                'Dîner': 0.26,
                'Collation soir': 0.08
            }
        };

        const distribution = distributions[mealsPerDay] || distributions[4];

        const meals = [];
        let totalCal = 0, totalProt = 0, totalCarbs = 0, totalFats = 0;

        Object.entries(distribution).forEach(([mealType, ratio]) => {
            const targetMealCal = Math.round(targetCalories * ratio);

            // Sélectionner un template aléatoire (utiliser Collation si type inconnu)
            const templates = this.mealTemplates[mealType] || this.mealTemplates['Collation'];
            const template = templates[dayNumber % templates.length];

            // Ajuster les quantités pour correspondre aux macros
            const scaleFactor = targetMealCal / template.baseCalories;

            const meal = {
                type: mealType,
                name: template.name,
                ingredients: template.ingredients.map(ing => ({
                    name: ing.name,
                    quantity: Math.round(ing.quantity * scaleFactor * 10) / 10,
                    unit: ing.unit
                })),
                macros: {
                    calories: Math.round(template.baseCalories * scaleFactor),
                    protein: Math.round(template.baseProtein * scaleFactor),
                    carbs: Math.round(template.baseCarbs * scaleFactor),
                    fats: Math.round(template.baseFats * scaleFactor)
                }
            };

            meals.push(meal);

            totalCal += meal.macros.calories;
            totalProt += meal.macros.protein;
            totalCarbs += meal.macros.carbs;
            totalFats += meal.macros.fats;
        });

        return {
            day: dayNumber,
            meals,
            totalMacros: {
                calories: totalCal,
                protein: totalProt,
                carbs: totalCarbs,
                fats: totalFats
            }
        };
    },

    /**
     * Simuler un délai de génération IA (pour réalisme)
     */
    async simulateAIDelay() {
        await new Promise(resolve => setTimeout(resolve, 1500));
    }
};
