// Gestionnaire des utilisateurs et mots de passe
const UserManager = {
    // Ouvrir le modal de gestion des utilisateurs
    openUserManagementModal() {
        const userRole = Auth.getCurrentUserRole();
        if (!userRole) {
            return;
        }

        const modal = this.createUserManagementModal(userRole);
        document.getElementById('modalContainer').innerHTML = modal;

        // Afficher le modal
        const modalElement = document.getElementById('userManagementModal');
        modalElement.classList.remove('hidden');

        // Charger les données
        this.loadUserData();
    },

    // Créer le modal de gestion des utilisateurs
    createUserManagementModal(userRole) {
        const roleConfig = CONFIG.ROLES[userRole];
        let canCreateCoach = roleConfig.canCreate.includes('coach');
        let canCreateAthlete = roleConfig.canCreate.includes('athlete');

        return `
            <div id="userManagementModal" class="fixed inset-0 bg-gray-200 bg-opacity-90 flex items-center justify-center z-50 hidden">
                <div class="bg-gray-900 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-white">
                            <i class="fas fa-users mr-2"></i>Gestion des Utilisateurs
                        </h2>
                        <button onclick="Utils.closeModal()" class="text-gray-400 hover:text-white">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Section Coachs -->
                        ${
                            canCreateCoach
                                ? `
                        <div class="bg-gray-800 rounded-lg p-4">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="text-lg font-semibold text-white">
                                    <i class="fas fa-user-tie mr-2 text-blue-500"></i>Coachs
                                </h3>
                                <button onclick="UserManager.createCoachPassword()" 
                                        class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm">
                                    <i class="fas fa-plus mr-1"></i>Nouveau
                                </button>
                            </div>
                            <div id="coachPasswordsList" class="space-y-2">
                                <!-- Liste des mots de passe coach -->
                            </div>
                        </div>
                        `
                                : ''
                        }
                        
                        <!-- Section Athlètes -->
                        ${
                            canCreateAthlete
                                ? `
                        <div class="bg-gray-800 rounded-lg p-4">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="text-lg font-semibold text-white">
                                    <i class="fas fa-running mr-2 text-green-500"></i>Athlètes
                                </h3>
                                <button onclick="UserManager.createAthletePassword()" 
                                        class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm">
                                    <i class="fas fa-plus mr-1"></i>Nouveau
                                </button>
                            </div>
                            <div id="athletePasswordsList" class="space-y-2">
                                <!-- Liste des mots de passe athlète -->
                            </div>
                        </div>
                        `
                                : ''
                        }
                    </div>
                    
                    <!-- Informations -->
                    <div class="mt-6 p-4 bg-gray-800 rounded-lg">
                        <h4 class="text-white font-semibold mb-2">
                            <i class="fas fa-info-circle mr-2"></i>Informations
                        </h4>
                        <div class="text-sm text-gray-300 space-y-1">
                            <p>• Les mots de passe sont stockés localement dans votre navigateur</p>
                            <p>• Chaque mot de passe permet l'accès à l'application avec les permissions correspondantes</p>
                            <p>• Vous pouvez supprimer un mot de passe à tout moment</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Charger les données des utilisateurs
    loadUserData() {
        this.loadCoachPasswords();
        this.loadAthletePasswords();
    },

    // Charger la liste des mots de passe coach
    loadCoachPasswords() {
        const passwords = Auth.getCoachPasswords();
        const container = document.getElementById('coachPasswordsList');

        if (passwords.length === 0) {
            container.innerHTML =
                '<p class="text-gray-400 text-sm">Aucun mot de passe coach créé</p>';
            return;
        }

        container.innerHTML = passwords
            .map(
                password => `
            <div class="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                <div class="flex items-center">
                    <i class="fas fa-key text-blue-400 mr-2"></i>
                    <span class="text-white font-mono text-sm">${password}</span>
                </div>
                <button onclick="UserManager.removeCoachPassword('${password}')" 
                        class="text-red-400 hover:text-red-300">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `
            )
            .join('');
    },

    // Charger la liste des mots de passe athlète
    loadAthletePasswords() {
        const passwords = Auth.getAthletePasswords();
        const container = document.getElementById('athletePasswordsList');

        if (passwords.length === 0) {
            container.innerHTML =
                '<p class="text-gray-400 text-sm">Aucun mot de passe athlète créé</p>';
            return;
        }

        container.innerHTML = passwords
            .map(
                password => `
            <div class="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                <div class="flex items-center">
                    <i class="fas fa-key text-green-400 mr-2"></i>
                    <span class="text-white font-mono text-sm">${password}</span>
                </div>
                <button onclick="UserManager.removeAthletePassword('${password}')" 
                        class="text-red-400 hover:text-red-300">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `
            )
            .join('');
    },

    // Créer un nouveau mot de passe coach
    createCoachPassword() {
        const password = this.generatePassword();
        Auth.addCoachPassword(password);
        this.loadCoachPasswords();
        this.showSuccessMessage('Mot de passe coach créé: ' + password);
    },

    // Créer un nouveau mot de passe athlète
    createAthletePassword() {
        const password = this.generatePassword();
        Auth.addAthletePassword(password);
        this.loadAthletePasswords();
        this.showSuccessMessage('Mot de passe athlète créé: ' + password);
    },

    // Supprimer un mot de passe coach
    removeCoachPassword(password) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce mot de passe coach ?')) {
            Auth.removeCoachPassword(password);
            this.loadCoachPasswords();
            this.showSuccessMessage('Mot de passe coach supprimé');
        }
    },

    // Supprimer un mot de passe athlète
    removeAthletePassword(password) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce mot de passe athlète ?')) {
            Auth.removeAthletePassword(password);
            this.loadAthletePasswords();
            this.showSuccessMessage('Mot de passe athlète supprimé');
        }
    },

    // Générer un mot de passe aléatoire
    generatePassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let password = '';
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    },

    // Afficher un message de succès
    showSuccessMessage(message) {
        // Créer une notification temporaire
        const notification = document.createElement('div');
        notification.className =
            'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        notification.innerHTML = `<i class="fas fa-check mr-2"></i>${message}`;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
};
