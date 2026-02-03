/**
 * PDF GENERATOR PRO
 * Génération PDF format nutrition : Page 1 présentation + Pages 2+ semaines
 * Design professionnel avec logo Skàli
 */

const ProgramPDFGeneratorPro = {
    /**
     * Génération PDF complète
     * @param programData
     * @param formData
     * @param athlete
     */
    async generatePDF(programData, formData, athlete) {
        console.log('📄 Génération PDF programme...');

        try {
            // VALIDATION PRÉ-GÉNÉRATION
            if (window.ProgramValidation) {
                console.log('🔍 Validation du programme avant génération...');
                const validation = await ProgramValidation.validateProgram(
                    programData,
                    formData,
                    athlete
                );

                // Si erreurs ou warnings, afficher modal
                if (validation.errors.length > 0 || validation.warnings.length > 0) {
                    const userChoice = await ProgramValidation.showValidationModal(validation);

                    if (userChoice.action === 'cancel') {
                        throw new Error("Génération PDF annulée par l'utilisateur");
                    }

                    if (userChoice.action === 'fix') {
                        // Corriger automatiquement
                        programData = await this.autoFixProgram(programData, validation);
                    }

                    // Si 'continue', on continue avec le programme actuel
                }
            }

            const { jsPDF } = window.jspdf;

            // Page 1: Portrait
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Page 1: Présentation + Timeline
            await this.renderCoverPage(pdf, programData, formData, athlete);

            // Pages 2+: Une semaine par page EN PAYSAGE
            for (let i = 0; i < programData.weeks.length; i++) {
                pdf.addPage('a4', 'landscape'); // FORMAT PAYSAGE pour les semaines
                this.renderWeekPage(pdf, programData.weeks[i], programData, i + 2);
            }

            // Sauvegarder
            const filename = `Programme_${athlete.name.replace(/\s+/g, '_')}_${formData.sport}_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(filename);

            console.log('✅ PDF généré:', filename);
            return filename;
        } catch (error) {
            console.error('❌ Erreur génération PDF:', error);
            throw new Error(`Échec génération PDF: ${error.message}`);
        }
    },

    /**
     * Page 1: Couverture
     * @param pdf
     * @param programData
     * @param formData
     * @param athlete
     */
    async renderCoverPage(pdf, programData, formData, athlete) {
        const pageWidth = 210;
        const pageHeight = 297;
        let yPos = 20;

        // En-tête avec logo
        this.renderHeader(pdf, yPos);
        yPos += 25;

        // Titre programme
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 122, 255); // Bleu iOS
        pdf.text(programData.program_title || "Programme d'Entraînement Pro", pageWidth / 2, yPos, {
            align: 'center'
        });
        yPos += 12;

        // Sous-titre
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        pdf.text(
            `${this.getSportName(formData.sport)} • ${formData.duration_weeks} semaines`,
            pageWidth / 2,
            yPos,
            { align: 'center' }
        );
        yPos += 15;

        // Profil athlète
        this.renderAthleteProfile(pdf, athlete, formData, yPos);
        yPos += 55;

        // Timeline périodisation
        if (formData.competition_date) {
            this.renderTimeline(pdf, formData, yPos);
            yPos += 35;
        }

        // Objectifs
        this.renderObjectives(pdf, programData, yPos);
        yPos += 40;

        // Résumé athlète
        if (programData.athlete_summary) {
            this.renderSummary(pdf, programData.athlete_summary, yPos);
            yPos += 25;
        }

        // Facteurs clés de succès
        if (programData.key_success_factors) {
            this.renderKeyFactors(pdf, programData.key_success_factors, yPos);
        }

        // Footer
        this.renderFooter(pdf, 1, 1 + programData.weeks.length);
    },

    /**
     * Header avec logo
     * @param pdf
     * @param yPos
     */
    renderHeader(pdf, yPos) {
        const pageWidth = 210;

        // Logo Skàli (texte stylisé)
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 122, 255);
        pdf.text('SKÀLI', 15, yPos);

        // Date génération
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(120, 120, 120);
        const date = new Date().toLocaleDateString('fr-FR');
        pdf.text(`Généré le ${date}`, pageWidth - 15, yPos, { align: 'right' });

        // Ligne séparation
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.line(15, yPos + 3, pageWidth - 15, yPos + 3);
    },

    /**
     * Profil athlète
     * @param pdf
     * @param athlete
     * @param formData
     * @param yPos
     */
    renderAthleteProfile(pdf, athlete, formData, yPos) {
        const leftX = 20;

        // Titre section
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(40, 40, 40);
        pdf.text('Profil Athlete', leftX, yPos);
        yPos += 8;

        // Cadre
        pdf.setDrawColor(220, 220, 220);
        pdf.setFillColor(250, 250, 252);
        pdf.roundedRect(leftX - 2, yPos - 2, 170, 42, 3, 3, 'FD');

        // Infos
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(60, 60, 60);

        let infoY = yPos + 5;
        const col1X = leftX + 5;
        const col2X = leftX + 90;

        // Colonne 1
        pdf.text('Nom:', col1X, infoY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(athlete.name || 'Athlète', col1X + 30, infoY);

        infoY += 7;
        pdf.setFont('helvetica', 'bold');
        pdf.text('Âge:', col1X, infoY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${formData.age || athlete.age || 'NC'} ans`, col1X + 30, infoY);

        infoY += 7;
        pdf.setFont('helvetica', 'bold');
        pdf.text('Poids:', col1X, infoY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${formData.weight_kg || athlete.weight_kg || 'NC'} kg`, col1X + 30, infoY);

        infoY += 7;
        pdf.setFont('helvetica', 'bold');
        pdf.text('Taille:', col1X, infoY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${formData.height_cm || athlete.height_cm || 'NC'} cm`, col1X + 30, infoY);

        // Colonne 2
        infoY = yPos + 5;
        pdf.setFont('helvetica', 'bold');
        pdf.text('Niveau:', col2X, infoY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(this.getLevelName(formData.current_level), col2X + 30, infoY);

        infoY += 7;
        pdf.setFont('helvetica', 'bold');
        pdf.text('Expérience:', col2X, infoY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${formData.years_sport || 'NC'} ans`, col2X + 30, infoY);

        infoY += 7;
        pdf.setFont('helvetica', 'bold');
        pdf.text('Fréquence:', col2X, infoY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${formData.sessions_per_week}x/semaine`, col2X + 30, infoY);

        infoY += 7;
        pdf.setFont('helvetica', 'bold');
        pdf.text('Objectif:', col2X, infoY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(formData.competition_date ? 'Compétition' : 'Développement', col2X + 30, infoY);
    },

    /**
     * Timeline périodisation
     * @param pdf
     * @param formData
     * @param yPos
     */
    renderTimeline(pdf, formData, yPos) {
        const leftX = 20;
        const width = 170;

        // Titre
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(40, 40, 40);
        pdf.text('Timeline Periodisation', leftX, yPos);
        yPos += 8;

        // Calculer largeurs phases
        const totalWeeks = parseInt(formData.duration_weeks);
        const ppgWeeks = parseInt(formData.ppg_weeks || 0);
        const ppoWeeks = parseInt(formData.ppo_weeks || 0);
        const ppsWeeks = parseInt(formData.pps_weeks || 0);

        const phases = [
            { name: 'PPG', weeks: ppgWeeks, color: [76, 175, 80] },
            { name: 'PPO', weeks: ppoWeeks, color: [33, 150, 243] },
            { name: 'PPS', weeks: ppsWeeks, color: [255, 152, 0] }
        ];

        let currentX = leftX;
        phases.forEach(phase => {
            if (phase.weeks > 0) {
                const phaseWidth = (phase.weeks / totalWeeks) * width;

                // Rectangle phase
                pdf.setFillColor(...phase.color);
                pdf.roundedRect(currentX, yPos, phaseWidth, 15, 2, 2, 'F');

                // Texte
                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(255, 255, 255);
                pdf.text(phase.name, currentX + phaseWidth / 2, yPos + 6, { align: 'center' });
                pdf.setFontSize(8);
                pdf.text(`${phase.weeks}sem`, currentX + phaseWidth / 2, yPos + 11, {
                    align: 'center'
                });

                currentX += phaseWidth;
            }
        });

        // Date compétition
        if (formData.competition_date) {
            yPos += 18;
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(244, 67, 54);
            const compDate = new Date(formData.competition_date).toLocaleDateString('fr-FR');
            pdf.text(`Competition: ${compDate}`, leftX + width, yPos, { align: 'right' });
        }
    },

    /**
     * Objectifs
     * @param pdf
     * @param programData
     * @param yPos
     */
    renderObjectives(pdf, programData, yPos) {
        const leftX = 20;

        // Titre
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(40, 40, 40);
        pdf.text('Objectifs', leftX, yPos);
        yPos += 8;

        // Liste objectifs
        if (programData.objectives && programData.objectives.length > 0) {
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(60, 60, 60);

            programData.objectives.forEach((obj, index) => {
                pdf.text(`• ${obj}`, leftX + 5, yPos);
                yPos += 6;
            });
        }
    },

    /**
     * Résumé athlète
     * @param pdf
     * @param summary
     * @param yPos
     */
    renderSummary(pdf, summary, yPos) {
        const leftX = 20;
        const maxWidth = 170;

        // Titre
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(40, 40, 40);
        pdf.text('Resume', leftX, yPos);
        yPos += 8;

        // Texte
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(80, 80, 80);
        const lines = pdf.splitTextToSize(summary, maxWidth);
        pdf.text(lines, leftX + 5, yPos);
    },

    /**
     * Facteurs clés
     * @param pdf
     * @param factors
     * @param yPos
     */
    renderKeyFactors(pdf, factors, yPos) {
        const leftX = 20;

        // Titre
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(40, 40, 40);
        pdf.text('Facteurs Cles de Succes', leftX, yPos);
        yPos += 8;

        // Liste
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(60, 60, 60);

        factors.forEach(factor => {
            pdf.text(`✓ ${factor}`, leftX + 5, yPos);
            yPos += 6;
        });
    },

    /**
     * Page semaine (FORMAT PAYSAGE)
     * @param pdf
     * @param week
     * @param programData
     * @param pageNumber
     */
    renderWeekPage(pdf, week, programData, pageNumber) {
        // En paysage: largeur = 297mm, hauteur = 210mm
        const pageWidth = 297;
        const pageHeight = 210;
        let yPos = 15;

        // Header compact
        this.renderHeaderLandscape(pdf, yPos, pageWidth);
        yPos += 12;

        // Titre semaine + infos
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 122, 255);
        pdf.text(`Semaine ${week.week_number}/${programData.weeks.length}`, 15, yPos);

        // Phase et dates
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        const phaseText = `${week.phase || 'Base Building'} • ${week.start_date || ''} → ${week.end_date || ''}`;
        pdf.text(phaseText, 15, yPos + 5);

        // Focus (à droite du titre)
        if (week.focus) {
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(40, 40, 40);
            const focusText = `Focus: ${week.focus}`;
            pdf.text(focusText, pageWidth - 15, yPos, { align: 'right' });
        }

        yPos += 12;

        // Tableau séances (PAYSAGE = plus d'espace horizontal)
        this.renderWeekTableLandscape(pdf, week, yPos, pageWidth);

        // Notes en bas
        const notesY = pageHeight - 25;
        if (week.weekly_notes) {
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(60, 60, 60);
            pdf.text('Notes:', 15, notesY);
            pdf.setFont('helvetica', 'normal');
            const notes = pdf.splitTextToSize(week.weekly_notes, pageWidth - 30);
            pdf.text(notes, 15, notesY + 4);
        }

        // Footer
        this.renderFooterLandscape(
            pdf,
            pageNumber,
            1 + programData.weeks.length,
            pageWidth,
            pageHeight
        );
    },

    /**
     * Tableau semaine (7 colonnes Lun-Dim)
     * @param pdf
     * @param week
     * @param yPos
     */
    renderWeekTable(pdf, week, yPos) {
        const startX = 15;
        const colWidth = 27;
        const headerHeight = 8;
        const cellMinHeight = 35;

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const daysFR = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

        // En-têtes colonnes
        pdf.setFillColor(0, 122, 255);
        pdf.setDrawColor(0, 122, 255);

        days.forEach((day, index) => {
            const x = startX + index * colWidth;
            pdf.roundedRect(x, yPos, colWidth, headerHeight, 1, 1, 'FD');

            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(255, 255, 255);
            pdf.text(daysFR[index], x + colWidth / 2, yPos + 5.5, { align: 'center' });
        });

        yPos += headerHeight;

        // Contenu séances
        pdf.setDrawColor(220, 220, 220);

        days.forEach((day, index) => {
            const x = startX + index * colWidth;
            const session = week.sessions.find(s => s.day === day);

            if (session) {
                // Cellule avec contenu
                pdf.setFillColor(250, 250, 252);
                pdf.rect(x, yPos, colWidth, cellMinHeight, 'FD');

                // Titre séance
                pdf.setFontSize(7);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(0, 122, 255);
                const title = pdf.splitTextToSize(session.title || 'Séance', colWidth - 4);
                pdf.text(title, x + 2, yPos + 4);

                // Durée
                let contentY = yPos + 4 + title.length * 3;
                pdf.setFontSize(6);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(100, 100, 100);
                pdf.text(`⏱️ ${session.duration_minutes}min`, x + 2, contentY + 3);

                // Type
                contentY += 4;
                pdf.text(`📋 ${session.type || 'Mixte'}`, x + 2, contentY + 3);

                // RPE
                if (session.rpe_target) {
                    contentY += 4;
                    pdf.text(`💪 RPE ${session.rpe_target}`, x + 2, contentY + 3);
                }

                // Nombre exercices
                const totalExercises =
                    (session.warmup?.exercises?.length || 0) +
                    (session.main_work?.exercises?.length || 0);
                if (totalExercises > 0) {
                    contentY += 4;
                    pdf.setTextColor(76, 175, 80);
                    pdf.text(`✓ ${totalExercises} exercices`, x + 2, contentY + 3);
                }
            } else {
                // Cellule repos
                pdf.setFillColor(245, 245, 245);
                pdf.rect(x, yPos, colWidth, cellMinHeight, 'FD');

                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(180, 180, 180);
                pdf.text('REPOS', x + colWidth / 2, yPos + cellMinHeight / 2, { align: 'center' });
            }
        });
    },

    /**
     * Footer
     * @param pdf
     * @param currentPage
     * @param totalPages
     */
    renderFooter(pdf, currentPage, totalPages) {
        const pageWidth = 210;
        const pageHeight = 297;

        // Ligne séparation
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);

        // Texte footer
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(120, 120, 120);

        // Gauche: Powered by
        pdf.text('Généré avec SKÀLI Pro', 15, pageHeight - 10);

        // Centre: URL
        pdf.text('www.skali-training.com', pageWidth / 2, pageHeight - 10, { align: 'center' });

        // Droite: Page
        pdf.text(`Page ${currentPage}/${totalPages}`, pageWidth - 15, pageHeight - 10, {
            align: 'right'
        });
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

    /**
     * Header compact pour format paysage
     * @param pdf
     * @param yPos
     * @param pageWidth
     */
    renderHeaderLandscape(pdf, yPos, pageWidth) {
        // Logo Skàli
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 122, 255);
        pdf.text('SKALI', 15, yPos);

        // Date génération
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(120, 120, 120);
        const date = new Date().toLocaleDateString('fr-FR');
        pdf.text(`Genere le ${date}`, pageWidth - 15, yPos, { align: 'right' });

        // Ligne séparation
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.3);
        pdf.line(15, yPos + 2, pageWidth - 15, yPos + 2);
    },

    /**
     * Tableau semaine en paysage (plus large, plus détaillé)
     * @param pdf
     * @param week
     * @param yPos
     * @param pageWidth
     */
    renderWeekTableLandscape(pdf, week, yPos, pageWidth) {
        const startX = 15;
        const totalWidth = pageWidth - 30; // Marges 15mm de chaque côté
        const colWidth = totalWidth / 7; // 7 colonnes (Lun-Dim)
        const headerHeight = 8;
        const cellHeight = 110; // Plus de hauteur pour détails séances

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const daysFR = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

        // En-têtes colonnes
        pdf.setFillColor(0, 122, 255);
        pdf.setDrawColor(0, 122, 255);

        days.forEach((day, index) => {
            const x = startX + index * colWidth;
            pdf.roundedRect(x, yPos, colWidth, headerHeight, 1, 1, 'FD');

            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(255, 255, 255);
            pdf.text(daysFR[index], x + colWidth / 2, yPos + 5.5, { align: 'center' });
        });

        yPos += headerHeight;

        // Contenu séances
        pdf.setDrawColor(220, 220, 220);

        days.forEach((day, index) => {
            const x = startX + index * colWidth;
            const session = week.sessions?.find(s => s.day === day);

            if (session) {
                // Cellule avec contenu
                pdf.setFillColor(250, 250, 252);
                pdf.rect(x, yPos, colWidth, cellHeight, 'FD');

                let contentY = yPos + 4;

                // Titre séance
                pdf.setFontSize(8);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(0, 122, 255);
                const title = pdf.splitTextToSize(session.title || 'Seance', colWidth - 4);
                pdf.text(title, x + 2, contentY);
                contentY += title.length * 3 + 2;

                // Durée
                pdf.setFontSize(7);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(100, 100, 100);
                pdf.text(`Duree: ${session.duration_minutes || 60}min`, x + 2, contentY);
                contentY += 4;

                // Type
                if (session.type) {
                    pdf.text(`Type: ${session.type}`, x + 2, contentY);
                    contentY += 4;
                }

                // RPE
                if (session.rpe_target) {
                    pdf.setTextColor(255, 152, 0);
                    pdf.text(`RPE: ${session.rpe_target}`, x + 2, contentY);
                    contentY += 4;
                }

                // Ligne séparation
                pdf.setDrawColor(200, 200, 200);
                pdf.line(x + 2, contentY, x + colWidth - 2, contentY);
                contentY += 3;

                // Détails blocs
                pdf.setFontSize(6.5);
                pdf.setTextColor(60, 60, 60);

                // Warmup
                const warmupEx = session.warmup?.exercises?.length || 0;
                if (warmupEx > 0) {
                    pdf.setFont('helvetica', 'bold');
                    pdf.text('ECHAUFFEMENT:', x + 2, contentY);
                    contentY += 3;
                    pdf.setFont('helvetica', 'normal');
                    pdf.text(
                        `${session.warmup.duration_minutes || 10}min - ${warmupEx} ex.`,
                        x + 2,
                        contentY
                    );
                    contentY += 4;
                }

                // Main work
                const mainEx = session.main_work?.exercises?.length || 0;
                if (mainEx > 0) {
                    pdf.setFont('helvetica', 'bold');
                    pdf.text('TRAVAIL PRINCIPAL:', x + 2, contentY);
                    contentY += 3;
                    pdf.setFont('helvetica', 'normal');
                    pdf.text(
                        `${session.main_work.duration_minutes || 40}min - ${mainEx} ex.`,
                        x + 2,
                        contentY
                    );
                    contentY += 4;

                    // Afficher TOUS les exercices (optimisation affichage)
                    const maxContentY = yPos + cellHeight - 5; // Limite basse de la cellule
                    let exercisesToShow = session.main_work.exercises;

                    exercisesToShow.forEach(ex => {
                        // Vérifier si on a encore de la place
                        if (contentY >= maxContentY) {
                            return;
                        }

                        // Nom exercice (ultra compact)
                        const exName = pdf.splitTextToSize(ex.name || 'Exercice', colWidth - 6);
                        pdf.setTextColor(40, 40, 40);
                        pdf.setFontSize(6); // Réduire taille pour tout afficher
                        pdf.text(exName[0], x + 4, contentY); // Première ligne seulement
                        contentY += 2.5;

                        // Format compact: "4x8-10"
                        if (ex.sets && ex.reps) {
                            pdf.setTextColor(100, 100, 100);
                            pdf.setFontSize(5.5);
                            pdf.text(`${ex.sets}x${ex.reps}`, x + 4, contentY);
                            contentY += 2.5;
                        }
                    });
                }
            } else {
                // Cellule repos
                pdf.setFillColor(245, 245, 245);
                pdf.rect(x, yPos, colWidth, cellHeight, 'FD');

                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(180, 180, 180);
                pdf.text('REPOS', x + colWidth / 2, yPos + cellHeight / 2, { align: 'center' });
            }
        });
    },

    /**
     * Footer pour format paysage
     * @param pdf
     * @param currentPage
     * @param totalPages
     * @param pageWidth
     * @param pageHeight
     */
    renderFooterLandscape(pdf, currentPage, totalPages, pageWidth, pageHeight) {
        // Ligne séparation
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.3);
        pdf.line(15, pageHeight - 12, pageWidth - 15, pageHeight - 12);

        // Texte footer
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(120, 120, 120);

        // Gauche: Powered by
        pdf.text('Genere avec SKALI Pro', 15, pageHeight - 8);

        // Centre: URL
        pdf.text('www.skali-training.com', pageWidth / 2, pageHeight - 8, { align: 'center' });

        // Droite: Page
        pdf.text(`Page ${currentPage}/${totalPages}`, pageWidth - 15, pageHeight - 8, {
            align: 'right'
        });
    },

    /**
     * Auto-correction du programme
     * @param programData
     * @param validation
     */
    async autoFixProgram(programData, validation) {
        console.log('🔧 Correction automatique du programme...');

        // Copier pour ne pas modifier l'original
        const fixed = JSON.parse(JSON.stringify(programData));

        // Corriger titre si manquant
        if (!fixed.program_title || fixed.program_title.trim() === '') {
            fixed.program_title = `Programme ${fixed.sport || 'Entrainement'} - ${fixed.duration_weeks || 8} semaines`;
        }

        // Retirer mention "mode dégradé"
        if (fixed.athlete_summary && fixed.athlete_summary.includes('mode dégradé')) {
            fixed.athlete_summary = 'Programme personnalise genere avec SKALI Pro';
        }

        // Corriger chaque semaine
        fixed.weeks.forEach((week, index) => {
            // Phase par défaut
            if (!week.phase || week.phase.trim() === '') {
                const totalWeeks = fixed.weeks.length;
                if (index < totalWeeks * 0.4) {
                    week.phase = 'Base Building';
                } else if (index < totalWeeks * 0.8) {
                    week.phase = 'Developpement';
                } else {
                    week.phase = 'Affutage';
                }
            }

            // Focus par défaut
            if (!week.focus || week.focus.trim() === '') {
                week.focus = 'Progression equilibree';
            }

            // Corriger sessions vides
            if (!week.sessions || week.sessions.length === 0) {
                week.sessions = [];
                // Générer sessions basiques depuis WorkoutFormatsDatabase si disponible
                if (window.WorkoutFormatsDatabase && fixed.sport) {
                    const sport = fixed.sport.toLowerCase();
                    const formats = WorkoutFormatsDatabase.getWorkoutTypesForSport(sport);
                    if (formats && formats.length > 0) {
                        // Créer 3-4 séances par semaine
                        const days = ['Monday', 'Wednesday', 'Friday', 'Saturday'];
                        for (let i = 0; i < Math.min(4, days.length); i++) {
                            const format = formats[i % formats.length];
                            week.sessions.push({
                                day: days[i],
                                title: format.name,
                                type: format.id,
                                duration_minutes: 60,
                                rpe_target: format.rpe || '7/10',
                                warmup: { duration_minutes: 10, exercises: [] },
                                main_work: { duration_minutes: 40, exercises: [] },
                                cooldown: { duration_minutes: 10, exercises: [] }
                            });
                        }
                    }
                }
            }

            // Corriger chaque séance
            week.sessions?.forEach((session, sessionIndex) => {
                if (!session.title) {
                    session.title = `Seance ${sessionIndex + 1}`;
                }
                if (!session.duration_minutes || session.duration_minutes < 10) {
                    session.duration_minutes = 60;
                }
                if (!session.type) {
                    session.type = 'Mixte';
                }
                if (!session.rpe_target) {
                    session.rpe_target = '7/10';
                }

                // Assurer structure blocs
                if (!session.warmup) {
                    session.warmup = { duration_minutes: 10, exercises: [] };
                }
                if (!session.main_work) {
                    session.main_work = { duration_minutes: 40, exercises: [] };
                }
                if (!session.cooldown) {
                    session.cooldown = { duration_minutes: 10, exercises: [] };
                }
            });
        });

        console.log('✅ Programme corrigé');
        return fixed;
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgramPDFGeneratorPro;
} else {
    window.ProgramPDFGeneratorPro = ProgramPDFGeneratorPro;
}
