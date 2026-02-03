/**
 * ÉTAPE 2 : DONNÉES PHYSIOLOGIQUES COMPLÈTES
 * Auto-remplissage depuis profil + données sport-spécifiques
 */

const ProgrammingStep2 = {
    /**
     * Rendu de l'étape 2
     * @param state
     */
    render(state) {
        const athlete = state.athlete || {};
        const sport = state.formData.sport;
        const formData = state.formData;

        return `
            <div class="step-container">
                <h2 class="step-title">📊 Données Physiologiques</h2>
                <p class="step-description">Informations corporelles et performances sportives</p>

                <form class="form-grid" id="step2Form">
                    <!-- Données de base (auto-remplies) -->
                    <div class="form-section full-width">
                        <h3 class="section-title"><i class="fas fa-user"></i> Profil de base</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label required">
                                    <i class="fas fa-weight"></i> Poids
                                </label>
                                <input type="number"
                                       name="weight_kg"
                                       class="form-input"
                                       value="${formData.weight_kg || athlete.weight_kg || ''}"
                                       placeholder="70"
                                       step="0.1"
                                       required>
                                <small class="form-help">kg</small>
                            </div>

                            <div class="form-group">
                                <label class="form-label required">
                                    <i class="fas fa-ruler-vertical"></i> Taille
                                </label>
                                <input type="number"
                                       name="height_cm"
                                       class="form-input"
                                       value="${formData.height_cm || athlete.height_cm || ''}"
                                       placeholder="175"
                                       required>
                                <small class="form-help">cm</small>
                            </div>

                            <div class="form-group">
                                <label class="form-label required">
                                    <i class="fas fa-birthday-cake"></i> Âge
                                </label>
                                <input type="number"
                                       name="age"
                                       class="form-input"
                                       value="${formData.age || athlete.age || ''}"
                                       placeholder="30"
                                       required>
                                <small class="form-help">ans</small>
                            </div>

                            <div class="form-group">
                                <label class="form-label required">
                                    <i class="fas fa-venus-mars"></i> Sexe
                                </label>
                                <select name="sex" class="form-select" required>
                                    <option value="male" ${(formData.sex || athlete.sex) === 'male' ? 'selected' : ''}>Homme</option>
                                    <option value="female" ${(formData.sex || athlete.sex) === 'female' ? 'selected' : ''}>Femme</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-percentage"></i> % Masse grasse
                                </label>
                                <input type="number"
                                       name="bodyfat_percent"
                                       class="form-input"
                                       value="${formData.bodyfat_percent || ''}"
                                       placeholder="15"
                                       step="0.1">
                                <small class="form-help">Optionnel - si connu</small>
                            </div>

                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-heartbeat"></i> FCmax
                                </label>
                                <input type="number"
                                       name="hr_max"
                                       class="form-input"
                                       value="${formData.hr_max || this.estimateHRMax(formData.age || athlete.age)}"
                                       placeholder="190">
                                <small class="form-help">bpm (calcul auto: 220 - âge)</small>
                            </div>

                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-heart"></i> FC repos
                                </label>
                                <input type="number"
                                       name="hr_rest"
                                       class="form-input"
                                       value="${formData.hr_rest || ''}"
                                       placeholder="60">
                                <small class="form-help">bpm (optionnel)</small>
                            </div>
                        </div>
                    </div>

                    <!-- Données sport-spécifiques -->
                    ${this.renderSportSpecificData(sport, formData)}
                </form>
            </div>
        `;
    },

    /**
     * Rendu données sport-spécifiques
     * @param sport
     * @param formData
     */
    renderSportSpecificData(sport, formData) {
        switch (sport) {
            case 'running':
            case 'trail':
            case 'ultratrail':
                return this.renderRunningData(formData);
            case 'cyclisme':
                return this.renderCyclingData(formData);
            case 'crossfit':
            case 'hyrox':
            case 'musculation':
                return this.renderStrengthData(formData);
            case 'natation':
                return this.renderSwimmingData(formData);
            case 'football':
            case 'rugby':
            case 'basketball':
            case 'handball':
                return this.renderTeamSportsData(formData);
            default:
                return this.renderGeneralData(formData);
        }
    },

    /**
     * Données course à pied / trail
     * @param formData
     */
    renderRunningData(formData) {
        return `
            <div class="form-section full-width">
                <h3 class="section-title"><i class="fas fa-running"></i> Performances Course</h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-tachometer-alt"></i> VMA
                        </label>
                        <input type="number"
                               name="vma"
                               class="form-input"
                               value="${formData.vma || ''}"
                               placeholder="16"
                               step="0.1">
                        <small class="form-help">km/h (test VAMEVAL/Cooper)</small>
                    </div>

                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-lungs"></i> VO2max
                        </label>
                        <input type="number"
                               name="vo2max"
                               class="form-input"
                               value="${formData.vo2max || ''}"
                               placeholder="55"
                               step="0.1">
                        <small class="form-help">ml/kg/min</small>
                    </div>

                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-chart-line"></i> Seuil lactique
                        </label>
                        <input type="number"
                               name="lactate_threshold"
                               class="form-input"
                               value="${formData.lactate_threshold || ''}"
                               placeholder="85"
                               step="0.1">
                        <small class="form-help">% FCmax ou km/h</small>
                    </div>

                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-shoe-prints"></i> Économie de course
                        </label>
                        <select name="running_economy" class="form-select">
                            <option value="">Non testé</option>
                            <option value="poor" ${formData.running_economy === 'poor' ? 'selected' : ''}>Faible</option>
                            <option value="average" ${formData.running_economy === 'average' ? 'selected' : ''}>Moyenne</option>
                            <option value="good" ${formData.running_economy === 'good' ? 'selected' : ''}>Bonne</option>
                            <option value="excellent" ${formData.running_economy === 'excellent' ? 'selected' : ''}>Excellente</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Données cyclisme
     * @param formData
     */
    renderCyclingData(formData) {
        return `
            <div class="form-section full-width">
                <h3 class="section-title"><i class="fas fa-biking"></i> Performances Cyclisme</h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-bolt"></i> FTP
                        </label>
                        <input type="number"
                               name="ftp_watts"
                               class="form-input"
                               value="${formData.ftp_watts || ''}"
                               placeholder="250">
                        <small class="form-help">watts (test 20min)</small>
                    </div>

                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-weight"></i> FTP/kg
                        </label>
                        <input type="number"
                               name="ftp_wkg"
                               class="form-input"
                               value="${formData.ftp_wkg || ''}"
                               placeholder="3.5"
                               step="0.1">
                        <small class="form-help">W/kg</small>
                    </div>

                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-lungs"></i> VO2max
                        </label>
                        <input type="number"
                               name="vo2max"
                               class="form-input"
                               value="${formData.vo2max || ''}"
                               placeholder="60"
                               step="0.1">
                        <small class="form-help">ml/kg/min</small>
                    </div>

                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-sync"></i> Cadence préférée
                        </label>
                        <input type="number"
                               name="preferred_cadence"
                               class="form-input"
                               value="${formData.preferred_cadence || ''}"
                               placeholder="90">
                        <small class="form-help">rpm</small>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Données force (CrossFit, HYROX, Musculation)
     * @param formData
     */
    renderStrengthData(formData) {
        return `
            <div class="form-section full-width">
                <h3 class="section-title"><i class="fas fa-dumbbell"></i> Performances Force</h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-arrow-down"></i> Squat 1RM
                        </label>
                        <input type="number"
                               name="squat_1rm"
                               class="form-input"
                               value="${formData.squat_1rm || ''}"
                               placeholder="120"
                               step="0.5">
                        <small class="form-help">kg</small>
                    </div>

                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-equals"></i> Bench Press 1RM
                        </label>
                        <input type="number"
                               name="bench_1rm"
                               class="form-input"
                               value="${formData.bench_1rm || ''}"
                               placeholder="80"
                               step="0.5">
                        <small class="form-help">kg</small>
                    </div>

                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-arrow-up"></i> Deadlift 1RM
                        </label>
                        <input type="number"
                               name="deadlift_1rm"
                               class="form-input"
                               value="${formData.deadlift_1rm || ''}"
                               placeholder="150"
                               step="0.5">
                        <small class="form-help">kg</small>
                    </div>

                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-hand-rock"></i> Overhead Press 1RM
                        </label>
                        <input type="number"
                               name="press_1rm"
                               class="form-input"
                               value="${formData.press_1rm || ''}"
                               placeholder="60"
                               step="0.5">
                        <small class="form-help">kg</small>
                    </div>

                    ${
                        formData.sport === 'crossfit' || formData.sport === 'hyrox'
                            ? `
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-fire"></i> Clean 1RM
                            </label>
                            <input type="number"
                                   name="clean_1rm"
                                   class="form-input"
                                   value="${formData.clean_1rm || ''}"
                                   placeholder="90"
                                   step="0.5">
                            <small class="form-help">kg</small>
                        </div>
                    `
                            : ''
                    }

                    ${
                        formData.sport === 'crossfit'
                            ? `
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-rocket"></i> Snatch 1RM
                            </label>
                            <input type="number"
                                   name="snatch_1rm"
                                   class="form-input"
                                   value="${formData.snatch_1rm || ''}"
                                   placeholder="70"
                                   step="0.5">
                            <small class="form-help">kg</small>
                        </div>
                    `
                            : ''
                    }
                </div>
            </div>
        `;
    },

    /**
     * Données natation
     * @param formData
     */
    renderSwimmingData(formData) {
        return `
            <div class="form-section full-width">
                <h3 class="section-title"><i class="fas fa-swimmer"></i> Performances Natation</h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-tachometer-alt"></i> CSS (Critical Swim Speed)
                        </label>
                        <input type="number"
                               name="css"
                               class="form-input"
                               value="${formData.css || ''}"
                               placeholder="1.4"
                               step="0.01">
                        <small class="form-help">m/s</small>
                    </div>

                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-stopwatch"></i> Temps 400m
                        </label>
                        <input type="text"
                               name="swim_400m"
                               class="form-input"
                               value="${formData.swim_400m || ''}"
                               placeholder="6:30">
                        <small class="form-help">min:sec</small>
                    </div>

                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-lungs"></i> VO2max
                        </label>
                        <input type="number"
                               name="vo2max"
                               class="form-input"
                               value="${formData.vo2max || ''}"
                               placeholder="50"
                               step="0.1">
                        <small class="form-help">ml/kg/min</small>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Données sports collectifs
     * @param formData
     */
    renderTeamSportsData(formData) {
        return `
            <div class="form-section full-width">
                <h3 class="section-title"><i class="fas fa-futbol"></i> Performances Athlétiques</h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-bolt"></i> Sprint 30m
                        </label>
                        <input type="number"
                               name="sprint_30m"
                               class="form-input"
                               value="${formData.sprint_30m || ''}"
                               placeholder="4.2"
                               step="0.01">
                        <small class="form-help">secondes</small>
                    </div>

                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-arrow-up"></i> Détente verticale
                        </label>
                        <input type="number"
                               name="vertical_jump"
                               class="form-input"
                               value="${formData.vertical_jump || ''}"
                               placeholder="60">
                        <small class="form-help">cm (CMJ)</small>
                    </div>

                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-repeat"></i> Yo-Yo Test
                        </label>
                        <input type="number"
                               name="yoyo_level"
                               class="form-input"
                               value="${formData.yoyo_level || ''}"
                               placeholder="18">
                        <small class="form-help">Niveau (1-23)</small>
                    </div>

                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-lungs"></i> VO2max
                        </label>
                        <input type="number"
                               name="vo2max"
                               class="form-input"
                               value="${formData.vo2max || ''}"
                               placeholder="55"
                               step="0.1">
                        <small class="form-help">ml/kg/min</small>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Données générales (autres sports)
     * @param formData
     */
    renderGeneralData(formData) {
        return `
            <div class="form-section full-width">
                <h3 class="section-title"><i class="fas fa-chart-bar"></i> Performances Générales</h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-lungs"></i> VO2max
                        </label>
                        <input type="number"
                               name="vo2max"
                               class="form-input"
                               value="${formData.vo2max || ''}"
                               placeholder="50"
                               step="0.1">
                        <small class="form-help">ml/kg/min</small>
                    </div>

                    <div class="form-group full-width">
                        <label class="form-label">
                            <i class="fas fa-info-circle"></i> Autres performances
                        </label>
                        <textarea name="other_performances"
                                  class="form-input"
                                  rows="3"
                                  placeholder="Indiquez vos performances récentes...">${formData.other_performances || ''}</textarea>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Estimation FCmax
     * @param age
     */
    estimateHRMax(age) {
        if (!age) {
            return '';
        }
        return 220 - parseInt(age);
    },

    /**
     * Validation de l'étape
     * @param formData
     */
    validate(formData) {
        const errors = [];

        if (!formData.weight_kg) {
            errors.push('Veuillez indiquer votre poids');
        }

        if (!formData.height_cm) {
            errors.push('Veuillez indiquer votre taille');
        }

        if (!formData.age) {
            errors.push('Veuillez indiquer votre âge');
        }

        if (!formData.sex) {
            errors.push('Veuillez indiquer votre sexe');
        }

        // Validation ranges
        if (formData.weight_kg && (formData.weight_kg < 30 || formData.weight_kg > 200)) {
            errors.push('Poids invalide (30-200 kg)');
        }

        if (formData.height_cm && (formData.height_cm < 120 || formData.height_cm > 230)) {
            errors.push('Taille invalide (120-230 cm)');
        }

        if (formData.age && (formData.age < 12 || formData.age > 100)) {
            errors.push('Âge invalide (12-100 ans)');
        }

        return errors;
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgrammingStep2;
} else {
    window.ProgrammingStep2 = ProgrammingStep2;
}
