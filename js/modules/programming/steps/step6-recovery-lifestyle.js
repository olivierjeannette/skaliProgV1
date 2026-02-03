/**
 * ÉTAPE 6 : RÉCUPÉRATION & LIFESTYLE
 * Sommeil, stress, nutrition, suppléments
 */

const ProgrammingStep6 = {
    /**
     * Rendu de l'étape 6
     * @param state
     */
    render(state) {
        const formData = state.formData;

        return `
            <div class="step-container">
                <h2 class="step-title">😴 Récupération & Lifestyle</h2>
                <p class="step-description">Facteurs impactant votre capacité de récupération</p>

                <form class="form-grid" id="step6Form">
                    <!-- Récupération -->
                    <div class="form-section full-width">
                        <h3 class="section-title"><i class="fas fa-bed"></i> Récupération</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label required">
                                    <i class="fas fa-battery-half"></i>
                                    Capacité de récupération
                                </label>
                                <select name="recovery_capacity" class="form-select" required>
                                    <option value="">Sélectionner...</option>
                                    <option value="slow" ${formData.recovery_capacity === 'slow' ? 'selected' : ''}>Lente (courbatures 48-72h)</option>
                                    <option value="normal" ${formData.recovery_capacity === 'normal' ? 'selected' : ''}>Normale (24-48h)</option>
                                    <option value="fast" ${formData.recovery_capacity === 'fast' ? 'selected' : ''}>Rapide (12-24h)</option>
                                    <option value="excellent" ${formData.recovery_capacity === 'excellent' ? 'selected' : ''}>Excellente (< 12h)</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="form-label required">
                                    <i class="fas fa-moon"></i>
                                    Heures de sommeil / nuit
                                </label>
                                <select name="sleep_hours" class="form-select" required>
                                    <option value="">Sélectionner...</option>
                                    <option value="5" ${formData.sleep_hours == 5 ? 'selected' : ''}>5 heures</option>
                                    <option value="6" ${formData.sleep_hours == 6 ? 'selected' : ''}>6 heures</option>
                                    <option value="7" ${formData.sleep_hours == 7 ? 'selected' : ''}>7 heures</option>
                                    <option value="8" ${formData.sleep_hours == 8 ? 'selected' : ''}>8 heures ⭐</option>
                                    <option value="9" ${formData.sleep_hours == 9 ? 'selected' : ''}>9+ heures</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="form-label required">
                                    <i class="fas fa-star"></i>
                                    Qualité du sommeil
                                </label>
                                <select name="sleep_quality" class="form-select" required>
                                    <option value="">Sélectionner...</option>
                                    <option value="poor" ${formData.sleep_quality === 'poor' ? 'selected' : ''}>Mauvaise (réveils fréquents)</option>
                                    <option value="average" ${formData.sleep_quality === 'average' ? 'selected' : ''}>Moyenne</option>
                                    <option value="good" ${formData.sleep_quality === 'good' ? 'selected' : ''}>Bonne</option>
                                    <option value="excellent" ${formData.sleep_quality === 'excellent' ? 'selected' : ''}>Excellente</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-couch"></i>
                                    Siestes régulières
                                </label>
                                <select name="naps" class="form-select">
                                    <option value="no" ${formData.naps === 'no' ? 'selected' : ''}>Non</option>
                                    <option value="occasional" ${formData.naps === 'occasional' ? 'selected' : ''}>Occasionnelles</option>
                                    <option value="regular" ${formData.naps === 'regular' ? 'selected' : ''}>Régulières (3-5x/semaine)</option>
                                    <option value="daily" ${formData.naps === 'daily' ? 'selected' : ''}>Quotidiennes</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Stress & Fatigue -->
                    <div class="form-section full-width">
                        <h3 class="section-title"><i class="fas fa-brain"></i> Stress & Fatigue</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label required">
                                    <i class="fas fa-exclamation-triangle"></i>
                                    Niveau de stress quotidien
                                </label>
                                <input type="range"
                                       name="stress_level"
                                       class="form-range"
                                       min="1"
                                       max="10"
                                       value="${formData.stress_level || 5}"
                                       oninput="document.getElementById('stressValue').textContent = this.value"
                                       required>
                                <div class="range-labels">
                                    <span>Faible (1)</span>
                                    <span id="stressValue" class="range-value">${formData.stress_level || 5}</span>
                                    <span>Élevé (10)</span>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label required">
                                    <i class="fas fa-tired"></i>
                                    Niveau de fatigue actuel
                                </label>
                                <input type="range"
                                       name="fatigue_level"
                                       class="form-range"
                                       min="1"
                                       max="10"
                                       value="${formData.fatigue_level || 5}"
                                       oninput="document.getElementById('fatigueValue').textContent = this.value"
                                       required>
                                <div class="range-labels">
                                    <span>Reposé (1)</span>
                                    <span id="fatigueValue" class="range-value">${formData.fatigue_level || 5}</span>
                                    <span>Épuisé (10)</span>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-briefcase"></i>
                                    Travail physique
                                </label>
                                <select name="physical_job" class="form-select">
                                    <option value="no" ${formData.physical_job === 'no' ? 'selected' : ''}>Non (bureau, sédentaire)</option>
                                    <option value="light" ${formData.physical_job === 'light' ? 'selected' : ''}>Léger (debout, déplacements)</option>
                                    <option value="moderate" ${formData.physical_job === 'moderate' ? 'selected' : ''}>Modéré (manutention)</option>
                                    <option value="heavy" ${formData.physical_job === 'heavy' ? 'selected' : ''}>Intense (BTP, agriculture)</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-car"></i>
                                    Trajets quotidiens longs (> 1h)
                                </label>
                                <select name="long_commute" class="form-select">
                                    <option value="no" ${formData.long_commute === 'no' ? 'selected' : ''}>Non</option>
                                    <option value="yes" ${formData.long_commute === 'yes' ? 'selected' : ''}>Oui</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Nutrition -->
                    <div class="form-section full-width">
                        <h3 class="section-title"><i class="fas fa-utensils"></i> Nutrition</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-drumstick-bite"></i>
                                    Apport protéines actuel
                                </label>
                                <input type="number"
                                       name="protein_intake"
                                       class="form-input"
                                       value="${formData.protein_intake || ''}"
                                       placeholder="1.6"
                                       step="0.1"
                                       min="0">
                                <small class="form-help">g/kg/jour (recommandé: 1.6-2.2 pour sportifs)</small>
                            </div>

                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-leaf"></i>
                                    Régime alimentaire
                                </label>
                                <select name="diet_type" class="form-select">
                                    <option value="omnivore" ${formData.diet_type === 'omnivore' ? 'selected' : ''}>Omnivore</option>
                                    <option value="vegetarian" ${formData.diet_type === 'vegetarian' ? 'selected' : ''}>Végétarien</option>
                                    <option value="vegan" ${formData.diet_type === 'vegan' ? 'selected' : ''}>Végétalien</option>
                                    <option value="keto" ${formData.diet_type === 'keto' ? 'selected' : ''}>Cétogène</option>
                                    <option value="paleo" ${formData.diet_type === 'paleo' ? 'selected' : ''}>Paléo</option>
                                    <option value="other" ${formData.diet_type === 'other' ? 'selected' : ''}>Autre</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-tint"></i>
                                    Hydratation quotidienne
                                </label>
                                <select name="hydration" class="form-select">
                                    <option value="low" ${formData.hydration === 'low' ? 'selected' : ''}>< 1L</option>
                                    <option value="medium" ${formData.hydration === 'medium' ? 'selected' : ''}>1-2L</option>
                                    <option value="good" ${formData.hydration === 'good' ? 'selected' : ''}>2-3L ⭐</option>
                                    <option value="high" ${formData.hydration === 'high' ? 'selected' : ''}>3L+</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-wine-glass"></i>
                                    Consommation d'alcool
                                </label>
                                <select name="alcohol" class="form-select">
                                    <option value="never" ${formData.alcohol === 'never' ? 'selected' : ''}>Jamais</option>
                                    <option value="rare" ${formData.alcohol === 'rare' ? 'selected' : ''}>Rare (1-2x/mois)</option>
                                    <option value="moderate" ${formData.alcohol === 'moderate' ? 'selected' : ''}>Modérée (1-2x/semaine)</option>
                                    <option value="regular" ${formData.alcohol === 'regular' ? 'selected' : ''}>Régulière (3+/semaine)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Suppléments -->
                    <div class="form-section full-width">
                        <h3 class="section-title"><i class="fas fa-pills"></i> Supplémentation</h3>
                        <div class="supplements-grid">
                            <label class="supplement-checkbox">
                                <input type="checkbox"
                                       name="supp_creatine"
                                       ${formData.supp_creatine ? 'checked' : ''}>
                                <span class="checkbox-label">
                                    <i class="fas fa-fire"></i>
                                    Créatine (5g/jour)
                                </span>
                            </label>

                            <label class="supplement-checkbox">
                                <input type="checkbox"
                                       name="supp_protein"
                                       ${formData.supp_protein ? 'checked' : ''}>
                                <span class="checkbox-label">
                                    <i class="fas fa-drumstick-bite"></i>
                                    Protéines (whey/végétale)
                                </span>
                            </label>

                            <label class="supplement-checkbox">
                                <input type="checkbox"
                                       name="supp_vitamins"
                                       ${formData.supp_vitamins ? 'checked' : ''}>
                                <span class="checkbox-label">
                                    <i class="fas fa-capsules"></i>
                                    Vitamines / Minéraux
                                </span>
                            </label>

                            <label class="supplement-checkbox">
                                <input type="checkbox"
                                       name="supp_omega3"
                                       ${formData.supp_omega3 ? 'checked' : ''}>
                                <span class="checkbox-label">
                                    <i class="fas fa-fish"></i>
                                    Oméga-3
                                </span>
                            </label>

                            <label class="supplement-checkbox">
                                <input type="checkbox"
                                       name="supp_caffeine"
                                       ${formData.supp_caffeine ? 'checked' : ''}>
                                <span class="checkbox-label">
                                    <i class="fas fa-coffee"></i>
                                    Caféine pré-workout
                                </span>
                            </label>

                            <label class="supplement-checkbox">
                                <input type="checkbox"
                                       name="supp_bcaa"
                                       ${formData.supp_bcaa ? 'checked' : ''}>
                                <span class="checkbox-label">
                                    <i class="fas fa-dna"></i>
                                    BCAA / EAA
                                </span>
                            </label>
                        </div>

                        <div class="form-group full-width">
                            <label class="form-label">
                                <i class="fas fa-notes-medical"></i>
                                Autres suppléments
                            </label>
                            <textarea name="other_supplements"
                                      class="form-input"
                                      rows="2"
                                      placeholder="Ex: Beta-alanine, citrulline, magnésium...">${formData.other_supplements || ''}</textarea>
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

        if (!formData.recovery_capacity) {
            errors.push('Veuillez indiquer votre capacité de récupération');
        }

        if (!formData.sleep_hours) {
            errors.push('Veuillez indiquer vos heures de sommeil');
        }

        if (!formData.sleep_quality) {
            errors.push('Veuillez indiquer votre qualité de sommeil');
        }

        if (!formData.stress_level) {
            errors.push('Veuillez indiquer votre niveau de stress');
        }

        if (!formData.fatigue_level) {
            errors.push('Veuillez indiquer votre niveau de fatigue');
        }

        return errors;
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgrammingStep6;
} else {
    window.ProgrammingStep6 = ProgrammingStep6;
}
