/**
 * ═══════════════════════════════════════════════════════════════
 * NUTRITION MEMBER MANAGER - Gestion des adhérents
 * Sélection adhérent + Profil + Gestion PDF + Lancement programmation
 * ═══════════════════════════════════════════════════════════════
 */

const NutritionMemberManager = {
    currentMember: null,
    memberPDFs: [],

    /**
     * ═══════════════════════════════════════════════════════════
     * INITIALISATION
     * ═══════════════════════════════════════════════════════════
     */
    async init() {
        console.log('🍎 Nutrition Member Manager - Initialisation');
        await this.showMemberSelection();
    },

    /**
     * ═══════════════════════════════════════════════════════════
     * PAGE DE SÉLECTION DES ADHÉRENTS
     * ═══════════════════════════════════════════════════════════
     */
    async showMemberSelection() {
        try {
            // Charger tous les membres
            const members = await SupabaseManager.getMembers();

            const html = `
                <div class="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900">
                    <!-- Header élégant -->
                    <div class="bg-gray-900 border-b border-green-500 border-opacity-30">
                        <div class="max-w-7xl mx-auto px-6 py-8">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h1 class="text-4xl font-bold text-white flex items-center gap-3">
                                        <i class="fas fa-apple-alt text-green-400"></i>
                                        Nutrition Pro
                                    </h1>
                                    <p class="text-green-300 mt-2">Sélectionnez un adhérent pour commencer</p>
                                </div>
                                <button onclick="window.history.back()"
                                        class="w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700
                                               text-white flex items-center justify-center transition-all duration-200
                                               hover:scale-110">
                                    <i class="fas fa-times text-xl"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Barre de recherche -->
                    <div class="max-w-7xl mx-auto px-6 py-6">
                        <div class="relative">
                            <input type="text"
                                   id="memberSearch"
                                   placeholder="Rechercher un adhérent..."
                                   onkeyup="NutritionMemberManager.filterMembers(this.value)"
                                   class="w-full bg-gray-800 border border-green-500 border-opacity-40
                                          rounded-2xl px-6 py-4 pl-14 text-white placeholder-gray-400
                                          focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-opacity-30
                                          transition-all duration-200">
                            <i class="fas fa-search absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        </div>
                    </div>

                    <!-- Liste des membres -->
                    <div class="max-w-7xl mx-auto px-6 pb-12">
                        <div id="membersList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            ${members.map(member => this.renderMemberCard(member)).join('')}
                        </div>
                    </div>
                </div>
            `;

            const contentEl =
                document.getElementById('mainContent') || document.getElementById('mainApp');
            contentEl.innerHTML = html;
        } catch (error) {
            console.error('❌ Erreur chargement membres:', error);
            Utils.showNotification('Erreur', 'Impossible de charger les adhérents', 'error');
        }
    },

    /**
     * Rendu d'une carte adhérent
     * @param member
     */
    renderMemberCard(member) {
        const age = NutritionCore.calculateAge(member.birthdate) || member.age || '?';
        const bodyComp = NutritionCore.calculateBodyComposition(member);

        return `
            <div class="member-card bg-gray-800 rounded-2xl p-6
                        border border-green-500 border-opacity-30 hover:border-opacity-60
                        transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/20
                        cursor-pointer group"
                 onclick="NutritionMemberManager.selectMember('${member.id}')">

                <!-- Photo + Statut -->
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-4">
                        ${
                            member.photo_url
                                ? `<img src="${member.photo_url}"
                                    class="w-16 h-16 rounded-full object-cover border-2 border-green-400 group-hover:border-green-300
                                           transition-all duration-200"
                                    alt="${member.name}">`
                                : `<div class="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600
                                          flex items-center justify-center border-2 border-green-400 group-hover:border-green-300
                                          transition-all duration-200">
                                   <i class="fas fa-user text-white text-2xl"></i>
                               </div>`
                        }
                        <div>
                            <h3 class="text-xl font-bold text-white group-hover:text-green-300 transition-colors">
                                ${member.name}
                            </h3>
                            <p class="text-gray-400 text-sm">${age} ans • ${member.gender === 'male' ? 'Homme' : 'Femme'}</p>
                        </div>
                    </div>
                    <i class="fas fa-chevron-right text-green-400 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                </div>

                <!-- Stats corporelles -->
                <div class="grid grid-cols-3 gap-3 mb-4">
                    <div class="bg-gray-900 rounded-lg p-3 text-center">
                        <div class="text-green-400 font-bold text-lg">${bodyComp.weight}</div>
                        <div class="text-gray-500 text-xs mt-1">kg</div>
                    </div>
                    <div class="bg-gray-900 rounded-lg p-3 text-center">
                        <div class="text-green-400 font-bold text-lg">${bodyComp.bodyFat}%</div>
                        <div class="text-gray-500 text-xs mt-1">MG</div>
                    </div>
                    <div class="bg-gray-900 rounded-lg p-3 text-center">
                        <div class="text-green-400 font-bold text-lg">${bodyComp.ffmi}</div>
                        <div class="text-gray-500 text-xs mt-1">FFMI</div>
                    </div>
                </div>

                <!-- Email -->
                <div class="flex items-center gap-2 text-gray-400 text-sm">
                    <i class="fas fa-envelope"></i>
                    <span class="truncate">${member.email || 'Non renseigné'}</span>
                </div>
            </div>
        `;
    },

    /**
     * Filtrer les membres
     * @param query
     */
    filterMembers(query) {
        const cards = document.querySelectorAll('.member-card');
        const lowerQuery = query.toLowerCase();

        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(lowerQuery) ? 'block' : 'none';
        });
    },

    /**
     * ═══════════════════════════════════════════════════════════
     * PROFIL ADHÉRENT + GESTION PDF
     * ═══════════════════════════════════════════════════════════
     * @param memberId
     */
    async selectMember(memberId) {
        try {
            // Charger le membre
            const members = await SupabaseManager.getMembers();
            this.currentMember = members.find(m => m.id === memberId);

            if (!this.currentMember) {
                throw new Error('Membre non trouvé');
            }

            // Charger les PDFs du membre
            await this.loadMemberPDFs();

            // Afficher le profil
            await this.showMemberProfile();
        } catch (error) {
            console.error('❌ Erreur sélection membre:', error);
            Utils.showNotification('Erreur', error.message, 'error');
        }
    },

    /**
     * Charger les PDFs du membre
     */
    async loadMemberPDFs() {
        try {
            console.log('🔍 Chargement des PDFs pour le membre:', this.currentMember.id);

            // Récupérer les PDFs depuis Supabase
            const { data, error } = await SupabaseManager.supabase
                .from('member_nutrition_pdfs')
                .select('*')
                .eq('member_id', this.currentMember.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Erreur Supabase:', error);
                throw error;
            }

            this.memberPDFs = data || [];
            console.log(
                `✅ ${this.memberPDFs.length} PDFs chargés pour ${this.currentMember.name}`
            );
        } catch (error) {
            console.warn('⚠️ Erreur chargement PDFs:', error);
            this.memberPDFs = [];
        }
    },

    /**
     * Afficher le profil du membre
     */
    async showMemberProfile() {
        const bodyComp = NutritionCore.calculateBodyComposition(this.currentMember);
        const age =
            NutritionCore.calculateAge(this.currentMember.birthdate) ||
            this.currentMember.age ||
            '?';

        const html = `
            <div class="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900">
                <!-- Header du profil -->
                <div class="bg-gray-900 border-b border-green-500 border-opacity-30">
                    <div class="max-w-7xl mx-auto px-6 py-6">
                        <div class="flex items-center justify-between">
                            <button onclick="NutritionMemberManager.showMemberSelection()"
                                    class="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors">
                                <i class="fas fa-arrow-left"></i>
                                <span>Retour aux adhérents</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Profil et données -->
                <div class="max-w-7xl mx-auto px-6 py-8">
                    <!-- En-tête du profil -->
                    <div class="bg-gray-800 rounded-2xl p-8 mb-6
                                border border-green-500 border-opacity-30">
                        <div class="flex flex-col md:flex-row items-start gap-6">
                            <!-- Photo -->
                            ${
                                this.currentMember.photo_url
                                    ? `<img src="${this.currentMember.photo_url}"
                                        class="w-32 h-32 rounded-2xl object-cover border-4 border-green-400"
                                        alt="${this.currentMember.name}">`
                                    : `<div class="w-32 h-32 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600
                                              flex items-center justify-center border-4 border-green-400">
                                       <i class="fas fa-user text-white text-5xl"></i>
                                   </div>`
                            }

                            <!-- Informations -->
                            <div class="flex-1">
                                <h1 class="text-4xl font-bold text-white mb-2">${this.currentMember.name}</h1>
                                <div class="flex flex-wrap gap-4 text-gray-300 mb-6">
                                    <span><i class="fas fa-calendar mr-2 text-green-400"></i>${age} ans</span>
                                    <span><i class="fas fa-venus-mars mr-2 text-green-400"></i>${this.currentMember.gender === 'male' ? 'Homme' : 'Femme'}</span>
                                    <span><i class="fas fa-envelope mr-2 text-green-400"></i>${this.currentMember.email || 'Non renseigné'}</span>
                                </div>

                                <!-- Stats corporelles -->
                                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div class="bg-gray-900 rounded-lg p-4">
                                        <div class="text-gray-500 text-sm mb-1">Poids</div>
                                        <div class="text-2xl font-bold text-green-400">${bodyComp.weight} kg</div>
                                    </div>
                                    <div class="bg-gray-900 rounded-lg p-4">
                                        <div class="text-gray-500 text-sm mb-1">% Masse grasse</div>
                                        <div class="text-2xl font-bold text-green-400">${bodyComp.bodyFat}%</div>
                                    </div>
                                    <div class="bg-gray-900 rounded-lg p-4">
                                        <div class="text-gray-500 text-sm mb-1">Masse maigre</div>
                                        <div class="text-2xl font-bold text-green-400">${bodyComp.leanMass} kg</div>
                                    </div>
                                    <div class="bg-gray-900 rounded-lg p-4">
                                        <div class="text-gray-500 text-sm mb-1">FFMI</div>
                                        <div class="text-2xl font-bold text-green-400">${bodyComp.ffmi}</div>
                                        <div class="text-xs text-gray-600 mt-1">${bodyComp.ffmiCategory}</div>
                                    </div>
                                </div>
                            </div>

                            <!-- Bouton principal -->
                            <div>
                                <button onclick="NutritionPlanner.init('${this.currentMember.id}')"
                                        class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700
                                               text-white font-bold px-8 py-4 rounded-xl
                                               shadow-lg shadow-green-500/30 hover:shadow-green-500/50
                                               transition-all duration-200 hover:scale-105
                                               flex items-center gap-3">
                                    <i class="fas fa-plus-circle text-xl"></i>
                                    <div class="text-left">
                                        <div class="text-sm opacity-80">Nouvelle</div>
                                        <div class="text-lg">Programmation</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Section PDFs -->
                    <div class="bg-gray-800 rounded-2xl p-6
                                border border-green-500 border-opacity-30">
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-2xl font-bold text-white flex items-center gap-3">
                                <i class="fas fa-file-pdf text-red-400"></i>
                                Programmes nutrition
                            </h2>
                            <span class="bg-green-500 bg-opacity-20 text-green-300 px-4 py-2 rounded-lg font-semibold">
                                ${this.memberPDFs.length} PDF${this.memberPDFs.length > 1 ? 's' : ''}
                            </span>
                        </div>

                        ${this.memberPDFs.length > 0 ? this.renderPDFList() : this.renderNoPDFs()}
                    </div>
                </div>
            </div>
        `;

        const contentEl =
            document.getElementById('mainContent') || document.getElementById('mainApp');
        contentEl.innerHTML = html;
    },

    /**
     * Rendu de la liste des PDFs
     */
    renderPDFList() {
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${this.memberPDFs.map(pdf => this.renderPDFCard(pdf)).join('')}
            </div>
        `;
    },

    /**
     * Rendu d'une carte PDF
     * @param pdf
     */
    renderPDFCard(pdf) {
        const date = new Date(pdf.created_at).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        return `
            <div class="bg-gray-900 rounded-xl p-5 hover:bg-gray-850 transition-all duration-200
                        border border-gray-700 hover:border-green-500 group">
                <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-lg bg-red-500 bg-opacity-20 flex items-center justify-center
                                group-hover:scale-110 transition-transform duration-200">
                        <i class="fas fa-file-pdf text-2xl text-red-400"></i>
                    </div>

                    <div class="flex-1">
                        <h3 class="text-white font-semibold mb-1 line-clamp-1">${pdf.title || 'Programme nutrition'}</h3>
                        <p class="text-gray-500 text-sm mb-3">
                            <i class="far fa-calendar mr-1"></i>
                            ${date}
                        </p>

                        <div class="flex gap-2">
                            <button onclick="NutritionMemberManager.downloadPDF('${pdf.id}')"
                                    class="flex-1 bg-green-500 bg-opacity-20 hover:bg-opacity-30 text-green-300
                                           px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                                           hover:scale-105">
                                <i class="fas fa-download mr-2"></i>
                                Télécharger
                            </button>
                            <button onclick="NutritionMemberManager.deletePDF('${pdf.id}')"
                                    class="bg-red-500 bg-opacity-20 hover:bg-opacity-30 text-red-300
                                           px-3 py-2 rounded-lg text-sm transition-all duration-200
                                           hover:scale-105">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Rendu si aucun PDF
     */
    renderNoPDFs() {
        return `
            <div class="text-center py-12">
                <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-700
                            flex items-center justify-center">
                    <i class="fas fa-file-pdf text-5xl text-gray-600"></i>
                </div>
                <h3 class="text-xl font-semibold text-white mb-2">Aucun programme pour le moment</h3>
                <p class="text-gray-500 mb-6">Créez votre première programmation nutrition</p>
                <button onclick="NutritionPlanner.init('${this.currentMember.id}')"
                        class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700
                               text-white font-bold px-6 py-3 rounded-lg
                               transition-all duration-200 hover:scale-105">
                    <i class="fas fa-plus-circle mr-2"></i>
                    Créer une programmation
                </button>
            </div>
        `;
    },

    /**
     * ═══════════════════════════════════════════════════════════
     * GESTION DES PDFS
     * ═══════════════════════════════════════════════════════════
     */

    /**
     * Télécharger un PDF
     * @param pdfId
     */
    async downloadPDF(pdfId) {
        try {
            const pdf = this.memberPDFs.find(p => p.id === pdfId);
            if (!pdf) {
                throw new Error('PDF non trouvé');
            }

            console.log('📥 Téléchargement du PDF:', pdf.file_path);

            // Télécharger depuis Supabase Storage
            const { data, error } = await SupabaseManager.supabase.storage
                .from('nutrition-pdfs')
                .download(pdf.file_path);

            if (error) {
                throw error;
            }

            // Créer un lien de téléchargement
            const url = URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = pdf.filename || pdf.title || 'programme-nutrition.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log('✅ PDF téléchargé:', pdf.filename);
            Utils.showNotification('Succès', 'PDF téléchargé', 'success');
        } catch (error) {
            console.error('❌ Erreur téléchargement PDF:', error);
            Utils.showNotification('Erreur', 'Impossible de télécharger le PDF', 'error');
        }
    },

    /**
     * Supprimer un PDF
     * @param pdfId
     */
    async deletePDF(pdfId) {
        const confirmed = await Utils.confirm(
            'Supprimer ce programme ?',
            'Cette action est irréversible.'
        );

        if (!confirmed) {
            return;
        }

        try {
            const pdf = this.memberPDFs.find(p => p.id === pdfId);
            if (!pdf) {
                throw new Error('PDF non trouvé');
            }

            console.log('🗑️ Suppression du PDF:', pdf.file_path);

            // Supprimer le fichier du storage
            await SupabaseManager.supabase.storage.from('nutrition-pdfs').remove([pdf.file_path]);

            // Supprimer l'entrée de la base de données
            const { error } = await SupabaseManager.supabase
                .from('member_nutrition_pdfs')
                .delete()
                .eq('id', pdfId);

            if (error) {
                throw error;
            }

            console.log('✅ PDF supprimé avec succès');
            Utils.showNotification('Succès', 'PDF supprimé', 'success');

            // Recharger le profil
            await this.selectMember(this.currentMember.id);
        } catch (error) {
            console.error('❌ Erreur suppression PDF:', error);
            Utils.showNotification('Erreur', 'Impossible de supprimer le PDF', 'error');
        }
    }
};

// Export global
window.NutritionMemberManager = NutritionMemberManager;
console.log('✅ NutritionMemberManager chargé');
