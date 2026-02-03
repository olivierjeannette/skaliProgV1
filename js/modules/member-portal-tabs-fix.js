/**
 * SECTION À REMPLACER DANS member-portal.js
 * Lignes ~198-228 : Ajout du 3ème onglet "Historique"
 */

// ============================================================
// REMPLACER LA SECTION "<!-- Tabs" (lignes 198-210)
// ============================================================

`
                <!-- Tabs : Infos perso / Performances / Historique (3 onglets) -->
                <div class="flex gap-2 mb-4 px-3">
                    <button onclick="MemberPortal.showTab('personal')"
                            id="tabPersonal"
                            class="flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition bg-blue-600 text-white touch-active">
                        <i class="fas fa-user text-xs mr-1"></i>Infos
                    </button>
                    <button onclick="MemberPortal.showTab('performances')"
                            id="tabPerformances"
                            class="flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition bg-gray-700 text-gray-300 touch-active">
                        <i class="fas fa-trophy text-xs mr-1"></i>Perfs
                    </button>
                    <button onclick="MemberPortal.showTab('history')"
                            id="tabHistory"
                            class="flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition bg-gray-700 text-gray-300 touch-active">
                        <i class="fas fa-history text-xs mr-1"></i>Historique
                    </button>
                </div>

                <!-- Contenu des tabs -->
                <div id="tabContent" class="px-3"></div>
`

// ============================================================
// REMPLACER LA FONCTION showTab (lignes ~461-477)
// ============================================================

showTab(tabName) {
    // Mettre à jour les 3 boutons
    document.getElementById('tabPersonal').className = tabName === 'personal'
        ? 'flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition bg-blue-600 text-white touch-active'
        : 'flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition bg-gray-700 text-gray-300 touch-active';

    document.getElementById('tabPerformances').className = tabName === 'performances'
        ? 'flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition bg-blue-600 text-white touch-active'
        : 'flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition bg-gray-700 text-gray-300 touch-active';

    document.getElementById('tabHistory').className = tabName === 'history'
        ? 'flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition bg-blue-600 text-white touch-active'
        : 'flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition bg-gray-700 text-gray-300 touch-active';

    // Afficher le bon contenu
    if (tabName === 'personal') {
        this.showPersonalDataForm();
    } else if (tabName === 'performances') {
        this.showPerformancesForm();
    } else if (tabName === 'history') {
        this.showHistoryTab();
    }
},

// ============================================================
// NOUVELLE FONCTION showHistoryTab() À AJOUTER APRÈS showPerformancesForm
// ============================================================

/**
 * Afficher l'historique des performances organisé par catégories
 */
async showHistoryTab() {
    const tabContent = document.getElementById('tabContent');

    // Loading
    tabContent.innerHTML = `
        <div class="text-center py-8">
            <div class="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p class="text-gray-400">Chargement de l'historique...</p>
        </div>
    `;

    try {
        // Charger toutes les performances
        const allPerfs = await SupabaseManager.getMemberPerformances(this.currentMember.id);

        if (allPerfs.length === 0) {
            tabContent.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-inbox text-6xl text-gray-600 mb-4"></i>
                    <p class="text-gray-400">Aucune performance enregistrée</p>
                </div>
            `;
            return;
        }

        // Organiser par catégories (Cardio / Force / Gym / Puissance)
        const categorized = {
            cardio: [],
            force: [],
            gym: [],
            puissance: []
        };

        allPerfs.forEach(perf => {
            const ex = perf.exercise_type.toLowerCase();

            // Cardio
            if (ex.includes('run') || ex.includes('bike') || ex.includes('row') || ex.includes('swim') || ex.includes('ski') || ex.includes('burpees')) {
                categorized.cardio.push(perf);
            }
            // Force
            else if (ex.includes('squat') || ex.includes('deadlift') || ex.includes('bench') || ex.includes('press') && !ex.includes('strict')) {
                categorized.force.push(perf);
            }
            // Gym
            else if (ex.includes('pull') || ex.includes('push') || ex.includes('dip') || ex.includes('curl') || ex.includes('plank') || ex.includes('abs') || ex.includes('toes') || ex.includes('handstand')) {
                categorized.gym.push(perf);
            }
            // Puissance
            else if (ex.includes('clean') || ex.includes('snatch') || ex.includes('jerk') || ex.includes('sprint') || ex.includes('jump') || ex.includes('watts')) {
                categorized.puissance.push(perf);
            }
            // Par défaut dans Gym
            else {
                categorized.gym.push(perf);
            }
        });

        // Afficher avec accordéons par catégorie
        tabContent.innerHTML = `
            <div class="space-y-3">
                <!-- Cardio -->
                ${this.renderCategorySection('cardio', categorized.cardio, '💓', 'Cardio', 'from-red-900/30 to-red-800/30', 'red')}

                <!-- Force -->
                ${this.renderCategorySection('force', categorized.force, '💪', 'Force', 'from-orange-900/30 to-orange-800/30', 'orange')}

                <!-- Gym -->
                ${this.renderCategorySection('gym', categorized.gym, '🏋️', 'Gym', 'from-blue-900/30 to-blue-800/30', 'blue')}

                <!-- Puissance -->
                ${this.renderCategorySection('puissance', categorized.puissance, '⚡', 'Puissance', 'from-yellow-900/30 to-yellow-800/30', 'yellow')}
            </div>
        `;

    } catch (error) {
        console.error('Erreur chargement historique:', error);
        tabContent.innerHTML = `
            <div class="text-center py-8 text-red-400">
                <i class="fas fa-exclamation-triangle text-4xl mb-3"></i>
                <p>Erreur de chargement</p>
            </div>
        `;
    }
},

/**
 * Rendre une section de catégorie
 */
renderCategorySection(categoryId, perfs, emoji, title, gradient, color) {
    if (perfs.length === 0) {
        return `
            <div class="bg-gradient-to-br ${gradient} rounded-lg p-3 border border-${color}-500/30 opacity-50">
                <div class="flex items-center justify-between">
                    <h4 class="font-bold text-white text-sm">
                        ${emoji} ${title}
                    </h4>
                    <span class="text-xs text-gray-500">Aucune performance</span>
                </div>
            </div>
        `;
    }

    return `
        <div class="bg-gradient-to-br ${gradient} rounded-lg border border-${color}-500/30">
            <!-- Header (cliquable pour expand/collapse) -->
            <button onclick="MemberPortal.toggleCategory('${categoryId}')"
                    class="w-full p-3 flex items-center justify-between hover:bg-white/5 transition touch-active">
                <h4 class="font-bold text-white text-sm flex items-center gap-2">
                    ${emoji} ${title}
                    <span class="text-xs text-gray-400">(${perfs.length})</span>
                </h4>
                <i id="icon-${categoryId}" class="fas fa-chevron-down text-${color}-400 transition-transform"></i>
            </button>

            <!-- Contenu (liste des perfs) -->
            <div id="content-${categoryId}" class="hidden px-3 pb-3 space-y-2 max-h-64 overflow-y-auto">
                ${perfs.map(perf => `
                    <div class="flex items-center justify-between p-2 bg-black/20 rounded hover:bg-black/30 transition">
                        <div class="flex-1 min-w-0">
                            <div class="font-bold text-white text-sm truncate">${perf.exercise_type || 'Exercice'}</div>
                            <div class="text-xs text-gray-400 truncate">
                                ${perf.value ? `${perf.value} ${perf.unit || ''}` : 'N/A'}
                                ${perf.is_pr ? '<span class="text-yellow-400 ml-1">🏆</span>' : ''}
                                <span class="ml-2 text-gray-500">${perf.date || ''}</span>
                            </div>
                        </div>
                        <div class="flex gap-1 ml-2 flex-shrink-0">
                            <button onclick="MemberPortal.editPerformance('${perf.id}')"
                                    class="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded transition touch-active"
                                    title="Modifier">
                                <i class="fas fa-edit text-xs"></i>
                            </button>
                            <button onclick="MemberPortal.deletePerformance('${perf.id}')"
                                    class="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition touch-active"
                                    title="Supprimer">
                                <i class="fas fa-trash text-xs"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
},

/**
 * Toggle expand/collapse d'une catégorie
 */
toggleCategory(categoryId) {
    const content = document.getElementById(`content-${categoryId}`);
    const icon = document.getElementById(`icon-${categoryId}`);

    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        icon.classList.add('rotate-180');
    } else {
        content.classList.add('hidden');
        icon.classList.remove('rotate-180');
    }
},
