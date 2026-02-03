/**
 * ═══════════════════════════════════════════════════════════════
 * NUTRITION PLANNER - Interface de programmation ultra-complète
 * Questionnaire détaillé + Génération + Prévisualisation
 * ═══════════════════════════════════════════════════════════════
 */

const NutritionPlanner = {
    currentMember: null,
    formData: {},
    currentStep: 1,
    totalSteps: 5,

    /**
     * ═══════════════════════════════════════════════════════════
     * INITIALISATION
     * ═══════════════════════════════════════════════════════════
     * @param memberId
     */
    async init(memberId) {
        console.log('📋 Nutrition Planner - Initialisation');

        try {
            // Charger le membre
            const members = await SupabaseManager.getMembers();
            this.currentMember = members.find(m => m.id === memberId);

            if (!this.currentMember) {
                throw new Error('Membre non trouvé');
            }

            // Réinitialiser les données
            this.formData = {};
            this.currentStep = 1;

            // Afficher l'interface
            await this.showPlannerInterface();
        } catch (error) {
            console.error('❌ Erreur initialisation planner:', error);
            Utils.showNotification('Erreur', error.message, 'error');
        }
    },

    /**
     * ═══════════════════════════════════════════════════════════
     * INTERFACE PRINCIPALE - Multi-étapes
     * ═══════════════════════════════════════════════════════════
     */
    async showPlannerInterface() {
        const html = `
            <div class="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 pb-12">
                <!-- Header fixe -->
                <div class="sticky top-0 z-40 bg-gray-900 border-b border-green-500 border-opacity-30">
                    <div class="max-w-5xl mx-auto px-6 py-4">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <button onclick="NutritionMemberManager.selectMember('${this.currentMember.id}')"
                                        class="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700
                                               text-white flex items-center justify-center transition-all">
                                    <i class="fas fa-arrow-left"></i>
                                </button>
                                <div>
                                    <h1 class="text-2xl font-bold text-white">Nouvelle programmation nutrition</h1>
                                    <p class="text-green-300 text-sm">${this.currentMember.name}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Progress bar -->
                        <div class="mt-4">
                            <div class="flex items-center justify-between mb-2">
                                ${this.renderStepIndicators()}
                            </div>
                            <div class="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div class="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                                     style="width: ${(this.currentStep / this.totalSteps) * 100}%"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Contenu de l'étape actuelle -->
                <div class="max-w-5xl mx-auto px-6 py-8">
                    <div id="stepContent">
                        ${this.renderCurrentStep()}
                    </div>

                    <!-- Boutons de navigation -->
                    <div class="flex gap-4 mt-8">
                        ${
                            this.currentStep > 1
                                ? `
                            <button onclick="NutritionPlanner.previousStep()"
                                    class="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg
                                           font-semibold transition-all">
                                <i class="fas fa-arrow-left mr-2"></i>
                                Précédent
                            </button>
                        `
                                : ''
                        }

                        ${
                            this.currentStep < this.totalSteps
                                ? `
                            <button onclick="NutritionPlanner.nextStep()"
                                    class="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600
                                           hover:from-green-600 hover:to-emerald-700 text-white rounded-lg
                                           font-semibold transition-all hover:scale-105 shadow-lg">
                                Suivant
                                <i class="fas fa-arrow-right ml-2"></i>
                            </button>
                        `
                                : `
                            <button onclick="NutritionPlanner.generatePlan()"
                                    class="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600
                                           hover:from-green-600 hover:to-emerald-700 text-white rounded-lg
                                           font-bold text-lg transition-all hover:scale-105 shadow-xl
                                           shadow-green-500/30">
                                <i class="fas fa-magic mr-2"></i>
                                Générer le programme
                            </button>
                        `
                        }
                    </div>
                </div>
            </div>
        `;

        const contentEl =
            document.getElementById('mainContent') || document.getElementById('mainApp');
        contentEl.innerHTML = html;
    },

    /**
     * Rendu des indicateurs d'étapes
     */
    renderStepIndicators() {
        const steps = [
            { num: 1, label: 'Objectif', icon: 'fa-bullseye' },
            { num: 2, label: 'Profil', icon: 'fa-user' },
            { num: 3, label: 'Préférences', icon: 'fa-heart' },
            { num: 4, label: 'Entraînement', icon: 'fa-dumbbell' },
            { num: 5, label: 'Options', icon: 'fa-sliders-h' }
        ];

        return steps
            .map(step => {
                const isActive = step.num === this.currentStep;
                const isCompleted = step.num < this.currentStep;

                return `
                <div class="flex flex-col items-center gap-1 ${isActive ? 'scale-110' : ''}">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center transition-all
                                ${
                                    isActive
                                        ? 'bg-green-500 text-white scale-110'
                                        : isCompleted
                                          ? 'bg-green-500 bg-opacity-30 text-green-400'
                                          : 'bg-gray-700 text-gray-400'
                                }">
                        <i class="fas ${step.icon}"></i>
                    </div>
                    <span class="text-xs ${isActive ? 'text-green-400 font-bold' : 'text-gray-400'}">${step.label}</span>
                </div>
            `;
            })
            .join('');
    },

    /**
     * ═══════════════════════════════════════════════════════════
     * RENDU DES ÉTAPES
     * ═══════════════════════════════════════════════════════════
     */
    renderCurrentStep() {
        switch (this.currentStep) {
            case 1:
                return this.renderStep1_Objective();
            case 2:
                return this.renderStep2_Profile();
            case 3:
                return this.renderStep3_Preferences();
            case 4:
                return this.renderStep4_Training();
            case 5:
                return this.renderStep5_Options();
            default:
                return '';
        }
    },

    /**
     * ÉTAPE 1 - OBJECTIF PRINCIPAL
     */
    renderStep1_Objective() {
        return `
            <div class="bg-gray-800 rounded-2xl p-8
                        border border-green-500 border-opacity-30">
                <h2 class="text-3xl font-bold text-white mb-2">Quel est votre objectif ?</h2>
                <p class="text-gray-400 mb-8">Sélectionnez l'objectif principal de cette programmation</p>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    ${Object.entries(NutritionCore.OBJECTIVES)
                        .map(
                            ([key, obj]) => `
                        <div class="objective-card cursor-pointer p-6 rounded-xl border-2 transition-all duration-200
                                    ${
                                        this.formData.objective === key
                                            ? 'bg-green-500 bg-opacity-20 border-green-400'
                                            : 'bg-gray-900 border-gray-700 hover:border-green-500'
                                    }
                                    hover:scale-105"
                             onclick="NutritionPlanner.selectObjective('${key}')">
                            <div class="text-5xl mb-3 text-center">${obj.icon}</div>
                            <h3 class="text-lg font-bold text-white text-center mb-2">${obj.name}</h3>
                            <p class="text-gray-500 text-sm text-center">
                                ${obj.deficit ? `${obj.deficit} kcal/j` : obj.surplus ? `+${obj.surplus} kcal/j` : 'Équilibre'}
                            </p>
                        </div>
                    `
                        )
                        .join('')}
                </div>

                ${
                    this.formData.objective
                        ? `
                    <div class="mt-6 p-4 bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30 rounded-lg">
                        <div class="flex items-center gap-3">
                            <i class="fas fa-check-circle text-green-400 text-xl"></i>
                            <div>
                                <div class="text-white font-semibold">
                                    ${NutritionCore.OBJECTIVES[this.formData.objective].name} sélectionné
                                </div>
                                <div class="text-green-300 text-sm">
                                    Protéines: ${NutritionCore.OBJECTIVES[this.formData.objective].proteinMultiplier}g/kg •
                                    Glucides: ${NutritionCore.OBJECTIVES[this.formData.objective].carbsPercent}% •
                                    Lipides: ${NutritionCore.OBJECTIVES[this.formData.objective].fatsPercent}%
                                </div>
                            </div>
                        </div>
                    </div>
                `
                        : ''
                }
            </div>
        `;
    },

    /**
     * ÉTAPE 2 - PROFIL DÉTAILLÉ
     */
    renderStep2_Profile() {
        return `
            <div class="space-y-6">
                <!-- Niveau d'activité -->
                <div class="bg-gray-800 rounded-2xl p-8
                            border border-green-500 border-opacity-30">
                    <h2 class="text-2xl font-bold text-white mb-6">
                        <i class="fas fa-running text-green-400 mr-3"></i>
                        Niveau d'activité physique
                    </h2>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${Object.entries(NutritionCore.ACTIVITY_LEVELS)
                            .map(
                                ([key, level]) => `
                            <div class="cursor-pointer p-5 rounded-xl border-2 transition-all
                                        ${
                                            this.formData.activityLevel === key
                                                ? 'bg-green-500 bg-opacity-20 border-green-400'
                                                : 'bg-gray-900 border-gray-700 hover:border-green-500'
                                        }
                                        hover:scale-105"
                                 onclick="NutritionPlanner.setFormData('activityLevel', '${key}')">
                                <h3 class="text-white font-bold mb-2">${level.name}</h3>
                                <p class="text-gray-500 text-sm mb-3">${level.description}</p>
                                <div class="text-green-400 font-semibold">x${level.multiplier}</div>
                            </div>
                        `
                            )
                            .join('')}
                    </div>
                </div>

                <!-- Morphotype -->
                <div class="bg-gray-800 rounded-2xl p-8
                            border border-green-500 border-opacity-30">
                    <h2 class="text-2xl font-bold text-white mb-6">
                        <i class="fas fa-user-circle text-green-400 mr-3"></i>
                        Morphotype
                    </h2>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        ${Object.entries(NutritionCore.MORPHOTYPES)
                            .map(
                                ([key, morpho]) => `
                            <div class="cursor-pointer p-6 rounded-xl border-2 transition-all
                                        ${
                                            this.formData.morphotype === key
                                                ? 'bg-green-500 bg-opacity-20 border-green-400'
                                                : 'bg-gray-900 border-gray-700 hover:border-green-500'
                                        }
                                        hover:scale-105"
                                 onclick="NutritionPlanner.setFormData('morphotype', '${key}')">
                                <h3 class="text-white font-bold text-lg mb-2">${morpho.name}</h3>
                                <p class="text-gray-500 text-sm">${morpho.description}</p>
                            </div>
                        `
                            )
                            .join('')}
                    </div>
                </div>

                <!-- Objectif de poids (optionnel) -->
                <div class="bg-gray-800 rounded-2xl p-8
                            border border-green-500 border-opacity-30">
                    <h2 class="text-2xl font-bold text-white mb-6">
                        <i class="fas fa-balance-scale text-green-400 mr-3"></i>
                        Objectif de poids (optionnel)
                    </h2>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label class="block text-gray-400 mb-2">Poids actuel</label>
                            <div class="bg-gray-700 px-4 py-3 rounded-lg text-white font-bold">
                                ${this.currentMember.weight || 70} kg
                            </div>
                        </div>
                        <div>
                            <label class="block text-gray-400 mb-2">Poids cible</label>
                            <input type="number"
                                   id="targetWeight"
                                   value="${this.formData.targetWeight || ''}"
                                   onchange="NutritionPlanner.setFormData('targetWeight', this.value)"
                                   class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3
                                          text-white focus:border-green-400 focus:outline-none"
                                   placeholder="Ex: 75">
                        </div>
                        <div>
                            <label class="block text-gray-400 mb-2">Durée estimée</label>
                            <input type="number"
                                   id="durationWeeks"
                                   value="${this.formData.durationWeeks || ''}"
                                   onchange="NutritionPlanner.setFormData('durationWeeks', this.value)"
                                   class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3
                                          text-white focus:border-green-400 focus:outline-none"
                                   placeholder="Semaines">
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * ÉTAPE 3 - PRÉFÉRENCES ALIMENTAIRES
     */
    renderStep3_Preferences() {
        const commonAllergies = [
            'Gluten',
            'Lactose',
            'Noix',
            'Arachides',
            'Fruits de mer',
            'Poisson',
            'Œufs',
            'Soja',
            'Sésame'
        ];

        const commonRegimes = [
            'Végétarien',
            'Végétalien',
            'Sans gluten',
            'Sans lactose',
            'Cétogène',
            'Paleo',
            'Halal',
            'Casher'
        ];

        const dislikedFoods = [
            'Poisson',
            'Fruits de mer',
            'Viande rouge',
            'Poulet',
            'Œufs',
            'Produits laitiers',
            'Légumineuses',
            'Champignons',
            'Épinards',
            'Brocoli',
            'Avocat',
            'Tomates'
        ];

        return `
            <div class="space-y-6">
                <!-- Allergies -->
                <div class="bg-gray-800 rounded-2xl p-8
                            border border-green-500 border-opacity-30">
                    <h2 class="text-2xl font-bold text-white mb-6">
                        <i class="fas fa-exclamation-triangle text-yellow-400 mr-3"></i>
                        Allergies et intolérances
                    </h2>

                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        ${commonAllergies
                            .map(allergy => {
                                const selected = (this.formData.allergies || []).includes(allergy);
                                return `
                                <button onclick="NutritionPlanner.toggleArrayItem('allergies', '${allergy}')"
                                        class="px-4 py-3 rounded-lg border-2 transition-all
                                               ${
                                                   selected
                                                       ? 'bg-red-500 bg-opacity-20 border-red-400 text-red-300'
                                                       : 'bg-gray-900 border-gray-700 text-gray-300 hover:border-red-400'
                                               }">
                                    <i class="fas ${selected ? 'fa-check-circle' : 'fa-circle'} mr-2"></i>
                                    ${allergy}
                                </button>
                            `;
                            })
                            .join('')}
                    </div>
                </div>

                <!-- Régimes alimentaires -->
                <div class="bg-gray-800 rounded-2xl p-8
                            border border-green-500 border-opacity-30">
                    <h2 class="text-2xl font-bold text-white mb-6">
                        <i class="fas fa-leaf text-green-400 mr-3"></i>
                        Régimes alimentaires
                    </h2>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        ${commonRegimes
                            .map(regime => {
                                const selected = (this.formData.regimes || []).includes(regime);
                                return `
                                <button onclick="NutritionPlanner.toggleArrayItem('regimes', '${regime}')"
                                        class="px-4 py-3 rounded-lg border-2 transition-all
                                               ${
                                                   selected
                                                       ? 'bg-green-500 bg-opacity-20 border-green-400 text-green-300'
                                                       : 'bg-gray-900 border-gray-700 text-gray-300 hover:border-green-400'
                                               }">
                                    <i class="fas ${selected ? 'fa-check-circle' : 'fa-circle'} mr-2"></i>
                                    ${regime}
                                </button>
                            `;
                            })
                            .join('')}
                    </div>
                </div>

                <!-- Aliments non appréciés -->
                <div class="bg-gray-800 rounded-2xl p-8
                            border border-green-500 border-opacity-30">
                    <h2 class="text-2xl font-bold text-white mb-6">
                        <i class="fas fa-times-circle text-red-400 mr-3"></i>
                        Aliments non appréciés
                    </h2>

                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        ${dislikedFoods
                            .map(food => {
                                const selected = (this.formData.dislikedFoods || []).includes(food);
                                return `
                                <button onclick="NutritionPlanner.toggleArrayItem('dislikedFoods', '${food}')"
                                        class="px-4 py-3 rounded-lg border-2 transition-all
                                               ${
                                                   selected
                                                       ? 'bg-orange-500 bg-opacity-20 border-orange-400 text-orange-300'
                                                       : 'bg-gray-900 border-gray-700 text-gray-300 hover:border-orange-400'
                                               }">
                                    <i class="fas ${selected ? 'fa-check-circle' : 'fa-circle'} mr-2"></i>
                                    ${food}
                                </button>
                            `;
                            })
                            .join('')}
                    </div>
                </div>

                <!-- Budget mensuel -->
                <div class="bg-gray-800 rounded-2xl p-8
                            border border-green-500 border-opacity-30">
                    <h2 class="text-2xl font-bold text-white mb-6">
                        <i class="fas fa-euro-sign text-green-400 mr-3"></i>
                        Budget alimentaire mensuel
                    </h2>

                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        ${[200, 300, 400, 500]
                            .map(budget => {
                                const selected = this.formData.monthlyBudget == budget;
                                return `
                                <button onclick="NutritionPlanner.setFormData('monthlyBudget', ${budget})"
                                        class="px-6 py-4 rounded-xl border-2 transition-all
                                               ${
                                                   selected
                                                       ? 'bg-green-500 bg-opacity-20 border-green-400'
                                                       : 'bg-gray-900 border-gray-700 hover:border-green-400'
                                               }">
                                    <div class="text-2xl font-bold text-white mb-1">${budget}€</div>
                                    <div class="text-gray-500 text-sm">par mois</div>
                                </button>
                            `;
                            })
                            .join('')}
                    </div>

                    <div class="mt-4">
                        <label class="block text-gray-400 mb-2">Ou budget personnalisé</label>
                        <input type="number"
                               id="customBudget"
                               value="${this.formData.monthlyBudget || ''}"
                               onchange="NutritionPlanner.setFormData('monthlyBudget', this.value)"
                               class="w-full md:w-64 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3
                                      text-white focus:border-green-400 focus:outline-none"
                               placeholder="Budget mensuel (€)">
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * ÉTAPE 4 - ENTRAÎNEMENT
     */
    renderStep4_Training() {
        const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

        return `
            <div class="space-y-6">
                <!-- Jours d'entraînement -->
                <div class="bg-gray-800 rounded-2xl p-8
                            border border-green-500 border-opacity-30">
                    <h2 class="text-2xl font-bold text-white mb-6">
                        <i class="fas fa-calendar-check text-green-400 mr-3"></i>
                        Jours d'entraînement
                    </h2>

                    <p class="text-gray-400 mb-6">Sélectionnez les jours où vous vous entraînez (pour le cyclage calorique)</p>

                    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                        ${days
                            .map(day => {
                                const selected = (this.formData.trainingDays || []).includes(day);
                                return `
                                <button onclick="NutritionPlanner.toggleArrayItem('trainingDays', '${day}')"
                                        class="px-4 py-3 rounded-lg border-2 transition-all
                                               ${
                                                   selected
                                                       ? 'bg-green-500 bg-opacity-20 border-green-400 text-green-300'
                                                       : 'bg-gray-900 border-gray-700 text-gray-300 hover:border-green-400'
                                               }">
                                    <i class="fas ${selected ? 'fa-check-circle' : 'fa-circle'} mb-2"></i>
                                    <div class="text-sm font-semibold">${day.substring(0, 3)}</div>
                                </button>
                            `;
                            })
                            .join('')}
                    </div>

                    ${
                        (this.formData.trainingDays || []).length > 0
                            ? `
                        <div class="mt-4 p-4 bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30 rounded-lg">
                            <div class="text-green-300 font-semibold">
                                ${(this.formData.trainingDays || []).length} jours d'entraînement par semaine
                            </div>
                        </div>
                    `
                            : ''
                    }
                </div>

                <!-- Timing périworkout -->
                <div class="bg-gray-800 rounded-2xl p-8
                            border border-green-500 border-opacity-30">
                    <h2 class="text-2xl font-bold text-white mb-6">
                        <i class="fas fa-clock text-green-400 mr-3"></i>
                        Horaires d'entraînement
                    </h2>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        ${['Matin (6h-10h)', 'Midi (11h-14h)', 'Soir (17h-21h)']
                            .map(time => {
                                const selected = this.formData.trainingTime === time;
                                return `
                                <button onclick="NutritionPlanner.setFormData('trainingTime', '${time}')"
                                        class="px-6 py-4 rounded-xl border-2 transition-all
                                               ${
                                                   selected
                                                       ? 'bg-green-500 bg-opacity-20 border-green-400'
                                                       : 'bg-gray-900 border-gray-700 hover:border-green-400'
                                               }">
                                    <div class="text-white font-bold">${time.split('(')[0]}</div>
                                    <div class="text-gray-500 text-sm">${time.match(/\(([^)]+)\)/)[1]}</div>
                                </button>
                            `;
                            })
                            .join('')}
                    </div>
                </div>

                <!-- Type d'entraînement -->
                <div class="bg-gray-800 rounded-2xl p-8
                            border border-green-500 border-opacity-30">
                    <h2 class="text-2xl font-bold text-white mb-6">
                        <i class="fas fa-dumbbell text-green-400 mr-3"></i>
                        Type d'entraînement principal
                    </h2>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        ${[
                            { name: 'Musculation', icon: '💪' },
                            { name: 'CrossFit', icon: '🏋️' },
                            { name: 'Endurance', icon: '🏃' },
                            { name: 'Sport collectif', icon: '⚽' }
                        ]
                            .map(type => {
                                const selected = this.formData.trainingType === type.name;
                                return `
                                <button onclick="NutritionPlanner.setFormData('trainingType', '${type.name}')"
                                        class="px-6 py-5 rounded-xl border-2 transition-all
                                               ${
                                                   selected
                                                       ? 'bg-green-500 bg-opacity-20 border-green-400'
                                                       : 'bg-gray-900 border-gray-700 hover:border-green-400'
                                               }">
                                    <div class="text-4xl mb-2">${type.icon}</div>
                                    <div class="text-white font-bold">${type.name}</div>
                                </button>
                            `;
                            })
                            .join('')}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * ÉTAPE 5 - OPTIONS AVANCÉES
     */
    renderStep5_Options() {
        return `
            <div class="space-y-6">
                <!-- Nombre de repas -->
                <div class="bg-gray-800 rounded-2xl p-8
                            border border-green-500 border-opacity-30">
                    <h2 class="text-2xl font-bold text-white mb-6">
                        <i class="fas fa-utensils text-green-400 mr-3"></i>
                        Structure des repas
                    </h2>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        ${[3, 4, 5, 6]
                            .map(meals => {
                                const selected = this.formData.mealsPerDay == meals;
                                return `
                                <button onclick="NutritionPlanner.setFormData('mealsPerDay', ${meals})"
                                        class="px-6 py-4 rounded-xl border-2 transition-all
                                               ${
                                                   selected
                                                       ? 'bg-green-500 bg-opacity-20 border-green-400'
                                                       : 'bg-gray-900 border-gray-700 hover:border-green-400'
                                               }">
                                    <div class="text-3xl font-bold text-white mb-1">${meals}</div>
                                    <div class="text-gray-500 text-sm">repas/jour</div>
                                </button>
                            `;
                            })
                            .join('')}
                    </div>
                </div>

                <!-- Durée du plan -->
                <div class="bg-gray-800 rounded-2xl p-8
                            border border-green-500 border-opacity-30">
                    <h2 class="text-2xl font-bold text-white mb-6">
                        <i class="fas fa-calendar-alt text-green-400 mr-3"></i>
                        Durée du programme
                    </h2>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        ${[7, 14, 21, 28]
                            .map(days => {
                                const selected = this.formData.planDays == days;
                                return `
                                <button onclick="NutritionPlanner.setFormData('planDays', ${days})"
                                        class="px-6 py-4 rounded-xl border-2 transition-all
                                               ${
                                                   selected
                                                       ? 'bg-green-500 bg-opacity-20 border-green-400'
                                                       : 'bg-gray-900 border-gray-700 hover:border-green-400'
                                               }">
                                    <div class="text-3xl font-bold text-white mb-1">${days}</div>
                                    <div class="text-gray-500 text-sm">jours</div>
                                </button>
                            `;
                            })
                            .join('')}
                    </div>
                </div>

                <!-- Options avancées -->
                <div class="bg-gray-800 rounded-2xl p-8
                            border border-green-500 border-opacity-30">
                    <h2 class="text-2xl font-bold text-white mb-6">
                        <i class="fas fa-cog text-green-400 mr-3"></i>
                        Options avancées
                    </h2>

                    <div class="space-y-4">
                        <!-- Cyclage calorique -->
                        <label class="flex items-center justify-between p-4 bg-gray-900 rounded-lg cursor-pointer
                                      hover:bg-gray-850 transition-all">
                            <div class="flex items-center gap-4">
                                <i class="fas fa-sync-alt text-2xl ${this.formData.calorieCycling ? 'text-green-400' : 'text-gray-600'}"></i>
                                <div>
                                    <div class="text-white font-semibold">Cyclage calorique</div>
                                    <div class="text-gray-500 text-sm">Plus de calories les jours d'entraînement</div>
                                </div>
                            </div>
                            <input type="checkbox"
                                   ${this.formData.calorieCycling ? 'checked' : ''}
                                   onchange="NutritionPlanner.setFormData('calorieCycling', this.checked)"
                                   class="w-6 h-6">
                        </label>

                        <!-- Timing périworkout -->
                        <label class="flex items-center justify-between p-4 bg-gray-900 rounded-lg cursor-pointer
                                      hover:bg-gray-850 transition-all">
                            <div class="flex items-center gap-4">
                                <i class="fas fa-stopwatch text-2xl ${this.formData.nutrientTiming ? 'text-green-400' : 'text-gray-600'}"></i>
                                <div>
                                    <div class="text-white font-semibold">Timing nutritionnel</div>
                                    <div class="text-gray-500 text-sm">Repas pré/post entraînement optimisés</div>
                                </div>
                            </div>
                            <input type="checkbox"
                                   ${this.formData.nutrientTiming ? 'checked' : ''}
                                   onchange="NutritionPlanner.setFormData('nutrientTiming', this.checked)"
                                   class="w-6 h-6">
                        </label>

                        <!-- Suppléments utilisés -->
                        <div class="p-4 bg-gray-900 rounded-lg">
                            <div class="flex items-center gap-4 mb-4">
                                <i class="fas fa-capsules text-2xl text-green-400"></i>
                                <div>
                                    <div class="text-white font-semibold">Suppléments alimentaires utilisés</div>
                                    <div class="text-gray-500 text-sm">Sélectionnez les suppléments que vous utilisez</div>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                ${[
                                    { key: 'whey', label: 'Whey Protein', icon: 'fa-dumbbell' },
                                    { key: 'creatine', label: 'Créatine', icon: 'fa-bolt' },
                                    { key: 'bcaa', label: 'BCAA', icon: 'fa-stream' },
                                    {
                                        key: 'vitamins',
                                        label: 'Vitamines/Minéraux',
                                        icon: 'fa-pills'
                                    },
                                    { key: 'omega3', label: 'Oméga-3', icon: 'fa-fish' },
                                    { key: 'preworkout', label: 'Pre-workout', icon: 'fa-fire' }
                                ]
                                    .map(
                                        supp => `
                                    <label class="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer
                                                  hover:bg-gray-750 transition-all border border-gray-700
                                                  ${this.formData.supplements && this.formData.supplements.includes(supp.key) ? 'border-green-500 bg-green-500 bg-opacity-10' : ''}">
                                        <input type="checkbox"
                                               ${this.formData.supplements && this.formData.supplements.includes(supp.key) ? 'checked' : ''}
                                               onchange="NutritionPlanner.toggleSupplement('${supp.key}')"
                                               class="w-5 h-5">
                                        <i class="fas ${supp.icon} text-green-400"></i>
                                        <span class="text-white text-sm">${supp.label}</span>
                                    </label>
                                `
                                    )
                                    .join('')}
                            </div>
                        </div>

                        <!-- Recettes détaillées -->
                        <label class="flex items-center justify-between p-4 bg-gray-900 rounded-lg cursor-pointer
                                      hover:bg-gray-850 transition-all">
                            <div class="flex items-center gap-4">
                                <i class="fas fa-book-open text-2xl ${this.formData.includeRecipes ? 'text-green-400' : 'text-gray-600'}"></i>
                                <div>
                                    <div class="text-white font-semibold">Recettes détaillées</div>
                                    <div class="text-gray-500 text-sm">Instructions de préparation complètes</div>
                                </div>
                            </div>
                            <input type="checkbox"
                                   ${this.formData.includeRecipes ? 'checked' : ''}
                                   onchange="NutritionPlanner.setFormData('includeRecipes', this.checked)"
                                   class="w-6 h-6">
                        </label>

                        <!-- Liste de courses -->
                        <label class="flex items-center justify-between p-4 bg-gray-900 rounded-lg cursor-pointer
                                      hover:bg-gray-850 transition-all">
                            <div class="flex items-center gap-4">
                                <i class="fas fa-shopping-cart text-2xl ${this.formData.includeGroceryList ? 'text-green-400' : 'text-gray-600'}"></i>
                                <div>
                                    <div class="text-white font-semibold">Liste de courses</div>
                                    <div class="text-gray-500 text-sm">Avec quantités et budget estimé</div>
                                </div>
                            </div>
                            <input type="checkbox"
                                   ${this.formData.includeGroceryList ? 'checked' : ''}
                                   onchange="NutritionPlanner.setFormData('includeGroceryList', this.checked)"
                                   class="w-6 h-6">
                        </label>
                    </div>
                </div>

                <!-- Notes personnalisées -->
                <div class="bg-gray-800 rounded-2xl p-8
                            border border-green-500 border-opacity-30">
                    <h2 class="text-2xl font-bold text-white mb-6">
                        <i class="fas fa-comment-alt text-green-400 mr-3"></i>
                        Notes personnalisées
                    </h2>

                    <textarea
                        id="personalNotes"
                        onchange="NutritionPlanner.setFormData('personalNotes', this.value)"
                        class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3
                               text-white focus:border-green-400 focus:outline-none resize-none"
                        rows="4"
                        placeholder="Ajoutez des notes ou instructions spécifiques pour cette programmation...">${this.formData.personalNotes || ''}</textarea>
                </div>
            </div>
        `;
    },

    /**
     * ═══════════════════════════════════════════════════════════
     * GESTION DE LA NAVIGATION
     * ═══════════════════════════════════════════════════════════
     */
    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.showPlannerInterface();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },

    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showPlannerInterface();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },

    /**
     * ═══════════════════════════════════════════════════════════
     * GESTION DES DONNÉES DU FORMULAIRE
     * ═══════════════════════════════════════════════════════════
     * @param objective
     */
    selectObjective(objective) {
        this.formData.objective = objective;
        this.showPlannerInterface();
    },

    setFormData(key, value) {
        this.formData[key] = value;
        this.showPlannerInterface();
    },

    toggleArrayItem(key, value) {
        if (!this.formData[key]) {
            this.formData[key] = [];
        }

        const index = this.formData[key].indexOf(value);
        if (index > -1) {
            this.formData[key].splice(index, 1);
        } else {
            this.formData[key].push(value);
        }

        this.showPlannerInterface();
    },

    toggleSupplement(supplementKey) {
        this.toggleArrayItem('supplements', supplementKey);
    },

    /**
     * ═══════════════════════════════════════════════════════════
     * GÉNÉRATION DU PROGRAMME
     * ═══════════════════════════════════════════════════════════
     */
    async generatePlan() {
        try {
            // Validation des données
            if (!this.formData.objective) {
                Utils.showNotification('Attention', 'Veuillez sélectionner un objectif', 'warning');
                this.currentStep = 1;
                this.showPlannerInterface();
                return;
            }

            if (!this.formData.activityLevel) {
                Utils.showNotification(
                    'Attention',
                    "Veuillez sélectionner votre niveau d'activité",
                    'warning'
                );
                this.currentStep = 2;
                this.showPlannerInterface();
                return;
            }

            // Valeurs par défaut
            this.formData.morphotype = this.formData.morphotype || 'mesomorph';
            this.formData.mealsPerDay = this.formData.mealsPerDay || 4;
            this.formData.planDays = this.formData.planDays || 7;
            this.formData.monthlyBudget = this.formData.monthlyBudget || 400;

            console.log('📊 Données du formulaire:', this.formData);

            // Calculer les macros
            const macros = NutritionCore.calculateMacros(this.currentMember, this.formData);
            console.log('✅ Macros calculés:', macros);

            // Passer au générateur PDF
            await NutritionPDFPro.init(this.currentMember, this.formData, macros);
        } catch (error) {
            console.error('❌ Erreur génération plan:', error);
            Utils.showNotification('Erreur', error.message, 'error');
        }
    }
};

// Export global
window.NutritionPlanner = NutritionPlanner;
console.log('✅ NutritionPlanner chargé');
