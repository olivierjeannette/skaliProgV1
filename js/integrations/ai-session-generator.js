/**
 * AI SESSION GENERATOR
 * Génération intelligente de séances avec Claude AI
 * Analyse l'historique et respecte toutes les règles de programmation
 */

const AISessionGenerator = {
    config: {
        enabled: true,
        analysisDepth: 7, // Nombre de jours à analyser
        autoSave: true,
        provider: 'claude' // Pour l'instant, uniquement Claude
    },

    currentGeneration: null,
    isGenerating: false,

    /**
     * Initialisation du module
     */
    async init() {
        console.log('🤖 AI Session Generator initialized');

        // Vérifier que le prompt est chargé
        if (!window.SessionGeneratorPrompt) {
            console.error('SessionGeneratorPrompt not loaded!');
            return false;
        }

        return true;
    },

    /**
     * Interface principale de génération
     */
    async showGeneratorUI() {
        const modal = document.createElement('div');
        modal.style.cssText =
            'position: fixed; inset: 0; background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 2rem;';

        // Vérifier si un profil de coach existe
        const hasCoachProfile =
            window.CoachLearningSystem &&
            window.CoachLearningSystem.coachProfile &&
            window.CoachLearningSystem.coachProfile.writingStyle;

        modal.innerHTML = `
            <div style="background: var(--bg-primary); border: 1px solid var(--glass-border); border-radius: 1.5rem; box-shadow: 0 0 60px rgba(0, 0, 0, 0.5); max-width: 1400px; width: 100%; max-height: 90vh; overflow-y: auto;">
                <!-- Header Modern Glass -->
                <div style="background: var(--glass-bg); backdrop-filter: blur(20px); border-bottom: 1px solid var(--glass-border); padding: 2rem; border-radius: 1.5rem 1.5rem 0 0; position: sticky; top: 0; z-index: 100;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <h2 style="font-size: 2.5rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.75rem; display: flex; align-items: center;">
                                <i class="fas fa-magic" style="color: var(--accent-primary); margin-right: 1rem;"></i>
                                Générateur de Séances IA Pro
                            </h2>
                            <p style="color: var(--text-secondary); font-size: 1rem; font-weight: 600;">
                                Création intelligente avec analyse de l'historique et respect de votre style
                                ${hasCoachProfile ? '<br><span style="color: #10b981; font-weight: 700; margin-top: 0.5rem; display: inline-block;"><i class="fas fa-check-circle" style="margin-right: 0.5rem;"></i>Profil de coach actif - Style personnalisé</span>' : ''}
                            </p>
                        </div>
                        <button onclick="this.closest('div[style*=\\'position: fixed\\']').remove()"
                                style="color: var(--text-primary); background: var(--glass-bg); border: 1px solid var(--glass-border); width: 3rem; height: 3rem; border-radius: 0.75rem; font-size: 1.5rem; font-weight: 700; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='var(--glass-bg-hover)'; this.style.transform='rotate(90deg)'" onmouseout="this.style.background='var(--glass-bg)'; this.style.transform='rotate(0)'">
                            ×
                        </button>
                    </div>
                </div>

                <!-- Content - Layout 2 colonnes -->
                <div style="display: grid; grid-template-columns: 40% 60%; gap: 2rem; padding: 2rem;">

                    <!-- Colonne gauche : Configuration -->
                    <div>
                        <!-- Configuration Card -->
                        <div style="background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: 1rem; padding: 1.5rem; margin-bottom: 1.5rem;">
                            <h3 style="font-size: 1.125rem; font-weight: 700; color: var(--text-primary); margin-bottom: 1.5rem; display: flex; align-items: center;">
                                <i class="fas fa-cog" style="color: var(--accent-primary); margin-right: 0.75rem;"></i>
                                Configuration
                            </h3>

                            <!-- Date -->
                            <div style="margin-bottom: 1.5rem;">
                                <label style="display: block; font-size: 0.875rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
                                    Date de la séance
                                </label>
                                <input type="date"
                                       id="aiSessionDate"
                                       value="${new Date().toISOString().split('T')[0]}"
                                       style="width: 100%; padding: 1rem; background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-primary); border-radius: 0.75rem; font-weight: 600; transition: all 0.2s;">
                            </div>

                            <!-- Niveau -->
                            <div style="margin-bottom: 1.5rem;">
                                <label style="display: block; font-size: 0.875rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
                                    Niveau ciblé
                                </label>
                                <select id="aiSessionLevel"
                                        style="width: 100%; padding: 1rem; background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-primary); border-radius: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                                    <option value="Mixte">Mixte (tous niveaux)</option>
                                    <option value="Débutant">Débutant</option>
                                    <option value="Intermédiaire">Intermédiaire</option>
                                    <option value="Avancé">Avancé</option>
                                </select>
                            </div>

                            <!-- Focus -->
                            <div style="margin-bottom: 1.5rem;">
                                <label style="display: block; font-size: 0.875rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
                                    Focus principal
                                </label>
                                <select id="aiSessionFocus"
                                        style="width: 100%; padding: 1rem; background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-primary); border-radius: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                                    <option value="">Aucun (IA décide)</option>
                                    <option value="Force">Force</option>
                                    <option value="Conditionnement">Conditionnement Métabolique</option>
                                    <option value="Technique">Technique / Skill</option>
                                    <option value="Haltérophilie">Haltérophilie Olympique</option>
                                    <option value="Gymnastique">Gymnastique</option>
                                    <option value="HYROX">Préparation HYROX</option>
                                    <option value="Endurance">Endurance</option>
                                </select>
                            </div>

                            <!-- Format équipe -->
                            <div style="margin-bottom: 1.5rem; display: flex; align-items: center; padding: 1rem; background: var(--glass-bg-hover); border: 1px solid var(--glass-border); border-radius: 0.75rem;">
                                <input type="checkbox"
                                       id="aiSessionTeam"
                                       style="width: 1.25rem; height: 1.25rem; cursor: pointer; accent-color: var(--accent-primary);">
                                <label for="aiSessionTeam" style="margin-left: 0.75rem; font-size: 0.875rem; font-weight: 600; color: var(--text-primary); cursor: pointer;">
                                    Format en équipe (2, 3 ou 4 personnes)
                                </label>
                            </div>

                            <!-- Profondeur d'analyse -->
                            <div>
                                <label style="display: block; font-size: 0.875rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
                                    Analyser les derniers
                                    <span id="analysisDaysLabel" style="color: var(--accent-primary); font-weight: 800;">7</span>
                                    jours
                                </label>
                                <input type="range"
                                       id="aiAnalysisDays"
                                       min="3"
                                       max="30"
                                       value="7"
                                       style="width: 100%; accent-color: var(--accent-primary); cursor: pointer;"
                                       oninput="document.getElementById('analysisDaysLabel').textContent = this.value">
                            </div>
                        </div>

                        <!-- Aperçu de l'historique -->
                        <div style="background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: 1rem; padding: 1.5rem; margin-bottom: 1.5rem;">
                            <h3 style="font-size: 1.125rem; font-weight: 700; color: var(--text-primary); margin-bottom: 1rem; display: flex; align-items: center;">
                                <i class="fas fa-chart-line" style="color: var(--accent-primary); margin-right: 0.75rem;"></i>
                                Aperçu de l'historique
                            </h3>
                            <div id="historyPreview" style="color: var(--text-secondary); font-size: 0.875rem; line-height: 1.6;">
                                Chargement...
                            </div>
                        </div>

                        <!-- Statut du profil de coach -->
                        ${
                            hasCoachProfile
                                ? `
                            <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.5); border-radius: 1rem; padding: 1.5rem; margin-bottom: 1.5rem;">
                                <div style="display: flex; align-items: center; justify-content: space-between;">
                                    <div>
                                        <p style="color: #10b981; font-weight: 700; font-size: 1rem; margin-bottom: 0.5rem;">
                                            <i class="fas fa-brain" style="margin-right: 0.5rem;"></i>Profil de coach actif
                                        </p>
                                        <p style="color: var(--text-secondary); font-size: 0.875rem; font-weight: 600;">
                                            L'IA utilisera votre style unique (${window.CoachLearningSystem.coachProfile.sessionsAnalyzed} séances analysées)
                                        </p>
                                    </div>
                                    <button onclick="CoachLearningSystem.showLearningUI()"
                                            style="padding: 0.75rem 1.25rem; background: #10b981; color: white; font-weight: 700; border-radius: 0.75rem; border: none; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">
                                        Modifier
                                    </button>
                                </div>
                            </div>
                        `
                                : `
                            <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.5); border-radius: 1rem; padding: 1.5rem; margin-bottom: 1.5rem;">
                                <div style="display: flex; align-items: center; justify-content: space-between;">
                                    <div>
                                        <p style="color: #f59e0b; font-weight: 700; font-size: 1rem; margin-bottom: 0.5rem;">
                                            <i class="fas fa-exclamation-triangle" style="margin-right: 0.5rem;"></i>Mode standard
                                        </p>
                                        <p style="color: var(--text-secondary); font-size: 0.875rem; font-weight: 600;">
                                            Créez un profil personnalisé pour que l'IA apprenne votre style
                                        </p>
                                    </div>
                                    <button onclick="CoachLearningSystem.showLearningUI()"
                                            style="padding: 0.75rem 1.25rem; background: #f59e0b; color: white; font-weight: 700; border-radius: 0.75rem; border: none; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#d97706'" onmouseout="this.style.background='#f59e0b'">
                                        Créer mon profil
                                    </button>
                                </div>
                            </div>
                        `
                        }

                        <!-- Bouton de génération HERO -->
                        <button onclick="AISessionGenerator.generateSession()"
                                id="generateBtn"
                                style="width: 100%; padding: 1.5rem; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); color: var(--bg-primary); font-size: 1.25rem; font-weight: 800; border-radius: 0.75rem; border: none; cursor: pointer; box-shadow: 0 0 40px rgba(255, 255, 255, 0.4); text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.3s; display: flex; align-items: center; justify-content: center;" onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 0 60px rgba(255, 255, 255, 0.6)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 0 40px rgba(255, 255, 255, 0.4)'">
                            <i class="fas fa-magic" style="margin-right: 0.75rem; font-size: 1.5rem;"></i>
                            <span>Générer la séance ${hasCoachProfile ? 'avec mon style' : 'avec IA'}</span>
                        </button>
                    </div>

                    <!-- Colonne droite : Preview / Résultat -->
                    <div>
                        <div id="generationResult" class="hidden">
                            <!-- Le résultat sera affiché ici -->
                        </div>
                        <div id="emptyPreview" style="background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: 1rem; padding: 3rem; text-align: center;">
                            <i class="fas fa-sparkles" style="font-size: 4rem; color: var(--accent-primary); margin-bottom: 1.5rem; display: block; opacity: 0.5;"></i>
                            <p style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">
                                Prêt à générer
                            </p>
                            <p style="color: var(--text-secondary); font-weight: 600;">
                                Configurez les paramètres et cliquez sur "Générer"<br/>pour créer une séance intelligente
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Charger l'aperçu de l'historique
        await this.loadHistoryPreview();
    },

    /**
     * Charge un aperçu de l'historique récent
     */
    async loadHistoryPreview() {
        try {
            const days = parseInt(document.getElementById('aiAnalysisDays')?.value || 7);
            const sessions = await this.getRecentSessions(days);

            const preview = document.getElementById('historyPreview');
            if (!preview) {
                return;
            }

            if (sessions.length === 0) {
                preview.innerHTML =
                    '<p class="text-gray-500">Aucune séance trouvée sur cette période</p>';
                return;
            }

            // Analyser rapidement
            const movements = new Set();
            const formats = new Set();

            sessions.forEach(s => {
                if (s.wod && s.wod.exercises) {
                    s.wod.exercises.forEach(ex => movements.add(ex.name || ex.movement));
                }
                if (s.wod && s.wod.format) {
                    formats.add(s.wod.format);
                }
            });

            preview.innerHTML = `
                <div class="space-y-3">
                    <p class="text-white">
                        <span class="font-semibold">${sessions.length}</span> séance(s) trouvée(s)
                    </p>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-xs text-gray-500 mb-2">Mouvements utilisés :</p>
                            <div class="flex flex-wrap gap-1">
                                ${Array.from(movements)
                                    .slice(0, 8)
                                    .map(
                                        m =>
                                            `<span class="text-xs bg-gray-700 px-2 py-1 rounded">${m}</span>`
                                    )
                                    .join('')}
                                ${movements.size > 8 ? `<span class="text-xs text-gray-500">+${movements.size - 8} autres</span>` : ''}
                            </div>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500 mb-2">Formats utilisés :</p>
                            <div class="flex flex-wrap gap-1">
                                ${Array.from(formats)
                                    .map(
                                        f =>
                                            `<span class="text-xs bg-purple-900 px-2 py-1 rounded">${f}</span>`
                                    )
                                    .join('')}
                            </div>
                        </div>
                    </div>
                    <p class="text-xs text-gray-500 mt-3">
                        L'IA va éviter ces mouvements et formats pour créer de la variété
                    </p>
                </div>
            `;
        } catch (error) {
            console.error('Error loading history preview:', error);
            const preview = document.getElementById('historyPreview');
            if (preview) {
                preview.innerHTML =
                    '<p class="text-red-400">Erreur lors du chargement de l\'historique</p>';
            }
        }
    },

    /**
     * Récupère les séances récentes
     * @param days
     */
    async getRecentSessions(days = 7) {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const { data, error } = await window.supabase
                .from('sessions')
                .select('*')
                .gte('date', startDate.toISOString().split('T')[0])
                .lte('date', endDate.toISOString().split('T')[0])
                .order('date', { ascending: false });

            if (error) {
                throw error;
            }

            return data || [];
        } catch (error) {
            console.error('Error fetching recent sessions:', error);
            return [];
        }
    },

    /**
     * Analyse l'historique avec l'IA
     * @param sessions
     */
    async analyzeHistory(sessions) {
        try {
            const prompt = window.SessionGeneratorPrompt.getHistoryAnalysisPrompt(sessions);

            // 🆕 Récupérer la clé depuis ENV (qui redirige vers APIKeysManager automatiquement)
            const apiKey = ENV.get('claudeKey');

            if (!apiKey) {
                throw new Error(
                    'Clé API Claude non configurée. Allez dans Configuration → Intelligence Artificielle.'
                );
            }

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 2000,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    `Claude API error: ${errorData.error?.message || response.statusText}`
                );
            }

            const data = await response.json();
            const analysisText = data.content[0].text;

            // Parser le JSON de l'analyse
            const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Unable to parse analysis JSON');
            }
        } catch (error) {
            console.error('Error analyzing history:', error);
            // Retourner une analyse par défaut en cas d'erreur
            return {
                movementsUsed: [],
                formatsUsed: [],
                muscleGroupsUsed: [],
                energySystemsUsed: [],
                recommendations: {
                    avoid: [],
                    prioritize: ['Créer une séance variée']
                }
            };
        }
    },

    /**
     * Génère la séance avec Claude
     */
    async generateSession() {
        if (this.isGenerating) {
            console.log('Generation already in progress');
            return;
        }

        this.isGenerating = true;
        const btn = document.getElementById('generateBtn');
        const resultDiv = document.getElementById('generationResult');

        try {
            // Mettre à jour le bouton
            btn.disabled = true;
            btn.innerHTML = '<span class="animate-pulse">⏳ Génération en cours...</span>';

            // Récupérer les paramètres
            const date = document.getElementById('aiSessionDate').value;
            const level = document.getElementById('aiSessionLevel').value;
            const focus = document.getElementById('aiSessionFocus').value;
            const teamFormat = document.getElementById('aiSessionTeam').checked;
            const analysisDays = parseInt(document.getElementById('aiAnalysisDays').value);

            // 1. Récupérer l'historique
            console.log(`📊 Récupération des ${analysisDays} derniers jours...`);
            const sessions = await this.getRecentSessions(analysisDays);

            // 2. Analyser l'historique
            console.log("🔍 Analyse de l'historique avec IA...");
            const analysis = await this.analyzeHistory(sessions);
            console.log('Analysis:', analysis);

            // 3. Préparer les contraintes
            const constraints = {
                date: date,
                duration: 60,
                level: level,
                excludeMovements: analysis.movementsUsed || [],
                excludeFormats: analysis.formatsUsed || [],
                preferredFocus: focus || null,
                teamFormat: teamFormat,
                hyroxPrep: focus === 'HYROX'
            };

            // 4. Générer la séance
            console.log('✨ Génération de la séance...');
            let generationPrompt = window.SessionGeneratorPrompt.getGenerationPrompt(
                constraints,
                analysis
            );

            // ENRICHIR avec le profil du coach si disponible
            if (
                window.CoachLearningSystem &&
                window.CoachLearningSystem.coachProfile?.writingStyle
            ) {
                console.log('🧠 Enrichissement du prompt avec le profil du coach...');
                generationPrompt = window.CoachLearningSystem.getEnrichedPrompt(generationPrompt);
            }

            // 🆕 Récupérer la clé depuis ENV (qui redirige vers APIKeysManager automatiquement)
            const apiKey = ENV.get('claudeKey');
            if (!apiKey) {
                throw new Error(
                    'Clé API Claude non configurée. Allez dans Configuration → Intelligence Artificielle.'
                );
            }

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 8000,
                    temperature: 0.8, // Un peu de créativité
                    messages: [
                        {
                            role: 'user',
                            content: generationPrompt
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    `Claude API error: ${errorData.error?.message || response.statusText}`
                );
            }

            const data = await response.json();
            const sessionText = data.content[0].text;

            // Parser le JSON de la séance
            const jsonMatch = sessionText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Unable to parse session JSON from Claude response');
            }

            const generatedSession = JSON.parse(jsonMatch[0]);
            this.currentGeneration = generatedSession;

            console.log('✅ Séance générée avec succès!');

            // Afficher le résultat
            this.displayGeneratedSession(generatedSession, analysis);

            // Réactiver le bouton
            btn.disabled = false;
            btn.innerHTML = '<span>✨ Générer une nouvelle séance</span>';
        } catch (error) {
            console.error('Error generating session:', error);

            // Afficher l'erreur
            if (resultDiv) {
                resultDiv.className = 'bg-red-900 border border-red-700 rounded-lg p-4';
                resultDiv.innerHTML = `
                    <h3 class="text-lg font-semibold text-white mb-2">❌ Erreur</h3>
                    <p class="text-red-200 text-sm">${error.message}</p>
                    <p class="text-red-300 text-xs mt-2">
                        Vérifiez que votre clé API Claude est correctement configurée dans ENV.
                    </p>
                `;
                resultDiv.classList.remove('hidden');
            }

            // Réactiver le bouton
            btn.disabled = false;
            btn.innerHTML = '<span>✨ Réessayer</span>';
        } finally {
            this.isGenerating = false;
        }
    },

    /**
     * Affiche la séance générée
     * @param session
     * @param analysis
     */
    displayGeneratedSession(session, analysis) {
        const resultDiv = document.getElementById('generationResult');
        const emptyPreview = document.getElementById('emptyPreview');

        if (!resultDiv) {
            return;
        }

        // Cacher le placeholder
        if (emptyPreview) {
            emptyPreview.style.display = 'none';
        }

        resultDiv.className = '';
        resultDiv.style.cssText = 'display: flex; flex-direction: column; gap: 1.5rem;';
        resultDiv.innerHTML = `
            <!-- Header Success -->
            <div style="background: linear-gradient(135deg, #10b981, #059669); border-radius: 1rem; padding: 2rem; box-shadow: 0 0 40px rgba(16, 185, 129, 0.4);">
                <h3 style="font-size: 2rem; font-weight: 800; color: white; margin-bottom: 1rem; display: flex; align-items: center;">
                    <i class="fas fa-check-circle" style="margin-right: 0.75rem;"></i>
                    ${session.sessionInfo?.title || 'Séance générée'}
                </h3>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;">
                    <div>
                        <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;">Niveau</p>
                        <p style="color: white; font-weight: 700; font-size: 1rem;">${session.sessionInfo?.level}</p>
                    </div>
                    <div>
                        <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;">Format</p>
                        <p style="color: white; font-weight: 700; font-size: 1rem;">${session.sessionInfo?.canvas}</p>
                    </div>
                    <div>
                        <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;">Focus</p>
                        <p style="color: white; font-weight: 700; font-size: 1rem;">${session.sessionInfo?.focus}</p>
                    </div>
                    <div>
                        <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;">Durée</p>
                        <p style="color: white; font-weight: 700; font-size: 1rem;">${session.sessionInfo?.duration} min</p>
                    </div>
                </div>
            </div>

            <!-- Analyse -->
            <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.5); border-radius: 1rem; padding: 1.25rem;">
                <h4 style="font-size: 0.875rem; font-weight: 700; color: #3b82f6; margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
                    <i class="fas fa-brain" style="margin-right: 0.5rem;"></i>Analyse IA
                </h4>
                <div style="color: var(--text-secondary); font-size: 0.875rem; font-weight: 600; line-height: 1.6;">
                    ${
                        analysis.recommendations?.avoid?.length > 0
                            ? `
                        <p style="margin-bottom: 0.5rem;"><i class="fas fa-times-circle" style="color: #ef4444; margin-right: 0.5rem;"></i>Évité : ${analysis.recommendations.avoid.join(', ')}</p>
                    `
                            : ''
                    }
                    ${
                        analysis.recommendations?.prioritize?.length > 0
                            ? `
                        <p><i class="fas fa-check-circle" style="color: #10b981; margin-right: 0.5rem;"></i>Priorisé : ${analysis.recommendations.prioritize.join(', ')}</p>
                    `
                            : ''
                    }
                </div>
            </div>

            <!-- Blocs de la séance -->
            ${this.renderSessionBlocks(session)}

            <!-- Actions -->
            <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                <button onclick="AISessionGenerator.saveSession()"
                        style="flex: 1; padding: 1.25rem; background: linear-gradient(135deg, #10b981, #059669); color: white; font-weight: 800; font-size: 1rem; border-radius: 0.75rem; border: none; cursor: pointer; box-shadow: 0 0 30px rgba(16, 185, 129, 0.4); text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 0 40px rgba(16, 185, 129, 0.6)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 0 30px rgba(16, 185, 129, 0.4)'">
                    <i class="fas fa-save" style="margin-right: 0.5rem;"></i>Enregistrer
                </button>
                <button onclick="AISessionGenerator.copyToClipboard()"
                        style="flex: 1; padding: 1.25rem; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; font-weight: 800; font-size: 1rem; border-radius: 0.75rem; border: none; cursor: pointer; box-shadow: 0 0 30px rgba(59, 130, 246, 0.4); text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 0 40px rgba(59, 130, 246, 0.6)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 0 30px rgba(59, 130, 246, 0.4)'">
                    <i class="fas fa-copy" style="margin-right: 0.5rem;"></i>Copier JSON
                </button>
                <button onclick="AISessionGenerator.exportTVMode()"
                        style="flex: 1; padding: 1.25rem; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; font-weight: 800; font-size: 1rem; border-radius: 0.75rem; border: none; cursor: pointer; box-shadow: 0 0 30px rgba(139, 92, 246, 0.4); text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 0 40px rgba(139, 92, 246, 0.6)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 0 30px rgba(139, 92, 246, 0.4)'">
                    <i class="fas fa-tv" style="margin-right: 0.5rem;"></i>Mode TV
                </button>
            </div>
        `;

        resultDiv.classList.remove('hidden');
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    },

    /**
     * Affiche les blocs de la séance
     * @param session
     */
    renderSessionBlocks(session) {
        let html = '';

        // ÉCHAUFFEMENT
        if (session.warmup) {
            html += `
                <div style="background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: 1rem; padding: 1.5rem;">
                    <h4 style="font-size: 1.125rem; font-weight: 700; color: #f59e0b; margin-bottom: 1rem; display: flex; align-items: center;">
                        <i class="fas fa-fire" style="margin-right: 0.75rem;"></i>
                        ${session.warmup.blockTitle} (${session.warmup.duration} min)
                    </h4>
                    ${
                        session.warmup.parts
                            ?.map(
                                part => `
                        <div style="margin-bottom: 1rem; padding: 1rem; background: var(--glass-bg-hover); border: 1px solid var(--glass-border); border-radius: 0.5rem;">
                            <p style="font-size: 0.875rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">
                                ${part.name} ${part.duration ? `(${part.duration} min)` : ''}
                                ${part.format ? `- ${part.format}` : ''}
                            </p>
                            <ul style="color: var(--text-secondary); font-size: 0.875rem; font-weight: 600; line-height: 1.6; margin-left: 1.25rem;">
                                ${part.exercises?.map(ex => `<li style="margin-bottom: 0.25rem;">• ${ex}</li>`).join('') || ''}
                            </ul>
                        </div>
                    `
                            )
                            .join('') || ''
                    }
                </div>
            `;
        }

        // FORCE / SKILL
        if (session.strength) {
            html += `
                <div style="background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: 1rem; padding: 1.5rem;">
                    <h4 style="font-size: 1.125rem; font-weight: 700; color: #ef4444; margin-bottom: 1rem; display: flex; align-items: center;">
                        <i class="fas fa-dumbbell" style="margin-right: 0.75rem;"></i>
                        ${session.strength.blockTitle} (${session.strength.duration} min)
                    </h4>
                    <div style="padding: 1rem; background: var(--glass-bg-hover); border: 1px solid var(--glass-border); border-radius: 0.5rem;">
                        <p style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin-bottom: 1rem;">${session.strength.exercise}</p>
                        <div style="color: var(--text-secondary); font-size: 0.875rem; font-weight: 600; line-height: 1.8;">
                            <p style="margin-bottom: 0.5rem;"><i class="fas fa-list" style="color: #ef4444; margin-right: 0.5rem; width: 1rem;"></i>Schéma : <span style="color: var(--text-primary); font-weight: 700;">${session.strength.scheme}</span></p>
                            <p style="margin-bottom: 0.5rem;"><i class="fas fa-bolt" style="color: #ef4444; margin-right: 0.5rem; width: 1rem;"></i>Intensité : <span style="color: var(--text-primary); font-weight: 700;">${session.strength.intensity}</span></p>
                            ${session.strength.tempo ? `<p style="margin-bottom: 0.5rem;"><i class="fas fa-clock" style="color: #ef4444; margin-right: 0.5rem; width: 1rem;"></i>Tempo : ${session.strength.tempo}</p>` : ''}
                            ${session.strength.rest ? `<p style="margin-bottom: 0.5rem;"><i class="fas fa-pause" style="color: #ef4444; margin-right: 0.5rem; width: 1rem;"></i>Repos : ${session.strength.rest}</p>` : ''}
                            ${session.strength.notes ? `<p style="margin-top: 1rem; padding: 0.75rem; background: var(--glass-bg); border-radius: 0.5rem; font-style: italic; color: var(--text-secondary);"><i class="fas fa-lightbulb" style="color: #f59e0b; margin-right: 0.5rem;"></i>${session.strength.notes}</p>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }

        // METCON
        if (session.metcon) {
            html += `
                <div style="background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: 1rem; padding: 1.5rem;">
                    <h4 style="font-size: 1.125rem; font-weight: 700; color: #10b981; margin-bottom: 1rem; display: flex; align-items: center;">
                        <i class="fas fa-bolt" style="margin-right: 0.75rem;"></i>
                        ${session.metcon.blockTitle}
                    </h4>
                    <div style="margin-bottom: 1rem;">
                        <p style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.5rem;">${session.metcon.name || ''}</p>
                        <p style="color: #10b981; font-weight: 700; font-size: 1.125rem; margin-bottom: 0.5rem;">${session.metcon.format}</p>
                        ${session.metcon.timeCap ? `<p style="font-size: 0.875rem; color: var(--text-secondary); font-weight: 600;">Time cap : ${session.metcon.timeCap} min</p>` : ''}
                    </div>

                    <!-- Exercices -->
                    <div style="background: var(--glass-bg-hover); border: 1px solid var(--glass-border); border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 1rem;">
                        <ul style="display: flex; flex-direction: column; gap: 0.75rem;">
                            ${
                                session.metcon.exercises
                                    ?.map(
                                        ex => `
                                <li style="display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; font-weight: 700; color: var(--text-primary);">
                                    <span>
                                        <span style="color: var(--accent-primary); font-weight: 800; margin-right: 0.5rem;">${ex.reps || ''}</span>
                                        ${ex.movement}
                                        ${ex.unit ? ` <span style="color: var(--text-secondary);">${ex.unit}</span>` : ''}
                                    </span>
                                    ${ex.load ? `<span style="color: var(--text-secondary); font-size: 0.75rem;">${ex.load}</span>` : ''}
                                </li>
                            `
                                    )
                                    .join('') || ''
                            }
                        </ul>
                    </div>

                    ${
                        session.metcon.strategy
                            ? `
                        <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.75rem; padding: 0.75rem; background: var(--glass-bg-hover); border-radius: 0.5rem; font-weight: 600;">
                            <i class="fas fa-lightbulb" style="color: #f59e0b; margin-right: 0.5rem;"></i>Stratégie : ${session.metcon.strategy}
                        </p>
                    `
                            : ''
                    }

                    ${
                        session.metcon.targetScore
                            ? `
                        <p style="font-size: 0.875rem; color: var(--text-secondary); padding: 0.75rem; background: var(--glass-bg-hover); border-radius: 0.5rem; font-weight: 600;">
                            <i class="fas fa-bullseye" style="color: #10b981; margin-right: 0.5rem;"></i>Score cible : ${session.metcon.targetScore}
                        </p>
                    `
                            : ''
                    }
                </div>
            `;
        }

        // COOL DOWN
        if (session.cooldown) {
            html += `
                <div style="background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: 1rem; padding: 1.5rem;">
                    <h4 style="font-size: 1.125rem; font-weight: 700; color: #3b82f6; margin-bottom: 1rem; display: flex; align-items: center;">
                        <i class="fas fa-spa" style="margin-right: 0.75rem;"></i>
                        ${session.cooldown.blockTitle} (${session.cooldown.duration} min)
                    </h4>
                    <ul style="color: var(--text-secondary); font-size: 0.875rem; font-weight: 600; line-height: 1.6; margin-left: 1.25rem;">
                        ${session.cooldown.exercises?.map(ex => `<li style="margin-bottom: 0.5rem;">• ${ex}</li>`).join('') || ''}
                    </ul>
                </div>
            `;
        }

        return html;
    },

    /**
     * Enregistre la séance dans Supabase
     */
    async saveSession() {
        if (!this.currentGeneration) {
            alert('Aucune séance à enregistrer');
            return;
        }

        try {
            const session = this.currentGeneration;
            const date =
                session.sessionInfo?.date || document.getElementById('aiSessionDate').value;

            // Convertir au format de la base de données
            const sessionData = {
                date: date,
                title: session.sessionInfo?.title || 'Séance IA',
                warmup: session.warmup,
                strength: session.strength,
                wod: {
                    name: session.metcon?.name || session.sessionInfo?.title,
                    format: session.metcon?.format || session.sessionInfo?.canvas,
                    timecap: session.metcon?.timeCap,
                    exercises:
                        session.metcon?.exercises?.map(ex => ({
                            name: ex.movement,
                            reps: ex.reps,
                            rx_weight: ex.load || ex.rx,
                            scaled_weight: ex.scaled
                        })) || []
                },
                cooldown: session.cooldown,
                metadata: {
                    generatedByAI: true,
                    generatedAt: new Date().toISOString(),
                    level: session.sessionInfo?.level,
                    focus: session.sessionInfo?.focus,
                    canvas: session.sessionInfo?.canvas,
                    energySystems: session.sessionInfo?.energySystems,
                    muscleGroups: session.sessionInfo?.muscleGroups,
                    coachNotes: session.coachNotes
                }
            };

            const { data, error } = await window.supabase
                .from('sessions')
                .insert([sessionData])
                .select();

            if (error) {
                throw error;
            }

            console.log('✅ Session saved:', data);

            // Notification
            alert('✅ Séance enregistrée avec succès !');

            // Rafraîchir le planning si ouvert
            if (window.CalendarManager?.loadSessions) {
                await window.CalendarManager.loadSessions();
            }

            // Fermer la modale
            document.querySelector('.fixed')?.remove();
        } catch (error) {
            console.error('Error saving session:', error);
            alert("❌ Erreur lors de l'enregistrement : " + error.message);
        }
    },

    /**
     * Copie le JSON dans le presse-papier
     */
    async copyToClipboard() {
        if (!this.currentGeneration) {
            return;
        }

        try {
            const json = JSON.stringify(this.currentGeneration, null, 2);
            await navigator.clipboard.writeText(json);
            alert('✅ JSON copié dans le presse-papier !');
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            alert('❌ Erreur lors de la copie');
        }
    },

    /**
     * Exporte pour le mode TV
     */
    exportTVMode() {
        if (!this.currentGeneration) {
            return;
        }

        // TODO: Intégrer avec le système TV existant
        alert('🚧 Fonction Mode TV en cours de développement');
        console.log('TV Mode data:', this.currentGeneration);
    }
};

// Initialisation automatique
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AISessionGenerator.init());
} else {
    AISessionGenerator.init();
}

// Export global
window.AISessionGenerator = AISessionGenerator;
