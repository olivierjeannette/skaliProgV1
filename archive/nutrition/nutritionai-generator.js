/**
 * NUTRITION AI GENERATOR
 * Génération de plans de repas personnalisés avec IA (OpenAI/Claude)
 */

const NutritionAIGenerator = {
    /**
     * Générer un plan de repas complet avec IA
     * @param root0
     * @param root0.member
     * @param root0.macros
     * @param root0.planData
     * @param root0.days
     */
    async generateMealPlan({ member, macros, planData, days }) {
        console.log('🤖 Génération plan de repas IA:', {
            member: member.name,
            days,
            targetCalories: macros.targetCalories,
            protein: macros.macros?.protein?.grams,
            carbs: macros.macros?.carbs?.grams,
            fats: macros.macros?.fats?.grams
        });

        // Vérifier qu'une clé API est configurée
        const openaiKey = ENV.get('openaiKey');
        const claudeKey = ENV.get('claudeKey');
        const deepseekKey = ENV.get('deepseekKey');

        // MODE DÉMO si aucune clé API
        if (!openaiKey && !claudeKey && !deepseekKey) {
            console.log('🎭 Aucune API configurée - Utilisation du mode DÉMO');
            return await NutritionAIDemo.generateMealPlan({ member, macros, planData, days });
        }

        // Construire le prompt détaillé
        const prompt = this.buildMealPlanPrompt(member, macros, planData, days);
        console.log('📝 Prompt envoyé à l\'IA:', prompt.substring(0, 200) + '...');

        // Générer avec l'IA disponible (priorité: Claude Haiku > DeepSeek > OpenAI)
        let response;
        try {
            if (claudeKey) {
                response = await this.generateWithClaude(prompt, claudeKey);
            } else if (deepseekKey) {
                response = await this.generateWithDeepSeek(prompt, deepseekKey);
            } else {
                response = await this.generateWithOpenAI(prompt, openaiKey);
            }

            // Parser et valider la réponse
            const mealPlan = this.parseMealPlanResponse(response, days, macros);

            console.log('✅ Plan de repas généré:', mealPlan);
            return mealPlan;
        } catch (error) {
            console.warn('⚠️ Erreur API IA, basculement en mode DÉMO:', error.message);
            return await NutritionAIDemo.generateMealPlan({ member, macros, planData, days });
        }
    },

    /**
     * Construire un prompt détaillé et structuré avec contraintes budgétaires
     * @param member
     * @param macros
     * @param planData
     * @param days
     */
    buildMealPlanPrompt(member, macros, planData, days) {
        // Utiliser NutritionProUnified au lieu de l'ancien NutritionPro
        const objectiveConfig = (window.NutritionProUnified && window.NutritionProUnified.OBJECTIVES)
            ? window.NutritionProUnified.OBJECTIVES[planData.objective]
            : { name: planData.objective || 'Objectif personnalisé' };

        // Calculer l'âge directement
        const age = member.age || this.calculateAge(member.birthdate);

        const restrictionsText = [];
        if (planData.allergies && planData.allergies.length > 0) {
            restrictionsText.push(`Allergies: ${planData.allergies.join(', ')}`);
        }
        if (planData.regimes && planData.regimes.length > 0) {
            restrictionsText.push(`Régimes: ${planData.regimes.join(', ')}`);
        }

        const mealsPerDay = planData.mealsPerDay || 4;
        const mealTypes = this.getMealTypesByCount(mealsPerDay);

        // Budget mensuel (par défaut 400€)
        const monthlyBudget = planData.monthlyBudget || 400;
        const dailyBudget = Math.round((monthlyBudget / 30) * 100) / 100;

        // Recommandations budgétaires INTELLIGENTES selon le budget
        let budgetGuidance = '';
        if (monthlyBudget < 250) {
            budgetGuidance = `Budget SERRÉ (${monthlyBudget}€/mois, ~${dailyBudget}€/jour) - STRATÉGIE ÉCONOMIQUE:
- BASE QUOTIDIENNE: Oeufs (pas TOUS LES JOURS!), poulet économique, légumineuses (lentilles, pois chiches), yaourt nature, fromage blanc
- AUTORISE 1x/semaine: Saumon OU viande rouge (boeuf haché 15% moins cher que 5%), porc côtes
- VARIE les petits-déj: Flocons d'avoine + lait, Pain complet + beurre cacahuète, Yaourt + fruits + muesli, Omelette (max 2x/7j)
- VARIE les collations: Fruits frais, Fruits secs + amandes, Pain + fromage blanc, Yaourt + banane (PAS que yaourt grec!)
- Féculents: Riz blanc, pâtes, pommes de terre, pain (économiques)
- Légumes: Surgelés OK (brocoli, haricots verts, épinards = 3€/kg)
- ASTUCE: Privilégie morceaux avec gras naturel (haché 15%, cuisses poulet) = moins cher`;
        } else if (monthlyBudget < 500) {
            budgetGuidance = `Budget MODÉRÉ (${monthlyBudget}€/mois, ~${dailyBudget}€/jour) - ÉQUILIBRE QUALITÉ/PRIX:
- VARIE les protéines: Poulet, dinde, porc, boeuf haché 15%, oeufs (max 3x/7j), légumineuses, yaourt
- AUTORISE 1-2x/semaine: Saumon, colin, boeuf haché 5% OU steak haché
- VARIE les petits-déj: Porridge, Pancakes protéinés, Pain complet + jambon, Smoothie bowl, Omelette légumes (max 2x/7j)
- VARIE les collations: Fruits + oléagineux, Cottage cheese, Energy balls maison, Smoothie, Pain complet + avocat
- Féculents: Varie riz basmati/complet, pâtes complètes, patates douces, pain complet
- Légumes: Mix frais de saison + surgelés
- ASTUCE: Pour viande rouge, privilégie boeuf haché 15% ou porc (moins cher que pièces premium)`;
        } else {
            budgetGuidance = `Budget CONFORTABLE (${monthlyBudget}€/mois, ~${dailyBudget}€/jour) - QUALITÉ & VARIÉTÉ:
- VARIE VRAIMENT les protéines: Poulet, dinde, porc, boeuf (rumsteak, bavette, entrecôte), saumon (2x/7j max), colin, oeufs (max 3x/7j)
- PRIVILÉGIE qualité: Pièces nobles (rumsteak, filet), poissons frais, viandes de qualité
- VARIE les petits-déj: Oeufs brouillés saumon fumé, Bowls fruits rouges, Crêpes protéinées, Tartines avocat oeuf poché, Granola maison
- VARIE les collations: Fromage + fruits, Smoothie protéiné, Houmous + crudités, Barres protéinées maison, Yaourt skyr + fruits rouges
- Féculents: Quinoa, riz basmati, pâtes complètes, patates douces, pain complet
- Légumes: Frais de qualité + surgelés premium
- ASTUCE: Budget confortable = meilleures PIÈCES et QUALITÉ, pas juste "plus de saumon"`;
        }

        // Prompt optimisé avec diversité, simplicité et réalisme économique
        return `Tu es un nutritionniste expert qui crée des plans alimentaires RÉALISTES, DIVERSIFIÉS et ÉCONOMIQUES pour la vie quotidienne en France.

PROFIL CLIENT:
- ${member.name}, ${age}ans, ${member.weight}kg, ${member.gender === 'male' ? 'Homme' : 'Femme'}
- Objectif: ${objectiveConfig.name}
- Macros/jour: ${macros.targetCalories}kcal (Protéines:${macros.macros.protein.grams}g, Glucides:${macros.macros.carbs.grams}g, Lipides:${macros.macros.fats.grams}g)
${restrictionsText.length > 0 ? '- Restrictions: ' + restrictionsText.join(', ') : ''}
- ${mealsPerDay} repas/jour: ${mealTypes.join(', ')}

${budgetGuidance}

RÈGLES ABSOLUES DE DIVERSITÉ - RESPECT OBLIGATOIRE:

PETITS-DÉJEUNERS (VARIE VRAIMENT!):
❌ INTERDIT: Omelette plus de 2x sur ${days} jours
✅ EXEMPLES VARIÉS À UTILISER:
  - Flocons d'avoine + lait + fruits + miel
  - Pain complet + beurre de cacahuète + banane
  - Yaourt nature + granola + fruits rouges + amandes
  - Pancakes protéinés (farine complète + oeufs + lait) + sirop d'érable
  - Porridge (flocons avoine + lait + cannelle + pomme)
  - Pain complet + jambon blanc + fromage + tomate
  - Smoothie bowl (banane + fruits rouges + yaourt + granola)
  - Tartines avocat + oeuf poché (max 1x/7j)
  - Crêpes complètes + fromage blanc + miel
  - Muesli + lait + fruits frais

COLLATIONS (VARIE VRAIMENT!):
❌ INTERDIT: "Yaourt grec + fruits" plus de 2x sur ${days} jours
✅ EXEMPLES VARIÉS À UTILISER:
  - Pomme + poignée d'amandes (20g)
  - Pain complet + fromage blanc
  - Banane + beurre de cacahuète (1 c.à.s)
  - Fruits secs (abricots, dattes) + noix
  - Cottage cheese + concombre
  - Pain complet + avocat
  - Smoothie (lait + banane + flocons avoine)
  - Compote sans sucre + amandes
  - Energy balls maison (dattes + amandes + cacao)
  - Yaourt nature + miel + noix

PROTÉINES PRINCIPALES (ROTATION STRICTE):
1. JAMAIS la même protéine 2 jours consécutifs
2. Sur ${days} jours, MAXIMUM:
   - Poulet: 2x
   - Oeufs (plat principal): 2x
   - Porc: 2x
   - Boeuf: 1-2x
   - Poisson (saumon/colin): 1x
   - Légumineuses: 2x
   - Dinde: 1-2x

FÉCULENTS (ROTATION OBLIGATOIRE):
❌ INTERDIT: Même féculent 2 repas consécutifs
✅ ALTERNE: Riz basmati → Pâtes complètes → Pommes de terre → Lentilles → Riz complet → Patates douces → Quinoa

LÉGUMES (DIVERSITÉ MAXIMUM):
❌ INTERDIT: Brocoli plus de 2x sur ${days} jours
✅ VARIE: Brocoli, haricots verts, courgettes, carottes, épinards, chou-fleur, poivrons, aubergines, tomates, salades

RÈGLES DE SIMPLICITÉ & PRATICITÉ:
1. Temps de préparation: MAX 20-30 minutes
2. Techniques simples: poêle, four, cuisson vapeur, bouillir (pas de sous-vide, rôtissage complexe)
3. Pas de recettes élaborées ou "gastronomiques"
4. Ingrédients faciles à trouver en supermarché français
5. Repas réalistes pour le quotidien (pas de "filet de bar aux asperges")

RÈGLES D'ASSAISONNEMENT & SAVEURS:
1. Ajoute TOUJOURS des épices/herbes: sel, poivre, ail, oignon, herbes de provence, curcuma, paprika, curry
2. Varie les modes de cuisson: grillé, poêlé, au four, vapeur
3. Inclus légumes variés CHAQUE repas principal (pas que brocoli!)
4. Desserts légers OBLIGATOIRES aux repas principaux: fruits frais, yaourt nature, fromage blanc, compote

RÈGLES ÉCONOMIQUES:
1. Respecte le budget ${dailyBudget}€/jour (~${monthlyBudget}€/mois)
2. Protéines chères (saumon, cabillaud, boeuf premium) = OCCASIONNEL
3. Base sur aliments économiques: poulet, oeufs, lentilles, riz, pâtes, pommes de terre
4. Légumes surgelés = OK et économiques
5. Fruits de saison = moins chers

EXEMPLES CONCRETS DE REPAS DIVERSIFIÉS PAR JOUR:

JOUR 1:
- Petit-déj: Flocons d'avoine (60g) + Lait (200ml) + Banane + Miel
- Collation: Pomme + Amandes (20g)
- Déjeuner: Poulet grillé (150g) + Riz basmati (80g sec) + Haricots verts (200g) + Yaourt nature
- Collation: Pain complet + Fromage blanc
- Dîner: Omelette 3 oeufs + Salade verte + Tomates + Fromage blanc + Kiwi

JOUR 2:
- Petit-déj: Pain complet (80g) + Beurre cacahuète (20g) + Confiture + Jus d'orange
- Collation: Banane + Cottage cheese
- Déjeuner: Boeuf haché 15% (150g) + Pâtes complètes (80g sec) + Courgettes + Compote
- Collation: Smoothie (lait + banane + avoine)
- Dîner: Dahl lentilles corail (100g sec) + Riz (60g) + Carottes + Épinards + Pomme

JOUR 3:
- Petit-déj: Yaourt nature (150g) + Granola (40g) + Fruits rouges + Miel
- Collation: Fruits secs (abricots + noix)
- Déjeuner: Porc (côtes, 150g) + Pommes de terre (200g) + Brocoli + Yaourt
- Collation: Pain + Avocat
- Dîner: Saumon grillé (130g) + Patates douces (150g) + Haricots verts + Banane

❌ EXEMPLES À ÉVITER:
- Omelette 4 jours de suite au petit-déj
- Yaourt grec + fruits à TOUTES les collations
- Brocoli à TOUS les repas
- Poulet tous les jours

STRUCTURE JSON À GÉNÉRER (${days} jours):
{"days":[{"day":1,"meals":[{"type":"Petit-déjeuner","name":"Nom du repas complet","ingredients":[{"name":"Aliment","quantity":100,"unit":"g","estimatedPrice":0.50}],"macros":{"calories":500,"protein":30,"carbs":50,"fats":15},"totalPrice":2.50,"prepTime":"15min"}],"totalMacros":{"calories":${macros.targetCalories},"protein":${macros.macros.protein.grams},"carbs":${macros.macros.carbs.grams},"fats":${macros.macros.fats.grams}},"totalPrice":${dailyBudget}}]}

Génère ${days} jours DIVERSIFIÉS, SIMPLES, ÉCONOMIQUES et RÉALISTES en JSON pur (pas de markdown):`;
    },

    /**
     * Générer avec Claude (Anthropic)
     * @param prompt
     * @param apiKey
     */
    async generateWithClaude(prompt, apiKey) {
        console.log('🧠 Génération avec Claude Haiku 3.5 (via proxy)...');

        try {
            // Utiliser le proxy local pour éviter CORS
            const proxyUrl = 'http://localhost:3002/api/claude';

            const response = await fetch(proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    apiKey: apiKey,
                    model: 'claude-3-5-haiku-20241022',
                    max_tokens: 8192,
                    temperature: 0.7,
                    messages: [{
                        role: 'user',
                        content: prompt
                    }]
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Erreur proxy Claude (${response.status}): ${error.error || error.details || 'Erreur inconnue'}`);
            }

            const data = await response.json();
            console.log('✅ Réponse Claude reçue via proxy');

            return data.content[0].text;
        } catch (error) {
            console.error('❌ Erreur Claude via proxy:', error);

            // Message d'erreur clair si le proxy n'est pas démarré
            if (error.message.includes('Failed to fetch')) {
                throw new Error('❌ Proxy Claude non démarré ! Lancez: start-claude-proxy.bat');
            }

            throw new Error(`Erreur API Claude: ${error.message}`);
        }
    },

    /**
     * Générer avec DeepSeek (compatible OpenAI API)
     * @param prompt
     * @param apiKey
     */
    async generateWithDeepSeek(prompt, apiKey) {
        console.log('🧠 Génération avec DeepSeek...');

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{
                    role: 'system',
                    content: 'Tu es un nutritionniste sportif expert. Tu réponds UNIQUEMENT en JSON valide, sans texte supplémentaire.'
                }, {
                    role: 'user',
                    content: prompt
                }],
                temperature: 0.7,
                max_tokens: 8192,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur DeepSeek API: ${response.status} - ${error}`);
        }

        const data = await response.json();
        console.log('✅ Réponse DeepSeek reçue');

        return data.choices[0].message.content;
    },

    /**
     * Générer avec OpenAI
     * @param prompt
     * @param apiKey
     */
    async generateWithOpenAI(prompt, apiKey) {
        console.log('🧠 Génération avec OpenAI...');

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4-turbo-preview',
                messages: [{
                    role: 'system',
                    content: 'Tu es un nutritionniste sportif expert. Tu réponds UNIQUEMENT en JSON valide, sans texte supplémentaire.'
                }, {
                    role: 'user',
                    content: prompt
                }],
                temperature: 0.7,
                max_tokens: 4096,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur OpenAI API: ${response.status} - ${error}`);
        }

        const data = await response.json();
        console.log('✅ Réponse OpenAI reçue');

        return data.choices[0].message.content;
    },

    /**
     * Parser et valider la réponse de l'IA
     * @param response
     * @param expectedDays
     * @param macros
     */
    parseMealPlanResponse(response, expectedDays, macros) {
        try {
            // Nettoyer la réponse (parfois l'IA ajoute du texte)
            let jsonText = response.trim();

            // Extraire le JSON si entouré de texte
            const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jsonText = jsonMatch[0];
            }

            const mealPlan = JSON.parse(jsonText);

            // Validation de base
            if (!mealPlan.days || !Array.isArray(mealPlan.days)) {
                throw new Error('Format de réponse invalide: "days" manquant');
            }

            if (mealPlan.days.length !== expectedDays) {
                console.warn(`⚠️ Nombre de jours incorrect: ${mealPlan.days.length} au lieu de ${expectedDays}`);
            }

            // Valider chaque jour
            mealPlan.days.forEach((day, index) => {
                if (!day.meals || !Array.isArray(day.meals)) {
                    throw new Error(`Jour ${index + 1}: "meals" manquant ou invalide`);
                }

                // Vérifier que chaque repas a les champs requis
                day.meals.forEach((meal, mealIndex) => {
                    if (!meal.type || !meal.name || !meal.ingredients || !meal.macros) {
                        throw new Error(`Jour ${index + 1}, Repas ${mealIndex + 1}: champs manquants`);
                    }
                });

                // Calculer les totaux si non présents
                if (!day.totalMacros) {
                    day.totalMacros = day.meals.reduce((total, meal) => ({
                        calories: total.calories + meal.macros.calories,
                        protein: total.protein + meal.macros.protein,
                        carbs: total.carbs + meal.macros.carbs,
                        fats: total.fats + meal.macros.fats
                    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
                }

                // CORRECTION AUTOMATIQUE : Ajuster les quantités pour respecter les macros
                const targetCal = macros.targetCalories;
                const targetProtein = macros.macros.protein.grams;
                const targetCarbs = macros.macros.carbs.grams;
                const targetFats = macros.macros.fats.grams;

                const actualCal = day.totalMacros.calories;
                const actualProtein = day.totalMacros.protein;
                const actualCarbs = day.totalMacros.carbs;
                const actualFats = day.totalMacros.fats;

                const diff = Math.abs(actualCal - targetCal);
                const percentDiff = (diff / targetCal) * 100;

                // Si l'écart est supérieur à 5%, on corrige
                if (percentDiff > 5) {
                    console.warn(`⚠️ Jour ${index + 1}: Correction nécessaire ! Cible: ${targetCal}kcal, Réel: ${actualCal}kcal (${percentDiff.toFixed(1)}%)`);

                    // Appliquer la correction
                    this.adjustMealsToTargetMacros(day, {
                        calories: targetCal,
                        protein: targetProtein,
                        carbs: targetCarbs,
                        fats: targetFats
                    });

                    console.log(`✅ Jour ${index + 1}: Corrigé à ${day.totalMacros.calories}kcal`);
                } else {
                    console.log(`✅ Jour ${index + 1}: Macros OK (${actualCal}kcal vs ${targetCal}kcal cible)`);
                }
            });

            console.log('✅ Plan validé:', {
                days: mealPlan.days.length,
                totalMeals: mealPlan.days.reduce((sum, d) => sum + d.meals.length, 0)
            });

            return mealPlan;

        } catch (error) {
            console.error('❌ Erreur parsing:', error);
            throw new Error(`Impossible de parser la réponse de l'IA: ${error.message}`);
        }
    },

    /**
     * Ajuster les repas pour atteindre exactement les macros cibles
     * @param day
     * @param targetMacros
     */
    adjustMealsToTargetMacros(day, targetMacros) {
        // Calculer les facteurs de correction pour chaque macro
        const proteinRatio = targetMacros.protein / day.totalMacros.protein;
        const carbsRatio = targetMacros.carbs / day.totalMacros.carbs;
        const fatsRatio = targetMacros.fats / day.totalMacros.fats;

        console.log('🔧 Ratios de correction:', {
            protein: proteinRatio.toFixed(2),
            carbs: carbsRatio.toFixed(2),
            fats: fatsRatio.toFixed(2)
        });

        // Appliquer les corrections à chaque repas proportionnellement
        day.meals.forEach((meal, mealIndex) => {
            // Sauvegarder les valeurs originales pour info
            const originalMacros = { ...meal.macros };

            // Ajuster les macros du repas
            meal.macros.protein = Math.round(meal.macros.protein * proteinRatio);
            meal.macros.carbs = Math.round(meal.macros.carbs * carbsRatio);
            meal.macros.fats = Math.round(meal.macros.fats * fatsRatio);

            // Recalculer les calories
            meal.macros.calories = (meal.macros.protein * 4) + (meal.macros.carbs * 4) + (meal.macros.fats * 9);

            // Ajuster les quantités des ingrédients proportionnellement
            if (meal.ingredients && meal.ingredients.length > 0) {
                // Calculer le facteur moyen de correction
                const avgRatio = (proteinRatio + carbsRatio + fatsRatio) / 3;

                meal.ingredients.forEach(ingredient => {
                    ingredient.quantity = Math.round(ingredient.quantity * avgRatio);
                });
            }

            console.log(`  Repas ${mealIndex + 1} (${meal.type}): ${originalMacros.calories}kcal → ${meal.macros.calories}kcal`);
        });

        // Recalculer les totaux
        day.totalMacros = day.meals.reduce((total, meal) => ({
            calories: total.calories + meal.macros.calories,
            protein: total.protein + meal.macros.protein,
            carbs: total.carbs + meal.macros.carbs,
            fats: total.fats + meal.macros.fats
        }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

        // Ajustement final pour éliminer les erreurs d'arrondi
        const calorieDiff = targetMacros.calories - day.totalMacros.calories;
        if (Math.abs(calorieDiff) > 0) {
            // Ajouter/retirer les calories manquantes au dernier repas (généralement le dîner)
            const lastMeal = day.meals[day.meals.length - 1];
            if (calorieDiff > 0) {
                // Ajouter des glucides (4 kcal/g)
                const carbsToAdd = Math.ceil(calorieDiff / 4);
                lastMeal.macros.carbs += carbsToAdd;
                lastMeal.macros.calories += carbsToAdd * 4;
                day.totalMacros.carbs += carbsToAdd;
                day.totalMacros.calories += carbsToAdd * 4;
            } else {
                // Retirer des glucides
                const carbsToRemove = Math.ceil(Math.abs(calorieDiff) / 4);
                lastMeal.macros.carbs = Math.max(0, lastMeal.macros.carbs - carbsToRemove);
                lastMeal.macros.calories = Math.max(0, lastMeal.macros.calories - carbsToRemove * 4);
                day.totalMacros.carbs = Math.max(0, day.totalMacros.carbs - carbsToRemove);
                day.totalMacros.calories = Math.max(0, day.totalMacros.calories - carbsToRemove * 4);
            }

            console.log(`🎯 Ajustement final: ${calorieDiff > 0 ? '+' : ''}${calorieDiff}kcal`);
        }

        console.log('✅ Totaux finaux:', day.totalMacros);
    },

    /**
     * Déterminer les types de repas selon le nombre
     * @param mealsPerDay
     */
    getMealTypesByCount(mealsPerDay) {
        const mealConfigs = {
            3: ['Petit-déjeuner', 'Déjeuner', 'Dîner'],
            4: ['Petit-déjeuner', 'Déjeuner', 'Collation', 'Dîner'],
            5: ['Petit-déjeuner', 'Collation matin', 'Déjeuner', 'Collation après-midi', 'Dîner'],
            6: ['Petit-déjeuner', 'Collation matin', 'Déjeuner', 'Collation après-midi', 'Dîner', 'Collation soir']
        };
        return mealConfigs[mealsPerDay] || mealConfigs[4];
    },

    /**
     * Générer la liste de courses pour le plan AVEC PRIX
     * @param mealPlan
     */
    generateShoppingList(mealPlan) {
        const ingredients = new Map();
        let totalCost = 0;

        // Agréger tous les ingrédients
        mealPlan.days.forEach(day => {
            day.meals.forEach(meal => {
                meal.ingredients.forEach(ing => {
                    const key = `${ing.name.toLowerCase()}_${ing.unit}`;

                    if (ingredients.has(key)) {
                        const existing = ingredients.get(key);
                        existing.quantity += ing.quantity;
                    } else {
                        ingredients.set(key, {
                            name: ing.name,
                            quantity: ing.quantity,
                            unit: ing.unit
                        });
                    }
                });
            });
        });

        // Convertir en tableau et calculer les prix avec FoodPrices
        const list = Array.from(ingredients.values()).map(ing => {
            // Récupérer le prix depuis FoodPrices
            const foodData = window.FoodPrices ? window.FoodPrices.getPrice(ing.name) : { price: 5.0, unit: 'kg' };

            // Convertir la quantité en kg pour calculer le coût
            let quantityInKg = ing.quantity / 1000; // Par défaut en grammes
            if (ing.unit === 'L' || ing.unit === 'l') {
                quantityInKg = ing.quantity; // Les liquides sont déjà en L
            } else if (ing.unit === 'unité' || ing.unit === 'unités') {
                quantityInKg = ing.quantity / 12; // Pour les oeufs par exemple
            }

            // Prix au kilo
            const pricePerKg = foodData.price;

            // Prix total pour cette quantité
            const itemTotalPrice = pricePerKg * quantityInKg;
            totalCost += itemTotalPrice;

            return {
                name: ing.name,
                quantity: Math.round(ing.quantity),
                unit: ing.unit,
                pricePerKg: Math.round(pricePerKg * 100) / 100,
                totalPrice: Math.round(itemTotalPrice * 100) / 100
            };
        }).sort((a, b) => a.name.localeCompare(b.name));

        const categorized = this.categorizeIngredients(list);

        // Ajouter le coût total
        return {
            categories: categorized,
            totalCost: Math.round(totalCost * 100) / 100,
            itemCount: list.length
        };
    },

    /**
     * Catégoriser les ingrédients par rayon
     * @param ingredients
     */
    categorizeIngredients(ingredients) {
        const categories = {
            'Fruits & Légumes': [],
            'Viandes & Poissons': [],
            'Produits laitiers': [],
            'Féculents & Céréales': [],
            'Épicerie': [],
            'Autres': []
        };

        const keywords = {
            'Fruits & Légumes': ['fruit', 'légume', 'salade', 'tomate', 'pomme', 'banane', 'carotte', 'brocoli', 'épinard', 'orange', 'fraise'],
            'Viandes & Poissons': ['poulet', 'boeuf', 'porc', 'poisson', 'saumon', 'thon', 'dinde', 'jambon', 'steak', 'filet'],
            'Produits laitiers': ['lait', 'yaourt', 'fromage', 'beurre', 'crème', 'whey', 'protéine'],
            'Féculents & Céréales': ['riz', 'pâtes', 'pain', 'flocon', 'avoine', 'quinoa', 'pomme de terre', 'patate']
        };

        ingredients.forEach(ing => {
            let categorized = false;
            const nameLower = ing.name.toLowerCase();

            for (const [category, words] of Object.entries(keywords)) {
                if (words.some(word => nameLower.includes(word))) {
                    categories[category].push(ing);
                    categorized = true;
                    break;
                }
            }

            if (!categorized) {
                categories['Épicerie'].push(ing);
            }
        });

        // Filtrer les catégories vides
        return Object.fromEntries(
            Object.entries(categories).filter(([_, items]) => items.length > 0)
        );
    },

    /**
     * Calculer l'âge à partir de la date de naissance
     * @param birthdate
     */
    calculateAge(birthdate) {
        if (!birthdate) {return 30;} // Valeur par défaut

        const birth = new Date(birthdate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    }
};

// Exposer globalement
window.NutritionAIGenerator = NutritionAIGenerator;
