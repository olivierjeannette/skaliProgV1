// Gestionnaire de création d'équipes intelligentes - Version Moderne
const TeamBuilder = {
    participants: [],
    teams: [],
    teamSettings: {
        mode: 'teams', // 'teams' ou 'size'
        numberOfTeams: 2,
        teamSize: 4,
        balanceMode: 'level' // 'level' (même niveau) ou 'homogeneous' (équilibré par points)
    },

    // Cache des membres pour éviter la latence
    membersCache: [],

    // Intégration Eppy Pro
    eppyProEnabled: true,

    // Charger le cache des membres avec leurs profils d'entraînement
    async loadMembersCache() {
        if (typeof SupabaseManager !== 'undefined') {
            try {
                // Charger les membres
                this.membersCache = await SupabaseManager.getMembers();
                console.log('✅ Cache membres chargé:', this.membersCache.length);

                // Charger les profils d'entraînement pour chaque membre
                const { data: profiles, error } = await SupabaseManager.supabase
                    .from('member_training_profiles')
                    .select('*');

                if (error) {
                    console.error('⚠️ Erreur chargement profils:', error);
                } else if (profiles) {
                    // Attacher les profils aux membres correspondants
                    this.membersCache.forEach(member => {
                        const profile = profiles.find(p => p.member_id === member.id);
                        if (profile) {
                            member._trainingProfile = profile;
                            console.log(
                                `📥 Profil attaché pour ${member.name}:`,
                                profile.level,
                                profile.gender
                            );
                        }
                    });
                    console.log(`✅ ${profiles.length} profils d'entraînement chargés`);
                }
            } catch (error) {
                console.error('❌ Erreur chargement cache membres:', error);
                this.membersCache = [];
            }
        }
    },

    // Charger la configuration sauvegardée
    loadSavedConfig() {
        try {
            const saved = localStorage.getItem('teambuilder_config');
            if (saved) {
                const config = JSON.parse(saved);
                this.teamSettings = { ...this.teamSettings, ...config };
                console.log('✅ Configuration TeamBuilder chargée:', this.teamSettings);
            }
        } catch (error) {
            console.error('❌ Erreur chargement config:', error);
        }
    },

    // Sauvegarder la configuration
    saveConfig() {
        try {
            localStorage.setItem('teambuilder_config', JSON.stringify(this.teamSettings));
            console.log('💾 Configuration sauvegardée');
            // Feedback visuel
            const btn = document.getElementById('saveConfigBtn');
            if (btn) {
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i> Sauvegardé !';
                btn.style.background = 'rgba(74, 222, 128, 0.2)';
                btn.style.borderColor = 'rgba(74, 222, 128, 0.5)';
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.style.background = '';
                    btn.style.borderColor = '';
                }, 2000);
            }
        } catch (error) {
            console.error('❌ Erreur sauvegarde config:', error);
        }
    },

    // Afficher la vue de création d'équipes - REFONTE VERTICALE PROPRE
    async showTeamBuilderView() {
        // Charger le cache et la config sauvegardée
        await this.loadMembersCache();
        this.loadSavedConfig();

        const html = `
            <div class="fade-in min-h-screen" style="background: var(--bg-primary);">

                <!-- Header Compact -->
                <div style="background: var(--glass-bg); backdrop-filter: blur(20px); border-bottom: 1px solid var(--glass-border); padding: var(--spacing-lg);">
                    <div style="max-width: 1000px; margin: 0 auto; text-align: center;">
                        <h1 style="font-size: var(--font-size-3xl); font-weight: 800; color: var(--text-primary); margin-bottom: var(--spacing-sm);">
                            <i class="fas fa-users-cog" style="margin-right: var(--spacing-sm); opacity: 0.8;"></i>
                            TeamBuilder Pro
                        </h1>
                        <p style="color: var(--text-secondary); font-size: var(--font-size-base);">Configuration → Import → Génération</p>
                    </div>
                </div>

                <!-- Main Content VERTICAL - Une seule colonne propre -->
                <div style="max-width: 1000px; margin: 0 auto; padding: var(--spacing-xl); display: flex; flex-direction: column; gap: var(--spacing-lg);">

                    <!-- ═══════════════════════════════════════════════════ -->
                    <!-- SECTION 1: CONFIGURATION (EN HAUT) -->
                    <!-- ═══════════════════════════════════════════════════ -->
                    <div class="glass-card" style="padding: var(--spacing-lg);">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--spacing-md);">
                            <h2 style="font-size: var(--font-size-xl); font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: var(--spacing-sm);">
                                <i class="fas fa-sliders-h" style="color: var(--accent-primary);"></i>
                                <span>1. Configuration</span>
                            </h2>
                            <button id="saveConfigBtn" onclick="TeamBuilder.saveConfig()" class="glass-button" style="padding: var(--spacing-sm) var(--spacing-md); font-weight: 600;">
                                <i class="fas fa-save" style="margin-right: var(--spacing-xs);"></i>
                                Sauvegarder
                            </button>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg);">
                            <!-- Mode: Nombre d'équipes ou taille -->
                            <div>
                                <label style="display: block; font-size: var(--font-size-sm); font-weight: 600; color: var(--text-secondary); margin-bottom: var(--spacing-sm); text-transform: uppercase;">
                                    Mode
                                </label>
                                <div style="display: flex; gap: var(--spacing-xs); background: var(--surface-2); padding: 0.4rem; border-radius: var(--radius-md);">
                                    <button onclick="TeamBuilder.updateTeamMode('teams')" id="modeTeamsBtn" class="mode-toggle"
                                            style="flex: 1; padding: var(--spacing-sm); border-radius: var(--radius-sm); font-weight: 600; transition: all 0.2s; ${this.teamSettings.mode === 'teams' ? 'background: var(--accent-primary); color: var(--bg-primary);' : 'background: transparent; color: var(--text-secondary);'}">
                                        Nb Équipes
                                    </button>
                                    <button onclick="TeamBuilder.updateTeamMode('size')" id="modeSizeBtn" class="mode-toggle"
                                            style="flex: 1; padding: var(--spacing-sm); border-radius: var(--radius-sm); font-weight: 600; transition: all 0.2s; ${this.teamSettings.mode === 'size' ? 'background: var(--accent-primary); color: var(--bg-primary);' : 'background: transparent; color: var(--text-secondary);'}">
                                        Taille
                                    </button>
                                </div>
                                <div id="valueInputContainer" style="margin-top: var(--spacing-md);">
                                    ${
                                        this.teamSettings.mode === 'teams'
                                            ? `
                                        <input type="number" id="numberOfTeams" min="2" max="10" value="${this.teamSettings.numberOfTeams}"
                                               onchange="TeamBuilder.updateTeamSettings()" class="form-input"
                                               style="width: 100%; padding: var(--spacing-md); font-size: var(--font-size-2xl); font-weight: 900; text-align: center; border-radius: var(--radius-md);">
                                    `
                                            : `
                                        <input type="number" id="teamSize" min="2" max="8" value="${this.teamSettings.teamSize}"
                                               onchange="TeamBuilder.updateTeamSettings()" class="form-input"
                                               style="width: 100%; padding: var(--spacing-md); font-size: var(--font-size-2xl); font-weight: 900; text-align: center; border-radius: var(--radius-md);">
                                    `
                                    }
                                </div>
                            </div>

                            <!-- Équilibrage -->
                            <div>
                                <label style="display: block; font-size: var(--font-size-sm); font-weight: 600; color: var(--text-secondary); margin-bottom: var(--spacing-sm); text-transform: uppercase;">
                                    Équilibrage
                                </label>
                                <div style="display: flex; gap: var(--spacing-sm);">
                                    <button onclick="TeamBuilder.updateBalanceMode('level')" id="balanceLevelBtn"
                                            style="flex: 1; padding: 0.75rem 0.5rem; border-radius: var(--radius-md); font-weight: 600; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.25rem; min-height: 70px; ${this.teamSettings.balanceMode === 'level' ? 'background: var(--accent-secondary); color: var(--bg-primary);' : 'background: var(--glass-bg); color: var(--text-secondary); border: 1px solid var(--glass-border);'}">
                                        <i class="fas fa-layer-group" style="font-size: 1.25rem;"></i>
                                        <span style="font-size: 0.75rem; white-space: nowrap;">Par Niveau</span>
                                    </button>
                                    <button onclick="TeamBuilder.updateBalanceMode('homogeneous')" id="balanceHomogeneousBtn"
                                            style="flex: 1; padding: 0.75rem 0.5rem; border-radius: var(--radius-md); font-weight: 600; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.25rem; min-height: 70px; ${this.teamSettings.balanceMode === 'homogeneous' ? 'background: var(--accent-secondary); color: var(--bg-primary);' : 'background: var(--glass-bg); color: var(--text-secondary); border: 1px solid var(--glass-border);'}">
                                        <i class="fas fa-balance-scale" style="font-size: 1.25rem;"></i>
                                        <span style="font-size: 0.75rem; white-space: nowrap;">Équilibré</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ═══════════════════════════════════════════════════ -->
                    <!-- SECTION 2: IMPORT & LISTE DES PARTICIPANTS (MILIEU) -->
                    <!-- ═══════════════════════════════════════════════════ -->
                    <div class="glass-card" style="padding: var(--spacing-lg);">
                        <h2 style="font-size: var(--font-size-xl); font-weight: 700; color: var(--text-primary); margin-bottom: var(--spacing-md); display: flex; align-items: center; gap: var(--spacing-sm);">
                            <i class="fas fa-users" style="color: var(--accent-primary);"></i>
                            <span>2. Import & Liste des Participants</span>
                            <span id="totalParticipants" style="margin-left: auto; background: var(--glass-bg); padding: var(--spacing-xs) var(--spacing-md); border-radius: var(--radius-full); font-size: var(--font-size-sm);">0</span>
                        </h2>

                        <!-- Textarea Import -->
                        <textarea id="participantsInput"
                                  placeholder="Collez la liste des noms (un par ligne)...

Jean Dupont
Marie Martin
Pierre Durand"
                                  class="form-input"
                                  style="width: 100%; min-height: 12rem; resize: vertical; font-family: 'Courier New', monospace; font-size: var(--font-size-base); margin-bottom: var(--spacing-md);"
                                  oninput="TeamBuilder.autoRecognize()"></textarea>

                        <!-- Boutons actions -->
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--spacing-sm); margin-bottom: var(--spacing-lg);">
                            <button onclick="TeamBuilder.openAddMemberModal()" class="glass-button" style="padding: var(--spacing-md);" title="Ajouter un adhérent manuellement">
                                <i class="fas fa-user-plus" style="margin-right: var(--spacing-xs);"></i> Ajouter
                            </button>
                            <button onclick="TeamBuilder.showAllMembers()" class="glass-button" style="padding: var(--spacing-md);" title="Voir tous les adhérents de la BDD">
                                <i class="fas fa-database" style="margin-right: var(--spacing-xs);"></i> Voir tous
                            </button>
                            <button onclick="TeamBuilder.clearAll()" class="glass-button" style="padding: var(--spacing-md); background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3);" title="Effacer la liste">
                                <i class="fas fa-trash" style="color: #fca5a5; margin-right: var(--spacing-xs);"></i> Effacer
                            </button>
                        </div>

                        <!-- Stats reconnus / genre -->
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--spacing-md); margin-bottom: var(--spacing-lg); text-align: center;">
                            <div style="background: var(--glass-bg); padding: var(--spacing-md); border-radius: var(--radius-md); border: 1px solid var(--glass-border);">
                                <div id="recognizedParticipants" style="font-size: var(--font-size-2xl); font-weight: 900; color: var(--accent-primary);">0</div>
                                <div style="font-size: var(--font-size-xs); color: var(--text-muted); text-transform: uppercase;">Reconnus</div>
                            </div>
                            <div style="background: var(--glass-bg); padding: var(--spacing-md); border-radius: var(--radius-md); border: 1px solid var(--glass-border);">
                                <div id="maleCount" style="font-size: var(--font-size-2xl); font-weight: 900; color: #60a5fa;">0</div>
                                <div style="font-size: var(--font-size-xs); color: var(--text-muted);">♂ Hommes</div>
                            </div>
                            <div style="background: var(--glass-bg); padding: var(--spacing-md); border-radius: var(--radius-md); border: 1px solid var(--glass-border);">
                                <div id="femaleCount" style="font-size: var(--font-size-2xl); font-weight: 900; color: #f472b6;">0</div>
                                <div style="font-size: var(--font-size-xs); color: var(--text-muted);">♀ Femmes</div>
                            </div>
                        </div>

                        <!-- Liste participants -->
                        <div>
                            <h3 style="font-size: var(--font-size-lg); font-weight: 600; color: var(--text-secondary); margin-bottom: var(--spacing-sm); display: flex; align-items: center; gap: var(--spacing-xs);">
                                <i class="fas fa-list"></i>
                                <span>Liste</span>
                                <span id="participantCount" style="background: var(--glass-bg); padding: 0.3rem 0.8rem; border-radius: var(--radius-full); font-size: var(--font-size-xs);">0</span>
                            </h3>
                            <div id="participantsList" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr)); gap: var(--spacing-sm); max-height: 30rem; overflow-y: auto; padding: var(--spacing-sm); background: var(--surface-1); border-radius: var(--radius-md);">
                                ${this.renderParticipantsCompact()}
                            </div>
                        </div>
                    </div>

                    <!-- ═══════════════════════════════════════════════════ -->
                    <!-- SECTION 3: GÉNÉRATION & RÉSULTATS (BAS) -->
                    <!-- ═══════════════════════════════════════════════════ -->
                    <div style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
                        <!-- Boutons génération -->
                        <div style="display: grid; grid-template-columns: 1fr auto; gap: 1rem;">
                            <button onclick="TeamBuilder.generateTeams()"
                                    style="padding: 1rem 2rem; background: linear-gradient(135deg, #ffffff, #e0e0e0); color: #0a0a0a; font-size: 1.1rem; font-weight: 700; border-radius: 0.6rem; border: none; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2); text-transform: uppercase; letter-spacing: 0.05em;">
                                <i class="fas fa-magic" style="margin-right: 0.75rem;"></i>
                                Générer les Équipes
                            </button>
                            <button onclick="TeamBuilder.saveForTVMode()" id="saveTVBtn"
                                    class="glass-button" style="padding: 1rem 1.5rem; white-space: nowrap;" title="Sauvegarder et afficher en Mode TV">
                                <i class="fas fa-tv" style="margin-right: 0.5rem;"></i>
                                Mode TV
                            </button>
                        </div>

                        <!-- Results Modern -->
                        <div id="teamsResults" class="hidden">
                            <div class="glass-card" style="padding: 1.5rem;">
                                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                                    <h3 style="font-size: 1.125rem; font-weight: 700; color: var(--text-primary); display: flex; align-items: center;">
                                        <i class="fas fa-trophy" style="margin-right: 0.75rem; opacity: 0.7;"></i>
                                        Équipes créées
                                    </h3>
                                    <div style="display: flex; gap: 0.5rem;">
                                        <button onclick="TeamBuilder.regenerateTeams()"
                                                class="glass-button" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                                            <i class="fas fa-redo" style="margin-right: 0.5rem;"></i>Régénérer
                                        </button>
                                        <button onclick="TeamBuilder.copyTeamsToClipboard()"
                                                style="padding: 0.5rem 1rem; font-size: 0.875rem; background: var(--accent-primary); color: var(--bg-primary); border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                                            <i class="fas fa-copy" style="margin-right: 0.5rem;"></i>Copier
                                        </button>
                                    </div>
                                </div>

                                <div id="teamsDisplay" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
                                    <!-- Les équipes seront affichées ici -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('mainContent').innerHTML = html;
        this.updateStatistics();
    },

    // Reconnaissance automatique en temps réel (debounced)
    autoRecognize() {
        clearTimeout(this.autoRecognizeTimeout);
        this.autoRecognizeTimeout = setTimeout(() => {
            this.parseParticipants();
        }, 500);
    },

    // Rendu compact des participants - VERSION MODERNE CARDS
    renderParticipantsCompact() {
        const recognizedParticipants = this.participants.filter(p => p.isInDatabase);

        if (recognizedParticipants.length === 0) {
            return `
                <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem; color: var(--text-muted);">
                    <i class="fas fa-user-plus" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p style="font-size: 0.875rem;">Aucun participant reconnu</p>
                </div>
            `;
        }

        return recognizedParticipants
            .map(
                participant => `
            <div class="glass-card" style="padding: 1rem; position: relative; transition: all 0.2s; cursor: pointer;"
                 onmouseenter="this.style.borderColor='var(--accent-primary)'"
                 onmouseleave="this.style.borderColor='var(--glass-border)'">

                <!-- Nom -->
                <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 0.75rem; font-size: 0.875rem; display: flex; align-items: center;">
                    <i class="fas fa-user-check" style="color: var(--accent-primary); margin-right: 0.5rem; font-size: 0.75rem;"></i>
                    ${participant.cleanName}
                </div>

                <!-- Genre Pills -->
                <div style="display: flex; gap: 0.25rem; margin-bottom: 0.75rem;">
                    <button onclick="TeamBuilder.updateParticipantGender('${participant.id}', 'homme')"
                            id="gender-homme-${participant.id}"
                            style="flex: 1; padding: 0.5rem; border-radius: 0.5rem; border: none; cursor: pointer; transition: all 0.2s; font-size: 1rem; ${participant.gender === 'homme' ? 'background: #60a5fa; color: white;' : 'background: var(--glass-bg); color: var(--text-muted); border: 1px solid var(--glass-border);'}"
                            title="Homme">
                        ♂
                    </button>
                    <button onclick="TeamBuilder.updateParticipantGender('${participant.id}', 'femme')"
                            id="gender-femme-${participant.id}"
                            style="flex: 1; padding: 0.5rem; border-radius: 0.5rem; border: none; cursor: pointer; transition: all 0.2s; font-size: 1rem; ${participant.gender === 'femme' ? 'background: #f472b6; color: white;' : 'background: var(--glass-bg); color: var(--text-muted); border: 1px solid var(--glass-border);'}"
                            title="Femme">
                        ♀
                    </button>
                </div>

                <!-- Niveau Select Modern -->
                <select onchange="TeamBuilder.updateParticipantLevel('${participant.id}', this.value)"
                        class="form-select"
                        style="width: 100%; padding: 0.5rem; border-radius: 0.5rem; font-size: 0.75rem; margin-bottom: 0.5rem;">
                    <option value="debutant" ${participant.level === 'debutant' ? 'selected' : ''}>🟢 Débutant (1pt)</option>
                    <option value="intermediaire" ${participant.level === 'intermediaire' ? 'selected' : ''}>🟡 Intermédiaire (2pt)</option>
                    <option value="enforme" ${participant.level === 'enforme' ? 'selected' : ''}>🟠 En forme (3pt)</option>
                    <option value="tresenforme" ${participant.level === 'tresenforme' ? 'selected' : ''}>🔴 Très en forme (4pt)</option>
                </select>

                <!-- Bouton Supprimer -->
                <button onclick="TeamBuilder.removeParticipant(${participant.id})"
                        style="position: absolute; top: 0.5rem; right: 0.5rem; padding: 0.25rem 0.5rem; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 0.375rem; color: #fca5a5; cursor: pointer; transition: all 0.2s; font-size: 0.75rem;"
                        onmouseenter="this.style.background='rgba(239, 68, 68, 0.2)'"
                        onmouseleave="this.style.background='rgba(239, 68, 68, 0.1)'"
                        title="Supprimer">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `
            )
            .join('');
    },

    // Parser les participants depuis le texte saisi (SYNC avec cache)
    parseParticipants() {
        const input = document.getElementById('participantsInput');
        if (!input || !input.value.trim()) {
            this.participants = [];
            this.updateParticipantsList();
            return;
        }

        // Diviser par lignes et nettoyer
        const lines = input.value
            .split('\n')
            .map(line => line.trim())
            .filter(line => line);
        const newParticipants = [];

        // Parser chaque ligne de façon synchrone avec le cache
        lines.forEach(line => {
            const participant = this.parseParticipantLine(line);
            if (participant) {
                // Vérifier si le participant n'existe pas déjà
                const exists = this.participants.some(
                    p => p.cleanName.toLowerCase() === participant.cleanName.toLowerCase()
                );

                if (!exists) {
                    newParticipants.push(participant);
                }
            }
        });

        // Ajouter les nouveaux participants
        this.participants = [...this.participants, ...newParticipants];
        this.updateParticipantsList();

        // Afficher une notification si de nouveaux participants ont été ajoutés
        if (newParticipants.length > 0) {
            this.showNotification(`${newParticipants.length} participant(s) ajouté(s)`, 'success');
        }
    },

    // Forcer la reconnaissance des adhérents (SYNC avec cache)
    async forceRecognition() {
        const input = document.getElementById('participantsInput');

        if (!input) {
            this.showNotification('Erreur: Zone de texte non trouvée.', 'error');
            return;
        }

        if (!input.value.trim()) {
            this.showNotification(
                "Veuillez d'abord coller la liste des participants depuis Peppy.",
                'warning'
            );
            return;
        }

        // Recharger le cache
        await this.loadMembersCache();

        // Parser le texte saisi pour extraire les participants
        const lines = input.value
            .split('\n')
            .map(line => line.trim())
            .filter(line => line);
        this.participants = [];

        lines.forEach(line => {
            const participant = this.parseParticipantLine(line);
            if (participant) {
                this.participants.push(participant);
            }
        });

        if (this.participants.length === 0) {
            this.showNotification(
                'Aucun participant valide trouvé dans le texte saisi. Vérifiez le format des noms.',
                'error'
            );
            return;
        }

        // Diagnostic de la base de données
        await this.showDatabaseDiagnostic();

        // Mettre à jour l'affichage
        this.updateParticipantsList();

        // Afficher une notification
        const recognizedCount = this.participants.filter(p => p.isInDatabase).length;
        const totalCount = this.participants.length;

        // Si aucun participant n'est reconnu, afficher plus d'informations
        if (recognizedCount === 0 && totalCount > 0) {
            console.warn('⚠️ Aucun participant reconnu. Vérifiez :');
            console.warn('1. Que la base de données contient des adhérents');
            console.warn('2. Que les noms sont correctement orthographiés');
            console.warn(
                '3. Exemple de participants recherchés:',
                this.participants.slice(0, 3).map(p => p.cleanName)
            );

            this.showNotification(
                "Aucun adhérent reconnu. Vérifiez la console pour plus d'informations.",
                'warning'
            );
        } else {
            this.showNotification(
                `Reconnaissance terminée: ${recognizedCount}/${totalCount} adhérents reconnus`,
                'success'
            );
        }
    },

    // Diagnostic de la base de données (VERSION SUPABASE)
    async showDatabaseDiagnostic() {
        console.log('🔍 === Diagnostic de la base de données ===');

        let members = [];
        let source = 'Supabase';

        // Récupérer les membres depuis Supabase
        if (typeof SupabaseManager !== 'undefined') {
            members = await SupabaseManager.getMembers();
        }

        console.log(`📂 Source des données: ${source}`);
        console.log(`👥 Nombre d'adhérents dans la base: ${members ? members.length : 0}`);

        if (members && members.length > 0) {
            console.log("📋 Exemples d'adhérents dans la base:");
            members.slice(0, 5).forEach((m, i) => {
                console.log(`  ${i + 1}. ${m.name || '?'}`);
            });

            // Analyser la structure des données
            const firstMember = members[0];
            console.log('🏗️ Structure des données:', Object.keys(firstMember));
        } else {
            console.warn('⚠️ Aucun adhérent trouvé dans la base de données !');
            console.warn("Assurez-vous que les adhérents sont bien chargés dans l'application.");
        }

        console.log('=== Fin du diagnostic ===');
    },

    // Parser une ligne de participant (SYNC avec cache) - RECONNAISSANCE STRICTE
    parseParticipantLine(line) {
        // Nettoyer la ligne (enlever les numéros, points, etc.)
        let cleanName = line
            .replace(/^\d+\.?\s*/, '') // Enlever les numéros au début
            .replace(/^\s*[-•*]\s*/, '') // Enlever les puces
            .replace(/\s+/g, ' ') // Normaliser les espaces
            .trim();

        if (!cleanName) {
            return null;
        }

        // Essayer de reconnaître un adhérent existant
        const recognizedMember = this.recognizeMember(cleanName);

        // ⚠️ RECONNAISSANCE STRICTE : Si le membre n'est PAS trouvé dans la BDD, on retourne null
        if (!recognizedMember) {
            console.log(`❌ "${cleanName}" n'est pas dans la base de données - IGNORÉ`);
            return null;
        }

        // ✅ Membre reconnu : charger le genre et niveau depuis member_training_profiles
        let savedGender = 'homme';
        let savedLevel = 'intermediaire';

        // Charger depuis member_training_profiles si disponible
        if (recognizedMember._trainingProfile) {
            savedGender = recognizedMember._trainingProfile.gender || savedGender;
            savedLevel = recognizedMember._trainingProfile.level || savedLevel;
            console.log(`📥 Profil chargé pour ${cleanName}: ${savedLevel} / ${savedGender}`);
        } else {
            console.log(
                `⚠️ Pas de profil d'entraînement pour ${cleanName}, valeurs par défaut appliquées`
            );
        }

        return {
            originalLine: line,
            cleanName: cleanName,
            recognizedMember: recognizedMember,
            isInDatabase: true, // Toujours true car on ne retourne que les membres reconnus
            gender: savedGender,
            level: savedLevel,
            id: Date.now() + Math.random() // ID temporaire
        };
    },

    // Reconnaissance STRICTE des adhérents - CORRESPONDANCE EXACTE UNIQUEMENT
    recognizeMember(name) {
        // Utiliser le cache au lieu d'appeler Supabase à chaque fois
        const members = this.membersCache;

        if (!members || members.length === 0) {
            console.log('❌ Aucun membre dans le cache');
            return null;
        }

        // Nettoyer et normaliser le nom recherché
        const searchName = this.normalizeString(name);
        console.log('🔍 Recherche EXACTE pour:', searchName);

        // ⚠️ MODE STRICT : Recherche uniquement les correspondances EXACTES
        for (const member of members) {
            if (!member.name) {
                continue;
            }

            // Variations possibles du nom
            const memberNameNormalized = this.normalizeString(member.name);

            // Si le nom contient un espace, tester aussi prénom/nom inversé
            const parts = member.name.split(' ');
            const variations = [memberNameNormalized];

            if (parts.length === 2) {
                const reversed = this.normalizeString(`${parts[1]} ${parts[0]}`);
                variations.push(reversed);
            }

            // Vérifier correspondance EXACTE
            for (const variation of variations) {
                if (searchName === variation) {
                    console.log(`✅ CORRESPONDANCE EXACTE trouvée: "${name}" = "${member.name}"`);
                    return member;
                }
            }
        }

        // Aucune correspondance exacte trouvée
        console.log(`❌ Aucune correspondance EXACTE pour "${name}"`);
        return null;
    },

    // Normaliser une chaîne (enlever accents, ponctuation, espaces multiples)
    normalizeString(str) {
        if (!str) {
            return '';
        }

        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
            .replace(/[^\w\s]/g, ' ') // Remplacer la ponctuation par des espaces
            .replace(/\s+/g, ' ') // Normaliser les espaces
            .trim();
    },

    // Calculer un score phonétique (sons similaires)
    getPhoneticScore(str1, str2) {
        // Remplacements phonétiques courants en français
        const phoneticMap = {
            ph: 'f',
            qu: 'k',
            ck: 'k',
            c: 'k',
            q: 'k',
            x: 'ks',
            y: 'i',
            ain: 'in',
            ein: 'in',
            un: 'in',
            an: 'en',
            au: 'o',
            eau: 'o',
            ai: 'e',
            er: 'e',
            ez: 'e',
            et: 'e',
            oe: 'e',
            eu: 'e',
            ou: 'u'
        };

        let phonetic1 = str1;
        let phonetic2 = str2;

        // Appliquer les remplacements phonétiques
        Object.entries(phoneticMap).forEach(([from, to]) => {
            phonetic1 = phonetic1.replace(new RegExp(from, 'g'), to);
            phonetic2 = phonetic2.replace(new RegExp(from, 'g'), to);
        });

        // Calculer la similarité après transformation phonétique
        return this.calculateSimilarity(phonetic1, phonetic2);
    },

    // Calculer la similarité entre deux chaînes (algorithme de Levenshtein simplifié)
    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;

        if (longer.length === 0) {
            return 1.0;
        }

        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length;
    },

    // Distance de Levenshtein
    levenshteinDistance(str1, str2) {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    },

    // Rendre le tableau des participants
    renderParticipantsTable() {
        // Filtrer seulement les participants reconnus
        const recognizedParticipants = this.participants.filter(p => p.isInDatabase);

        if (recognizedParticipants.length === 0) {
            return `
                <div class="flex flex-col items-center justify-center py-12 text-secondary">
                    <i class="fas fa-users text-4xl mb-4 opacity-50"></i>
                    <p class="text-lg font-medium">Aucun adhérent reconnu</p>
                    <p class="text-sm">Collez votre liste et cliquez sur "Reconnaître"</p>
                </div>
            `;
        }

        return `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="glass-panel">
                        <tr>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Participant</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Genre</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Niveau</th>
                            <th class="px-6 py-4 text-center text-xs font-semibold text-secondary uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-glass">
                        ${recognizedParticipants
                            .map(
                                participant => `
                            <tr class="glass-list-item transition-colors duration-200">
                                <td class="px-6 py-4">
                                    <div class="flex items-center">
                                        <div class="flex-shrink-0">
                                            <i class="fas fa-user-check text-green-400"></i>
                                        </div>
                                        <div class="ml-3">
                                            <div class="text-sm font-medium">${participant.cleanName}</div>
                                            <div class="text-xs text-green-400">✓ ${participant.recognizedMember.firstName} ${participant.recognizedMember.lastName}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex space-x-4">
                                        <label class="flex items-center">
                                            <input type="radio" name="gender_${participant.id}" value="homme"
                                                   ${participant.gender === 'homme' ? 'checked' : ''}
                                                   onchange="TeamBuilder.updateParticipantGender('${participant.id}', 'homme')"
                                                   class="form-radio text-blue-400 focus:ring-blue-400">
                                            <span class="ml-2 text-sm">Homme</span>
                                        </label>
                                        <label class="flex items-center">
                                            <input type="radio" name="gender_${participant.id}" value="femme"
                                                   ${participant.gender === 'femme' ? 'checked' : ''}
                                                   onchange="TeamBuilder.updateParticipantGender('${participant.id}', 'femme')"
                                                   class="form-radio text-pink-400 focus:ring-pink-400">
                                            <span class="ml-2 text-sm">Femme</span>
                                        </label>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <select onchange="TeamBuilder.updateParticipantLevel('${participant.id}', this.value)"
                                            class="form-select px-3 py-2 rounded-lg text-sm">
                                        <option value="debutant" ${participant.level === 'debutant' ? 'selected' : ''}>Débutant</option>
                                        <option value="intermediaire" ${participant.level === 'intermediaire' ? 'selected' : ''}>Intermédiaire</option>
                                        <option value="avance" ${participant.level === 'avance' ? 'selected' : ''}>Avancé</option>
                                    </select>
                                </td>
                                <td class="px-6 py-4 text-center">
                                    <button onclick="TeamBuilder.removeParticipant(${participant.id})" 
                                            class="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-all duration-200"
                                            title="Supprimer">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `
                            )
                            .join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    // Mettre à jour la liste des participants
    updateParticipantsList() {
        const container = document.getElementById('participantsList');
        if (container) {
            container.innerHTML = this.renderParticipantsCompact();
            this.updateStatistics();
        }
    },

    // Mettre à jour les statistiques
    updateStatistics() {
        const recognizedParticipants = this.participants.filter(p => p.isInDatabase);
        const totalParticipants = this.participants.length;
        const maleCount = recognizedParticipants.filter(p => p.gender === 'homme').length;
        const femaleCount = recognizedParticipants.filter(p => p.gender === 'femme').length;

        // Mettre à jour les compteurs
        const totalEl = document.getElementById('totalParticipants');
        const recognizedEl = document.getElementById('recognizedParticipants');
        const maleEl = document.getElementById('maleCount');
        const femaleEl = document.getElementById('femaleCount');
        const countEl = document.getElementById('participantCount');

        if (totalEl) {
            totalEl.textContent = totalParticipants;
        }
        if (recognizedEl) {
            recognizedEl.textContent = recognizedParticipants.length;
        }
        if (maleEl) {
            maleEl.textContent = maleCount;
        }
        if (femaleEl) {
            femaleEl.textContent = femaleCount;
        }
        if (countEl) {
            countEl.textContent = recognizedParticipants.length;
        }
    },

    // Supprimer un participant
    removeParticipant(participantId) {
        console.log('Suppression du participant avec ID:', participantId);
        console.log('Participants avant suppression:', this.participants.length);

        this.participants = this.participants.filter(p => p.id !== participantId);

        console.log('Participants après suppression:', this.participants.length);
        this.updateParticipantsList();
        this.showNotification('Participant supprimé', 'info');
    },

    // Mettre à jour le genre d'un participant (ASYNC pour Supabase + member_training_profiles)
    async updateParticipantGender(id, gender) {
        const participant = this.participants.find(p => p.id === parseFloat(id));
        if (participant) {
            participant.gender = gender;

            // Sauvegarder dans member_training_profiles
            if (participant.recognizedMember && typeof SupabaseManager !== 'undefined') {
                try {
                    const memberId = participant.recognizedMember.id;

                    // Récupérer le niveau actuel
                    const currentLevel = participant.level || 'intermediaire';

                    // Sauvegarder dans member_training_profiles
                    await this.saveTrainingProfile(memberId, {
                        level: currentLevel,
                        gender: gender
                    });

                    console.log(
                        `💾 Genre sauvegardé dans member_training_profiles pour ${participant.cleanName}: ${gender}`
                    );
                } catch (error) {
                    console.error('❌ Erreur lors de la sauvegarde du genre:', error);
                }
            }

            // Mise à jour visuelle immédiate des boutons avec styles inline
            const hommeBtn = document.getElementById(`gender-homme-${id}`);
            const femmeBtn = document.getElementById(`gender-femme-${id}`);

            if (hommeBtn && femmeBtn) {
                if (gender === 'homme') {
                    hommeBtn.style.cssText =
                        'flex: 1; padding: 0.5rem; border-radius: 0.5rem; border: none; cursor: pointer; transition: all 0.2s; font-size: 1rem; background: #60a5fa; color: white;';
                    femmeBtn.style.cssText =
                        'flex: 1; padding: 0.5rem; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; font-size: 1rem; background: var(--glass-bg); color: var(--text-muted); border: 1px solid var(--glass-border);';
                } else {
                    hommeBtn.style.cssText =
                        'flex: 1; padding: 0.5rem; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; font-size: 1rem; background: var(--glass-bg); color: var(--text-muted); border: 1px solid var(--glass-border);';
                    femmeBtn.style.cssText =
                        'flex: 1; padding: 0.5rem; border-radius: 0.5rem; border: none; cursor: pointer; transition: all 0.2s; font-size: 1rem; background: #f472b6; color: white;';
                }
            }

            this.updateStatistics();
        }
    },

    // Mettre à jour le niveau d'un participant (ASYNC pour Supabase + member_training_profiles)
    async updateParticipantLevel(id, level) {
        const participant = this.participants.find(p => p.id === parseFloat(id));
        if (participant) {
            participant.level = level;

            // Sauvegarder dans member_training_profiles
            if (participant.recognizedMember && typeof SupabaseManager !== 'undefined') {
                try {
                    const memberId = participant.recognizedMember.id;

                    // Récupérer le genre actuel
                    const currentGender = participant.gender || 'homme';

                    // Sauvegarder dans member_training_profiles
                    await this.saveTrainingProfile(memberId, {
                        level: level,
                        gender: currentGender
                    });

                    console.log(
                        `💾 Niveau sauvegardé dans member_training_profiles pour ${participant.cleanName}: ${level}`
                    );
                } catch (error) {
                    console.error('❌ Erreur lors de la sauvegarde du niveau:', error);
                }
            }
        }
    },

    // Sauvegarder le profil d'entraînement dans member_training_profiles
    async saveTrainingProfile(memberId, profile) {
        try {
            console.log('💾 Sauvegarde profil TeamBuilder:', memberId, profile);

            // Vérifier si un profil existe
            const { data: existing, error: checkError } = await SupabaseManager.supabase
                .from('member_training_profiles')
                .select('id')
                .eq('member_id', memberId)
                .maybeSingle();

            if (checkError) {
                console.error('⚠️ Erreur vérification profil:', checkError);
            }

            const profileData = {
                member_id: memberId,
                level: profile.level,
                gender: profile.gender
            };

            let result;
            if (existing) {
                // UPDATE
                result = await SupabaseManager.supabase
                    .from('member_training_profiles')
                    .update({
                        level: profile.level,
                        gender: profile.gender
                    })
                    .eq('member_id', memberId)
                    .select();
            } else {
                // INSERT
                result = await SupabaseManager.supabase
                    .from('member_training_profiles')
                    .insert([profileData])
                    .select();
            }

            if (result.error) {
                console.error('❌ Erreur SQL:', result.error);
                throw result.error;
            }

            console.log("✅ Profil d'entraînement sauvegardé depuis TeamBuilder");
        } catch (error) {
            console.error('❌ Exception saveTrainingProfile:', error);
            throw error;
        }
    },

    // Mettre à jour le mode de création d'équipes
    updateTeamMode(mode) {
        this.teamSettings.mode = mode;
        console.log(`⚙️ Mode changé: ${mode}`);

        // Mise à jour visuelle des boutons avec styles inline
        const teamsBtn = document.getElementById('modeTeamsBtn');
        const sizeBtn = document.getElementById('modeSizeBtn');

        if (teamsBtn && sizeBtn) {
            if (mode === 'teams') {
                teamsBtn.style.cssText =
                    'flex: 1; padding: 0.75rem; border-radius: 0.5rem; font-weight: 600; transition: all 0.2s; background: var(--accent-primary); color: var(--bg-primary); border: none; cursor: pointer;';
                sizeBtn.style.cssText =
                    'flex: 1; padding: 0.75rem; border-radius: 0.5rem; font-weight: 600; transition: all 0.2s; background: transparent; color: var(--text-secondary); border: none; cursor: pointer;';
            } else {
                teamsBtn.style.cssText =
                    'flex: 1; padding: 0.75rem; border-radius: 0.5rem; font-weight: 600; transition: all 0.2s; background: transparent; color: var(--text-secondary); border: none; cursor: pointer;';
                sizeBtn.style.cssText =
                    'flex: 1; padding: 0.75rem; border-radius: 0.5rem; font-weight: 600; transition: all 0.2s; background: var(--accent-primary); color: var(--bg-primary); border: none; cursor: pointer;';
            }
        }

        // Mettre à jour le container de l'input de valeur
        const valueContainer = document.getElementById('valueInputContainer');
        if (valueContainer) {
            if (mode === 'teams') {
                valueContainer.innerHTML = `
                    <input type="number" id="numberOfTeams" min="2" max="10" value="${this.teamSettings.numberOfTeams}"
                           onchange="TeamBuilder.updateTeamSettings()"
                           class="form-input"
                           style="width: 100%; padding: 1rem; font-size: 2rem; font-weight: 900; text-align: center; border-radius: 0.75rem;">
                `;
            } else {
                valueContainer.innerHTML = `
                    <input type="number" id="teamSize" min="2" max="8" value="${this.teamSettings.teamSize}"
                           onchange="TeamBuilder.updateTeamSettings()"
                           class="form-input"
                           style="width: 100%; padding: 1rem; font-size: 2rem; font-weight: 900; text-align: center; border-radius: 0.75rem;">
                `;
            }
            console.log(`✓ Input mis à jour pour mode: ${mode}`);
        }
    },

    // Mettre à jour le mode d'équilibrage
    updateBalanceMode(mode) {
        this.teamSettings.balanceMode = mode;
        console.log(`⚖️ Mode d'équilibrage changé: ${mode === 'level' ? 'Par Niveau' : 'Équilibré'}`);

        // Mise à jour visuelle des boutons avec styles inline
        const homogeneousBtn = document.getElementById('balanceHomogeneousBtn');
        const levelBtn = document.getElementById('balanceLevelBtn');

        if (homogeneousBtn && levelBtn) {
            if (mode === 'homogeneous') {
                homogeneousBtn.style.cssText =
                    'flex: 1; padding: 1rem; border-radius: 0.75rem; font-weight: 600; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; background: var(--accent-secondary); color: var(--bg-primary); border: none; cursor: pointer;';
                levelBtn.style.cssText =
                    'flex: 1; padding: 1rem; border-radius: 0.75rem; font-weight: 600; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; background: var(--glass-bg); color: var(--text-secondary); border: 1px solid var(--glass-border); cursor: pointer;';
            } else {
                homogeneousBtn.style.cssText =
                    'flex: 1; padding: 1rem; border-radius: 0.75rem; font-weight: 600; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; background: var(--glass-bg); color: var(--text-secondary); border: 1px solid var(--glass-border); cursor: pointer;';
                levelBtn.style.cssText =
                    'flex: 1; padding: 1rem; border-radius: 0.75rem; font-weight: 600; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; background: var(--accent-secondary); color: var(--bg-primary); border: none; cursor: pointer;';
            }
        }
    },

    // Mettre à jour les paramètres d'équipes (appelé quand l'utilisateur change les inputs)
    updateTeamSettings() {
        // Récupérer les valeurs des inputs
        const numberOfTeamsInput = document.getElementById('numberOfTeams');
        const teamSizeInput = document.getElementById('teamSize');

        console.log(`📝 updateTeamSettings appelé - Mode actuel: ${this.teamSettings.mode}`);
        console.log(`   numberOfTeamsInput: ${numberOfTeamsInput ? numberOfTeamsInput.value : 'non trouvé'}`);
        console.log(`   teamSizeInput: ${teamSizeInput ? teamSizeInput.value : 'non trouvé'}`);

        if (this.teamSettings.mode === 'teams' && numberOfTeamsInput) {
            const value = parseInt(numberOfTeamsInput.value);
            if (!isNaN(value) && value >= 2 && value <= 10) {
                this.teamSettings.numberOfTeams = value;
                console.log(`✅ Nombre d'équipes mis à jour: ${value}`);
            } else {
                console.warn(`⚠️ Valeur invalide pour nombre d'équipes: ${numberOfTeamsInput.value}`);
            }
        } else if (this.teamSettings.mode === 'size' && teamSizeInput) {
            const value = parseInt(teamSizeInput.value);
            if (!isNaN(value) && value >= 2 && value <= 8) {
                this.teamSettings.teamSize = value;
                console.log(`✅ Taille d'équipe mise à jour: ${value}`);
            } else {
                console.warn(`⚠️ Valeur invalide pour taille d'équipe: ${teamSizeInput.value}`);
            }
        }
    },

    // Mélanger aléatoirement un tableau (Fisher-Yates shuffle)
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    // Générer les équipes
    generateTeams() {
        // Filtrer seulement les participants reconnus
        const recognizedParticipants = this.participants.filter(p => p.isInDatabase);

        if (recognizedParticipants.length === 0) {
            this.showNotification(
                'Veuillez ajouter des participants reconnus avant de créer les équipes.',
                'warning'
            );
            return;
        }

        // Vérifier que tous les participants ont un genre et un niveau
        const incompleteParticipants = recognizedParticipants.filter(p => !p.gender || !p.level);
        if (incompleteParticipants.length > 0) {
            this.showNotification(
                'Veuillez définir le genre et le niveau pour tous les participants.',
                'error'
            );
            return;
        }

        // Déterminer le nombre d'équipes
        const totalParticipants = recognizedParticipants.length;
        let numberOfTeams;

        console.log("\n=== GÉNÉRATION D'ÉQUIPES - DÉMARRAGE ===");
        console.log(`📊 Configuration actuelle:`);
        console.log(`   mode: ${this.teamSettings.mode}`);
        console.log(`   balanceMode: ${this.teamSettings.balanceMode}`);
        console.log(`   numberOfTeams (config): ${this.teamSettings.numberOfTeams}`);
        console.log(`   teamSize (config): ${this.teamSettings.teamSize}`);

        if (this.teamSettings.mode === 'teams') {
            const input = document.getElementById('numberOfTeams');
            numberOfTeams = parseInt(input?.value || this.teamSettings.numberOfTeams);
            console.log(`✓ Mode "Nombre d'équipes" - Input trouvé: ${input ? 'oui' : 'non'}`);
            console.log(`✓ Valeur récupérée: ${numberOfTeams}`);
        } else {
            const input = document.getElementById('teamSize');
            const teamSize = parseInt(input?.value || this.teamSettings.teamSize);
            numberOfTeams = Math.ceil(totalParticipants / teamSize);
            console.log(`✓ Mode "Taille d'équipe" - Input trouvé: ${input ? 'oui' : 'non'}`);
            console.log(`✓ Taille récupérée: ${teamSize}`);
            console.log(`✓ Nombre d'équipes calculé: ${numberOfTeams} (${totalParticipants} participants / ${teamSize} par équipe)`);
        }

        console.log(`\n📋 Résumé:`);
        console.log(
            `   Mode: ${this.teamSettings.mode === 'teams' ? "Nombre d'équipes" : "Taille d'équipe"}`
        );
        console.log(
            `   Type: ${this.teamSettings.balanceMode === 'level' ? 'Par niveau (même points ensemble)' : 'Équilibré (total points égal)'}`
        );
        console.log(`   Nombre d'équipes: ${numberOfTeams}`);
        console.log(`   Total participants: ${totalParticipants}\n`);

        // Générer selon le mode d'équilibrage
        if (this.teamSettings.balanceMode === 'level') {
            console.log(`🎯 Appel de generateLevelBasedTeams(${numberOfTeams})`);
            this.generateLevelBasedTeams(recognizedParticipants, numberOfTeams);
        } else {
            console.log(`⚖️ Appel de generateHomogeneousTeams(${numberOfTeams})`);
            this.generateHomogeneousTeams(recognizedParticipants, numberOfTeams);
        }

        this.displayTeams();
    },

    // MODE "PAR NIVEAU" : Regrouper les participants du même niveau ensemble
    // Objectif: Équipe 1 = Les meilleurs, Équipe 2 = Les moyens, Équipe 3 = Les débutants
    generateLevelBasedTeams(participants, numberOfTeams) {
        console.log('🎯 MODE PAR NIVEAU: Regrouper par niveau (meilleurs ensemble)\n');

        // Calculer les points par niveau et genre
        const levelPoints = { debutant: 1, intermediaire: 2, enforme: 3, tresenforme: 4 };
        const genderPoints = { homme: 2, femme: 1 };

        // Calculer les points totaux pour chaque participant
        participants.forEach(p => {
            p.totalPoints = levelPoints[p.level] + genderPoints[p.gender];
        });

        // TRIER du MEILLEUR au MOINS BON (par points décroissants)
        const sortedParticipants = [...participants].sort((a, b) => b.totalPoints - a.totalPoints);

        console.log('📊 Liste triée par niveau (meilleurs → débutants):');
        sortedParticipants.forEach((p, i) => {
            console.log(`  ${i + 1}. ${p.cleanName} - ${p.totalPoints}pts (${p.level}, ${p.gender})`);
        });

        // Grouper par points identiques
        const byPoints = {};
        sortedParticipants.forEach(p => {
            if (!byPoints[p.totalPoints]) {
                byPoints[p.totalPoints] = [];
            }
            byPoints[p.totalPoints].push(p);
        });

        console.log('\n📋 Répartition par points:');
        Object.keys(byPoints)
            .sort((a, b) => parseInt(b) - parseInt(a))
            .forEach(pts => {
                console.log(`  ${pts} points: ${byPoints[pts].length} personnes`);
            });

        // Créer les équipes vides
        this.teams = [];

        // Calculer la taille idéale d'équipe
        const idealTeamSize = Math.ceil(participants.length / numberOfTeams);

        console.log(`\n⚙️ Taille idéale par équipe: ${idealTeamSize} personnes`);
        console.log('\n🔄 Distribution par niveau (groupes homogènes):');

        let currentTeamIndex = 0;
        let currentTeam = null;

        // Pour chaque groupe de points (du plus haut au plus bas)
        Object.keys(byPoints)
            .sort((a, b) => parseInt(b) - parseInt(a))
            .forEach(pointValue => {
                const group = byPoints[pointValue];
                const pts = parseInt(pointValue);

                console.log(`\n  📦 Groupe ${pts}pts (${group.length} personnes):`);

                // MÉLANGER le groupe pour varier les compositions
                this.shuffleArray(group);

                // Distribuer ce groupe dans les équipes
                group.forEach(participant => {
                    // Créer une nouvelle équipe si nécessaire
                    if (!currentTeam || currentTeam.members.length >= idealTeamSize) {
                        // Si on a atteint le nombre max d'équipes, compléter l'équipe la moins remplie
                        if (this.teams.length >= numberOfTeams) {
                            currentTeam = this.teams.reduce(
                                (min, team) => (team.members.length < min.members.length ? team : min),
                                this.teams[0]
                            );
                        } else {
                            // Créer une nouvelle équipe
                            currentTeamIndex = this.teams.length;
                            currentTeam = {
                                id: currentTeamIndex + 1,
                                name: `Équipe ${currentTeamIndex + 1}`,
                                members: [],
                                stats: {
                                    hommes: 0,
                                    femmes: 0,
                                    debutants: 0,
                                    intermediaires: 0,
                                    enformes: 0,
                                    tresenformes: 0,
                                    totalPoints: 0
                                }
                            };
                            this.teams.push(currentTeam);
                        }
                    }

                    // Ajouter le participant à l'équipe
                    currentTeam.members.push(participant);

                    // Mettre à jour les statistiques
                    if (participant.gender === 'homme') {
                        currentTeam.stats.hommes++;
                    } else {
                        currentTeam.stats.femmes++;
                    }
                    currentTeam.stats[participant.level + 's']++;
                    currentTeam.stats.totalPoints += participant.totalPoints;

                    console.log(`    ✓ ${participant.cleanName} → Équipe ${currentTeam.id}`);
                });
            });

        // Afficher le résultat final
        console.log('\n✅ RÉSULTAT FINAL:');
        this.teams.forEach(team => {
            const avgPoints = (team.stats.totalPoints / team.members.length).toFixed(1);

            // Distribution des points dans l'équipe
            const pointsDistribution = {};
            team.members.forEach(m => {
                pointsDistribution[m.totalPoints] = (pointsDistribution[m.totalPoints] || 0) + 1;
            });
            const pointsStr = Object.keys(pointsDistribution)
                .sort((a, b) => parseInt(b) - parseInt(a))
                .map(pts => `${pts}pts×${pointsDistribution[pts]}`)
                .join(' + ');

            console.log(
                `  Équipe ${team.id}: ${team.members.length} membres | [${pointsStr}] | Total: ${team.stats.totalPoints}pts | Moy: ${avgPoints}pts`
            );
        });

        const avgPointsPerTeam = this.teams.map(t =>
            t.members.length > 0 ? (t.stats.totalPoints / t.members.length).toFixed(1) : '0'
        );

        this.showNotification(
            `✓ ${this.teams.length} équipes par niveau créées. Moyennes: ${avgPointsPerTeam.join('pts, ')}pts`,
            'success'
        );
    },

    // MODE "ÉQUILIBRÉ" : Créer des équipes avec le même total de points
    // Objectif: Équipe 1 = 25pts, Équipe 2 = 25pts (mix de tous les niveaux)
    generateHomogeneousTeams(participants, numberOfTeams) {
        console.log('⚖️ MODE ÉQUILIBRÉ: Total de points identique par équipe\n');

        // Calculer les points par niveau et genre
        const levelPoints = { debutant: 1, intermediaire: 2, enforme: 3, tresenforme: 4 };
        const genderPoints = { homme: 2, femme: 1 };

        // Calculer les points totaux pour chaque participant
        participants.forEach(p => {
            p.totalPoints = levelPoints[p.level] + genderPoints[p.gender];
        });

        // Trier par points totaux (du plus fort au plus faible)
        const sortedParticipants = [...participants].sort((a, b) => b.totalPoints - a.totalPoints);

        // MÉLANGER les participants de même niveau pour varier les équipes
        // On mélange les participants ayant les mêmes points pour éviter toujours les mêmes équipes
        const byPoints = {};
        sortedParticipants.forEach(p => {
            if (!byPoints[p.totalPoints]) {
                byPoints[p.totalPoints] = [];
            }
            byPoints[p.totalPoints].push(p);
        });

        // Mélanger chaque groupe de points
        Object.values(byPoints).forEach(group => this.shuffleArray(group));

        // Recréer le tableau trié mais avec groupes mélangés
        const shuffledSorted = [];
        Object.keys(byPoints)
            .sort((a, b) => parseInt(b) - parseInt(a))
            .forEach(pts => {
                shuffledSorted.push(...byPoints[pts]);
            });

        console.log('📊 Participants triés par points (mélangés par groupe):');
        shuffledSorted.forEach(p => {
            console.log(`  ${p.cleanName}: ${p.totalPoints}pts (${p.level}, ${p.gender})`);
        });

        // Créer les équipes vides
        this.teams = [];
        for (let i = 0; i < numberOfTeams; i++) {
            this.teams.push({
                id: i + 1,
                name: `Équipe ${i + 1}`,
                members: [],
                stats: {
                    hommes: 0,
                    femmes: 0,
                    debutants: 0,
                    intermediaires: 0,
                    enformes: 0,
                    tresenformes: 0,
                    totalPoints: 0
                }
            });
        }

        // Distribuer les participants de manière équilibrée (greedy algorithm)
        console.log('\n🔄 Distribution équilibrée:');
        shuffledSorted.forEach(participant => {
            // Trouver l'équipe avec le moins de points total
            let bestTeam = this.teams[0];
            let minPoints = bestTeam.stats.totalPoints;

            for (let team of this.teams) {
                if (team.stats.totalPoints < minPoints) {
                    minPoints = team.stats.totalPoints;
                    bestTeam = team;
                }
            }

            // Ajouter le participant à la meilleure équipe
            bestTeam.members.push(participant);

            // Mettre à jour les statistiques
            if (participant.gender === 'homme') {
                bestTeam.stats.hommes++;
            } else {
                bestTeam.stats.femmes++;
            }
            bestTeam.stats[participant.level + 's']++;
            bestTeam.stats.totalPoints += participant.totalPoints;

            console.log(
                `  ✓ ${participant.cleanName} (${participant.totalPoints}pts) → Équipe ${bestTeam.id} (total: ${bestTeam.stats.totalPoints}pts)`
            );
        });

        // Afficher le résultat
        console.log('\n✅ RÉSULTAT:');
        this.teams.forEach(team => {
            console.log(
                `  Équipe ${team.id}: ${team.members.length} membres = ${team.stats.totalPoints}pts total`
            );
        });

        const points = this.teams.map(team => team.stats.totalPoints);
        const minPoints = Math.min(...points);
        const maxPoints = Math.max(...points);
        const gap = maxPoints - minPoints;

        this.showNotification(
            `✓ Équilibré: Toutes les équipes ont un total de points similaire. Écart: ${gap}pts`,
            'success'
        );
    },

    // Afficher les équipes - VERSION MODERNE GORILLA GLASS HERO
    displayTeams() {
        const resultsDiv = document.getElementById('teamsResults');
        const teamsDisplay = document.getElementById('teamsDisplay');

        if (resultsDiv && teamsDisplay) {
            resultsDiv.classList.remove('hidden');
            resultsDiv.scrollIntoView({ behavior: 'smooth' });

            // Couleurs distinctes pour chaque équipe
            const teamColors = [
                {
                    bg: 'rgba(59, 130, 246, 0.1)',
                    border: 'rgba(59, 130, 246, 0.3)',
                    text: '#60a5fa'
                }, // Bleu
                {
                    bg: 'rgba(236, 72, 153, 0.1)',
                    border: 'rgba(236, 72, 153, 0.3)',
                    text: '#f472b6'
                }, // Rose
                { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', text: '#4ade80' }, // Vert
                {
                    bg: 'rgba(251, 146, 60, 0.1)',
                    border: 'rgba(251, 146, 60, 0.3)',
                    text: '#fb923c'
                }, // Orange
                {
                    bg: 'rgba(168, 85, 247, 0.1)',
                    border: 'rgba(168, 85, 247, 0.3)',
                    text: '#a855f7'
                }, // Violet
                { bg: 'rgba(234, 179, 8, 0.1)', border: 'rgba(234, 179, 8, 0.3)', text: '#facc15' } // Jaune
            ];

            teamsDisplay.innerHTML = this.teams
                .map((team, index) => {
                    const stats = team.stats;
                    const color = teamColors[index % teamColors.length];

                    return `
                <div class="glass-card" style="padding: 1.5rem; background: ${color.bg}; border-color: ${color.border}; transition: all 0.3s;"
                     onmouseenter="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 30px rgba(0, 0, 0, 0.3)';"
                     onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='';">

                    <!-- Header de l'équipe -->
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid ${color.border};">
                        <h4 style="font-size: 1.25rem; font-weight: 800; color: ${color.text}; display: flex; align-items: center;">
                            <i class="fas fa-shield-alt" style="margin-right: 0.75rem;"></i>
                            ${team.name}
                        </h4>
                        <div style="text-align: right;">
                            <div style="font-size: 1.5rem; font-weight: 900; color: ${color.text};">${stats.totalPoints}pts</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">${team.members.length} membres</div>
                        </div>
                    </div>

                    <!-- Stats rapides -->
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; padding: 0.75rem; background: var(--glass-bg); border-radius: 0.5rem; font-size: 0.875rem;">
                        <div style="display: flex; gap: 0.5rem;">
                            <span style="color: #60a5fa; font-weight: 600;">${stats.hommes}♂</span>
                            <span style="color: #f472b6; font-weight: 600;">${stats.femmes}♀</span>
                        </div>
                        <div style="width: 1px; height: 1rem; background: var(--glass-border);"></div>
                        <div style="display: flex; gap: 0.5rem;">
                            <span>🟢${stats.debutants}</span>
                            <span>🟡${stats.intermediaires}</span>
                            <span>🟠${stats.enformes}</span>
                            <span>🔴${stats.tresenformes}</span>
                        </div>
                    </div>

                    <!-- Membres - Liste compacte moderne -->
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        ${team.members
                            .map(member => {
                                const levelEmoji =
                                    member.level === 'debutant'
                                        ? '🟢'
                                        : member.level === 'intermediaire'
                                          ? '🟡'
                                          : member.level === 'enforme'
                                            ? '🟠'
                                            : '🔴';
                                const memberPoints = member.totalPoints || 0;
                                const genderColor =
                                    member.gender === 'homme' ? '#60a5fa' : '#f472b6';

                                return `
                            <div style="display: flex; align-items: center; padding: 0.75rem; background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 0.5rem; transition: all 0.2s; cursor: default;"
                                 onmouseenter="this.style.background='var(--surface-2)'; this.style.borderColor='${color.border}';"
                                 onmouseleave="this.style.background='var(--glass-bg)'; this.style.borderColor='var(--glass-border)';">
                                <span style="margin-right: 0.75rem; color: ${genderColor}; font-size: 1.125rem;">${member.gender === 'homme' ? '♂' : '♀'}</span>
                                <span style="flex: 1; font-weight: 600; color: var(--text-primary); font-size: 0.875rem;">${member.cleanName}</span>
                                <span style="margin-right: 0.75rem; font-size: 1rem;">${levelEmoji}</span>
                                <span style="font-size: 0.75rem; font-weight: 700; color: ${color.text}; background: ${color.bg}; padding: 0.25rem 0.75rem; border-radius: 1rem;">${memberPoints}pts</span>
                            </div>
                        `;
                            })
                            .join('')}
                    </div>
                </div>
            `;
                })
                .join('');
        }
    },

    // Régénérer les équipes avec optimisation
    regenerateTeams() {
        console.log('🔄 Régénération des équipes avec mélange aléatoire...');

        // Simplement rappeler generateTeams() qui va mélanger les groupes de points
        this.generateTeams();

        this.showNotification('Équipes régénérées avec de nouvelles combinaisons !', 'success');
    },

    // Trouver la meilleure combinaison d'équipes
    findBestTeamCombination(participants) {
        const totalParticipants = participants.length;
        let numberOfTeams, teamSize;

        if (this.teamSettings.mode === 'teams') {
            numberOfTeams = parseInt(
                document.getElementById('numberOfTeams')?.value || this.teamSettings.numberOfTeams
            );
            teamSize = Math.ceil(totalParticipants / numberOfTeams);
        } else {
            teamSize = parseInt(
                document.getElementById('teamSize')?.value || this.teamSettings.teamSize
            );
            numberOfTeams = Math.ceil(totalParticipants / teamSize);
        }

        // Calculer les points par niveau et genre
        const levelPoints = { debutant: 1, intermediaire: 2, avance: 3 };
        const genderPoints = { homme: 2, femme: 1 };

        let bestTeams = null;
        let bestScore = Infinity; // Plus le score est bas, mieux c'est (écart minimal)

        // Tester plusieurs combinaisons (jusqu'à 50 tentatives)
        const maxAttempts = Math.min(50, 1000); // Limiter pour éviter les performances lentes

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const teams = this.generateRandomTeams(
                participants,
                numberOfTeams,
                levelPoints,
                genderPoints
            );
            const score = this.calculateTeamBalanceScore(teams);

            if (score < bestScore) {
                bestScore = score;
                bestTeams = teams;

                // Si on trouve un score parfait (0), on peut s'arrêter
                if (score === 0) {
                    console.log(`Score parfait trouvé à la tentative ${attempt + 1}`);
                    break;
                }
            }
        }

        console.log(`Meilleur score trouvé: ${bestScore} (${maxAttempts} tentatives testées)`);
        return bestTeams;
    },

    // Générer des équipes aléatoires
    generateRandomTeams(participants, numberOfTeams, levelPoints, genderPoints) {
        // Mélanger les participants
        const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5);

        // Créer les équipes vides avec statistiques
        const teams = [];
        for (let i = 0; i < numberOfTeams; i++) {
            teams.push({
                id: i + 1,
                name: `Équipe ${i + 1}`,
                members: [],
                stats: {
                    hommes: 0,
                    femmes: 0,
                    debutants: 0,
                    intermediaires: 0,
                    avances: 0,
                    totalPoints: 0
                }
            });
        }

        // Distribuer les participants de manière équilibrée
        shuffledParticipants.forEach(participant => {
            // Trouver l'équipe avec le moins de points total
            let bestTeam = teams[0];
            let minPoints = bestTeam.stats.totalPoints;

            for (let team of teams) {
                if (team.stats.totalPoints < minPoints) {
                    minPoints = team.stats.totalPoints;
                    bestTeam = team;
                }
            }

            // Ajouter le participant à la meilleure équipe
            bestTeam.members.push(participant);

            // Mettre à jour les statistiques
            if (participant.gender === 'homme') {
                bestTeam.stats.hommes++;
            } else {
                bestTeam.stats.femmes++;
            }

            bestTeam.stats[participant.level + 's']++;
            // Calculer les points totaux : niveau + genre
            const participantPoints =
                levelPoints[participant.level] + genderPoints[participant.gender];
            bestTeam.stats.totalPoints += participantPoints;
        });

        return teams;
    },

    // Calculer le score d'équilibre des équipes (plus bas = mieux)
    calculateTeamBalanceScore(teams) {
        if (teams.length === 0) {
            return Infinity;
        }

        const points = teams.map(team => team.stats.totalPoints);
        const minPoints = Math.min(...points);
        const maxPoints = Math.max(...points);

        // Score principal : écart de points entre les équipes
        const pointGap = maxPoints - minPoints;

        // Score secondaire : écart de nombre de membres
        const memberCounts = teams.map(team => team.members.length);
        const minMembers = Math.min(...memberCounts);
        const maxMembers = Math.max(...memberCounts);
        const memberGap = maxMembers - minMembers;

        // Score tertiaire : équilibre genre (pénaliser les équipes trop déséquilibrées)
        let genderImbalance = 0;
        teams.forEach(team => {
            const totalMembers = team.members.length;
            if (totalMembers > 0) {
                const genderRatio = Math.abs(team.stats.hommes - team.stats.femmes) / totalMembers;
                genderImbalance += genderRatio;
            }
        });

        // Score final : pondération des différents facteurs
        const finalScore = pointGap * 10 + memberGap * 5 + genderImbalance * 3;

        return finalScore;
    },

    // Copier les équipes dans le presse-papiers
    copyTeamsToClipboard() {
        if (this.teams.length === 0) {
            this.showNotification('Aucune équipe à copier.', 'warning');
            return;
        }

        let textToCopy = 'Composition des équipes :\n\n';
        this.teams.forEach(team => {
            textToCopy += `${team.name} (${team.members.length} membres):\n`;
            team.members.forEach(member => {
                textToCopy += `- ${member.cleanName} (${member.gender}, ${member.level})\n`;
            });
            textToCopy += '\n';
        });

        navigator.clipboard
            .writeText(textToCopy)
            .then(() => {
                this.showNotification('Équipes copiées dans le presse-papiers !', 'success');
            })
            .catch(err => {
                console.error('Erreur lors de la copie:', err);
                this.showNotification('Échec de la copie des équipes.', 'error');
            });
    },

    // Ouvrir le modal d'ajout manuel d'adhérent
    openAddMemberModal() {
        const modal = `
            <div id="addMemberModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div class="glass-card rounded-2xl p-8 max-w-md w-full mx-6 shadow-2xl">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-2xl font-bold">
                            <i class="fas fa-user-plus mr-2 text-green-400"></i>Ajouter un adhérent
                        </h3>
                        <button onclick="TeamBuilder.closeAddMemberModal()" class="text-secondary hover:text-primary transition-colors duration-200">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    <div class="space-y-6">
                        <div>
                            <label class="form-label block text-sm mb-2">Prénom</label>
                            <input type="text" id="addMemberFirstName"
                                   class="form-input w-full px-4 py-3 rounded-lg"
                                   placeholder="Prénom">
                        </div>

                        <div>
                            <label class="form-label block text-sm mb-2">Nom</label>
                            <input type="text" id="addMemberLastName"
                                   class="form-input w-full px-4 py-3 rounded-lg"
                                   placeholder="Nom">
                        </div>

                        <div class="flex space-x-4 pt-4">
                            <button onclick="TeamBuilder.closeAddMemberModal()"
                                    class="flex-1 glass-button px-6 py-3 rounded-lg font-medium">
                                Annuler
                            </button>
                            <button onclick="TeamBuilder.addMemberManually()"
                                    class="flex-1 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium transition-all duration-200">
                                <i class="fas fa-plus mr-2"></i>Ajouter
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modalContainer').innerHTML = modal;
    },

    // Fermer le modal d'ajout manuel
    closeAddMemberModal() {
        const modal = document.getElementById('addMemberModal');
        if (modal) {
            modal.remove();
        }
    },

    // Ajouter un adhérent manuellement (ASYNC pour Supabase)
    async addMemberManually() {
        const firstName = document.getElementById('addMemberFirstName').value.trim();
        const lastName = document.getElementById('addMemberLastName').value.trim();

        if (!firstName || !lastName) {
            this.showNotification('Veuillez saisir le prénom et le nom.', 'warning');
            return;
        }

        const fullName = `${firstName} ${lastName}`;

        // Vérifier si l'adhérent existe déjà dans la liste
        const existingParticipant = this.participants.find(
            p => p.cleanName.toLowerCase() === fullName.toLowerCase()
        );

        if (existingParticipant) {
            this.showNotification('Cet adhérent est déjà dans la liste.', 'warning');
            return;
        }

        // Créer un nouvel adhérent avec la structure Supabase
        const memberData = {
            name: fullName,
            weight: 70,
            is_active: true
        };

        // Ajouter à Supabase
        let newMember = null;
        if (typeof SupabaseManager !== 'undefined') {
            try {
                newMember = await SupabaseManager.createMember(memberData);
                console.log('✅ Nouveau membre créé dans Supabase:', newMember);
            } catch (error) {
                console.error('❌ Erreur lors de la création du membre:', error);
                this.showNotification(
                    "Erreur lors de la création de l'adhérent dans Supabase",
                    'error'
                );
                return;
            }
        }

        if (!newMember) {
            this.showNotification('Erreur: SupabaseManager non disponible', 'error');
            return;
        }

        // Créer le participant
        const participant = {
            originalLine: fullName,
            cleanName: fullName,
            recognizedMember: newMember,
            isInDatabase: true,
            gender: 'homme',
            level: 'enforme',
            id: Date.now() + Math.random()
        };

        this.participants.push(participant);
        this.updateParticipantsList();
        this.closeAddMemberModal();

        this.showNotification(`Adhérent "${fullName}" ajouté avec succès`, 'success');
    },

    // Vider tout
    clearAll() {
        this.participants = [];
        this.teams = [];

        const input = document.getElementById('participantsInput');
        if (input) {
            input.value = '';
        }

        const resultsDiv = document.getElementById('teamsResults');
        if (resultsDiv) {
            resultsDiv.classList.add('hidden');
        }

        this.updateParticipantsList();
        this.showNotification('Liste vidée', 'info');
    },

    // Afficher une notification
    showNotification(message, type = 'info') {
        const colors = {
            success: 'bg-green-600',
            error: 'bg-red-600',
            warning: 'bg-yellow-600',
            info: 'bg-blue-600'
        };

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full`;
        notification.innerHTML = `<i class="${icons[type]} mr-2"></i>${message}`;
        document.body.appendChild(notification);

        // Animation d'entrée
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Suppression après 4 secondes
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 4000);
    },

    // Afficher tous les membres de la base de données (ASYNC pour Supabase)
    async showAllMembers() {
        let members = [];

        // Récupérer les membres depuis Supabase uniquement
        if (typeof SupabaseManager !== 'undefined') {
            try {
                members = await SupabaseManager.getMembers();
            } catch (error) {
                console.error('❌ Erreur lors de la récupération des membres:', error);
                this.showNotification(
                    'Erreur lors de la récupération des adhérents depuis Supabase',
                    'error'
                );
                return;
            }
        }

        if (!members || members.length === 0) {
            this.showNotification('Aucun adhérent dans la base de données Supabase', 'warning');
            return;
        }

        // Créer le modal
        const modal = `
            <div id="allMembersModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div class="glass-card rounded-2xl p-8 max-w-4xl w-full mx-6 max-h-[80vh] flex flex-col shadow-2xl">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-2xl font-bold">
                            <i class="fas fa-database mr-2 text-blue-400"></i>Base de données des adhérents (${members.length})
                        </h3>
                        <button onclick="document.getElementById('allMembersModal').remove()" class="text-secondary hover:text-primary transition-colors duration-200">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    <div class="flex-1 overflow-y-auto">
                        <div class="info-glass rounded-xl p-4 mb-4">
                            <p class="text-sm">
                                <i class="fas fa-info-circle mr-2 text-blue-400"></i>
                                Voici tous les adhérents présents dans la base. Vérifiez que les noms que vous cherchez sont bien dans cette liste.
                            </p>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            ${members
                                .map(
                                    (member, index) => `
                                <div class="glass-list-item rounded-lg p-3 hover:border-blue-400/50 transition-all duration-200">
                                    <div class="flex items-center space-x-2">
                                        <span class="text-secondary text-xs">#${index + 1}</span>
                                        <div class="flex-1">
                                            <div class="font-medium">
                                                ${member.name || 'Sans nom'}
                                            </div>
                                            ${
                                                member.email
                                                    ? `<div class="text-xs text-secondary">${member.email}</div>`
                                                    : ''
                                            }
                                        </div>
                                    </div>
                                </div>
                            `
                                )
                                .join('')}
                        </div>
                    </div>

                    <div class="mt-6 flex justify-between items-center">
                        <div class="text-sm text-secondary">
                            Structure des données: ${members[0] ? Object.keys(members[0]).join(', ') : 'Inconnue'}
                        </div>
                        <button onclick="document.getElementById('allMembersModal').remove()"
                                class="glass-button px-6 py-2 rounded-lg font-medium">
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modalContainer').innerHTML = modal;
    },

    // Sauvegarder les équipes pour le Mode TV
    saveForTVMode() {
        if (!this.teams || this.teams.length === 0) {
            alert("Veuillez d'abord générer des équipes avant de les sauvegarder");
            return;
        }

        // Sauvegarder en localStorage pour le Mode TV
        const teamsData = {
            teams: this.teams,
            config: this.teamSettings,
            timestamp: new Date().toISOString(),
            type: 'teambuilder'
        };

        try {
            localStorage.setItem('tv_teams_display', JSON.stringify(teamsData));
            console.log('Équipes sauvegardées pour Mode TV:', teamsData);

            // Feedback visuel
            const btn = document.getElementById('saveTVBtn');
            if (btn) {
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i> Sauvegarde !';
                btn.style.background = 'rgba(74, 222, 128, 0.2)';
                btn.style.borderColor = 'rgba(74, 222, 128, 0.5)';
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.style.background = '';
                    btn.style.borderColor = '';
                }, 2000);
            }

            // Informer l'utilisateur que les équipes sont disponibles dans le Mode TV
            alert(
                '✅ Équipes sauvegardées !\n\n📺 Pour afficher les équipes :\n1. Allez dans le Mode TV d\'une séance\n2. Cliquez sur le bouton "Teams" (violet)\n3. Les équipes s\'afficheront dans le 1er bloc'
            );
        } catch (error) {
            console.error('Erreur sauvegarde Mode TV:', error);
            alert('Erreur lors de la sauvegarde');
        }
    }
};
