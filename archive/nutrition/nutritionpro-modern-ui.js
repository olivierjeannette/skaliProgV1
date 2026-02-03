/**
 * NUTRITION PRO - MODERN UI
 * Interface moderne et élégante pour le module nutrition
 * Design inspiré iOS avec glassmorphism et animations fluides
 */

const NutritionProModernUI = {
    /**
     * Afficher la vue principale avec le nouveau design
     */
    async showMainView() {
        const members = await SupabaseManager.getMembers();

        const html = `
            <div class="nutrition-modern-container">
                <!-- Header moderne -->
                <div class="nutrition-header nutrition-animate-in">
                    <div class="nutrition-header-content">
                        <div class="nutrition-header-title">
                            <div class="nutrition-header-icon">
                                🍎
                            </div>
                            <div class="nutrition-header-text">
                                <h1>Nutrition Pro</h1>
                                <p>Plans nutritionnels personnalisés avec IA</p>
                            </div>
                        </div>
                        <div class="nutrition-header-flex">
                            <button onclick="DiscordNutrition.openMembersConfig()" class="nutrition-btn nutrition-btn-secondary">
                                <i class="fab fa-discord"></i>
                                <span>Discord</span>
                            </button>
                            <button onclick="NutritionPro.showWeightTracking()" class="nutrition-btn nutrition-btn-ghost">
                                <i class="fas fa-chart-line"></i>
                                <span>Suivi Poids</span>
                            </button>
                        </div>
                    </div>
                </div>

                ${NutritionPro.currentMember ? this.renderModernPlanCreator() : this.renderModernMemberSelector(members)}
            </div>
        `;

        const contentEl = document.getElementById('mainContent') || document.querySelector('#mainApp');
        if (contentEl) {
            contentEl.innerHTML = html;

            // CSS chargé globalement via master-theme.css
        }
    },

    /**
     * Sélecteur de membre moderne
     * @param members
     */
    renderModernMemberSelector(members) {
        return `
            <div class="nutrition-card nutrition-animate-in">
                <div class="nutrition-card-header">
                    <div class="nutrition-card-icon nutrition-card-icon-blue">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="nutrition-card-title">
                        <h3>Sélectionner un adhérent</h3>
                        <p>Choisissez un membre pour créer son plan nutritionnel</p>
                    </div>
                </div>

                <!-- Barre de recherche -->
                <div class="nutrition-form-group">
                    <div class="nutrition-form-label">
                        <i class="fas fa-search"></i>
                        <span>Rechercher</span>
                    </div>
                    <input type="text"
                           id="memberSearchInput"
                           class="nutrition-form-input"
                           placeholder="Nom de l'adhérent..."
                           oninput="NutritionProModernUI.filterMembers(this.value)">
                </div>

                <!-- Liste des membres -->
                <div id="membersListContainer" class="nutrition-grid nutrition-members-list">
                    ${members.map((member, index) => this.renderMemberCard(member, index)).join('')}
                </div>

                ${members.length === 0 ? `
                    <div class="nutrition-empty-state">
                        <i class="fas fa-users nutrition-empty-icon"></i>
                        <p>Aucun membre trouvé</p>
                        <p class="nutrition-empty-subtitle">Ajoutez des membres dans la section Adhérents</p>
                    </div>
                ` : ''}
            </div>
        `;
    },

    /**
     * Carte de membre individuelle
     * @param member
     * @param index
     */
    renderMemberCard(member, index) {
        const age = NutritionCalculator.calculateAge(member.birthdate);
        const animationDelay = (index * 0.05).toFixed(2);

        return `
            <div class="nutrition-card member-card nutrition-animate-scale cursor-pointer"
                 data-member-name="${member.name.toLowerCase()}"
                 style="animation-delay: ${animationDelay}s;"
                 onclick="NutritionPro.selectMember('${member.id}')">

                <!-- Avatar -->
                <div class="member-card-avatar-container">
                    <div class="member-card-avatar">
                        ${member.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="member-card-info">
                        <h4 class="member-card-name">
                            ${member.name}
                        </h4>
                        <div class="member-card-badges">
                            <span class="nutrition-badge nutrition-badge-info">
                                <i class="fas fa-birthday-cake"></i>
                                ${age} ans
                            </span>
                            ${member.weight ? `
                                <span class="nutrition-badge nutrition-badge-success">
                                    <i class="fas fa-weight"></i>
                                    ${member.weight} kg
                                </span>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <!-- Infos supplémentaires -->
                <div class="member-card-stats">
                    ${member.height ? `
                        <div class="member-stat-item">
                            <div class="member-stat-value">
                                ${member.height} cm
                            </div>
                            <div class="member-stat-label">
                                Taille
                            </div>
                        </div>
                    ` : ''}
                    ${member.gender ? `
                        <div class="member-stat-item">
                            <div class="member-stat-emoji">
                                ${member.gender === 'male' ? '👨' : '👩'}
                            </div>
                            <div class="member-stat-label">
                                ${member.gender === 'male' ? 'Homme' : 'Femme'}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    /**
     * Filtrer les membres par recherche
     * @param searchTerm
     */
    filterMembers(searchTerm) {
        const memberCards = document.querySelectorAll('.member-card');
        const lowerSearch = searchTerm.toLowerCase();

        memberCards.forEach(card => {
            const memberName = card.getAttribute('data-member-name');
            if (memberName.includes(lowerSearch)) {
                card.style.display = 'block';
                card.classList.add('nutrition-animate-scale');
            } else {
                card.style.display = 'none';
            }
        });
    },

    /**
     * Créateur de plan moderne
     */
    renderModernPlanCreator() {
        const member = NutritionPro.currentMember;

        return `
            <div class="nutrition-animate-in">
                <!-- Infos membre sélectionné -->
                <div class="nutrition-card mb-24">
                    <div class="member-selected-header">
                        <div class="member-selected-info">
                            <div class="member-card-avatar member-card-avatar-lg">
                                ${member.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 class="member-card-name member-card-name-lg">
                                    ${member.name}
                                </h2>
                                <div class="member-card-badges">
                                    <span class="nutrition-badge nutrition-badge-info">
                                        ${NutritionCalculator.calculateAge(member.birthdate)} ans
                                    </span>
                                    ${member.weight ? `
                                        <span class="nutrition-badge nutrition-badge-success">
                                            ${member.weight} kg
                                        </span>
                                    ` : ''}
                                    ${member.height ? `
                                        <span class="nutrition-badge nutrition-badge-info">
                                            ${member.height} cm
                                        </span>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                        <button onclick="NutritionPro.deselectMember()" class="nutrition-btn nutrition-btn-ghost">
                            <i class="fas fa-arrow-left"></i>
                            <span>Changer de membre</span>
                        </button>
                    </div>
                </div>

                <!-- Formulaire de création de plan -->
                ${this.renderModernPlanForm()}
            </div>
        `;
    },

    /**
     * Formulaire moderne de création de plan
     */
    renderModernPlanForm() {
        return `
            <div class="nutrition-card">
                <div class="nutrition-card-header">
                    <div class="nutrition-card-icon nutrition-card-icon-orange">
                        <i class="fas fa-magic"></i>
                    </div>
                    <div class="nutrition-card-title">
                        <h3>Créer un plan nutritionnel</h3>
                        <p>Configurez les paramètres du plan personnalisé</p>
                    </div>
                </div>

                <form id="nutritionPlanForm" onsubmit="NutritionProModernUI.handleFormSubmit(event)">
                    <!-- Objectif -->
                    <div class="nutrition-form-group">
                        <div class="nutrition-form-label">
                            <i class="fas fa-bullseye"></i>
                            <span>Objectif nutritionnel</span>
                        </div>
                        <div class="nutrition-grid">
                            ${this.renderObjectiveCards()}
                        </div>
                        <input type="hidden" id="objectiveInput" name="objective" required>
                    </div>

                    <!-- Durée du plan -->
                    <div class="nutrition-form-group">
                        <div class="nutrition-form-label">
                            <i class="fas fa-calendar-alt"></i>
                            <span>Durée du plan</span>
                        </div>
                        <div class="nutrition-form-grid">
                            ${this.renderDurationButtons()}
                        </div>
                        <input type="hidden" id="durationInput" name="duration" required>
                    </div>

                    <!-- Nombre de repas par jour -->
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

                    <!-- Allergies & Restrictions -->
                    <div class="nutrition-form-group">
                        <div class="nutrition-form-label">
                            <i class="fas fa-exclamation-triangle"></i>
                            <span>Allergies & Intolérances</span>
                        </div>
                        <div class="nutrition-form-grid-lg">
                            ${this.renderAllergiesCheckboxes()}
                        </div>
                    </div>

                    <!-- Régimes alimentaires -->
                    <div class="nutrition-form-group">
                        <div class="nutrition-form-label">
                            <i class="fas fa-leaf"></i>
                            <span>Régimes alimentaires</span>
                        </div>
                        <div class="nutrition-form-grid-lg">
                            ${this.renderRegimesCheckboxes()}
                        </div>
                    </div>

                    <!-- Compléments alimentaires -->
                    <div class="nutrition-form-group">
                        <div class="nutrition-form-label">
                            <i class="fas fa-pills"></i>
                            <span>Compléments alimentaires</span>
                        </div>
                        <div class="nutrition-supplement-container">
                            <div class="nutrition-supplement-header">
                                <div class="nutrition-supplement-icon">
                                    💊
                                </div>
                                <div>
                                    <h4 class="nutrition-supplement-title">
                                        Utilisez-vous des compléments ?
                                    </h4>
                                    <p class="nutrition-supplement-subtitle">
                                        Sélectionnez ceux que vous prenez régulièrement
                                    </p>
                                </div>
                            </div>
                            <div class="nutrition-supplement-grid">
                                ${this.renderSupplementsCheckboxes()}
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="nutrition-form-actions">
                        <button type="submit" class="nutrition-btn nutrition-btn-primary flex-1">
                            <i class="fas fa-rocket"></i>
                            <span>Générer le plan</span>
                        </button>
                    </div>
                </form>
            </div>
        `;
    },

    /**
     * Rendre les cartes d'objectifs
     */
    renderObjectiveCards() {
        const objectives = [
            { id: 'weight_loss', name: 'Perte de poids', icon: '🔥', gradient: 'var(--gradient-pink)' },
            { id: 'mass_gain', name: 'Prise de masse', icon: '💪', gradient: 'var(--gradient-primary)' },
            { id: 'maintenance', name: 'Maintien', icon: '⚖️', gradient: 'var(--gradient-blue)' },
            { id: 'cutting', name: 'Sèche', icon: '⚡', gradient: 'var(--gradient-orange)' },
            { id: 'performance_endurance', name: 'Endurance', icon: '🏃', gradient: 'var(--gradient-purple)' },
            { id: 'sante_generale', name: 'Santé', icon: '❤️', gradient: 'var(--gradient-primary)' }
        ];

        return objectives.map(obj => `
            <div class="objective-card" onclick="NutritionProModernUI.selectObjective('${obj.id}')" data-objective="${obj.id}">
                <div class="objective-icon" style="background: ${obj.gradient};">
                    ${obj.icon}
                </div>
                <div class="objective-name">${obj.name}</div>
            </div>
        `).join('');
    },

    /**
     * Rendre les boutons de durée
     */
    renderDurationButtons() {
        const durations = [
            { id: '1day', label: '1 jour', value: 1 },
            { id: '1week', label: '1 semaine', value: 7 },
            { id: '1month', label: '1 mois', value: 30 }
        ];

        return durations.map(dur => `
            <button type="button" class="duration-btn" onclick="NutritionProModernUI.selectDuration(${dur.value})" data-duration="${dur.value}">
                <i class="fas fa-calendar-day"></i>
                <span>${dur.label}</span>
            </button>
        `).join('');
    },

    /**
     * Sélectionner un objectif
     * @param objectiveId
     */
    selectObjective(objectiveId) {
        document.querySelectorAll('.objective-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-objective="${objectiveId}"]`).classList.add('selected');
        document.getElementById('objectiveInput').value = objectiveId;
    },

    /**
     * Sélectionner une durée
     * @param days
     */
    selectDuration(days) {
        document.querySelectorAll('.duration-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.querySelector(`[data-duration="${days}"]`).classList.add('selected');
        document.getElementById('durationInput').value = days;
    },

    /**
     * Render checkboxes pour allergies
     */
    renderAllergiesCheckboxes() {
        const allergies = [
            { id: 'gluten', label: 'Gluten', icon: '🌾' },
            { id: 'lactose', label: 'Lactose', icon: '🥛' },
            { id: 'nuts', label: 'Fruits à coque', icon: '🥜' },
            { id: 'eggs', label: 'Œufs', icon: '🥚' },
            { id: 'fish', label: 'Poisson', icon: '🐟' },
            { id: 'shellfish', label: 'Fruits de mer', icon: '🦐' }
        ];

        return allergies.map(allergy => `
            <div class="nutrition-form-checkbox">
                <input type="checkbox" id="allergy_${allergy.id}" name="allergies" value="${allergy.id}">
                <label for="allergy_${allergy.id}" class="nutrition-form-checkbox-label">
                    <span class="nutrition-checkbox-emoji">${allergy.icon}</span>
                    <span>${allergy.label}</span>
                </label>
            </div>
        `).join('');
    },

    /**
     * Render checkboxes pour régimes
     */
    renderRegimesCheckboxes() {
        const regimes = [
            { id: 'vegetarian', label: 'Végétarien', icon: '🥗' },
            { id: 'vegan', label: 'Vegan', icon: '🌱' },
            { id: 'halal', label: 'Halal', icon: '🕌' },
            { id: 'kosher', label: 'Casher', icon: '✡️' },
            { id: 'paleo', label: 'Paléo', icon: '🦴' },
            { id: 'keto', label: 'Keto', icon: '🥑' }
        ];

        return regimes.map(regime => `
            <div class="nutrition-form-checkbox">
                <input type="checkbox" id="regime_${regime.id}" name="regimes" value="${regime.id}">
                <label for="regime_${regime.id}" class="nutrition-form-checkbox-label">
                    <span class="nutrition-checkbox-emoji">${regime.icon}</span>
                    <span>${regime.label}</span>
                </label>
            </div>
        `).join('');
    },

    /**
     * Render checkboxes pour compléments
     */
    renderSupplementsCheckboxes() {
        const supplements = [
            { id: 'whey', label: 'Whey Protein', icon: '💪', desc: '30g post-workout' },
            { id: 'creatine', label: 'Créatine', icon: '⚡', desc: '5g par jour' },
            { id: 'omega3', label: 'Oméga-3', icon: '🐟', desc: '2-3g matin/soir' },
            { id: 'vitaminD', label: 'Vitamine D3', icon: '☀️', desc: '1000-2000 UI' },
            { id: 'preworkout', label: 'Pré-workout', icon: '🔥', desc: 'Avant séance' },
            { id: 'bcaa', label: 'BCAA', icon: '💊', desc: '5-10g pendant' },
            { id: 'magnesium', label: 'Magnésium', icon: '🌙', desc: '300-400mg soir' },
            { id: 'multivitamin', label: 'Multivitamines', icon: '🌈', desc: '1 par jour' }
        ];

        return supplements.map(supp => `
            <div class="nutrition-supplement-item" onmouseover="this.classList.add('selected')" onmouseout="if(!this.querySelector('input').checked) { this.classList.remove('selected'); }">
                <div class="nutrition-supplement-checkbox-container">
                    <input type="checkbox" id="supplement_${supp.id}" name="supplements" value="${supp.id}"
                           onchange="if(this.checked) { this.closest('.nutrition-supplement-item').classList.add('selected'); } else { this.closest('.nutrition-supplement-item').classList.remove('selected'); }"
                           class="nutrition-supplement-checkbox">
                    <span class="nutrition-supplement-emoji">${supp.icon}</span>
                    <label for="supplement_${supp.id}" class="nutrition-supplement-label">
                        ${supp.label}
                    </label>
                </div>
                <div class="nutrition-supplement-desc">
                    ${supp.desc}
                </div>
            </div>
        `).join('');
    },

    /**
     * Gérer la soumission du formulaire
     * @param event
     */
    handleFormSubmit(event) {
        event.preventDefault();

        const formData = new FormData(event.target);

        // Récupérer les allergies cochées
        const allergies = [];
        document.querySelectorAll('input[name="allergies"]:checked').forEach(cb => {
            allergies.push(cb.value);
        });

        // Récupérer les régimes cochés
        const regimes = [];
        document.querySelectorAll('input[name="regimes"]:checked').forEach(cb => {
            regimes.push(cb.value);
        });

        // Récupérer les compléments cochés
        const supplements = {};
        document.querySelectorAll('input[name="supplements"]:checked').forEach(cb => {
            supplements[cb.value] = true;
        });

        const planData = {
            objective: formData.get('objective'),
            planDuration: formData.get('duration'),
            totalDays: parseInt(formData.get('duration')),
            mealsPerDay: parseInt(formData.get('mealsPerDay')),
            budget: formData.get('budget'),
            allergies: allergies,
            regimes: regimes,
            supplements: supplements
        };

        console.log('📝 Plan data:', planData);
        console.log('💊 Compléments sélectionnés:', supplements);
        console.log('⚠️ Allergies:', allergies);
        console.log('🌱 Régimes:', regimes);

        // Lancer la création du plan V4
        NutritionPlanV4.startPlanCreation(NutritionPro.currentMember, planData);
    }
};

// Exposer globalement
window.NutritionProModernUI = NutritionProModernUI;
