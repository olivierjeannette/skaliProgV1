/**
 * ÉTAPE 5 : NIVEAU & HISTORIQUE
 * Expérience, niveau, historique compétitions, tests récents
 */

const ProgrammingStep5 = {
    /**
     * Rendu de l'étape 5
     * @param state
     */
    render(state) {
        const formData = state.formData;

        return `
            <div class="step-container">
                <h2 class="step-title">📈 Niveau & Historique</h2>
                <p class="step-description">Votre expérience et progression récente</p>

                <form class="form-grid" id="step5Form">
                    <!-- Niveau actuel -->
                    <div class="form-section full-width">
                        <h3 class="section-title"><i class="fas fa-medal"></i> Niveau actuel</h3>
                        <div class="level-cards-grid">
                            <label class="level-card ${formData.current_level === 'beginner' ? 'selected' : ''}"
                                   onclick="ProgrammingPro.selectLevel('beginner')">
                                <input type="radio"
                                       name="current_level"
                                       value="beginner"
                                       ${formData.current_level === 'beginner' ? 'checked' : ''}
                                       style="display:none">
                                <div class="level-icon">🌱</div>
                                <div class="level-name">Débutant</div>
                                <div class="level-desc">< 1 an d'expérience</div>
                            </label>

                            <label class="level-card ${formData.current_level === 'intermediate' ? 'selected' : ''}"
                                   onclick="ProgrammingPro.selectLevel('intermediate')">
                                <input type="radio"
                                       name="current_level"
                                       value="intermediate"
                                       ${formData.current_level === 'intermediate' ? 'checked' : ''}
                                       style="display:none">
                                <div class="level-icon">📊</div>
                                <div class="level-name">Intermédiaire</div>
                                <div class="level-desc">1-3 ans d'expérience</div>
                            </label>

                            <label class="level-card ${formData.current_level === 'advanced' ? 'selected' : ''}"
                                   onclick="ProgrammingPro.selectLevel('advanced')">
                                <input type="radio"
                                       name="current_level"
                                       value="advanced"
                                       ${formData.current_level === 'advanced' ? 'checked' : ''}
                                       style="display:none">
                                <div class="level-icon">🔥</div>
                                <div class="level-name">Avancé</div>
                                <div class="level-desc">3-5 ans d'expérience</div>
                            </label>

                            <label class="level-card ${formData.current_level === 'elite' ? 'selected' : ''}"
                                   onclick="ProgrammingPro.selectLevel('elite')">
                                <input type="radio"
                                       name="current_level"
                                       value="elite"
                                       ${formData.current_level === 'elite' ? 'checked' : ''}
                                       style="display:none">
                                <div class="level-icon">⭐</div>
                                <div class="level-name">Élite</div>
                                <div class="level-desc">> 5 ans, niveau national+</div>
                            </label>
                        </div>
                    </div>

                    <!-- Expérience -->
                    <div class="form-section full-width">
                        <h3 class="section-title"><i class="fas fa-chart-line"></i> Expérience</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-trophy"></i>
                                    Années de pratique sport principal
                                </label>
                                <input type="number"
                                       name="years_sport"
                                       class="form-input"
                                       value="${formData.years_sport || ''}"
                                       placeholder="3"
                                       min="0"
                                       max="50">
                                <small class="form-help">années</small>
                            </div>

                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-dumbbell"></i>
                                    Années préparation physique structurée
                                </label>
                                <input type="number"
                                       name="years_training"
                                       class="form-input"
                                       value="${formData.years_training || ''}"
                                       placeholder="2"
                                       min="0"
                                       max="50">
                                <small class="form-help">années</small>
                            </div>

                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-calendar-check"></i>
                                    Compétitions dernière année
                                </label>
                                <input type="number"
                                       name="competitions_last_year"
                                       class="form-input"
                                       value="${formData.competitions_last_year || ''}"
                                       placeholder="5"
                                       min="0">
                            </div>

                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-star"></i>
                                    Meilleur résultat compétition
                                </label>
                                <input type="text"
                                       name="best_result"
                                       class="form-input"
                                       value="${formData.best_result || ''}"
                                       placeholder="Ex: 3h15 au marathon, 200kg au deadlift">
                            </div>
                        </div>
                    </div>

                    <!-- Tests récents -->
                    <div class="form-section full-width">
                        <h3 class="section-title"><i class="fas fa-clipboard-check"></i> Tests récents</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-calendar-alt"></i>
                                    Date dernier test (VMA/FTP/1RM)
                                </label>
                                <input type="date"
                                       name="last_test_date"
                                       class="form-input"
                                       value="${formData.last_test_date || ''}">
                            </div>

                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-weight"></i>
                                    Date dernière éval composition corporelle
                                </label>
                                <input type="date"
                                       name="last_body_comp_date"
                                       class="form-input"
                                       value="${formData.last_body_comp_date || ''}">
                            </div>

                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-stethoscope"></i>
                                    Date dernier bilan médical
                                </label>
                                <input type="date"
                                       name="last_medical_date"
                                       class="form-input"
                                       value="${formData.last_medical_date || ''}">
                            </div>
                        </div>
                    </div>

                    <!-- Progressions récentes -->
                    <div class="form-section full-width">
                        <h3 class="section-title"><i class="fas fa-arrow-up"></i> Progressions récentes (6 derniers mois)</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-weight-hanging"></i>
                                    Variation poids
                                </label>
                                <div class="input-group">
                                    <select name="weight_change_direction" class="form-select" style="width:80px">
                                        <option value="+" ${formData.weight_change_direction === '+' ? 'selected' : ''}>+</option>
                                        <option value="-" ${formData.weight_change_direction === '-' ? 'selected' : ''}>-</option>
                                        <option value="=" ${formData.weight_change_direction === '=' ? 'selected' : ''}>=</option>
                                    </select>
                                    <input type="number"
                                           name="weight_change_value"
                                           class="form-input"
                                           value="${formData.weight_change_value || ''}"
                                           placeholder="2.5"
                                           step="0.1"
                                           style="flex:1">
                                    <span class="input-suffix">kg</span>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-dumbbell"></i>
                                    Variation Squat 1RM
                                </label>
                                <div class="input-group">
                                    <select name="squat_change_direction" class="form-select" style="width:80px">
                                        <option value="+" ${formData.squat_change_direction === '+' ? 'selected' : ''}>+</option>
                                        <option value="-" ${formData.squat_change_direction === '-' ? 'selected' : ''}>-</option>
                                        <option value="=" ${formData.squat_change_direction === '=' ? 'selected' : ''}>=</option>
                                    </select>
                                    <input type="number"
                                           name="squat_change_value"
                                           class="form-input"
                                           value="${formData.squat_change_value || ''}"
                                           placeholder="10"
                                           step="0.5"
                                           style="flex:1">
                                    <span class="input-suffix">kg</span>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-running"></i>
                                    Variation VMA
                                </label>
                                <div class="input-group">
                                    <select name="vma_change_direction" class="form-select" style="width:80px">
                                        <option value="+" ${formData.vma_change_direction === '+' ? 'selected' : ''}>+</option>
                                        <option value="-" ${formData.vma_change_direction === '-' ? 'selected' : ''}>-</option>
                                        <option value="=" ${formData.vma_change_direction === '=' ? 'selected' : ''}>=</option>
                                    </select>
                                    <input type="number"
                                           name="vma_change_value"
                                           class="form-input"
                                           value="${formData.vma_change_value || ''}"
                                           placeholder="0.5"
                                           step="0.1"
                                           style="flex:1">
                                    <span class="input-suffix">km/h</span>
                                </div>
                            </div>

                            <div class="form-group full-width">
                                <label class="form-label">
                                    <i class="fas fa-chart-area"></i>
                                    Autres progressions notables
                                </label>
                                <textarea name="other_progressions"
                                          class="form-input"
                                          rows="3"
                                          placeholder="Ex: +15 watts FTP, -2min au 5km, +5cm détente verticale...">${formData.other_progressions || ''}</textarea>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        `;
    },

    /**
     * Validation de l'étape
     * @param formData
     */
    validate(formData) {
        const errors = [];

        if (!formData.current_level) {
            errors.push('Veuillez sélectionner votre niveau actuel');
        }

        // Pas d'autres champs obligatoires, tout est optionnel
        return errors;
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgrammingStep5;
} else {
    window.ProgrammingStep5 = ProgrammingStep5;
}
