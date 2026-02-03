/**
 * NUTRITION PRO - Module complet de nutrition personnalisée
 * Génération de plans nutritionnels avec IA, calculs macros, PDFs professionnels
 */

const NutritionPro = {
    currentMember: null,
    currentPlan: null,

    // Configuration des objectifs
    OBJECTIVES: {
        perte_poids: {
            name: 'Perte de poids',
            icon: 'fa-weight',
            color: '#ef4444',
            calorieDeficit: -500,
            proteinMultiplier: 2.2, // g/kg
            carbsRatio: 0.30,
            fatsRatio: 0.25
        },
        prise_masse: {
            name: 'Prise de masse',
            icon: 'fa-dumbbell',
            color: '#10b981',
            calorieDeficit: 300,
            proteinMultiplier: 2.0,
            carbsRatio: 0.45,
            fatsRatio: 0.25
        },
        maintien: {
            name: 'Maintien',
            icon: 'fa-balance-scale',
            color: '#3b82f6',
            calorieDeficit: 0,
            proteinMultiplier: 1.8,
            carbsRatio: 0.40,
            fatsRatio: 0.30
        },
        seche: {
            name: 'Sèche',
            icon: 'fa-fire',
            color: '#f59e0b',
            calorieDeficit: -700,
            proteinMultiplier: 2.5,
            carbsRatio: 0.25,
            fatsRatio: 0.25
        },
        performance_endurance: {
            name: 'Performance - Endurance',
            icon: 'fa-running',
            color: '#8b5cf6',
            calorieDeficit: 200,
            proteinMultiplier: 1.6,
            carbsRatio: 0.55,
            fatsRatio: 0.20
        },
        performance_force: {
            name: 'Performance - Force',
            icon: 'fa-fist-raised',
            color: '#ec4899',
            calorieDeficit: 200,
            proteinMultiplier: 2.2,
            carbsRatio: 0.40,
            fatsRatio: 0.25
        },
        performance_crossfit: {
            name: 'Performance - CrossFit',
            icon: 'fa-fire-alt',
            color: '#14b8a6',
            calorieDeficit: 100,
            proteinMultiplier: 2.0,
            carbsRatio: 0.45,
            fatsRatio: 0.25
        },
        performance_ultra: {
            name: 'Performance - Ultra',
            icon: 'fa-mountain',
            color: '#06b6d4',
            calorieDeficit: 300,
            proteinMultiplier: 1.8,
            carbsRatio: 0.60,
            fatsRatio: 0.20
        },
        sante_generale: {
            name: 'Santé générale',
            icon: 'fa-heart',
            color: '#22c55e',
            calorieDeficit: 0,
            proteinMultiplier: 1.6,
            carbsRatio: 0.40,
            fatsRatio: 0.30
        }
    },

    // Restrictions alimentaires disponibles
    RESTRICTIONS: {
        allergies: [
            'Gluten',
            'Lactose',
            'Fruits à coque',
            'Arachides',
            'Œufs',
            'Poisson',
            'Fruits de mer',
            'Soja'
        ],
        regimes: [
            'Végétarien',
            'Vegan',
            'Sans porc',
            'Halal',
            'Casher',
            'Cétogène',
            'Paléo',
            'Sans sucre ajouté'
        ]
    },

    /**
     * Initialiser le module
     */
    async init() {
        console.log('🥗 Nutrition Pro initialisé');
        await this.showMainView();
    },

    /**
     * Afficher la vue principale
     */
    async showMainView() {
        const members = await SupabaseManager.getMembers();

        const html = `
            <div class="nutrition-pro-container fade-in-premium">
                <!-- Header -->
                <div class="flex items-center justify-between mb-8">
                    <div>
                        <h2 class="text-4xl font-bold text-green-400 flex items-center gap-3">
                            <i class="fas fa-utensils"></i>
                            Nutrition Pro
                        </h2>
                        <p class="text-secondary mt-2">Génération de plans nutritionnels personnalisés avec IA</p>
                    </div>
                    <div class="flex gap-3">
                        <button onclick="DiscordNutrition.openMembersConfig()" class="btn-premium btn-publish">
                            <i class="fab fa-discord mr-2"></i>
                            Config Discord
                        </button>
                        <button onclick="NutritionPro.showWeightTracking()" class="btn-premium btn-save-local">
                            <i class="fas fa-chart-line mr-2"></i>
                            Suivi des poids
                        </button>
                    </div>
                </div>

                ${this.currentMember ? this.renderPlanCreator() : this.renderMemberSelector(members)}
            </div>
        `;

        const contentEl = document.getElementById('mainContent') || document.querySelector('#mainApp');
        if (contentEl) {
            contentEl.innerHTML = html;
        } else {
            console.error('❌ Élément content introuvable');
        }
    },

    /**
     * Sélecteur de membre
     * @param members
     */
    renderMemberSelector(members) {
        return `
            <div class="premium-card">
                <h3 class="text-2xl font-bold text-green-400 mb-6">
                    <i class="fas fa-user-circle mr-3"></i>
                    Sélectionner un adhérent
                </h3>

                <div class="mb-4">
                    <input type="text"
                           id="memberSearchInput"
                           placeholder="Rechercher par nom..."
                           oninput="NutritionPro.filterMembers()"
                           class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition">
                </div>

                <div id="membersList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
                    ${members.map(m => `
                        <div class="member-card bg-wood-dark bg-opacity-50 rounded-lg p-4 border border-wood-accent border-opacity-30 hover:border-green-400 hover:shadow-lg transition">
                            <div class="flex items-center gap-3 cursor-pointer" onclick="NutritionPro.selectMember('${m.id}')">
                                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-xl">
                                    ${m.name.charAt(0).toUpperCase()}
                                </div>
                                <div class="flex-1">
                                    <h4 class="font-bold text-white">${m.name}</h4>
                                    <p class="text-sm text-secondary">
                                        ${m.weight ? `${m.weight} kg` : 'Poids non renseigné'}
                                        ${m.body_fat_percentage ? ` • ${m.body_fat_percentage}% MG` : ''}
                                    </p>
                                </div>
                                <i class="fas fa-chevron-right text-secondary"></i>
                            </div>
                            <button onclick="event.stopPropagation(); NutritionTracker.showTrackerModal('${m.id}', '${m.name}')"
                                class="mt-3 w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-blue-800 transition-all flex items-center justify-center gap-2">
                                <i class="fas fa-chart-line"></i>
                                Suivi poids / composition
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Filtrer les membres
     */
    filterMembers() {
        const search = document.getElementById('memberSearchInput').value.toLowerCase();
        const cards = document.querySelectorAll('.member-card');

        cards.forEach(card => {
            const name = card.textContent.toLowerCase();
            card.style.display = name.includes(search) ? 'block' : 'none';
        });
    },

    /**
     * Sélectionner un membre
     * @param memberId
     */
    async selectMember(memberId) {
        const members = await SupabaseManager.getMembers();
        this.currentMember = members.find(m => m.id === memberId);

        if (!this.currentMember) {
            Utils.showNotification('Erreur', 'Membre introuvable', 'error');
            return;
        }

        await this.showMainView();

        // Charger les PDFs du membre après affichage
        await this.loadMemberPDFs();
    },

    /**
     * Créateur de plan nutritionnel
     */
    renderPlanCreator() {
        const m = this.currentMember;
        const objectives = Object.entries(this.OBJECTIVES);

        return `
            <div class="space-y-6">
                <!-- En-tête membre sélectionné -->
                <div class="premium-card flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-2xl">
                            ${m.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold text-white">${m.name}</h3>
                            <p class="text-secondary">
                                ${m.gender === 'male' ? '♂' : m.gender === 'female' ? '♀' : '⚧'}
                                ${m.birthdate ? this.calculateAge(m.birthdate) + ' ans' : 'Âge non renseigné'}
                                • ${m.height || '?'} cm
                                • ${m.weight || '?'} kg
                                ${m.body_fat_percentage ? ` • ${m.body_fat_percentage}% MG` : ''}
                            </p>
                        </div>
                    </div>
                    <div class="flex gap-3">
                        <button onclick="NutritionPro.showUploadPDFModal()"
                                class="btn-premium bg-red-600 hover:bg-red-700">
                            <i class="fas fa-file-pdf mr-2"></i>
                            Ajouter un PDF
                        </button>
                        <button onclick="NutritionPro.currentMember = null; NutritionPro.showMainView()"
                                class="btn-premium glass-card hover:bg-gray-600">
                            <i class="fas fa-arrow-left mr-2"></i>
                            Changer
                        </button>
                    </div>
                </div>

                <!-- Liste des PDFs du membre -->
                <div class="premium-card">
                    <h3 class="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                        <i class="fas fa-file-pdf"></i>
                        Plans PDF (${m.name})
                    </h3>
                    <div id="memberPDFsList">
                        <div class="text-center py-4">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-2"></div>
                            <p class="text-secondary text-sm">Chargement des PDFs...</p>
                        </div>
                    </div>
                </div>

                <!-- Formulaire de création de plan -->
                <div class="premium-card">
                    <h3 class="text-2xl font-bold text-green-400 mb-6">
                        <i class="fas fa-clipboard-list mr-3"></i>
                        Créer un plan nutritionnel
                    </h3>

                    <form onsubmit="NutritionPro.createPlan(event); return false;" class="space-y-6">
                        <!-- Objectif -->
                        <div>
                            <label class="block text-sm font-semibold text-secondary mb-3">
                                <i class="fas fa-bullseye mr-2"></i>
                                Sélectionnez un objectif
                            </label>
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                ${objectives.map(([key, obj]) => `
                                    <label class="objective-card cursor-pointer group">
                                        <input type="radio" name="objective" value="${key}" class="hidden objective-radio">
                                        <div class="objective-content bg-wood-dark bg-opacity-50 rounded-lg p-5 border-2 border-wood-accent border-opacity-30 hover:border-opacity-70 hover:bg-opacity-70 transition-all duration-200 transform hover:scale-105">
                                            <div class="flex flex-col items-center text-center">
                                                <i class="fas ${obj.icon} text-3xl mb-3 transition-transform group-hover:scale-110" style="color: ${obj.color}"></i>
                                                <h4 class="font-bold text-white text-sm">${obj.name}</h4>
                                            </div>
                                            <div class="mt-2 text-center">
                                                <span class="text-xs text-secondary opacity-0 group-hover:opacity-100 transition-opacity">Cliquez pour sélectionner</span>
                                            </div>
                                        </div>
                                    </label>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Configuration du plan -->
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <label class="block text-sm font-semibold text-secondary mb-2">
                                    <i class="fas fa-calendar-alt mr-2"></i>
                                    Durée du plan
                                </label>
                                <select name="planDuration" required
                                        class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition">
                                    <option value="1day">1 jour</option>
                                    <option value="1week" selected>1 semaine (7 jours)</option>
                                    <option value="1month">1 mois (30 jours)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-secondary mb-2">
                                    <i class="fas fa-utensils mr-2"></i>
                                    Repas par jour
                                </label>
                                <select name="mealsPerDay" required
                                        class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition">
                                    <option value="3">3 repas</option>
                                    <option value="4" selected>4 repas</option>
                                    <option value="5">5 repas</option>
                                    <option value="6">6 repas</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-secondary mb-2">
                                    <i class="fas fa-calendar-day mr-2"></i>
                                    Date de début
                                </label>
                                <input type="date" name="startDate" value="${new Date().toISOString().split('T')[0]}" required
                                       class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-secondary mb-2">
                                    <i class="fas fa-euro-sign mr-2 text-yellow-400"></i>
                                    Budget mensuel
                                </label>
                                <input type="number" name="monthlyBudget" min="100" max="2000" step="50" value="400" required
                                       placeholder="Ex: 400€"
                                       class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition">
                            </div>
                        </div>

                        <!-- Restrictions alimentaires -->
                        <div>
                            <label class="block text-sm font-semibold text-secondary mb-3">
                                <i class="fas fa-exclamation-triangle mr-2 text-yellow-400"></i>
                                Allergies et intolérances
                            </label>
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                                ${this.RESTRICTIONS.allergies.map(allergy => `
                                    <label class="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" name="allergies" value="${allergy}"
                                               class="w-5 h-5 rounded border-wood-accent bg-skali-darker text-green-400 focus:ring-green-400">
                                        <span class="text-sm text-secondary">${allergy}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-semibold text-secondary mb-3">
                                <i class="fas fa-leaf mr-2 text-green-400"></i>
                                Régimes alimentaires
                            </label>
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                                ${this.RESTRICTIONS.regimes.map(regime => `
                                    <label class="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" name="regimes" value="${regime}"
                                               class="w-5 h-5 rounded border-wood-accent bg-skali-darker text-green-400 focus:ring-green-400">
                                        <span class="text-sm text-secondary">${regime}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Bouton de génération -->
                        <div class="flex gap-4 pt-4 border-t border-wood-accent border-opacity-20">
                            <button type="submit" class="flex-1 btn-premium btn-publish">
                                <i class="fas fa-calculator mr-2"></i>
                                Calculer les macros
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style>
                .objective-radio:checked + .objective-content {
                    border-color: #22c55e !important;
                    border-width: 3px !important;
                    background: rgba(34, 197, 94, 0.15) !important;
                    box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
                }

                .objective-content:hover {
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }
            </style>
        `;
    },

    /**
     * Calculer l'âge depuis la date de naissance
     * @param birthdate
     */
    calculateAge(birthdate) {
        if (!birthdate) {return null;}
        const today = new Date();
        const birth = new Date(birthdate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    },

    /**
     * Afficher la modale d'upload de PDF
     */
    showUploadPDFModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4';
        modal.onclick = (e) => {
            if (e.target === modal) {modal.remove();}
        };

        modal.innerHTML = `
            <div class="bg-gray-800 rounded-xl p-6 max-w-lg w-full">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-2xl font-bold text-white flex items-center gap-2">
                        <i class="fas fa-file-pdf text-red-400"></i>
                        Ajouter un plan nutritionnel PDF
                    </h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-secondary hover:text-white">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>

                <div class="mb-4">
                    <p class="text-secondary mb-2">
                        <i class="fas fa-user mr-2 text-green-400"></i>
                        <strong>Adhérent:</strong> ${this.currentMember.name}
                    </p>
                </div>

                <form onsubmit="NutritionPro.uploadPDF(event); return false;" class="space-y-4">
                    <div>
                        <label class="block text-sm font-semibold text-secondary mb-2">
                            <i class="fas fa-heading mr-2"></i>
                            Titre du plan (optionnel)
                        </label>
                        <input type="text"
                               id="pdfTitle"
                               placeholder="Ex: Plan de sèche - Mars 2024"
                               class="w-full glass-card border border-glass rounded-lg px-4 py-3 text-white focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition">
                    </div>

                    <div>
                        <label class="block text-sm font-semibold text-secondary mb-2">
                            <i class="fas fa-file-upload mr-2"></i>
                            Fichier PDF
                        </label>
                        <div class="border-2 border-dashed border-glass rounded-lg p-6 text-center hover:border-green-400 transition cursor-pointer"
                             onclick="document.getElementById('pdfFileInput').click()">
                            <input type="file"
                                   id="pdfFileInput"
                                   accept=".pdf,application/pdf"
                                   required
                                   class="hidden"
                                   onchange="NutritionPro.handleFileSelect(event)">
                            <i class="fas fa-cloud-upload-alt text-4xl text-secondary mb-2"></i>
                            <p class="text-secondary">Cliquez pour sélectionner un fichier PDF</p>
                            <p class="text-xs text-secondary mt-1" id="selectedFileName">Aucun fichier sélectionné</p>
                        </div>
                    </div>

                    <div class="flex gap-3 pt-4">
                        <button type="button"
                                onclick="this.closest('.fixed').remove()"
                                class="flex-1 glass-card hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition">
                            Annuler
                        </button>
                        <button type="submit"
                                class="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 rounded-lg transition">
                            <i class="fas fa-upload mr-2"></i>
                            Uploader
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
    },

    /**
     * Gérer la sélection du fichier
     * @param event
     */
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            const fileName = file.name;
            const fileSize = (file.size / 1024 / 1024).toFixed(2); // MB
            document.getElementById('selectedFileName').textContent = `${fileName} (${fileSize} MB)`;
            document.getElementById('selectedFileName').classList.add('text-green-400');
            document.getElementById('selectedFileName').classList.remove('text-secondary');
        }
    },

    /**
     * Uploader le PDF
     * @param event
     */
    async uploadPDF(event) {
        event.preventDefault();

        const fileInput = document.getElementById('pdfFileInput');
        const titleInput = document.getElementById('pdfTitle');
        const file = fileInput.files[0];

        if (!file) {
            Utils.showNotification('Erreur', 'Veuillez sélectionner un fichier', 'error');
            return;
        }

        // Vérifier que c'est bien un PDF
        if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
            Utils.showNotification('Erreur', 'Le fichier doit être au format PDF', 'error');
            return;
        }

        // Vérifier la taille (max 10 MB)
        if (file.size > 10 * 1024 * 1024) {
            Utils.showNotification('Erreur', 'Le fichier ne doit pas dépasser 10 MB', 'error');
            return;
        }

        try {
            // Afficher un loader
            const loader = document.createElement('div');
            loader.id = 'pdfUploadLoader';
            loader.className = 'fixed inset-0 bg-black/90 flex items-center justify-center z-[100]';
            loader.innerHTML = `
                <div class="bg-gray-800 p-6 rounded-lg text-center">
                    <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
                    <p class="text-white text-lg">📤 Upload du PDF en cours...</p>
                    <p class="text-secondary text-sm mt-2">Veuillez patienter</p>
                </div>
            `;
            document.body.appendChild(loader);

            // Générer un nom de fichier unique
            const timestamp = Date.now();
            const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const filePath = `${this.currentMember.id}/${timestamp}_${sanitizedName}`;

            // Upload vers Supabase Storage
            const { data: uploadData, error: uploadError } = await SupabaseManager.supabase.storage
                .from('nutrition-pdfs')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {throw uploadError;}

            // Enregistrer dans la base de données
            const { data: dbData, error: dbError } = await SupabaseManager.supabase
                .from('member_nutrition_pdfs')
                .insert({
                    member_id: this.currentMember.id,
                    title: titleInput.value || file.name,
                    filename: file.name,
                    file_path: filePath,
                    file_size: file.size
                    // uploaded_by sera NULL par défaut (ou ajoutez l'ID de l'utilisateur connecté si disponible)
                });

            if (dbError) {throw dbError;}

            // Supprimer le loader
            loader?.remove();

            // Fermer la modale
            document.querySelector('.fixed').remove();

            Utils.showNotification('Succès', `PDF "${titleInput.value || file.name}" uploadé avec succès !`, 'success');

            console.log('✅ PDF uploadé:', filePath);

            // Recharger la liste des PDFs
            await this.loadMemberPDFs();

        } catch (error) {
            console.error('❌ Erreur upload PDF:', error);
            document.getElementById('pdfUploadLoader')?.remove();
            Utils.showNotification('Erreur', error.message, 'error');
        }
    },

    /**
     * Charger les PDFs d'un membre
     */
    async loadMemberPDFs() {
        const container = document.getElementById('memberPDFsList');
        if (!container || !this.currentMember) {return;}

        try {
            const { data: pdfs, error } = await SupabaseManager.supabase
                .from('member_nutrition_pdfs')
                .select('*')
                .eq('member_id', this.currentMember.id)
                .order('created_at', { ascending: false });

            if (error) {throw error;}

            if (!pdfs || pdfs.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-8 text-secondary">
                        <i class="fas fa-file-pdf text-4xl mb-2 opacity-30"></i>
                        <p>Aucun plan PDF pour cet adhérent</p>
                        <p class="text-sm mt-1">Cliquez sur "Ajouter un PDF" pour en uploader un</p>
                    </div>
                `;
                return;
            }

            const html = `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${pdfs.map(pdf => `
                        <div class="bg-wood-dark bg-opacity-50 rounded-lg p-4 border border-red-500/30 hover:border-red-500/60 transition">
                            <div class="flex items-start justify-between mb-3">
                                <div class="flex items-center gap-3 flex-1">
                                    <div class="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                                        <i class="fas fa-file-pdf text-red-400 text-2xl"></i>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <h4 class="font-bold text-white truncate">${pdf.title}</h4>
                                        <p class="text-xs text-secondary">${this.formatFileSize(pdf.file_size)}</p>
                                        <p class="text-xs text-secondary">${new Date(pdf.created_at).toLocaleDateString('fr-FR')}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="flex gap-2">
                                <button onclick="NutritionPro.downloadPDF('${pdf.file_path}', '${pdf.filename}')"
                                        class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-semibold transition">
                                    <i class="fas fa-download mr-1"></i>
                                    Télécharger
                                </button>
                                <button onclick="NutritionPro.deletePDF('${pdf.id}', '${pdf.file_path}')"
                                        class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-semibold transition">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            container.innerHTML = html;

        } catch (error) {
            console.error('❌ Erreur chargement PDFs:', error);
            container.innerHTML = `
                <div class="text-center py-4 text-red-400">
                    <i class="fas fa-exclamation-triangle mb-2"></i>
                    <p>Erreur de chargement: ${error.message}</p>
                </div>
            `;
        }
    },

    /**
     * Télécharger un PDF
     * @param filePath
     * @param filename
     */
    async downloadPDF(filePath, filename) {
        try {
            const { data, error } = await SupabaseManager.supabase.storage
                .from('nutrition-pdfs')
                .download(filePath);

            if (error) {throw error;}

            // Créer un lien de téléchargement
            const url = URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            Utils.showNotification('Succès', 'PDF téléchargé !', 'success');

        } catch (error) {
            console.error('❌ Erreur téléchargement:', error);
            Utils.showNotification('Erreur', error.message, 'error');
        }
    },

    /**
     * Supprimer un PDF
     * @param pdfId
     * @param filePath
     */
    async deletePDF(pdfId, filePath) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce PDF ?')) {
            return;
        }

        try {
            // Supprimer le fichier du storage
            const { error: storageError } = await SupabaseManager.supabase.storage
                .from('nutrition-pdfs')
                .remove([filePath]);

            if (storageError) {throw storageError;}

            // Supprimer l'entrée de la base de données
            const { error: dbError } = await SupabaseManager.supabase
                .from('member_nutrition_pdfs')
                .delete()
                .eq('id', pdfId);

            if (dbError) {throw dbError;}

            Utils.showNotification('Succès', 'PDF supprimé avec succès !', 'success');

            // Recharger la liste
            await this.loadMemberPDFs();

        } catch (error) {
            console.error('❌ Erreur suppression PDF:', error);
            Utils.showNotification('Erreur', error.message, 'error');
        }
    },

    /**
     * Formater la taille d'un fichier
     * @param bytes
     */
    formatFileSize(bytes) {
        if (bytes < 1024) {return bytes + ' B';}
        if (bytes < 1024 * 1024) {return (bytes / 1024).toFixed(1) + ' KB';}
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    // Suite dans partie 2...
};

// Exposer globalement
window.NutritionPro = NutritionPro;
