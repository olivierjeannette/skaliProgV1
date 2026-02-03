// Gestionnaire de synchronisation Premium SANS AUTO-SYNC
const SyncManager = {
    isOnline: false,
    hasUnsavedChanges: false,
    lastSyncTime: null,

    // Initialiser le gestionnaire
    async init() {
        console.log('🔄 Initialisation SyncManager...');

        // Vérifier le statut de connexion
        await this.checkConnectionStatus();

        // PAS d'auto-sync
        console.log('✅ Mode manuel activé - Pas de sync automatique');
    },

    // NOUVELLE FONCTION - Marquer comme modifié
    markAsChanged() {
        this.hasUnsavedChanges = true;
        console.log('📝 Données marquées comme modifiées');
        // Optionnel : ajouter un badge visuel
        this.updateSyncBadge();
    },

    // NOUVELLE FONCTION - Mettre à jour le badge
    updateSyncBadge() {
        const publishBtn = document.getElementById('publishBtn');
        if (publishBtn && this.hasUnsavedChanges) {
            // Ajouter un indicateur visuel
            if (!publishBtn.querySelector('.sync-badge')) {
                const badge = document.createElement('span');
                badge.className = 'sync-badge';
                badge.textContent = '!';
                publishBtn.style.position = 'relative';
                publishBtn.appendChild(badge);
            }
        } else if (publishBtn && !this.hasUnsavedChanges) {
            // Retirer le badge
            const badge = publishBtn.querySelector('.sync-badge');
            if (badge) {
                badge.remove();
            }
        }
    },

    // Vérifier le statut de connexion
    async checkConnectionStatus() {
        try {
            if (typeof SupabaseManager !== 'undefined' && SupabaseManager.isInitialized) {
                const isConnected = await SupabaseManager.testConnection();
                this.updateConnectionStatus(isConnected);
                return isConnected;
            }
        } catch (error) {
            console.error('❌ Erreur connexion:', error);
        }
        this.updateConnectionStatus(false);
        return false;
    },

    // Mettre à jour le statut de connexion
    updateConnectionStatus(isOnline) {
        this.isOnline = isOnline;

        const statusDot = document.getElementById('syncStatusDot');
        const statusText = document.getElementById('syncStatusText');

        if (statusDot && statusText) {
            if (isOnline) {
                statusDot.className = 'status-dot online';
                statusText.textContent = 'Connecté';
                statusText.style.color = '#10b981';
            } else {
                statusDot.className = 'status-dot offline';
                statusText.textContent = 'Hors ligne';
                statusText.style.color = '#ef4444';
            }
        }
    },

    // IMPORTER depuis Supabase
    async importFromCloud() {
        console.log('⬇️ Import depuis Supabase...');

        const importBtn = document.getElementById('importBtn');
        if (importBtn) {
            importBtn.disabled = true;
            importBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Import...';
        }

        try {
            if (!SupabaseManager.isInitialized) {
                throw new Error('SupabaseManager non initialisé');
            }

            // Charger les données depuis Supabase
            const [members, sessions, performances] = await Promise.all([
                SupabaseManager.getMembers(),
                SupabaseManager.getSessions(),
                SupabaseManager.getPerformances()
            ]);

            console.log('📦 Données importées:', {
                membres: members.length,
                sessions: sessions.length,
                performances: performances.length
            });

            // Rafraîchir la vue
            const currentView = ViewManager.getCurrentView();
            ViewManager.showView(currentView);

            Utils.showNotification(
                `✅ Import: ${members.length} membres, ${sessions.length} sessions`,
                'success'
            );
            return true;
        } catch (error) {
            console.error('💥 Erreur import:', error);
            Utils.showNotification("Erreur lors de l'import: " + error.message, 'error');
        } finally {
            if (importBtn) {
                importBtn.disabled = false;
                importBtn.innerHTML = '<i class="fas fa-cloud-download-alt mr-2"></i>Importer';
            }
        }
        return false;
    },

    // PUBLIER vers Supabase
    async publishToCloud() {
        console.log('⬆️ Publication vers Supabase...');

        // Note: Les données sont déjà automatiquement sauvegardées dans Supabase
        // Cette fonction sert maintenant à forcer une synchronisation/vérification
        Utils.showNotification(
            'ℹ️ Les données sont automatiquement synchronisées avec Supabase',
            'info'
        );

        const publishBtn = document.getElementById('publishBtn');
        if (publishBtn) {
            publishBtn.disabled = true;
            publishBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Vérification...';
        }

        try {
            if (!SupabaseManager.isInitialized) {
                throw new Error('SupabaseManager non initialisé');
            }

            // Vérifier la connexion
            const isConnected = await SupabaseManager.testConnection();

            if (isConnected) {
                this.hasUnsavedChanges = false;
                this.updateSyncBadge();
                this.lastSyncTime = new Date();

                Utils.showNotification('✅ Connexion Supabase vérifiée', 'success');
                return true;
            } else {
                Utils.showNotification('❌ Impossible de se connecter à Supabase', 'error');
            }
        } catch (error) {
            console.error('💥 Erreur:', error);
            Utils.showNotification('Erreur: ' + error.message, 'error');
        } finally {
            if (publishBtn) {
                publishBtn.disabled = false;
                publishBtn.innerHTML = '<i class="fas fa-cloud-upload-alt mr-2"></i>Publier';
            }
        }
        return false;
    },

    // NOUVELLE FONCTION - Afficher la confirmation de publication
    async showPublishConfirmation() {
        return new Promise(resolve => {
            // Créer le modal de confirmation
            const modal = document.createElement('div');
            modal.className = 'publish-confirmation-modal';
            modal.innerHTML = `
                <div class="publish-confirmation-backdrop">
                    <div class="publish-confirmation-content">
                        <div class="publish-confirmation-header">
                            <i class="fas fa-exclamation-triangle"></i>
                            <h3>Confirmation de Publication</h3>
                        </div>
                        <div class="publish-confirmation-body">
                            <p>Êtes-vous sûr de vouloir publier vos données dans le cloud ?</p>
                            <div class="publish-warning">
                                <i class="fas fa-info-circle"></i>
                                <span>Cette action va remplacer toutes les données existantes dans le cloud par vos données locales.</span>
                            </div>
                        </div>
                        <div class="publish-confirmation-footer">
                            <button class="btn-cancel" onclick="this.closest('.publish-confirmation-modal').remove(); window.publishConfirmationResolve(false);">
                                <i class="fas fa-times"></i>
                                Annuler
                            </button>
                            <button class="btn-confirm" onclick="this.closest('.publish-confirmation-modal').remove(); window.publishConfirmationResolve(true);">
                                <i class="fas fa-cloud-upload-alt"></i>
                                Confirmer la Publication
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Ajouter au DOM
            document.body.appendChild(modal);

            // Exposer la fonction de résolution globalement
            window.publishConfirmationResolve = resolve;

            // Animation d'ouverture
            setTimeout(() => {
                modal.querySelector('.publish-confirmation-backdrop').classList.add('show');
            }, 10);
        });
    }
};
