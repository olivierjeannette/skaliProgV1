/**
 * GÉNÉRATEUR SIMPLE DE SÉANCES IA
 * Intégré directement dans le formulaire de création
 */

const SimpleSessionGenerator = {
    isGenerating: false,

    /**
     * Générer une séance depuis le formulaire
     * NOUVELLE VERSION: Ouvre le modal intelligent
     */
    async generateFromForm() {
        // Vérifier si le nouveau système est disponible
        if (window.SmartSessionGenerator) {
            console.log('🚀 Ouverture du générateur intelligent La Skàli...');
            window.SmartSessionGenerator.showSmartModal();
            return;
        }

        // Fallback: ancienne méthode simple
        console.warn('⚠️ Smart Session Generator non disponible, utilisation méthode simple');
        await this.generateFromFormLegacy();
    },

    /**
     * Ancienne méthode de génération (fallback)
     */
    async generateFromFormLegacy() {
        if (this.isGenerating) {
            console.log('Génération déjà en cours...');
            return;
        }

        this.isGenerating = true;
        const btn = document.getElementById('aiGenerateBtn');

        try {
            // Récupérer les infos du formulaire
            const title = document.getElementById('sessionTitle')?.value?.trim() || '';
            const category = document.getElementById('sessionCategory')?.value || '';

            // Afficher loading
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Génération...';
            }

            // 1. Récupérer l'historique récent (7 derniers jours)
            console.log("📊 Récupération de l'historique...");
            const history = await this.getRecentSessions(7);

            // 2. Générer avec Claude (si proxy dispo) sinon DeepSeek
            const prompt = window.FlexibleSessionPrompt.getGenerationPrompt(
                title,
                category,
                history
            );

            // Tester si proxy Claude est actif
            const claudeProxyAvailable = await this.checkClaudeProxy();

            let session;
            if (claudeProxyAvailable) {
                console.log('✨ Génération avec Claude Haiku (via proxy)...');
                session = await this.callClaudeViaProxy(prompt);
            } else {
                console.log('⚠️ Proxy Claude non disponible, utilisation DeepSeek...');
                session = await this.callDeepSeekAPI(prompt);
            }

            // 3. Remplir le formulaire avec la séance générée
            console.log('✅ Séance générée !', session);
            this.fillFormWithSession(session);

            // Notification succès
            if (typeof Utils !== 'undefined' && Utils.showNotification) {
                Utils.showNotification('✨ Séance générée avec succès !', 'success');
            } else {
                alert('✨ Séance générée avec succès !');
            }
        } catch (error) {
            console.error('❌ Erreur génération:', error);

            if (typeof Utils !== 'undefined' && Utils.showNotification) {
                Utils.showNotification('❌ Erreur : ' + error.message, 'error');
            } else {
                alert('❌ Erreur : ' + error.message);
            }
        } finally {
            this.isGenerating = false;

            // Réactiver le bouton
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-magic"></i> Générer avec IA';
            }
        }
    },

    /**
     * Récupérer les séances récentes
     * @param days
     */
    async getRecentSessions(days = 7) {
        try {
            // Utiliser SupabaseManager au lieu de window.supabase directement
            if (
                !window.SupabaseManager ||
                typeof window.SupabaseManager.getSessions !== 'function'
            ) {
                console.warn('SupabaseManager non disponible');
                return [];
            }

            const allSessions = await window.SupabaseManager.getSessions();

            // Filtrer les sessions des N derniers jours
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            const recentSessions = allSessions
                .filter(s => {
                    const sessionDate = new Date(s.date);
                    return sessionDate >= cutoffDate;
                })
                .slice(0, 10)
                .map(s => ({
                    title: s.title,
                    category: s.category,
                    blocks: s.blocks,
                    date: s.date
                }));

            return recentSessions;
        } catch (error) {
            console.error('Erreur récupération historique:', error);
            return [];
        }
    },

    /**
     * Vérifier si le proxy Claude est disponible
     */
    async checkClaudeProxy() {
        try {
            const response = await fetch('http://localhost:3001/health', {
                method: 'GET',
                signal: AbortSignal.timeout(1000) // Timeout 1s
            });

            if (response.ok) {
                const data = await response.json();
                return data.status === 'ok';
            }
            return false;
        } catch (error) {
            return false; // Proxy non disponible
        }
    },

    /**
     * Appeler Claude via le proxy local
     * @param prompt
     */
    async callClaudeViaProxy(prompt) {
        const apiUrl = window.ApiConfig ? window.ApiConfig.getApiUrl() : 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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
        const text = data.content[0].text;

        // Parser le JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Impossible de parser la réponse de Claude');
        }

        return JSON.parse(jsonMatch[0]);
    },

    /**
     * Appeler l'API Claude directement (garde pour référence, CORS bloqué)
     * @param prompt
     */
    async callClaudeAPI(prompt) {
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
                model: 'claude-3-5-haiku-20241022', // Haiku 3.5 (rapide + précis)
                max_tokens: 4096,
                temperature: 0.7, // Moins créatif = plus respect des consignes
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
            throw new Error(`Claude API: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const text = data.content[0].text;

        // Parser le JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Impossible de parser la réponse de Claude');
        }

        return JSON.parse(jsonMatch[0]);
    },

    /**
     * Appeler l'API DeepSeek (fallback)
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
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.5, // Baissé de 0.9 → 0.5 pour meilleur respect des consignes
                max_tokens: 4096
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`DeepSeek API: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const text = data.choices[0].message.content;

        // Parser le JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Impossible de parser la réponse de DeepSeek');
        }

        return JSON.parse(jsonMatch[0]);
    },

    /**
     * Remplir le formulaire avec la séance générée
     * @param session
     */
    fillFormWithSession(session) {
        // NE PAS toucher au titre et catégorie - on garde ce que l'utilisateur a entré
        // L'IA doit respecter le titre/catégorie demandés, pas les changer!

        // Vider les blocs existants
        const blocksList = document.getElementById('blocksList');
        if (blocksList) {
            blocksList.innerHTML = '';
        }

        // Ajouter les blocs générés
        if (session.blocks && session.blocks.length > 0) {
            session.blocks.forEach((block, idx) => {
                if (
                    window.CalendarManager &&
                    typeof window.CalendarManager.addBlock === 'function'
                ) {
                    // Utiliser la méthode existante
                    window.CalendarManager.addBlock();

                    // Remplir le bloc
                    const blockItems = document.querySelectorAll('.session-block-item');
                    const currentBlock = blockItems[blockItems.length - 1];

                    if (currentBlock) {
                        const nameInput = currentBlock.querySelector('.session-block-name');
                        const contentTextarea =
                            currentBlock.querySelector('.session-block-content');

                        if (nameInput) {
                            nameInput.value = block.name || '';
                        }
                        if (contentTextarea) {
                            contentTextarea.value = block.content || '';
                        }
                    }
                } else {
                    // Fallback : créer manuellement le bloc
                    this.addBlockManually(block, idx);
                }
            });
        }

        // Scroll vers le haut pour voir le titre
        const modal = document.querySelector('.session-modal');
        if (modal) {
            modal.scrollTop = 0;
        }
    },

    /**
     * Ajouter un bloc manuellement (fallback)
     * @param block
     * @param idx
     */
    addBlockManually(block, idx) {
        const blocksList = document.getElementById('blocksList');
        if (!blocksList) {
            return;
        }

        const blockHTML = `
            <div class="session-block-item" draggable="true" data-index="${idx}">
                <div class="session-block-header">
                    <div class="session-block-drag-handle" title="Déplacer le bloc">
                        <i class="fas fa-grip-vertical"></i>
                    </div>
                    <input type="text" value="${block.name || ''}"
                           placeholder="Nom du bloc"
                           class="session-block-name">
                    <button type="button" onclick="this.closest('.session-block-item').remove()"
                            class="session-block-delete-btn" title="Supprimer le bloc">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <textarea placeholder="Détails du bloc"
                          class="session-block-content">${block.content || ''}</textarea>
            </div>
        `;

        blocksList.insertAdjacentHTML('beforeend', blockHTML);
    },

    /**
     * Afficher un aperçu avant génération (optionnel)
     */
    showPreview() {
        const title = document.getElementById('sessionTitle')?.value?.trim() || '';
        const category = document.getElementById('sessionCategory')?.value || '';

        let message = "🤖 L'IA va générer une séance";

        if (title) {
            message += ` avec le titre "${title}"`;
        }

        if (category) {
            const categoryNames = {
                wod: 'CrossFit',
                force: 'Force',
                endurance: 'Endurance',
                skill: 'Technique',
                competition: 'Compétition'
            };
            message += ` de type ${categoryNames[category] || category}`;
        }

        message += ".\n\nL'IA va :\n";
        message += '• Analyser les séances récentes\n';
        message += '• Créer quelque chose de varié\n';
        message += '• Remplir automatiquement le formulaire\n\n';
        message += 'Continuer ?';

        return confirm(message);
    }
};

// Export global
window.SimpleSessionGenerator = SimpleSessionGenerator;

console.log('✅ Simple Session Generator chargé');
