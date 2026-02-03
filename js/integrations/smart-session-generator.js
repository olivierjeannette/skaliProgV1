/**
 * GÉNÉRATEUR INTELLIGENT DE SÉANCES LA SKÀLI
 * Système complet avec modal, analyse de cohérence, et régénération par bloc
 */

const SmartSessionGenerator = {
    currentSessionData: null,
    generatedSession: null,

    /**
     * Afficher le modal de configuration intelligente
     */
    showSmartModal() {
        const modal = document.createElement('div');
        modal.className = 'smart-session-modal-overlay';
        modal.style.cssText =
            'position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 99999; padding: 2rem; overflow-y: auto;';

        modal.innerHTML = `
            <div style="background: var(--bg-primary, #1a1a2e); border: 2px solid var(--accent-primary, #00d4ff); border-radius: 1.5rem; max-width: 900px; width: 100%; max-height: 95vh; overflow-y: auto; box-shadow: 0 0 60px rgba(0, 212, 255, 0.3);">

                <!-- Header -->
                <div style="background: linear-gradient(135deg, var(--accent-primary, #00d4ff), var(--accent-secondary, #00a8cc)); padding: 2rem; border-radius: 1.5rem 1.5rem 0 0; position: sticky; top: 0; z-index: 100;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h2 style="font-size: 2rem; font-weight: 800; color: #000000; margin: 0 0 0.5rem 0; display: flex; align-items: center;">
                                <i class="fas fa-brain" style="margin-right: 1rem;"></i>
                                Générateur Intelligent La Skàli
                            </h2>
                            <p style="color: #000000; font-size: 0.95rem; margin: 0; font-weight: 600;">
                                Créez la séance parfaite basée sur l'analyse intelligente et la cohérence
                            </p>
                        </div>
                        <button onclick="this.closest('.smart-session-modal-overlay').remove()"
                                style="background: rgba(255,255,255,0.2); border: none; color: #000000; width: 3rem; height: 3rem; border-radius: 0.75rem; font-size: 1.5rem; cursor: pointer; font-weight: 700; transition: all 0.2s;"
                                onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.transform='rotate(90deg)'"
                                onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='rotate(0)'">
                            ×
                        </button>
                    </div>
                </div>

                <!-- Formulaire -->
                <div style="padding: 2rem;">

                    <!-- Section 1: Type de séance -->
                    <div style="background: rgba(0, 212, 255, 0.05); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 1rem; padding: 1.5rem; margin-bottom: 1.5rem;">
                        <h3 style="color: var(--accent-primary, #00d4ff); font-size: 1.25rem; font-weight: 700; margin: 0 0 1.25rem 0; display: flex; align-items: center;">
                            <i class="fas fa-dumbbell" style="margin-right: 0.75rem;"></i>
                            1. Type de séance La Skàli
                        </h3>

                        <label style="display: block; color: var(--text-secondary, #aaa); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
                            Choisissez le type de séance
                        </label>
                        <select id="smartSessionType" onchange="SmartSessionGenerator.onTypeChange(this.value)"
                                style="width: 100%; padding: 1rem; background: var(--glass-bg, #2a2a3e); border: 1px solid var(--glass-border, #444); color: #000000; border-radius: 0.75rem; font-size: 1rem; font-weight: 600; cursor: pointer;">
                            <option value="" style="color: #000000; background: #ffffff;">-- Sélectionnez un type --</option>
                            ${this.getSessionTypeOptions()}
                        </select>

                        <!-- Info type de séance -->
                        <div id="sessionTypeInfo" style="margin-top: 1rem; padding: 1rem; background: rgba(0,0,0,0.3); border-radius: 0.75rem; display: none;">
                            <!-- Sera rempli dynamiquement -->
                        </div>
                    </div>

                    <!-- Section 2: Paramètres de base -->
                    <div style="background: rgba(0, 212, 255, 0.05); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 1rem; padding: 1.5rem; margin-bottom: 1.5rem;">
                        <h3 style="color: var(--accent-primary, #00d4ff); font-size: 1.25rem; font-weight: 700; margin: 0 0 1.25rem 0; display: flex; align-items: center;">
                            <i class="fas fa-sliders-h" style="margin-right: 0.75rem;"></i>
                            2. Paramètres de la séance
                        </h3>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                            <div>
                                <label style="display: block; color: var(--text-secondary, #aaa); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">
                                    Date de la séance
                                </label>
                                <input type="date" id="smartSessionDate" value="${new Date().toISOString().split('T')[0]}"
                                       style="width: 100%; padding: 0.875rem; background: var(--glass-bg, #2a2a3e); border: 1px solid var(--glass-border, #444); color: var(--text-primary, #fff); border-radius: 0.5rem; font-weight: 600;">
                            </div>
                            <div>
                                <label style="display: block; color: var(--text-secondary, #aaa); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">
                                    Niveau ciblé
                                </label>
                                <select id="smartSessionLevel"
                                        style="width: 100%; padding: 0.875rem; background: var(--glass-bg, #2a2a3e); border: 1px solid var(--glass-border, #444); color: var(--text-primary, #fff); border-radius: 0.5rem; font-weight: 600; cursor: pointer;">
                                    <option value="Tous niveaux">Tous niveaux (Mixte)</option>
                                    <option value="Débutant">Débutant</option>
                                    <option value="Intermédiaire">Intermédiaire</option>
                                    <option value="Avancé">Avancé</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style="display: block; color: var(--text-secondary, #aaa); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">
                                Titre de la séance (optionnel)
                            </label>
                            <input type="text" id="smartSessionTitle" placeholder="Ex: BEAST MODE, HYROX PREP 1, etc."
                                   style="width: 100%; padding: 0.875rem; background: var(--glass-bg, #2a2a3e); border: 1px solid var(--glass-border, #444); color: var(--text-primary, #fff); border-radius: 0.5rem; font-weight: 600;">
                        </div>

                        <div style="margin-top: 1rem;">
                            <label style="display: block; color: var(--text-secondary, #aaa); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">
                                Focus spécifique (optionnel)
                            </label>
                            <textarea id="smartSessionFocus" rows="2" placeholder="Ex: Focus sur les jambes, travail du seuil aérobie, technique des stations HYROX..."
                                      style="width: 100%; padding: 0.875rem; background: var(--glass-bg, #2a2a3e); border: 1px solid var(--glass-border, #444); color: var(--text-primary, #fff); border-radius: 0.5rem; font-weight: 600; resize: vertical;"></textarea>
                        </div>

                        <!-- Météo (visible uniquement pour SPÉ RUN & BIKE) -->
                        <div id="weatherSelector" style="margin-top: 1rem; display: none;">
                            <label style="display: block; color: var(--text-secondary, #aaa); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">
                                <i class="fas fa-cloud-sun" style="margin-right: 0.5rem;"></i>
                                Météo / Conditions
                            </label>
                            <select id="smartSessionWeather"
                                    style="width: 100%; padding: 0.875rem; background: var(--glass-bg, #2a2a3e); border: 1px solid var(--glass-border, #444); color: var(--text-primary, #fff); border-radius: 0.5rem; font-weight: 600; cursor: pointer;">
                                <option value="outdoor">🌤️ Outdoor (Extérieur - Course/Vélo dehors)</option>
                                <option value="indoor">🏠 Indoor (Intérieur - Ergomètres)</option>
                            </select>
                            <p style="color: var(--text-secondary, #aaa); font-size: 0.75rem; margin-top: 0.5rem; font-style: italic;">
                                Outdoor: accent sur course extérieure et vélo. Indoor: treadmill, bike erg, assault bike, rowing.
                            </p>
                        </div>
                    </div>

                    <!-- Section 3: Analyse et contraintes -->
                    <div style="background: rgba(0, 212, 255, 0.05); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 1rem; padding: 1.5rem; margin-bottom: 1.5rem;">
                        <h3 style="color: var(--accent-primary, #00d4ff); font-size: 1.25rem; font-weight: 700; margin: 0 0 1.25rem 0; display: flex; align-items: center;">
                            <i class="fas fa-chart-line" style="margin-right: 0.75rem;"></i>
                            3. Analyse intelligente
                        </h3>

                        <div style="margin-bottom: 1rem;">
                            <label style="display: flex; align-items: center; cursor: pointer;">
                                <input type="checkbox" id="smartAnalyzeHistory" checked
                                       style="width: 1.25rem; height: 1.25rem; cursor: pointer; accent-color: var(--accent-primary, #00d4ff); margin-right: 0.75rem;">
                                <span style="color: var(--text-primary, #fff); font-weight: 600;">
                                    Analyser les 2 dernières semaines pour éviter les répétitions
                                </span>
                            </label>
                        </div>

                        <div style="margin-bottom: 1rem;">
                            <label style="display: flex; align-items: center; cursor: pointer;">
                                <input type="checkbox" id="smartCheckInventory" checked
                                       style="width: 1.25rem; height: 1.25rem; cursor: pointer; accent-color: var(--accent-primary, #00d4ff); margin-right: 0.75rem;">
                                <span style="color: var(--text-primary, #fff); font-weight: 600;">
                                    Vérifier l'inventaire et utiliser uniquement l'équipement disponible
                                </span>
                            </label>
                        </div>

                        <div>
                            <label style="display: flex; align-items: center; cursor: pointer;">
                                <input type="checkbox" id="smartUseMethodologies" checked
                                       style="width: 1.25rem; height: 1.25rem; cursor: pointer; accent-color: var(--accent-primary, #00d4ff); margin-right: 0.75rem;">
                                <span style="color: var(--text-primary, #fff); font-weight: 600;">
                                    Utiliser les méthodologies La Skàli (reps, séries, intensités optimales)
                                </span>
                            </label>
                        </div>

                        <!-- Prévisualisation de l'analyse -->
                        <div id="analysisPreview" style="margin-top: 1rem; padding: 1rem; background: rgba(0,0,0,0.3); border-radius: 0.75rem; display: none;">
                            <p style="color: var(--text-secondary, #aaa); font-size: 0.875rem; margin: 0 0 0.5rem 0; font-weight: 600;">
                                <i class="fas fa-spinner fa-spin" style="margin-right: 0.5rem;"></i>
                                Chargement de l'analyse...
                            </p>
                        </div>
                    </div>

                    <!-- Bouton de génération -->
                    <button onclick="SmartSessionGenerator.generateSmartSession()" id="smartGenerateBtn"
                            style="width: 100%; padding: 1.5rem; background: linear-gradient(135deg, #00d4ff, #00a8cc); color: white; font-size: 1.25rem; font-weight: 800; border: none; border-radius: 0.75rem; cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 0 40px rgba(0, 212, 255, 0.4); transition: all 0.3s;"
                            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 0 60px rgba(0, 212, 255, 0.6)'"
                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 0 40px rgba(0, 212, 255, 0.4)'">
                        <i class="fas fa-magic" style="margin-right: 0.75rem;"></i>
                        Générer la séance parfaite
                    </button>

                    <!-- Note sur le proxy -->
                    <p style="text-align: center; color: var(--text-secondary, #aaa); font-size: 0.875rem; margin-top: 1rem; font-weight: 600;">
                        <i class="fas fa-info-circle" style="margin-right: 0.5rem;"></i>
                        Utilise Claude Haiku via proxy (port 3001) ou DeepSeek en fallback
                    </p>

                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Charger une prévisualisation si analyse activée
        this.preloadAnalysis();
    },

    /**
     * Générer les options du select de types de séances
     */
    getSessionTypeOptions() {
        if (!window.LaSkaliSessionTypes) {
            return '<option value="" style="color: #000000; background: #ffffff;">Types de séances non chargés</option>';
        }

        const types = window.LaSkaliSessionTypes.getAllTypes();
        return types
            .map(
                type => `
            <option value="${type.id}" style="color: #000000; background: #ffffff;">${type.name} - ${type.description}</option>
        `
            )
            .join('');
    },

    /**
     * Quand le type de séance change
     * @param typeId
     */
    onTypeChange(typeId) {
        const infoDiv = document.getElementById('sessionTypeInfo');
        if (!typeId || !window.LaSkaliSessionTypes) {
            infoDiv.style.display = 'none';
            return;
        }

        const type = window.LaSkaliSessionTypes.getType(typeId);
        if (!type) {
            infoDiv.style.display = 'none';
            return;
        }

        infoDiv.style.display = 'block';
        infoDiv.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <p style="color: var(--text-secondary, #aaa); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; margin: 0 0 0.5rem 0;">
                        Qualités physiques
                    </p>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                        ${type.qualities
                            .map(
                                q => `
                            <span style="background: rgba(0, 212, 255, 0.2); color: var(--accent-primary, #00d4ff); padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 700;">
                                ${q}
                            </span>
                        `
                            )
                            .join('')}
                    </div>
                </div>
                <div>
                    <p style="color: var(--text-secondary, #aaa); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; margin: 0 0 0.5rem 0;">
                        Groupes musculaires
                    </p>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                        ${type.muscleGroups
                            .map(
                                mg => `
                            <span style="background: rgba(255, 165, 0, 0.2); color: #ffa500; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 700;">
                                ${mg}
                            </span>
                        `
                            )
                            .join('')}
                    </div>
                </div>
            </div>
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1);">
                <p style="color: var(--text-secondary, #aaa); font-size: 0.875rem; margin: 0; font-weight: 600;">
                    <i class="fas fa-clock" style="margin-right: 0.5rem; color: var(--accent-primary, #00d4ff);"></i>
                    Durée: <strong style="color: var(--text-primary, #fff);">${type.duration} minutes</strong>
                    &nbsp;&nbsp;|&nbsp;&nbsp;
                    <i class="fas fa-fire" style="margin-right: 0.5rem; color: #ff6b6b;"></i>
                    Intensité: <strong style="color: var(--text-primary, #fff);">${type.intensity}</strong>
                </p>
            </div>
        `;

        // Afficher/masquer le sélecteur de météo si c'est SPÉ RUN & BIKE
        const weatherSelector = document.getElementById('weatherSelector');
        if (weatherSelector) {
            if (typeId === 'spe_run_bike') {
                weatherSelector.style.display = 'block';
            } else {
                weatherSelector.style.display = 'none';
            }
        }
    },

    /**
     * Précharger l'analyse
     */
    async preloadAnalysis() {
        const previewDiv = document.getElementById('analysisPreview');
        if (!previewDiv) {
            return;
        }

        previewDiv.style.display = 'block';

        try {
            const recentSessions = await this.getRecentSessions(14);
            const sameTypeCount = {}; // Compter par type

            recentSessions.forEach(s => {
                const type = s.session_type || s.category || 'unknown';
                sameTypeCount[type] = (sameTypeCount[type] || 0) + 1;
            });

            previewDiv.innerHTML = `
                <p style="color: var(--text-primary, #fff); font-size: 0.875rem; margin: 0 0 0.75rem 0; font-weight: 700;">
                    <i class="fas fa-check-circle" style="color: #10b981; margin-right: 0.5rem;"></i>
                    ${recentSessions.length} séances analysées sur les 14 derniers jours
                </p>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.5rem;">
                    ${Object.entries(sameTypeCount)
                        .map(
                            ([type, count]) => `
                        <div style="background: rgba(0,0,0,0.4); padding: 0.5rem; border-radius: 0.5rem; text-align: center;">
                            <p style="color: var(--accent-primary, #00d4ff); font-size: 1.25rem; font-weight: 800; margin: 0;">
                                ${count}
                            </p>
                            <p style="color: var(--text-secondary, #aaa); font-size: 0.75rem; margin: 0; text-transform: capitalize;">
                                ${type}
                            </p>
                        </div>
                    `
                        )
                        .join('')}
                </div>
            `;
        } catch (error) {
            console.error('Erreur préchargement analyse:', error);
            previewDiv.innerHTML = `
                <p style="color: #ff6b6b; font-size: 0.875rem; margin: 0; font-weight: 600;">
                    <i class="fas fa-exclamation-triangle" style="margin-right: 0.5rem;"></i>
                    Impossible de charger l'historique
                </p>
            `;
        }
    },

    /**
     * Récupérer les séances récentes
     * @param days
     */
    async getRecentSessions(days = 14) {
        try {
            if (
                !window.SupabaseManager ||
                typeof window.SupabaseManager.getSessions !== 'function'
            ) {
                console.warn('SupabaseManager non disponible');
                return [];
            }

            const allSessions = await window.SupabaseManager.getSessions();
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            return allSessions.filter(s => {
                const sessionDate = new Date(s.date);
                return sessionDate >= cutoffDate;
            });
        } catch (error) {
            console.error('Erreur récupération séances récentes:', error);
            return [];
        }
    },

    /**
     * Générer la séance intelligente
     */
    async generateSmartSession() {
        const btn = document.getElementById('smartGenerateBtn');
        if (!btn) {
            return;
        }

        btn.disabled = true;
        btn.innerHTML =
            '<i class="fas fa-spinner fa-spin" style="margin-right: 0.75rem;"></i>Génération en cours...';

        try {
            // 1. Récupérer les paramètres du formulaire
            const config = {
                sessionType: document.getElementById('smartSessionType')?.value,
                date: document.getElementById('smartSessionDate')?.value,
                level: document.getElementById('smartSessionLevel')?.value,
                title: document.getElementById('smartSessionTitle')?.value,
                focus: document.getElementById('smartSessionFocus')?.value,
                weather: document.getElementById('smartSessionWeather')?.value || 'outdoor', // Météo pour SPÉ RUN & BIKE
                analyzeHistory: document.getElementById('smartAnalyzeHistory')?.checked,
                checkInventory: document.getElementById('smartCheckInventory')?.checked,
                useMethodologies: document.getElementById('smartUseMethodologies')?.checked
            };

            // Validation
            if (!config.sessionType) {
                alert('⚠️ Veuillez sélectionner un type de séance');
                btn.disabled = false;
                btn.innerHTML =
                    '<i class="fas fa-magic" style="margin-right: 0.75rem;"></i>Générer la séance parfaite';
                return;
            }

            // 2. Stocker la configuration
            this.currentSessionData = config;

            // 3. Collecter les données pour la génération
            const generationData = await this.collectGenerationData(config);

            // 4. Générer avec l'IA
            const session = await this.callAIGeneration(config, generationData);

            // 5. Stocker et afficher
            this.generatedSession = session;
            this.displayGeneratedSession(session);
        } catch (error) {
            console.error('❌ Erreur génération:', error);
            alert('❌ Erreur : ' + error.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML =
                '<i class="fas fa-magic" style="margin-right: 0.75rem;"></i>Générer la séance parfaite';
        }
    },

    /**
     * Collecter toutes les données nécessaires à la génération
     * @param config
     */
    async collectGenerationData(config) {
        const data = {
            sessionType: window.LaSkaliSessionTypes?.getType(config.sessionType),
            recentSessions: [],
            sameTypeSessions: [],
            inventory: [],
            movements: [],
            methodologies: []
        };

        // Analyser l'historique si demandé
        if (config.analyzeHistory) {
            console.log("📊 Analyse de l'historique...");
            data.recentSessions = await this.getRecentSessions(14);
            data.sameTypeSessions = data.recentSessions.filter(
                s => (s.session_type || s.category) === config.sessionType
            );
        }

        // Inventaire si demandé
        if (config.checkInventory && window.GymInventoryManager) {
            console.log("🏋️ Chargement de l'inventaire...");
            data.inventory =
                window.GymInventoryManager.state?.equipment?.filter(
                    e => e.is_available && e.quantity > 0
                ) || [];
        }

        // Mouvements (depuis la base de données si disponible)
        if (window.GymInventoryManager) {
            console.log('💪 Chargement des mouvements...');
            data.movements = window.GymInventoryManager.state?.movements || [];
        }

        // Méthodologies si demandé
        if (config.useMethodologies && window.GymInventoryManager) {
            console.log('📋 Chargement des méthodologies...');
            data.methodologies = window.GymInventoryManager.state?.methodologies || [];
        }

        return data;
    },

    /**
     * Appeler l'IA pour la génération
     * @param config
     * @param data
     */
    async callAIGeneration(config, data) {
        const prompt = this.buildIntelligentPrompt(config, data);

        // Essayer proxy Claude d'abord
        const claudeAvailable = await this.checkClaudeProxy();

        if (claudeAvailable) {
            console.log('✨ Génération avec Claude Haiku via proxy...');
            return await this.callClaudeViaProxy(prompt);
        } else {
            console.log('⚠️ Proxy non disponible, utilisation DeepSeek...');
            return await this.callDeepSeekAPI(prompt);
        }
    },

    /**
     * Construire le prompt intelligent
     * @param config
     * @param data
     */
    buildIntelligentPrompt(config, data) {
        const typeInfo = data.sessionType;

        let prompt = `Tu es un coach expert de La Skàli. Génère une séance ${typeInfo.name} parfaite et cohérente.

# TYPE DE SÉANCE: ${typeInfo.name}
${typeInfo.description}

## Qualités physiques à travailler:
${typeInfo.qualities.map(q => `- ${q}`).join('\n')}

## Groupes musculaires ciblés:
${typeInfo.muscleGroups.map(mg => `- ${mg}`).join('\n')}

## Caractéristiques:
${typeInfo.characteristics.map(c => `- ${c}`).join('\n')}

## Paramètres:
- Date: ${config.date}
- Niveau: ${config.level}
- Durée: ${typeInfo.duration} minutes
- Intensité: ${typeInfo.intensity}
${config.title ? `- Titre souhaité: ${config.title}` : ''}
${config.focus ? `- Focus spécifique: ${config.focus}` : ''}

`;

        // Ajouter l'analyse de l'historique
        if (data.sameTypeSessions.length > 0) {
            prompt += `\n# SÉANCES ${typeInfo.name.toUpperCase()} RÉCENTES (À ÉVITER LA RÉPÉTITION):
`;
            data.sameTypeSessions.slice(0, 5).forEach(s => {
                prompt += `\n## ${s.title || 'Sans titre'} (${s.date})
`;
                if (s.blocks) {
                    s.blocks.forEach(b => {
                        prompt += `- ${b.name}: ${b.content?.substring(0, 200)}\n`;
                    });
                }
            });
            prompt += '\n⚠️ IMPORTANT: Crée quelque chose de DIFFÉRENT de ces séances récentes!\n';
        }

        // Ajouter l'inventaire disponible
        if (data.inventory.length > 0) {
            prompt += `\n# ÉQUIPEMENT DISPONIBLE À LA SKÀLI:
${data.inventory
    .slice(0, 30)
    .map(eq => `- ${eq.name} (${eq.quantity} disponibles)`)
    .join('\n')}

⚠️ Utilise UNIQUEMENT cet équipement disponible!
`;
        }

        // Ajouter les méthodologies
        if (data.methodologies.length > 0) {
            prompt += `\n# MÉTHODOLOGIES LA SKÀLI:
${data.methodologies
    .slice(0, 10)
    .map(
        m => `
- ${m.name}: ${m.rep_range_min}-${m.rep_range_max} reps, ${m.sets_min}-${m.sets_max} séries, ${m.rest_seconds_min}-${m.rest_seconds_max}s repos, ${m.intensity_percent_min}-${m.intensity_percent_max}% intensité`
    )
    .join('\n')}
`;
        }

        // Récupérer le template de structure spécifique
        const template = window.LaSkaliSessionTemplates?.getTemplate(config.sessionType);
        let structureInstructions = '';
        let blocksExample = [];

        if (template && template.structure) {
            structureInstructions = `\n# STRUCTURE SPÉCIFIQUE ${typeInfo.name.toUpperCase()}:
${template.structure
    .map(
        (block, idx) => `
${idx + 1}. ${block.name} (${block.duration} min)
   ${block.description}
   Exemple:
   ${block.example}
`
    )
    .join('\n')}

Notes importantes: ${template.notes}
`;

            blocksExample = template.structure.map(block => ({
                name: block.name,
                content: `${block.description}\n\nDurée: ${block.duration} minutes\n\n[Génère le contenu ici selon le type ${typeInfo.name}]`
            }));
        } else {
            // Fallback structure générique si pas de template
            structureInstructions = `\n# STRUCTURE (générique):
1. ÉCHAUFFEMENT (10-15 min)
2. TRAVAIL PRINCIPAL (25-35 min)
3. COOL DOWN (5-10 min)
`;
            blocksExample = [
                { name: 'ÉCHAUFFEMENT', content: '...' },
                { name: 'TRAVAIL PRINCIPAL', content: '...' },
                { name: 'COOL DOWN', content: '...' }
            ];
        }

        // Instructions finales
        prompt += structureInstructions;

        // Ajouter instructions météo si SPÉ RUN & BIKE
        let weatherInstructions = '';
        if (config.sessionType === 'spe_run_bike') {
            if (config.weather === 'outdoor') {
                weatherInstructions = `\n\n🌤️ CONDITIONS MÉTÉO: OUTDOOR (Extérieur)
- PRIORITÉ: Course à pied extérieure (distances réelles: 200m, 400m, 800m, etc.)
- Vélo extérieur si disponible
- Intervalles en nature, Hill Sprints possibles
- Limite l'utilisation des ergomètres (sauf comme alternative/échauffement)
- Exemple: "5 Rounds: 800m Run + 2min Bike @ seuil + 90s repos"`;
            } else {
                weatherInstructions = `\n\n🏠 CONDITIONS MÉTÉO: INDOOR (Intérieur)
- PRIORITÉ: Ergomètres uniquement (Treadmill, Bike Erg, Assault Bike, Row, SkiErg)
- Pas de course extérieure
- Utilise Treadmill pour simulations de course
- Assault Bike, Bike Erg pour le vélo
- Rowing et SkiErg comme alternatives cardio
- Exemple: "EMOM 20: Min 1: 200m Treadmill, Min 2: 15 Cal Bike Erg, Min 3: 12 Cal Row"`;
            }
            prompt += weatherInstructions;
        }

        prompt += `\n# INSTRUCTIONS:
1. Crée une séance COMPLÈTE et COHÉRENTE avec le type ${typeInfo.name}
2. Respecte STRICTEMENT la structure ci-dessus (ne l'invente pas !)
3. Pour BUILD: pas de METCON, seulement échauffement + exercice principal + accessoires + cool down
4. Pour BARBELLS CLUB: pas de METCON, focus force maximale et haltérophilie
5. Pour GYM SKILLS: pas de charges lourdes, uniquement bodyweight et progressions
6. Pour HYROX: stations spécifiques + running intégré
7. Pour TACTICAL: circuits militaires haute intensité
8. Pour POWER: explosivité, olympic lifts, pliométrie
9. Pour SPÉ RUN & BIKE: respecte IMPÉRATIVEMENT les conditions météo ci-dessus (outdoor vs indoor)
10. Respecte les qualités physiques et groupes musculaires du type de séance
11. Évite de répéter les mouvements/formats des séances récentes
12. Utilise uniquement l'équipement disponible
13. Applique les méthodologies La Skàli
14. Pense à la capacité de 12 personnes max

# FORMAT DE SORTIE (JSON STRICT):
{
  "title": "TITRE ACCROCHEUR (style ${typeInfo.name})",
  "blocks": ${JSON.stringify(blocksExample, null, 2)},
  "metadata": {
    "qualities": ["liste des qualités travaillées"],
    "muscleGroups": ["liste des groupes musculaires"],
    "intensity": "${typeInfo.intensity || 'Haute'}",
    "duration": ${typeInfo.duration}
  }
}

⚠️ IMPORTANT: Remplace le contenu "[Génère le contenu ici...]" par du contenu réel et détaillé !
⚠️ RESPECTE la structure exacte du template ${typeInfo.name} !

Génère maintenant la séance en JSON pur (sans markdown, sans backticks).`;

        return prompt;
    },

    /**
     * Vérifier si proxy Claude disponible
     */
    async checkClaudeProxy() {
        try {
            const response = await fetch('http://localhost:3001/health', {
                method: 'GET',
                signal: AbortSignal.timeout(1000)
            });
            if (response.ok) {
                const data = await response.json();
                return data.status === 'ok';
            }
            return false;
        } catch (error) {
            return false;
        }
    },

    /**
     * Appeler Claude via proxy
     * @param prompt
     */
    async callClaudeViaProxy(prompt) {
        const apiUrl = window.ApiConfig ? window.ApiConfig.getApiUrl() : 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 4096
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Proxy Claude: ${error.error || response.statusText}`);
        }

        const data = await response.json();
        const text = data.content[0].text;

        // Parser JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Impossible de parser la réponse de Claude');
        }

        return JSON.parse(jsonMatch[0]);
    },

    /**
     * Appeler DeepSeek
     * @param prompt
     */
    async callDeepSeekAPI(prompt) {
        // 🆕 Récupérer la clé depuis ENV (qui redirige vers APIKeysManager automatiquement)
        const apiKey = ENV.get('deepseekKey');
        if (!apiKey) {
            throw new Error(
                'Clé API DeepSeek non configurée. Allez dans Configuration → Intelligence Artificielle.'
            );
        }

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.5,
                max_tokens: 4096
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`DeepSeek API: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const text = data.choices[0].message.content;

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Impossible de parser la réponse de DeepSeek');
        }

        return JSON.parse(jsonMatch[0]);
    },

    /**
     * Afficher la séance générée
     * @param session
     */
    displayGeneratedSession(session) {
        console.log('✅ Séance générée:', session);

        // Fermer le modal intelligent
        document.querySelector('.smart-session-modal-overlay')?.remove();

        // Attendre un peu pour que le modal se ferme
        setTimeout(() => {
            // Ouvrir le formulaire de création de séance si pas déjà ouvert
            const sessionTitle = document.getElementById('sessionTitle');
            if (!sessionTitle && window.CalendarManager) {
                // Le formulaire n'est pas ouvert, on doit l'ouvrir
                // Trouver la date actuelle ou celle sélectionnée
                const dateKey =
                    this.currentSessionData?.date || new Date().toISOString().split('T')[0];

                // Ouvrir le formulaire de création
                if (typeof window.CalendarManager.showSessionForm === 'function') {
                    window.CalendarManager.showSessionForm(dateKey, 'new');

                    // Attendre que le formulaire soit créé
                    setTimeout(() => {
                        this.fillSessionForm(session);
                    }, 300);
                } else {
                    console.error('CalendarManager.showSessionForm non disponible');
                    alert("Impossible d'ouvrir le formulaire de création de séance");
                }
            } else {
                // Le formulaire est déjà ouvert
                this.fillSessionForm(session);
            }
        }, 100);
    },

    /**
     * Remplir le formulaire de séance
     * @param session
     */
    async fillSessionForm(session) {
        console.log('📝 Remplissage du formulaire avec:', session);

        // Remplir le titre
        const titleInput = document.getElementById('sessionTitle');
        const titleSelect = document.getElementById('sessionTitleSelect');

        if (titleInput) {
            titleInput.value = session.title || '';
            titleInput.style.display = 'block';
        }
        if (titleSelect) {
            titleSelect.value = '__custom__';
        }

        // Vider la liste des blocs
        const blocksList = document.getElementById('blocksList');
        if (!blocksList) {
            console.error('❌ blocksList introuvable !');
            alert("Erreur: Le formulaire n'est pas complètement chargé. Veuillez réessayer.");
            return;
        }

        blocksList.innerHTML = '';

        // Ajouter les blocs UN PAR UN avec délai
        if (session.blocks && session.blocks.length > 0) {
            for (let idx = 0; idx < session.blocks.length; idx++) {
                const block = session.blocks[idx];
                console.log(`➕ Ajout du bloc ${idx + 1}/${session.blocks.length}: ${block.name}`);

                await this.addBlockToForm(block, idx);

                // Petit délai entre chaque bloc pour laisser le DOM se mettre à jour
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            console.log('✅ Tous les blocs ont été ajoutés');
        }

        // Notification
        if (window.Utils?.showNotification) {
            window.Utils.showNotification('✨ Séance générée avec succès !', 'success');
        } else {
            alert('✨ Séance générée avec succès !');
        }
    },

    /**
     * Ajouter un bloc au formulaire
     * @param block
     * @param idx
     */
    async addBlockToForm(block, idx) {
        return new Promise(resolve => {
            const blocksList = document.getElementById('blocksList');
            if (!blocksList) {
                console.error('❌ blocksList non trouvé !');
                resolve();
                return;
            }

            // Compter les blocs AVANT
            const blocksBefore = document.querySelectorAll('.session-block-item').length;
            console.log(`  📊 Blocs avant addBlock: ${blocksBefore}`);

            // Essayer d'utiliser CalendarManager.addBlock
            if (window.CalendarManager && typeof window.CalendarManager.addBlock === 'function') {
                window.CalendarManager.addBlock();

                // Attendre et vérifier si le bloc a été créé
                setTimeout(() => {
                    const blocksAfter = document.querySelectorAll('.session-block-item').length;
                    console.log(`  📊 Blocs après addBlock: ${blocksAfter}`);

                    if (blocksAfter > blocksBefore) {
                        // Le bloc a été créé avec succès
                        const blockItems = document.querySelectorAll('.session-block-item');
                        const currentBlock = blockItems[blockItems.length - 1];

                        if (currentBlock) {
                            const nameInput = currentBlock.querySelector('.session-block-name');
                            const contentTextarea =
                                currentBlock.querySelector('.session-block-content');

                            if (nameInput) {
                                nameInput.value = block.name || '';
                                console.log(`  ✓ Nom: ${block.name}`);
                            }
                            if (contentTextarea) {
                                contentTextarea.value = block.content || '';
                                console.log(`  ✓ Contenu: ${block.content.substring(0, 50)}...`);
                            }

                            // Ajouter bouton de régénération
                            this.addRegenerateButton(currentBlock, idx);
                            resolve();
                            return;
                        }
                    }

                    // Si CalendarManager.addBlock n'a pas fonctionné, créer manuellement
                    console.warn("  ⚠️ addBlock() n'a pas créé de bloc, création manuelle...");
                    this.createBlockManually(blocksList, block, idx);
                    resolve();
                }, 100);
            } else {
                // CalendarManager.addBlock non disponible, créer manuellement
                console.warn('  ⚠️ CalendarManager.addBlock non disponible, création manuelle...');
                this.createBlockManually(blocksList, block, idx);
                resolve();
            }
        });
    },

    /**
     * Créer un bloc manuellement dans le DOM
     * @param blocksList
     * @param block
     * @param idx
     */
    createBlockManually(blocksList, block, idx) {
        const blockHTML = `
            <div class="session-block-item" draggable="true" data-index="${idx}" data-block-index="${idx}">
                <div class="session-block-header">
                    <div class="session-block-drag-handle" title="Déplacer le bloc">
                        <i class="fas fa-grip-vertical"></i>
                    </div>
                    <input type="text"
                           value="${this.escapeHtml(block.name || '')}"
                           placeholder="Nom du bloc"
                           class="session-block-name">
                    <button type="button"
                            onclick="this.closest('.session-block-item').remove()"
                            class="session-block-delete-btn"
                            title="Supprimer le bloc">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <textarea placeholder="Détails du bloc"
                          class="session-block-content">${this.escapeHtml(block.content || '')}</textarea>
            </div>
        `;

        blocksList.insertAdjacentHTML('beforeend', blockHTML);

        // Attendre que le DOM soit mis à jour
        setTimeout(() => {
            const blockItems = document.querySelectorAll('.session-block-item');
            const newBlock = blockItems[blockItems.length - 1];

            console.log(`  🔍 Recherche du bloc créé... Total blocs: ${blockItems.length}`);
            console.log('  🔍 Nouveau bloc trouvé:', newBlock);

            if (newBlock) {
                const header = newBlock.querySelector('.session-block-header');
                console.log('  🔍 Header trouvé:', header);

                this.addRegenerateButton(newBlock, idx);
                console.log(`  ✓ Bloc créé manuellement: ${block.name}`);
            } else {
                console.error('  ❌ Impossible de trouver le bloc nouvellement créé');
            }
        }, 50);
    },

    /**
     * Échapper le HTML pour éviter les problèmes d'injection
     * @param text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Ajouter bouton de régénération sur un bloc
     * @param blockElement
     * @param blockIndex
     */
    addRegenerateButton(blockElement, blockIndex) {
        const header = blockElement.querySelector('.session-block-header');
        if (!header) {
            console.warn('⚠️ Header non trouvé pour le bouton de régénération');
            return;
        }

        // Éviter les doublons
        if (header.querySelector('.regenerate-block-btn')) {
            console.log('  ℹ️ Bouton de régénération déjà présent');
            return;
        }

        const regenBtn = document.createElement('button');
        regenBtn.type = 'button';
        regenBtn.className = 'regenerate-block-btn';
        regenBtn.title = 'Régénérer ce bloc uniquement';
        regenBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Régénérer';
        regenBtn.style.cssText =
            'background: #00d4ff; color: white; border: none; padding: 0.5rem 0.75rem; border-radius: 0.5rem; cursor: pointer; margin-left: 0.5rem; font-size: 0.875rem; transition: all 0.2s; font-weight: 600;';

        regenBtn.onmouseover = () => {
            regenBtn.style.background = '#00a8cc';
            regenBtn.style.transform = 'scale(1.05)';
        };
        regenBtn.onmouseout = () => {
            regenBtn.style.background = '#00d4ff';
            regenBtn.style.transform = 'scale(1)';
        };

        // Binding correct avec self
        const self = this;
        regenBtn.onclick = async function (e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔄 Clic sur régénérer bloc', blockIndex);
            await self.regenerateBlock(blockIndex);
        };

        const deleteBtn = header.querySelector('.session-block-delete-btn');
        if (deleteBtn) {
            header.insertBefore(regenBtn, deleteBtn);
        } else {
            header.appendChild(regenBtn);
        }

        console.log(`  ✓ Bouton de régénération ajouté pour le bloc ${blockIndex}`);
    },

    /**
     * Régénérer un bloc spécifique
     * @param blockIndex
     */
    async regenerateBlock(blockIndex) {
        console.log("🔄 regenerateBlock appelé pour l'index:", blockIndex);
        console.log('📦 generatedSession:', this.generatedSession);

        if (!this.generatedSession) {
            console.error('❌ Aucune séance générée en mémoire');
            alert('⚠️ Aucune séance en cours. Veuillez régénérer toute la séance.');
            return;
        }

        const block = this.generatedSession.blocks[blockIndex];
        console.log('📄 Bloc à régénérer:', block);

        if (!block) {
            console.error("❌ Bloc non trouvé à l'index", blockIndex);
            alert('⚠️ Erreur : Bloc non trouvé');
            return;
        }

        const confirmed = confirm(
            `Régénérer le bloc "${block.name}" ?\n\nLe contenu actuel sera remplacé par une nouvelle version.`
        );
        if (!confirmed) {
            console.log("❌ Régénération annulée par l'utilisateur");
            return;
        }

        console.log('✅ Début de la régénération...');

        try {
            // Construire un prompt spécifique pour ce bloc
            const prompt = `Régénère UNIQUEMENT le bloc "${block.name}" pour cette séance La Skàli.

Contexte de la séance:
- Titre: ${this.generatedSession.title}
- Type: ${this.currentSessionData?.sessionType || 'inconnu'}

Blocs existants de la séance:
${this.generatedSession.blocks.map(b => `- ${b.name}`).join('\n')}

Instructions:
1. Génère un nouveau contenu pour "${block.name}"
2. Garde la cohérence avec les autres blocs
3. Propose quelque chose de DIFFÉRENT du contenu actuel

Contenu actuel à ÉVITER:
${block.content}

Réponds au format JSON:
{
  "name": "${block.name}",
  "content": "nouveau contenu détaillé..."
}
`;

            // Appeler l'IA
            const claudeAvailable = await this.checkClaudeProxy();
            let newBlock;

            if (claudeAvailable) {
                newBlock = await this.callClaudeViaProxy(prompt);
            } else {
                newBlock = await this.callDeepSeekAPI(prompt);
            }

            // Mettre à jour le bloc
            this.generatedSession.blocks[blockIndex] = newBlock;

            // Mettre à jour l'UI
            const blockItems = document.querySelectorAll('.session-block-item');
            const blockElement = blockItems[blockIndex];

            if (blockElement) {
                const contentTextarea = blockElement.querySelector('.session-block-content');
                if (contentTextarea) {
                    contentTextarea.value = newBlock.content || '';
                }
            }

            if (window.Utils?.showNotification) {
                window.Utils.showNotification(`✅ Bloc "${block.name}" régénéré !`, 'success');
            } else {
                alert(`✅ Bloc "${block.name}" régénéré !`);
            }
        } catch (error) {
            console.error('Erreur régénération bloc:', error);
            alert('❌ Erreur : ' + error.message);
        }
    },

    /**
     * Régénérer un bloc depuis le DOM (sans avoir generatedSession en mémoire)
     * Lit TOUS les blocs de la séance pour donner le contexte à l'IA
     * @param buttonElement
     */
    async regenerateBlockFromDOM(buttonElement) {
        console.log('🔄 regenerateBlockFromDOM appelée');

        try {
            // 1. Trouver le bloc parent
            const blockElement = buttonElement.closest('.session-block-item');
            if (!blockElement) {
                throw new Error('Impossible de trouver le bloc parent');
            }

            const blockIndex = Array.from(blockElement.parentElement.children).indexOf(
                blockElement
            );
            console.log(`📍 Bloc à régénérer: index ${blockIndex}`);

            // 2. Lire le titre de la séance
            const sessionTitleInput = document.getElementById('sessionTitle');
            const sessionTitle = sessionTitleInput?.value || 'Séance La Skàli';
            console.log(`📝 Titre de la séance: "${sessionTitle}"`);

            // 3. Lire TOUS les blocs actuels de la séance
            const allBlockElements = document.querySelectorAll('.session-block-item');
            const allBlocks = [];

            allBlockElements.forEach((blockEl, idx) => {
                const nameInput = blockEl.querySelector('.session-block-name');
                const contentTextarea = blockEl.querySelector('.session-block-content');

                allBlocks.push({
                    name: nameInput?.value || `Bloc ${idx + 1}`,
                    content: contentTextarea?.value || '',
                    index: idx
                });
            });

            console.log(
                `📦 ${allBlocks.length} blocs lus:`,
                allBlocks.map(b => b.name)
            );

            // 4. Récupérer le nom et contenu actuel du bloc à régénérer
            const currentBlock = allBlocks[blockIndex];
            if (!currentBlock) {
                throw new Error('Bloc non trouvé dans la liste');
            }

            console.log(`🎯 Bloc à régénérer: "${currentBlock.name}"`);

            // 5. Détecter le type de séance depuis le titre ou les blocs
            let sessionType = this.detectSessionType(sessionTitle, allBlocks);
            console.log(`🏋️ Type de séance détecté: ${sessionType}`);

            // 6. Construire le contexte complet pour l'IA
            const otherBlocks = allBlocks
                .filter((_, idx) => idx !== blockIndex)
                .map(b => `**${b.name}**:\n${b.content || '(vide)'}`)
                .join('\n\n');

            // 7. Construire le prompt pour l'IA
            const typeData = window.LaSkaliSessionTypes?.getType(sessionType);
            let prompt = `Tu es un coach expert de La Skàli, salle de sport fonctionnelle spécialisée en HYROX, CrossFit, et préparation physique.

# CONTEXTE DE LA SÉANCE
Titre: "${sessionTitle}"
Type: ${sessionType.toUpperCase()}
${
    typeData
        ? `
Qualités physiques ciblées: ${typeData.qualities.join(', ')}
Groupes musculaires: ${typeData.muscleGroups.join(', ')}
Intensité: ${typeData.intensity}
`
        : ''
}

# BLOCS ACTUELS DE LA SÉANCE
${otherBlocks}

# TON OBJECTIF
Tu dois régénérer UNIQUEMENT le bloc suivant: **"${currentBlock.name}"**

Contenu actuel du bloc:
${currentBlock.content || '(vide)'}

⚠️ CONSIGNES IMPORTANTES:
1. Crée un contenu DIFFÉRENT de celui actuel
2. Garde une COHÉRENCE avec les autres blocs de la séance
3. Respecte le type de séance (${sessionType.toUpperCase()})
4. Durée totale de la séance: 50 minutes (répartis entre tous les blocs)
5. Pense à 12 personnes maximum dans la salle
6. Format clair: exercices, reps/temps, charges si applicable
7. Si c'est un échauffement: mobilité + activation progressive
8. Si c'est un bloc principal: respecte les qualités physiques du type
9. Utilise uniquement l'équipement standard La Skàli

Génère UNIQUEMENT le nouveau contenu pour le bloc "${currentBlock.name}" (pas de titre de bloc, juste le contenu).`;

            console.log("📤 Envoi du prompt à l'IA...");

            // 8. Afficher un loader
            const contentTextarea = blockElement.querySelector('.session-block-content');
            const originalContent = contentTextarea.value;
            contentTextarea.value =
                "⏳ Régénération en cours...\n\nL'IA analyse tous les blocs de la séance pour créer un contenu cohérent...";
            contentTextarea.disabled = true;

            // 9. Appeler l'IA
            const claudeAvailable = await this.checkClaudeProxy();
            let response;

            if (claudeAvailable) {
                console.log('📡 Utilisation de Claude via proxy...');
                response = await this.callClaudeForTextOnly(prompt);
            } else {
                console.log('📡 Utilisation de DeepSeek...');
                response = await this.callDeepSeekForTextOnly(prompt);
            }

            if (!response || !response.trim()) {
                throw new Error("L'IA n'a pas retourné de contenu");
            }

            console.log("✅ Nouveau contenu reçu de l'IA");

            // 10. Mettre à jour le bloc
            contentTextarea.value = response.trim();
            contentTextarea.disabled = false;

            // 11. Notification de succès
            if (window.Utils?.showNotification) {
                window.Utils.showNotification(
                    `✅ Bloc "${currentBlock.name}" régénéré avec succès !`,
                    'success'
                );
            } else {
                alert(`✅ Bloc "${currentBlock.name}" régénéré avec succès !`);
            }

            console.log('✅ Régénération terminée avec succès');
        } catch (error) {
            console.error('❌ Erreur lors de la régénération depuis le DOM:', error);

            // Restaurer le contenu original si erreur
            const blockElement = buttonElement.closest('.session-block-item');
            if (blockElement) {
                const contentTextarea = blockElement.querySelector('.session-block-content');
                if (contentTextarea && contentTextarea.value.startsWith('⏳')) {
                    contentTextarea.value = '';
                    contentTextarea.disabled = false;
                }
            }

            alert('❌ Erreur lors de la régénération : ' + error.message);
        }
    },

    /**
     * Détecter le type de séance depuis le titre ou les blocs
     * @param title
     * @param blocks
     */
    detectSessionType(title, blocks) {
        const titleUpper = title.toUpperCase();
        const allContent = (
            title +
            ' ' +
            blocks.map(b => b.name + ' ' + b.content).join(' ')
        ).toUpperCase();

        // Détection par mots-clés dans le titre ou le contenu
        if (
            titleUpper.includes('HYROX') ||
            allContent.includes('SKIERG') ||
            allContent.includes('SLED PUSH')
        ) {
            if (titleUpper.includes('LONG')) {
                return 'hyrox_long';
            }
            return 'hyrox';
        }
        if (
            titleUpper.includes('GYM SKILLS') ||
            titleUpper.includes('GYMSKILLS') ||
            allContent.includes('HANDSTAND') ||
            allContent.includes('MUSCLE-UP')
        ) {
            return 'gym_skills';
        }
        if (
            titleUpper.includes('BARBELL') ||
            titleUpper.includes('WEIGHTLIFTING') ||
            allContent.includes('SNATCH') ||
            allContent.includes('CLEAN & JERK')
        ) {
            return 'barbell_club';
        }
        if (
            titleUpper.includes('TACTICAL') ||
            allContent.includes('FARMERS') ||
            allContent.includes('SANDBAG CARRY')
        ) {
            return 'tactical';
        }
        if (
            titleUpper.includes('BUILD') ||
            titleUpper.includes('HYPERTROPHIE') ||
            allContent.includes('BULGARIAN SPLIT')
        ) {
            return 'build';
        }
        if (
            titleUpper.includes('POWER') ||
            allContent.includes('POWER CLEAN') ||
            allContent.includes('BOX JUMP')
        ) {
            return 'power';
        }
        if (
            (titleUpper.includes('RUN') && titleUpper.includes('BIKE')) ||
            titleUpper.includes('SPÉ') ||
            allContent.includes('TREADMILL') ||
            allContent.includes('ASSAULT BIKE') ||
            (allContent.includes('RUN') && allContent.includes('BIKE'))
        ) {
            return 'spe_run_bike';
        }

        // Défaut : tactical (polyvalent)
        return 'tactical';
    },

    /**
     * Appeler Claude via proxy pour obtenir du texte brut (pas de JSON)
     * @param prompt
     */
    async callClaudeForTextOnly(prompt) {
        const apiUrl = window.ApiConfig ? window.ApiConfig.getApiUrl() : 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 2048
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Proxy Claude: ${error.error || response.statusText}`);
        }

        const data = await response.json();
        return data.content[0].text;
    },

    /**
     * Appeler DeepSeek pour obtenir du texte brut (pas de JSON)
     * @param prompt
     */
    async callDeepSeekForTextOnly(prompt) {
        // 🆕 Récupérer la clé depuis ENV (qui redirige vers APIKeysManager automatiquement)
        const apiKey = ENV.get('deepseekKey');
        if (!apiKey) {
            throw new Error(
                'Clé API DeepSeek non configurée. Allez dans Configuration → Intelligence Artificielle.'
            );
        }

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 2048
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`DeepSeek API: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }
};

// Export global
window.SmartSessionGenerator = SmartSessionGenerator;

console.log('✅ Smart Session Generator chargé');
