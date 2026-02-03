// Module principal de l'application
const App = {
    currentUserRole: null,

    // Initialiser l'application
    async init(userRole = null) {
        this.currentUserRole = userRole || Auth.getCurrentUserRole();
        console.log("🚀 Initialisation de l'application...");

        // Initialiser SupabaseManager UNIQUEMENT
        if (typeof SupabaseManager !== 'undefined') {
            console.log('✅ SupabaseManager trouvé');
            await SupabaseManager.init();
            console.log('✅ SupabaseManager initialisé avec succès');
        } else {
            console.error('❌ SupabaseManager pas trouvé !');
        }

        // Initialiser le gestionnaire de synchronisation
        if (typeof SyncManager !== 'undefined') {
            SyncManager.init();
        }

        if (typeof DiscordNotifier !== 'undefined') {
            DiscordNotifier.init();
            console.log('🔔 Discord activé');
        }

        // Initialiser les autres modules
        BackupManager.initAutoBackup();

        // Adapter l'interface selon le rôle
        this.adaptInterfaceForRole();

        // Appliquer les permissions
        if (typeof PermissionManager !== 'undefined') {
            PermissionManager.adaptInterface();
        }

        // S'assurer que le bouton de déconnexion est ajouté après l'application des permissions
        this.ensureLogoutButton();

        ViewManager.showView('calendar');
    },

    // Adapter l'interface selon le rôle de l'utilisateur
    adaptInterfaceForRole() {
        const role = this.currentUserRole;
        const roleConfig = CONFIG.ROLES[role];

        if (!roleConfig) {
            return;
        }

        // Afficher/masquer les éléments selon les permissions
        this.toggleElementsByPermission();

        // Ajouter l'indicateur de rôle dans la sidebar
        this.addRoleIndicator(role, roleConfig);

        // Ajouter le bouton de déconnexion
        this.addLogoutButton();
    },

    // Basculer la visibilité des éléments selon les permissions
    toggleElementsByPermission() {
        const role = this.currentUserRole;

        if (role === 'ATHLETE') {
            // Les athlètes : calendrier, export PDF, mode TV uniquement
            const elementsToHide = [
                'membersBtn',
                'importBtn',
                'publishBtn',
                'backupBtn',
                'discordBtn',
                'prBtn'
            ];

            elementsToHide.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.style.display = 'none';
                }
            });

            // Masquer le bouton d'import CSV dans la section membres
            const importCsvBtn = document.querySelector(
                '[onclick="MemberImport.openImportModal()"]'
            );
            if (importCsvBtn) {
                importCsvBtn.style.display = 'none';
            }
        } else if (role === 'COACH') {
            // Les coachs : tout sauf synchronisation manuelle (import/publish)
            const elementsToHide = ['importBtn', 'publishBtn'];

            elementsToHide.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.style.display = 'none';
                }
            });
        }

        // Masquer le bouton de synchronisation manuelle pour les athlètes
        if (role === 'ATHLETE') {
            const syncSection = document.querySelector('.nav-section:nth-child(2)');
            if (syncSection) {
                syncSection.style.display = 'none';
            }
        }
    },

    // Ajouter l'indicateur de rôle
    addRoleIndicator(role, roleConfig) {
        const sidebarHeader = document.querySelector('.sidebar-header');
        if (sidebarHeader && !document.getElementById('roleIndicator')) {
            const roleIndicator = document.createElement('div');
            roleIndicator.id = 'roleIndicator';
            roleIndicator.className = 'role-indicator mt-2';
            roleIndicator.innerHTML = `
                <div class="flex items-center justify-center px-3 py-1 rounded-lg text-xs font-medium" 
                     style="background-color: ${roleConfig.color}20; color: ${roleConfig.color}; border: 1px solid ${roleConfig.color}40;">
                    <i class="${roleConfig.icon} mr-1"></i>
                    ${roleConfig.name}
                </div>
            `;
            sidebarHeader.appendChild(roleIndicator);
        }
    },

    // Ajouter le bouton de déconnexion
    addLogoutButton() {
        if (!document.getElementById('logoutBtn')) {
            // Chercher la dernière section de navigation ou créer une nouvelle section
            let navSection = document.querySelector('.nav-section:last-child');

            if (!navSection) {
                // Si aucune section n'existe, créer une nouvelle section
                const sidebarNav = document.querySelector('.sidebar-nav');
                if (sidebarNav) {
                    navSection = document.createElement('div');
                    navSection.className = 'nav-section';
                    sidebarNav.appendChild(navSection);
                }
            }

            if (navSection) {
                const logoutBtn = document.createElement('button');
                logoutBtn.id = 'logoutBtn';
                logoutBtn.className = 'nav-item text-red-400 hover:text-red-300';
                logoutBtn.onclick = () => Auth.logout();
                logoutBtn.innerHTML = `
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Déconnexion</span>
                `;
                navSection.appendChild(logoutBtn);
            }
        }
    },

    // S'assurer que le bouton de déconnexion est toujours visible
    ensureLogoutButton() {
        // Supprimer l'ancien bouton s'il existe
        const existingBtn = document.getElementById('logoutBtn');
        if (existingBtn) {
            existingBtn.remove();
        }

        // Trouver une section visible ou créer une nouvelle section
        const visibleSections = document.querySelectorAll('.nav-section');
        let targetSection = null;

        // Chercher la dernière section visible
        for (let i = visibleSections.length - 1; i >= 0; i--) {
            if (visibleSections[i].style.display !== 'none') {
                targetSection = visibleSections[i];
                break;
            }
        }

        // Si aucune section visible, créer une nouvelle section
        if (!targetSection) {
            const sidebarNav = document.querySelector('.sidebar-nav');
            if (sidebarNav) {
                targetSection = document.createElement('div');
                targetSection.className = 'nav-section';
                sidebarNav.appendChild(targetSection);
            }
        }

        // Ajouter le bouton de déconnexion
        if (targetSection) {
            const logoutBtn = document.createElement('button');
            logoutBtn.id = 'logoutBtn';
            logoutBtn.className = 'nav-item text-red-400 hover:text-red-300';
            logoutBtn.onclick = () => Auth.logout();
            logoutBtn.innerHTML = `
                <i class="fas fa-sign-out-alt"></i>
                <span>Déconnexion</span>
            `;
            targetSection.appendChild(logoutBtn);
        }
    }
};

// Fonctions globales pour maintenir la compatibilité avec les événements HTML
window.closeModal = Utils.closeModal;

// Enlever le focus de TOUS les boutons après le clic (anti-violet)
document.addEventListener(
    'click',
    function (e) {
        const target = e.target.closest('button, .nav-item, a');
        if (target) {
            setTimeout(() => target.blur(), 10);
        }
    },
    true
);

// Initialisation au chargement de la page
window.addEventListener('DOMContentLoaded', async function () {
    console.log('📄 DOM chargé, vérification du mode...');

    // Sauvegarder les credentials Supabase pour la page mobile
    if (typeof ENV !== 'undefined' && ENV.config.supabaseUrl) {
        ENV.saveMobileCredentials();
    }

    // Vérifier IMMÉDIATEMENT si c'est le mode TV
    const urlParams = new URLSearchParams(window.location.search);
    const isTVMode = urlParams.get('tv') === 'true';

    if (isTVMode) {
        console.log('📺 Mode TV détecté au chargement');
        // Ne PAS attendre le window.onload, traiter immédiatement
        Auth.checkAuth();
    } else {
        // Mode normal - utiliser arrow function pour préserver le contexte
        window.onload = () => Auth.checkAuth();
    }
});

// Plus de sauvegarde locale - tout est sur Supabase
window.addEventListener('beforeunload', e => {
    console.log("👋 Fermeture de l'application...");
    // Les données sont déjà synchronisées avec Supabase
});
