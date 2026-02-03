/**
 * VOTRE DISCORD ID - Configuration personnelle
 *
 * ⚠️ IMPORTANT: Ce fichier est DÉSACTIVÉ pour éviter les conflits multi-utilisateurs
 *
 * PROBLÈME RÉSOLU:
 * - Avant: Tout le monde se connectait sur le même compte (celui d'Olivier)
 * - Maintenant: Chaque personne doit entrer son propre Discord ID à chaque session
 *
 * Cette approche garantit que:
 * 1. Chaque utilisateur choisit son adhérent
 * 2. Chaque utilisateur se connecte avec SON Discord
 * 3. Pas de sauvegarde automatique qui pourrait créer des conflits
 *
 * Comment trouver mon Discord ID ?
 * 1. Ouvrir Discord
 * 2. Paramètres > Avancés
 * 3. Activer "Mode développeur"
 * 4. Clic droit sur votre nom > "Copier l'ID"
 * 5. Entrer l'ID dans le formulaire de connexion du portail
 */

const MY_DISCORD_CONFIG = {
    // Votre Discord ID (17-19 chiffres)
    discordId: '', // ⬅️ LAISSEZ VIDE - Chaque personne entre son ID au login

    // Votre pseudo Discord (optionnel)
    username: '', // ⬅️ LAISSEZ VIDE

    // Activer la connexion automatique
    autoLogin: false // ⬅️ DÉSACTIVÉ pour sécurité multi-utilisateurs
};

// Exposer globalement
window.MY_DISCORD_CONFIG = MY_DISCORD_CONFIG;
