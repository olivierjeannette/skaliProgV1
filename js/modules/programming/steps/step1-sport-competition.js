/**
 * ÉTAPE 1 : PROFIL SPORT & COMPÉTITION
 * Sélection du sport principal et objectif de compétition
 */

const ProgrammingStep1 = {
    /**
     * Rendu de l'étape 1
     * @param state
     */
    render(state) {
        const sports = window.SportsMatrix ? window.SportsMatrix.sports : {};
        const selectedSport = state.formData.sport || null;

        return `
            <div class="step-container">
                <h2 class="step-title">🎯 Profil Sport & Compétition</h2>
                <p class="step-description">Définissez votre sport principal et vos objectifs</p>

                <form class="form-grid" id="step1Form">
                    <!-- Sport Principal -->
                    <div class="form-group full-width">
                        <label class="form-label required">
                            <i class="fas fa-trophy"></i>
                            Sport Principal
                        </label>
                        <div class="sport-grid">
                            ${Object.entries(sports)
                                .map(([id, sport]) =>
                                    this.renderSportCard(id, sport, selectedSport)
                                )
                                .join('')}
                        </div>
                    </div>

                    ${
                        selectedSport
                            ? `
                        <!-- Titre du programme -->
                        <div class="form-group full-width">
                            <label class="form-label">
                                <i class="fas fa-file-signature"></i>
                                Titre du programme (optionnel)
                            </label>
                            <input type="text"
                                   name="program_title"
                                   class="form-input"
                                   placeholder="Laissez vide pour génération automatique"
                                   value="${state.formData.program_title || ''}">
                            <small class="form-help">Ex: "Préparation Trail Échappée Belle 2025"</small>
                        </div>

                        <!-- Durée -->
                        <div class="form-group">
                            <label class="form-label required">
                                <i class="fas fa-calendar-alt"></i>
                                Durée du programme
                            </label>
                            <select name="duration_weeks" class="form-select" required>
                                <option value="">Sélectionner...</option>
                                <option value="4" ${state.formData.duration_weeks == 4 ? 'selected' : ''}>4 semaines</option>
                                <option value="8" ${state.formData.duration_weeks == 8 ? 'selected' : ''}>8 semaines</option>
                                <option value="12" ${state.formData.duration_weeks == 12 ? 'selected' : ''}>12 semaines ⭐</option>
                                <option value="16" ${state.formData.duration_weeks == 16 ? 'selected' : ''}>16 semaines</option>
                                <option value="20" ${state.formData.duration_weeks == 20 ? 'selected' : ''}>20 semaines</option>
                                <option value="24" ${state.formData.duration_weeks == 24 ? 'selected' : ''}>24 semaines</option>
                            </select>
                        </div>

                        <!-- Date début -->
                        <div class="form-group">
                            <label class="form-label required">
                                <i class="fas fa-play-circle"></i>
                                Date de début
                            </label>
                            <input type="date"
                                   name="start_date"
                                   class="form-input"
                                   value="${state.formData.start_date || this.getDefaultStartDate()}"
                                   required>
                        </div>

                        <!-- Date compétition (optionnel) -->
                        <div class="form-group full-width">
                            <label class="form-label">
                                <i class="fas fa-flag-checkered"></i>
                                Date de compétition (optionnel)
                            </label>
                            <input type="date"
                                   name="competition_date"
                                   class="form-input"
                                   value="${state.formData.competition_date || ''}">
                            <small class="form-help">
                                <i class="fas fa-info-circle"></i>
                                Active la périodisation automatique PPG/PPO/PPS avec tapering
                            </small>
                        </div>

                        <!-- Phase actuelle -->
                        <div class="form-group">
                            <label class="form-label required">
                                <i class="fas fa-chart-line"></i>
                                Phase actuelle
                            </label>
                            <select name="current_phase" class="form-select" required>
                                <option value="off-season" ${state.formData.current_phase === 'off-season' ? 'selected' : ''}>Hors-saison / Repos actif</option>
                                <option value="general-prep" ${state.formData.current_phase === 'general-prep' ? 'selected' : ''}>Préparation générale (PPG)</option>
                                <option value="specific-prep" ${state.formData.current_phase === 'specific-prep' ? 'selected' : ''}>Préparation spécifique (PPS)</option>
                                <option value="competition" ${state.formData.current_phase === 'competition' ? 'selected' : ''}>Compétition / Maintien</option>
                                <option value="transition" ${state.formData.current_phase === 'transition' ? 'selected' : ''}>Transition / Récupération</option>
                            </select>
                        </div>

                        <!-- Niveau visé compétition -->
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-target"></i>
                                Niveau visé (si compétition)
                            </label>
                            <select name="competition_level" class="form-select">
                                <option value="">Non applicable</option>
                                <option value="loisir" ${state.formData.competition_level === 'loisir' ? 'selected' : ''}>Loisir / Découverte</option>
                                <option value="regional" ${state.formData.competition_level === 'regional' ? 'selected' : ''}>Régional</option>
                                <option value="national" ${state.formData.competition_level === 'national' ? 'selected' : ''}>National</option>
                                <option value="international" ${state.formData.competition_level === 'international' ? 'selected' : ''}>International / Élite</option>
                            </select>
                        </div>
                    `
                            : `
                        <div class="info-box">
                            <i class="fas fa-arrow-up"></i>
                            <p>Sélectionnez d'abord votre sport principal</p>
                        </div>
                    `
                    }
                </form>
            </div>
        `;
    },

    /**
     * Rendu carte de sport
     * @param id
     * @param sport
     * @param selectedSport
     */
    renderSportCard(id, sport, selectedSport) {
        const isSelected = selectedSport === id;
        return `
            <div class="sport-card ${isSelected ? 'selected' : ''}"
                 onclick="ProgrammingPro.selectSport('${id}')">
                <div class="sport-icon">${sport.icon}</div>
                <div class="sport-name">${sport.name}</div>
                <div class="sport-description">${sport.description}</div>
            </div>
        `;
    },

    /**
     * Date de début par défaut (demain)
     */
    getDefaultStartDate() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    },

    /**
     * Validation de l'étape
     * @param formData
     */
    validate(formData) {
        const errors = [];

        if (!formData.sport) {
            errors.push('Veuillez sélectionner un sport');
        }

        if (!formData.duration_weeks) {
            errors.push('Veuillez choisir une durée de programme');
        }

        if (!formData.start_date) {
            errors.push('Veuillez indiquer une date de début');
        }

        if (!formData.current_phase) {
            errors.push('Veuillez préciser votre phase actuelle');
        }

        // Validation logique dates
        if (formData.competition_date && formData.start_date) {
            const start = new Date(formData.start_date);
            const comp = new Date(formData.competition_date);
            const diffWeeks = Math.ceil((comp - start) / (7 * 24 * 60 * 60 * 1000));

            if (comp <= start) {
                errors.push('La date de compétition doit être après la date de début');
            }

            if (diffWeeks > parseInt(formData.duration_weeks)) {
                errors.push(
                    `La compétition est dans ${diffWeeks} semaines mais votre programme ne dure que ${formData.duration_weeks} semaines`
                );
            }
        }

        return errors;
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgrammingStep1;
} else {
    window.ProgrammingStep1 = ProgrammingStep1;
}
