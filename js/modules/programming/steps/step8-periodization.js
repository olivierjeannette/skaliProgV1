/**
 * ÉTAPE 8 : PÉRIODISATION & STRUCTURE AVANCÉE
 * Type de périodisation, phases, tests, deloads
 */

const ProgrammingStep8 = {
    /**
     * Rendu de l'étape 8
     * @param state
     */
    render(state) {
        const formData = state.formData;
        const hasCompetitionDate = !!formData.competition_date;

        return `
            <div class="step-container">
                <h2 class="step-title">📊 Périodisation & Structure</h2>
                <p class="step-description">Structure avancée de votre programme d'entraînement</p>

                <form class="form-grid" id="step8Form">
                    <!-- Type de périodisation -->
                    <div class="form-section full-width">
                        <h3 class="section-title"><i class="fas fa-project-diagram"></i> Type de périodisation</h3>
                        <div class="periodization-cards-grid">
                            <label class="periodization-card ${formData.periodization_type === 'linear' ? 'selected' : ''}"
                                   onclick="ProgrammingPro.selectPeriodization('linear')">
                                <input type="radio"
                                       name="periodization_type"
                                       value="linear"
                                       ${formData.periodization_type === 'linear' ? 'checked' : ''}
                                       style="display:none">
                                <div class="period-icon">📈</div>
                                <div class="period-name">Linéaire</div>
                                <div class="period-desc">Progression continue de la charge</div>
                            </label>

                            <label class="periodization-card ${formData.periodization_type === 'dup' ? 'selected' : ''}"
                                   onclick="ProgrammingPro.selectPeriodization('dup')">
                                <input type="radio"
                                       name="periodization_type"
                                       value="dup"
                                       ${formData.periodization_type === 'dup' ? 'checked' : ''}
                                       style="display:none">
                                <div class="period-icon">🔄</div>
                                <div class="period-name">Ondulatoire Journalière (DUP)</div>
                                <div class="period-desc">Variation intensité chaque séance</div>
                            </label>

                            <label class="periodization-card ${formData.periodization_type === 'wup' ? 'selected' : ''}"
                                   onclick="ProgrammingPro.selectPeriodization('wup')">
                                <input type="radio"
                                       name="periodization_type"
                                       value="wup"
                                       ${formData.periodization_type === 'wup' ? 'checked' : ''}
                                       style="display:none">
                                <div class="period-icon">📊</div>
                                <div class="period-name">Ondulatoire Hebdomadaire (WUP)</div>
                                <div class="period-desc">Variation intensité chaque semaine</div>
                            </label>

                            <label class="periodization-card ${formData.periodization_type === 'block' ? 'selected' : ''}"
                                   onclick="ProgrammingPro.selectPeriodization('block')">
                                <input type="radio"
                                       name="periodization_type"
                                       value="block"
                                       ${formData.periodization_type === 'block' ? 'checked' : ''}
                                       style="display:none">
                                <div class="period-icon">🧱</div>
                                <div class="period-name">Par Blocs</div>
                                <div class="period-desc">Accumulation → Intensification</div>
                            </label>

                            <label class="periodization-card ${formData.periodization_type === 'conjugate' ? 'selected' : ''}"
                                   onclick="ProgrammingPro.selectPeriodization('conjugate')">
                                <input type="radio"
                                       name="periodization_type"
                                       value="conjugate"
                                       ${formData.periodization_type === 'conjugate' ? 'checked' : ''}
                                       style="display:none">
                                <div class="period-icon">⚡</div>
                                <div class="period-name">Conjuguée (Westside)</div>
                                <div class="period-desc">Max effort + Dynamic effort</div>
                            </label>

                            <label class="periodization-card ${formData.periodization_type === 'autoregulated' ? 'selected' : ''}"
                                   onclick="ProgrammingPro.selectPeriodization('autoregulated')">
                                <input type="radio"
                                       name="periodization_type"
                                       value="autoregulated"
                                       ${formData.periodization_type === 'autoregulated' ? 'checked' : ''}
                                       style="display:none">
                                <div class="period-icon">🎯</div>
                                <div class="period-name">Auto-Régulée</div>
                                <div class="period-desc">Ajustement selon état de forme</div>
                            </label>
                        </div>
                    </div>

                    <!-- Structure phases (si date compétition) -->
                    ${
                        hasCompetitionDate
                            ? `
                        <div class="form-section full-width">
                            <h3 class="section-title"><i class="fas fa-layer-group"></i> Structure des phases (vers compétition)</h3>
                            <div class="info-box info">
                                <i class="fas fa-info-circle"></i>
                                <p>Périodisation automatique basée sur la date de compétition</p>
                            </div>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label class="form-label">
                                        <i class="fas fa-chart-area"></i>
                                        PPG (Préparation Physique Générale)
                                    </label>
                                    <input type="number"
                                           name="ppg_weeks"
                                           class="form-input"
                                           value="${formData.ppg_weeks || this.calculatePPGWeeks(formData)}"
                                           placeholder="6"
                                           min="2">
                                    <small class="form-help">semaines (40-50% durée totale)</small>
                                </div>

                                <div class="form-group">
                                    <label class="form-label">
                                        <i class="fas fa-bullseye"></i>
                                        PPO (Préparation Physique Orientée)
                                    </label>
                                    <input type="number"
                                           name="ppo_weeks"
                                           class="form-input"
                                           value="${formData.ppo_weeks || this.calculatePPOWeeks(formData)}"
                                           placeholder="4"
                                           min="2">
                                    <small class="form-help">semaines (30-40% durée totale)</small>
                                </div>

                                <div class="form-group">
                                    <label class="form-label">
                                        <i class="fas fa-trophy"></i>
                                        PPS (Préparation Physique Spécifique)
                                    </label>
                                    <input type="number"
                                           name="pps_weeks"
                                           class="form-input"
                                           value="${formData.pps_weeks || this.calculatePPSWeeks(formData)}"
                                           placeholder="2"
                                           min="1">
                                    <small class="form-help">semaines (15-25% durée totale)</small>
                                </div>

                                <div class="form-group">
                                    <label class="form-label">
                                        <i class="fas fa-arrow-down"></i>
                                        Tapering (affûtage)
                                    </label>
                                    <input type="number"
                                           name="tapering_days"
                                           class="form-input"
                                           value="${formData.tapering_days || 7}"
                                           placeholder="7"
                                           min="3"
                                           max="14">
                                    <small class="form-help">jours avant compétition</small>
                                </div>
                            </div>
                        </div>
                    `
                            : ''
                    }

                    <!-- Tests & Évaluations -->
                    <div class="form-section full-width">
                        <h3 class="section-title"><i class="fas fa-clipboard-check"></i> Tests & Évaluations</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-calendar-week"></i>
                                    Fréquence des tests
                                </label>
                                <select name="test_frequency" class="form-select">
                                    <option value="2" ${formData.test_frequency == 2 ? 'selected' : ''}>Toutes les 2 semaines</option>
                                    <option value="3" ${formData.test_frequency == 3 ? 'selected' : ''}>Toutes les 3 semaines</option>
                                    <option value="4" ${formData.test_frequency == 4 ? 'selected' : ''}>Toutes les 4 semaines ⭐</option>
                                    <option value="6" ${formData.test_frequency == 6 ? 'selected' : ''}>Toutes les 6 semaines</option>
                                    <option value="0" ${formData.test_frequency == 0 ? 'selected' : ''}>Pas de tests planifiés</option>
                                </select>
                            </div>

                            <div class="form-group full-width">
                                <label class="form-label">
                                    <i class="fas fa-tasks"></i>
                                    Types de tests à inclure
                                </label>
                                <div class="tests-checkbox-grid">
                                    <label class="test-checkbox">
                                        <input type="checkbox"
                                               name="test_1rm"
                                               ${formData.test_1rm ? 'checked' : ''}>
                                        <span class="checkbox-label">1RM (Force max)</span>
                                    </label>
                                    <label class="test-checkbox">
                                        <input type="checkbox"
                                               name="test_vma"
                                               ${formData.test_vma ? 'checked' : ''}>
                                        <span class="checkbox-label">VMA</span>
                                    </label>
                                    <label class="test-checkbox">
                                        <input type="checkbox"
                                               name="test_ftp"
                                               ${formData.test_ftp ? 'checked' : ''}>
                                        <span class="checkbox-label">FTP</span>
                                    </label>
                                    <label class="test-checkbox">
                                        <input type="checkbox"
                                               name="test_bodycomp"
                                               ${formData.test_bodycomp ? 'checked' : ''}>
                                        <span class="checkbox-label">Composition corporelle</span>
                                    </label>
                                    <label class="test-checkbox">
                                        <input type="checkbox"
                                               name="test_mobility"
                                               ${formData.test_mobility ? 'checked' : ''}>
                                        <span class="checkbox-label">Mobilité</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Deload & Récupération -->
                    <div class="form-section full-width">
                        <h3 class="section-title"><i class="fas fa-battery-quarter"></i> Deload & Récupération</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-redo"></i>
                                    Fréquence deload
                                </label>
                                <select name="deload_frequency" class="form-select">
                                    <option value="3" ${formData.deload_frequency == 3 ? 'selected' : ''}>Toutes les 3 semaines</option>
                                    <option value="4" ${formData.deload_frequency == 4 ? 'selected' : ''}>Toutes les 4 semaines ⭐</option>
                                    <option value="5" ${formData.deload_frequency == 5 ? 'selected' : ''}>Toutes les 5 semaines</option>
                                    <option value="6" ${formData.deload_frequency == 6 ? 'selected' : ''}>Toutes les 6 semaines</option>
                                    <option value="0" ${formData.deload_frequency == 0 ? 'selected' : ''}>Pas de deload planifié</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-sliders-h"></i>
                                    Type de deload
                                </label>
                                <select name="deload_type" class="form-select">
                                    <option value="volume" ${formData.deload_type === 'volume' ? 'selected' : ''}>Volume réduit 40% ⭐</option>
                                    <option value="intensity" ${formData.deload_type === 'intensity' ? 'selected' : ''}>Intensité réduite</option>
                                    <option value="complete" ${formData.deload_type === 'complete' ? 'selected' : ''}>Récupération complète</option>
                                    <option value="active" ${formData.deload_type === 'active' ? 'selected' : ''}>Récupération active</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-pause"></i>
                                    Semaines OFF complètes
                                </label>
                                <select name="weeks_off" class="form-select">
                                    <option value="0" ${formData.weeks_off == 0 ? 'selected' : ''}>Aucune</option>
                                    <option value="1" ${formData.weeks_off == 1 ? 'selected' : ''}>1 semaine</option>
                                    <option value="2" ${formData.weeks_off == 2 ? 'selected' : ''}>2 semaines</option>
                                </select>
                                <small class="form-help">À positionner à mi-parcours ou fin programme</small>
                            </div>
                        </div>
                    </div>

                    <!-- Cycles d'entraînement -->
                    <div class="form-section full-width">
                        <h3 class="section-title"><i class="fas fa-sync"></i> Cycles d'entraînement</h3>
                        <div class="cycles-info">
                            <div class="cycle-box">
                                <div class="cycle-label">Microcycle</div>
                                <div class="cycle-value">7 jours</div>
                                <div class="cycle-desc">Semaine classique</div>
                            </div>
                            <div class="cycle-box">
                                <div class="cycle-label">Mésocycle</div>
                                <div class="cycle-value">${formData.deload_frequency || 4} semaines</div>
                                <div class="cycle-desc">Bloc entre deloads</div>
                            </div>
                            <div class="cycle-box">
                                <div class="cycle-label">Macrocycle</div>
                                <div class="cycle-value">${formData.duration_weeks || '?'} semaines</div>
                                <div class="cycle-desc">Durée totale programme</div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        `;
    },

    /**
     * Calcul automatique PPG
     * @param formData
     */
    calculatePPGWeeks(formData) {
        const totalWeeks = parseInt(formData.duration_weeks || 12);
        return Math.floor(totalWeeks * 0.45); // 45% de la durée
    },

    /**
     * Calcul automatique PPO
     * @param formData
     */
    calculatePPOWeeks(formData) {
        const totalWeeks = parseInt(formData.duration_weeks || 12);
        return Math.floor(totalWeeks * 0.35); // 35% de la durée
    },

    /**
     * Calcul automatique PPS
     * @param formData
     */
    calculatePPSWeeks(formData) {
        const totalWeeks = parseInt(formData.duration_weeks || 12);
        return Math.floor(totalWeeks * 0.2); // 20% de la durée
    },

    /**
     * Validation de l'étape
     * @param formData
     */
    validate(formData) {
        const errors = [];

        if (!formData.periodization_type) {
            errors.push('Veuillez sélectionner un type de périodisation');
        }

        // Si date compétition, vérifier cohérence phases
        if (formData.competition_date) {
            const ppg = parseInt(formData.ppg_weeks || 0);
            const ppo = parseInt(formData.ppo_weeks || 0);
            const pps = parseInt(formData.pps_weeks || 0);
            const total = parseInt(formData.duration_weeks || 0);

            if (ppg + ppo + pps > total) {
                errors.push(
                    `Total phases (PPG+PPO+PPS=${ppg + ppo + pps}) dépasse la durée du programme (${total} semaines)`
                );
            }
        }

        return errors;
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgrammingStep8;
} else {
    window.ProgrammingStep8 = ProgrammingStep8;
}
