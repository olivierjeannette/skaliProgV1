/**
 * WEEK PLANNER - Planification hebdomadaire avec types d'activité
 * Permet de définir le type d'activité pour chaque jour de la semaine
 */

const WeekPlanner = {
    // Types d'activité
    ACTIVITY_TYPES: {
        REST: {
            id: 'rest',
            label: 'Repos',
            icon: 'bed',
            color: 'blue',
            calorieAdjustment: -200,
            description: 'Jour de repos complet (0 kcal dépensées)'
        },
        TRAINING: {
            id: 'training',
            label: 'Renforcement',
            icon: 'dumbbell',
            color: 'amber',
            calorieAdjustment: +150,
            avgBurn: 400, // 300-500 kcal
            description: 'Séance de musculation/renfo (300-500 kcal)'
        },
        CARDIO: {
            id: 'cardio',
            label: 'Cardio',
            icon: 'running',
            color: 'red',
            calorieAdjustment: +400,
            avgBurn: 850, // 700-1000 kcal
            description: 'Grosse séance cardio (700-1000 kcal)'
        }
    },

    // Jours de la semaine
    DAYS: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],

    /**
     * Afficher le sélecteur de planning hebdomadaire
     * @param onComplete
     * @param planDuration
     */
    showWeekSelector(onComplete, planDuration = '1week') {
        this.currentPlanDuration = planDuration;

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-gray-200 bg-opacity-90 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-skali-darker rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-green-400">
                <!-- Header -->
                <div class="bg-gradient-to-r from-green-600 to-green-800 p-6 rounded-t-xl sticky top-0 z-10">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-2xl font-bold text-white flex items-center gap-3">
                                <i class="fas fa-calendar-week"></i>
                                ${this.getPlanningTitle(planDuration)}
                            </h2>
                            <p class="text-green-200 text-sm mt-1">Définissez le type d'activité pour chaque jour</p>
                        </div>
                        <button onclick="this.closest('.fixed').remove()" class="text-white hover:text-red-400 transition-colors">
                            <i class="fas fa-times text-2xl"></i>
                        </button>
                    </div>
                </div>

                <div class="p-6">
                    <!-- Explication -->
                    <div class="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 mb-6">
                        <div class="flex items-start gap-3">
                            <i class="fas fa-info-circle text-blue-400 text-xl mt-1"></i>
                            <div class="text-sm text-secondary">
                                <p class="mb-2">Sélectionnez le type d'activité pour chaque jour afin de calculer les calories optimales :</p>
                                <ul class="space-y-1 ml-4">
                                    <li><strong class="text-blue-400">Repos:</strong> Calories de base - 200 kcal</li>
                                    <li><strong class="text-amber-400">Renforcement:</strong> Calories de base + 150 kcal (séance ~400 kcal)</li>
                                    <li><strong class="text-red-400">Cardio:</strong> Calories de base + 400 kcal (séance ~850 kcal)</li>
                                </ul>
                                ${planDuration === '1month' ? '<p class="mt-2 text-yellow-300"><i class="fas fa-lightbulb mr-1"></i>Pour 1 mois : configurez une semaine type qui sera répétée</p>' : ''}
                            </div>
                        </div>
                    </div>

                    <!-- Grille des jours -->
                    <div class="space-y-3" id="weekPlannerDays">
                        ${this.renderDaysForDuration(planDuration)}
                    </div>

                    <!-- Templates rapides -->
                    ${planDuration !== '1day' ? `
                    <div class="mt-6 p-4 glass-list-item rounded-lg">
                        <h4 class="text-sm font-bold text-secondary mb-3">Templates rapides :</h4>
                        <div class="flex flex-wrap gap-2">
                            <button onclick="WeekPlanner.applyTemplate('classic')"
                                    class="px-3 py-1 text-xs glass-card hover:bg-gray-600 text-white rounded transition">
                                Classique (3x Renfo)
                            </button>
                            <button onclick="WeekPlanner.applyTemplate('intense')"
                                    class="px-3 py-1 text-xs glass-card hover:bg-gray-600 text-white rounded transition">
                                Intense (4x Renfo + 2x Cardio)
                            </button>
                            <button onclick="WeekPlanner.applyTemplate('endurance')"
                                    class="px-3 py-1 text-xs glass-card hover:bg-gray-600 text-white rounded transition">
                                Endurance (5x Cardio)
                            </button>
                            <button onclick="WeekPlanner.applyTemplate('recovery')"
                                    class="px-3 py-1 text-xs glass-card hover:bg-gray-600 text-white rounded transition">
                                Récupération (Repos)
                            </button>
                        </div>
                    </div>
                    ` : ''}

                    <!-- Bouton valider -->
                    <button onclick="WeekPlanner.validateWeekPlan()"
                            class="w-full mt-6 bg-gradient-to-r from-green-500 to-green-700 text-white px-6 py-4 rounded-lg font-bold text-lg hover:from-green-600 hover:to-green-800 transition-all">
                        <i class="fas fa-check mr-2"></i>
                        Valider le planning
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.currentCallback = onComplete;

        // Appliquer template par défaut selon la durée
        if (planDuration === '1day') {
            this.selectDayType(0, 'training'); // Par défaut : jour d'entraînement
        } else {
            this.applyTemplate('classic');
        }
    },

    /**
     * Obtenir le titre selon la durée
     * @param planDuration
     */
    getPlanningTitle(planDuration) {
        switch(planDuration) {
            case '1day': return 'Planification 1 jour';
            case '1month': return 'Planification 1 mois (semaine type)';
            default: return 'Planification Hebdomadaire';
        }
    },

    /**
     * Render days selon la durée
     * @param planDuration
     */
    renderDaysForDuration(planDuration) {
        if (planDuration === '1day') {
            return this.renderDaySelector('Aujourd\'hui', 0);
        }
        // Pour 1 semaine ou 1 mois (on configure 1 semaine qui sera répétée)
        return this.DAYS.map((day, index) => this.renderDaySelector(day, index)).join('');
    },

    /**
     * Rendre un sélecteur de jour
     * @param dayName
     * @param dayIndex
     */
    renderDaySelector(dayName, dayIndex) {
        return `
            <div class="flex items-center gap-3 p-4 rounded-lg" style="background-color: #1f2937;">
                <div class="w-32 font-bold text-white text-lg">${dayName}</div>
                <div class="flex-1 flex gap-3">
                    <button onclick="WeekPlanner.selectDayType(${dayIndex}, 'rest')"
                            data-day="${dayIndex}"
                            data-type="rest"
                            class="day-type-btn flex-1 px-5 py-4 rounded-lg border-2 transition-all"
                            style="border-color: #3b82f6; background-color: #1e40af;">
                        <div class="text-center">
                            <i class="fas fa-bed text-2xl mb-2 text-white"></i>
                            <div class="text-sm font-bold text-white">Repos</div>
                        </div>
                    </button>
                    <button onclick="WeekPlanner.selectDayType(${dayIndex}, 'training')"
                            data-day="${dayIndex}"
                            data-type="training"
                            class="day-type-btn flex-1 px-5 py-4 rounded-lg border-2 transition-all"
                            style="border-color: #f59e0b; background-color: #b45309;">
                        <div class="text-center">
                            <i class="fas fa-dumbbell text-2xl mb-2 text-white"></i>
                            <div class="text-sm font-bold text-white">Renfo</div>
                        </div>
                    </button>
                    <button onclick="WeekPlanner.selectDayType(${dayIndex}, 'cardio')"
                            data-day="${dayIndex}"
                            data-type="cardio"
                            class="day-type-btn flex-1 px-5 py-4 rounded-lg border-2 transition-all"
                            style="border-color: #ef4444; background-color: #b91c1c;">
                        <div class="text-center">
                            <i class="fas fa-running text-2xl mb-2 text-white"></i>
                            <div class="text-sm font-bold text-white">Cardio</div>
                        </div>
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Sélectionner le type d'activité pour un jour
     * @param dayIndex
     * @param typeId
     */
    selectDayType(dayIndex, typeId) {
        // Retirer la sélection de tous les boutons de ce jour
        const dayButtons = document.querySelectorAll(`[data-day="${dayIndex}"]`);
        dayButtons.forEach(btn => {
            btn.classList.remove('ring-2', 'ring-white', 'ring-offset-2', 'ring-offset-gray-800');
        });

        // Ajouter la sélection au bouton cliqué
        const selectedBtn = document.querySelector(`[data-day="${dayIndex}"][data-type="${typeId}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('ring-2', 'ring-white', 'ring-offset-2', 'ring-offset-gray-800');
        }
    },

    /**
     * Appliquer un template
     * @param templateName
     */
    applyTemplate(templateName) {
        const templates = {
            classic: ['rest', 'training', 'rest', 'training', 'rest', 'training', 'rest'], // 3x renfo
            intense: ['training', 'cardio', 'training', 'rest', 'training', 'cardio', 'rest'], // 4x renfo + 2x cardio
            endurance: ['cardio', 'rest', 'cardio', 'cardio', 'rest', 'cardio', 'cardio'], // 5x cardio
            recovery: ['rest', 'rest', 'rest', 'rest', 'rest', 'rest', 'rest'] // Repos complet
        };

        const template = templates[templateName] || templates.classic;
        template.forEach((typeId, dayIndex) => {
            this.selectDayType(dayIndex, typeId);
        });
    },

    /**
     * Valider le planning et retourner la configuration
     */
    validateWeekPlan() {
        const weekConfig = [];
        const numDays = this.currentPlanDuration === '1day' ? 1 : 7;

        for (let dayIndex = 0; dayIndex < numDays; dayIndex++) {
            const selectedBtn = document.querySelector(`[data-day="${dayIndex}"].ring-2`);
            const typeId = selectedBtn ? selectedBtn.dataset.type : 'rest';
            const activityType = Object.values(this.ACTIVITY_TYPES).find(t => t.id === typeId);

            weekConfig.push({
                day: this.currentPlanDuration === '1day' ? 'Aujourd\'hui' : this.DAYS[dayIndex],
                dayIndex,
                activityType: activityType
            });
        }

        // Fermer le modal
        document.querySelector('.fixed.inset-0').remove();

        // Appeler le callback
        if (this.currentCallback) {
            this.currentCallback(weekConfig);
        }

        return weekConfig;
    },

    /**
     * Calculer les calories pour chaque jour selon le planning
     * @param baseCal
     * @param weekConfig
     */
    calculateDailyCalories(baseCal, weekConfig) {
        return weekConfig.map(day => ({
            ...day,
            calories: Math.round(baseCal + day.activityType.calorieAdjustment),
            avgBurn: day.activityType.avgBurn || 0
        }));
    }
};

// Exposer globalement
window.WeekPlanner = WeekPlanner;
