/**
 * ==================================================================
 * PROGRAMMATION PRO - MODULE COMPLET
 * Generation de programmes d'entrainement personnalises
 * Propulse par Claude 3.5 Haiku + Science de la periodisation
 * ==================================================================
 */

const ProgrammingPro = {
    // État global
    state: {
        currentMember: null,
        currentStep: 1,
        totalSteps: 6,
        formData: {},
        generatedProgram: null,
        isGenerating: false,
        allMembers: []
    },

    /**
     * INITIALISATION - Point d'entrée unique
     */
    async init() {
        try {
            console.log('🏋️ Programmation Pro - Initialisation');
            await this.showMainView();
        } catch (error) {
            console.error('❌ Erreur initialisation Programmation Pro:', error);
            this.showError("Erreur lors de l'initialisation: " + error.message);
        }
    },

    /**
     * VUE PRINCIPALE - Sélection membre OU formulaire
     */
    async showMainView() {
        try {
            console.log('📋 Chargement des membres...');

            // Vérifier SupabaseManager
            if (typeof SupabaseManager === 'undefined') {
                throw new Error('SupabaseManager non disponible');
            }

            // Charger membres et performances
            const [members, performances] = await Promise.all([
                SupabaseManager.getMembers(true),
                SupabaseManager.getPerformances()
            ]);

            // Filtrer membres actifs
            this.state.allMembers = members.filter(m => m.is_active !== false);

            // Attacher performances à chaque membre
            this.state.allMembers.forEach(member => {
                member._performances = performances.filter(p => p.member_id === member.id);
            });

            console.log(`✅ ${this.state.allMembers.length} membres chargés`);

            // Rendre la vue
            const html = `
                <div class="programming-pro-container fade-in">
                    ${this.renderHeader()}
                    <div class="programming-content">
                        ${this.state.currentMember ? this.renderStepsForm() : this.renderMemberSelector()}
                    </div>
                </div>
            `;

            const contentEl = document.getElementById('mainContent');
            if (!contentEl) {
                throw new Error('Element mainContent non trouvé');
            }

            contentEl.innerHTML = html;
            this.attachEventListeners();

            console.log('✅ Vue principale affichée');
        } catch (error) {
            console.error('❌ Erreur affichage vue principale:', error);
            this.showError('Impossible de charger les membres: ' + error.message);
        }
    },

    /**
     * Refresh la vue courante (sans recharger les données)
     */
    refreshCurrentView() {
        const html = `
            <div class="programming-pro-container fade-in">
                ${this.renderHeader()}
                <div class="programming-content">
                    ${this.state.currentMember ? this.renderStepsForm() : this.renderMemberSelector()}
                </div>
            </div>
        `;

        const contentEl = document.getElementById('mainContent');
        if (contentEl) {
            contentEl.innerHTML = html;
            this.attachEventListeners();
        }
    },

    /**
     * Rendu Header - GLASSMORPHISM
     */
    renderHeader() {
        return `
            <div class="module-header-glass">
                <div class="module-header-content">
                    <div class="header-info">
                        <h1 class="module-title-glass">
                            <i class="fas fa-dumbbell"></i>
                            Programmation Pro
                        </h1>
                        <p class="module-subtitle-glass">
                            Génération de programmes d'entraînement personnalisés
                            ${this.state.currentMember ? ` - ${this.state.currentMember.name}` : ''}
                        </p>
                    </div>
                    ${
                        this.state.currentMember
                            ? `
                        <button onclick="ProgrammingPro.backToMemberSelection()" class="btn-glass btn-glass-secondary">
                            <i class="fas fa-arrow-left"></i>
                            <span>Changer d'adhérent</span>
                        </button>
                    `
                            : ''
                    }
                </div>
            </div>
        `;
    },

    /**
     * Rendu Sélecteur de membre - VERSION MINIMALISTE
     */
    renderMemberSelector() {
        if (!this.state.allMembers || this.state.allMembers.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>Aucun adhérent trouvé</h3>
                    <p>Ajoutez des adhérents pour créer des programmes</p>
                </div>
            `;
        }

        return `
            <div class="member-selector-minimal">
                <div class="selector-hero">
                    <div class="hero-icon">
                        <i class="fas fa-dumbbell"></i>
                    </div>
                    <h2 class="hero-title">Créer un programme d'entraînement</h2>
                    <p class="hero-subtitle">Recherchez un adhérent pour commencer</p>
                </div>

                <div class="search-box-minimal">
                    <div class="search-input-wrapper">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text"
                               id="memberSearchInput"
                               class="search-input-minimal"
                               placeholder="Tapez le nom d'un adhérent..."
                               autocomplete="off"
                               oninput="ProgrammingPro.handleSearchMinimal(event)"
                               onfocus="ProgrammingPro.showDropdown()"
                               onblur="ProgrammingPro.hideDropdown()">
                        <span class="search-count">${this.state.allMembers.length} adhérents</span>
                    </div>

                    <div class="search-dropdown" id="searchDropdown" style="display: none;">
                        <div class="dropdown-results" id="dropdownResults">
                            <!-- Résultats dynamiques -->
                        </div>
                    </div>
                </div>

                <div class="quick-stats">
                    <div class="stat-pill">
                        <i class="fas fa-users"></i>
                        <span>${this.state.allMembers.length} adhérents actifs</span>
                    </div>
                    <div class="stat-pill">
                        <i class="fas fa-magic"></i>
                        <span>IA Claude 3.5</span>
                    </div>
                    <div class="stat-pill">
                        <i class="fas fa-calendar-alt"></i>
                        <span>4-12 semaines</span>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Rendu item résultat de recherche (dropdown)
     * @param member
     */
    renderSearchResultItem(member) {
        const hasPerf = member._performances && member._performances.length > 0;
        const perfCount = hasPerf ? member._performances.length : 0;

        return `
            <div class="search-result-item"
                 data-member-id="${member.id}"
                 onmousedown="ProgrammingPro.selectMember('${member.id}')">
                <div class="result-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="result-info">
                    <div class="result-name">${member.name || 'Sans nom'}</div>
                    <div class="result-meta">
                        ${member.email ? `<span class="meta-email">${member.email}</span>` : ''}
                        ${perfCount > 0 ? `<span class="meta-perf">${perfCount} performance${perfCount > 1 ? 's' : ''}</span>` : ''}
                    </div>
                </div>
                <i class="fas fa-chevron-right result-arrow"></i>
            </div>
        `;
    },

    /**
     * Sélectionner un membre
     * @param memberId
     */
    async selectMember(memberId) {
        const member = this.state.allMembers.find(m => m.id === memberId);
        if (!member) {
            return;
        }

        this.state.currentMember = member;
        this.state.currentStep = 1;
        this.state.formData = {};

        console.log('✅ Membre sélectionné:', member.name);
        await this.showMainView();
    },

    /**
     * Retour à la sélection
     */
    async backToMemberSelection() {
        this.state.currentMember = null;
        this.state.currentStep = 1;
        this.state.formData = {};
        await this.showMainView();
    },

    /**
     * Rendu Formulaire par étapes
     */
    renderStepsForm() {
        return `
            <div class="steps-form">
                ${this.renderProgressBar()}
                <div class="step-content">
                    ${this.renderCurrentStep()}
                </div>
            </div>
        `;
    },

    /**
     * Rendu Barre de progression
     */
    renderProgressBar() {
        return `
            <div class="progress-bar-container">
                <div class="progress-steps">
                    ${Array.from({ length: this.state.totalSteps }, (_, i) => {
                        const step = i + 1;
                        const isActive = step === this.state.currentStep;
                        const isCompleted = step < this.state.currentStep;

                        return `
                            <div class="progress-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}">
                                <div class="step-circle">
                                    ${isCompleted ? '<i class="fas fa-check"></i>' : step}
                                </div>
                                <span class="step-label">${this.getStepLabel(step)}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="progress-line">
                    <div class="progress-line-fill" style="width: ${((this.state.currentStep - 1) / (this.state.totalSteps - 1)) * 100}%"></div>
                </div>
            </div>
        `;
    },

    /**
     * Label d'étape
     * @param step
     */
    getStepLabel(step) {
        const labels = {
            1: 'Sport & Infos',
            2: 'Objectifs',
            3: 'Niveau & Priorités',
            4: 'Données & PR',
            5: 'Analyse',
            6: 'Génération'
        };
        return labels[step] || `Étape ${step}`;
    },

    /**
     * Rendu étape courante
     */
    renderCurrentStep() {
        switch (this.state.currentStep) {
            case 1:
                return this.renderStep1GeneralInfo();
            case 2:
                return this.renderStep2Availability();
            case 3:
                return this.renderStep3LevelExperience();
            case 4:
                return this.renderStep4Structure();
            case 5:
                return this.renderStep5Exercises();
            case 6:
                return this.renderStep6Summary();
            default:
                return '';
        }
    },

    /**
     * ÉTAPE 1: Sélection du sport principal
     */
    renderStep1GeneralInfo() {
        const sports = window.SportsMatrix ? window.SportsMatrix.getSportsList() : [];
        const selectedSport = this.state.formData.sport || null;

        return `
            <div class="step-container">
                <h2 class="step-title">🎯 Quel est votre sport principal ?</h2>
                <p class="step-description">Sélectionnez votre sport pour adapter le programme</p>

                <form class="form-grid" id="step1Form">
                    <!-- Sélection du sport -->
                    <div class="form-group full-width">
                        <label class="form-label required">
                            <i class="fas fa-trophy"></i>
                            Sport principal
                        </label>
                        <div class="sport-grid">
                            ${sports.map(sport => this.renderSportCard(sport)).join('')}
                        </div>
                    </div>

                    ${
                        selectedSport
                            ? `
                        <!-- Titre du programme -->
                        <div class="form-group full-width">
                            <label class="form-label">
                                <i class="fas fa-file-alt"></i>
                                Titre du programme
                            </label>
                            <input type="text"
                                   name="program_title"
                                   class="form-input"
                                   placeholder="Ex: Programme ${sports.find(s => s.id === selectedSport)?.name}"
                                   value="${this.state.formData.program_title || ''}">
                            <small class="form-help">Laissez vide pour génération automatique</small>
                        </div>

                        <!-- Durée du programme -->
                        <div class="form-group">
                            <label class="form-label required">
                                <i class="fas fa-calendar-alt"></i>
                                Durée
                            </label>
                            <select name="duration_weeks" class="form-select" required>
                                <option value="">Sélectionner...</option>
                                <option value="4" ${this.state.formData.duration_weeks == 4 ? 'selected' : ''}>4 semaines</option>
                                <option value="8" ${this.state.formData.duration_weeks == 8 ? 'selected' : ''}>8 semaines</option>
                                <option value="12" ${this.state.formData.duration_weeks == 12 ? 'selected' : ''}>12 semaines (Recommandé)</option>
                            </select>
                        </div>

                        <!-- Date de début -->
                        <div class="form-group">
                            <label class="form-label required">
                                <i class="fas fa-play-circle"></i>
                                Date de début
                            </label>
                            <input type="date"
                                   name="start_date"
                                   class="form-input"
                                   value="${this.state.formData.start_date || this.getDefaultStartDate()}"
                                   required>
                        </div>

                        <!-- Date de compétition (optionnel) -->
                        <div class="form-group full-width">
                            <label class="form-label">
                                <i class="fas fa-trophy"></i>
                                Date de compétition (optionnel)
                            </label>
                            <input type="date"
                                   name="competition_date"
                                   class="form-input"
                                   value="${this.state.formData.competition_date || ''}">
                            <small class="form-help">Active le calcul automatique du peaking</small>
                        </div>
                    `
                            : ''
                    }
                </form>

                ${this.renderStepButtons()}
            </div>
        `;
    },

    /**
     * Rendu carte de sport
     * @param sport
     */
    renderSportCard(sport) {
        const selected = this.state.formData.sport === sport.id;
        return `
            <div class="sport-card ${selected ? 'selected' : ''}"
                 onclick="ProgrammingPro.selectSport('${sport.id}')">
                <div class="sport-icon">${sport.icon}</div>
                <div class="sport-name">${sport.name}</div>
                <div class="sport-description">${sport.description}</div>
            </div>
        `;
    },

    /**
     * Sélectionner un sport
     * @param sportId
     */
    selectSport(sportId) {
        this.state.formData.sport = sportId;
        this.state.formData.objective_primary = null; // Reset objectifs
        this.refreshCurrentView();
    },

    /**
     * Rendu option objectif
     * @param value
     * @param label
     * @param icon
     * @param description
     */
    renderObjectiveOption(value, label, icon, description) {
        const isSelected = this.state.formData.objective_primary === value;
        return `
            <label class="objective-card ${isSelected ? 'selected' : ''}">
                <input type="radio"
                       name="objective_primary"
                       value="${value}"
                       ${isSelected ? 'checked' : ''}
                       required>
                <div class="objective-content">
                    <span class="objective-icon">${icon}</span>
                    <strong class="objective-label">${label}</strong>
                    <span class="objective-description">${description}</span>
                </div>
            </label>
        `;
    },

    /**
     * ÉTAPE 2: Objectifs d'entraînement
     */
    renderStep2Availability() {
        const selectedSport = this.state.formData.sport;
        if (!selectedSport) {
            this.state.currentStep = 1;
            this.refreshCurrentView();
            return;
        }

        const objectives = window.SportsMatrix
            ? window.SportsMatrix.getObjectivesForSport(selectedSport)
            : [];
        const sportData = window.SportsMatrix ? window.SportsMatrix.sports[selectedSport] : null;

        return `
            <div class="step-container">
                <h2 class="step-title">🎯 Objectifs d'entraînement</h2>
                <p class="step-description">Qualités physiques à développer pour ${sportData ? sportData.name : 'votre sport'}</p>

                <form class="form-grid" id="step2Form">
                    <!-- Objectif principal -->
                    <div class="form-group full-width">
                        <label class="form-label required">
                            <i class="fas fa-bullseye"></i>
                            Objectif principal
                        </label>
                        <div class="objective-grid">
                            ${objectives.map(obj => this.renderDynamicObjective(obj)).join('')}
                        </div>
                    </div>

                    <!-- Fréquence -->
                    <div class="form-group">
                        <label class="form-label required">
                            <i class="fas fa-calendar-week"></i>
                            Séances par semaine
                        </label>
                        <select name="frequency" class="form-select" required>
                            <option value="">Sélectionner...</option>
                            <option value="2" ${this.state.formData.frequency == 2 ? 'selected' : ''}>2 séances</option>
                            <option value="3" ${this.state.formData.frequency == 3 ? 'selected' : ''}>3 séances</option>
                            <option value="4" ${this.state.formData.frequency == 4 ? 'selected' : ''}>4 séances (Recommandé)</option>
                            <option value="5" ${this.state.formData.frequency == 5 ? 'selected' : ''}>5 séances</option>
                            <option value="6" ${this.state.formData.frequency == 6 ? 'selected' : ''}>6 séances</option>
                        </select>
                    </div>

                    <!-- Durée des séances -->
                    <div class="form-group">
                        <label class="form-label required">
                            <i class="fas fa-clock"></i>
                            Durée des séances
                        </label>
                        <select name="session_duration" class="form-select" required>
                            <option value="">Sélectionner...</option>
                            <option value="45" ${this.state.formData.session_duration == 45 ? 'selected' : ''}>45 minutes</option>
                            <option value="60" ${this.state.formData.session_duration == 60 ? 'selected' : ''}>60 minutes (Recommandé)</option>
                            <option value="75" ${this.state.formData.session_duration == 75 ? 'selected' : ''}>75 minutes</option>
                            <option value="90" ${this.state.formData.session_duration == 90 ? 'selected' : ''}>90 minutes</option>
                        </select>
                    </div>
                </form>

                ${this.renderStepButtons()}
            </div>
        `;
    },

    /**
     * Rendu objectif dynamique selon sport
     * @param objective
     */
    renderDynamicObjective(objective) {
        const selected = this.state.formData.objective_primary === objective.id;
        return `
            <div class="objective-card ${selected ? 'selected' : ''}"
                 onclick="ProgrammingPro.selectObjective('${objective.id}')">
                <div class="objective-content">
                    <div class="objective-name">${objective.name}</div>
                    <div class="objective-desc">${objective.description}</div>
                </div>
            </div>
        `;
    },

    /**
     * Sélectionner un objectif
     * @param objectiveId
     */
    selectObjective(objectiveId) {
        this.state.formData.objective_primary = objectiveId;
        this.refreshCurrentView();
    },

    /**
     * Rendu checkbox muscle
     * @param value
     * @param label
     */
    renderMuscleCheckbox(value, label) {
        const weakMuscles = this.state.formData.weak_muscles || [];
        const isChecked = weakMuscles.includes(value);

        return `
            <label class="checkbox-label">
                <input type="checkbox"
                       name="weak_muscles"
                       value="${value}"
                       ${isChecked ? 'checked' : ''}>
                <span>${label}</span>
            </label>
        `;
    },

    /**
     * ÉTAPE 3: Niveau, Groupes musculaires & Contraintes
     */
    renderStep3LevelExperience() {
        const member = this.state.currentMember;
        const selectedSport = this.state.formData.sport;
        const sportData =
            window.SportsMatrix && selectedSport ? window.SportsMatrix.sports[selectedSport] : null;

        // Auto-remplir les groupes musculaires selon le sport (si pas déjà fait)
        if (
            sportData &&
            (!this.state.formData.weak_muscles || this.state.formData.weak_muscles.length === 0)
        ) {
            this.state.formData.weak_muscles = sportData.muscleGroups || [];
        }

        return `
            <div class="step-container">
                <h2 class="step-title">💪 Niveau & Priorités</h2>
                <p class="step-description">Définissez votre niveau et les zones à travailler</p>

                <form class="form-grid" id="step3Form">
                    <!-- Niveau -->
                    <div class="form-group full-width">
                        <label class="form-label required">
                            <i class="fas fa-chart-line"></i>
                            Niveau d'expérience
                        </label>
                        <div class="level-grid">
                            ${this.renderLevelOption('beginner', '🟢 Débutant', '< 1 an')}
                            ${this.renderLevelOption('intermediate', '🟡 Intermédiaire', '1-3 ans')}
                            ${this.renderLevelOption('advanced', '🔴 Avancé', '> 3 ans')}
                        </div>
                    </div>

                    <!-- Groupes musculaires prioritaires -->
                    <div class="form-group full-width">
                        <label class="form-label">
                            <i class="fas fa-star"></i>
                            Groupes musculaires prioritaires
                            ${sportData ? '<span class="badge-auto-fill">Auto-rempli selon ' + sportData.name + '</span>' : ''}
                        </label>
                        <div class="checkbox-grid">
                            ${this.renderMuscleCheckbox('pecs', 'Pectoraux')}
                            ${this.renderMuscleCheckbox('back', 'Dos')}
                            ${this.renderMuscleCheckbox('shoulders', 'Épaules')}
                            ${this.renderMuscleCheckbox('arms', 'Bras')}
                            ${this.renderMuscleCheckbox('legs', 'Jambes')}
                            ${this.renderMuscleCheckbox('glutes', 'Fessiers')}
                            ${this.renderMuscleCheckbox('calves', 'Mollets')}
                            ${this.renderMuscleCheckbox('abs', 'Abdos')}
                            ${this.renderMuscleCheckbox('core', 'Core/Gainage')}
                            ${this.renderMuscleCheckbox('full-body', 'Corps entier')}
                        </div>
                    </div>

                    <!-- Exercices à éviter -->
                    <div class="form-group full-width">
                        <label class="form-label">
                            <i class="fas fa-ban"></i>
                            Exercices à éviter (optionnel)
                        </label>
                        <textarea name="avoid_exercises"
                                  class="form-textarea"
                                  rows="3"
                                  placeholder="Ex: Leg Extension (genou fragile), Overhead Press (épaule)">${this.state.formData.avoid_exercises || ''}</textarea>
                        <small class="form-help">Un exercice par ligne</small>
                    </div>

                    <!-- Limitations -->
                    <div class="form-group full-width">
                        <label class="form-label">
                            <i class="fas fa-exclamation-triangle"></i>
                            Blessures / Limitations (optionnel)
                        </label>
                        <textarea name="limitations"
                                  class="form-textarea"
                                  rows="3"
                                  placeholder="Ex: Entorse genou gauche (2022), éviter rotations excessives">${this.state.formData.limitations || ''}</textarea>
                    </div>

                    <!-- Capacité de récupération -->
                    <div class="form-group full-width">
                        <label class="form-label required">
                            <i class="fas fa-bed"></i>
                            Capacité de récupération
                        </label>
                        <select name="recovery_capacity" class="form-select" required>
                            <option value="">Sélectionner...</option>
                            <option value="slow" ${this.state.formData.recovery_capacity === 'slow' ? 'selected' : ''}>Lente (fatigue persistante)</option>
                            <option value="normal" ${this.state.formData.recovery_capacity === 'normal' ? 'selected' : ''}>Normale (standard)</option>
                            <option value="fast" ${this.state.formData.recovery_capacity === 'fast' ? 'selected' : ''}>Rapide (excellente)</option>
                        </select>
                    </div>
                </form>

                ${this.renderStepButtons()}
            </div>
        `;
    },

    /**
     * Rendu option niveau
     * @param value
     * @param label
     * @param experience
     */
    renderLevelOption(value, label, experience) {
        const isSelected = this.state.formData.level === value;
        return `
            <label class="level-card ${isSelected ? 'selected' : ''}">
                <input type="radio"
                       name="level"
                       value="${value}"
                       ${isSelected ? 'checked' : ''}
                       required>
                <div class="level-content">
                    <strong>${label}</strong>
                    <span>${experience}</span>
                </div>
            </label>
        `;
    },

    /**
     * ÉTAPE 4: Données personnelles & PR
     */
    renderStep4Structure() {
        const member = this.state.currentMember;
        const latestPerf = member._performances?.[member._performances.length - 1];
        const selectedSport = this.state.formData.sport;
        const sportData =
            window.SportsMatrix && selectedSport ? window.SportsMatrix.sports[selectedSport] : null;

        // Filtrer les PR selon le sport
        const relevantPRs = this.getRelevantPRs(selectedSport);

        return `
            <div class="step-container">
                <h2 class="step-title">📊 Données Personnelles & Performances</h2>
                <p class="step-description">Informations essentielles pour personnaliser le programme</p>

                <!-- Données personnelles -->
                <div class="pr-section">
                    <h3 class="subsection-title">
                        <i class="fas fa-user"></i>
                        Données Personnelles
                    </h3>

                    <div class="form-grid" style="grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                        <div class="form-group">
                            <label class="form-label required">
                                <i class="fas fa-weight"></i>
                                Poids (kg)
                            </label>
                            <input type="number"
                                   name="weight"
                                   class="form-input"
                                   value="${member.weight || this.state.formData.weight || ''}"
                                   placeholder="Ex: 75"
                                   required>
                        </div>

                        <div class="form-group">
                            <label class="form-label required">
                                <i class="fas fa-ruler-vertical"></i>
                                Taille (cm)
                            </label>
                            <input type="number"
                                   name="height"
                                   class="form-input"
                                   value="${member.height || this.state.formData.height || ''}"
                                   placeholder="Ex: 178"
                                   required>
                        </div>

                        <div class="form-group">
                            <label class="form-label required">
                                <i class="fas fa-birthday-cake"></i>
                                Âge (ans)
                            </label>
                            <input type="number"
                                   name="age"
                                   class="form-input"
                                   value="${member.age || this.state.formData.age || this.calculateAge(member.birth_date) || ''}"
                                   placeholder="Ex: 30"
                                   required>
                        </div>
                    </div>
                </div>

                ${
                    relevantPRs.length > 0
                        ? `
                <!-- Tableau PR filtré selon sport -->
                <div class="pr-section">
                    <h3 class="subsection-title">
                        <i class="fas fa-trophy"></i>
                        Performances (${sportData ? sportData.name : 'votre sport'})
                        ${latestPerf ? '<span class="badge-success">Données disponibles</span>' : '<span class="badge-warning">À saisir</span>'}
                    </h3>

                    <div class="pr-table-container">
                        <table class="pr-table">
                            <thead>
                                <tr>
                                    <th>Indicateur</th>
                                    <th>Valeur</th>
                                    <th>Référence</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${relevantPRs.map(pr => this.renderPRRow(pr, latestPerf)).join('')}
                            </tbody>
                        </table>
                    </div>
                    <p class="form-help">
                        <i class="fas fa-info-circle"></i>
                        Données spécifiques à ${sportData ? sportData.name : 'votre sport'} pour optimiser le programme
                    </p>
                </div>
                `
                        : ''
                }

                ${this.renderStepButtons()}
            </div>
        `;
    },

    /**
     * Calcule l'âge depuis la date de naissance
     * @param birthDate
     */
    calculateAge(birthDate) {
        if (!birthDate) {
            return null;
        }
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    },

    /**
     * Retourne les PR pertinents selon le sport
     * @param sportId
     */
    getRelevantPRs(sportId) {
        const prsBySport = {
            crossfit: [
                { id: 'squat_1rm', name: '🏋️ Squat', unit: 'kg', reference: 'PDC x 1.5-2.0' },
                {
                    id: 'bench_1rm',
                    name: '💪 Bench Press',
                    unit: 'kg',
                    reference: 'PDC x 1.0-1.25'
                },
                { id: 'deadlift_1rm', name: '🦾 Deadlift', unit: 'kg', reference: 'PDC x 2.0-2.5' },
                {
                    id: 'ohp_1rm',
                    name: '🎯 Overhead Press',
                    unit: 'kg',
                    reference: 'PDC x 0.6-0.8'
                },
                { id: 'clean_1rm', name: '🔥 Clean', unit: 'kg', reference: 'PDC x 1.0-1.3' }
            ],
            hyrox: [
                { id: '5km_time', name: '🏃 5km Run', unit: 'min', reference: '< 25 min' },
                { id: 'vo2max', name: '💨 VO2max', unit: 'ml/kg/min', reference: '> 50' },
                { id: 'squat_1rm', name: '🏋️ Squat', unit: 'kg', reference: 'PDC x 1.2-1.5' },
                { id: 'rowing_500m', name: '🚣 Rowing 500m', unit: 'sec', reference: '< 100 sec' }
            ],
            trail: [
                { id: '10km_time', name: '🏃 10km', unit: 'min', reference: '< 50 min' },
                { id: 'vo2max', name: '💨 VO2max', unit: 'ml/kg/min', reference: '> 55' },
                { id: 'vma', name: '⚡ VMA', unit: 'km/h', reference: '> 16 km/h' },
                { id: 'd_plus', name: '⛰️ D+ toléré/h', unit: 'm', reference: '> 500m' }
            ],
            ultratrail: [
                { id: 'marathon_time', name: '🏃 Marathon', unit: 'min', reference: '< 240 min' },
                { id: 'vo2max', name: '💨 VO2max', unit: 'ml/kg/min', reference: '> 50' },
                { id: 'vma', name: '⚡ VMA', unit: 'km/h', reference: '> 15 km/h' },
                { id: 'd_plus', name: '⛰️ D+ toléré/h', unit: 'm', reference: '> 400m' }
            ],
            musculation: [
                { id: 'squat_1rm', name: '🏋️ Squat', unit: 'kg', reference: 'PDC x 1.5-2.0' },
                {
                    id: 'bench_1rm',
                    name: '💪 Bench Press',
                    unit: 'kg',
                    reference: 'PDC x 1.0-1.25'
                },
                { id: 'deadlift_1rm', name: '🦾 Deadlift', unit: 'kg', reference: 'PDC x 2.0-2.5' },
                { id: 'ohp_1rm', name: '🎯 Overhead Press', unit: 'kg', reference: 'PDC x 0.6-0.8' }
            ],
            cyclisme: [
                { id: 'ftp', name: '⚡ FTP', unit: 'watts', reference: '> 250W' },
                { id: 'ftp_pdc', name: '📊 FTP/kg', unit: 'W/kg', reference: '> 3.5' },
                { id: '20km_time', name: '🚴 20km CLM', unit: 'min', reference: '< 30 min' },
                { id: 'vo2max', name: '💨 VO2max', unit: 'ml/kg/min', reference: '> 55' }
            ],
            triathlon: [
                { id: '1500m_swim', name: '🏊 1500m nage', unit: 'min', reference: '< 25 min' },
                { id: '40km_bike', name: '🚴 40km vélo', unit: 'min', reference: '< 70 min' },
                { id: '10km_run', name: '🏃 10km course', unit: 'min', reference: '< 45 min' },
                { id: 'vo2max', name: '💨 VO2max', unit: 'ml/kg/min', reference: '> 55' }
            ],
            football: [
                { id: 'sprint_30m', name: '⚡ Sprint 30m', unit: 'sec', reference: '< 4.2 sec' },
                { id: 'squat_1rm', name: '🏋️ Squat', unit: 'kg', reference: 'PDC x 1.5' },
                {
                    id: 'vertical_jump',
                    name: '🦘 Détente verticale',
                    unit: 'cm',
                    reference: '> 50 cm'
                },
                { id: 'yo_yo_test', name: '🔄 Yo-Yo Test', unit: 'niveau', reference: '> 18' }
            ],
            rugby: [
                { id: 'sprint_40m', name: '⚡ Sprint 40m', unit: 'sec', reference: '< 5.0 sec' },
                { id: 'squat_1rm', name: '🏋️ Squat', unit: 'kg', reference: 'PDC x 1.8-2.2' },
                { id: 'bench_1rm', name: '💪 Bench Press', unit: 'kg', reference: 'PDC x 1.2-1.5' },
                { id: 'deadlift_1rm', name: '🦾 Deadlift', unit: 'kg', reference: 'PDC x 2.0-2.5' }
            ],
            basketball: [
                { id: 'sprint_20m', name: '⚡ Sprint 20m', unit: 'sec', reference: '< 3.0 sec' },
                {
                    id: 'vertical_jump',
                    name: '🦘 Détente verticale',
                    unit: 'cm',
                    reference: '> 60 cm'
                },
                { id: 'squat_1rm', name: '🏋️ Squat', unit: 'kg', reference: 'PDC x 1.5' },
                { id: 'yo_yo_test', name: '🔄 Yo-Yo Test', unit: 'niveau', reference: '> 17' }
            ],
            boxe: [
                {
                    id: 'punch_power',
                    name: '👊 Puissance frappe',
                    unit: 'kg',
                    reference: '> 300 kg'
                },
                { id: 'sprint_20m', name: '⚡ Sprint 20m', unit: 'sec', reference: '< 3.2 sec' },
                { id: 'squat_1rm', name: '🏋️ Squat', unit: 'kg', reference: 'PDC x 1.3-1.6' },
                { id: 'vo2max', name: '💨 VO2max', unit: 'ml/kg/min', reference: '> 50' }
            ],
            autre: [
                { id: 'squat_1rm', name: '🏋️ Squat', unit: 'kg', reference: 'PDC x 1.5' },
                { id: 'vo2max', name: '💨 VO2max', unit: 'ml/kg/min', reference: '> 45' }
            ]
        };

        return prsBySport[sportId] || prsBySport['autre'];
    },

    /**
     * Rendu ligne PR
     * @param pr
     * @param latestPerf
     */
    renderPRRow(pr, latestPerf) {
        const value = latestPerf?.[pr.id] || this.state.formData[pr.id] || '';
        return `
            <tr>
                <td><strong>${pr.name}</strong></td>
                <td>
                    <input type="number"
                           name="${pr.id}"
                           class="pr-input"
                           value="${value}"
                           placeholder="${pr.unit}"
                           step="0.1">
                </td>
                <td class="pr-note">${pr.reference}</td>
            </tr>
        `;
    },

    /**
     * ÉTAPE 5: Analyse & Périodisation
     */
    renderStep5Exercises() {
        const member = this.state.currentMember;
        const analysis = this.analyzeProgram();

        return `
            <div class="step-container">
                <h2 class="step-title">🧠 Analyse & Périodisation Intelligente</h2>
                <p class="step-description">Analyse complète avant génération du programme</p>

                <!-- Analyse temporelle -->
                ${analysis.temporalAnalysis}

                <!-- Périodisation intelligente -->
                ${analysis.periodization}

                <!-- Indicateurs clés -->
                ${analysis.keyIndicators}

                ${this.renderStepButtons()}
            </div>
        `;
    },

    /**
     * Analyse le programme et calcule la périodisation intelligente
     */
    analyzeProgram() {
        const startDate = new Date(this.state.formData.start_date);
        const competitionDate = this.state.formData.competition_date
            ? new Date(this.state.formData.competition_date)
            : null;
        const duration = this.state.formData.duration_weeks || 12;

        let temporalAnalysis = '';
        let periodization = '';
        let weeksUntilCompetition = null;

        // Analyse temporelle si date de compétition
        if (competitionDate) {
            const diffTime = competitionDate - startDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            weeksUntilCompetition = Math.floor(diffDays / 7);

            const isUrgent = weeksUntilCompetition < 4;
            const isIdeal = weeksUntilCompetition >= 8 && weeksUntilCompetition <= 16;

            temporalAnalysis = `
                <div class="analysis-section ${isUrgent ? 'urgent' : isIdeal ? 'optimal' : ''}">
                    <h3 class="subsection-title">
                        <i class="fas fa-calendar-check"></i>
                        Analyse Temporelle
                    </h3>
                    <div class="temporal-grid">
                        <div class="temporal-card">
                            <span class="temporal-label">Date de début</span>
                            <strong>${startDate.toLocaleDateString('fr-FR')}</strong>
                        </div>
                        <div class="temporal-card">
                            <span class="temporal-label">Date de compétition</span>
                            <strong>${competitionDate.toLocaleDateString('fr-FR')}</strong>
                        </div>
                        <div class="temporal-card ${isUrgent ? 'urgent-card' : 'success-card'}">
                            <span class="temporal-label">Temps disponible</span>
                            <strong>${weeksUntilCompetition} semaines (${diffDays} jours)</strong>
                        </div>
                    </div>

                    ${
                        isUrgent
                            ? `
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle"></i>
                            <strong>Attention!</strong> Vous avez seulement ${weeksUntilCompetition} semaines avant la compétition.
                            Il est recommandé d'avoir au moins 8 semaines pour une préparation optimale.
                            Le programme sera adapté en mode "Peaking intensif" (PPS uniquement).
                        </div>
                    `
                            : isIdeal
                              ? `
                        <div class="alert alert-success">
                            <i class="fas fa-check-circle"></i>
                            <strong>Parfait!</strong> ${weeksUntilCompetition} semaines est un délai idéal pour une préparation complète PPG → PPO → PPS.
                        </div>
                    `
                              : `
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle"></i>
                            Le programme sera adapté sur ${weeksUntilCompetition} semaines avec une périodisation intelligente.
                        </div>
                    `
                    }
                </div>
            `;

            // Calcul de périodisation intelligente selon le temps
            periodization = this.calculateSmartPeriodization(weeksUntilCompetition);
        } else {
            // Pas de compétition = périodisation standard
            temporalAnalysis = `
                <div class="analysis-section">
                    <h3 class="subsection-title">
                        <i class="fas fa-calendar"></i>
                        Programme Standard
                    </h3>
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle"></i>
                        Aucune date de compétition spécifiée. Le programme suivra une périodisation standard sur ${duration} semaines.
                    </div>
                </div>
            `;
            periodization = this.generateStructurePreview(duration);
        }

        // Indicateurs clés selon le sport
        const keyIndicators = this.generateKeyIndicators();

        return {
            temporalAnalysis,
            periodization: `
                <div class="pr-section">
                    <h3 class="subsection-title">
                        <i class="fas fa-chart-line"></i>
                        Périodisation Adaptée
                    </h3>
                    ${periodization}
                </div>
            `,
            keyIndicators
        };
    },

    /**
     * Calcule la périodisation intelligente selon le nombre de semaines
     * @param weeks
     */
    calculateSmartPeriodization(weeks) {
        let phases = [];

        if (weeks <= 3) {
            // Mode PPS uniquement (peaking urgentif)
            phases = [
                {
                    type: 'PPS',
                    weeks: [1, weeks],
                    focus: 'Peaking intensif + Taper',
                    color: '#f472b6'
                }
            ];
        } else if (weeks === 4) {
            // PPO + PPS
            phases = [
                { type: 'PPO', weeks: [1, 3], focus: 'Force intensive', color: '#60a5fa' },
                { type: 'PPS', weeks: [4, 4], focus: 'Taper', color: '#f472b6' }
            ];
        } else if (weeks <= 6) {
            // PPG court + PPO + PPS
            phases = [
                { type: 'PPG', weeks: [1, 2], focus: 'Base rapide', color: '#4ade80' },
                { type: 'PPO', weeks: [3, 5], focus: 'Force + Puissance', color: '#60a5fa' },
                { type: 'PPS', weeks: [6, 6], focus: 'Peaking', color: '#f472b6' }
            ];
        } else if (weeks <= 9) {
            // 8 semaines standard
            const ppsStart = weeks - 1;
            phases = [
                { type: 'PPG', weeks: [1, 3], focus: 'Base hypertrophique', color: '#4ade80' },
                { type: 'PPO', weeks: [4, weeks - 2], focus: 'Force', color: '#60a5fa' },
                { type: 'PPS', weeks: [ppsStart, weeks], focus: 'Peaking', color: '#f472b6' }
            ];
        } else {
            // 12+ semaines optimal
            const ppoStart = Math.floor(weeks * 0.33) + 1;
            const ppsStart = Math.floor(weeks * 0.75) + 1;
            phases = [
                {
                    type: 'PPG',
                    weeks: [1, ppoStart - 1],
                    focus: 'Base hypertrophique + Volume',
                    color: '#4ade80'
                },
                {
                    type: 'PPO',
                    weeks: [ppoStart, ppsStart - 1],
                    focus: 'Force + Puissance',
                    color: '#60a5fa'
                },
                {
                    type: 'PPS',
                    weeks: [ppsStart, weeks],
                    focus: 'Pic de performance',
                    color: '#f472b6'
                }
            ];
        }

        return `
            <div class="phases-timeline">
                ${phases
                    .map(
                        phase => `
                    <div class="phase-block" style="border-left: 4px solid ${phase.color}">
                        <h3 class="phase-title">
                            <span class="phase-badge" style="background: ${phase.color}">${phase.type}</span>
                            Semaines ${phase.weeks[0]}-${phase.weeks[1]}
                        </h3>
                        <p class="phase-description">${phase.focus}</p>
                    </div>
                `
                    )
                    .join('')}
            </div>
        `;
    },

    /**
     * Génère aperçu structure (fallback)
     * @param duration
     */
    generateStructurePreview(duration) {
        const phases = {
            12: [
                {
                    type: 'PPG',
                    weeks: [1, 4],
                    focus: 'Base hypertrophique + Volume',
                    color: '#4ade80'
                },
                { type: 'PPO', weeks: [5, 9], focus: 'Force + Puissance', color: '#60a5fa' },
                { type: 'PPS', weeks: [10, 12], focus: 'Pic de performance', color: '#f472b6' }
            ],
            8: [
                { type: 'PPG', weeks: [1, 3], focus: 'Base hypertrophique', color: '#4ade80' },
                { type: 'PPO', weeks: [4, 6], focus: 'Force', color: '#60a5fa' },
                { type: 'PPS', weeks: [7, 8], focus: 'Peaking', color: '#f472b6' }
            ],
            4: [
                { type: 'PPO', weeks: [1, 3], focus: 'Force intensive', color: '#60a5fa' },
                { type: 'PPS', weeks: [4, 4], focus: 'Deload', color: '#f472b6' }
            ]
        };

        const structure = phases[duration] || phases[12];

        return `
            <div class="phases-timeline">
                ${structure
                    .map(
                        phase => `
                    <div class="phase-block" style="border-left: 4px solid ${phase.color}">
                        <h3 class="phase-title">
                            <span class="phase-badge" style="background: ${phase.color}">${phase.type}</span>
                            Semaines ${phase.weeks[0]}-${phase.weeks[1]}
                        </h3>
                        <p class="phase-description">${phase.focus}</p>
                    </div>
                `
                    )
                    .join('')}
            </div>
        `;
    },

    /**
     * Génère les indicateurs clés selon le sport
     */
    generateKeyIndicators() {
        const member = this.state.currentMember;
        const sport = this.state.formData.sport;
        const sportData = window.SportsMatrix && sport ? window.SportsMatrix.sports[sport] : null;
        const weight = this.state.formData.weight || member.weight;
        const age = this.state.formData.age || this.calculateAge(member.birth_date);

        if (!sportData || !weight) {
            return '';
        }

        return `
            <div class="pr-section">
                <h3 class="subsection-title">
                    <i class="fas fa-clipboard-check"></i>
                    Indicateurs Clés (${sportData.name})
                </h3>
                <div class="indicators-grid">
                    <div class="indicator-card">
                        <span class="indicator-icon">👤</span>
                        <span class="indicator-label">Profil</span>
                        <strong>${weight} kg / ${age} ans</strong>
                    </div>
                    <div class="indicator-card">
                        <span class="indicator-icon">🎯</span>
                        <span class="indicator-label">Objectif</span>
                        <strong>${this.getObjectiveLabel(this.state.formData.objective_primary)}</strong>
                    </div>
                    <div class="indicator-card">
                        <span class="indicator-icon">📅</span>
                        <span class="indicator-label">Fréquence</span>
                        <strong>${this.state.formData.frequency} x/semaine</strong>
                    </div>
                    <div class="indicator-card">
                        <span class="indicator-icon">⏱️</span>
                        <span class="indicator-label">Durée séance</span>
                        <strong>${this.state.formData.session_duration} min</strong>
                    </div>
                </div>
                <p class="form-help">
                    <i class="fas fa-lightbulb"></i>
                    Le programme sera généré en tenant compte de ces paramètres pour optimiser vos résultats.
                </p>
            </div>
        `;
    },

    /**
     * ÉTAPE 6: Récapitulatif (anciennement Étape 5)
     */
    renderStep6Summary() {
        return `
            <div class="step-container">
                <h2 class="step-title">✅ Récapitulatif & Génération</h2>
                <p class="step-description">Vérifiez les informations avant de générer le programme</p>

                <div class="summary-grid">
                    ${this.renderSummaryCard('Adhérent', this.state.currentMember.name, 'user')}
                    ${this.renderSummaryCard('Durée', `${this.state.formData.duration_weeks || 12} semaines`, 'calendar-alt')}
                    ${this.renderSummaryCard('Objectif', this.getObjectiveLabel(this.state.formData.objective_primary), 'bullseye')}
                    ${this.renderSummaryCard('Fréquence', `${this.state.formData.frequency || 4} séances/semaine`, 'sync-alt')}
                    ${this.renderSummaryCard('Niveau', this.getLevelLabel(this.state.formData.level), 'chart-line')}
                    ${this.renderSummaryCard('Récupération', this.getRecoveryLabel(this.state.formData.recovery_capacity), 'bed')}
                </div>

                <div class="generate-section">
                    <button onclick="ProgrammingPro.generateProgram()"
                            class="module-btn module-btn-primary module-btn-lg"
                            id="generateBtn">
                        <i class="fas fa-magic"></i>
                        <span>Générer le Programme</span>
                    </button>
                    <p class="generate-info">
                        <i class="fas fa-info-circle"></i>
                        La génération prend environ 10 secondes
                    </p>
                </div>

                ${this.renderStepButtons(true)}
            </div>
        `;
    },

    /**
     * Rendu carte récapitulatif
     * @param label
     * @param value
     * @param icon
     */
    renderSummaryCard(label, value, icon) {
        return `
            <div class="summary-card">
                <i class="fas fa-${icon}"></i>
                <div>
                    <span class="summary-label">${label}</span>
                    <strong class="summary-value">${value}</strong>
                </div>
            </div>
        `;
    },

    /**
     * Labels helpers
     * @param value
     */
    getObjectiveLabel(value) {
        const labels = {
            force: 'Force maximale',
            force_hypertrophy: 'Force + Hypertrophie',
            hypertrophy: 'Hypertrophie pure',
            power: 'Puissance / Explosivité',
            endurance: 'Endurance musculaire',
            athletic: 'Performance sportive'
        };
        return labels[value] || value;
    },

    getLevelLabel(value) {
        const labels = {
            beginner: '🟢 Débutant',
            intermediate: '🟡 Intermédiaire',
            advanced: '🔴 Avancé'
        };
        return labels[value] || value;
    },

    getRecoveryLabel(value) {
        const labels = {
            slow: 'Lente',
            normal: 'Normale',
            fast: 'Rapide'
        };
        return labels[value] || 'Normale';
    },

    /**
     * Rendu boutons étapes
     * @param isLastStep
     */
    renderStepButtons(isLastStep = false) {
        return `
            <div class="step-buttons">
                ${
                    this.state.currentStep > 1
                        ? `
                    <button onclick="ProgrammingPro.previousStep()"
                            class="module-btn module-btn-secondary">
                        <i class="fas fa-arrow-left"></i>
                        <span>Précédent</span>
                    </button>
                `
                        : ''
                }

                ${
                    !isLastStep
                        ? `
                    <button onclick="ProgrammingPro.nextStep()"
                            class="module-btn module-btn-primary">
                        <span>Suivant</span>
                        <i class="fas fa-arrow-right"></i>
                    </button>
                `
                        : ''
                }
            </div>
        `;
    },

    /**
     * Navigation étapes
     */
    async nextStep() {
        // Valider étape courante
        if (!this.validateCurrentStep()) {
            return;
        }

        // Sauvegarder données
        this.saveStepData();

        // Passer à l'étape suivante
        if (this.state.currentStep < this.state.totalSteps) {
            this.state.currentStep++;
            await this.showMainView();
        }
    },

    async previousStep() {
        if (this.state.currentStep > 1) {
            this.state.currentStep--;
            await this.showMainView();
        }
    },

    /**
     * Validation étape
     */
    validateCurrentStep() {
        const formId = `step${this.state.currentStep}Form`;
        const form = document.getElementById(formId);

        if (!form) {
            return true;
        }

        // Validation HTML5
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }

        return true;
    },

    /**
     * Sauvegarde données étape
     */
    saveStepData() {
        const formId = `step${this.state.currentStep}Form`;
        const form = document.getElementById(formId);

        if (!form) {
            return;
        }

        const formData = new FormData(form);

        // Traiter checkboxes
        const weakMuscles = [];
        document.querySelectorAll('input[name="weak_muscles"]:checked').forEach(cb => {
            weakMuscles.push(cb.value);
        });

        if (weakMuscles.length > 0) {
            this.state.formData.weak_muscles = weakMuscles;
        }

        // Sauvegarder autres champs
        for (let [key, value] of formData.entries()) {
            if (key !== 'weak_muscles') {
                this.state.formData[key] = value;
            }
        }

        console.log('📝 Données étape sauvegardées:', this.state.formData);
    },

    /**
     * GÉNÉRATION DU PROGRAMME
     */
    async generateProgram() {
        try {
            this.state.isGenerating = true;

            // Sauvegarder données de l'étape finale
            this.saveStepData();

            // Afficher loading
            this.showLoadingState();

            // Construire config pour le générateur
            const config = this.buildGeneratorConfig();

            console.log('🤖 Démarrage génération programme...', config);

            // Choisir générateur selon sport/objectif
            let program;
            const useSpecializedGenerator = this.shouldUseSpecializedGenerator(config);

            if (useSpecializedGenerator && typeof SessionGeneratorSpecialized !== 'undefined') {
                console.log('🎯 Utilisation du générateur spécialisé');
                program = await SessionGeneratorSpecialized.generateSessionPlan(config);
            } else if (typeof ProgramPDFGeneratorV3 !== 'undefined') {
                console.log('📝 Utilisation du générateur PDF V3');
                program = await this.generateProgramWithAI(config);
            } else {
                throw new Error(
                    'Aucun générateur de programme disponible. Vérifiez que program-pdf-generator-v3.js est chargé.'
                );
            }

            // Sauvegarder en BDD
            const savedProgram = await this.saveProgramToDatabase(program);

            // Stocker dans state
            this.state.generatedProgram = savedProgram;

            // Afficher prévisualisation
            await this.showProgramPreview(savedProgram);

            // Générer PDF
            await this.generatePDF(savedProgram);

            console.log('✅ Programme généré avec succès!');
        } catch (error) {
            console.error('❌ Erreur génération programme:', error);
            this.showError('Erreur lors de la génération: ' + error.message);
        } finally {
            this.state.isGenerating = false;
        }
    },

    /**
     * Détermine si on utilise le générateur spécialisé
     * @param config
     */
    shouldUseSpecializedGenerator(config) {
        // Utiliser générateur spécialisé pour:
        // - HYROX
        // - Sports spécifiques avec typologies définies
        const specializedSports = ['hyrox', 'crossfit', 'tactical', 'running', 'cycling'];
        const sport = config.objective_primary?.toLowerCase() || '';

        return specializedSports.some(s => sport.includes(s));
    },

    /**
     * Construction config générateur
     */
    buildGeneratorConfig() {
        const member = this.state.currentMember;
        const latestPerf = member._performances?.[member._performances.length - 1];

        return {
            // Données adhérent
            athlete: {
                id: member.id,
                name: member.name,
                age: this.calculateAge(member.date_of_birth),
                level: this.state.formData.level,
                experience_years: this.estimateExperience(this.state.formData.level),
                performances: {
                    squat_1rm:
                        parseInt(this.state.formData.squat_1rm) || latestPerf?.squat_1rm || 0,
                    bench_1rm:
                        parseInt(this.state.formData.bench_1rm) || latestPerf?.bench_1rm || 0,
                    deadlift_1rm:
                        parseInt(this.state.formData.deadlift_1rm) || latestPerf?.deadlift_1rm || 0,
                    ohp_1rm: parseInt(this.state.formData.ohp_1rm) || latestPerf?.ohp_1rm || 0
                },
                weight_kg: parseInt(this.state.formData.weight) || member.weight || 75,
                body_fat_pct: member.body_fat || 15,
                morpho_type: member.morpho_type || 'mesomorphe'
            },

            // Configuration programme
            duration_weeks: parseInt(this.state.formData.duration_weeks) || 12,
            objective_primary: this.state.formData.objective_primary,
            objective_secondary: this.state.formData.objective_secondary,
            frequency: parseInt(this.state.formData.frequency) || 4,
            session_duration: parseInt(this.state.formData.session_duration) || 60,
            start_date: this.state.formData.start_date,
            competition_date: this.state.formData.competition_date,
            recovery_capacity: this.state.formData.recovery_capacity || 'normal',

            // Contraintes
            weak_muscles: this.state.formData.weak_muscles || [],
            avoid_exercises: this.parseAvoidExercises(this.state.formData.avoid_exercises),
            limitations: this.state.formData.limitations,

            // Passer formData complet pour accès au sport
            formData: this.state.formData
        };
    },

    /**
     * Helpers
     * @param birthDate
     */
    calculateAge(birthDate) {
        if (!birthDate) {
            return 30;
        }
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    },

    estimateExperience(level) {
        const map = { beginner: 0.5, intermediate: 2, advanced: 5 };
        return map[level] || 2;
    },

    parseAvoidExercises(text) {
        if (!text) {
            return [];
        }
        return text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
    },

    getDefaultStartDate() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    },

    /**
     * Affichage état de chargement
     */
    showLoadingState() {
        const contentEl = document.getElementById('mainContent');
        contentEl.innerHTML = `
            <div class="loading-container fade-in">
                <div class="loading-spinner-large"></div>
                <h2 class="loading-title">🤖 Génération en cours...</h2>
                <p class="loading-text">Claude Haiku 3.5 analyse vos données...</p>

                <div class="loading-steps">
                    <div class="loading-step completed">
                        <i class="fas fa-check"></i>
                        <span>Analyse profil adhérent</span>
                    </div>
                    <div class="loading-step completed">
                        <i class="fas fa-check"></i>
                        <span>Sélection méthodologies</span>
                    </div>
                    <div class="loading-step active">
                        <div class="loading-dot"></div>
                        <span>Génération structure PPG/PPO/PPS</span>
                    </div>
                    <div class="loading-step">
                        <div class="loading-dot"></div>
                        <span>Calcul séances</span>
                    </div>
                    <div class="loading-step">
                        <div class="loading-dot"></div>
                        <span>Finalisation programme</span>
                    </div>
                </div>

                <p class="loading-info">
                    <i class="fas fa-clock"></i>
                    Temps estimé: 5-10 secondes
                </p>
            </div>
        `;
    },

    /**
     * Sauvegarde en BDD
     * @param program
     */
    async saveProgramToDatabase(program) {
        try {
            console.log('💾 Sauvegarde programme en base de données...');

            const programData = {
                title:
                    this.state.formData.program_title ||
                    program.program_metadata?.titre ||
                    'Programme sans titre',
                member_id: this.state.currentMember.id,
                duration_weeks: this.state.formData.duration_weeks,
                start_date: this.state.formData.start_date,
                end_date: this.calculateEndDate(
                    this.state.formData.start_date,
                    this.state.formData.duration_weeks
                ),
                competition_date: this.state.formData.competition_date || null,
                objective_primary: this.state.formData.objective_primary,
                objective_secondary: this.state.formData.objective_secondary || null,
                frequency: this.state.formData.frequency,
                session_duration: this.state.formData.session_duration,
                level: this.state.formData.level,
                recovery_capacity: this.state.formData.recovery_capacity,
                weak_muscles: this.state.formData.weak_muscles || [],
                avoid_exercises: this.parseAvoidExercises(this.state.formData.avoid_exercises),
                limitations: this.state.formData.limitations || null,
                program_structure: program,
                status: 'active'
            };

            const { data, error } = await SupabaseManager.supabase
                .from('training_programs')
                .insert([programData])
                .select()
                .single();

            if (error) {
                throw error;
            }

            console.log('✅ Programme sauvegardé:', data);
            return data;
        } catch (error) {
            console.error('❌ Erreur sauvegarde programme:', error);
            // Continuer même si erreur BDD
            return program;
        }
    },

    calculateEndDate(startDate, weeks) {
        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(end.getDate() + weeks * 7 - 1);
        return end.toISOString().split('T')[0];
    },

    /**
     * Prévisualisation programme
     * @param program
     */
    async showProgramPreview(program) {
        // TODO: Implémenter prévisualisation détaillée
        console.log('📊 Affichage prévisualisation programme:', program);

        const contentEl = document.getElementById('mainContent');
        contentEl.innerHTML = `
            <div class="program-preview fade-in">
                <div class="success-header">
                    <i class="fas fa-check-circle"></i>
                    <h2>Programme généré avec succès!</h2>
                </div>

                <div class="preview-actions">
                    <button onclick="ProgrammingPro.downloadPDF(${program.id})"
                            class="module-btn module-btn-primary module-btn-lg">
                        <i class="fas fa-file-pdf"></i>
                        <span>Télécharger PDF</span>
                    </button>
                    <button onclick="ProgrammingPro.backToMemberSelection()"
                            class="module-btn module-btn-secondary">
                        <i class="fas fa-users"></i>
                        <span>Retour aux adhérents</span>
                    </button>
                </div>

                <div class="preview-content">
                    <h3>Programme: ${program.title}</h3>
                    <p>Durée: ${program.duration_weeks} semaines</p>
                    <p>Objectif: ${this.getObjectiveLabel(program.objective_primary)}</p>
                    <!-- TODO: Ajouter détails semaines -->
                </div>
            </div>
        `;
    },

    /**
     * GÉNÉRATION PROGRAMME AVEC IA CLAUDE
     * Niveau préparateur physique international
     * @param config
     */
    async generateProgramWithAI(config) {
        console.log('🤖 Génération programme avec Claude API...');

        // Construire un programme structuré
        const program = {
            id: null, // Sera assigné après sauvegarde
            title: config.formData?.program_title || `Programme ${config.athlete.name}`,
            athlete_id: config.athlete.id,
            athlete_name: config.athlete.name,
            sport: config.formData?.sport || 'crossfit',
            objective: config.objective_primary,
            duration_weeks: config.duration_weeks,
            frequency: config.frequency,
            session_duration: config.session_duration,
            start_date: config.start_date,
            competition_date: config.competition_date,
            level: config.athlete.level,
            created_at: new Date().toISOString(),

            // Métadonnées
            metadata: {
                weight: config.athlete.weight_kg,
                age: config.athlete.age,
                recovery_capacity: config.recovery_capacity,
                weak_muscles: config.weak_muscles,
                limitations: config.limitations,
                avoid_exercises: config.avoid_exercises,
                performances: config.athlete.performances
            },

            // Structure sera remplie par le générateur PDF
            weeks: []
        };

        console.log('✅ Programme structuré créé:', program);
        return program;
    },

    /**
     * Génération PDF
     * @param program
     */
    async generatePDF(program) {
        try {
            console.log('📄 Génération PDF V3...');

            // Vérifier que jsPDF est chargé
            if (!window.jspdf) {
                throw new Error('jsPDF non chargé. Veuillez rafraîchir la page.');
            }

            // Générer le PDF avec V3 (Page 1: Présentation + Timeline, Pages 2+: Semaines détaillées)
            const result = await window.ProgramPDFGeneratorV3.generatePDF(
                program,
                this.state.currentMember,
                this.state.formData
            );

            console.log('✅ PDF généré V3:', result.filename);

            // Sauvegarder l'URL du PDF dans le programme
            if (program.id) {
                const { error: updateError } = await window.SupabaseManager.supabase
                    .from('training_programs')
                    .update({
                        pdf_url: result.filename,
                        pdf_generated_at: new Date().toISOString()
                    })
                    .eq('id', program.id);

                if (updateError) {
                    console.error('❌ Erreur sauvegarde PDF:', updateError);
                } else {
                    console.log('✅ PDF sauvegardé sur programme');
                }
            }

            return result;
        } catch (error) {
            console.error('Erreur génération PDF:', error);
            this.showError('Erreur lors de la génération du PDF: ' + error.message);
            return null;
        }
    },

    async downloadPDF(programId) {
        // TODO: Impl émenter téléchargement PDF
        console.log('📥 Téléchargement PDF programme:', programId);
        alert('Génération PDF en cours de développement');
    },

    /**
     * Gestion recherche minimaliste avec dropdown
     * @param event
     */
    handleSearchMinimal(event) {
        const term = event.target.value.toLowerCase().trim();
        const dropdown = document.getElementById('searchDropdown');
        const resultsContainer = document.getElementById('dropdownResults');

        if (!term) {
            // Si vide, afficher tous les adhérents
            this.showAllMembers(resultsContainer);
            return;
        }

        // Filtrer les membres
        const filtered = this.state.allMembers.filter(member => {
            const name = (member.name || '').toLowerCase();
            const email = (member.email || '').toLowerCase();
            return name.includes(term) || email.includes(term);
        });

        // Afficher résultats
        if (filtered.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>Aucun adhérent trouvé pour "${event.target.value}"</p>
                </div>
            `;
        } else {
            resultsContainer.innerHTML = filtered
                .slice(0, 8) // Limiter à 8 résultats
                .map(member => this.renderSearchResultItem(member))
                .join('');

            // Afficher le nombre de résultats si > 8
            if (filtered.length > 8) {
                resultsContainer.innerHTML += `
                    <div class="more-results">
                        <i class="fas fa-ellipsis-h"></i>
                        <span>+${filtered.length - 8} autres résultats</span>
                    </div>
                `;
            }
        }

        // S'assurer que le dropdown est visible
        dropdown.style.display = 'block';
    },

    /**
     * Afficher tous les membres dans le dropdown
     * @param resultsContainer
     */
    showAllMembers(resultsContainer) {
        if (!resultsContainer) {
            return;
        }

        const topMembers = this.state.allMembers.slice(0, 8);
        resultsContainer.innerHTML = topMembers
            .map(member => this.renderSearchResultItem(member))
            .join('');

        if (this.state.allMembers.length > 8) {
            resultsContainer.innerHTML += `
                <div class="more-results">
                    <i class="fas fa-ellipsis-h"></i>
                    <span>+${this.state.allMembers.length - 8} autres adhérents</span>
                </div>
            `;
        }
    },

    /**
     * Afficher dropdown
     */
    showDropdown() {
        const dropdown = document.getElementById('searchDropdown');
        const resultsContainer = document.getElementById('dropdownResults');

        if (dropdown && resultsContainer) {
            // Afficher les premiers membres
            this.showAllMembers(resultsContainer);
            dropdown.style.display = 'block';
        }
    },

    /**
     * Masquer dropdown (avec delay pour permettre le clic)
     */
    hideDropdown() {
        setTimeout(() => {
            const dropdown = document.getElementById('searchDropdown');
            if (dropdown) {
                dropdown.style.display = 'none';
            }
        }, 200);
    },

    /**
     * Event listeners
     */
    attachEventListeners() {
        // Événements déjà attachés via onclick dans le HTML
    },

    /**
     * Affichage erreur
     * @param message
     */
    showError(message) {
        const contentEl = document.getElementById('mainContent');
        contentEl.innerHTML = `
            <div class="error-container">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Erreur</h3>
                <p>${message}</p>
                <button onclick="ProgrammingPro.init()" class="module-btn module-btn-primary">
                    Réessayer
                </button>
            </div>
        `;
    }
};

// Export global
window.ProgrammingPro = ProgrammingPro;

// Wrapper pour lazy loading
window.ProgrammingPro_init = function () {
    ProgrammingPro.init();
};
