/**
 * NUTRITION PRO V2 - Module refait avec flux simplifié
 *
 * FLUX:
 * 1. Recherche et sélection d'un adhérent
 * 2. Formulaire : objectif, nombre de repas, allergies, régime
 * 3. Calcul des macros + Génération du plan
 * 4. Téléchargement PDF
 */

const NutritionProV2 = {
    currentMember: null,
    currentPlan: null,

    /**
     * Afficher la vue principale
     */
    async showView() {
        console.log('🍎 Affichage Nutrition Pro V2');

        const html = `
            <div class="p-6 max-w-7xl mx-auto">
                <!-- Header -->
                <div class="mb-8">
                    <h1 class="text-4xl font-bold text-green-400 mb-2">
                        <i class="fas fa-utensils mr-3"></i>
                        Nutrition Pro
                    </h1>
                    <p class="text-secondary">Création de plans nutritionnels personnalisés</p>
                </div>

                <!-- Zone de sélection de l'adhérent -->
                <div id="memberSelectionZone" class="mb-8">
                    ${this.renderMemberSelection()}
                </div>

                <!-- Zone du formulaire (caché tant qu'aucun adhérent n'est sélectionné) -->
                <div id="nutritionFormZone" class="hidden">
                    <!-- Le formulaire sera affiché ici -->
                </div>

                <!-- Zone des résultats (caché) -->
                <div id="nutritionResultsZone" class="hidden">
                    <!-- Les résultats seront affichés ici -->
                </div>
            </div>
        `;

        const contentEl = document.getElementById('mainContent') || document.querySelector('#mainApp');
        if (contentEl) {contentEl.innerHTML = html;}
    },

    /**
     * Rendu de la sélection d'adhérent
     */
    renderMemberSelection() {
        return `
            <div class="premium-card">
                <h2 class="text-2xl font-bold text-white mb-4">
                    <i class="fas fa-user-circle mr-2"></i>
                    Sélectionner un adhérent
                </h2>

                <!-- Barre de recherche -->
                <div class="relative mb-6">
                    <input type="text"
                           id="memberSearchInput"
                           placeholder="Rechercher un adhérent (nom, prénom)..."
                           class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 pl-12 text-white focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition"
                           oninput="NutritionProV2.searchMembers(this.value)">
                    <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-secondary"></i>
                </div>

                <!-- Liste des adhérents -->
                <div id="membersList" class="space-y-3 max-h-96 overflow-y-auto">
                    <p class="text-secondary text-center py-8">
                        <i class="fas fa-search text-3xl mb-3 block"></i>
                        Utilisez la barre de recherche pour trouver un adhérent
                    </p>
                </div>
            </div>
        `;
    },

    /**
     * Rechercher des adhérents
     * @param query
     */
    async searchMembers(query) {
        const listEl = document.getElementById('membersList');

        if (!query || query.length < 2) {
            listEl.innerHTML = `
                <p class="text-secondary text-center py-8">
                    <i class="fas fa-search text-3xl mb-3 block"></i>
                    Saisissez au moins 2 caractères pour rechercher
                </p>
            `;
            return;
        }

        try {
            // Récupérer tous les adhérents
            const members = await SupabaseManager.getMembers();

            // Filtrer selon la recherche
            const filtered = members.filter(m => {
                const fullName = `${m.firstName || m.firstname || ''} ${m.lastName || m.lastname || ''}`.toLowerCase();
                return fullName.includes(query.toLowerCase());
            });

            if (filtered.length === 0) {
                listEl.innerHTML = `
                    <p class="text-secondary text-center py-8">
                        <i class="fas fa-user-slash text-3xl mb-3 block"></i>
                        Aucun adhérent trouvé pour "${query}"
                    </p>
                `;
                return;
            }

            // Afficher les résultats
            listEl.innerHTML = filtered.map(member => `
                <div class="bg-skali-darker rounded-lg p-4 hover:bg-opacity-70 cursor-pointer transition border border-transparent hover:border-green-400"
                     onclick="NutritionProV2.selectMember('${member.id}')">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center">
                                <i class="fas fa-user text-green-400 text-xl"></i>
                            </div>
                            <div>
                                <h3 class="text-white font-bold">${member.firstName || member.firstname || ''} ${member.lastName || member.lastname || ''}</h3>
                                <p class="text-secondary text-sm">
                                    ${member.weight ? member.weight + ' kg' : 'Poids non renseigné'} •
                                    ${member.height ? member.height + ' cm' : 'Taille non renseignée'}
                                </p>
                            </div>
                        </div>
                        <i class="fas fa-arrow-right text-green-400"></i>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Erreur recherche adhérents:', error);
            Utils.showNotification('Erreur', 'Impossible de charger les adhérents', 'error');
        }
    },

    /**
     * Sélectionner un adhérent et afficher le formulaire
     * @param memberId
     */
    async selectMember(memberId) {
        try {
            const members = await SupabaseManager.getMembers();
            const member = members.find(m => m.id === memberId);

            if (!member) {
                Utils.showNotification('Erreur', 'Adhérent introuvable', 'error');
                return;
            }

            this.currentMember = member;
            console.log('👤 Adhérent sélectionné:', member);

            // Afficher le formulaire
            this.showNutritionForm();

        } catch (error) {
            console.error('Erreur sélection adhérent:', error);
            Utils.showNotification('Erreur', error.message, 'error');
        }
    },

    /**
     * Afficher le formulaire de configuration du plan
     */
    showNutritionForm() {
        const formZone = document.getElementById('nutritionFormZone');
        const member = this.currentMember;

        formZone.innerHTML = `
            <div class="premium-card mb-6">
                <!-- Adhérent sélectionné -->
                <div class="bg-green-400/10 border border-green-400/30 rounded-lg p-4 mb-6">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center">
                                <i class="fas fa-user text-green-400 text-2xl"></i>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold text-white">${member.firstName || member.firstname || ''} ${member.lastName || member.lastname || ''}</h3>
                                <p class="text-secondary">
                                    ${member.weight} kg • ${member.height} cm • ${this.calculateAge(member.birthdate)} ans
                                </p>
                            </div>
                        </div>
                        <button onclick="NutritionProV2.showView()" class="text-secondary hover:text-white">
                            <i class="fas fa-times"></i> Changer
                        </button>
                    </div>
                </div>

                <h2 class="text-2xl font-bold text-white mb-6">
                    <i class="fas fa-clipboard-list mr-2"></i>
                    Configuration du plan nutritionnel
                </h2>

                <form id="nutritionConfigForm" class="space-y-6">
                    <!-- Objectif -->
                    <div>
                        <label class="block text-sm font-semibold text-secondary mb-3">
                            <i class="fas fa-bullseye mr-2"></i>
                            Objectif
                        </label>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                            ${this.renderObjectiveOptions()}
                        </div>
                    </div>

                    <!-- Nombre de repas par jour -->
                    <div>
                        <label class="block text-sm font-semibold text-secondary mb-3">
                            <i class="fas fa-utensils mr-2"></i>
                            Nombre de repas par jour
                        </label>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                            ${[3, 4, 5, 6].map(n => `
                                <label class="relative cursor-pointer">
                                    <input type="radio" name="mealsPerDay" value="${n}" ${n === 4 ? 'checked' : ''} class="peer sr-only">
                                    <div class="p-4 bg-skali-darker border-2 border-wood-accent border-opacity-20 rounded-lg text-center transition
                                                peer-checked:border-green-400 peer-checked:bg-green-400/10 hover:border-opacity-40">
                                        <div class="text-2xl font-bold text-white">${n}</div>
                                        <div class="text-xs text-secondary mt-1">repas</div>
                                    </div>
                                </label>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Durée du plan -->
                    <div>
                        <label class="block text-sm font-semibold text-secondary mb-3">
                            <i class="fas fa-calendar mr-2"></i>
                            Durée du plan
                        </label>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <label class="relative cursor-pointer">
                                <input type="radio" name="duration" value="1" class="peer sr-only">
                                <div class="p-4 bg-skali-darker border-2 border-wood-accent border-opacity-20 rounded-lg text-center transition
                                            peer-checked:border-green-400 peer-checked:bg-green-400/10 hover:border-opacity-40">
                                    <div class="font-bold text-white">1 jour</div>
                                </div>
                            </label>
                            <label class="relative cursor-pointer">
                                <input type="radio" name="duration" value="7" checked class="peer sr-only">
                                <div class="p-4 bg-skali-darker border-2 border-wood-accent border-opacity-20 rounded-lg text-center transition
                                            peer-checked:border-green-400 peer-checked:bg-green-400/10 hover:border-opacity-40">
                                    <div class="font-bold text-white">1 semaine</div>
                                </div>
                            </label>
                            <label class="relative cursor-pointer">
                                <input type="radio" name="duration" value="30" class="peer sr-only">
                                <div class="p-4 bg-skali-darker border-2 border-wood-accent border-opacity-20 rounded-lg text-center transition
                                            peer-checked:border-green-400 peer-checked:bg-green-400/10 hover:border-opacity-40">
                                    <div class="font-bold text-white">1 mois</div>
                                </div>
                            </label>
                            <label class="relative cursor-pointer">
                                <input type="radio" name="duration" value="90" class="peer sr-only">
                                <div class="p-4 bg-skali-darker border-2 border-wood-accent border-opacity-20 rounded-lg text-center transition
                                            peer-checked:border-green-400 peer-checked:bg-green-400/10 hover:border-opacity-40">
                                    <div class="font-bold text-white">3 mois</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- Allergies -->
                    <div>
                        <label class="block text-sm font-semibold text-secondary mb-3">
                            <i class="fas fa-exclamation-triangle mr-2"></i>
                            Allergies / Intolérances
                        </label>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                            ${['Gluten', 'Lactose', 'Fruits à coque', 'Œufs', 'Poisson', 'Fruits de mer', 'Soja', 'Aucune'].map(allergy => `
                                <label class="flex items-center gap-2 cursor-pointer bg-skali-darker p-3 rounded-lg hover:bg-opacity-70 transition">
                                    <input type="checkbox" name="allergies" value="${allergy}" class="w-5 h-5 rounded text-green-400 focus:ring-green-400">
                                    <span class="text-white text-sm">${allergy}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Régime alimentaire -->
                    <div>
                        <label class="block text-sm font-semibold text-secondary mb-3">
                            <i class="fas fa-leaf mr-2"></i>
                            Régime alimentaire
                        </label>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                            ${['Omnivore', 'Végétarien', 'Végétalien', 'Pescatarien', 'Flexitarien', 'Aucun'].map(regime => `
                                <label class="relative cursor-pointer">
                                    <input type="radio" name="regime" value="${regime}" ${regime === 'Omnivore' ? 'checked' : ''} class="peer sr-only">
                                    <div class="p-3 bg-skali-darker border-2 border-wood-accent border-opacity-20 rounded-lg text-center transition
                                                peer-checked:border-green-400 peer-checked:bg-green-400/10 hover:border-opacity-40">
                                        <div class="text-white text-sm">${regime}</div>
                                    </div>
                                </label>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Bouton de génération -->
                    <div class="pt-4">
                        <button type="submit" class="w-full btn-premium btn-publish text-lg py-4">
                            <i class="fas fa-calculator mr-2"></i>
                            Calculer les macros et générer le plan
                        </button>
                    </div>
                </form>
            </div>
        `;

        // Montrer le formulaire
        formZone.classList.remove('hidden');

        // Scroll vers le formulaire
        formZone.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Attacher l'événement de soumission
        document.getElementById('nutritionConfigForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateNutritionPlan();
        });
    },

    /**
     * Rendu des options d'objectifs
     */
    renderObjectiveOptions() {
        const objectives = [
            { id: 'perte_poids', name: 'Perte de poids', icon: 'fa-weight', color: '#ef4444' },
            { id: 'prise_masse', name: 'Prise de masse', icon: 'fa-dumbbell', color: '#10b981' },
            { id: 'maintien', name: 'Maintien', icon: 'fa-balance-scale', color: '#3b82f6' },
            { id: 'seche', name: 'Sèche', icon: 'fa-fire', color: '#f59e0b' },
            { id: 'performance', name: 'Performance', icon: 'fa-running', color: '#8b5cf6' },
            { id: 'sante', name: 'Santé générale', icon: 'fa-heart', color: '#22c55e' }
        ];

        return objectives.map(obj => `
            <label class="relative cursor-pointer">
                <input type="radio" name="objective" value="${obj.id}" ${obj.id === 'maintien' ? 'checked' : ''} class="peer sr-only">
                <div class="p-4 bg-skali-darker border-2 border-wood-accent border-opacity-20 rounded-lg text-center transition
                            peer-checked:border-green-400 peer-checked:bg-green-400/10 hover:border-opacity-40">
                    <i class="fas ${obj.icon} text-3xl mb-2" style="color: ${obj.color}"></i>
                    <div class="font-bold text-white text-sm">${obj.name}</div>
                </div>
            </label>
        `).join('');
    },

    /**
     * Calculer l'âge
     * @param birthdate
     */
    calculateAge(birthdate) {
        if (!birthdate) {return '?';}
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
     * Générer le plan nutritionnel
     */
    async generateNutritionPlan() {
        const form = document.getElementById('nutritionConfigForm');
        const formData = new FormData(form);

        // Récupérer les données du formulaire
        const config = {
            objective: formData.get('objective'),
            mealsPerDay: parseInt(formData.get('mealsPerDay')),
            duration: parseInt(formData.get('duration')),
            allergies: formData.getAll('allergies'),
            regime: formData.get('regime')
        };

        console.log('📋 Configuration du plan:', config);

        try {
            Utils.showNotification('Calcul en cours...', 'Génération du plan nutritionnel', 'info');

            // 1. Calculer les macros
            const macros = await this.calculateMacros(config);

            // 2. Générer le plan de repas (avec ou sans IA)
            const plan = await this.generateMealPlan(macros, config);

            // 3. Afficher les résultats
            this.showResults(macros, plan, config);

            Utils.showNotification('Succès', 'Plan nutritionnel généré !', 'success');

        } catch (error) {
            console.error('Erreur génération plan:', error);
            Utils.showNotification('Erreur', error.message, 'error');
        }
    },

    /**
     * Calculer les macros
     * @param config
     */
    async calculateMacros(config) {
        const member = this.currentMember;

        // Utiliser NutritionCalculator existant
        const macros = NutritionCalculator.calculateMacros(
            member,
            config.objective,
            'active' // Niveau d'activité (à améliorer)
        );

        console.log('📊 Macros calculées:', macros);
        return macros;
    },

    /**
     * Générer le plan de repas
     * @param macros
     * @param config
     */
    async generateMealPlan(macros, config) {
        // Pour l'instant, plan simple sans IA
        // TODO: Intégrer DeepSeek pour générer des repas détaillés

        const plan = {
            days: config.duration,
            mealsPerDay: config.mealsPerDay,
            macros: macros,
            meals: this.generateSimpleMeals(macros, config)
        };

        return plan;
    },

    /**
     * Générer des repas simples (sans IA)
     * @param macros
     * @param config
     */
    generateSimpleMeals(macros, config) {
        // Répartition des macros par repas
        const caloriesPerMeal = Math.round(macros.calories / config.mealsPerDay);
        const proteinPerMeal = Math.round(macros.protein / config.mealsPerDay);
        const carbsPerMeal = Math.round(macros.carbs / config.mealsPerDay);
        const fatsPerMeal = Math.round(macros.fats / config.mealsPerDay);

        const mealNames = ['Petit-déjeuner', 'Déjeuner', 'Collation', 'Dîner', 'Collation soir', 'Collation nuit'];

        return mealNames.slice(0, config.mealsPerDay).map((name, i) => ({
            name: name,
            calories: caloriesPerMeal,
            protein: proteinPerMeal,
            carbs: carbsPerMeal,
            fats: fatsPerMeal,
            foods: [
                // TODO: Génération IA des aliments
                'Aliments à définir selon vos préférences'
            ]
        }));
    },

    /**
     * Afficher les résultats
     * @param macros
     * @param plan
     * @param config
     */
    showResults(macros, plan, config) {
        console.log('🎯 showResults appelé avec:', { macros, plan, config });

        const resultsZone = document.getElementById('nutritionResultsZone');

        resultsZone.innerHTML = `
            <div class="premium-card">
                <h2 class="text-3xl font-bold text-green-400 mb-6">
                    <i class="fas fa-check-circle mr-2"></i>
                    Plan nutritionnel généré
                </h2>

                <!-- Macros -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div class="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 text-center">
                        <div class="text-3xl font-bold text-blue-400">${macros.calories}</div>
                        <div class="text-sm text-secondary mt-1">Calories/jour</div>
                    </div>
                    <div class="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-center">
                        <div class="text-3xl font-bold text-red-400">${macros.protein}g</div>
                        <div class="text-sm text-secondary mt-1">Protéines</div>
                    </div>
                    <div class="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                        <div class="text-3xl font-bold text-green-400">${macros.carbs}g</div>
                        <div class="text-sm text-secondary mt-1">Glucides</div>
                    </div>
                    <div class="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 text-center">
                        <div class="text-3xl font-bold text-yellow-400">${macros.fats}g</div>
                        <div class="text-sm text-secondary mt-1">Lipides</div>
                    </div>
                </div>

                <!-- Plan de repas -->
                <div class="mb-8">
                    <h3 class="text-xl font-bold text-white mb-4">Répartition des repas (${config.mealsPerDay} par jour)</h3>
                    <div class="space-y-3">
                        ${plan.meals.map(meal => `
                            <div class="bg-skali-darker rounded-lg p-4">
                                <div class="flex items-center justify-between mb-2">
                                    <h4 class="font-bold text-white">${meal.name}</h4>
                                    <span class="text-green-400">${meal.calories} kcal</span>
                                </div>
                                <div class="text-sm text-secondary">
                                    ${meal.protein}g protéines • ${meal.carbs}g glucides • ${meal.fats}g lipides
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-4">
                    <button onclick="NutritionProV2.downloadPDF()" class="flex-1 btn-premium btn-publish">
                        <i class="fas fa-file-pdf mr-2"></i>
                        Télécharger le PDF
                    </button>
                    <button onclick="NutritionProV2.showView()" class="flex-1 btn-premium glass-card hover:bg-gray-600">
                        <i class="fas fa-redo mr-2"></i>
                        Nouveau plan
                    </button>
                </div>
            </div>
        `;

        resultsZone.classList.remove('hidden');
        resultsZone.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Sauvegarder le plan pour le PDF
        this.currentPlan = { macros, plan, config };
    },

    /**
     * Télécharger le PDF
     */
    async downloadPDF() {
        if (!this.currentPlan) {
            Utils.showNotification('Erreur', 'Aucun plan à télécharger', 'error');
            return;
        }

        try {
            Utils.showNotification('Génération...', 'Création du PDF en cours', 'info');

            // Utiliser le générateur PDF existant
            await NutritionPDF.generatePDF(
                this.currentPlan.plan,
                this.currentPlan.macros,
                this.currentMember,
                this.currentPlan.config
            );

            Utils.showNotification('Succès', 'PDF téléchargé !', 'success');

        } catch (error) {
            console.error('Erreur génération PDF:', error);
            Utils.showNotification('Erreur', 'Impossible de générer le PDF', 'error');
        }
    }
};

// Exposer globalement
window.NutritionProV2 = NutritionProV2;
