/* ========================================
   SKALI PROG - Theme Manager
   Gestion des thèmes de couleur
   ======================================== */

const ThemeManager = {
    // Thèmes disponibles - SIMPLIFIÉ: Dark et Light uniquement
    THEMES: {
        light: {
            name: 'Mode Clair',
            description: 'Thème clair (fond blanc, texte noir)',
            icon: 'fa-sun'
        },
        dark: {
            name: 'Mode Sombre',
            description: 'Thème sombre (fond noir, texte blanc)',
            icon: 'fa-moon'
        }
    },

    currentTheme: 'light',

    /**
     * Initialise le gestionnaire de thèmes
     */
    init() {
        // Charger le thème depuis localStorage
        const savedTheme = localStorage.getItem('skaliTheme');
        if (savedTheme && this.THEMES[savedTheme]) {
            this.applyTheme(savedTheme);
        } else {
            // Thème par défaut (Mode Clair)
            this.applyTheme('light');
        }

        // Appliquer la couleur de texte personnalisée si elle existe
        this.applyCustomTextColor();
    },

    /**
     * DÉSACTIVÉ - Les couleurs personnalisées ne sont plus utilisées
     * Le système de thème Light/Dark gère maintenant toutes les couleurs via CSS variables
     */
    applyCustomTextColor() {
        // DÉSACTIVÉ - Ne plus écraser les variables CSS
        // Les thèmes Light/Dark gèrent automatiquement les couleurs
        console.log('✅ Système de thème Light/Dark actif - couleurs personnalisées désactivées');
    },

    /**
     * Applique un thème
     * @param themeId
     */
    applyTheme(themeId) {
        if (!this.THEMES[themeId]) {
            console.error(`Thème inconnu: ${themeId}`);
            return;
        }

        // Appliquer le thème sur l'élément HTML
        const html = document.documentElement;
        html.setAttribute('data-theme', themeId);

        // Sauvegarder dans localStorage
        localStorage.setItem('skaliTheme', themeId);
        this.currentTheme = themeId;

        console.log(`✅ Thème appliqué: ${this.THEMES[themeId].name}`);
    },

    /**
     * Change le thème
     * @param themeId
     */
    changeTheme(themeId) {
        this.applyTheme(themeId);
    },

    /**
     * Récupère le thème actuel
     */
    getCurrentTheme() {
        return this.currentTheme;
    },

    /**
     * Récupère la liste des thèmes disponibles
     */
    getAvailableThemes() {
        return Object.keys(this.THEMES).map(id => ({
            id,
            ...this.THEMES[id]
        }));
    },

    /**
     * Bascule entre mode clair et sombre
     */
    toggleDarkMode() {
        const isDark = this.currentTheme === 'dark';
        this.applyTheme(isDark ? 'light' : 'dark');
        return !isDark; // Retourne le nouvel état
    },

    /**
     * Vérifie si le mode sombre est actif
     */
    isDarkMode() {
        return this.currentTheme === 'dark';
    }
};

// Initialiser le thème au chargement
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
});
