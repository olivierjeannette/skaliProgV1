/**
 * NUTRITION PRO - Logic & Actions
 * Suite de nutritionpro.js - Gestion des actions
 */

// Extension de NutritionPro
Object.assign(NutritionPro, {
    /**
     * Créer un plan nutritionnel
     * @param event
     */
    async createPlan(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        try {
            // Récupérer les données du formulaire
            const objective = formData.get('objective');
            const planDuration = formData.get('planDuration'); // '1day', '1week', '1month'
            const startDate = formData.get('startDate');
            const mealsPerDay = parseInt(formData.get('mealsPerDay'));
            const monthlyBudget = parseInt(formData.get('monthlyBudget')) || 400;

            // Récupérer les restrictions
            const allergies = formData.getAll('allergies');
            const regimes = formData.getAll('regimes');

            // Déterminer le nombre de jours selon la durée
            const daysMap = {
                '1day': 1,
                '1week': 7,
                '1month': 30
            };
            const totalDays = daysMap[planDuration] || 7;

            // ========== NOUVEAU V4 : Utiliser le nouveau flux avec WeekPlanner ==========
            console.log('🚀 Démarrage création plan V4...', { planDuration, totalDays, monthlyBudget });

            // Préparer les données du plan
            const planData = {
                objective,
                planDuration,
                totalDays,
                startDate,
                mealsPerDay,
                monthlyBudget,
                allergies,
                regimes
            };

            // Lancer le nouveau flux V4 : WeekPlanner → 3 Profils → Preview → Repas
            NutritionPlanV4.startPlanCreation(this.currentMember, planData);

        } catch (error) {
            console.error('Erreur calcul plan:', error);
            Utils.showNotification('Erreur', error.message, 'error');
        }
    },

    /**
     * Afficher la prévisualisation des macros calculées
     * @param macros
     * @param planData
     */
    async showMacrosPreview(macros, planData) {
        const objectiveConfig = this.OBJECTIVES[planData.objective];
        const hydration = NutritionCalculator.calculateHydration(this.currentMember.weight);

        // Calculer la date de fin
        const startDate = new Date(planData.startDate);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + (planData.duration * 7));

        const html = `
            <div class="nutrition-pro-container fade-in-premium">
                <!-- Header avec retour -->
                <div class="flex items-center gap-4 mb-8">
                    <button onclick="NutritionPro.showMainView()" class="btn-premium bg-gray-700 hover:bg-gray-600">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div>
                        <h2 class="text-4xl font-bold text-green-400 flex items-center gap-3">
                            <i class="fas fa-calculator"></i>
                            Macronutriments Calculés
                        </h2>
                        <p class="text-gray-400 mt-2">${this.currentMember.name} - ${objectiveConfig.name}</p>
                    </div>
                </div>

                <!-- Carte résumé -->
                <div class="premium-card mb-6">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <!-- Calories -->
                        <div class="text-center p-6 bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-lg border border-red-600/30">
                            <i class="fas fa-fire text-5xl text-red-400 mb-3"></i>
                            <h3 class="text-4xl font-bold text-white mb-2">${macros.targetCalories}</h3>
                            <p class="text-gray-400">Calories / jour</p>
                        </div>

                        <!-- Protéines -->
                        <div class="text-center p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-lg border border-blue-600/30">
                            <i class="fas fa-drumstick-bite text-5xl text-blue-400 mb-3"></i>
                            <h3 class="text-4xl font-bold text-white mb-2">${macros.macros.protein.grams}g</h3>
                            <p class="text-gray-400">Protéines (${macros.macros.protein.percentage}%)</p>
                        </div>

                        <!-- Glucides -->
                        <div class="text-center p-6 bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 rounded-lg border border-yellow-600/30">
                            <i class="fas fa-bread-slice text-5xl text-yellow-400 mb-3"></i>
                            <h3 class="text-4xl font-bold text-white mb-2">${macros.macros.carbs.grams}g</h3>
                            <p class="text-gray-400">Glucides (${macros.macros.carbs.percentage}%)</p>
                        </div>
                    </div>

                    <!-- Lipides + Hydratation -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="text-center p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-lg border border-purple-600/30">
                            <i class="fas fa-bacon text-4xl text-purple-400 mb-3"></i>
                            <h3 class="text-3xl font-bold text-white mb-2">${macros.macros.fats.grams}g</h3>
                            <p class="text-gray-400">Lipides (${macros.macros.fats.percentage}%)</p>
                        </div>

                        <div class="text-center p-6 bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 rounded-lg border border-cyan-600/30">
                            <i class="fas fa-tint text-4xl text-cyan-400 mb-3"></i>
                            <h3 class="text-3xl font-bold text-white mb-2">${hydration.liters}L</h3>
                            <p class="text-gray-400">Eau recommandée (~${hydration.glasses} verres)</p>
                        </div>
                    </div>
                </div>

                <!-- Détails -->
                <div class="premium-card mb-6">
                    <h3 class="text-2xl font-bold text-green-400 mb-4">
                        <i class="fas fa-info-circle mr-2"></i>
                        Détails du plan
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                        <div><strong>Métabolisme de base (BMR):</strong> ${macros.bmr} kcal/jour</div>
                        <div><strong>Dépense totale (TDEE):</strong> ${macros.tdee} kcal/jour</div>
                        <div><strong>Durée du plan:</strong> ${planData.duration} semaines</div>
                        <div><strong>Dates:</strong> ${new Date(planData.startDate).toLocaleDateString()} → ${endDate.toLocaleDateString()}</div>
                        ${planData.allergies.length > 0 ? `<div><strong>Allergies:</strong> ${planData.allergies.join(', ')}</div>` : ''}
                        ${planData.regimes.length > 0 ? `<div><strong>Régimes:</strong> ${planData.regimes.join(', ')}</div>` : ''}
                    </div>
                </div>

                <!-- Actions -->
                <div class="premium-card">
                    <h3 class="text-2xl font-bold text-green-400 mb-4">
                        <i class="fas fa-utensils mr-2"></i>
                        Générer les repas
                    </h3>
                    <p class="text-gray-400 mb-6">
                        Choisissez la période pour laquelle vous souhaitez générer un plan de repas personnalisé.
                    </p>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button onclick="NutritionPro.generateMeals('day', ${JSON.stringify(macros).replace(/"/g, '&quot;')}, ${JSON.stringify(planData).replace(/"/g, '&quot;')})"
                                class="btn-premium btn-save-local">
                            <i class="fas fa-calendar-day mr-2"></i>
                            1 Jour
                        </button>
                        <button onclick="NutritionPro.generateMeals('week', ${JSON.stringify(macros).replace(/"/g, '&quot;')}, ${JSON.stringify(planData).replace(/"/g, '&quot;')})"
                                class="btn-premium btn-save-local">
                            <i class="fas fa-calendar-week mr-2"></i>
                            1 Semaine
                        </button>
                        <button onclick="NutritionPro.generateMeals('month', ${JSON.stringify(macros).replace(/"/g, '&quot;')}, ${JSON.stringify(planData).replace(/"/g, '&quot;')})"
                                class="btn-premium btn-save-local">
                            <i class="fas fa-calendar-alt mr-2"></i>
                            1 Mois
                        </button>
                        <button onclick="NutritionPro.generateMeals('full', ${JSON.stringify(macros).replace(/"/g, '&quot;')}, ${JSON.stringify(planData).replace(/"/g, '&quot;')})"
                                class="btn-premium btn-publish">
                            <i class="fas fa-calendar mr-2"></i>
                            Plan complet (${planData.duration} semaines)
                        </button>
                    </div>
                </div>
            </div>
        `;

        const contentEl = document.getElementById('mainContent') || document.querySelector('#mainApp');
        if (contentEl) {contentEl.innerHTML = html;}
    },

    /**
     * Générer les repas avec IA
     * @param period
     * @param macros
     * @param planData
     */
    async generateMeals(period, macros, planData) {
        // Calculer le nombre de jours
        const days = {
            'day': 1,
            'week': 7,
            'month': 30,
            'full': planData.duration * 7
        }[period];

        try {
            let mealPlan;

            // Plans longs : génération par batch de 7 jours (optimisation token)
            if (days > 7) {
                mealPlan = await this.generateLongPlan(days, macros, planData);
            } else {
                // Plans courts : génération directe (pas de notification, la barre de progression s'affichera)
                mealPlan = await NutritionAIGenerator.generateMealPlan({
                    member: this.currentMember,
                    macros,
                    planData,
                    days
                });
            }

            // Générer le PDF
            await this.generatePDF(mealPlan, macros, planData, days);

        } catch (error) {
            console.error('Erreur génération repas:', error);
            Utils.showNotification('Erreur', error.message, 'error');
        }
    },

    /**
     * Générer un plan long (>7 jours) par batch hebdomadaire
     * Optimisation : génération parallèle par batch de 3 semaines
     * @param totalDays
     * @param macros
     * @param planData
     */
    async generateLongPlan(totalDays, macros, planData) {
        const totalWeeks = Math.ceil(totalDays / 7);
        const fullPlan = { days: [] };

        // Afficher modal de progression
        this.showProgressModal(totalWeeks);

        // Générer par batch de 3 semaines en parallèle (optimisation vitesse)
        const batchSize = 3;
        const batches = [];

        for (let i = 0; i < totalWeeks; i += batchSize) {
            const weekBatch = [];

            for (let j = 0; j < batchSize && (i + j) < totalWeeks; j++) {
                const week = i + j;
                const isLastWeek = week === totalWeeks - 1;
                const daysInWeek = isLastWeek && totalDays % 7 !== 0 ? totalDays % 7 : 7;

                weekBatch.push({
                    weekNumber: week + 1,
                    daysInWeek: daysInWeek
                });
            }

            batches.push(weekBatch);
        }

        // Générer tous les batches
        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
            const batch = batches[batchIndex];

            console.log(`📦 Batch ${batchIndex + 1}/${batches.length}: génération de ${batch.length} semaines en parallèle...`);

            // Générer toutes les semaines du batch en parallèle
            const weekPromises = batch.map(async (weekInfo) => {
                const weekPlan = await NutritionAIGenerator.generateMealPlan({
                    member: this.currentMember,
                    macros,
                    planData: {
                        ...planData,
                        weekNumber: weekInfo.weekNumber,
                        totalWeeks: totalWeeks
                    },
                    days: weekInfo.daysInWeek
                });

                return { weekNumber: weekInfo.weekNumber, plan: weekPlan };
            });

            // Attendre que toutes les semaines du batch soient générées
            const weekResults = await Promise.all(weekPromises);

            // Trier par numéro de semaine et ajouter au plan complet
            weekResults.sort((a, b) => a.weekNumber - b.weekNumber);
            weekResults.forEach(result => {
                fullPlan.days.push(...result.plan.days);
            });

            // Mettre à jour la progression
            const completedWeeks = Math.min((batchIndex + 1) * batchSize, totalWeeks);
            this.updateProgressModal(completedWeeks, totalWeeks, `${completedWeeks}/${totalWeeks} semaines générées`);

            // Petit délai entre les batches uniquement (pas entre chaque semaine)
            if (batchIndex < batches.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }

        // Fermer le modal de progression
        this.closeProgressModal();

        Utils.showNotification(
            'Plan généré !',
            `${totalDays} jours de repas créés avec succès`,
            'success'
        );

        return fullPlan;
    },

    /**
     * Afficher modal de progression
     * @param totalWeeks
     */
    showProgressModal(totalWeeks) {
        const html = `
            <div id="progressModal" class="fixed inset-0 modal-backdrop flex items-center justify-center z-50 fade-in-premium">
                <div class="premium-card max-w-md w-full mx-4">
                    <div class="text-center">
                        <i class="fas fa-spinner fa-spin text-6xl text-green-400 mb-4"></i>
                        <h3 class="text-2xl font-bold text-white mb-2">Génération en cours...</h3>
                        <p id="progressText" class="text-gray-400 mb-4">Semaine 1/${totalWeeks}</p>

                        <!-- Barre de progression -->
                        <div class="w-full bg-gray-700 rounded-full h-4 mb-2 overflow-hidden">
                            <div id="progressBar" class="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-500"
                                 style="width: 0%"></div>
                        </div>
                        <p class="text-sm text-gray-500">Cette opération peut prendre quelques minutes...</p>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('modalContainer').innerHTML = html;
    },

    /**
     * Mettre à jour la progression
     * @param current
     * @param total
     * @param text
     */
    updateProgressModal(current, total, text) {
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');

        if (progressBar && progressText) {
            const percentage = (current / total) * 100;
            progressBar.style.width = `${percentage}%`;
            progressText.textContent = text;
        }
    },

    /**
     * Fermer le modal de progression
     */
    closeProgressModal() {
        const modal = document.getElementById('progressModal');
        if (modal) {
            modal.remove();
        }
    },

    /**
     * Afficher le suivi des poids
     */
    async showWeightTracking() {
        const members = await SupabaseManager.getMembers();

        const html = `
            <div class="nutrition-pro-container fade-in-premium">
                <div class="flex items-center gap-4 mb-8">
                    <button onclick="NutritionPro.showMainView()" class="btn-premium bg-gray-700 hover:bg-gray-600">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div>
                        <h2 class="text-4xl font-bold text-green-400 flex items-center gap-3">
                            <i class="fas fa-chart-line"></i>
                            Suivi des poids
                        </h2>
                        <p class="text-gray-400 mt-2">Historique des mesures corporelles</p>
                    </div>
                </div>

                <div class="premium-card">
                    <h3 class="text-2xl font-bold text-green-400 mb-6">
                        <i class="fas fa-user-circle mr-2"></i>
                        Sélectionner un adhérent
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${members.map(m => `
                            <div class="bg-wood-dark bg-opacity-50 rounded-lg p-4 border border-wood-accent border-opacity-30 hover:border-green-400 transition cursor-pointer"
                                 onclick="NutritionPro.showMemberWeightHistory('${m.id}')">
                                <div class="flex items-center gap-3">
                                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-xl">
                                        ${m.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div class="flex-1">
                                        <h4 class="font-bold text-white">${m.name}</h4>
                                        <p class="text-sm text-gray-400">
                                            ${m.weight ? `${m.weight} kg` : 'Aucune mesure'}
                                        </p>
                                    </div>
                                    <i class="fas fa-chevron-right text-gray-500"></i>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        const contentEl = document.getElementById('mainContent') || document.querySelector('#mainApp');
        if (contentEl) {contentEl.innerHTML = html;}
    },

    /**
     * Afficher l'historique de poids d'un membre
     * @param memberId
     */
    async showMemberWeightHistory(memberId) {
        const member = (await SupabaseManager.getMembers()).find(m => m.id === memberId);
        const measurements = await SupabaseManager.getMemberMeasurements(memberId);

        const html = `
            <div class="nutrition-pro-container fade-in-premium">
                <div class="flex items-center gap-4 mb-8">
                    <button onclick="NutritionPro.showWeightTracking()" class="btn-premium bg-gray-700 hover:bg-gray-600">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div class="flex-1">
                        <h2 class="text-4xl font-bold text-green-400">${member.name}</h2>
                        <p class="text-gray-400 mt-2">Suivi des mesures corporelles</p>
                    </div>
                    <button onclick="NutritionPro.addMeasurement('${memberId}')" class="btn-premium btn-publish">
                        <i class="fas fa-plus mr-2"></i>
                        Nouvelle mesure
                    </button>
                </div>

                ${measurements.length > 0 ? `
                    <div class="premium-card mb-6">
                        <h3 class="text-2xl font-bold text-green-400 mb-4">Dernières mesures</h3>
                        <div class="space-y-3">
                            ${measurements.map(m => `
                                <div class="bg-wood-dark bg-opacity-50 rounded-lg p-4 border border-wood-accent border-opacity-30">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <p class="text-white font-bold text-xl">${m.weight_kg} kg</p>
                                            <p class="text-sm text-gray-400">
                                                ${new Date(m.measured_at).toLocaleDateString('fr-FR')}
                                                ${m.body_fat_percentage ? ` • ${m.body_fat_percentage}% MG` : ''}
                                                ${m.muscle_mass_kg ? ` • ${m.muscle_mass_kg}kg MM` : ''}
                                            </p>
                                        </div>
                                        <div class="text-gray-500">
                                            <i class="fas fa-weight"></i>
                                        </div>
                                    </div>
                                    ${m.notes ? `<p class="text-sm text-gray-400 mt-2">${m.notes}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : `
                    <div class="premium-card text-center py-12">
                        <i class="fas fa-chart-line text-6xl text-gray-600 mb-4"></i>
                        <p class="text-gray-400">Aucune mesure enregistrée</p>
                    </div>
                `}
            </div>
        `;

        const contentEl = document.getElementById('mainContent') || document.querySelector('#mainApp');
        if (contentEl) {contentEl.innerHTML = html;}
    },

    /**
     * Ajouter une mesure
     * @param memberId
     */
    addMeasurement(memberId) {
        const html = `
            <div class="fixed inset-0 modal-backdrop flex items-center justify-center z-50 fade-in-premium" onclick="Utils.closeModal(event)">
                <div class="premium-card max-w-md w-full mx-4" onclick="event.stopPropagation()">
                    <h3 class="text-2xl font-bold text-green-400 mb-6">
                        <i class="fas fa-weight mr-2"></i>
                        Nouvelle mesure
                    </h3>

                    <form onsubmit="NutritionPro.saveMeasurement(event, '${memberId}'); return false;" class="space-y-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-300 mb-2">Poids (kg) *</label>
                            <input type="number" name="weight" step="0.1" required
                                   class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition">
                        </div>

                        <div>
                            <label class="block text-sm font-semibold text-gray-300 mb-2">Masse grasse (%)</label>
                            <input type="number" name="bodyFat" step="0.1" min="3" max="60"
                                   class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition">
                        </div>

                        <div>
                            <label class="block text-sm font-semibold text-gray-300 mb-2">Masse musculaire (kg)</label>
                            <input type="number" name="muscleMass" step="0.1"
                                   class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition">
                        </div>

                        <div>
                            <label class="block text-sm font-semibold text-gray-300 mb-2">Notes</label>
                            <textarea name="notes" rows="3"
                                      class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition"></textarea>
                        </div>

                        <div class="flex gap-3 pt-4">
                            <button type="button" onclick="Utils.closeModal()" class="flex-1 btn-premium bg-gray-700 hover:bg-gray-600">
                                Annuler
                            </button>
                            <button type="submit" class="flex-1 btn-premium btn-publish">
                                <i class="fas fa-save mr-2"></i>
                                Enregistrer
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('modalContainer').innerHTML = html;
    },

    /**
     * Sauvegarder une mesure
     * @param event
     * @param memberId
     */
    async saveMeasurement(event, memberId) {
        event.preventDefault();
        const formData = new FormData(event.target);

        try {
            await SupabaseManager.addMemberMeasurement(memberId, {
                weight_kg: parseFloat(formData.get('weight')),
                body_fat_percentage: formData.get('bodyFat') ? parseFloat(formData.get('bodyFat')) : null,
                muscle_mass_kg: formData.get('muscleMass') ? parseFloat(formData.get('muscleMass')) : null,
                notes: formData.get('notes') || null
            });

            Utils.closeModal();
            Utils.showNotification('Mesure enregistrée', 'La mesure a été ajoutée avec succès', 'success');
            await this.showMemberWeightHistory(memberId);

        } catch (error) {
            console.error('Erreur sauvegarde mesure:', error);
            Utils.showNotification('Erreur', error.message, 'error');
        }
    },

    /**
     * ========== NOUVEAU : Prévisualisation enrichie avec TOUS les calculs avancés ==========
     * @param completePlan
     * @param planData
     */
    async showEnhancedMacrosPreview(completePlan, planData) {
        const objectiveConfig = this.OBJECTIVES[planData.objective];
        const bodyComp = completePlan.bodyComposition;
        const morphotype = completePlan.morphotype;
        const adjustedMacros = completePlan.adjustedMacros;
        const calorieCycling = completePlan.calorieCycling;
        const hydration = completePlan.hydration;
        const micronutrients = completePlan.micronutrients;
        const supplements = completePlan.supplements;

        // Calculer la date de fin
        const startDate = new Date(planData.startDate);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + (planData.duration * 7));

        const html = `
            <div class="nutrition-pro-container fade-in-premium">
                <!-- Header avec retour -->
                <div class="flex items-center gap-4 mb-8">
                    <button onclick="NutritionPro.showMainView()" class="btn-premium bg-gray-700 hover:bg-gray-600">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div>
                        <h2 class="text-4xl font-bold text-green-400 flex items-center gap-3">
                            <i class="fas fa-brain"></i>
                            Plan Nutritionnel Ultra-Complet
                        </h2>
                        <p class="text-gray-400 mt-2">${this.currentMember.name} - ${objectiveConfig.name}</p>
                    </div>
                </div>

                <!-- Badge Morphotype -->
                <div class="premium-card mb-6 bg-gradient-to-r from-purple-900/30 to-purple-800/20 border border-purple-600/30">
                    <div class="flex items-center gap-4">
                        <i class="fas fa-dna text-4xl text-purple-400"></i>
                        <div>
                            <h3 class="text-xl font-bold text-white">${morphotype.config.name}</h3>
                            <p class="text-gray-300">${morphotype.config.description}</p>
                        </div>
                    </div>
                </div>

                <!-- Composition corporelle -->
                <div class="premium-card mb-6">
                    <h3 class="text-2xl font-bold text-green-400 mb-4">
                        <i class="fas fa-user-circle mr-2"></i>
                        Composition corporelle
                    </h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="text-center p-4 bg-wood-dark bg-opacity-50 rounded-lg">
                            <div class="text-2xl font-bold text-red-400">${bodyComp.fatMass}kg</div>
                            <div class="text-sm text-gray-400">Masse grasse (${bodyComp.bodyFat}%)</div>
                        </div>
                        <div class="text-center p-4 bg-wood-dark bg-opacity-50 rounded-lg">
                            <div class="text-2xl font-bold text-green-400">${bodyComp.leanMass}kg</div>
                            <div class="text-sm text-gray-400">Masse maigre</div>
                        </div>
                        <div class="text-center p-4 bg-wood-dark bg-opacity-50 rounded-lg">
                            <div class="text-2xl font-bold text-blue-400">${bodyComp.muscleMass}kg</div>
                            <div class="text-sm text-gray-400">Masse musculaire</div>
                        </div>
                        <div class="text-center p-4 bg-wood-dark bg-opacity-50 rounded-lg">
                            <div class="text-2xl font-bold text-cyan-400">${bodyComp.ffmi}</div>
                            <div class="text-sm text-gray-400">FFMI (${bodyComp.ffmiCategory.label})</div>
                        </div>
                    </div>
                </div>

                <!-- Macros (Base vs Ajusté) -->
                <div class="premium-card mb-6">
                    <h3 class="text-2xl font-bold text-green-400 mb-4">
                        <i class="fas fa-fire mr-2"></i>
                        Macronutriments (ajustés morphotype)
                    </h3>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <!-- Base -->
                        <div class="p-4 bg-wood-dark bg-opacity-30 rounded-lg border border-gray-600">
                            <h4 class="text-lg font-bold text-gray-300 mb-3">📊 Calcul standard</h4>
                            <div class="text-3xl font-bold text-white">${completePlan.baseMacros.targetCalories} kcal</div>
                            <div class="text-sm text-gray-400 mt-2">
                                BMR: ${completePlan.baseMacros.bmr} | TDEE: ${completePlan.baseMacros.tdee}
                            </div>
                        </div>

                        <!-- Ajusté -->
                        <div class="p-4 bg-gradient-to-br from-green-900/40 to-green-800/30 rounded-lg border-2 border-green-500">
                            <h4 class="text-lg font-bold text-green-400 mb-3">✨ Ajusté ${morphotype.config.name}</h4>
                            <div class="text-3xl font-bold text-white">${adjustedMacros.calories} kcal</div>
                            <div class="text-sm text-green-400 mt-2">
                                ${adjustedMacros.calories > completePlan.baseMacros.targetCalories ? '+' : ''}${adjustedMacros.calories - completePlan.baseMacros.targetCalories} kcal
                            </div>
                        </div>
                    </div>

                    <!-- Détail macros -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="text-center p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-lg border border-blue-600/30">
                            <i class="fas fa-drumstick-bite text-5xl text-blue-400 mb-3"></i>
                            <h3 class="text-4xl font-bold text-white mb-2">${adjustedMacros.macros.protein.grams}g</h3>
                            <p class="text-gray-400">Protéines (${adjustedMacros.macros.protein.percentage}%)</p>
                            <p class="text-sm text-blue-400 mt-2">${(adjustedMacros.macros.protein.grams / this.currentMember.weight).toFixed(1)}g/kg</p>
                        </div>

                        <div class="text-center p-6 bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 rounded-lg border border-yellow-600/30">
                            <i class="fas fa-bread-slice text-5xl text-yellow-400 mb-3"></i>
                            <h3 class="text-4xl font-bold text-white mb-2">${adjustedMacros.macros.carbs.grams}g</h3>
                            <p class="text-gray-400">Glucides (${adjustedMacros.macros.carbs.percentage}%)</p>
                            <p class="text-sm text-yellow-400 mt-2">${(adjustedMacros.macros.carbs.grams / this.currentMember.weight).toFixed(1)}g/kg</p>
                        </div>

                        <div class="text-center p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-lg border border-purple-600/30">
                            <i class="fas fa-bacon text-4xl text-purple-400 mb-3"></i>
                            <h3 class="text-3xl font-bold text-white mb-2">${adjustedMacros.macros.fats.grams}g</h3>
                            <p class="text-gray-400">Lipides (${adjustedMacros.macros.fats.percentage}%)</p>
                            <p class="text-sm text-purple-400 mt-2">${(adjustedMacros.macros.fats.grams / this.currentMember.weight).toFixed(1)}g/kg</p>
                        </div>
                    </div>
                </div>

                <!-- Cyclage calorique -->
                <div class="premium-card mb-6">
                    <h3 class="text-2xl font-bold text-green-400 mb-4">
                        <i class="fas fa-calendar-alt mr-2"></i>
                        Cyclage calorique recommandé
                    </h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        ${calorieCycling.high_day ? `
                            <div class="p-4 bg-red-900/20 rounded-lg border border-red-600/30">
                                <div class="text-center">
                                    <i class="fas fa-fire text-2xl text-red-400 mb-2"></i>
                                    <div class="text-2xl font-bold text-white">${calorieCycling.high_day.calories}</div>
                                    <div class="text-sm text-gray-400">Jour intense</div>
                                    <div class="text-xs text-red-400 mt-1">+${calorieCycling.high_day.carbsBoost}g glucides</div>
                                </div>
                            </div>
                        ` : ''}
                        ${calorieCycling.moderate_day ? `
                            <div class="p-4 bg-yellow-900/20 rounded-lg border border-yellow-600/30">
                                <div class="text-center">
                                    <i class="fas fa-dumbbell text-2xl text-yellow-400 mb-2"></i>
                                    <div class="text-2xl font-bold text-white">${calorieCycling.moderate_day.calories}</div>
                                    <div class="text-sm text-gray-400">Jour modéré</div>
                                </div>
                            </div>
                        ` : ''}
                        ${calorieCycling.rest_day ? `
                            <div class="p-4 bg-blue-900/20 rounded-lg border border-blue-600/30">
                                <div class="text-center">
                                    <i class="fas fa-bed text-2xl text-blue-400 mb-2"></i>
                                    <div class="text-2xl font-bold text-white">${calorieCycling.rest_day.calories}</div>
                                    <div class="text-sm text-gray-400">Jour repos</div>
                                    <div class="text-xs text-blue-400 mt-1">-${calorieCycling.rest_day.carbsReduction}g glucides</div>
                                </div>
                            </div>
                        ` : ''}
                        <div class="p-4 bg-green-900/20 rounded-lg border border-green-600/30">
                            <div class="text-center">
                                <i class="fas fa-chart-line text-2xl text-green-400 mb-2"></i>
                                <div class="text-2xl font-bold text-white">${calorieCycling.weeklyAverage}</div>
                                <div class="text-sm text-gray-400">Moyenne semaine</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Hydratation -->
                <div class="premium-card mb-6">
                    <h3 class="text-2xl font-bold text-green-400 mb-4">
                        <i class="fas fa-tint mr-2"></i>
                        Hydratation
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="text-center p-6 bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 rounded-lg border border-cyan-600/30">
                            <i class="fas fa-glass-water text-4xl text-cyan-400 mb-3"></i>
                            <h3 class="text-4xl font-bold text-white mb-2">${hydration.withTraining}L</h3>
                            <p class="text-gray-400">Par jour (avec entraînement)</p>
                        </div>
                        <div class="text-center p-6 bg-wood-dark bg-opacity-50 rounded-lg">
                            <h4 class="text-lg font-bold text-cyan-400 mb-3">Répartition journalière</h4>
                            <div class="space-y-2 text-sm text-gray-300">
                                <div>☀️ Matin: ${hydration.breakdown.morning}L</div>
                                <div>🌤️ Après-midi: ${hydration.breakdown.afternoon}L</div>
                                <div>🌙 Soir: ${hydration.breakdown.evening}L</div>
                                ${hydration.breakdown.session ? `<div>🏋️ Pendant séance: ${hydration.breakdown.session}L</div>` : ''}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Micronutriments (section dépliable) -->
                <div class="premium-card mb-6">
                    <button onclick="this.nextElementSibling.classList.toggle('hidden')"
                            class="w-full flex items-center justify-between text-left">
                        <h3 class="text-2xl font-bold text-green-400">
                            <i class="fas fa-capsules mr-2"></i>
                            Micronutriments essentiels
                        </h3>
                        <i class="fas fa-chevron-down text-gray-400"></i>
                    </button>
                    <div class="hidden mt-4">
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                            <div class="p-3 bg-wood-dark bg-opacity-50 rounded">
                                <strong class="text-yellow-400">Vitamine D:</strong> ${micronutrients.daily.vitaminD} µg
                            </div>
                            <div class="p-3 bg-wood-dark bg-opacity-50 rounded">
                                <strong class="text-orange-400">Vitamine C:</strong> ${micronutrients.daily.vitaminC} mg
                            </div>
                            <div class="p-3 bg-wood-dark bg-opacity-50 rounded">
                                <strong class="text-blue-400">Calcium:</strong> ${micronutrients.daily.calcium} mg
                            </div>
                            <div class="p-3 bg-wood-dark bg-opacity-50 rounded">
                                <strong class="text-red-400">Fer:</strong> ${micronutrients.daily.iron} mg
                            </div>
                            <div class="p-3 bg-wood-dark bg-opacity-50 rounded">
                                <strong class="text-green-400">Magnésium:</strong> ${micronutrients.daily.magnesium} mg
                            </div>
                            <div class="p-3 bg-wood-dark bg-opacity-50 rounded">
                                <strong class="text-purple-400">Zinc:</strong> ${micronutrients.daily.zinc} mg
                            </div>
                        </div>
                        ${micronutrients.notes && micronutrients.notes.length > 0 ? `
                            <div class="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-600/30">
                                <h4 class="font-bold text-blue-400 mb-2">📝 Notes importantes:</h4>
                                <ul class="space-y-1 text-sm text-gray-300">
                                    ${micronutrients.notes.map(note => `<li>• ${note}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Supplémentation -->
                <div class="premium-card mb-6">
                    <button onclick="this.nextElementSibling.classList.toggle('hidden')"
                            class="w-full flex items-center justify-between text-left">
                        <h3 class="text-2xl font-bold text-green-400">
                            <i class="fas fa-pills mr-2"></i>
                            Supplémentation recommandée
                        </h3>
                        <i class="fas fa-chevron-down text-gray-400"></i>
                    </button>
                    <div class="hidden mt-4">
                        ${supplements.essential && supplements.essential.length > 0 ? `
                            <div class="mb-4">
                                <h4 class="text-lg font-bold text-green-400 mb-3">✅ Essentiels</h4>
                                <div class="space-y-3">
                                    ${supplements.essential.map(s => `
                                        <div class="p-4 bg-green-900/20 rounded-lg border border-green-600/30">
                                            <div class="flex items-start gap-3">
                                                <i class="fas fa-check-circle text-green-400 mt-1"></i>
                                                <div class="flex-1">
                                                    <div class="flex items-center justify-between">
                                                        <h5 class="font-bold text-white">${s.name}</h5>
                                                        ${s.evidence ? `<span class="text-xs px-2 py-1 bg-green-600/30 text-green-300 rounded">${s.evidence}</span>` : ''}
                                                    </div>
                                                    <p class="text-sm text-gray-400">${s.dosage || s.dose}</p>
                                                    ${s.timing ? `<p class="text-xs text-blue-400 mt-1">⏰ ${s.timing}</p>` : ''}
                                                    <p class="text-sm text-gray-300 mt-1">${s.reason}</p>
                                                </div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}

                        ${supplements.beneficial && supplements.beneficial.length > 0 ? `
                            <div>
                                <h4 class="text-lg font-bold text-yellow-400 mb-3">💡 Bénéfiques (selon objectif)</h4>
                                <div class="space-y-3">
                                    ${supplements.beneficial.map(s => `
                                        <div class="p-4 bg-yellow-900/20 rounded-lg border border-yellow-600/30">
                                            <div class="flex items-start gap-3">
                                                <i class="fas fa-star text-yellow-400 mt-1"></i>
                                                <div class="flex-1">
                                                    <div class="flex items-center justify-between">
                                                        <h5 class="font-bold text-white">${s.name}</h5>
                                                        ${s.evidence ? `<span class="text-xs px-2 py-1 bg-yellow-600/30 text-yellow-300 rounded">${s.evidence}</span>` : ''}
                                                    </div>
                                                    <p class="text-sm text-gray-400">${s.dosage || s.dose}</p>
                                                    ${s.timing ? `<p class="text-xs text-blue-400 mt-1">⏰ ${s.timing}</p>` : ''}
                                                    <p class="text-sm text-gray-300 mt-1">${s.reason}</p>
                                                </div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Détails du plan -->
                <div class="premium-card mb-6">
                    <h3 class="text-2xl font-bold text-green-400 mb-4">
                        <i class="fas fa-info-circle mr-2"></i>
                        Détails du plan
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                        <div><strong>Durée:</strong> ${planData.duration} semaines</div>
                        <div><strong>Dates:</strong> ${new Date(planData.startDate).toLocaleDateString()} → ${endDate.toLocaleDateString()}</div>
                        <div><strong>Repas par jour:</strong> ${planData.mealsPerDay}</div>
                        <div><strong>Fréquence optimale (morphotype):</strong> ${adjustedMacros.mealFrequency} repas</div>
                        ${planData.allergies && planData.allergies.length > 0 ? `<div><strong>Allergies:</strong> ${planData.allergies.join(', ')}</div>` : ''}
                        ${planData.regimes && planData.regimes.length > 0 ? `<div><strong>Régimes:</strong> ${planData.regimes.join(', ')}</div>` : ''}
                    </div>
                </div>

                <!-- Actions -->
                <div class="premium-card">
                    <h3 class="text-2xl font-bold text-green-400 mb-4">
                        <i class="fas fa-utensils mr-2"></i>
                        Générer les repas
                    </h3>
                    <p class="text-gray-400 mb-6">
                        Les repas seront générés en utilisant la base de données de ${Object.keys(NutritionDatabase.FOODS).length} aliments
                        et tous les calculs avancés ci-dessus.
                    </p>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button onclick="NutritionPro.generateMealsV3('day', ${JSON.stringify(completePlan).replace(/"/g, '&quot;')}, ${JSON.stringify(planData).replace(/"/g, '&quot;')})"
                                class="btn-premium btn-save-local">
                            <i class="fas fa-calendar-day mr-2"></i>
                            1 Jour
                        </button>
                        <button onclick="NutritionPro.generateMealsV3('week', ${JSON.stringify(completePlan).replace(/"/g, '&quot;')}, ${JSON.stringify(planData).replace(/"/g, '&quot;')})"
                                class="btn-premium btn-save-local">
                            <i class="fas fa-calendar-week mr-2"></i>
                            1 Semaine
                        </button>
                        <button onclick="NutritionPro.generateMealsV3('month', ${JSON.stringify(completePlan).replace(/"/g, '&quot;')}, ${JSON.stringify(planData).replace(/"/g, '&quot;')})"
                                class="btn-premium btn-save-local">
                            <i class="fas fa-calendar-alt mr-2"></i>
                            1 Mois
                        </button>
                        <button onclick="NutritionPro.generateMealsV3('full', ${JSON.stringify(completePlan).replace(/"/g, '&quot;')}, ${JSON.stringify(planData).replace(/"/g, '&quot;')})"
                                class="btn-premium btn-publish">
                            <i class="fas fa-calendar mr-2"></i>
                            Plan complet (${planData.duration} semaines)
                        </button>
                    </div>
                </div>
            </div>
        `;

        const contentEl = document.getElementById('mainContent') || document.querySelector('#mainApp');
        if (contentEl) {contentEl.innerHTML = html;}
    },

    /**
     * Générer les repas avec la V3 (utilise les calculs avancés)
     * @param period
     * @param completePlan
     * @param planData
     */
    async generateMealsV3(period, completePlan, planData) {
        // AFFICHER LE LOADING IMMÉDIATEMENT
        const loadingModal = document.createElement('div');
        loadingModal.id = 'mealGenerationLoading';
        loadingModal.className = 'fixed inset-0 bg-gray-200 bg-opacity-90 flex items-center justify-center z-[100]';
        loadingModal.innerHTML = `
            <div class="bg-skali-darker rounded-xl p-8 max-w-md w-full mx-4 border-2 border-green-400 shadow-2xl">
                <div class="text-center">
                    <div class="w-16 h-16 mx-auto mb-4 relative">
                        <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-green-400"></div>
                        <i class="fas fa-utensils absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl text-green-400"></i>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-2">Génération en cours...</h3>
                    <p id="mealGenStatus" class="text-gray-400 text-sm">Préparation des repas...</p>
                </div>
            </div>
        `;
        document.body.appendChild(loadingModal);

        const updateStatus = (message) => {
            const statusEl = document.getElementById('mealGenStatus');
            if (statusEl) {statusEl.textContent = message;}
        };

        const days = {
            'day': 1,
            'week': 7,
            'month': 30,
            'full': planData.duration * 7
        }[period];

        try {
            updateStatus(`Génération de ${days} jour${days > 1 ? 's' : ''} de repas...`);
            let mealPlan;

            if (days > 7) {
                mealPlan = await this.generateLongPlan(days, completePlan.adjustedMacros, planData);
            } else {
                mealPlan = await NutritionAIGenerator.generateMealPlan({
                    member: this.currentMember,
                    macros: completePlan.adjustedMacros,
                    planData,
                    days
                });
            }

            updateStatus('Création du PDF professionnel...');

            // Générer le PDF enrichi (sans son propre modal de loading)
            await this.generateEnhancedPDF(mealPlan, completePlan, planData, days, true);

            // Retirer le modal
            const modal = document.getElementById('mealGenerationLoading');
            if (modal) {document.body.removeChild(modal);}

        } catch (error) {
            console.error('Erreur génération repas:', error);

            // Retirer le modal
            const modal = document.getElementById('mealGenerationLoading');
            if (modal) {document.body.removeChild(modal);}

            Utils.showNotification('Erreur', error.message, 'error');
        }
    },

    /**
     * Générer un PDF enrichi avec toutes les données
     * @param mealPlan
     * @param completePlan
     * @param planData
     * @param days
     */
    async generateEnhancedPDF(mealPlan, completePlan, planData, days) {
        console.log('📄 Génération PDF Ultra-Complet V3...');

        try {
            // Modal de progression
            const progressModal = document.createElement('div');
            progressModal.className = 'fixed inset-0 bg-gray-200 bg-opacity-90 flex items-center justify-center z-[100]';
            progressModal.innerHTML = `
                <div class="bg-skali-darker rounded-xl p-8 max-w-md w-full mx-4 border-2 border-green-400 shadow-2xl">
                    <div class="text-center mb-6">
                        <div class="w-16 h-16 mx-auto mb-4 relative">
                            <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-green-400"></div>
                            <i class="fas fa-file-pdf absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl text-green-400"></i>
                        </div>
                        <h3 class="text-xl font-bold text-white mb-2">Génération du PDF</h3>
                        <p id="pdfProgressMessage" class="text-gray-400 text-sm">Préparation...</p>
                    </div>

                    <div class="mb-4">
                        <div class="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div id="pdfProgressBar" class="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-300" style="width: 0%"></div>
                        </div>
                        <div class="flex justify-between mt-2">
                            <span id="pdfProgressPercent" class="text-xs text-gray-400">0%</span>
                            <span id="pdfProgressStep" class="text-xs text-gray-400">Étape 1/12</span>
                        </div>
                    </div>

                    <div id="pdfProgressDetails" class="text-xs text-gray-500 space-y-1 max-h-32 overflow-y-auto">
                        <!-- Les détails des étapes apparaîtront ici -->
                    </div>
                </div>
            `;
            document.body.appendChild(progressModal);

            // Callback de progression
            const onProgress = async (progress, message, step) => {
                const progressBar = document.getElementById('pdfProgressBar');
                const progressPercent = document.getElementById('pdfProgressPercent');
                const progressMessage = document.getElementById('pdfProgressMessage');
                const progressStepEl = document.getElementById('pdfProgressStep');
                const progressDetails = document.getElementById('pdfProgressDetails');

                if (progressBar) {progressBar.style.width = `${progress}%`;}
                if (progressPercent) {progressPercent.textContent = `${progress}%`;}
                if (progressMessage) {progressMessage.textContent = message;}

                const stepNumber = parseInt(step.replace('step', ''));
                if (progressStepEl) {progressStepEl.textContent = `Étape ${stepNumber}/12`;}

                // Ajouter le détail
                if (progressDetails) {
                    const detail = document.createElement('div');
                    detail.className = 'flex items-center gap-2';
                    detail.innerHTML = `
                        <i class="fas fa-check text-green-400"></i>
                        <span>${message}</span>
                    `;
                    progressDetails.appendChild(detail);
                    progressDetails.scrollTop = progressDetails.scrollHeight;
                }

                await new Promise(resolve => setTimeout(resolve, 50));
            };

            // Générer le PDF avec le nouveau générateur ultra-complet
            const doc = await NutritionPDFEnhanced.generateEnhancedPDF(
                mealPlan,
                completePlan,
                planData,
                this.currentMember,
                days,
                onProgress
            );

            // Sauvegarder
            const filename = `nutrition_ultracomplet_${this.currentMember.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            await NutritionPDFEnhanced.save(doc, filename);

            // Retirer le modal
            document.body.removeChild(progressModal);

            // Notification de succès
            Utils.showNotification(
                'PDF Ultra-Complet généré !',
                `Plan nutritionnel V3 avec toutes les données : ${filename}`,
                'success'
            );

            console.log('✅ PDF Ultra-Complet V3 généré avec succès');

        } catch (error) {
            console.error('❌ Erreur génération PDF:', error);

            // Retirer le modal en cas d'erreur
            const modal = document.querySelector('.fixed.inset-0.bg-black');
            if (modal) {document.body.removeChild(modal);}

            Utils.showNotification(
                'Erreur',
                `Impossible de générer le PDF: ${error.message}`,
                'error'
            );
        }
    }
});
