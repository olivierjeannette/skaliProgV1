/**
 * DISCORD MORNING COACH - VERSION REFONTE
 * Système automatique d'envoi matinal de Morning Routines diversifiées
 *
 * Fonctionnalités:
 * - Récupère la séance du jour depuis le calendrier
 * - Génère une Morning Routine adaptée et UNIQUE chaque jour via DeepSeek
 * - Protection anti-envoi multiple (1 seul envoi par jour)
 * - Configuration complète et flexible
 * - Envoie sur Discord à l'heure configurée
 */

const DiscordMorningCoach = {
    config: {
        enabled: false,
        sendTime: '07:00', // Heure d'envoi (format HH:MM)
        webhookUrl: '', // URL du webhook Discord
        includeWarmup: true, // Inclure la morning routine
        warmupDuration: 7, // Durée de la routine (5-15 minutes)
        useAI: true, // Utiliser l'IA (DeepSeek)
        aiProvider: 'deepseek', // Uniquement DeepSeek recommandé

        // 🆕 Nouveaux paramètres pour diversité
        routineVariety: 'high', // 'low', 'medium', 'high' - Niveau de diversité
        includeBreathing: true, // Inclure exercices de respiration
        includeMobility: true, // Inclure mobilité articulaire
        includeActivation: true, // Inclure activation musculaire
        difficultyLevel: 'moderate', // 'easy', 'moderate', 'challenging'
        environment: 'bedroom' // 'bedroom', 'anywhere', 'outdoor'
    },

    intervalId: null,
    lastSentDate: null,
    lastSentTimestamp: null, // 🆕 Timestamp exact du dernier envoi
    isInitialized: false,
    sendHistory: [], // 🆕 Historique des envois (max 30 derniers)
    isSending: false, // 🔒 Verrou pour éviter les envois simultanés (race condition)

    /**
     * Initialiser le module
     */
    async init() {
        // ✅ Éviter de réinitialiser plusieurs fois (cause 2 envois!)
        if (this.isInitialized) {
            console.log('⏸️ Morning Coach déjà initialisé, skip');
            return;
        }

        console.log('🌅 Discord Morning Coach - Initialisation...');

        // Charger la config depuis localStorage
        this.loadConfig();

        this.isInitialized = true; // ✅ Marquer comme initialisé

        // Charger le webhook depuis ENV si pas encore configuré
        if (!this.config.webhookUrl && window.ENV) {
            const envWebhook = ENV.get('morningCoachWebhook');
            if (envWebhook) {
                this.config.webhookUrl = envWebhook;
                this.saveConfig();
                console.log('✅ Webhook chargé depuis ENV');
            }
        }

        // Si activé, démarrer le système de vérification
        if (this.config.enabled && this.config.webhookUrl) {
            this.startDailyCheck();
            console.log(`✅ Morning Coach activé pour ${this.config.sendTime}`);
        } else {
            console.log('⏸️ Morning Coach désactivé');
        }
    },

    /**
     * Charger la configuration
     */
    loadConfig() {
        const saved = localStorage.getItem('discordMorningCoachConfig');
        if (saved) {
            this.config = { ...this.config, ...JSON.parse(saved) };
        }

        const lastSent = localStorage.getItem('morningCoachLastSent');
        if (lastSent) {
            this.lastSentDate = lastSent;
        }

        const lastTimestamp = localStorage.getItem('morningCoachLastTimestamp');
        if (lastTimestamp) {
            this.lastSentTimestamp = parseInt(lastTimestamp);
        }

        const history = localStorage.getItem('morningCoachHistory');
        if (history) {
            this.sendHistory = JSON.parse(history);
        }
    },

    /**
     * Sauvegarder la configuration
     */
    saveConfig() {
        localStorage.setItem('discordMorningCoachConfig', JSON.stringify(this.config));
        console.log('💾 Configuration sauvegardée');
    },

    /**
     * Démarrer la vérification quotidienne
     */
    startDailyCheck() {
        // ✅ Protection renforcée : arrêter l'intervalle existant s'il y en a un
        if (this.intervalId) {
            console.log('⚠️ Un intervalle existait déjà, on le stoppe pour éviter les doublons');
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        // Vérifier toutes les minutes
        this.intervalId = setInterval(() => {
            this.checkAndSendDaily();
        }, 60000); // 60 secondes

        console.log('⏰ Vérification quotidienne démarrée (ID:', this.intervalId, ')');

        // Vérifier immédiatement aussi
        this.checkAndSendDaily();
    },

    /**
     * Arrêter la vérification quotidienne
     */
    stopDailyCheck() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('⏸️ Vérification quotidienne arrêtée');
        }
    },

    /**
     * 🆕 Vérifier si on peut envoyer aujourd'hui (protection anti-double envoi)
     */
    canSendToday() {
        const now = new Date();
        const today = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD

        // 1. Vérifier si déjà envoyé aujourd'hui (par date)
        if (this.lastSentDate === today) {
            console.log("⏸️ Déjà envoyé aujourd'hui (protection date)");
            return false;
        }

        // 2. Vérifier si envoyé il y a moins de 20h (protection timestamp)
        if (this.lastSentTimestamp) {
            const hoursSinceLastSend = (Date.now() - this.lastSentTimestamp) / (1000 * 60 * 60);
            if (hoursSinceLastSend < 20) {
                console.log(`⏸️ Envoi il y a ${Math.round(hoursSinceLastSend)}h (min 20h requis)`);
                return false;
            }
        }

        return true;
    },

    /**
     * Vérifier et envoyer si c'est l'heure
     */
    async checkAndSendDaily() {
        if (!this.config.enabled) {
            return;
        }

        // 🔒 Protection contre les envois simultanés (race condition)
        if (this.isSending) {
            console.log('⏸️ Un envoi est déjà en cours, skip');
            return;
        }

        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // Vérifier si c'est l'heure ET qu'on peut envoyer
        if (currentTime === this.config.sendTime && this.canSendToday()) {
            console.log("🌅 C'est l'heure ! Envoi du Morning Coach...");

            // 🔒 Verrouiller pour éviter les envois simultanés
            this.isSending = true;

            try {
                await this.sendDailySession();
                console.log('✅ Morning Coach envoyé avec succès !');
            } catch (error) {
                console.error("❌ Erreur lors de l'envoi du Morning Coach:", error);
                // Ajouter à l'historique même en cas d'erreur
                this.addToHistory({
                    success: false,
                    error: error.message
                });
            } finally {
                // 🔓 Déverrouiller dans tous les cas (succès ou erreur)
                this.isSending = false;
            }
        }
    },

    /**
     * 🆕 Ajouter un envoi à l'historique
     * @param entry
     */
    addToHistory(entry) {
        const now = new Date();
        const historyEntry = {
            date: now.toISOString().split('T')[0],
            time: now.toLocaleTimeString('fr-FR'),
            timestamp: Date.now(),
            ...entry
        };

        this.sendHistory.unshift(historyEntry);
        // Garder seulement les 30 derniers
        this.sendHistory = this.sendHistory.slice(0, 30);
        localStorage.setItem('morningCoachHistory', JSON.stringify(this.sendHistory));
    },

    /**
     * Récupérer la séance du jour
     */
    async getTodaySession() {
        try {
            const today = new Date();
            const dateKey = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

            // Utiliser CalendarManager pour récupérer les séances
            const sessions = await SupabaseManager.getSessions();

            // Filtrer pour aujourd'hui
            const todaySessions = sessions.filter(s => s.date === dateKey);

            if (todaySessions.length === 0) {
                return null; // Pas de séance aujourd'hui
            }

            // Retourner la première séance (ou toutes si plusieurs)
            return todaySessions[0];
        } catch (error) {
            console.error('Erreur récupération séance:', error);
            return null;
        }
    },

    /**
     * 🆕 Analyser la séance avec l'IA et générer le warm-up (AUTO-LOAD KEYS)
     * Essaie automatiquement tous les providers disponibles jusqu'à ce qu'un fonctionne
     * @param session
     */
    async generateWarmup(session) {
        if (!this.config.useAI || !this.config.includeWarmup) {
            return null;
        }

        // 🆕 Attendre que ENV soit initialisé si nécessaire
        if (!ENV.isLoaded) {
            console.log('⏳ Initialisation ENV...');
            await ENV.init();
        }

        // Liste des providers à essayer dans l'ordre
        const providersToTry = [
            this.config.aiProvider, // D'abord le provider configuré
            'deepseek',             // Ensuite DeepSeek (recommandé)
            'openai',               // Puis OpenAI
            'claude'                // Enfin Claude (peut avoir CORS)
        ];

        // Retirer les doublons
        const uniqueProviders = [...new Set(providersToTry)];

        console.log(`🤖 Tentative de génération avec IA...`);
        console.log(`📋 Providers à essayer: ${uniqueProviders.join(', ')}`);

        // Essayer chaque provider
        for (const provider of uniqueProviders) {
            try {
                console.log(`🔄 Essai avec ${provider.toUpperCase()}...`);

                // Récupérer la clé API
                let apiKey = null;
                switch (provider) {
                    case 'deepseek':
                        apiKey = ENV.get('deepseekKey');
                        break;
                    case 'claude':
                        apiKey = ENV.get('claudeKey') || ENV.get('anthropicKey');
                        break;
                    case 'openai':
                        apiKey = ENV.get('openaiKey');
                        break;
                }

                // Si pas de clé, passer au provider suivant
                if (!apiKey) {
                    console.log(`⏭️ ${provider.toUpperCase()}: Pas de clé API configurée, passage au suivant`);
                    continue;
                }

                console.log(`✅ ${provider.toUpperCase()}: Clé trouvée, génération en cours...`);

                // Essayer de générer avec ce provider
                let warmup = null;
                switch (provider) {
                    case 'deepseek':
                        warmup = await this.generateWarmupWithDeepSeek(session, apiKey);
                        break;
                    case 'claude':
                        warmup = await this.generateWarmupWithClaude(session, apiKey);
                        break;
                    case 'openai':
                        warmup = await this.generateWarmupWithOpenAI(session, apiKey);
                        break;
                }

                // Si succès, retourner le warmup
                if (warmup && warmup.exercises && warmup.exercises.length > 0) {
                    console.log(`✅ Succès avec ${provider.toUpperCase()} !`);
                    return warmup;
                }

                console.log(`⚠️ ${provider.toUpperCase()}: Réponse vide ou invalide`);
            } catch (error) {
                console.error(`❌ ${provider.toUpperCase()} a échoué:`, error.message);
                // Continuer avec le provider suivant
            }
        }

        // Si aucune IA n'a fonctionné, retourner null (pas de fallback)
        console.warn('❌ Aucune IA disponible n\'a pu générer le warm-up');
        console.warn('💡 Configurez au moins une clé API (DeepSeek recommandé) dans Menu → Configuration → IA');
        return null; // Pas de fallback générique
    },

    /**
     * Générer le warm-up avec DeepSeek API
     * @param session
     * @param apiKey
     */
    async generateWarmupWithDeepSeek(session, apiKey) {
        try {
            const prompt = this.buildWarmupPrompt(session);

            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1024
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`DeepSeek API Error ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            const warmupText = data.choices[0].message.content;

            console.log('✅ Warm-up généré par DeepSeek');
            return this.parseWarmupResponse(warmupText);
        } catch (error) {
            console.error('Erreur DeepSeek:', error);
            throw error;
        }
    },

    /**
     * Générer le warm-up avec Claude API (via proxy si nécessaire)
     * @param session
     * @param apiKey
     */
    async generateWarmupWithClaude(session, apiKey) {
        try {
            const prompt = this.buildWarmupPrompt(session);

            // Note: Claude API a des problèmes CORS depuis le navigateur
            // Cette fonction tentera quand même, mais pourrait échouer
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 1024,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Claude API Error ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            const warmupText = data.content[0].text;

            console.log('✅ Warm-up généré par Claude');
            return this.parseWarmupResponse(warmupText);
        } catch (error) {
            console.error('Erreur Claude (probablement CORS):', error);
            throw error;
        }
    },

    /**
     * Générer le warm-up avec OpenAI API
     * @param session
     * @param apiKey
     */
    async generateWarmupWithOpenAI(session, apiKey) {
        try {
            const prompt = this.buildWarmupPrompt(session);

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini', // Modèle le moins cher
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1024
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OpenAI API Error ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            const warmupText = data.choices[0].message.content;

            console.log('✅ Warm-up généré par OpenAI');
            return this.parseWarmupResponse(warmupText);
        } catch (error) {
            console.error('Erreur OpenAI:', error);
            throw error;
        }
    },

    /**
     * 🆕 Construire le prompt intelligent pour DeepSeek avec diversité
     * @param session
     */
    buildWarmupPrompt(session) {
        const blocksText = session.blocks
            .map(
                (b, i) =>
                    `${i + 1}. ${b.name}\n   Durée: ${b.duration || 'non spécifié'}\n   Contenu: ${b.content || 'non spécifié'}`
            )
            .join('\n\n');

        // Utiliser la date du jour comme "seed" pour la diversité
        const today = new Date().toISOString().split('T')[0];
        const dayOfYear = Math.floor(
            (new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
        );

        return `Tu es un coach bienveillant qui prépare une routine matinale DOUCE pour des personnes qui viennent de se réveiller.

📋 SÉANCE PRÉVUE AUJOURD'HUI:
Titre: ${session.title}
Catégorie: ${session.category}
Description: ${session.description || 'Non spécifiée'}

Blocs de la séance:
${blocksText}

🎯 TA MISSION:
Crée une routine de réveil de ${this.config.warmupDuration} minutes ULTRA SIMPLE et RÉALISABLE AU LIT ou juste à côté.
Les gens peuvent avoir des courbatures, sont encore endormis, et n'ont AUCUN équipement.

IMPORTANT: La routine doit préparer PROGRESSIVEMENT aux mouvements de la séance du jour.

📝 FORMAT DE RÉPONSE (STRICT):
TITRE: [Un titre simple et doux en 3-4 mots, exemple: "Réveil en douceur" ou "Activation progressive"]

DURÉE: ${this.config.warmupDuration} minutes

EXERCICES:
1. [Nom simple] - [Durée courte]
   [Explication ULTRA claire en 1 phrase simple]

2. [Nom simple] - [Durée courte]
   [Explication ULTRA claire en 1 phrase simple]

[4-5 exercices maximum]

⚠️ RÈGLES STRICTES:
- Durée totale = EXACTEMENT ${this.config.warmupDuration} minutes
- 4 à 5 exercices MAXIMUM (pas plus!)
- Chaque exercice: 1-2 minutes max
- Exercices ULTRA SIMPLES (étirements, rotations, respirations)
- TOUT doit être faisable au lit ou debout juste à côté
- Progression DOUCE: commencer par respiration/étirements, finir par activation légère
- Langage SIMPLE et CHALEUREUX
- Adapter la préparation à la séance du jour (${session.category})

Exemples d'exercices appropriés:
- Étirements doux (bras, jambes, dos)
- Rotations articulaires (chevilles, poignets, épaules)
- Respirations profondes
- Auto-massages légers
- Activation musculaire TRÈS douce

Ne pas mettre de:
- Exercices complexes
- Phrases longues
- Termes techniques
- Conseil final (sera ajouté après)`;
    },

    /**
     * Parser la réponse de l'IA
     * @param text
     */
    parseWarmupResponse(text) {
        try {
            const lines = text.split('\n').filter(l => l.trim());

            const warmup = {
                title: '',
                duration: this.config.warmupDuration,
                exercises: []
            };

            let currentSection = '';
            let currentExercise = null;

            for (const line of lines) {
                const trimmed = line.trim();

                if (trimmed.startsWith('TITRE:')) {
                    warmup.title = trimmed.replace('TITRE:', '').trim();
                } else if (trimmed.startsWith('DURÉE:')) {
                    const match = trimmed.match(/(\d+)/);
                    if (match) {
                        warmup.duration = parseInt(match[1]);
                    }
                } else if (trimmed.startsWith('EXERCICES:')) {
                    currentSection = 'exercises';
                } else if (currentSection === 'exercises') {
                    // Détecter un nouvel exercice (commence par un chiffre)
                    if (/^\d+\./.test(trimmed)) {
                        if (currentExercise) {
                            warmup.exercises.push(currentExercise);
                        }
                        const [titlePart, ...rest] = trimmed.split('-');
                        currentExercise = {
                            name: titlePart.replace(/^\d+\./, '').trim(),
                            duration: rest.join('-').trim(),
                            instructions: ''
                        };
                    } else if (
                        currentExercise &&
                        trimmed.length > 0 &&
                        !trimmed.startsWith('⚠️') &&
                        !trimmed.startsWith('CONSEIL')
                    ) {
                        // Ajouter les instructions (ignorer les sections suivantes)
                        currentExercise.instructions +=
                            (currentExercise.instructions ? ' ' : '') + trimmed;
                    }
                }
            }

            // Ajouter le dernier exercice
            if (currentExercise) {
                warmup.exercises.push(currentExercise);
            }

            return warmup;
        } catch (error) {
            console.error('Erreur parsing warmup:', error);
            return null;
        }
    },

    /**
     * Générer un warm-up basique sans IA (fallback)
     * @param session
     */
    generateBasicWarmup(session) {
        const category = session.category.toLowerCase();

        // Warm-up générique selon la catégorie
        const warmupsByCategory = {
            running: {
                title: 'Réveil du coureur',
                duration: 7,
                exercises: [
                    {
                        name: 'Respirations profondes',
                        duration: '1 min',
                        instructions:
                            'Prends 5 grandes respirations, inspire par le nez, expire par la bouche'
                    },
                    {
                        name: 'Étirements doux des jambes',
                        duration: '2 min',
                        instructions: 'Étire mollets, cuisses et hanches en douceur'
                    },
                    {
                        name: 'Rotations chevilles et genoux',
                        duration: '2 min',
                        instructions: 'Rotations lentes dans les deux sens'
                    },
                    {
                        name: 'Marche sur place',
                        duration: '2 min',
                        instructions: 'Commence doucement puis accélère progressivement'
                    }
                ]
            },
            crosstraining: {
                title: 'Réveil en douceur',
                duration: 7,
                exercises: [
                    {
                        name: 'Respirations au lit',
                        duration: '1 min',
                        instructions: '5 grandes respirations lentes et profondes'
                    },
                    {
                        name: 'Étirements complets',
                        duration: '2 min',
                        instructions: 'Bras, jambes, dos - étire tout comme un chat au réveil'
                    },
                    {
                        name: 'Rotations articulaires',
                        duration: '2 min',
                        instructions: 'Chevilles, poignets, épaules, cou'
                    },
                    {
                        name: 'Squats légers',
                        duration: '2 min',
                        instructions: '10-15 squats très lents et contrôlés'
                    }
                ]
            },
            strength: {
                title: 'Activation progressive',
                duration: 7,
                exercises: [
                    {
                        name: 'Respirations',
                        duration: '1 min',
                        instructions: '5 respirations profondes pour réveiller le corps'
                    },
                    {
                        name: 'Auto-massages doux',
                        duration: '2 min',
                        instructions: 'Masse tes épaules, bras et jambes avec tes mains'
                    },
                    {
                        name: 'Rotations douces',
                        duration: '2 min',
                        instructions: 'Tourne toutes tes articulations lentement'
                    },
                    {
                        name: 'Étirements légers',
                        duration: '2 min',
                        instructions: "Étire les zones qui vont travailler aujourd'hui"
                    }
                ]
            }
        };

        // Retourner le warm-up correspondant ou générique
        return (
            warmupsByCategory[category] || {
                title: 'Réveil en douceur',
                duration: 7,
                exercises: [
                    {
                        name: 'Respirations profondes',
                        duration: '1 min',
                        instructions: 'Prends 5 grandes respirations lentes'
                    },
                    {
                        name: 'Étirements au lit',
                        duration: '2 min',
                        instructions: 'Étire tout ton corps comme un chat'
                    },
                    {
                        name: 'Rotations articulaires',
                        duration: '2 min',
                        instructions: 'Chevilles, genoux, hanches, épaules, cou'
                    },
                    {
                        name: 'Activation légère',
                        duration: '2 min',
                        instructions: 'Bouge doucement sur place pour réveiller le corps'
                    }
                ]
            }
        );
    },

    /**
     * Formater la séance pour Discord (Embed)
     * @param session
     * @param warmup
     */
    formatSessionEmbed(session, warmup) {
        const categoryColors = {
            running: 0x3b82f6, // Bleu
            crosstraining: 0xf59e0b, // Orange
            strength: 0xef4444, // Rouge
            cycling: 0x10b981, // Vert
            swimming: 0x06b6d4, // Cyan
            yoga: 0xa855f7, // Purple
            rest: 0x6b7280 // Gray
        };

        const categoryIcons = {
            running: '🏃‍♂️',
            crosstraining: '💪',
            strength: '🏋️',
            cycling: '🚴',
            swimming: '🏊',
            yoga: '🧘',
            rest: '😴'
        };

        const color = categoryColors[session.category.toLowerCase()] || 0x22c55e;
        const icon = categoryIcons[session.category.toLowerCase()] || '⚡';

        // Construire le message principal
        const embed = {
            title: `${icon} ${session.title}`,
            description: session.description || 'Séance du jour',
            color: color,
            fields: [],
            footer: {
                text: 'Skäli Prog • Bon entraînement ! 💪',
                icon_url: 'https://i.imgur.com/your-logo.png' // TODO: Remplacer par votre logo
            },
            timestamp: new Date().toISOString()
        };

        // Ajouter les blocs de la séance
        if (session.blocks && session.blocks.length > 0) {
            const blocksText = session.blocks
                .map((block, i) => {
                    let text = `**${i + 1}. ${block.name}**`;
                    if (block.duration) {
                        text += ` • ${block.duration}`;
                    }
                    if (block.content) {
                        text += `\n${block.content.substring(0, 150)}${block.content.length > 150 ? '...' : ''}`;
                    }
                    return text;
                })
                .join('\n\n');

            embed.fields.push({
                name: '📋 Programme',
                value: blocksText,
                inline: false
            });
        }

        return embed;
    },

    /**
     * 🆕 Formater le warm-up pour Discord (VERSION REFONTE)
     * @param warmup
     * @param session
     */
    formatWarmupEmbed(warmup, session) {
        if (!warmup) {
            return null;
        }

        const exercisesText = warmup.exercises
            .map((ex, i) => {
                return `**${i + 1}. ${ex.name}** • \`${ex.duration}\`\n${ex.instructions}`;
            })
            .join('\n\n');

        return {
            title: `☀️ ${warmup.title || 'Routine matinale'}`,
            description: `Petit réveil en douceur de **${warmup.duration} minutes** avant la séance du jour 💪`,
            color: 0xffd93d, // Jaune chaleureux
            fields: [
                {
                    name: '🔥 Ta routine',
                    value: exercisesText,
                    inline: false
                },
                {
                    name: '🎯 Séance du jour',
                    value: `**${session.title}** • ${session.category}`,
                    inline: false
                }
            ],
            footer: {
                text: 'Bonne journée, la biz ❤️',
                icon_url: 'https://i.imgur.com/your-logo.png'
            },
            timestamp: new Date().toISOString()
        };
    },

    /**
     * 🆕 Envoyer la morning routine quotidienne (VERSION REFONTE)
     */
    async sendDailySession() {
        try {
            // 1. Récupérer la séance du jour
            const session = await this.getTodaySession();

            if (!session) {
                console.log("📅 Pas de séance programmée aujourd'hui");
                // Ne rien envoyer si pas de séance
                return;
            }

            console.log('📋 Séance trouvée:', session.title);

            // 2. Générer le warm-up avec IA
            let warmup = null;
            if (this.config.includeWarmup) {
                console.log('🤖 Génération de la Morning Routine avec DeepSeek...');
                warmup = await this.generateWarmup(session);
            }

            if (!warmup) {
                console.log('⚠️ Pas de warm-up généré');
                return;
            }

            // 3. Construire le message Discord (UNIQUEMENT le warm-up)
            const embed = this.formatWarmupEmbed(warmup, session);

            // 4. Envoyer sur Discord
            const now = new Date();
            const dayNames = [
                'Dimanche',
                'Lundi',
                'Mardi',
                'Mercredi',
                'Jeudi',
                'Vendredi',
                'Samedi'
            ];
            const dayName = dayNames[now.getDay()];

            const payload = {
                content: `☀️ Salut la team ! C'est parti pour un ${dayName} de feu 🔥`,
                embeds: [embed]
            };

            const response = await fetch(this.config.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Discord API Error: ${response.status}`);
            }

            // 5. ✅ Marquer comme envoyé (protection anti-double)
            this.lastSentDate = now.toISOString().split('T')[0];
            this.lastSentTimestamp = Date.now();
            localStorage.setItem('morningCoachLastSent', this.lastSentDate);
            localStorage.setItem('morningCoachLastTimestamp', this.lastSentTimestamp.toString());

            // 6. Ajouter à l'historique
            this.addToHistory({
                success: true,
                sessionTitle: session.title,
                routineTitle: warmup.title,
                status: 'Envoyé avec succès'
            });

            console.log('✅ Morning Routine envoyée sur Discord avec succès !');
        } catch (error) {
            console.error("❌ Erreur lors de l'envoi:", error);
            throw error;
        }
    },

    // Message de repos retiré - pas de message si pas de séance

    /**
     * Tester l'envoi immédiatement (pour debug)
     */
    async testSend() {
        console.log("🧪 Test d'envoi immédiat...");

        // 🔒 Protection contre les envois simultanés
        if (this.isSending) {
            console.log('⏸️ Un envoi est déjà en cours, skip');
            Utils.showNotification(
                'Envoi en cours',
                'Un envoi est déjà en cours, veuillez patienter',
                'warning'
            );
            return;
        }

        this.isSending = true;

        try {
            await this.sendDailySession();
            Utils.showNotification('Test envoyé !', 'Message envoyé sur Discord', 'success');
        } catch (error) {
            Utils.showNotification('Erreur', error.message, 'error');
        } finally {
            this.isSending = false;
        }
    },

    /**
     * Ouvrir l'interface de configuration
     */
    openConfigModal() {
        const html = `
            <div class="fixed inset-0 modal-backdrop flex items-center justify-center z-50 fade-in-premium" onclick="Utils.closeModal(event)">
                <div class="premium-card max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
                    <!-- Header -->
                    <div class="flex items-center justify-between mb-6">
                        <div>
                            <h3 class="text-3xl font-bold text-green-400 flex items-center gap-3">
                                <i class="fas fa-sun"></i>
                                Discord Morning Coach
                            </h3>
                            <p class="text-gray-400 text-sm mt-1">Notifications matinales automatiques avec IA</p>
                        </div>
                        <button onclick="Utils.closeModal()" class="text-gray-400 hover:text-white transition">
                            <i class="fas fa-times text-2xl"></i>
                        </button>
                    </div>

                    <!-- Configuration -->
                    <div class="space-y-6">
                        <!-- Activation -->
                        <div class="bg-wood-dark bg-opacity-50 rounded-lg p-5 border border-wood-accent border-opacity-30">
                            <label class="flex items-center justify-between cursor-pointer">
                                <div>
                                    <h4 class="text-lg font-bold text-white">Activer le Morning Coach</h4>
                                    <p class="text-sm text-gray-400 mt-1">Envoyer automatiquement la séance chaque matin</p>
                                </div>
                                <div class="relative">
                                    <input type="checkbox" id="morningCoachEnabled" ${this.config.enabled ? 'checked' : ''}
                                           class="sr-only peer">
                                    <div class="w-14 h-7 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                                </div>
                            </label>
                        </div>

                        <!-- Heure d'envoi -->
                        <div class="bg-wood-dark bg-opacity-50 rounded-lg p-5 border border-wood-accent border-opacity-30">
                            <label class="block text-sm font-semibold text-gray-300 mb-3">
                                <i class="fas fa-clock mr-2"></i>
                                Heure d'envoi quotidien
                            </label>
                            <input type="time" id="morningCoachTime" value="${this.config.sendTime}"
                                   class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition">
                            <small class="text-xs text-gray-500 mt-2 block">
                                <i class="fas fa-info-circle mr-1"></i>
                                Le message sera envoyé automatiquement à cette heure chaque jour
                            </small>
                        </div>

                        <!-- Webhook Discord -->
                        <div class="bg-wood-dark bg-opacity-50 rounded-lg p-5 border border-wood-accent border-opacity-30">
                            <label class="block text-sm font-semibold text-gray-300 mb-3">
                                <i class="fab fa-discord mr-2"></i>
                                Webhook URL Discord
                            </label>
                            <input type="text" id="morningCoachWebhook" value="${this.config.webhookUrl}"
                                   placeholder="https://discord.com/api/webhooks/..."
                                   class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition">
                            <small class="text-xs text-gray-500 mt-2 block">
                                <i class="fas fa-info-circle mr-1"></i>
                                Créez un webhook dans les paramètres de votre canal Discord
                            </small>
                        </div>

                        <!-- Options warm-up -->
                        <div class="bg-wood-dark bg-opacity-50 rounded-lg p-5 border border-wood-accent border-opacity-30">
                            <h4 class="text-lg font-bold text-white mb-4">
                                <i class="fas fa-fire mr-2"></i>
                                Mini-séance de réveil (Warm-up)
                            </h4>

                            <div class="space-y-4">
                                <label class="flex items-center justify-between cursor-pointer">
                                    <div>
                                        <span class="text-white font-semibold">Inclure un warm-up</span>
                                        <p class="text-sm text-gray-400 mt-1">Ajouter une séance de réveil adaptée</p>
                                    </div>
                                    <input type="checkbox" id="includeWarmup" ${this.config.includeWarmup ? 'checked' : ''}
                                           class="w-5 h-5 rounded border-wood-accent bg-skali-darker text-green-400 focus:ring-green-400">
                                </label>

                                <div>
                                    <label class="block text-sm font-semibold text-gray-300 mb-2">
                                        Durée du warm-up (minutes)
                                    </label>
                                    <input type="number" id="warmupDuration" value="${this.config.warmupDuration}" min="5" max="15"
                                           class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition">
                                </div>

                                <label class="flex items-center justify-between cursor-pointer">
                                    <div>
                                        <span class="text-white font-semibold">Utiliser l'IA</span>
                                        <p class="text-sm text-gray-400 mt-1">Génération intelligente et adaptée à la séance</p>
                                    </div>
                                    <input type="checkbox" id="useAIWarmup" ${this.config.useAI ? 'checked' : ''}
                                           class="w-5 h-5 rounded border-wood-accent bg-skali-darker text-green-400 focus:ring-green-400">
                                </label>

                                <div>
                                    <label class="block text-sm font-semibold text-gray-300 mb-3">
                                        <i class="fas fa-robot mr-2"></i>
                                        Choix de l'IA
                                    </label>
                                    <div class="grid grid-cols-3 gap-3">
                                        <label class="relative cursor-pointer">
                                            <input type="radio" name="aiProvider" value="deepseek" ${this.config.aiProvider === 'deepseek' ? 'checked' : ''}
                                                   class="peer sr-only">
                                            <div class="p-4 bg-skali-darker border-2 border-wood-accent border-opacity-20 rounded-lg text-center transition
                                                        peer-checked:border-green-400 peer-checked:bg-green-400/10 hover:border-opacity-40">
                                                <div class="text-2xl mb-2">🚀</div>
                                                <div class="font-bold text-sm text-white">DeepSeek</div>
                                                <div class="text-xs text-gray-400 mt-1">Rapide & Économique</div>
                                                <div class="text-xs text-green-400 mt-1">Recommandé</div>
                                            </div>
                                        </label>
                                        <label class="relative cursor-pointer">
                                            <input type="radio" name="aiProvider" value="claude" ${this.config.aiProvider === 'claude' ? 'checked' : ''}
                                                   class="peer sr-only">
                                            <div class="p-4 bg-skali-darker border-2 border-wood-accent border-opacity-20 rounded-lg text-center transition
                                                        peer-checked:border-purple-400 peer-checked:bg-purple-400/10 hover:border-opacity-40">
                                                <div class="text-2xl mb-2">🧠</div>
                                                <div class="font-bold text-sm text-white">Claude</div>
                                                <div class="text-xs text-gray-400 mt-1">Très intelligent</div>
                                                <div class="text-xs text-orange-400 mt-1">CORS issue</div>
                                            </div>
                                        </label>
                                        <label class="relative cursor-pointer">
                                            <input type="radio" name="aiProvider" value="openai" ${this.config.aiProvider === 'openai' ? 'checked' : ''}
                                                   class="peer sr-only">
                                            <div class="p-4 bg-skali-darker border-2 border-wood-accent border-opacity-20 rounded-lg text-center transition
                                                        peer-checked:border-blue-400 peer-checked:bg-blue-400/10 hover:border-opacity-40">
                                                <div class="text-2xl mb-2">🤖</div>
                                                <div class="font-bold text-sm text-white">OpenAI</div>
                                                <div class="text-xs text-gray-400 mt-1">GPT-4o Mini</div>
                                                <div class="text-xs text-blue-400 mt-1">Classique</div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Info API -->
                        <div class="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-600/50 rounded-lg p-4">
                            <div class="flex items-start gap-3">
                                <i class="fas fa-info-circle text-blue-400 text-xl mt-1"></i>
                                <div>
                                    <p class="font-semibold text-blue-300 mb-2">Configuration des clés API</p>
                                    <div class="text-sm text-gray-300 space-y-2">
                                        <div>
                                            <strong>🚀 DeepSeek</strong> (recommandé) : Rapide et économique, pas de problème CORS
                                            <br><span class="text-xs text-gray-400">→ Configurez dans <strong>🔒 Configuration → DeepSeek API Key</strong></span>
                                        </div>
                                        <div>
                                            <strong>🧠 Claude</strong> : Très intelligent mais problème CORS (peut ne pas fonctionner)
                                            <br><span class="text-xs text-gray-400">→ Configurez dans <strong>🔒 Configuration → Claude API Key</strong></span>
                                        </div>
                                        <div>
                                            <strong>🤖 OpenAI</strong> : Classique et fiable (GPT-4o Mini)
                                            <br><span class="text-xs text-gray-400">→ Configurez dans <strong>🔒 Configuration → OpenAI API Key</strong></span>
                                        </div>
                                    </div>
                                    <p class="text-xs text-gray-400 mt-3">
                                        <i class="fas fa-lightbulb mr-1"></i>
                                        Si aucune clé n'est configurée ou si l'API échoue, un warm-up générique pré-défini sera utilisé.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-4 mt-8">
                        <button onclick="DiscordMorningCoach.testSend()"
                                class="flex-1 btn-premium bg-blue-600 hover:bg-blue-700">
                            <i class="fas fa-vial mr-2"></i>
                            Tester maintenant
                        </button>
                        <button onclick="DiscordMorningCoach.saveConfigFromModal()"
                                class="flex-1 btn-premium btn-publish">
                            <i class="fas fa-save mr-2"></i>
                            Enregistrer
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modalContainer').innerHTML = html;
    },

    /**
     * Sauvegarder depuis la modal
     */
    saveConfigFromModal() {
        this.config.enabled = document.getElementById('morningCoachEnabled').checked;
        this.config.sendTime = document.getElementById('morningCoachTime').value;
        this.config.webhookUrl = document.getElementById('morningCoachWebhook').value.trim();
        this.config.includeWarmup = document.getElementById('includeWarmup').checked;
        this.config.warmupDuration = parseInt(document.getElementById('warmupDuration').value);
        this.config.useAI = document.getElementById('useAIWarmup').checked;

        // Récupérer le provider d'IA choisi
        const selectedProvider = document.querySelector('input[name="aiProvider"]:checked');
        if (selectedProvider) {
            this.config.aiProvider = selectedProvider.value;
        }

        this.saveConfig();

        // Redémarrer le système si activé
        if (this.config.enabled && this.config.webhookUrl) {
            this.startDailyCheck();
            Utils.showNotification(
                'Configuration sauvegardée',
                `Morning Coach activé pour ${this.config.sendTime} avec ${this.config.aiProvider.toUpperCase()}`,
                'success'
            );
        } else {
            this.stopDailyCheck();
            Utils.showNotification(
                'Configuration sauvegardée',
                'Morning Coach désactivé',
                'success'
            );
        }

        Utils.closeModal();
    }
};

// Exposer globalement
window.DiscordMorningCoach = DiscordMorningCoach;

// ❌ AUTO-INITIALISATION RETIRÉE POUR ÉVITER DOUBLE ENVOI
// L'initialisation est maintenant gérée uniquement par MorningCoachPage.showView()
// ou par app.js au démarrage si nécessaire
