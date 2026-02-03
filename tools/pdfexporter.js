// Gestionnaire d'export PDF
const PDFExporter = {
    // Ouvrir le sélecteur de semaines (Version Page)
    async openWeekSelector() {
        const sessions = await SupabaseManager.getSessions();
        const weeks = this.getAvailableWeeks(sessions);

        if (weeks.length === 0) {
            Utils.showNotification("Aucune séance trouvée pour l'export PDF", 'warning');
            return;
        }

        const html = `
            <div class="pdf-export-page">
                <div class="pdf-export-modal">
                    <div class="pdf-export-header">
                        <div class="pdf-export-title-section">
                            <h2 class="pdf-export-title">Export PDF - Sélection des semaines</h2>
                            <p class="pdf-export-subtitle">Choisissez les semaines à inclure dans l'export PDF</p>
                        </div>
                        <button onclick="PDFExporter.closePage()" class="pdf-export-close-btn">
                            <i class="fas fa-arrow-left"></i>
                            <span>Retour</span>
                        </button>
                    </div>
                    
                    <div class="pdf-export-content">
                        <div class="pdf-export-section">
                            <div class="pdf-export-section-header">
                                <h3 class="pdf-export-section-title">Semaines disponibles</h3>
                                <div class="pdf-export-actions">
                                    <button onclick="PDFExporter.selectAllWeeks()" class="pdf-export-btn pdf-export-btn-secondary">
                                        <i class="fas fa-check-double"></i>
                                        Tout sélectionner
                                    </button>
                                    <button onclick="PDFExporter.deselectAllWeeks()" class="pdf-export-btn pdf-export-btn-secondary">
                                        <i class="fas fa-times"></i>
                                        Tout désélectionner
                                    </button>
                                </div>
                            </div>
                            
                            <div class="pdf-export-weeks-grid">
                                ${weeks.map(week => this.generateWeekCard(week)).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="pdf-export-footer">
                        <div class="pdf-export-counter">
                            <span id="selectedWeeksCount">0</span> semaine(s) sélectionnée(s)
                        </div>
                        <div class="pdf-export-actions">
                            <button onclick="PDFExporter.closePage()" class="pdf-export-btn pdf-export-btn-cancel">
                                <i class="fas fa-times"></i>
                                Annuler
                            </button>
                            <button onclick="PDFExporter.exportSelectedWeeks()" id="exportBtn"
                                    class="pdf-export-btn pdf-export-btn-primary" disabled>
                                <i class="fas fa-file-pdf"></i>
                                Exporter PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.innerHTML = html;
            this.updateSelectedCount();
        }
    },

    // Fermer la page
    closePage() {
        if (typeof CalendarManager !== 'undefined' && CalendarManager.showCalendarView) {
            CalendarManager.showCalendarView();
        }
    },

    // Exporter le planning de la semaine en PDF (fonction originale conservée)
    async exportWeeklyPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape', 'mm', 'a4');

        const today = new Date();
        const monday = new Date(today);
        monday.setDate(today.getDate() - today.getDay() + 1);

        // Titre
        doc.setFontSize(18);
        doc.text('Skali Prog - Programme de la Semaine', 15, 15);
        doc.setFontSize(10);
        doc.text(`Semaine du ${monday.toLocaleDateString('fr-FR')}`, 15, 22);

        // En-têtes des colonnes
        const colWidth = 38;
        const startX = 15;
        const startY = 35;
        const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

        // Dessiner les en-têtes des jours
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        days.forEach((day, i) => {
            doc.text(day, startX + i * colWidth, startY);
        });

        // Dessiner les séances avec titres
        doc.setFont(undefined, 'normal');
        doc.setFontSize(8);

        // Récupérer toutes les séances
        const allSessions = await SupabaseManager.getSessions();

        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(monday);
            currentDay.setDate(monday.getDate() + i);
            const dateKey = Utils.formatDateKey(currentDay);

            // Trouver la première séance pour cette date
            const daySession = allSessions.find(session => session.date === dateKey);

            let yPos = startY + 8;
            const xPos = startX + i * colWidth;

            if (daySession) {
                // Titre de la séance
                if (daySession.title) {
                    doc.setFont(undefined, 'bold');
                    doc.setFontSize(9);
                    const titleLines = doc.splitTextToSize(daySession.title, colWidth - 5);
                    titleLines.forEach(line => {
                        doc.text(line, xPos, yPos);
                        yPos += 4;
                    });
                    yPos += 2;
                }

                // Catégorie
                if (daySession.category && CONFIG.SESSION_CATEGORIES[daySession.category]) {
                    doc.setFont(undefined, 'italic');
                    doc.setFontSize(7);
                    doc.text(
                        `[${CONFIG.SESSION_CATEGORIES[daySession.category].name}]`,
                        xPos,
                        yPos
                    );
                    yPos += 4;
                }

                // Blocs
                if (daySession.blocks) {
                    doc.setFontSize(8);
                    daySession.blocks.forEach(block => {
                        if (yPos > 180) return; // Limite de page

                        // Nom du bloc
                        if (block.name) {
                            doc.setFont(undefined, 'bold');
                            const lines = doc.splitTextToSize(block.name, colWidth - 5);
                            lines.forEach(line => {
                                doc.text(line, xPos, yPos);
                                yPos += 4;
                            });
                        }

                        // Contenu du bloc
                        if (block.content) {
                            doc.setFont(undefined, 'normal');
                            const contentLines = doc.splitTextToSize(block.content, colWidth - 5);
                            contentLines.slice(0, 8).forEach(line => {
                                if (yPos > 180) return;
                                doc.text(line, xPos, yPos);
                                yPos += 3.5;
                            });
                        }

                        yPos += 3;
                    });
                }
            } else {
                doc.setFont(undefined, 'italic');
                doc.text('Repos', xPos, yPos);
            }
        }

        doc.save(`skali_prog_semaine_${Utils.formatDateKey(monday)}.pdf`);
    },

    // Générer une carte de semaine
    generateWeekCard(week) {
        const sessionCount = week.sessions.length;
        const hasSessions = sessionCount > 0;

        return `
            <div class="pdf-week-card ${hasSessions ? 'pdf-week-card-active' : 'pdf-week-card-disabled'}" data-week-start="${week.startDate}">
                <div class="pdf-week-card-header">
                    <div class="pdf-week-card-info">
                        <h4 class="pdf-week-card-title">Semaine du ${week.startDateFormatted}</h4>
                        <p class="pdf-week-card-subtitle">${week.endDateFormatted}</p>
                    </div>
                    <label class="pdf-week-checkbox">
                        <input type="checkbox" class="pdf-week-checkbox-input" ${hasSessions ? '' : 'disabled'} 
                               onchange="PDFExporter.updateSelectedCount()">
                        <span class="pdf-week-checkbox-mark"></span>
                    </label>
                </div>
                
                <div class="pdf-week-card-content">
                    ${
                        hasSessions
                            ? `
                        <div class="pdf-week-sessions">
                            <div class="pdf-week-sessions-header">
                                <i class="fas fa-calendar-check"></i>
                                <span class="pdf-week-sessions-count">${sessionCount} séance(s)</span>
                            </div>
                            <div class="pdf-week-sessions-list">
                                ${week.sessions
                                    .slice(0, 3)
                                    .map(
                                        session => `
                                    <div class="pdf-week-session-item">
                                        <span class="pdf-week-session-title">${session.title || 'Séance'}</span>
                                        ${
                                            session.category
                                                ? `
                                            <span class="pdf-week-session-category">
                                                ${CONFIG.SESSION_CATEGORIES[session.category]?.name || session.category}
                                            </span>
                                        `
                                                : ''
                                        }
                                    </div>
                                `
                                    )
                                    .join('')}
                                ${sessionCount > 3 ? `<div class="pdf-week-sessions-more">+${sessionCount - 3} autres...</div>` : ''}
                            </div>
                        </div>
                    `
                            : `
                        <div class="pdf-week-no-sessions">
                            <i class="fas fa-calendar-times"></i>
                            <span>Aucune séance</span>
                        </div>
                    `
                    }
                </div>
            </div>
        `;
    },

    // Obtenir les semaines disponibles avec leurs séances
    getAvailableWeeks(sessions) {
        const weeks = [];
        const weekMap = new Map();

        // Grouper les séances par semaine
        sessions.forEach(session => {
            if (session && session.date) {
                const date = new Date(session.date);
                const weekStart = this.getWeekStart(date);
                const weekKey = weekStart.toISOString().split('T')[0];

                if (!weekMap.has(weekKey)) {
                    weekMap.set(weekKey, {
                        startDate: weekKey,
                        startDateFormatted: weekStart.toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long'
                        }),
                        endDateFormatted: this.getWeekEnd(weekStart).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long'
                        }),
                        sessions: []
                    });
                }

                // Ajouter la séance
                weekMap.get(weekKey).sessions.push({
                    ...session,
                    dateFormatted: date.toLocaleDateString('fr-FR', {
                        weekday: 'short',
                        day: 'numeric'
                    })
                });
            }
        });

        // Convertir en tableau et trier par date
        return Array.from(weekMap.values()).sort(
            (a, b) => new Date(a.startDate) - new Date(b.startDate)
        );
    },

    // Obtenir le début de la semaine (lundi)
    getWeekStart(date) {
        const monday = new Date(date);
        monday.setDate(date.getDate() - date.getDay() + 1);
        return monday;
    },

    // Obtenir la fin de la semaine (dimanche)
    getWeekEnd(weekStart) {
        const sunday = new Date(weekStart);
        sunday.setDate(weekStart.getDate() + 6);
        return sunday;
    },

    // Sélectionner toutes les semaines
    selectAllWeeks() {
        document.querySelectorAll('.pdf-week-checkbox-input:not(:disabled)').forEach(checkbox => {
            checkbox.checked = true;
        });
        this.updateSelectedCount();
    },

    // Désélectionner toutes les semaines
    deselectAllWeeks() {
        document.querySelectorAll('.pdf-week-checkbox-input').forEach(checkbox => {
            checkbox.checked = false;
        });
        this.updateSelectedCount();
    },

    // Mettre à jour le compteur de semaines sélectionnées
    updateSelectedCount() {
        const selectedCount = document.querySelectorAll('.pdf-week-checkbox-input:checked').length;
        document.getElementById('selectedWeeksCount').textContent = selectedCount;
        document.getElementById('exportBtn').disabled = selectedCount === 0;
    },

    // Exporter les semaines sélectionnées
    async exportSelectedWeeks() {
        const selectedWeeks = Array.from(
            document.querySelectorAll('.pdf-week-checkbox-input:checked')
        ).map(checkbox => checkbox.closest('.pdf-week-card').dataset.weekStart);

        if (selectedWeeks.length === 0) {
            Utils.showNotification('Veuillez sélectionner au moins une semaine', 'warning');
            return;
        }

        await this.exportWeeksToPDF(selectedWeeks);
        this.closePage();
    },

    // Exporter les semaines en PDF
    async exportWeeksToPDF(weekStarts) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape', 'mm', 'a4');

        for (let weekIndex = 0; weekIndex < weekStarts.length; weekIndex++) {
            if (weekIndex > 0) {
                doc.addPage();
            }

            await this.addWeekToPDF(doc, weekStarts[weekIndex]);
        }

        // Nom du fichier avec les dates
        const firstWeek = weekStarts[0];
        const lastWeek = weekStarts[weekStarts.length - 1];
        const filename =
            weekStarts.length === 1
                ? `skali_prog_semaine_${firstWeek}.pdf`
                : `skali_prog_semaines_${firstWeek}_${lastWeek}.pdf`;

        doc.save(filename);
        Utils.showNotification(`PDF exporté avec ${weekStarts.length} semaine(s)`, 'success');
    },

    // Ajouter une semaine au PDF
    async addWeekToPDF(doc, weekStart) {
        const monday = new Date(weekStart);

        // Titre
        doc.setFontSize(18);
        doc.text('Skali Prog - Programme de la Semaine', 15, 15);
        doc.setFontSize(10);
        doc.text(`Semaine du ${monday.toLocaleDateString('fr-FR')}`, 15, 22);

        // En-têtes des colonnes
        const colWidth = 38;
        const startX = 15;
        const startY = 35;
        const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

        // Dessiner les en-têtes des jours
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        days.forEach((day, i) => {
            doc.text(day, startX + i * colWidth, startY);
        });

        // Dessiner les séances avec titres
        doc.setFont(undefined, 'normal');
        doc.setFontSize(8);

        // Récupérer toutes les séances
        const allSessions = await SupabaseManager.getSessions();

        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(monday);
            currentDay.setDate(monday.getDate() + i);
            const dateKey = Utils.formatDateKey(currentDay);

            // Trouver toutes les séances pour cette date
            const daySessions = allSessions.filter(session => session.date === dateKey);

            let yPos = startY + 8;
            const xPos = startX + i * colWidth;

            if (daySessions && daySessions.length > 0) {
                daySessions.forEach((session, sessionIndex) => {
                    if (sessionIndex > 0) yPos += 2; // Espace entre les séances

                    // Titre de la séance
                    if (session.title) {
                        doc.setFont(undefined, 'bold');
                        doc.setFontSize(9);
                        const titleLines = doc.splitTextToSize(session.title, colWidth - 5);
                        titleLines.forEach(line => {
                            doc.text(line, xPos, yPos);
                            yPos += 4;
                        });
                        yPos += 2;
                    }

                    // Catégorie
                    if (session.category && CONFIG.SESSION_CATEGORIES[session.category]) {
                        doc.setFont(undefined, 'italic');
                        doc.setFontSize(7);
                        doc.text(
                            `[${CONFIG.SESSION_CATEGORIES[session.category].name}]`,
                            xPos,
                            yPos
                        );
                        yPos += 4;
                    }

                    // Blocs
                    if (session.blocks) {
                        doc.setFontSize(8);
                        session.blocks.forEach(block => {
                            if (yPos > 180) return; // Limite de page

                            // Nom du bloc
                            if (block.name) {
                                doc.setFont(undefined, 'bold');
                                const lines = doc.splitTextToSize(block.name, colWidth - 5);
                                lines.forEach(line => {
                                    doc.text(line, xPos, yPos);
                                    yPos += 4;
                                });
                            }

                            // Contenu du bloc
                            if (block.content) {
                                doc.setFont(undefined, 'normal');
                                const contentLines = doc.splitTextToSize(
                                    block.content,
                                    colWidth - 5
                                );
                                contentLines.slice(0, 8).forEach(line => {
                                    if (yPos > 180) return;
                                    doc.text(line, xPos, yPos);
                                    yPos += 3.5;
                                });
                            }

                            yPos += 3;
                        });
                    }
                });
            } else {
                doc.setFont(undefined, 'italic');
                doc.text('Repos', xPos, yPos);
            }
        }
    }
};
