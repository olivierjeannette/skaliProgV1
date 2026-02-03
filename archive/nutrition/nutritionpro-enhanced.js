/**
 * NUTRITION PRO ENHANCED - Formulaire amélioré avec planning d'entraînement
 * Extension pour améliorer la création de plans nutritionnels
 */

Object.assign(NutritionPro, {
    /**
     * Rendu du formulaire amélioré de création de plan
     */
    renderEnhancedPlanCreator() {
        const m = this.currentMember;
        const objectives = Object.entries(this.OBJECTIVES);

        return `
            <div class="space-y-6">
                <!-- En-tête membre sélectionné -->
                <div class="premium-card flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-2xl">
                            ${m.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold text-white">${m.name}</h3>
                            <p class="text-secondary">
                                ${m.gender === 'male' ? '♂' : m.gender === 'female' ? '♀' : '⚧'}
                                ${m.birthdate ? this.calculateAge(m.birthdate) + ' ans' : 'Âge non renseigné'}
                                • ${m.height || '?'} cm
                                • ${m.weight || '?'} kg
                                ${m.body_fat_percentage ? ` • ${m.body_fat_percentage}% MG` : ''}
                            </p>
                        </div>
                    </div>
                    <button onclick="NutritionPro.currentMember = null; NutritionPro.showMainView()"
                            class="btn-premium glass-card hover:bg-gray-600">
                        <i class="fas fa-arrow-left mr-2"></i>
                        Changer
                    </button>
                </div>

                <!-- Formulaire de création de plan AMÉLIORÉ -->
                <div class="premium-card">
                    <h3 class="text-2xl font-bold text-green-400 mb-6">
                        <i class="fas fa-clipboard-list mr-3"></i>
                        Créer un plan nutritionnel personnalisé
                    </h3>

                    <form onsubmit="NutritionPro.createEnhancedPlan(event); return false;" class="space-y-8">

                        <!-- ÉTAPE 1 : Objectif -->
                        <div class="plan-section">
                            <h4 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span class="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-sm">1</span>
                                <i class="fas fa-bullseye"></i>
                                Objectif nutritionnel
                            </h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                ${objectives.map(([key, obj]) => `
                                    <label class="objective-card cursor-pointer group">
                                        <input type="radio" name="objective" value="${key}" required class="hidden objective-radio"
                                               onchange="NutritionPro.updateObjectiveDescription('${key}')">
                                        <div class="objective-content bg-wood-dark bg-opacity-50 rounded-lg p-5 border-2 border-wood-accent border-opacity-30 hover:border-opacity-70 hover:bg-opacity-70 transition-all duration-200 transform hover:scale-105">
                                            <div class="flex flex-col items-center text-center">
                                                <i class="fas ${obj.icon} text-3xl mb-3 transition-transform group-hover:scale-110" style="color: ${obj.color}"></i>
                                                <h4 class="font-bold text-white text-sm">${obj.name}</h4>
                                                <p class="text-xs text-secondary mt-2">${obj.description}</p>
                                            </div>
                                        </div>
                                    </label>
                                `).join('')}
                            </div>
                            <div id="objectiveDescription" class="mt-4 p-4 bg-gray-800 rounded-lg hidden">
                                <!-- Description détaillée de l'objectif sélectionné -->
                            </div>
                        </div>

                        <!-- ÉTAPE 2 : Planning d'entraînement (NOUVEAU !) -->
                        <div class="plan-section">
                            <h4 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span class="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-sm">2</span>
                                <i class="fas fa-dumbbell"></i>
                                Planning d'entraînement
                                <span class="text-sm font-normal text-secondary ml-2">(Nouveau - Pour des calculs plus précis)</span>
                            </h4>

                            <div class="bg-gradient-to-r from-blue-900/20 to-blue-800/10 border border-blue-600/30 rounded-lg p-4 mb-4">
                                <div class="flex items-start gap-3">
                                    <i class="fas fa-lightbulb text-yellow-400 text-2xl mt-1"></i>
                                    <div>
                                        <p class="text-sm text-secondary mb-2">
                                            <strong class="text-white">Pourquoi c'est important ?</strong><br>
                                            En renseignant vos séances d'entraînement, nous calculons vos besoins caloriques RÉELS.
                                            Par exemple, un gros cardio de 1000 kcal augmentera automatiquement vos apports ce jour-là !
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <!-- Choix : Avec ou sans planning -->
                            <div class="mb-4">
                                <label class="flex items-center gap-2 cursor-pointer p-3 bg-wood-dark rounded-lg hover:bg-opacity-70 transition">
                                    <input type="checkbox" id="useTrainingPlan" onchange="NutritionPro.toggleTrainingPlan()"
                                           class="w-5 h-5 rounded border-wood-accent bg-skali-darker text-green-400 focus:ring-green-400">
                                    <span class="text-white font-semibold">✨ Activer le calcul avancé avec planning d'entraînement</span>
                                </label>
                            </div>

                            <!-- Section planning (masquée par défaut) -->
                            <div id="trainingPlanSection" class="hidden space-y-4">
                                <!-- Nombre de séances -->
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-semibold text-secondary mb-2">
                                            <i class="fas fa-calendar-week mr-2"></i>
                                            Séances par semaine
                                        </label>
                                        <select id="sessionsPerWeek" onchange="NutritionPro.generateSessionInputs()"
                                                class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition">
                                            <option value="0">0 séance (sédentaire)</option>
                                            <option value="1">1 séance</option>
                                            <option value="2">2 séances</option>
                                            <option value="3" selected>3 séances</option>
                                            <option value="4">4 séances</option>
                                            <option value="5">5 séances</option>
                                            <option value="6">6 séances</option>
                                            <option value="7">7 séances (tous les jours)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-secondary mb-2">
                                            <i class="fas fa-clock mr-2"></i>
                                            Durée moyenne (minutes)
                                        </label>
                                        <input type="number" id="avgDuration" min="15" max="180" value="60"
                                               class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition">
                                    </div>
                                </div>

                                <!-- Détail des séances -->
                                <div id="sessionsDetail" class="space-y-3">
                                    <!-- Généré dynamiquement -->
                                </div>

                                <!-- Résumé des calculs -->
                                <div id="trainingCalculation" class="p-4 bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-600/30 rounded-lg hidden">
                                    <h5 class="font-bold text-green-400 mb-2">📊 Estimation de vos dépenses</h5>
                                    <div class="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span class="text-secondary">Total semaine :</span>
                                            <span class="text-white font-bold" id="weeklyBurn">0 kcal</span>
                                        </div>
                                        <div>
                                            <span class="text-secondary">Moyenne/jour :</span>
                                            <span class="text-white font-bold" id="dailyBurn">0 kcal</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Sinon, utiliser le niveau d'activité classique -->
                            <div id="activityLevelSection" class="space-y-3">
                                <label class="block text-sm font-semibold text-secondary mb-2">
                                    <i class="fas fa-running mr-2"></i>
                                    Niveau d'activité général
                                </label>
                                <select name="activityLevel"
                                        class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition">
                                    <option value="sedentary">Sédentaire (peu ou pas d'exercice)</option>
                                    <option value="light">Léger (1-3 jours/semaine)</option>
                                    <option value="moderate">Modéré (3-5 jours/semaine)</option>
                                    <option value="active" selected>Actif (6-7 jours/semaine)</option>
                                    <option value="very_active">Très actif (2× par jour)</option>
                                </select>
                            </div>
                        </div>

                        <!-- ÉTAPE 3 : Configuration du plan -->
                        <div class="plan-section">
                            <h4 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span class="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-sm">3</span>
                                <i class="fas fa-cogs"></i>
                                Configuration du plan
                            </h4>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label class="block text-sm font-semibold text-secondary mb-2">
                                        <i class="fas fa-calendar-alt mr-2"></i>
                                        Durée (semaines)
                                    </label>
                                    <input type="number" name="duration" min="1" max="52" value="12" required
                                           class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition">
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-secondary mb-2">
                                        <i class="fas fa-utensils mr-2"></i>
                                        Repas par jour
                                    </label>
                                    <select name="mealsPerDay" required
                                            class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition">
                                        <option value="3">3 repas</option>
                                        <option value="4" selected>4 repas</option>
                                        <option value="5">5 repas</option>
                                        <option value="6">6 repas</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-secondary mb-2">
                                        <i class="fas fa-calendar-day mr-2"></i>
                                        Date de début
                                    </label>
                                    <input type="date" name="startDate" value="${new Date().toISOString().split('T')[0]}" required
                                           class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition">
                                </div>
                            </div>
                        </div>

                        <!-- ÉTAPE 4 : Restrictions alimentaires -->
                        <div class="plan-section">
                            <h4 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span class="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-sm">4</span>
                                <i class="fas fa-exclamation-triangle text-yellow-400"></i>
                                Restrictions et préférences
                            </h4>

                            <div class="space-y-4">
                                <!-- Allergies -->
                                <div>
                                    <label class="block text-sm font-semibold text-secondary mb-3">
                                        Allergies et intolérances
                                    </label>
                                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        ${this.RESTRICTIONS.allergies.map(allergy => `
                                            <label class="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" name="allergies" value="${allergy}"
                                                       class="w-5 h-5 rounded border-wood-accent bg-skali-darker text-green-400 focus:ring-green-400">
                                                <span class="text-sm text-secondary">${allergy}</span>
                                            </label>
                                        `).join('')}
                                    </div>
                                </div>

                                <!-- Régimes -->
                                <div>
                                    <label class="block text-sm font-semibold text-secondary mb-3">
                                        Régimes alimentaires
                                    </label>
                                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        ${this.RESTRICTIONS.regimes.map(regime => `
                                            <label class="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" name="regimes" value="${regime}"
                                                       class="w-5 h-5 rounded border-wood-accent bg-skali-darker text-green-400 focus:ring-green-400">
                                                <span class="text-sm text-secondary">${regime}</span>
                                            </label>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Bouton de soumission -->
                        <div class="flex justify-end gap-3">
                            <button type="button" onclick="NutritionPro.currentMember = null; NutritionPro.showMainView()"
                                    class="btn-premium glass-card hover:bg-gray-600">
                                <i class="fas fa-times mr-2"></i>
                                Annuler
                            </button>
                            <button type="submit" class="btn-premium btn-publish">
                                <i class="fas fa-calculator mr-2"></i>
                                Calculer les macros
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    /**
     * Afficher/masquer le planning d'entraînement
     */
    toggleTrainingPlan() {
        const checkbox = document.getElementById('useTrainingPlan');
        const trainingSection = document.getElementById('trainingPlanSection');
        const activitySection = document.getElementById('activityLevelSection');

        if (checkbox.checked) {
            trainingSection.classList.remove('hidden');
            activitySection.classList.add('hidden');
            this.generateSessionInputs();
        } else {
            trainingSection.classList.add('hidden');
            activitySection.classList.remove('hidden');
        }
    },

    /**
     * Générer les inputs pour les séances
     */
    generateSessionInputs() {
        const count = parseInt(document.getElementById('sessionsPerWeek').value);
        const container = document.getElementById('sessionsDetail');
        const avgDuration = parseInt(document.getElementById('avgDuration').value);

        if (count === 0) {
            container.innerHTML = '<p class="text-secondary text-sm italic">Aucune séance d\'entraînement</p>';
            document.getElementById('trainingCalculation').classList.add('hidden');
            return;
        }

        const sessionTypes = [
            { value: 'strength', label: 'Musculation/Force', icon: 'fa-dumbbell', met: 6.0 },
            { value: 'cardio', label: 'Cardio intense', icon: 'fa-running', met: 10.0 },
            { value: 'hiit', label: 'HIIT', icon: 'fa-bolt', met: 12.0 },
            { value: 'endurance', label: 'Endurance', icon: 'fa-heartbeat', met: 8.0 },
            { value: 'crossfit', label: 'CrossFit/WOD', icon: 'fa-fire', met: 11.0 },
            { value: 'gymnastic', label: 'Gymnastique/Skills', icon: 'fa-medal', met: 5.0 },
            { value: 'recovery', label: 'Récupération active', icon: 'fa-spa', met: 3.0 },
            { value: 'mobility', label: 'Mobilité/Yoga', icon: 'fa-praying-hands', met: 2.5 },
            { value: 'team_sport', label: 'Sport d\'équipe', icon: 'fa-basketball-ball', met: 8.0 }
        ];

        let html = '<div class="space-y-3">';

        for (let i = 0; i < count; i++) {
            html += `
                <div class="session-input p-4 bg-wood-dark bg-opacity-30 rounded-lg border border-wood-accent border-opacity-20">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-xs font-bold">${i + 1}</span>
                        <h5 class="font-bold text-white">Séance ${i + 1}</h5>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs text-secondary mb-1">Type de séance</label>
                            <select name="session_${i}_category" onchange="NutritionPro.updateTrainingCalculation()"
                                    class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded px-3 py-2 text-sm focus:border-green-400 focus:ring-1 focus:ring-green-400/20 transition">
                                ${sessionTypes.map(type => `
                                    <option value="${type.value}" data-met="${type.met}">
                                        ${type.label} (~${Math.round(type.met * this.currentMember.weight * (avgDuration / 60))} kcal)
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs text-secondary mb-1">Durée (minutes)</label>
                            <input type="number" name="session_${i}_duration" value="${avgDuration}" min="15" max="180"
                                   onchange="NutritionPro.updateTrainingCalculation()"
                                   class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded px-3 py-2 text-sm focus:border-green-400 focus:ring-1 focus:ring-green-400/20 transition">
                        </div>
                    </div>
                </div>
            `;
        }

        html += '</div>';
        container.innerHTML = html;

        this.updateTrainingCalculation();
    },

    /**
     * Mettre à jour le calcul des dépenses d'entraînement
     */
    updateTrainingCalculation() {
        const count = parseInt(document.getElementById('sessionsPerWeek').value);
        if (count === 0) {return;}

        let totalWeekly = 0;
        const weight = this.currentMember.weight || 70;

        for (let i = 0; i < count; i++) {
            const categorySelect = document.querySelector(`[name="session_${i}_category"]`);
            const durationInput = document.querySelector(`[name="session_${i}_duration"]`);

            if (categorySelect && durationInput) {
                const met = parseFloat(categorySelect.selectedOptions[0].dataset.met);
                const duration = parseInt(durationInput.value);
                const calories = Math.round(met * weight * (duration / 60));
                totalWeekly += calories;
            }
        }

        const dailyAvg = Math.round(totalWeekly / 7);

        document.getElementById('weeklyBurn').textContent = totalWeekly + ' kcal';
        document.getElementById('dailyBurn').textContent = '+' + dailyAvg + ' kcal';
        document.getElementById('trainingCalculation').classList.remove('hidden');
    },

    /**
     * Mettre à jour la description de l'objectif
     * @param objectiveKey
     */
    updateObjectiveDescription(objectiveKey) {
        const objective = this.OBJECTIVES[objectiveKey];
        const container = document.getElementById('objectiveDescription');

        container.innerHTML = `
            <div class="flex items-start gap-3">
                <i class="fas ${objective.icon} text-3xl mt-1" style="color: ${objective.color}"></i>
                <div>
                    <h5 class="font-bold text-white mb-2">${objective.name}</h5>
                    <p class="text-sm text-secondary mb-2">${objective.description}</p>
                    <div class="grid grid-cols-2 gap-4 text-xs">
                        <div>
                            <span class="text-secondary">Calories :</span>
                            <span class="text-white font-semibold">${objective.calorieDeficit > 0 ? '+' : ''}${objective.calorieDeficit} kcal/jour</span>
                        </div>
                        <div>
                            <span class="text-secondary">Protéines :</span>
                            <span class="text-white font-semibold">${objective.proteinMultiplier}g/kg</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.classList.remove('hidden');
    },

    /**
     * Créer un plan avec les données améliorées
     * @param event
     */
    async createEnhancedPlan(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        try {
            // Récupérer les données du formulaire
            const objective = formData.get('objective');
            const duration = parseInt(formData.get('duration'));
            const startDate = formData.get('startDate');
            const mealsPerDay = parseInt(formData.get('mealsPerDay'));
            const allergies = formData.getAll('allergies');
            const regimes = formData.getAll('regimes');

            // Récupérer le planning d'entraînement si activé
            let weeklyTraining = null;
            let activityLevel = formData.get('activityLevel') || 'active';

            const useTraining = document.getElementById('useTrainingPlan').checked;
            if (useTraining) {
                const sessionsCount = parseInt(document.getElementById('sessionsPerWeek').value);
                const sessions = [];

                for (let i = 0; i < sessionsCount; i++) {
                    const category = formData.get(`session_${i}_category`);
                    const duration = parseInt(formData.get(`session_${i}_duration`));

                    if (category && duration) {
                        sessions.push({ category, duration });
                    }
                }

                if (sessions.length > 0) {
                    weeklyTraining = { sessions };
                }
            }

            // Calculer les macros avec le NOUVEAU système
            const macros = NutritionCalculator.calculateMacros(
                this.currentMember,
                objective,
                activityLevel,
                weeklyTraining  // NOUVEAU !
            );

            // Afficher l'écran de prévisualisation AMÉLIORÉ
            await this.showEnhancedMacrosPreview(macros, {
                objective,
                duration,
                startDate,
                mealsPerDay,
                allergies,
                regimes,
                weeklyTraining,
                activityLevel
            });

        } catch (error) {
            console.error('Erreur calcul plan:', error);
            Utils.showNotification('Erreur', error.message, 'error');
        }
    }
});
