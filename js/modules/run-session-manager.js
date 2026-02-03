/**
 * RUN SESSION MANAGER - REFONTE COMPLÈTE
 * Module de chronométrage de séances de course avec détection PR
 *
 * Fonctionnalités:
 * - Parse automatique des blocks de séance
 * - Détection des exercices d'endurance (Run, Row, Bike, Skierg)
 * - Chronométrage temps réel avec récupération
 * - Détection automatique des Personal Records
 * - Sauvegarde dans Supabase
 * - Interface moderne inspirée de TeamBuilder
 */

const RunSessionManager = {
    // ========================================
    // ÉTAT DU MODULE
    // ========================================

    currentSession: null,
    sessionConfig: {
        exercises: [], // Liste des exercices détectés (chaque exercice a son propre targetPercentage)
        series: 1,
        recovery: 60
    },

    participants: [], // Participants avec leurs PR
    membersCache: [], // Cache des membres pour reconnaissance stricte
    timers: {
        global: {
            running: false,
            startTime: null,
            intervalId: null
        },
        participants: {} // key: "participantId-serieIndex-exerciseIndex"
    },

    performances: [], // Performances enregistrées pendant la séance
    isFullscreen: false, // État du mode plein écran
    wakeLock: null, // Wake Lock pour empêcher la mise en veille

    // ========================================
    // POINT D'ENTRÉE PRINCIPAL
    // ========================================

    /**
     * Ouvrir le module avec une séance depuis le calendrier
     * @param sessionId
     */
    async openWithSession(sessionId) {
        console.log('🏃 Ouverture Run Session Manager avec session:', sessionId);

        try {
            // Charger le cache des membres AVANT tout
            await this.loadMembersCache();

            // Charger la séance
            this.currentSession = await SupabaseManager.getSession(sessionId);

            if (!this.currentSession) {
                throw new Error('Session non trouvée');
            }

            console.log('📋 Session chargée:', this.currentSession);

            // Parser les blocks pour extraire les exercices
            this.sessionConfig.exercises = this.parseSessionBlocks(this.currentSession);
            console.log('✅ Exercices détectés:', this.sessionConfig.exercises);

            // Afficher l'interface
            this.render();
        } catch (error) {
            console.error('❌ Erreur ouverture session:', error);
            alert('Erreur lors du chargement de la séance: ' + error.message);
        }
    },

    /**
     * Ouvrir le module en mode création libre (sans séance)
     */
    async open() {
        console.log('🏃 Ouverture Run Session Manager (mode libre)...');

        // Charger le cache des membres AVANT tout
        await this.loadMembersCache();

        // Charger le premier exercice cardio existant depuis la base
        const cardioExercises = SupabaseManager.getExercises()['Endurance'] || [];
        const defaultExercise = cardioExercises[0] || 'Run 600m';

        this.currentSession = null;
        this.sessionConfig.exercises = [
            {
                type: defaultExercise,
                series: 5,
                recovery: 90,
                category: 'Endurance',
                targetPercentage: 85 // % individuel pour cet exercice
            }
        ];

        this.render();
    },

    // ========================================
    // PARSING DES SÉANCES
    // ========================================

    /**
     * Parser les blocks d'une séance pour extraire les exercices d'endurance
     * @param session
     */
    parseSessionBlocks(session) {
        console.log('🔍 Parsing des blocks de la séance...');

        const exercises = [];

        if (!session.blocks || !Array.isArray(session.blocks)) {
            console.log('⚠️ Pas de blocks dans la séance');
            return exercises;
        }

        session.blocks.forEach(block => {
            if (!block.exercises || !Array.isArray(block.exercises)) {
                return;
            }

            block.exercises.forEach(ex => {
                // Détecter les exercices d'endurance: Run, Row, Bike, Skierg
                const match = ex.name.match(/(Run|Row|Bike|Skierg)\s+(\d+)(m|km)/i);

                if (match) {
                    const exerciseType = `${match[1]} ${match[2]}${match[3]}`;

                    // Extraire le nombre de séries depuis la note
                    const seriesMatch = ex.note?.match(/(\d+)\s+série/i);
                    const series = seriesMatch ? parseInt(seriesMatch[1]) : block.rounds || 1;

                    // Extraire la récupération
                    const recoveryMatch = ex.note?.match(/(\d+)s?\s+(?:de\s+)?récup/i);
                    const recovery = recoveryMatch ? parseInt(recoveryMatch[1]) : 60;

                    exercises.push({
                        type: exerciseType,
                        series: series,
                        recovery: recovery,
                        category: 'Endurance',
                        targetPercentage: 85, // % par défaut pour chaque exercice parsé
                        originalName: ex.name,
                        note: ex.note
                    });

                    console.log(
                        `✅ Exercice détecté: ${exerciseType} × ${series} séries (${recovery}s récup)`
                    );
                }
            });
        });

        return exercises;
    },

    // ========================================
    // GESTION DES PARTICIPANTS
    // ========================================

    /**
     * Charger les PR d'un participant pour un exercice
     * @param participantId
     * @param exerciseType
     */
    async loadParticipantPerformances(participantId, exerciseType) {
        console.log('📊 Chargement performances pour:', { participantId, exerciseType });

        try {
            const allPerfs = await SupabaseManager.getMemberPerformances(participantId);
            console.log(`📊 Total performances trouvées: ${allPerfs.length}`);

            // Afficher tous les exercices disponibles pour debug
            const exercisesFound = [...new Set(allPerfs.map(p => p.exercise_type))];
            console.log(`📊 Exercices avec performances: ${exercisesFound.join(', ')}`);

            // DEBUG: Afficher TOUTES les performances Endurance pour voir le format exact
            // Filtrer par unit='sec' car category est null dans la base
            const endurancePerfs = allPerfs.filter(p => p.unit === 'sec');
            console.log('🔍 DEBUG - Toutes les performances Endurance (unit=sec):');
            console.table(
                endurancePerfs.map(p => ({
                    exercise_type_EXACT: `"${p.exercise_type}"`,
                    temps: this.formatTime(p.value),
                    secondes: p.value,
                    date: p.date,
                    isPR: p.is_pr,
                    category: p.category,
                    unit: p.unit
                }))
            );

            console.log(
                `🔍 Recherche de performances pour: "${exerciseType}" (longueur: ${exerciseType.length} caractères)`
            );

            // Filtrer par type d'exercice EXACT et unit='sec' (temps en secondes)
            const relevantPerfs = allPerfs.filter(p => {
                const match = p.exercise_type === exerciseType && p.unit === 'sec'; // Dans la base, c'est 'sec' pas 'seconds'

                if (match) {
                    console.log(
                        `✅ MATCH EXACT trouvé: "${p.exercise_type}" === "${exerciseType}"`
                    );
                }
                return match;
            });

            // Si aucune correspondance exacte, chercher une correspondance flexible
            if (relevantPerfs.length === 0) {
                console.log(`❌ Aucune correspondance EXACTE pour "${exerciseType}"`);
                console.log('🔍 Recherche flexible en cours...');

                // Afficher chaque tentative de match
                endurancePerfs.forEach(p => {
                    const normalizedExercise = exerciseType.toLowerCase().replace(/\s+/g, '');
                    const normalizedPerfType = p.exercise_type?.toLowerCase().replace(/\s+/g, '');
                    console.log(
                        `   Comparaison: "${normalizedExercise}" vs "${normalizedPerfType}" → ${normalizedPerfType === normalizedExercise ? 'MATCH' : 'NO MATCH'}`
                    );
                });

                const flexiblePerfs = allPerfs.filter(p => {
                    // Normaliser les noms pour comparaison (enlever espaces, mettre en minuscule)
                    const normalizedExercise = exerciseType.toLowerCase().replace(/\s+/g, '');
                    const normalizedPerfType = p.exercise_type?.toLowerCase().replace(/\s+/g, '');
                    return normalizedPerfType === normalizedExercise && p.unit === 'sec'; // Dans la base, c'est 'sec' pas 'seconds'
                });

                if (flexiblePerfs.length > 0) {
                    console.log(`✅ Correspondances flexibles trouvées: ${flexiblePerfs.length}`);
                    relevantPerfs.push(...flexiblePerfs);
                } else {
                    console.log('❌ Aucune correspondance flexible non plus !');
                }
            }

            console.log(
                `📊 Performances pour "${exerciseType}": ${relevantPerfs.length} trouvée(s)`
            );

            // Trier par valeur (meilleur temps = valeur la plus basse)
            relevantPerfs.sort((a, b) => a.value - b.value);

            const result = {
                bestTime: relevantPerfs[0]?.value || null,
                bestDate: relevantPerfs[0]?.date || null,
                isPR: relevantPerfs[0]?.is_pr || false,
                history: relevantPerfs
            };

            if (result.bestTime) {
                console.log(
                    `🏆 Meilleur PR pour "${exerciseType}": ${this.formatTime(result.bestTime)} (${result.bestDate})`
                );
            } else {
                console.log(`⚠️ Aucun PR trouvé pour "${exerciseType}"`);
            }

            return result;
        } catch (error) {
            console.error('❌ Erreur chargement performances:', error);
            return { bestTime: null, bestDate: null, isPR: false, history: [] };
        }
    },

    /**
     * Rechercher des participants (membres)
     * @param query
     */
    async searchMembers(query) {
        try {
            const members = await SupabaseManager.getMembers();
            const filtered = members.filter(m => {
                const name = m.name?.toLowerCase() || '';
                return (
                    name.includes(query.toLowerCase()) &&
                    !this.participants.find(p => p.id === m.id)
                );
            });

            return filtered.slice(0, 10);
        } catch (error) {
            console.error('❌ Erreur recherche membres:', error);
            return [];
        }
    },

    /**
     * Ajouter un participant à la séance
     * @param memberId
     */
    async addParticipant(memberId) {
        try {
            const member = await SupabaseManager.getMember(memberId);

            if (!member) {
                throw new Error('Membre non trouvé');
            }

            // Charger les PR pour chaque exercice
            const participantData = {
                ...member,
                performances: {}
            };

            for (const exercise of this.sessionConfig.exercises) {
                const perfs = await this.loadParticipantPerformances(memberId, exercise.type);
                participantData.performances[exercise.type] = perfs;
            }

            this.participants.push(participantData);
            this.render();

            console.log('✅ Participant ajouté:', member.name);
        } catch (error) {
            console.error('❌ Erreur ajout participant:', error);
            alert("Erreur lors de l'ajout du participant");
        }
    },

    /**
     * Retirer un participant
     * @param memberId
     */
    removeParticipant(memberId) {
        this.participants = this.participants.filter(p => p.id !== memberId);
        this.render();
    },

    /**
     * Ouvrir le modal de recherche avancée des membres
     */
    async openSearchModal() {
        console.log('🔍 Ouverture modal de recherche membres');

        // Charger tous les membres pour permettre la recherche locale rapide
        let allMembers = [];
        try {
            allMembers = await SupabaseManager.getMembers();
        } catch (error) {
            console.error('❌ Erreur chargement membres:', error);
            alert('Erreur lors du chargement des membres');
            return;
        }

        // Créer le modal
        const modalHTML = `
            <div id="memberSearchModal" class="modal-overlay">
                <div class="modal-container">
                    <!-- Header -->
                    <div class="modal-header">
                        <h3 class="modal-title">
                            <i class="fas fa-search mr-2 text-primary"></i>
                            Rechercher un adhérent
                        </h3>
                        <button onclick="RunSessionManager.closeSearchModal()" class="modal-close-btn">×</button>
                    </div>

                    <!-- Search Input -->
                    <div class="modal-search-section">
                        <input
                            type="text"
                            id="modalSearchInput"
                            placeholder="Tapez un nom, prénom..."
                            class="form-input"
                            oninput="RunSessionManager.filterModalMembers(this.value)"
                            autofocus
                        />
                    </div>

                    <!-- Results -->
                    <div id="modalSearchResults" class="modal-results"></div>

                    <!-- Footer -->
                    <div class="modal-footer">
                        <button onclick="RunSessionManager.closeSearchModal()" class="btn-secondary btn-sm">Fermer</button>
                    </div>
                </div>
            </div>
        `;

        // Ajouter le modal au body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Stocker les membres pour la recherche
        this._searchModalMembers = allMembers;

        // Afficher tous les membres au départ
        this.filterModalMembers('');
    },

    /**
     * Fermer le modal de recherche
     */
    closeSearchModal() {
        const modal = document.getElementById('memberSearchModal');
        if (modal) {
            modal.remove();
        }
        this._searchModalMembers = null;
    },

    /**
     * Filtrer les membres dans le modal
     * @param query
     */
    filterModalMembers(query) {
        const resultsDiv = document.getElementById('modalSearchResults');
        if (!resultsDiv || !this._searchModalMembers) {
            return;
        }

        const normalizedQuery = query.toLowerCase().trim();

        // Filtrer les membres
        let filteredMembers = this._searchModalMembers.filter(m => {
            const name = (m.name || '').toLowerCase();
            const included = name.includes(normalizedQuery);
            const notAlreadyAdded = !this.participants.find(p => p.id === m.id);
            return included && notAlreadyAdded;
        });

        // Si pas de query, limiter à 20 résultats
        if (!normalizedQuery) {
            filteredMembers = filteredMembers.slice(0, 20);
        }

        // Afficher les résultats
        if (filteredMembers.length === 0) {
            resultsDiv.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search empty-icon"></i>
                    <p class="empty-text">${normalizedQuery ? 'Aucun résultat' : 'Tous les membres sont déjà ajoutés'}</p>
                </div>
            `;
        } else {
            resultsDiv.innerHTML = filteredMembers
                .map(
                    m => `
                <div
                    onclick="RunSessionManager.addParticipantFromModal('${m.id}')"
                    class="modal-member-item"
                >
                    <span class="member-name">${m.name}</span>
                    <i class="fas fa-plus text-success"></i>
                </div>
            `
                )
                .join('');
        }
    },

    /**
     * Ajouter un participant depuis le modal et fermer le modal
     * @param memberId
     */
    async addParticipantFromModal(memberId) {
        await this.addParticipant(memberId);
        this.closeSearchModal();
    },

    // ========================================
    // RECONNAISSANCE STRICTE (COMME TEAMBUILDER)
    // ========================================

    /**
     * Charger le cache des membres
     */
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

    /**
     * Parser et reconnaître automatiquement (reconnaissance stricte)
     */
    autoRecognizeParticipants() {
        clearTimeout(this.autoRecognizeTimeout);
        this.autoRecognizeTimeout = setTimeout(() => {
            this.parseParticipantsFromText();
        }, 500);
    },

    /**
     * Parser la liste de participants depuis le textarea
     */
    async parseParticipantsFromText() {
        const input = document.getElementById('participantsTextInput');
        if (!input || !input.value.trim()) {
            this.participants = [];
            this.render();
            return;
        }

        const lines = input.value
            .split('\n')
            .map(line => line.trim())
            .filter(line => line);
        const newParticipants = [];

        for (const line of lines) {
            const participant = await this.parseParticipantLine(line);
            if (participant) {
                // Éviter les doublons
                const exists = newParticipants.some(p => p.memberId === participant.memberId);
                if (!exists) {
                    newParticipants.push(participant);
                }
            }
        }

        this.participants = newParticipants;
        this.render();
    },

    /**
     * Parser une ligne de participant (reconnaissance stricte comme TeamBuilder)
     * @param line
     */
    async parseParticipantLine(line) {
        // Nettoyer la ligne
        let cleanName = line
            .replace(/^\d+\.?\s*/, '')
            .replace(/^\s*[-•*]\s*/, '')
            .replace(/\s+/g, ' ')
            .trim();

        if (!cleanName) {
            return null;
        }

        // Reconnaître l'adhérent (STRICT)
        const recognizedMember = this.recognizeMember(cleanName);

        if (!recognizedMember) {
            console.log(`❌ "${cleanName}" n'est pas dans la base de données - IGNORÉ`);
            return null; // Strict rejection
        }

        console.log(`✅ "${cleanName}" reconnu → ${recognizedMember.name}`);

        // Charger les PR pour chaque exercice configuré
        const participantData = {
            ...recognizedMember,
            memberId: recognizedMember.id,
            performances: {}
        };

        for (const exercise of this.sessionConfig.exercises) {
            const perfs = await this.loadParticipantPerformances(
                recognizedMember.id,
                exercise.type
            );
            participantData.performances[exercise.type] = perfs;
        }

        return participantData;
    },

    /**
     * Reconnaître un membre (correspondance EXACTE uniquement)
     * @param name
     */
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

    /**
     * Normaliser une chaîne (enlever accents, ponctuation, espaces multiples)
     * @param str
     */
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

    // ========================================
    // SYSTÈME DE CHRONOMÉTRAGE
    // ========================================

    /**
     * Démarrer le chrono global
     */
    startGlobalTimer() {
        if (this.timers.global.running) {
            return;
        }

        this.timers.global.running = true;
        this.timers.global.startTime = Date.now();

        // Mettre à jour toutes les secondes
        this.timers.global.intervalId = setInterval(() => {
            this.updateGlobalTimerDisplay();
        }, 100);

        this.updateGlobalTimerDisplay();
        console.log('⏱️ Chrono global démarré');
    },

    /**
     * Arrêter le chrono global
     */
    stopGlobalTimer() {
        this.timers.global.running = false;

        if (this.timers.global.intervalId) {
            clearInterval(this.timers.global.intervalId);
            this.timers.global.intervalId = null;
        }

        console.log('⏱️ Chrono global arrêté');
    },

    /**
     * Mettre à jour l'affichage du chrono global
     */
    updateGlobalTimerDisplay() {
        if (!this.timers.global.running || !this.timers.global.startTime) {
            return;
        }

        const elapsed = (Date.now() - this.timers.global.startTime) / 1000;
        const display = document.getElementById('globalTimer');

        if (display) {
            const hours = Math.floor(elapsed / 3600);
            const minutes = Math.floor((elapsed % 3600) / 60);
            const seconds = Math.floor(elapsed % 60);

            display.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    },

    /**
     * Démarrer/arrêter le chrono d'un participant pour une série/exercice
     * @param participantId
     * @param serieIndex
     * @param exerciseIndex
     */
    toggleTimer(participantId, serieIndex, exerciseIndex) {
        const key = `${participantId}-${serieIndex}-${exerciseIndex}`;
        const timer = this.timers.participants[key];

        // Si pas de chrono global, le démarrer
        if (!this.timers.global.running) {
            this.startGlobalTimer();
        }

        if (!timer || !timer.running) {
            // DÉMARRER le chrono
            this.startParticipantTimer(participantId, serieIndex, exerciseIndex);
        } else {
            // ARRÊTER le chrono
            this.stopParticipantTimer(participantId, serieIndex, exerciseIndex);
        }
    },

    /**
     * Nettoyer tous les clignotements de récupération pour un participant
     * @param participantId
     */
    clearParticipantRecoveryBlinks(participantId) {
        // Parcourir tous les timers pour trouver ceux de ce participant
        Object.keys(this.timers.participants).forEach(key => {
            if (key.startsWith(participantId)) {
                const timer = this.timers.participants[key];

                // Si la récup est terminée, nettoyer le clignotement
                if (timer.recoveryFinished) {
                    const cell = document.getElementById(`cell-${key}`);
                    const display = document.getElementById(`recovery-${key}`);

                    if (cell) {
                        cell.classList.remove('recovery-blink-bg');
                    }

                    if (display) {
                        display.classList.remove('recovery-blink');
                        display.classList.add('hidden');
                    }

                    // Réinitialiser le flag
                    timer.recoveryFinished = false;
                }
            }
        });

        console.log(`🧹 Clignotements nettoyés pour participant: ${participantId}`);
    },

    /**
     * Démarrer le chrono d'un participant
     * @param participantId
     * @param serieIndex
     * @param exerciseIndex
     */
    startParticipantTimer(participantId, serieIndex, exerciseIndex) {
        const key = `${participantId}-${serieIndex}-${exerciseIndex}`;

        // Nettoyer tous les clignotements rouges de cette ligne (participant)
        this.clearParticipantRecoveryBlinks(participantId);

        this.timers.participants[key] = {
            participantId,
            serieIndex,
            exerciseIndex,
            running: true,
            startTime: Date.now(),
            endTime: null,
            finalTime: null,
            recoveryRemaining: null,
            recoveryIntervalId: null
        };

        // Mettre à jour le bouton
        const btn = document.getElementById(`btn-${key}`);
        if (btn) {
            btn.textContent = '⏹️';
            btn.classList.add('timer-stop-btn');
        }

        // Lancer l'update loop
        this.updateParticipantTimerDisplay(key);

        console.log('▶️ Chrono démarré:', key);
    },

    /**
     * Arrêter le chrono d'un participant
     * @param participantId
     * @param serieIndex
     * @param exerciseIndex
     */
    async stopParticipantTimer(participantId, serieIndex, exerciseIndex) {
        const key = `${participantId}-${serieIndex}-${exerciseIndex}`;
        const timer = this.timers.participants[key];

        if (!timer || !timer.running) {
            return;
        }

        // Calculer le temps final
        timer.endTime = Date.now();
        timer.running = false;
        timer.finalTime = (timer.endTime - timer.startTime) / 1000; // en secondes

        console.log(`⏹️ Chrono arrêté: ${key} = ${this.formatTime(timer.finalTime)}`);

        // Mettre à jour le bouton
        const btn = document.getElementById(`btn-${key}`);
        if (btn) {
            btn.textContent = '✓';
            btn.disabled = true;
            btn.classList.add('timer-completed-btn');
        }

        // Afficher le temps final
        const display = document.getElementById(`time-${key}`);
        if (display) {
            display.textContent = this.formatTime(timer.finalTime);
        }

        // Vérifier si c'est un PR
        const participant = this.participants.find(p => p.id === participantId);
        const exercise = this.sessionConfig.exercises[exerciseIndex];

        if (participant && exercise) {
            const isPR = await this.checkForPR(participant, exercise.type, timer.finalTime);

            if (isPR) {
                this.showPRAnimation(key);
            }
        }

        // Enregistrer la performance
        this.recordPerformance(participantId, serieIndex, exerciseIndex, timer.finalTime);

        // Démarrer le compte à rebours de récupération
        if (exercise) {
            this.startRecoveryCountdown(key, exercise.recovery);
        }

        // Mettre à jour le total
        this.updateTotalTime(participantId);
    },

    /**
     * Mettre à jour l'affichage du chrono d'un participant (boucle)
     * @param key
     */
    updateParticipantTimerDisplay(key) {
        const timer = this.timers.participants[key];

        if (!timer || !timer.running) {
            return;
        }

        const elapsed = (Date.now() - timer.startTime) / 1000;
        const display = document.getElementById(`time-${key}`);

        if (display) {
            display.textContent = this.formatTime(elapsed);
        }

        // Continuer la boucle
        requestAnimationFrame(() => this.updateParticipantTimerDisplay(key));
    },

    /**
     * Démarrer le compte à rebours de récupération
     * @param key
     * @param recoverySeconds
     */
    startRecoveryCountdown(key, recoverySeconds) {
        const timer = this.timers.participants[key];
        if (!timer) {
            return;
        }

        timer.recoveryRemaining = recoverySeconds;

        const recoveryDisplay = document.getElementById(`recovery-${key}`);
        if (recoveryDisplay) {
            recoveryDisplay.classList.remove('hidden');
        }

        timer.recoveryIntervalId = setInterval(() => {
            timer.recoveryRemaining--;

            const display = document.getElementById(`recovery-${key}`);
            const cell = document.getElementById(`cell-${key}`);

            if (display) {
                display.textContent = `Récup: ${timer.recoveryRemaining}s`;

                // Changer la couleur selon le temps restant
                display.classList.remove(
                    'recovery-warning',
                    'recovery-critical',
                    'recovery-complete',
                    'recovery-blink'
                );
                if (cell) {
                    cell.classList.remove('recovery-blink-bg');
                }

                if (timer.recoveryRemaining <= 5) {
                    display.classList.add('recovery-critical');
                    // Ajouter le clignotement rouge
                    if (cell) {
                        cell.classList.add('recovery-blink-bg');
                    }
                } else if (timer.recoveryRemaining <= 10) {
                    display.classList.add('recovery-warning');
                }
            }

            // Fin de la récupération
            if (timer.recoveryRemaining <= 0) {
                clearInterval(timer.recoveryIntervalId);
                timer.recoveryIntervalId = null;

                if (display) {
                    display.textContent = 'Récup terminée !';
                    display.classList.add('recovery-complete');
                    display.classList.add('recovery-blink');
                    // Ne plus cacher automatiquement - le clignotement continue
                }

                // Marquer que cette cellule a terminé sa récup
                timer.recoveryFinished = true;

                // Jouer un son si disponible
                this.playSound('recovery-end');
            }
        }, 1000);
    },

    // ========================================
    // DÉTECTION DE PR
    // ========================================

    /**
     * Vérifier si un temps est un PR pour un participant
     * @param participant
     * @param exerciseType
     * @param newTime
     */
    async checkForPR(participant, exerciseType, newTime) {
        const perfs = participant.performances[exerciseType];

        if (!perfs) {
            return false;
        }

        const isPR = !perfs.bestTime || newTime < perfs.bestTime;

        if (isPR) {
            console.log(
                `🏆 NOUVEAU PR ! ${participant.name} - ${exerciseType}: ${this.formatTime(newTime)}`
            );
        }

        return isPR;
    },

    /**
     * Afficher l'animation PR
     * @param key
     */
    showPRAnimation(key) {
        const cell = document.getElementById(`cell-${key}`);

        if (cell) {
            cell.classList.add('pr-cell');

            // Ajouter le badge PR
            const badge = document.createElement('div');
            badge.className = 'pr-badge';
            badge.innerHTML = '🏆 PR!';

            cell.appendChild(badge);

            // Jouer un son si disponible
            this.playSound('pr');
        }
    },

    // ========================================
    // ENREGISTREMENT DES PERFORMANCES
    // ========================================

    /**
     * Enregistrer une performance en mémoire (sera sauvegardée à la fin)
     * @param participantId
     * @param serieIndex
     * @param exerciseIndex
     * @param time
     */
    recordPerformance(participantId, serieIndex, exerciseIndex, time) {
        const participant = this.participants.find(p => p.id === participantId);
        const exercise = this.sessionConfig.exercises[exerciseIndex];

        if (!participant || !exercise) {
            return;
        }

        const performance = {
            participantId,
            participantName: participant.name,
            exerciseType: exercise.type,
            category: 'Endurance',
            serieIndex,
            exerciseIndex,
            time, // en secondes
            date: new Date().toISOString().split('T')[0],
            isPR: null // Sera calculé lors de la sauvegarde finale
        };

        this.performances.push(performance);
        console.log('💾 Performance enregistrée:', performance);
    },

    /**
     * Sauvegarder toutes les performances dans Supabase
     */
    async saveAllPerformances() {
        console.log('💾 Sauvegarde des performances dans Supabase...');

        const results = {
            saved: 0,
            errors: 0,
            prs: 0
        };

        for (const perf of this.performances) {
            try {
                // Vérifier si c'est un PR
                const participant = this.participants.find(p => p.id === perf.participantId);
                if (participant) {
                    perf.isPR = await this.checkForPR(participant, perf.exerciseType, perf.time);
                    if (perf.isPR) {
                        results.prs++;
                    }
                }

                // Créer la performance dans Supabase
                await SupabaseManager.createPerformance({
                    memberId: perf.participantId,
                    exerciseType: perf.exerciseType,
                    category: 'Endurance',
                    value: perf.time,
                    unit: 'seconds',
                    date: perf.date,
                    sessionId: this.currentSession?.id || null,
                    isPR: perf.isPR,
                    notes: `Série ${perf.serieIndex + 1} - ${this.currentSession?.title || 'Séance libre'}`
                });

                results.saved++;
            } catch (error) {
                console.error('❌ Erreur sauvegarde performance:', error);
                results.errors++;
            }
        }

        // Mettre à jour les cartes Pokémon si des PR ont été établis
        if (results.prs > 0) {
            console.log('⚡ Mise à jour des cartes Pokémon...');
            for (const participant of this.participants) {
                try {
                    await SupabaseManager.updatePokemonStats(participant.id);
                } catch (error) {
                    console.error('❌ Erreur MAJ Pokémon:', error);
                }
            }
        }

        console.log('✅ Sauvegarde terminée:', results);

        // Afficher le résumé
        alert(
            `✅ Sauvegarde terminée!\n\n${results.saved} performances enregistrées\n${results.prs} nouveaux PR 🏆\n${results.errors} erreurs`
        );

        return results;
    },

    // ========================================
    // UTILITAIRES
    // ========================================

    /**
     * Formater un temps en secondes en M:SS.ms ou SS.ms
     * @param seconds
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 100);

        if (mins > 0) {
            return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
        }
        return `${secs}.${ms.toString().padStart(2, '0')}`;
    },

    /**
     * Mettre à jour le temps total d'un participant
     * @param participantId
     */
    updateTotalTime(participantId) {
        let total = 0;

        Object.keys(this.timers.participants).forEach(key => {
            if (key.startsWith(participantId)) {
                const timer = this.timers.participants[key];
                if (timer.finalTime) {
                    total += timer.finalTime;
                }
            }
        });

        const display = document.getElementById(`total-${participantId}`);
        if (display) {
            display.textContent = this.formatTime(total);
        }
    },

    /**
     * Jouer un son
     * @param type
     */
    playSound(type) {
        // TODO: Implémenter les sons
        console.log('🔊 Son:', type);
    },

    /**
     * Fermer le module et retourner au calendrier
     */
    close() {
        // Arrêter tous les timers
        this.stopGlobalTimer();

        Object.keys(this.timers.participants).forEach(key => {
            const timer = this.timers.participants[key];
            if (timer.recoveryIntervalId) {
                clearInterval(timer.recoveryIntervalId);
            }
        });

        // Sortir du mode plein écran si actif
        if (this.isFullscreen) {
            this.exitFullscreen();
        }

        // Retour au calendrier
        if (typeof Calendar !== 'undefined' && Calendar.render) {
            Calendar.render();
        } else {
            location.reload();
        }
    },

    // ========================================
    // GESTION DU MODE PLEIN ÉCRAN
    // ========================================

    /**
     * Entrer en mode plein écran avec rotation paysage et wake lock
     */
    async enterFullscreen() {
        const chronoSection = document.getElementById('chronoSection');
        if (!chronoSection) {
            return;
        }

        try {
            // Activer le plein écran
            if (chronoSection.requestFullscreen) {
                await chronoSection.requestFullscreen();
            } else if (chronoSection.webkitRequestFullscreen) {
                await chronoSection.webkitRequestFullscreen();
            } else if (chronoSection.msRequestFullscreen) {
                await chronoSection.msRequestFullscreen();
            }

            // Verrouiller l'orientation en paysage
            if (screen.orientation && screen.orientation.lock) {
                try {
                    await screen.orientation.lock('landscape');
                } catch (e) {
                    console.log('Verrouillage orientation non supporté:', e);
                }
            }

            // Activer le Wake Lock pour empêcher la mise en veille
            if ('wakeLock' in navigator) {
                try {
                    this.wakeLock = await navigator.wakeLock.request('screen');
                    console.log("✅ Wake Lock activé - l'écran ne s'éteindra pas");

                    // Réactiver le wake lock si l'utilisateur change d'onglet
                    this.wakeLock.addEventListener('release', () => {
                        console.log('⚠️ Wake Lock relâché');
                    });
                } catch (err) {
                    console.error('❌ Erreur Wake Lock:', err);
                }
            }

            this.isFullscreen = true;
            chronoSection.classList.add('fullscreen-mode');

            console.log('✅ Mode plein écran activé');
        } catch (error) {
            console.error('❌ Erreur activation plein écran:', error);
            alert("Impossible d'activer le mode plein écran");
        }
    },

    /**
     * Sortir du mode plein écran
     */
    async exitFullscreen() {
        try {
            // Sortir du plein écran
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                await document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                await document.msExitFullscreen();
            }

            // Déverrouiller l'orientation
            if (screen.orientation && screen.orientation.unlock) {
                screen.orientation.unlock();
            }

            // Relâcher le Wake Lock
            if (this.wakeLock) {
                await this.wakeLock.release();
                this.wakeLock = null;
                console.log('✅ Wake Lock désactivé');
            }

            this.isFullscreen = false;
            const chronoSection = document.getElementById('chronoSection');
            if (chronoSection) {
                chronoSection.classList.remove('fullscreen-mode');
            }

            console.log('✅ Mode plein écran désactivé');
        } catch (error) {
            console.error('❌ Erreur désactivation plein écran:', error);
        }
    },

    // ========================================
    // RENDU DE L'INTERFACE
    // ========================================

    /**
     * Rendre l'interface complète
     */
    render() {
        const html = `
            <div style="min-height: 100vh; background: var(--bg-primary);">
                <!-- Header Modern Glass -->
                <div style="background: var(--glass-bg); backdrop-filter: blur(20px); border-bottom: 1px solid var(--glass-border); padding: 2rem;">
                    <div style="max-width: 1600px; margin: 0 auto; text-align: center;">
                        <h1 style="font-size: 2.5rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.5rem;">
                            <i class="fas fa-stopwatch" style="color: var(--accent-primary); margin-right: 1rem;"></i>
                            ${this.currentSession ? this.currentSession.title : 'Chrono Course Pro'}
                        </h1>
                        <p style="color: var(--text-secondary); font-size: 1rem; font-weight: 600;">
                            ${this.participants.length} participant${this.participants.length > 1 ? 's' : ''} • Chronométrage temps réel avec détection PR
                        </p>
                        <div style="margin-top: 1rem;">
                            <button onclick="RunSessionManager.close()" style="padding: 0.75rem 1.5rem; background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-primary); border-radius: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='var(--glass-bg-hover)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.background='var(--glass-bg)'; this.style.transform='translateY(0)'">
                                <i class="fas fa-arrow-left" style="margin-right: 0.5rem;"></i>Retour au Planning
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Main Content -->
                <div style="max-width: 1600px; margin: 0 auto; padding: 2rem;">
                    ${this.renderTimingSection()}
                </div>
            </div>

            <!-- Styles CSS -->
            <style>
                @keyframes pr-pulse {
                    0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(255, 215, 0, 0.5); }
                    50% { transform: scale(1.05); box-shadow: 0 0 40px rgba(255, 215, 0, 0.8); }
                }

                @keyframes pr-bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }

                @keyframes bloom {
                    0% { box-shadow: 0 0 10px rgba(255, 255, 255, 0.1); }
                    100% { box-shadow: 0 0 30px rgba(255, 255, 255, 0.3); }
                }

                /* Animation de clignotement rouge pour la fin de récupération */
                @keyframes redBlink {
                    0%, 100% {
                        background-color: rgba(239, 68, 68, 0.8);
                        box-shadow: 0 0 30px rgba(239, 68, 68, 0.8);
                    }
                    50% {
                        background-color: rgba(239, 68, 68, 0.3);
                        box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
                    }
                }

                @keyframes textBlink {
                    0%, 100% {
                        color: #ffffff;
                        text-shadow: 0 0 20px rgba(239, 68, 68, 1);
                    }
                    50% {
                        color: rgba(239, 68, 68, 1);
                        text-shadow: 0 0 5px rgba(239, 68, 68, 0.5);
                    }
                }

                /* Classes pour le clignotement */
                .recovery-blink-bg {
                    animation: redBlink 0.6s ease-in-out infinite !important;
                    border: 2px solid #ef4444 !important;
                }

                .recovery-blink {
                    animation: textBlink 0.6s ease-in-out infinite !important;
                    font-weight: 900 !important;
                    font-size: 1rem !important;
                }

                /* Mode Plein Écran */
                .fullscreen-mode {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    max-width: 100vw !important;
                    margin: 0 !important;
                    border-radius: 0 !important;
                    z-index: 9999 !important;
                    overflow: auto !important;
                }

                /* Bouton de sortie en mode plein écran */
                #exitFullscreenBtn {
                    display: none;
                }

                .fullscreen-mode #fullscreenBtn {
                    display: none !important;
                }

                .fullscreen-mode #exitFullscreenBtn {
                    display: inline-flex !important;
                    position: sticky;
                    top: 1rem;
                    right: 1rem;
                    z-index: 10000;
                }

                /* Ajustements pour le mode paysage */
                @media screen and (orientation: landscape) {
                    .fullscreen-mode table {
                        font-size: 0.875rem;
                    }

                    .fullscreen-mode #globalTimer {
                        font-size: 3rem !important;
                    }
                }

                /* Fix pour les options de select - texte noir */
                select option {
                    background-color: #ffffff !important;
                    color: #000000 !important;
                }

                select {
                    color: var(--text-primary) !important;
                }
            </style>
        `;

        document.getElementById('mainContent').innerHTML = html;
        console.log('✅ Interface rendue');
    },

    /**
     * Section de configuration de la séance
     */
    renderConfigSection() {
        // Charger les exercices Cardio depuis Supabase
        const cardioExercises = SupabaseManager.getExercises()['Endurance'] || [];

        return `
            <div style="background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: 1rem; padding: 1.5rem;">
                <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.75rem;">
                    <i class="fas fa-cog" style="color: var(--accent-primary);"></i>
                    <span>1. Configuration de la Séance</span>
                </h2>

                <div style="margin-bottom: 1.5rem;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                        <label style="font-size: 0.875rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">Exercices</label>
                        <button onclick="RunSessionManager.addExercise()" style="padding: 0.5rem 1rem; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); color: var(--bg-primary); font-size: 0.875rem; font-weight: 700; border-radius: 0.5rem; border: none; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 0 20px rgba(255, 255, 255, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                            <i class="fas fa-plus" style="margin-right: 0.5rem;"></i>Ajouter
                        </button>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 1rem;" id="exercisesList">
                        ${
                            this.sessionConfig.exercises
                                .map(
                                    (ex, i) => `
                            <div style="background: var(--glass-bg-hover); border: 1px solid var(--glass-border); border-radius: 0.75rem; padding: 1rem;">
                                <div style="display: flex; align-items: start; gap: 0.75rem; margin-bottom: 0.75rem;">
                                    <select onchange="RunSessionManager.updateExerciseType(${i}, this.value)"
                                            style="flex: 1; padding: 0.75rem; background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-primary); border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                                        ${cardioExercises
                                            .map(
                                                exercise => `
                                            <option value="${exercise}" ${ex.type === exercise ? 'selected' : ''}>
                                                ${exercise}
                                            </option>
                                        `
                                            )
                                            .join('')}
                                    </select>
                                    <button onclick="RunSessionManager.removeExercise(${i})" style="padding: 0.75rem 1rem; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.5); color: rgb(239, 68, 68); border-radius: 0.5rem; font-weight: 700; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(239, 68, 68, 0.3)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.2)'">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;">
                                    <div>
                                        <label style="display: block; font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">Séries</label>
                                        <input type="number"
                                               value="${ex.series}"
                                               onchange="RunSessionManager.updateExerciseSeries(${i}, parseInt(this.value))"
                                               min="1"
                                               style="width: 100%; padding: 0.75rem; background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-primary); border-radius: 0.5rem; font-weight: 600; text-align: center; transition: all 0.2s;">
                                    </div>
                                    <div>
                                        <label style="display: block; font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">Récup</label>
                                        <input type="text"
                                               value="${this.formatTimeMMSS(ex.recovery)}"
                                               onchange="RunSessionManager.updateExerciseRecovery(${i}, this.value)"
                                               placeholder="01:30"
                                               style="width: 100%; padding: 0.75rem; background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-primary); border-radius: 0.5rem; font-weight: 600; text-align: center; transition: all 0.2s;">
                                    </div>
                                    <div>
                                        <label style="display: block; font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">% PR</label>
                                        <input type="number"
                                               value="${ex.targetPercentage || 85}"
                                               onchange="RunSessionManager.updateExercisePercentage(${i}, parseInt(this.value))"
                                               min="50"
                                               max="100"
                                               step="5"
                                               style="width: 100%; padding: 0.75rem; background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-primary); border-radius: 0.5rem; font-weight: 600; text-align: center; transition: all 0.2s;">
                                    </div>
                                </div>
                            </div>
                        `
                                )
                                .join('') ||
                            '<p style="text-align: center; color: var(--text-secondary); padding: 2rem; font-style: italic;">Aucun exercice configuré</p>'
                        }
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Section de gestion des participants
     */
    renderParticipantsSection() {
        return `
            <div class="glass-card">
                <h3 class="card-title">
                    <i class="fas fa-users mr-2 text-primary"></i>
                    Participants
                </h3>

                <!-- Recherche -->
                <div class="mb-4">
                    <input type="text"
                           id="searchParticipants"
                           placeholder="🔍 Rechercher un adhérent..."
                           oninput="RunSessionManager.handleSearch(this.value)"
                           class="search-input">
                    <div id="searchResults" class="mt-2"></div>
                </div>

                <!-- Liste des participants -->
                <div class="space-y-2">
                    ${
                        this.participants
                            .map(
                                p => `
                        <div class="participant-item">
                            <div>
                                <div class="participant-name">
                                    ${p.name}
                                </div>
                                ${this.sessionConfig.exercises
                                    .map(ex => {
                                        const perfs = p.performances[ex.type];
                                        return `
                                        <div class="participant-pr-info">
                                            ${ex.type}: ${perfs?.bestTime ? 'PR ' + this.formatTime(perfs.bestTime) : 'Aucun PR'}
                                        </div>
                                    `;
                                    })
                                    .join('')}
                            </div>
                            <button onclick="RunSessionManager.removeParticipant('${p.id}')" class="btn-danger btn-sm">
                                ×
                            </button>
                        </div>
                    `
                            )
                            .join('') || '<p class="empty-text">Aucun participant</p>'
                    }
                </div>
            </div>
        `;
    },

    /**
     * Section de chronométrage
     */
    renderTimingSection() {
        // WORKFLOW VERTICAL: 1. Config → 2. Import Participants → 3. Chronométrage
        return `
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">

                <!-- ═══════════════════════════════════════════════════ -->
                <!-- SECTION 1: CONFIGURATION SÉANCE (TOUJOURS VISIBLE) -->
                <!-- ═══════════════════════════════════════════════════ -->
                ${this.renderConfigSection()}

                <!-- ═══════════════════════════════════════════════════ -->
                <!-- SECTION 2: IMPORT DES PARTICIPANTS -->
                <!-- ═══════════════════════════════════════════════════ -->
                ${this.renderParticipantsImportSection()}

                <!-- ═══════════════════════════════════════════════════ -->
                <!-- SECTION 3: CHRONOMÉTRAGE (SI PARTICIPANTS AJOUTÉS) -->
                <!-- ═══════════════════════════════════════════════════ -->
                ${this.participants.length > 0 ? this.renderChronometrage() : ''}

            </div>
        `;
    },

    /**
     * Section d'import des participants (copier-coller comme TeamBuilder)
     */
    renderParticipantsImportSection() {
        const recognized = this.participants.filter(p => p.isInDatabase);

        return `
            <div style="background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: 1rem; padding: 1.5rem;">
                <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.75rem;">
                    <i class="fas fa-clipboard-list" style="color: var(--accent-primary);"></i>
                    <span>2. Import des Participants</span>
                    <span style="margin-left: auto; font-size: 0.875rem; font-weight: 600; padding: 0.5rem 1rem; background: var(--glass-bg-hover); border: 1px solid var(--glass-border); border-radius: 0.5rem;">
                        ${recognized.length} Reconnu${recognized.length > 1 ? 's' : ''}
                    </span>
                </h2>

                <!-- Textarea pour copier-coller -->
                <textarea id="participantsTextInput"
                          placeholder="Copiez-collez la liste des participants ici:&#10;&#10;Jean Dupont&#10;Marie Martin&#10;Pierre Durand&#10;...&#10;&#10;⚠️ Reconnaissance STRICTE: Seuls les adhérents présents dans la base de données seront ajoutés."
                          oninput="RunSessionManager.autoRecognizeParticipants()"
                          style="width: 100%; min-height: 150px; padding: 1rem; background: var(--input-bg); border: 1px solid var(--glass-border); border-radius: 0.75rem; color: var(--text-primary); font-size: 0.9375rem; font-family: inherit; resize: vertical; transition: all 0.2s;"
                          onfocus="this.style.borderColor='var(--accent-primary)'"
                          onblur="this.style.borderColor='var(--glass-border)'"></textarea>

                <div style="display: flex; gap: 0.75rem; margin-top: 1rem;">
                    <button onclick="RunSessionManager.openSearchModal()" style="flex: 1; padding: 0.75rem 1.25rem; background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-primary); border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='var(--glass-bg-hover)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.background='var(--glass-bg)'; this.style.transform='translateY(0)'">
                        <i class="fas fa-search" style="margin-right: 0.5rem;"></i>Rechercher dans la base
                    </button>
                    <button onclick="document.getElementById('participantsTextInput').value=''; RunSessionManager.participants=[]; RunSessionManager.render();" style="padding: 0.75rem 1.25rem; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(239, 68, 68, 0.2)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.1)'">
                        <i class="fas fa-trash" style="margin-right: 0.5rem;"></i>Effacer
                    </button>
                </div>

                <!-- Liste des participants reconnus -->
                ${
                    recognized.length > 0
                        ? `
                    <div style="margin-top: 1.5rem;">
                        <h3 style="font-size: 1rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
                            Participants Reconnus (${recognized.length})
                        </h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.75rem;">
                            ${recognized
                                .map(
                                    p => `
                                <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 0.75rem; transition: all 0.2s;" onmouseover="this.style.background='var(--glass-bg-hover)'; this.style.borderColor='var(--accent-primary)'" onmouseout="this.style.background='var(--glass-bg)'; this.style.borderColor='var(--glass-border)'">
                                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                                        <i class="fas fa-user-check" style="color: var(--accent-primary); font-size: 0.75rem;"></i>
                                        <span style="color: var(--text-primary); font-weight: 600; font-size: 0.875rem;">${p.name}</span>
                                    </div>
                                    <button onclick="RunSessionManager.removeParticipant('${p.id}')" style="padding: 0.25rem 0.5rem; background: transparent; border: none; color: #ef4444; cursor: pointer; border-radius: 0.5rem; transition: all 0.2s;" onmouseover="this.style.background='rgba(239, 68, 68, 0.1)'" onmouseout="this.style.background='transparent'">
                                        <i class="fas fa-times" style="font-size: 0.75rem;"></i>
                                    </button>
                                </div>
                            `
                                )
                                .join('')}
                        </div>
                    </div>
                `
                        : ''
                }
            </div>
        `;
    },

    /**
     * Section de chronométrage (tableau avec timers)
     */
    renderChronometrage() {
        if (this.participants.length === 0) {
            return '';
        }

        return `
            <div id="chronoSection" style="background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: 1rem; padding: 1.5rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
                    <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin: 0; display: flex; align-items: center; gap: 0.75rem;">
                        <i class="fas fa-stopwatch" style="color: var(--accent-primary);"></i>
                        <span>3. Chronométrage</span>
                    </h2>

                    <!-- Boutons Plein Écran -->
                    <div style="display: flex; gap: 0.75rem;">
                        <button id="fullscreenBtn" onclick="RunSessionManager.enterFullscreen()" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); color: var(--bg-primary); font-size: 0.875rem; font-weight: 700; border-radius: 0.75rem; border: none; cursor: pointer; transition: all 0.3s; box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);" onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 0 30px rgba(255, 255, 255, 0.4)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 0 20px rgba(255, 255, 255, 0.2)'">
                            <i class="fas fa-expand" style="margin-right: 0.5rem;"></i>Mode Plein Écran
                        </button>
                        <button id="exitFullscreenBtn" onclick="RunSessionManager.exitFullscreen()" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; font-size: 0.875rem; font-weight: 700; border-radius: 0.75rem; border: none; cursor: pointer; transition: all 0.3s; box-shadow: 0 0 20px rgba(239, 68, 68, 0.3); display: none;" onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 0 30px rgba(239, 68, 68, 0.5)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 0 20px rgba(239, 68, 68, 0.3)'">
                            <i class="fas fa-compress" style="margin-right: 0.5rem;"></i>Quitter Plein Écran
                        </button>
                    </div>
                </div>

                <!-- Barre de contrôle moderne -->
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; padding: 1rem; background: var(--glass-bg-hover); border: 1px solid var(--glass-border); border-radius: 0.75rem;">
                    <div style="text-align: center; flex: 1;">
                        <div id="globalTimer" style="font-family: 'Courier New', monospace; font-size: 2.5rem; font-weight: 900; color: var(--accent-primary); text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);">
                            00:00:00
                        </div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 0.25rem;">
                            Chrono Global
                        </div>
                    </div>

                    <button onclick="RunSessionManager.startAllParticipantsFirstSerie()"
                            id="btnGlobalStart"
                            style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #10b981, #059669); color: white; font-size: 1rem; font-weight: 800; border-radius: 0.75rem; border: none; cursor: pointer; box-shadow: 0 0 30px rgba(16, 185, 129, 0.4); text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.3s;" onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 0 40px rgba(16, 185, 129, 0.6)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 0 30px rgba(16, 185, 129, 0.4)'">
                        <i class="fas fa-play" style="margin-right: 0.5rem;"></i>DÉMARRER
                    </button>
                </div>

                <!-- Tableau moderne avec sticky header -->
                <div style="overflow-x: auto; border-radius: 0.75rem; border: 1px solid var(--glass-border);">
                    <table style="width: 100%; border-collapse: separate; border-spacing: 0;">
                        <thead style="position: sticky; top: 0; background: var(--glass-bg); backdrop-filter: blur(20px); z-index: 10;">
                            <tr>
                                <th style="padding: 1rem; text-align: left; font-weight: 700; font-size: 0.875rem; color: var(--text-primary); border-bottom: 2px solid var(--glass-border); text-transform: uppercase; letter-spacing: 0.05em; background: var(--glass-bg); position: sticky; left: 0; z-index: 11;">
                                    <i class="fas fa-user" style="margin-right: 0.5rem; color: var(--accent-primary);"></i>Participant
                                </th>
                                ${this.sessionConfig.exercises
                                    .map((ex, exIdx) =>
                                        Array.from(
                                            { length: ex.series },
                                            (_, i) => `
                                        <th style="padding: 1rem; text-align: center; font-weight: 700; font-size: 0.75rem; color: var(--text-primary); border-bottom: 2px solid var(--glass-border); text-transform: uppercase; letter-spacing: 0.05em; min-width: 140px;">
                                            <div style="color: var(--accent-primary); font-weight: 800; margin-bottom: 0.25rem;">${ex.type.replace('Run', '').replace('Row', '').replace('Bike', '').replace('Skierg', '').trim()}</div>
                                            <div style="color: var(--text-secondary); font-size: 0.7rem;">Série ${i + 1}</div>
                                        </th>
                                    `
                                        ).join('')
                                    )
                                    .join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${this.participants
                                .map(
                                    p => `
                                <tr style="border-bottom: 1px solid var(--glass-border); transition: all 0.2s;" onmouseover="this.style.background='var(--glass-bg-hover)'" onmouseout="this.style.background='transparent'">
                                    <td style="padding: 1rem; color: var(--text-primary); font-weight: 700; font-size: 1rem; border-right: 1px solid var(--glass-border); background: var(--glass-bg); position: sticky; left: 0; z-index: 1;">
                                        <div style="margin-bottom: 0.5rem;">${p.name.split(' ')[0]}</div>
                                        ${this.sessionConfig.exercises
                                            .map(ex => {
                                                const perfs = p.performances[ex.type];
                                                if (!perfs?.bestTime) {
                                                    return '';
                                                }
                                                const targetPercentage = ex.targetPercentage || 85;
                                                const targetTime =
                                                    perfs.bestTime / (targetPercentage / 100);
                                                return `<div style="font-size: 0.7rem; color: var(--accent-primary); font-weight: 600; margin-top: 0.25rem;">PR: ${this.formatTime(perfs.bestTime)}</div>
                                                    <div style="font-size: 0.7rem; color: var(--text-secondary); font-weight: 600;">→ ${this.formatTime(targetTime)}</div>`;
                                            })
                                            .join('')}
                                    </td>
                                    ${this.sessionConfig.exercises
                                        .map((ex, exIdx) =>
                                            Array.from({ length: ex.series }, (_, serieIdx) => {
                                                const key = `${p.id}-${serieIdx}-${exIdx}`;
                                                return `
                                                <td id="cell-${key}" style="padding: 1rem; text-align: center; vertical-align: middle; transition: all 0.3s;">
                                                    <div id="time-${key}" style="font-family: 'Courier New', monospace; font-size: 1.5rem; font-weight: 700; color: var(--accent-primary); margin-bottom: 0.75rem; text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);">
                                                        --:--
                                                    </div>
                                                    <button id="btn-${key}"
                                                            onclick="RunSessionManager.toggleTimer('${p.id}', ${serieIdx}, ${exIdx})"
                                                            style="padding: 0.5rem 1rem; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); color: var(--bg-primary); font-size: 0.875rem; font-weight: 700; border-radius: 0.5rem; border: none; cursor: pointer; transition: all 0.2s; box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);" onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 0 25px rgba(255, 255, 255, 0.4)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 0 15px rgba(255, 255, 255, 0.2)'">
                                                        <i class="fas fa-play"></i>
                                                    </button>
                                                    <div id="recovery-${key}" class="hidden" style="margin-top: 0.75rem; font-size: 0.75rem; font-weight: 600; color: var(--accent-secondary); padding: 0.5rem; background: var(--glass-bg-hover); border-radius: 0.5rem;">
                                                        --s
                                                    </div>
                                                </td>
                                            `;
                                            }).join('')
                                        )
                                        .join('')}
                                </tr>
                            `
                                )
                                .join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Bouton de sauvegarde moderne -->
                ${
                    this.performances.length > 0
                        ? `
                    <div style="margin-top: 2rem; text-align: center;">
                        <button onclick="RunSessionManager.saveAllPerformances()" style="padding: 1.25rem 3rem; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); color: var(--bg-primary); font-size: 1.125rem; font-weight: 800; border-radius: 0.75rem; border: none; cursor: pointer; box-shadow: 0 0 30px rgba(255, 255, 255, 0.3); text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.3s;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 0 50px rgba(255, 255, 255, 0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 0 30px rgba(255, 255, 255, 0.3)'">
                            <i class="fas fa-save" style="margin-right: 0.75rem;"></i>Sauvegarder ${this.performances.length} Performance${this.performances.length > 1 ? 's' : ''}
                        </button>
                    </div>
                `
                        : ''
                }
            </div>
        `;
    },

    /**
     * Gestion de la recherche rapide (dans le header)
     * @param query
     */
    async handleSearchQuick(query) {
        const resultsDiv = document.getElementById('searchResultsQuick');

        if (!query || query.length < 2) {
            resultsDiv.innerHTML = '';
            return;
        }

        const members = await this.searchMembers(query);

        if (members.length === 0) {
            resultsDiv.innerHTML = '';
            return;
        }

        resultsDiv.innerHTML = members
            .slice(0, 5)
            .map(
                m => `
            <div onclick="RunSessionManager.addParticipant('${m.id}')" class="quick-search-result-item">
                ${m.name}
            </div>
        `
            )
            .join('');
    },

    /**
     * Toggle le panel de configuration
     */
    toggleConfigPanel() {
        const panel = document.getElementById('configPanel');
        panel.classList.toggle('hidden');
    },

    /**
     * Render compact des exercices pour la config
     */
    renderExercisesConfig() {
        const cardioExercises = SupabaseManager.getExercises()['Endurance'] || [];

        return this.sessionConfig.exercises
            .map(
                (ex, i) => `
            <div class="exercise-compact-config">
                <div class="grid grid-cols-5 gap-2 items-center">
                    <select onchange="RunSessionManager.updateExerciseType(${i}, this.value)"
                            class="col-span-2 form-input text-xs">
                        ${cardioExercises
                            .map(
                                exercise => `
                            <option value="${exercise}" ${ex.type === exercise ? 'selected' : ''}>
                                ${exercise}
                            </option>
                        `
                            )
                            .join('')}
                    </select>
                    <input type="number" value="${ex.series}"
                           onchange="RunSessionManager.updateExerciseSeries(${i}, parseInt(this.value))"
                           min="1" placeholder="Séries"
                           class="form-input text-xs text-center">
                    <input type="text" value="${this.formatTimeMMSS(ex.recovery)}"
                           onchange="RunSessionManager.updateExerciseRecovery(${i}, this.value)"
                           placeholder="Récup"
                           class="form-input text-xs text-center">
                    <input type="number" value="${ex.targetPercentage || 85}"
                           onchange="RunSessionManager.updateExercisePercentage(${i}, parseInt(this.value))"
                           min="50" max="100" step="5" placeholder="%"
                           class="form-input text-xs text-center">
                </div>
                <button onclick="RunSessionManager.removeExercise(${i})" class="btn-danger btn-sm mt-1">
                    Supprimer
                </button>
            </div>
        `
            )
            .join('');
    },

    /**
     * Gérer la recherche de participants
     * @param query
     */
    async handleSearch(query) {
        const resultsDiv = document.getElementById('searchResults');

        if (!query || query.length < 2) {
            resultsDiv.innerHTML = '';
            return;
        }

        const members = await this.searchMembers(query);

        if (members.length === 0) {
            resultsDiv.innerHTML = '<p class="text-sm text-secondary p-2">Aucun résultat</p>';
            return;
        }

        resultsDiv.innerHTML = members
            .map(
                m => `
            <div onclick="RunSessionManager.addParticipant('${m.id}')" class="search-result-item">
                <strong>${m.name}</strong>
            </div>
        `
            )
            .join('');
    },

    // ========================================
    // GESTION DES EXERCICES
    // ========================================

    /**
     * Ajouter un nouvel exercice
     */
    addExercise() {
        const cardioExercises = SupabaseManager.getExercises()['Endurance'] || [];
        const defaultExercise = cardioExercises[0] || '600m Run';

        this.sessionConfig.exercises.push({
            type: defaultExercise,
            series: 5,
            recovery: 90, // 1:30
            category: 'Endurance',
            targetPercentage: 85 // % par défaut
        });

        // Rafraîchir l'interface complète pour afficher le nouvel exercice
        this.render();

        console.log('✅ Exercice ajouté:', defaultExercise);
    },

    /**
     * Supprimer un exercice
     * @param index
     */
    removeExercise(index) {
        if (confirm('Supprimer cet exercice ?')) {
            this.sessionConfig.exercises.splice(index, 1);
            this.render();
            console.log('✅ Exercice supprimé');
        }
    },

    /**
     * Mettre à jour le type d'exercice
     * @param index
     * @param value
     */
    updateExerciseType(index, value) {
        this.sessionConfig.exercises[index].type = value;
        console.log(`✅ Exercice ${index} mis à jour: ${value}`);
    },

    /**
     * Mettre à jour le nombre de séries
     * @param index
     * @param value
     */
    updateExerciseSeries(index, value) {
        this.sessionConfig.exercises[index].series = Math.max(1, value);
        this.render();
        console.log(`✅ Séries mises à jour: ${value}`);
    },

    /**
     * Mettre à jour le pourcentage cible d'un exercice spécifique
     * @param index
     * @param value
     */
    updateExercisePercentage(index, value) {
        this.sessionConfig.exercises[index].targetPercentage = Math.max(50, Math.min(100, value));
        this.render();
        console.log(`✅ Pourcentage exercice ${index} mis à jour: ${value}%`);
    },

    /**
     * Mettre à jour le temps de récupération (format mm:ss)
     * @param index
     * @param value
     */
    updateExerciseRecovery(index, value) {
        const seconds = this.parseTimeMMSS(value);
        this.sessionConfig.exercises[index].recovery = Math.max(0, seconds);
        console.log(`✅ Récupération mise à jour: ${value} (${seconds}s)`);
    },

    /**
     * Convertir secondes en format mm:ss
     * @param totalSeconds
     */
    formatTimeMMSS(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    },

    /**
     * Parser format mm:ss en secondes
     * @param timeString
     */
    parseTimeMMSS(timeString) {
        // Supporte plusieurs formats: "1:30", "01:30", "90" (secondes directes)
        if (!timeString) {
            return 0;
        }

        const str = String(timeString).trim();

        // Si c'est juste un nombre (secondes)
        if (!str.includes(':')) {
            return parseInt(str) || 0;
        }

        // Format mm:ss
        const parts = str.split(':');
        const minutes = parseInt(parts[0]) || 0;
        const seconds = parseInt(parts[1]) || 0;
        return minutes * 60 + seconds;
    },

    // ========================================
    // DÉMARRAGE SIMULTANÉ
    // ========================================

    /**
     * Démarrer tous les participants en même temps pour la série 1
     */
    startAllParticipantsFirstSerie() {
        if (this.participants.length === 0) {
            alert('Aucun participant à démarrer !');
            return;
        }

        if (this.sessionConfig.exercises.length === 0) {
            alert('Aucun exercice configuré !');
            return;
        }

        console.log('🚀 Démarrage simultané de tous les participants pour la série 1');

        // Démarrer le chrono global si pas déjà lancé
        if (!this.timers.global.running) {
            this.startGlobalTimer();
        }

        // Démarrer tous les participants pour la série 1 du premier exercice
        this.participants.forEach(participant => {
            this.startParticipantTimer(participant.id, 0, 0);
        });

        // Désactiver le bouton de démarrage global
        const btn = document.getElementById('btnGlobalStart');
        if (btn) {
            btn.disabled = true;
            btn.textContent = '✓ Séance démarrée';
        }

        console.log(`✅ ${this.participants.length} participants démarrés`);
    }
};

// Export global
window.RunSessionManager = RunSessionManager;
console.log('✅ RunSessionManager chargé (version refonte complète)');
