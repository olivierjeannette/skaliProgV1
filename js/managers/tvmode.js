// Gestionnaire du mode TV responsive
const TVMode = {
    clockInterval: null,
    currentZoom: 100,
    clockSize: 5.0, // Taille de l'horloge en rem (réduit de 3 clics: 6.5 - 1.5 = 5.0)
    blockSizes: {}, // Stockage des tailles individuelles par bloc
    titleSize: null, // Taille du titre principal
    sessionBlockSizes: {}, // Tailles des blocs de séance
    globalScale: 1.0, // 100% par défaut
    textColor: 'rgba(10, 10, 10, 1)', // NOIR pour fond blanc (CSS --tv-text-primary)
    safeAreaMargin: '0.5vh', // Marge de sécurité pour TV (en vh pour s'adapter)
    blockWidths: {}, // Largeurs des blocs en % (flex-basis)
    blockVisibility: {}, // Visibilité des blocs (true/false)

    // NOUVEAU SYSTÈME D'AUTO-SIZE MAÎTRE
    autoSize: {
        baseUnit: 1, // Unité de base calculée en vh/vw
        enabled: true, // Auto-size activé par défaut
        minScale: 0.5, // Échelle minimale (50%)
        maxScale: 2.0 // Échelle maximale (200%)
    },

    // Configuration locale pour éviter les dépendances
    SESSION_CATEGORIES: {
        crosstraining: { name: 'CrossTraining', color: '#22c55e', icon: 'fas fa-fire' },
        musculation: { name: 'Musculation', color: '#22c55e', icon: 'fas fa-dumbbell' },
        cardio: { name: 'Cardio', color: '#22c55e', icon: 'fas fa-heart' },
        hyrox: { name: 'Hyrox', color: '#22c55e', icon: 'fas fa-running' },
        recovery: { name: 'Récupération', color: '#22c55e', icon: 'fas fa-leaf' }
    },

    // Fonction utilitaire pour calculer les styles de base avec détection intelligente
    getBaseStyles() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const isMobile =
            width <= 768 ||
            /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isLandscape = height < width;
        const isMobileLandscape = isMobile && isLandscape;
        const isSmallScreen = width <= 480;

        // Détection intelligente de la résolution (1080p, 4K, smartphone)
        const is1080p = width >= 1920 && width < 2560;
        const is4K = width >= 2560;
        const isTV = is1080p || is4K;
        const isLargeTV = is4K;

        return {
            isMobile,
            isLandscape,
            isMobileLandscape,
            isSmallScreen,
            isTV,
            isLargeTV,
            // Espaces réduits pour maximiser le contenu
            outerPadding: isSmallScreen ? '4px' : isMobileLandscape ? '6px' : isTV ? '8px' : '6px',
            innerPadding: isSmallScreen
                ? '0.3rem 0.5rem'
                : isMobileLandscape
                  ? '0.4rem 0.6rem'
                  : isTV
                    ? '0.8rem 1rem'
                    : '0.6rem 0.8rem',
            contentPadding: isSmallScreen
                ? '0.4rem'
                : isMobileLandscape
                  ? '0.5rem'
                  : isTV
                    ? '0.8rem'
                    : '0.6rem',
            contentGap: isSmallScreen
                ? '0.4rem'
                : isMobileLandscape
                  ? '0.5rem'
                  : isTV
                    ? '0.8rem'
                    : '0.6rem',
            borderWidth: isSmallScreen ? '2px' : isMobileLandscape ? '2px' : isTV ? '3px' : '2px',
            borderRadius: isSmallScreen
                ? '6px'
                : isMobileLandscape
                  ? '8px'
                  : isTV
                    ? '12px'
                    : '10px',
            blockPadding: isMobileLandscape ? '0.8rem' : isTV ? '1.2rem' : '1rem',
            controlSize: isMobileLandscape ? '14px' : isTV ? '18px' : '16px',
            controlFontSize: isMobileLandscape ? '0.5rem' : isTV ? '0.65rem' : '0.6rem',
            // HEADER RÉDUIT - Tailles optimisées pour maximiser l'espace des blocs
            titleFontSize: isSmallScreen
                ? '1.2rem'
                : isMobileLandscape
                  ? '1.5rem'
                  : is4K
                    ? '2.2rem'
                    : is1080p
                      ? '1.8rem'
                      : '1.6rem',
            subtitleFontSize: isSmallScreen
                ? '0.7rem'
                : isMobileLandscape
                  ? '0.9rem'
                  : is4K
                    ? '1.2rem'
                    : is1080p
                      ? '1.0rem'
                      : '0.9rem',
            blockTitleFontSize: isSmallScreen
                ? '1.0rem'
                : isMobileLandscape
                  ? '1.3rem'
                  : is4K
                    ? '2.0rem'
                    : is1080p
                      ? '1.6rem'
                      : '1.4rem',
            blockContentFontSize: isSmallScreen
                ? '0.7rem'
                : isMobileLandscape
                  ? '0.9rem'
                  : is4K
                    ? '1.4rem'
                    : is1080p
                      ? '1.2rem'
                      : '1.0rem',
            baseBlockTextSize: isSmallScreen
                ? 2.0
                : isMobileLandscape
                  ? 2.2
                  : is4K
                    ? 3.0
                    : is1080p
                      ? 2.5
                      : 2.2,
            baseClockSize: isSmallScreen
                ? 1.8
                : isMobileLandscape
                  ? 2.2
                  : is4K
                    ? 4.0
                    : is1080p
                      ? 3.2
                      : 2.8,
            baseHeaderSize: isSmallScreen
                ? 0.8
                : isMobileLandscape
                  ? 1.0
                  : is4K
                    ? 1.8
                    : is1080p
                      ? 1.4
                      : 1.2,
            baseBlockTitleSize: isSmallScreen
                ? 1.2
                : isMobileLandscape
                  ? 1.5
                  : is4K
                    ? 2.4
                    : is1080p
                      ? 2.0
                      : 1.8,
            // Nouveaux : détection résolution
            is1080p,
            is4K
        };
    },

    // NOUVEAU: Calculer automatiquement toutes les tailles en fonction de l'écran
    calculateAutoSize() {
        // DÉSACTIVÉ - Utiliser getBaseStyles() qui fonctionne bien !
        // Le système vh causait des textes énormes en plein écran
        return this.getBaseStyles();
    },

    // Initialiser le mode TV depuis l'URL
    init() {
        console.log('🚀 TVMode.init() appelé');

        // Charger les préférences sauvegardées
        this.loadPreferences();

        const urlParams = new URLSearchParams(window.location.search);
        const dateKey = urlParams.get('date');
        const sessionIndex = parseInt(urlParams.get('session') || '0');

        console.log('📺 Mode TV détecté:', { dateKey, sessionIndex });

        if (!dateKey) {
            console.log('❌ Pas de paramètre date, mode TV non initialisé');
            return false;
        }

        console.log('📺 Mode TV confirmé, nettoyage du DOM...');

        // Ajouter la classe tv-mode-active pour désactiver ResponsiveManager
        document.body.classList.add('tv-mode-active');

        // Reset le transform de mainApp si ResponsiveManager l'avait modifié
        const mainApp = document.getElementById('mainApp');
        if (mainApp) {
            mainApp.style.transform = 'none';
            mainApp.style.width = '100%';
            mainApp.style.height = '100vh';
        }

        // Nettoyer le DOM
        document.body.innerHTML = '';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.overflow = 'hidden';
        document.body.style.background = 'linear-gradient(135deg, #f8fafc, #f1f5f9)';

        // Re-ajouter la classe après innerHTML clear
        document.body.classList.add('tv-mode-active');

        // Afficher l'écran de chargement
        this.showLoadingScreen();

        // Charger les données après un court délai (async)
        setTimeout(async () => {
            await this.loadSessionData(dateKey, sessionIndex);
        }, 100);

        return true;
    },

    // Afficher l'écran de chargement
    showLoadingScreen() {
        document.body.innerHTML = `
            <div class="tv-loading-screen">
                <div class="tv-loading-card">
                    <div class="tv-loading-icon">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                    <p class="tv-loading-title">Chargement de la séance...</p>
                    <p class="tv-loading-subtitle">Mode TV Sport & Santé</p>
                </div>
            </div>
        `;
    },

    // Charger les données de la séance
    async loadSessionData(dateKey, sessionIndex) {
        console.log('🔍 Chargement des données pour:', dateKey, sessionIndex);

        try {
            // Vérifier si dateKey est un UUID (= ID de session) ou une date
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                dateKey
            );

            if (isUUID) {
                console.log('🔑 UUID détecté, chargement depuis Supabase par ID...');

                if (typeof SupabaseManager === 'undefined') {
                    console.error('❌ SupabaseManager non disponible');
                    this.showTVError('Erreur: Module Supabase non chargé');
                    return;
                }

                // Charger la session depuis Supabase par ID
                const session = await SupabaseManager.getSession(dateKey);

                if (!session) {
                    console.error('❌ Session non trouvée:', dateKey);
                    this.showTVError(`Séance non trouvée (ID: ${dateKey.substring(0, 8)}...)`);
                    return;
                }

                console.log('✅ Session chargée depuis Supabase:', session);

                // Convertir au format attendu par displaySession
                const formattedSession = {
                    title: session.title || 'Séance',
                    category: session.category || 'crosstraining',
                    blocks: session.blocks || []
                };

                this.displaySession(session.date, 0, formattedSession, [formattedSession]);
                return;
            }

            // Si c'est une date, essayer localStorage (ancien système)
            const storageKey = 'skaliWorkoutData';
            const saved = localStorage.getItem(storageKey);

            console.log('📦 Données localStorage trouvées:', !!saved);

            if (!saved) {
                console.warn('⚠️ Aucune donnée dans localStorage');
                this.showTVError('Aucune séance trouvée');
                return;
            }

            const data = JSON.parse(saved);
            console.log('✅ Données chargées:', data);

            if (!data.calendar || !data.calendar[dateKey]) {
                console.error('❌ Pas de données pour cette date:', dateKey);
                console.log('📅 Dates disponibles:', Object.keys(data.calendar || {}));
                this.showTVError(`Aucune séance trouvée pour le ${dateKey}`);
                return;
            }

            const dayData = data.calendar[dateKey];
            let sessions = [];

            // Gérer les deux formats de données
            if (dayData.sessions) {
                sessions = dayData.sessions;
                console.log('📋 Format sessions détecté, nombre de sessions:', sessions.length);
            } else if (dayData.title || dayData.blocks) {
                sessions = [dayData];
                console.log('📋 Format bloc unique détecté');
            }

            if (!sessions[sessionIndex]) {
                console.error("❌ Session non trouvée à l'index:", sessionIndex);
                console.log('📋 Sessions disponibles:', sessions.length);
                this.showTVError(
                    `Séance ${sessionIndex + 1} non trouvée (${sessions.length} séance(s) disponible(s))`
                );
                return;
            }

            console.log('✅ Séance trouvée:', sessions[sessionIndex]);

            // Afficher la séance immédiatement
            this.displaySession(dateKey, sessionIndex, sessions[sessionIndex], sessions);
        } catch (error) {
            console.error('💥 Erreur lors du chargement:', error);
            console.error('💥 Stack trace:', error.stack);
            this.showTVError('Erreur de chargement: ' + error.message);
        }
    },

    // Créer des données de test pour le mode TV
    createTestData(dateKey) {
        console.log('🧪 Création de données de test pour:', dateKey);

        return {
            title: 'Séance de Test',
            category: 'cardio',
            blocks: [
                {
                    name: 'Échauffement',
                    content:
                        "• 5 min de course sur place\n• 3 min d'étirements dynamiques\n• 2 min de sautillements"
                },
                {
                    name: 'Cardio Intensif',
                    content:
                        '• 4 x 30s de burpees\n• 4 x 30s de mountain climbers\n• 4 x 30s de jumping jacks\n• 1 min de récupération entre chaque'
                },
                {
                    name: 'Récupération',
                    content: "• 5 min de marche\n• 3 min d'étirements statiques\n• Hydratation"
                }
            ]
        };
    },

    // Afficher une erreur
    showTVError(message) {
        console.error('🚨 Erreur TVMode:', message);

        // Récupérer les paramètres URL pour le debug
        const urlParams = new URLSearchParams(window.location.search);
        const debugInfo = {
            url: window.location.href,
            tv: urlParams.get('tv'),
            date: urlParams.get('date'),
            session: urlParams.get('session'),
            userAgent: navigator.userAgent,
            screenSize: `${window.innerWidth}x${window.innerHeight}`
        };

        console.error('🔍 Informations de debug:', debugInfo);

        // Utiliser la fonction d'auto-size pour obtenir les styles
        const styles = this.calculateAutoSize();

        document.body.innerHTML = `
            <div class="tv-error-screen">
                <div class="tv-error-container" style="border-width: ${styles.borderWidth}; border-radius: ${styles.borderRadius};">
                    <div class="tv-error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h1 class="tv-error-title" style="font-size: ${styles.titleFontSize};">${message}</h1>

                    <div class="tv-error-debug">
                        <strong>Informations de debug:</strong><br>
                        URL: ${debugInfo.url}<br>
                        Mode TV: ${debugInfo.tv}<br>
                        Date: ${debugInfo.date}<br>
                        Session: ${debugInfo.session}<br>
                        Écran: ${debugInfo.screenSize}
                    </div>

                    <div class="tv-error-actions">
                        <button onclick="location.reload()" class="btn-primary" style="padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-size: 1.125rem; margin-right: 1rem;">
                            <i class="fas fa-refresh" style="margin-right: 0.5rem;"></i>Recharger
                        </button>
                        <button onclick="window.close()" class="btn-danger" style="padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-size: 1.125rem;">
                            <i class="fas fa-times" style="margin-right: 0.5rem;"></i>Fermer
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // État du toggle pour l'affichage du tirage cardio
    showLotteryDraw: false,
    lotteryDrawData: null,

    // État du toggle pour l'affichage des équipes TeamBuilder
    showTeamsDraw: false,
    teamsDrawData: null,

    // Afficher la séance
    displaySession(dateKey, sessionIndex, session, allSessions) {
        console.log('🎬 Affichage de la séance');

        const [year, month, day] = dateKey.split('-');
        const dateStr = new Date(year, month - 1, day).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });

        const categoryInfo = session.category ? this.SESSION_CATEGORIES[session.category] : null;

        const blocks = session.blocks || [];

        // Utiliser la fonction d'auto-size pour obtenir tous les styles
        const styles = this.calculateAutoSize();
        const { isMobile, isLandscape, isMobileLandscape, isSmallScreen, isTV, isLargeTV } = styles;

        // Variable pour la taille du texte des blocs
        this.blockTextSize = this.blockTextSize || styles.baseBlockTextSize;
        this.clockSize = this.clockSize || styles.baseClockSize;

        // Initialiser les tailles personnalisées si elles n'existent pas
        if (this.titleSize === null || this.titleSize === undefined) {
            this.titleSize = parseFloat(styles.titleFontSize.replace('rem', ''));
        }

        // Générer le HTML des blocs
        let blocksHTML = '';
        if (blocks.length > 0) {
            blocks.forEach((block, i) => {
                // Initialiser la taille du bloc si elle n'existe pas
                const blockId = `${dateKey}_${sessionIndex}_${i}`;
                const sessionBlockId = `session_${i}`;
                if (!this.blockSizes[blockId]) {
                    // Taille par défaut grande - l'auto-detect ajustera après
                    this.blockSizes[blockId] = 3.5;
                }
                if (!this.sessionBlockSizes[sessionBlockId]) {
                    this.sessionBlockSizes[sessionBlockId] = 1.0;
                }
                // Initialiser la largeur du bloc (en flex-basis, 1 = taille par défaut)
                if (!this.blockWidths[sessionBlockId]) {
                    this.blockWidths[sessionBlockId] = 1;
                }
                // Initialiser la visibilité (true par défaut)
                if (this.blockVisibility[sessionBlockId] === undefined) {
                    this.blockVisibility[sessionBlockId] = true;
                }

                // Formater le contenu pour un meilleur alignement
                const formattedContent = (block.content || '')
                    .split('\n')
                    .map(line => {
                        // Si la ligne contient des tirets ou des puces, les aligner
                        if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
                            return `<div class="tv-block-content-line-indent">${line}</div>`;
                        }
                        return `<div class="tv-block-content-line">${line || '&nbsp;'}</div>`;
                    })
                    .join('');

                // Utiliser les styles calculés
                const blockPadding = styles.blockPadding;
                const controlSize = styles.controlSize;
                const controlFontSize = styles.controlFontSize;

                const isVisible = this.blockVisibility[sessionBlockId];
                const displayStyle = isVisible ? '' : 'display: none;';

                blocksHTML += `
                    <div class="tv-block" data-block-id="${blockId}" data-session-block-id="${sessionBlockId}"
                         style="border-width: ${styles.borderWidth}; border-radius: ${styles.borderRadius}; padding: ${blockPadding}; padding-top: 3rem; flex: 1 1 0%; ${displayStyle}; position: relative;">
                        <!-- Barre de couleur en haut du bloc -->
                        <div class="tv-color-bar-block" style="border-radius: ${styles.borderRadius} ${styles.borderRadius} 0 0;"></div>

                        <!-- Contrôles compacts du bloc - EN HAUT À GAUCHE DANS LE BLOC -->
                        <div class="tv-block-controls-unified" style="position: absolute; top: 0.6rem; left: 0.5rem; background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(12px); border: 2px solid rgba(34, 197, 94, 0.3); border-radius: 8px; padding: 0.3rem 0.4rem; box-shadow: 0 2px 12px rgba(0,0,0,0.15); display: flex; gap: 0.25rem; z-index: 100; pointer-events: auto;">
                            <!-- Bouton visibilité -->
                            <button onclick="window.TVMode.toggleBlockVisibility('${sessionBlockId}')" class="visibility-btn" style="width: 24px; height: 24px; font-size: 0.7rem; background: rgba(59, 130, 246, 0.15); border: 1.5px solid rgba(59, 130, 246, 0.3); border-radius: 5px; cursor: pointer; color: rgba(59, 130, 246, 0.9); display: flex; align-items: center; justify-content: center; transition: all 0.15s;" title="Masquer/Afficher">
                                <i class="fas fa-eye"></i>
                            </button>

                            <!-- Séparateur visuel -->
                            <div style="width: 1px; background: rgba(0,0,0,0.1); margin: 0 0.1rem;"></div>

                            <!-- Contrôles de largeur -->
                            <button onclick="window.TVMode.adjustBlockWidth('${sessionBlockId}', -0.2)" style="width: 24px; height: 24px; font-size: 0.75rem; font-weight: 700; background: rgba(239, 68, 68, 0.15); border: 1.5px solid rgba(239, 68, 68, 0.3); border-radius: 5px; cursor: pointer; color: rgba(239, 68, 68, 0.9); display: flex; align-items: center; justify-content: center; transition: all 0.15s;" title="Réduire largeur">
                                &lt;
                            </button>
                            <button onclick="window.TVMode.adjustBlockWidth('${sessionBlockId}', 0.2)" style="width: 24px; height: 24px; font-size: 0.75rem; font-weight: 700; background: rgba(34, 197, 94, 0.15); border: 1.5px solid rgba(34, 197, 94, 0.3); border-radius: 5px; cursor: pointer; color: rgba(34, 197, 94, 0.9); display: flex; align-items: center; justify-content: center; transition: all 0.15s;" title="Augmenter largeur">
                                &gt;
                            </button>

                            <!-- Séparateur visuel -->
                            <div style="width: 1px; background: rgba(0,0,0,0.1); margin: 0 0.1rem;"></div>

                            <!-- Contrôles de taille texte -->
                            <button onclick="window.TVMode.adjustBlockTextSize('${blockId}', -0.1)" style="width: 24px; height: 24px; font-size: 0.8rem; font-weight: 700; background: rgba(239, 68, 68, 0.15); border: 1.5px solid rgba(239, 68, 68, 0.3); border-radius: 5px; cursor: pointer; color: rgba(239, 68, 68, 0.9); display: flex; align-items: center; justify-content: center; transition: all 0.15s;" title="Réduire texte">
                                A-
                            </button>
                            <button onclick="window.TVMode.adjustBlockTextSize('${blockId}', 0.1)" style="width: 24px; height: 24px; font-size: 0.8rem; font-weight: 700; background: rgba(34, 197, 94, 0.15); border: 1.5px solid rgba(34, 197, 94, 0.3); border-radius: 5px; cursor: pointer; color: rgba(34, 197, 94, 0.9); display: flex; align-items: center; justify-content: center; transition: all 0.15s;" title="Augmenter texte">
                                A+
                            </button>
                        </div>

                        <h3 class="tv-block-title" style="font-size: ${styles.blockTitleFontSize}; color: ${this.textColor} !important; margin-bottom: 0.8rem;">
                            ${block.name || 'Bloc ' + (i + 1)}
                        </h3>

                        <!-- Séparation stylée entre titre et contenu -->
                        <div style="position: relative; height: 2px; margin: 0.8rem 0 1rem 0; background: linear-gradient(90deg, rgba(10, 10, 10, 0) 0%, rgba(10, 10, 10, 0.15) 15%, rgba(10, 10, 10, 0.15) 85%, rgba(10, 10, 10, 0) 100%); border-radius: 2px;">
                            <div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 8px; height: 8px; background: linear-gradient(135deg, rgba(34, 197, 94, 0.8), rgba(34, 197, 94, 0.5)); border: 1.5px solid rgba(10, 10, 10, 0.2); border-radius: 50%; box-shadow: 0 0 8px rgba(34, 197, 94, 0.3);"></div>
                        </div>

                        <div class="tv-block-content" style="color: ${this.textColor} !important;">
                            ${formattedContent}
                        </div>
                    </div>
                `;
            });
        } else {
            blocksHTML = `
                <div class="tv-empty-block" style="border-width: ${styles.borderWidth}; border-radius: ${styles.borderRadius}; padding: ${isTV ? '2rem' : '1.5rem'};">
                    <i class="fas fa-dumbbell tv-empty-icon" style="font-size: ${isTV ? '4rem' : '3rem'}; color: #22c55e;"></i>
                    <p class="tv-empty-text" style="font-size: ${isTV ? '2.2rem' : '1.6rem'}; color: #000000;">Aucun bloc défini pour cette séance</p>
                </div>
            `;
        }

        // Utiliser les styles calculés
        const { contentPadding, contentGap, borderWidth, borderRadius } = styles;

        // Ajuster les tailles des boutons et éléments selon le device (optimisé pour smartphone)
        const navButtonPadding = isSmallScreen
            ? '0.1rem 0.2rem'
            : isMobileLandscape
              ? '0.1rem 0.3rem'
              : '0.2rem 0.4rem';
        const navButtonFontSize = isSmallScreen
            ? '0.4rem'
            : isMobileLandscape
              ? '0.5rem'
              : '0.6rem';

        // Utiliser les styles calculés
        const { titleFontSize, subtitleFontSize, blockTitleFontSize, blockContentFontSize } =
            styles;

        // Créer le HTML complet avec design moderne sport & santé
        document.body.innerHTML = `
            <div class="tv-page-wrapper" style="padding: 0; box-sizing: border-box; margin: 1.5%; width: 97%; height: 97vh;">
                <!-- Safe area pour TV avec cache physique - marge légère pour overscan -->
                <div class="tv-safe-area" style="padding: 0; box-sizing: border-box; width: 100%; height: 100%;">

                <!-- Container principal avec design moderne -->
                <div class="tv-main-container" style="border-width: ${borderWidth}; border-radius: ${borderRadius}; height: 100%; box-sizing: border-box;">

                    <!-- Barre de couleur en haut -->
                    <div class="tv-color-bar" style="border-radius: ${borderRadius} ${borderRadius} 0 0;"></div>

                    <!-- Header moderne - Structure flex propre sans débordement -->
                    <div class="tv-header" style="padding: ${isTV ? '0.6rem 1rem' : '0.8rem 1.2rem'};">
                        <div class="tv-header-content" style="display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 1rem; width: 100%;">

                            <!-- Section gauche: Info séance -->
                            <div class="tv-header-left" style="display: flex; flex-direction: column; gap: 0.2rem; min-width: 0;">
                                    <!-- Contrôles de taille pour le titre (compacts) -->
                                    <div class="tv-title-controls" style="display: flex; gap: 0.2rem; margin-bottom: 0.2rem;">
                                        <button onclick="window.TVMode.adjustTitleSize(-0.2)"
                                                class="tv-block-size-btn decrease"
                                                style="width: 18px; height: 18px; font-size: 0.6rem; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 4px; cursor: pointer; color: rgba(239, 68, 68, 0.9);"
                                                title="Réduire la taille du titre">
                                            -
                                        </button>
                                        <button onclick="window.TVMode.adjustTitleSize(0.2)"
                                                class="tv-block-size-btn increase"
                                                style="width: 18px; height: 18px; font-size: 0.6rem; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.25); border-radius: 4px; cursor: pointer; color: rgba(34, 197, 94, 0.9);"
                                                title="Augmenter la taille du titre">
                                            +
                                        </button>
                                    </div>

                                    <h1 class="tv-title" style="font-size: ${this.titleSize || 2.0}rem; color: ${this.textColor} !important; margin: 0; line-height: 1.2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                        ${session.title || 'SÉANCE'}
                                    </h1>
                                    <p class="tv-date" style="font-size: ${subtitleFontSize}; color: ${this.textColor} !important; margin: 0; opacity: 0.8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                        ${dateStr}
                                    </p>
                                    ${
                                        categoryInfo
                                            ? `
                                        <span class="tv-category-badge" style="font-size: ${blockContentFontSize}; color: ${this.textColor} !important; display: inline-flex; align-items: center; gap: 0.3rem; margin-top: 0.2rem;">
                                            <i class="${categoryInfo.icon}"></i>
                                            ${categoryInfo.name}
                                        </span>
                                    `
                                            : ''
                                    }
                                </div>

                                <!-- HORLOGE CENTRÉE (colonne du milieu) - SIMPLIFIÉE -->
                                <div class="tv-header-center" style="display: flex; justify-content: center; align-items: center;">
                                    <!-- Horloge agrandie sans boutons -->
                                    <div id="tvClock" class="tv-clock" style="font-size: ${this.clockSize * 1.5}rem; color: ${this.textColor} !important; font-weight: 900; font-variant-numeric: tabular-nums; white-space: nowrap; text-shadow: 0 3px 12px rgba(0,0,0,0.15); letter-spacing: 0.05em;">
                                        --:--:--
                                    </div>
                                </div>

                                <!-- Section droite: Contrôles -->
                                <div class="tv-header-right" style="display: flex; gap: 0.4rem; align-items: center; justify-content: flex-end; flex-wrap: wrap; min-width: 0;">

                                    <!-- Sélecteur de couleur -->
                                    <div class="tv-color-picker-wrapper" style="display: flex; align-items: center; gap: 0.3rem; background: rgba(10, 10, 10, 0.05); padding: 0.3rem 0.5rem; border-radius: 8px; border: 1px solid rgba(10, 10, 10, 0.1);">
                                        <label class="tv-color-picker-label" style="font-size: 0.7rem; color: rgba(10, 10, 10, 1); font-weight: 600;">Couleur:</label>
                                        <input type="color" id="textColorPicker" class="tv-color-picker" value="#0a0a0a"
                                               onchange="TVMode.changeTextColor(this.value)"
                                               style="width: 30px; height: 30px; border: 2px solid rgba(10, 10, 10, 0.2); border-radius: 6px; cursor: pointer;">
                                    </div>

                                    <!-- Bouton toggle tirage cardio -->
                                    <button id="toggleLotteryBtn" onclick="TVMode.toggleLotteryDisplay()"
                                            style="padding: 0.4rem 0.8rem; font-size: 0.75rem; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px; cursor: pointer; transition: all 0.2s; color: rgba(34, 197, 94, 0.9); font-weight: 600; display: flex; align-items: center; gap: 0.3rem;"
                                            onmouseover="this.style.background='rgba(34, 197, 94, 0.2)'"
                                            onmouseout="this.style.background='rgba(34, 197, 94, 0.1)'">
                                        <i class="fas fa-random"></i>
                                        <span id="toggleLotteryText">Tirage</span>
                                    </button>

                                    <!-- Bouton toggle équipes TeamBuilder -->
                                    <button id="toggleTeamsBtn" onclick="TVMode.toggleTeamsDisplay()"
                                            style="padding: 0.4rem 0.8rem; font-size: 0.75rem; background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 8px; cursor: pointer; transition: all 0.2s; color: rgba(168, 85, 247, 0.9); font-weight: 600; display: flex; align-items: center; gap: 0.3rem;"
                                            onmouseover="this.style.background='rgba(168, 85, 247, 0.2)'"
                                            onmouseout="this.style.background='rgba(168, 85, 247, 0.1)'">
                                        <i class="fas fa-users"></i>
                                        <span id="toggleTeamsText">Teams</span>
                                    </button>

                                    <!-- Bouton Reset (Refresh page) -->
                                    <button id="refreshPageBtn" onclick="location.reload()"
                                            style="padding: 0.4rem 0.8rem; font-size: 0.75rem; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px; cursor: pointer; transition: all 0.2s; color: rgba(59, 130, 246, 0.9); font-weight: 600; display: flex; align-items: center; gap: 0.3rem;"
                                            onmouseover="this.style.background='rgba(59, 130, 246, 0.2)'"
                                            onmouseout="this.style.background='rgba(59, 130, 246, 0.1)'"
                                            title="Rafraîchir la page">
                                        <i class="fas fa-sync-alt"></i>
                                        <span>Refresh</span>
                                    </button>

                                    <!-- Navigation (si plusieurs séances) -->
                                    ${
                                        allSessions && allSessions.length > 1
                                            ? `
                                        <div style="display: flex; gap: 0.3rem;">
                                            ${
                                                sessionIndex > 0
                                                    ? `
                                                <button onclick="TVMode.navigateSession('${dateKey}', ${sessionIndex - 1})"
                                                        style="padding: 0.4rem 0.6rem; font-size: 0.75rem; background: rgba(10, 10, 10, 0.06); border: 1px solid rgba(10, 10, 10, 0.12); border-radius: 6px; cursor: pointer; transition: all 0.2s; color: rgba(10, 10, 10, 0.8);"
                                                        onmouseover="this.style.background='rgba(10, 10, 10, 0.1)'"
                                                        onmouseout="this.style.background='rgba(10, 10, 10, 0.06)'">
                                                    <i class="fas fa-chevron-left"></i>
                                                </button>
                                            `
                                                    : ''
                                            }
                                            ${
                                                sessionIndex < allSessions.length - 1
                                                    ? `
                                                <button onclick="TVMode.navigateSession('${dateKey}', ${sessionIndex + 1})"
                                                        style="padding: 0.4rem 0.6rem; font-size: 0.75rem; background: rgba(10, 10, 10, 0.06); border: 1px solid rgba(10, 10, 10, 0.12); border-radius: 6px; cursor: pointer; transition: all 0.2s; color: rgba(10, 10, 10, 0.8);"
                                                        onmouseover="this.style.background='rgba(10, 10, 10, 0.1)'"
                                                        onmouseout="this.style.background='rgba(10, 10, 10, 0.06)'">
                                                    <i class="fas fa-chevron-right"></i>
                                                </button>
                                            `
                                                    : ''
                                            }
                                        </div>
                                    `
                                            : ''
                                    }

                                    <!-- Bouton Quitter -->
                                    <button onclick="TVMode.exitTVMode()"
                                            style="padding: 0.4rem 0.8rem; font-size: 0.75rem; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; cursor: pointer; transition: all 0.2s; color: rgba(239, 68, 68, 0.9); font-weight: 600; display: flex; align-items: center; gap: 0.3rem;"
                                            onmouseover="this.style.background='rgba(239, 68, 68, 0.2)'"
                                            onmouseout="this.style.background='rgba(239, 68, 68, 0.1)'">
                                        <i class="fas fa-times"></i>
                                        <span>QUITTER</span>
                                    </button>
                                </div> <!-- Fin tv-header-right -->
                        </div> <!-- Fin tv-header-content -->
                    </div> <!-- Fin tv-header -->

                    <!-- Contenu des blocs avec design moderne -->
                    <div id="tvContentArea" class="tv-content-area" style="display: flex; flex-direction: row; padding: ${contentPadding}; gap: ${contentGap};">
                        <!-- Zone de contenu (blocs ou tirage) -->
                        <div id="tvBlocksContainer" class="tv-blocks-container" style="display: flex; flex-direction: row; gap: ${contentGap};">
                            ${blocksHTML}
                        </div>
                    </div>
                </div>
                </div><!-- Fin tv-safe-area -->
            </div>

            <style>
                /* Import de la font Inter */
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');

                /* FORCER la couleur du texte dans les blocs pour écraser le CSS global */
                .tv-block-content p,
                .tv-block-content span,
                .tv-block-content div {
                    color: ${this.textColor} !important;
                }
            </style>
        `;

        // Démarrer l'horloge
        this.startClock();

        // ✅ AUTO-SIZE INTELLIGENT: Ajuster automatiquement la taille des textes
        setTimeout(() => {
            this.smartAutoSize();
        }, 100);

        // Gérer les raccourcis clavier
        document.addEventListener('keydown', e => {
            // Ajuster zoom global avec Ctrl + molette ou touches (incréments de 0.05)
            if ((e.key === '+' || e.key === '=') && e.ctrlKey) {
                e.preventDefault();
                this.setGlobalScale(this.globalScale + 0.05);
            }
            if (e.key === '-' && e.ctrlKey) {
                e.preventDefault();
                this.setGlobalScale(this.globalScale - 0.05);
            }
            // Raccourcis pour zoom rapide (Ctrl+0 = reset à 100%)
            if (e.key === '0' && e.ctrlKey) {
                e.preventDefault();
                this.setGlobalScale(1.0);
            }
            if (e.key === '1' && e.ctrlKey) {
                e.preventDefault();
                this.setGlobalScale(0.5);
            }
            if (e.key === '2' && e.ctrlKey) {
                e.preventDefault();
                this.setGlobalScale(2.0);
            }
            // Ajuster taille du texte - DÉSACTIVÉ car affecte tous les blocs
            // Utiliser les boutons +/- sur chaque bloc individuellement
            // if ((e.key === '+' || e.key === '=') && !e.ctrlKey) {
            //     this.adjustBlockTextSize(0.5);
            // }
            // if (e.key === '-' && !e.ctrlKey) {
            //     this.adjustBlockTextSize(-0.5);
            // }
            // Ajuster taille de l'horloge
            if (e.key === 'ArrowUp') {
                this.adjustClockSize(0.5);
            }
            if (e.key === 'ArrowDown') {
                this.adjustClockSize(-0.5);
            }
            // Navigation
            if (e.key === 'ArrowLeft' && sessionIndex > 0) {
                this.navigateSession(dateKey, sessionIndex - 1);
            }
            if (e.key === 'ArrowRight' && allSessions && sessionIndex < allSessions.length - 1) {
                this.navigateSession(dateKey, sessionIndex + 1);
            }
            // Quitter
            if (e.key === 'Escape') {
                this.exitTVMode();
            }
        });

        // Gérer la molette de la souris pour le zoom (incréments de 0.05)
        document.addEventListener(
            'wheel',
            e => {
                if (e.ctrlKey) {
                    e.preventDefault();
                    const delta = e.deltaY > 0 ? -0.05 : 0.05;
                    this.setGlobalScale(this.globalScale + delta);
                }
            },
            { passive: false }
        );

        // Gérer les changements d'orientation et de taille d'écran avec smart auto-size
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                console.log('📱 Redimensionnement détecté - recalcul smart auto-size');
                this.smartAutoSize();
            }, 300);
        });

        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                console.log("🔄 Changement d'orientation détecté - recalcul smart auto-size");
                this.smartAutoSize();
            }, 500);
        });

        // ✅ IMPORTANT: S'assurer que TVMode est accessible globalement
        console.log('🔍 Vérification de window.TVMode:', typeof window.TVMode);
        window.TVMode = this; // Forcer l'exposition globale
        console.log('✅ window.TVMode exposé:', window.TVMode);

        // Test des fonctions
        console.log('🧪 Test des fonctions:');
        console.log('  - adjustBlockTextSize:', typeof this.adjustBlockTextSize);
        console.log('  - adjustBlockWidth:', typeof this.adjustBlockWidth);
        console.log('  - toggleBlockVisibility:', typeof this.toggleBlockVisibility);
        console.log('  - adjustClockSize:', typeof this.adjustClockSize);
        console.log('  - adjustTitleSize:', typeof this.adjustTitleSize);
    },

    // Configuration de la délégation d'événements globale (méthode vide pour compatibilité future)
    setupGlobalEventDelegation() {
        // Les onclick inline devraient fonctionner directement car TVMode est exposé globalement
        // Cette méthode est réservée pour d'éventuelles améliorations futures
        console.log('✅ Event delegation configurée (mode inline onclick)');
    },

    // Quitter le mode TV et FERMER COMPLÈTEMENT l'onglet
    exitTVMode() {
        console.log("🚪 Fermeture de l'onglet...");

        // Essayer toutes les méthodes pour fermer l'onglet
        try {
            // Méthode 1: window.close()
            window.close();

            // Méthode 2: Si window.close() est bloqué, utiliser window.open("", "_self", "");
            setTimeout(() => {
                if (!window.closed) {
                    window.open('', '_self');
                    window.close();
                }
            }, 50);

            // Méthode 3: En dernier recours, vider la page
            setTimeout(() => {
                if (!window.closed) {
                    document.body.innerHTML = `
                        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; flex-direction: column; font-family: Inter, sans-serif; background: #f8fafc;">
                            <i class="fas fa-check-circle" style="font-size: 4rem; color: #22c55e; margin-bottom: 1rem;"></i>
                            <h1 style="font-size: 2rem; color: #1f2937; margin-bottom: 0.5rem;">Mode TV fermé</h1>
                            <p style="font-size: 1.2rem; color: #64748b;">Vous pouvez fermer cet onglet manuellement</p>
                        </div>
                    `;
                }
            }, 100);
        } catch (e) {
            console.error('Erreur lors de la fermeture:', e);
            document.body.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100vh; flex-direction: column; font-family: Inter, sans-serif; background: #f8fafc;">
                    <i class="fas fa-check-circle" style="font-size: 4rem; color: #22c55e; margin-bottom: 1rem;"></i>
                    <h1 style="font-size: 2rem; color: #1f2937; margin-bottom: 0.5rem;">Mode TV fermé</h1>
                    <p style="font-size: 1.2rem; color: #64748b;">Vous pouvez fermer cet onglet manuellement</p>
                </div>
            `;
        }
    },

    // Changer la couleur du texte en direct
    changeTextColor(color) {
        console.log('🎨 Changement de couleur du texte:', color);

        // Sauvegarder la préférence
        localStorage.setItem('tvTextColor', color);
        this.textColor = color;

        // Appliquer à tous les textes avec !important pour écraser le CSS global
        // Titre de la séance
        const title = document.querySelector('.tv-title');
        if (title) {
            title.style.setProperty('color', color, 'important');
        }

        // Date
        const dateElements = document.querySelectorAll('p[style*="font-weight: 600"]');
        dateElements.forEach(el => {
            if (el.textContent.match(/\d{1,2}\/\d{1,2}\/\d{4}/)) {
                el.style.setProperty('color', color, 'important');
            }
        });

        // Catégorie
        const categorySpan = document.querySelector('span[style*="text-transform: uppercase"]');
        if (categorySpan) {
            categorySpan.style.setProperty('color', color, 'important');
        }

        // Horloge
        const clock = document.getElementById('tvClock');
        if (clock) {
            clock.style.setProperty('color', color, 'important');
        }

        // Titres des blocs
        const blockTitles = document.querySelectorAll('h3[style*="text-transform: uppercase"]');
        blockTitles.forEach(h3 => h3.style.setProperty('color', color, 'important'));

        // Contenu des blocs - TOUS les p, span, div dans les blocs
        const blockContents = document.querySelectorAll('.tv-block-content');
        blockContents.forEach(content => {
            content.style.setProperty('color', color, 'important');
            // Appliquer aussi à tous les enfants p, span, div
            const children = content.querySelectorAll('p, span, div');
            children.forEach(child => child.style.setProperty('color', color, 'important'));
        });
    },

    // Ajuster la taille de l'horloge
    adjustClockSize(delta) {
        console.log(`🕐 adjustClockSize appelé: delta=${delta}, taille actuelle=${this.clockSize}`);

        // Initialiser si nécessaire (taille de base)
        if (!this.clockSize || this.clockSize === undefined) {
            this.clockSize = 3.5; // Taille de base en rem
        }

        // Ajuster la taille
        this.clockSize += delta;

        // Limiter entre 2 et 10 rem (pour permettre de grossir suffisamment)
        if (this.clockSize < 2) {
            this.clockSize = 2;
        }
        if (this.clockSize > 10) {
            this.clockSize = 10;
        }

        const clock = document.getElementById('tvClock');
        if (clock) {
            // Appliquer la taille avec le facteur 1.2x
            const finalSize = this.clockSize * 1.2;
            clock.style.fontSize = `${finalSize}rem`;
            console.log(`✅ Horloge ajustée: ${this.clockSize}rem (affiché: ${finalSize}rem)`);
        } else {
            console.error('❌ Élément #tvClock non trouvé');
        }

        // Sauvegarder la préférence
        this.savePreferences();
    },

    // ✅ SMART AUTO-SIZE: Ajuster intelligemment la taille des textes selon la résolution
    smartAutoSize() {
        console.log('🎨 Smart Auto-Size: Ajustement intelligent des textes pour TV 1080p...');

        const styles = this.getBaseStyles();
        const { is1080p, is4K, isMobile } = styles;

        // Trouver tous les blocs
        const allBlocks = document.querySelectorAll('.tv-block[data-block-id]');

        if (allBlocks.length === 0) {
            console.warn('⚠️ Aucun bloc trouvé pour smart auto-size');
            return;
        }

        // Variables d'optimisation spécifiques 1080p
        const lineHeight = 1.5; // Line-height CSS
        const pixelSize = 16; // 1rem = 16px

        // Coefficients d'ajustement selon la résolution
        let resolutionCoefficient = 0.65; // Défaut
        let minSize = 1.0; // Taille minimale en rem
        let maxSize = 3.5; // Taille maximale en rem

        if (is1080p) {
            // OPTIMISATION SPÉCIALE 1080p (1920x1080)
            resolutionCoefficient = 0.75; // Plus grand pour 1080p
            minSize = 1.2; // Minimum lisible à distance TV
            maxSize = 3.0; // Maximum pour éviter texte trop gros
            console.log('📺 Mode 1080p détecté - Optimisation TV activée');
        } else if (is4K) {
            // 4K (3840x2160+)
            resolutionCoefficient = 0.85;
            minSize = 1.4;
            maxSize = 4.0;
            console.log('📺 Mode 4K détecté');
        } else if (isMobile) {
            // Mobile/Tablette
            resolutionCoefficient = 0.6;
            minSize = 0.9;
            maxSize = 2.5;
            console.log('📱 Mode Mobile détecté');
        }

        allBlocks.forEach(block => {
            const blockId = block.getAttribute('data-block-id');
            const blockContent = block.querySelector('.tv-block-content');
            const blockTitle = block.querySelector('.tv-block-title');

            if (!blockContent || !blockId) {
                return;
            }

            // Calculer la hauteur réellement disponible
            const blockHeight = block.clientHeight;
            const titleHeight = blockTitle ? blockTitle.offsetHeight : 0;

            // Mesurer les paddings réels
            const blockStyles = window.getComputedStyle(block);
            const paddingTop = parseFloat(blockStyles.paddingTop) || 0;
            const paddingBottom = parseFloat(blockStyles.paddingBottom) || 0;

            // Marge interne pour le séparateur + espacement
            const internalSpacing = 30;

            const totalPadding = paddingTop + paddingBottom + internalSpacing;
            const availableHeight = blockHeight - titleHeight - totalPadding;

            // Compter les lignes de contenu
            const lines = blockContent.querySelectorAll(
                '.tv-block-content-line, .tv-block-content-line-indent'
            );
            const lineCount = lines.length || 1;

            // FORMULE OPTIMISÉE POUR 1080p:
            // optimalSize = (hauteurDisponible / (nbLignes × lineHeight)) / pixelSize × coefficient
            let optimalSize = availableHeight / (lineCount * lineHeight) / pixelSize;

            // Appliquer le coefficient de résolution
            optimalSize *= resolutionCoefficient;

            // Ajustement dynamique selon le nombre de lignes
            if (lineCount <= 3) {
                // Peu de contenu - on peut augmenter
                optimalSize *= 1.1;
            } else if (lineCount > 15) {
                // Beaucoup de contenu - on réduit légèrement
                optimalSize *= 0.9;
            }

            // Limiter selon les bornes définies pour la résolution
            optimalSize = Math.max(minSize, Math.min(maxSize, optimalSize));

            // Vérification anti-débordement
            blockContent.style.fontSize = `${optimalSize}rem`;
            blockContent.offsetHeight; // Force reflow

            const contentScrollHeight = blockContent.scrollHeight;
            const contentClientHeight = availableHeight;

            // Si le contenu déborde, réduire progressivement
            let iterations = 0;
            while (
                contentScrollHeight > contentClientHeight &&
                optimalSize > minSize &&
                iterations < 10
            ) {
                optimalSize *= 0.95; // Réduction de 5%
                blockContent.style.fontSize = `${optimalSize}rem`;
                blockContent.offsetHeight; // Force reflow
                iterations++;
            }

            // Appliquer la taille finale
            this.blockSizes[blockId] = optimalSize;
            blockContent.style.fontSize = `${optimalSize}rem`;

            const fillRatio = ((contentScrollHeight / contentClientHeight) * 100).toFixed(1);
            const status = contentScrollHeight <= contentClientHeight ? '✅' : '⚠️';

            console.log(
                `${status} Bloc ${blockId}: ${optimalSize.toFixed(2)}rem | ${lineCount} lignes | Remplissage: ${fillRatio}% (${contentScrollHeight}px/${contentClientHeight}px)`
            );
        });

        console.log(
            `✅ ${allBlocks.length} blocs optimisés pour ${is1080p ? '1080p' : is4K ? '4K' : 'écran standard'} !`
        );
    },

    // Ajuster la taille du texte d'un bloc spécifique
    adjustBlockTextSize(blockId, delta) {
        // Initialiser la taille du bloc si elle n'existe pas (1.3rem = taille CSS par défaut)
        if (!this.blockSizes[blockId]) {
            this.blockSizes[blockId] = 1.3;
        }

        // Ajuster la taille
        this.blockSizes[blockId] += delta;

        // Limiter la taille (min 0.5rem, max 5rem)
        if (this.blockSizes[blockId] < 0.5) {
            this.blockSizes[blockId] = 0.5;
        }
        if (this.blockSizes[blockId] > 5) {
            this.blockSizes[blockId] = 5;
        }

        // Appliquer la nouvelle taille au bloc spécifique
        const blockContent = document.querySelector(
            `[data-block-id="${blockId}"] .tv-block-content`
        );
        if (blockContent) {
            blockContent.style.fontSize = `${this.blockSizes[blockId]}rem`;
        }

        // Mettre à jour l'affichage de la taille pour ce bloc
        const sizeDisplay = document.querySelector(`[data-size-display-${blockId}]`);
        if (sizeDisplay) {
            sizeDisplay.textContent = `${this.blockSizes[blockId].toFixed(1)}`;
        }

        // Sauvegarder
        this.savePreferences();
    },

    // NOUVEAU: Détection automatique de la taille optimale pour éviter le scroll
    autoDetectBlockTextSize(blockId) {
        console.log(`\n🔧 === AUTO-SIZE BLOC ${blockId} ===`);
        const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
        const blockContent = document.querySelector(
            `[data-block-id="${blockId}"] .tv-block-content`
        );

        if (!blockElement || !blockContent) {
            console.error(`❌ Bloc ${blockId} non trouvé pour auto-detect`);
            console.log('blockElement:', blockElement);
            console.log('blockContent:', blockContent);
            return;
        }

        console.log('✅ Éléments trouvés:', { blockElement, blockContent });

        // Obtenir les dimensions disponibles
        const containerHeight = blockElement.clientHeight;
        const titleElement = blockElement.querySelector('.tv-block-title');
        const controlsElement = blockElement.querySelector('.tv-block-controls-unified');
        const separatorElement = blockElement.querySelector('.tv-block-separator');

        const titleHeight = titleElement ? titleElement.offsetHeight : 0;
        const controlsHeight = controlsElement ? controlsElement.offsetHeight : 0;
        const separatorHeight = separatorElement ? separatorElement.offsetHeight : 0;

        // Mesurer RÉELLEMENT le padding du bloc
        const blockStyles = window.getComputedStyle(blockElement);
        const blockPaddingTop = parseFloat(blockStyles.paddingTop) || 0;
        const blockPaddingBottom = parseFloat(blockStyles.paddingBottom) || 0;
        const totalPadding = blockPaddingTop + blockPaddingBottom + 20; // +20 pour les marges internes

        // Hauteur disponible pour le contenu (VRAIE hauteur)
        const availableHeight =
            containerHeight - titleHeight - controlsHeight - separatorHeight - totalPadding;

        // Vérifier si le contenu est vide
        const textContent = blockContent.textContent.trim();
        const lineElements = blockContent.querySelectorAll(
            '.tv-block-content-line, .tv-block-content-line-indent'
        );
        const lineCount = lineElements.length;

        // CALCUL DIRECT: Pas de boucle, calcul mathématique pur
        // Formule: hauteurDisponible = nombreDeLignes × tailleDeLaPolice × lineHeight
        // Donc: tailleDeLaPolice = hauteurDisponible ÷ (nombreDeLignes × lineHeight)

        const lineHeight = 1.5; // Défini dans le CSS
        const pixelSize = 16; // 1rem = 16px

        if (lineCount === 0) {
            console.warn('⚠️ Aucune ligne de contenu trouvée!');
            return;
        }

        // Calcul de la taille optimale en rem
        const optimalSizeRem = availableHeight / (lineCount * lineHeight) / pixelSize;

        // Coefficient optimal pour TV HD 1080p (65% car space-evenly prend de la place)
        const sizeCoefficient = 0.65;
        const screenHeight = window.innerHeight;

        // Limiter entre 0.8 et 50rem
        const currentSize = Math.max(0.8, Math.min(50, optimalSizeRem * sizeCoefficient));

        console.log(`📏 Bloc ${blockId}:
  Container: ${containerHeight}px
  - Titre: ${titleHeight}px
  - Contrôles: ${controlsHeight}px
  - Séparateur: ${separatorHeight}px
  - Padding: ${totalPadding}px
  = Dispo: ${availableHeight}px
  📝 Contenu: ${lineCount} lignes, ${textContent.length} caractères

🧮 CALCUL DIRECT:
  Formule: ${availableHeight}px ÷ (${lineCount} lignes × ${lineHeight} line-height) ÷ ${pixelSize}px/rem
  = ${optimalSizeRem.toFixed(2)}rem optimal
  🖥️ Résolution: ${screenHeight}p → coefficient ${(sizeCoefficient * 100).toFixed(0)}%
  → ${currentSize.toFixed(2)}rem appliqué`);

        // Sauvegarder et appliquer
        this.blockSizes[blockId] = currentSize;
        blockContent.style.fontSize = `${currentSize}rem`;

        // Vérification finale
        blockContent.offsetHeight; // Force reflow
        const finalScrollHeight = blockContent.scrollHeight;
        const fits = finalScrollHeight <= availableHeight;
        const fillRatio = ((finalScrollHeight / availableHeight) * 100).toFixed(1);

        const overflowAmount = finalScrollHeight - availableHeight;
        console.log(
            `${fits ? '✅' : '⚠️'} Auto-size bloc ${blockId}: ${currentSize.toFixed(2)}rem | Remplissage: ${fillRatio}% (${finalScrollHeight}px / ${availableHeight}px) ${fits ? '✨ Parfait!' : '❌ DÉBORDE de ' + overflowAmount + 'px!'}`
        );

        // NE PAS sauvegarder - l'auto-detect recalcule à chaque chargement
        // this.savePreferences();
    },

    // NOUVEAU: Appliquer l'auto-detect à tous les blocs
    autoDetectAllBlocks() {
        console.log('🔍 Démarrage auto-size pour tous les blocs...');

        // PAS de timeout - calcul immédiat pour que le bouton Auto recalcule correctement
        console.log('⏰ Recherche des blocs...');
        const blocks = document.querySelectorAll('[data-block-id]');
        console.log('🔍 Blocs trouvés:', blocks.length, blocks);

        if (blocks.length === 0) {
            console.error(
                "❌ AUCUN bloc trouvé pour l'auto-size! Le sélecteur [data-block-id] ne trouve rien!"
            );
            console.log('🔍 Debug: body HTML:', document.body.innerHTML.substring(0, 500));
            return;
        }

        console.log(`📊 Lancement auto-size sur ${blocks.length} bloc(s)...`);

        blocks.forEach((block, index) => {
            const blockId = block.getAttribute('data-block-id');
            console.log(`🔍 Bloc ${index + 1}/${blocks.length}: blockId="${blockId}"`);
            if (blockId) {
                // IMPORTANT: Réinitialiser blockSizes pour forcer le recalcul
                this.blockSizes[blockId] = undefined;
                this.autoDetectBlockTextSize(blockId);
            } else {
                console.warn(`⚠️ Bloc ${index + 1} n'a pas de data-block-id!`);
            }
        });

        console.log(`✅ Auto-size terminé pour ${blocks.length} bloc(s)`);
    },

    // Naviguer entre les séances
    navigateSession(dateKey, newSessionIndex) {
        const newUrl = `${window.location.origin}${window.location.pathname}?tv=true&date=${dateKey}&session=${newSessionIndex}`;
        window.location.href = newUrl;
    },

    // Toggle entre l'affichage des blocs et du tirage cardio
    async toggleLotteryDisplay() {
        console.log('🎲 Toggle lottery display - État actuel:', this.showLotteryDraw);
        this.showLotteryDraw = !this.showLotteryDraw;

        const container = document.getElementById('tvBlocksContainer');
        const toggleBtns = document.querySelectorAll('#toggleLotteryBtn');
        const toggleTexts = document.querySelectorAll('#toggleLotteryText');

        console.log('📦 Container:', container);
        console.log('🔘 Boutons trouvés:', toggleBtns.length);

        if (!container) {
            console.error('❌ Container tvBlocksContainer non trouvé !');
            return;
        }

        if (this.showLotteryDraw) {
            console.log('🎲 Activation du tirage cardio...');

            // Charger le tirage actif si pas encore chargé
            if (!this.lotteryDrawData) {
                console.log('📥 Chargement du tirage depuis la base...');
                try {
                    this.lotteryDrawData = await this.loadActiveLotteryDraw();
                    console.log('✅ Tirage chargé:', this.lotteryDrawData);
                } catch (error) {
                    console.error('❌ Erreur chargement tirage:', error);
                    alert('Erreur lors du chargement du tirage: ' + error.message);
                    this.showLotteryDraw = false;
                    return;
                }
            }

            // Afficher le tirage en format compact dans le premier bloc UNIQUEMENT
            if (this.lotteryDrawData) {
                console.log('🎯 Recherche du premier bloc...');
                // Récupérer le premier bloc
                const firstBlock = container.querySelector('[data-session-block-id="session_0"]');
                console.log('📍 Premier bloc trouvé:', firstBlock);

                if (firstBlock) {
                    // Remplacer UNIQUEMENT le contenu du premier bloc
                    const blockContent = firstBlock.querySelector('.tv-block-content');
                    console.log('📄 Block content trouvé:', blockContent);

                    if (blockContent) {
                        console.log('✏️ Remplacement du contenu...');
                        blockContent.innerHTML = this.renderCompactLotteryDraw(
                            this.lotteryDrawData
                        );

                        // Réduire automatiquement la taille du TEXTE de 10 clics (soit -1.0 rem)
                        // Récupérer le blockId du premier bloc
                        const blockId = firstBlock.getAttribute('data-block-id');
                        console.log('🔖 Block ID:', blockId);

                        if (blockId) {
                            if (!this.blockSizes[blockId]) {
                                this.blockSizes[blockId] = 1.0;
                            }
                            // Réduire de 1.0 rem (10 clics de 0.1 chacun)
                            this.blockSizes[blockId] = Math.max(
                                0.3,
                                this.blockSizes[blockId] - 1.0
                            );
                            console.log('📏 Taille du texte réduite à:', this.blockSizes[blockId]);

                            // Appliquer la nouvelle taille du texte
                            blockContent.style.fontSize = `${this.blockSizes[blockId]}rem`;

                            // Mettre à jour l'affichage de la taille
                            const sizeDisplay = document.querySelector(
                                `[data-size-display-${blockId}]`
                            );
                            if (sizeDisplay) {
                                sizeDisplay.textContent = this.blockSizes[blockId].toFixed(1);
                            }
                        }
                    }

                    // Changer le titre du premier bloc
                    const blockTitle = firstBlock.querySelector('h3');
                    if (blockTitle) {
                        console.log('🏷️ Changement du titre...');
                        blockTitle.innerHTML =
                            '<i class="fas fa-random" style="margin-right: 0.5rem;"></i>TIRAGE CARDIO';
                        blockTitle.style.marginBottom = '0.2rem'; // Réduire encore plus l'espace sous le titre
                    }
                }

                // Mettre à jour les boutons
                console.log('🔘 Mise à jour des boutons...');
                toggleTexts.forEach(text => (text.textContent = 'Séance'));
                toggleBtns.forEach(btn => (btn.style.background = '#ef4444'));
                console.log('✅ Tirage affiché avec succès !');
            } else {
                console.warn('⚠️ Aucune donnée de tirage disponible');
                alert('Aucun tirage actif trouvé. Créez un tirage depuis le module Tirage Cardio.');
                this.showLotteryDraw = false;
            }
        } else {
            console.log('🔄 Retour à la séance normale (rechargement)...');
            // Recharger la page pour restaurer les blocs originaux
            location.reload();
        }
    },

    // Charger le tirage actif depuis localStorage
    async loadActiveLotteryDraw() {
        try {
            console.log('📥 Chargement du tirage depuis localStorage...');

            const storedDraw = localStorage.getItem('cardio_active_draw');

            if (!storedDraw) {
                console.warn('⚠️ Aucun tirage trouvé en localStorage');
                return null;
            }

            const drawData = JSON.parse(storedDraw);
            console.log('✅ Tirage chargé depuis localStorage:', drawData);

            return drawData;
        } catch (error) {
            console.error('❌ Erreur lors du chargement du tirage:', error);
            return null;
        }
    },

    // Générer le HTML compact pour afficher le tirage dans le premier bloc
    renderCompactLotteryDraw(drawData) {
        if (!drawData || !drawData.teams) {
            return `
                <div class="flex-col-center" style="padding: 0.5rem;">
                    <i class="fas fa-exclamation-circle" style="font-size: 1.2em; color: #ef4444; display: block; margin-bottom: 0.3rem;"></i>
                    <p style="font-size: 0.9em; color: #64748b; margin: 0;">Aucun tirage actif</p>
                </div>
            `;
        }

        const teams = drawData.teams;

        // Palette de couleurs pour les cardios
        const cardioColors = {
            Run: '#3b82f6', // blue
            Bikerg: '#eab308', // yellow
            Skierg: '#06b6d4', // cyan
            Rameur: '#22c55e', // green
            AssaultBike: '#ef4444' // red
        };

        const cardioIcons = {
            Run: 'fa-running',
            Bikerg: 'fa-biking',
            Skierg: 'fa-skiing',
            Rameur: 'fa-water',
            AssaultBike: 'fa-bolt'
        };

        // Générer une ligne ultra-compacte par cardio
        let compactHTML = '';
        Object.entries(teams).forEach(([cardio, participants]) => {
            const color = cardioColors[cardio] || '#6b7280';
            const icon = cardioIcons[cardio] || 'fa-dumbbell';

            // Format ultra-compact: "Rameur: léa, olivier"
            const participantNames = participants.length > 0 ? participants.join(', ') : '-';

            compactHTML += `
                <div class="tv-lottery-item" style="background: rgba(${this.hexToRgb(color)}, 0.08); border-left-color: ${color};">
                    <span class="tv-lottery-item-label" style="color: ${color};">
                        <i class="fas ${icon} tv-lottery-item-icon"></i>
                        ${cardio}:
                    </span>
                    <span class="tv-lottery-item-value" style="color: ${this.textColor};">
                        ${participantNames}
                    </span>
                </div>
            `;
        });

        return `
            <div class="tv-lottery-compact-wrapper">
                <div class="tv-lottery-compact-content">
                    ${compactHTML}
                </div>
                <div class="tv-lottery-compact-footer">
                    <i class="fas fa-calendar-alt tv-lottery-compact-date-icon"></i>
                    ${new Date(drawData.draw_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </div>
            </div>
        `;
    },

    // Convertir HEX en RGB pour rgba()
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
            : '107, 114, 128'; // gray par défaut
    },

    // ===================================================================
    // TEAMBUILDER - Affichage des équipes dans Mode TV
    // ===================================================================

    // Toggle entre l'affichage des blocs et des équipes TeamBuilder
    async toggleTeamsDisplay() {
        console.log('👥 Toggle teams display - État actuel:', this.showTeamsDraw);
        this.showTeamsDraw = !this.showTeamsDraw;

        const container = document.getElementById('tvBlocksContainer');
        const toggleBtns = document.querySelectorAll('#toggleTeamsBtn');
        const toggleTexts = document.querySelectorAll('#toggleTeamsText');

        if (!container) {
            console.error('❌ Container tvBlocksContainer non trouvé');
            this.showTeamsDraw = false;
            return;
        }

        if (this.showTeamsDraw) {
            console.log('👥 Activation des équipes TeamBuilder...');

            // Charger les équipes si pas encore chargées
            if (!this.teamsDrawData) {
                console.log('📥 Chargement des équipes depuis localStorage...');
                try {
                    this.teamsDrawData = await this.loadActiveTeamsDraw();
                    console.log('✅ Équipes chargées:', this.teamsDrawData);
                } catch (error) {
                    console.error('❌ Erreur chargement équipes:', error);
                    alert('Erreur lors du chargement des équipes: ' + error.message);
                    this.showTeamsDraw = false;
                    return;
                }
            }

            // Afficher les équipes en format compact dans le premier bloc UNIQUEMENT
            if (this.teamsDrawData) {
                console.log('🎯 Recherche du premier bloc...');
                // Récupérer le premier bloc
                const firstBlock = container.querySelector('[data-session-block-id="session_0"]');
                console.log('📍 Premier bloc trouvé:', firstBlock);

                if (firstBlock) {
                    // Remplacer UNIQUEMENT le contenu du premier bloc
                    const blockContent = firstBlock.querySelector('.tv-block-content');
                    console.log('📄 Block content trouvé:', blockContent);

                    if (blockContent) {
                        console.log('✏️ Remplacement du contenu...');
                        blockContent.innerHTML = this.renderCompactTeams(this.teamsDrawData);

                        // Réduire automatiquement la taille du TEXTE de 10 clics (soit -1.0 rem)
                        const blockId = firstBlock.getAttribute('data-block-id');
                        console.log('🔖 Block ID:', blockId);

                        if (blockId) {
                            if (!this.blockSizes[blockId]) {
                                this.blockSizes[blockId] = 1.0;
                            }
                            // Réduire de 1.0 rem (10 clics de 0.1 chacun)
                            this.blockSizes[blockId] = Math.max(
                                0.3,
                                this.blockSizes[blockId] - 1.0
                            );
                            console.log('📏 Taille du texte réduite à:', this.blockSizes[blockId]);

                            // Appliquer la nouvelle taille du texte
                            blockContent.style.fontSize = `${this.blockSizes[blockId]}rem`;

                            // Mettre à jour l'affichage de la taille
                            const sizeDisplay = document.querySelector(
                                `[data-size-display-${blockId}]`
                            );
                            if (sizeDisplay) {
                                sizeDisplay.textContent = this.blockSizes[blockId].toFixed(1);
                            }
                        }
                    }

                    // Changer le titre du premier bloc
                    const blockTitle = firstBlock.querySelector('h3');
                    if (blockTitle) {
                        console.log('🏷️ Changement du titre...');
                        blockTitle.innerHTML =
                            '<i class="fas fa-users" style="margin-right: 0.5rem;"></i>ÉQUIPES';
                        blockTitle.style.marginBottom = '0.2rem';
                    }
                }

                // Mettre à jour les boutons
                console.log('🔘 Mise à jour des boutons...');
                toggleTexts.forEach(text => (text.textContent = 'Séance'));
                toggleBtns.forEach(btn => (btn.style.background = 'rgba(239, 68, 68, 0.1)'));
                console.log('✅ Équipes affichées avec succès !');
            } else {
                console.warn("⚠️ Aucune donnée d'équipes disponible");
                alert('Aucune équipe trouvée. Créez des équipes depuis TeamBuilder Pro.');
                this.showTeamsDraw = false;
            }
        } else {
            console.log('🔄 Retour à la séance normale (rechargement)...');
            // Recharger la page pour restaurer les blocs originaux
            location.reload();
        }
    },

    // Charger les équipes depuis localStorage
    async loadActiveTeamsDraw() {
        try {
            console.log('📥 Chargement des équipes depuis localStorage...');

            const storedTeams = localStorage.getItem('tv_teams_display');

            if (!storedTeams) {
                console.warn('⚠️ Aucune équipe trouvée en localStorage');
                return null;
            }

            const teamsData = JSON.parse(storedTeams);
            console.log('✅ Équipes chargées depuis localStorage:', teamsData);

            return teamsData;
        } catch (error) {
            console.error('❌ Erreur lors du chargement des équipes:', error);
            return null;
        }
    },

    // Générer le HTML compact pour afficher les équipes dans le premier bloc
    renderCompactTeams(teamsData) {
        if (!teamsData || !teamsData.teams || teamsData.teams.length === 0) {
            return `
                <div class="flex-col-center" style="padding: 0.5rem;">
                    <i class="fas fa-exclamation-circle" style="font-size: 1.2em; color: #ef4444; display: block; margin-bottom: 0.3rem;"></i>
                    <p style="font-size: 0.9em; color: #64748b; margin: 0;">Aucune équipe active</p>
                </div>
            `;
        }

        const teams = teamsData.teams;

        // Palette de couleurs pour les équipes
        const teamColors = [
            '#3b82f6', // blue
            '#22c55e', // green
            '#ef4444', // red
            '#f59e0b', // amber
            '#a855f7', // purple
            '#06b6d4', // cyan
            '#ec4899', // pink
            '#84cc16' // lime
        ];

        // Générer une ligne ultra-compacte par équipe
        let compactHTML = '';
        teams.forEach((team, index) => {
            const color = teamColors[index % teamColors.length];
            const teamName = team.name || `Équipe ${index + 1}`;

            // Format ultra-compact: "Équipe 1: léa, olivier, pierre"
            const participantNames =
                team.members && team.members.length > 0
                    ? team.members
                          .map(m => {
                              if (typeof m === 'string') {
                                  return m;
                              }
                              return m.cleanName || m.name || m.originalName || 'Inconnu';
                          })
                          .join(', ')
                    : '-';

            // Afficher les points totaux si disponibles
            const pointsDisplay = team.totalPoints ? ` (${team.totalPoints} pts)` : '';

            compactHTML += `
                <div class="tv-lottery-item" style="background: rgba(${this.hexToRgb(color)}, 0.08); border-left-color: ${color};">
                    <span class="tv-lottery-item-label" style="color: ${color};">
                        <i class="fas fa-users tv-lottery-item-icon"></i>
                        ${teamName}${pointsDisplay}:
                    </span>
                    <span class="tv-lottery-item-value" style="color: ${this.textColor};">
                        ${participantNames}
                    </span>
                </div>
            `;
        });

        return `
            <div class="tv-lottery-compact-wrapper">
                <div class="tv-lottery-compact-content">
                    ${compactHTML}
                </div>
                <div class="tv-lottery-compact-footer">
                    <i class="fas fa-calendar-alt tv-lottery-compact-date-icon"></i>
                    ${new Date(teamsData.timestamp).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </div>
            </div>
        `;
    },

    // Générer le HTML pour afficher le tirage cardio (version complète non utilisée actuellement)
    renderLotteryDraw(drawData) {
        if (!drawData || !drawData.teams) {
            return `
                <div class="tv-empty-block">
                    <i class="fas fa-exclamation-circle tv-empty-icon" style="color: #ef4444;"></i>
                    <p class="tv-empty-text">Aucun tirage actif</p>
                    <p style="font-size: 1.2rem; color: #64748b; margin-top: 0.5rem;">Créez un tirage depuis l'admin</p>
                </div>
            `;
        }

        const teams = drawData.teams;
        const config = drawData.config || {};

        // Palette de couleurs avec bon contraste (fond clair avec texte sombre, bordures vives)
        const cardioStyles = {
            Run: {
                icon: 'fa-running',
                borderColor: '#3b82f6', // blue-500
                iconColor: '#2563eb', // blue-600
                headerBg: '#dbeafe', // blue-100
                headerText: '#1e3a8a', // blue-900
                badgeBg: '#2563eb', // blue-600
                badgeText: '#ffffff', // white
                itemBg: '#eff6ff', // blue-50
                itemText: '#1e3a8a', // blue-900
                itemBorder: '#60a5fa' // blue-400
            },
            Bikerg: {
                icon: 'fa-biking',
                borderColor: '#eab308', // yellow-500
                iconColor: '#ca8a04', // yellow-600
                headerBg: '#fef9c3', // yellow-100
                headerText: '#713f12', // yellow-900
                badgeBg: '#ca8a04', // yellow-600
                badgeText: '#ffffff', // white
                itemBg: '#fefce8', // yellow-50
                itemText: '#713f12', // yellow-900
                itemBorder: '#facc15' // yellow-400
            },
            Skierg: {
                icon: 'fa-skiing',
                borderColor: '#06b6d4', // cyan-500
                iconColor: '#0891b2', // cyan-600
                headerBg: '#cffafe', // cyan-100
                headerText: '#164e63', // cyan-900
                badgeBg: '#0891b2', // cyan-600
                badgeText: '#ffffff', // white
                itemBg: '#ecfeff', // cyan-50
                itemText: '#164e63', // cyan-900
                itemBorder: '#22d3ee' // cyan-400
            },
            Rameur: {
                icon: 'fa-water',
                borderColor: '#22c55e', // green-500
                iconColor: '#16a34a', // green-600
                headerBg: '#dcfce7', // green-100
                headerText: '#14532d', // green-900
                badgeBg: '#16a34a', // green-600
                badgeText: '#ffffff', // white
                itemBg: '#f0fdf4', // green-50
                itemText: '#14532d', // green-900
                itemBorder: '#4ade80' // green-400
            },
            AssaultBike: {
                icon: 'fa-bolt',
                borderColor: '#ef4444', // red-500
                iconColor: '#dc2626', // red-600
                headerBg: '#fee2e2', // red-100
                headerText: '#7f1d1d', // red-900
                badgeBg: '#dc2626', // red-600
                badgeText: '#ffffff', // white
                itemBg: '#fef2f2', // red-50
                itemText: '#7f1d1d', // red-900
                itemBorder: '#f87171' // red-400
            }
        };

        let teamsHTML = '';
        Object.entries(teams).forEach(([cardio, participants]) => {
            const style = cardioStyles[cardio] || {
                icon: 'fa-dumbbell',
                borderColor: '#6b7280',
                iconColor: '#4b5563',
                headerBg: '#f3f4f6',
                headerText: '#1f2937',
                badgeBg: '#4b5563',
                badgeText: '#ffffff',
                itemBg: '#f9fafb',
                itemText: '#1f2937',
                itemBorder: '#9ca3af'
            };

            teamsHTML += `
                <div style="background: #ffffff; border: 3px solid ${style.borderColor}; border-radius: 12px; padding: 1.5rem; flex: 1; min-width: 200px; box-shadow: 0 8px 25px rgba(2, 6, 23, 0.08);">
                    <!-- Header du cardio -->
                    <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 1rem; padding: 0.8rem; background: ${style.headerBg}; border-radius: 8px;">
                        <i class="fas ${style.icon}" style="font-size: 2rem; color: ${style.iconColor};"></i>
                        <h3 style="font-size: 1.8rem; font-weight: 700; color: ${style.headerText}; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
                            ${cardio}
                        </h3>
                    </div>

                    <!-- Liste des participants -->
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        ${
                            participants.length > 0
                                ? participants
                                      .map(
                                          (name, i) => `
                            <div style="background: ${style.itemBg}; padding: 0.8rem 1rem; border-radius: 8px; border-left: 4px solid ${style.itemBorder}; font-size: 1.3rem; font-weight: 600; color: ${style.itemText}; display: flex; align-items: center; gap: 0.5rem;">
                                <span style="background: ${style.badgeBg}; color: ${style.badgeText}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 700;">
                                    ${i + 1}
                                </span>
                                ${name}
                            </div>
                        `
                                      )
                                      .join('')
                                : `
                            <div style="text-align: center; color: #94a3b8; font-size: 1.1rem; padding: 1rem;">
                                <i class="fas fa-user-slash" style="margin-right: 0.5rem;"></i>
                                Aucun participant
                            </div>
                        `
                        }
                    </div>
                </div>
            `;
        });

        return `
            <!-- Titre du tirage -->
            <div style="width: 100%; background: linear-gradient(135deg, #22c55e, #16a34a); border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; box-shadow: 0 8px 25px rgba(34, 197, 94, 0.3); text-align: center;">
                <h2 style="font-size: 2.5rem; font-weight: 700; color: white; margin: 0; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; justify-content: center; gap: 0.8rem;">
                    <i class="fas fa-random"></i>
                    ${drawData.name || 'Tirage Cardio'}
                </h2>
                <p style="font-size: 1.2rem; color: rgba(255, 255, 255, 0.9); margin: 0.5rem 0 0 0; font-weight: 600;">
                    ${new Date(drawData.draw_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>

            <!-- Groupes cardio -->
            <div style="display: flex; gap: 1rem; width: 100%; flex-wrap: wrap;">
                ${teamsHTML}
            </div>
        `;
    },

    // Démarrer l'horloge
    startClock() {
        const updateClock = () => {
            const now = new Date();
            const clock = document.getElementById('tvClock');
            if (clock) {
                clock.textContent = now.toLocaleTimeString('fr-FR');
            }
        };
        updateClock();
        this.clockInterval = setInterval(updateClock, 1000);
    },

    // Ajuster la taille du titre principal
    adjustTitleSize(delta) {
        // S'assurer que titleSize est un nombre
        this.titleSize = parseFloat(this.titleSize || 2.0) + delta;

        // Limiter entre 0.5 et 5 rem
        if (this.titleSize < 0.5) {
            this.titleSize = 0.5;
        }
        if (this.titleSize > 5) {
            this.titleSize = 5;
        }

        const titleElement = document.querySelector('.tv-title');
        if (titleElement) {
            titleElement.style.fontSize = `${this.titleSize}rem`;
        }

        // Mettre à jour l'affichage de la taille
        const sizeDisplay = document.querySelector('[data-title-size-display]');
        if (sizeDisplay) {
            sizeDisplay.textContent = `${this.titleSize.toFixed(1)}`;
        }

        // Sauvegarder la préférence
        this.savePreferences();
    },

    // Ajuster la taille d'un bloc de séance spécifique
    adjustSessionBlockSize(blockId, delta) {
        if (!this.sessionBlockSizes[blockId]) {
            this.sessionBlockSizes[blockId] = 1.0;
        }

        this.sessionBlockSizes[blockId] += delta;

        // Limiter entre 0.3 et 3 rem
        if (this.sessionBlockSizes[blockId] < 0.3) {
            this.sessionBlockSizes[blockId] = 0.3;
        }
        if (this.sessionBlockSizes[blockId] > 3) {
            this.sessionBlockSizes[blockId] = 3;
        }

        const blockElement = document.querySelector(`[data-session-block-id="${blockId}"]`);
        if (blockElement) {
            blockElement.style.fontSize = `${this.sessionBlockSizes[blockId]}rem`;
        }

        // Mettre à jour l'affichage de la taille
        const sizeDisplay = document.querySelector(`[data-session-size-display-${blockId}]`);
        if (sizeDisplay) {
            sizeDisplay.textContent = `${this.sessionBlockSizes[blockId].toFixed(1)}`;
        }

        // Sauvegarder la préférence
        this.savePreferences();
    },

    // Ajuster la largeur d'un bloc (flex-basis)
    adjustBlockWidth(blockId, delta) {
        console.log(`📏 adjustBlockWidth appelé: blockId=${blockId}, delta=${delta}`);

        if (!this.blockWidths[blockId]) {
            this.blockWidths[blockId] = 1;
        }

        this.blockWidths[blockId] += delta;

        // Limiter entre 0.2 (20%) et 5 (500%)
        if (this.blockWidths[blockId] < 0.2) {
            this.blockWidths[blockId] = 0.2;
        }
        if (this.blockWidths[blockId] > 5) {
            this.blockWidths[blockId] = 5;
        }

        const blockElement = document.querySelector(`[data-session-block-id="${blockId}"]`);
        console.log('🔍 Bloc trouvé:', blockElement);
        console.log(`📐 Nouvelle largeur: ${this.blockWidths[blockId]}`);

        if (blockElement) {
            blockElement.style.flex = `${this.blockWidths[blockId]} 1 0%`;
            console.log(`✅ Flex appliqué: ${this.blockWidths[blockId]} 1 0%`);
        } else {
            console.error(`❌ Bloc non trouvé avec data-session-block-id="${blockId}"`);
        }

        // Sauvegarder la préférence
        this.savePreferences();
    },

    // Masquer/afficher un bloc
    toggleBlockVisibility(blockId) {
        console.log(`👁️ toggleBlockVisibility appelé: blockId=${blockId}`);

        // Inverser la visibilité
        this.blockVisibility[blockId] = !this.blockVisibility[blockId];
        const isVisible = this.blockVisibility[blockId];

        const blockElement = document.querySelector(`[data-session-block-id="${blockId}"]`);
        const visibilityBtn = blockElement?.querySelector('.visibility-btn i');

        console.log('🔍 Bloc trouvé:', blockElement);
        console.log(`👁️ Nouvelle visibilité: ${isVisible ? 'Visible' : 'Masqué'}`);

        if (blockElement) {
            if (isVisible) {
                blockElement.style.display = '';
                if (visibilityBtn) {
                    visibilityBtn.className = 'fas fa-eye';
                }
                console.log('✅ Bloc affiché');
            } else {
                blockElement.style.display = 'none';
                if (visibilityBtn) {
                    visibilityBtn.className = 'fas fa-eye-slash';
                }
                console.log('✅ Bloc masqué');
            }
        } else {
            console.error(`❌ Bloc non trouvé avec data-session-block-id="${blockId}"`);
        }

        // Sauvegarder la préférence
        this.savePreferences();
    },

    // Réinitialiser la disposition de tous les blocs
    resetBlocksLayout() {
        console.log('🔄 Réinitialisation de la disposition des blocs...');

        // Réinitialiser toutes les largeurs
        Object.keys(this.blockWidths).forEach(blockId => {
            this.blockWidths[blockId] = 1;
            const blockElement = document.querySelector(`[data-session-block-id="${blockId}"]`);
            if (blockElement) {
                blockElement.style.flex = '1 1 0%';
            }
        });

        // Réafficher tous les blocs
        Object.keys(this.blockVisibility).forEach(blockId => {
            this.blockVisibility[blockId] = true;
            const blockElement = document.querySelector(`[data-session-block-id="${blockId}"]`);
            const visibilityBtn = blockElement?.querySelector('.visibility-btn i');

            if (blockElement) {
                blockElement.style.display = '';
                if (visibilityBtn) {
                    visibilityBtn.className = 'fas fa-eye';
                }
            }
        });

        // Auto-size DÉSACTIVÉ - garde les tailles CSS fixes
        console.log('🔍 Auto-size désactivé - tailles CSS conservées');
        // this.autoDetectAllBlocks(); // DÉSACTIVÉ - cause textes énormes

        // Sauvegarder la préférence
        this.savePreferences();

        console.log('✅ Disposition réinitialisée !');
    },

    // Définir l'échelle globale directement
    setGlobalScale(scale) {
        this.globalScale = Math.max(0.5, Math.min(2.0, scale));
        this.applyGlobalScale();
        this.savePreferences();
    },

    // Appliquer l'échelle globale avec transition fluide
    applyGlobalScale() {
        const mainContainer = document.querySelector('.tv-main-container');
        if (mainContainer) {
            // ❌ SCALE DÉSACTIVÉ - on veut la page à 100% avec juste les marges
            // mainContainer.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            // mainContainer.style.transform = `scale(${this.globalScale})`;
            // mainContainer.style.transformOrigin = 'center center';

            // Ajouter une animation visuelle
            mainContainer.classList.add('zoom-active');
            setTimeout(() => {
                mainContainer.classList.remove('zoom-active');
            }, 300);

            // Retirer la transition après l'animation
            setTimeout(() => {
                mainContainer.style.transition = '';
            }, 300);
        }

        // Mettre à jour l'affichage de l'échelle (sans animation transform)
        const scaleDisplay = document.querySelector('[data-global-scale-display]');
        if (scaleDisplay) {
            // scaleDisplay.style.transform = 'scale(1.1)'; // DÉSACTIVÉ
            scaleDisplay.textContent = `${this.globalScale.toFixed(2)}x`;
            // setTimeout(() => {
            //     scaleDisplay.style.transform = 'scale(1)';
            // }, 150);
        }

        // Mettre à jour la couleur de l'affichage selon le niveau de zoom
        if (scaleDisplay) {
            if (this.globalScale < 0.8) {
                scaleDisplay.style.background = 'rgba(239, 68, 68, 0.1)';
                scaleDisplay.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                scaleDisplay.style.color = '#ef4444';
            } else if (this.globalScale > 1.5) {
                scaleDisplay.style.background = 'rgba(59, 130, 246, 0.1)';
                scaleDisplay.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                scaleDisplay.style.color = '#3b82f6';
            } else {
                scaleDisplay.style.background = 'rgba(34, 197, 94, 0.1)';
                scaleDisplay.style.borderColor = 'rgba(34, 197, 94, 0.2)';
                scaleDisplay.style.color = '#22c55e';
            }
        }
    },

    // Ajuster l'échelle globale (méthode de compatibilité)
    adjustGlobalScale(delta) {
        this.setGlobalScale((this.globalScale || 1) + delta);
    },

    // Sauvegarder les préférences de taille - DÉSACTIVÉ (mode éphémère)
    savePreferences() {
        // ❌ PERSISTANCE DÉSACTIVÉE - Les paramètres ne sont plus sauvegardés
        // Le mode TV repart de zéro à chaque ouverture
        console.log('💾 Sauvegarde désactivée - mode éphémère');
    },

    // Charger les préférences de taille - DÉSACTIVÉ (mode éphémère)
    loadPreferences() {
        // ❌ PERSISTANCE DÉSACTIVÉE - Valeurs par défaut à chaque ouverture
        console.log('📂 Chargement désactivé - valeurs par défaut');

        // Valeurs par défaut uniquement
        this.titleSize = null;
        this.sessionBlockSizes = {};
        this.globalScale = 1.0;
        this.clockSize = 5.0;
        this.safeAreaMargin = '0.5vh';
        this.blockWidths = {};
        this.blockVisibility = {};
        this.textColor = 'rgba(10, 10, 10, 1)'; // NOIR pour fond blanc (match CSS --tv-text-primary)
    },

    // Réinitialiser toutes les tailles
    resetAllSizes() {
        this.titleSize = null;
        this.sessionBlockSizes = {};
        this.globalScale = 1.0; // 100%
        this.clockSize = 6.5;
        this.blockSizes = {};
        this.baseBlockTextSize = 1.0;

        // Supprimer les préférences sauvegardées
        localStorage.removeItem('tvModePreferences');

        // Recharger la page pour appliquer les valeurs par défaut
        location.reload();
    },

    // 🔍 DIAGNOSTIC: Tester tous les boutons du mode TV
    testAllButtons() {
        console.log('🧪 === TEST DE TOUS LES BOUTONS DU MODE TV ===');

        const tests = [
            { name: 'setGlobalScale', fn: () => this.setGlobalScale(1.0) },
            { name: 'adjustTitleSize', fn: () => this.adjustTitleSize(0.1) },
            { name: 'adjustClockSize', fn: () => this.adjustClockSize(0.1) },
            { name: 'changeTextColor', fn: () => this.changeTextColor('#000000') },
            {
                name: 'toggleLotteryDisplay',
                fn: () => console.log('⚠️ toggleLotteryDisplay nécessite async, skip')
            },
            { name: 'resetBlocksLayout', fn: () => this.resetBlocksLayout() },
            { name: 'autoDetectAllBlocks', fn: () => this.autoDetectAllBlocks() },
            { name: 'exitTVMode', fn: () => console.log('⚠️ exitTVMode ferme la fenêtre, skip') },
            { name: 'adjustBlockWidth', fn: () => this.adjustBlockWidth('session_0', 0.1) },
            { name: 'toggleBlockVisibility', fn: () => this.toggleBlockVisibility('session_0') }
        ];

        let passed = 0;
        let failed = 0;

        tests.forEach(test => {
            try {
                test.fn();
                console.log(`✅ ${test.name}: OK`);
                passed++;
            } catch (error) {
                console.error(`❌ ${test.name}: ERREUR -`, error.message);
                failed++;
            }
        });

        console.log(
            `\n📊 Résultat: ${passed} réussis, ${failed} échoués sur ${tests.length} tests`
        );

        // Vérifier que TVMode est bien exposé
        console.log(`\n🔍 window.TVMode existe: ${typeof window.TVMode !== 'undefined'}`);
        console.log(`🔍 window.TVMode === this: ${window.TVMode === this}`);

        return { passed, failed, total: tests.length };
    }

    // =================================================================
    // =================================================================
    // NOTE: L'ancienne fonction showTeamsTV() a été supprimée car incorrecte
    // Les équipes TeamBuilder s'affichent maintenant via toggleTeamsDisplay()
    // dans le 1er bloc séances du Mode TV, comme le Tirage Cardio
    // =================================================================
};

// Exposer TVMode globalement
window.TVMode = TVMode;

// Auto-initialisation SEULEMENT si mode TV détecté dans l'URL
if (typeof window !== 'undefined') {
    // Vérifier d'abord si on est en mode TV
    const urlParams = new URLSearchParams(window.location.search);
    const isTVMode = urlParams.get('tv') === 'true';

    if (isTVMode) {
        console.log('📺 Mode TV détecté dans URL, auto-initialisation...');
        // Attendre que le DOM soit prêt
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                console.log('DOM prêt, init TVMode');
                TVMode.init();
            });
        } else {
            console.log('DOM déjà prêt, init TVMode immédiat');
            TVMode.init();
        }
    } else {
        console.log("❌ Pas en mode TV, TVMode ne s'initialise pas automatiquement");
    }
}
// Exposer globalement
window.TVMode = TVMode;

console.log('✅ Module TVMode chargé');
