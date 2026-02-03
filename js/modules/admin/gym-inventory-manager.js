/**
 * ═══════════════════════════════════════════════════════════════
 * GYM INVENTORY & METHODOLOGY MANAGER
 * Gestion inventaire équipements + méthodologies d'entraînement
 * Pour génération de séances et programmations par IA
 * ═══════════════════════════════════════════════════════════════
 */

const GymInventoryManager = {
    // État
    state: {
        currentTab: 'config',
        categories: [],
        equipment: [],
        methodologies: [],
        exerciseCategories: [],
        exercises: [],
        selectedCategory: null,
        selectedEquipment: null,
        selectedMethodology: null,
        selectedExerciseCategory: null,
        showEquipmentForm: false,
        showMethodologyForm: false,
        showExerciseForm: false,
        editingEquipmentId: null,
        editingMethodologyId: null,
        editingExerciseId: null
    },

    /**
     * INITIALISATION
     */
    async init() {
        try {
            console.log('📦 Gym Inventory Manager - Init');

            // Charger données
            await this.loadCategories();
            await this.loadEquipment();
            await this.loadMethodologies();
            await this.loadExerciseCategories();
            await this.loadExercises();

            // Afficher interface
            this.render();
        } catch (error) {
            console.error('❌ Erreur init:', error);
            Utils.showNotification('Erreur chargement: ' + error.message, 'error');
        }
    },

    /**
     * CHARGER CATÉGORIES
     */
    async loadCategories() {
        const { data, error } = await SupabaseManager.supabase
            .from('equipment_categories')
            .select('*')
            .order('display_order');

        if (error) {
            throw error;
        }

        this.state.categories = data || [];
        console.log(`✅ ${data.length} catégories chargées`);
    },

    /**
     * CHARGER ÉQUIPEMENTS
     */
    async loadEquipment() {
        const { data, error } = await SupabaseManager.supabase
            .from('equipment_with_category')
            .select('*')
            .order('name');

        if (error) {
            throw error;
        }

        this.state.equipment = data || [];
        console.log(`✅ ${data.length} équipements chargés`);
    },

    /**
     * CHARGER MÉTHODOLOGIES
     */
    async loadMethodologies() {
        const { data, error } = await SupabaseManager.supabase
            .from('training_methodologies')
            .select('*')
            .order('category');

        if (error) {
            throw error;
        }

        this.state.methodologies = data || [];
        console.log(`✅ ${data.length} méthodologies chargées`);
    },

    /**
     * CHARGER CATÉGORIES D'EXERCICES
     */
    async loadExerciseCategories() {
        const { data, error } = await SupabaseManager.supabase
            .from('exercise_categories')
            .select('*')
            .order('display_order');

        if (error) {
            throw error;
        }

        this.state.exerciseCategories = data || [];
        console.log(`✅ ${data.length} catégories d'exercices chargées`);
    },

    /**
     * CHARGER EXERCICES
     */
    async loadExercises() {
        const { data, error } = await SupabaseManager.supabase
            .from('exercises')
            .select('*')
            .order('name');

        if (error) {
            throw error;
        }

        this.state.exercises = data || [];
        console.log(`✅ ${data.length} exercices chargés`);
    },

    /**
     * RENDER PRINCIPAL
     */
    render() {
        const container =
            document.getElementById('mainContent') || document.querySelector('#mainApp');
        if (!container) {
            return;
        }

        container.innerHTML = `
            <div class="module-container">
                <!-- Header -->
                ${this.renderHeader()}

                <!-- Tabs Navigation -->
                ${this.renderTabs()}

                <!-- Tab Content -->
                <div class="module-content">
                    ${this.renderTabContent()}
                </div>
            </div>
        `;
    },

    /**
     * HEADER
     */
    renderHeader() {
        return `
            <div class="module-header">
                <div class="module-header-content">
                    <div class="module-header-title">
                        <div class="module-header-icon">⚙️</div>
                        <div class="module-header-text">
                            <h1>Configuration & Inventaire</h1>
                            <p>Gestion de la salle et méthodologies d'entraînement</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * TABS NAVIGATION
     */
    renderTabs() {
        const tabs = [
            { id: 'config', label: 'Config App', icon: '⚙️' },
            { id: 'inventory', label: 'Inventaire Salle', icon: '📦' },
            { id: 'methodology', label: 'Méthodologie', icon: '📚' },
            { id: 'movements', label: 'Mouvements', icon: '🏋️' }
        ];

        return `
            <div class="module-tabs">
                ${tabs
                    .map(
                        tab => `
                    <button class="module-tab ${this.state.currentTab === tab.id ? 'active' : ''}"
                            onclick="GymInventoryManager.switchTab('${tab.id}')">
                        <span class="module-tab-icon">${tab.icon}</span>
                        <span class="module-tab-label">${tab.label}</span>
                    </button>
                `
                    )
                    .join('')}
            </div>
        `;
    },

    /**
     * TAB CONTENT
     */
    renderTabContent() {
        switch (this.state.currentTab) {
            case 'config':
                return this.renderConfigTab();
            case 'inventory':
                return this.renderInventoryTab();
            case 'methodology':
                return this.renderMethodologyTab();
            case 'movements':
                return this.renderMovementsTab();
            default:
                return '<p>Tab non trouvé</p>';
        }
    },

    /**
     * TAB: CONFIG APP
     */
    renderConfigTab() {
        return `
            <div class="module-card">
                <div class="module-card-header">
                    <div class="module-card-icon module-card-icon-blue">
                        <i class="fas fa-cog"></i>
                    </div>
                    <div class="module-card-title">
                        <h3>Configuration Application</h3>
                        <p>Paramètres généraux de l'application</p>
                    </div>
                </div>

                <div class="module-card-body">
                    <p class="text-secondary">
                        <i class="fas fa-info-circle"></i>
                        Configuration existante à intégrer ici
                    </p>
                    <button onclick="ConfigManager.showView('config')" class="module-btn module-btn-primary">
                        <i class="fas fa-external-link-alt"></i>
                        <span>Ouvrir Config Manager</span>
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * TAB: INVENTAIRE
     */
    renderInventoryTab() {
        // Si formulaire ouvert, afficher uniquement le formulaire
        if (this.state.showEquipmentForm) {
            return this.renderEquipmentForm();
        }

        return `
            <div class="inventory-layout">
                <!-- Sidebar catégories -->
                <div class="inventory-sidebar">
                    ${this.renderCategoriesSidebar()}
                </div>

                <!-- Main content -->
                <div class="inventory-main">
                    ${this.renderEquipmentList()}
                </div>

                <!-- Actions footer -->
                <div class="inventory-footer">
                    <button onclick="GymInventoryManager.addEquipment()" class="module-btn module-btn-success">
                        <i class="fas fa-plus"></i>
                        <span>Ajouter équipement</span>
                    </button>
                    <button onclick="GymInventoryManager.exportInventory()" class="module-btn module-btn-secondary">
                        <i class="fas fa-download"></i>
                        <span>Exporter</span>
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * SIDEBAR CATÉGORIES
     */
    renderCategoriesSidebar() {
        return `
            <div class="inventory-categories">
                <div class="inventory-categories-header">
                    <h3>Catégories</h3>
                    <button onclick="GymInventoryManager.showAllEquipment()"
                            class="inventory-category-btn ${!this.state.selectedCategory ? 'active' : ''}">
                        <span class="category-icon">📋</span>
                        <span class="category-name">Tout</span>
                        <span class="category-count">${this.state.equipment.length}</span>
                    </button>
                </div>

                ${this.state.categories
                    .map(cat => {
                        const count = this.state.equipment.filter(
                            e => e.category_id === cat.id
                        ).length;
                        return `
                        <button onclick="GymInventoryManager.selectCategory(${cat.id})"
                                class="inventory-category-btn ${this.state.selectedCategory === cat.id ? 'active' : ''}">
                            <span class="category-icon">${cat.icon || '📦'}</span>
                            <span class="category-name">${cat.name}</span>
                            <span class="category-count">${count}</span>
                        </button>
                    `;
                    })
                    .join('')}
            </div>
        `;
    },

    /**
     * LISTE ÉQUIPEMENTS
     */
    renderEquipmentList() {
        // Filtrer par catégorie si sélectionnée
        let equipment = this.state.equipment;
        if (this.state.selectedCategory) {
            equipment = equipment.filter(e => e.category_id === this.state.selectedCategory);
        }

        if (equipment.length === 0) {
            return `
                <div class="inventory-empty">
                    <div class="inventory-empty-icon">📦</div>
                    <p class="inventory-empty-title">Aucun équipement</p>
                    <p class="inventory-empty-subtitle">Ajoutez votre premier équipement pour commencer</p>
                    <button onclick="GymInventoryManager.addEquipment()" class="module-btn module-btn-primary">
                        <i class="fas fa-plus"></i>
                        <span>Ajouter équipement</span>
                    </button>
                </div>
            `;
        }

        // Grouper par catégorie
        const byCategory = {};
        equipment.forEach(eq => {
            const catName = eq.category_name || 'Sans catégorie';
            if (!byCategory[catName]) {
                byCategory[catName] = {
                    icon: eq.category_icon || '📦',
                    items: []
                };
            }
            byCategory[catName].items.push(eq);
        });

        return `
            ${Object.entries(byCategory)
                .map(([catName, data]) => this.renderEquipmentTable(catName, data.items, data.icon))
                .join('')}
        `;
    },

    renderEquipmentTable(categoryName, equipment, icon) {
        return `
            <div class="methodology-table-section">
                <h3 class="methodology-table-title">${icon} ${categoryName}</h3>
                <div style="overflow-x: auto;">
                    <table class="methodology-table methodology-table-extended">
                        <thead>
                            <tr>
                                <th style="width: 200px; min-width: 200px;">Équipement</th>
                                <th style="width: 80px;">Quantité</th>
                                <th style="width: 120px;">Sous-catégorie</th>
                                <th style="width: 120px;">Charge</th>
                                <th style="width: 150px;">Emplacement</th>
                                <th style="width: 100px;">Statut</th>
                                <th style="width: 200px;">Tags</th>
                                <th style="width: 100px;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${equipment.map(eq => this.renderEquipmentTableRow(eq)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    renderEquipmentTableRow(equipment) {
        const statusBadge = equipment.is_available
            ? '<span class="status-badge status-available">✅ Disponible</span>'
            : '<span class="status-badge status-unavailable">⚠️ Indisponible</span>';

        const weightInfo = equipment.has_weight
            ? `${equipment.min_weight || 0} - ${equipment.max_weight || 0} ${equipment.weight_unit || 'kg'}`
            : '-';

        const tags =
            equipment.tags && equipment.tags.length > 0
                ? equipment.tags
                      .map(tag => `<span class="equipment-tag-small">${tag}</span>`)
                      .join('')
                : '-';

        return `
            <tr class="methodology-table-row">
                <td>
                    <div class="method-name-cell">
                        <strong>${equipment.name}</strong>
                        ${equipment.description ? `<small class="method-description">${equipment.description}</small>` : ''}
                    </div>
                </td>
                <td class="text-center">
                    <span class="method-value">${equipment.quantity}</span>
                </td>
                <td class="text-center">
                    <span class="method-value">${equipment.subcategory || '-'}</span>
                </td>
                <td class="text-center">
                    <span class="method-value">${weightInfo}</span>
                </td>
                <td class="text-center">
                    <span class="method-value">${equipment.location || '-'}</span>
                </td>
                <td class="text-center">
                    ${statusBadge}
                </td>
                <td>
                    <div class="equipment-tags-cell">${tags}</div>
                </td>
                <td class="text-center">
                    <div class="methodology-table-actions">
                        <button onclick="GymInventoryManager.editEquipment(${equipment.id})"
                                class="table-action-btn" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="GymInventoryManager.deleteEquipment(${equipment.id})"
                                class="table-action-btn table-action-btn-danger" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    },

    /**
     * TAB: MÉTHODOLOGIE
     */
    renderMethodologyTab() {
        // Si formulaire ouvert, afficher uniquement le formulaire
        if (this.state.showMethodologyForm) {
            return this.renderMethodologyForm();
        }

        // Grouper par catégorie
        const categories = {
            force: [],
            hypertrophie_myo: [],
            hypertrophie_sarco: [],
            puissance: [],
            explosivite: [],
            vitesse: [],
            endurance: []
        };

        this.state.methodologies.forEach(m => {
            const cat = m.category;
            if (categories[cat]) {
                categories[cat].push(m);
            } else if (cat === 'hypertrophie') {
                // Séparer hypertrophie myo et sarco si possible
                if (m.name.includes('Myo')) {
                    categories.hypertrophie_myo.push(m);
                } else if (m.name.includes('Sarco')) {
                    categories.hypertrophie_sarco.push(m);
                } else {
                    categories.hypertrophie_myo.push(m);
                }
            }
        });

        return `
            <div class="methodology-layout">
                <div class="methodology-header">
                    <h2>📚 Méthodologies d'Entraînement</h2>
                    <p class="text-secondary">Tableau complet des méthodes par catégorie</p>
                    <button onclick="GymInventoryManager.addMethodology()" class="module-btn module-btn-success">
                        <i class="fas fa-plus"></i>
                        <span>Ajouter méthodologie</span>
                    </button>
                </div>

                <!-- TABLEAU MÉTHODOLOGIES -->
                <div class="methodology-table-container">
                    ${this.renderMethodologyTable('force', categories.force, '🏋️ Force')}
                    ${this.renderMethodologyTable('hypertrophie_myo', categories.hypertrophie_myo, '💪 Hypertrophie (Myo)')}
                    ${this.renderMethodologyTable('hypertrophie_sarco', categories.hypertrophie_sarco, '💪 Hypertrophie (Sarco)')}
                    ${this.renderMethodologyTable('endurance', categories.endurance, '🏃 Endurance Musculaire')}
                    ${this.renderMethodologyTable('puissance', categories.puissance, '⚡ Puissance')}
                    ${this.renderMethodologyTable('vitesse', categories.vitesse, '⚡ Vitesse')}
                    ${this.renderMethodologyTable('explosivite', categories.explosivite, '💥 Explosivité')}
                </div>
            </div>
        `;
    },

    /**
     * TAB: MOUVEMENTS
     */
    renderMovementsTab() {
        // Si formulaire ouvert, afficher uniquement le formulaire
        if (this.state.showExerciseForm) {
            return this.renderExerciseForm();
        }

        // Grouper exercices par catégorie
        const byCategory = {};
        this.state.exerciseCategories.forEach(cat => {
            byCategory[cat.id] = {
                name: cat.name,
                icon: cat.icon,
                slug: cat.slug,
                exercises: this.state.exercises.filter(ex => ex.category_id === cat.id)
            };
        });

        // Statistiques
        const totalExercises = this.state.exercises.length;
        const hyroxStations = this.state.exercises.filter(ex => ex.is_hyrox_station).length;

        return `
            <div class="methodology-layout">
                <div class="methodology-header">
                    <h2>🏋️ Banque de Mouvements</h2>
                    <p class="text-secondary">
                        ${totalExercises} exercices - ${hyroxStations} stations HYROX - ${this.state.exerciseCategories.length} catégories
                    </p>
                    <button onclick="GymInventoryManager.addExercise()" class="module-btn module-btn-success">
                        <i class="fas fa-plus"></i>
                        <span>Ajouter exercice</span>
                    </button>
                </div>

                <!-- EXERCICES PAR CATÉGORIE -->
                <div class="methodology-table-container">
                    ${Object.entries(byCategory)
                        .map(([catId, cat]) =>
                            this.renderExercisesTable(cat.name, cat.exercises, cat.icon)
                        )
                        .join('')}
                </div>
            </div>
        `;
    },

    /**
     * Render tableau d'exercices pour une catégorie
     * @param categoryName
     * @param exercises
     * @param icon
     */
    renderExercisesTable(categoryName, exercises, icon) {
        if (exercises.length === 0) {
            return '';
        }

        return `
            <div class="methodology-table-section">
                <h3 class="methodology-table-title">${icon} ${categoryName} (${exercises.length})</h3>
                <div style="overflow-x: auto;">
                    <table class="methodology-table methodology-table-extended">
                        <thead>
                            <tr>
                                <th style="width: 200px; min-width: 200px;">Exercice</th>
                                <th style="width: 100px;">Niveau</th>
                                <th style="width: 100px;">Type Force</th>
                                <th style="width: 150px;">Muscles Primaires</th>
                                <th style="width: 150px;">Équipement</th>
                                <th style="width: 100px;">HYROX</th>
                                <th style="width: 150px;">Typologies</th>
                                <th style="width: 100px;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${exercises.map(ex => this.renderExerciseTableRow(ex)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    /**
     * Render ligne de tableau pour un exercice
     * @param exercise
     */
    renderExerciseTableRow(exercise) {
        // Badge niveau
        const levelBadges = {
            beginner: '<span class="method-level-badge">🟢 Débutant</span>',
            intermediate: '<span class="method-level-badge">🟡 Intermédiaire</span>',
            advanced: '<span class="method-level-badge">🔴 Avancé</span>',
            expert: '<span class="method-level-badge">⚫ Expert</span>',
            elite: '<span class="method-level-badge">⭐ Elite</span>'
        };
        const levelBadge = levelBadges[exercise.level] || exercise.level || '-';

        // Badge type de force
        const forceTypeBadges = {
            push: '<span class="force-type-badge force-push">Push</span>',
            pull: '<span class="force-type-badge force-pull">Pull</span>',
            legs: '<span class="force-type-badge force-legs">Legs</span>',
            core: '<span class="force-type-badge force-core">Core</span>',
            full_body: '<span class="force-type-badge force-full">Full Body</span>',
            cardio: '<span class="force-type-badge force-cardio">Cardio</span>'
        };
        const forceTypeBadge = forceTypeBadges[exercise.force_type] || exercise.force_type || '-';

        // Muscles primaires
        const muscles =
            exercise.primary_muscles && exercise.primary_muscles.length > 0
                ? exercise.primary_muscles.slice(0, 3).join(', ')
                : '-';

        // Équipement
        const equipment =
            exercise.equipment_required && exercise.equipment_required.length > 0
                ? exercise.equipment_required
                      .slice(0, 2)
                      .map(eq => `<span class="equipment-tag-small">${eq}</span>`)
                      .join('')
                : '<span class="equipment-tag-small">Poids du corps</span>';

        // HYROX
        const hyroxBadge = exercise.is_hyrox_station
            ? `<span class="status-badge status-available">✅ Station ${exercise.hyrox_station_number || ''}</span>`
            : '-';

        // Typologies
        const typologies =
            exercise.typology_tags && exercise.typology_tags.length > 0
                ? exercise.typology_tags
                      .slice(0, 2)
                      .map(tag => `<span class="equipment-tag-small">${tag}</span>`)
                      .join('')
                : '-';

        return `
            <tr class="methodology-table-row">
                <td>
                    <div class="method-name-cell">
                        <strong>${exercise.name}</strong>
                        ${exercise.slug ? `<small class="method-description">${exercise.slug}</small>` : ''}
                    </div>
                </td>
                <td class="text-center">
                    ${levelBadge}
                </td>
                <td class="text-center">
                    ${forceTypeBadge}
                </td>
                <td class="text-center">
                    <span class="method-value">${muscles}</span>
                </td>
                <td>
                    <div class="equipment-tags-cell">${equipment}</div>
                </td>
                <td class="text-center">
                    ${hyroxBadge}
                </td>
                <td>
                    <div class="equipment-tags-cell">${typologies}</div>
                </td>
                <td class="text-center">
                    <div class="methodology-table-actions">
                        <button onclick="GymInventoryManager.viewExercise('${exercise.id}')"
                                class="table-action-btn" title="Voir détails">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="GymInventoryManager.editExercise('${exercise.id}')"
                                class="table-action-btn" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="GymInventoryManager.deleteExercise('${exercise.id}')"
                                class="table-action-btn table-action-btn-danger" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    },

    /**
     * Render tableau pour une catégorie de méthodologies
     * @param category
     * @param methodologies
     * @param title
     */
    renderMethodologyTable(category, methodologies, title) {
        if (methodologies.length === 0) {
            return '';
        }

        return `
            <div class="methodology-table-section">
                <h3 class="methodology-table-title">${title}</h3>
                <div style="overflow-x: auto;">
                    <table class="methodology-table methodology-table-extended">
                        <thead>
                            <tr>
                                <th style="width: 200px; min-width: 200px;">Méthode</th>
                                <th style="width: 80px;">Reps</th>
                                <th style="width: 70px;">Séries</th>
                                <th style="width: 90px;">Repos</th>
                                <th style="width: 80px;">Intensité</th>
                                <th style="width: 90px;">Phases</th>
                                <th style="width: 100px;">Effet Différé</th>
                                <th style="width: 100px;">Effet Résiduel</th>
                                <th style="width: 80px;">Fatigue</th>
                                <th style="width: 90px;">Récup.</th>
                                <th style="width: 100px;">Niveau Min</th>
                                <th style="width: 100px;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${methodologies.map(m => this.renderMethodologyTableRow(m)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    /**
     * Render ligne de tableau pour une méthodologie
     * @param method
     */
    renderMethodologyTableRow(method) {
        const energyBadge = this.getEnergySystemBadge(method.energy_system);

        // Phases PPG/PPO/PPS
        const phases = [];
        if (method.phase_ppg) {
            phases.push('PPG');
        }
        if (method.phase_ppo) {
            phases.push('PPO');
        }
        if (method.phase_pps) {
            phases.push('PPS');
        }
        const phasesStr = phases.length > 0 ? phases.join(' ') : '-';

        // Niveau minimum
        const levelLabels = {
            beginner: '🟢 Débutant',
            intermediate: '🟡 Intermédiaire',
            advanced: '🔴 Avancé'
        };
        const levelLabel =
            levelLabels[method.min_experience_level] || method.min_experience_level || '-';

        // Fatigue bar (1-10)
        const fatigueLevel = method.fatigue_level || 5;
        const fatigueColor =
            fatigueLevel <= 4 ? '#4ade80' : fatigueLevel <= 7 ? '#fbbf24' : '#ef4444';

        return `
            <tr class="methodology-table-row">
                <td>
                    <div class="method-name-cell">
                        <strong>${method.name}</strong>
                        ${energyBadge}
                        ${method.description ? `<small class="method-description">${method.description}</small>` : ''}
                    </div>
                </td>
                <td class="text-center">
                    <span class="method-value">${method.rep_range_min}-${method.rep_range_max}</span>
                </td>
                <td class="text-center">
                    <span class="method-value">${method.sets_min}-${method.sets_max}</span>
                </td>
                <td class="text-center">
                    <span class="method-value">${this.formatRestTime(method.rest_seconds_min, method.rest_seconds_max)}</span>
                </td>
                <td class="text-center">
                    <span class="method-value">${method.intensity_percent_min}-${method.intensity_percent_max}%</span>
                </td>
                <td class="text-center">
                    <span class="method-phases-badge">${phasesStr}</span>
                </td>
                <td class="text-center">
                    <span class="method-value" title="Jours avant effet maximal">
                        ${method.delayed_effect_days || 0}j
                    </span>
                </td>
                <td class="text-center">
                    <span class="method-value" title="Jours de maintien après arrêt">
                        ${method.residual_effect_days || 0}j
                    </span>
                </td>
                <td class="text-center">
                    <div class="fatigue-indicator" title="Niveau de fatigue: ${fatigueLevel}/10">
                        <div class="fatigue-bar" style="width: ${fatigueLevel * 10}%; background: ${fatigueColor};"></div>
                        <span class="fatigue-text">${fatigueLevel}/10</span>
                    </div>
                </td>
                <td class="text-center">
                    <span class="method-value" title="Jours de récupération nécessaires">
                        ${method.recovery_days_needed || 0}j
                    </span>
                </td>
                <td class="text-center">
                    <span class="method-level-badge">${levelLabel}</span>
                </td>
                <td class="text-center">
                    <div class="method-actions">
                        <button onclick="GymInventoryManager.editMethodology(${method.id})"
                                class="method-action-btn method-action-edit"
                                title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="GymInventoryManager.deleteMethodology(${method.id})"
                                class="method-action-btn method-action-delete"
                                title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    },

    /**
     * Formater le temps de repos
     * @param min
     * @param max
     */
    formatRestTime(min, max) {
        if (min >= 60 || max >= 60) {
            const minMin = Math.floor(min / 60);
            const maxMin = Math.floor(max / 60);
            return `${minMin}-${maxMin} min`;
        }
        return `${min}-${max}s`;
    },

    /**
     * FORMULAIRE ÉQUIPEMENT
     */
    renderEquipmentForm() {
        const isEdit = !!this.state.editingEquipmentId;
        const equipment = isEdit
            ? this.state.equipment.find(e => e.id === this.state.editingEquipmentId)
            : null;

        return `
            <div class="form-container">
                <div class="form-header">
                    <h2>
                        <i class="fas fa-${isEdit ? 'edit' : 'plus'}"></i>
                        ${isEdit ? 'Modifier' : 'Ajouter'} un équipement
                    </h2>
                    <button onclick="GymInventoryManager.cancelEquipmentForm()" class="module-btn module-btn-secondary">
                        <i class="fas fa-times"></i>
                        <span>Annuler</span>
                    </button>
                </div>

                <form id="equipmentForm" onsubmit="GymInventoryManager.saveEquipment(event)" class="equipment-form">
                    <div class="form-grid">
                        <!-- Catégorie -->
                        <div class="form-group form-group-full">
                            <label for="category_id">
                                <i class="fas fa-folder"></i>
                                Catégorie *
                            </label>
                            <select id="category_id" name="category_id" required>
                                <option value="">Sélectionner une catégorie</option>
                                ${this.state.categories
                                    .map(
                                        cat => `
                                    <option value="${cat.id}" ${equipment && equipment.category_id === cat.id ? 'selected' : ''}>
                                        ${cat.icon || ''} ${cat.name}
                                    </option>
                                `
                                    )
                                    .join('')}
                            </select>
                        </div>

                        <!-- Nom -->
                        <div class="form-group">
                            <label for="name">
                                <i class="fas fa-tag"></i>
                                Nom de l'équipement *
                            </label>
                            <input type="text" id="name" name="name"
                                   value="${equipment ? equipment.name : ''}"
                                   placeholder="Ex: Tapis de course" required>
                        </div>

                        <!-- Slug -->
                        <div class="form-group">
                            <label for="slug">
                                <i class="fas fa-code"></i>
                                Slug (pour l'IA) *
                            </label>
                            <input type="text" id="slug" name="slug"
                                   value="${equipment ? equipment.slug : ''}"
                                   placeholder="Ex: tapis-course" required>
                        </div>

                        <!-- Description -->
                        <div class="form-group form-group-full">
                            <label for="description">
                                <i class="fas fa-align-left"></i>
                                Description
                            </label>
                            <textarea id="description" name="description" rows="3"
                                      placeholder="Description détaillée de l'équipement">${equipment ? equipment.description || '' : ''}</textarea>
                        </div>

                        <!-- Quantité -->
                        <div class="form-group">
                            <label for="quantity">
                                <i class="fas fa-hashtag"></i>
                                Quantité *
                            </label>
                            <input type="number" id="quantity" name="quantity" min="1"
                                   value="${equipment ? equipment.quantity : 1}" required>
                        </div>

                        <!-- Emplacement -->
                        <div class="form-group">
                            <label for="location">
                                <i class="fas fa-map-marker-alt"></i>
                                Emplacement
                            </label>
                            <input type="text" id="location" name="location"
                                   value="${equipment ? equipment.location || '' : ''}"
                                   placeholder="Ex: Zone cardio">
                        </div>

                        <!-- Sous-catégorie -->
                        <div class="form-group form-group-full">
                            <label for="subcategory">
                                <i class="fas fa-sitemap"></i>
                                Sous-catégorie
                            </label>
                            <input type="text" id="subcategory" name="subcategory"
                                   value="${equipment ? equipment.subcategory || '' : ''}"
                                   placeholder="Ex: Avec gilet tactique">
                        </div>

                        <!-- Poids -->
                        <div class="form-group form-group-full">
                            <div class="form-checkbox">
                                <input type="checkbox" id="has_weight" name="has_weight"
                                       ${equipment && equipment.has_weight ? 'checked' : ''}
                                       onchange="document.getElementById('weightFields').style.display = this.checked ? 'grid' : 'none'">
                                <label for="has_weight">Cet équipement a une charge/poids variable</label>
                            </div>
                        </div>

                        <!-- Champs poids (conditionnels) -->
                        <div id="weightFields" class="form-group form-group-full weight-fields"
                             style="display: ${equipment && equipment.has_weight ? 'grid' : 'none'}">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="min_weight">Poids minimum</label>
                                    <input type="number" id="min_weight" name="min_weight" step="0.1"
                                           value="${equipment ? equipment.min_weight || '' : ''}">
                                </div>
                                <div class="form-group">
                                    <label for="max_weight">Poids maximum</label>
                                    <input type="number" id="max_weight" name="max_weight" step="0.1"
                                           value="${equipment ? equipment.max_weight || '' : ''}">
                                </div>
                                <div class="form-group">
                                    <label for="weight_unit">Unité</label>
                                    <select id="weight_unit" name="weight_unit">
                                        <option value="kg" ${equipment && equipment.weight_unit === 'kg' ? 'selected' : ''}>kg</option>
                                        <option value="lbs" ${equipment && equipment.weight_unit === 'lbs' ? 'selected' : ''}>lbs</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Tags -->
                        <div class="form-group form-group-full">
                            <label for="tags">
                                <i class="fas fa-tags"></i>
                                Tags (pour recherche IA, séparés par virgules)
                            </label>
                            <input type="text" id="tags" name="tags"
                                   value="${equipment && equipment.tags ? equipment.tags.join(', ') : ''}"
                                   placeholder="Ex: cardio, running, endurance">
                            <small class="form-help">Les tags aident l'IA à trouver cet équipement</small>
                        </div>

                        <!-- Notes -->
                        <div class="form-group form-group-full">
                            <label for="notes">
                                <i class="fas fa-sticky-note"></i>
                                Notes
                            </label>
                            <textarea id="notes" name="notes" rows="2"
                                      placeholder="Notes internes, maintenance, etc.">${equipment ? equipment.notes || '' : ''}</textarea>
                        </div>

                        <!-- Disponibilité -->
                        <div class="form-group form-group-full">
                            <div class="form-checkbox">
                                <input type="checkbox" id="is_available" name="is_available"
                                       ${!equipment || equipment.is_available ? 'checked' : ''}>
                                <label for="is_available">Équipement disponible</label>
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="form-actions">
                        <button type="button" onclick="GymInventoryManager.cancelEquipmentForm()"
                                class="module-btn module-btn-secondary">
                            <i class="fas fa-times"></i>
                            <span>Annuler</span>
                        </button>
                        <button type="submit" class="module-btn module-btn-success">
                            <i class="fas fa-save"></i>
                            <span>${isEdit ? 'Enregistrer' : 'Créer'}</span>
                        </button>
                    </div>
                </form>
            </div>
        `;
    },

    /**
     * FORMULAIRE MÉTHODOLOGIE
     */
    renderMethodologyForm() {
        const isEdit = !!this.state.editingMethodologyId;
        const method = isEdit
            ? this.state.methodologies.find(m => m.id === this.state.editingMethodologyId)
            : null;

        return `
            <div class="form-container">
                <div class="form-header">
                    <h2>
                        <i class="fas fa-${isEdit ? 'edit' : 'plus'}"></i>
                        ${isEdit ? 'Modifier' : 'Ajouter'} une méthodologie
                    </h2>
                    <button onclick="GymInventoryManager.cancelMethodologyForm()" class="module-btn module-btn-secondary">
                        <i class="fas fa-times"></i>
                        <span>Annuler</span>
                    </button>
                </div>

                <form id="methodologyForm" onsubmit="GymInventoryManager.saveMethodology(event)" class="methodology-form">
                    <div class="form-grid">
                        <!-- Nom -->
                        <div class="form-group">
                            <label for="method_name">
                                <i class="fas fa-tag"></i>
                                Nom de la méthodologie *
                            </label>
                            <input type="text" id="method_name" name="name"
                                   value="${method ? method.name : ''}"
                                   placeholder="Ex: Force Maximale" required>
                        </div>

                        <!-- Slug -->
                        <div class="form-group">
                            <label for="method_slug">
                                <i class="fas fa-code"></i>
                                Slug *
                            </label>
                            <input type="text" id="method_slug" name="slug"
                                   value="${method ? method.slug : ''}"
                                   placeholder="Ex: force-maximale" required>
                        </div>

                        <!-- Catégorie -->
                        <div class="form-group">
                            <label for="category">
                                <i class="fas fa-folder"></i>
                                Catégorie *
                            </label>
                            <select id="category" name="category" required>
                                <option value="">Sélectionner</option>
                                <option value="force" ${method && method.category === 'force' ? 'selected' : ''}>Force Maximale</option>
                                <option value="hypertrophie" ${method && method.category === 'hypertrophie' ? 'selected' : ''}>Hypertrophie</option>
                                <option value="puissance" ${method && method.category === 'puissance' ? 'selected' : ''}>Puissance</option>
                                <option value="explosivite" ${method && method.category === 'explosivite' ? 'selected' : ''}>Explosivité</option>
                                <option value="vitesse" ${method && method.category === 'vitesse' ? 'selected' : ''}>Vitesse</option>
                                <option value="endurance" ${method && method.category === 'endurance' ? 'selected' : ''}>Endurance</option>
                            </select>
                        </div>

                        <!-- Filière énergétique -->
                        <div class="form-group">
                            <label for="energy_system">
                                <i class="fas fa-bolt"></i>
                                Filière énergétique *
                            </label>
                            <select id="energy_system" name="energy_system" required>
                                <option value="">Sélectionner</option>
                                <option value="anaerobic_alactic" ${method && method.energy_system === 'anaerobic_alactic' ? 'selected' : ''}>🔥 Anaérobie Alactique</option>
                                <option value="anaerobic_lactic" ${method && method.energy_system === 'anaerobic_lactic' ? 'selected' : ''}>💪 Anaérobie Lactique</option>
                                <option value="aerobic" ${method && method.energy_system === 'aerobic' ? 'selected' : ''}>🫁 Aérobie</option>
                            </select>
                        </div>

                        <!-- Description -->
                        <div class="form-group form-group-full">
                            <label for="method_description">
                                <i class="fas fa-align-left"></i>
                                Description *
                            </label>
                            <textarea id="method_description" name="description" rows="3"
                                      placeholder="Description de la méthodologie" required>${method ? method.description || '' : ''}</textarea>
                        </div>

                        <!-- Répétitions -->
                        <div class="form-group">
                            <label for="rep_range_min">
                                <i class="fas fa-repeat"></i>
                                Reps min *
                            </label>
                            <input type="number" id="rep_range_min" name="rep_range_min" min="1"
                                   value="${method ? method.rep_range_min : ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="rep_range_max">Reps max *</label>
                            <input type="number" id="rep_range_max" name="rep_range_max" min="1"
                                   value="${method ? method.rep_range_max : ''}" required>
                        </div>

                        <!-- Séries -->
                        <div class="form-group">
                            <label for="sets_min">
                                <i class="fas fa-layer-group"></i>
                                Séries min *
                            </label>
                            <input type="number" id="sets_min" name="sets_min" min="1"
                                   value="${method ? method.sets_min : ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="sets_max">Séries max *</label>
                            <input type="number" id="sets_max" name="sets_max" min="1"
                                   value="${method ? method.sets_max : ''}" required>
                        </div>

                        <!-- Repos -->
                        <div class="form-group">
                            <label for="rest_seconds_min">
                                <i class="fas fa-clock"></i>
                                Repos min (s) *
                            </label>
                            <input type="number" id="rest_seconds_min" name="rest_seconds_min" min="0"
                                   value="${method ? method.rest_seconds_min : ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="rest_seconds_max">Repos max (s) *</label>
                            <input type="number" id="rest_seconds_max" name="rest_seconds_max" min="0"
                                   value="${method ? method.rest_seconds_max : ''}" required>
                        </div>

                        <!-- Intensité -->
                        <div class="form-group">
                            <label for="intensity_percent_min">
                                <i class="fas fa-tachometer-alt"></i>
                                Intensité min (%) *
                            </label>
                            <input type="number" id="intensity_percent_min" name="intensity_percent_min" min="0" max="100"
                                   value="${method ? method.intensity_percent_min : ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="intensity_percent_max">Intensité max (%) *</label>
                            <input type="number" id="intensity_percent_max" name="intensity_percent_max" min="0" max="100"
                                   value="${method ? method.intensity_percent_max : ''}" required>
                        </div>

                        <!-- Tempo -->
                        <div class="form-group form-group-full">
                            <label for="tempo">
                                <i class="fas fa-stopwatch"></i>
                                Tempo (optionnel)
                            </label>
                            <input type="text" id="tempo" name="tempo"
                                   value="${method ? method.tempo || '' : ''}"
                                   placeholder="Ex: 3-0-1-0">
                            <small class="form-help">Format: excentrique-pause-concentrique-pause (ex: 3-0-1-0)</small>
                        </div>

                        <!-- Bénéfices -->
                        <div class="form-group form-group-full">
                            <label for="benefits">
                                <i class="fas fa-star"></i>
                                Bénéfices
                            </label>
                            <textarea id="benefits" name="benefits" rows="2"
                                      placeholder="Bénéfices de cette méthodologie">${method ? method.benefits || '' : ''}</textarea>
                        </div>

                        <!-- Public cible -->
                        <div class="form-group form-group-full">
                            <label for="target_audience">
                                <i class="fas fa-users"></i>
                                Public cible
                            </label>
                            <input type="text" id="target_audience" name="target_audience"
                                   value="${method ? method.target_audience || '' : ''}"
                                   placeholder="Ex: Débutants, Athlètes avancés, etc.">
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="form-actions">
                        <button type="button" onclick="GymInventoryManager.cancelMethodologyForm()"
                                class="module-btn module-btn-secondary">
                            <i class="fas fa-times"></i>
                            <span>Annuler</span>
                        </button>
                        <button type="submit" class="module-btn module-btn-success">
                            <i class="fas fa-save"></i>
                            <span>${isEdit ? 'Enregistrer' : 'Créer'}</span>
                        </button>
                    </div>
                </form>
            </div>
        `;
    },

    /**
     * CARD MÉTHODOLOGIE
     * @param methodology
     */
    renderMethodologyCard(methodology) {
        return `
            <div class="methodology-card">
                <div class="methodology-card-header">
                    <h4>${methodology.name}</h4>
                    <div class="methodology-actions">
                        <button onclick="GymInventoryManager.editMethodology(${methodology.id})"
                                class="methodology-action-btn">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="GymInventoryManager.deleteMethodology(${methodology.id})"
                                class="methodology-action-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>

                <p class="methodology-description">${methodology.description}</p>

                <div class="methodology-specs">
                    <div class="methodology-spec">
                        <span class="spec-icon">🔢</span>
                        <span class="spec-label">Reps</span>
                        <span class="spec-value">${methodology.rep_range_min}-${methodology.rep_range_max}</span>
                    </div>
                    <div class="methodology-spec">
                        <span class="spec-icon">📊</span>
                        <span class="spec-label">Séries</span>
                        <span class="spec-value">${methodology.sets_min}-${methodology.sets_max}</span>
                    </div>
                    <div class="methodology-spec">
                        <span class="spec-icon">⏱️</span>
                        <span class="spec-label">Repos</span>
                        <span class="spec-value">${methodology.rest_seconds_min}-${methodology.rest_seconds_max}s</span>
                    </div>
                    <div class="methodology-spec">
                        <span class="spec-icon">💯</span>
                        <span class="spec-label">Intensité</span>
                        <span class="spec-value">${methodology.intensity_percent_min}-${methodology.intensity_percent_max}%</span>
                    </div>
                </div>

                ${
                    methodology.tempo
                        ? `
                    <div class="methodology-tempo">
                        <span class="tempo-label">Tempo:</span>
                        <span class="tempo-value">${methodology.tempo}</span>
                    </div>
                `
                        : ''
                }

                <div class="methodology-energy-system">
                    ${this.getEnergySystemBadge(methodology.energy_system)}
                </div>
            </div>
        `;
    },

    /**
     * ACTIONS - Navigation
     * @param tabId
     */
    switchTab(tabId) {
        this.state.currentTab = tabId;
        // Utiliser ConfigManagerPage pour la navigation si disponible
        if (typeof ConfigManagerPage !== 'undefined') {
            ConfigManagerPage.switchTab(tabId);
        } else {
            this.render();
        }
    },

    selectCategory(categoryId) {
        this.state.selectedCategory = categoryId;
        this.refreshCurrentTab();
    },

    showAllEquipment() {
        this.state.selectedCategory = null;
        this.refreshCurrentTab();
    },

    /**
     * Rafraîchir uniquement le contenu de l'onglet actif (sans recharger toute la page)
     */
    refreshCurrentTab() {
        const container = document.querySelector('.module-container');
        if (container && typeof ConfigManagerPage !== 'undefined') {
            // On est dans ConfigManagerPage, mettre à jour uniquement le contenu
            container.innerHTML = ConfigManagerPage.renderTabContent();
        } else {
            // Mode standalone, render complet
            this.render();
        }
    },

    /**
     * ACTIONS - Équipements
     */
    addEquipment() {
        this.state.showEquipmentForm = true;
        this.state.editingEquipmentId = null;
        this.refreshCurrentTab();
    },

    editEquipment(id) {
        this.state.showEquipmentForm = true;
        this.state.editingEquipmentId = id;
        this.refreshCurrentTab();
    },

    cancelEquipmentForm() {
        this.state.showEquipmentForm = false;
        this.state.editingEquipmentId = null;
        this.refreshCurrentTab();
    },

    async saveEquipment(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        try {
            // Préparer les données
            const equipmentData = {
                category_id: parseInt(formData.get('category_id')),
                name: formData.get('name'),
                slug: formData.get('slug'),
                description: formData.get('description') || null,
                quantity: parseInt(formData.get('quantity')),
                location: formData.get('location') || null,
                subcategory: formData.get('subcategory') || null,
                has_weight: form.querySelector('#has_weight').checked,
                weight_unit: formData.get('weight_unit') || 'kg',
                min_weight: formData.get('min_weight')
                    ? parseFloat(formData.get('min_weight'))
                    : null,
                max_weight: formData.get('max_weight')
                    ? parseFloat(formData.get('max_weight'))
                    : null,
                notes: formData.get('notes') || null,
                is_available: form.querySelector('#is_available').checked
            };

            // Tags: convertir string -> array
            const tagsString = formData.get('tags');
            if (tagsString) {
                equipmentData.tags = tagsString
                    .split(',')
                    .map(t => t.trim())
                    .filter(t => t);
            } else {
                equipmentData.tags = [];
            }

            // Sauvegarder
            if (this.state.editingEquipmentId) {
                // UPDATE
                const { error } = await SupabaseManager.supabase
                    .from('gym_equipment')
                    .update(equipmentData)
                    .eq('id', this.state.editingEquipmentId);

                if (error) {
                    throw error;
                }
                Utils.showNotification('Équipement modifié', 'success');
            } else {
                // INSERT
                const { error } = await SupabaseManager.supabase
                    .from('gym_equipment')
                    .insert([equipmentData]);

                if (error) {
                    throw error;
                }
                Utils.showNotification('Équipement créé', 'success');
            }

            // Recharger et fermer formulaire
            await this.loadEquipment();
            this.cancelEquipmentForm();
        } catch (error) {
            console.error('❌ Erreur sauvegarde équipement:', error);
            Utils.showNotification('Erreur: ' + error.message, 'error');
        }
    },

    async deleteEquipment(id) {
        if (!confirm('Supprimer cet équipement ?')) {
            return;
        }

        try {
            const { error } = await SupabaseManager.supabase
                .from('gym_equipment')
                .delete()
                .eq('id', id);

            if (error) {
                throw error;
            }

            Utils.showNotification('Équipement supprimé', 'success');
            await this.loadEquipment();
            this.refreshCurrentTab();
        } catch (error) {
            console.error('Erreur suppression:', error);
            Utils.showNotification('Erreur: ' + error.message, 'error');
        }
    },

    async exportInventory() {
        // TODO: Export CSV/JSON
        console.log('Exporter inventaire');
        Utils.showNotification('Export en construction', 'info');
    },

    /**
     * ACTIONS - Méthodologies
     */
    addMethodology() {
        this.state.showMethodologyForm = true;
        this.state.editingMethodologyId = null;
        this.refreshCurrentTab();
    },

    editMethodology(id) {
        this.state.showMethodologyForm = true;
        this.state.editingMethodologyId = id;
        this.refreshCurrentTab();
    },

    cancelMethodologyForm() {
        this.state.showMethodologyForm = false;
        this.state.editingMethodologyId = null;
        this.refreshCurrentTab();
    },

    async saveMethodology(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        try {
            // Préparer les données
            const methodologyData = {
                name: formData.get('name'),
                slug: formData.get('slug'),
                category: formData.get('category'),
                energy_system: formData.get('energy_system'),
                description: formData.get('description'),
                rep_range_min: parseInt(formData.get('rep_range_min')),
                rep_range_max: parseInt(formData.get('rep_range_max')),
                sets_min: parseInt(formData.get('sets_min')),
                sets_max: parseInt(formData.get('sets_max')),
                rest_seconds_min: parseInt(formData.get('rest_seconds_min')),
                rest_seconds_max: parseInt(formData.get('rest_seconds_max')),
                intensity_percent_min: parseInt(formData.get('intensity_percent_min')),
                intensity_percent_max: parseInt(formData.get('intensity_percent_max')),
                tempo: formData.get('tempo') || null,
                benefits: formData.get('benefits') || null,
                target_audience: formData.get('target_audience') || null
            };

            // Sauvegarder
            if (this.state.editingMethodologyId) {
                // UPDATE
                const { error } = await SupabaseManager.supabase
                    .from('training_methodologies')
                    .update(methodologyData)
                    .eq('id', this.state.editingMethodologyId);

                if (error) {
                    throw error;
                }
                Utils.showNotification('Méthodologie modifiée', 'success');
            } else {
                // INSERT
                const { error } = await SupabaseManager.supabase
                    .from('training_methodologies')
                    .insert([methodologyData]);

                if (error) {
                    throw error;
                }
                Utils.showNotification('Méthodologie créée', 'success');
            }

            // Recharger et fermer formulaire
            await this.loadMethodologies();
            this.cancelMethodologyForm();
        } catch (error) {
            console.error('❌ Erreur sauvegarde méthodologie:', error);
            Utils.showNotification('Erreur: ' + error.message, 'error');
        }
    },

    async deleteMethodology(id) {
        if (!confirm('Supprimer cette méthodologie ?')) {
            return;
        }

        try {
            const { error } = await SupabaseManager.supabase
                .from('training_methodologies')
                .delete()
                .eq('id', id);

            if (error) {
                throw error;
            }

            Utils.showNotification('Méthodologie supprimée', 'success');
            await this.loadMethodologies();
            this.refreshCurrentTab();
        } catch (error) {
            console.error('Erreur suppression:', error);
            Utils.showNotification('Erreur: ' + error.message, 'error');
        }
    },

    /**
     * HELPERS
     * @param category
     */
    getCategoryIcon(category) {
        const icons = {
            force: '🏋️',
            hypertrophie: '💪',
            puissance: '⚡',
            explosivite: '💥',
            vitesse: '⚡',
            endurance: '🏃'
        };
        return icons[category] || '🎯';
    },

    getCategoryLabel(category) {
        const labels = {
            force: 'Force Maximale',
            hypertrophie: 'Hypertrophie',
            puissance: 'Puissance',
            explosivite: 'Explosivité',
            vitesse: 'Vitesse',
            endurance: 'Endurance'
        };
        return labels[category] || category;
    },

    getEnergySystemBadge(system) {
        const badges = {
            anaerobic_alactic:
                '<span class="energy-badge energy-alactic">🔥 Anaérobie Alactique</span>',
            anaerobic_lactic:
                '<span class="energy-badge energy-lactic">💪 Anaérobie Lactique</span>',
            aerobic: '<span class="energy-badge energy-aerobic">🫁 Aérobie</span>'
        };
        return badges[system] || '';
    },

    /**
     * ACTIONS - Exercices
     */
    addExercise() {
        this.state.showExerciseForm = true;
        this.state.editingExerciseId = null;
        this.refreshCurrentTab();
    },

    viewExercise(id) {
        const exercise = this.state.exercises.find(ex => ex.id === id);
        if (!exercise) {
            return;
        }

        // Modal de détails
        const modalHtml = `
            <div class="exercise-detail-modal">
                <h2>${exercise.name}</h2>
                <div class="exercise-detail-grid">
                    <div class="exercise-detail-section">
                        <h3>Informations générales</h3>
                        <p><strong>Niveau:</strong> ${exercise.level || '-'}</p>
                        <p><strong>Type de force:</strong> ${exercise.force_type || '-'}</p>
                        <p><strong>Mécanique:</strong> ${exercise.mechanic || '-'}</p>
                    </div>
                    <div class="exercise-detail-section">
                        <h3>Muscles</h3>
                        <p><strong>Primaires:</strong> ${exercise.primary_muscles ? exercise.primary_muscles.join(', ') : '-'}</p>
                        <p><strong>Secondaires:</strong> ${exercise.secondary_muscles ? exercise.secondary_muscles.join(', ') : '-'}</p>
                    </div>
                    <div class="exercise-detail-section">
                        <h3>Équipement requis</h3>
                        <p>${exercise.equipment_required && exercise.equipment_required.length > 0 ? exercise.equipment_required.join(', ') : 'Poids du corps'}</p>
                    </div>
                    ${
                        exercise.instructions && exercise.instructions.length > 0
                            ? `
                    <div class="exercise-detail-section">
                        <h3>Instructions</h3>
                        <ol>
                            ${exercise.instructions.map(inst => `<li>${inst}</li>`).join('')}
                        </ol>
                    </div>
                    `
                            : ''
                    }
                    ${
                        exercise.coaching_tips && exercise.coaching_tips.length > 0
                            ? `
                    <div class="exercise-detail-section">
                        <h3>Conseils coaching</h3>
                        <ul>
                            ${exercise.coaching_tips.map(tip => `<li>${tip}</li>`).join('')}
                        </ul>
                    </div>
                    `
                            : ''
                    }
                </div>
            </div>
        `;

        // Utiliser système de notification pour afficher temporairement
        Utils.showNotification(`Détails: ${exercise.name}`, 'info');
        console.log('📋 Exercice:', exercise);
    },

    editExercise(id) {
        this.state.showExerciseForm = true;
        this.state.editingExerciseId = id;
        this.refreshCurrentTab();
    },

    cancelExerciseForm() {
        this.state.showExerciseForm = false;
        this.state.editingExerciseId = null;
        this.refreshCurrentTab();
    },

    async deleteExercise(id) {
        const exercise = this.state.exercises.find(ex => ex.id === id);
        if (!exercise) {
            return;
        }

        if (!confirm(`Supprimer l'exercice "${exercise.name}" ?`)) {
            return;
        }

        try {
            const { error } = await SupabaseManager.supabase
                .from('exercises')
                .delete()
                .eq('id', id);

            if (error) {
                throw error;
            }

            Utils.showNotification('Exercice supprimé', 'success');
            await this.loadExercises();
            this.refreshCurrentTab();
        } catch (error) {
            console.error('❌ Erreur suppression exercice:', error);
            Utils.showNotification('Erreur: ' + error.message, 'error');
        }
    },

    /**
     * FORMULAIRE EXERCICE
     */
    renderExerciseForm() {
        const isEdit = !!this.state.editingExerciseId;
        const exercise = isEdit
            ? this.state.exercises.find(e => e.id === this.state.editingExerciseId)
            : null;

        return `
            <div class="form-container">
                <div class="form-header">
                    <h2>
                        <i class="fas fa-${isEdit ? 'edit' : 'plus'}"></i>
                        ${isEdit ? 'Modifier' : 'Ajouter'} un exercice
                    </h2>
                    <button onclick="GymInventoryManager.cancelExerciseForm()" class="module-btn module-btn-secondary">
                        <i class="fas fa-times"></i>
                        <span>Annuler</span>
                    </button>
                </div>

                <form id="exerciseForm" onsubmit="GymInventoryManager.saveExercise(event)" class="exercise-form">
                    <div class="form-grid">
                        <!-- Nom -->
                        <div class="form-group">
                            <label for="exercise_name">
                                <i class="fas fa-tag"></i>
                                Nom de l'exercice *
                            </label>
                            <input type="text" id="exercise_name" name="name"
                                   value="${exercise ? exercise.name : ''}"
                                   placeholder="Ex: Squat" required>
                        </div>

                        <!-- Slug -->
                        <div class="form-group">
                            <label for="exercise_slug">
                                <i class="fas fa-code"></i>
                                Slug *
                            </label>
                            <input type="text" id="exercise_slug" name="slug"
                                   value="${exercise ? exercise.slug : ''}"
                                   placeholder="Ex: squat" required>
                        </div>

                        <!-- Catégorie -->
                        <div class="form-group">
                            <label for="exercise_category_id">
                                <i class="fas fa-folder"></i>
                                Catégorie *
                            </label>
                            <select id="exercise_category_id" name="category_id" required>
                                <option value="">Sélectionner une catégorie</option>
                                ${this.state.exerciseCategories
                                    .map(
                                        cat => `
                                    <option value="${cat.id}" ${exercise && exercise.category_id === cat.id ? 'selected' : ''}>
                                        ${cat.icon || ''} ${cat.name}
                                    </option>
                                `
                                    )
                                    .join('')}
                            </select>
                        </div>

                        <!-- Niveau -->
                        <div class="form-group">
                            <label for="exercise_level">
                                <i class="fas fa-signal"></i>
                                Niveau *
                            </label>
                            <select id="exercise_level" name="level" required>
                                <option value="beginner" ${exercise && exercise.level === 'beginner' ? 'selected' : ''}>Débutant</option>
                                <option value="intermediate" ${exercise && exercise.level === 'intermediate' ? 'selected' : ''}>Intermédiaire</option>
                                <option value="advanced" ${exercise && exercise.level === 'advanced' ? 'selected' : ''}>Avancé</option>
                                <option value="expert" ${exercise && exercise.level === 'expert' ? 'selected' : ''}>Expert</option>
                                <option value="elite" ${exercise && exercise.level === 'elite' ? 'selected' : ''}>Elite</option>
                            </select>
                        </div>

                        <!-- Type de force -->
                        <div class="form-group">
                            <label for="force_type">
                                <i class="fas fa-dumbbell"></i>
                                Type de force *
                            </label>
                            <select id="force_type" name="force_type" required>
                                <option value="push" ${exercise && exercise.force_type === 'push' ? 'selected' : ''}>Push</option>
                                <option value="pull" ${exercise && exercise.force_type === 'pull' ? 'selected' : ''}>Pull</option>
                                <option value="legs" ${exercise && exercise.force_type === 'legs' ? 'selected' : ''}>Legs</option>
                                <option value="core" ${exercise && exercise.force_type === 'core' ? 'selected' : ''}>Core</option>
                                <option value="full_body" ${exercise && exercise.force_type === 'full_body' ? 'selected' : ''}>Full Body</option>
                                <option value="cardio" ${exercise && exercise.force_type === 'cardio' ? 'selected' : ''}>Cardio</option>
                                <option value="static" ${exercise && exercise.force_type === 'static' ? 'selected' : ''}>Statique</option>
                            </select>
                        </div>

                        <!-- Sous-catégorie -->
                        <div class="form-group">
                            <label for="subcategory">
                                <i class="fas fa-sitemap"></i>
                                Sous-catégorie
                            </label>
                            <input type="text" id="subcategory" name="subcategory"
                                   value="${exercise ? exercise.subcategory || '' : ''}"
                                   placeholder="Ex: legs, gymnastics">
                        </div>

                        <!-- Muscles primaires (texte libre pour JSON array) -->
                        <div class="form-group form-group-full">
                            <label for="primary_muscles">
                                <i class="fas fa-heartbeat"></i>
                                Muscles primaires (séparés par virgules)
                            </label>
                            <input type="text" id="primary_muscles" name="primary_muscles"
                                   value="${exercise && exercise.primary_muscles ? exercise.primary_muscles.join(', ') : ''}"
                                   placeholder="Ex: quadriceps, glutes, hamstrings">
                        </div>

                        <!-- Équipement requis -->
                        <div class="form-group form-group-full">
                            <label for="equipment_required">
                                <i class="fas fa-wrench"></i>
                                Équipement requis (séparés par virgules)
                            </label>
                            <input type="text" id="equipment_required" name="equipment_required"
                                   value="${exercise && exercise.equipment_required ? exercise.equipment_required.join(', ') : ''}"
                                   placeholder="Ex: barbell, rack, plates">
                        </div>

                        <!-- Difficulté (1-10) -->
                        <div class="form-group">
                            <label for="difficulty_rank">
                                <i class="fas fa-star"></i>
                                Difficulté (1-10)
                            </label>
                            <input type="number" id="difficulty_rank" name="difficulty_rank" min="1" max="10"
                                   value="${exercise ? exercise.difficulty_rank || 5 : 5}">
                        </div>

                        <!-- Système énergétique -->
                        <div class="form-group">
                            <label for="energy_system">
                                <i class="fas fa-bolt"></i>
                                Système énergétique
                            </label>
                            <select id="energy_system" name="energy_system">
                                <option value="anaerobic_alactic" ${exercise && exercise.energy_system === 'anaerobic_alactic' ? 'selected' : ''}>Anaérobie Alactique</option>
                                <option value="anaerobic_lactic" ${exercise && exercise.energy_system === 'anaerobic_lactic' ? 'selected' : ''}>Anaérobie Lactique</option>
                                <option value="aerobic" ${exercise && exercise.energy_system === 'aerobic' ? 'selected' : ''}>Aérobie</option>
                                <option value="mixed" ${exercise && exercise.energy_system === 'mixed' ? 'selected' : ''}>Mixte</option>
                            </select>
                        </div>

                        <!-- Tags de typologie -->
                        <div class="form-group form-group-full">
                            <label for="typology_tags">
                                <i class="fas fa-tags"></i>
                                Tags de typologie (séparés par virgules)
                            </label>
                            <input type="text" id="typology_tags" name="typology_tags"
                                   value="${exercise && exercise.typology_tags ? exercise.typology_tags.join(', ') : ''}"
                                   placeholder="Ex: metcon, gym_skills, power">
                        </div>

                        <!-- Station HYROX -->
                        <div class="form-group form-group-full">
                            <div class="form-checkbox">
                                <input type="checkbox" id="is_hyrox_station" name="is_hyrox_station"
                                       ${exercise && exercise.is_hyrox_station ? 'checked' : ''}
                                       onchange="document.getElementById('hyroxStationField').style.display = this.checked ? 'block' : 'none'">
                                <label for="is_hyrox_station">C'est une station HYROX</label>
                            </div>
                        </div>

                        <!-- Numéro station HYROX (conditionnel) -->
                        <div id="hyroxStationField" class="form-group"
                             style="display: ${exercise && exercise.is_hyrox_station ? 'block' : 'none'}">
                            <label for="hyrox_station_number">
                                <i class="fas fa-hashtag"></i>
                                Numéro de station HYROX
                            </label>
                            <input type="number" id="hyrox_station_number" name="hyrox_station_number" min="1" max="8"
                                   value="${exercise ? exercise.hyrox_station_number || '' : ''}">
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="form-actions">
                        <button type="button" onclick="GymInventoryManager.cancelExerciseForm()"
                                class="module-btn module-btn-secondary">
                            <i class="fas fa-times"></i>
                            <span>Annuler</span>
                        </button>
                        <button type="submit" class="module-btn module-btn-success">
                            <i class="fas fa-save"></i>
                            <span>${isEdit ? 'Enregistrer' : 'Créer'}</span>
                        </button>
                    </div>
                </form>
            </div>
        `;
    },

    async saveExercise(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        try {
            // Préparer les données
            const exerciseData = {
                name: formData.get('name'),
                slug: formData.get('slug'),
                category_id: parseInt(formData.get('category_id')),
                subcategory: formData.get('subcategory') || null,
                level: formData.get('level'),
                force_type: formData.get('force_type'),
                mechanic: 'compound', // Par défaut
                difficulty_rank: parseInt(formData.get('difficulty_rank')),
                energy_system: formData.get('energy_system'),
                is_hyrox_station: form.querySelector('#is_hyrox_station').checked,
                hyrox_station_number: formData.get('hyrox_station_number')
                    ? parseInt(formData.get('hyrox_station_number'))
                    : null
            };

            // Convertir les champs CSV en arrays
            const primaryMuscles = formData.get('primary_muscles');
            exerciseData.primary_muscles = primaryMuscles
                ? primaryMuscles
                      .split(',')
                      .map(m => m.trim())
                      .filter(m => m)
                : [];

            const equipmentRequired = formData.get('equipment_required');
            exerciseData.equipment_required = equipmentRequired
                ? equipmentRequired
                      .split(',')
                      .map(e => e.trim())
                      .filter(e => e)
                : [];

            const typologyTags = formData.get('typology_tags');
            exerciseData.typology_tags = typologyTags
                ? typologyTags
                      .split(',')
                      .map(t => t.trim())
                      .filter(t => t)
                : [];

            // Sauvegarder
            if (this.state.editingExerciseId) {
                // UPDATE
                const { error } = await SupabaseManager.supabase
                    .from('exercises')
                    .update(exerciseData)
                    .eq('id', this.state.editingExerciseId);

                if (error) {
                    throw error;
                }
                Utils.showNotification('Exercice modifié', 'success');
            } else {
                // INSERT
                const { error } = await SupabaseManager.supabase
                    .from('exercises')
                    .insert([exerciseData]);

                if (error) {
                    throw error;
                }
                Utils.showNotification('Exercice créé', 'success');
            }

            // Recharger et fermer formulaire
            await this.loadExercises();
            this.cancelExerciseForm();
        } catch (error) {
            console.error('❌ Erreur sauvegarde exercice:', error);
            Utils.showNotification('Erreur: ' + error.message, 'error');
        }
    }
};

// Export global
window.GymInventoryManager = GymInventoryManager;
