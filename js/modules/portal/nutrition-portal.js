/**
 * MODULE NUTRITION - PORTAIL ADHÉRENT
 * Gestion du suivi nutritionnel pour les membres
 * - Suivi du poids avec graphique
 * - Bibliothèque de PDF nutrition
 * - Tracker de calories quotidien
 */

const NutritionPortal = {
    currentTab: 'tracker',
    currentMember: null,
    weightChart: null,
    calorieTargets: null,
    archiveCheckInterval: null,

    /**
     * Initialiser le module
     */
    async init() {
        console.log('🥗 Initialisation Nutrition Portal...');

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

        // Calculer les besoins caloriques
        await this.calculateCalorieTargets();

        // Démarrer la vérification automatique de minuit
        this.startMidnightArchive();

        await this.show();
    },

    /**
     * Afficher la vue principale
     */
    async show() {
        const html = `
            <div class="nutrition-portal-container">
                <!-- Header -->
                <div class="nutrition-header gradient-header">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-3xl font-bold text-white flex items-center gap-3">
                                <i class="fas fa-apple-alt"></i>
                                Nutrition
                            </h1>
                            <p class="text-green-200 text-sm mt-1">Suivez votre progression nutritionnelle</p>
                        </div>
                        <button onclick="window.history.back()" class="btn-icon">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>

                <!-- Onglets -->
                <div class="tabs-container">
                    <button class="tab-btn active" data-tab="tracker" onclick="NutritionPortal.switchTab('tracker')">
                        <i class="fas fa-utensils"></i>
                        <span>Tracker</span>
                    </button>
                    <button class="tab-btn" data-tab="history" onclick="NutritionPortal.switchTab('history')">
                        <i class="fas fa-history"></i>
                        <span>Historique</span>
                    </button>
                    <button class="tab-btn" data-tab="weight" onclick="NutritionPortal.switchTab('weight')">
                        <i class="fas fa-weight"></i>
                        <span>Poids</span>
                    </button>
                    <button class="tab-btn" data-tab="pdfs" onclick="NutritionPortal.switchTab('pdfs')">
                        <i class="fas fa-file-pdf"></i>
                        <span>Mes Plans</span>
                    </button>
                </div>

                <!-- Contenu des onglets -->
                <div class="tab-content-container">
                    <!-- Onglet Suivi Poids -->
                    <div id="tab-weight" class="tab-content">
                        <div class="weight-tracker-section">
                            <!-- Ajout de poids -->
                            <div class="card-modern mb-6">
                                <h3 class="text-xl font-bold text-green-400 mb-4">
                                    <i class="fas fa-plus-circle mr-2"></i>
                                    Ajouter un poids
                                </h3>
                                <div class="flex gap-4">
                                    <input type="date" id="weightDate"
                                           value="${new Date().toISOString().split('T')[0]}"
                                           class="input-modern flex-1">
                                    <input type="number" id="weightValue"
                                           placeholder="Poids (kg)"
                                           step="0.1" min="30" max="200"
                                           class="input-modern w-32">
                                    <button onclick="NutritionPortal.addWeight()" class="btn-primary">
                                        <i class="fas fa-save mr-2"></i>
                                        Enregistrer
                                    </button>
                                </div>
                            </div>

                            <!-- Graphique -->
                            <div class="card-modern">
                                <h3 class="text-xl font-bold text-green-400 mb-4">
                                    <i class="fas fa-chart-line mr-2"></i>
                                    Évolution du poids
                                </h3>
                                <div class="chart-container">
                                    <canvas id="weightChart"></canvas>
                                </div>
                            </div>

                            <!-- Historique -->
                            <div class="card-modern mt-6">
                                <h3 class="text-xl font-bold text-green-400 mb-4">
                                    <i class="fas fa-history mr-2"></i>
                                    Historique
                                </h3>
                                <div id="weightHistory" class="space-y-2"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Onglet Plans PDF -->
                    <div id="tab-pdfs" class="tab-content">
                        <div class="pdfs-section">
                            <div class="card-modern">
                                <h3 class="text-xl font-bold text-green-400 mb-4">
                                    <i class="fas fa-folder-open mr-2"></i>
                                    Mes plans nutritionnels
                                </h3>
                                <div id="pdfsList" class="space-y-3"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Onglet Tracker - Design App Mobile Moderne -->
                    <div id="tab-tracker" class="tab-content active">
                        <div class="tracker-section-mobile px-4 pb-6">

                            <!-- GROS BOUTON PHOTO CENTRAL - Style App Mobile -->
                            <div class="text-center mb-6 mt-2">
                                <button onclick="NutritionPortal.uploadFoodPhoto()"
                                        class="photo-button-hero">
                                    <div class="flex items-center justify-center gap-4">
                                        <div class="camera-icon-wrapper">
                                            <i class="fas fa-camera"></i>
                                        </div>
                                        <div class="text-left">
                                            <div class="font-bold text-lg text-black">Prendre une photo</div>
                                            <div class="text-sm opacity-90 text-black">Analysez votre repas</div>
                                        </div>
                                    </div>
                                </button>
                            </div>

                            <!-- Objectifs caloriques cliquables - 3 cartes -->
                            <div class="mb-4">
                                <h3 class="text-sm font-semibold text-white/70 mb-2 px-1">
                                    Choisir mon objectif du jour
                                </h3>
                                <div id="calorieTargets" class="grid grid-cols-3 gap-2"></div>
                            </div>

                            <!-- Résumé du jour - Card principale avec macros -->
                            <div class="daily-summary-card mb-4">
                                <div class="daily-summary-header">
                                    <div class="daily-summary-title">
                                        <div class="daily-summary-icon">
                                            <i class="fas fa-fire text-sm"></i>
                                        </div>
                                        Aujourd'hui
                                    </div>
                                    <div class="daily-summary-date">${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div>
                                </div>
                                <div id="dailySummary"></div>
                            </div>

                            <!-- Liste des repas - Cards modernes -->
                            <div>
                                <h3 class="text-sm font-semibold text-white/70 mb-2 px-1">
                                    Mes repas
                                </h3>
                                <div id="todayMeals" class="space-y-2"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Onglet Historique -->
                    <div id="tab-history" class="tab-content">
                        <div class="history-section">
                            <div class="card-modern mb-4">
                                <h3 class="text-xl font-bold text-green-400 mb-4">
                                    <i class="fas fa-calendar-alt mr-2"></i>
                                    Historique des journées
                                </h3>
                                <div id="historyList" class="space-y-3"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Afficher dans la zone de contenu du portail
        const contentArea = document.getElementById('contentArea');
        if (contentArea) {
            contentArea.classList.remove('hidden');
            contentArea.innerHTML = html;
        } else {
            console.error('❌ Zone contentArea introuvable');
        }

        // Charger les données de l'onglet actif (Tracker par défaut)
        await this.loadTodayTracker();
    },

    /**
     * Calculer les besoins caloriques (BMR + NEAT + Exercice)
     */
    async calculateCalorieTargets() {
        try {
            // Récupérer les données du membre
            const { data: memberData, error } = await SupabaseManager.supabase
                .from('members')
                .select('weight, height, birthdate, gender')
                .eq('id', this.currentMember.id)
                .single();

            if (error) {
                throw error;
            }

            const weight = memberData.weight || 70;
            const height = memberData.height || 170;
            const age = this.calculateAge(memberData.birthdate);
            const gender = memberData.gender || 'male';

            // 1. BMR (Métabolisme de base - formule Mifflin-St Jeor)
            let bmr;
            if (gender === 'male') {
                bmr = 10 * weight + 6.25 * height - 5 * age + 5;
            } else {
                bmr = 10 * weight + 6.25 * height - 5 * age - 161;
            }

            // 2. NEAT (10,000 pas par jour ~ 300-400 kcal)
            const neat = bmr + 350; // Activité quotidienne moyenne avec 10k pas

            // 3. Avec exercice (500 kcal de sport)
            const withExercise = neat + 500;

            this.calorieTargets = {
                bmr: Math.round(bmr),
                neat: Math.round(neat),
                withExercise: Math.round(withExercise)
            };

            console.log('📊 Besoins caloriques calculés:', this.calorieTargets);
        } catch (error) {
            console.error('❌ Erreur calcul calories:', error);
            // Valeurs par défaut
            this.calorieTargets = {
                bmr: 1600,
                neat: 1950,
                withExercise: 2450
            };
        }
    },

    /**
     * Calculer l'âge à partir de la date de naissance
     * @param birthdate
     */
    calculateAge(birthdate) {
        if (!birthdate) {
            return 30;
        } // Défaut
        const today = new Date();
        const birth = new Date(birthdate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    },

    /**
     * Démarrer le système d'archivage automatique à minuit
     */
    startMidnightArchive() {
        // Vérifier toutes les minutes si on a passé minuit
        this.archiveCheckInterval = setInterval(async () => {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();

            // Si minuit pile (ou entre 00:00 et 00:01)
            if (hours === 0 && minutes === 0) {
                console.log('🌙 Minuit détecté - Archivage de la journée précédente...');
                await this.archiveYesterday();
            }
        }, 60000); // Vérifier chaque minute

        console.log("⏰ Système d'archivage automatique démarré");
    },

    /**
     * Archiver la journée d'hier
     */
    async archiveYesterday() {
        try {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            // Récupérer tous les repas d'hier
            const { data: meals, error } = await SupabaseManager.supabase
                .from('member_food_log')
                .select('*')
                .eq('member_id', this.currentMember.id)
                .eq('date', yesterdayStr);

            if (error) {
                throw error;
            }

            if (meals && meals.length > 0) {
                // Calculer les totaux
                const totals = meals.reduce(
                    (acc, meal) => ({
                        calories: acc.calories + (meal.calories || 0),
                        protein: acc.protein + (meal.protein || 0),
                        carbs: acc.carbs + (meal.carbs || 0),
                        fats: acc.fats + (meal.fats || 0),
                        fiber: acc.fiber + (meal.fiber || 0),
                        vitamin_c: acc.vitamin_c + (meal.vitamin_c || 0),
                        vitamin_d: acc.vitamin_d + (meal.vitamin_d || 0),
                        calcium: acc.calcium + (meal.calcium || 0),
                        iron: acc.iron + (meal.iron || 0)
                    }),
                    {
                        calories: 0,
                        protein: 0,
                        carbs: 0,
                        fats: 0,
                        fiber: 0,
                        vitamin_c: 0,
                        vitamin_d: 0,
                        calcium: 0,
                        iron: 0
                    }
                );

                // Analyser les carences
                const deficiencies = this.detectDeficiencies(totals);

                // Créer l'archive
                const { error: archiveError } = await SupabaseManager.supabase
                    .from('member_nutrition_history')
                    .insert({
                        member_id: this.currentMember.id,
                        date: yesterdayStr,
                        total_calories: totals.calories,
                        total_protein: totals.protein,
                        total_carbs: totals.carbs,
                        total_fats: totals.fats,
                        total_fiber: totals.fiber,
                        deficiencies: deficiencies,
                        meals_count: meals.length,
                        meals_data: meals
                    });

                if (archiveError) {
                    throw archiveError;
                }

                console.log('✅ Journée archivée:', yesterdayStr);
            }
        } catch (error) {
            console.error('❌ Erreur archivage:', error);
        }
    },

    /**
     * Détecter les carences nutritionnelles
     * @param totals
     */
    detectDeficiencies(totals) {
        const deficiencies = [];

        const recommendations = {
            protein: 60,
            fiber: 25,
            vitamin_c: 80,
            vitamin_d: 15,
            calcium: 1000,
            iron: 14
        };

        if (totals.protein < recommendations.protein) {
            deficiencies.push('Protéines');
        }
        if (totals.fiber < recommendations.fiber) {
            deficiencies.push('Fibres');
        }
        if (totals.vitamin_c < recommendations.vitamin_c) {
            deficiencies.push('Vitamine C');
        }
        if (totals.vitamin_d < recommendations.vitamin_d) {
            deficiencies.push('Vitamine D');
        }
        if (totals.calcium < recommendations.calcium) {
            deficiencies.push('Calcium');
        }
        if (totals.iron < recommendations.iron) {
            deficiencies.push('Fer');
        }

        return deficiencies;
    },

    /**
     * Toggle de la recherche manuelle
     */
    toggleManualSearch() {
        const container = document.getElementById('manualSearchContainer');
        container.classList.toggle('hidden');
        if (!container.classList.contains('hidden')) {
            document.getElementById('foodSearch').focus();
        }
    },

    /**
     * Changer d'onglet
     * @param tabName
     */
    async switchTab(tabName) {
        this.currentTab = tabName;

        // Mettre à jour les boutons
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
        document.getElementById(`tab-${tabName}`).classList.add('active');

        // Charger les données selon l'onglet
        if (tabName === 'weight') {
            await this.loadWeightData();
        } else if (tabName === 'pdfs') {
            await this.loadPDFs();
        } else if (tabName === 'tracker') {
            await this.loadTodayTracker();
        } else if (tabName === 'history') {
            await this.loadHistory();
        }
    },

    /**
     * ONGLET 1: SUIVI DU POIDS
     */
    async loadWeightData() {
        try {
            const { data, error } = await SupabaseManager.supabase
                .from('member_weights')
                .select('*')
                .eq('member_id', this.currentMember.id)
                .order('date', { ascending: true });

            if (error) {
                throw error;
            }

            // Afficher l'historique
            this.displayWeightHistory(data || []);

            // Créer le graphique
            this.createWeightChart(data || []);
        } catch (error) {
            console.error('❌ Erreur chargement poids:', error);
            Utils.showNotification('Erreur', 'Impossible de charger les données', 'error');
        }
    },

    /**
     * Ajouter un poids
     */
    async addWeight() {
        const date = document.getElementById('weightDate').value;
        const weight = parseFloat(document.getElementById('weightValue').value);

        if (!date || !weight || weight < 30 || weight > 200) {
            Utils.showNotification(
                'Erreur',
                'Veuillez entrer une date et un poids valide',
                'error'
            );
            return;
        }

        try {
            const { error } = await SupabaseManager.supabase.from('member_weights').upsert(
                {
                    member_id: this.currentMember.id,
                    date: date,
                    weight: weight
                },
                {
                    onConflict: 'member_id,date'
                }
            );

            if (error) {
                throw error;
            }

            Utils.showNotification('Succès', 'Poids enregistré !', 'success');

            // Réinitialiser le champ
            document.getElementById('weightValue').value = '';

            // Recharger les données
            await this.loadWeightData();
        } catch (error) {
            console.error('❌ Erreur ajout poids:', error);
            Utils.showNotification('Erreur', error.message, 'error');
        }
    },

    /**
     * Afficher l'historique des poids
     * @param weights
     */
    displayWeightHistory(weights) {
        const container = document.getElementById('weightHistory');

        if (weights.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-400 py-8">
                    <i class="fas fa-inbox text-4xl mb-3"></i>
                    <p>Aucune pesée enregistrée</p>
                </div>
            `;
            return;
        }

        const html = weights
            .reverse()
            .map((w, index) => {
                const diff = index < weights.length - 1 ? w.weight - weights[index + 1].weight : 0;
                const diffClass =
                    diff > 0 ? 'text-red-400' : diff < 0 ? 'text-green-400' : 'text-gray-400';
                const diffIcon = diff > 0 ? 'fa-arrow-up' : diff < 0 ? 'fa-arrow-down' : 'fa-minus';

                return `
                <div class="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                    <div class="flex items-center gap-3">
                        <i class="fas fa-calendar text-green-400"></i>
                        <span class="text-white">${new Date(w.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="text-2xl font-bold text-white">${w.weight} kg</span>
                        ${
                            diff !== 0
                                ? `
                            <span class="${diffClass} text-sm flex items-center gap-1">
                                <i class="fas ${diffIcon}"></i>
                                ${Math.abs(diff).toFixed(1)} kg
                            </span>
                        `
                                : ''
                        }
                        <button onclick="NutritionPortal.deleteWeight('${w.date}')"
                                class="text-red-400 hover:text-red-300 transition">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            })
            .join('');

        container.innerHTML = html;
    },

    /**
     * Créer le graphique de poids
     * @param weights
     */
    createWeightChart(weights) {
        const canvas = document.getElementById('weightChart');
        const ctx = canvas.getContext('2d');

        // Détruire l'ancien graphique
        if (this.weightChart) {
            this.weightChart.destroy();
        }

        if (weights.length === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#9CA3AF';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Aucune donnée à afficher', canvas.width / 2, canvas.height / 2);
            return;
        }

        // Préparer les données
        const labels = weights.map(w =>
            new Date(w.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
        );
        const data = weights.map(w => w.weight);

        this.weightChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Poids (kg)',
                        data: data,
                        borderColor: '#22C55E',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointBackgroundColor: '#22C55E',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 0,
                        max: 150,
                        ticks: {
                            color: '#9CA3AF',
                            font: { size: 12 }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#9CA3AF',
                            font: { size: 11 }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#9CA3AF',
                            font: { size: 14 }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#22C55E',
                        bodyColor: '#fff',
                        borderColor: '#22C55E',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false
                    }
                }
            }
        });
    },

    /**
     * Supprimer un poids
     * @param date
     */
    async deleteWeight(date) {
        if (!confirm('Supprimer cette pesée ?')) {
            return;
        }

        try {
            const { error } = await SupabaseManager.supabase
                .from('member_weights')
                .delete()
                .eq('member_id', this.currentMember.id)
                .eq('date', date);

            if (error) {
                throw error;
            }

            Utils.showNotification('Succès', 'Pesée supprimée', 'success');
            await this.loadWeightData();
        } catch (error) {
            console.error('❌ Erreur suppression:', error);
            Utils.showNotification('Erreur', error.message, 'error');
        }
    },

    /**
     * ONGLET 2: PLANS PDF
     */
    async loadPDFs() {
        try {
            const { data, error } = await SupabaseManager.supabase
                .from('member_nutrition_pdfs')
                .select('*')
                .eq('member_id', this.currentMember.id)
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            this.displayPDFs(data || []);
        } catch (error) {
            console.error('❌ Erreur chargement PDFs:', error);
            Utils.showNotification('Erreur', 'Impossible de charger les PDF', 'error');
        }
    },

    /**
     * Afficher la liste des PDFs (amélioré avec ouvrir + télécharger)
     * @param pdfs
     */
    displayPDFs(pdfs) {
        const container = document.getElementById('pdfsList');

        if (pdfs.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-400 py-12">
                    <i class="fas fa-file-pdf text-6xl mb-4"></i>
                    <p class="text-lg">Aucun plan nutritionnel</p>
                    <p class="text-sm mt-2">Votre coach ajoutera vos plans ici</p>
                </div>
            `;
            return;
        }

        const html = pdfs
            .map(
                pdf => `
            <div class="bg-gray-800 p-4 rounded-lg hover:bg-gray-750 transition">
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-12 h-12 bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-file-pdf text-2xl text-red-400"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="text-white font-semibold truncate">${pdf.title || 'Plan nutritionnel'}</h4>
                        <p class="text-gray-400 text-xs">
                            <i class="far fa-calendar mr-1"></i>
                            ${new Date(pdf.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button onclick="NutritionPortal.openPDF('${pdf.id}')"
                            class="btn-primary flex-1 text-sm">
                        <i class="fas fa-eye"></i>
                        Ouvrir
                    </button>
                    <button onclick="NutritionPortal.downloadPDF('${pdf.id}')"
                            class="btn-secondary flex-1 text-sm">
                        <i class="fas fa-download"></i>
                        Télécharger
                    </button>
                </div>
            </div>
        `
            )
            .join('');

        container.innerHTML = html;
    },

    /**
     * Ouvrir un PDF dans une nouvelle fenêtre/onglet
     * @param pdfId
     */
    async openPDF(pdfId) {
        try {
            // Récupérer les infos du PDF
            const { data: pdf, error } = await SupabaseManager.supabase
                .from('member_nutrition_pdfs')
                .select('*')
                .eq('id', pdfId)
                .single();

            if (error) {
                throw error;
            }

            // Obtenir l'URL publique temporaire (valide 60 minutes)
            const { data: signedUrl, error: signError } = await SupabaseManager.supabase.storage
                .from('nutrition-pdfs')
                .createSignedUrl(pdf.file_path, 3600); // 1 heure

            if (signError) {
                throw signError;
            }

            // Ouvrir dans un nouvel onglet
            window.open(signedUrl.signedUrl, '_blank');

            Utils.showNotification('Succès', 'PDF ouvert dans un nouvel onglet', 'success');
        } catch (error) {
            console.error('❌ Erreur ouverture PDF:', error);
            Utils.showNotification('Erreur', error.message, 'error');
        }
    },

    /**
     * Télécharger un PDF
     * @param pdfId
     */
    async downloadPDF(pdfId) {
        try {
            // Récupérer les infos du PDF
            const { data: pdf, error } = await SupabaseManager.supabase
                .from('member_nutrition_pdfs')
                .select('*')
                .eq('id', pdfId)
                .single();

            if (error) {
                throw error;
            }

            // Télécharger depuis Supabase Storage
            const { data: fileData, error: downloadError } = await SupabaseManager.supabase.storage
                .from('nutrition-pdfs')
                .download(pdf.file_path);

            if (downloadError) {
                throw downloadError;
            }

            // Créer un lien de téléchargement
            const url = URL.createObjectURL(fileData);
            const a = document.createElement('a');
            a.href = url;
            a.download = pdf.filename || 'plan-nutrition.pdf';
            a.click();
            URL.revokeObjectURL(url);

            Utils.showNotification('Succès', 'Téléchargement démarré', 'success');
        } catch (error) {
            console.error('❌ Erreur téléchargement:', error);
            Utils.showNotification('Erreur', error.message, 'error');
        }
    },

    /**
     * ONGLET 3: TRACKER DE CALORIES
     */
    async loadTodayTracker() {
        const today = new Date().toISOString().split('T')[0];

        try {
            const { data, error } = await SupabaseManager.supabase
                .from('member_food_log')
                .select('*')
                .eq('member_id', this.currentMember.id)
                .eq('date', today)
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            // Afficher les besoins caloriques
            this.displayCalorieTargets();

            // Afficher les repas et le résumé
            this.displayTodayMeals(data || []);
            await this.updateDailySummaryWithCountdown(data || []);
        } catch (error) {
            console.error('❌ Erreur chargement tracker:', error);
            Utils.showNotification('Erreur', 'Impossible de charger le tracker', 'error');
        }
    },

    /**
     * Afficher les besoins caloriques (BMR/NEAT/Exercice) - Design moderne CLIQUABLE
     */
    displayCalorieTargets() {
        const container = document.getElementById('calorieTargets');
        if (!container || !this.calorieTargets) {
            return;
        }

        // Par défaut, l'objectif sélectionné est NEAT
        const selectedTarget = this.selectedCalorieTarget || this.calorieTargets.neat;

        const html = `
            <div class="calorie-target-card ${selectedTarget === this.calorieTargets.bmr ? 'active' : ''}"
                 onclick="NutritionPortal.selectCalorieTarget(${this.calorieTargets.bmr})">
                <div class="calorie-target-icon">
                    <i class="fas fa-bed"></i>
                </div>
                <div class="calorie-target-label">BMR</div>
                <div class="calorie-target-value">${this.calorieTargets.bmr}</div>
                <div class="calorie-target-subtitle">Repos</div>
            </div>
            <div class="calorie-target-card ${selectedTarget === this.calorieTargets.neat ? 'active' : ''}"
                 onclick="NutritionPortal.selectCalorieTarget(${this.calorieTargets.neat})">
                <div class="calorie-target-icon">
                    <i class="fas fa-walking"></i>
                </div>
                <div class="calorie-target-label">+10k pas</div>
                <div class="calorie-target-value">${this.calorieTargets.neat}</div>
                <div class="calorie-target-subtitle">Actif</div>
            </div>
            <div class="calorie-target-card ${selectedTarget === this.calorieTargets.withExercise ? 'active' : ''}"
                 onclick="NutritionPortal.selectCalorieTarget(${this.calorieTargets.withExercise})">
                <div class="calorie-target-icon">
                    <i class="fas fa-dumbbell"></i>
                </div>
                <div class="calorie-target-label">+Sport</div>
                <div class="calorie-target-value">${this.calorieTargets.withExercise}</div>
                <div class="calorie-target-subtitle">Sportif</div>
            </div>
        `;

        container.innerHTML = html;
    },

    /**
     * Sélectionner un objectif calorique
     * @param target
     */
    selectCalorieTarget(target) {
        this.selectedCalorieTarget = target;
        // Recharger l'affichage avec le nouvel objectif
        this.loadTodayTracker();
    },

    /**
     * Mettre à jour le résumé quotidien AVEC décompte (nouveau design)
     * @param meals
     */
    async updateDailySummaryWithCountdown(meals) {
        const container = document.getElementById('dailySummary');
        if (!container) {
            return;
        }

        // Calculer les totaux
        const totals = meals.reduce(
            (acc, meal) => ({
                calories: acc.calories + (meal.calories || 0),
                protein: acc.protein + (meal.protein || 0),
                carbs: acc.carbs + (meal.carbs || 0),
                fats: acc.fats + (meal.fats || 0)
            }),
            { calories: 0, protein: 0, carbs: 0, fats: 0 }
        );

        // Objectif calorique (on utilise l'objectif sélectionné ou NEAT par défaut)
        const targetCalories = this.selectedCalorieTarget || this.calorieTargets?.neat || 2000;
        const remaining = targetCalories - totals.calories;
        const percentConsumed = Math.round((totals.calories / targetCalories) * 100);

        // Couleur selon si on est au-dessus ou en dessous
        let statusClass, statusIcon, statusText;
        if (remaining > 200) {
            statusClass = 'deficit';
            statusIcon = 'fa-arrow-down';
            statusText = 'Déficit';
        } else if (remaining < -200) {
            statusClass = 'surplus';
            statusIcon = 'fa-arrow-up';
            statusText = 'Surplus';
        } else {
            statusClass = 'perfect';
            statusIcon = 'fa-check';
            statusText = 'Pile poil !';
        }

        const html = `
            <!-- Barre de progression calories - Design moderne -->
            <div class="mb-4">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                        <span class="text-2xl">🔥</span>
                        <span class="text-white font-bold text-lg">${Math.round(totals.calories)}</span>
                        <span class="text-white/50 text-sm">/ ${targetCalories}</span>
                    </div>
                    <div class="status-badge ${statusClass}">
                        <i class="fas ${statusIcon} text-xs"></i>
                        <span class="text-xs font-bold">${statusText}</span>
                    </div>
                </div>
                <div class="progress-bar-modern">
                    <div class="progress-fill-modern" style="width: ${Math.min(percentConsumed, 100)}%"></div>
                </div>
                <div class="text-xs text-white/40 mt-1 text-center font-medium">${percentConsumed}% de l'objectif</div>
            </div>

            <!-- Macros en grille - Design app moderne -->
            <div class="grid grid-cols-3 gap-2">
                <div class="macro-box-modern macro-box-protein">
                    <div class="text-blue-400 text-[9px] font-semibold uppercase tracking-wide mb-1">Protéines</div>
                    <div class="macro-value text-blue-300">${Math.round(totals.protein)}g</div>
                </div>
                <div class="macro-box-modern macro-box-carbs">
                    <div class="text-yellow-400 text-[9px] font-semibold uppercase tracking-wide mb-1">Glucides</div>
                    <div class="macro-value text-yellow-300">${Math.round(totals.carbs)}g</div>
                </div>
                <div class="macro-box-modern macro-box-fats">
                    <div class="text-purple-400 text-[9px] font-semibold uppercase tracking-wide mb-1">Lipides</div>
                    <div class="macro-value text-purple-300">${Math.round(totals.fats)}g</div>
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    /**
     * Upload et analyser une photo de repas
     */
    async uploadFoodPhoto() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment'; // Active la caméra sur mobile

        input.onchange = async e => {
            const file = e.target.files[0];
            if (!file) {
                return;
            }

            // Afficher un loader avec la photo
            const loader = document.createElement('div');
            loader.id = 'photoAnalysisLoader';
            loader.className =
                'fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4';
            loader.innerHTML = `
                <div class="max-w-2xl w-full bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                    <!-- Photo avec effet de scan -->
                    <div class="relative">
                        <img id="analysisFoodPhoto" class="w-full h-auto food-photo-hidden">
                        <div class="absolute inset-0 scan-line-container">
                            <div class="scan-line"></div>
                        </div>
                    </div>

                    <!-- Statut -->
                    <div class="p-6 text-center">
                        <div class="flex items-center justify-center mb-3">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mr-3"></div>
                            <p class="text-white text-xl font-bold">🧠 Analyse en cours...</p>
                        </div>
                        <p id="analysisStatus" class="text-gray-400 text-sm">Compression de l'image...</p>

                        <!-- Barre de progression -->
                        <div class="mt-4 bg-gray-800 rounded-full h-2 overflow-hidden">
                            <div id="analysisProgress" class="analysis-progress-bar" style="width: 10%"></div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(loader);

            // Ajouter les styles CSS pour l'effet de scan amélioré
            if (!document.getElementById('scanLineStyles')) {
                const style = document.createElement('style');
                style.id = 'scanLineStyles';
                style.textContent = `
                    .scan-line-container {
                        overflow: hidden;
                        pointer-events: none;
                        background: linear-gradient(180deg,
                            rgba(34, 197, 94, 0.05) 0%,
                            rgba(34, 197, 94, 0.1) 50%,
                            rgba(34, 197, 94, 0.05) 100%);
                    }
                    .scan-line {
                        position: absolute;
                        top: -10%;
                        left: 0;
                        right: 0;
                        height: 80px;
                        background: linear-gradient(to bottom,
                            transparent 0%,
                            rgba(34, 197, 94, 0.3) 20%,
                            rgba(34, 197, 94, 0.9) 50%,
                            rgba(34, 197, 94, 0.3) 80%,
                            transparent 100%);
                        box-shadow:
                            0 0 40px rgba(34, 197, 94, 0.8),
                            0 0 80px rgba(34, 197, 94, 0.4),
                            0 0 120px rgba(34, 197, 94, 0.2);
                        animation: scanMove 3s ease-in-out infinite;
                        filter: blur(1px);
                    }
                    .scan-line::before {
                        content: '';
                        position: absolute;
                        top: 50%;
                        left: 0;
                        right: 0;
                        height: 2px;
                        background: rgba(255, 255, 255, 0.8);
                        box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
                    }
                    @keyframes scanMove {
                        0% {
                            transform: translateY(-10%);
                            opacity: 0;
                        }
                        10% {
                            opacity: 1;
                        }
                        90% {
                            opacity: 1;
                        }
                        100% {
                            transform: translateY(calc(100vh));
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);
            }

            try {
                const statusEl = document.getElementById('analysisStatus');
                const progressEl = document.getElementById('analysisProgress');
                const photoEl = document.getElementById('analysisFoodPhoto');

                // Compresser et convertir l'image en base64
                statusEl.textContent = "Compression de l'image...";
                progressEl.style.width = '10%';
                const base64Image = await this.compressAndConvertImage(file);

                // Afficher la photo compressée
                photoEl.src = `data:image/jpeg;base64,${base64Image}`;
                photoEl.style.display = 'block';

                // Attendre que l'image soit chargée et ajuster l'animation
                photoEl.onload = () => {
                    const scanContainer = document.querySelector('.scan-line-container');
                    const imageHeight = photoEl.offsetHeight;
                    console.log("📐 Hauteur de l'image:", imageHeight, 'px');

                    // Créer une animation dynamique basée sur la hauteur réelle
                    const dynamicStyle = document.createElement('style');
                    dynamicStyle.id = 'scanLineDynamic';
                    dynamicStyle.textContent = `
                        @keyframes scanMove {
                            0% {
                                transform: translateY(-80px);
                                opacity: 0;
                            }
                            10% {
                                opacity: 1;
                            }
                            90% {
                                opacity: 1;
                            }
                            100% {
                                transform: translateY(${imageHeight + 80}px);
                                opacity: 0;
                            }
                        }
                    `;
                    // Remplacer l'ancien style si existe
                    const oldStyle = document.getElementById('scanLineDynamic');
                    if (oldStyle) {
                        oldStyle.remove();
                    }
                    document.head.appendChild(dynamicStyle);
                };

                // Analyser avec Claude Vision
                statusEl.textContent = '🔍 Claude Vision analyse les aliments...';
                progressEl.style.width = '50%';
                const analysis = await this.analyzeFoodWithClaudeVision(base64Image);
                console.log('✅ Détecté:', analysis.foods.length, 'aliment(s)');

                // Formater les données (sans OpenFoodFacts pour la rapidité)
                statusEl.textContent = '📝 Formatage des données...';
                progressEl.style.width = '70%';
                const formattedFoods = analysis.foods.map(food => ({
                    name: `${food.name} (${food.quantity_g}g)`,
                    calories: food.calories || 0,
                    protein: food.protein || 0,
                    carbs: food.carbs || 0,
                    fats: food.fats || 0,
                    fiber: 0,
                    sugar: 0,
                    sodium: 0,
                    vitamin_a: 0,
                    vitamin_c: 0,
                    vitamin_d: 0,
                    calcium: 0,
                    iron: 0,
                    nutriscore: null,
                    nova_group: null,
                    additives: [],
                    allergens: []
                }));

                // Regrouper tous les aliments en un seul repas
                statusEl.textContent = '💾 Enregistrement du repas...';
                progressEl.style.width = '90%';
                await this.addGroupedMealToLog(formattedFoods);

                progressEl.style.width = '100%';
                Utils.showNotification(
                    'Succès',
                    `Repas ajouté ! (${formattedFoods.length} aliment(s))`,
                    'success'
                );
            } catch (error) {
                console.error('❌ Erreur analyse photo:', error);
                Utils.showNotification('Erreur', error.message, 'error');
            } finally {
                loader?.remove();
            }
        };

        input.click();
    },

    /**
     * Compresser et convertir une image en base64
     * @param file
     */
    async compressAndConvertImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = e => {
                const img = new Image();

                img.onload = () => {
                    // Créer un canvas pour redimensionner
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Redimensionner si trop grand (max 1024px sur le côté le plus long)
                    const maxSize = 1024;
                    if (width > maxSize || height > maxSize) {
                        if (width > height) {
                            height = (height / width) * maxSize;
                            width = maxSize;
                        } else {
                            width = (width / height) * maxSize;
                            height = maxSize;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    // Dessiner l'image redimensionnée
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convertir en base64 avec compression JPEG (qualité 0.8)
                    const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

                    console.log('📸 Image compressée:', {
                        original: `${img.width}x${img.height}`,
                        compressed: `${width}x${height}`,
                        size: `${((base64.length * 0.75) / 1024).toFixed(2)} KB`
                    });

                    resolve(base64);
                };

                img.onerror = () => reject(new Error("Impossible de charger l'image"));
                img.src = e.target.result;
            };

            reader.onerror = () => reject(new Error('Impossible de lire le fichier'));
            reader.readAsDataURL(file);
        });
    },

    /**
     * Convertir un fichier en base64
     * @param file
     */
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    /**
     * Analyser une photo avec Claude Vision
     * @param base64Image
     */
    async analyzeFoodWithClaudeVision(base64Image) {
        try {
            console.log("🔍 Envoi de l'image à Claude Vision...");

            // Utiliser l'URL configurée dans api-config.js (automatique dev/prod)
            const apiUrl = window.ApiConfig
                ? window.ApiConfig.getApiUrl()
                : 'http://localhost:3001';

            const response = await fetch(`${apiUrl}/api/vision`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: base64Image,
                    image_type: 'image/jpeg',
                    prompt: `Analyse cette photo de repas et identifie TOUS les aliments visibles.

Pour chaque aliment détecté, estime:
- Le nom précis de l'aliment
- La quantité approximative en grammes
- Les calories
- Les protéines (g)
- Les glucides (g)
- Les lipides (g)

Réponds UNIQUEMENT avec un JSON valide dans ce format exact:
{
    "foods": [
        {
            "name": "Poulet rôti",
            "quantity_g": 150,
            "calories": 248,
            "protein": 46,
            "carbs": 0,
            "fats": 5.4
        }
    ]
}

Sois précis sur les quantités en observant la taille de l'assiette et des portions.`
                })
            });

            console.log('📡 Réponse reçue, status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ Erreur serveur:', errorData);

                // Extraire le message d'erreur détaillé
                let errorMessage = 'Erreur serveur';
                if (errorData.details) {
                    errorMessage = errorData.details;
                } else if (errorData.error) {
                    errorMessage =
                        typeof errorData.error === 'string'
                            ? errorData.error
                            : JSON.stringify(errorData.error);
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                } else {
                    errorMessage = response.statusText || `Erreur ${response.status}`;
                }

                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('📊 Données Claude:', data);

            // Parser la réponse de Claude
            let analysisText = data.content?.[0]?.text || '';
            console.log('📝 Texte:', analysisText.substring(0, 200));

            // Extraire le JSON de la réponse
            const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.error('❌ Pas de JSON dans:', analysisText);
                throw new Error('Format de réponse invalide');
            }

            const analysis = JSON.parse(jsonMatch[0]);
            console.log('✅ Analyse réussie:', analysis);
            return analysis;
        } catch (error) {
            console.error('❌ Erreur Claude Vision:', error);
            throw new Error("Impossible d'analyser la photo: " + error.message);
        }
    },

    /**
     * Enrichir les données avec OpenFoodFacts
     * @param foods
     */
    async enrichWithOpenFoodFacts(foods) {
        console.log(`📊 Début enrichissement de ${foods.length} aliments...`);
        const enriched = [];

        for (let i = 0; i < foods.length; i++) {
            const food = foods[i];
            try {
                console.log(`  ${i + 1}/${foods.length} Recherche "${food.name}"...`);

                // Rechercher dans OpenFoodFacts
                const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(food.name)}&search_simple=1&action=process&json=1&page_size=1`;

                const response = await fetch(searchUrl);
                const data = await response.json();

                console.log(
                    `  ✓ Réponse pour "${food.name}":`,
                    data.products?.length || 0,
                    'produit(s)'
                );

                if (data.products && data.products.length > 0) {
                    const product = data.products[0];
                    const nutriments = product.nutriments || {};

                    // Enrichir avec les données détaillées
                    enriched.push({
                        name: `${food.name} (${food.quantity_g}g)`,
                        calories: food.calories,
                        protein: food.protein,
                        carbs: food.carbs,
                        fats: food.fats,
                        // Données enrichies
                        fiber: nutriments.fiber_100g
                            ? (nutriments.fiber_100g * food.quantity_g) / 100
                            : 0,
                        sugar: nutriments.sugars_100g
                            ? (nutriments.sugars_100g * food.quantity_g) / 100
                            : 0,
                        sodium: nutriments.sodium_100g
                            ? (nutriments.sodium_100g * food.quantity_g) / 100
                            : 0,
                        // Vitamines & minéraux
                        vitamin_a: nutriments['vitamin-a_100g']
                            ? (nutriments['vitamin-a_100g'] * food.quantity_g) / 100
                            : 0,
                        vitamin_c: nutriments['vitamin-c_100g']
                            ? (nutriments['vitamin-c_100g'] * food.quantity_g) / 100
                            : 0,
                        vitamin_d: nutriments['vitamin-d_100g']
                            ? (nutriments['vitamin-d_100g'] * food.quantity_g) / 100
                            : 0,
                        calcium: nutriments.calcium_100g
                            ? (nutriments.calcium_100g * food.quantity_g) / 100
                            : 0,
                        iron: nutriments.iron_100g
                            ? (nutriments.iron_100g * food.quantity_g) / 100
                            : 0,
                        // Scores & labels
                        nutriscore: product.nutriscore_grade?.toUpperCase() || null,
                        nova_group: product.nova_group || null,
                        // Additifs
                        additives: product.additives_tags || [],
                        allergens: product.allergens_tags || []
                    });
                } else {
                    // Si pas trouvé dans OpenFoodFacts, utiliser les données de Claude
                    enriched.push({
                        ...food,
                        name: `${food.name} (${food.quantity_g}g)`,
                        fiber: 0,
                        sugar: 0,
                        sodium: 0,
                        vitamin_a: 0,
                        vitamin_c: 0,
                        vitamin_d: 0,
                        calcium: 0,
                        iron: 0,
                        nutriscore: null,
                        nova_group: null,
                        additives: [],
                        allergens: []
                    });
                }
            } catch (error) {
                console.error(`  ❌ Erreur OpenFoodFacts pour "${food.name}":`, error);
                // En cas d'erreur, utiliser les données de Claude
                enriched.push({
                    ...food,
                    name: `${food.name} (${food.quantity_g}g)`,
                    fiber: 0,
                    sugar: 0,
                    sodium: 0,
                    vitamin_a: 0,
                    vitamin_c: 0,
                    vitamin_d: 0,
                    calcium: 0,
                    iron: 0,
                    nutriscore: null,
                    nova_group: null,
                    additives: [],
                    allergens: []
                });
            }
        }

        console.log('✅ Enrichissement terminé:', enriched.length, 'aliments');
        return enriched;
    },

    /**
     * Rechercher un aliment
     * @param query
     */
    async searchFood(query) {
        if (query.length < 2) {
            document.getElementById('foodResults').innerHTML = '';
            return;
        }

        // Base de données d'aliments simple (à remplacer par une API comme OpenFoodFacts)
        const commonFoods = [
            { name: 'Poulet (100g)', calories: 165, protein: 31, carbs: 0, fats: 3.6 },
            { name: 'Riz blanc cuit (100g)', calories: 130, protein: 2.7, carbs: 28, fats: 0.3 },
            { name: 'Pâtes cuites (100g)', calories: 131, protein: 5, carbs: 25, fats: 1.1 },
            { name: 'Pomme (150g)', calories: 78, protein: 0.4, carbs: 21, fats: 0.2 },
            { name: 'Banane (120g)', calories: 107, protein: 1.3, carbs: 27, fats: 0.4 },
            { name: 'Œuf (60g)', calories: 90, protein: 6.3, carbs: 0.6, fats: 6.2 },
            { name: 'Saumon (100g)', calories: 208, protein: 20, carbs: 0, fats: 13 },
            { name: 'Bœuf haché 5% (100g)', calories: 137, protein: 21, carbs: 0, fats: 5 },
            { name: 'Yaourt grec 0% (100g)', calories: 59, protein: 10, carbs: 3.6, fats: 0.4 },
            { name: 'Pain complet (50g)', calories: 123, protein: 5, carbs: 22, fats: 1.5 }
        ];

        const results = commonFoods.filter(f => f.name.toLowerCase().includes(query.toLowerCase()));

        const html =
            results.length > 0
                ? results
                      .map(
                          food => `
            <div class="search-result-item" onclick='NutritionPortal.addFoodToLog(${JSON.stringify(food)})'>
                <div>
                    <div class="font-semibold text-white">${food.name}</div>
                    <div class="text-xs text-gray-400">
                        ${food.calories} kcal | P: ${food.protein}g | G: ${food.carbs}g | L: ${food.fats}g
                    </div>
                </div>
                <i class="fas fa-plus-circle text-green-400"></i>
            </div>
        `
                      )
                      .join('')
                : '<div class="p-3 text-gray-400 text-sm">Aucun résultat</div>';

        document.getElementById('foodResults').innerHTML = html;
    },

    /**
     * Ajouter un repas groupé (plusieurs aliments de la photo regroupés en une ligne)
     * @param foods
     */
    async addGroupedMealToLog(foods) {
        if (!foods || foods.length === 0) {
            throw new Error('Aucun aliment détecté');
        }

        const today = new Date().toISOString().split('T')[0];

        try {
            // Créer le nom du repas (liste des aliments)
            const foodNames = foods.map(f => {
                // Retirer la quantité entre parenthèses si présente
                return f.name.replace(/\s*\(\d+g\)/, '');
            });
            const mealName = foodNames.join(', ');

            // Calculer les totaux
            const totals = foods.reduce(
                (acc, food) => ({
                    calories: acc.calories + (food.calories || 0),
                    protein: acc.protein + (food.protein || 0),
                    carbs: acc.carbs + (food.carbs || 0),
                    fats: acc.fats + (food.fats || 0),
                    fiber: acc.fiber + (food.fiber || 0),
                    sugar: acc.sugar + (food.sugar || 0),
                    sodium: acc.sodium + (food.sodium || 0),
                    vitamin_a: acc.vitamin_a + (food.vitamin_a || 0),
                    vitamin_c: acc.vitamin_c + (food.vitamin_c || 0),
                    vitamin_d: acc.vitamin_d + (food.vitamin_d || 0),
                    calcium: acc.calcium + (food.calcium || 0),
                    iron: acc.iron + (food.iron || 0)
                }),
                {
                    calories: 0,
                    protein: 0,
                    carbs: 0,
                    fats: 0,
                    fiber: 0,
                    sugar: 0,
                    sodium: 0,
                    vitamin_a: 0,
                    vitamin_c: 0,
                    vitamin_d: 0,
                    calcium: 0,
                    iron: 0
                }
            );

            // Déterminer le meilleur Nutri-Score (le meilleur parmi les aliments)
            const nutriscores = foods.filter(f => f.nutriscore).map(f => f.nutriscore);
            const bestNutriscore =
                nutriscores.length > 0
                    ? nutriscores.sort()[0] // A < B < C < D < E
                    : null;

            // Insérer le repas groupé
            const { error } = await SupabaseManager.supabase.from('member_food_log').insert({
                member_id: this.currentMember.id,
                date: today,
                food_name: `📸 ${mealName}`,
                calories: Math.round(totals.calories),
                protein: Math.round(totals.protein * 10) / 10,
                carbs: Math.round(totals.carbs * 10) / 10,
                fats: Math.round(totals.fats * 10) / 10,
                fiber: Math.round(totals.fiber * 10) / 10,
                sugar: Math.round(totals.sugar * 10) / 10,
                sodium: Math.round(totals.sodium * 10) / 10,
                vitamin_a: Math.round(totals.vitamin_a * 10) / 10,
                vitamin_c: Math.round(totals.vitamin_c * 10) / 10,
                vitamin_d: Math.round(totals.vitamin_d * 10) / 10,
                calcium: Math.round(totals.calcium * 10) / 10,
                iron: Math.round(totals.iron * 10) / 10,
                nutriscore: bestNutriscore
            });

            if (error) {
                throw error;
            }

            console.log('✅ Repas groupé ajouté:', mealName, totals);

            // Recharger le tracker
            console.log('🔄 Rechargement du tracker...');
            await this.loadTodayTracker();
            console.log('✅ Tracker rechargé !');
        } catch (error) {
            console.error('❌ Erreur ajout repas:', error);
            throw error;
        }
    },

    /**
     * Ajouter un aliment au log (pour recherche manuelle)
     * @param food
     */
    async addFoodToLog(food) {
        const today = new Date().toISOString().split('T')[0];

        try {
            const { error } = await SupabaseManager.supabase.from('member_food_log').insert({
                member_id: this.currentMember.id,
                date: today,
                food_name: food.name,
                calories: food.calories,
                protein: food.protein,
                carbs: food.carbs,
                fats: food.fats,
                fiber: food.fiber || 0,
                vitamin_c: food.vitamin_c || 0,
                vitamin_d: food.vitamin_d || 0,
                calcium: food.calcium || 0,
                iron: food.iron || 0
            });

            if (error) {
                throw error;
            }

            Utils.showNotification('Ajouté', food.name, 'success');

            // Vider la recherche
            const searchInput = document.getElementById('foodSearch');
            const resultsDiv = document.getElementById('foodResults');
            if (searchInput) {
                searchInput.value = '';
            }
            if (resultsDiv) {
                resultsDiv.innerHTML = '';
            }

            // Recharger
            await this.loadTodayTracker();
        } catch (error) {
            console.error('❌ Erreur ajout aliment:', error);
            Utils.showNotification('Erreur', error.message, 'error');
        }
    },

    /**
     * Afficher les repas du jour (version mobile optimisée)
     * @param meals
     */
    displayTodayMeals(meals) {
        const container = document.getElementById('todayMeals');

        if (meals.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-400 py-8">
                    <div class="text-5xl mb-3">🍽️</div>
                    <p class="text-base font-medium">Aucun repas aujourd'hui</p>
                    <p class="text-sm mt-2 opacity-70">Prenez une photo pour commencer !</p>
                </div>
            `;
            return;
        }

        const html = meals
            .map(
                meal => `
            <div class="meal-card-modern">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                        <div class="text-white font-bold text-base mb-1">${meal.food_name}</div>
                        ${meal.nutriscore ? `<span class="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-${this.getNutriscoreColor(meal.nutriscore)}-500/20 text-${this.getNutriscoreColor(meal.nutriscore)}-400 border border-${this.getNutriscoreColor(meal.nutriscore)}-500/40">Nutri-Score ${meal.nutriscore}</span>` : ''}
                    </div>
                    <button onclick="NutritionPortal.deleteFoodLog('${meal.id}')"
                            class="ml-3 w-9 h-9 flex items-center justify-center rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200">
                        <i class="fas fa-trash text-sm"></i>
                    </button>
                </div>
                <div class="grid grid-cols-4 gap-2">
                    <div class="macro-box-modern macro-box-calories">
                        <div class="macro-value">${Math.round(meal.calories)}</div>
                        <div class="macro-label">kcal</div>
                    </div>
                    <div class="macro-box-modern macro-box-blue">
                        <div class="macro-value">${Math.round(meal.protein)}g</div>
                        <div class="macro-label">P</div>
                    </div>
                    <div class="macro-box-modern macro-box-yellow">
                        <div class="macro-value">${Math.round(meal.carbs)}g</div>
                        <div class="macro-label">G</div>
                    </div>
                    <div class="macro-box-modern macro-box-purple">
                        <div class="macro-value">${Math.round(meal.fats)}g</div>
                        <div class="macro-label">L</div>
                    </div>
                </div>
            </div>
        `
            )
            .join('');

        container.innerHTML = html;
    },

    /**
     * Obtenir la couleur du Nutri-Score
     * @param score
     */
    getNutriscoreColor(score) {
        const colors = {
            A: 'green',
            B: 'lime',
            C: 'yellow',
            D: 'orange',
            E: 'red'
        };
        return colors[score] || 'gray';
    },

    /**
     * Charger l'historique
     */
    async loadHistory() {
        const container = document.getElementById('historyList');

        try {
            console.log('📊 Chargement historique pour membre:', this.currentMember.id);

            const { data, error } = await SupabaseManager.supabase
                .from('member_nutrition_history')
                .select('*')
                .eq('member_id', this.currentMember.id)
                .order('date', { ascending: false })
                .limit(30); // Derniers 30 jours

            if (error) {
                console.error('❌ Erreur SQL:', error);

                // Si la table n'existe pas
                if (error.code === '42P01' || error.message.includes('does not exist')) {
                    container.innerHTML = `
                        <div class="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
                            <i class="fas fa-database text-red-400 text-5xl mb-3"></i>
                            <h3 class="text-red-400 font-bold text-lg mb-2">Table manquante</h3>
                            <p class="text-gray-300 mb-4">La table <code class="bg-black/30 px-2 py-1 rounded">member_nutrition_history</code> n'existe pas dans la base de données.</p>
                            <p class="text-gray-400 text-sm">Exécutez le script SQL : <code class="bg-black/30 px-2 py-1 rounded">sql/FIX_ALL_NUTRITION.sql</code></p>
                        </div>
                    `;
                    return;
                }

                throw error;
            }

            console.log('✅ Historique chargé:', data?.length || 0, 'journées');
            this.displayHistory(data || []);
        } catch (error) {
            console.error('❌ Erreur chargement historique:', error);

            container.innerHTML = `
                <div class="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
                    <i class="fas fa-exclamation-triangle text-red-400 text-4xl mb-3"></i>
                    <h3 class="text-red-400 font-bold mb-2">Erreur de chargement</h3>
                    <p class="text-gray-300 mb-2">${error.message}</p>
                    <p class="text-gray-400 text-sm">Vérifiez la console pour plus de détails</p>
                </div>
            `;

            Utils.showNotification('Erreur', "Impossible de charger l'historique", 'error');
        }
    },

    /**
     * Afficher l'historique
     * @param history
     */
    displayHistory(history) {
        const container = document.getElementById('historyList');

        if (history.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-400 py-12">
                    <i class="fas fa-calendar-times text-6xl mb-4"></i>
                    <p class="text-lg">Aucun historique</p>
                    <p class="text-sm mt-2">Les journées seront archivées automatiquement à minuit</p>
                </div>
            `;
            return;
        }

        const html = history
            .map(day => {
                const hasDeficiencies = day.deficiencies && day.deficiencies.length > 0;
                const borderColor = hasDeficiencies
                    ? 'border-yellow-500/30'
                    : 'border-green-500/30';
                const bgColor = hasDeficiencies ? 'bg-yellow-900/10' : 'bg-green-900/10';

                return `
                <div class="bg-gray-800 ${bgColor} p-4 rounded-lg border ${borderColor} cursor-pointer hover:bg-gray-750 transition"
                     onclick="NutritionPortal.showDayDetails('${day.date}')">
                    <div class="flex items-center justify-between mb-3">
                        <div>
                            <div class="text-white font-bold">${new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                            <div class="text-gray-400 text-xs mt-1">${day.meals_count} repas</div>
                        </div>
                        <div class="text-right">
                            <div class="text-2xl font-bold text-orange-400">${Math.round(day.total_calories)}</div>
                            <div class="text-xs text-gray-400">kcal</div>
                        </div>
                    </div>

                    <!-- Macros mini -->
                    <div class="grid grid-cols-3 gap-2 text-xs mb-3">
                        <div class="bg-blue-900/20 p-2 rounded text-center border border-blue-500/20">
                            <div class="text-blue-400 font-bold">${Math.round(day.total_protein)}g</div>
                            <div class="text-gray-400 text-[10px]">Protéines</div>
                        </div>
                        <div class="bg-yellow-900/20 p-2 rounded text-center border border-yellow-500/20">
                            <div class="text-yellow-400 font-bold">${Math.round(day.total_carbs)}g</div>
                            <div class="text-gray-400 text-[10px]">Glucides</div>
                        </div>
                        <div class="bg-purple-900/20 p-2 rounded text-center border border-purple-500/20">
                            <div class="text-purple-400 font-bold">${Math.round(day.total_fats)}g</div>
                            <div class="text-gray-400 text-[10px]">Lipides</div>
                        </div>
                    </div>

                    <!-- Carences -->
                    ${
                        hasDeficiencies
                            ? `
                        <div class="bg-yellow-900/20 p-2 rounded border border-yellow-500/30">
                            <div class="flex items-center gap-2">
                                <i class="fas fa-exclamation-triangle text-yellow-400 text-sm"></i>
                                <div class="text-yellow-400 text-xs font-semibold">Carences détectées:</div>
                            </div>
                            <div class="text-gray-300 text-xs mt-1">${day.deficiencies.join(', ')}</div>
                        </div>
                    `
                            : `
                        <div class="bg-green-900/20 p-2 rounded border border-green-500/30 text-center">
                            <i class="fas fa-check-circle text-green-400 mr-1"></i>
                            <span class="text-green-400 text-xs font-semibold">Aucune carence</span>
                        </div>
                    `
                    }
                </div>
            `;
            })
            .join('');

        container.innerHTML = html;
    },

    /**
     * Afficher les détails d'une journée
     * @param date
     */
    async showDayDetails(date) {
        try {
            const { data: day, error } = await SupabaseManager.supabase
                .from('member_nutrition_history')
                .select('*')
                .eq('member_id', this.currentMember.id)
                .eq('date', date)
                .single();

            if (error) {
                throw error;
            }

            // Créer une modale avec les détails
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4';
            modal.onclick = e => {
                if (e.target === modal) {
                    modal.remove();
                }
            };

            const mealsHtml = day.meals_data
                ? day.meals_data
                      .map(
                          meal => `
                <div class="bg-gray-700 p-3 rounded-lg mb-2">
                    <div class="text-white font-semibold text-sm mb-1">${meal.food_name}</div>
                    <div class="grid grid-cols-4 gap-2 text-xs">
                        <div class="text-center">
                            <div class="text-orange-400 font-bold">${Math.round(meal.calories)}</div>
                            <div class="text-gray-400 text-[10px]">kcal</div>
                        </div>
                        <div class="text-center">
                            <div class="text-blue-400 font-bold">${Math.round(meal.protein)}g</div>
                            <div class="text-gray-400 text-[10px]">P</div>
                        </div>
                        <div class="text-center">
                            <div class="text-yellow-400 font-bold">${Math.round(meal.carbs)}g</div>
                            <div class="text-gray-400 text-[10px]">G</div>
                        </div>
                        <div class="text-center">
                            <div class="text-purple-400 font-bold">${Math.round(meal.fats)}g</div>
                            <div class="text-gray-400 text-[10px]">L</div>
                        </div>
                    </div>
                </div>
            `
                      )
                      .join('')
                : '<p class="text-gray-400 text-sm">Aucun détail disponible</p>';

            modal.innerHTML = `
                <div class="bg-gray-800 rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold text-white">
                            ${new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </h3>
                        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    <div class="mb-4">
                        <div class="text-center bg-orange-900/20 p-4 rounded-lg border border-orange-500/30 mb-3">
                            <div class="text-3xl font-bold text-orange-400">${Math.round(day.total_calories)}</div>
                            <div class="text-gray-400 text-sm">calories totales</div>
                        </div>

                        <div class="grid grid-cols-3 gap-2 mb-4">
                            <div class="bg-blue-900/20 p-3 rounded text-center border border-blue-500/20">
                                <div class="text-blue-400 font-bold text-lg">${Math.round(day.total_protein)}g</div>
                                <div class="text-gray-400 text-xs">Protéines</div>
                            </div>
                            <div class="bg-yellow-900/20 p-3 rounded text-center border border-yellow-500/20">
                                <div class="text-yellow-400 font-bold text-lg">${Math.round(day.total_carbs)}g</div>
                                <div class="text-gray-400 text-xs">Glucides</div>
                            </div>
                            <div class="bg-purple-900/20 p-3 rounded text-center border border-purple-500/20">
                                <div class="text-purple-400 font-bold text-lg">${Math.round(day.total_fats)}g</div>
                                <div class="text-gray-400 text-xs">Lipides</div>
                            </div>
                        </div>
                    </div>

                    <h4 class="text-green-400 font-bold mb-3">
                        <i class="fas fa-list mr-2"></i>
                        Repas (${day.meals_count})
                    </h4>
                    <div class="space-y-2 mb-4">
                        ${mealsHtml}
                    </div>

                    ${
                        day.deficiencies && day.deficiencies.length > 0
                            ? `
                        <div class="bg-yellow-900/20 p-3 rounded border border-yellow-500/30">
                            <div class="flex items-center gap-2 mb-2">
                                <i class="fas fa-exclamation-triangle text-yellow-400"></i>
                                <div class="text-yellow-400 font-semibold">Carences nutritionnelles</div>
                            </div>
                            <div class="text-gray-300 text-sm">${day.deficiencies.join(', ')}</div>
                        </div>
                    `
                            : ''
                    }
                </div>
            `;

            document.body.appendChild(modal);
        } catch (error) {
            console.error('❌ Erreur chargement détails:', error);
            Utils.showNotification('Erreur', error.message, 'error');
        }
    },

    /**
     * Mettre à jour le résumé quotidien avec analyse de santé
     * @param meals
     */
    async updateDailySummary(meals) {
        // Calcul des totaux
        const totals = meals.reduce(
            (acc, meal) => ({
                calories: acc.calories + (meal.calories || 0),
                protein: acc.protein + (meal.protein || 0),
                carbs: acc.carbs + (meal.carbs || 0),
                fats: acc.fats + (meal.fats || 0),
                fiber: acc.fiber + (meal.fiber || 0),
                sugar: acc.sugar + (meal.sugar || 0),
                sodium: acc.sodium + (meal.sodium || 0),
                vitamin_a: acc.vitamin_a + (meal.vitamin_a || 0),
                vitamin_c: acc.vitamin_c + (meal.vitamin_c || 0),
                vitamin_d: acc.vitamin_d + (meal.vitamin_d || 0),
                calcium: acc.calcium + (meal.calcium || 0),
                iron: acc.iron + (meal.iron || 0)
            }),
            {
                calories: 0,
                protein: 0,
                carbs: 0,
                fats: 0,
                fiber: 0,
                sugar: 0,
                sodium: 0,
                vitamin_a: 0,
                vitamin_c: 0,
                vitamin_d: 0,
                calcium: 0,
                iron: 0
            }
        );

        // Analyse de santé
        const healthAnalysis = this.analyzeHealth(totals, meals);

        const html = `
            <div class="stat-card">
                <div class="stat-icon bg-red-900/30">
                    <i class="fas fa-fire text-red-400"></i>
                </div>
                <div>
                    <div class="stat-value">${Math.round(totals.calories)}</div>
                    <div class="stat-label">Calories</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon bg-blue-900/30">
                    <i class="fas fa-drumstick-bite text-blue-400"></i>
                </div>
                <div>
                    <div class="stat-value">${Math.round(totals.protein)}g</div>
                    <div class="stat-label">Protéines</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon bg-yellow-900/30">
                    <i class="fas fa-bread-slice text-yellow-400"></i>
                </div>
                <div>
                    <div class="stat-value">${Math.round(totals.carbs)}g</div>
                    <div class="stat-label">Glucides</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon bg-purple-900/30">
                    <i class="fas fa-cheese text-purple-400"></i>
                </div>
                <div>
                    <div class="stat-value">${Math.round(totals.fats)}g</div>
                    <div class="stat-label">Lipides</div>
                </div>
            </div>
        `;

        document.getElementById('dailySummary').innerHTML = html;

        // Afficher l'analyse de santé si il y a des repas
        if (meals.length > 0) {
            this.displayHealthAnalysis(healthAnalysis, totals);
        }
    },

    /**
     * Analyser la qualité nutritionnelle de la journée
     * @param totals
     * @param meals
     */
    analyzeHealth(totals, meals) {
        const warnings = [];
        const good = [];
        const deficiencies = [];
        const dangerousAdditives = [];

        // Recommandations journalières (valeurs moyennes)
        const dailyRecommendations = {
            protein: 60, // g (minimum)
            fiber: 25, // g
            vitamin_c: 80, // mg
            vitamin_d: 15, // µg
            calcium: 1000, // mg
            iron: 14, // mg (femme)
            sodium: 2000, // mg (maximum)
            sugar: 50 // g (maximum)
        };

        // Vérifier les carences
        if (totals.protein < dailyRecommendations.protein) {
            deficiencies.push({
                type: 'Protéines',
                value: Math.round(totals.protein),
                recommended: dailyRecommendations.protein,
                icon: '🥩',
                severity: 'medium'
            });
        } else {
            good.push('Apport en protéines suffisant ✓');
        }

        if (totals.fiber < dailyRecommendations.fiber) {
            deficiencies.push({
                type: 'Fibres',
                value: Math.round(totals.fiber),
                recommended: dailyRecommendations.fiber,
                icon: '🥬',
                severity: 'low'
            });
        }

        if (totals.vitamin_c < dailyRecommendations.vitamin_c) {
            deficiencies.push({
                type: 'Vitamine C',
                value: Math.round(totals.vitamin_c),
                recommended: dailyRecommendations.vitamin_c,
                icon: '🍊',
                severity: 'medium'
            });
        }

        if (totals.vitamin_d < dailyRecommendations.vitamin_d) {
            deficiencies.push({
                type: 'Vitamine D',
                value: Math.round(totals.vitamin_d),
                recommended: dailyRecommendations.vitamin_d,
                icon: '☀️',
                severity: 'high'
            });
        }

        if (totals.calcium < dailyRecommendations.calcium) {
            deficiencies.push({
                type: 'Calcium',
                value: Math.round(totals.calcium),
                recommended: dailyRecommendations.calcium,
                icon: '🥛',
                severity: 'medium'
            });
        }

        if (totals.iron < dailyRecommendations.iron) {
            deficiencies.push({
                type: 'Fer',
                value: Math.round(totals.iron),
                recommended: dailyRecommendations.iron,
                icon: '🥩',
                severity: 'medium'
            });
        }

        // Vérifier les excès
        if (totals.sodium > dailyRecommendations.sodium) {
            warnings.push({
                type: 'Sodium élevé',
                message: `${Math.round(totals.sodium)}mg (max recommandé: ${dailyRecommendations.sodium}mg)`,
                icon: '🧂',
                severity: 'high'
            });
        }

        if (totals.sugar > dailyRecommendations.sugar) {
            warnings.push({
                type: 'Sucre élevé',
                message: `${Math.round(totals.sugar)}g (max recommandé: ${dailyRecommendations.sugar}g)`,
                icon: '🍬',
                severity: 'medium'
            });
        }

        // Collecter les additifs dangereux
        const dangerousAdditiveCodes = [
            'en:e102',
            'en:e110',
            'en:e120',
            'en:e122',
            'en:e124', // Colorants
            'en:e211',
            'en:e220',
            'en:e250',
            'en:e251', // Conservateurs
            'en:e621',
            'en:e950',
            'en:e951',
            'en:e952' // Exhausteurs/édulcorants
        ];

        meals.forEach(meal => {
            if (meal.additives && meal.additives.length > 0) {
                meal.additives.forEach(additive => {
                    if (dangerousAdditiveCodes.includes(additive)) {
                        const additiveName = this.getAdditiveName(additive);
                        if (!dangerousAdditives.find(a => a.code === additive)) {
                            dangerousAdditives.push({
                                code: additive,
                                name: additiveName,
                                source: meal.food_name,
                                severity: 'high'
                            });
                        }
                    }
                });
            }
        });

        return { warnings, good, deficiencies, dangerousAdditives };
    },

    /**
     * Obtenir le nom d'un additif
     * @param code
     */
    getAdditiveName(code) {
        const names = {
            'en:e102': 'E102 - Tartrazine (colorant jaune)',
            'en:e110': 'E110 - Jaune orangé S',
            'en:e120': 'E120 - Cochenille (colorant rouge)',
            'en:e122': 'E122 - Azorubine',
            'en:e124': 'E124 - Ponceau 4R',
            'en:e211': 'E211 - Benzoate de sodium',
            'en:e220': 'E220 - Dioxyde de soufre',
            'en:e250': 'E250 - Nitrite de sodium',
            'en:e251': 'E251 - Nitrate de sodium',
            'en:e621': 'E621 - Glutamate monosodique (MSG)',
            'en:e950': 'E950 - Acésulfame K',
            'en:e951': 'E951 - Aspartame',
            'en:e952': 'E952 - Cyclamate'
        };
        return names[code] || code;
    },

    /**
     * Afficher l'analyse de santé
     * @param analysis
     * @param totals
     */
    displayHealthAnalysis(analysis, totals) {
        const container = document.getElementById('todayMeals');

        let healthHtml = '';

        // Score global de la journée
        const score = this.calculateDayScore(analysis, totals);
        const scoreColor =
            score >= 80 ? 'green' : score >= 60 ? 'yellow' : score >= 40 ? 'orange' : 'red';

        healthHtml += `
            <div class="bg-gradient-to-r from-${scoreColor}-900/30 to-${scoreColor}-800/20 p-4 rounded-lg mb-4 border border-${scoreColor}-500/30">
                <div class="flex items-center justify-between">
                    <div>
                        <h4 class="text-${scoreColor}-400 font-bold text-lg">Score nutritionnel du jour</h4>
                        <p class="text-gray-400 text-sm">Évaluation globale de votre journée</p>
                    </div>
                    <div class="text-4xl font-bold text-${scoreColor}-400">${score}%</div>
                </div>
            </div>
        `;

        // Carences détectées
        if (analysis.deficiencies.length > 0) {
            healthHtml += `
                <div class="bg-yellow-900/20 p-4 rounded-lg mb-4 border border-yellow-500/30">
                    <h4 class="text-yellow-400 font-bold mb-3 flex items-center">
                        <i class="fas fa-exclamation-triangle mr-2"></i>
                        Carences potentielles
                    </h4>
                    <div class="space-y-2">
                        ${analysis.deficiencies
                            .map(
                                def => `
                            <div class="flex items-center justify-between text-sm">
                                <span class="text-gray-300">
                                    ${def.icon} ${def.type}
                                </span>
                                <span class="text-yellow-400">
                                    ${def.value} / ${def.recommended} ${def.type.includes('Vitamine') ? 'mg' : 'g'}
                                </span>
                            </div>
                        `
                            )
                            .join('')}
                    </div>
                    <p class="text-xs text-gray-400 mt-3">
                        💡 Pensez à ajouter des aliments riches en ces nutriments
                    </p>
                </div>
            `;
        }

        // Alertes (excès)
        if (analysis.warnings.length > 0) {
            healthHtml += `
                <div class="bg-red-900/20 p-4 rounded-lg mb-4 border border-red-500/30">
                    <h4 class="text-red-400 font-bold mb-3 flex items-center">
                        <i class="fas fa-times-circle mr-2"></i>
                        Alertes santé
                    </h4>
                    <div class="space-y-2">
                        ${analysis.warnings
                            .map(
                                warn => `
                            <div class="flex items-center text-sm">
                                <span class="text-gray-300">
                                    ${warn.icon} ${warn.type}: ${warn.message}
                                </span>
                            </div>
                        `
                            )
                            .join('')}
                    </div>
                </div>
            `;
        }

        // Additifs dangereux
        if (analysis.dangerousAdditives.length > 0) {
            healthHtml += `
                <div class="bg-orange-900/20 p-4 rounded-lg mb-4 border border-orange-500/30">
                    <h4 class="text-orange-400 font-bold mb-3 flex items-center">
                        <i class="fas fa-flask mr-2"></i>
                        ⚠️ Additifs à surveiller
                    </h4>
                    <div class="space-y-2">
                        ${analysis.dangerousAdditives
                            .map(
                                add => `
                            <div class="text-sm">
                                <div class="text-orange-300 font-semibold">${add.name}</div>
                                <div class="text-gray-400 text-xs">Trouvé dans: ${add.source}</div>
                            </div>
                        `
                            )
                            .join('')}
                    </div>
                    <p class="text-xs text-gray-400 mt-3">
                        ℹ️ Ces additifs peuvent être controversés selon certaines études
                    </p>
                </div>
            `;
        }

        // Points positifs
        if (analysis.good.length > 0) {
            healthHtml += `
                <div class="bg-green-900/20 p-4 rounded-lg mb-4 border border-green-500/30">
                    <h4 class="text-green-400 font-bold mb-3 flex items-center">
                        <i class="fas fa-check-circle mr-2"></i>
                        Points positifs
                    </h4>
                    <div class="space-y-1">
                        ${analysis.good
                            .map(
                                g => `
                            <div class="text-sm text-gray-300">${g}</div>
                        `
                            )
                            .join('')}
                    </div>
                </div>
            `;
        }

        // Insérer avant la liste des repas
        container.insertAdjacentHTML('beforebegin', healthHtml);
    },

    /**
     * Calculer un score global de la journée (0-100)
     * @param analysis
     * @param totals
     */
    calculateDayScore(analysis, totals) {
        let score = 100;

        // Pénalités pour carences (- 5 points par carence)
        score -= analysis.deficiencies.length * 5;

        // Pénalités pour excès (- 10 points par excès)
        score -= analysis.warnings.length * 10;

        // Pénalités pour additifs dangereux (- 15 points par additif)
        score -= analysis.dangerousAdditives.length * 15;

        // Bonus pour apports corrects (+ 5 points par bon point)
        score += analysis.good.length * 5;

        return Math.max(0, Math.min(100, score));
    },

    /**
     * Supprimer un aliment du log
     * @param logId
     */
    async deleteFoodLog(logId) {
        try {
            const { error } = await SupabaseManager.supabase
                .from('member_food_log')
                .delete()
                .eq('id', logId);

            if (error) {
                throw error;
            }

            Utils.showNotification('Succès', 'Aliment supprimé', 'success');
            await this.loadTodayTracker();
        } catch (error) {
            console.error('❌ Erreur suppression:', error);
            Utils.showNotification('Erreur', error.message, 'error');
        }
    }
};

// Exposer globalement
window.NutritionPortal = NutritionPortal;
