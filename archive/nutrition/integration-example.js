/**
 * INTEGRATION EXAMPLE - Exemple d'intégration complète
 * Montre comment utiliser tous les nouveaux modules ensemble
 */

const NutritionProV3Integration = {
    /**
     * EXEMPLE 1 : Flow complet de A à Z
     */
    async createCompletePlanExample() {
        console.log('🚀 Exemple : Création plan complet de A à Z');

        // ==================== ÉTAPE 1 : DONNÉES MEMBRE ====================
        const member = {
            id: 'member_123',
            name: 'Jean Dupont',
            birthdate: '1990-06-15',
            gender: 'male',
            weight: 80,
            height: 180,
            body_fat_percentage: 15 // Optionnel, sera estimé si absent
        };

        console.log('✅ Membre chargé:', member.name);

        // ==================== ÉTAPE 2 : QUESTIONNAIRE ====================
        // (Rempli par l'utilisateur dans l'interface)
        const questionnaireResponses = {
            meals_per_day_current: '3',
            breakfast_habit: 'always',
            meal_prep: 'sometimes',
            eating_out_frequency: '1-2',
            snacking_habit: 'healthy',
            macro_tracking: 'sometimes',
            nutrition_knowledge_level: 'intermediate',
            read_labels: 'sometimes',
            cooking_time: '30-60',
            cooking_skill: 'intermediate',
            budget: 'medium',
            work_schedule: 'regular',
            family_situation: 'couple',
            food_variety: 'variety',
            taste_preference: ['french', 'asian', 'healthy'],
            spicy_tolerance: 6,
            sweet_tooth: 'moderate',
            previous_diets: ['intermittent_fasting', 'iifym'],
            diet_success: 'partial',
            yo_yo_dieting: 'sometimes',
            weight_change_6months: '+2',
            motivation_level: 8,
            main_goal: 'performance',
            timeline: 'medium',
            commitment_level: 'moderate'
        };

        // Analyser le questionnaire
        const profile = NutritionQuestionnaire.analyzeResponses(questionnaireResponses);
        console.log('✅ Profil analysé:', {
            overallScore: profile.overallScore,
            autonomyLevel: profile.autonomyLevel.label
        });

        // ==================== ÉTAPE 3 : PLANNING ENTRAÎNEMENT ====================
        const weeklyTraining = {
            sessions: [
                { category: 'crossfit', duration: 60, day: 'lundi' },
                { category: 'strength', duration: 60, day: 'mercredi' },
                { category: 'hiit', duration: 45, day: 'vendredi' },
                { category: 'mobility', duration: 30, day: 'dimanche' }
            ]
        };

        console.log('✅ Planning:', weeklyTraining.sessions.length, 'séances/semaine');

        // ==================== ÉTAPE 4 : PRÉFÉRENCES ====================
        const preferences = {
            mealsPerDay: 4,
            trainingTime: '18:00',
            climate: 'temperate',
            budget: profile.adaptations.budget,
            diet: 'omnivore',
            morphotype: {
                weightGainDifficulty: 'moderate',
                muscleGains: 'moderate',
                fatStorage: 'moderate'
            }
        };

        // ==================== ÉTAPE 5 : GÉNÉRATION PLAN COMPLET ====================
        console.log('🧮 Calcul du plan complet...');

        const completePlan = AdvancedNutritionCalculator.generateCompletePlan(
            member,
            'mass_gain', // Objectif
            weeklyTraining,
            preferences
        );

        console.log('✅ Plan complet généré !');
        console.log('📊 Résumé:', {
            bodyFat: completePlan.bodyComposition.bodyFat + '%',
            leanMass: completePlan.bodyComposition.leanMass + 'kg',
            ffmi: completePlan.bodyComposition.ffmi,
            morphotype: completePlan.morphotype.config.name,
            baseCalories: completePlan.baseMacros.targetCalories,
            adjustedCalories: completePlan.adjustedMacros.calories,
            hydration: completePlan.hydration.withTraining + 'L'
        });

        // ==================== ÉTAPE 6 : AFFICHER DANS L'INTERFACE ====================
        this.displayCompletePlan(completePlan, profile);

        // ==================== ÉTAPE 7 : GÉNÉRATION REPAS (IA) ====================
        console.log('🤖 Génération des repas avec IA...');

        // Obtenir les aliments recommandés
        const recommendedFoods = NutritionDatabase.recommendForObjective(
            'mass_gain',
            { allergies: preferences.allergies || [] }
        );

        // Construire un prompt enrichi
        const enrichedPrompt = this.buildEnrichedPrompt(
            completePlan,
            recommendedFoods,
            profile.adaptations
        );

        console.log('📝 Prompt enrichi généré');

        // Générer avec IA (exemple)
        // const mealPlan = await NutritionAIGenerator.generateMealPlan({
        //     member,
        //     macros: completePlan.adjustedMacros,
        //     planData: { objective: 'mass_gain', mealsPerDay: 4, ... },
        //     days: 7,
        //     enrichedData: completePlan
        // });

        // ==================== ÉTAPE 8 : PDF ULTRA-COMPLET ====================
        console.log('📄 Génération PDF ultra-complet...');

        // (À implémenter : extension de nutritionpdf.js)
        // await this.generateUltraCompletePDF(completePlan, mealPlan, profile);

        return {
            member,
            profile,
            completePlan,
            recommendedFoods
        };
    },

    /**
     * EXEMPLE 2 : Analyse corporelle détaillée
     */
    analyzeBodyCompositionExample() {
        console.log('🔬 Exemple : Analyse corporelle détaillée');

        const member = {
            name: 'Marie Martin',
            birthdate: '1995-03-20',
            gender: 'female',
            weight: 62,
            height: 165,
            body_fat_percentage: 22
        };

        // Analyse complète
        const bodyComp = BodyAnalysis.calculateBodyComposition(member);

        console.log('📊 Composition corporelle:', {
            poids: bodyComp.weight + 'kg',
            masseGrasse: bodyComp.fatMass + 'kg (' + bodyComp.bodyFat + '%)',
            masseMaigre: bodyComp.leanMass + 'kg',
            masseMusculaire: bodyComp.muscleMass + 'kg',
            masseOsseuse: bodyComp.boneMass + 'kg',
            eau: bodyComp.waterMass + 'kg (' + bodyComp.waterPercentage + '%)',
            bmrMifflin: bodyComp.bmr.mifflin + ' kcal',
            bmrKatch: bodyComp.bmr.katchMcardle + ' kcal',
            ffmi: bodyComp.ffmi + ' (' + bodyComp.ffmiCategory.label + ')'
        });

        console.log('⚠️ État santé:', bodyComp.healthStatus);

        // Micronutriments
        const micros = BodyAnalysis.calculateMicronutrientNeeds(
            member,
            'weight_loss',
            'active'
        );

        console.log('🥦 Micronutriments clés:', {
            vitamineD: micros.daily.vitaminD + ' µg',
            calcium: micros.daily.calcium + ' mg',
            fer: micros.daily.iron + ' mg (⚠️ Important femmes)',
            magnesium: micros.daily.magnesium + ' mg'
        });

        return { bodyComp, micros };
    },

    /**
     * EXEMPLE 3 : Morphotype et ajustements
     */
    morphotypeExample() {
        console.log('🧬 Exemple : Morphotype et ajustements');

        const member = {
            name: 'Pierre Durand',
            birthdate: '1988-09-10',
            gender: 'male',
            weight: 95,
            height: 178,
            body_fat_percentage: 25
        };

        // Questionnaire morphotype
        const morphoAnswers = {
            weightGainDifficulty: 'easy',
            muscleGains: 'fast',
            fatStorage: 'easy'
        };

        // Déterminer morphotype
        const morphotype = BodyAnalysis.determineMorphotype(member, morphoAnswers);

        console.log('🎯 Morphotype dominant:', morphotype.dominant);
        console.log('📊 Scores:', morphotype.scores);
        console.log('⚙️ Configuration:', {
            nom: morphotype.config.name,
            ajustementCalories: morphotype.config.calorieAdjustment,
            ratioGlucides: morphotype.config.carbsRatio,
            ratioLipides: morphotype.config.fatsRatio,
            frequenceRepas: morphotype.config.mealFrequency
        });

        // Macros de base
        const baseMacros = {
            targetCalories: 2800,
            macros: {
                protein: { grams: 190, calories: 760, percentage: 27 },
                carbs: { grams: 315, calories: 1260, percentage: 45 },
                fats: { grams: 87, calories: 780, percentage: 28 }
            }
        };

        // Ajuster selon morphotype
        const adjusted = BodyAnalysis.adjustForMorphotype(
            baseMacros.targetCalories,
            baseMacros.macros,
            morphotype.dominant
        );

        console.log('🔧 Macros ajustées:', {
            calories: adjusted.calories + ' (au lieu de ' + baseMacros.targetCalories + ')',
            proteines: adjusted.macros.protein.grams + 'g',
            glucides: adjusted.macros.carbs.grams + 'g (' + adjusted.macros.carbs.percentage + '%)',
            lipides: adjusted.macros.fats.grams + 'g (' + adjusted.macros.fats.percentage + '%)',
            frequenceRepas: adjusted.mealFrequency
        });

        return { morphotype, adjusted };
    },

    /**
     * EXEMPLE 4 : Cyclage calorique avancé
     */
    caloriecyclingExample() {
        console.log('📅 Exemple : Cyclage calorique avancé');

        const baseTDEE = 2800;
        const weeklyTraining = {
            sessions: [
                { category: 'crossfit', duration: 60 },  // High
                { category: 'strength', duration: 60 },   // Moderate
                { category: 'hiit', duration: 45 },       // High
                { category: 'endurance', duration: 90 },  // High
                { category: 'mobility', duration: 30 }    // Low
            ]
        };

        const cycling = AdvancedNutritionCalculator.calculateCalorieCycling(
            baseTDEE,
            'mass_gain',
            weeklyTraining
        );

        console.log('📊 Cyclage calorique:');
        console.log('🔥 Jour haute intensité:', cycling.high_day.calories, 'kcal (boost glucides:', cycling.high_day.carbsBoost + 'g)');
        console.log('💪 Jour intensité modérée:', cycling.moderate_day.calories, 'kcal');
        console.log('🧘 Jour récupération:', cycling.low_day.calories, 'kcal');
        console.log('😴 Jour repos:', cycling.rest_day.calories, 'kcal');
        console.log('📈 Moyenne hebdomadaire:', cycling.weeklyAverage, 'kcal');

        // Exemple de semaine
        console.log('\n📅 Exemple semaine type:');
        console.log('Lundi (CrossFit):', cycling.high_day.calories, 'kcal');
        console.log('Mardi (Repos):', cycling.rest_day.calories, 'kcal');
        console.log('Mercredi (Force):', cycling.moderate_day.calories, 'kcal');
        console.log('Jeudi (Repos):', cycling.rest_day.calories, 'kcal');
        console.log('Vendredi (HIIT):', cycling.high_day.calories, 'kcal');
        console.log('Samedi (Endurance):', cycling.high_day.calories, 'kcal');
        console.log('Dimanche (Mobilité):', cycling.low_day.calories, 'kcal');

        return cycling;
    },

    /**
     * EXEMPLE 5 : Utilisation de la base de données
     */
    foodDatabaseExample() {
        console.log('🍗 Exemple : Base de données aliments');

        // Rechercher des aliments
        const proteinsFood = NutritionDatabase.getFoodsByCategory('PROTEINS');
        console.log('🥩 Protéines disponibles:', proteinsFood.length);

        // Chercher un aliment spécifique
        const chicken = NutritionDatabase.getFood('poulet_blanc');
        console.log('🐔 Poulet (100g):', {
            calories: chicken.per100g.calories,
            proteines: chicken.per100g.protein + 'g',
            lipides: chicken.per100g.fats + 'g',
            vitB3: chicken.per100g.vitaminB3 + 'mg',
            selenium: chicken.per100g.selenium + 'µg',
            qualite: chicken.quality + '/100'
        });

        // Calculer pour une quantité
        const portion = NutritionDatabase.calculateForQuantity('poulet_blanc', 200);
        console.log('🍽️ Poulet (200g):', {
            calories: portion.macros.calories,
            proteines: portion.macros.protein + 'g',
            lipides: portion.macros.fats + 'g'
        });

        // Recommandations selon objectif
        const recommended = NutritionDatabase.recommendForObjective(
            'mass_gain',
            { allergies: ['Lactose'] }
        );
        console.log('⭐ Aliments recommandés (prise de masse, sans lactose):');
        console.log('Haute priorité:', recommended.highPriority.join(', '));
        console.log('Suppléments:', recommended.supplements.join(', '));

        // Filtrer par allergènes
        const noGluten = NutritionDatabase.filterByAllergens(['Gluten']);
        console.log('🚫 Aliments sans gluten:', noGluten.length);

        return { chicken, portion, recommended };
    },

    /**
     * EXEMPLE 6 : Questionnaire et profil
     */
    questionnaireExample() {
        console.log('📝 Exemple : Questionnaire et profil');

        // Réponses exemple (débutant avec contraintes)
        const responses = {
            meals_per_day_current: '1-2',
            breakfast_habit: 'never',
            meal_prep: 'never',
            eating_out_frequency: '6+',
            snacking_habit: 'frequent',
            macro_tracking: 'never',
            nutrition_knowledge_level: 'beginner',
            read_labels: 'never',
            cooking_time: '0-15',
            cooking_skill: 'beginner',
            budget: 'low',
            work_schedule: 'irregular',
            family_situation: 'alone',
            food_variety: 'routine',
            sweet_tooth: 'high',
            previous_diets: ['none'],
            yo_yo_dieting: 'yes',
            motivation_level: 5,
            main_goal: 'health',
            timeline: 'short',
            commitment_level: 'flexible'
        };

        // Analyser
        const profile = NutritionQuestionnaire.analyzeResponses(responses);

        console.log('📊 Scores:', profile.scores);
        console.log('🎯 Score global:', profile.overallScore + '%');
        console.log('👤 Niveau autonomie:', profile.autonomyLevel.label);
        console.log('⚙️ Adaptations:', profile.adaptations);
        console.log('📌 Recommandations:', profile.recommendations.length);
        console.log('⚠️ Avertissements:', profile.warnings.length);

        // Afficher les recommandations
        profile.recommendations.forEach(rec => {
            console.log(`\n[${rec.priority.toUpperCase()}] ${rec.title}`);
            console.log(rec.description);
            rec.actions.forEach(action => console.log('  • ' + action));
        });

        return profile;
    },

    /**
     * Construire un prompt enrichi pour l'IA
     * @param completePlan
     * @param recommendedFoods
     * @param adaptations
     */
    buildEnrichedPrompt(completePlan, recommendedFoods, adaptations) {
        // Extraire les aliments prioritaires
        const foodNames = recommendedFoods.highPriority
            .map(id => NutritionDatabase.getFood(id).name)
            .join(', ');

        const prompt = `
Génère un plan de repas ultra-personnalisé avec ces données:

PROFIL:
- ${completePlan.member.name}, ${completePlan.member.age} ans
- Morphotype: ${completePlan.morphotype.config.name}
- FFMI: ${completePlan.bodyComposition.ffmi} (${completePlan.bodyComposition.ffmiCategory.label})
- Masse grasse: ${completePlan.bodyComposition.bodyFat}%

MACROS (ajustées morphotype):
- Calories: ${completePlan.adjustedMacros.calories} kcal/jour
- Protéines: ${completePlan.adjustedMacros.macros.protein.grams}g (${completePlan.adjustedMacros.macros.protein.percentage}%)
- Glucides: ${completePlan.adjustedMacros.macros.carbs.grams}g (${completePlan.adjustedMacros.macros.carbs.percentage}%)
- Lipides: ${completePlan.adjustedMacros.macros.fats.grams}g (${completePlan.adjustedMacros.macros.fats.percentage}%)

CYCLAGE CALORIQUE:
- Jour haute intensité: ${completePlan.calorieCycling.high_day.calories} kcal
- Jour repos: ${completePlan.calorieCycling.rest_day.calories} kcal

DISTRIBUTION REPAS:
${completePlan.mealsDistribution.map(m =>
        `${m.type}: ${m.macros.calories}kcal (P:${m.macros.protein}g G:${m.macros.carbs}g L:${m.macros.fats}g)`
    ).join('\n')}

ALIMENTS RECOMMANDÉS:
${foodNames}

ADAPTATIONS:
- Complexité: ${adaptations.mealComplexity}
- Variété: ${adaptations.mealVariety}
- Budget: ${adaptations.budget}

TIMING:
${Object.entries(AdvancedNutritionCalculator.TIMING_WINDOWS).map(([key, window]) =>
        `${window.name} (${window.timing}): ${window.goals.join(', ')}`
    ).join('\n')}

Génère 7 jours de repas en JSON avec macro précis et timing optimisé.
        `;

        return prompt.trim();
    },

    /**
     * Afficher le plan complet dans l'interface (exemple HTML)
     * @param plan
     * @param profile
     */
    displayCompletePlan(plan, profile) {
        // Exemple structure HTML (à adapter selon ton interface)
        const html = `
            <div class="complete-plan-display">
                <!-- En-tête -->
                <div class="plan-header">
                    <h2>${plan.member.name} - Plan Nutritionnel Complet</h2>
                    <p>Morphotype: ${plan.morphotype.config.name}</p>
                </div>

                <!-- Composition corporelle -->
                <section class="body-composition">
                    <h3>📊 Composition corporelle</h3>
                    <div class="stats-grid">
                        <div class="stat">
                            <label>Masse grasse</label>
                            <value>${plan.bodyComposition.fatMass}kg (${plan.bodyComposition.bodyFat}%)</value>
                        </div>
                        <div class="stat">
                            <label>Masse maigre</label>
                            <value>${plan.bodyComposition.leanMass}kg</value>
                        </div>
                        <div class="stat">
                            <label>FFMI</label>
                            <value>${plan.bodyComposition.ffmi} (${plan.bodyComposition.ffmiCategory.label})</value>
                        </div>
                    </div>
                </section>

                <!-- Macros -->
                <section class="macros">
                    <h3>🔥 Macronutriments</h3>
                    <div class="comparison">
                        <div>Base: ${plan.baseMacros.targetCalories} kcal</div>
                        <div>Ajusté: ${plan.adjustedMacros.calories} kcal</div>
                    </div>
                </section>

                <!-- Cyclage -->
                <section class="calorie-cycling">
                    <h3>📅 Cyclage calorique</h3>
                    <table>
                        <tr><td>Jour intense</td><td>${plan.calorieCycling.high_day.calories} kcal</td></tr>
                        <tr><td>Jour modéré</td><td>${plan.calorieCycling.moderate_day.calories} kcal</td></tr>
                        <tr><td>Jour repos</td><td>${plan.calorieCycling.rest_day.calories} kcal</td></tr>
                    </table>
                </section>

                <!-- Hydratation -->
                <section class="hydration">
                    <h3>💧 Hydratation</h3>
                    <p><strong>${plan.hydration.withTraining}L/jour</strong> (avec entraînement)</p>
                </section>

                <!-- Suppléments -->
                <section class="supplements">
                    <h3>💊 Supplémentation</h3>
                    <div class="essentials">
                        <h4>Essentiels</h4>
                        ${plan.supplements.essential.map(s => `
                            <div class="supplement">
                                <strong>${s.name}</strong> (${s.dose})
                                <small>${s.reason}</small>
                            </div>
                        `).join('')}
                    </div>
                </section>

                <!-- Actions -->
                <div class="actions">
                    <button onclick="generateMeals()">Générer les repas</button>
                    <button onclick="exportPDF()">Télécharger PDF complet</button>
                </div>
            </div>
        `;

        console.log('✅ HTML généré (à insérer dans l\'interface)');
        return html;
    }
};

// ==================== TESTS RAPIDES ====================

// Décommenter pour tester :
// NutritionProV3Integration.createCompletePlanExample();
// NutritionProV3Integration.analyzeBodyCompositionExample();
// NutritionProV3Integration.morphotypeExample();
// NutritionProV3Integration.caloriecyclingExample();
// NutritionProV3Integration.foodDatabaseExample();
// NutritionProV3Integration.questionnaireExample();
