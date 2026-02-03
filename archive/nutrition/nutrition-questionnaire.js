/**
 * NUTRITION QUESTIONNAIRE
 * Évaluation complète des habitudes, préférences, contraintes
 */

const NutritionQuestionnaire = {
    /**
     * Questions structurées par catégorie
     */
    QUESTIONS: {
        // ==================== HABITUDES ALIMENTAIRES ====================
        eatingHabits: {
            title: '🍽️ Habitudes alimentaires',
            questions: [
                {
                    id: 'meals_per_day_current',
                    type: 'select',
                    question: 'Combien de repas prenez-vous actuellement par jour ?',
                    options: [
                        { value: '1-2', label: '1-2 repas' },
                        { value: '3', label: '3 repas' },
                        { value: '4-5', label: '4-5 repas' },
                        { value: '6+', label: '6+ repas (snacking)' }
                    ],
                    weight: 1.0
                },
                {
                    id: 'breakfast_habit',
                    type: 'radio',
                    question: 'Prenez-vous un petit-déjeuner ?',
                    options: [
                        { value: 'always', label: 'Toujours', score: 10 },
                        { value: 'sometimes', label: 'Parfois', score: 5 },
                        { value: 'never', label: 'Jamais (jeûne intermittent)', score: 0 }
                    ],
                    weight: 0.8
                },
                {
                    id: 'meal_prep',
                    type: 'radio',
                    question: 'Préparez-vous vos repas à l\'avance ?',
                    options: [
                        { value: 'always', label: 'Oui, systématiquement (meal prep)', score: 10 },
                        { value: 'sometimes', label: 'Occasionnellement', score: 5 },
                        { value: 'never', label: 'Jamais, cuisine quotidienne', score: 3 },
                        { value: 'takeaway', label: 'Principalement plats à emporter', score: 0 }
                    ],
                    weight: 1.2
                },
                {
                    id: 'eating_out_frequency',
                    type: 'select',
                    question: 'Combien de fois mangez-vous au restaurant/fast-food par semaine ?',
                    options: [
                        { value: '0', label: 'Jamais', score: 10 },
                        { value: '1-2', label: '1-2 fois', score: 7 },
                        { value: '3-5', label: '3-5 fois', score: 4 },
                        { value: '6+', label: '6+ fois', score: 0 }
                    ],
                    weight: 1.0
                },
                {
                    id: 'snacking_habit',
                    type: 'radio',
                    question: 'Grignotez-vous entre les repas ?',
                    options: [
                        { value: 'never', label: 'Non, repas structurés seulement', score: 10 },
                        { value: 'healthy', label: 'Oui, collations saines (fruits, noix)', score: 8 },
                        { value: 'sometimes', label: 'Parfois, variable', score: 5 },
                        { value: 'frequent', label: 'Fréquemment (sucré/salé)', score: 0 }
                    ],
                    weight: 0.9
                }
            ]
        },

        // ==================== CONNAISSANCES NUTRITIONNELLES ====================
        knowledge: {
            title: '🧠 Connaissances nutritionnelles',
            questions: [
                {
                    id: 'macro_tracking',
                    type: 'radio',
                    question: 'Suivez-vous vos macronutriments (protéines, glucides, lipides) ?',
                    options: [
                        { value: 'daily', label: 'Oui, quotidiennement (MyFitnessPal, etc.)', score: 10 },
                        { value: 'sometimes', label: 'Occasionnellement', score: 5 },
                        { value: 'never', label: 'Non, jamais', score: 0 }
                    ],
                    weight: 1.5
                },
                {
                    id: 'nutrition_knowledge_level',
                    type: 'radio',
                    question: 'Comment évaluez-vous vos connaissances en nutrition ?',
                    options: [
                        { value: 'expert', label: 'Expert (études, professionnel)', score: 10 },
                        { value: 'advanced', label: 'Avancé (lecture, expérience)', score: 8 },
                        { value: 'intermediate', label: 'Intermédiaire (bases solides)', score: 5 },
                        { value: 'beginner', label: 'Débutant (peu de connaissances)', score: 2 }
                    ],
                    weight: 1.0
                },
                {
                    id: 'read_labels',
                    type: 'radio',
                    question: 'Lisez-vous les étiquettes nutritionnelles ?',
                    options: [
                        { value: 'always', label: 'Toujours', score: 10 },
                        { value: 'sometimes', label: 'Parfois', score: 5 },
                        { value: 'never', label: 'Jamais', score: 0 }
                    ],
                    weight: 0.8
                }
            ]
        },

        // ==================== CONTRAINTES ====================
        constraints: {
            title: '⏰ Contraintes & Disponibilité',
            questions: [
                {
                    id: 'cooking_time',
                    type: 'select',
                    question: 'Combien de temps pouvez-vous consacrer à la cuisine par jour ?',
                    options: [
                        { value: '0-15', label: '0-15 min (très peu)', complexity: 'very_low' },
                        { value: '15-30', label: '15-30 min (rapide)', complexity: 'low' },
                        { value: '30-60', label: '30-60 min (moyen)', complexity: 'medium' },
                        { value: '60+', label: '60+ min (beaucoup)', complexity: 'high' }
                    ],
                    weight: 1.5
                },
                {
                    id: 'cooking_skill',
                    type: 'radio',
                    question: 'Quel est votre niveau de compétence culinaire ?',
                    options: [
                        { value: 'beginner', label: 'Débutant (pâtes, riz basique)', complexity: 'very_low' },
                        { value: 'intermediate', label: 'Intermédiaire (recettes simples)', complexity: 'low' },
                        { value: 'advanced', label: 'Avancé (cuisine variée)', complexity: 'medium' },
                        { value: 'expert', label: 'Expert (maîtrise totale)', complexity: 'high' }
                    ],
                    weight: 1.2
                },
                {
                    id: 'budget',
                    type: 'select',
                    question: 'Quel est votre budget alimentaire hebdomadaire ?',
                    options: [
                        { value: 'very_low', label: '< 30€/semaine', cost: 'very_low' },
                        { value: 'low', label: '30-50€/semaine', cost: 'low' },
                        { value: 'medium', label: '50-80€/semaine', cost: 'medium' },
                        { value: 'high', label: '80-120€/semaine', cost: 'high' },
                        { value: 'very_high', label: '> 120€/semaine', cost: 'very_high' }
                    ],
                    weight: 1.3
                },
                {
                    id: 'uses_supplements',
                    type: 'radio',
                    question: 'Utilisez-vous des compléments alimentaires ?',
                    options: [
                        { value: 'yes', label: 'Oui, régulièrement', usesSupplements: true },
                        { value: 'sometimes', label: 'Occasionnellement', usesSupplements: true },
                        { value: 'no', label: 'Non', usesSupplements: false }
                    ],
                    weight: 1.0
                },
                {
                    id: 'work_schedule',
                    type: 'radio',
                    question: 'Quel est votre type d\'horaires de travail ?',
                    options: [
                        { value: 'regular', label: 'Réguliers (9h-18h)', schedule: 'regular' },
                        { value: 'irregular', label: 'Irréguliers/décalés', schedule: 'irregular' },
                        { value: 'night', label: 'Nuit', schedule: 'night' },
                        { value: 'flexible', label: 'Flexible/autonome', schedule: 'flexible' }
                    ],
                    weight: 1.0
                },
                {
                    id: 'family_situation',
                    type: 'radio',
                    question: 'Situation familiale ?',
                    options: [
                        { value: 'alone', label: 'Seul(e)', prep: 'individual' },
                        { value: 'couple', label: 'En couple', prep: 'couple' },
                        { value: 'family', label: 'Famille (enfants)', prep: 'family' }
                    ],
                    weight: 0.8
                }
            ]
        },

        // ==================== COMPLÉMENTS ALIMENTAIRES ====================
        supplements: {
            title: '💊 Compléments alimentaires',
            questions: [
                {
                    id: 'supplement_whey',
                    type: 'checkbox',
                    question: 'Whey Protein (Protéine de lactosérum)',
                    default: false,
                    weight: 0.5
                },
                {
                    id: 'supplement_creatine',
                    type: 'checkbox',
                    question: 'Créatine',
                    default: false,
                    weight: 0.5
                },
                {
                    id: 'supplement_omega3',
                    type: 'checkbox',
                    question: 'Oméga-3 (EPA/DHA)',
                    default: false,
                    weight: 0.5
                },
                {
                    id: 'supplement_vitaminD',
                    type: 'checkbox',
                    question: 'Vitamine D3',
                    default: false,
                    weight: 0.5
                },
                {
                    id: 'supplement_preworkout',
                    type: 'checkbox',
                    question: 'Pré-workout',
                    default: false,
                    weight: 0.5
                },
                {
                    id: 'supplement_bcaa',
                    type: 'checkbox',
                    question: 'BCAA',
                    default: false,
                    weight: 0.5
                },
                {
                    id: 'supplement_magnesium',
                    type: 'checkbox',
                    question: 'Magnésium',
                    default: false,
                    weight: 0.5
                },
                {
                    id: 'supplement_multivitamin',
                    type: 'checkbox',
                    question: 'Multivitamines',
                    default: false,
                    weight: 0.5
                },
                {
                    id: 'supplement_timing_preference',
                    type: 'text',
                    question: 'Moments préférés pour les prendre (ex: matin, pré-workout, post-workout, soir)',
                    placeholder: 'Ex: Whey post-workout, Oméga-3 matin et soir',
                    weight: 0.3
                }
            ]
        },

        // ==================== PRÉFÉRENCES ALIMENTAIRES ====================
        preferences: {
            title: '🎯 Préférences alimentaires',
            questions: [
                {
                    id: 'food_variety',
                    type: 'radio',
                    question: 'Aimez-vous varier vos repas ou préférez-vous manger la même chose ?',
                    options: [
                        { value: 'variety', label: 'J\'aime varier (nouveaux plats)', variety: 'high' },
                        { value: 'moderate', label: 'Un peu de variation', variety: 'medium' },
                        { value: 'routine', label: 'Je préfère la routine', variety: 'low' }
                    ],
                    weight: 1.0
                },
                {
                    id: 'taste_preference',
                    type: 'multiselect',
                    question: 'Quels types de cuisine préférez-vous ? (plusieurs choix possibles)',
                    options: [
                        { value: 'french', label: 'Française' },
                        { value: 'italian', label: 'Italienne' },
                        { value: 'asian', label: 'Asiatique' },
                        { value: 'mexican', label: 'Mexicaine' },
                        { value: 'american', label: 'Américaine' },
                        { value: 'healthy', label: 'Healthy/Fitness' },
                        { value: 'vegetarian', label: 'Végétarienne' }
                    ],
                    weight: 0.8
                },
                {
                    id: 'spicy_tolerance',
                    type: 'slider',
                    question: 'Tolérance au piquant ?',
                    min: 0,
                    max: 10,
                    default: 5,
                    labels: { 0: 'Aucun', 5: 'Moyen', 10: 'Très épicé' },
                    weight: 0.5
                },
                {
                    id: 'sweet_tooth',
                    type: 'radio',
                    question: 'Avez-vous une tendance sucrée ?',
                    options: [
                        { value: 'high', label: 'Oui, j\'adore le sucré', craving: 'high' },
                        { value: 'moderate', label: 'Modérée', craving: 'moderate' },
                        { value: 'low', label: 'Non, préfère salé', craving: 'low' }
                    ],
                    weight: 0.9
                }
            ]
        },

        // ==================== HISTORIQUE & EXPÉRIENCE ====================
        history: {
            title: '📊 Historique & Expérience',
            questions: [
                {
                    id: 'previous_diets',
                    type: 'multiselect',
                    question: 'Avez-vous déjà suivi ces régimes ? (plusieurs choix)',
                    options: [
                        { value: 'keto', label: 'Cétogène (keto)' },
                        { value: 'paleo', label: 'Paléo' },
                        { value: 'intermittent_fasting', label: 'Jeûne intermittent' },
                        { value: 'low_carb', label: 'Low carb' },
                        { value: 'vegan', label: 'Vegan/Végétarien' },
                        { value: 'iifym', label: 'IIFYM (Flexible dieting)' },
                        { value: 'none', label: 'Aucun régime spécifique' }
                    ],
                    weight: 1.0
                },
                {
                    id: 'diet_success',
                    type: 'radio',
                    question: 'Ces expériences ont-elles été couronnées de succès ?',
                    options: [
                        { value: 'yes', label: 'Oui, résultats atteints', score: 10 },
                        { value: 'partial', label: 'Partiellement', score: 5 },
                        { value: 'no', label: 'Non, abandon/échec', score: 0 },
                        { value: 'na', label: 'N/A (jamais fait de régime)', score: 5 }
                    ],
                    weight: 0.8
                },
                {
                    id: 'yo_yo_dieting',
                    type: 'radio',
                    question: 'Êtes-vous en cycle yo-yo (perte/reprise de poids répétée) ?',
                    options: [
                        { value: 'yes', label: 'Oui, fréquemment', risk: 'high' },
                        { value: 'sometimes', label: 'Parfois', risk: 'medium' },
                        { value: 'no', label: 'Non', risk: 'low' }
                    ],
                    weight: 1.2
                },
                {
                    id: 'weight_change_6months',
                    type: 'text',
                    question: 'Évolution du poids sur les 6 derniers mois ? (kg)',
                    placeholder: 'Ex: -5 (perte) ou +3 (gain)',
                    weight: 1.0
                }
            ]
        },

        // ==================== MOTIVATION & OBJECTIFS ====================
        motivation: {
            title: '🎯 Motivation & Objectifs',
            questions: [
                {
                    id: 'motivation_level',
                    type: 'slider',
                    question: 'Quel est votre niveau de motivation actuel ?',
                    min: 0,
                    max: 10,
                    default: 7,
                    labels: { 0: 'Très faible', 5: 'Moyen', 10: 'Très élevé' },
                    weight: 1.5
                },
                {
                    id: 'main_goal',
                    type: 'radio',
                    question: 'Objectif principal actuel ?',
                    options: [
                        { value: 'performance', label: 'Performance sportive' },
                        { value: 'aesthetic', label: 'Esthétique (physique)' },
                        { value: 'health', label: 'Santé générale' },
                        { value: 'well_being', label: 'Bien-être' }
                    ],
                    weight: 1.3
                },
                {
                    id: 'timeline',
                    type: 'select',
                    question: 'Dans quel délai souhaitez-vous atteindre vos objectifs ?',
                    options: [
                        { value: 'urgent', label: '< 1 mois (urgent)', pace: 'very_fast' },
                        { value: 'short', label: '1-3 mois', pace: 'fast' },
                        { value: 'medium', label: '3-6 mois', pace: 'moderate' },
                        { value: 'long', label: '6-12 mois', pace: 'slow' },
                        { value: 'lifestyle', label: '> 1 an (mode de vie)', pace: 'lifestyle' }
                    ],
                    weight: 1.0
                },
                {
                    id: 'commitment_level',
                    type: 'radio',
                    question: 'Quel niveau d\'engagement êtes-vous prêt(e) à adopter ?',
                    options: [
                        { value: 'flexible', label: 'Flexible (80/20)', adherence: 'flexible' },
                        { value: 'moderate', label: 'Modéré (90/10)', adherence: 'moderate' },
                        { value: 'strict', label: 'Strict (100%)', adherence: 'strict' }
                    ],
                    weight: 1.4
                }
            ]
        }
    },

    /**
     * Analyser les réponses et générer un profil complet
     * @param responses
     */
    analyzeResponses(responses) {
        const profile = {
            scores: {},
            recommendations: [],
            warnings: [],
            adaptations: {}
        };

        // 1. Calculer les scores par catégorie
        Object.entries(this.QUESTIONS).forEach(([category, data]) => {
            let categoryScore = 0;
            let totalWeight = 0;

            data.questions.forEach(q => {
                const response = responses[q.id];
                if (!response) {return;}

                const option = q.options?.find(opt => opt.value === response);
                if (option && option.score !== undefined) {
                    categoryScore += option.score * q.weight;
                    totalWeight += 10 * q.weight; // Max score = 10
                }
            });

            profile.scores[category] = totalWeight > 0 ?
                Math.round((categoryScore / totalWeight) * 100) : 0;
        });

        // 2. Score global
        profile.overallScore = Math.round(
            Object.values(profile.scores).reduce((a, b) => a + b, 0) / Object.keys(profile.scores).length
        );

        // 3. Déterminer le niveau d'autonomie
        profile.autonomyLevel = this.determineAutonomyLevel(profile.scores);

        // 4. Adaptations du plan
        profile.adaptations = this.generateAdaptations(responses);

        // 5. Recommandations personnalisées
        profile.recommendations = this.generateRecommendations(profile, responses);

        // 6. Alertes et avertissements
        profile.warnings = this.generateWarnings(profile, responses);

        return profile;
    },

    /**
     * Déterminer le niveau d'autonomie
     * @param scores
     */
    determineAutonomyLevel(scores) {
        const knowledgeScore = scores.knowledge || 0;
        const habitsScore = scores.eatingHabits || 0;
        const avgScore = (knowledgeScore + habitsScore) / 2;

        if (avgScore >= 80) {
            return {
                level: 'expert',
                label: 'Expert - Autonomie complète',
                guidance: 'low',
                description: 'Vous avez d\'excellentes connaissances et habitudes. Plan flexible recommandé.'
            };
        } else if (avgScore >= 60) {
            return {
                level: 'intermediate',
                label: 'Intermédiaire - Autonomie partielle',
                guidance: 'medium',
                description: 'Bonnes bases. Plan semi-structuré avec éducation continue.'
            };
        } else {
            return {
                level: 'beginner',
                label: 'Débutant - Guidance complète',
                guidance: 'high',
                description: 'Plan très structuré avec explications détaillées recommandé.'
            };
        }
    },

    /**
     * Générer les adaptations du plan
     * @param responses
     */
    generateAdaptations(responses) {
        const adaptations = {};

        // Temps de cuisine
        const cookingTime = responses.cooking_time;
        if (cookingTime === '0-15') {
            adaptations.mealComplexity = 'very_simple';
            adaptations.prepStrategy = 'quick_meals';
            adaptations.note = 'Recettes ultra-rapides (<15min) privilégiées';
        } else if (cookingTime === '15-30') {
            adaptations.mealComplexity = 'simple';
            adaptations.prepStrategy = 'meal_prep';
        } else {
            adaptations.mealComplexity = 'varied';
            adaptations.prepStrategy = 'flexible';
        }

        // Budget
        const budget = responses.budget;
        adaptations.budget = budget;
        adaptations.ingredientCost = budget;

        // Variété
        const variety = responses.food_variety;
        adaptations.mealVariety = variety === 'routine' ? 'low' : variety === 'variety' ? 'high' : 'medium';

        // Horaires
        const schedule = responses.work_schedule;
        if (schedule === 'night') {
            adaptations.mealTiming = 'reversed'; // Inverser timing
            adaptations.note = (adaptations.note || '') + ' | Timing inversé pour travail de nuit';
        } else if (schedule === 'irregular') {
            adaptations.mealTiming = 'flexible';
            adaptations.note = (adaptations.note || '') + ' | Planning flexible recommandé';
        }

        // Tracking
        const tracking = responses.macro_tracking;
        adaptations.needsEducation = tracking === 'never';
        if (tracking === 'never') {
            adaptations.note = (adaptations.note || '') + ' | Guide tracking inclus';
        }

        return adaptations;
    },

    /**
     * Générer les recommandations
     * @param profile
     * @param responses
     */
    generateRecommendations(profile, responses) {
        const recs = [];

        // Habitudes
        if (profile.scores.eatingHabits < 50) {
            recs.push({
                priority: 'high',
                category: 'Habitudes',
                title: 'Améliorer les habitudes alimentaires',
                description: 'Focus sur la structure des repas et réduction fast-food',
                actions: [
                    'Commencer par 3 repas structurés par jour',
                    'Préparer minimum 2 repas à l\'avance (dimanche)',
                    'Limiter les sorties restaurant à 1-2x/semaine'
                ]
            });
        }

        // Connaissances
        if (profile.scores.knowledge < 60) {
            recs.push({
                priority: 'medium',
                category: 'Éducation',
                title: 'Développer les connaissances nutritionnelles',
                description: 'Apprentissage des bases macro/micro',
                actions: [
                    'Lire les étiquettes nutritionnelles systématiquement',
                    'Utiliser MyFitnessPal pendant 2 semaines (apprentissage)',
                    'Suivre le guide nutritionnel fourni'
                ]
            });
        }

        // Yo-yo
        if (responses.yo_yo_dieting === 'yes') {
            recs.push({
                priority: 'high',
                category: 'Approche',
                title: '⚠️ Éviter le cycle yo-yo',
                description: 'Approche progressive et durable essentielle',
                actions: [
                    'Déficit modéré uniquement (-300 à -500 kcal)',
                    'Éviter les restrictions extrêmes',
                    'Focus sur le maintien après objectif atteint',
                    'Suivi psychologique si difficultés émotionnelles'
                ]
            });
        }

        // Motivation
        const motivation = parseInt(responses.motivation_level) || 5;
        if (motivation < 5) {
            recs.push({
                priority: 'high',
                category: 'Motivation',
                title: 'Booster la motivation',
                description: 'Motivation faible détectée',
                actions: [
                    'Commencer par 1-2 changements simples',
                    'Fixer des objectifs à court terme (2 semaines)',
                    'Tracker les progrès visuellement',
                    'Trouver un partenaire d\'accountability'
                ]
            });
        }

        return recs;
    },

    /**
     * Générer les avertissements
     * @param profile
     * @param responses
     */
    generateWarnings(profile, responses) {
        const warnings = [];

        // Engagement vs Timeline
        const timeline = responses.timeline;
        const commitment = responses.commitment_level;

        if (timeline === 'urgent' && commitment === 'flexible') {
            warnings.push({
                level: 'high',
                message: '⚠️ Incohérence : Objectif urgent mais engagement flexible',
                recommendation: 'Soit rallonger le délai (3 mois), soit augmenter l\'engagement'
            });
        }

        // Budget très serré
        if (responses.budget === 'very_low') {
            warnings.push({
                level: 'medium',
                message: '⚠️ Budget limité détecté',
                recommendation: 'Plan optimisé coût inclus (œufs, poulet, riz, légumes congelés)'
            });
        }

        // Compétences culinaires faibles + temps limité
        if (responses.cooking_skill === 'beginner' && responses.cooking_time === '0-15') {
            warnings.push({
                level: 'medium',
                message: '⚠️ Compétences limitées + temps restreint',
                recommendation: 'Meal prep le weekend essentiel. Recettes ultra-simples fournies.'
            });
        }

        return warnings;
    },

    /**
     * Générer un rapport HTML du questionnaire
     * @param profile
     * @param responses
     */
    generateReport(profile, responses) {
        return `
            <div class="questionnaire-report premium-card">
                <h2 class="text-2xl font-bold text-green-400 mb-6">
                    📊 Profil Nutritionnel Complet
                </h2>

                <!-- Score global -->
                <div class="mb-6 text-center">
                    <div class="text-6xl font-bold text-green-400 mb-2">${profile.overallScore}%</div>
                    <p class="text-gray-400">Score global de préparation</p>
                </div>

                <!-- Scores par catégorie -->
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    ${Object.entries(profile.scores).map(([cat, score]) => `
                        <div class="bg-wood-dark bg-opacity-50 rounded-lg p-4 text-center">
                            <div class="text-3xl font-bold ${score >= 70 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'}">
                                ${score}%
                            </div>
                            <div class="text-sm text-gray-400 mt-2">${this.QUESTIONS[cat].title}</div>
                        </div>
                    `).join('')}
                </div>

                <!-- Niveau d'autonomie -->
                <div class="premium-card bg-gradient-to-r from-green-900/30 to-green-800/20 border border-green-600/30 mb-6">
                    <h3 class="text-xl font-bold text-green-400 mb-3">
                        ${profile.autonomyLevel.label}
                    </h3>
                    <p class="text-gray-300">${profile.autonomyLevel.description}</p>
                </div>

                <!-- Recommandations -->
                ${profile.recommendations.length > 0 ? `
                    <div class="mb-6">
                        <h3 class="text-xl font-bold text-white mb-4">📌 Recommandations prioritaires</h3>
                        <div class="space-y-3">
                            ${profile.recommendations.map(rec => `
                                <div class="bg-wood-dark bg-opacity-50 rounded-lg p-4 border-l-4 ${
    rec.priority === 'high' ? 'border-red-400' :
        rec.priority === 'medium' ? 'border-yellow-400' :
            'border-blue-400'
}">
                                    <div class="flex items-start gap-3">
                                        <div class="flex-1">
                                            <h4 class="font-bold text-white mb-1">${rec.title}</h4>
                                            <p class="text-sm text-gray-400 mb-2">${rec.description}</p>
                                            <ul class="text-sm text-gray-300 space-y-1">
                                                ${rec.actions.map(action => `
                                                    <li>• ${action}</li>
                                                `).join('')}
                                            </ul>
                                        </div>
                                        <span class="px-2 py-1 rounded text-xs font-bold ${
    rec.priority === 'high' ? 'bg-red-900/30 text-red-400' :
        rec.priority === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
            'bg-blue-900/30 text-blue-400'
}">
                                            ${rec.priority.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Avertissements -->
                ${profile.warnings.length > 0 ? `
                    <div class="mb-6">
                        <h3 class="text-xl font-bold text-yellow-400 mb-4">⚠️ Points d'attention</h3>
                        <div class="space-y-2">
                            ${profile.warnings.map(w => `
                                <div class="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
                                    <p class="text-yellow-400 font-semibold mb-1">${w.message}</p>
                                    <p class="text-sm text-gray-300">${w.recommendation}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Adaptations -->
                <div>
                    <h3 class="text-xl font-bold text-white mb-4">🎯 Adaptations du plan</h3>
                    <div class="bg-wood-dark bg-opacity-50 rounded-lg p-4">
                        <ul class="space-y-2 text-gray-300">
                            <li>• <strong>Complexité repas :</strong> ${profile.adaptations.mealComplexity || 'Standard'}</li>
                            <li>• <strong>Variété :</strong> ${profile.adaptations.mealVariety || 'Moyenne'}</li>
                            <li>• <strong>Budget :</strong> ${profile.adaptations.budget || 'Moyen'}</li>
                            <li>• <strong>Stratégie préparation :</strong> ${profile.adaptations.prepStrategy || 'Flexible'}</li>
                            ${profile.adaptations.note ? `<li class="text-yellow-400">📝 ${profile.adaptations.note}</li>` : ''}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }
};
