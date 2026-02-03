/**
 * ÉTAPE 7 : CONTRAINTES & LIMITATIONS
 * Blessures, limitations mobilité, exercices à éviter
 */

const ProgrammingStep7 = {
    /**
     * Rendu de l'étape 7
     * @param state
     */
    render(state) {
        const formData = state.formData;

        return `
            <div class="step-container">
                <h2 class="step-title">⚠️ Contraintes & Limitations</h2>
                <p class="step-description">Blessures, limitations et exercices à éviter</p>

                <form class="form-grid" id="step7Form">
                    <!-- Blessures actuelles -->
                    <div class="form-section full-width">
                        <h3 class="section-title"><i class="fas fa-band-aid"></i> Blessures actuelles</h3>
                        <div class="form-group full-width">
                            <label class="form-label">
                                <i class="fas fa-list"></i>
                                Blessures en cours
                            </label>
                            <textarea name="current_injuries"
                                      class="form-input"
                                      rows="4"
                                      placeholder="Listez vos blessures actuelles, une par ligne&#10;Format suggéré: Zone - Type - Date début - Suivi médical (oui/non)&#10;Ex: Épaule droite - Tendinite supra-épineux - 15/01/2024 - Oui">${formData.current_injuries || ''}</textarea>
                            <small class="form-help">
                                <i class="fas fa-info-circle"></i>
                                Laissez vide si aucune blessure actuelle
                            </small>
                        </div>
                    </div>

                    <!-- Historique blessures -->
                    <div class="form-section full-width">
                        <h3 class="section-title"><i class="fas fa-history"></i> Historique blessures</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-repeat"></i>
                                    Blessures récurrentes
                                </label>
                                <input type="text"
                                       name="recurring_injuries"
                                       class="form-input"
                                       value="${formData.recurring_injuries || ''}"
                                       placeholder="Ex: Tendinite rotulienne, périostite">
                            </div>

                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-exclamation-circle"></i>
                                    Zones fragiles
                                </label>
                                <input type="text"
                                       name="fragile_zones"
                                       class="form-input"
                                       value="${formData.fragile_zones || ''}"
                                       placeholder="Ex: Genoux, bas du dos, épaules">
                            </div>

                            <div class="form-group full-width">
                                <label class="form-label">
                                    <i class="fas fa-procedures"></i>
                                    Opérations passées
                                </label>
                                <textarea name="past_surgeries"
                                          class="form-input"
                                          rows="3"
                                          placeholder="Listez vos opérations passées avec date&#10;Ex: LCA genou gauche reconstruit - 2020">${formData.past_surgeries || ''}</textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Exercices à éviter -->
                    <div class="form-section full-width">
                        <h3 class="section-title"><i class="fas fa-ban"></i> Exercices à éviter</h3>
                        <div id="avoidExercisesList">
                            ${this.renderAvoidExercises(formData.avoid_exercises || [])}
                        </div>
                        <button type="button"
                                class="btn-secondary"
                                onclick="ProgrammingPro.addAvoidExercise()">
                            <i class="fas fa-plus"></i>
                            Ajouter un exercice
                        </button>
                    </div>

                    <!-- Douleurs chroniques -->
                    <div class="form-section full-width">
                        <h3 class="section-title"><i class="fas fa-ache"></i> Douleurs chroniques</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-map-marker-alt"></i>
                                    Localisation
                                </label>
                                <input type="text"
                                       name="pain_location"
                                       class="form-input"
                                       value="${formData.pain_location || ''}"
                                       placeholder="Ex: Bas du dos lombaires">
                            </div>

                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-thermometer-half"></i>
                                    Intensité (1-10)
                                </label>
                                <input type="number"
                                       name="pain_intensity"
                                       class="form-input"
                                       value="${formData.pain_intensity || ''}"
                                       min="1"
                                       max="10"
                                       placeholder="5">
                            </div>

                            <div class="form-group full-width">
                                <label class="form-label">
                                    <i class="fas fa-fire"></i>
                                    Déclencheurs
                                </label>
                                <textarea name="pain_triggers"
                                          class="form-input"
                                          rows="2"
                                          placeholder="Qu'est-ce qui déclenche la douleur ? Ex: Flexion lombaire, course longue, squats profonds...">${formData.pain_triggers || ''}</textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Limitations mobilité -->
                    <div class="form-section full-width">
                        <h3 class="section-title"><i class="fas fa-running"></i> Limitations de mobilité</h3>
                        <div class="mobility-grid">
                            <label class="mobility-checkbox">
                                <input type="checkbox"
                                       name="mobility_ankles"
                                       ${formData.mobility_ankles ? 'checked' : ''}>
                                <span class="checkbox-label">
                                    <i class="fas fa-shoe-prints"></i>
                                    Chevilles (dorsiflexion limitée)
                                </span>
                            </label>

                            <label class="mobility-checkbox">
                                <input type="checkbox"
                                       name="mobility_hips"
                                       ${formData.mobility_hips ? 'checked' : ''}>
                                <span class="checkbox-label">
                                    <i class="fas fa-walking"></i>
                                    Hanches (flexion/extension)
                                </span>
                            </label>

                            <label class="mobility-checkbox">
                                <input type="checkbox"
                                       name="mobility_shoulders"
                                       ${formData.mobility_shoulders ? 'checked' : ''}>
                                <span class="checkbox-label">
                                    <i class="fas fa-hands"></i>
                                    Épaules (rotation/élévation)
                                </span>
                            </label>

                            <label class="mobility-checkbox">
                                <input type="checkbox"
                                       name="mobility_thoracic"
                                       ${formData.mobility_thoracic ? 'checked' : ''}>
                                <span class="checkbox-label">
                                    <i class="fas fa-sync-alt"></i>
                                    Colonne thoracique (rotation)
                                </span>
                            </label>

                            <label class="mobility-checkbox">
                                <input type="checkbox"
                                       name="mobility_wrists"
                                       ${formData.mobility_wrists ? 'checked' : ''}>
                                <span class="checkbox-label">
                                    <i class="fas fa-hand-paper"></i>
                                    Poignets (extension limitée)
                                </span>
                            </label>

                            <label class="mobility-checkbox">
                                <input type="checkbox"
                                       name="mobility_hamstrings"
                                       ${formData.mobility_hamstrings ? 'checked' : ''}>
                                <span class="checkbox-label">
                                    <i class="fas fa-child"></i>
                                    Ischio-jambiers (flexion)
                                </span>
                            </label>
                        </div>

                        <div class="form-group full-width">
                            <label class="form-label">
                                <i class="fas fa-notes-medical"></i>
                                Autres limitations
                            </label>
                            <textarea name="other_mobility_limits"
                                      class="form-input"
                                      rows="2"
                                      placeholder="Autres limitations de mobilité non listées...">${formData.other_mobility_limits || ''}</textarea>
                        </div>
                    </div>

                    <!-- Informations médicales complémentaires -->
                    <div class="form-section full-width">
                        <h3 class="section-title"><i class="fas fa-stethoscope"></i> Informations médicales</h3>
                        <div class="form-group full-width">
                            <label class="form-label">
                                <i class="fas fa-notes-medical"></i>
                                Conditions médicales / Remarques importantes
                            </label>
                            <textarea name="medical_notes"
                                      class="form-input"
                                      rows="3"
                                      placeholder="Ex: Asthme d'effort, diabète type 1, prise de médicaments impactant l'entraînement...">${formData.medical_notes || ''}</textarea>
                            <small class="form-help">
                                <i class="fas fa-user-md"></i>
                                Consultez un médecin avant tout nouveau programme d'entraînement
                            </small>
                        </div>
                    </div>
                </form>
            </div>
        `;
    },

    /**
     * Rendu liste exercices à éviter
     * @param exercises
     */
    renderAvoidExercises(exercises) {
        if (!Array.isArray(exercises) || exercises.length === 0) {
            return `
                <div class="info-box">
                    <i class="fas fa-check-circle"></i>
                    <p>Aucun exercice à éviter pour le moment</p>
                </div>
            `;
        }

        return exercises
            .map(
                (ex, index) => `
            <div class="avoid-exercise-item">
                <div class="form-grid" style="flex:1">
                    <div class="form-group">
                        <input type="text"
                               name="avoid_exercise_name_${index}"
                               class="form-input"
                               value="${ex.name || ''}"
                               placeholder="Nom de l'exercice"
                               required>
                    </div>
                    <div class="form-group">
                        <input type="text"
                               name="avoid_exercise_reason_${index}"
                               class="form-input"
                               value="${ex.reason || ''}"
                               placeholder="Raison (douleur, inconfort, etc.)">
                    </div>
                </div>
                <button type="button"
                        class="btn-danger-icon"
                        onclick="ProgrammingPro.removeAvoidExercise(${index})"
                        title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `
            )
            .join('');
    },

    /**
     * Validation de l'étape
     * @param formData
     */
    validate(formData) {
        const errors = [];

        // Pas de champs obligatoires, toutes les contraintes sont optionnelles
        // Validation logique uniquement
        if (formData.pain_intensity) {
            const intensity = parseInt(formData.pain_intensity);
            if (intensity < 1 || intensity > 10) {
                errors.push("L'intensité de la douleur doit être entre 1 et 10");
            }
            if (intensity >= 7 && !formData.current_injuries) {
                errors.push(
                    'Douleur sévère détectée (≥7/10). Veuillez préciser vos blessures actuelles ou consulter un médecin'
                );
            }
        }

        return errors;
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgrammingStep7;
} else {
    window.ProgrammingStep7 = ProgrammingStep7;
}
