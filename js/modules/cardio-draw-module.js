/**
 * ===================================================================
 * MODULE TIRAGE AU SORT CARDIO - Intégré à l'app
 * ===================================================================
 * Système de tirage au sort aléatoire pour créer des groupes cardio
 * - Import et reconnaissance automatique comme TeamBuilder
 * - Configuration des 5 cardios disponibles
 * - Tirage 100% aléatoire (pas d'équilibrage)
 * - Sauvegarde du dernier tirage pour affichage TV
 */

const CardioDraw = {
    // ===================================================================
    // DONNÉES
    // ===================================================================
    participants: [],
    currentDraw: null,
    membersCache: [],

    // Configuration des cardios disponibles
    cardioConfig: {
        Run: { count: 4, icon: 'fa-running', color: 'blue', selected: true },
        Bikerg: { count: 3, icon: 'fa-biking', color: 'yellow', selected: true },
        Skierg: { count: 3, icon: 'fa-skiing', color: 'cyan', selected: true },
        Rameur: { count: 4, icon: 'fa-water', color: 'green', selected: true },
        AssaultBike: { count: 4, icon: 'fa-bolt', color: 'red', selected: true }
    },

    // ===================================================================
    // INITIALISATION
    // ===================================================================
    async init() {
        console.log('🎲 Init module tirage au sort cardio...');
        await this.loadMembersCache();
    },

    async loadMembersCache() {
        if (typeof SupabaseManager !== 'undefined') {
            try {
                this.membersCache = await SupabaseManager.getMembers();
                console.log(`✅ Cache membres chargé: ${this.membersCache.length}`);
            } catch (error) {
                console.error('❌ Erreur chargement cache:', error);
                this.membersCache = [];
            }
        }
    },

    // ===================================================================
    // AFFICHAGE PRINCIPAL
    // ===================================================================
    async showCardioDraw() {
        // Désactiver tous les onglets de navigation
        if (typeof ViewManager !== 'undefined') {
            ViewManager.clearAllActiveStates();
        }

        await this.loadMembersCache();

        const recognized = this.participants.filter(p => p.isInDatabase);
        const total = this.participants.length;

        const html = `
            <div class="cardio-draw-container">
                <!-- Header Compact -->
                <div class="cardio-draw-header">
                    <h1><i class="fas fa-random"></i>Tirage Cardio Pro</h1>
                    <div class="cardio-draw-stats">
                        <div class="stat-card">
                            <div class="stat-label">Total</div>
                            <div class="stat-value" id="totalCardioPart">${total}</div>
                        </div>
                        <div class="stat-card highlight">
                            <div class="stat-label">Reconnus</div>
                            <div class="stat-value" id="recognizedCardioPart">${recognized.length}</div>
                        </div>
                    </div>
                </div>

                <!-- LAYOUT VERTICAL -->
                <div class="cardio-draw-content">

                    <!-- 1. CONFIGURATION CARDIOS -->
                    <div class="cardio-draw-section">
                        <h3><i class="fas fa-cog"></i>Configuration des cardios</h3>
                        <div class="cardio-config-grid">
                            ${Object.entries(this.cardioConfig)
                                .map(([name, config]) => {
                                    const iconColors = {
                                        Run: '#60a5fa',
                                        Bikerg: '#facc15',
                                        Skierg: '#22d3ee',
                                        Rameur: '#4ade80',
                                        AssaultBike: '#f87171'
                                    };
                                    return `
                                <div class="cardio-config-item" onclick="CardioDraw.toggleCardio('${name}')">
                                    <input type="checkbox" id="cardio-${name}" ${config.selected ? 'checked' : ''}>
                                    <i class="fas ${config.icon}" style="color: ${iconColors[name]};"></i>
                                    <span class="cardio-name">${name}</span>
                                    <input type="number" id="count-${name}" min="1" max="20" value="${config.count}"
                                           class="cardio-count-input"
                                           onclick="event.stopPropagation()"
                                           onchange="CardioDraw.updateCardioCount('${name}', this.value)"
                                           oninput="CardioDraw.updateCardioCount('${name}', this.value)">
                                </div>
                            `;
                                })
                                .join('')}
                        </div>
                        <div class="total-places-badge">
                            <span class="total-places-value" id="totalPlaces">18</span>
                            <span class="total-places-label">Places disponibles</span>
                        </div>
                    </div>

                    <!-- 2. IMPORT PARTICIPANTS -->
                    <div class="cardio-draw-section">
                        <h3><i class="fas fa-clipboard-list"></i>Liste des participants</h3>
                        <textarea id="cardioParticipantsInput"
                                  class="cardio-participants-input"
                                  placeholder="Copiez-collez la liste des participants ici&#10;&#10;Jean Dupont&#10;Marie Martin&#10;Pierre Durand&#10;..."
                                  oninput="CardioDraw.autoRecognize()"></textarea>
                        <div class="cardio-import-actions">
                            <button onclick="CardioDraw.openSearchModal()" class="btn-secondary" title="Rechercher dans la base">
                                <i class="fas fa-database"></i><span>Base de données</span>
                            </button>
                            <button onclick="CardioDraw.openAddTempParticipant()" class="btn-success" title="Ajouter un participant temporaire (drop-in/essai)">
                                <i class="fas fa-user-plus"></i><span>Drop-in / Essai</span>
                            </button>
                            <button onclick="CardioDraw.clearAll()" class="btn-danger" title="Effacer tout">
                                <i class="fas fa-trash"></i><span>Effacer</span>
                            </button>
                        </div>
                    </div>

                    <!-- 3. PARTICIPANTS RECONNUS -->
                    <div class="cardio-draw-section">
                        <h3><i class="fas fa-users"></i>Participants reconnus (<span id="cardioPartCount">${recognized.length}</span>)</h3>
                        <div id="cardioParticipantsList" class="cardio-participants-list">
                            ${this.renderParticipantsList()}
                        </div>
                    </div>

                    <!-- 4. BOUTON GÉNÉRER -->
                    <button onclick="CardioDraw.performDraw()"
                            id="cardioDrawButton"
                            class="cardio-draw-btn-hero"
                            disabled>
                        <i class="fas fa-dice"></i>Lancer le Tirage
                    </button>

                    <!-- 5. RÉSULTATS -->
                    <div id="cardioResults" class="cardio-results-section" style="display: none;">
                        <div class="cardio-results-header">
                            <h3><i class="fas fa-trophy"></i>Groupes Cardio</h3>
                            <div class="cardio-results-actions">
                                <button onclick="CardioDraw.performDraw()" class="btn-secondary">
                                    <i class="fas fa-redo"></i>Retirer
                                </button>
                                <button onclick="CardioDraw.saveDraw()" class="btn-primary">
                                    <i class="fas fa-save"></i>Sauvegarder
                                </button>
                                <button onclick="CardioDraw.copyToClipboard()" class="btn-success">
                                    <i class="fas fa-copy"></i>Copier
                                </button>
                            </div>
                        </div>
                        <div id="cardioGroupsDisplay" class="cardio-groups-grid">
                            <!-- Résultats générés dynamiquement -->
                        </div>
                    </div>

                </div>
            </div>
        `;

        document.getElementById('mainContent').innerHTML = html;
        this.updateStatistics();
        this.updateTotalPlaces();
    },

    // ===================================================================
    // RECONNAISSANCE PARTICIPANTS (même système que TeamBuilder)
    // ===================================================================
    autoRecognize() {
        clearTimeout(this.autoRecognizeTimeout);
        this.autoRecognizeTimeout = setTimeout(() => {
            this.parseParticipants();
        }, 500);
    },

    parseParticipants() {
        const input = document.getElementById('cardioParticipantsInput');
        if (!input || !input.value.trim()) {
            this.participants = [];
            this.updateParticipantsList();
            return;
        }

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

        this.updateParticipantsList();
    },

    parseParticipantLine(line) {
        // Nettoyer la ligne
        let cleanName = line
            .replace(/^\d+\.?\s*/, '')
            .replace(/^\s*[-•*]\s*/, '')
            .replace(/\s+/g, ' ')
            .trim();

        if (!cleanName) {
            return null;
        }

        // Reconnaître l'adhérent (STRICT - comme TeamBuilder)
        const recognizedMember = this.recognizeMember(cleanName);

        if (!recognizedMember) {
            console.log(`❌ "${cleanName}" n'est pas dans la base de données - IGNORÉ`);
            return null; // Strict rejection - pas de fuzzy matching
        }

        console.log(`✅ "${cleanName}" reconnu → ${recognizedMember.name}`);

        return {
            originalLine: line,
            cleanName: cleanName,
            recognizedMember: recognizedMember,
            isInDatabase: true, // Toujours true si on arrive ici
            id: recognizedMember.id
        };
    },

    // RECONNAISSANCE STRICTE - Exactement comme TeamBuilder
    recognizeMember(name) {
        const members = this.membersCache;
        if (!members || members.length === 0) {
            return null;
        }

        const searchName = this.normalizeString(name);

        // Essayer de trouver une correspondance EXACTE
        for (const member of members) {
            const memberNameNormalized = this.normalizeString(member.name);

            // Variations possibles : Nom complet, ou Prénom + Nom inversé
            const variations = [memberNameNormalized];

            const parts = memberNameNormalized.split(' ').filter(p => p);
            if (parts.length === 2) {
                const reversed = this.normalizeString(`${parts[1]} ${parts[0]}`);
                variations.push(reversed);
            }

            // Vérifier correspondance EXACTE uniquement
            for (const variation of variations) {
                if (searchName === variation) {
                    return member; // ✅ Match EXACT trouvé
                }
            }
        }

        // ❌ Aucune correspondance exacte = on ignore
        return null;
    },

    normalizeString(str) {
        if (!str) {
            return '';
        }
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    },

    // ===================================================================
    // AFFICHAGE & UI
    // ===================================================================
    renderParticipantsList() {
        const recognized = this.participants.filter(p => p.isInDatabase);

        if (recognized.length === 0) {
            return `
                <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem; color: var(--text-muted);">
                    <i class="fas fa-user-plus" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p style="font-size: 0.875rem; font-weight: 600;">Aucun participant reconnu</p>
                </div>
            `;
        }

        return recognized
            .map(p => {
                const isTemp = p.isTemporary === true;
                const icon = isTemp ? 'fa-user-clock' : 'fa-user-check';
                const iconColor = isTemp ? '#f59e0b' : 'var(--accent-primary)';
                const borderColor = isTemp ? 'rgba(245, 158, 11, 0.3)' : 'var(--glass-border)';

                return `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; background: var(--glass-bg); border: 1px solid ${borderColor}; border-radius: 0.75rem; transition: all 0.2s; cursor: pointer;"
                     onmouseover="this.style.background='var(--glass-bg-hover)'; this.style.borderColor='var(--accent-primary)'"
                     onmouseout="this.style.background='var(--glass-bg)'; this.style.borderColor='${borderColor}'">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <i class="fas ${icon}" style="color: ${iconColor}; font-size: 0.875rem;"></i>
                        <span style="color: var(--text-primary); font-weight: 600; font-size: 0.875rem;">${p.cleanName}</span>
                        ${isTemp ? '<span style="padding: 0.125rem 0.5rem; background: rgba(245, 158, 11, 0.2); color: #f59e0b; font-size: 0.65rem; font-weight: 700; border-radius: 0.25rem; text-transform: uppercase;">Drop-in</span>' : ''}
                    </div>
                    <button onclick="CardioDraw.removeParticipant(${p.id})"
                            style="padding: 0.25rem 0.5rem; background: transparent; border: none; color: #ef4444; cursor: pointer; border-radius: 0.5rem; transition: all 0.2s;"
                            onmouseover="this.style.background='rgba(239, 68, 68, 0.1)'"
                            onmouseout="this.style.background='transparent'">
                        <i class="fas fa-times" style="font-size: 0.75rem;"></i>
                    </button>
                </div>
            `;
            })
            .join('');
    },

    updateParticipantsList() {
        const container = document.getElementById('cardioParticipantsList');
        if (container) {
            container.innerHTML = this.renderParticipantsList();
            this.updateStatistics();
        }
    },

    updateStatistics() {
        const recognized = this.participants.filter(p => p.isInDatabase);
        const total = this.participants.length;

        const totalEl = document.getElementById('totalCardioPart');
        const recognizedEl = document.getElementById('recognizedCardioPart');
        const countEl = document.getElementById('cardioPartCount');
        const btnEl = document.getElementById('cardioDrawButton');

        if (totalEl) {
            totalEl.textContent = total;
        }
        if (recognizedEl) {
            recognizedEl.textContent = recognized.length;
        }
        if (countEl) {
            countEl.textContent = recognized.length;
        }
        if (btnEl) {
            btnEl.disabled = recognized.length === 0;
        }
    },

    removeParticipant(id) {
        this.participants = this.participants.filter(p => p.id !== id);
        this.updateParticipantsList();
        this.showNotification('Participant supprimé', 'info');
    },

    // ===================================================================
    // CONFIGURATION CARDIOS
    // ===================================================================
    toggleCardio(name) {
        // Lire l'état ACTUEL de la checkbox avant de basculer
        const checkbox = document.getElementById(`cardio-${name}`);
        if (checkbox) {
            this.cardioConfig[name].selected = checkbox.checked;
        } else {
            // Fallback: basculer manuellement
            this.cardioConfig[name].selected = !this.cardioConfig[name].selected;
        }
        this.updateTotalPlaces();
    },

    updateCardioCount(name, value) {
        const parsedValue = parseInt(value) || 1;
        this.cardioConfig[name].count = parsedValue;
        console.log(`🔄 Config updated: ${name} = ${parsedValue}`);
        this.updateTotalPlaces();
    },

    updateTotalPlaces() {
        // RE-LIRE les valeurs des inputs pour être sûr d'avoir les dernières valeurs
        Object.keys(this.cardioConfig).forEach(name => {
            const countInput = document.getElementById(`count-${name}`);
            if (countInput) {
                const value = parseInt(countInput.value) || 1;
                this.cardioConfig[name].count = value;
            }

            const checkbox = document.getElementById(`cardio-${name}`);
            if (checkbox) {
                this.cardioConfig[name].selected = checkbox.checked;
            }
        });

        // Calculer le total
        let total = 0;
        Object.entries(this.cardioConfig).forEach(([, config]) => {
            if (config.selected) {
                total += config.count;
            }
        });

        const el = document.getElementById('totalPlaces');
        if (el) {
            el.textContent = total;
        }
    },

    // ===================================================================
    // TIRAGE AU SORT (100% ALÉATOIRE - RÉPARTITION SUR TOUS LES CARDIOS)
    // ===================================================================
    performDraw() {
        const recognized = this.participants.filter(p => p.isInDatabase);

        if (recognized.length === 0) {
            this.showNotification('Aucun participant à répartir', 'warning');
            return;
        }

        // ✅ SYNCHRONISER la config avec les inputs AVANT le tirage
        console.log('🔄 Synchronisation configuration avant tirage...');
        Object.keys(this.cardioConfig).forEach(cardioName => {
            const countInput = document.getElementById(`count-${cardioName}`);
            if (countInput) {
                const value = parseInt(countInput.value) || 1;
                this.cardioConfig[cardioName].count = value;
            }

            const checkbox = document.getElementById(`cardio-${cardioName}`);
            if (checkbox) {
                this.cardioConfig[cardioName].selected = checkbox.checked;
            }
        });

        // Obtenir les cardios sélectionnés (après synchronisation)
        const selectedCardios = {};
        Object.entries(this.cardioConfig).forEach(([name, config]) => {
            if (config.selected && config.count > 0) {
                selectedCardios[name] = config.count;
            }
        });

        if (Object.keys(selectedCardios).length === 0) {
            this.showNotification('Veuillez sélectionner au moins un cardio', 'warning');
            return;
        }

        console.log('🎲 Tirage au sort aléatoire avec répartition sur tous les cardios...');
        console.log('Participants:', recognized.length);
        console.log('✅ Configuration FINALE utilisée pour le tirage:', selectedCardios);
        console.log('📊 Total places disponibles:', Object.values(selectedCardios).reduce((a, b) => a + b, 0));

        // Mélanger les participants (Fisher-Yates shuffle)
        const shuffled = [...recognized];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // Créer une liste de "slots" pour chaque cardio
        // Ex: ['Run', 'Run', 'Run', 'Run', 'Bikerg', 'Bikerg', 'Bikerg', 'Skierg', 'Skierg', ...]
        const cardioSlots = [];
        Object.entries(selectedCardios).forEach(([cardio, count]) => {
            for (let i = 0; i < count; i++) {
                cardioSlots.push(cardio);
            }
        });

        // Mélanger les slots de cardio (Fisher-Yates shuffle)
        for (let i = cardioSlots.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cardioSlots[i], cardioSlots[j]] = [cardioSlots[j], cardioSlots[i]];
        }

        console.log('🎰 Slots cardio mélangés:', cardioSlots);

        // Initialiser les groupes
        const groups = {};
        Object.keys(selectedCardios).forEach(cardio => {
            groups[cardio] = [];
        });

        // Assigner chaque participant à un slot aléatoire
        for (let i = 0; i < Math.min(shuffled.length, cardioSlots.length); i++) {
            const participant = shuffled[i];
            const cardio = cardioSlots[i];
            groups[cardio].push(participant.cleanName);
        }

        // Participants non assignés (si plus de participants que de places)
        const notAssigned = shuffled.slice(cardioSlots.length).map(p => p.cleanName);

        this.currentDraw = {
            name: `Tirage ${new Date().toLocaleDateString('fr-FR')}`,
            date: new Date().toISOString().split('T')[0],
            groups: groups,
            config: selectedCardios,
            participants: recognized.map(p => p.cleanName),
            notAssigned: notAssigned
        };

        console.log('✅ Tirage terminé:', this.currentDraw);
        console.log(
            '📊 Répartition:',
            Object.entries(groups)
                .map(([k, v]) => `${k}: ${v.length}`)
                .join(', ')
        );

        this.displayResults();

        // Sauvegarder automatiquement en localStorage pour le mode TV
        this.autoSaveDrawToLocalStorage();
    },

    // Sauvegarde automatique en localStorage (silencieuse)
    autoSaveDrawToLocalStorage() {
        if (!this.currentDraw) {
            return;
        }

        try {
            const drawData = {
                name: this.currentDraw.name,
                draw_date: this.currentDraw.date,
                teams: this.currentDraw.groups,
                config: this.currentDraw.config,
                participants: this.currentDraw.participants,
                created_at: new Date().toISOString(),
                status: 'active'
            };

            localStorage.setItem('cardio_active_draw', JSON.stringify(drawData));
            console.log('💾 Tirage sauvegardé automatiquement en localStorage');
        } catch (error) {
            console.error('❌ Erreur sauvegarde auto:', error);
        }
    },

    displayResults() {
        const resultsDiv = document.getElementById('cardioResults');
        const groupsDisplay = document.getElementById('cardioGroupsDisplay');

        if (!resultsDiv || !groupsDisplay) {
            return;
        }

        resultsDiv.style.display = 'block';
        resultsDiv.scrollIntoView({ behavior: 'smooth' });

        // Palette de couleurs modernes
        const cardioStyles = {
            Run: {
                borderColor: '#60a5fa',
                iconColor: '#60a5fa',
                badgeBg: '#2563eb',
                itemBg: 'rgba(37, 99, 235, 0.1)'
            },
            Bikerg: {
                borderColor: '#facc15',
                iconColor: '#facc15',
                badgeBg: '#ca8a04',
                itemBg: 'rgba(202, 138, 4, 0.1)'
            },
            Skierg: {
                borderColor: '#22d3ee',
                iconColor: '#22d3ee',
                badgeBg: '#0891b2',
                itemBg: 'rgba(8, 145, 178, 0.1)'
            },
            Rameur: {
                borderColor: '#4ade80',
                iconColor: '#4ade80',
                badgeBg: '#16a34a',
                itemBg: 'rgba(22, 163, 74, 0.1)'
            },
            AssaultBike: {
                borderColor: '#f87171',
                iconColor: '#f87171',
                badgeBg: '#dc2626',
                itemBg: 'rgba(220, 38, 38, 0.1)'
            }
        };

        let html = '';

        Object.entries(this.currentDraw.groups).forEach(([cardio, members]) => {
            const config = this.cardioConfig[cardio];
            const style = cardioStyles[cardio] || {
                borderColor: '#9ca3af',
                iconColor: '#9ca3af',
                badgeBg: '#4b5563',
                itemBg: 'rgba(75, 85, 99, 0.1)'
            };

            html += `
                <div style="background: var(--glass-bg); border: 2px solid ${style.borderColor}; border-radius: 0.75rem; padding: 1.5rem; transition: all 0.2s;"
                     onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(0,0,0,0.3)'"
                     onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--glass-border);">
                        <i class="fas ${config.icon}" style="font-size: 1.5rem; color: ${style.iconColor};"></i>
                        <h4 style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary); flex: 1; margin: 0;">${cardio}</h4>
                        <span style="padding: 0.5rem 1rem; background: ${style.badgeBg}; color: white; border-radius: 9999px; font-size: 0.875rem; font-weight: 700;">
                            ${members.length}
                        </span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        ${
                            members.length > 0
                                ? members
                                      .map(
                                          (name, idx) => `
                            <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; background: ${style.itemBg}; border-radius: 0.5rem; transition: all 0.2s;"
                                 onmouseover="this.style.background='var(--glass-bg-hover)'"
                                 onmouseout="this.style.background='${style.itemBg}'">
                                <span style="width: 1.75rem; height: 1.75rem; display: flex; align-items: center; justify-content: center; background: ${style.badgeBg}; color: white; border-radius: 9999px; font-size: 0.75rem; font-weight: 700;">
                                    ${idx + 1}
                                </span>
                                <span style="color: var(--text-primary); font-weight: 600; font-size: 0.9375rem;">${name}</span>
                            </div>
                        `
                                      )
                                      .join('')
                                : `
                            <div style="text-align: center; padding: 2rem; color: var(--text-muted); font-style: italic; font-size: 0.875rem;">
                                <i class="fas fa-user-slash" style="margin-right: 0.5rem;"></i>Aucun participant
                            </div>
                        `
                        }
                    </div>
                </div>
            `;
        });

        // Afficher les non assignés si présents
        if (this.currentDraw.notAssigned && this.currentDraw.notAssigned.length > 0) {
            html += `
                <div style="grid-column: 1 / -1; background: rgba(239, 68, 68, 0.1); border: 2px solid #ef4444; border-radius: 0.75rem; padding: 1.5rem;">
                    <h4 style="font-size: 1.125rem; font-weight: 700; color: #ef4444; margin-bottom: 1rem; display: flex; align-items: center;">
                        <i class="fas fa-exclamation-triangle" style="margin-right: 0.75rem;"></i>
                        Non assignés (${this.currentDraw.notAssigned.length})
                    </h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                        ${this.currentDraw.notAssigned
                            .map(
                                name => `
                            <span style="padding: 0.5rem 1rem; background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #ef4444; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 600;">
                                ${name}
                            </span>
                        `
                            )
                            .join('')}
                    </div>
                </div>
            `;
        }

        groupsDisplay.innerHTML = html;
    },

    // ===================================================================
    // SAUVEGARDE & EXPORT
    // ===================================================================
    async saveDraw() {
        if (!this.currentDraw) {
            this.showNotification('Aucun tirage à sauvegarder', 'warning');
            return;
        }

        try {
            console.log('💾 Sauvegarde du tirage en localStorage...');

            // Créer les données du tirage pour le mode TV
            const drawData = {
                name: this.currentDraw.name,
                draw_date: this.currentDraw.date,
                teams: this.currentDraw.groups,
                config: this.currentDraw.config,
                participants: this.currentDraw.participants,
                created_at: new Date().toISOString(),
                status: 'active'
            };

            // Sauvegarder en localStorage
            localStorage.setItem('cardio_active_draw', JSON.stringify(drawData));

            console.log('✅ Tirage sauvegardé en localStorage:', drawData);
            this.showNotification('✅ Tirage sauvegardé! Visible sur le mode TV', 'success');
        } catch (error) {
            console.error('❌ Erreur sauvegarde:', error);
            this.showNotification('❌ Erreur: ' + error.message, 'error');
        }
    },

    copyToClipboard() {
        if (!this.currentDraw) {
            this.showNotification('Aucun tirage à copier', 'warning');
            return;
        }

        let text = `📋 ${this.currentDraw.name}\n\n`;

        Object.entries(this.currentDraw.groups).forEach(([cardio, members]) => {
            text += `${cardio} (${members.length}):\n`;
            members.forEach((name, idx) => {
                text += `  ${idx + 1}. ${name}\n`;
            });
            text += '\n';
        });

        if (this.currentDraw.notAssigned && this.currentDraw.notAssigned.length > 0) {
            text += `⚠️ Non assignés (${this.currentDraw.notAssigned.length}):\n`;
            this.currentDraw.notAssigned.forEach(name => {
                text += `  - ${name}\n`;
            });
        }

        navigator.clipboard
            .writeText(text)
            .then(() => {
                this.showNotification('✅ Copié dans le presse-papiers!', 'success');
            })
            .catch(err => {
                console.error('Erreur copie:', err);
                this.showNotification('❌ Erreur lors de la copie', 'error');
            });
    },

    // ===================================================================
    // PARTICIPANTS TEMPORAIRES (Drop-in / Séances d'essai)
    // ===================================================================
    openAddTempParticipant() {
        const modal = document.createElement('div');
        modal.id = 'tempParticipantModal';
        modal.className =
            'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="temp-participant-modal-container">
                <h3 class="temp-participant-modal-title">
                    <i class="fas fa-user-plus mr-2 text-green-primary"></i>
                    Ajouter un participant temporaire
                </h3>
                <p class="temp-participant-modal-description">Pour les séances d'essai et drop-in</p>

                <input type="text" id="tempParticipantName"
                       placeholder="Prénom Nom"
                       class="w-full px-4 py-3 rounded-lg text-sm mb-4 input-green">

                <div class="flex gap-2">
                    <button onclick="CardioDraw.addTempParticipant()"
                            class="flex-1 px-4 py-3 rounded-lg font-semibold btn-green-gradient">
                        <i class="fas fa-check mr-2"></i>Ajouter
                    </button>
                    <button onclick="CardioDraw.closeModal()"
                            class="px-4 py-3 rounded-lg font-semibold btn-red-light">
                        Annuler
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Focus sur l'input
        setTimeout(() => document.getElementById('tempParticipantName').focus(), 100);

        // Fermer au clic en dehors
        modal.addEventListener('click', e => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // Fermer à l'appui sur Échap
        document.addEventListener(
            'keydown',
            (this.escapeHandler = e => {
                if (e.key === 'Escape') {
                    this.closeModal();
                }
            })
        );

        // Ajouter à l'appui sur Entrée
        document.getElementById('tempParticipantName').addEventListener('keypress', e => {
            if (e.key === 'Enter') {
                this.addTempParticipant();
            }
        });
    },

    addTempParticipant() {
        const input = document.getElementById('tempParticipantName');
        if (!input) {
            return;
        }

        const name = input.value.trim();
        if (!name) {
            this.showNotification('Veuillez saisir un nom', 'warning');
            return;
        }

        // Créer un participant temporaire (marqué comme "dans la base" pour être inclus dans le tirage)
        const tempParticipant = {
            originalLine: name,
            cleanName: name,
            recognizedMember: { name: name, isTemporary: true },
            isInDatabase: true, // Marqué comme dans la base pour être inclus
            isTemporary: true, // Flag spécial pour identifier les temporaires
            id: Date.now() + Math.random()
        };

        this.participants.push(tempParticipant);
        this.updateParticipantsList();
        this.closeModal();
        this.showNotification(`✅ ${name} ajouté (temporaire)`, 'success');
    },

    closeModal() {
        const modal = document.getElementById('tempParticipantModal');
        if (modal) {
            modal.remove();
        }
        if (this.escapeHandler) {
            document.removeEventListener('keydown', this.escapeHandler);
            this.escapeHandler = null;
        }
    },

    // ===================================================================
    // RECHERCHE D'ADHÉRENTS (Modal)
    // ===================================================================
    async openSearchModal() {
        console.log('🔍 Ouverture modal de recherche adhérents');

        // Créer le modal
        const modalHTML = `
            <div id="memberSearchModal" class="modal-overlay">
                <div class="modal-container">
                    <!-- Header -->
                    <div class="modal-header">
                        <h3 class="modal-header-title">
                            <i class="fas fa-search mr-2 text-green-primary"></i>
                            Rechercher un adhérent
                        </h3>
                        <button onclick="CardioDraw.closeSearchModal()" class="modal-close-btn">×</button>
                    </div>

                    <!-- Search Input -->
                    <div class="modal-search-input-container">
                        <input
                            type="text"
                            id="modalSearchInput"
                            placeholder="Tapez un nom, prénom..."
                            class="modal-search-input"
                            oninput="CardioDraw.filterSearchModalMembers(this.value)"
                            autofocus
                        />
                    </div>

                    <!-- Results -->
                    <div id="modalSearchResults" class="modal-results"></div>

                    <!-- Footer -->
                    <div class="modal-footer">
                        <button onclick="CardioDraw.closeSearchModal()" class="btn-green-light px-4 py-2 rounded-md font-semibold">
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Ajouter le modal au body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Stocker les membres pour la recherche
        this._searchModalMembers = this.membersCache;

        // Afficher tous les membres au départ
        this.filterSearchModalMembers('');
    },

    closeSearchModal() {
        const modal = document.getElementById('memberSearchModal');
        if (modal) {
            modal.remove();
        }
        this._searchModalMembers = null;
    },

    filterSearchModalMembers(query) {
        const resultsDiv = document.getElementById('modalSearchResults');
        if (!resultsDiv || !this._searchModalMembers) {
            return;
        }

        const normalizedQuery = query.toLowerCase().trim();

        // Filtrer les membres (exclure ceux déjà ajoutés)
        let filteredMembers = this._searchModalMembers.filter(m => {
            const name = (m.name || '').toLowerCase();
            const included = name.includes(normalizedQuery);
            const notAlreadyAdded = !this.participants.find(p => p.recognizedMember?.id === m.id);
            return included && notAlreadyAdded;
        });

        // Si pas de query, limiter à 20 résultats
        if (!normalizedQuery) {
            filteredMembers = filteredMembers.slice(0, 20);
        }

        // Afficher les résultats
        if (filteredMembers.length === 0) {
            resultsDiv.innerHTML = `
                <div class="text-center text-green-medium" style="padding: 40px 20px;">
                    <i class="fas fa-search text-green-primary" style="font-size: 3rem; opacity: 0.3; margin-bottom: 10px;"></i>
                    <p class="font-semibold" style="margin: 0;">${normalizedQuery ? 'Aucun résultat' : 'Tous les membres sont déjà ajoutés'}</p>
                </div>
            `;
        } else {
            resultsDiv.innerHTML = filteredMembers
                .map(
                    m => `
                <div
                    onclick="CardioDraw.addParticipantFromSearch('${m.id}')"
                    class="modal-result-item">
                    <span class="modal-result-name">${m.name}</span>
                    <i class="fas fa-plus text-green-primary"></i>
                </div>
            `
                )
                .join('');
        }
    },

    addParticipantFromSearch(memberId) {
        // Trouver le membre dans le cache
        const member = this.membersCache.find(m => m.id === memberId);

        if (!member) {
            console.error('❌ Membre non trouvé:', memberId);
            return;
        }

        // Ajouter le membre comme participant reconnu
        const newParticipant = {
            originalLine: member.name,
            cleanName: member.name,
            recognizedMember: member,
            isInDatabase: true,
            id: Date.now() + Math.random()
        };

        this.participants.push(newParticipant);

        // Mettre à jour l'affichage
        this.updateParticipantsList();
        this.updateStatistics();

        // Fermer le modal
        this.closeSearchModal();

        this.showNotification(`✅ ${member.name} ajouté`, 'success');
        console.log('✅ Participant ajouté depuis recherche:', member.name);
    },

    clearAll() {
        this.participants = [];
        const input = document.getElementById('cardioParticipantsInput');
        if (input) {
            input.value = '';
        }

        const resultsDiv = document.getElementById('cardioResults');
        if (resultsDiv) {
            resultsDiv.classList.add('hidden');
        }

        this.updateParticipantsList();
        this.showNotification('Liste vidée', 'info');
    },

    // ===================================================================
    // UTILITAIRES
    // ===================================================================
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

        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    },

    // ===================================================================
    // EXPORT POUR MODE TV
    // ===================================================================
    async getActiveDraw() {
        try {
            const { data, error } = await window.supabase
                .from('cardio_draws')
                .select('*')
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) {
                throw error;
            }
            return data;
        } catch (error) {
            console.error('❌ Erreur récupération tirage actif:', error);
            return null;
        }
    },

    generateTVDisplay(drawData) {
        if (!drawData || !drawData.teams) {
            return `
                <div class="text-center py-6">
                    <i class="fas fa-info-circle text-3xl text-muted mb-2"></i>
                    <p class="text-secondary text-sm">Aucun tirage au sort disponible</p>
                </div>
            `;
        }

        let html = `
            <div class="mb-3 pb-2 border-b border-gray-700">
                <h3 class="text-lg font-bold text-white flex items-center gap-2">
                    <i class="fas fa-random text-green-400"></i>
                    ${drawData.name}
                </h3>
                <p class="text-xs text-gray-400 mt-1">
                    ${new Date(drawData.draw_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
            </div>
            <div class="space-y-2">
        `;

        Object.entries(drawData.teams).forEach(([cardio, members]) => {
            const config = this.cardioConfig[cardio] || { icon: 'fa-dumbbell', color: 'gray' };

            html += `
                <div class="glass-panel rounded-lg p-2 border-l-3 border-${config.color}-400">
                    <div class="flex items-center gap-2 mb-1">
                        <i class="fas ${config.icon} text-${config.color}-400 text-sm"></i>
                        <span class="font-bold text-white text-sm">${cardio}</span>
                        <span class="ml-auto text-xs bg-${config.color}-600 text-white px-2 py-0.5 rounded-full">
                            ${members.length}
                        </span>
                    </div>
                    <div class="text-xs text-gray-300 space-y-0.5 pl-5">
                        ${members.map(name => `<div>• ${name}</div>`).join('')}
                    </div>
                </div>
            `;
        });

        html += '</div>';
        return html;
    }
};

// Exposer globalement
window.CardioDraw = CardioDraw;
