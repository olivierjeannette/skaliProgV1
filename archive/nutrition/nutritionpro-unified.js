/**
 * ═══════════════════════════════════════════════════════════════
 * NUTRITION PRO - UNIFIED VERSION
 * Fichier unique propre pour TOUT le module nutrition
 * Fini les redondances, fichiers multiples, et le bordel !
 * ═══════════════════════════════════════════════════════════════
 */

const NutritionProUnified = {
    // Configuration des objectifs nutritionnels
    OBJECTIVES: {
        'weight_loss': {
            name: 'Perte de poids',
            icon: '🔥',
            description: 'Déficit calorique pour perdre du poids progressivement'
        },
        'mass_gain': {
            name: 'Prise de masse',
            icon: '💪',
            description: 'Surplus calorique pour construire du muscle'
        },
        'maintenance': {
            name: 'Maintien',
            icon: '⚖️',
            description: 'Maintenir le poids et la composition corporelle'
        },
        'cutting': {
            name: 'Sèche',
            icon: '⚡',
            description: 'Déficit calorique important pour sécher'
        },
        'performance_endurance': {
            name: 'Endurance',
            icon: '🏃',
            description: 'Optimiser les performances d\'endurance'
        },
        'sante_generale': {
            name: 'Santé générale',
            icon: '❤️',
            description: 'Équilibre nutritionnel pour la santé'
        }
    },

    // État global
    state: {
        currentMember: null,
        currentPlan: null,
        formData: {},
        isGenerating: false
    },

    /**
     * INITIALISATION - Point d'entrée unique
     */
    async init() {
        try {
            console.log('🍎 Nutrition Pro Unified - Initialisation');
            await this.showMainView();
        } catch (error) {
            console.error('❌ Erreur initialisation Nutrition Pro:', error);
            this.showError('Erreur lors de l\'initialisation du module Nutrition Pro: ' + error.message);
        }
    },

    /**
     * VUE PRINCIPALE - Sélection membre OU formulaire
     */
    async showMainView() {
        try {
            console.log('📋 Chargement des membres...');

            // Vérifier que SupabaseManager existe
            if (typeof SupabaseManager === 'undefined' || !SupabaseManager.getMembers) {
                throw new Error('SupabaseManager non disponible. Le module de base de données n\'est pas chargé.');
            }

            const members = await SupabaseManager.getMembers();
            console.log(`✅ ${members ? members.length : 0} membres chargés`);

            const html = `
                <div class="nutrition-modern-container">
                    <!-- Header unique -->
                    ${this.renderHeader()}

                    <!-- Contenu : Sélecteur OU Formulaire -->
                    <div class="nutrition-content">
                        ${this.state.currentMember ? this.renderPlanForm() : this.renderMemberSelector(members)}
                    </div>
                </div>
            `;

            const contentEl = document.getElementById('mainContent') || document.querySelector('#mainApp');
            if (!contentEl) {
                throw new Error('Element mainContent ou mainApp non trouvé dans le DOM');
            }

            contentEl.innerHTML = html;
            console.log('✅ Vue principale affichée');

        } catch (error) {
            console.error('❌ Erreur showMainView:', error);
            this.showError('Erreur lors de l\'affichage: ' + error.message);
        }
    },

    /**
     * AFFICHER ERREUR
     * @param message
     */
    showError(message) {
        const contentEl = document.getElementById('mainContent') || document.querySelector('#mainApp');
        if (contentEl) {
            contentEl.innerHTML = `
                <div class="nutrition-modern-container">
                    <div class="nutrition-card">
                        <div class="nutrition-card-header">
                            <div class="nutrition-card-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626);">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <div class="nutrition-card-title">
                                <h3>Erreur</h3>
                                <p>Une erreur est survenue</p>
                            </div>
                        </div>
                        <div class="nutrition-form-group">
                            <p style="color: var(--text-secondary); margin-bottom: 1rem;">${message}</p>
                            <button onclick="location.reload()" class="nutrition-btn nutrition-btn-primary">
                                <i class="fas fa-redo"></i>
                                <span>Recharger la page</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        if (typeof Utils !== 'undefined' && Utils.showNotification) {
            Utils.showNotification(`❌ ${message}`, 'error');
        }
    },

    /**
     * HEADER UNIQUE
     */
    renderHeader() {
        return `
            <div class="nutrition-header nutrition-animate-in">
                <div class="nutrition-header-content">
                    <div class="nutrition-header-title">
                        <div class="nutrition-header-icon">🍎</div>
                        <div class="nutrition-header-text">
                            <h1>Nutrition Pro</h1>
                            <p>${this.state.currentMember ?
        `Plan pour ${this.state.currentMember.name}` :
        'Plans nutritionnels personnalisés avec IA'
}</p>
                        </div>
                    </div>
                    <div class="nutrition-header-flex">
                        ${this.state.currentMember ? `
                            <button onclick="NutritionProUnified.backToMembers()" class="nutrition-btn nutrition-btn-ghost">
                                <i class="fas fa-arrow-left"></i>
                                <span>Retour</span>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * SÉLECTEUR MEMBRES - Grid cards
     * @param members
     */
    renderMemberSelector(members) {
        if (!members || members.length === 0) {
            return `
                <div class="nutrition-empty-state">
                    <div class="nutrition-empty-icon">👥</div>
                    <p class="nutrition-empty-title">Aucun membre trouvé</p>
                    <p class="nutrition-empty-subtitle">Ajoutez des membres pour créer des plans nutritionnels</p>
                </div>
            `;
        }

        return `
            <div class="nutrition-card">
                <div class="nutrition-card-header">
                    <div class="nutrition-card-icon nutrition-card-icon-blue">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="nutrition-card-title">
                        <h3>Sélectionner un membre</h3>
                        <p>Choisissez un membre pour créer son plan nutritionnel</p>
                    </div>
                </div>

                <!-- Recherche -->
                <div class="nutrition-form-group">
                    <input type="text"
                           id="memberSearchInput"
                           class="nutrition-form-input"
                           placeholder="🔍 Rechercher un membre..."
                           oninput="NutritionProUnified.filterMembers(this.value)">
                </div>

                <!-- Grid membres -->
                <div id="membersListContainer" class="nutrition-grid">
                    ${members.map(member => this.renderMemberCard(member)).join('')}
                </div>
            </div>
        `;
    },

    /**
     * CARD MEMBRE individuelle
     * @param member
     */
    renderMemberCard(member) {
        const initial = member.name.charAt(0).toUpperCase();
        return `
            <div class="member-card" onclick="NutritionProUnified.selectMember('${member.discord_id}')">
                <div class="member-card-avatar-container">
                    <div class="member-card-avatar-lg">${initial}</div>
                    <div class="member-card-info">
                        <div class="member-card-name-lg">${member.name}</div>
                    </div>
                </div>
                ${member.weight || member.height ? `
                    <div class="member-card-stats">
                        ${member.weight ? `
                            <div class="member-stat-item">
                                <div class="member-stat-emoji">⚖️</div>
                                <div class="member-stat-value">${member.weight}</div>
                                <div class="member-stat-label">kg</div>
                            </div>
                        ` : ''}
                        ${member.height ? `
                            <div class="member-stat-item">
                                <div class="member-stat-emoji">📏</div>
                                <div class="member-stat-value">${member.height}</div>
                                <div class="member-stat-label">cm</div>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    },

    /**
     * FORMULAIRE COMPLET - Une seule page avec TOUT
     */
    renderPlanForm() {
        return `
            <div class="nutrition-card">
                <div class="nutrition-card-header">
                    <div class="nutrition-card-icon nutrition-card-icon-orange">
                        <i class="fas fa-magic"></i>
                    </div>
                    <div class="nutrition-card-title">
                        <h3>Créer un plan nutritionnel</h3>
                        <p>Configurez tous les paramètres du plan personnalisé</p>
                    </div>
                </div>

                <form id="nutritionPlanForm" onsubmit="NutritionProUnified.submitForm(event)">
                    <!-- Objectif -->
                    ${this.renderObjectiveSection()}

                    <!-- Durée -->
                    ${this.renderDurationSection()}

                    <!-- Paramètres nutrition -->
                    ${this.renderNutritionParams()}

                    <!-- Allergies & Restrictions -->
                    ${this.renderAllergiesSection()}

                    <!-- Régimes alimentaires -->
                    ${this.renderDietSection()}

                    <!-- Compléments alimentaires -->
                    ${this.renderSupplementsSection()}

                    <!-- Actions -->
                    <div class="nutrition-form-actions">
                        <button type="submit" class="nutrition-btn nutrition-btn-primary flex-1" ${this.state.isGenerating ? 'disabled' : ''}>
                            <i class="fas ${this.state.isGenerating ? 'fa-spinner fa-spin' : 'fa-rocket'}"></i>
                            <span>${this.state.isGenerating ? 'Génération en cours...' : 'Générer le plan nutritionnel'}</span>
                        </button>
                    </div>
                </form>
            </div>

            <!-- Statistiques membre (BMR, TDEE) -->
            ${this.renderMemberStats()}
        `;
    },

    /**
     * SECTION OBJECTIF
     */
    renderObjectiveSection() {
        const objectives = [
            { id: 'weight_loss', name: 'Perte de poids', icon: '🔥', gradient: 'var(--gradient-pink)' },
            { id: 'mass_gain', name: 'Prise de masse', icon: '💪', gradient: 'var(--gradient-primary)' },
            { id: 'maintenance', name: 'Maintien', icon: '⚖️', gradient: 'var(--gradient-blue)' },
            { id: 'cutting', name: 'Sèche', icon: '⚡', gradient: 'var(--gradient-orange)' },
            { id: 'performance_endurance', name: 'Endurance', icon: '🏃', gradient: 'var(--gradient-purple)' },
            { id: 'sante_generale', name: 'Santé générale', icon: '❤️', gradient: 'var(--gradient-green)' }
        ];

        return `
            <div class="nutrition-form-group">
                <div class="nutrition-form-label">
                    <i class="fas fa-bullseye"></i>
                    <span>Objectif nutritionnel</span>
                </div>
                <div class="nutrition-grid">
                    ${objectives.map(obj => `
                        <div class="objective-card"
                             onclick="NutritionProUnified.selectObjective('${obj.id}')"
                             data-objective="${obj.id}">
                            <div class="objective-icon" style="background: ${obj.gradient};">
                                ${obj.icon}
                            </div>
                            <div class="objective-name">${obj.name}</div>
                        </div>
                    `).join('')}
                </div>
                <input type="hidden" id="objectiveInput" name="objective" required>
            </div>
        `;
    },

    /**
     * SECTION DURÉE
     */
    renderDurationSection() {
        const durations = [
            { value: 1, label: '1 jour', icon: 'fa-calendar-day' },
            { value: 7, label: '1 semaine', icon: 'fa-calendar-week' },
            { value: 30, label: '1 mois', icon: 'fa-calendar' }
        ];

        return `
            <div class="nutrition-form-group">
                <div class="nutrition-form-label">
                    <i class="fas fa-calendar-alt"></i>
                    <span>Durée du plan</span>
                </div>
                <div class="nutrition-form-grid">
                    ${durations.map(d => `
                        <button type="button"
                                class="duration-btn"
                                onclick="NutritionProUnified.selectDuration(${d.value})"
                                data-duration="${d.value}">
                            <i class="fas ${d.icon}"></i>
                            <span>${d.label}</span>
                        </button>
                    `).join('')}
                </div>
                <input type="hidden" id="durationInput" name="duration" required>
            </div>
        `;
    },

    /**
     * SECTION PARAMÈTRES NUTRITION
     */
    renderNutritionParams() {
        return `
            <!-- Nombre de repas -->
            <div class="nutrition-form-group">
                <div class="nutrition-form-label">
                    <i class="fas fa-utensils"></i>
                    <span>Nombre de repas par jour</span>
                </div>
                <select id="mealsPerDayInput" name="mealsPerDay" class="nutrition-form-select" required>
                    <option value="3">3 repas</option>
                    <option value="4" selected>4 repas</option>
                    <option value="5">5 repas</option>
                    <option value="6">6 repas</option>
                </select>
            </div>

            <!-- Budget -->
            <div class="nutrition-form-group">
                <div class="nutrition-form-label">
                    <i class="fas fa-euro-sign"></i>
                    <span>Budget hebdomadaire</span>
                </div>
                <select id="budgetInput" name="budget" class="nutrition-form-select">
                    <option value="low">Économique (< 50€/semaine)</option>
                    <option value="medium" selected>Moyen (50-80€/semaine)</option>
                    <option value="high">Élevé (> 80€/semaine)</option>
                </select>
            </div>
        `;
    },

    /**
     * SECTION ALLERGIES
     */
    renderAllergiesSection() {
        const allergies = [
            { id: 'gluten', label: 'Gluten', emoji: '🌾' },
            { id: 'lactose', label: 'Lactose', emoji: '🥛' },
            { id: 'nuts', label: 'Fruits à coque', emoji: '🥜' },
            { id: 'eggs', label: 'Œufs', emoji: '🥚' },
            { id: 'fish', label: 'Poisson', emoji: '🐟' },
            { id: 'shellfish', label: 'Fruits de mer', emoji: '🦐' }
        ];

        return `
            <div class="nutrition-form-group">
                <div class="nutrition-form-label">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Allergies & Intolérances</span>
                </div>
                <div class="nutrition-form-grid-lg">
                    ${allergies.map(allergy => `
                        <div class="nutrition-form-checkbox">
                            <input type="checkbox"
                                   id="allergy_${allergy.id}"
                                   name="allergies"
                                   value="${allergy.id}">
                            <label for="allergy_${allergy.id}" class="nutrition-form-checkbox-label">
                                <span class="nutrition-checkbox-emoji">${allergy.emoji}</span>
                                <span>${allergy.label}</span>
                            </label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    /**
     * SECTION RÉGIMES
     */
    renderDietSection() {
        const diets = [
            { id: 'vegetarian', label: 'Végétarien', emoji: '🥗' },
            { id: 'vegan', label: 'Vegan', emoji: '🌱' },
            { id: 'halal', label: 'Halal', emoji: '🕌' },
            { id: 'kosher', label: 'Casher', emoji: '✡️' },
            { id: 'paleo', label: 'Paléo', emoji: '🦴' },
            { id: 'keto', label: 'Keto', emoji: '🥑' }
        ];

        return `
            <div class="nutrition-form-group">
                <div class="nutrition-form-label">
                    <i class="fas fa-leaf"></i>
                    <span>Régimes alimentaires</span>
                </div>
                <div class="nutrition-form-grid-lg">
                    ${diets.map(diet => `
                        <div class="nutrition-form-checkbox">
                            <input type="checkbox"
                                   id="regime_${diet.id}"
                                   name="regimes"
                                   value="${diet.id}">
                            <label for="regime_${diet.id}" class="nutrition-form-checkbox-label">
                                <span class="nutrition-checkbox-emoji">${diet.emoji}</span>
                                <span>${diet.label}</span>
                            </label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    /**
     * SECTION COMPLÉMENTS - Design PRO
     */
    renderSupplementsSection() {
        const supplements = [
            { id: 'whey', label: 'Whey Protein', emoji: '💪', desc: '30g post-workout' },
            { id: 'creatine', label: 'Créatine', emoji: '⚡', desc: '5g par jour' },
            { id: 'omega3', label: 'Oméga-3', emoji: '🐟', desc: '2-3g matin/soir' },
            { id: 'vitaminD', label: 'Vitamine D3', emoji: '☀️', desc: '1000-2000 UI' },
            { id: 'preworkout', label: 'Pré-workout', emoji: '🔥', desc: 'Avant séance' },
            { id: 'bcaa', label: 'BCAA', emoji: '💊', desc: '5-10g pendant' },
            { id: 'magnesium', label: 'Magnésium', emoji: '🌙', desc: '300-400mg soir' },
            { id: 'multivitamin', label: 'Multivitamines', emoji: '🌈', desc: '1 par jour' }
        ];

        return `
            <div class="nutrition-form-group">
                <div class="nutrition-supplement-container">
                    <div class="nutrition-supplement-header">
                        <div class="nutrition-supplement-icon">💊</div>
                        <div>
                            <h4 class="nutrition-supplement-title">Compléments alimentaires</h4>
                            <p class="nutrition-supplement-subtitle">Sélectionnez ceux que vous prenez régulièrement</p>
                        </div>
                    </div>
                    <div class="nutrition-supplement-grid">
                        ${supplements.map(supp => `
                            <div class="nutrition-supplement-item">
                                <div class="nutrition-supplement-checkbox-container">
                                    <input type="checkbox"
                                           id="supplement_${supp.id}"
                                           name="supplements"
                                           value="${supp.id}"
                                           class="nutrition-supplement-checkbox"
                                           onchange="this.closest('.nutrition-supplement-item').classList.toggle('selected', this.checked)">
                                    <span class="nutrition-supplement-emoji">${supp.emoji}</span>
                                    <label for="supplement_${supp.id}" class="nutrition-supplement-label">
                                        ${supp.label}
                                    </label>
                                </div>
                                <div class="nutrition-supplement-desc">${supp.desc}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * STATS MEMBRE - BMR, TDEE
     */
    renderMemberStats() {
        if (!this.state.currentMember) {return '';}

        const member = this.state.currentMember;

        // Calculs simples (à améliorer avec vraies formules)
        const bmr = this.calculateBMR(member);
        const tdee = this.calculateTDEE(bmr, member.activity_level || 1.5);
        const average = Math.round((bmr + tdee) / 2);

        return `
            <div class="nutrition-card" style="margin-top: 2rem;">
                <div class="nutrition-stats">
                    <div class="nutrition-stat-card">
                        <div class="nutrition-stat-value" style="background: var(--gradient-blue); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                            ${bmr}
                        </div>
                        <div class="nutrition-stat-label">BMR (Repos total)</div>
                    </div>
                    <div class="nutrition-stat-card">
                        <div class="nutrition-stat-value" style="background: var(--gradient-orange); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                            ${tdee}
                        </div>
                        <div class="nutrition-stat-label">TDEE (Activité normale)</div>
                    </div>
                    <div class="nutrition-stat-card">
                        <div class="nutrition-stat-value" style="background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                            ${average}
                        </div>
                        <div class="nutrition-stat-label">Moyenne hebdomadaire</div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * ACTIONS - Handlers événements
     * @param discordId
     */
    async selectMember(discordId) {
        const members = await SupabaseManager.getMembers();
        this.state.currentMember = members.find(m => m.discord_id === discordId);
        await this.showMainView();
    },

    backToMembers() {
        this.state.currentMember = null;
        this.state.formData = {};
        this.showMainView();
    },

    selectObjective(objective) {
        // Désélectionner tous
        document.querySelectorAll('.objective-card').forEach(card => {
            card.classList.remove('selected');
        });
        // Sélectionner celui cliqué
        const card = document.querySelector(`[data-objective="${objective}"]`);
        if (card) {
            card.classList.add('selected');
            document.getElementById('objectiveInput').value = objective;
        }
    },

    selectDuration(duration) {
        // Désélectionner tous
        document.querySelectorAll('.duration-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        // Sélectionner celui cliqué
        const btn = document.querySelector(`[data-duration="${duration}"]`);
        if (btn) {
            btn.classList.add('selected');
            document.getElementById('durationInput').value = duration;
        }
    },

    filterMembers(searchTerm) {
        const cards = document.querySelectorAll('.member-card');
        const term = searchTerm.toLowerCase();

        cards.forEach(card => {
            const name = card.textContent.toLowerCase();
            card.style.display = name.includes(term) ? '' : 'none';
        });
    },

    /**
     * SOUMISSION FORMULAIRE - Génération plan
     * @param event
     */
    async submitForm(event) {
        event.preventDefault();

        if (this.state.isGenerating) {return;}

        const form = event.target;
        const formData = new FormData(form);

        // Validation
        const objective = formData.get('objective');
        const duration = formData.get('duration');

        if (!objective || !duration) {
            Utils.showNotification('Veuillez sélectionner un objectif et une durée', 'warning');
            return;
        }

        // Convertir le budget en montant mensuel
        const budgetLevel = formData.get('budget') || 'medium';
        const monthlyBudget = {
            'low': 200,      // < 50€/semaine = ~200€/mois
            'medium': 300,   // 50-80€/semaine = ~300€/mois
            'high': 400      // > 80€/semaine = ~400€/mois
        }[budgetLevel] || 300;

        // Collecter toutes les données
        const planData = {
            member: this.state.currentMember,
            objective,
            duration: parseInt(duration),
            mealsPerDay: parseInt(formData.get('mealsPerDay')),
            budget: budgetLevel,
            monthlyBudget: monthlyBudget,  // Pour l'IA
            allergies: formData.getAll('allergies'),
            regimes: formData.getAll('regimes'),
            supplements: formData.getAll('supplements')
        };

        this.state.isGenerating = true;
        await this.generatePlan(planData);
        this.state.isGenerating = false;
    },

    /**
     * GÉNÉRATION PLAN - Appel IA
     * @param planData
     */
    async generatePlan(planData) {
        try {
            Utils.showNotification('🚀 Génération du plan nutritionnel...', 'info');

            console.log('📝 Données du plan:', planData);

            // 1. Calculer les macros
            const macros = this.calculateMacrosDetailed(planData.member, planData.objective);

            // 2. Générer le plan de repas avec IA
            const mealPlan = await NutritionAIGenerator.generateMealPlan({
                member: planData.member,
                macros: macros,
                planData: planData,
                days: planData.duration
            });

            // 3. Sauvegarder le plan
            this.state.currentPlan = {
                ...planData,
                macros,
                mealPlan,
                generatedAt: new Date().toISOString()
            };

            // 4. Sauvegarder dans la base de données
            await this.savePlanToDatabase(this.state.currentPlan);

            Utils.showNotification('✅ Plan nutritionnel généré avec succès !', 'success');

            // 5. Afficher le résultat
            this.showPlanResult();

        } catch (error) {
            console.error('Erreur génération plan:', error);
            Utils.showNotification(`❌ Erreur: ${error.message}`, 'error');
        }
    },

    /**
     * CALCUL MACROS DÉTAILLÉ
     * @param member
     * @param objective
     */
    calculateMacrosDetailed(member, objective) {
        const bmr = this.calculateBMR(member);
        const tdee = this.calculateTDEE(bmr, member.activity_level || 1.5);

        // Ajustements selon objectif
        let targetCalories = tdee;
        let proteinRatio = 0.3; // 30% des calories
        let carbsRatio = 0.4;   // 40% des calories
        let fatsRatio = 0.3;    // 30% des calories

        switch (objective) {
            case 'weight_loss':
                targetCalories = Math.round(tdee * 0.85); // -15%
                proteinRatio = 0.35;
                carbsRatio = 0.35;
                fatsRatio = 0.30;
                break;
            case 'mass_gain':
                targetCalories = Math.round(tdee * 1.15); // +15%
                proteinRatio = 0.30;
                carbsRatio = 0.45;
                fatsRatio = 0.25;
                break;
            case 'cutting':
                targetCalories = Math.round(tdee * 0.80); // -20%
                proteinRatio = 0.40;
                carbsRatio = 0.30;
                fatsRatio = 0.30;
                break;
            case 'performance_endurance':
                targetCalories = Math.round(tdee * 1.10); // +10%
                proteinRatio = 0.25;
                carbsRatio = 0.55;
                fatsRatio = 0.20;
                break;
        }

        // Calculer les grammes de macros
        const protein = Math.round((targetCalories * proteinRatio) / 4);
        const carbs = Math.round((targetCalories * carbsRatio) / 4);
        const fats = Math.round((targetCalories * fatsRatio) / 9);

        return {
            bmr,
            tdee,
            targetCalories,
            macros: {
                protein: { grams: protein, calories: protein * 4, percentage: Math.round(proteinRatio * 100) },
                carbs: { grams: carbs, calories: carbs * 4, percentage: Math.round(carbsRatio * 100) },
                fats: { grams: fats, calories: fats * 9, percentage: Math.round(fatsRatio * 100) }
            }
        };
    },

    /**
     * SAUVEGARDER PLAN EN BASE
     * @param plan
     */
    async savePlanToDatabase(plan) {
        try {
            const planRecord = {
                member_discord_id: plan.member.discord_id,
                member_name: plan.member.name,
                objective: plan.objective,
                duration_days: plan.duration,
                meals_per_day: plan.mealsPerDay,
                budget: plan.budget,
                allergies: plan.allergies,
                regimes: plan.regimes,
                supplements: plan.supplements,
                macros: plan.macros,
                meal_plan: plan.mealPlan,
                generated_at: plan.generatedAt,
                created_at: new Date().toISOString()
            };

            const { data, error } = await SupabaseManager.supabase
                .from('nutrition_plans')
                .insert([planRecord])
                .select()
                .single();

            if (error) {throw error;}

            console.log('✅ Plan sauvegardé en base:', data);
            this.state.currentPlan.id = data.id;

        } catch (error) {
            console.warn('⚠️ Impossible de sauvegarder le plan:', error);
            // Ne pas bloquer si la sauvegarde échoue
        }
    },

    /**
     * RÉSULTAT PLAN - Affichage
     */
    showPlanResult() {
        const plan = this.state.currentPlan;
        const member = plan.member;
        const macros = plan.macros;
        const mealPlan = plan.mealPlan;

        const html = `
            <div class="nutrition-card">
                <!-- Header résultat -->
                <div class="nutrition-card-header">
                    <div class="nutrition-card-icon nutrition-card-icon-green">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="nutrition-card-title">
                        <h3>Plan nutritionnel généré</h3>
                        <p>Plan pour ${member.name} - ${plan.duration} jour(s)</p>
                    </div>
                </div>

                <!-- Stats macros -->
                <div class="nutrition-stats" style="margin-bottom: 2rem;">
                    <div class="nutrition-stat-card">
                        <div class="nutrition-stat-value" style="background: var(--gradient-blue); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                            ${macros.targetCalories}
                        </div>
                        <div class="nutrition-stat-label">Calories/jour</div>
                    </div>
                    <div class="nutrition-stat-card">
                        <div class="nutrition-stat-value" style="background: var(--gradient-orange); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                            ${macros.macros.protein.grams}g
                        </div>
                        <div class="nutrition-stat-label">Protéines (${macros.macros.protein.percentage}%)</div>
                    </div>
                    <div class="nutrition-stat-card">
                        <div class="nutrition-stat-value" style="background: var(--gradient-green); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                            ${macros.macros.carbs.grams}g
                        </div>
                        <div class="nutrition-stat-label">Glucides (${macros.macros.carbs.percentage}%)</div>
                    </div>
                    <div class="nutrition-stat-card">
                        <div class="nutrition-stat-value" style="background: var(--gradient-purple); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                            ${macros.macros.fats.grams}g
                        </div>
                        <div class="nutrition-stat-label">Lipides (${macros.macros.fats.percentage}%)</div>
                    </div>
                </div>

                <!-- Plan de repas -->
                <div class="nutrition-form-group">
                    <div class="nutrition-form-label">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Plan de repas (${plan.duration} jour${plan.duration > 1 ? 's' : ''})</span>
                    </div>
                    <div class="nutrition-plan-days">
                        ${this.renderMealPlanDays(mealPlan)}
                    </div>
                </div>

                <!-- Actions -->
                <div class="nutrition-form-actions" style="margin-top: 2rem;">
                    <button onclick="NutritionProUnified.exportPDF()" class="nutrition-btn nutrition-btn-primary">
                        <i class="fas fa-file-pdf"></i>
                        <span>Exporter en PDF</span>
                    </button>
                    <button onclick="NutritionProUnified.showShoppingList()" class="nutrition-btn nutrition-btn-secondary">
                        <i class="fas fa-shopping-cart"></i>
                        <span>Liste de courses</span>
                    </button>
                    <button onclick="NutritionProUnified.backToMembers()" class="nutrition-btn nutrition-btn-ghost">
                        <i class="fas fa-arrow-left"></i>
                        <span>Nouveau plan</span>
                    </button>
                </div>
            </div>
        `;

        const contentEl = document.getElementById('mainContent') || document.querySelector('#mainApp');
        if (contentEl) {
            contentEl.innerHTML = `
                <div class="nutrition-modern-container">
                    ${this.renderHeader()}
                    <div class="nutrition-content">
                        ${html}
                    </div>
                </div>
            `;
        }
    },

    /**
     * RENDER MEAL PLAN DAYS
     * @param mealPlan
     */
    renderMealPlanDays(mealPlan) {
        if (!mealPlan || !mealPlan.days) {return '<p>Aucun plan généré</p>';}

        return mealPlan.days.map((day, index) => `
            <div class="nutrition-day-card">
                <div class="nutrition-day-header">
                    <h4>Jour ${day.day || index + 1}</h4>
                    <div class="nutrition-day-macros">
                        ${day.totalMacros.calories} kcal •
                        ${day.totalMacros.protein}g protéines •
                        ${day.totalMacros.carbs}g glucides •
                        ${day.totalMacros.fats}g lipides
                    </div>
                </div>
                <div class="nutrition-meals-list">
                    ${day.meals.map(meal => this.renderMealCard(meal)).join('')}
                </div>
            </div>
        `).join('');
    },

    /**
     * RENDER MEAL CARD
     * @param meal
     */
    renderMealCard(meal) {
        return `
            <div class="nutrition-meal-card">
                <div class="nutrition-meal-header">
                    <div class="nutrition-meal-type">${meal.type}</div>
                    <div class="nutrition-meal-macros">${meal.macros.calories} kcal</div>
                </div>
                <div class="nutrition-meal-name">${meal.name}</div>
                <div class="nutrition-meal-ingredients">
                    ${meal.ingredients.map(ing => `
                        <span class="nutrition-ingredient-tag">
                            ${ing.quantity}${ing.unit} ${ing.name}
                        </span>
                    `).join('')}
                </div>
                <div class="nutrition-meal-macros-detail">
                    P: ${meal.macros.protein}g |
                    G: ${meal.macros.carbs}g |
                    L: ${meal.macros.fats}g
                    ${meal.prepTime ? `| <i class="fas fa-clock"></i> ${meal.prepTime}` : ''}
                </div>
            </div>
        `;
    },

    /**
     * EXPORT PDF
     */
    async exportPDF() {
        try {
            Utils.showNotification('📄 Génération du PDF...', 'info');

            const plan = this.state.currentPlan;

            // Vérifier que NutritionPDFEnhanced existe
            if (typeof NutritionPDFEnhanced === 'undefined') {
                throw new Error('Module PDF non chargé. Veuillez recharger la page.');
            }

            // Générer le PDF
            await NutritionPDFEnhanced.generatePDF({
                member: plan.member,
                planData: plan,
                macros: plan.macros,
                mealPlan: plan.mealPlan
            });

            Utils.showNotification('✅ PDF généré avec succès !', 'success');

        } catch (error) {
            console.error('Erreur export PDF:', error);
            Utils.showNotification(`❌ Erreur PDF: ${error.message}`, 'error');
        }
    },

    /**
     * AFFICHER LISTE DE COURSES
     */
    showShoppingList() {
        const plan = this.state.currentPlan;
        const shoppingList = NutritionAIGenerator.generateShoppingList(plan.mealPlan);

        const html = `
            <div class="nutrition-card">
                <div class="nutrition-card-header">
                    <div class="nutrition-card-icon nutrition-card-icon-blue">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <div class="nutrition-card-title">
                        <h3>Liste de courses</h3>
                        <p>${shoppingList.itemCount} articles - Budget total: ${shoppingList.totalCost}€</p>
                    </div>
                </div>

                ${Object.entries(shoppingList.categories).map(([category, items]) => `
                    <div class="nutrition-form-group">
                        <div class="nutrition-form-label">
                            <i class="fas fa-folder"></i>
                            <span>${category}</span>
                        </div>
                        <div class="nutrition-shopping-items">
                            ${items.map(item => `
                                <div class="nutrition-shopping-item">
                                    <div class="nutrition-shopping-item-name">
                                        ${item.name}
                                    </div>
                                    <div class="nutrition-shopping-item-quantity">
                                        ${item.quantity}${item.unit}
                                    </div>
                                    <div class="nutrition-shopping-item-price">
                                        ${item.totalPrice}€
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}

                <div class="nutrition-form-actions">
                    <button onclick="NutritionProUnified.showPlanResult()" class="nutrition-btn nutrition-btn-secondary">
                        <i class="fas fa-arrow-left"></i>
                        <span>Retour au plan</span>
                    </button>
                    <button onclick="NutritionProUnified.printShoppingList()" class="nutrition-btn nutrition-btn-primary">
                        <i class="fas fa-print"></i>
                        <span>Imprimer</span>
                    </button>
                </div>
            </div>
        `;

        const contentEl = document.getElementById('mainContent') || document.querySelector('#mainApp');
        if (contentEl) {
            contentEl.innerHTML = `
                <div class="nutrition-modern-container">
                    ${this.renderHeader()}
                    <div class="nutrition-content">
                        ${html}
                    </div>
                </div>
            `;
        }
    },

    /**
     * IMPRIMER LISTE DE COURSES
     */
    printShoppingList() {
        window.print();
    },

    /**
     * CALCULS - BMR / TDEE / AGE
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
    },

    calculateBMR(member) {
        // Calculer l'âge si birthdate fourni, sinon utiliser member.age
        const age = member.age || this.calculateAge(member.birthdate);

        if (!member.weight || !member.height || !age) {
            return 2000; // Valeur par défaut
        }

        // Formule Harris-Benedict
        const weight = member.weight;
        const height = member.height;
        const gender = member.gender || 'male';

        let bmr;
        if (gender === 'male') {
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        } else {
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        }

        return Math.round(bmr);
    },

    calculateTDEE(bmr, activityLevel) {
        return Math.round(bmr * activityLevel);
    }
};

// Auto-init si appelé directement
if (typeof window !== 'undefined') {
    window.NutritionProUnified = NutritionProUnified;
}
