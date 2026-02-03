// Gestionnaire des vues - OPTIMISÉ pour performance
const ViewManager = {
    currentView: 'calendar',
    _navItemsCache: null,

    // Fonction utilitaire pour désactiver tous les onglets - ULTRA OPTIMISÉ
    clearAllActiveStates() {
        // Cache la NodeList pour éviter les querySelectorAll répétés
        if (!this._navItemsCache) {
            this._navItemsCache = document.querySelectorAll('.nav-item');
        }

        // Utiliser requestAnimationFrame pour ne pas bloquer le thread principal
        requestAnimationFrame(() => {
            this._navItemsCache.forEach(btn => {
                btn.classList.remove('active');
            });
        });
    },

    // Invalider le cache si nécessaire
    invalidateCache() {
        this._navItemsCache = null;
    },

    // Fermer le menu mobile automatiquement
    closeMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    },

    // Afficher une vue - ULTRA OPTIMISÉ pour INP
    async showView(view) {
        // Vérifier si on doit vraiment changer de vue
        const isChangingView = this.currentView !== view;

        // Toujours mettre à jour la vue courante
        this.currentView = view;

        // Opérations DOM en requestAnimationFrame pour ne pas bloquer
        requestAnimationFrame(() => {
            this.clearAllActiveStates();
            this.closeMobileMenu();
        });

        if (view === 'calendar') {
            document.getElementById('calendarBtn')?.classList.add('active');
            if (typeof CalendarManager !== 'undefined') {
                await CalendarManager.showCalendarView();
            } else {
                console.error('CalendarManager non disponible');
                this.showError('Module Planning non disponible');
            }
        } else if (view === 'members') {
            document.getElementById('membersBtn')?.classList.add('active');
            if (typeof MemberManager !== 'undefined') {
                MemberManager.showMembersView().catch(error => {
                    console.error('Erreur lors du chargement des adhérents:', error);
                    this.showError('Impossible de charger les adhérents');
                });
            } else {
                console.error('MemberManager non disponible');
                this.showError('Module adhérents non disponible');
            }
        } else if (view === 'reports') {
            document.getElementById('reportsBtn')?.classList.add('active');
            if (typeof ReportManager !== 'undefined') {
                ReportManager.showReportsMenu();
            } else {
                console.error('ReportManager non disponible');
                this.showError('Module Rapports non disponible');
            }
        } else if (view === 'teams') {
            document.getElementById('teamsBtn')?.classList.add('active');
            if (typeof TeamBuilder !== 'undefined') {
                TeamBuilder.showTeamBuilderView();
            } else {
                console.error('TeamBuilder non disponible');
                this.showError('Module TeamBuilder non disponible');
            }
        } else if (view === 'tv') {
            // Initialiser et afficher le mode TV
            if (typeof TVMode !== 'undefined') {
                TVMode.init();
            } else {
                console.error('TVMode non disponible');
                this.showError('Module Mode TV non disponible');
            }
        }
    },

    // Obtenir la vue actuelle
    getCurrentView() {
        return this.currentView;
    },

    // S'assurer que SupabaseManager est initialisé
    async ensureSupabaseInitialized() {
        if (typeof SupabaseManager === 'undefined') {
            throw new Error('SupabaseManager non disponible');
        }

        if (!SupabaseManager.isInitialized()) {
            console.log('🔄 Initialisation de SupabaseManager...');
            await SupabaseManager.init();
        }

        return true;
    },

    // Afficher une erreur
    showError(message) {
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="error-container">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2 class="error-title">Erreur</h2>
                    <p class="error-message">${message}</p>
                    <button onclick="ViewManager.showView('calendar')" class="btn-premium">
                        <i class="fas fa-arrow-left mr-2"></i>Retour au planning
                    </button>
                </div>
            `;
        }
    }
};
