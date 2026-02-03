/**
 * PROGRAM VALIDATION SYSTEM
 * Système de validation pré-génération avec fenêtre d'erreurs/warnings
 * Vérifie tous les problèmes AVANT de générer le PDF
 */

const ProgramValidation = {
    /**
     * Valider le programme complet avant génération PDF
     * Retourne { valid: boolean, errors: [], warnings: [] }
     * @param programData
     * @param formData
     * @param athlete
     */
    async validateProgram(programData, formData, athlete) {
        console.log('🔍 Validation du programme...');

        const validation = {
            valid: true,
            errors: [],
            warnings: [],
            suggestions: []
        };

        // 1. Validation données de base
        this.validateBasicData(programData, formData, athlete, validation);

        // 2. Validation structure semaines
        this.validateWeeks(programData, validation);

        // 3. Validation séances
        this.validateSessions(programData, validation);

        // 4. Validation exercices et inventaire
        await this.validateExercises(programData, validation);

        // 5. Validation cohérence périodisation
        this.validatePeriodization(programData, formData, validation);

        // 6. Validation volume total
        this.validateVolume(programData, formData, validation);

        // Si des erreurs critiques, invalider
        if (validation.errors.length > 0) {
            validation.valid = false;
        }

        console.log('📊 Résultat validation:', validation);
        return validation;
    },

    /**
     * Validation données de base
     * @param programData
     * @param formData
     * @param athlete
     * @param validation
     */
    validateBasicData(programData, formData, athlete, validation) {
        // Titre programme
        if (!programData.program_title || programData.program_title.trim() === '') {
            validation.errors.push({
                type: 'basic_data',
                field: 'program_title',
                message: "Le programme n'a pas de titre",
                fix: 'Générer un titre automatique'
            });
        }

        // Athlète
        if (!athlete.name || athlete.name.trim() === '') {
            validation.errors.push({
                type: 'basic_data',
                field: 'athlete_name',
                message: "Nom de l'athlète manquant",
                fix: 'Utiliser "Athlète" par défaut'
            });
        }

        // Sport
        if (!formData.sport) {
            validation.errors.push({
                type: 'basic_data',
                field: 'sport',
                message: 'Sport non défini',
                fix: 'Impossible de continuer sans sport'
            });
        }

        // Durée
        if (!formData.duration_weeks || formData.duration_weeks < 1) {
            validation.errors.push({
                type: 'basic_data',
                field: 'duration_weeks',
                message: 'Durée du programme invalide',
                fix: 'Impossible de continuer sans durée'
            });
        }

        // Mode dégradé détecté
        if (programData.athlete_summary && programData.athlete_summary.includes('mode dégradé')) {
            validation.warnings.push({
                type: 'degraded_mode',
                message: 'Programme généré en mode dégradé - API Claude non disponible',
                impact: 'Séances génériques au lieu de séances personnalisées',
                recommendation: 'Vérifier la clé API Claude et régénérer le programme'
            });
        }
    },

    /**
     * Validation structure semaines
     * @param programData
     * @param validation
     */
    validateWeeks(programData, validation) {
        if (!programData.weeks || !Array.isArray(programData.weeks)) {
            validation.errors.push({
                type: 'structure',
                field: 'weeks',
                message: 'Structure des semaines invalide',
                fix: 'Impossible de continuer sans semaines'
            });
            return;
        }

        if (programData.weeks.length === 0) {
            validation.errors.push({
                type: 'structure',
                field: 'weeks',
                message: 'Aucune semaine générée',
                fix: 'Impossible de créer un programme vide'
            });
            return;
        }

        // Vérifier chaque semaine
        programData.weeks.forEach((week, index) => {
            const weekNum = index + 1;

            // Phase manquante
            if (!week.phase || week.phase.trim() === '') {
                validation.warnings.push({
                    type: 'week_data',
                    week: weekNum,
                    message: `Semaine ${weekNum}: Phase non définie`,
                    fix: 'Utiliser phase générique'
                });
            }

            // Focus manquant
            if (!week.focus || week.focus.trim() === '') {
                validation.warnings.push({
                    type: 'week_data',
                    week: weekNum,
                    message: `Semaine ${weekNum}: Focus non défini`,
                    fix: 'Utiliser focus générique'
                });
            }

            // Dates
            if (!week.start_date || !week.end_date) {
                validation.warnings.push({
                    type: 'week_data',
                    week: weekNum,
                    message: `Semaine ${weekNum}: Dates manquantes`,
                    fix: 'Calculer automatiquement'
                });
            }
        });
    },

    /**
     * Validation séances
     * @param programData
     * @param validation
     */
    validateSessions(programData, validation) {
        let totalSessions = 0;
        let emptySessions = 0;

        programData.weeks.forEach((week, weekIndex) => {
            const weekNum = weekIndex + 1;

            if (!week.sessions || !Array.isArray(week.sessions)) {
                validation.errors.push({
                    type: 'sessions',
                    week: weekNum,
                    message: `Semaine ${weekNum}: Aucune séance`,
                    fix: 'Créer des séances depuis templates'
                });
                return;
            }

            totalSessions += week.sessions.length;

            week.sessions.forEach((session, sessionIndex) => {
                const sessionId = `S${weekNum}.${sessionIndex + 1}`;

                // Titre manquant
                if (!session.title || session.title.trim() === '') {
                    validation.warnings.push({
                        type: 'session_data',
                        session: sessionId,
                        message: `${sessionId}: Titre de séance manquant`,
                        fix: 'Utiliser "Séance X"'
                    });
                }

                // Durée invalide
                if (!session.duration_minutes || session.duration_minutes < 10) {
                    validation.warnings.push({
                        type: 'session_data',
                        session: sessionId,
                        message: `${sessionId}: Durée invalide (${session.duration_minutes}min)`,
                        fix: 'Utiliser 60min par défaut'
                    });
                }

                // Type manquant
                if (!session.type || session.type.trim() === '') {
                    validation.warnings.push({
                        type: 'session_data',
                        session: sessionId,
                        message: `${sessionId}: Type de séance manquant`,
                        fix: 'Utiliser "Mixte"'
                    });
                }

                // RPE manquant
                if (!session.rpe_target) {
                    validation.suggestions.push({
                        type: 'session_quality',
                        session: sessionId,
                        message: `${sessionId}: RPE cible non défini`,
                        suggestion: 'Ajouter un RPE pour meilleur suivi'
                    });
                }

                // Exercices vides
                const warmupCount = session.warmup?.exercises?.length || 0;
                const mainCount = session.main_work?.exercises?.length || 0;
                const cooldownCount = session.cooldown?.exercises?.length || 0;
                const totalExercises = warmupCount + mainCount + cooldownCount;

                if (totalExercises === 0) {
                    emptySessions++;
                    validation.errors.push({
                        type: 'session_content',
                        session: sessionId,
                        message: `${sessionId}: Séance vide (0 exercices)`,
                        fix: 'Générer exercices depuis inventory et templates',
                        critical: true
                    });
                } else if (totalExercises < 3) {
                    validation.warnings.push({
                        type: 'session_content',
                        session: sessionId,
                        message: `${sessionId}: Très peu d'exercices (${totalExercises})`,
                        fix: "Enrichir avec plus d'exercices"
                    });
                }

                // Vérifier cohérence durées
                const warmupDuration = session.warmup?.duration_minutes || 0;
                const mainDuration = session.main_work?.duration_minutes || 0;
                const cooldownDuration = session.cooldown?.duration_minutes || 0;
                const totalDuration = warmupDuration + mainDuration + cooldownDuration;

                if (totalDuration !== session.duration_minutes) {
                    validation.warnings.push({
                        type: 'session_duration',
                        session: sessionId,
                        message: `${sessionId}: Incohérence durées (total blocs: ${totalDuration}min, séance: ${session.duration_minutes}min)`,
                        fix: 'Ajuster durées des blocs'
                    });
                }
            });
        });

        // Statistiques globales
        if (emptySessions > 0) {
            validation.errors.push({
                type: 'global_sessions',
                message: `${emptySessions} séance(s) vide(s) sur ${totalSessions} total`,
                fix: 'CRITIQUE: Générer contenu pour toutes les séances',
                critical: true
            });
        }

        if (totalSessions === 0) {
            validation.errors.push({
                type: 'global_sessions',
                message: 'AUCUNE séance dans tout le programme',
                fix: 'CRITIQUE: Impossible de créer un programme sans séances',
                critical: true
            });
        }
    },

    /**
     * Validation exercices et inventaire
     * @param programData
     * @param validation
     */
    async validateExercises(programData, validation) {
        // Charger inventaire si disponible
        let inventory = null;
        try {
            if (window.inventoryData) {
                inventory = window.inventoryData;
            } else {
                const response = await fetch('data/laskali-inventory.json');
                inventory = await response.json();
            }
        } catch (error) {
            validation.warnings.push({
                type: 'inventory',
                message: "Impossible de charger l'inventaire pour validation",
                impact: 'Ne peut pas vérifier si exercices existent dans la base'
            });
            return;
        }

        // Vérifier chaque exercice
        let unknownExercises = new Set();
        let totalExercises = 0;

        programData.weeks.forEach((week, weekIndex) => {
            week.sessions?.forEach((session, sessionIndex) => {
                const sessionId = `S${weekIndex + 1}.${sessionIndex + 1}`;

                // Warmup
                session.warmup?.exercises?.forEach(ex => {
                    totalExercises++;
                    if (ex.name && !this.exerciseExistsInInventory(ex.name, inventory)) {
                        unknownExercises.add(ex.name);
                    }
                });

                // Main work
                session.main_work?.exercises?.forEach(ex => {
                    totalExercises++;
                    if (ex.name && !this.exerciseExistsInInventory(ex.name, inventory)) {
                        unknownExercises.add(ex.name);
                    }
                });

                // Cooldown
                session.cooldown?.exercises?.forEach(ex => {
                    totalExercises++;
                    if (ex.name && !this.exerciseExistsInInventory(ex.name, inventory)) {
                        unknownExercises.add(ex.name);
                    }
                });
            });
        });

        if (unknownExercises.size > 0) {
            validation.warnings.push({
                type: 'exercises_inventory',
                message: `${unknownExercises.size} exercice(s) non trouvé(s) dans l'inventaire`,
                exercises: Array.from(unknownExercises),
                impact: 'Ces exercices sont génériques et ne seront pas liés à la base de données'
            });
        }
    },

    /**
     * Vérifier si exercice existe dans inventaire
     * @param exerciseName
     * @param inventory
     */
    exerciseExistsInInventory(exerciseName, inventory) {
        if (!inventory) {
            return false;
        }

        const normalized = exerciseName.toLowerCase().trim();

        // Chercher dans toutes les catégories
        for (const category in inventory) {
            const exercises = inventory[category];
            if (Array.isArray(exercises)) {
                if (
                    exercises.some(
                        ex =>
                            ex.name?.toLowerCase().trim() === normalized ||
                            ex.variations?.some(v => v.toLowerCase().trim() === normalized)
                    )
                ) {
                    return true;
                }
            }
        }

        return false;
    },

    /**
     * Validation périodisation
     * @param programData
     * @param formData
     * @param validation
     */
    validatePeriodization(programData, formData, validation) {
        if (!formData.periodization_type) {
            validation.suggestions.push({
                type: 'periodization',
                message: 'Aucun type de périodisation défini',
                suggestion: 'Définir une périodisation pour meilleure progression'
            });
            return;
        }

        // Vérifier distribution phases
        const totalWeeks = programData.weeks.length;
        const ppgWeeks = parseInt(formData.ppg_weeks || 0);
        const ppoWeeks = parseInt(formData.ppo_weeks || 0);
        const ppsWeeks = parseInt(formData.pps_weeks || 0);
        const sumPhases = ppgWeeks + ppoWeeks + ppsWeeks;

        if (sumPhases !== totalWeeks) {
            validation.warnings.push({
                type: 'periodization',
                message: `Incohérence périodisation: ${ppgWeeks}+${ppoWeeks}+${ppsWeeks} = ${sumPhases} semaines, attendu: ${totalWeeks}`,
                fix: 'Ajuster répartition des phases'
            });
        }

        // Vérifier présence compétition si PPS
        if (ppsWeeks > 0 && !formData.competition_date) {
            validation.warnings.push({
                type: 'periodization',
                message: 'Phase PPS (affûtage) sans date de compétition',
                impact: "La phase d'affûtage est optimale avant une compétition"
            });
        }
    },

    /**
     * Validation volume
     * @param programData
     * @param formData
     * @param validation
     */
    validateVolume(programData, formData, validation) {
        const sessionsPerWeek = parseInt(formData.sessions_per_week || 3);
        const targetDuration = parseInt(formData.session_duration || 60);

        programData.weeks.forEach((week, weekIndex) => {
            const weekNum = weekIndex + 1;
            const actualSessions = week.sessions?.length || 0;

            // Nombre de séances différent du target
            if (actualSessions !== sessionsPerWeek) {
                validation.warnings.push({
                    type: 'volume',
                    week: weekNum,
                    message: `Semaine ${weekNum}: ${actualSessions} séances générées, attendu: ${sessionsPerWeek}`,
                    fix: 'Ajuster nombre de séances'
                });
            }

            // Vérifier durées séances
            week.sessions?.forEach((session, sessionIndex) => {
                const diff = Math.abs((session.duration_minutes || 0) - targetDuration);
                if (diff > 15) {
                    // Tolérance 15min
                    validation.suggestions.push({
                        type: 'volume',
                        session: `S${weekNum}.${sessionIndex + 1}`,
                        message: `Durée séance ${session.duration_minutes}min diffère du target ${targetDuration}min`,
                        suggestion: 'Vérifier si intentionnel ou ajuster'
                    });
                }
            });
        });
    },

    /**
     * Afficher fenêtre de validation avec erreurs/warnings
     * Retourne true si user veut continuer, false si annuler
     * @param validationResult
     */
    async showValidationModal(validationResult) {
        return new Promise(resolve => {
            const modal = document.createElement('div');
            modal.id = 'validation-modal'; // Ajout ID pour sélection facile
            modal.style.cssText = `
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.9);
                backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 99999;
                padding: 2rem;
            `;

            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 2px solid ${validationResult.errors.length > 0 ? '#ff4444' : '#ffa500'};
                border-radius: 1.5rem;
                max-width: 900px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 0 60px ${validationResult.errors.length > 0 ? 'rgba(255, 68, 68, 0.4)' : 'rgba(255, 165, 0, 0.4)'};
            `;

            const errors = validationResult.errors || [];
            const warnings = validationResult.warnings || [];
            const suggestions = validationResult.suggestions || [];
            const criticalErrors = errors.filter(e => e.critical);

            modalContent.innerHTML = `
                <!-- Header -->
                <div style="background: linear-gradient(135deg, ${errors.length > 0 ? '#ff4444' : '#ffa500'}, ${errors.length > 0 ? '#cc0000' : '#ff8c00'}); padding: 2rem; border-radius: 1.5rem 1.5rem 0 0;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <h2 style="font-size: 2rem; font-weight: 800; color: white; margin: 0 0 0.5rem 0;">
                                <i class="fas fa-${errors.length > 0 ? 'exclamation-triangle' : 'exclamation-circle'}" style="margin-right: 1rem;"></i>
                                Validation du Programme
                            </h2>
                            <p style="color: rgba(255,255,255,0.9); font-size: 1rem; margin: 0; font-weight: 600;">
                                ${
                                    errors.length > 0
                                        ? `${errors.length} erreur(s) détectée(s) - Action requise`
                                        : warnings.length > 0
                                          ? `${warnings.length} avertissement(s) - Vérification recommandée`
                                          : 'Programme valide - Quelques suggestions'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Contenu -->
                <div style="padding: 2rem;">

                    ${
                        criticalErrors.length > 0
                            ? `
                    <!-- Erreurs critiques -->
                    <div style="background: rgba(255, 68, 68, 0.15); border: 2px solid #ff4444; border-radius: 1rem; padding: 1.5rem; margin-bottom: 1.5rem;">
                        <h3 style="color: #ff4444; font-size: 1.25rem; font-weight: 700; margin: 0 0 1rem 0;">
                            <i class="fas fa-times-circle" style="margin-right: 0.5rem;"></i>
                            Erreurs Critiques (${criticalErrors.length})
                        </h3>
                        <p style="color: #ffaaaa; margin-bottom: 1rem; font-size: 0.9rem;">
                            Ces erreurs DOIVENT être corrigées avant génération du PDF
                        </p>
                        ${criticalErrors
                            .map(
                                err => `
                            <div style="background: rgba(0,0,0,0.3); border-left: 4px solid #ff4444; padding: 1rem; margin-bottom: 0.75rem; border-radius: 0.5rem;">
                                <div style="color: white; font-weight: 600; margin-bottom: 0.25rem;">
                                    ${err.message}
                                </div>
                                ${
                                    err.session || err.week
                                        ? `<div style="color: #aaa; font-size: 0.85rem; margin-bottom: 0.25rem;">
                                    ${err.session ? `Séance: ${err.session}` : `Semaine: ${err.week}`}
                                </div>`
                                        : ''
                                }
                                <div style="color: #4ade80; font-size: 0.85rem; margin-top: 0.5rem;">
                                    <i class="fas fa-wrench" style="margin-right: 0.5rem;"></i>
                                    Solution: ${err.fix}
                                </div>
                            </div>
                        `
                            )
                            .join('')}
                    </div>
                    `
                            : ''
                    }

                    ${
                        errors.filter(e => !e.critical).length > 0
                            ? `
                    <!-- Erreurs non-critiques -->
                    <div style="background: rgba(255, 165, 0, 0.15); border: 2px solid #ffa500; border-radius: 1rem; padding: 1.5rem; margin-bottom: 1.5rem;">
                        <h3 style="color: #ffa500; font-size: 1.25rem; font-weight: 700; margin: 0 0 1rem 0;">
                            <i class="fas fa-exclamation-triangle" style="margin-right: 0.5rem;"></i>
                            Erreurs (${errors.filter(e => !e.critical).length})
                        </h3>
                        ${errors
                            .filter(e => !e.critical)
                            .map(
                                err => `
                            <div style="background: rgba(0,0,0,0.3); border-left: 4px solid #ffa500; padding: 1rem; margin-bottom: 0.75rem; border-radius: 0.5rem;">
                                <div style="color: white; font-weight: 600; margin-bottom: 0.25rem;">
                                    ${err.message}
                                </div>
                                ${
                                    err.session || err.week
                                        ? `<div style="color: #aaa; font-size: 0.85rem; margin-bottom: 0.25rem;">
                                    ${err.session ? `Séance: ${err.session}` : `Semaine: ${err.week}`}
                                </div>`
                                        : ''
                                }
                                <div style="color: #4ade80; font-size: 0.85rem; margin-top: 0.5rem;">
                                    <i class="fas fa-tools" style="margin-right: 0.5rem;"></i>
                                    Correction: ${err.fix}
                                </div>
                            </div>
                        `
                            )
                            .join('')}
                    </div>
                    `
                            : ''
                    }

                    ${
                        warnings.length > 0
                            ? `
                    <!-- Avertissements -->
                    <div style="background: rgba(255, 193, 7, 0.1); border: 1px solid #ffc107; border-radius: 1rem; padding: 1.5rem; margin-bottom: 1.5rem;">
                        <h3 style="color: #ffc107; font-size: 1.1rem; font-weight: 700; margin: 0 0 1rem 0;">
                            <i class="fas fa-exclamation-circle" style="margin-right: 0.5rem;"></i>
                            Avertissements (${warnings.length})
                        </h3>
                        <div style="max-height: 200px; overflow-y: auto;">
                            ${warnings
                                .map(
                                    warn => `
                                <div style="background: rgba(0,0,0,0.2); border-left: 3px solid #ffc107; padding: 0.75rem; margin-bottom: 0.5rem; border-radius: 0.5rem;">
                                    <div style="color: white; font-size: 0.9rem; margin-bottom: 0.25rem;">
                                        ${warn.message}
                                    </div>
                                    ${
                                        warn.fix
                                            ? `<div style="color: #a0a0a0; font-size: 0.8rem;">
                                        → ${warn.fix}
                                    </div>`
                                            : ''
                                    }
                                </div>
                            `
                                )
                                .join('')}
                        </div>
                    </div>
                    `
                            : ''
                    }

                    ${
                        suggestions.length > 0
                            ? `
                    <!-- Suggestions -->
                    <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid #3b82f6; border-radius: 1rem; padding: 1.5rem; margin-bottom: 1.5rem;">
                        <h3 style="color: #3b82f6; font-size: 1.1rem; font-weight: 700; margin: 0 0 1rem 0;">
                            <i class="fas fa-lightbulb" style="margin-right: 0.5rem;"></i>
                            Suggestions d'amélioration (${suggestions.length})
                        </h3>
                        <div style="max-height: 150px; overflow-y: auto;">
                            ${suggestions
                                .map(
                                    sug => `
                                <div style="color: #aaa; font-size: 0.85rem; margin-bottom: 0.5rem; padding-left: 1rem; border-left: 2px solid #3b82f6;">
                                    ${sug.message}
                                </div>
                            `
                                )
                                .join('')}
                        </div>
                    </div>
                    `
                            : ''
                    }

                    ${
                        criticalErrors.length > 0
                            ? `
                    <div style="background: rgba(255, 68, 68, 0.2); border: 1px solid #ff4444; border-radius: 0.75rem; padding: 1rem; margin-top: 1.5rem;">
                        <p style="color: #ff4444; font-weight: 600; margin: 0; text-align: center;">
                            <i class="fas fa-ban" style="margin-right: 0.5rem;"></i>
                            Génération PDF impossible avec des erreurs critiques
                        </p>
                    </div>
                    `
                            : ''
                    }

                </div>

                <!-- Actions -->
                <div style="padding: 0 2rem 2rem 2rem; display: flex; gap: 1rem; justify-content: flex-end;">
                    <button onclick="document.getElementById('validation-modal').dispatchEvent(new CustomEvent('cancel'))"
                            style="padding: 1rem 2rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        <i class="fas fa-times" style="margin-right: 0.5rem;"></i>
                        Annuler
                    </button>

                    ${
                        criticalErrors.length === 0
                            ? `
                    <button onclick="document.getElementById('validation-modal').dispatchEvent(new CustomEvent('fix'))"
                            style="padding: 1rem 2rem; background: linear-gradient(135deg, #ffa500, #ff8c00); border: none; color: white; border-radius: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        <i class="fas fa-magic" style="margin-right: 0.5rem;"></i>
                        Corriger Automatiquement
                    </button>
                    <button onclick="document.getElementById('validation-modal').dispatchEvent(new CustomEvent('continue'))"
                            style="padding: 1rem 2rem; background: linear-gradient(135deg, #4ade80, #22c55e); border: none; color: white; border-radius: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        <i class="fas fa-check" style="margin-right: 0.5rem;"></i>
                        Continuer Malgré Tout
                    </button>
                    `
                            : `
                    <button onclick="document.getElementById('validation-modal').dispatchEvent(new CustomEvent('fix'))"
                            style="padding: 1rem 2rem; background: linear-gradient(135deg, #4ade80, #22c55e); border: none; color: white; border-radius: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        <i class="fas fa-wrench" style="margin-right: 0.5rem;"></i>
                        Corriger et Régénérer
                    </button>
                    `
                    }
                </div>
            `;

            modal.appendChild(modalContent);
            document.body.appendChild(modal);

            // Events
            modal.addEventListener('cancel', () => {
                modal.remove();
                resolve({ action: 'cancel' });
            });

            modal.addEventListener('continue', () => {
                modal.remove();
                resolve({ action: 'continue' });
            });

            modal.addEventListener('fix', () => {
                modal.remove();
                resolve({ action: 'fix' });
            });
        });
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgramValidation;
} else {
    window.ProgramValidation = ProgramValidation;
}
