/**
 * NUTRITION PLAN V4 - MODERN UI
 * Version moderne de l'interface de preview des profils
 */

const NutritionPlanV4Modern = {
    /**
     * Afficher la preview moderne des 3 profils
     * @param profilesData
     */
    showModernProfilesPreview(profilesData) {
        const { profiles, weeklyAverage, baseBMR, baseTDEE, weekConfig } = profilesData;
        const totalDays = this.currentPlanData.totalDays || 7;
        const durationLabel = totalDays === 1 ? '1 jour' : totalDays === 7 ? '1 semaine' : '1 mois';

        const html = `
            <div class="nutrition-modern-container">
                <!-- Header -->
                <div class="nutrition-header nutrition-animate-in">
                    <div class="nutrition-header-content">
                        <div class="nutrition-header-title">
                            <button onclick="NutritionProModernUI.showMainView()" class="nutrition-btn nutrition-btn-ghost" style="width: 56px; height: 56px; padding: 0;">
                                <i class="fas fa-arrow-left" style="font-size: 20px;"></i>
                            </button>
                            <div class="nutrition-header-text">
                                <h1>Plan ${durationLabel} - ${this.currentMember.name}</h1>
                                <p>3 profils personnalisés selon votre planning</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Statistiques métabolisme -->
                <div class="nutrition-card nutrition-animate-in" style="margin-bottom: 24px;">
                    <div class="nutrition-stats">
                        <div class="nutrition-stat-card">
                            <div class="nutrition-stat-value" style="background: var(--gradient-blue); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                                ${baseBMR}
                            </div>
                            <div class="nutrition-stat-label">BMR (Repos total)</div>
                        </div>
                        <div class="nutrition-stat-card">
                            <div class="nutrition-stat-value" style="background: var(--gradient-orange); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                                ${baseTDEE}
                            </div>
                            <div class="nutrition-stat-label">TDEE (Activité normale)</div>
                        </div>
                        <div class="nutrition-stat-card">
                            <div class="nutrition-stat-value" style="background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                                ${weeklyAverage}
                            </div>
                            <div class="nutrition-stat-label">Moyenne hebdomadaire</div>
                        </div>
                    </div>
                </div>

                <!-- Les 3 profils -->
                <div class="nutrition-grid nutrition-animate-in">
                    ${NutritionPlanV4Modern.renderModernProfile(profiles.rest, weekConfig, 'rest', '😴')}
                    ${NutritionPlanV4Modern.renderModernProfile(profiles.training, weekConfig, 'training', '💪')}
                    ${NutritionPlanV4Modern.renderModernProfile(profiles.cardio, weekConfig, 'cardio', '🏃')}
                </div>

                <!-- Planning hebdomadaire -->
                <div class="nutrition-card nutrition-animate-in" style="margin-top: 24px;">
                    <div class="nutrition-card-header">
                        <div class="nutrition-card-icon" style="background: var(--gradient-purple);">
                            <i class="fas fa-calendar-week"></i>
                        </div>
                        <div class="nutrition-card-title">
                            <h3>${totalDays === 1 ? 'Votre journée' : totalDays === 30 ? 'Semaine type (répétée sur 30 jours)' : 'Planning hebdomadaire'}</h3>
                            <p>Répartition de vos journées selon le type d'activité</p>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px;">
                        ${weekConfig.map(day => NutritionPlanV4Modern.renderModernWeekDay(day, profiles)).join('')}
                    </div>

                    ${totalDays === 30 ? `
                        <div style="margin-top: 16px; padding: 16px; background: rgba(59, 130, 246, 0.1); border-radius: 12px; text-align: center;">
                            <i class="fas fa-info-circle" style="color: #3b82f6; margin-right: 8px;"></i>
                            <span style="color: var(--text-secondary); font-size: 13px;">Cette semaine type sera répétée pendant 30 jours</span>
                        </div>
                    ` : ''}
                </div>

                <!-- Actions -->
                <div style="display: flex; gap: 12px; margin-top: 24px;" class="nutrition-animate-in">
                    <button onclick="NutritionPlanV4.generateMealPlan()" class="nutrition-btn nutrition-btn-primary" style="flex: 1;">
                        <i class="fas fa-magic"></i>
                        <span>Générer les repas (${totalDays} jour${totalDays > 1 ? 's' : ''})</span>
                    </button>
                    <button onclick="WeekPlanner.showWeekSelector((config) => NutritionPlanV4.onWeekConfigSelected(config), NutritionPlanV4.currentPlanData.planDuration)"
                            class="nutrition-btn nutrition-btn-secondary">
                        <i class="fas fa-edit"></i>
                        <span>Modifier planning</span>
                    </button>
                </div>
            </div>
        `;

        const contentEl = document.getElementById('mainContent') || document.querySelector('#mainApp');
        if (contentEl) {
            contentEl.innerHTML = html;
            // CSS chargé globalement via nutrition-pro-gorilla.css
        }
    },

    /**
     * Rendre un profil moderne
     * @param profile
     * @param weekConfig
     * @param profileType
     * @param emoji
     */
    renderModernProfile(profile, weekConfig, profileType, emoji) {
        const daysCount = weekConfig.filter(d => {
            if (profile.label === 'REPOS') {return d.activityType.id === 'rest';}
            if (profile.label === 'CARDIO') {return d.activityType.id === 'cardio';}
            return d.activityType.id === 'training';
        }).length;

        return `
            <div class="nutrition-profile-card profile-${profileType}">
                <!-- Icône -->
                <div class="nutrition-profile-icon">
                    ${emoji}
                </div>

                <!-- Label -->
                <div class="nutrition-profile-label">
                    <h3>${profile.label}</h3>
                    <p>${profile.description}</p>
                    <div style="margin-top: 8px;">
                        <span class="nutrition-badge nutrition-badge-${profileType === 'rest' ? 'info' : profileType === 'training' ? 'warning' : 'danger'}">
                            ${daysCount} jour${daysCount > 1 ? 's' : ''} / semaine
                        </span>
                    </div>
                </div>

                <!-- Calories -->
                <div class="nutrition-profile-calories">
                    <div class="nutrition-profile-calories-value">
                        ${profile.calories}
                    </div>
                    <div class="nutrition-profile-calories-label">
                        Calories
                    </div>
                    ${profile.burn > 0 ? `
                        <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
                            ~${profile.burn} kcal dépensées
                        </div>
                    ` : ''}
                </div>

                <!-- Macros -->
                <div class="nutrition-profile-macros">
                    <div class="nutrition-profile-macro">
                        <div class="nutrition-profile-macro-value">${profile.macros.protein.grams}g</div>
                        <div class="nutrition-profile-macro-label">Protéines</div>
                        <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">
                            ${profile.macros.protein.percent}%
                        </div>
                    </div>
                    <div class="nutrition-profile-macro">
                        <div class="nutrition-profile-macro-value">${profile.macros.carbs.grams}g</div>
                        <div class="nutrition-profile-macro-label">Glucides</div>
                        <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">
                            ${profile.macros.carbs.percent}%
                        </div>
                    </div>
                    <div class="nutrition-profile-macro">
                        <div class="nutrition-profile-macro-value">${profile.macros.fats.grams}g</div>
                        <div class="nutrition-profile-macro-label">Lipides</div>
                        <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">
                            ${profile.macros.fats.percent}%
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Rendre un jour de la semaine moderne
     * @param day
     * @param profiles
     */
    renderModernWeekDay(day, profiles) {
        const profile = profiles[day.activityType.id === 'rest' ? 'rest' :
            day.activityType.id === 'cardio' ? 'cardio' : 'training'];

        const colorMap = {
            rest: '#3b82f6',
            training: '#f59e0b',
            cardio: '#ef4444'
        };

        const color = colorMap[day.activityType.id] || colorMap.training;

        return `
            <div style="
                background: rgba(30, 41, 59, 0.6);
                backdrop-filter: blur(10px);
                border: 2px solid ${color}33;
                border-radius: 16px;
                padding: 16px;
                text-align: center;
                transition: all 0.3s;
            " onmouseover="this.style.transform='translateY(-4px)'; this.style.borderColor='${color}'" onmouseout="this.style.transform=''; this.style.borderColor='${color}33'">
                <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">
                    ${day.day.substring(0, 3)}
                </div>
                <div style="font-size: 28px; margin-bottom: 8px;">
                    ${day.activityType.id === 'rest' ? '😴' : day.activityType.id === 'cardio' ? '🏃' : '💪'}
                </div>
                <div style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">
                    ${profile.calories}
                </div>
                <div style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">
                    kcal
                </div>
            </div>
        `;
    }
};

// Exposer globalement
window.NutritionPlanV4Modern = NutritionPlanV4Modern;
