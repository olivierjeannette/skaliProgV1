/**
 * PROGRAMMATION PRO - VERSION MODULAIRE
 * Orchestrateur principal utilisant les modules d'étapes et générateurs
 * Architecture légère et maintenable
 */

const ProgrammingPro = {
    // Configuration
    config: {
        totalSteps: 9,
        stepModules: [
            'step1-sport-competition',
            'step2-physiological-data',
            'step3-physical-qualities',
            'step4-volume-availability',
            'step5-level-experience',
            'step6-recovery-lifestyle',
            'step7-constraints-limitations',
            'step8-periodization',
            'step9-analysis-validation'
        ]
    },

    // État
    state: {
        currentMember: null,
        currentStep: 1,
        formData: {},
        generatedProgram: null,
        isGenerating: false,
        allMembers: [],
        stepModulesLoaded: false
    },

    /**
     * Initialisation
     */
    async init() {
        console.log('🏋️ Programmation Pro Modulaire - Init');

        try {
            // Charger modules d'étapes
            await this.loadStepModules();

            // Tenter de restaurer la dernière session
            this.restoreLastSession();

            // Afficher vue principale
            await this.showMainView();
        } catch (error) {
            console.error('❌ Erreur init:', error);
            this.showError(error.message);
        }
    },

    /**
     * Chargement dynamique modules d'étapes
     */
    async loadStepModules() {
        if (this.state.stepModulesLoaded) {
            return;
        }

        console.log("📦 Chargement modules d'étapes...");

        const loadPromises = this.config.stepModules.map(moduleName => {
            return new Promise((resolve, reject) => {
                // Vérifier si déjà chargé
                const globalName = this.getStepGlobalName(moduleName);
                if (window[globalName]) {
                    console.log(`✓ ${moduleName} déjà chargé`);
                    resolve();
                    return;
                }

                // Charger script
                const script = document.createElement('script');
                script.src = `js/modules/programming/steps/${moduleName}.js`;
                script.onload = () => {
                    console.log(`✓ ${moduleName} chargé`);
                    resolve();
                };
                script.onerror = () => {
                    console.warn(`⚠️ Échec chargement ${moduleName}`);
                    reject(new Error(`Failed to load ${moduleName}`));
                };
                document.head.appendChild(script);
            });
        });

        try {
            await Promise.all(loadPromises);
            this.state.stepModulesLoaded = true;
            console.log('✅ Tous les modules chargés');
        } catch (error) {
            console.warn("⚠️ Certains modules n'ont pas pu être chargés:", error);
            // Continue quand même
            this.state.stepModulesLoaded = true;
        }
    },

    /**
     * Obtenir nom global du module
     * @param moduleName
     */
    getStepGlobalName(moduleName) {
        const num = moduleName.match(/step(\d+)/)[1];
        return `ProgrammingStep${num}`;
    },

    /**
     * Obtenir module d'étape
     * @param stepNumber
     */
    getStepModule(stepNumber) {
        const globalName = `ProgrammingStep${stepNumber}`;
        return window[globalName];
    },

    /**
     * Vue principale
     */
    async showMainView() {
        try {
            // Charger membres
            const [members, performances] = await Promise.all([
                SupabaseManager.getMembers(true),
                SupabaseManager.getPerformances()
            ]);

            this.state.allMembers = members.filter(m => m.is_active !== false);

            // Attacher performances
            this.state.allMembers.forEach(member => {
                member._performances = performances.filter(p => p.member_id === member.id);
            });

            console.log(`✅ ${this.state.allMembers.length} membres chargés`);

            // Appliquer restauration si en attente (sans re-render)
            this.applyPendingRestore(true);

            // Nettoyer les vieilles sauvegardes
            this.cleanOldSaves();

            // Render (la restauration a déjà été appliquée si nécessaire)
            this.renderView();
        } catch (error) {
            console.error('❌ Erreur showMainView:', error);
            this.showError('Impossible de charger les membres');
        }
    },

    /**
     * Rendu vue - STYLE ORIGINAL
     */
    renderView() {
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
     * AUTO-SAVE : Sauvegarder la progression
     */
    saveProgress() {
        if (!this.state.currentMember) {
            return;
        }

        const saveData = {
            memberId: this.state.currentMember.id,
            memberName: this.state.currentMember.name,
            currentStep: this.state.currentStep,
            formData: this.state.formData,
            timestamp: new Date().toISOString()
        };

        try {
            localStorage.setItem(
                `programming_progress_${this.state.currentMember.id}`,
                JSON.stringify(saveData)
            );
            console.log('💾 Progression sauvegardée automatiquement');
        } catch (error) {
            console.warn('⚠️ Impossible de sauvegarder la progression:', error);
        }
    },

    /**
     * AUTO-SAVE : Restaurer la dernière session
     */
    restoreLastSession() {
        try {
            // Chercher la dernière session sauvegardée (la plus récente)
            let latestSave = null;
            let latestTimestamp = 0;

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('programming_progress_')) {
                    const data = JSON.parse(localStorage.getItem(key));
                    const timestamp = new Date(data.timestamp).getTime();

                    if (timestamp > latestTimestamp) {
                        latestTimestamp = timestamp;
                        latestSave = data;
                    }
                }
            }

            if (latestSave) {
                // Vérifier si la sauvegarde a moins de 24h
                const hoursSinceLastSave = (Date.now() - latestTimestamp) / (1000 * 60 * 60);

                if (hoursSinceLastSave < 24) {
                    console.log(
                        '🔄 Session trouvée:',
                        latestSave.memberName,
                        '- Étape',
                        latestSave.currentStep
                    );

                    // Afficher un message de restauration
                    setTimeout(() => {
                        const restore = confirm(
                            `💾 Session en cours trouvée pour ${latestSave.memberName}\n\n` +
                                `Étape: ${latestSave.currentStep}/9\n` +
                                `Dernière modification: ${new Date(latestSave.timestamp).toLocaleString('fr-FR')}\n\n` +
                                'Voulez-vous reprendre où vous en étiez ?'
                        );

                        if (restore) {
                            // Restaurer la session (sera appliquée après le chargement des membres)
                            this.state.pendingRestore = latestSave;
                            console.log('✅ Session marquée pour restauration');

                            // Appliquer immédiatement si les membres sont déjà chargés
                            if (this.state.allMembers && this.state.allMembers.length > 0) {
                                this.applyPendingRestore();
                            }
                        } else {
                            // Supprimer la sauvegarde
                            localStorage.removeItem(`programming_progress_${latestSave.memberId}`);
                            console.log('🗑️ Session ignorée et supprimée');
                        }
                    }, 500);
                }
            }
        } catch (error) {
            console.warn('⚠️ Erreur lors de la restauration:', error);
        }
    },

    /**
     * AUTO-SAVE : Appliquer la restauration après chargement des membres
     * @param skipRender
     */
    applyPendingRestore(skipRender = false) {
        if (!this.state.pendingRestore) {
            return false;
        }

        const restore = this.state.pendingRestore;
        const member = this.state.allMembers.find(m => m.id === restore.memberId);

        if (member) {
            this.state.currentMember = member;
            this.state.currentStep = restore.currentStep;
            this.state.formData = restore.formData;
            this.state.pendingRestore = null;

            if (!skipRender) {
                this.renderView();
            }
            console.log('✅ Session restaurée avec succès');
            return true;
        } else {
            console.warn('⚠️ Membre non trouvé, impossible de restaurer');
            this.state.pendingRestore = null;
            return false;
        }
    },

    /**
     * AUTO-SAVE : Nettoyer les vieilles sauvegardes (> 7 jours)
     */
    cleanOldSaves() {
        try {
            const now = Date.now();
            const keysToRemove = [];

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('programming_progress_')) {
                    const data = JSON.parse(localStorage.getItem(key));
                    const timestamp = new Date(data.timestamp).getTime();
                    const daysSince = (now - timestamp) / (1000 * 60 * 60 * 24);

                    if (daysSince > 7) {
                        keysToRemove.push(key);
                    }
                }
            }

            keysToRemove.forEach(key => localStorage.removeItem(key));

            if (keysToRemove.length > 0) {
                console.log(`🗑️ ${keysToRemove.length} anciennes sessions nettoyées`);
            }
        } catch (error) {
            console.warn('⚠️ Erreur nettoyage:', error);
        }
    },

    /**
     * Header - STYLE ORIGINAL
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
                        <button onclick="ProgrammingPro.resetSelection()" class="btn-glass btn-glass-secondary">
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
     * Sélecteur de membre - STYLE ORIGINAL
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
                        <span>IA Claude Haiku 3.5</span>
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
     * Formulaire par étapes - STYLE ORIGINAL
     */
    renderStepsForm() {
        return `
            <div class="steps-form">
                ${this.renderProgressBar()}
                <div class="step-content">
                    ${this.renderCurrentStep()}
                    ${this.renderNavigation()}
                </div>
            </div>
        `;
    },

    /**
     * Barre de progression - STYLE ORIGINAL
     */
    renderProgressBar() {
        const stepLabels = [
            'Sport',
            'Données Physio',
            'Qualités',
            'Volume',
            'Niveau',
            'Récupération',
            'Contraintes',
            'Périodisation',
            'Validation'
        ];

        return `
            <div class="progress-bar-container">
                <div class="progress-steps">
                    ${Array.from({ length: this.config.totalSteps }, (_, i) => {
                        const step = i + 1;
                        const isActive = step === this.state.currentStep;
                        const isCompleted = step < this.state.currentStep;

                        return `
                            <div class="progress-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}">
                                <div class="step-circle">
                                    ${isCompleted ? '<i class="fas fa-check"></i>' : step}
                                </div>
                                <span class="step-label">${stepLabels[i]}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="progress-line">
                    <div class="progress-line-fill" style="width: ${((this.state.currentStep - 1) / (this.config.totalSteps - 1)) * 100}%"></div>
                </div>
            </div>
        `;
    },

    /**
     * Rendu étape actuelle
     */
    renderCurrentStep() {
        const stepModule = this.getStepModule(this.state.currentStep);

        if (!stepModule) {
            return `
                <div class="error-box-glass">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Module d'étape ${this.state.currentStep} non chargé</p>
                    <button class="btn-glass btn-primary" onclick="location.reload()">
                        <i class="fas fa-redo"></i>
                        Recharger
                    </button>
                </div>
            `;
        }

        // Préparer état pour le module
        const stepState = {
            formData: this.state.formData,
            athlete: this.state.currentMember
        };

        // Appeler render du module
        return stepModule.render(stepState);
    },

    /**
     * Navigation - STYLE ORIGINAL
     */
    renderNavigation() {
        const isFirstStep = this.state.currentStep === 1;
        const isLastStep = this.state.currentStep === this.config.totalSteps;

        return `
            <div class="step-buttons">
                ${
                    !isFirstStep
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
     * Event listeners
     */
    attachEventListeners() {
        // Form submit pour dernière étape
        const step9Form = document.getElementById('step9Form');
        if (step9Form) {
            step9Form.addEventListener('submit', e => {
                e.preventDefault();
                this.generateProgram();
            });
        }
    },

    /**
     * Actions
     * @param memberId
     */
    selectMember(memberId) {
        const member = this.state.allMembers.find(m => m.id === memberId);
        if (!member) {
            return;
        }

        this.state.currentMember = member;
        this.state.currentStep = 1;
        this.state.formData = this.prefillFromMember(member);

        this.saveProgress(); // AUTO-SAVE
        this.renderView();
    },

    resetSelection() {
        this.state.currentMember = null;
        this.state.currentStep = 1;
        this.state.formData = {};
        this.state.generatedProgram = null;

        this.renderView();
    },

    async nextStep() {
        // Collecter données du formulaire actuel
        this.collectCurrentStepData();

        // Valider
        const errors = this.validateCurrentStep();
        if (errors.length > 0) {
            this.showValidationErrors(errors);
            return;
        }

        // Passer à l'étape suivante
        if (this.state.currentStep < this.config.totalSteps) {
            this.state.currentStep++;
            this.saveProgress(); // AUTO-SAVE
            this.renderView();
        }
    },

    previousStep() {
        // Collecter données sans valider
        this.collectCurrentStepData();

        if (this.state.currentStep > 1) {
            this.state.currentStep--;
            this.saveProgress(); // AUTO-SAVE
            this.renderView();
        }
    },

    /**
     * Collecte données formulaire
     */
    collectCurrentStepData() {
        const formId = `step${this.state.currentStep}Form`;
        const form = document.getElementById(formId);

        if (!form) {
            return;
        }

        const formDataObj = new FormData(form);
        for (let [key, value] of formDataObj.entries()) {
            this.state.formData[key] = value;
        }

        // Collecter checkboxes non cochées
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => {
            this.state.formData[cb.name] = cb.checked;
        });

        console.log('📝 Données collectées étape', this.state.currentStep, this.state.formData);
    },

    /**
     * Validation étape
     */
    validateCurrentStep() {
        const stepModule = this.getStepModule(this.state.currentStep);

        if (!stepModule || !stepModule.validate) {
            return [];
        }

        return stepModule.validate(this.state.formData);
    },

    /**
     * Affichage erreurs validation
     * @param errors
     */
    showValidationErrors(errors) {
        const html = `
            <div class="validation-errors-overlay" onclick="this.remove()">
                <div class="validation-errors-box glass-card" onclick="event.stopPropagation()">
                    <div class="validation-errors-header">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Erreurs de validation</h3>
                    </div>
                    <ul class="validation-errors-list">
                        ${errors.map(error => `<li><i class="fas fa-times-circle"></i> ${error}</li>`).join('')}
                    </ul>
                    <button class="btn-glass btn-primary" onclick="this.closest('.validation-errors-overlay').remove()">
                        <i class="fas fa-check"></i>
                        Compris
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    },

    /**
     * Pré-remplissage depuis membre
     * @param member
     */
    prefillFromMember(member) {
        return {
            weight_kg: member.weight_kg,
            height_cm: member.height_cm,
            age: member.age,
            sex: member.sex
        };
    },

    /**
     * Génération programme
     */
    async generateProgram() {
        if (this.state.isGenerating) {
            return;
        }

        // Collecter données finales
        this.collectCurrentStepData();

        // Valider
        const errors = this.validateCurrentStep();
        if (errors.length > 0) {
            this.showValidationErrors(errors);
            return;
        }

        this.state.isGenerating = true;
        this.showGeneratingOverlay();

        try {
            console.log('🚀 Génération programme...');

            // Appeler générateur IA
            const program = await AIProgramGenerator.generateProgram(
                this.state.formData,
                this.state.currentMember
            );

            this.state.generatedProgram = program;
            console.log('✅ Programme généré');

            // Générer PDF
            await this.generatePDF(program);
        } catch (error) {
            console.error('❌ Erreur génération:', error);
            this.showError('Erreur lors de la génération: ' + error.message);
        } finally {
            this.state.isGenerating = false;
            this.hideGeneratingOverlay();
        }
    },

    /**
     * Affichage overlay génération
     */
    showGeneratingOverlay() {
        const html = `
            <div class="generating-overlay">
                <div class="generating-box glass-card">
                    <div class="generating-spinner">
                        <i class="fas fa-cog fa-spin"></i>
                    </div>
                    <h3>Génération en cours...</h3>
                    <p>Claude Haiku 3.5 crée votre programme personnalisé</p>
                    <div class="generating-progress">
                        <div class="generating-progress-bar"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    },

    /**
     * Masquage overlay génération
     */
    hideGeneratingOverlay() {
        const overlay = document.querySelector('.generating-overlay');
        if (overlay) {
            overlay.remove();
        }
    },

    /**
     * Génération PDF
     * @param program
     */
    async generatePDF(program) {
        try {
            console.log('📄 Génération PDF...');

            const filename = await ProgramPDFGeneratorPro.generatePDF(
                program,
                this.state.formData,
                this.state.currentMember
            );

            // Supprimer la sauvegarde (programme terminé)
            if (this.state.currentMember) {
                localStorage.removeItem(`programming_progress_${this.state.currentMember.id}`);
                console.log('💾 Sauvegarde supprimée (programme généré)');
            }

            this.showSuccess(`Programme généré avec succès !<br><br>PDF téléchargé: ${filename}`);

            // Reset pour nouvelle génération après 3 secondes
            setTimeout(() => {
                this.resetSelection();
            }, 3000);
        } catch (error) {
            console.error('❌ Erreur PDF:', error);
            throw new Error('Erreur lors de la génération du PDF: ' + error.message);
        }
    },

    /**
     * Affichage succès
     * @param message
     */
    showSuccess(message) {
        const html = `
            <div class="success-overlay" onclick="this.remove()">
                <div class="success-box glass-card" onclick="event.stopPropagation()">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3>Succès !</h3>
                    <p>${message}</p>
                    <button class="btn-glass btn-primary" onclick="this.closest('.success-overlay').remove()">
                        <i class="fas fa-check"></i>
                        Parfait
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    },

    /**
     * Helpers pour les étapes (appelés depuis les modules)
     * @param sportId
     */
    selectSport(sportId) {
        this.state.formData.sport = sportId;
        this.renderView();
    },

    toggleQuality(qualityId) {
        const current = this.state.formData.physical_qualities
            ? this.state.formData.physical_qualities.split(',').filter(q => q)
            : [];

        const index = current.indexOf(qualityId);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            if (current.length < 3) {
                current.push(qualityId);
            } else {
                this.showValidationErrors(['Maximum 3 qualités physiques']);
                return;
            }
        }

        this.state.formData.physical_qualities = current.join(',');
        this.renderView();
    },

    updateDistribution() {
        // Collecter les valeurs actuelles des sliders
        const sliders = document.querySelectorAll('.distribution-slider');
        sliders.forEach(slider => {
            this.state.formData[slider.name] = parseInt(slider.value);
        });

        // Mettre à jour l'affichage des pourcentages
        sliders.forEach(slider => {
            const percentSpan = slider.parentElement.querySelector('.percent-value');
            if (percentSpan) {
                percentSpan.textContent = slider.value + '%';
            }
        });

        // Optionnel : mettre à jour le graphique si présent
        // this.updateQualitiesChart();
    },

    toggleDay(dayId, event) {
        // Empêcher le comportement par défaut (soumission de formulaire)
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        const current = this.state.formData.available_days
            ? this.state.formData.available_days.split(',').filter(d => d)
            : [];

        const index = current.indexOf(dayId);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(dayId);
        }

        this.state.formData.available_days = current.join(',');

        // Mettre à jour seulement le bouton cliqué (pas tout re-render)
        const button = event?.target?.closest('.day-button');
        if (button) {
            button.classList.toggle('selected');
        }

        // Mettre à jour le champ hidden
        const hiddenInput = document.querySelector('input[name="available_days"]');
        if (hiddenInput) {
            hiddenInput.value = current.join(',');
        }

        // Sauvegarder sans re-render
        this.saveProgress();
    },

    toggleFlexibleSchedule(checkbox) {
        this.state.formData.flexible_schedule = checkbox.checked;
        this.renderView();
    },

    toggleTimeSlot(slotId, event) {
        // Empêcher le comportement par défaut (soumission de formulaire)
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        const key = `time_slot_${slotId}`;
        // Toggle: si undefined ou false, mettre à true, sinon mettre à false
        this.state.formData[key] = !this.state.formData[key];
        console.log(`🕒 Créneau ${slotId}:`, this.state.formData[key]);

        // Mettre à jour seulement la card cliquée (pas tout re-render)
        const card = event?.target?.closest('.time-slot-card');
        if (card) {
            card.classList.toggle('selected');
        }

        // Sauvegarder sans re-render
        this.saveProgress();
    },

    selectLevel(level) {
        this.state.formData.current_level = level;
        this.renderView();
    },

    selectPeriodization(type) {
        this.state.formData.periodization_type = type;
        this.renderView();
    },

    addAvoidExercise() {
        // Ajouter exercice à éviter
        if (!this.state.formData.avoid_exercises) {
            this.state.formData.avoid_exercises = [];
        }
        this.state.formData.avoid_exercises.push({ name: '', reason: '' });
        this.renderView();
    },

    removeAvoidExercise(index) {
        if (this.state.formData.avoid_exercises) {
            this.state.formData.avoid_exercises.splice(index, 1);
            this.renderView();
        }
    },

    /**
     * Gestion erreurs
     * @param message
     */
    showError(message) {
        const html = `
            <div class="error-overlay" onclick="this.remove()">
                <div class="error-box glass-card" onclick="event.stopPropagation()">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>Erreur</h3>
                    <p>${message}</p>
                    <button class="btn-glass btn-primary" onclick="this.closest('.error-overlay').remove()">
                        <i class="fas fa-times"></i>
                        Fermer
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    }
};

// Auto-init si pas déjà fait
if (typeof window !== 'undefined') {
    window.ProgrammingPro = ProgrammingPro;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgrammingPro;
}
