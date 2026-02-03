/**
 * ÉTAPE 9 : ANALYSE & VALIDATION
 * Récapitulatif, graphiques, validation finale
 */

const ProgrammingStep9 = {
    /**
     * Rendu de l'étape 9
     * @param state
     */
    render(state) {
        const formData = state.formData;
        const athlete = state.athlete || {};
        const stats = this.calculateStats(formData);
        const warnings = this.detectWarnings(formData, stats);

        return `
            <div class="step-container">
                <h2 class="step-title">✅ Récapitulatif & Validation</h2>
                <p class="step-description">Vérifiez votre programme avant génération</p>

                <form class="form-grid" id="step9Form">
                    <!-- Profil Athlète -->
                    <div class="form-section full-width">
                        <h3 class="section-title"><i class="fas fa-user-circle"></i> Profil Athlète</h3>
                        <div class="athlete-profile-card">
                            <div class="athlete-avatar">
                                ${athlete.photo ? `<img src="${athlete.photo}" alt="${athlete.name}">` : '<i class="fas fa-user fa-3x"></i>'}
                            </div>
                            <div class="athlete-info">
                                <h4>${athlete.name || 'Athlète'}</h4>
                                <div class="athlete-stats">
                                    <span><i class="fas fa-trophy"></i> ${this.getSportName(formData.sport)}</span>
                                    <span><i class="fas fa-medal"></i> ${this.getLevelName(formData.current_level)}</span>
                                    <span><i class="fas fa-weight"></i> ${formData.weight_kg}kg</span>
                                    <span><i class="fas fa-birthday-cake"></i> ${formData.age} ans</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Timeline Périodisation -->
                    ${
                        formData.competition_date
                            ? `
                        <div class="form-section full-width">
                            <h3 class="section-title"><i class="fas fa-timeline"></i> Timeline Périodisation</h3>
                            <div class="periodization-timeline">
                                ${this.renderTimeline(formData)}
                            </div>
                        </div>
                    `
                            : ''
                    }

                    <!-- Répartition Qualités Physiques -->
                    ${
                        formData.physical_qualities
                            ? `
                        <div class="form-section full-width">
                            <h3 class="section-title"><i class="fas fa-chart-pie"></i> Répartition Qualités Physiques</h3>
                            <div class="qualities-distribution">
                                <canvas id="qualitiesChartFinal" width="300" height="300"></canvas>
                                <div class="qualities-legend">
                                    ${this.renderQualitiesLegend(formData)}
                                </div>
                            </div>
                        </div>
                    `
                            : ''
                    }

                    <!-- Volume Hebdomadaire -->
                    <div class="form-section full-width">
                        <h3 class="section-title"><i class="fas fa-chart-bar"></i> Volume Hebdomadaire</h3>
                        <div class="volume-stats">
                            <div class="stat-box">
                                <div class="stat-icon">⏱️</div>
                                <div class="stat-label">Volume moyen/semaine</div>
                                <div class="stat-value">${stats.weeklyHours.toFixed(1)}h</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-icon">📅</div>
                                <div class="stat-label">Séances/semaine</div>
                                <div class="stat-value">${formData.sessions_per_week}</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-icon">⏰</div>
                                <div class="stat-label">Durée séance</div>
                                <div class="stat-value">${formData.session_duration}min</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-icon">🗓️</div>
                                <div class="stat-label">Volume total programme</div>
                                <div class="stat-value">${stats.totalHours.toFixed(0)}h</div>
                            </div>
                        </div>
                    </div>

                    <!-- Progression Intensité -->
                    <div class="form-section full-width">
                        <h3 class="section-title"><i class="fas fa-chart-line"></i> Progression Intensité Prévue</h3>
                        <div class="intensity-graph">
                            <canvas id="intensityChart"></canvas>
                        </div>
                    </div>

                    <!-- Indicateurs Clés -->
                    <div class="form-section full-width">
                        <h3 class="section-title"><i class="fas fa-tachometer-alt"></i> Indicateurs Clés</h3>
                        <div class="key-indicators">
                            <div class="indicator">
                                <span class="indicator-label">Durée programme:</span>
                                <span class="indicator-value">${formData.duration_weeks} semaines</span>
                            </div>
                            <div class="indicator">
                                <span class="indicator-label">Date début:</span>
                                <span class="indicator-value">${this.formatDate(formData.start_date)}</span>
                            </div>
                            ${
                                formData.competition_date
                                    ? `
                                <div class="indicator">
                                    <span class="indicator-label">Date compétition:</span>
                                    <span class="indicator-value">${this.formatDate(formData.competition_date)}</span>
                                </div>
                            `
                                    : ''
                            }
                            <div class="indicator">
                                <span class="indicator-label">Type périodisation:</span>
                                <span class="indicator-value">${this.getPeriodizationName(formData.periodization_type)}</span>
                            </div>
                            <div class="indicator">
                                <span class="indicator-label">Fréquence deload:</span>
                                <span class="indicator-value">Toutes les ${formData.deload_frequency || 4} semaines</span>
                            </div>
                            <div class="indicator">
                                <span class="indicator-label">Matériel:</span>
                                <span class="indicator-value">${this.getEquipmentName(formData.equipment_access)}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Zones d'alerte -->
                    ${
                        warnings.length > 0
                            ? `
                        <div class="form-section full-width">
                            <h3 class="section-title"><i class="fas fa-exclamation-triangle"></i> Zones d'alerte</h3>
                            <div class="warnings-list">
                                ${warnings
                                    .map(
                                        warning => `
                                    <div class="warning-item ${warning.severity}">
                                        <i class="fas fa-${warning.icon}"></i>
                                        <span>${warning.message}</span>
                                    </div>
                                `
                                    )
                                    .join('')}
                            </div>
                        </div>
                    `
                            : `
                        <div class="form-section full-width">
                            <div class="success-box">
                                <i class="fas fa-check-circle"></i>
                                <p><strong>Programme optimisé !</strong> Aucune zone d'alerte détectée.</p>
                            </div>
                        </div>
                    `
                    }

                    <!-- Validation finale -->
                    <div class="form-section full-width">
                        <h3 class="section-title"><i class="fas fa-clipboard-check"></i> Validation Finale</h3>
                        <div class="validation-checklist">
                            <label class="validation-item">
                                <input type="checkbox" name="validation_reviewed" required>
                                <span class="validation-text">
                                    <i class="fas fa-check"></i>
                                    J'ai relu toutes les informations et elles sont correctes
                                </span>
                            </label>
                            <label class="validation-item">
                                <input type="checkbox" name="validation_understand" required>
                                <span class="validation-text">
                                    <i class="fas fa-check"></i>
                                    Je comprends les phases du programme et leurs objectifs
                                </span>
                            </label>
                            <label class="validation-item">
                                <input type="checkbox" name="validation_commitment" required>
                                <span class="validation-text">
                                    <i class="fas fa-check"></i>
                                    Je m'engage à suivre le programme avec sérieux
                                </span>
                            </label>
                            ${
                                formData.current_injuries || formData.pain_intensity >= 5
                                    ? `
                                <label class="validation-item">
                                    <input type="checkbox" name="validation_medical" required>
                                    <span class="validation-text">
                                        <i class="fas fa-check"></i>
                                        J'ai consulté un professionnel de santé concernant mes limitations
                                    </span>
                                </label>
                            `
                                    : ''
                            }
                        </div>
                    </div>

                    <!-- Bouton génération -->
                    <div class="form-section full-width">
                        <button type="submit" class="btn-primary-large">
                            <i class="fas fa-rocket"></i>
                            Générer mon Programme Pro
                        </button>
                        <p class="generation-note">
                            <i class="fas fa-info-circle"></i>
                            Génération avec Claude Haiku 3.5 - Durée estimée: 30-60 secondes
                        </p>
                    </div>
                </form>
            </div>
        `;
    },

    /**
     * Calcul statistiques
     * @param formData
     */
    calculateStats(formData) {
        const sessionsPerWeek = parseInt(formData.sessions_per_week || 0);
        const sessionDuration = parseInt(formData.session_duration || 0);
        const durationWeeks = parseInt(formData.duration_weeks || 0);

        const weeklyHours = (sessionsPerWeek * sessionDuration) / 60;
        const totalHours = weeklyHours * durationWeeks;

        return {
            weeklyHours,
            totalHours,
            sessionsPerWeek,
            sessionDuration,
            durationWeeks
        };
    },

    /**
     * Détection zones d'alerte
     * @param formData
     * @param stats
     */
    detectWarnings(formData, stats) {
        const warnings = [];

        // Volume très élevé
        if (stats.weeklyHours > 15) {
            warnings.push({
                severity: 'warning',
                icon: 'exclamation-triangle',
                message: `Volume très élevé (${stats.weeklyHours.toFixed(1)}h/semaine). Risque de surmenage.`
            });
        }

        // Progression trop rapide
        if (formData.current_level === 'beginner' && stats.weeklyHours > 8) {
            warnings.push({
                severity: 'warning',
                icon: 'exclamation-triangle',
                message: 'Volume élevé pour un débutant. Privilégier progression graduelle.'
            });
        }

        // Récupération insuffisante
        if (formData.sleep_hours <= 6 && stats.weeklyHours > 10) {
            warnings.push({
                severity: 'danger',
                icon: 'moon',
                message:
                    "Sommeil insuffisant pour ce volume d'entraînement. Risque de fatigue chronique."
            });
        }

        // Stress élevé
        if (formData.stress_level >= 8 && stats.weeklyHours > 10) {
            warnings.push({
                severity: 'warning',
                icon: 'brain',
                message:
                    'Niveau de stress élevé combiné à volume important. Monitorer fatigue nerveuse.'
            });
        }

        // Manque données physiologiques
        const hasPerfData =
            formData.vma || formData.ftp_watts || formData.squat_1rm || formData.vo2max;
        if (!hasPerfData) {
            warnings.push({
                severity: 'info',
                icon: 'info-circle',
                message:
                    "Peu de données de performance. L'IA estimera votre niveau à partir des infos disponibles."
            });
        }

        // Blessures + volume élevé
        if (formData.current_injuries && stats.weeklyHours > 10) {
            warnings.push({
                severity: 'danger',
                icon: 'band-aid',
                message: 'Blessures actuelles + volume élevé. Adapter le programme en conséquence.'
            });
        }

        return warnings;
    },

    /**
     * Rendu timeline périodisation
     * @param formData
     */
    renderTimeline(formData) {
        const phases = [];

        if (formData.ppg_weeks) {
            phases.push({
                name: 'PPG',
                weeks: parseInt(formData.ppg_weeks),
                color: '#4CAF50'
            });
        }
        if (formData.ppo_weeks) {
            phases.push({
                name: 'PPO',
                weeks: parseInt(formData.ppo_weeks),
                color: '#2196F3'
            });
        }
        if (formData.pps_weeks) {
            phases.push({
                name: 'PPS',
                weeks: parseInt(formData.pps_weeks),
                color: '#FF9800'
            });
        }
        if (formData.competition_date) {
            phases.push({
                name: 'Compétition',
                weeks: 1,
                color: '#F44336'
            });
        }

        const totalWeeks = phases.reduce((sum, p) => sum + p.weeks, 0);

        return phases
            .map(phase => {
                const widthPercent = (phase.weeks / totalWeeks) * 100;
                return `
                <div class="timeline-phase" style="width: ${widthPercent}%; background: ${phase.color}">
                    <div class="phase-name">${phase.name}</div>
                    <div class="phase-duration">${phase.weeks}sem</div>
                </div>
            `;
            })
            .join('');
    },

    /**
     * Rendu légende qualités
     * @param formData
     */
    renderQualitiesLegend(formData) {
        const qualities = formData.physical_qualities ? formData.physical_qualities.split(',') : [];
        return qualities
            .map(quality => {
                const percent = formData[`quality_percent_${quality}`] || 0;
                return `
                <div class="legend-item">
                    <span class="legend-color" style="background: ${this.getQualityColor(quality)}"></span>
                    <span class="legend-label">${this.getQualityShortName(quality)}</span>
                    <span class="legend-value">${percent}%</span>
                </div>
            `;
            })
            .join('');
    },

    /**
     * Helpers
     * @param sportId
     */
    getSportName(sportId) {
        const names = {
            running: 'Course à pied',
            trail: 'Trail',
            ultratrail: 'Ultra-trail',
            cyclisme: 'Cyclisme',
            crossfit: 'CrossFit',
            hyrox: 'HYROX',
            musculation: 'Musculation',
            natation: 'Natation',
            football: 'Football',
            rugby: 'Rugby',
            basketball: 'Basketball'
        };
        return names[sportId] || sportId;
    },

    getLevelName(level) {
        const names = {
            beginner: 'Débutant',
            intermediate: 'Intermédiaire',
            advanced: 'Avancé',
            elite: 'Élite'
        };
        return names[level] || level;
    },

    getPeriodizationName(type) {
        const names = {
            linear: 'Linéaire',
            dup: 'Ondulatoire Journalière',
            wup: 'Ondulatoire Hebdomadaire',
            block: 'Par Blocs',
            conjugate: 'Conjuguée',
            autoregulated: 'Auto-Régulée'
        };
        return names[type] || type;
    },

    getEquipmentName(equipment) {
        const names = {
            'full-gym': 'Salle complète',
            'basic-gym': 'Salle basique',
            minimal: 'Minimaliste',
            bodyweight: 'Poids du corps',
            'home-custom': 'Domicile personnalisé'
        };
        return names[equipment] || equipment;
    },

    getQualityColor(quality) {
        const colors = {
            'force-max': '#E91E63',
            puissance: '#9C27B0',
            explosivite: '#FF5722',
            vitesse: '#FF9800',
            'endurance-aerobie': '#2196F3',
            'endurance-anaerobie': '#F44336',
            'force-endurance': '#4CAF50',
            hypertrophie: '#3F51B5',
            mobilite: '#00BCD4'
        };
        return colors[quality] || '#999';
    },

    getQualityShortName(quality) {
        const names = {
            'force-max': 'Force Max',
            puissance: 'Puissance',
            explosivite: 'Explosivité',
            vitesse: 'Vitesse',
            'endurance-aerobie': 'Endurance Aéro',
            'endurance-anaerobie': 'Endurance Anaéro',
            'force-endurance': 'Force-Endurance',
            hypertrophie: 'Hypertrophie',
            mobilite: 'Mobilité'
        };
        return names[quality] || quality;
    },

    formatDate(dateStr) {
        if (!dateStr) {
            return '';
        }
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    },

    /**
     * Validation de l'étape
     * @param formData
     */
    validate(formData) {
        const errors = [];

        if (!formData.validation_reviewed) {
            errors.push('Veuillez confirmer avoir relu toutes les informations');
        }

        if (!formData.validation_understand) {
            errors.push('Veuillez confirmer avoir compris les phases du programme');
        }

        if (!formData.validation_commitment) {
            errors.push('Veuillez confirmer votre engagement à suivre le programme');
        }

        if (
            (formData.current_injuries || formData.pain_intensity >= 5) &&
            !formData.validation_medical
        ) {
            errors.push('Veuillez confirmer avoir consulté un professionnel de santé');
        }

        return errors;
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgrammingStep9;
} else {
    window.ProgrammingStep9 = ProgrammingStep9;
}
