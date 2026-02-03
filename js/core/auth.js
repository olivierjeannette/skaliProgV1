// Gestionnaire d'authentification simplifié - Admin uniquement
const Auth = {
    currentLoginType: 'admin', // Type de connexion fixe

    // Connexion
    async login() {
        const password = document.getElementById('loginPassword').value;
        const loginType = this.currentLoginType;

        // Initialiser ENV si pas déjà fait
        if (!ENV.isLoaded) {
            await ENV.init();
        }

        // Vérifier le mot de passe selon le type
        let isValid = false;
        let userRole = null;

        switch (loginType) {
            case 'admin':
                // Utiliser le mot de passe depuis ENV (sécurisé)
                if (password === ENV.get('adminPassword')) {
                    isValid = true;
                    userRole = 'ADMIN';
                }
                break;
            case 'coach':
                // Utiliser le mot de passe depuis ENV
                if (password === ENV.get('coachPassword') || this.isValidCoachPassword(password)) {
                    isValid = true;
                    userRole = 'COACH';
                }
                break;
            case 'athlete':
                // Vérifier les mots de passe créés
                if (this.isValidAthletePassword(password)) {
                    isValid = true;
                    userRole = 'ATHLETE';
                }
                break;
        }

        if (isValid) {
            // Sauvegarder l'authentification et le rôle
            sessionStorage.setItem(CONFIG.STORAGE_KEYS.AUTH, 'true');
            sessionStorage.setItem(CONFIG.STORAGE_KEYS.USER_ROLE, userRole);

            // Masquer l'écran de login et afficher l'app
            document.getElementById('loginScreen').classList.add('hidden');
            document.getElementById('mainApp').classList.remove('hidden');

            // Initialiser l'app avec le rôle approprié
            if (typeof App !== 'undefined' && App.init) {
                App.init(userRole);
            } else {
                console.warn('⚠️ App.init() non disponible, attente du chargement...');
                // Attendre que App soit chargé
                setTimeout(() => {
                    if (typeof App !== 'undefined' && App.init) {
                        App.init(userRole);
                    }
                }, 100);
            }
        } else {
            // Afficher l'erreur
            this.showLoginError();
        }
    },

    // Vérifier si un mot de passe coach est valide (version synchrone)
    isValidCoachPassword(password) {
        // D'abord vérifier les mots de passe par défaut
        if (password === CONFIG.PASSWORDS.COACH) {
            return true;
        }

        // Vérifier dans le localStorage
        const coachPasswords = this.getCoachPasswords();
        return coachPasswords.includes(password);
    },

    // Vérifier si un mot de passe athlète est valide (version synchrone)
    isValidAthletePassword(password) {
        // D'abord vérifier les mots de passe par défaut
        if (password === CONFIG.PASSWORDS.ATHLETE) {
            return true;
        }

        // Vérifier dans le localStorage
        const athletePasswords = this.getAthletePasswords();
        return athletePasswords.includes(password);
    },

    // Vérifier si un mot de passe coach est valide (version asynchrone pour la base de données)
    async isValidCoachPasswordAsync(password) {
        // D'abord vérifier les mots de passe par défaut
        if (password === CONFIG.PASSWORDS.COACH) {
            return true;
        }

        // Ensuite vérifier dans la base de données
        if (typeof AccessCodeManager !== 'undefined') {
            try {
                const result = await AccessCodeManager.validateAccessCode(password, 'coach');
                return result.success && result.valid;
            } catch (error) {
                console.error('Erreur validation coach:', error);
                // Fallback sur localStorage
            }
        }

        // Fallback sur le localStorage
        const coachPasswords = this.getCoachPasswords();
        return coachPasswords.includes(password);
    },

    // Vérifier si un mot de passe athlète est valide (version asynchrone pour la base de données)
    async isValidAthletePasswordAsync(password) {
        // D'abord vérifier les mots de passe par défaut
        if (password === CONFIG.PASSWORDS.ATHLETE) {
            return true;
        }

        // Ensuite vérifier dans la base de données
        if (typeof AccessCodeManager !== 'undefined') {
            try {
                const result = await AccessCodeManager.validateAccessCode(password, 'athlete');
                return result.success && result.valid;
            } catch (error) {
                console.error('Erreur validation athlète:', error);
                // Fallback sur localStorage
            }
        }

        // Fallback sur le localStorage
        const athletePasswords = this.getAthletePasswords();
        return athletePasswords.includes(password);
    },

    // Obtenir les mots de passe coach stockés
    getCoachPasswords() {
        const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.COACH_PASSWORDS);
        return stored ? JSON.parse(stored) : [];
    },

    // Obtenir les mots de passe athlète stockés
    getAthletePasswords() {
        const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.ATHLETE_PASSWORDS);
        return stored ? JSON.parse(stored) : [];
    },

    // Ajouter un nouveau mot de passe coach
    addCoachPassword(password) {
        const passwords = this.getCoachPasswords();
        if (!passwords.includes(password)) {
            passwords.push(password);
            localStorage.setItem(CONFIG.STORAGE_KEYS.COACH_PASSWORDS, JSON.stringify(passwords));
        }
    },

    // Ajouter un nouveau mot de passe athlète
    addAthletePassword(password) {
        const passwords = this.getAthletePasswords();
        if (!passwords.includes(password)) {
            passwords.push(password);
            localStorage.setItem(CONFIG.STORAGE_KEYS.ATHLETE_PASSWORDS, JSON.stringify(passwords));
        }
    },

    // Supprimer un mot de passe coach
    removeCoachPassword(password) {
        const passwords = this.getCoachPasswords();
        const index = passwords.indexOf(password);
        if (index > -1) {
            passwords.splice(index, 1);
            localStorage.setItem(CONFIG.STORAGE_KEYS.COACH_PASSWORDS, JSON.stringify(passwords));
        }
    },

    // Supprimer un mot de passe athlète
    removeAthletePassword(password) {
        const passwords = this.getAthletePasswords();
        const index = passwords.indexOf(password);
        if (index > -1) {
            passwords.splice(index, 1);
            localStorage.setItem(CONFIG.STORAGE_KEYS.ATHLETE_PASSWORDS, JSON.stringify(passwords));
        }
    },

    // Afficher l'erreur de connexion
    showLoginError() {
        const errorElement = document.getElementById('loginError');
        errorElement.classList.remove('hidden');
        setTimeout(() => {
            errorElement.classList.add('hidden');
        }, 3000);
    },

    // Déconnexion
    logout() {
        sessionStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH);
        sessionStorage.removeItem(CONFIG.STORAGE_KEYS.USER_ROLE);
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');

        // Réinitialiser le type de connexion
        this.switchLoginType('admin');
    },

    // Obtenir le rôle de l'utilisateur actuel
    getCurrentUserRole() {
        return sessionStorage.getItem(CONFIG.STORAGE_KEYS.USER_ROLE);
    },

    // Vérifier si l'utilisateur est admin
    isAdmin() {
        return this.getCurrentUserRole() === 'ADMIN';
    },

    // Vérifier si l'utilisateur a une permission
    hasPermission(permission) {
        const userRole = this.getCurrentUserRole();
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
        const userRole = this.getCurrentUserRole();
        if (!userRole) {
            return false;
        }

        const roleConfig = CONFIG.ROLES[userRole];
        return roleConfig.canCreate.includes(userType);
    },

    // Synchroniser les codes depuis la base de données
    async syncCodesFromDatabase() {
        if (typeof AccessCodeManager !== 'undefined') {
            try {
                await AccessCodeManager.refreshLocalCache();
                console.log('✅ Codes synchronisés depuis la base de données');
            } catch (error) {
                console.warn('⚠️ Impossible de synchroniser les codes:', error);
            }
        }
    },

    // Vérifier l'authentification
    checkAuth() {
        // IMPORTANT : Vérifier d'abord si c'est le mode TV
        const urlParams = new URLSearchParams(window.location.search);
        const isTVMode = urlParams.get('tv') === 'true';

        if (isTVMode) {
            // Mode TV : bypass l'authentification et initialiser directement
            console.log('📺 Mode TV détecté - bypass auth');

            const loginScreen = document.getElementById('loginScreen');
            const mainApp = document.getElementById('mainApp');

            if (loginScreen) {
                loginScreen.style.display = 'none';
            }
            if (mainApp) {
                mainApp.style.display = 'none';
            }

            // Initialiser TVMode directement (pas besoin de DataManager maintenant)
            if (typeof TVMode !== 'undefined') {
                TVMode.init();
            }
            return; // Ne pas continuer avec l'auth normale
        }

        // Synchroniser les codes au démarrage (si disponible)
        if (typeof this.syncCodesFromDatabase === 'function') {
            this.syncCodesFromDatabase();
        }

        // Mode normal : vérifier l'authentification
        if (sessionStorage.getItem(CONFIG.STORAGE_KEYS.AUTH) === 'true') {
            const userRole = this.getCurrentUserRole();
            document.getElementById('loginScreen').classList.add('hidden');
            document.getElementById('mainApp').classList.remove('hidden');

            // Initialiser l'app si disponible
            if (typeof App !== 'undefined' && App.init) {
                App.init(userRole);
            } else {
                console.warn('⚠️ App.init() non disponible au checkAuth, attente...');
                setTimeout(() => {
                    if (typeof App !== 'undefined' && App.init) {
                        App.init(userRole);
                    }
                }, 100);
            }
        }
    }
};

// Exposer globalement
window.Auth = Auth;

console.log('✅ Module Auth chargé');
