/**
 * MODULE PROGRAMMATION - PORTAIL ADHÉRENT
 * Gestion des programmes d'entraînement pour les membres
 * - Bibliothèque de PDF programmes
 * - Suivi des programmes actifs
 */

const ProgrammingPortal = {
    currentTab: 'pdfs',
    currentMember: null,

    /**
     * Initialiser le module
     */
    async init() {
        console.log('🏋️ Initialisation Programming Portal...');

        // Récupérer le membre connecté depuis MemberPortal
        if (typeof MemberPortal !== 'undefined' && MemberPortal.currentMember) {
            this.currentMember = MemberPortal.currentMember;
            console.log('✅ Membre récupéré:', this.currentMember.name);
        } else {
            console.error('❌ Aucun membre sélectionné');

            // Afficher un message dans contentArea
            const contentArea = document.getElementById('contentArea');
            if (contentArea) {
                contentArea.classList.remove('hidden');
                contentArea.innerHTML = `
                    <div class="text-center py-12">
                        <i class="fas fa-user-slash text-6xl text-red-400 mb-4"></i>
                        <h2 class="text-2xl font-bold text-white mb-3">Aucun membre sélectionné</h2>
                        <p class="text-gray-300 mb-6">Veuillez d'abord vous connecter et sélectionner votre profil</p>
                        <button onclick="showHome()" class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition">
                            <i class="fas fa-home mr-2"></i>
                            Retour à l'accueil
                        </button>
                    </div>
                `;
            }
            return;
        }

        await this.show();
    },

    /**
     * Afficher la vue principale
     */
    async show() {
        const html = `
            <div class="programming-portal-container">
                <!-- Header -->
                <div class="programming-header gradient-header">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-3xl font-bold text-white flex items-center gap-3">
                                <i class="fas fa-dumbbell"></i>
                                Programmation
                            </h1>
                            <p class="text-green-200 text-sm mt-1">Consultez vos programmes d'entraînement</p>
                        </div>
                        <button onclick="window.history.back()" class="btn-icon">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>

                <!-- Onglets -->
                <div class="tabs-container">
                    <button class="tab-btn active" data-tab="pdfs" onclick="ProgrammingPortal.switchTab('pdfs')">
                        <i class="fas fa-file-pdf"></i>
                        <span>Mes Programmes</span>
                    </button>
                    <button class="tab-btn" data-tab="active" onclick="ProgrammingPortal.switchTab('active')">
                        <i class="fas fa-play-circle"></i>
                        <span>Programme Actif</span>
                    </button>
                </div>

                <!-- Contenu des onglets -->
                <div class="tab-content-container">
                    <!-- Onglet Programmes PDF -->
                    <div id="tab-pdfs" class="tab-content active">
                        <div class="pdfs-section">
                            <div class="card-modern">
                                <h3 class="text-xl font-bold text-green-400 mb-4">
                                    <i class="fas fa-folder-open mr-2"></i>
                                    Vos programmes d'entraînement
                                </h3>
                                <div id="programsList"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Onglet Programme Actif -->
                    <div id="tab-active" class="tab-content">
                        <div class="active-program-section">
                            <div class="card-modern">
                                <h3 class="text-xl font-bold text-green-400 mb-4">
                                    <i class="fas fa-fire mr-2"></i>
                                    Programme en cours
                                </h3>
                                <div id="activeProgramContent"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const contentArea = document.getElementById('contentArea');
        if (contentArea) {
            contentArea.classList.remove('hidden');
            contentArea.innerHTML = html;

            // Charger les programmes
            await this.loadPrograms();

            // Charger le programme actif
            await this.loadActiveProgram();
        }
    },

    /**
     * Charger les programmes PDF
     */
    async loadPrograms() {
        console.log('📄 Chargement programmes PDF...');

        const container = document.getElementById('programsList');
        if (!container) {
            return;
        }

        try {
            // Récupérer les programmes depuis Supabase
            const { data: programs, error } = await window.SupabaseManager.supabase
                .from('training_programs')
                .select('*')
                .eq('member_id', this.currentMember.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Erreur chargement programmes:', error);
                container.innerHTML = `
                    <div class="text-center py-8 text-gray-400">
                        <i class="fas fa-exclamation-circle text-4xl mb-3"></i>
                        <p>Erreur lors du chargement des programmes</p>
                    </div>
                `;
                return;
            }

            if (!programs || programs.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-12 text-gray-400">
                        <i class="fas fa-inbox text-6xl mb-4 opacity-50"></i>
                        <p class="text-lg">Aucun programme disponible</p>
                        <p class="text-sm mt-2">Vos programmes d'entraînement apparaîtront ici</p>
                    </div>
                `;
                return;
            }

            // Afficher les programmes sous forme de grille
            container.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${programs.map(program => this.renderProgramCard(program)).join('')}
                </div>
            `;

            console.log(`✅ ${programs.length} programme(s) chargé(s)`);
        } catch (error) {
            console.error('❌ Erreur:', error);
            container.innerHTML = `
                <div class="text-center py-8 text-red-400">
                    <i class="fas fa-exclamation-triangle text-4xl mb-3"></i>
                    <p>Erreur: ${error.message}</p>
                </div>
            `;
        }
    },

    /**
     * Rendre une carte de programme
     * @param program
     */
    renderProgramCard(program) {
        const startDate = program.start_date
            ? new Date(program.start_date).toLocaleDateString('fr-FR')
            : 'Non défini';
        const endDate = program.end_date
            ? new Date(program.end_date).toLocaleDateString('fr-FR')
            : 'Non défini';
        const createdAt = program.created_at
            ? new Date(program.created_at).toLocaleDateString('fr-FR')
            : '';

        return `
            <div class="glass-card p-6 hover:border-green-400 transition-all duration-300 cursor-pointer"
                 onclick="ProgrammingPortal.viewProgram('${program.id}')">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-lg bg-green-500 bg-opacity-20 flex items-center justify-center">
                            <i class="fas fa-file-pdf text-2xl text-green-400"></i>
                        </div>
                        <div>
                            <h4 class="text-lg font-bold text-white">${program.title || 'Programme'}</h4>
                            <p class="text-sm text-gray-400">${program.objective_primary || ''}</p>
                        </div>
                    </div>
                    ${
                        program.status === 'active'
                            ? `
                        <span class="px-3 py-1 bg-green-500 bg-opacity-20 text-green-400 text-xs font-semibold rounded-full">
                            <i class="fas fa-play-circle mr-1"></i>
                            Actif
                        </span>
                    `
                            : ''
                    }
                </div>

                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="flex items-center gap-2 text-sm text-gray-300">
                        <i class="fas fa-calendar-week text-green-400"></i>
                        <span>${program.duration_weeks || 0} semaines</span>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-300">
                        <i class="fas fa-sync text-green-400"></i>
                        <span>${program.frequency || 0}x/semaine</span>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-300">
                        <i class="fas fa-clock text-green-400"></i>
                        <span>${program.session_duration || 0} min</span>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-300">
                        <i class="fas fa-chart-line text-green-400"></i>
                        <span>${program.level || 'N/A'}</span>
                    </div>
                </div>

                <div class="border-t border-gray-700 pt-3 mt-3">
                    <div class="flex items-center justify-between text-xs text-gray-400">
                        <span>
                            <i class="fas fa-calendar mr-1"></i>
                            ${startDate} - ${endDate}
                        </span>
                        <span>Créé le ${createdAt}</span>
                    </div>
                </div>

                ${
                    program.pdf_url
                        ? `
                    <div class="mt-4">
                        <a href="${program.pdf_url}"
                           target="_blank"
                           onclick="event.stopPropagation()"
                           class="w-full btn-primary flex items-center justify-center gap-2">
                            <i class="fas fa-download"></i>
                            <span>Télécharger le PDF</span>
                        </a>
                    </div>
                `
                        : ''
                }
            </div>
        `;
    },

    /**
     * Afficher les détails d'un programme
     * @param programId
     */
    async viewProgram(programId) {
        console.log('👁️ Affichage programme:', programId);
        // TODO: Implémenter vue détaillée du programme
        alert('Vue détaillée du programme à venir!');
    },

    /**
     * Charger le programme actif
     */
    async loadActiveProgram() {
        console.log('🔥 Chargement programme actif...');

        const container = document.getElementById('activeProgramContent');
        if (!container) {
            return;
        }

        try {
            // Récupérer le programme actif
            const { data: programs, error } = await window.SupabaseManager.supabase
                .from('training_programs')
                .select('*')
                .eq('member_id', this.currentMember.id)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(1);

            if (error) {
                throw error;
            }

            if (!programs || programs.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-12 text-gray-400">
                        <i class="fas fa-moon text-6xl mb-4 opacity-50"></i>
                        <p class="text-lg">Aucun programme actif</p>
                        <p class="text-sm mt-2">Commencez un nouveau programme pour le voir ici</p>
                    </div>
                `;
                return;
            }

            const program = programs[0];
            container.innerHTML = this.renderActiveProgramDetails(program);
        } catch (error) {
            console.error('❌ Erreur:', error);
            container.innerHTML = `
                <div class="text-center py-8 text-red-400">
                    <i class="fas fa-exclamation-triangle text-4xl mb-3"></i>
                    <p>Erreur: ${error.message}</p>
                </div>
            `;
        }
    },

    /**
     * Rendre les détails du programme actif
     * @param program
     */
    renderActiveProgramDetails(program) {
        const startDate = program.start_date
            ? new Date(program.start_date).toLocaleDateString('fr-FR')
            : 'Non défini';
        const endDate = program.end_date
            ? new Date(program.end_date).toLocaleDateString('fr-FR')
            : 'Non défini';

        // Calculer la progression
        const today = new Date();
        const start = new Date(program.start_date);
        const end = new Date(program.end_date);
        const total = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const elapsed = Math.ceil((today - start) / (1000 * 60 * 60 * 24));
        const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));

        return `
            <div class="space-y-6">
                <!-- En-tête du programme -->
                <div class="text-center">
                    <div class="inline-block p-4 rounded-full bg-green-500 bg-opacity-20 mb-4">
                        <i class="fas fa-fire text-4xl text-green-400"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-white mb-2">${program.title || 'Programme'}</h3>
                    <p class="text-green-400">${program.objective_primary || ''}</p>
                </div>

                <!-- Barre de progression -->
                <div class="glass-card p-4">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm text-gray-300">Progression</span>
                        <span class="text-lg font-bold text-green-400">${Math.round(progress)}%</span>
                    </div>
                    <div class="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                             style="width: ${progress}%"></div>
                    </div>
                    <div class="flex items-center justify-between mt-2 text-xs text-gray-400">
                        <span>${startDate}</span>
                        <span>${endDate}</span>
                    </div>
                </div>

                <!-- Statistiques -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="glass-card p-4 text-center">
                        <i class="fas fa-calendar-week text-2xl text-green-400 mb-2"></i>
                        <p class="text-2xl font-bold text-white">${program.duration_weeks || 0}</p>
                        <p class="text-xs text-gray-400">Semaines</p>
                    </div>
                    <div class="glass-card p-4 text-center">
                        <i class="fas fa-sync text-2xl text-green-400 mb-2"></i>
                        <p class="text-2xl font-bold text-white">${program.frequency || 0}x</p>
                        <p class="text-xs text-gray-400">Par semaine</p>
                    </div>
                    <div class="glass-card p-4 text-center">
                        <i class="fas fa-clock text-2xl text-green-400 mb-2"></i>
                        <p class="text-2xl font-bold text-white">${program.session_duration || 0}</p>
                        <p class="text-xs text-gray-400">Minutes/séance</p>
                    </div>
                    <div class="glass-card p-4 text-center">
                        <i class="fas fa-chart-line text-2xl text-green-400 mb-2"></i>
                        <p class="text-2xl font-bold text-white">${program.level || 'N/A'}</p>
                        <p class="text-xs text-gray-400">Niveau</p>
                    </div>
                </div>

                ${
                    program.pdf_url
                        ? `
                    <!-- Bouton PDF -->
                    <a href="${program.pdf_url}"
                       target="_blank"
                       class="w-full btn-primary flex items-center justify-center gap-2 text-lg py-4">
                        <i class="fas fa-file-pdf text-xl"></i>
                        <span>Voir le programme complet (PDF)</span>
                    </a>
                `
                        : ''
                }
            </div>
        `;
    },

    /**
     * Changer d'onglet
     * @param tabName
     */
    switchTab(tabName) {
        console.log('📑 Switch tab:', tabName);

        // Mettre à jour les boutons d'onglet
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });

        // Mettre à jour le contenu
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        const targetContent = document.getElementById(`tab-${tabName}`);
        if (targetContent) {
            targetContent.classList.add('active');
        }

        this.currentTab = tabName;
    }
};

// Exposer globalement
window.ProgrammingPortal = ProgrammingPortal;
