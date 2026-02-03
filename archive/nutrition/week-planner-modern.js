/**
 * WEEK PLANNER MODERN - Planification hebdomadaire avec design moderne
 * Interface élégante inspirée iOS pour la planification nutritionnelle
 */

const WeekPlannerModern = {
    // Reprendre les types d'activité de l'original
    ACTIVITY_TYPES: {
        REST: {
            id: 'rest',
            label: 'Repos',
            emoji: '😴',
            icon: 'bed',
            color: '#3b82f6',
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            calorieAdjustment: -200,
            description: 'Jour de repos complet',
            burn: 0
        },
        TRAINING: {
            id: 'training',
            label: 'Renforcement',
            emoji: '💪',
            icon: 'dumbbell',
            color: '#f59e0b',
            gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            calorieAdjustment: +150,
            avgBurn: 400,
            description: 'Musculation / Renfo'
        },
        CARDIO: {
            id: 'cardio',
            label: 'Cardio',
            emoji: '🏃',
            icon: 'running',
            color: '#ef4444',
            gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            calorieAdjustment: +400,
            avgBurn: 850,
            description: 'Cardio intensif'
        }
    },

    DAYS: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],

    selectedActivities: {},
    currentCallback: null,
    currentPlanDuration: null,

    /**
     * Afficher le sélecteur moderne
     * @param onComplete
     * @param planDuration
     */
    showWeekSelector(onComplete, planDuration = '1week') {
        this.currentPlanDuration = planDuration;
        this.currentCallback = onComplete;
        this.selectedActivities = {};

        const modal = document.createElement('div');
        modal.id = 'weekPlannerModal';
        modal.className = 'week-planner-modal-overlay';

        modal.innerHTML = `
            <div class="week-planner-modern-container">
                <!-- Header -->
                <div class="week-planner-header">
                    <!-- Background pattern -->
                    <div class="week-planner-header-bg"></div>

                    <div class="week-planner-header-content">
                        <div class="week-planner-header-left">
                            <div class="week-planner-icon">
                                📅
                            </div>
                            <div>
                                <h2 class="week-planner-title">
                                    ${this.getPlanningTitle(planDuration)}
                                </h2>
                                <p class="week-planner-subtitle">
                                    Configurez votre semaine d'entraînement
                                </p>
                            </div>
                        </div>
                        <button onclick="document.getElementById('weekPlannerModal').remove()" class="week-planner-close-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <!-- Content -->
                <div class="week-planner-content">
                    <!-- Info card -->
                    <div class="week-planner-info-card">
                        <div class="week-planner-info-inner">
                            <div class="week-planner-info-icon">
                                <i class="fas fa-lightbulb"></i>
                            </div>
                            <div class="week-planner-info-text">
                                <h4 class="week-planner-info-title">
                                    Comment ça marche ?
                                </h4>
                                <p class="week-planner-info-desc">
                                    Cliquez sur chaque jour pour choisir le type d'activité. Les calories seront automatiquement ajustées selon votre planning.
                                    ${planDuration === '1month' ? '<br><strong class="week-planner-month-badge">⚡ Mode 1 mois :</strong> Configurez une semaine type qui sera répétée.' : ''}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Activity types legend -->
                    <div class="week-planner-legend-grid">
                        ${this.renderActivityTypesLegend()}
                    </div>

                    <!-- Days grid -->
                    <div id="weekPlannerDays" class="week-planner-days-grid ${planDuration === '1day' ? 'single-day' : ''}">
                        ${this.renderDaysForDuration(planDuration)}
                    </div>

                    <!-- Templates rapides -->
                    ${planDuration !== '1day' ? this.renderQuickTemplates() : ''}

                    <!-- Action buttons -->
                    <div class="week-planner-actions">
                        <button onclick="document.getElementById('weekPlannerModal').remove()" class="week-planner-btn-cancel">
                            <i class="fas fa-times mr-2"></i>
                            Annuler
                        </button>
                        <button onclick="WeekPlannerModern.validateWeekPlan()" class="week-planner-btn-validate">
                            <i class="fas fa-check mr-2"></i>
                            Valider le planning
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Appliquer template par défaut
        setTimeout(() => {
            if (planDuration === '1day') {
                this.selectDayType(0, 'training');
            } else {
                this.applyTemplate('classic');
            }
        }, 100);
    },

    /**
     * Légende des types d'activité
     */
    renderActivityTypesLegend() {
        return Object.values(this.ACTIVITY_TYPES).map(type => `
            <div class="week-planner-activity-legend" data-color="${type.color}">
                <div class="week-planner-legend-inner">
                    <div class="week-planner-legend-emoji" style="background: ${type.gradient}; box-shadow: 0 4px 12px ${type.color}40;">
                        ${type.emoji}
                    </div>
                    <div class="week-planner-legend-info">
                        <div class="week-planner-legend-label">
                            ${type.label}
                        </div>
                        <div class="week-planner-legend-cal">
                            ${type.calorieAdjustment > 0 ? '+' : ''}${type.calorieAdjustment} kcal
                            ${type.avgBurn ? ` (${type.avgBurn} kcal)` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    /**
     * Render days selon la durée
     * @param planDuration
     */
    renderDaysForDuration(planDuration) {
        if (planDuration === '1day') {
            return this.renderDayCard('Aujourd\'hui', 0);
        }
        return this.DAYS.map((day, index) => this.renderDayCard(day, index)).join('');
    },

    /**
     * Render une carte de jour moderne
     * @param dayName
     * @param dayIndex
     */
    renderDayCard(dayName, dayIndex) {
        return `
            <div class="week-planner-day-card" data-day-index="${dayIndex}">
                <!-- Day header -->
                <div class="week-planner-day-header">
                    <div class="week-planner-day-name">
                        ${dayName}
                    </div>
                </div>

                <!-- Activity options -->
                <div class="week-planner-day-options">
                    ${this.renderActivityOptions(dayIndex)}
                </div>
            </div>
        `;
    },

    /**
     * Options d'activité pour un jour
     * @param dayIndex
     */
    renderActivityOptions(dayIndex) {
        return Object.values(this.ACTIVITY_TYPES).map(type => `
            <button
                class="week-planner-activity-option activity-option-${dayIndex}"
                data-day="${dayIndex}"
                data-type="${type.id}"
                data-color="${type.color}"
                onclick="WeekPlannerModern.selectDayType(${dayIndex}, '${type.id}')"
            >
                <div class="week-planner-option-emoji" style="background: ${type.gradient}; box-shadow: 0 4px 12px ${type.color}40;">
                    ${type.emoji}
                </div>
                <div class="week-planner-option-text">
                    <div class="week-planner-option-label">
                        ${type.label}
                    </div>
                    <div class="week-planner-option-desc">
                        ${type.description}
                    </div>
                </div>
                <div class="week-planner-check-indicator">
                    <i class="fas fa-check"></i>
                </div>
            </button>
        `).join('');
    },

    /**
     * Templates rapides
     */
    renderQuickTemplates() {
        const templates = [
            { id: 'classic', name: 'Classique', icon: '⚖️', desc: '3x Renfo + Repos' },
            { id: 'intense', name: 'Intense', icon: '🔥', desc: '4x Renfo + 2x Cardio' },
            { id: 'endurance', name: 'Endurance', icon: '🏃', desc: '5x Cardio' },
            { id: 'recovery', name: 'Récup', icon: '😴', desc: 'Repos complet' }
        ];

        return `
            <div class="week-planner-templates-section">
                <h4 class="week-planner-templates-title">
                    Templates Rapides
                </h4>
                <div class="week-planner-templates-grid">
                    ${templates.map(t => `
                        <button onclick="WeekPlannerModern.applyTemplate('${t.id}')" class="week-planner-template-btn">
                            <div class="week-planner-template-icon">${t.icon}</div>
                            <div class="week-planner-template-name">
                                ${t.name}
                            </div>
                            <div class="week-planner-template-desc">
                                ${t.desc}
                            </div>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Sélectionner un type d'activité pour un jour
     * @param dayIndex
     * @param activityTypeId
     */
    selectDayType(dayIndex, activityTypeId) {
        this.selectedActivities[dayIndex] = this.ACTIVITY_TYPES[activityTypeId.toUpperCase()];

        // Mettre à jour visuellement
        const buttons = document.querySelectorAll(`.activity-option-${dayIndex}`);
        buttons.forEach(btn => {
            const isSelected = btn.getAttribute('data-type') === activityTypeId;
            const type = this.ACTIVITY_TYPES[btn.getAttribute('data-type').toUpperCase()];

            if (isSelected) {
                btn.classList.add('selected');
                // Dynamic styles - keep these as they use data-driven colors
                btn.style.background = `${type.gradient}`;
                btn.style.borderColor = type.color;
            } else {
                btn.classList.remove('selected');
                btn.style.background = '';
                btn.style.borderColor = '';
            }
        });
    },

    /**
     * Appliquer un template
     * @param templateId
     */
    applyTemplate(templateId) {
        const templates = {
            classic: ['rest', 'training', 'rest', 'training', 'rest', 'training', 'rest'],
            intense: ['training', 'cardio', 'training', 'rest', 'training', 'cardio', 'rest'],
            endurance: ['cardio', 'rest', 'cardio', 'cardio', 'rest', 'cardio', 'cardio'],
            recovery: ['rest', 'rest', 'rest', 'rest', 'rest', 'rest', 'rest']
        };

        const template = templates[templateId];
        if (template) {
            template.forEach((type, index) => {
                this.selectDayType(index, type);
            });
        }
    },

    /**
     * Valider le planning
     */
    validateWeekPlan() {
        const numDays = this.currentPlanDuration === '1day' ? 1 : 7;

        // Vérifier que tous les jours sont configurés
        for (let i = 0; i < numDays; i++) {
            if (!this.selectedActivities[i]) {
                alert(`Veuillez sélectionner une activité pour ${this.currentPlanDuration === '1day' ? 'la journée' : this.DAYS[i]}`);
                return;
            }
        }

        // Construire le config
        const weekConfig = [];
        for (let i = 0; i < numDays; i++) {
            weekConfig.push({
                day: this.currentPlanDuration === '1day' ? 'Aujourd\'hui' : this.DAYS[i],
                activityType: this.selectedActivities[i]
            });
        }

        // Fermer modal
        document.getElementById('weekPlannerModal')?.remove();

        // Callback
        if (this.currentCallback) {
            this.currentCallback(weekConfig);
        }
    },

    /**
     * Obtenir le titre selon la durée
     * @param planDuration
     */
    getPlanningTitle(planDuration) {
        switch(planDuration) {
            case '1day': return 'Planification 1 Jour';
            case '1month': return 'Planification 1 Mois';
            default: return 'Planification Hebdomadaire';
        }
    }
};

// Styles pour les animations
const weekPlannerStyles = document.createElement('style');
weekPlannerStyles.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes scaleIn {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    .week-planner-modern-container::-webkit-scrollbar {
        width: 8px;
    }

    .week-planner-modern-container::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
    }

    .week-planner-modern-container::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        border-radius: 4px;
    }

    .day-card:hover {
        transform: translateY(-4px);
        border-color: rgba(34, 197, 94, 0.5) !important;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 40px rgba(34, 197, 94, 0.2);
    }
`;
document.head.appendChild(weekPlannerStyles);

// Exposer globalement
window.WeekPlannerModern = WeekPlannerModern;

// Override WeekPlanner pour utiliser la version moderne
if (window.WeekPlanner) {
    window.WeekPlanner.showWeekSelector = function(onComplete, planDuration) {
        return WeekPlannerModern.showWeekSelector(onComplete, planDuration);
    };
}
