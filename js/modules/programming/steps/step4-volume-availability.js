/**
 * ÉTAPE 4 : VOLUME & DISPONIBILITÉ
 * Fréquence, durée, jours disponibles, matériel
 */

const ProgrammingStep4 = {
    /**
     * Rendu de l'étape 4
     * @param state
     */
    render(state) {
        const formData = state.formData;
        const selectedDays = formData.available_days ? formData.available_days.split(',') : [];

        return `
            <div class="step-container">
                <h2 class="step-title">📅 Volume & Disponibilité</h2>
                <p class="step-description">Définissez votre capacité et disponibilité d'entraînement</p>

                <form class="form-grid" id="step4Form">
                    <!-- Fréquence & Durée -->
                    <div class="form-section full-width">
                        <h3 class="section-title"><i class="fas fa-clock"></i> Fréquence & Durée</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label required">
                                    <i class="fas fa-calendar-week"></i>
                                    Séances par semaine
                                </label>
                                <select name="sessions_per_week" class="form-select" required>
                                    <option value="">Sélectionner...</option>
                                    <option value="2" ${formData.sessions_per_week == 2 ? 'selected' : ''}>2 séances</option>
                                    <option value="3" ${formData.sessions_per_week == 3 ? 'selected' : ''}>3 séances</option>
                                    <option value="4" ${formData.sessions_per_week == 4 ? 'selected' : ''}>4 séances ⭐</option>
                                    <option value="5" ${formData.sessions_per_week == 5 ? 'selected' : ''}>5 séances</option>
                                    <option value="6" ${formData.sessions_per_week == 6 ? 'selected' : ''}>6 séances</option>
                                    <option value="7" ${formData.sessions_per_week == 7 ? 'selected' : ''}>7 séances (bi-quotidien)</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="form-label required">
                                    <i class="fas fa-hourglass-half"></i>
                                    Durée moyenne séance
                                </label>
                                <select name="session_duration" class="form-select" required>
                                    <option value="">Sélectionner...</option>
                                    <option value="45" ${formData.session_duration == 45 ? 'selected' : ''}>45 minutes</option>
                                    <option value="60" ${formData.session_duration == 60 ? 'selected' : ''}>60 minutes ⭐</option>
                                    <option value="75" ${formData.session_duration == 75 ? 'selected' : ''}>75 minutes</option>
                                    <option value="90" ${formData.session_duration == 90 ? 'selected' : ''}>90 minutes</option>
                                    <option value="120" ${formData.session_duration == 120 ? 'selected' : ''}>120 minutes</option>
                                </select>
                            </div>
                        </div>

                        <!-- Volume hebdo calculé -->
                        ${
                            formData.sessions_per_week && formData.session_duration
                                ? `
                            <div class="info-box success">
                                <i class="fas fa-calculator"></i>
                                <p><strong>Volume hebdomadaire:</strong> ${((formData.sessions_per_week * formData.session_duration) / 60).toFixed(1)} heures</p>
                            </div>
                        `
                                : ''
                        }
                    </div>

                    <!-- Jours disponibles -->
                    <div class="form-section full-width">
                        <h3 class="section-title"><i class="fas fa-calendar-check"></i> Jours disponibles</h3>
                        <div class="days-selector">
                            ${this.renderDayButtons(selectedDays)}
                        </div>
                        <input type="hidden" name="available_days" value="${selectedDays.join(',')}">

                        <label class="toggle-container">
                            <input type="checkbox"
                                   name="flexible_schedule"
                                   ${formData.flexible_schedule ? 'checked' : ''}
                                   onchange="ProgrammingPro.toggleFlexibleSchedule(this)">
                            <span class="toggle-label">
                                <i class="fas fa-random"></i>
                                Planning flexible (pas de contrainte de jours)
                            </span>
                        </label>
                    </div>

                    <!-- Créneaux horaires -->
                    <div class="form-section full-width">
                        <h3 class="section-title"><i class="fas fa-clock"></i> Créneaux horaires préférés</h3>
                        <div class="time-slots-grid">
                            <div class="time-slot-card ${formData.time_slot_morning ? 'selected' : ''}"
                                 onclick="ProgrammingPro.toggleTimeSlot('morning', event)">
                                <div class="time-slot-icon">☀️</div>
                                <div class="time-slot-label">Matin</div>
                                <div class="time-slot-time">6h - 10h</div>
                            </div>

                            <div class="time-slot-card ${formData.time_slot_noon ? 'selected' : ''}"
                                 onclick="ProgrammingPro.toggleTimeSlot('noon', event)">
                                <div class="time-slot-icon">🌤️</div>
                                <div class="time-slot-label">Midi</div>
                                <div class="time-slot-time">11h - 14h</div>
                            </div>

                            <div class="time-slot-card ${formData.time_slot_afternoon ? 'selected' : ''}"
                                 onclick="ProgrammingPro.toggleTimeSlot('afternoon', event)">
                                <div class="time-slot-icon">🌅</div>
                                <div class="time-slot-label">Après-midi</div>
                                <div class="time-slot-time">14h - 18h</div>
                            </div>

                            <div class="time-slot-card ${formData.time_slot_evening ? 'selected' : ''}"
                                 onclick="ProgrammingPro.toggleTimeSlot('evening', event)">
                                <div class="time-slot-icon">🌙</div>
                                <div class="time-slot-label">Soir</div>
                                <div class="time-slot-time">18h - 22h</div>
                            </div>
                        </div>
                    </div>

                    <!-- Accès matériel -->
                    <div class="form-section full-width">
                        <h3 class="section-title"><i class="fas fa-dumbbell"></i> Accès matériel</h3>
                        <div class="form-group">
                            <label class="form-label required">Type de matériel disponible</label>
                            <select name="equipment_access" class="form-select" required>
                                <option value="">Sélectionner...</option>
                                <option value="full-gym" ${formData.equipment_access === 'full-gym' ? 'selected' : ''}>
                                    Salle complète (référence L'Askali)
                                </option>
                                <option value="basic-gym" ${formData.equipment_access === 'basic-gym' ? 'selected' : ''}>
                                    Salle basique (barres, haltères, bancs)
                                </option>
                                <option value="minimal" ${formData.equipment_access === 'minimal' ? 'selected' : ''}>
                                    Minimaliste (haltères, bandes, poids du corps)
                                </option>
                                <option value="bodyweight" ${formData.equipment_access === 'bodyweight' ? 'selected' : ''}>
                                    Poids du corps uniquement
                                </option>
                                <option value="home-custom" ${formData.equipment_access === 'home-custom' ? 'selected' : ''}>
                                    À domicile (spécifier matériel)
                                </option>
                            </select>
                        </div>

                        ${
                            formData.equipment_access === 'home-custom'
                                ? `
                            <div class="form-group full-width">
                                <label class="form-label">
                                    <i class="fas fa-list"></i>
                                    Matériel disponible à domicile
                                </label>
                                <textarea name="home_equipment"
                                          class="form-input"
                                          rows="4"
                                          placeholder="Ex: Paire haltères 2-20kg, barre olympique, 100kg disques, rack, tapis, bandes élastiques...">${formData.home_equipment || ''}</textarea>
                            </div>
                        `
                                : ''
                        }

                        <div class="form-group">
                            <label class="form-label required">Lieu d'entraînement principal</label>
                            <select name="training_location" class="form-select" required>
                                <option value="">Sélectionner...</option>
                                <option value="gym" ${formData.training_location === 'gym' ? 'selected' : ''}>Salle de sport</option>
                                <option value="home" ${formData.training_location === 'home' ? 'selected' : ''}>Domicile</option>
                                <option value="outdoor" ${formData.training_location === 'outdoor' ? 'selected' : ''}>Extérieur (parc, piste, route)</option>
                                <option value="mixed" ${formData.training_location === 'mixed' ? 'selected' : ''}>Mixte</option>
                            </select>
                        </div>
                    </div>
                </form>
            </div>
        `;
    },

    /**
     * Rendu boutons jours
     * @param selectedDays
     */
    renderDayButtons(selectedDays) {
        const days = [
            { id: 'mon', label: 'Lun', full: 'Lundi' },
            { id: 'tue', label: 'Mar', full: 'Mardi' },
            { id: 'wed', label: 'Mer', full: 'Mercredi' },
            { id: 'thu', label: 'Jeu', full: 'Jeudi' },
            { id: 'fri', label: 'Ven', full: 'Vendredi' },
            { id: 'sat', label: 'Sam', full: 'Samedi' },
            { id: 'sun', label: 'Dim', full: 'Dimanche' }
        ];

        return days
            .map(day => {
                const isSelected = selectedDays.includes(day.id);
                return `
                <button type="button"
                        class="day-button ${isSelected ? 'selected' : ''}"
                        onclick="ProgrammingPro.toggleDay('${day.id}', event)"
                        title="${day.full}">
                    ${day.label}
                </button>
            `;
            })
            .join('');
    },

    /**
     * Validation de l'étape
     * @param formData
     */
    validate(formData) {
        const errors = [];

        if (!formData.sessions_per_week) {
            errors.push('Veuillez indiquer le nombre de séances par semaine');
        }

        if (!formData.session_duration) {
            errors.push('Veuillez indiquer la durée moyenne des séances');
        }

        if (!formData.flexible_schedule) {
            const days = formData.available_days
                ? formData.available_days.split(',').filter(d => d)
                : [];
            if (days.length === 0) {
                errors.push(
                    'Veuillez sélectionner au moins 1 jour disponible ou activer le planning flexible'
                );
            }

            const sessionsPerWeek = parseInt(formData.sessions_per_week || 0);
            if (days.length < sessionsPerWeek) {
                errors.push(
                    `Vous avez sélectionné ${sessionsPerWeek} séances/semaine mais seulement ${days.length} jours disponibles`
                );
            }
        }

        if (!formData.equipment_access) {
            errors.push('Veuillez indiquer le type de matériel disponible');
        }

        if (!formData.training_location) {
            errors.push("Veuillez indiquer le lieu d'entraînement");
        }

        // Vérifier qu'au moins un créneau horaire est sélectionné
        const hasTimeSlot =
            formData.time_slot_morning ||
            formData.time_slot_noon ||
            formData.time_slot_afternoon ||
            formData.time_slot_evening;
        if (!hasTimeSlot) {
            errors.push('Veuillez sélectionner au moins un créneau horaire');
        }

        return errors;
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgrammingStep4;
} else {
    window.ProgrammingStep4 = ProgrammingStep4;
}
