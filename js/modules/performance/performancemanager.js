// Gestionnaire des performances avec calcul du 1RM théorique et recherche base de données
const PerformanceManager = {
    // Formules de calcul du 1RM (One Rep Max)
    OneRMFormulas: {
        // Formule d'Epley (la plus courante et fiable)
        epley: (weight, reps) => {
            if (reps === 1) {
                return weight;
            }
            if (reps === 0) {
                return 0;
            }
            return weight * (1 + reps / 30);
        },

        // Formule de Brzycki (alternative précise pour 1-10 reps)
        brzycki: (weight, reps) => {
            if (reps === 1) {
                return weight;
            }
            if (reps === 0) {
                return 0;
            }
            return weight / (1.0278 - 0.0278 * reps);
        },

        // Formule de Lombardi
        lombardi: (weight, reps) => {
            if (reps === 0) {
                return 0;
            }
            return weight * Math.pow(reps, 0.1);
        }
    },

    // Calculer le 1RM avec la formule d'Epley (plus fiable)
    calculate1RM(weight, reps) {
        // Validation des entrées
        weight = parseFloat(weight);
        reps = parseInt(reps);

        if (isNaN(weight) || isNaN(reps) || weight <= 0 || reps <= 0) {
            return null;
        }

        // Si c'est déjà un 1RM, retourner directement le poids
        if (reps === 1) {
            return weight;
        }

        // Utiliser la formule d'Epley pour le calcul
        const oneRM = this.OneRMFormulas.epley(weight, reps);

        // Arrondir à 0.5kg près pour être pratique
        return Math.round(oneRM * 2) / 2;
    },

    // Calculer le pourcentage du 1RM
    calculatePercentage1RM(weight, reps, oneRM) {
        const current1RM = this.calculate1RM(weight, reps);
        if (!current1RM || !oneRM) {
            return null;
        }
        return Math.round((current1RM / oneRM) * 100);
    },

    // Ouvrir la modal de performance rapide AMÉLIORÉE (VERSION SUPABASE)
    async openQuickPerformanceModal(memberId = null) {
        const membersList = await SupabaseManager.getMembers();
        const selectedMember = memberId ? membersList.find(m => m.id === memberId) : null;

        const html = `
            <div class="fixed inset-0 modal-backdrop flex items-center justify-center z-50 fade-in-premium" onclick="Utils.closeModal(event)">
                <div class="premium-card max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
                    <h3 class="text-2xl font-bold text-green-400 mb-6">
                        <i class="fas fa-chart-line mr-3"></i>Enregistrer une Performance
                    </h3>
                    
                    <div class="space-y-4">
                        <!-- Sélection adhérent avec recherche -->
                        <div>
                            <label class="block text-sm font-medium text-green-400 mb-2">Adhérent</label>
                            <div class="flex space-x-2">
                                ${
                                    selectedMember
                                        ? `
                                    <input type="text"
                                           value="${selectedMember.name}"
                                           class="flex-1 rounded-lg p-3 bg-wood-dark bg-opacity-50"
                                           disabled>
                                    <input type="hidden" id="performanceMember" value="${selectedMember.id}">
                                `
                                        : `
                                    <div class="flex-1 relative">
                                        <input type="text" 
                                               id="memberSearchInput" 
                                               placeholder="Rechercher un adhérent..." 
                                               class="w-full rounded-lg p-3"
                                               oninput="PerformanceManager.searchMember()"
                                               onfocus="PerformanceManager.showSearchResults()">
                                        <input type="hidden" id="performanceMember" value="">
                                        
                                        <!-- Résultats de recherche -->
                                        <div id="memberSearchResults" class="hidden absolute top-full left-0 right-0 mt-1 bg-wood-dark rounded-lg shadow-xl max-h-48 overflow-y-auto z-10 border border-green-600 border-opacity-30">
                                            <!-- Résultats ici -->
                                        </div>
                                    </div>
                                    
                                    <!-- Bouton recherche dans la base -->
                                    <button onclick="PerformanceManager.openDatabaseSearch()" 
                                            class="btn-premium btn-sync px-4">
                                        <i class="fas fa-database"></i>
                                    </button>
                                `
                                }
                            </div>
                        </div>
                        
                        <!-- Sélection catégorie et exercice -->
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-green-400 mb-2">Catégorie</label>
                                <select id="performanceCategory" class="w-full rounded-lg p-3" onchange="PerformanceManager.updateExercisesList()">
                                    <option value="">Choisir une catégorie</option>
                                    <option value="Musculation">Musculation</option>
                                    <option value="Crosstraining">Crosstraining</option>
                                    <option value="Endurance">Endurance</option>
                                    <option value="Gymnastique">Gymnastique</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-green-400 mb-2">Exercice</label>
                                <select id="performanceExercise" class="w-full rounded-lg p-3" onchange="PerformanceManager.onExerciseChange()">
                                    <option value="">Choisir un exercice</option>
                                </select>
                            </div>
                        </div>
                        
                        <div id="performanceInputs" class="hidden space-y-4">
                            <!-- Type de mesure -->
                            <div>
                                <label class="block text-sm font-medium text-green-400 mb-2">Type de mesure</label>
                                <select id="performanceType" class="w-full rounded-lg p-3" onchange="PerformanceManager.updatePerformanceInputs()">
                                    <option value="weight">Poids (kg) + Répétitions</option>
                                    <option value="time">Temps (mm:ss)</option>
                                    <option value="distance">Distance (m/km)</option>
                                    <option value="reps">Répétitions seules</option>
                                </select>
                            </div>
                            
                            <!-- Inputs pour poids et répétitions -->
                            <div id="weightRepsInputs" class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-green-400 mb-2">Poids (kg)</label>
                                    <input type="number" id="performanceWeight" class="w-full rounded-lg p-3" 
                                           placeholder="Ex: 80" step="0.5" min="0" 
                                           oninput="PerformanceManager.calculateAndDisplay1RM()">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-green-400 mb-2">Répétitions</label>
                                    <input type="number" id="performanceReps" class="w-full rounded-lg p-3" 
                                           placeholder="Ex: 5" min="1" max="30"
                                           oninput="PerformanceManager.calculateAndDisplay1RM()">
                                </div>
                            </div>
                            
                            <!-- Input alternatif -->
                            <div id="alternativeInput" class="hidden">
                                <label class="block text-sm font-medium text-green-400 mb-2">Valeur</label>
                                <input type="text" id="performanceValue" class="w-full rounded-lg p-3" 
                                       placeholder="Ex: 5:30, 1000m, 15 reps">
                            </div>
                            
                            <!-- Affichage du 1RM calculé -->
                            <div id="oneRMDisplay" class="hidden bg-wood-dark rounded-lg p-4 border border-green-600 border-opacity-30">
                                <div class="text-sm text-gray-400 mb-2">1RM Théorique Calculé</div>
                                <div class="text-2xl font-bold text-green-400" id="oneRMValue">-- kg</div>
                                <div class="text-xs text-gray-400 mt-2" id="oneRMFormula"></div>
                            </div>
                            
                            <!-- Historique du 1RM -->
                            <div id="oneRMHistory" class="hidden bg-wood-dark rounded-lg p-4">
                                <div class="text-sm text-gray-400 mb-2">Historique 1RM</div>
                                <div id="oneRMHistoryContent" class="text-sm space-y-1"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex space-x-3 mt-6">
                        <button onclick="PerformanceManager.savePerformance()" class="flex-1 btn-premium btn-publish">
                            <i class="fas fa-save mr-2"></i>Enregistrer Performance
                        </button>
                        <button onclick="Utils.closeModal()" class="flex-1 btn-premium btn-save-local">
                            <i class="fas fa-times mr-2"></i>Annuler
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('modalContainer').innerHTML = html;

        if (
            membersList.length === 0 &&
            (!MemberImport.memberDatabase || MemberImport.memberDatabase.length === 0)
        ) {
            alert(
                "Aucun adhérent disponible. Importez d'abord un fichier CSV ou ajoutez des adhérents."
            );
            Utils.closeModal();
            return;
        }
    },

    // Rechercher un membre (nouveau)
    async searchMember() {
        const search = document.getElementById('memberSearchInput').value.toLowerCase();
        const resultsDiv = document.getElementById('memberSearchResults');

        if (search.length < 2) {
            resultsDiv.classList.add('hidden');
            return;
        }

        // Chercher dans les membres actifs (Supabase)
        const activeMembers = await SupabaseManager.getMembers();
        const results = activeMembers.filter(m =>
            `${m.firstName} ${m.lastName}`.toLowerCase().includes(search)
        );

        if (results.length === 0) {
            resultsDiv.innerHTML = `
                <div class="p-3 text-center text-gray-400">
                    Aucun résultat
                </div>
            `;
        } else {
            resultsDiv.innerHTML = results
                .map(
                    member => `
                <div onclick="PerformanceManager.selectMember('${member.id}', '${member.firstName}', '${member.lastName}')"
                     class="p-3 hover:bg-green-600 hover:bg-opacity-20 cursor-pointer transition flex items-center space-x-3">
                    <i class="fas fa-user text-green-400"></i>
                    <div>
                        <div class="font-semibold">${member.firstName} ${member.lastName}</div>
                        <div class="text-xs text-gray-400">Adhérent actif</div>
                    </div>
                </div>
            `
                )
                .join('');
        }

        resultsDiv.classList.remove('hidden');
    },

    // Afficher les résultats de recherche
    showSearchResults() {
        const resultsDiv = document.getElementById('memberSearchResults');
        const search = document.getElementById('memberSearchInput').value;
        if (search.length >= 2) {
            resultsDiv.classList.remove('hidden');
        }
    },

    // Ouvrir la recherche dans la base de données
    openDatabaseSearch() {
        MemberImport.openQuickSearch('PerformanceManager.selectFromDatabase');
    },

    // Sélectionner depuis la base de données
    async selectFromDatabase(memberId) {
        // Vérifier si le membre existe déjà dans Supabase
        let activeMember = await SupabaseManager.getMember(memberId);

        if (!activeMember) {
            console.error('Membre non trouvé:', memberId);
            return;
        }

        // Fermer la modal de recherche et sélectionner
        Utils.closeModal();

        // Rouvrir la modal de performance avec le membre sélectionné
        setTimeout(() => {
            this.openQuickPerformanceModal(memberId);
        }, 100);
    },

    // Sélectionner un membre
    selectMember(id, firstName, lastName) {
        document.getElementById('performanceMember').value = id;
        document.getElementById('memberSearchInput').value = `${firstName} ${lastName}`;
        document.getElementById('memberSearchResults').classList.add('hidden');
        this.onMemberChange();
    },

    // Quand on change de membre
    onMemberChange() {
        const memberId = document.getElementById('performanceMember').value;
        const exercise = document.getElementById('performanceExercise').value;

        if (memberId && exercise) {
            this.loadExerciseHistory(memberId, exercise);
        }
    },

    // Quand on change d'exercice
    onExerciseChange() {
        const memberId = document.getElementById('performanceMember').value;
        const exercise = document.getElementById('performanceExercise').value;

        if (memberId && exercise) {
            this.loadExerciseHistory(memberId, exercise);
        }

        // Reset les valeurs
        const weightInput = document.getElementById('performanceWeight');
        const repsInput = document.getElementById('performanceReps');
        if (weightInput) {
            weightInput.value = '';
        }
        if (repsInput) {
            repsInput.value = '';
        }

        const oneRMValue = document.getElementById('oneRMValue');
        const oneRMFormula = document.getElementById('oneRMFormula');
        if (oneRMValue) {
            oneRMValue.textContent = '-- kg';
        }
        if (oneRMFormula) {
            oneRMFormula.textContent = '';
        }
    },

    // Charger l'historique d'un exercice
    async loadExerciseHistory(memberId, exercise) {
        const historyDiv = document.getElementById('oneRMHistory');
        if (!historyDiv) {
            return;
        }

        try {
            // Récupérer les performances pour ce membre et cet exercice depuis Supabase
            const allPerformances = await SupabaseManager.getPerformances(memberId);
            const performances = allPerformances.filter(p => p.exercise_type === exercise);

            if (performances.length === 0) {
                historyDiv.classList.add('hidden');
                return;
            }

            // Calculer 1RM pour chaque performance et trier
            const oneRMHistory = performances
                .map(p => ({
                    ...p,
                    oneRM: p.unit === 'kg' && p.reps ? this.calculate1RM(p.value, p.reps) : null
                }))
                .filter(p => p.oneRM)
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5);

            if (oneRMHistory.length > 0) {
                const historyHTML = oneRMHistory
                    .map((perf, idx) => {
                        const date = new Date(perf.date).toLocaleDateString('fr-FR');
                        const trend =
                            idx === 0 ? '' : perf.oneRM > oneRMHistory[idx - 1].oneRM ? '↑' : '↓';
                        return `
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">${date}</span>
                            <span class="font-bold ${idx === 0 ? 'text-green-400' : ''}">${perf.oneRM} kg ${trend}</span>
                        </div>
                    `;
                    })
                    .join('');

                document.getElementById('oneRMHistoryContent').innerHTML = historyHTML;
                historyDiv.classList.remove('hidden');
            } else {
                historyDiv.classList.add('hidden');
            }
        } catch (error) {
            console.error('Erreur chargement historique:', error);
            historyDiv.classList.add('hidden');
        }
    },

    // Mettre à jour la liste des exercices
    updateExercisesList() {
        const category = document.getElementById('performanceCategory').value;
        const exerciseSelect = document.getElementById('performanceExercise');
        const performanceInputs = document.getElementById('performanceInputs');
        const exercises = SupabaseManager.getExercises();

        exerciseSelect.innerHTML = '<option value="">Choisir un exercice</option>';

        if (category && exercises[category]) {
            exercises[category].forEach(exercise => {
                exerciseSelect.innerHTML += `<option value="${exercise}">${exercise}</option>`;
            });
            performanceInputs.classList.remove('hidden');

            // Par défaut, mettre le type sur "weight" pour la musculation et crosstraining
            if (category === 'Musculation' || category === 'Crosstraining') {
                document.getElementById('performanceType').value = 'weight';
                this.updatePerformanceInputs();
            }
        } else {
            performanceInputs.classList.add('hidden');
        }
    },

    // Mettre à jour les champs de saisie de performance
    updatePerformanceInputs() {
        const type = document.getElementById('performanceType').value;
        const weightRepsInputs = document.getElementById('weightRepsInputs');
        const alternativeInput = document.getElementById('alternativeInput');
        const oneRMDisplay = document.getElementById('oneRMDisplay');
        const valueInput = document.getElementById('performanceValue');

        if (type === 'weight') {
            weightRepsInputs.classList.remove('hidden');
            alternativeInput.classList.add('hidden');
            oneRMDisplay.classList.remove('hidden');
        } else {
            weightRepsInputs.classList.add('hidden');
            alternativeInput.classList.remove('hidden');
            oneRMDisplay.classList.add('hidden');

            // Adapter le placeholder selon le type
            let placeholder = '';
            switch (type) {
                case 'time':
                    placeholder = 'Ex: 5:30 ou 1:25:30';
                    break;
                case 'distance':
                    placeholder = 'Ex: 1000 ou 5.5';
                    break;
                case 'reps':
                    placeholder = 'Ex: 15';
                    break;
            }
            if (valueInput) {
                valueInput.placeholder = placeholder;
            }
        }
    },

    // Vérifier si c'est un nouveau PR
    async checkForPR(memberId, exercise, currentOneRM) {
        try {
            const allPerformances = await SupabaseManager.getPerformances(memberId);
            const performances = allPerformances.filter(
                p => p.exercise_type === exercise && p.unit === 'kg'
            );

            if (performances.length > 0) {
                const best1RM = Math.max(
                    ...performances.map(p => {
                        if (p.reps) {
                            return this.calculate1RM(p.value, p.reps) || 0;
                        }
                        return 0;
                    }),
                    0
                );

                if (currentOneRM > best1RM) {
                    document.getElementById('oneRMValue').innerHTML =
                        `${currentOneRM} kg <span class="text-yellow-400 text-sm ml-2">🏆 Nouveau PR!</span>`;
                }
            }
        } catch (error) {
            console.error('Erreur vérification PR:', error);
        }
    },

    // Calculer et afficher le 1RM en temps réel
    calculateAndDisplay1RM() {
        const weight = document.getElementById('performanceWeight').value;
        const reps = document.getElementById('performanceReps').value;

        if (weight && reps) {
            const oneRM = this.calculate1RM(weight, reps);
            if (oneRM) {
                document.getElementById('oneRMValue').textContent = `${oneRM} kg`;

                // Afficher la formule utilisée
                if (parseInt(reps) === 1) {
                    document.getElementById('oneRMFormula').textContent =
                        'Charge maximale directe (1RM)';
                } else {
                    document.getElementById('oneRMFormula').textContent =
                        `Calcul: ${weight}kg × (1 + ${reps}/30) = ${oneRM}kg`;
                }

                // Vérifier si c'est un nouveau PR potentiel (async)
                const memberId = document.getElementById('performanceMember').value;
                const exercise = document.getElementById('performanceExercise').value;
                if (memberId && exercise) {
                    this.checkForPR(memberId, exercise, oneRM);
                }
            }
        } else {
            document.getElementById('oneRMValue').textContent = '-- kg';
            document.getElementById('oneRMFormula').textContent = '';
        }
    },

    // Sauvegarder une performance
    // Sauvegarder une performance (VERSION SUPABASE)
    async savePerformance() {
        try {
            const memberId = document.getElementById('performanceMember').value;
            const category = document.getElementById('performanceCategory').value;
            const exercise = document.getElementById('performanceExercise').value;
            const type = document.getElementById('performanceType').value;

            if (!memberId || !exercise) {
                alert('Veuillez sélectionner un adhérent et un exercice');
                return;
            }

            let value,
                unit = '',
                reps,
                notes = '';

            if (type === 'weight') {
                const weight = parseFloat(document.getElementById('performanceWeight').value);
                reps = parseInt(document.getElementById('performanceReps').value);

                if (!weight || !reps) {
                    alert('Veuillez saisir le poids et les répétitions');
                    return;
                }

                // Calculer le 1RM théorique
                const oneRM = this.calculate1RM(weight, reps);

                value = weight;
                unit = 'kg';
                notes = `${weight}kg x ${reps} reps (1RM: ${oneRM}kg)`;
            } else if (type === 'time') {
                value = parseFloat(document.getElementById('performanceValue').value);
                unit = 'seconds';
            } else if (type === 'distance') {
                value = parseFloat(document.getElementById('performanceValue').value);
                unit = 'meters';
            } else if (type === 'reps') {
                value = parseInt(document.getElementById('performanceValue').value);
                unit = 'reps';
            }

            if (!value) {
                alert('Veuillez saisir une valeur');
                return;
            }

            // Vérifier si c'est un PR pour cet exercice
            const previousPerfs = await SupabaseManager.getPerformances(memberId);
            const exercisePerfs = previousPerfs.filter(p => p.exercise_type === exercise);
            const previousBest =
                exercisePerfs.length > 0 ? Math.max(...exercisePerfs.map(p => p.value)) : 0;
            const isPR = value > previousBest;

            // Créer la performance dans Supabase
            await SupabaseManager.createPerformance({
                memberId: memberId,
                exerciseType: exercise,
                category: category,
                value: value,
                unit: unit,
                date: new Date().toISOString().split('T')[0],
                isPR: isPR,
                notes: notes
            });

            Utils.closeModal();

            if (isPR) {
                Utils.showNotification(`🏆 Nouveau PR! ${exercise}: ${value}${unit}`, 'success');
            } else {
                Utils.showNotification('Performance enregistrée', 'success');
            }

            // Rafraîchir la vue actuelle
            if (ViewManager.getCurrentView() === 'members') {
                await MemberManager.showMembersView();
            }
        } catch (error) {
            console.error('Erreur sauvegarde performance:', error);
            Utils.showNotification("Erreur lors de l'enregistrement", 'error');
        }
    }
};

// Fermer les résultats de recherche quand on clique ailleurs
document.addEventListener('click', e => {
    const searchResults = document.getElementById('memberSearchResults');
    const searchInput = document.getElementById('memberSearchInput');

    if (
        searchResults &&
        searchInput &&
        !searchResults.contains(e.target) &&
        !searchInput.contains(e.target)
    ) {
        searchResults.classList.add('hidden');
    }
});
