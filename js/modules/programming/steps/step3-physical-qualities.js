/**
 * ÉTAPE 3 : QUALITÉS PHYSIQUES PRIORITAIRES
 * Sélection 1-3 qualités à développer en priorité
 */

const ProgrammingStep3 = {
    /**
     * Rendu de l'étape 3
     * @param state
     */
    render(state) {
        const selectedQualities = state.formData.physical_qualities
            ? state.formData.physical_qualities.split(',').filter(q => q)
            : [];

        return `
            <div class="step-container">
                <h2 class="step-title">🎯 Qualités Physiques Prioritaires</h2>
                <p class="step-description">Sélectionnez 1 à 3 qualités que vous souhaitez développer en priorité</p>

                <form class="form-grid" id="step3Form">
                    <div class="form-group full-width">
                        <div class="qualities-grid">
                            ${this.renderQualityCards(selectedQualities)}
                        </div>
                        <input type="hidden" name="physical_qualities" value="${selectedQualities.join(',')}">
                    </div>

                    ${
                        selectedQualities.length > 0
                            ? `
                        <div class="form-section full-width">
                            <h3 class="section-title"><i class="fas fa-percentage"></i> Répartition dans le programme</h3>
                            <div class="distribution-container">
                                ${this.renderDistributionSliders(selectedQualities, state.formData)}
                            </div>
                            <div class="distribution-chart">
                                <canvas id="qualitiesChart"></canvas>
                            </div>
                        </div>
                    `
                            : `
                        <div class="info-box">
                            <i class="fas fa-arrow-up"></i>
                            <p>Sélectionnez au moins 1 qualité physique à développer</p>
                        </div>
                    `
                    }
                </form>
            </div>
        `;
    },

    /**
     * Rendu des cartes qualités
     * @param selectedQualities
     */
    renderQualityCards(selectedQualities) {
        const qualities = [
            {
                id: 'force-max',
                name: 'Force Maximale',
                icon: '🏋️',
                description: '1RM, force concentrique pure',
                methods: 'Max effort 1-3 reps, clusters, isométrie'
            },
            {
                id: 'puissance',
                name: 'Puissance',
                icon: '⚡',
                description: 'Force × Vitesse',
                methods: 'Pliométrie, Olympic lifts, ballistic training'
            },
            {
                id: 'explosivite',
                name: 'Explosivité / Détente',
                icon: '🦘',
                description: 'RFD (Rate of Force Development)',
                methods: 'Depth jumps, sprint courts, PAP'
            },
            {
                id: 'vitesse',
                name: 'Vitesse / Vivacité',
                icon: '💨',
                description: 'Vitesse maximale, agilité',
                methods: 'Sprints, COD drills, ladder drills'
            },
            {
                id: 'endurance-aerobie',
                name: 'Endurance Aérobie',
                icon: '🫁',
                description: 'VO2max, capacité aérobie',
                methods: 'Long runs Z2, tempo runs, intervals VO2max'
            },
            {
                id: 'endurance-anaerobie',
                name: 'Endurance Anaérobie',
                icon: '🔥',
                description: 'Capacité lactique, tolérance acidose',
                methods: 'HIIT, Tabata, répétitions courtes haute intensité'
            },
            {
                id: 'force-endurance',
                name: 'Force-Endurance',
                icon: '💪',
                description: 'Répétitions modérées, résistance fatigue',
                methods: '10-20 reps, circuits, AMRAP'
            },
            {
                id: 'hypertrophie',
                name: 'Hypertrophie',
                icon: '🦾',
                description: 'Gain masse musculaire',
                methods: '8-12 reps, tempo lent, TUT élevé'
            },
            {
                id: 'mobilite',
                name: 'Mobilité / Souplesse',
                icon: '🧘',
                description: 'ROM articulaire, flexibilité',
                methods: 'Stretching, yoga, FRC'
            }
        ];

        return qualities
            .map(quality => {
                const isSelected = selectedQualities.includes(quality.id);
                return `
                <div class="quality-card ${isSelected ? 'selected' : ''}"
                     onclick="ProgrammingPro.toggleQuality('${quality.id}')">
                    <div class="quality-icon-large">${quality.icon}</div>
                    <div class="quality-name">${quality.name}</div>
                    <div class="quality-desc">${quality.description}</div>
                    <div class="quality-methods">${quality.methods}</div>
                    ${isSelected ? '<div class="selected-badge"><i class="fas fa-check"></i></div>' : ''}
                </div>
            `;
            })
            .join('');
    },

    /**
     * Rendu des sliders de répartition
     * @param selectedQualities
     * @param formData
     */
    renderDistributionSliders(selectedQualities, formData) {
        const total = selectedQualities.length;
        const defaultPercent = Math.floor(100 / total);

        return selectedQualities
            .map((qualityId, index) => {
                const quality = this.getQualityName(qualityId);
                const percent = formData[`quality_percent_${qualityId}`] || defaultPercent;

                return `
                <div class="distribution-item">
                    <label class="form-label">
                        <span>${quality}</span>
                        <span class="percent-value">${percent}%</span>
                    </label>
                    <input type="range"
                           name="quality_percent_${qualityId}"
                           class="distribution-slider"
                           min="0"
                           max="100"
                           step="5"
                           value="${percent}"
                           onchange="ProgrammingPro.updateDistribution()">
                </div>
            `;
            })
            .join('');
    },

    /**
     * Obtenir le nom d'une qualité
     * @param id
     */
    getQualityName(id) {
        const names = {
            'force-max': 'Force Maximale',
            puissance: 'Puissance',
            explosivite: 'Explosivité',
            vitesse: 'Vitesse',
            'endurance-aerobie': 'Endurance Aérobie',
            'endurance-anaerobie': 'Endurance Anaérobie',
            'force-endurance': 'Force-Endurance',
            hypertrophie: 'Hypertrophie',
            mobilite: 'Mobilité'
        };
        return names[id] || id;
    },

    /**
     * Validation de l'étape
     * @param formData
     */
    validate(formData) {
        const errors = [];
        const qualities = formData.physical_qualities
            ? formData.physical_qualities.split(',').filter(q => q)
            : [];

        if (qualities.length === 0) {
            errors.push('Veuillez sélectionner au moins 1 qualité physique');
        }

        if (qualities.length > 3) {
            errors.push('Maximum 3 qualités physiques pour une progression optimale');
        }

        // Validation distribution
        if (qualities.length > 0) {
            let totalPercent = 0;
            qualities.forEach(quality => {
                const percent = parseInt(formData[`quality_percent_${quality}`] || 0);
                totalPercent += percent;
            });

            if (totalPercent !== 100) {
                errors.push(`La répartition doit totaliser 100% (actuellement ${totalPercent}%)`);
            }
        }

        return errors;
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgrammingStep3;
} else {
    window.ProgrammingStep3 = ProgrammingStep3;
}
