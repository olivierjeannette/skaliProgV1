// Gestionnaire du calendrier avec support multi-séances - VERSION SUPABASE AMELIOREE
const CalendarManager = {
    currentViewMonth: new Date().getMonth(),
    currentViewYear: new Date().getFullYear(),
    currentViewDate: new Date(), // Pour vues semaine/jour
    cachedSessions: [], // Cache des sessions chargées depuis Supabase
    viewMode: 'month', // 'month', 'week', 'day'
    activeFilters: {
        category: null,
        searchTerm: '',
        hideEmptyDays: false
    },
    searchTimeout: null,
    sessionNames: [], // Noms de séances prédéfinis (chargés depuis localStorage)

    // Afficher la vue calendrier (VERSION SUPABASE)
    async showCalendarView() {
        try {
            // Charger toutes les sessions depuis Supabase
            this.cachedSessions = await SupabaseManager.getSessions();
            console.log(`✅ ${this.cachedSessions.length} sessions chargées depuis Supabase`);

            // Charger les noms de séances prédéfinis
            this.loadSessionNames();

            let html = `
            <div class="fade-in">
                ${this.generateToolbar()}
                <div class="bg-skali-light rounded-xl p-6 mb-6 border border-skali">
                    ${this.generateViewContent()}
                </div>
            </div>
        `;
            document.getElementById('mainContent').innerHTML = html;

            // Attacher les event listeners pour le support mobile
            this.attachMobileEventListeners();
        } catch (error) {
            console.error('❌ Erreur chargement calendrier:', error);
            document.getElementById('mainContent').innerHTML = `
                <div class="p-6 text-center text-red-400">
                    <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                    <p>Erreur lors du chargement du calendrier</p>
                </div>
            `;
        }
    },

    // Générer la barre d'outils avec filtres et navigation (VERSION COMPACTE PRO)
    generateToolbar() {
        return `
            <div class="bg-skali-light rounded-xl p-3 mb-4 border border-skali shadow-sm">
                <!-- Ligne 1: Navigation principale -->
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-3">
                        <button onclick="CalendarManager.changeView(-1)"
                                class="w-8 h-8 flex items-center justify-center hover:bg-skali-dark rounded-lg transition">
                            <i class="fas fa-chevron-left text-sm"></i>
                        </button>
                        <h2 class="text-xl font-semibold min-w-[200px] text-center">
                            ${this.getViewTitle()}
                        </h2>
                        <button onclick="CalendarManager.changeView(1)"
                                class="w-8 h-8 flex items-center justify-center hover:bg-skali-dark rounded-lg transition">
                            <i class="fas fa-chevron-right text-sm"></i>
                        </button>
                        <button onclick="CalendarManager.goToToday()"
                                class="px-3 py-1.5 text-sm hover:bg-skali-dark rounded-lg transition">
                            Aujourd'hui
                        </button>
                    </div>

                    <!-- Vue mode (compact) -->
                    <div class="flex gap-1 bg-skali-dark rounded-lg p-1">
                        <button onclick="CalendarManager.setViewMode('month')"
                                class="px-3 py-1.5 text-sm rounded-md transition ${this.viewMode === 'month' ? 'bg-skali-accent text-white' : 'hover:bg-skali-light'}"
                                title="Vue Mois">
                            <i class="fas fa-calendar"></i>
                        </button>
                        <button onclick="CalendarManager.setViewMode('week')"
                                class="px-3 py-1.5 text-sm rounded-md transition ${this.viewMode === 'week' ? 'bg-skali-accent text-white' : 'hover:bg-skali-light'}"
                                title="Vue Semaine">
                            <i class="fas fa-calendar-week"></i>
                        </button>
                        <button onclick="CalendarManager.setViewMode('day')"
                                class="px-3 py-1.5 text-sm rounded-md transition ${this.viewMode === 'day' ? 'bg-skali-accent text-white' : 'hover:bg-skali-light'}"
                                title="Vue Jour">
                            <i class="fas fa-calendar-day"></i>
                        </button>
                    </div>
                </div>

                <!-- Ligne 2: Filtres et actions (plus compact) -->
                <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2 flex-1">
                        <input type="text"
                               placeholder="Rechercher..."
                               value="${this.activeFilters.searchTerm}"
                               oninput="CalendarManager.handleSearch(this.value)"
                               class="px-3 py-1.5 text-sm bg-skali-dark rounded-lg border border-skali focus:border-skali-accent transition flex-1 max-w-[200px]">

                        <select onchange="CalendarManager.filterByCategory(this.value)"
                                class="px-3 py-1.5 text-sm bg-skali-dark rounded-lg border border-skali focus:border-skali-accent transition">
                            <option value="">Toutes</option>
                            ${Object.entries(CONFIG.SESSION_CATEGORIES)
                                .map(
                                    ([key, cat]) => `
                                <option value="${key}" ${this.activeFilters.category === key ? 'selected' : ''}>
                                    ${cat.name}
                                </option>
                            `
                                )
                                .join('')}
                        </select>
                    </div>

                    <div class="flex items-center gap-1">
                        <button onclick="CalendarManager.toggleEmptyDays()"
                                class="w-8 h-8 flex items-center justify-center rounded-lg transition ${this.activeFilters.hideEmptyDays ? 'bg-skali-accent text-white' : 'hover:bg-skali-dark'}"
                                title="Masquer jours vides">
                            <i class="fas fa-eye-slash text-sm"></i>
                        </button>

                        <div class="relative">
                            <button onclick="CalendarManager.toggleQuickActionsMenu()"
                                    class="w-9 h-9 flex items-center justify-center rounded-lg transition hover:bg-skali-dark hover:shadow-lg group">
                                <i class="fas fa-ellipsis-v text-sm group-hover:text-skali-accent transition"></i>
                            </button>
                            <div id="quickActionsMenu" class="hidden absolute right-0 mt-2 w-64 rounded-xl shadow-2xl border border-skali-accent/50 z-50 overflow-hidden" style="background: linear-gradient(135deg, rgba(10, 10, 18, 0.98) 0%, rgba(20, 20, 32, 0.98) 100%); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);">
                                <!-- Header du menu -->
                                <div class="px-4 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-b border-skali">
                                    <div class="flex items-center gap-2 text-sm font-semibold">
                                        <i class="fas fa-magic text-skali-accent"></i>
                                        <span>Actions rapides</span>
                                    </div>
                                </div>

                                <div class="p-2">
                                    <!-- Gestion -->
                                    <button onclick="CalendarManager.showSessionNamesManager()"
                                            class="w-full text-left px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 rounded-lg transition-all flex items-center gap-3 group">
                                        <div class="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <i class="fas fa-palette text-blue-400"></i>
                                        </div>
                                        <div class="flex-1">
                                            <div class="font-medium">Gérer les types</div>
                                            <div class="text-xs text-gray-400">Couleurs & noms</div>
                                        </div>
                                        <i class="fas fa-chevron-right text-xs text-gray-500 group-hover:text-blue-400 transition"></i>
                                    </button>

                                    <!-- Templates -->
                                    <button onclick="CalendarManager.showTemplatesModal()"
                                            class="w-full text-left px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 rounded-lg transition-all flex items-center gap-3 group">
                                        <div class="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <i class="fas fa-file-alt text-purple-400"></i>
                                        </div>
                                        <div class="flex-1">
                                            <div class="font-medium">Templates</div>
                                            <div class="text-xs text-gray-400">Modèles prédéfinis</div>
                                        </div>
                                        <i class="fas fa-chevron-right text-xs text-gray-500 group-hover:text-purple-400 transition"></i>
                                    </button>

                                    <div class="border-t border-skali/50 my-2"></div>

                                    <!-- Dupliquer -->
                                    <button onclick="CalendarManager.duplicateWeek()"
                                            class="w-full text-left px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-green-500/20 hover:to-emerald-500/20 rounded-lg transition-all flex items-center gap-3 group">
                                        <div class="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <i class="fas fa-copy text-green-400"></i>
                                        </div>
                                        <div class="flex-1">
                                            <div class="font-medium">Dupliquer</div>
                                            <div class="text-xs text-gray-400">Copier une semaine</div>
                                        </div>
                                        <i class="fas fa-chevron-right text-xs text-gray-500 group-hover:text-green-400 transition"></i>
                                    </button>

                                    <div class="border-t border-skali/50 my-2"></div>

                                    <!-- Export -->
                                    <button onclick="CalendarManager.exportWeek()"
                                            class="w-full text-left px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 rounded-lg transition-all flex items-center gap-3 group">
                                        <div class="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <i class="fas fa-download text-cyan-400"></i>
                                        </div>
                                        <div class="flex-1">
                                            <div class="font-medium">Exporter</div>
                                            <div class="text-xs text-gray-400">Sauvegarder JSON</div>
                                        </div>
                                        <i class="fas fa-chevron-right text-xs text-gray-500 group-hover:text-cyan-400 transition"></i>
                                    </button>

                                    <!-- Import -->
                                    <button onclick="CalendarManager.importWeek()"
                                            class="w-full text-left px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-red-500/20 rounded-lg transition-all flex items-center gap-3 group">
                                        <div class="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <i class="fas fa-upload text-orange-400"></i>
                                        </div>
                                        <div class="flex-1">
                                            <div class="font-medium">Importer</div>
                                            <div class="text-xs text-gray-400">Charger JSON</div>
                                        </div>
                                        <i class="fas fa-chevron-right text-xs text-gray-500 group-hover:text-orange-400 transition"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Générer le panneau de statistiques
    generateStatsPanel() {
        const currentMonthSessions = this.getSessionsForMonth(
            this.currentViewMonth,
            this.currentViewYear
        );
        const stats = this.calculateStats(currentMonthSessions);

        return `
            <div class="bg-skali-light rounded-xl p-4 mb-4 border border-skali">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="text-center">
                        <div class="text-3xl font-bold text-skali-accent">${stats.totalSessions}</div>
                        <div class="text-sm text-gray-400">Séances ce mois</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-green-400">${stats.trainingDays}</div>
                        <div class="text-sm text-gray-400">Jours d'entraînement</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-blue-400">${stats.restDays}</div>
                        <div class="text-sm text-gray-400">Jours de repos</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-yellow-400">${stats.avgPerWeek.toFixed(1)}</div>
                        <div class="text-sm text-gray-400">Séances/semaine</div>
                    </div>
                </div>
                <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                    ${Object.entries(stats.byCategory)
                        .map(([key, count]) => {
                            const cat = CONFIG.SESSION_CATEGORIES[key];
                            return cat
                                ? `
                            <div class="flex items-center gap-2 p-2 rounded-lg bg-skali-dark">
                                <i class="${cat.icon} text-${cat.color}-400"></i>
                                <span class="text-sm">${cat.name}: ${count}</span>
                            </div>
                        `
                                : '';
                        })
                        .join('')}
                </div>
            </div>
        `;
    },

    // Obtenir le titre de la vue
    getViewTitle() {
        switch (this.viewMode) {
            case 'month':
                return new Date(this.currentViewYear, this.currentViewMonth).toLocaleDateString(
                    'fr-FR',
                    { month: 'long', year: 'numeric' }
                );
            case 'week':
                const weekStart = this.getWeekStart(this.currentViewDate);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                return `Semaine du ${weekStart.toLocaleDateString('fr-FR')} au ${weekEnd.toLocaleDateString('fr-FR')}`;
            case 'day':
                return this.currentViewDate.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
            default:
                return '';
        }
    },

    // Générer le contenu selon le mode de vue
    generateViewContent() {
        switch (this.viewMode) {
            case 'month':
                return this.generateMonthView();
            case 'week':
                return this.generateWeekView();
            case 'day':
                return this.generateDayView();
            default:
                return this.generateMonthView();
        }
    },

    // Vue mensuelle
    generateMonthView() {
        return `
            <div class="grid grid-cols-7 gap-3">
                ${this.generateCalendar(this.currentViewMonth, this.currentViewYear)}
            </div>
        `;
    },

    // Vue semaine
    generateWeekView() {
        const weekStart = this.getWeekStart(this.currentViewDate);
        const hours = Array.from({ length: 24 }, (_, i) => i);
        const days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            return date;
        });

        return `
            <div class="week-view">
                <div class="grid grid-cols-8 gap-2">
                    <!-- Header avec heures -->
                    <div class="text-center text-sm font-semibold text-skali-accent p-2">Heure</div>
                    ${days
                        .map(
                            day => `
                        <div class="text-center text-sm font-semibold text-skali-accent p-2">
                            ${day.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                        </div>
                    `
                        )
                        .join('')}

                    <!-- Grille horaire -->
                    ${hours
                        .map(
                            hour => `
                        <div class="text-right text-xs text-gray-400 pr-2 py-1">${String(hour).padStart(2, '0')}:00</div>
                        ${days
                            .map(day => {
                                const dateKey = this.formatDateKey(day);
                                const sessions = this.getFilteredSessionsForDate(dateKey);
                                return `
                                <div onclick="CalendarManager.openDayModal('${dateKey}')"
                                     class="week-time-slot border border-skali-dark hover:bg-skali-dark cursor-pointer rounded p-1 min-h-[40px]"
                                     data-date="${dateKey}" data-hour="${hour}">
                                    ${
                                        sessions.length > 0 && hour === 8
                                            ? `
                                        <div class="text-xs space-y-1">
                                            ${sessions
                                                .map(
                                                    s => `
                                                <div class="session-indicator ${s.category || ''}" title="${s.title}">
                                                    ${s.title?.substring(0, 15) || 'Séance'}
                                                </div>
                                            `
                                                )
                                                .join('')}
                                        </div>
                                    `
                                            : ''
                                    }
                                </div>
                            `;
                            })
                            .join('')}
                    `
                        )
                        .join('')}
                </div>
            </div>
        `;
    },

    // Vue jour
    generateDayView() {
        const dateKey = this.formatDateKey(this.currentViewDate);
        const sessions = this.getFilteredSessionsForDate(dateKey);
        const hours = Array.from({ length: 24 }, (_, i) => i);

        return `
            <div class="day-view">
                <div class="grid grid-cols-1 gap-2">
                    ${hours
                        .map(hour => {
                            const hourSessions = sessions.filter(s => {
                                // Simple heuristique : afficher les sessions entre 6h et 22h
                                return hour >= 6 && hour <= 22;
                            });

                            return `
                            <div class="day-time-slot border border-skali rounded-lg p-4 hover:bg-skali-dark cursor-pointer transition"
                                 onclick="CalendarManager.openDayModal('${dateKey}')"
                                 data-hour="${hour}">
                                <div class="flex items-start gap-4">
                                    <div class="text-xl font-bold text-gray-400 w-20">
                                        ${String(hour).padStart(2, '0')}:00
                                    </div>
                                    <div class="flex-1">
                                        ${
                                            hour === 8 && sessions.length > 0
                                                ? `
                                            <div class="space-y-2">
                                                ${sessions
                                                    .map(
                                                        (session, idx) => `
                                                    <div class="day-session-preview bg-skali-dark p-3 rounded-lg">
                                                        <h4 class="font-bold mb-1">${session.title || 'Séance ' + (idx + 1)}</h4>
                                                        ${
                                                            session.category
                                                                ? `
                                                            <span class="session-category-${session.category} text-xs px-2 py-1 rounded">
                                                                ${CONFIG.SESSION_CATEGORIES[session.category]?.name}
                                                            </span>
                                                        `
                                                                : ''
                                                        }
                                                        ${
                                                            session.blocks?.length > 0
                                                                ? `
                                                            <div class="mt-2 text-sm text-gray-400">
                                                                ${session.blocks.length} bloc${session.blocks.length > 1 ? 's' : ''}
                                                            </div>
                                                        `
                                                                : ''
                                                        }
                                                    </div>
                                                `
                                                    )
                                                    .join('')}
                                            </div>
                                        `
                                                : ''
                                        }
                                    </div>
                                </div>
                            </div>
                        `;
                        })
                        .join('')}
                </div>
            </div>
        `;
    },

    // Générer le HTML du calendrier
    generateCalendar(month, year) {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

        let html = dayNames
            .map(
                day =>
                    `<div class="text-center font-semibold text-skali-accent text-sm p-2">${day}</div>`
            )
            .join('');

        // Cellules vides avant le premier jour
        for (let i = 0; i < firstDay; i++) {
            html += '<div></div>';
        }

        // Jours du mois
        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            // Filtrer les sessions pour ce jour depuis le cache Supabase avec filtres actifs
            const sessions = this.getFilteredSessionsForDate(dateKey);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            // Masquer jours vides si filtre actif
            if (this.activeFilters.hideEmptyDays && sessions.length === 0) {
                html += '<div class="calendar-day-hidden"></div>';
                continue;
            }

            html += `
                <div class="calendar-day ${sessions.length > 0 ? 'has-session' : ''} relative p-2 rounded-lg cursor-pointer ${
                    isToday ? 'ring-2 ring-skali-accent' : ''
                } transition-all hover:bg-skali-dark"
                     data-date="${dateKey}"
                     draggable="${sessions.length > 0 ? 'true' : 'false'}"
                     onclick="CalendarManager.handleDayClick('${dateKey}')"
                     ondragstart="CalendarManager.handleDayDragStart(event, '${dateKey}')"
                     ondragover="CalendarManager.handleDayDragOver(event)"
                     ondragleave="CalendarManager.handleDayDragLeave(event)"
                     ondragend="CalendarManager.handleDayDragEnd()"
                     ondrop="CalendarManager.handleDayDrop(event, '${dateKey}')">
                    <div class="text-sm font-medium ${isToday ? 'text-skali-accent' : ''} mb-1">${day}</div>
                    ${
                        sessions.length > 0
                            ? `
                        <div class="space-y-1">
                            ${sessions
                                .map(session => {
                                    const color = this.getSessionColor(session.title);
                                    return `
                                <div class="session-indicator ${session.category || ''}"
                                     title="${session.title || 'Séance'}"
                                     style="background: ${color}40 !important; border-color: ${color}80 !important; color: ${color} !important; box-shadow: 0 0 10px ${color}30;">
                                    ${session.title || 'Séance'}
                                </div>
                            `;
                                })
                                .join('')}
                            <div class="text-xs text-gray-400">${sessions.length} séance${sessions.length > 1 ? 's' : ''}</div>
                        </div>
                    `
                            : ''
                    }
                </div>
            `;
        }

        return html;
    },

    // Filtrer les sessions pour une date
    getFilteredSessionsForDate(dateKey) {
        let sessions = this.cachedSessions.filter(s => s.date === dateKey);

        // Filtre par catégorie
        if (this.activeFilters.category) {
            sessions = sessions.filter(s => s.category === this.activeFilters.category);
        }

        // Filtre par recherche
        if (this.activeFilters.searchTerm) {
            const term = this.activeFilters.searchTerm.toLowerCase();
            sessions = sessions.filter(
                s =>
                    (s.title && s.title.toLowerCase().includes(term)) ||
                    (s.blocks &&
                        s.blocks.some(
                            b =>
                                (b.name && b.name.toLowerCase().includes(term)) ||
                                (b.content && b.content.toLowerCase().includes(term))
                        ))
            );
        }

        return sessions;
    },

    // Obtenir les sessions pour un mois
    getSessionsForMonth(month, year) {
        return this.cachedSessions.filter(s => {
            const date = new Date(s.date);
            return date.getMonth() === month && date.getFullYear() === year;
        });
    },

    // Calculer les statistiques
    calculateStats(sessions) {
        const uniqueDays = new Set(sessions.map(s => s.date));
        const daysInMonth = new Date(this.currentViewYear, this.currentViewMonth + 1, 0).getDate();
        const byCategory = {};

        sessions.forEach(s => {
            if (s.category) {
                byCategory[s.category] = (byCategory[s.category] || 0) + 1;
            }
        });

        return {
            totalSessions: sessions.length,
            trainingDays: uniqueDays.size,
            restDays: daysInMonth - uniqueDays.size,
            avgPerWeek: sessions.length / (daysInMonth / 7),
            byCategory
        };
    },

    // Changer de vue (navigation)
    changeView(direction) {
        switch (this.viewMode) {
            case 'month':
                this.currentViewMonth += direction;
                if (this.currentViewMonth < 0) {
                    this.currentViewMonth = 11;
                    this.currentViewYear--;
                } else if (this.currentViewMonth > 11) {
                    this.currentViewMonth = 0;
                    this.currentViewYear++;
                }
                break;
            case 'week':
                this.currentViewDate.setDate(this.currentViewDate.getDate() + direction * 7);
                break;
            case 'day':
                this.currentViewDate.setDate(this.currentViewDate.getDate() + direction);
                break;
        }
        this.showCalendarView();
    },

    // Changer le mode de vue
    setViewMode(mode) {
        this.viewMode = mode;
        this.showCalendarView();
    },

    // Retourner à aujourd'hui
    goToToday() {
        const today = new Date();
        this.currentViewMonth = today.getMonth();
        this.currentViewYear = today.getFullYear();
        this.currentViewDate = new Date();
        this.showCalendarView();
    },

    // Obtenir le début de la semaine
    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lundi
        return new Date(d.setDate(diff));
    },

    // Formater une date en clé
    formatDateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // Gestion de la recherche avec debounce
    handleSearch(value) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.activeFilters.searchTerm = value;
            this.showCalendarView();
        }, 300);
    },

    // Filtrer par catégorie
    filterByCategory(category) {
        this.activeFilters.category = category || null;
        this.showCalendarView();
    },

    // Toggle jours vides
    toggleEmptyDays() {
        this.activeFilters.hideEmptyDays = !this.activeFilters.hideEmptyDays;
        this.showCalendarView();
    },

    // Toggle menu quick actions
    toggleQuickActionsMenu() {
        const menu = document.getElementById('quickActionsMenu');
        menu.classList.toggle('hidden');

        // Fermer si clic en dehors
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (
                    !e.target.closest('#quickActionsMenu') &&
                    !e.target.closest('button[onclick*="toggleQuickActionsMenu"]')
                ) {
                    menu.classList.add('hidden');
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
    },

    // Changer de mois (legacy)
    changeMonth(direction) {
        this.changeView(direction);
    },

    // Ouvrir la modal d'un jour avec gestion multi-séances (VERSION SUPABASE)
    openDayModal(dateKey) {
        // Filtrer les sessions pour ce jour depuis le cache Supabase
        const existingSessions = this.cachedSessions.filter(s => s.date === dateKey);
        const [year, month, day] = dateKey.split('-');
        const dateStr = new Date(year, month - 1, day).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        let html = `
            <div class="fixed inset-0 modal-backdrop flex items-center justify-center z-50 fade-in" onclick="Utils.closeModal(event)">
                <div class="day-modal" onclick="event.stopPropagation()">
                    <div class="day-modal-header">
                        <div class="day-modal-title-section">
                            <h3 class="day-modal-title">${dateStr}</h3>
                            <p class="day-modal-subtitle">${existingSessions.length} séance${existingSessions.length > 1 ? 's' : ''} programmée${existingSessions.length > 1 ? 's' : ''}</p>
                        </div>
                        <button onclick="CalendarManager.addNewSession('${dateKey}')" class="day-modal-add-btn">
                            <i class="fas fa-plus"></i>
                            Nouvelle séance
                        </button>
                    </div>
                    
                    <div class="day-modal-content">
                        <!-- Liste des séances existantes -->
                        <div id="sessionsList" class="day-sessions-list">
                            ${
                                existingSessions.length === 0
                                    ? `
                                <div class="day-no-sessions">
                                    <div class="day-no-sessions-icon">
                                        <i class="fas fa-calendar-plus"></i>
                                    </div>
                                    <h4>Aucune séance programmée</h4>
                                    <p>Cliquez sur "Nouvelle séance" pour commencer</p>
                                </div>
                            `
                                    : existingSessions
                                          .map((session, index) =>
                                              this.generateSessionHTML(session, index, dateKey)
                                          )
                                          .join('')
                            }
                        </div>
                    </div>
                    
                    <div class="day-modal-footer">
                        <button onclick="Utils.closeModal()" class="day-modal-close-btn">
                            <i class="fas fa-times"></i>
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('modalContainer').innerHTML = html;
    },

    // Générer le HTML d'une séance
    generateSessionHTML(session, index, dateKey) {
        const categoryInfo = session.category ? CONFIG.SESSION_CATEGORIES[session.category] : null;

        return `
            <div class="day-session-card">
                <div class="day-session-header">
                    <div class="day-session-info">
                        <h4 class="day-session-title">${session.title || 'Séance ' + (index + 1)}</h4>
                        <div class="day-session-meta">
                            ${
                                categoryInfo
                                    ? `
                                <span class="day-session-category session-category-${session.category}">
                                    <i class="${categoryInfo.icon}"></i>
                                    ${categoryInfo.name}
                                </span>
                            `
                                    : ''
                            }
                            <span class="day-session-index">Séance ${index + 1}</span>
                        </div>
                    </div>
                    <div class="day-session-actions">
                        <button onclick="CalendarManager.openTVMode('${session.id}')" class="day-session-btn day-session-btn-tv" title="Mode TV">
                            <i class="fas fa-tv"></i>
                        </button>
                        ${
                            session.category === 'cardio'
                                ? `
                        <button onclick="RunSessionManager.openWithSession('${session.id}')" class="day-session-btn day-session-btn-timer" title="Chronométrer">
                            <i class="fas fa-stopwatch"></i>
                        </button>
                        `
                                : ''
                        }
                        <button onclick="CalendarManager.showDuplicateModal('${session.id}')" class="day-session-btn day-session-btn-duplicate" title="Dupliquer">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button onclick="CalendarManager.editSession('${session.id}')" class="day-session-btn day-session-btn-edit" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="CalendarManager.deleteSession('${session.id}')" class="day-session-btn day-session-btn-delete" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                ${
                    session.blocks && session.blocks.length > 0
                        ? `
                    <div class="day-session-blocks">
                        <div class="day-session-blocks-header">
                            <h5 class="day-session-blocks-title">Blocs d'entraînement</h5>
                            <span class="day-session-blocks-count">${session.blocks.length} bloc${session.blocks.length > 1 ? 's' : ''}</span>
                        </div>
                        <div class="day-session-blocks-grid">
                            ${session.blocks
                                .map(
                                    block => `
                                <div class="day-session-block">
                                    <div class="day-session-block-header">
                                        <h6 class="day-session-block-title">${block.name || 'Bloc'}</h6>
                                    </div>
                                    <div class="day-session-block-content">
                                        ${(block.content || '').substring(0, 120)}${block.content && block.content.length > 120 ? '...' : ''}
                                    </div>
                                </div>
                            `
                                )
                                .join('')}
                        </div>
                    </div>
                `
                        : `
                    <div class="day-session-empty">
                        <i class="fas fa-clipboard-list"></i>
                        <p>Aucun bloc d'entraînement défini</p>
                    </div>
                `
                }
            </div>
        `;
    },

    // Ajouter une nouvelle séance
    addNewSession(dateKey) {
        this.editSession(dateKey, -1); // -1 = nouvelle séance
    },

    // Modifier/créer une séance (VERSION SUPABASE)
    editSession(dateKeyOrSessionId, sessionIndex = null) {
        // Si c'est un UUID, c'est un sessionId (modification)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            dateKeyOrSessionId
        );

        let session = {};
        let dateKey = dateKeyOrSessionId;
        let isNew = true;

        if (isUUID) {
            // Mode modification : charger la session par ID
            session = this.cachedSessions.find(s => s.id === dateKeyOrSessionId) || {};
            dateKey = session.date || new Date().toISOString().split('T')[0];
            isNew = false;
        } else {
            // Mode création : nouvelle session pour cette date
            dateKey = dateKeyOrSessionId;
            isNew = true;
        }

        const html = `
            <div class="fixed inset-0 modal-backdrop flex items-center justify-center z-50 fade-in" onclick="Utils.closeModal(event)">
                <div class="session-modal" onclick="event.stopPropagation()">
                    <div class="session-modal-header">
                        <h3 class="session-modal-title">${isNew ? 'Nouvelle séance' : 'Modifier la séance'}</h3>
                    </div>
                    
                    <div class="session-modal-content">
                        <form class="session-form">
                            <!-- Session Header -->
                            <div class="session-form-header">
                                <div class="session-form-row">
                                    <div class="session-form-group">
                                        <label class="session-form-label">
                                            Titre de la séance
                                            <button type="button" onclick="CalendarManager.showSessionNamesManager()"
                                                    class="text-xs text-skali-accent hover:underline ml-2"
                                                    title="Gérer les noms de séances">
                                                <i class="fas fa-cog"></i> Gérer
                                            </button>
                                        </label>
                                        <select id="sessionTitleSelect"
                                                onchange="CalendarManager.handleTitleSelectChange()"
                                                class="session-form-select">
                                            <option value="">-- Sélectionner --</option>
                                            ${this.sessionNames
                                                .map(item => {
                                                    const itemName =
                                                        typeof item === 'string' ? item : item.name;
                                                    const itemColor =
                                                        typeof item === 'string'
                                                            ? '#64748b'
                                                            : item.color;
                                                    return `
                                                <option value="${itemName}" ${session.title === itemName ? 'selected' : ''} data-color="${itemColor}">
                                                    ${itemName}
                                                </option>
                                            `;
                                                })
                                                .join('')}
                                            <option value="__custom__" ${session.title && !this.sessionNames.map(i => (typeof i === 'string' ? i : i.name)).includes(session.title) ? 'selected' : ''}>
                                                ✏️ Titre personnalisé...
                                            </option>
                                        </select>
                                        <input type="text"
                                               id="sessionTitle"
                                               value="${session.title && !this.sessionNames.includes(session.title) ? session.title : ''}"
                                               placeholder="Ex: WOD du matin, Force du soir..."
                                               class="session-form-input mt-2"
                                               style="display: ${session.title && !this.sessionNames.includes(session.title) ? 'block' : 'none'}">
                                    </div>
                                    <div class="session-form-group">
                                        <label class="session-form-label">Catégorie</label>
                                        <select id="sessionCategory" class="session-form-select">
                                            <option value="">Choisir une catégorie</option>
                                            ${Object.entries(CONFIG.SESSION_CATEGORIES)
                                                .map(
                                                    ([key, cat]) => `
                                                <option value="${key}" ${session.category === key ? 'selected' : ''}>
                                                    ${cat.name}
                                                </option>
                                            `
                                                )
                                                .join('')}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Blocs d'entraînement -->
                            <div class="session-blocks-section">
                                <div class="session-blocks-header">
                                    <h4 class="session-blocks-title">Blocs d'entraînement</h4>
                                    <button type="button" id="aiGenerateBtn" onclick="SimpleSessionGenerator.generateFromForm()" class="session-add-block-btn ai-generate">
                                        <i class="fas fa-magic"></i>
                                        Générer avec IA
                                    </button>
                                    <button type="button" onclick="CalendarManager.addBlock()" class="session-add-block-btn">
                                        <i class="fas fa-plus"></i>
                                        Ajouter un bloc
                                    </button>
                                </div>
                                
                                <div id="blocksList" class="session-blocks-list">
                                    ${session.blocks ? session.blocks.map((block, idx) => this.generateBlockHTML(block, idx)).join('') : ''}
                                </div>
                            </div>
                            
                            <!-- Actions -->
                            <div class="session-actions">
                                <button type="button" onclick="CalendarManager.saveSession('${dateKey}', '${isNew ? 'new' : session.id || 'new'}')" class="session-btn session-btn-primary">
                                    <i class="fas fa-save"></i>
                                    ${isNew ? 'Créer la séance' : 'Enregistrer les modifications'}
                                </button>
                                <button type="button" onclick="CalendarManager.openDayModal('${dateKey}')" class="session-btn session-btn-secondary">
                                    <i class="fas fa-times"></i>
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        // Optimisation: utiliser requestAnimationFrame pour éviter le lag
        const modalContainer = document.getElementById('modalContainer');

        // Étape 1: Afficher le HTML de base rapidement
        requestAnimationFrame(() => {
            modalContainer.innerHTML = html;

            // Étape 2: Ajouter le bloc par défaut si nécessaire (dans un autre frame)
            if (isNew || !session.blocks || session.blocks.length === 0) {
                requestAnimationFrame(() => {
                    this.addBlock();

                    // Étape 3: Initialiser le drag & drop (dans un autre frame)
                    requestAnimationFrame(() => {
                        this.initAllDragAndDrop();
                    });
                });
            } else {
                // Si des blocs existent déjà, initialiser directement
                requestAnimationFrame(() => {
                    this.initAllDragAndDrop();
                });
            }
        });
    },

    // Générer le HTML d'un bloc avec drag & drop
    generateBlockHTML(block, idx) {
        return `
            <div class="session-block-item" draggable="true" data-index="${idx}">
                <div class="session-block-header">
                    <div class="session-block-drag-handle" title="Déplacer le bloc">
                        <i class="fas fa-grip-vertical"></i>
                    </div>
                    <input type="text" value="${block?.name || ''}" placeholder="Nom du bloc (ex: Échauffement, Force, Cardio...)"
                           class="session-block-name">
                    <button type="button" onclick="SmartSessionGenerator.regenerateBlockFromDOM(this)"
                            class="session-block-regenerate-btn"
                            title="Régénérer ce bloc avec l'IA"
                            style="background: #00d4ff; color: white; border: none; padding: 0.5rem 0.75rem; border-radius: 0.5rem; cursor: pointer; margin-left: 0.5rem; font-size: 0.875rem; font-weight: 600; transition: all 0.2s;">
                        <i class="fas fa-sync-alt"></i> Régénérer
                    </button>
                    <button type="button" onclick="CalendarManager.removeBlock(this)" class="session-block-delete-btn" title="Supprimer le bloc">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <textarea placeholder="Détails du bloc (exercices, séries, reps, notes...)"
                          class="session-block-content">${block?.content || ''}</textarea>
            </div>
        `;
    },

    // Ajouter un bloc
    addBlock() {
        const list = document.getElementById('blocksList');
        const div = document.createElement('div');
        div.innerHTML = this.generateBlockHTML({}, list.children.length);
        const newBlock = div.firstElementChild;
        list.appendChild(newBlock);
        this.initDragAndDrop(newBlock);
    },

    // Supprimer un bloc
    removeBlock(btn) {
        btn.closest('.session-block-item').remove();
    },

    // Sauvegarder une séance (VERSION SUPABASE avec validation doublon)
    async saveSession(dateKey, sessionIdOrNew) {
        // Récupérer le titre depuis le select ou l'input custom
        const titleSelect = document.getElementById('sessionTitleSelect');
        const titleInput = document.getElementById('sessionTitle');
        const title =
            titleSelect && titleSelect.value && titleSelect.value !== '__custom__'
                ? titleSelect.value
                : titleInput.value.trim();

        const category = document.getElementById('sessionCategory').value;

        const blocks = [];
        document.querySelectorAll('.session-block-item').forEach(item => {
            const name = item.querySelector('.session-block-name').value;
            const content = item.querySelector('.session-block-content').value;
            if (name || content) {
                blocks.push({ name, content });
            }
        });

        if (blocks.length === 0 && !title) {
            Utils.showNotification('Veuillez ajouter au moins un bloc ou un titre', 'warning');
            return;
        }

        // Vérifier doublon uniquement pour nouvelle session
        if (sessionIdOrNew === 'new') {
            const isDuplicate = await this.checkDuplicateSession(dateKey, title, category);
            if (isDuplicate) {
                if (!confirm('Une séance similaire existe déjà à cette date. Créer quand même ?')) {
                    return;
                }
            }
        }

        const sessionData = {
            date: dateKey,
            title: title || 'Séance',
            category: category || null,
            blocks: blocks
        };

        try {
            if (sessionIdOrNew === 'new') {
                // Créer une nouvelle session
                await SupabaseManager.createSession(sessionData);
                Utils.showNotification('Séance créée', 'success');
            } else {
                // Modifier une session existante
                await SupabaseManager.updateSession(sessionIdOrNew, sessionData);
                Utils.showNotification('Séance modifiée', 'success');
            }

            // Fermer la modal et rafraîchir
            Utils.closeModal();
            await this.showCalendarView();
        } catch (error) {
            console.error('Erreur sauvegarde session:', error);
            Utils.showNotification('Erreur lors de la sauvegarde', 'error');
        }
    },

    // Supprimer une séance (VERSION SUPABASE)
    async deleteSession(sessionId) {
        const session = this.cachedSessions.find(s => s.id === sessionId);

        if (!session) {
            Utils.showNotification('Séance non trouvée', 'error');
            return;
        }

        if (confirm(`Supprimer la séance "${session.title || 'Sans titre'}" ?`)) {
            try {
                await SupabaseManager.deleteSession(sessionId);
                Utils.showNotification('Séance supprimée', 'success');
                Utils.closeModal();
                await this.showCalendarView();
            } catch (error) {
                console.error('Erreur suppression session:', error);
                Utils.showNotification('Erreur lors de la suppression', 'error');
            }
        }
    },

    // Ouvrir le mode TV dans une nouvelle fenêtre séparée
    openTVMode(sessionId) {
        const session = this.cachedSessions.find(s => s.id === sessionId);
        if (!session) {
            Utils.showNotification('Séance non trouvée', 'error');
            return;
        }

        // Fermer les modales
        Utils.closeModal();

        // Construire l'URL du mode TV
        const tvUrl = new URL(window.location.origin + window.location.pathname);
        tvUrl.searchParams.set('tv', 'true');
        tvUrl.searchParams.set('date', sessionId);
        tvUrl.searchParams.set('session', '0');

        // Ouvrir dans une nouvelle fenêtre (popup)
        const tvWindow = window.open(
            tvUrl.href,
            'TVMode_' + sessionId,
            'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=no'
        );

        if (!tvWindow) {
            Utils.showNotification(
                'Veuillez autoriser les popups pour ouvrir le mode TV',
                'warning'
            );
        } else {
            Utils.showNotification('Mode TV ouvert dans une nouvelle fenêtre', 'success');
            console.log('📺 Mode TV ouvert dans nouvelle fenêtre:', tvUrl.href);
        }
    },

    // Drag & Drop entre jours
    draggedDateKey: null,
    isDragging: false,

    handleDayClick(dateKey) {
        // Ne pas ouvrir la modal si on vient de faire un drag & drop
        if (this.isDragging) {
            this.isDragging = false;
            return;
        }
        this.openDayModal(dateKey);
    },

    handleDayDragStart(event, dateKey) {
        this.isDragging = true;
        this.draggedDateKey = dateKey;
        event.currentTarget.classList.add('dragging');
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', dateKey);
    },

    handleDayDragLeave(event) {
        // Nettoyer la classe drag-over quand on quitte le jour
        event.currentTarget.classList.remove('drag-over');
    },

    handleDayDragEnd() {
        // Nettoyer tout quand le drag se termine
        this.draggedDateKey = null;
        document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));

        // Réinitialiser isDragging après un court délai pour éviter le click
        setTimeout(() => {
            this.isDragging = false;
        }, 100);
    },

    handleDayDragOver(event) {
        if (!this.draggedDateKey) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'move';

        // Nettoyer d'abord toutes les autres classes drag-over
        document.querySelectorAll('.drag-over').forEach(el => {
            if (el !== event.currentTarget) {
                el.classList.remove('drag-over');
            }
        });

        // Ajouter la classe au jour ciblé
        event.currentTarget.classList.add('drag-over');
    },

    async handleDayDrop(event, targetDateKey) {
        event.preventDefault();
        event.stopPropagation();

        // Nettoyer les classes drag-over
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        event.currentTarget.classList.remove('drag-over');

        if (!this.draggedDateKey || this.draggedDateKey === targetDateKey) {
            this.draggedDateKey = null;
            document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
            return;
        }

        const sourceSessions = this.cachedSessions.filter(s => s.date === this.draggedDateKey);

        if (sourceSessions.length === 0) {
            this.draggedDateKey = null;
            document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
            return;
        }

        // Formater les dates pour un affichage plus lisible
        const sourceDate = new Date(this.draggedDateKey).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long'
        });
        const targetDate = new Date(targetDateKey).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long'
        });

        // Demander confirmation avec plus de détails
        const sessionsList = sourceSessions.map(s => `- ${s.title || 'Séance'}`).join('\n');
        const confirmMessage = `Déplacer ${sourceSessions.length} séance(s) du ${sourceDate} vers le ${targetDate} ?\n\n${sessionsList}`;

        if (confirm(confirmMessage)) {
            console.log('🚀 Début du déplacement des séances...');
            console.log('Source:', this.draggedDateKey);
            console.log('Target:', targetDateKey);
            console.log('Sessions à déplacer:', sourceSessions);

            try {
                // Déplacer chaque session
                for (const session of sourceSessions) {
                    console.log(
                        `Déplacement de la session ${session.id} de ${session.date} vers ${targetDateKey}`
                    );
                    await SupabaseManager.updateSession(session.id, { date: targetDateKey });
                    console.log(`✅ Session ${session.id} déplacée avec succès`);
                }

                console.log('✅ Toutes les séances ont été déplacées');
                Utils.showNotification(
                    `${sourceSessions.length} séance(s) déplacée(s) avec succès`,
                    'success'
                );
                await this.showCalendarView();
            } catch (error) {
                console.error('❌ Erreur déplacement sessions:', error);
                Utils.showNotification('Erreur lors du déplacement: ' + error.message, 'error');
            }
        } else {
            console.log("❌ Déplacement annulé par l'utilisateur");
        }

        // Toujours nettoyer l'état de drag
        this.draggedDateKey = null;
        document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
    },

    // Prévention duplication - Vérifier les doublons
    async checkDuplicateSession(dateKey, title, category) {
        const existingSessions = this.cachedSessions.filter(
            s => s.date === dateKey && s.title === title && s.category === category
        );

        return existingSessions.length > 0;
    },

    // Modal pour dupliquer une séance
    showDuplicateModal(sessionId) {
        const session = this.cachedSessions.find(s => s.id === sessionId);
        if (!session) {
            Utils.showNotification('Séance non trouvée', 'error');
            return;
        }

        const today = this.formatDateKey(new Date());

        const modal = `
            <div class="fixed inset-0 flex items-center justify-center z-[1200] fade-in"
                 style="background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(8px);"
                 onclick="Utils.closeModal(event)">

                <!-- Modal Container - Gorilla Glass Design -->
                <div class="w-full max-w-md mx-4" onclick="event.stopPropagation()">
                    <div style="
                        background: rgba(255, 255, 255, 0.05);
                        backdrop-filter: blur(40px);
                        border: 1px solid rgba(255, 255, 255, 0.12);
                        border-radius: 20px;
                        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset;
                        overflow: hidden;
                    ">
                        <!-- Header avec icône -->
                        <div style="
                            padding: 24px 24px 16px 24px;
                            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                        ">
                            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 12px;">
                                <div style="
                                    width: 48px;
                                    height: 48px;
                                    background: linear-gradient(135deg, #007aff 0%, #5ac8fa 100%);
                                    border-radius: 14px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    box-shadow: 0 8px 24px rgba(0, 122, 255, 0.3);
                                ">
                                    <i class="fas fa-copy" style="font-size: 20px; color: white;"></i>
                                </div>
                                <div style="flex: 1;">
                                    <h3 style="
                                        font-size: 20px;
                                        font-weight: 700;
                                        color: var(--text-primary);
                                        margin: 0;
                                        line-height: 1.2;
                                    ">Dupliquer la séance</h3>
                                    <p style="
                                        font-size: 13px;
                                        color: var(--text-muted);
                                        margin: 4px 0 0 0;
                                    ">Choisir la date de destination</p>
                                </div>
                            </div>
                        </div>

                        <!-- Prévisualisation de la séance -->
                        <div style="padding: 20px 24px;">
                            <div style="
                                background: rgba(0, 122, 255, 0.08);
                                border: 1px solid rgba(0, 122, 255, 0.2);
                                border-radius: 12px;
                                padding: 16px;
                                margin-bottom: 20px;
                            ">
                                <div style="display: flex; align-items: start; gap: 12px;">
                                    <div style="
                                        width: 8px;
                                        height: 8px;
                                        background: linear-gradient(135deg, #007aff, #5ac8fa);
                                        border-radius: 50%;
                                        margin-top: 6px;
                                        flex-shrink: 0;
                                    "></div>
                                    <div style="flex: 1; min-width: 0;">
                                        <div style="
                                            font-size: 15px;
                                            font-weight: 600;
                                            color: var(--text-primary);
                                            margin-bottom: 6px;
                                            word-wrap: break-word;
                                        ">${session.title}</div>
                                        ${
                                            session.category
                                                ? `
                                        <span class="session-category-${session.category}" style="
                                            font-size: 11px;
                                            padding: 4px 10px;
                                            border-radius: 6px;
                                            display: inline-block;
                                            font-weight: 500;
                                        ">
                                            ${CONFIG.SESSION_CATEGORIES[session.category]?.name}
                                        </span>
                                        `
                                                : ''
                                        }
                                    </div>
                                </div>
                            </div>

                            <!-- Sélecteur de date -->
                            <div style="margin-bottom: 24px;">
                                <label style="
                                    display: block;
                                    font-size: 13px;
                                    font-weight: 600;
                                    color: var(--text-secondary);
                                    margin-bottom: 8px;
                                ">
                                    <i class="fas fa-calendar-alt" style="margin-right: 6px; color: var(--accent-primary);"></i>
                                    Date de destination
                                </label>
                                <input
                                    type="date"
                                    id="duplicateTargetDate"
                                    value="${today}"
                                    style="
                                        width: 100%;
                                        padding: 14px 16px;
                                        background: rgba(255, 255, 255, 0.05);
                                        border: 1px solid rgba(255, 255, 255, 0.12);
                                        border-radius: 12px;
                                        color: var(--text-primary);
                                        font-size: 15px;
                                        font-weight: 500;
                                        transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
                                        outline: none;
                                        color-scheme: dark;
                                    "
                                    onfocus="this.style.borderColor='rgba(0, 122, 255, 0.5)'; this.style.background='rgba(0, 122, 255, 0.08)'; this.style.boxShadow='0 0 0 4px rgba(0, 122, 255, 0.12)';"
                                    onblur="this.style.borderColor='rgba(255, 255, 255, 0.12)'; this.style.background='rgba(255, 255, 255, 0.05)'; this.style.boxShadow='none';"
                                >
                            </div>

                            <!-- Boutons d'action -->
                            <div style="display: flex; gap: 12px;">
                                <button
                                    onclick="CalendarManager.executeDuplicateSession('${sessionId}')"
                                    style="
                                        flex: 1;
                                        padding: 14px 20px;
                                        background: linear-gradient(135deg, #007aff 0%, #5ac8fa 100%);
                                        border: none;
                                        border-radius: 12px;
                                        color: white;
                                        font-size: 15px;
                                        font-weight: 600;
                                        cursor: pointer;
                                        transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
                                        box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3);
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        gap: 8px;
                                    "
                                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 24px rgba(0, 122, 255, 0.4)';"
                                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 16px rgba(0, 122, 255, 0.3)';"
                                >
                                    <i class="fas fa-copy"></i>
                                    <span>Dupliquer</span>
                                </button>
                                <button
                                    onclick="Utils.closeModal()"
                                    style="
                                        flex: 0.5;
                                        padding: 14px 20px;
                                        background: rgba(255, 255, 255, 0.05);
                                        border: 1px solid rgba(255, 255, 255, 0.12);
                                        border-radius: 12px;
                                        color: var(--text-secondary);
                                        font-size: 15px;
                                        font-weight: 600;
                                        cursor: pointer;
                                        transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
                                    "
                                    onmouseover="this.style.background='rgba(255, 255, 255, 0.09)'; this.style.borderColor='rgba(255, 255, 255, 0.2)';"
                                    onmouseout="this.style.background='rgba(255, 255, 255, 0.05)'; this.style.borderColor='rgba(255, 255, 255, 0.12)';"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modalContainer').innerHTML = modal;
    },

    // Exécuter la duplication
    async executeDuplicateSession(sessionId) {
        const targetDateKey = document.getElementById('duplicateTargetDate').value;
        if (!targetDateKey) {
            Utils.showNotification('Veuillez sélectionner une date', 'warning');
            return;
        }

        await this.duplicateSession(sessionId, targetDateKey);
        Utils.closeModal();
    },

    // Quick Actions - Dupliquer séance
    async duplicateSession(sessionId, targetDateKey) {
        const session = this.cachedSessions.find(s => s.id === sessionId);
        if (!session) {
            Utils.showNotification('Séance non trouvée', 'error');
            return;
        }

        // Vérifier doublon
        const isDuplicate = await this.checkDuplicateSession(
            targetDateKey,
            session.title,
            session.category
        );

        if (isDuplicate) {
            if (
                !confirm(`Une séance similaire existe déjà le ${targetDateKey}. Créer quand même ?`)
            ) {
                return;
            }
        }

        const newSession = {
            date: targetDateKey,
            title: session.title,
            category: session.category,
            blocks: session.blocks
        };

        try {
            await SupabaseManager.createSession(newSession);
            Utils.showNotification('Séance dupliquée', 'success');
            await this.showCalendarView();
        } catch (error) {
            console.error('Erreur duplication session:', error);
            Utils.showNotification('Erreur lors de la duplication', 'error');
        }
    },

    // Quick Actions - Dupliquer semaine
    async duplicateWeek() {
        Utils.closeModal();

        const modal = `
            <div class="fixed inset-0 modal-backdrop flex items-center justify-center z-50 fade-in" onclick="Utils.closeModal(event)">
                <div class="bg-skali-light rounded-xl p-6 max-w-md w-full" onclick="event.stopPropagation()">
                    <h3 class="text-xl font-bold mb-4">Dupliquer la semaine</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm mb-2">Semaine source</label>
                            <input type="date" id="sourceWeekDate" class="w-full px-4 py-2 bg-skali-dark rounded-lg border border-skali">
                        </div>
                        <div>
                            <label class="block text-sm mb-2">Semaine destination</label>
                            <input type="date" id="targetWeekDate" class="w-full px-4 py-2 bg-skali-dark rounded-lg border border-skali">
                        </div>
                        <div class="flex gap-2">
                            <button onclick="CalendarManager.executeDuplicateWeek()" class="flex-1 px-4 py-2 bg-skali-accent rounded-lg hover:opacity-80 transition">
                                Dupliquer
                            </button>
                            <button onclick="Utils.closeModal()" class="flex-1 px-4 py-2 bg-skali-dark rounded-lg hover:opacity-80 transition">
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modalContainer').innerHTML = modal;
    },

    async executeDuplicateWeek() {
        const sourceDate = new Date(document.getElementById('sourceWeekDate').value);
        const targetDate = new Date(document.getElementById('targetWeekDate').value);

        if (!sourceDate || !targetDate) {
            Utils.showNotification('Veuillez sélectionner les deux dates', 'warning');
            return;
        }

        const sourceWeekStart = this.getWeekStart(sourceDate);
        const targetWeekStart = this.getWeekStart(targetDate);

        const sessionsToClone = [];

        // Récupérer toutes les sessions de la semaine source
        for (let i = 0; i < 7; i++) {
            const sourceDay = new Date(sourceWeekStart);
            sourceDay.setDate(sourceDay.getDate() + i);
            const sourceDateKey = this.formatDateKey(sourceDay);

            const targetDay = new Date(targetWeekStart);
            targetDay.setDate(targetDay.getDate() + i);
            const targetDateKey = this.formatDateKey(targetDay);

            const daySessions = this.cachedSessions.filter(s => s.date === sourceDateKey);

            daySessions.forEach(session => {
                sessionsToClone.push({
                    date: targetDateKey,
                    title: session.title,
                    category: session.category,
                    blocks: session.blocks
                });
            });
        }

        if (sessionsToClone.length === 0) {
            Utils.showNotification('Aucune séance à dupliquer', 'warning');
            return;
        }

        try {
            for (const session of sessionsToClone) {
                await SupabaseManager.createSession(session);
            }

            Utils.showNotification(`${sessionsToClone.length} séance(s) dupliquée(s)`, 'success');
            Utils.closeModal();
            await this.showCalendarView();
        } catch (error) {
            console.error('Erreur duplication semaine:', error);
            Utils.showNotification('Erreur lors de la duplication', 'error');
        }
    },

    // Quick Actions - Export JSON
    exportWeek() {
        const weekStart = this.getWeekStart(this.currentViewDate);
        const sessions = [];

        for (let i = 0; i < 7; i++) {
            const day = new Date(weekStart);
            day.setDate(day.getDate() + i);
            const dateKey = this.formatDateKey(day);
            const daySessions = this.cachedSessions.filter(s => s.date === dateKey);
            sessions.push(...daySessions);
        }

        if (sessions.length === 0) {
            Utils.showNotification('Aucune séance à exporter', 'warning');
            return;
        }

        const data = JSON.stringify(sessions, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `skaliprog_semaine_${this.formatDateKey(weekStart)}.json`;
        a.click();
        URL.revokeObjectURL(url);

        Utils.showNotification('Semaine exportée', 'success');
    },

    // Quick Actions - Import JSON
    importWeek() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = async e => {
            const file = e.target.files[0];
            if (!file) {
                return;
            }

            const reader = new FileReader();
            reader.onload = async event => {
                try {
                    const sessions = JSON.parse(event.target.result);

                    if (!Array.isArray(sessions)) {
                        Utils.showNotification('Format JSON invalide', 'error');
                        return;
                    }

                    for (const session of sessions) {
                        // Supprimer l'ID pour créer de nouvelles sessions
                        delete session.id;
                        await SupabaseManager.createSession(session);
                    }

                    Utils.showNotification(`${sessions.length} séance(s) importée(s)`, 'success');
                    await this.showCalendarView();
                } catch (error) {
                    console.error('Erreur import:', error);
                    Utils.showNotification("Erreur lors de l'import", 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    },

    // Quick Actions - Templates
    showTemplatesModal() {
        const templates = [
            {
                name: 'WOD CrossTraining Classique',
                category: 'crosstraining',
                blocks: [
                    {
                        name: 'Échauffement',
                        content:
                            '10 min mobilité articulaire\n5 rounds:\n- 5 squats\n- 5 pompes\n- 5 sit-ups'
                    },
                    {
                        name: 'Technique',
                        content:
                            'Snatch technique\n10 min EMOM:\nOdd: 3 power snatch\nEven: 3 overhead squat'
                    },
                    {
                        name: 'WOD',
                        content:
                            'For Time (15 min cap):\n21-15-9\n- Thrusters (42.5/30 kg)\n- Pull-ups'
                    }
                ]
            },
            {
                name: 'Séance Force',
                category: 'musculation',
                blocks: [
                    {
                        name: 'Échauffement',
                        content: '5 min cardio léger\nMobilité épaules et hanches'
                    },
                    { name: 'Force A', content: 'Back Squat\n5x5 @ 80%' },
                    { name: 'Force B', content: 'Bench Press\n5x5 @ 80%' },
                    {
                        name: 'Accessoire',
                        content: '3 rounds:\n- 10 dumbbell rows\n- 15 leg curls\n- 20 abs'
                    }
                ]
            },
            {
                name: 'Cardio Endurance',
                category: 'cardio',
                blocks: [
                    { name: 'Échauffement', content: '5 min easy pace' },
                    {
                        name: 'Main Set',
                        content: '30 min steady state\nZone 2 (conversational pace)'
                    },
                    { name: 'Cool down', content: '5 min easy + stretching' }
                ]
            }
        ];

        const html = `
            <div class="fixed inset-0 modal-backdrop flex items-center justify-center z-50 fade-in" onclick="Utils.closeModal(event)">
                <div class="bg-skali-light rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onclick="event.stopPropagation()">
                    <h3 class="text-xl font-bold mb-4">Templates de séances</h3>
                    <div class="space-y-3">
                        ${templates
                            .map(
                                (template, idx) => `
                            <div class="bg-skali-dark p-4 rounded-lg hover:bg-opacity-80 cursor-pointer transition"
                                 onclick="CalendarManager.applyTemplate(${idx})">
                                <h4 class="font-bold mb-2">${template.name}</h4>
                                <span class="session-category-${template.category} text-xs px-2 py-1 rounded">
                                    ${CONFIG.SESSION_CATEGORIES[template.category]?.name}
                                </span>
                                <div class="mt-2 text-sm text-gray-400">
                                    ${template.blocks.length} blocs
                                </div>
                            </div>
                        `
                            )
                            .join('')}
                    </div>
                    <div class="mt-4">
                        <button onclick="Utils.closeModal()" class="w-full px-4 py-2 bg-skali-dark rounded-lg hover:opacity-80 transition">
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modalContainer').innerHTML = html;

        // Stocker les templates pour y accéder
        window.calendarTemplates = templates;
    },

    applyTemplate(templateIndex) {
        const template = window.calendarTemplates[templateIndex];
        const today = this.formatDateKey(new Date());

        Utils.closeModal();

        // Pré-remplir les champs dans la modal d'édition
        setTimeout(() => {
            this.editSessionWithTemplate(today, template);
        }, 100);
    },

    editSessionWithTemplate(dateKey, template) {
        const html = `
            <div class="fixed inset-0 modal-backdrop flex items-center justify-center z-50 fade-in" onclick="Utils.closeModal(event)">
                <div class="session-modal" onclick="event.stopPropagation()">
                    <div class="session-modal-header">
                        <h3 class="session-modal-title">Nouvelle séance depuis template</h3>
                    </div>

                    <div class="session-modal-content">
                        <form class="session-form">
                            <div class="session-form-header">
                                <div class="session-form-row">
                                    <div class="session-form-group">
                                        <label class="session-form-label">Titre de la séance</label>
                                        <input type="text" id="sessionTitle" value="${template.name}"
                                               class="session-form-input">
                                    </div>
                                    <div class="session-form-group">
                                        <label class="session-form-label">Catégorie</label>
                                        <select id="sessionCategory" class="session-form-select">
                                            <option value="">Choisir une catégorie</option>
                                            ${Object.entries(CONFIG.SESSION_CATEGORIES)
                                                .map(
                                                    ([key, cat]) => `
                                                <option value="${key}" ${template.category === key ? 'selected' : ''}>
                                                    ${cat.name}
                                                </option>
                                            `
                                                )
                                                .join('')}
                                        </select>
                                    </div>
                                    <div class="session-form-group">
                                        <label class="session-form-label">Date</label>
                                        <input type="date" id="sessionDate" value="${dateKey}"
                                               class="session-form-input">
                                    </div>
                                </div>
                            </div>

                            <div class="session-blocks-section">
                                <div class="session-blocks-header">
                                    <h4 class="session-blocks-title">Blocs d'entraînement</h4>
                                    <button type="button" onclick="CalendarManager.addBlock()" class="session-add-block-btn">
                                        <i class="fas fa-plus"></i>
                                        Ajouter un bloc
                                    </button>
                                </div>

                                <div id="blocksList" class="session-blocks-list">
                                    ${template.blocks.map((block, idx) => this.generateBlockHTML(block, idx)).join('')}
                                </div>
                            </div>

                            <div class="session-actions">
                                <button type="button" onclick="CalendarManager.saveSessionFromTemplate()" class="session-btn session-btn-primary">
                                    <i class="fas fa-save"></i>
                                    Créer la séance
                                </button>
                                <button type="button" onclick="Utils.closeModal()" class="session-btn session-btn-secondary">
                                    <i class="fas fa-times"></i>
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        // Optimisation: utiliser requestAnimationFrame
        requestAnimationFrame(() => {
            document.getElementById('modalContainer').innerHTML = html;

            requestAnimationFrame(() => {
                this.initAllDragAndDrop();
            });
        });
    },

    async saveSessionFromTemplate() {
        const title = document.getElementById('sessionTitle').value.trim();
        const category = document.getElementById('sessionCategory').value;
        const dateKey = document.getElementById('sessionDate').value;

        const blocks = [];
        document.querySelectorAll('.session-block-item').forEach(item => {
            const name = item.querySelector('.session-block-name').value;
            const content = item.querySelector('.session-block-content').value;
            if (name || content) {
                blocks.push({ name, content });
            }
        });

        if (blocks.length === 0 && !title) {
            Utils.showNotification('Veuillez ajouter au moins un bloc ou un titre', 'warning');
            return;
        }

        // Vérifier doublon
        const isDuplicate = await this.checkDuplicateSession(dateKey, title, category);
        if (isDuplicate) {
            if (!confirm('Une séance similaire existe déjà. Créer quand même ?')) {
                return;
            }
        }

        const sessionData = {
            date: dateKey,
            title: title || 'Séance',
            category: category || null,
            blocks: blocks
        };

        try {
            await SupabaseManager.createSession(sessionData);
            Utils.showNotification('Séance créée depuis template', 'success');
            Utils.closeModal();
            await this.showCalendarView();
        } catch (error) {
            console.error('Erreur sauvegarde session:', error);
            Utils.showNotification('Erreur lors de la sauvegarde', 'error');
        }
    },

    // Initialiser le drag & drop pour tous les blocs (EVENT DELEGATION - 1 seul listener)
    initAllDragAndDrop() {
        const blocksList = document.getElementById('blocksList');
        if (!blocksList) {
            return;
        }

        // Éviter les duplications: vérifier si déjà initialisé
        if (blocksList._dragInitialized) {
            return;
        }
        blocksList._dragInitialized = true;

        // OPTIMISATION: Event delegation sur le conteneur parent (1 listener au lieu de N)
        blocksList.addEventListener(
            'dragstart',
            e => {
                const block = e.target.closest('.session-block-item');
                if (!block) {
                    return;
                }

                block.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', block.outerHTML);
                e.dataTransfer.setData('text/plain', block.dataset.index);
            },
            { passive: false }
        );

        blocksList.addEventListener('dragend', e => {
            const block = e.target.closest('.session-block-item');
            if (!block) {
                return;
            }

            block.classList.remove('dragging');
            // Nettoyer les classes drag-over
            document.querySelectorAll('.session-block-item').forEach(b => {
                b.classList.remove('drag-over');
            });
        });

        blocksList.addEventListener(
            'dragover',
            e => {
                e.preventDefault();
                const block = e.target.closest('.session-block-item');
                if (!block) {
                    return;
                }

                e.dataTransfer.dropEffect = 'move';

                const draggingBlock = document.querySelector('.dragging');
                if (draggingBlock && draggingBlock !== block) {
                    block.classList.add('drag-over');
                }
            },
            { passive: false }
        );

        blocksList.addEventListener('dragleave', e => {
            const block = e.target.closest('.session-block-item');
            if (!block) {
                return;
            }

            block.classList.remove('drag-over');
        });

        blocksList.addEventListener(
            'drop',
            e => {
                e.preventDefault();
                const block = e.target.closest('.session-block-item');
                if (!block) {
                    return;
                }

                block.classList.remove('drag-over');

                const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
                const targetIndex = parseInt(block.dataset.index);

                if (draggedIndex !== targetIndex) {
                    this.reorderBlocks(draggedIndex, targetIndex);
                }
            },
            { passive: false }
        );
    },

    // Initialiser le drag & drop pour un bloc spécifique (DÉPRÉCIÉ - event delegation utilisé)
    initDragAndDrop(block) {
        // Ne fait plus rien - la délégation d'événements gère tout
        // Fonction gardée pour compatibilité avec addBlock()
    },

    // Réorganiser les blocs
    reorderBlocks(fromIndex, toIndex) {
        const blocksList = document.getElementById('blocksList');
        const blocks = Array.from(blocksList.children);

        // Échanger les éléments dans le DOM
        const draggedBlock = blocks[fromIndex];
        const targetBlock = blocks[toIndex];

        if (fromIndex < toIndex) {
            targetBlock.parentNode.insertBefore(draggedBlock, targetBlock.nextSibling);
        } else {
            targetBlock.parentNode.insertBefore(draggedBlock, targetBlock);
        }

        // Mettre à jour les indices data-index
        this.updateBlockIndices();

        // PLUS BESOIN de réinitialiser - event delegation gère automatiquement
    },

    // Mettre à jour les indices des blocs après réorganisation
    updateBlockIndices() {
        const blocks = document.querySelectorAll('.session-block-item');
        blocks.forEach((block, index) => {
            block.dataset.index = index;
        });
    },

    // ═══════════════════════════════════════════════════════════
    // GESTION DES NOMS DE SÉANCES PRÉDÉFINIS
    // ═══════════════════════════════════════════════════════════

    // Charger les noms de séances depuis localStorage
    loadSessionNames() {
        const stored = localStorage.getItem('calendarSessionNames');
        const version = localStorage.getItem('calendarSessionNamesVersion');
        const currentVersion = '2.0'; // Version La Skàli

        // Si version différente ou pas de version, réinitialiser
        if (version !== currentVersion) {
            console.log('🔄 Mise à jour des noms de séances vers version', currentVersion);
            this.sessionNames = this.getDefaultSessionNames();
            localStorage.setItem('calendarSessionNamesVersion', currentVersion);
            this.saveSessionNames();
            return;
        }

        if (stored) {
            try {
                this.sessionNames = JSON.parse(stored);
            } catch (e) {
                console.error('Erreur chargement noms de séances:', e);
                this.sessionNames = this.getDefaultSessionNames();
            }
        } else {
            this.sessionNames = this.getDefaultSessionNames();
            this.saveSessionNames();
        }
    },

    // Sauvegarder les noms dans localStorage
    saveSessionNames() {
        localStorage.setItem('calendarSessionNames', JSON.stringify(this.sessionNames));
    },

    // Noms par défaut avec couleurs
    getDefaultSessionNames() {
        return [
            { name: 'HYROX', color: '#f59e0b' },
            { name: 'HYROX LONG', color: '#f97316' },
            { name: 'GYM SKILLS', color: '#8b5cf6' },
            { name: 'BARBELLS CLUB', color: '#ef4444' },
            { name: 'TACTICAL', color: '#dc2626' },
            { name: 'BUILD', color: '#3b82f6' },
            { name: 'POWER', color: '#6366f1' },
            { name: 'SPÉ RUN & BIKE', color: '#10b981' },
            { name: 'Haltérophilie', color: '#ef4444' },
            { name: 'Endurance', color: '#06b6d4' },
            { name: 'Mobilité', color: '#84cc16' },
            { name: 'Compétition', color: '#f59e0b' },
            { name: 'Technique', color: '#a855f7' },
            { name: 'Open Gym', color: '#64748b' }
        ];
    },

    // Gérer le changement de sélection du titre
    handleTitleSelectChange() {
        const select = document.getElementById('sessionTitleSelect');
        const input = document.getElementById('sessionTitle');

        if (select.value === '__custom__') {
            input.style.display = 'block';
            input.focus();
        } else {
            input.style.display = 'none';
            input.value = '';
        }
    },

    // Afficher le modal de gestion des noms de séances avec couleurs
    showSessionNamesManager() {
        const html = `
            <div class="fixed inset-0 modal-backdrop flex items-center justify-center z-50 fade-in" onclick="CalendarManager.closeSessionNamesManager()">
                <div class="rounded-xl border border-skali-accent/50 shadow-2xl max-w-3xl w-full mx-4" onclick="event.stopPropagation()" style="background: linear-gradient(135deg, rgba(10, 10, 18, 0.98) 0%, rgba(20, 20, 32, 0.98) 100%); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);">
                    <!-- Header -->
                    <div class="flex items-center justify-between p-6 border-b border-skali" style="background: linear-gradient(to right, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15));">
                        <div>
                            <h3 class="text-2xl font-bold flex items-center gap-3">
                                <i class="fas fa-palette text-skali-accent"></i>
                                Gérer les types de séances
                            </h3>
                            <p class="text-sm text-gray-400 mt-1">Personnalisez les noms et couleurs de vos séances</p>
                        </div>
                        <button onclick="CalendarManager.closeSessionNamesManager()"
                                class="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-skali-darker rounded-lg transition">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    <!-- Content -->
                    <div class="p-6 max-h-[70vh] overflow-y-auto">
                        <!-- Liste des noms avec couleurs -->
                        <div id="sessionNamesList" class="space-y-3 mb-6">
                            ${this.sessionNames
                                .map((item, index) => {
                                    const name = typeof item === 'string' ? item : item.name;
                                    const color = typeof item === 'string' ? '#64748b' : item.color;
                                    return `
                                <div class="flex items-center gap-3 p-4 bg-skali-dark rounded-xl hover:bg-skali-darker transition group">
                                    <i class="fas fa-grip-vertical text-gray-500 text-lg"></i>

                                    <!-- Couleur preview -->
                                    <div class="w-10 h-10 rounded-lg border-2 border-gray-600 flex items-center justify-center"
                                         style="background: ${color}; box-shadow: 0 0 15px ${color}40;">
                                        <i class="fas fa-dumbbell text-white text-xs"></i>
                                    </div>

                                    <!-- Nom -->
                                    <div class="flex-1">
                                        <div class="font-semibold text-lg">${name}</div>
                                        <div class="text-xs text-gray-400 font-mono">${color}</div>
                                    </div>

                                    <!-- Actions -->
                                    <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onclick="CalendarManager.editSessionName(${index})"
                                                class="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition flex items-center gap-2"
                                                title="Modifier">
                                            <i class="fas fa-edit"></i>
                                            <span class="text-sm font-medium">Éditer</span>
                                        </button>
                                        <button onclick="CalendarManager.deleteSessionName(${index})"
                                                class="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition flex items-center gap-2"
                                                title="Supprimer">
                                            <i class="fas fa-trash"></i>
                                            <span class="text-sm font-medium">Supprimer</span>
                                        </button>
                                    </div>
                                </div>
                            `;
                                })
                                .join('')}
                        </div>

                        <!-- Formulaire ajout -->
                        <div class="border-t border-skali pt-6 bg-skali-darker rounded-xl p-4">
                            <h4 class="text-lg font-semibold mb-4 flex items-center gap-2">
                                <i class="fas fa-plus-circle text-skali-accent"></i>
                                Ajouter un nouveau type
                            </h4>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div class="md:col-span-2">
                                    <label class="text-sm text-gray-400 mb-2 block">Nom de la séance</label>
                                    <input type="text"
                                           id="newSessionName"
                                           placeholder="Ex: HYROX, CrossTraining..."
                                           class="w-full px-4 py-3 bg-skali-dark border border-skali rounded-lg focus:border-skali-accent transition"
                                           onkeypress="if(event.key==='Enter') CalendarManager.addSessionName()">
                                </div>
                                <div>
                                    <label class="text-sm text-gray-400 mb-2 block">Couleur</label>
                                    <input type="color"
                                           id="newSessionColor"
                                           value="#f59e0b"
                                           class="w-full h-12 bg-skali-dark border border-skali rounded-lg cursor-pointer">
                                </div>
                            </div>
                            <button onclick="CalendarManager.addSessionName()"
                                    class="mt-4 w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition font-semibold flex items-center justify-center gap-2">
                                <i class="fas fa-plus"></i>
                                Ajouter le type de séance
                            </button>
                        </div>

                        <!-- Palette de couleurs prédéfinies -->
                        <div class="mt-4 p-4 bg-skali-darker rounded-lg">
                            <div class="text-sm text-gray-400 mb-2">Couleurs rapides :</div>
                            <div class="flex gap-2 flex-wrap">
                                ${[
                                    '#ef4444',
                                    '#f59e0b',
                                    '#10b981',
                                    '#3b82f6',
                                    '#8b5cf6',
                                    '#ec4899',
                                    '#06b6d4',
                                    '#84cc16'
                                ]
                                    .map(
                                        c => `
                                    <button onclick="document.getElementById('newSessionColor').value='${c}'"
                                            class="w-10 h-10 rounded-lg border-2 border-gray-600 hover:scale-110 transition"
                                            style="background: ${c}; box-shadow: 0 0 10px ${c}40;"
                                            title="${c}">
                                    </button>
                                `
                                    )
                                    .join('')}
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="flex gap-3 mt-6">
                            <button onclick="CalendarManager.resetSessionNames()"
                                    class="px-6 py-3 bg-skali-dark hover:bg-skali-darker rounded-lg transition text-sm font-medium flex items-center gap-2">
                                <i class="fas fa-undo"></i>
                                Réinitialiser
                            </button>
                            <button onclick="CalendarManager.closeSessionNamesManager()"
                                    class="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition font-semibold flex items-center justify-center gap-2">
                                <i class="fas fa-check"></i>
                                Enregistrer et fermer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
        // Fermer le menu 3 points
        const menu = document.getElementById('quickActionsMenu');
        if (menu) {
            menu.classList.add('hidden');
        }
    },

    // Ajouter un nom de séance avec couleur
    addSessionName() {
        const input = document.getElementById('newSessionName');
        const colorInput = document.getElementById('newSessionColor');
        const name = input.value.trim();
        const color = colorInput ? colorInput.value : '#64748b';

        if (!name) {
            Utils.showNotification('Veuillez entrer un nom', 'warning');
            return;
        }

        // Vérifier si le nom existe déjà
        const existingNames = this.sessionNames.map(item =>
            typeof item === 'string' ? item : item.name
        );
        if (existingNames.includes(name)) {
            Utils.showNotification('Ce nom existe déjà', 'warning');
            return;
        }

        this.sessionNames.push({ name, color });
        this.saveSessionNames();
        input.value = '';
        if (colorInput) {
            colorInput.value = '#f59e0b';
        }

        // Rafraîchir la liste
        this.refreshSessionNamesList();
        Utils.showNotification('Type de séance ajouté', 'success');
    },

    // Modifier un nom de séance avec couleur
    editSessionName(index) {
        const item = this.sessionNames[index];
        const oldName = typeof item === 'string' ? item : item.name;
        const oldColor = typeof item === 'string' ? '#64748b' : item.color;

        // Créer un modal d'édition
        const modal = `
            <div class="fixed inset-0 modal-backdrop flex items-center justify-center z-[60] fade-in" onclick="event.target === event.currentTarget && CalendarManager.closeEditModal()">
                <div class="bg-skali-light rounded-xl border border-skali shadow-2xl max-w-md w-full mx-4" onclick="event.stopPropagation()">
                    <div class="p-6">
                        <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
                            <i class="fas fa-edit text-skali-accent"></i>
                            Modifier le type de séance
                        </h3>
                        <div class="space-y-4">
                            <div>
                                <label class="text-sm text-gray-400 mb-2 block">Nom</label>
                                <input type="text" id="editSessionName" value="${oldName}"
                                       class="w-full px-4 py-3 bg-skali-dark border border-skali rounded-lg focus:border-skali-accent transition">
                            </div>
                            <div>
                                <label class="text-sm text-gray-400 mb-2 block">Couleur</label>
                                <input type="color" id="editSessionColor" value="${oldColor}"
                                       class="w-full h-12 bg-skali-dark border border-skali rounded-lg cursor-pointer">
                            </div>
                            <div class="flex gap-2 mt-6">
                                <button onclick="CalendarManager.closeEditModal()"
                                        class="flex-1 px-4 py-3 bg-skali-dark hover:bg-skali-darker rounded-lg transition">
                                    Annuler
                                </button>
                                <button onclick="CalendarManager.saveEditSessionName(${index})"
                                        class="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition font-semibold">
                                    Enregistrer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modal);
    },

    // Sauvegarder l'édition
    saveEditSessionName(index) {
        const nameInput = document.getElementById('editSessionName');
        const colorInput = document.getElementById('editSessionColor');
        const newName = nameInput.value.trim();
        const newColor = colorInput.value;

        if (!newName) {
            Utils.showNotification('Veuillez entrer un nom', 'warning');
            return;
        }

        const item = this.sessionNames[index];
        const oldName = typeof item === 'string' ? item : item.name;

        // Vérifier si le nouveau nom existe déjà (sauf si c'est le même)
        if (newName !== oldName) {
            const existingNames = this.sessionNames.map(i => (typeof i === 'string' ? i : i.name));
            if (existingNames.includes(newName)) {
                Utils.showNotification('Ce nom existe déjà', 'warning');
                return;
            }
        }

        this.sessionNames[index] = { name: newName, color: newColor };
        this.saveSessionNames();
        this.closeEditModal();
        this.refreshSessionNamesList();
        Utils.showNotification('Type modifié', 'success');
    },

    // Fermer le modal d'édition
    closeEditModal() {
        const modal = document.querySelector('.modal-backdrop[onclick*="closeEditModal"]');
        if (modal) {
            modal.remove();
        }
    },

    // Supprimer un nom de séance
    deleteSessionName(index) {
        const item = this.sessionNames[index];
        const name = typeof item === 'string' ? item : item.name;
        if (confirm(`Supprimer "${name}" ?`)) {
            this.sessionNames.splice(index, 1);
            this.saveSessionNames();
            this.refreshSessionNamesList();
            Utils.showNotification('Type supprimé', 'success');
        }
    },

    // Réinitialiser aux noms par défaut
    resetSessionNames() {
        if (confirm('Réinitialiser aux noms par défaut ? Cette action est irréversible.')) {
            this.sessionNames = this.getDefaultSessionNames();
            this.saveSessionNames();
            this.refreshSessionNamesList();
            Utils.showNotification('Noms réinitialisés', 'success');
        }
    },

    // Rafraîchir la liste dans le modal
    refreshSessionNamesList() {
        const listContainer = document.getElementById('sessionNamesList');
        if (listContainer) {
            listContainer.innerHTML = this.sessionNames
                .map((item, index) => {
                    const name = typeof item === 'string' ? item : item.name;
                    const color = typeof item === 'string' ? '#64748b' : item.color;
                    return `
                <div class="flex items-center gap-3 p-4 bg-skali-dark rounded-xl hover:bg-skali-darker transition group">
                    <i class="fas fa-grip-vertical text-gray-500 text-lg"></i>

                    <!-- Couleur preview -->
                    <div class="w-10 h-10 rounded-lg border-2 border-gray-600 flex items-center justify-center"
                         style="background: ${color}; box-shadow: 0 0 15px ${color}40;">
                        <i class="fas fa-dumbbell text-white text-xs"></i>
                    </div>

                    <!-- Nom -->
                    <div class="flex-1">
                        <div class="font-semibold text-lg">${name}</div>
                        <div class="text-xs text-gray-400 font-mono">${color}</div>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="CalendarManager.editSessionName(${index})"
                                class="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition flex items-center gap-2"
                                title="Modifier">
                            <i class="fas fa-edit"></i>
                            <span class="text-sm font-medium">Éditer</span>
                        </button>
                        <button onclick="CalendarManager.deleteSessionName(${index})"
                                class="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition flex items-center gap-2"
                                title="Supprimer">
                            <i class="fas fa-trash"></i>
                            <span class="text-sm font-medium">Supprimer</span>
                        </button>
                    </div>
                </div>
            `;
                })
                .join('');
        }
    },

    // Fermer le modal de gestion avec sauvegarde
    closeSessionNamesManager() {
        // Sauvegarder une dernière fois pour être sûr
        this.saveSessionNames();
        Utils.showNotification('Noms de séances sauvegardés', 'success');

        // Fermer le modal (il est inséré dans body, pas dans modalContainer)
        const modal = document.querySelector('.modal-backdrop');
        if (modal) {
            modal.remove();
        }
    },

    // Obtenir la couleur d'une séance par son nom
    getSessionColor(sessionTitle) {
        if (!sessionTitle) {
            return '#64748b';
        }

        // Chercher dans les noms de séances personnalisés
        const sessionItem = this.sessionNames.find(item => {
            const itemName = typeof item === 'string' ? item : item.name;
            return itemName === sessionTitle;
        });

        if (sessionItem && typeof sessionItem === 'object') {
            return sessionItem.color;
        }

        // Couleur par défaut
        return '#64748b';
    },

    // Attacher les event listeners pour le support mobile
    attachMobileEventListeners() {
        // Sélectionner tous les jours du calendrier
        const calendarDays = document.querySelectorAll('.calendar-day[data-date]');

        calendarDays.forEach(dayElement => {
            const dateKey = dayElement.getAttribute('data-date');

            // Variables pour gérer le touch
            let touchStartTime = 0;
            let touchMoved = false;

            // Gestionnaire touchstart
            dayElement.addEventListener(
                'touchstart',
                () => {
                    touchStartTime = Date.now();
                    touchMoved = false;
                },
                { passive: true }
            );

            // Gestionnaire touchmove (pour détecter si l'utilisateur scroll)
            dayElement.addEventListener(
                'touchmove',
                () => {
                    touchMoved = true;
                },
                { passive: true }
            );

            // Gestionnaire touchend
            dayElement.addEventListener('touchend', e => {
                const touchDuration = Date.now() - touchStartTime;

                // Si le touch a duré moins de 500ms et qu'il n'y a pas eu de scroll
                // alors c'est un tap, on ouvre la modale
                if (touchDuration < 500 && !touchMoved) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openDayModal(dateKey);
                }
            });
        });

        // Support mobile pour les slots de la vue semaine et jour
        const weekTimeSlots = document.querySelectorAll('.week-time-slot[data-date]');
        const dayTimeSlots = document.querySelectorAll('.day-time-slot[data-date]');

        [...weekTimeSlots, ...dayTimeSlots].forEach(slot => {
            const dateKey = slot.getAttribute('data-date');

            let touchStartTime = 0;
            let touchMoved = false;

            slot.addEventListener(
                'touchstart',
                () => {
                    touchStartTime = Date.now();
                    touchMoved = false;
                },
                { passive: true }
            );

            slot.addEventListener(
                'touchmove',
                () => {
                    touchMoved = true;
                },
                { passive: true }
            );

            slot.addEventListener('touchend', e => {
                const touchDuration = Date.now() - touchStartTime;

                if (touchDuration < 500 && !touchMoved) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openDayModal(dateKey);
                }
            });
        });

        console.log('✅ Event listeners mobiles attachés pour', calendarDays.length, 'jours');
    }
};
