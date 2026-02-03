/**
 * ═══════════════════════════════════════════════════════════════
 * NUTRITION PRO - PORTAIL MEMBRE (MOBILE-FIRST)
 * Version wizard par étapes avec système de paiement Stripe
 * ═══════════════════════════════════════════════════════════════
 */

const NutritionProMemberPortal = {
    // Configuration
    PRICING: {
        '1': { price: 0, credits: 1, label: '1 jour (GRATUIT)' },
        '7': { price: 3.99, credits: 1, label: '1 semaine (3,99€)' },
        '30': { price: 9.99, credits: 1, label: '1 mois (9,99€)' }
    },

    STRIPE_PUBLIC_KEY: 'pk_test_...', // À configurer dans ENV

    // État du wizard
    state: {
        currentStep: 1,
        totalSteps: 7,
        member: null,
        credits: 0,
        formData: {
            objective: null,
            duration: null,
            mealsPerDay: 4,
            budget: 'medium',
            allergies: [],
            regimes: [],
            supplements: []
        },
        errors: {}
    },

    /**
     * INITIALISATION
     * @param memberDiscordId
     */
    async init(memberDiscordId) {
        try {
            console.log('🍎 Nutrition Pro Member Portal - Init');

            // Charger les données du membre
            this.state.member = await this.loadMember(memberDiscordId);

            // Charger les crédits
            this.state.credits = await this.loadCredits(memberDiscordId);

            // Afficher l'étape 1
            this.showStep(1);

        } catch (error) {
            console.error('❌ Erreur init:', error);
            this.showError('Erreur lors du chargement: ' + error.message);
        }
    },

    /**
     * CHARGER MEMBRE
     * @param discordId
     */
    async loadMember(discordId) {
        const members = await SupabaseManager.getMembers();
        const member = members.find(m => m.discord_id === discordId);

        if (!member) {
            throw new Error('Membre non trouvé');
        }

        return member;
    },

    /**
     * CHARGER CRÉDITS
     * @param discordId
     */
    async loadCredits(discordId) {
        try {
            const { data, error } = await SupabaseManager.supabase
                .from('member_nutrition_credits')
                .select('credits_remaining, plans_generated')
                .eq('discord_id', discordId)
                .single();

            if (error && error.code !== 'PGRST116') {throw error;}

            // Si première fois, donner 1 crédit gratuit
            if (!data) {
                await this.initializeCredits(discordId);
                return 1;
            }

            return data.credits_remaining || 0;

        } catch (error) {
            console.warn('⚠️ Erreur chargement crédits:', error);
            return 0;
        }
    },

    /**
     * INITIALISER CRÉDITS (première fois)
     * @param discordId
     */
    async initializeCredits(discordId) {
        const { error } = await SupabaseManager.supabase
            .from('member_nutrition_credits')
            .insert([{
                discord_id: discordId,
                credits_remaining: 1,
                plans_generated: 0,
                created_at: new Date().toISOString()
            }]);

        if (error) {
            console.warn('⚠️ Erreur init crédits:', error);
        }
    },

    /**
     * AFFICHER ÉTAPE
     * @param stepNumber
     */
    showStep(stepNumber) {
        this.state.currentStep = stepNumber;

        const container = document.getElementById('nutritionPortalContainer');
        if (!container) {
            console.error('❌ Container nutritionPortalContainer non trouvé');
            return;
        }

        let stepHtml = '';

        switch(stepNumber) {
            case 1:
                stepHtml = this.renderStepObjective();
                break;
            case 2:
                stepHtml = this.renderStepDuration();
                break;
            case 3:
                stepHtml = this.renderStepNutrition();
                break;
            case 4:
                stepHtml = this.renderStepAllergies();
                break;
            case 5:
                stepHtml = this.renderStepRegimes();
                break;
            case 6:
                stepHtml = this.renderStepSupplements();
                break;
            case 7:
                stepHtml = this.renderStepSummary();
                break;
        }

        container.innerHTML = `
            <div class="nutrition-portal-wizard">
                <!-- Progress bar -->
                ${this.renderProgressBar()}

                <!-- Step content -->
                <div class="nutrition-portal-step">
                    ${stepHtml}
                </div>
            </div>
        `;
    },

    /**
     * PROGRESS BAR
     */
    renderProgressBar() {
        const progress = (this.state.currentStep / this.state.totalSteps) * 100;

        return `
            <div class="wizard-progress">
                <div class="wizard-progress-bar">
                    <div class="wizard-progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="wizard-progress-text">
                    Étape ${this.state.currentStep} sur ${this.state.totalSteps}
                </div>
            </div>
        `;
    },

    /**
     * ÉTAPE 1 - OBJECTIF
     */
    renderStepObjective() {
        const objectives = [
            { id: 'weight_loss', name: 'Perte de poids', icon: '🔥', desc: 'Perdre du gras progressivement' },
            { id: 'mass_gain', name: 'Prise de masse', icon: '💪', desc: 'Construire du muscle' },
            { id: 'maintenance', name: 'Maintien', icon: '⚖️', desc: 'Maintenir mon poids' },
            { id: 'cutting', name: 'Sèche', icon: '⚡', desc: 'Définition musculaire' },
            { id: 'performance_endurance', name: 'Endurance', icon: '🏃', desc: 'Performances sportives' },
            { id: 'sante_generale', name: 'Santé', icon: '❤️', desc: 'Équilibre général' }
        ];

        return `
            <div class="wizard-step-content">
                <h2 class="wizard-step-title">Quel est votre objectif ?</h2>
                <p class="wizard-step-subtitle">Choisissez l'objectif principal de votre plan nutritionnel</p>

                <div class="objective-grid-mobile">
                    ${objectives.map(obj => `
                        <div class="objective-card-mobile ${this.state.formData.objective === obj.id ? 'selected' : ''}"
                             onclick="NutritionProMemberPortal.selectObjective('${obj.id}')">
                            <div class="objective-icon-mobile">${obj.icon}</div>
                            <div class="objective-name-mobile">${obj.name}</div>
                            <div class="objective-desc-mobile">${obj.desc}</div>
                            <div class="objective-check-mobile">
                                <i class="fas fa-check-circle"></i>
                            </div>
                        </div>
                    `).join('')}
                </div>

                ${this.state.errors.objective ? `
                    <div class="wizard-error">${this.state.errors.objective}</div>
                ` : ''}

                <div class="wizard-buttons">
                    <button onclick="NutritionProMemberPortal.nextStep()"
                            class="wizard-btn wizard-btn-primary">
                        <span>Suivant</span>
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * ÉTAPE 2 - DURÉE + PAIEMENT
     */
    renderStepDuration() {
        const durations = [
            { value: 1, label: '1 jour', icon: '📅', price: 0, desc: 'Essai gratuit' },
            { value: 7, label: '1 semaine', icon: '📆', price: 3.99, desc: '7 jours de repas' },
            { value: 30, label: '1 mois', icon: '🗓️', price: 9.99, desc: '30 jours de repas' }
        ];

        const selectedDuration = this.state.formData.duration;
        const needsPayment = selectedDuration && this.PRICING[selectedDuration].price > 0 && this.state.credits === 0;

        return `
            <div class="wizard-step-content">
                <h2 class="wizard-step-title">Durée du plan</h2>
                <p class="wizard-step-subtitle">
                    ${this.state.credits > 0 ?
        `✨ Vous avez ${this.state.credits} crédit(s) disponible(s)` :
        '💳 Plans 7j et 30j nécessitent un paiement'
}
                </p>

                <div class="duration-grid-mobile">
                    ${durations.map(dur => {
        const isFree = dur.price === 0;
        const hasCredit = this.state.credits > 0;
        const canUse = isFree || hasCredit;

        return `
                        <div class="duration-card-mobile ${this.state.formData.duration === dur.value ? 'selected' : ''} ${!canUse ? 'locked' : ''}"
                             onclick="NutritionProMemberPortal.selectDuration(${dur.value})">
                            <div class="duration-icon-mobile">${dur.icon}</div>
                            <div class="duration-label-mobile">${dur.label}</div>
                            <div class="duration-desc-mobile">${dur.desc}</div>
                            <div class="duration-price-mobile">
                                ${isFree ?
        '<span class="price-free">GRATUIT</span>' :
        hasCredit ?
            '<span class="price-credit">1 crédit</span>' :
            `<span class="price-amount">${dur.price.toFixed(2)}€</span>`
}
                            </div>
                            ${!canUse ? '<div class="duration-lock-mobile"><i class="fas fa-lock"></i></div>' : ''}
                            <div class="duration-check-mobile">
                                <i class="fas fa-check-circle"></i>
                            </div>
                        </div>
                    `;}).join('')}
                </div>

                ${needsPayment ? this.renderStripePayment(selectedDuration) : ''}

                ${this.state.errors.duration ? `
                    <div class="wizard-error">${this.state.errors.duration}</div>
                ` : ''}

                <div class="wizard-buttons">
                    <button onclick="NutritionProMemberPortal.previousStep()"
                            class="wizard-btn wizard-btn-secondary">
                        <i class="fas fa-arrow-left"></i>
                        <span>Retour</span>
                    </button>
                    <button onclick="NutritionProMemberPortal.nextStep()"
                            class="wizard-btn wizard-btn-primary">
                        <span>Suivant</span>
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * WIDGET STRIPE PAYMENT
     * @param duration
     */
    renderStripePayment(duration) {
        const pricing = this.PRICING[duration];

        return `
            <div class="stripe-payment-container">
                <div class="stripe-payment-header">
                    <i class="fas fa-lock"></i>
                    <span>Paiement sécurisé requis</span>
                </div>
                <div class="stripe-payment-info">
                    <div class="payment-detail">
                        <span>Plan ${pricing.label}</span>
                        <strong>${pricing.price.toFixed(2)}€</strong>
                    </div>
                </div>
                <button id="stripePaymentBtn"
                        onclick="NutritionProMemberPortal.openStripeCheckout(${duration})"
                        class="wizard-btn wizard-btn-stripe">
                    <i class="fab fa-stripe"></i>
                    <span>Payer avec Stripe</span>
                </button>
                <p class="stripe-payment-note">
                    🔒 Paiement 100% sécurisé via Stripe
                </p>
            </div>
        `;
    },

    /**
     * ÉTAPE 3 - NUTRITION
     */
    renderStepNutrition() {
        return `
            <div class="wizard-step-content">
                <h2 class="wizard-step-title">Paramètres nutritionnels</h2>
                <p class="wizard-step-subtitle">Configurez vos préférences alimentaires</p>

                <div class="form-group-mobile">
                    <label class="form-label-mobile">
                        <i class="fas fa-utensils"></i>
                        Nombre de repas par jour
                    </label>
                    <select class="form-select-mobile"
                            onchange="NutritionProMemberPortal.updateFormData('mealsPerDay', parseInt(this.value))">
                        <option value="3" ${this.state.formData.mealsPerDay === 3 ? 'selected' : ''}>3 repas</option>
                        <option value="4" ${this.state.formData.mealsPerDay === 4 ? 'selected' : ''}>4 repas</option>
                        <option value="5" ${this.state.formData.mealsPerDay === 5 ? 'selected' : ''}>5 repas</option>
                        <option value="6" ${this.state.formData.mealsPerDay === 6 ? 'selected' : ''}>6 repas</option>
                    </select>
                </div>

                <div class="form-group-mobile">
                    <label class="form-label-mobile">
                        <i class="fas fa-euro-sign"></i>
                        Budget hebdomadaire
                    </label>
                    <select class="form-select-mobile"
                            onchange="NutritionProMemberPortal.updateFormData('budget', this.value)">
                        <option value="low" ${this.state.formData.budget === 'low' ? 'selected' : ''}>Économique (&lt; 50€/semaine)</option>
                        <option value="medium" ${this.state.formData.budget === 'medium' ? 'selected' : ''}>Moyen (50-80€/semaine)</option>
                        <option value="high" ${this.state.formData.budget === 'high' ? 'selected' : ''}>Élevé (&gt; 80€/semaine)</option>
                    </select>
                </div>

                <div class="wizard-buttons">
                    <button onclick="NutritionProMemberPortal.previousStep()"
                            class="wizard-btn wizard-btn-secondary">
                        <i class="fas fa-arrow-left"></i>
                        <span>Retour</span>
                    </button>
                    <button onclick="NutritionProMemberPortal.nextStep()"
                            class="wizard-btn wizard-btn-primary">
                        <span>Suivant</span>
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * ÉTAPE 4 - ALLERGIES
     */
    renderStepAllergies() {
        const allergies = [
            { id: 'gluten', label: 'Gluten', emoji: '🌾' },
            { id: 'lactose', label: 'Lactose', emoji: '🥛' },
            { id: 'nuts', label: 'Fruits à coque', emoji: '🥜' },
            { id: 'eggs', label: 'Œufs', emoji: '🥚' },
            { id: 'fish', label: 'Poisson', emoji: '🐟' },
            { id: 'shellfish', label: 'Fruits de mer', emoji: '🦐' }
        ];

        return `
            <div class="wizard-step-content">
                <h2 class="wizard-step-title">Allergies & Intolérances</h2>
                <p class="wizard-step-subtitle">Sélectionnez vos restrictions alimentaires (optionnel)</p>

                <div class="checkbox-grid-mobile">
                    ${allergies.map(allergy => `
                        <label class="checkbox-card-mobile ${this.state.formData.allergies.includes(allergy.id) ? 'checked' : ''}">
                            <input type="checkbox"
                                   value="${allergy.id}"
                                   ${this.state.formData.allergies.includes(allergy.id) ? 'checked' : ''}
                                   onchange="NutritionProMemberPortal.toggleAllergy('${allergy.id}')">
                            <span class="checkbox-emoji-mobile">${allergy.emoji}</span>
                            <span class="checkbox-label-mobile">${allergy.label}</span>
                            <span class="checkbox-check-mobile"><i class="fas fa-check"></i></span>
                        </label>
                    `).join('')}
                </div>

                <div class="wizard-buttons">
                    <button onclick="NutritionProMemberPortal.previousStep()"
                            class="wizard-btn wizard-btn-secondary">
                        <i class="fas fa-arrow-left"></i>
                        <span>Retour</span>
                    </button>
                    <button onclick="NutritionProMemberPortal.nextStep()"
                            class="wizard-btn wizard-btn-primary">
                        <span>Suivant</span>
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * ÉTAPE 5 - RÉGIMES
     */
    renderStepRegimes() {
        const regimes = [
            { id: 'vegetarian', label: 'Végétarien', emoji: '🥗' },
            { id: 'vegan', label: 'Vegan', emoji: '🌱' },
            { id: 'halal', label: 'Halal', emoji: '🕌' },
            { id: 'kosher', label: 'Casher', emoji: '✡️' },
            { id: 'paleo', label: 'Paléo', emoji: '🦴' },
            { id: 'keto', label: 'Keto', emoji: '🥑' }
        ];

        return `
            <div class="wizard-step-content">
                <h2 class="wizard-step-title">Régimes alimentaires</h2>
                <p class="wizard-step-subtitle">Sélectionnez vos préférences (optionnel)</p>

                <div class="checkbox-grid-mobile">
                    ${regimes.map(regime => `
                        <label class="checkbox-card-mobile ${this.state.formData.regimes.includes(regime.id) ? 'checked' : ''}">
                            <input type="checkbox"
                                   value="${regime.id}"
                                   ${this.state.formData.regimes.includes(regime.id) ? 'checked' : ''}
                                   onchange="NutritionProMemberPortal.toggleRegime('${regime.id}')">
                            <span class="checkbox-emoji-mobile">${regime.emoji}</span>
                            <span class="checkbox-label-mobile">${regime.label}</span>
                            <span class="checkbox-check-mobile"><i class="fas fa-check"></i></span>
                        </label>
                    `).join('')}
                </div>

                <div class="wizard-buttons">
                    <button onclick="NutritionProMemberPortal.previousStep()"
                            class="wizard-btn wizard-btn-secondary">
                        <i class="fas fa-arrow-left"></i>
                        <span>Retour</span>
                    </button>
                    <button onclick="NutritionProMemberPortal.nextStep()"
                            class="wizard-btn wizard-btn-primary">
                        <span>Suivant</span>
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * ÉTAPE 6 - COMPLÉMENTS
     */
    renderStepSupplements() {
        const supplements = [
            { id: 'whey', label: 'Whey Protein', emoji: '💪' },
            { id: 'creatine', label: 'Créatine', emoji: '⚡' },
            { id: 'omega3', label: 'Oméga-3', emoji: '🐟' },
            { id: 'vitaminD', label: 'Vitamine D3', emoji: '☀️' },
            { id: 'preworkout', label: 'Pré-workout', emoji: '🔥' },
            { id: 'bcaa', label: 'BCAA', emoji: '💊' },
            { id: 'magnesium', label: 'Magnésium', emoji: '🌙' },
            { id: 'multivitamin', label: 'Multivitamines', emoji: '🌈' }
        ];

        return `
            <div class="wizard-step-content">
                <h2 class="wizard-step-title">Compléments alimentaires</h2>
                <p class="wizard-step-subtitle">Que prenez-vous régulièrement ? (optionnel)</p>

                <div class="checkbox-grid-mobile">
                    ${supplements.map(supp => `
                        <label class="checkbox-card-mobile ${this.state.formData.supplements.includes(supp.id) ? 'checked' : ''}">
                            <input type="checkbox"
                                   value="${supp.id}"
                                   ${this.state.formData.supplements.includes(supp.id) ? 'checked' : ''}
                                   onchange="NutritionProMemberPortal.toggleSupplement('${supp.id}')">
                            <span class="checkbox-emoji-mobile">${supp.emoji}</span>
                            <span class="checkbox-label-mobile">${supp.label}</span>
                            <span class="checkbox-check-mobile"><i class="fas fa-check"></i></span>
                        </label>
                    `).join('')}
                </div>

                <div class="wizard-buttons">
                    <button onclick="NutritionProMemberPortal.previousStep()"
                            class="wizard-btn wizard-btn-secondary">
                        <i class="fas fa-arrow-left"></i>
                        <span>Retour</span>
                    </button>
                    <button onclick="NutritionProMemberPortal.nextStep()"
                            class="wizard-btn wizard-btn-primary">
                        <span>Suivant</span>
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * ÉTAPE 7 - RÉSUMÉ
     */
    renderStepSummary() {
        const objectiveName = NutritionProUnified.OBJECTIVES[this.state.formData.objective]?.name || this.state.formData.objective;
        const durationLabel = this.PRICING[this.state.formData.duration]?.label || `${this.state.formData.duration} jours`;

        return `
            <div class="wizard-step-content">
                <h2 class="wizard-step-title">Récapitulatif</h2>
                <p class="wizard-step-subtitle">Vérifiez vos choix avant de générer le plan</p>

                <div class="summary-card-mobile">
                    <div class="summary-item-mobile">
                        <span class="summary-label-mobile">🎯 Objectif</span>
                        <strong>${objectiveName}</strong>
                    </div>
                    <div class="summary-item-mobile">
                        <span class="summary-label-mobile">📅 Durée</span>
                        <strong>${durationLabel}</strong>
                    </div>
                    <div class="summary-item-mobile">
                        <span class="summary-label-mobile">🍽️ Repas/jour</span>
                        <strong>${this.state.formData.mealsPerDay} repas</strong>
                    </div>
                    <div class="summary-item-mobile">
                        <span class="summary-label-mobile">💶 Budget</span>
                        <strong>${this.state.formData.budget === 'low' ? 'Économique' : this.state.formData.budget === 'medium' ? 'Moyen' : 'Élevé'}</strong>
                    </div>
                    ${this.state.formData.allergies.length > 0 ? `
                        <div class="summary-item-mobile">
                            <span class="summary-label-mobile">⚠️ Allergies</span>
                            <strong>${this.state.formData.allergies.length} restriction(s)</strong>
                        </div>
                    ` : ''}
                    ${this.state.formData.regimes.length > 0 ? `
                        <div class="summary-item-mobile">
                            <span class="summary-label-mobile">🥗 Régimes</span>
                            <strong>${this.state.formData.regimes.length} sélectionné(s)</strong>
                        </div>
                    ` : ''}
                    ${this.state.formData.supplements.length > 0 ? `
                        <div class="summary-item-mobile">
                            <span class="summary-label-mobile">💊 Compléments</span>
                            <strong>${this.state.formData.supplements.length} produit(s)</strong>
                        </div>
                    ` : ''}
                </div>

                <div class="wizard-buttons">
                    <button onclick="NutritionProMemberPortal.previousStep()"
                            class="wizard-btn wizard-btn-secondary">
                        <i class="fas fa-arrow-left"></i>
                        <span>Retour</span>
                    </button>
                    <button onclick="NutritionProMemberPortal.generatePlan()"
                            class="wizard-btn wizard-btn-success">
                        <i class="fas fa-rocket"></i>
                        <span>Générer mon plan</span>
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * ACTIONS - Navigation
     * @param objectiveId
     */
    selectObjective(objectiveId) {
        this.state.formData.objective = objectiveId;
        delete this.state.errors.objective;
        this.showStep(this.state.currentStep);
    },

    selectDuration(duration) {
        this.state.formData.duration = duration;
        delete this.state.errors.duration;
        this.showStep(this.state.currentStep);
    },

    updateFormData(field, value) {
        this.state.formData[field] = value;
    },

    toggleAllergy(allergyId) {
        const index = this.state.formData.allergies.indexOf(allergyId);
        if (index > -1) {
            this.state.formData.allergies.splice(index, 1);
        } else {
            this.state.formData.allergies.push(allergyId);
        }
    },

    toggleRegime(regimeId) {
        const index = this.state.formData.regimes.indexOf(regimeId);
        if (index > -1) {
            this.state.formData.regimes.splice(index, 1);
        } else {
            this.state.formData.regimes.push(regimeId);
        }
    },

    toggleSupplement(suppId) {
        const index = this.state.formData.supplements.indexOf(suppId);
        if (index > -1) {
            this.state.formData.supplements.splice(index, 1);
        } else {
            this.state.formData.supplements.push(suppId);
        }
    },

    nextStep() {
        // Valider l'étape actuelle
        if (!this.validateStep(this.state.currentStep)) {
            this.showStep(this.state.currentStep); // Re-render pour afficher erreurs
            return;
        }

        // Passer à l'étape suivante
        if (this.state.currentStep < this.state.totalSteps) {
            this.showStep(this.state.currentStep + 1);
        }
    },

    previousStep() {
        if (this.state.currentStep > 1) {
            this.showStep(this.state.currentStep - 1);
        }
    },

    /**
     * VALIDATION
     * @param stepNumber
     */
    validateStep(stepNumber) {
        this.state.errors = {};

        switch(stepNumber) {
            case 1: // Objectif
                if (!this.state.formData.objective) {
                    this.state.errors.objective = '❌ Veuillez sélectionner un objectif';
                    return false;
                }
                break;

            case 2: // Durée
                if (!this.state.formData.duration) {
                    this.state.errors.duration = '❌ Veuillez sélectionner une durée';
                    return false;
                }

                // Vérifier si paiement nécessaire
                const pricing = this.PRICING[this.state.formData.duration];
                if (pricing.price > 0 && this.state.credits === 0) {
                    this.state.errors.duration = '💳 Paiement requis pour ce plan. Cliquez sur "Payer avec Stripe"';
                    return false;
                }
                break;
        }

        return true;
    },

    /**
     * STRIPE CHECKOUT
     * @param duration
     */
    async openStripeCheckout(duration) {
        try {
            const pricing = this.PRICING[duration];

            // Créer une session Stripe Checkout
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    discord_id: this.state.member.discord_id,
                    duration: duration,
                    price: pricing.price,
                    label: pricing.label
                })
            });

            const { sessionId } = await response.json();

            // Rediriger vers Stripe
            const stripe = Stripe(this.STRIPE_PUBLIC_KEY);
            const { error } = await stripe.redirectToCheckout({ sessionId });

            if (error) {
                throw new Error(error.message);
            }

        } catch (error) {
            console.error('❌ Erreur Stripe:', error);
            alert('Erreur lors du paiement: ' + error.message);
        }
    },

    /**
     * GÉNÉRER PLAN
     */
    async generatePlan() {
        try {
            Utils.showNotification('🚀 Génération de votre plan...', 'info');

            // Convertir budget en montant
            const monthlyBudget = {
                'low': 200,
                'medium': 300,
                'high': 400
            }[this.state.formData.budget] || 300;

            // Préparer données
            const planData = {
                member: this.state.member,
                ...this.state.formData,
                monthlyBudget
            };

            // Utiliser le module unifié pour générer
            await NutritionProUnified.generatePlan(planData);

            // Déduire crédit si nécessaire
            if (this.PRICING[this.state.formData.duration].price > 0) {
                await this.deductCredit();
            }

            Utils.showNotification('✅ Plan généré avec succès !', 'success');

        } catch (error) {
            console.error('❌ Erreur génération:', error);
            Utils.showNotification('❌ Erreur: ' + error.message, 'error');
        }
    },

    /**
     * DÉDUIRE CRÉDIT
     */
    async deductCredit() {
        const { error } = await SupabaseManager.supabase
            .from('member_nutrition_credits')
            .update({
                credits_remaining: this.state.credits - 1,
                plans_generated: SupabaseManager.supabase.raw('plans_generated + 1'),
                last_used: new Date().toISOString()
            })
            .eq('discord_id', this.state.member.discord_id);

        if (error) {
            console.warn('⚠️ Erreur déduction crédit:', error);
        } else {
            this.state.credits--;
        }
    },

    /**
     * AFFICHER ERREUR
     * @param message
     */
    showError(message) {
        const container = document.getElementById('nutritionPortalContainer');
        if (container) {
            container.innerHTML = `
                <div class="wizard-error-page">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h2>Erreur</h2>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="wizard-btn wizard-btn-primary">
                        Recharger
                    </button>
                </div>
            `;
        }
    }
};

// Export global
window.NutritionProMemberPortal = NutritionProMemberPortal;
