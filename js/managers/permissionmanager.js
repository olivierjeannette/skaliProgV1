// Gestionnaire des permissions par rôle
const PermissionManager = {
    // Vérifier si l'utilisateur a une permission spécifique
    hasPermission(permission) {
        const userRole = Auth.getCurrentUserRole();
        if (!userRole) {
            return false;
        }

        const roleConfig = CONFIG.ROLES[userRole];
        return (
            roleConfig.permissions.includes('all') || roleConfig.permissions.includes(permission)
        );
    },

    // Vérifier si l'utilisateur peut créer un type d'utilisateur
    canCreateUserType(userType) {
        const userRole = Auth.getCurrentUserRole();
        if (!userRole) {
            return false;
        }

        const roleConfig = CONFIG.ROLES[userRole];
        return roleConfig.canCreate.includes(userType);
    },

    // Adapter l'interface selon les permissions
    adaptInterface() {
        this.hideUnauthorizedElements();
        this.disableUnauthorizedFeatures();
        this.addRoleSpecificFeatures();
    },

    // Masquer les éléments non autorisés
    hideUnauthorizedElements() {
        const role = Auth.getCurrentUserRole();

        // Éléments à masquer selon le rôle
        const elementsToHide = {
            ATHLETE: [
                'membersBtn',
                'teamsBtn',
                'importBtn',
                'publishBtn',
                'backupBtn',
                'discordBtn',
                'prBtn'
            ],
            COACH: ['importBtn', 'publishBtn']
        };

        const elements = elementsToHide[role] || [];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = 'none';
            }
        });

        // Masquer des sections entières pour les athlètes
        if (role === 'ATHLETE') {
            // Masquer la section synchronisation
            const syncSection = document.querySelector('.nav-section:nth-child(2)');
            if (syncSection) {
                syncSection.style.display = 'none';
            }

            // Masquer la section notifications
            const notificationSection = document.querySelector('.nav-section:nth-child(4)');
            if (notificationSection) {
                notificationSection.style.display = 'none';
            }

            // Masquer le bouton de sauvegarde manuelle
            const backupBtn = document.querySelector('[onclick="BackupManager.showBackupModal()"]');
            if (backupBtn) {
                backupBtn.style.display = 'none';
            }
        }
    },

    // Désactiver les fonctionnalités non autorisées
    disableUnauthorizedFeatures() {
        const role = Auth.getCurrentUserRole();

        // Désactiver la modification des séances pour les athlètes
        if (role === 'ATHLETE') {
            this.disableSessionModification();
        }

        // Désactiver la synchronisation manuelle pour les athlètes
        if (role === 'ATHLETE') {
            this.disableManualSync();
            this.disableManualBackup();
        }
    },

    // Désactiver la modification des séances
    disableSessionModification() {
        // Intercepter les fonctions de modification des séances dans CalendarManager
        if (typeof CalendarManager !== 'undefined') {
            const originalEditSession = CalendarManager.editSession;
            const originalDeleteSession = CalendarManager.deleteSession;

            CalendarManager.editSession = function (dateKey, sessionIndex) {
                console.log('Modification de séance non autorisée pour les athlètes');
                PermissionManager.showPermissionMessage(
                    'Modification de séance non autorisée pour les athlètes'
                );
                return;
            };

            CalendarManager.deleteSession = function (dateKey, sessionIndex) {
                console.log('Suppression de séance non autorisée pour les athlètes');
                PermissionManager.showPermissionMessage(
                    'Suppression de séance non autorisée pour les athlètes'
                );
                return;
            };
        }

        // Intercepter les tentatives de modification de séances via openModal
        const originalOpenModal = window.openModal;
        window.openModal = function (modalType, data) {
            if (modalType === 'session' && data && data.id) {
                console.log('Modification de séance non autorisée pour les athlètes');
                PermissionManager.showPermissionMessage(
                    'Modification de séance non autorisée pour les athlètes'
                );
                return;
            }
            return originalOpenModal(modalType, data);
        };

        // Masquer les boutons de modification dans le calendrier
        setTimeout(() => {
            // Masquer les boutons "Modifier" et "Supprimer" dans les séances
            const editButtons = document.querySelectorAll(
                '[onclick*="CalendarManager.editSession"]'
            );
            const deleteButtons = document.querySelectorAll(
                '[onclick*="CalendarManager.deleteSession"]'
            );

            editButtons.forEach(button => {
                button.style.display = 'none';
            });

            deleteButtons.forEach(button => {
                button.style.display = 'none';
            });

            // Masquer les boutons d'ajout de séances
            const addSessionButtons = document.querySelectorAll(
                '[onclick*="addSession"], [onclick*="createSession"]'
            );
            addSessionButtons.forEach(button => {
                button.style.display = 'none';
            });
        }, 1000);

        // Observer les changements du DOM pour masquer les nouveaux boutons
        this.observeCalendarChanges();
    },

    // Observer les changements du calendrier pour masquer les nouveaux boutons
    observeCalendarChanges() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    // Masquer les nouveaux boutons de modification
                    const editButtons = document.querySelectorAll(
                        '[onclick*="CalendarManager.editSession"]'
                    );
                    const deleteButtons = document.querySelectorAll(
                        '[onclick*="CalendarManager.deleteSession"]'
                    );

                    editButtons.forEach(button => {
                        if (button.style.display !== 'none') {
                            button.style.display = 'none';
                        }
                    });

                    deleteButtons.forEach(button => {
                        if (button.style.display !== 'none') {
                            button.style.display = 'none';
                        }
                    });
                }
            });
        });

        // Observer le conteneur principal
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            observer.observe(mainContent, {
                childList: true,
                subtree: true
            });
        }
    },

    // Désactiver la synchronisation manuelle
    disableManualSync() {
        // Remplacer les fonctions de sync par des versions en lecture seule
        if (typeof SyncManager !== 'undefined') {
            const originalImport = SyncManager.importFromCloud;
            const originalPublish = SyncManager.publishToCloud;

            SyncManager.importFromCloud = function () {
                console.log('Import manuel non autorisé pour les athlètes');
                this.showPermissionMessage('Import manuel non autorisé');
            };

            SyncManager.publishToCloud = function () {
                console.log('Publication manuelle non autorisée pour les athlètes');
                this.showPermissionMessage('Publication manuelle non autorisée');
            };
        }
    },

    // Désactiver la sauvegarde manuelle
    disableManualBackup() {
        // Remplacer la fonction de sauvegarde manuelle
        if (typeof BackupManager !== 'undefined') {
            const originalShowBackupModal = BackupManager.showBackupModal;
            BackupManager.showBackupModal = function () {
                console.log('Sauvegarde manuelle non autorisée pour les athlètes');
                PermissionManager.showPermissionMessage(
                    'Sauvegarde manuelle non autorisée pour les athlètes'
                );
            };
        }
    },

    // Ajouter des fonctionnalités spécifiques au rôle
    addRoleSpecificFeatures() {
        const role = Auth.getCurrentUserRole();

        if (role === 'ATHLETE') {
            this.addAutoSyncForAthletes();
        }
    },

    // Ajouter la synchronisation automatique pour les athlètes
    addAutoSyncForAthletes() {
        // Activer la synchronisation automatique en arrière-plan
        if (typeof SyncManager !== 'undefined') {
            // Synchronisation automatique toutes les 5 minutes
            setInterval(
                () => {
                    if (Auth.getCurrentUserRole() === 'ATHLETE') {
                        console.log('🔄 Synchronisation automatique pour athlète...');
                        // Ici on pourrait implémenter une sync en lecture seule
                    }
                },
                5 * 60 * 1000
            ); // 5 minutes
        }
    },

    // Afficher un message de permission refusée
    showPermissionMessage(message) {
        const notification = document.createElement('div');
        notification.className =
            'fixed top-4 right-4 bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        notification.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i>${message}`;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    },

    // Vérifier les permissions avant d'exécuter une action
    checkPermissionBeforeAction(permission, action, fallbackMessage = 'Action non autorisée') {
        if (this.hasPermission(permission)) {
            return action();
        } else {
            this.showPermissionMessage(fallbackMessage);
            return false;
        }
    }
};
