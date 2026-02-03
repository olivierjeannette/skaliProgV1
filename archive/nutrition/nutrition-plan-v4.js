/**
 * NUTRITION PLAN V4 - Nouvelle architecture complète
 * Flux cohérent : Planning semaine → Calcul 3 profils → Repas adaptés → PDF cohérent
 */

const NutritionPlanV4 = {
    currentMember: null,
    currentPlanData: null,
    weekConfig: null,
    scheduleConfig: null, // Nouvelle propriété pour les horaires

    /**
     * Démarrer la création d'un plan (appelé après le formulaire)
     * @param member
     * @param planData
     */
    async startPlanCreation(member, planData) {
        this.currentMember = member;
        this.currentPlanData = planData;

        console.log('🚀 Démarrage création plan V4', { member, planData });

        // Étape 1 : Afficher le WeekPlanner pour sélectionner les jours
        WeekPlanner.showWeekSelector((weekConfig) => {
            this.onWeekConfigSelected(weekConfig);
        }, planData.planDuration);
    },

    /**
     * Callback quand le planning hebdomadaire est sélectionné
     * @param weekConfig
     */
    async onWeekConfigSelected(weekConfig) {
        this.weekConfig = weekConfig;
        console.log('📅 Planning hebdomadaire configuré:', weekConfig);

        // Étape 2 : Demander les horaires (réveil, coucher, séances)
        this.showScheduleConfigModal();
    },

    /**
     * Afficher le modal de configuration des horaires
     */
    showScheduleConfigModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-gray-200 bg-opacity-90 flex items-center justify-center z-[100] p-4';
        modal.innerHTML = `
            <div class="bg-skali-darker rounded-xl max-w-2xl w-full border-2 border-green-400">
                <!-- Header -->
                <div class="bg-gradient-to-r from-green-600 to-green-800 p-6 rounded-t-xl">
                    <h2 class="text-2xl font-bold text-white flex items-center gap-3">
                        <i class="fas fa-clock"></i>
                        Configuration des Horaires
                    </h2>
                    <p class="text-green-200 text-sm mt-1">Personnalisez les horaires pour optimiser les repas</p>
                </div>

                <!-- Formulaire -->
                <div class="p-6 space-y-6">
                    <!-- Heure de réveil -->
                    <div>
                        <label class="block text-sm font-bold text-gray-300 mb-2">
                            <i class="fas fa-sun text-yellow-400 mr-2"></i>
                            Heure de réveil
                        </label>
                        <input type="time" id="wakeTime" value="07:00"
                               class="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-green-400 focus:outline-none">
                    </div>

                    <!-- Heure de coucher -->
                    <div>
                        <label class="block text-sm font-bold text-gray-300 mb-2">
                            <i class="fas fa-moon text-blue-400 mr-2"></i>
                            Heure de coucher
                        </label>
                        <input type="time" id="bedTime" value="23:00"
                               class="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-green-400 focus:outline-none">
                    </div>

                    <!-- Horaires des séances -->
                    <div>
                        <label class="block text-sm font-bold text-gray-300 mb-3">
                            <i class="fas fa-dumbbell text-red-400 mr-2"></i>
                            Horaires des séances d'entraînement
                        </label>
                        <div class="space-y-3">
                            ${this.weekConfig.map((day, index) => {
        if (day.activityType.id !== 'rest') {
            return `
                                        <div class="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between">
                                            <div class="flex items-center gap-3">
                                                <i class="fas fa-${day.activityType.icon} text-${day.activityType.color}-400"></i>
                                                <span class="text-white font-semibold">${day.day}</span>
                                                <span class="text-gray-400 text-sm">(${day.activityType.label})</span>
                                            </div>
                                            <input type="time" id="sessionTime_${index}" value="18:00"
                                                   class="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:border-green-400 focus:outline-none">
                                        </div>
                                    `;
        }
        return '';
    }).join('')}
                        </div>
                    </div>

                    <!-- Info -->
                    <div class="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                        <div class="flex items-start gap-3">
                            <i class="fas fa-info-circle text-blue-400 text-lg mt-1"></i>
                            <div class="text-sm text-gray-300">
                                <p class="font-semibold text-white mb-1">À quoi servent ces horaires ?</p>
                                <p>Ces informations permettent de :</p>
                                <ul class="mt-2 space-y-1 ml-4">
                                    <li>• Programmer les repas aux moments optimaux</li>
                                    <li>• Adapter les collations pré/post-entraînement</li>
                                    <li>• Afficher les horaires précis sur le PDF</li>
                                    <li>• Optimiser la répartition énergétique</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- Boutons -->
                    <div class="flex gap-3">
                        <button onclick="this.closest('.fixed').remove()"
                                class="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition">
                            <i class="fas fa-times mr-2"></i>
                            Annuler
                        </button>
                        <button onclick="NutritionPlanV4.saveScheduleConfig()"
                                class="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white rounded-lg font-semibold transition">
                            <i class="fas fa-check mr-2"></i>
                            Confirmer
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    /**
     * Sauvegarder la configuration des horaires
     */
    saveScheduleConfig() {
        const wakeTime = document.getElementById('wakeTime')?.value;
        const bedTime = document.getElementById('bedTime')?.value;

        const sessionTimes = {};
        this.weekConfig.forEach((day, index) => {
            const timeInput = document.getElementById(`sessionTime_${index}`);
            if (timeInput) {
                sessionTimes[day.day] = timeInput.value;
            }
        });

        this.scheduleConfig = {
            wakeTime,
            bedTime,
            sessionTimes
        };

        console.log('⏰ Horaires configurés:', this.scheduleConfig);

        // Fermer le modal
        const modal = document.querySelector('.fixed.inset-0.bg-gray-200');
        if (modal) {modal.remove();}

        // Étape 3 : Calculer les 3 profils de macros
        const profiles = this.calculateThreeProfiles();
        console.log('📊 Profils calculés:', profiles);

        // Étape 4 : Afficher la preview avec les 3 profils
        this.showProfilesPreview(profiles);
    },

    /**
     * Calculer les 3 profils distincts (Repos / Renfo / Cardio)
     */
    calculateThreeProfiles() {
        const member = this.currentMember;
        const planData = this.currentPlanData;

        // Calcul de base (même pour tous)
        const weight = member.weight || 70;
        const age = this.calculateAge(member.birthdate);
        const height = member.height || 175;

        // BMR (Mifflin-St Jeor)
        let bmr;
        if (member.gender === 'male') {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
        } else {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
        }

        // TDEE de base (activité légère 1.375)
        const baseTDEE = Math.round(bmr * 1.375);

        // Ajustement selon l'objectif
        const objectiveMultipliers = {
            mass_gain: 1.15,      // +15% pour prise de masse
            weight_loss: 0.85,    // -15% pour perte de poids
            maintenance: 1.0,     // Maintien
            cutting: 0.80,        // -20% pour sèche
            performance_endurance: 1.10,
            performance_force: 1.12,
            performance_crossfit: 1.10,
            sante_generale: 1.0
        };

        const multiplier = objectiveMultipliers[planData.objective] || 1.0;
        const baseCal = Math.round(baseTDEE * multiplier);

        // CALCUL DES 3 PROFILS
        const profiles = {
            rest: {
                label: 'REPOS',
                description: 'Jour de repos complet',
                icon: 'bed',
                color: 'blue',
                calories: Math.round(baseCal - 200),
                activity: 'Aucune activité',
                burn: 0
            },
            training: {
                label: 'RENFORCEMENT',
                description: 'Séance musculation/renfo',
                icon: 'dumbbell',
                color: 'amber',
                calories: Math.round(baseCal + 150),
                activity: 'Musculation/Renfo',
                burn: 400 // moyenne 300-500
            },
            cardio: {
                label: 'CARDIO',
                description: 'Grosse séance cardio',
                icon: 'running',
                color: 'red',
                calories: Math.round(baseCal + 400),
                activity: 'Cardio intensif',
                burn: 850 // moyenne 700-1000
            }
        };

        // Calculer les macros pour chaque profil
        Object.keys(profiles).forEach(key => {
            const cal = profiles[key].calories;
            profiles[key].macros = this.calculateMacrosForProfile(cal, weight, planData.objective);
            console.log(`📊 Profil ${key}:`, {
                calories: cal,
                calculatedMacros: profiles[key].macros
            });
        });

        // Calculer la moyenne hebdomadaire
        const weeklyAvg = this.calculateWeeklyAverage(profiles);

        return {
            baseBMR: Math.round(bmr),
            baseTDEE: baseTDEE,
            profiles,
            weeklyAverage: weeklyAvg,
            weekConfig: this.weekConfig
        };
    },

    /**
     * Calculer les macros pour un profil donné
     * @param calories
     * @param weight
     * @param objective
     */
    calculateMacrosForProfile(calories, weight, objective) {
        // Ratios selon l'objectif
        const ratios = {
            mass_gain: { protein: 2.2, fatPercent: 0.25 },
            weight_loss: { protein: 2.5, fatPercent: 0.25 },
            maintenance: { protein: 2.0, fatPercent: 0.30 },
            cutting: { protein: 2.5, fatPercent: 0.20 },
            performance_endurance: { protein: 2.0, fatPercent: 0.25 },
            performance_force: { protein: 2.3, fatPercent: 0.25 },
            performance_crossfit: { protein: 2.2, fatPercent: 0.25 },
            sante_generale: { protein: 1.8, fatPercent: 0.30 }
        };

        const ratio = ratios[objective] || ratios.maintenance;

        // Protéines (g/kg)
        const proteinGrams = Math.round(weight * ratio.protein);
        const proteinCal = proteinGrams * 4;

        // Lipides (% des calories)
        const fatsCal = Math.round(calories * ratio.fatPercent);
        const fatsGrams = Math.round(fatsCal / 9);

        // Glucides (le reste)
        const carbsCal = calories - proteinCal - fatsCal;
        const carbsGrams = Math.round(carbsCal / 4);

        // Recalculer le total réel
        const actualTotal = (proteinGrams * 4) + (carbsGrams * 4) + (fatsGrams * 9);

        return {
            calories: actualTotal,
            protein: {
                grams: proteinGrams,
                perKg: Math.round((proteinGrams / weight) * 10) / 10,
                calories: proteinGrams * 4,
                percent: Math.round((proteinGrams * 4 / actualTotal) * 100)
            },
            carbs: {
                grams: carbsGrams,
                perKg: Math.round((carbsGrams / weight) * 10) / 10,
                calories: carbsGrams * 4,
                percent: Math.round((carbsGrams * 4 / actualTotal) * 100)
            },
            fats: {
                grams: fatsGrams,
                perKg: Math.round((fatsGrams / weight) * 10) / 10,
                calories: fatsGrams * 9,
                percent: Math.round((fatsGrams * 9 / actualTotal) * 100)
            }
        };
    },

    /**
     * Calculer la moyenne hebdomadaire selon le planning
     * @param profiles
     */
    calculateWeeklyAverage(profiles) {
        if (!this.weekConfig) {return profiles.training.calories;}

        let totalCal = 0;
        this.weekConfig.forEach(day => {
            const profileKey = day.activityType.id === 'rest' ? 'rest' :
                day.activityType.id === 'cardio' ? 'cardio' : 'training';
            totalCal += profiles[profileKey].calories;
        });

        // Moyenne sur le nombre de jours configurés (1, 7, ou utilise 7 pour le calcul)
        const divisor = this.weekConfig.length || 7;
        return Math.round(totalCal / divisor);
    },

    /**
     * Afficher la preview avec les 3 profils (VERSION MODERNE)
     * @param profilesData
     */
    showProfilesPreview(profilesData) {
        // Utiliser la version moderne si disponible
        if (typeof NutritionPlanV4Modern !== 'undefined') {
            return NutritionPlanV4Modern.showModernProfilesPreview.call(this, profilesData);
        }
        // Sinon utiliser l'ancienne version
        return this.showProfilesPreviewLegacy(profilesData);
    },

    /**
     * Afficher la preview avec les 3 profils (VERSION LEGACY)
     * @param profilesData
     */
    showProfilesPreviewLegacy(profilesData) {
        const { profiles, weeklyAverage, baseBMR, baseTDEE, weekConfig } = profilesData;
        const totalDays = this.currentPlanData.totalDays || 7;
        const durationLabel = totalDays === 1 ? '1 jour' : totalDays === 7 ? '1 semaine' : '1 mois';

        const html = `
            <div class="nutrition-pro-container fade-in-premium">
                <!-- Header -->
                <div class="flex items-center gap-4 mb-8">
                    <button onclick="NutritionPro.showMainView()" class="btn-premium bg-gray-700 hover:bg-gray-600">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div>
                        <h2 class="text-4xl font-bold text-green-400">Plan Nutritionnel ${durationLabel} - ${this.currentMember.name}</h2>
                        <p class="text-gray-400 mt-1">3 profils calculés selon votre planning</p>
                    </div>
                </div>

                <!-- Métabolisme de base -->
                <div class="premium-card mb-6">
                    <div class="grid grid-cols-3 gap-6 text-center">
                        <div>
                            <div class="text-3xl font-bold text-white">${baseBMR}</div>
                            <div class="text-sm text-gray-400">BMR (Repos total)</div>
                        </div>
                        <div>
                            <div class="text-3xl font-bold text-white">${baseTDEE}</div>
                            <div class="text-sm text-gray-400">TDEE (Activité normale)</div>
                        </div>
                        <div>
                            <div class="text-3xl font-bold text-green-400">${weeklyAverage}</div>
                            <div class="text-sm text-gray-400">Moyenne hebdomadaire</div>
                        </div>
                    </div>
                </div>

                <!-- Les 3 profils -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    ${this.renderProfile(profiles.rest, weekConfig)}
                    ${this.renderProfile(profiles.training, weekConfig)}
                    ${this.renderProfile(profiles.cardio, weekConfig)}
                </div>

                <!-- Planning hebdomadaire -->
                <div class="premium-card mb-8">
                    <h3 class="text-2xl font-bold text-green-400 mb-4">
                        <i class="fas fa-calendar-week mr-2"></i>
                        ${totalDays === 1 ? 'Votre journée' : totalDays === 30 ? 'Votre semaine type (répétée sur 30 jours)' : 'Votre planning hebdomadaire'}
                    </h3>
                    <div class="grid ${totalDays === 1 ? 'grid-cols-1 max-w-xs mx-auto' : 'grid-cols-7'} gap-2">
                        ${weekConfig.map(day => this.renderWeekDay(day, profiles)).join('')}
                    </div>
                    ${totalDays === 30 ? '<p class="text-sm text-gray-400 mt-3 text-center"><i class="fas fa-info-circle mr-1"></i>Cette semaine type sera répétée pendant 30 jours</p>' : ''}
                </div>

                <!-- Actions -->
                <div class="flex gap-4">
                    <button onclick="NutritionPlanV4.generateMealPlan()"
                            class="btn-premium btn-publish flex-1">
                        <i class="fas fa-utensils mr-2"></i>
                        Générer les repas (${totalDays} jour${totalDays > 1 ? 's' : ''})
                    </button>
                    <button onclick="WeekPlanner.showWeekSelector((config) => NutritionPlanV4.onWeekConfigSelected(config), NutritionPlanV4.currentPlanData.planDuration)"
                            class="btn-premium bg-amber-600 hover:bg-amber-700">
                        <i class="fas fa-edit mr-2"></i>
                        Modifier le planning
                    </button>
                </div>
            </div>
        `;

        const contentEl = document.getElementById('mainContent') || document.querySelector('#mainApp');
        if (contentEl) {contentEl.innerHTML = html;}
    },

    /**
     * Rendre une carte de profil
     * @param profile
     * @param weekConfig
     */
    renderProfile(profile, weekConfig) {
        const daysCount = weekConfig.filter(d => {
            if (profile.label === 'REPOS') {return d.activityType.id === 'rest';}
            if (profile.label === 'CARDIO') {return d.activityType.id === 'cardio';}
            return d.activityType.id === 'training';
        }).length;

        return `
            <div class="premium-card border-2 border-${profile.color}-600/50">
                <div class="text-center mb-4">
                    <i class="fas fa-${profile.icon} text-5xl text-${profile.color}-400 mb-3"></i>
                    <h3 class="text-2xl font-bold text-white">${profile.label}</h3>
                    <p class="text-sm text-gray-400">${profile.description}</p>
                    <div class="mt-2 text-xs text-${profile.color}-400">${daysCount} jour(s) / semaine</div>
                </div>

                <div class="bg-gray-800/50 rounded-lg p-4 mb-4">
                    <div class="text-4xl font-bold text-white text-center">${profile.calories} kcal</div>
                    <div class="text-xs text-gray-400 text-center mt-1">
                        ${profile.burn > 0 ? `~${profile.burn} kcal dépensées` : 'Aucune dépense'}
                    </div>
                </div>

                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-400">Protéines:</span>
                        <span class="text-white font-semibold">${profile.macros.protein.grams}g (${profile.macros.protein.percent}%)</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Glucides:</span>
                        <span class="text-white font-semibold">${profile.macros.carbs.grams}g (${profile.macros.carbs.percent}%)</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Lipides:</span>
                        <span class="text-white font-semibold">${profile.macros.fats.grams}g (${profile.macros.fats.percent}%)</span>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Rendre un jour de la semaine
     * @param day
     * @param profiles
     */
    renderWeekDay(day, profiles) {
        const profile = profiles[day.activityType.id === 'rest' ? 'rest' :
            day.activityType.id === 'cardio' ? 'cardio' : 'training'];

        return `
            <div class="bg-${day.activityType.color}-900/20 border border-${day.activityType.color}-600/30 rounded-lg p-3 text-center">
                <div class="text-xs font-bold text-gray-400 mb-1">${day.day.substring(0, 3)}</div>
                <i class="fas fa-${day.activityType.icon} text-${day.activityType.color}-400 text-xl mb-2"></i>
                <div class="text-sm font-bold text-white">${profile.calories}</div>
                <div class="text-xs text-gray-400">kcal</div>
            </div>
        `;
    },

    /**
     * Générer le plan de repas
     */
    async generateMealPlan() {
        console.log('🍽️ Génération plan de repas avec profils...');

        // Modal de chargement
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
                    <p id="mealGenStatus" class="text-gray-400 text-sm">Préparation des repas adaptés...</p>
                </div>
            </div>
        `;
        document.body.appendChild(loadingModal);

        try {
            const updateStatus = (msg) => {
                const el = document.getElementById('mealGenStatus');
                if (el) {el.textContent = msg;}
            };

            // Générer les repas pour 7 jours en utilisant le bon profil pour chaque jour
            updateStatus('Génération des repas selon votre planning...');

            const mealPlan = await this.generateWeekMealsWithProfiles();

            updateStatus('Création du PDF professionnel...');

            // Générer le PDF avec les 3 profils
            await this.generatePDFWithProfiles(mealPlan);

            // Fermer le modal
            document.getElementById('mealGenerationLoading').remove();

            Utils.showNotification('Succès !', 'Plan nutritionnel généré avec succès', 'success');

        } catch (error) {
            console.error('❌ Erreur génération:', error);
            const modal = document.getElementById('mealGenerationLoading');
            if (modal) {modal.remove();}
            Utils.showNotification('Erreur', error.message, 'error');
        }
    },

    /**
     * Calculer les horaires de repas optimaux
     * @param dayConfig
     * @param isTrainingDay
     * @param sessionTime
     */
    calculateMealTimings(dayConfig, isTrainingDay, sessionTime) {
        const schedule = this.scheduleConfig;
        if (!schedule) {
            // Horaires par défaut si non configurés
            return {
                breakfast: '08:00',
                snack1: '10:30',
                lunch: '12:30',
                snack2: '16:00',
                dinner: '19:30',
                snack3: '21:00'
            };
        }

        const timings = {};
        const wakeHour = parseInt(schedule.wakeTime.split(':')[0]);
        const wakeMin = parseInt(schedule.wakeTime.split(':')[1]);

        // Fonction helper pour ajouter des heures
        const addHours = (baseHour, baseMin, hoursToAdd, minutesToAdd = 0) => {
            let totalMinutes = (baseHour * 60 + baseMin) + (hoursToAdd * 60 + minutesToAdd);
            const hours = Math.floor(totalMinutes / 60) % 24;
            const minutes = totalMinutes % 60;
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        };

        // Petit-déjeuner : 30-60 min après réveil
        timings.breakfast = addHours(wakeHour, wakeMin, 0, 30);

        if (isTrainingDay && sessionTime) {
            const sessionHour = parseInt(sessionTime.split(':')[0]);
            const sessionMin = parseInt(sessionTime.split(':')[1]);

            // Collation pré-workout : 1h30 avant la séance
            timings.preWorkout = addHours(sessionHour, sessionMin, -1, -30);

            // Collation post-workout : 30 min après la séance
            timings.postWorkout = addHours(sessionHour, sessionMin, 1, 30);

            // Organiser les autres repas autour de la séance
            if (sessionHour < 12) {
                // Séance le matin
                timings.snack1 = timings.preWorkout;
                timings.lunch = timings.postWorkout;
                timings.snack2 = addHours(sessionHour, sessionMin, 4, 0);
                timings.dinner = addHours(sessionHour, sessionMin, 7, 0);
            } else if (sessionHour < 17) {
                // Séance l'après-midi
                timings.snack1 = addHours(wakeHour, wakeMin, 3, 0);
                timings.lunch = addHours(wakeHour, wakeMin, 5, 0);
                timings.snack2 = timings.preWorkout;
                timings.dinner = timings.postWorkout;
            } else {
                // Séance le soir
                timings.snack1 = addHours(wakeHour, wakeMin, 3, 0);
                timings.lunch = addHours(wakeHour, wakeMin, 5, 0);
                timings.snack2 = addHours(wakeHour, wakeMin, 8, 0);
                timings.preWorkout = addHours(sessionHour, sessionMin, -1, -30);
                timings.dinner = timings.postWorkout;
            }
        } else {
            // Jour de repos : répartition standard
            timings.snack1 = addHours(wakeHour, wakeMin, 3, 0);
            timings.lunch = addHours(wakeHour, wakeMin, 5, 0);
            timings.snack2 = addHours(wakeHour, wakeMin, 8, 0);
            timings.dinner = addHours(wakeHour, wakeMin, 12, 0);
            timings.snack3 = addHours(wakeHour, wakeMin, 14, 30);
        }

        return timings;
    },

    /**
     * Ajouter les compléments alimentaires aux repas
     * @param meals
     * @param dayConfig
     * @param mealTimings
     * @param supplementsConfig
     */
    addSupplementsToMeals(meals, dayConfig, mealTimings, supplementsConfig) {
        if (!supplementsConfig || !this.currentPlanData.supplements) {
            return meals;
        }

        const supplements = [];
        const userSupplements = this.currentPlanData.supplements;

        // Créer les compléments basés sur les choix de l'utilisateur
        if (userSupplements.whey) {
            supplements.push({
                name: 'Whey Protein',
                amount: '30g',
                timing: mealTimings.postWorkout || mealTimings.breakfast,
                type: 'post-workout',
                calories: 120,
                protein: 25,
                carbs: 3,
                fats: 1.5
            });
        }

        if (userSupplements.creatine) {
            supplements.push({
                name: 'Créatine',
                amount: '5g',
                timing: mealTimings.postWorkout || mealTimings.breakfast,
                type: 'any',
                calories: 0,
                protein: 0,
                carbs: 0,
                fats: 0
            });
        }

        if (userSupplements.omega3) {
            supplements.push({
                name: 'Oméga-3',
                amount: '2-3g',
                timing: mealTimings.breakfast,
                type: 'morning',
                calories: 25,
                protein: 0,
                carbs: 0,
                fats: 2.5
            });
            supplements.push({
                name: 'Oméga-3',
                amount: '2-3g',
                timing: mealTimings.dinner,
                type: 'evening',
                calories: 25,
                protein: 0,
                carbs: 0,
                fats: 2.5
            });
        }

        if (userSupplements.vitaminD) {
            supplements.push({
                name: 'Vitamine D3',
                amount: '1000-2000 UI',
                timing: mealTimings.breakfast,
                type: 'morning',
                calories: 0,
                protein: 0,
                carbs: 0,
                fats: 0
            });
        }

        if (userSupplements.preworkout) {
            supplements.push({
                name: 'Pré-workout',
                amount: '1 dose',
                timing: mealTimings.preWorkout || addHours(mealTimings.snack2, -0.5),
                type: 'pre-workout',
                calories: 15,
                protein: 0,
                carbs: 3,
                fats: 0
            });
        }

        if (userSupplements.bcaa) {
            supplements.push({
                name: 'BCAA',
                amount: '5-10g',
                timing: 'Pendant entraînement',
                type: 'during-workout',
                calories: 0,
                protein: 0,
                carbs: 0,
                fats: 0
            });
        }

        if (userSupplements.magnesium) {
            supplements.push({
                name: 'Magnésium',
                amount: '300-400mg',
                timing: mealTimings.snack3 || '22:00',
                type: 'evening',
                calories: 0,
                protein: 0,
                carbs: 0,
                fats: 0
            });
        }

        // Ajouter les compléments aux repas appropriés
        meals.forEach(meal => {
            meal.supplements = supplements.filter(supp => {
                // Associer les suppléments aux repas selon leur timing
                if (supp.timing === meal.time ||
                    (meal.name.includes('Petit-déjeuner') && supp.type === 'morning') ||
                    (meal.name.includes('Post') && supp.type === 'post-workout') ||
                    (meal.name.includes('Pré') && supp.type === 'pre-workout') ||
                    (meal.name.includes('Dîner') && supp.type === 'evening')) {
                    return true;
                }
                return false;
            });
        });

        return meals;
    },

    /**
     * Générer les repas de la semaine avec les bons profils
     */
    async generateWeekMealsWithProfiles() {
        const days = [];
        const profiles = this.calculateThreeProfiles().profiles;
        const totalDays = this.currentPlanData.totalDays || 7;

        // Pour 1 mois (30 jours), on répète le pattern de la semaine
        for (let i = 0; i < totalDays; i++) {
            const weekConfigIndex = i % this.weekConfig.length;
            const dayConfig = this.weekConfig[weekConfigIndex];
            const profileKey = dayConfig.activityType.id === 'rest' ? 'rest' :
                dayConfig.activityType.id === 'cardio' ? 'cardio' : 'training';

            const profile = profiles[profileKey];
            const isTrainingDay = dayConfig.activityType.id !== 'rest';
            const sessionTime = this.scheduleConfig?.sessionTimes?.[dayConfig.day];

            // Calculer les horaires optimaux pour ce jour
            const mealTimings = this.calculateMealTimings(dayConfig, isTrainingDay, sessionTime);

            // Générer les repas pour ce jour avec les macros du bon profil
            const dayMeals = await NutritionAIGenerator.generateMealPlan({
                member: this.currentMember,
                macros: {
                    targetCalories: profile.calories,
                    macros: profile.macros
                },
                planData: this.currentPlanData,
                days: 1,
                mealTimings: mealTimings,
                isTrainingDay: isTrainingDay
            });

            // Ajouter les horaires aux repas
            if (dayMeals.days[0].meals) {
                dayMeals.days[0].meals.forEach((meal, idx) => {
                    const timingKeys = Object.keys(mealTimings);
                    if (timingKeys[idx]) {
                        meal.time = mealTimings[timingKeys[idx]];
                    }
                });

                // Ajouter les compléments alimentaires
                if (this.currentPlanData.supplements) {
                    dayMeals.days[0].meals = this.addSupplementsToMeals(
                        dayMeals.days[0].meals,
                        dayConfig,
                        mealTimings,
                        this.currentPlanData.supplements
                    );
                }
            }

            // Nommer le jour selon la durée
            let dayName;
            if (totalDays === 1) {
                dayName = 'Aujourd\'hui';
            } else if (totalDays === 7) {
                dayName = dayConfig.day;
            } else {
                // Pour 1 mois : "Jour 1", "Jour 2", etc.
                dayName = `Jour ${i + 1}`;
            }

            days.push({
                ...dayMeals.days[0],
                dayName: dayName,
                profileType: profileKey,
                profileLabel: profile.label,
                mealTimings: mealTimings,
                sessionTime: sessionTime
            });
        }

        return { days };
    },

    /**
     * Générer le PDF avec les 3 profils
     * @param mealPlan
     */
    async generatePDFWithProfiles(mealPlan) {
        const profilesData = this.calculateThreeProfiles();
        const totalDays = this.currentPlanData.totalDays || 7;

        // Préparer completePlan pour le PDF
        const completePlan = {
            adjustedMacros: {
                bmr: profilesData.baseBMR,
                tdee: profilesData.baseTDEE,
                targetCalories: profilesData.weeklyAverage,
                macros: profilesData.profiles.training.macros // Profil par défaut pour l'affichage général
            },
            morphotype: { type: 'mesomorphe' },
            bodyComposition: {},
            calorieCycling: {
                rest_day: { calories: profilesData.profiles.rest.calories },
                moderate_day: { calories: profilesData.profiles.training.calories },
                high_day: { calories: profilesData.profiles.cardio.calories },
                weeklyAverage: profilesData.weeklyAverage
            },
            mealsDistribution: [],
            micronutrients: {
                daily: {
                    vitaminD: { amount: '1000-2000 UI', role: 'Sante osseuse, immunite' },
                    omega3: { amount: '2-3g EPA+DHA', role: 'Anti-inflammatoire, sante cardiovasculaire' },
                    magnesium: { amount: '300-400mg', role: 'Relaxation musculaire, sommeil' },
                    zinc: { amount: '15-30mg', role: 'Immunite, testosterone' },
                    vitaminB: { amount: 'Complexe B', role: 'Energie, metabolisme' }
                }
            },
            supplements: {
                essential: this.generateSupplements(this.currentPlanData.objective)
            },
            hydration: {
                daily: Math.round(this.currentMember.weight * 0.04 * 10) / 10,
                perMeal: Math.round(this.currentMember.weight * 0.01 * 10) / 10
            }
        };

        // Callback de progression
        const onProgress = async (progress, message) => {
            const el = document.getElementById('mealGenStatus');
            if (el) {el.textContent = message;}
        };

        // Générer le PDF avec les macros du profil repos (par défaut)
        const macrosForPDF = {
            targetCalories: profilesData.profiles.rest.calories,
            macros: profilesData.profiles.rest.macros
        };

        // Générer le PDF
        const doc = await NutritionPDF.generatePDF(
            mealPlan,
            macrosForPDF,
            this.currentPlanData,
            this.currentMember,
            totalDays,
            onProgress
        );

        // Sauvegarder localement et récupérer le blob
        const durationLabel = totalDays === 1 ? '1jour' : totalDays === 7 ? '1semaine' : '1mois';
        const filename = `nutrition_${durationLabel}_${this.currentMember.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

        // Sauvegarder le PDF et récupérer le blob
        await NutritionPDF.save(doc, filename);
        const blob = await NutritionPDF.getBlob(doc);

        // Stocker le blob pour l'envoi Discord
        this.lastGeneratedPdfBlob = blob;
        this.lastGeneratedPdfFilename = filename;

        // Proposer l'envoi Discord
        this.showDiscordSendModal(blob, filename);
    },

    /**
     * Afficher modal pour envoyer vers Discord
     * @param blob
     * @param filename
     */
    showDiscordSendModal(blob, filename) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-gray-200 bg-opacity-90 flex items-center justify-center z-[100] p-4';
        modal.innerHTML = `
            <div class="bg-skali-darker rounded-xl max-w-2xl w-full border-2 border-green-400">
                <!-- Header -->
                <div class="bg-gradient-to-r from-green-600 to-green-800 p-6 rounded-t-xl">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-2xl font-bold text-white flex items-center gap-3">
                                <i class="fas fa-paper-plane"></i>
                                Envoyer le Plan Nutritionnel
                            </h2>
                            <p class="text-green-200 text-sm mt-1">PDF généré avec succès !</p>
                        </div>
                        <button onclick="this.closest('.fixed').remove()" class="text-white hover:text-red-400 transition-colors">
                            <i class="fas fa-times text-2xl"></i>
                        </button>
                    </div>
                </div>

                <!-- Choix d'envoi -->
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <!-- Option 1: Portail Membre -->
                        <button onclick="NutritionPlanV4.showPortalUploadSection()"
                                class="bg-gradient-to-br from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 p-6 rounded-xl transition-all transform hover:scale-105 border-2 border-green-400 shadow-lg">
                            <i class="fas fa-user text-4xl text-white mb-3"></i>
                            <h3 class="text-xl font-bold text-white mb-2">Portail Membre</h3>
                            <p class="text-green-100 text-sm">Upload direct vers l'espace personnel de l'adhérent</p>
                        </button>

                        <!-- Option 2: Discord Webhook -->
                        <button onclick="NutritionPlanV4.showDiscordSection()"
                                class="bg-gradient-to-br from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 p-6 rounded-xl transition-all transform hover:scale-105 border-2 border-indigo-400 shadow-lg">
                            <i class="fab fa-discord text-4xl text-white mb-3"></i>
                            <h3 class="text-xl font-bold text-white mb-2">Discord Webhook</h3>
                            <p class="text-indigo-100 text-sm">Envoyer dans un canal Discord via webhook</p>
                        </button>
                    </div>

                    <!-- Section Portail (cachée par défaut) -->
                    <div id="portalSection" class="hidden"></div>

                    <!-- Section Discord (cachée par défaut) -->
                    <div id="discordSection" class="hidden"></div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    /**
     * Afficher la section d'upload vers le portail
     */
    showPortalUploadSection() {
        const portalSection = document.getElementById('portalSection');
        const discordSection = document.getElementById('discordSection');

        discordSection.classList.add('hidden');
        portalSection.classList.remove('hidden');

        portalSection.innerHTML = `
            <div class="bg-gray-800/50 rounded-lg p-6 space-y-4">
                <h3 class="text-lg font-bold text-green-400 mb-4">
                    <i class="fas fa-upload mr-2"></i>
                    Upload vers le Portail Membre
                </h3>

                <div>
                    <label class="block text-sm font-bold text-gray-300 mb-2">Titre du plan</label>
                    <input type="text" id="pdfTitle"
                           value="Plan nutritionnel - ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}"
                           class="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-green-400 focus:outline-none">
                </div>

                <div>
                    <label class="block text-sm font-bold text-gray-300 mb-2">Durée du plan</label>
                    <select id="pdfDuration" class="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-green-400 focus:outline-none">
                        <option value="1 jour">1 jour</option>
                        <option value="1 semaine">1 semaine</option>
                        <option value="1 mois" selected>1 mois</option>
                    </select>
                </div>

                <div class="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                    <div class="flex items-start gap-3">
                        <i class="fas fa-info-circle text-blue-400 text-lg mt-1"></i>
                        <div class="text-sm text-gray-300">
                            <p class="font-semibold text-white mb-1">Information</p>
                            <p>Le PDF sera uploadé dans l'espace personnel de <strong>${this.currentMember.name}</strong>.</p>
                            <p class="mt-2">L'adhérent pourra consulter et télécharger ce plan depuis son portail membre.</p>
                        </div>
                    </div>
                </div>

                <div class="flex gap-3">
                    <button onclick="document.getElementById('portalSection').classList.add('hidden')"
                            class="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition">
                        <i class="fas fa-arrow-left mr-2"></i>
                        Retour
                    </button>
                    <button onclick="NutritionPlanV4.uploadToMemberPortal()"
                            class="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white rounded-lg font-semibold transition">
                        <i class="fas fa-cloud-upload-alt mr-2"></i>
                        Upload vers le portail
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Afficher la section Discord
     */
    showDiscordSection() {
        const portalSection = document.getElementById('portalSection');
        const discordSection = document.getElementById('discordSection');

        portalSection.classList.add('hidden');
        discordSection.classList.remove('hidden');

        discordSection.innerHTML = `
            <div class="bg-gray-800/50 rounded-lg p-6 space-y-4">
                <h3 class="text-lg font-bold text-indigo-400 mb-4">
                    <i class="fab fa-discord mr-2"></i>
                    Envoi via Webhook Discord
                </h3>

                <div>
                    <label class="block text-sm font-bold text-gray-300 mb-2">Webhook URL</label>
                    <input type="text" id="discordWebhookUrl"
                           value="${typeof DiscordNotifier !== 'undefined' ? DiscordNotifier.config?.webhookUrl || '' : ''}"
                           placeholder="https://discord.com/api/webhooks/..."
                           class="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-green-400 focus:outline-none">
                </div>

                <div>
                    <label class="block text-sm font-bold text-gray-300 mb-2">Message (optionnel)</label>
                    <textarea id="discordMessage" rows="3"
                              placeholder="Message d'accompagnement..."
                              class="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-green-400 focus:outline-none resize-none"></textarea>
                </div>

                <div class="flex gap-3">
                    <button onclick="document.getElementById('discordSection').classList.add('hidden')"
                            class="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition">
                        <i class="fas fa-arrow-left mr-2"></i>
                        Retour
                    </button>
                    <button onclick="NutritionPlanV4.sendToDiscordWebhook()"
                            class="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-700 hover:from-indigo-600 hover:to-purple-800 text-white rounded-lg font-semibold transition">
                        <i class="fab fa-discord mr-2"></i>
                        Envoyer sur Discord
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Upload du PDF vers le portail membre
     */
    async uploadToMemberPortal() {
        console.log('📤 Upload vers le portail membre...');

        try {
            const title = document.getElementById('pdfTitle')?.value?.trim();
            const duration = document.getElementById('pdfDuration')?.value;
            const pdfBlob = this.lastGeneratedPdfBlob;
            const filename = this.lastGeneratedPdfFilename;

            if (!title) {
                Utils.showNotification('Erreur', 'Veuillez entrer un titre', 'error');
                return;
            }

            if (!pdfBlob) {
                Utils.showNotification('Erreur', 'PDF introuvable', 'error');
                return;
            }

            // Afficher le loading
            const uploadBtn = document.querySelector('button[onclick*="uploadToMemberPortal"]');
            if (uploadBtn) {
                uploadBtn.disabled = true;
                uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Upload en cours...';
            }

            // Chemin dans Storage: membre-id/filename
            const storagePath = `${this.currentMember.id}/${filename}`;

            console.log('📂 Upload fichier vers Storage:', storagePath);

            // 1. Upload du fichier dans Supabase Storage
            const { data: uploadData, error: uploadError } = await SupabaseManager.supabase.storage
                .from('nutrition-pdfs')
                .upload(storagePath, pdfBlob, {
                    contentType: 'application/pdf',
                    upsert: true
                });

            if (uploadError) {throw uploadError;}

            console.log('✅ Fichier uploadé:', uploadData);

            // 2. Créer l'entrée dans la base de données
            const { data: dbData, error: dbError } = await SupabaseManager.supabase
                .from('member_nutrition_pdfs')
                .insert({
                    member_id: this.currentMember.id,
                    title: title,
                    filename: filename,
                    file_path: storagePath,
                    file_size: pdfBlob.size,
                    duration: duration
                });

            if (dbError) {throw dbError;}

            console.log('✅ Entrée DB créée');

            // Fermer le modal
            const modal = document.querySelector('.fixed.inset-0.bg-gray-200');
            if (modal) {modal.remove();}

            Utils.showNotification(
                'Succès !',
                `Le plan a été envoyé vers le portail de ${this.currentMember.name}`,
                'success'
            );

        } catch (error) {
            console.error('❌ Erreur upload portail:', error);

            // Restaurer le bouton
            const uploadBtn = document.querySelector('button[onclick*="uploadToMemberPortal"]');
            if (uploadBtn) {
                uploadBtn.disabled = false;
                uploadBtn.innerHTML = '<i class="fas fa-cloud-upload-alt mr-2"></i>Upload vers le portail';
            }

            Utils.showNotification('Erreur', error.message || 'Impossible d\'uploader le PDF', 'error');
        }
    },

    /**
     * Envoyer le PDF vers Discord via webhook
     */
    async sendToDiscordWebhook() {
        console.log('🚀 Tentative d\'envoi Discord...');

        try {
            const webhookUrl = document.getElementById('discordWebhookUrl')?.value?.trim();
            const customMessage = document.getElementById('discordMessage')?.value?.trim();
            const mentionUser = document.getElementById('discordMentionUser')?.checked;
            const userId = document.getElementById('discordUserId')?.value?.trim();

            console.log('📋 Données collectées:', {
                hasWebhook: !!webhookUrl,
                mentionUser,
                hasUserId: !!userId
            });

            // Validation
            if (!webhookUrl) {
                console.error('❌ Webhook manquant');
                Utils.showNotification('Erreur', 'Veuillez entrer l\'URL du webhook Discord', 'error');
                return;
            }

            if (!webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
                Utils.showNotification('Erreur', 'URL du webhook invalide', 'error');
                return;
            }

            if (mentionUser && !userId) {
                Utils.showNotification('Erreur', 'Veuillez entrer l\'ID de l\'utilisateur à mentionner', 'error');
                return;
            }

            // Récupérer le blob du PDF
            const pdfBlob = this.lastGeneratedPdfBlob;
            const filename = this.lastGeneratedPdfFilename;

            console.log('📄 PDF:', {
                hasBlob: !!pdfBlob,
                filename,
                blobSize: pdfBlob?.size
            });

            if (!pdfBlob) {
                Utils.showNotification('Erreur', 'PDF introuvable', 'error');
                return;
            }

            // Afficher le loading
            const modal = document.querySelector('.fixed.inset-0');
            const sendBtn = modal.querySelector('button[onclick*="sendToDiscordWebhook"]');
            sendBtn.disabled = true;
            sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Envoi...';

            // Créer le FormData pour Discord
            const formData = new FormData();

            // Construire le message avec mention si demandé
            let messageContent = '';
            if (mentionUser && userId) {
                messageContent = `<@${userId}> `;
            }
            messageContent += customMessage || `📄 **Plan nutritionnel** pour **${this.currentMember.name}**`;

            const payload = {
                content: messageContent
            };
            formData.append('payload_json', JSON.stringify(payload));

            // Ajouter le fichier PDF
            formData.append('file', pdfBlob, filename);

            console.log('📤 Envoi vers Discord...');

            // Envoyer vers Discord
            const response = await fetch(webhookUrl, {
                method: 'POST',
                body: formData
            });

            console.log('📥 Réponse Discord:', { status: response.status, ok: response.ok });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Erreur Discord:', errorText);
                throw new Error(`Erreur Discord (${response.status}): ${errorText}`);
            }

            console.log('✅ PDF envoyé avec succès !');

            // Succès - sauvegarder le webhook pour la prochaine fois
            if (typeof DiscordNotifier !== 'undefined') {
                DiscordNotifier.config.webhookUrl = webhookUrl;
                DiscordNotifier.saveConfig();
            }

            // Fermer le modal
            modal.remove();

            Utils.showNotification(
                'Envoyé !',
                mentionUser ? 'Le plan nutritionnel a été envoyé avec mention sur Discord' : 'Le plan nutritionnel a été envoyé sur Discord',
                'success'
            );

        } catch (error) {
            console.error('❌ Erreur globale envoi Discord:', error);
            console.error('Stack trace:', error.stack);

            // Restaurer le bouton
            const modal = document.querySelector('.fixed.inset-0');
            if (modal) {
                const sendBtn = modal.querySelector('button[onclick*="sendToDiscordWebhook"]');
                if (sendBtn) {
                    sendBtn.disabled = false;
                    sendBtn.innerHTML = '<i class="fab fa-discord mr-2"></i>Envoyer';
                }
            }

            Utils.showNotification('Erreur', error.message || 'Erreur inconnue', 'error');
        }
    },

    // Stocker le dernier PDF généré
    lastGeneratedPdfBlob: null,
    lastGeneratedPdfFilename: null,

    /**
     * Calculer l'âge
     * @param birthdate
     */
    calculateAge(birthdate) {
        const today = new Date();
        const birth = new Date(birthdate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    },

    /**
     * Générer les recommandations de supplémentation selon l'objectif
     * @param objective
     */
    generateSupplements(objective) {
        const baseSupplements = [
            {
                name: 'Omega-3 (EPA/DHA)',
                dosage: '2-3g/jour',
                timing: 'Avec les repas',
                benefits: 'Anti-inflammatoire, sante cardiovasculaire, recuperation',
                priority: 'ESSENTIEL'
            },
            {
                name: 'Vitamine D3',
                dosage: '1000-2000 UI/jour',
                timing: 'Matin avec petit-dejeuner',
                benefits: 'Sante osseuse, immunite, humeur',
                priority: 'ESSENTIEL'
            },
            {
                name: 'Magnesium',
                dosage: '300-400mg/jour',
                timing: 'Soir avant coucher',
                benefits: 'Relaxation musculaire, sommeil, anti-stress',
                priority: 'RECOMMANDE'
            }
        ];

        // Suppléments spécifiques selon l'objectif
        const objectiveSupplements = {
            mass_gain: [
                {
                    name: 'Creatine Monohydrate',
                    dosage: '5g/jour',
                    timing: 'Post-entrainement ou matin',
                    benefits: 'Force, volume musculaire, recuperation',
                    priority: 'RECOMMANDE'
                },
                {
                    name: 'Whey Protein',
                    dosage: '25-30g',
                    timing: 'Post-entrainement',
                    benefits: 'Synthese proteique, recuperation musculaire',
                    priority: 'OPTIONNEL'
                }
            ],
            weight_loss: [
                {
                    name: 'Cafeine',
                    dosage: '200-400mg',
                    timing: 'Matin et pre-entrainement',
                    benefits: 'Energie, thermogenese, performance',
                    priority: 'OPTIONNEL'
                },
                {
                    name: 'L-Carnitine',
                    dosage: '2-3g/jour',
                    timing: 'Avant cardio',
                    benefits: 'Oxydation des graisses, energie',
                    priority: 'OPTIONNEL'
                }
            ],
            performance_crossfit: [
                {
                    name: 'Creatine Monohydrate',
                    dosage: '5g/jour',
                    timing: 'Post-entrainement',
                    benefits: 'Explosivite, force, recuperation',
                    priority: 'RECOMMANDE'
                },
                {
                    name: 'Beta-Alanine',
                    dosage: '3-5g/jour',
                    timing: 'Pre-entrainement',
                    benefits: 'Endurance musculaire, reduction acidite',
                    priority: 'OPTIONNEL'
                },
                {
                    name: 'BCAA',
                    dosage: '5-10g',
                    timing: 'Pendant entrainement long',
                    benefits: 'Endurance, anti-catabolisme',
                    priority: 'OPTIONNEL'
                }
            ]
        };

        const specificSupps = objectiveSupplements[objective] || [];
        return [...baseSupplements, ...specificSupps];
    }
};

// Exposer globalement
window.NutritionPlanV4 = NutritionPlanV4;
