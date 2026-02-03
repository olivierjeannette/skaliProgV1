/**
 * PROGRAMMING PRO - MODULE LOADER
 * Charge tous les modules nécessaires pour la génération de programmes professionnels
 * À inclure APRÈS les scripts jsPDF dans index.html
 */

(async function () {
    console.log('🚀 Chargement Programming Pro Modules...');

    const modulesToLoad = [
        // Validation
        'js/modules/programming/generators/program-validation.js',

        // Données - Bases sportives complètes (NOUVEAU)
        'js/modules/programming/data/trail-running-database.js',
        'js/modules/programming/data/hyrox-database.js',
        'js/modules/programming/data/crossfit-database.js',
        'js/modules/programming/data/bodybuilding-database.js',
        'js/modules/programming/data/running-database.js',
        'js/modules/programming/data/sports-databases-loader.js',

        // Données - Ancien système (fallback)
        'js/modules/programming/data/workout-formats-database.js',

        // Générateurs
        'js/modules/programming/generators/real-session-generator.js',
        'js/modules/programming/generators/program-generator-ai.js',
        'js/modules/programming/generators/pdf-generator-pro.js',

        // Templates (si existe)
        'js/integrations/laskali-session-templates.js'
    ];

    // Charger chaque module
    for (const modulePath of modulesToLoad) {
        try {
            await loadScript(modulePath);
            console.log(`✅ ${modulePath.split('/').pop()}`);
        } catch (error) {
            console.warn(`⚠️ ${modulePath.split('/').pop()} - ${error.message}`);
        }
    }

    // Vérifier que tous les modules critiques sont chargés
    const requiredModules = [
        'ProgramValidation',
        'WorkoutFormatsDatabase',
        'RealSessionGenerator',
        'AIProgramGenerator',
        'ProgramPDFGeneratorPro'
    ];

    const missing = [];
    requiredModules.forEach(module => {
        if (!window[module]) {
            missing.push(module);
        }
    });

    if (missing.length > 0) {
        console.error('❌ Modules manquants:', missing);
    } else {
        console.log('✅ Tous les modules Programming Pro chargés avec succès');

        // Initialiser RealSessionGenerator
        if (window.RealSessionGenerator) {
            await RealSessionGenerator.initialize();
        }
    }

    // Helper pour charger scripts
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Impossible de charger ${src}`));
            document.head.appendChild(script);
        });
    }
})();
