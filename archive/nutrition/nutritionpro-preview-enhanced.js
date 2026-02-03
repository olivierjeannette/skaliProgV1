/**
 * NUTRITION PRO - Prévisualisation améliorée avec infos d'entraînement
 */

Object.assign(NutritionPro, {
    /**
     * Afficher la prévisualisation améliorée des macros
     * @param macros
     * @param planData
     */
    async showEnhancedMacrosPreview(macros, planData) {
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
                            Macro nutriments calculés
                        </h2>
                        <p class="text-gray-400 mt-2">${this.currentMember.name} - ${objectiveConfig.name}</p>
                    </div>
                </div>

                <!-- Nouveau badge si calcul avec training -->
                ${macros.training ? `
                    <div class="mb-6 p-4 bg-gradient-to-r from-blue-600/20 to-blue-500/10 border border-blue-500/30 rounded-lg flex items-center gap-3">
                        <i class="fas fa-star text-yellow-400 text-2xl"></i>
                        <div>
                            <h4 class="font-bold text-white">✨ Calculs personnalisés avec planning d'entraînement</h4>
                            <p class="text-sm text-gray-300">
                                Vos besoins caloriques ont été ajustés en fonction de vos ${macros.training.sessionsPerWeek} séances/semaine
                                (+${macros.training.avgDailyBurn} kcal/jour en moyenne)
                            </p>
                        </div>
                    </div>
                ` : ''}

                <!-- Carte résumé -->
                <div class="premium-card mb-6">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <!-- Calories -->
                        <div class="text-center p-6 bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-lg border border-red-600/30">
                            <i class="fas fa-fire text-5xl text-red-400 mb-3"></i>
                            <h3 class="text-4xl font-bold text-white mb-2">${macros.targetCalories}</h3>
                            <p class="text-gray-400">Calories / jour</p>
                            ${macros.training ? `
                                <p class="text-xs text-gray-500 mt-2">
                                    Base : ${macros.tdee - macros.training.avgDailyBurn} kcal<br>
                                    + Training : ${macros.training.avgDailyBurn} kcal
                                </p>
                            ` : ''}
                        </div>

                        <!-- Protéines -->
                        <div class="text-center p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-lg border border-blue-600/30">
                            <i class="fas fa-drumstick-bite text-5xl text-blue-400 mb-3"></i>
                            <h3 class="text-4xl font-bold text-white mb-2">${macros.macros.protein.grams}g</h3>
                            <p class="text-gray-400">Protéines (${macros.macros.protein.percentage}%)</p>
                            <p class="text-xs text-gray-500 mt-2">
                                ${(macros.macros.protein.grams / this.currentMember.weight).toFixed(1)}g/kg de poids
                            </p>
                        </div>

                        <!-- Glucides -->
                        <div class="text-center p-6 bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 rounded-lg border border-yellow-600/30">
                            <i class="fas fa-bread-slice text-5xl text-yellow-400 mb-3"></i>
                            <h3 class="text-4xl font-bold text-white mb-2">${macros.macros.carbs.grams}g</h3>
                            <p class="text-gray-400">Glucides (${macros.macros.carbs.percentage}%)</p>
                            <p class="text-xs text-gray-500 mt-2">
                                ${(macros.macros.carbs.grams / this.currentMember.weight).toFixed(1)}g/kg de poids
                            </p>
                        </div>
                    </div>

                    <!-- Lipides + Hydratation -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="text-center p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-lg border border-purple-600/30">
                            <i class="fas fa-bacon text-4xl text-purple-400 mb-3"></i>
                            <h3 class="text-3xl font-bold text-white mb-2">${macros.macros.fats.grams}g</h3>
                            <p class="text-gray-400">Lipides (${macros.macros.fats.percentage}%)</p>
                            <p class="text-xs text-gray-500 mt-2">
                                ${(macros.macros.fats.grams / this.currentMember.weight).toFixed(1)}g/kg de poids
                            </p>
                        </div>

                        <div class="text-center p-6 bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 rounded-lg border border-cyan-600/30">
                            <i class="fas fa-tint text-4xl text-cyan-400 mb-3"></i>
                            <h3 class="text-3xl font-bold text-white mb-2">${hydration.liters}L</h3>
                            <p class="text-gray-400">Eau recommandée (~${hydration.glasses} verres)</p>
                            <p class="text-xs text-gray-500 mt-2">
                                ${(hydration.liters * 1000 / this.currentMember.weight).toFixed(0)}ml/kg
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Détails du planning d'entraînement (si fourni) -->
                ${macros.training ? `
                    <div class="premium-card mb-6">
                        <h3 class="text-2xl font-bold text-green-400 mb-4">
                            <i class="fas fa-dumbbell mr-2"></i>
                            Détails du planning d'entraînement
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Résumé -->
                            <div>
                                <h4 class="font-bold text-white mb-3">📊 Résumé hebdomadaire</h4>
                                <div class="space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">Séances par semaine :</span>
                                        <span class="text-white font-semibold">${macros.training.sessionsPerWeek} séances</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">Dépense totale :</span>
                                        <span class="text-white font-semibold">${macros.training.totalWeeklyBurn} kcal/semaine</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">Moyenne journalière :</span>
                                        <span class="text-green-400 font-bold">+${macros.training.avgDailyBurn} kcal/jour</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Détail des séances -->
                            <div>
                                <h4 class="font-bold text-white mb-3">🏋️ Détail des séances</h4>
                                <div class="space-y-2 text-sm">
                                    ${macros.training.sessions.map((session, i) => `
                                        <div class="flex items-center justify-between p-2 bg-wood-dark bg-opacity-30 rounded">
                                            <div class="flex items-center gap-2">
                                                <span class="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center text-xs">${i + 1}</span>
                                                <span class="text-gray-300">${this.getSessionTypeLabel(session.category)}</span>
                                            </div>
                                            <div class="text-right">
                                                <div class="text-white font-semibold">${session.calories} kcal</div>
                                                <div class="text-xs text-gray-500">${session.duration}min</div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                        <!-- Exemple de cyclage calorique -->
                        <div class="mt-6 p-4 bg-gradient-to-br from-orange-900/20 to-orange-800/10 border border-orange-600/30 rounded-lg">
                            <h5 class="font-bold text-orange-400 mb-3 flex items-center gap-2">
                                <i class="fas fa-chart-line"></i>
                                💡 Suggestion : Cyclage calorique
                            </h5>
                            <p class="text-sm text-gray-300 mb-3">
                                Pour des résultats optimaux, vous pouvez adapter vos calories selon vos jours d'entraînement :
                            </p>
                            <div class="grid grid-cols-2 gap-4 text-sm">
                                <div class="p-3 bg-green-900/20 rounded">
                                    <div class="text-green-400 font-bold mb-1">Jour d'entraînement</div>
                                    <div class="text-white text-2xl font-bold">${macros.targetCalories + 200} kcal</div>
                                    <div class="text-xs text-gray-400">Carburant pour performer</div>
                                </div>
                                <div class="p-3 bg-blue-900/20 rounded">
                                    <div class="text-blue-400 font-bold mb-1">Jour de repos</div>
                                    <div class="text-white text-2xl font-bold">${Math.round(macros.targetCalories * 0.88)} kcal</div>
                                    <div class="text-xs text-gray-400">Récupération optimale</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- Détails du plan -->
                <div class="premium-card mb-6">
                    <h3 class="text-2xl font-bold text-green-400 mb-4">
                        <i class="fas fa-info-circle mr-2"></i>
                        Détails du plan
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                        <div><strong class="text-white">Métabolisme de base (BMR):</strong> ${macros.bmr} kcal/jour</div>
                        <div><strong class="text-white">Dépense totale (TDEE):</strong> ${macros.tdee} kcal/jour</div>
                        <div><strong class="text-white">Durée du plan:</strong> ${planData.duration} semaines</div>
                        <div><strong class="text-white">Dates:</strong> ${new Date(planData.startDate).toLocaleDateString()} → ${endDate.toLocaleDateString()}</div>
                        <div><strong class="text-white">Repas par jour:</strong> ${planData.mealsPerDay} repas</div>
                        <div><strong class="text-white">Méthode de calcul:</strong> ${macros.training ? 'Avancée (avec training)' : 'Standard'}</div>
                        ${planData.allergies.length > 0 ? `<div class="col-span-2"><strong class="text-white">Allergies:</strong> ${planData.allergies.join(', ')}</div>` : ''}
                        ${planData.regimes.length > 0 ? `<div class="col-span-2"><strong class="text-white">Régimes:</strong> ${planData.regimes.join(', ')}</div>` : ''}
                    </div>
                </div>

                <!-- Actions -->
                <div class="premium-card">
                    <h3 class="text-2xl font-bold text-green-400 mb-4">
                        <i class="fas fa-utensils mr-2"></i>
                        Générer les repas
                    </h3>
                    <p class="text-gray-400 mb-6">
                        Choisissez la période pour laquelle vous souhaitez générer un plan de repas personnalisé avec l'IA.
                    </p>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button onclick="NutritionPro.generateMeals('day', ${JSON.stringify(macros).replace(/"/g, '&quot;')}, ${JSON.stringify(planData).replace(/"/g, '&quot;')})"
                                class="btn-premium btn-save-local hover:scale-105 transition-transform">
                            <i class="fas fa-calendar-day mr-2"></i>
                            <div>
                                <div class="font-bold">1 Jour</div>
                                <div class="text-xs opacity-75">Test rapide</div>
                            </div>
                        </button>

                        <button onclick="NutritionPro.generateMeals('week', ${JSON.stringify(macros).replace(/"/g, '&quot;')}, ${JSON.stringify(planData).replace(/"/g, '&quot;')})"
                                class="btn-premium btn-sync hover:scale-105 transition-transform">
                            <i class="fas fa-calendar-week mr-2"></i>
                            <div>
                                <div class="font-bold">1 Semaine</div>
                                <div class="text-xs opacity-75">Recommandé</div>
                            </div>
                        </button>

                        <button onclick="NutritionPro.generateMeals('twoweeks', ${JSON.stringify(macros).replace(/"/g, '&quot;')}, ${JSON.stringify(planData).replace(/"/g, '&quot;')})"
                                class="btn-premium btn-publish hover:scale-105 transition-transform">
                            <i class="fas fa-calendar mr-2"></i>
                            <div>
                                <div class="font-bold">2 Semaines</div>
                                <div class="text-xs opacity-75">Plus de variété</div>
                            </div>
                        </button>

                        <button onclick="NutritionPro.generateMeals('month', ${JSON.stringify(macros).replace(/"/g, '&quot;')}, ${JSON.stringify(planData).replace(/"/g, '&quot;')})"
                                class="btn-premium bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all">
                            <i class="fas fa-star mr-2"></i>
                            <div>
                                <div class="font-bold">1 Mois</div>
                                <div class="text-xs opacity-75">Plan complet</div>
                            </div>
                        </button>
                    </div>

                    <div class="mt-6 p-4 bg-gradient-to-r from-yellow-900/20 to-yellow-800/10 border border-yellow-600/30 rounded-lg">
                        <div class="flex items-start gap-3">
                            <i class="fas fa-info-circle text-yellow-400 text-xl mt-1"></i>
                            <div class="text-sm text-gray-300">
                                <p class="font-semibold text-white mb-1">ℹ️ Comment ça marche ?</p>
                                <ul class="list-disc list-inside space-y-1 text-xs">
                                    <li>L'IA génère des repas équilibrés selon vos macros et restrictions</li>
                                    <li>Chaque repas respecte vos ${macros.targetCalories} kcal/jour</li>
                                    <li>Un PDF professionnel est créé avec liste de courses</li>
                                    ${macros.training ? '<li class="text-green-400 font-semibold">✨ Les calories sont adaptées selon vos jours d\'entraînement</li>' : ''}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const contentEl = document.getElementById('mainContent') || document.querySelector('#mainApp');
        if (contentEl) {
            contentEl.innerHTML = html;
        }
    },

    /**
     * Obtenir le label d'un type de séance
     * @param category
     */
    getSessionTypeLabel(category) {
        const labels = {
            'strength': 'Musculation',
            'cardio': 'Cardio intense',
            'hiit': 'HIIT',
            'endurance': 'Endurance',
            'crossfit': 'CrossFit',
            'gymnastic': 'Gymnastique',
            'recovery': 'Récupération',
            'mobility': 'Mobilité',
            'team_sport': 'Sport d\'équipe'
        };
        return labels[category] || category;
    }
});
