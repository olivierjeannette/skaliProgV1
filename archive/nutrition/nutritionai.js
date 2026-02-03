/**
 * Nutrition AI Module
 * Suivi nutritionnel intelligent avec IA pour analyse et recommandations
 */

const NutritionAI = {
    currentMember: null,
    mealHistory: [],
    aiAnalysis: null,

    /**
     * Afficher la vue principale du module nutrition
     */
    async showNutritionView() {
        try {
            console.log('🍎 Ouverture module Nutrition AI...');

            const html = `
                <div class="nutrition-ai-container fade-in">
                    <!-- Header -->
                    <div class="content-header">
                        <div>
                            <h2 class="text-3xl font-bold text-skali-dark mb-2">
                                <i class="fas fa-brain text-skali-accent mr-3"></i>
                                Nutrition AI
                            </h2>
                            <p class="text-gray-600">
                                Suivi nutritionnel intelligent et personnalisé
                            </p>
                        </div>
                        <button onclick="NutritionAI.showSettings()" class="btn-premium">
                            <i class="fas fa-cog mr-2"></i>
                            Paramètres
                        </button>
                    </div>

                    <!-- Sélection adhérent -->
                    <div class="member-selector-card">
                        <h3><i class="fas fa-user-circle mr-2"></i>Sélectionner un adhérent</h3>
                        <div class="search-bar-container">
                            <input type="text"
                                   id="nutritionMemberSearch"
                                   placeholder="Rechercher un adhérent..."
                                   oninput="NutritionAI.searchMember()"
                                   class="search-input">
                            <div id="nutritionMemberResults" class="search-results"></div>
                        </div>
                    </div>

                    <!-- Dashboard nutrition (visible après sélection) -->
                    <div id="nutritionDashboard" class="hidden">
                        <!-- En-tête membre sélectionné -->
                        <div class="selected-member-header">
                            <div class="member-info">
                                <h3 id="selectedMemberName"></h3>
                                <span id="selectedMemberGoal" class="badge"></span>
                            </div>
                            <button onclick="NutritionAI.changeMember()" class="btn-secondary">
                                <i class="fas fa-exchange-alt mr-2"></i>
                                Changer
                            </button>
                        </div>

                        <!-- Stats du jour -->
                        <div class="nutrition-stats-grid">
                            <div class="stat-card">
                                <div class="stat-icon calories">
                                    <i class="fas fa-fire"></i>
                                </div>
                                <div class="stat-content">
                                    <span class="stat-label">Calories</span>
                                    <span class="stat-value" id="caloriesValue">0</span>
                                    <span class="stat-target">/ <span id="caloriesTarget">2000</span> kcal</span>
                                </div>
                            </div>

                            <div class="stat-card">
                                <div class="stat-icon proteins">
                                    <i class="fas fa-drumstick-bite"></i>
                                </div>
                                <div class="stat-content">
                                    <span class="stat-label">Protéines</span>
                                    <span class="stat-value" id="proteinsValue">0</span>
                                    <span class="stat-target">/ <span id="proteinsTarget">150</span> g</span>
                                </div>
                            </div>

                            <div class="stat-card">
                                <div class="stat-icon carbs">
                                    <i class="fas fa-bread-slice"></i>
                                </div>
                                <div class="stat-content">
                                    <span class="stat-label">Glucides</span>
                                    <span class="stat-value" id="carbsValue">0</span>
                                    <span class="stat-target">/ <span id="carbsTarget">250</span> g</span>
                                </div>
                            </div>

                            <div class="stat-card">
                                <div class="stat-icon fats">
                                    <i class="fas fa-cheese"></i>
                                </div>
                                <div class="stat-content">
                                    <span class="stat-label">Lipides</span>
                                    <span class="stat-value" id="fatsValue">0</span>
                                    <span class="stat-target">/ <span id="fatsTarget">70</span> g</span>
                                </div>
                            </div>
                        </div>

                        <!-- Actions rapides -->
                        <div class="quick-actions">
                            <button onclick="NutritionAI.addMeal()" class="action-btn add-meal">
                                <i class="fas fa-plus-circle"></i>
                                <span>Ajouter un repas</span>
                            </button>
                            <button onclick="NutritionAI.scanFood()" class="action-btn scan-food">
                                <i class="fas fa-camera"></i>
                                <span>Scanner un aliment</span>
                            </button>
                            <button onclick="NutritionAI.analyzeWithAI()" class="action-btn ai-analyze">
                                <i class="fas fa-brain"></i>
                                <span>Analyse IA</span>
                            </button>
                        </div>

                        <!-- Historique des repas -->
                        <div class="meals-history-card">
                            <h3><i class="fas fa-history mr-2"></i>Repas d'aujourd'hui</h3>
                            <div id="mealsList" class="meals-list">
                                <div class="no-data">
                                    <i class="fas fa-utensils text-4xl mb-2"></i>
                                    <p>Aucun repas enregistré aujourd'hui</p>
                                </div>
                            </div>
                        </div>

                        <!-- Recommandations IA -->
                        <div id="aiRecommendations" class="ai-recommendations-card hidden">
                            <h3><i class="fas fa-robot mr-2"></i>Recommandations IA</h3>
                            <div id="aiRecommendationsContent"></div>
                        </div>
                    </div>

                    <style>
                        .nutrition-ai-container {
                            padding: 2rem;
                            max-width: 1400px;
                            margin: 0 auto;
                        }

                        .member-selector-card {
                            background: white;
                            border-radius: 12px;
                            padding: 2rem;
                            margin-bottom: 2rem;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        }

                        .member-selector-card h3 {
                            font-size: 1.2rem;
                            font-weight: 600;
                            margin-bottom: 1rem;
                            color: #1e293b;
                        }

                        .search-bar-container {
                            position: relative;
                        }

                        .search-input {
                            width: 100%;
                            padding: 0.75rem 1rem;
                            border: 2px solid #e2e8f0;
                            border-radius: 8px;
                            font-size: 1rem;
                        }

                        .search-input:focus {
                            outline: none;
                            border-color: #3e8e41;
                        }

                        .search-results {
                            position: absolute;
                            top: 100%;
                            left: 0;
                            right: 0;
                            background: white;
                            border: 2px solid #e2e8f0;
                            border-top: none;
                            border-radius: 0 0 8px 8px;
                            max-height: 300px;
                            overflow-y: auto;
                            z-index: 10;
                            display: none;
                        }

                        .search-results.active {
                            display: block;
                        }

                        .search-result-item {
                            padding: 0.75rem 1rem;
                            cursor: pointer;
                            transition: background 0.2s;
                        }

                        .search-result-item:hover {
                            background: #f1f5f9;
                        }

                        .selected-member-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            background: linear-gradient(135deg, #3e8e41, #2d6a30);
                            color: white;
                            padding: 1.5rem;
                            border-radius: 12px;
                            margin-bottom: 2rem;
                        }

                        .member-info h3 {
                            font-size: 1.5rem;
                            margin-bottom: 0.5rem;
                        }

                        .nutrition-stats-grid {
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                            gap: 1.5rem;
                            margin-bottom: 2rem;
                        }

                        .stat-card {
                            background: white;
                            border-radius: 12px;
                            padding: 1.5rem;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                            display: flex;
                            gap: 1rem;
                            align-items: center;
                        }

                        .stat-icon {
                            width: 60px;
                            height: 60px;
                            border-radius: 12px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 1.5rem;
                            color: white;
                        }

                        .stat-icon.calories { background: linear-gradient(135deg, #ef4444, #dc2626); }
                        .stat-icon.proteins { background: linear-gradient(135deg, #3b82f6, #2563eb); }
                        .stat-icon.carbs { background: linear-gradient(135deg, #f59e0b, #d97706); }
                        .stat-icon.fats { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }

                        .stat-content {
                            flex: 1;
                            display: flex;
                            flex-direction: column;
                        }

                        .stat-label {
                            font-size: 0.875rem;
                            color: #64748b;
                            margin-bottom: 0.25rem;
                        }

                        .stat-value {
                            font-size: 2rem;
                            font-weight: 700;
                            color: #1e293b;
                        }

                        .stat-target {
                            font-size: 0.875rem;
                            color: #64748b;
                        }

                        .quick-actions {
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                            gap: 1rem;
                            margin-bottom: 2rem;
                        }

                        .action-btn {
                            background: white;
                            border: 2px solid #e2e8f0;
                            border-radius: 12px;
                            padding: 1.5rem;
                            cursor: pointer;
                            transition: all 0.3s;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            gap: 0.75rem;
                        }

                        .action-btn i {
                            font-size: 2rem;
                        }

                        .action-btn.add-meal { color: #10b981; }
                        .action-btn.add-meal:hover { border-color: #10b981; background: #ecfdf5; }

                        .action-btn.scan-food { color: #f59e0b; }
                        .action-btn.scan-food:hover { border-color: #f59e0b; background: #fffbeb; }

                        .action-btn.ai-analyze { color: #8b5cf6; }
                        .action-btn.ai-analyze:hover { border-color: #8b5cf6; background: #f5f3ff; }

                        .meals-history-card,
                        .ai-recommendations-card {
                            background: white;
                            border-radius: 12px;
                            padding: 2rem;
                            margin-bottom: 2rem;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        }

                        .meals-history-card h3,
                        .ai-recommendations-card h3 {
                            font-size: 1.2rem;
                            font-weight: 600;
                            margin-bottom: 1.5rem;
                            color: #1e293b;
                        }

                        .no-data {
                            text-align: center;
                            padding: 3rem;
                            color: #94a3b8;
                        }

                        /* Barres de progression */
                        .progress-bar-container {
                            width: 100%;
                            margin-top: 0.75rem;
                        }

                        .progress-bar {
                            width: 100%;
                            height: 8px;
                            background: #e2e8f0;
                            border-radius: 4px;
                            overflow: hidden;
                        }

                        .progress-fill {
                            height: 100%;
                            transition: width 0.3s ease;
                            border-radius: 4px;
                        }

                        /* Repas dans la liste */
                        .meal-item {
                            background: #f8fafc;
                            border-radius: 8px;
                            padding: 1rem;
                            margin-bottom: 1rem;
                            border: 1px solid #e2e8f0;
                            transition: all 0.2s;
                        }

                        .meal-item:hover {
                            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                            border-color: #cbd5e1;
                        }

                        .meal-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 0.75rem;
                        }

                        .meal-type {
                            display: flex;
                            align-items: center;
                            gap: 0.5rem;
                            font-weight: 600;
                            color: #1e293b;
                        }

                        .meal-time {
                            color: #64748b;
                            font-size: 0.875rem;
                        }

                        .meal-macros {
                            display: flex;
                            flex-wrap: wrap;
                            gap: 0.5rem;
                            margin-bottom: 0.75rem;
                        }

                        .macro-badge {
                            display: inline-flex;
                            align-items: center;
                            gap: 0.25rem;
                            padding: 0.25rem 0.75rem;
                            border-radius: 6px;
                            font-size: 0.875rem;
                            font-weight: 500;
                        }

                        .macro-badge.calories {
                            background: #fee2e2;
                            color: #dc2626;
                        }

                        .macro-badge.proteins {
                            background: #dbeafe;
                            color: #2563eb;
                        }

                        .macro-badge.carbs {
                            background: #fef3c7;
                            color: #d97706;
                        }

                        .macro-badge.fats {
                            background: #ede9fe;
                            color: #7c3aed;
                        }

                        .meal-foods {
                            display: flex;
                            flex-wrap: wrap;
                            gap: 0.5rem;
                            margin-bottom: 0.5rem;
                        }

                        .food-tag {
                            background: white;
                            border: 1px solid #e2e8f0;
                            padding: 0.25rem 0.5rem;
                            border-radius: 4px;
                            font-size: 0.875rem;
                            color: #64748b;
                        }

                        .meal-notes {
                            font-size: 0.875rem;
                            color: #64748b;
                            font-style: italic;
                            margin-bottom: 0.5rem;
                        }

                        .meal-actions {
                            display: flex;
                            gap: 0.5rem;
                            justify-content: flex-end;
                        }

                        .btn-icon {
                            background: none;
                            border: none;
                            padding: 0.5rem;
                            cursor: pointer;
                            color: #64748b;
                            transition: color 0.2s;
                        }

                        .btn-icon:hover {
                            color: #3e8e41;
                        }

                        .btn-icon.delete:hover {
                            color: #ef4444;
                        }

                        /* Modales */
                        .modal-overlay {
                            position: fixed;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background: rgba(0, 0, 0, 0.5);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            z-index: 1000;
                            animation: fadeIn 0.2s;
                        }

                        @keyframes fadeIn {
                            from { opacity: 0; }
                            to { opacity: 1; }
                        }

                        .modal-container {
                            background: white;
                            border-radius: 12px;
                            max-width: 600px;
                            width: 90%;
                            max-height: 90vh;
                            overflow-y: auto;
                            animation: slideUp 0.3s;
                        }

                        @keyframes slideUp {
                            from {
                                transform: translateY(20px);
                                opacity: 0;
                            }
                            to {
                                transform: translateY(0);
                                opacity: 1;
                            }
                        }

                        .modal-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            padding: 1.5rem;
                            border-bottom: 1px solid #e2e8f0;
                        }

                        .modal-header h3 {
                            font-size: 1.25rem;
                            font-weight: 600;
                            color: #1e293b;
                            margin: 0;
                        }

                        .btn-close {
                            background: none;
                            border: none;
                            font-size: 1.5rem;
                            color: #64748b;
                            cursor: pointer;
                            transition: color 0.2s;
                        }

                        .btn-close:hover {
                            color: #1e293b;
                        }

                        .modal-body {
                            padding: 1.5rem;
                        }

                        .form-group {
                            margin-bottom: 1rem;
                        }

                        .form-group label {
                            display: block;
                            margin-bottom: 0.5rem;
                            font-weight: 500;
                            color: #1e293b;
                        }

                        .form-group input,
                        .form-group select,
                        .form-group textarea {
                            width: 100%;
                            padding: 0.75rem;
                            border: 2px solid #e2e8f0;
                            border-radius: 8px;
                            font-size: 1rem;
                            transition: border-color 0.2s;
                        }

                        .form-group input:focus,
                        .form-group select:focus,
                        .form-group textarea:focus {
                            outline: none;
                            border-color: #3e8e41;
                        }

                        .macros-grid {
                            display: grid;
                            grid-template-columns: repeat(3, 1fr);
                            gap: 1rem;
                        }

                        .food-item {
                            display: grid;
                            grid-template-columns: 2fr 1fr 1fr auto;
                            gap: 0.5rem;
                            margin-bottom: 0.5rem;
                            align-items: center;
                        }

                        .food-item input,
                        .food-item select {
                            padding: 0.5rem;
                            border: 2px solid #e2e8f0;
                            border-radius: 6px;
                        }

                        .modal-actions {
                            display: flex;
                            gap: 1rem;
                            justify-content: flex-end;
                            margin-top: 1.5rem;
                        }

                        .btn-primary,
                        .btn-secondary {
                            padding: 0.75rem 1.5rem;
                            border-radius: 8px;
                            font-weight: 500;
                            cursor: pointer;
                            transition: all 0.2s;
                            border: none;
                        }

                        .btn-primary {
                            background: linear-gradient(135deg, #3e8e41, #2d6a30);
                            color: white;
                        }

                        .btn-primary:hover {
                            transform: translateY(-1px);
                            box-shadow: 0 4px 12px rgba(62, 142, 65, 0.3);
                        }

                        .btn-secondary {
                            background: #f1f5f9;
                            color: #1e293b;
                        }

                        .btn-secondary:hover {
                            background: #e2e8f0;
                        }

                        /* Scan modal */
                        .scan-modal .modal-container {
                            max-width: 500px;
                        }

                        .camera-placeholder {
                            text-align: center;
                            padding: 3rem 1rem;
                            background: #f8fafc;
                            border-radius: 8px;
                            margin-bottom: 1rem;
                        }

                        .scan-results {
                            margin-top: 1rem;
                        }

                        .scan-result-card {
                            background: white;
                            padding: 1.5rem;
                            border-radius: 8px;
                            border: 2px solid #10b981;
                            text-align: center;
                        }

                        .scan-success {
                            margin-bottom: 1rem;
                        }

                        .scan-success h4 {
                            color: #10b981;
                            margin-top: 0.5rem;
                        }

                        .detected-food h5 {
                            font-size: 1.25rem;
                            margin-bottom: 0.25rem;
                            color: #1e293b;
                        }

                        .detected-macros {
                            display: flex;
                            justify-content: center;
                            flex-wrap: wrap;
                            gap: 0.5rem;
                            margin: 1rem 0;
                        }

                        .confidence-score {
                            padding: 0.5rem 1rem;
                            background: #f0fdf4;
                            border-radius: 6px;
                            display: inline-block;
                            color: #10b981;
                            font-weight: 500;
                        }

                        .loading {
                            text-align: center;
                            padding: 2rem;
                            color: #64748b;
                        }

                        /* Recommandations IA */
                        .ai-score {
                            text-align: center;
                            margin-bottom: 2rem;
                        }

                        .score-circle {
                            width: 120px;
                            height: 120px;
                            border-radius: 50%;
                            border: 8px solid;
                            display: inline-flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            margin-bottom: 1rem;
                        }

                        .score-value {
                            font-size: 2.5rem;
                            font-weight: 700;
                        }

                        .score-label {
                            font-size: 0.875rem;
                            color: #64748b;
                        }

                        .score-text {
                            font-size: 1.125rem;
                            font-weight: 500;
                            color: #1e293b;
                        }

                        .recommendations-list {
                            margin-bottom: 2rem;
                        }

                        .recommendation-item {
                            display: flex;
                            gap: 1rem;
                            padding: 1rem;
                            border-radius: 8px;
                            margin-bottom: 0.75rem;
                            align-items: flex-start;
                        }

                        .recommendation-item i {
                            font-size: 1.25rem;
                            margin-top: 0.125rem;
                        }

                        .recommendation-item p {
                            margin: 0;
                            flex: 1;
                        }

                        .recommendation-item.success {
                            background: #f0fdf4;
                            color: #166534;
                        }

                        .recommendation-item.success i {
                            color: #10b981;
                        }

                        .recommendation-item.warning {
                            background: #fef3c7;
                            color: #92400e;
                        }

                        .recommendation-item.warning i {
                            color: #f59e0b;
                        }

                        .recommendation-item.info {
                            background: #dbeafe;
                            color: #1e3a8a;
                        }

                        .recommendation-item.info i {
                            color: #3b82f6;
                        }

                        .recommendation-item.tip {
                            background: #ede9fe;
                            color: #5b21b6;
                        }

                        .recommendation-item.tip i {
                            color: #8b5cf6;
                        }

                        .ai-summary h4 {
                            font-size: 1.125rem;
                            font-weight: 600;
                            margin-bottom: 1rem;
                            color: #1e293b;
                        }

                        .summary-grid {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 1rem;
                        }

                        .summary-item {
                            background: #f8fafc;
                            padding: 1rem;
                            border-radius: 8px;
                            display: flex;
                            flex-direction: column;
                            gap: 0.5rem;
                        }

                        .summary-item .label {
                            font-size: 0.875rem;
                            color: #64748b;
                            font-weight: 500;
                        }

                        .summary-item .value {
                            font-size: 1rem;
                            font-weight: 600;
                            color: #1e293b;
                        }

                        .summary-item .value.over {
                            color: #ef4444;
                        }

                        .summary-item .value.under {
                            color: #3b82f6;
                        }

                        /* Styles utilitaires */
                        .hidden {
                            display: none !important;
                        }

                        .text-sm {
                            font-size: 0.875rem;
                        }

                        .text-gray-500 {
                            color: #64748b;
                        }

                        .text-gray-600 {
                            color: #4b5563;
                        }

                        .text-green-500 {
                            color: #10b981;
                        }

                        .text-4xl {
                            font-size: 2.25rem;
                        }

                        .text-6xl {
                            font-size: 4rem;
                        }

                        .mb-2 {
                            margin-bottom: 0.5rem;
                        }

                        .mb-3 {
                            margin-bottom: 0.75rem;
                        }

                        .mb-4 {
                            margin-bottom: 1rem;
                        }

                        .mt-3 {
                            margin-top: 0.75rem;
                        }

                        .mt-4 {
                            margin-top: 1rem;
                        }

                        .mr-2 {
                            margin-right: 0.5rem;
                        }

                        /* Settings modal */
                        .settings-section {
                            margin-bottom: 1.5rem;
                        }

                        .settings-section h4 {
                            font-size: 1.125rem;
                            font-weight: 600;
                            margin-bottom: 0.5rem;
                            color: #1e293b;
                        }

                        /* Responsive */
                        @media (max-width: 768px) {
                            .macros-grid {
                                grid-template-columns: 1fr;
                            }

                            .summary-grid {
                                grid-template-columns: 1fr;
                            }

                            .food-item {
                                grid-template-columns: 1fr;
                            }

                            .modal-container {
                                width: 95%;
                                max-height: 95vh;
                            }
                        }
                    </style>
                </div>
            `;

            const mainContent = document.getElementById('mainContent');
            if (mainContent) {
                mainContent.innerHTML = html;
            }

            // Activer le bouton de navigation
            document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
            const nutritionBtn = document.getElementById('nutritionBtn');
            if (nutritionBtn) {nutritionBtn.classList.add('active');}

        } catch (error) {
            console.error('❌ Erreur affichage Nutrition AI:', error);
            Utils.showNotification('Erreur lors du chargement du module Nutrition', 'error');
        }
    },

    /**
     * Rechercher un adhérent
     */
    async searchMember() {
        const input = document.getElementById('nutritionMemberSearch');
        const results = document.getElementById('nutritionMemberResults');

        if (!input || !results) {return;}

        const search = input.value.toLowerCase().trim();

        if (search.length < 2) {
            results.classList.remove('active');
            return;
        }

        try {
            const members = await SupabaseManager.getMembers();
            const filtered = members.filter(m =>
                `${m.firstName} ${m.lastName}`.toLowerCase().includes(search)
            );

            if (filtered.length === 0) {
                results.innerHTML = '<div class="search-result-item">Aucun résultat</div>';
            } else {
                results.innerHTML = filtered.map(m => `
                    <div class="search-result-item" onclick="NutritionAI.selectMember('${m.id}')">
                        <strong>${m.firstName} ${m.lastName}</strong>
                        ${m.age ? `<span class="text-gray-500 text-sm ml-2">${m.age} ans</span>` : ''}
                    </div>
                `).join('');
            }

            results.classList.add('active');
        } catch (error) {
            console.error('❌ Erreur recherche membre:', error);
        }
    },

    /**
     * Sélectionner un adhérent
     * @param memberId
     */
    async selectMember(memberId) {
        try {
            const member = await SupabaseManager.getMember(memberId);
            if (!member) {return;}

            this.currentMember = member;

            // Cacher le sélecteur, montrer le dashboard
            document.querySelector('.member-selector-card').style.display = 'none';
            document.getElementById('nutritionDashboard').classList.remove('hidden');

            // Afficher les infos du membre
            document.getElementById('selectedMemberName').textContent =
                `${member.firstName} ${member.lastName}`;
            document.getElementById('selectedMemberGoal').textContent =
                member.goal || 'Objectif non défini';

            // Charger l'historique du jour
            await this.loadTodayMeals();

        } catch (error) {
            console.error('❌ Erreur sélection membre:', error);
        }
    },

    /**
     * Changer de membre
     */
    changeMember() {
        this.currentMember = null;
        document.querySelector('.member-selector-card').style.display = 'block';
        document.getElementById('nutritionDashboard').classList.add('hidden');
        document.getElementById('nutritionMemberSearch').value = '';
        document.getElementById('nutritionMemberResults').classList.remove('active');
    },

    /**
     * Charger les repas d'aujourd'hui
     */
    async loadTodayMeals() {
        try {
            console.log('📥 Chargement repas du jour...');

            if (!this.currentMember) {return;}

            // Dates pour aujourd'hui
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const startDate = today.toISOString();
            const endDate = tomorrow.toISOString();

            // Charger depuis Supabase
            const meals = await SupabaseManager.getNutritionMeals(
                this.currentMember.id,
                startDate,
                endDate
            );

            console.log(`✅ ${meals.length} repas chargés`);

            // Transformer au format local
            this.mealHistory = meals.map(meal => ({
                id: meal.id,
                type: meal.meal_type,
                time: new Date(meal.meal_time),
                foods: meal.foods || [],
                calories: meal.total_calories || 0,
                proteins: meal.total_protein || 0,
                carbs: meal.total_carbs || 0,
                fats: meal.total_fats || 0,
                notes: meal.notes
            }));

            // Charger les objectifs du jour
            await this.loadDailyGoals();

            // Mettre à jour l'affichage
            this.updateStats();
            this.renderMealsList();

        } catch (error) {
            console.error('❌ Erreur chargement repas:', error);
            Utils.showNotification('Erreur chargement des repas', 'error');
        }
    },

    /**
     * Charger les objectifs nutritionnels du jour
     */
    async loadDailyGoals() {
        try {
            if (!this.currentMember) {return;}

            const today = new Date().toISOString().split('T')[0];

            let tracking = await SupabaseManager.getNutritionTracking(
                this.currentMember.id,
                today
            );

            // Si pas d'objectifs pour aujourd'hui, calculer automatiquement
            if (!tracking) {
                const goals = this.calculateMacros(this.currentMember);

                tracking = await SupabaseManager.upsertNutritionTracking({
                    memberId: this.currentMember.id,
                    trackingDate: today,
                    targetCalories: goals.calories,
                    targetProtein: goals.proteins,
                    targetCarbs: goals.carbs,
                    targetFats: goals.fats,
                    consumedCalories: 0,
                    consumedProtein: 0,
                    consumedCarbs: 0,
                    consumedFats: 0,
                    waterIntake: 0
                });
            }

            // Mettre à jour l'affichage des objectifs
            document.getElementById('caloriesTarget').textContent = tracking.target_calories || 2000;
            document.getElementById('proteinsTarget').textContent = tracking.target_protein || 150;
            document.getElementById('carbsTarget').textContent = tracking.target_carbs || 250;
            document.getElementById('fatsTarget').textContent = tracking.target_fats || 70;

        } catch (error) {
            console.error('❌ Erreur chargement objectifs:', error);
        }
    },

    /**
     * Mettre à jour les stats
     */
    updateStats() {
        let totalCalories = 0;
        let totalProteins = 0;
        let totalCarbs = 0;
        let totalFats = 0;

        this.mealHistory.forEach(meal => {
            totalCalories += meal.calories || 0;
            totalProteins += meal.proteins || 0;
            totalCarbs += meal.carbs || 0;
            totalFats += meal.fats || 0;
        });

        // Mettre à jour les valeurs
        document.getElementById('caloriesValue').textContent = Math.round(totalCalories);
        document.getElementById('proteinsValue').textContent = Math.round(totalProteins);
        document.getElementById('carbsValue').textContent = Math.round(totalCarbs);
        document.getElementById('fatsValue').textContent = Math.round(totalFats);

        // Ajouter des barres de progression visuelles
        this.updateProgressBars(totalCalories, totalProteins, totalCarbs, totalFats);

        // Sauvegarder dans Supabase
        this.updateDailyTracking(totalCalories, totalProteins, totalCarbs, totalFats);
    },

    /**
     * Mettre à jour les barres de progression
     * @param calories
     * @param proteins
     * @param carbs
     * @param fats
     */
    updateProgressBars(calories, proteins, carbs, fats) {
        const caloriesTarget = parseInt(document.getElementById('caloriesTarget').textContent);
        const proteinsTarget = parseInt(document.getElementById('proteinsTarget').textContent);
        const carbsTarget = parseInt(document.getElementById('carbsTarget').textContent);
        const fatsTarget = parseInt(document.getElementById('fatsTarget').textContent);

        // Calculer pourcentages
        const caloriesPct = Math.min(100, (calories / caloriesTarget) * 100);
        const proteinsPct = Math.min(100, (proteins / proteinsTarget) * 100);
        const carbsPct = Math.min(100, (carbs / carbsTarget) * 100);
        const fatsPct = Math.min(100, (fats / fatsTarget) * 100);

        // Créer barres si elles n'existent pas
        this.ensureProgressBars();

        // Mettre à jour les barres
        document.querySelector('#caloriesProgress').style.width = `${caloriesPct}%`;
        document.querySelector('#proteinsProgress').style.width = `${proteinsPct}%`;
        document.querySelector('#carbsProgress').style.width = `${carbsPct}%`;
        document.querySelector('#fatsProgress').style.width = `${fatsPct}%`;

        // Changer couleur si dépassement
        document.querySelector('#caloriesProgress').style.background =
            caloriesPct > 100 ? '#ef4444' : 'linear-gradient(135deg, #ef4444, #dc2626)';
        document.querySelector('#proteinsProgress').style.background =
            proteinsPct > 100 ? '#ef4444' : 'linear-gradient(135deg, #3b82f6, #2563eb)';
        document.querySelector('#carbsProgress').style.background =
            carbsPct > 100 ? '#ef4444' : 'linear-gradient(135deg, #f59e0b, #d97706)';
        document.querySelector('#fatsProgress').style.background =
            fatsPct > 100 ? '#ef4444' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
    },

    /**
     * S'assurer que les barres de progression existent
     */
    ensureProgressBars() {
        const statCards = document.querySelectorAll('.stat-card');

        statCards.forEach((card, index) => {
            const ids = ['calories', 'proteins', 'carbs', 'fats'];
            const id = ids[index];

            if (!card.querySelector('.progress-bar')) {
                const progressContainer = document.createElement('div');
                progressContainer.className = 'progress-bar-container';
                progressContainer.innerHTML = `
                    <div class="progress-bar">
                        <div id="${id}Progress" class="progress-fill"></div>
                    </div>
                `;
                card.appendChild(progressContainer);
            }
        });
    },

    /**
     * Mettre à jour le tracking quotidien dans Supabase
     * @param calories
     * @param proteins
     * @param carbs
     * @param fats
     */
    async updateDailyTracking(calories, proteins, carbs, fats) {
        try {
            if (!this.currentMember) {return;}

            const today = new Date().toISOString().split('T')[0];

            const tracking = await SupabaseManager.getNutritionTracking(
                this.currentMember.id,
                today
            );

            if (tracking) {
                await SupabaseManager.upsertNutritionTracking({
                    memberId: this.currentMember.id,
                    trackingDate: today,
                    targetCalories: tracking.target_calories,
                    targetProtein: tracking.target_protein,
                    targetCarbs: tracking.target_carbs,
                    targetFats: tracking.target_fats,
                    consumedCalories: Math.round(calories),
                    consumedProtein: Math.round(proteins),
                    consumedCarbs: Math.round(carbs),
                    consumedFats: Math.round(fats),
                    waterIntake: tracking.water_intake || 0
                });
            }
        } catch (error) {
            console.error('❌ Erreur mise à jour tracking:', error);
        }
    },

    /**
     * Afficher la liste des repas
     */
    renderMealsList() {
        const mealsList = document.getElementById('mealsList');

        if (!mealsList) {return;}

        if (this.mealHistory.length === 0) {
            mealsList.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-utensils text-4xl mb-2"></i>
                    <p>Aucun repas enregistré aujourd'hui</p>
                </div>
            `;
            return;
        }

        const mealTypeIcons = {
            'breakfast': 'fa-mug-hot',
            'lunch': 'fa-hamburger',
            'dinner': 'fa-pizza-slice',
            'snack': 'fa-cookie-bite'
        };

        const mealTypeNames = {
            'breakfast': 'Petit-déjeuner',
            'lunch': 'Déjeuner',
            'dinner': 'Dîner',
            'snack': 'Collation'
        };

        mealsList.innerHTML = this.mealHistory.map(meal => `
            <div class="meal-item" data-meal-id="${meal.id}">
                <div class="meal-header">
                    <div class="meal-type">
                        <i class="fas ${mealTypeIcons[meal.type] || 'fa-utensils'}"></i>
                        <span>${mealTypeNames[meal.type] || meal.type}</span>
                    </div>
                    <div class="meal-time">${this.formatTime(meal.time)}</div>
                </div>
                <div class="meal-macros">
                    <span class="macro-badge calories">
                        <i class="fas fa-fire"></i> ${Math.round(meal.calories)} kcal
                    </span>
                    <span class="macro-badge proteins">
                        <i class="fas fa-drumstick-bite"></i> ${Math.round(meal.proteins)}g P
                    </span>
                    <span class="macro-badge carbs">
                        <i class="fas fa-bread-slice"></i> ${Math.round(meal.carbs)}g G
                    </span>
                    <span class="macro-badge fats">
                        <i class="fas fa-cheese"></i> ${Math.round(meal.fats)}g L
                    </span>
                </div>
                ${meal.foods && meal.foods.length > 0 ? `
                    <div class="meal-foods">
                        ${meal.foods.map(food => `
                            <span class="food-tag">${food.name} (${food.quantity}${food.unit})</span>
                        `).join('')}
                    </div>
                ` : ''}
                ${meal.notes ? `<div class="meal-notes">${meal.notes}</div>` : ''}
                <div class="meal-actions">
                    <button onclick="NutritionAI.editMeal('${meal.id}')" class="btn-icon">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="NutritionAI.deleteMeal('${meal.id}')" class="btn-icon delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    /**
     * Formater l'heure
     * @param date
     */
    formatTime(date) {
        return new Date(date).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Ajouter un repas
     */
    addMeal() {
        if (!this.currentMember) {
            Utils.showNotification('Sélectionnez d\'abord un adhérent', 'warning');
            return;
        }

        const modal = `
            <div class="modal-overlay" id="addMealModal" onclick="if(event.target === this) NutritionAI.closeModal()">
                <div class="modal-container" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3><i class="fas fa-plus-circle mr-2"></i>Ajouter un repas</h3>
                        <button onclick="NutritionAI.closeModal()" class="btn-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="addMealForm">
                            <div class="form-group">
                                <label>Type de repas</label>
                                <select id="mealType" required>
                                    <option value="breakfast">Petit-déjeuner</option>
                                    <option value="lunch">Déjeuner</option>
                                    <option value="dinner">Dîner</option>
                                    <option value="snack">Collation</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Heure</label>
                                <input type="time" id="mealTime" required
                                       value="${new Date().toTimeString().slice(0, 5)}">
                            </div>

                            <div class="form-group">
                                <label>Calories (kcal)</label>
                                <input type="number" id="mealCalories" required min="0" step="1">
                            </div>

                            <div class="macros-grid">
                                <div class="form-group">
                                    <label>Protéines (g)</label>
                                    <input type="number" id="mealProteins" required min="0" step="0.1">
                                </div>
                                <div class="form-group">
                                    <label>Glucides (g)</label>
                                    <input type="number" id="mealCarbs" required min="0" step="0.1">
                                </div>
                                <div class="form-group">
                                    <label>Lipides (g)</label>
                                    <input type="number" id="mealFats" required min="0" step="0.1">
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Aliments (optionnel)</label>
                                <div id="foodsList"></div>
                                <button type="button" onclick="NutritionAI.addFoodItem()" class="btn-secondary">
                                    <i class="fas fa-plus mr-2"></i>Ajouter un aliment
                                </button>
                            </div>

                            <div class="form-group">
                                <label>Notes (optionnel)</label>
                                <textarea id="mealNotes" rows="3"
                                          placeholder="Commentaires sur ce repas..."></textarea>
                            </div>

                            <div class="modal-actions">
                                <button type="button" onclick="NutritionAI.closeModal()" class="btn-secondary">
                                    Annuler
                                </button>
                                <button type="submit" class="btn-primary">
                                    <i class="fas fa-save mr-2"></i>Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modal);

        // Gestion du formulaire
        document.getElementById('addMealForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveMeal();
        });
    },

    /**
     * Ajouter un aliment au formulaire
     */
    addFoodItem() {
        const foodsList = document.getElementById('foodsList');
        const index = foodsList.children.length;

        const foodItem = `
            <div class="food-item" data-index="${index}">
                <input type="text" placeholder="Nom de l'aliment" class="food-name">
                <input type="number" placeholder="Quantité" class="food-quantity" min="0" step="0.1">
                <select class="food-unit">
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                    <option value="unité">unité</option>
                    <option value="portion">portion</option>
                </select>
                <button type="button" onclick="this.parentElement.remove()" class="btn-icon delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        foodsList.insertAdjacentHTML('beforeend', foodItem);
    },

    /**
     * Enregistrer le repas
     */
    async saveMeal() {
        try {
            console.log('💾 Enregistrement repas...');

            const type = document.getElementById('mealType').value;
            const time = document.getElementById('mealTime').value;
            const calories = parseFloat(document.getElementById('mealCalories').value);
            const proteins = parseFloat(document.getElementById('mealProteins').value);
            const carbs = parseFloat(document.getElementById('mealCarbs').value);
            const fats = parseFloat(document.getElementById('mealFats').value);
            const notes = document.getElementById('mealNotes').value;

            // Récupérer les aliments
            const foods = [];
            document.querySelectorAll('.food-item').forEach(item => {
                const name = item.querySelector('.food-name').value;
                const quantity = item.querySelector('.food-quantity').value;
                const unit = item.querySelector('.food-unit').value;

                if (name && quantity) {
                    foods.push({ name, quantity: parseFloat(quantity), unit });
                }
            });

            // Créer date/heure complète
            const today = new Date();
            const [hours, minutes] = time.split(':');
            const mealDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(),
                parseInt(hours), parseInt(minutes));

            // Sauvegarder dans Supabase
            const meal = await SupabaseManager.createNutritionMeal({
                memberId: this.currentMember.id,
                mealType: type,
                mealTime: mealDateTime.toISOString(),
                foods: foods,
                totalCalories: calories,
                totalProtein: proteins,
                totalCarbs: carbs,
                totalFats: fats,
                notes: notes || null
            });

            console.log('✅ Repas enregistré:', meal);

            // Ajouter au tableau local
            this.mealHistory.push({
                id: meal.id,
                type: type,
                time: mealDateTime,
                foods: foods,
                calories: calories,
                proteins: proteins,
                carbs: carbs,
                fats: fats,
                notes: notes
            });

            // Mettre à jour l'affichage
            this.updateStats();
            this.renderMealsList();

            // Fermer la modal
            this.closeModal();

            Utils.showNotification('Repas enregistré avec succès !', 'success');

        } catch (error) {
            console.error('❌ Erreur enregistrement repas:', error);
            Utils.showNotification('Erreur lors de l\'enregistrement', 'error');
        }
    },

    /**
     * Modifier un repas
     * @param mealId
     */
    async editMeal(mealId) {
        const meal = this.mealHistory.find(m => m.id === mealId);
        if (!meal) {return;}

        Utils.showNotification('Modification en cours...', 'info');
        // TODO: Implémenter modal de modification
    },

    /**
     * Supprimer un repas
     * @param mealId
     */
    async deleteMeal(mealId) {
        if (!confirm('Supprimer ce repas ?')) {return;}

        try {
            await SupabaseManager.deleteNutritionMeal(mealId);

            // Retirer du tableau local
            this.mealHistory = this.mealHistory.filter(m => m.id !== mealId);

            // Mettre à jour l'affichage
            this.updateStats();
            this.renderMealsList();

            Utils.showNotification('Repas supprimé', 'success');

        } catch (error) {
            console.error('❌ Erreur suppression repas:', error);
            Utils.showNotification('Erreur lors de la suppression', 'error');
        }
    },

    /**
     * Fermer la modal
     */
    closeModal() {
        const modal = document.getElementById('addMealModal') || document.getElementById('scanFoodModal');
        if (modal) {modal.remove();}
    },

    /**
     * Scanner un aliment (simulation IA)
     */
    scanFood() {
        if (!this.currentMember) {
            Utils.showNotification('Sélectionnez d\'abord un adhérent', 'warning');
            return;
        }

        const modal = `
            <div class="modal-overlay" id="scanFoodModal" onclick="if(event.target === this) NutritionAI.closeModal()">
                <div class="modal-container scan-modal" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3><i class="fas fa-camera mr-2"></i>Scanner un aliment</h3>
                        <button onclick="NutritionAI.closeModal()" class="btn-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="scan-area">
                            <div class="camera-placeholder">
                                <i class="fas fa-camera text-6xl mb-4 text-gray-400"></i>
                                <p class="text-gray-600 mb-4">Mode simulation - Pas de caméra réelle</p>
                                <button onclick="NutritionAI.simulateScan()" class="btn-primary">
                                    <i class="fas fa-magic mr-2"></i>Simuler un scan
                                </button>
                            </div>
                            <div id="scanResults" class="scan-results hidden"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modal);
    },

    /**
     * Simuler un scan IA
     */
    async simulateScan() {
        const resultsDiv = document.getElementById('scanResults');
        resultsDiv.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Analyse en cours...</div>';
        resultsDiv.classList.remove('hidden');

        // Simulation avec délai
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Résultats simulés
        const simulatedFoods = [
            { name: 'Poulet grillé', calories: 165, proteins: 31, carbs: 0, fats: 3.6, quantity: 100, unit: 'g' },
            { name: 'Riz basmati', calories: 130, proteins: 2.7, carbs: 28, fats: 0.3, quantity: 100, unit: 'g' },
            { name: 'Brocoli vapeur', calories: 35, proteins: 2.8, carbs: 7, fats: 0.4, quantity: 100, unit: 'g' },
            { name: 'Banane', calories: 89, proteins: 1.1, carbs: 23, fats: 0.3, quantity: 1, unit: 'unité' },
            { name: 'Avocat', calories: 160, proteins: 2, carbs: 9, fats: 15, quantity: 100, unit: 'g' }
        ];

        const randomFood = simulatedFoods[Math.floor(Math.random() * simulatedFoods.length)];

        resultsDiv.innerHTML = `
            <div class="scan-result-card">
                <div class="scan-success">
                    <i class="fas fa-check-circle text-green-500 text-4xl mb-3"></i>
                    <h4>Aliment détecté !</h4>
                </div>
                <div class="detected-food">
                    <h5>${randomFood.name}</h5>
                    <p class="text-sm text-gray-600">${randomFood.quantity}${randomFood.unit}</p>
                </div>
                <div class="detected-macros">
                    <span class="macro-badge calories">
                        <i class="fas fa-fire"></i> ${randomFood.calories} kcal
                    </span>
                    <span class="macro-badge proteins">
                        <i class="fas fa-drumstick-bite"></i> ${randomFood.proteins}g P
                    </span>
                    <span class="macro-badge carbs">
                        <i class="fas fa-bread-slice"></i> ${randomFood.carbs}g G
                    </span>
                    <span class="macro-badge fats">
                        <i class="fas fa-cheese"></i> ${randomFood.fats}g L
                    </span>
                </div>
                <div class="confidence-score">
                    <span>Confiance: ${Math.floor(Math.random() * 20 + 80)}%</span>
                </div>
                <button onclick="NutritionAI.addScannedFood(${JSON.stringify(randomFood).replace(/"/g, '&quot;')})"
                        class="btn-primary mt-4">
                    <i class="fas fa-plus mr-2"></i>Ajouter au repas
                </button>
            </div>
        `;
    },

    /**
     * Ajouter un aliment scanné
     * @param food
     */
    addScannedFood(food) {
        this.closeModal();

        // Pré-remplir le formulaire d'ajout de repas
        this.addMeal();

        setTimeout(() => {
            document.getElementById('mealCalories').value = food.calories;
            document.getElementById('mealProteins').value = food.proteins;
            document.getElementById('mealCarbs').value = food.carbs;
            document.getElementById('mealFats').value = food.fats;

            // Ajouter l'aliment à la liste
            this.addFoodItem();
            const lastFood = document.querySelector('.food-item:last-child');
            if (lastFood) {
                lastFood.querySelector('.food-name').value = food.name;
                lastFood.querySelector('.food-quantity').value = food.quantity;
                lastFood.querySelector('.food-unit').value = food.unit;
            }
        }, 100);
    },

    /**
     * Analyser avec l'IA
     */
    async analyzeWithAI() {
        if (!this.currentMember) {
            Utils.showNotification('Sélectionnez d\'abord un adhérent', 'warning');
            return;
        }

        if (this.mealHistory.length === 0) {
            Utils.showNotification('Aucun repas à analyser', 'warning');
            return;
        }

        try {
            console.log('🤖 Analyse IA en cours...');
            Utils.showNotification('Analyse en cours...', 'info');

            // Simulation d'analyse IA
            await new Promise(resolve => setTimeout(resolve, 2000));

            const analysis = this.generateAIAnalysis();

            // Sauvegarder dans Supabase
            const today = new Date();
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);

            await SupabaseManager.analyzeNutritionWithAI(this.currentMember.id, {
                start: weekAgo.toISOString(),
                end: today.toISOString(),
                type: 'daily'
            });

            // Afficher les recommandations
            this.displayAIRecommendations(analysis);

            Utils.showNotification('Analyse terminée !', 'success');

        } catch (error) {
            console.error('❌ Erreur analyse IA:', error);
            Utils.showNotification('Erreur lors de l\'analyse', 'error');
        }
    },

    /**
     * Générer une analyse IA (simulation)
     */
    generateAIAnalysis() {
        const totalCalories = this.mealHistory.reduce((sum, m) => sum + m.calories, 0);
        const totalProteins = this.mealHistory.reduce((sum, m) => sum + m.proteins, 0);
        const totalCarbs = this.mealHistory.reduce((sum, m) => sum + m.carbs, 0);
        const totalFats = this.mealHistory.reduce((sum, m) => sum + m.fats, 0);

        const caloriesTarget = parseInt(document.getElementById('caloriesTarget').textContent);
        const proteinsTarget = parseInt(document.getElementById('proteinsTarget').textContent);
        const carbsTarget = parseInt(document.getElementById('carbsTarget').textContent);
        const fatsTarget = parseInt(document.getElementById('fatsTarget').textContent);

        const caloriesDiff = totalCalories - caloriesTarget;
        const proteinsDiff = totalProteins - proteinsTarget;
        const carbsDiff = totalCarbs - carbsTarget;
        const fatsDiff = totalFats - fatsTarget;

        // Calculer score santé
        let score = 100;
        score -= Math.abs(caloriesDiff) / caloriesTarget * 20;
        score -= Math.abs(proteinsDiff) / proteinsTarget * 15;
        score -= Math.abs(carbsDiff) / carbsTarget * 10;
        score -= Math.abs(fatsDiff) / fatsTarget * 10;
        score = Math.max(0, Math.min(100, Math.round(score)));

        const recommendations = [];

        if (caloriesDiff > 200) {
            recommendations.push({
                type: 'warning',
                icon: 'fa-exclamation-triangle',
                text: `Vous avez dépassé votre objectif calorique de ${Math.round(caloriesDiff)} kcal. Réduisez les portions ou choisissez des aliments moins caloriques.`
            });
        } else if (caloriesDiff < -200) {
            recommendations.push({
                type: 'warning',
                icon: 'fa-exclamation-triangle',
                text: `Vous êtes en déficit de ${Math.round(Math.abs(caloriesDiff))} kcal. Assurez-vous de manger suffisamment pour vos besoins énergétiques.`
            });
        }

        if (proteinsDiff < -20) {
            recommendations.push({
                type: 'info',
                icon: 'fa-drumstick-bite',
                text: `Augmentez votre apport en protéines (${Math.round(Math.abs(proteinsDiff))}g manquants). Ajoutez du poulet, poisson, œufs ou légumineuses.`
            });
        }

        if (recommendations.length === 0) {
            recommendations.push({
                type: 'success',
                icon: 'fa-check-circle',
                text: 'Excellente journée ! Vos macros sont bien équilibrés.'
            });
        }

        // Conseils supplémentaires
        recommendations.push({
            type: 'tip',
            icon: 'fa-lightbulb',
            text: 'Pensez à boire au moins 2L d\'eau par jour pour optimiser votre récupération.'
        });

        return {
            score,
            recommendations,
            summary: {
                calories: { consumed: totalCalories, target: caloriesTarget, diff: caloriesDiff },
                proteins: { consumed: totalProteins, target: proteinsTarget, diff: proteinsDiff },
                carbs: { consumed: totalCarbs, target: carbsTarget, diff: carbsDiff },
                fats: { consumed: totalFats, target: fatsTarget, diff: fatsDiff }
            }
        };
    },

    /**
     * Afficher les recommandations IA
     * @param analysis
     */
    displayAIRecommendations(analysis) {
        const container = document.getElementById('aiRecommendations');
        const content = document.getElementById('aiRecommendationsContent');

        if (!container || !content) {return;}

        const scoreColor = analysis.score >= 80 ? '#10b981' :
            analysis.score >= 60 ? '#f59e0b' : '#ef4444';

        content.innerHTML = `
            <div class="ai-score">
                <div class="score-circle" style="border-color: ${scoreColor}">
                    <span class="score-value" style="color: ${scoreColor}">${analysis.score}</span>
                    <span class="score-label">/ 100</span>
                </div>
                <p class="score-text">Score Santé Quotidien</p>
            </div>

            <div class="recommendations-list">
                ${analysis.recommendations.map(rec => `
                    <div class="recommendation-item ${rec.type}">
                        <i class="fas ${rec.icon}"></i>
                        <p>${rec.text}</p>
                    </div>
                `).join('')}
            </div>

            <div class="ai-summary">
                <h4>Résumé du jour</h4>
                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="label">Calories</span>
                        <span class="value ${analysis.summary.calories.diff > 0 ? 'over' : 'under'}">
                            ${Math.round(analysis.summary.calories.consumed)} / ${analysis.summary.calories.target}
                            (${analysis.summary.calories.diff > 0 ? '+' : ''}${Math.round(analysis.summary.calories.diff)})
                        </span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Protéines</span>
                        <span class="value ${analysis.summary.proteins.diff > 0 ? 'over' : 'under'}">
                            ${Math.round(analysis.summary.proteins.consumed)}g / ${analysis.summary.proteins.target}g
                            (${analysis.summary.proteins.diff > 0 ? '+' : ''}${Math.round(analysis.summary.proteins.diff)}g)
                        </span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Glucides</span>
                        <span class="value ${analysis.summary.carbs.diff > 0 ? 'over' : 'under'}">
                            ${Math.round(analysis.summary.carbs.consumed)}g / ${analysis.summary.carbs.target}g
                            (${analysis.summary.carbs.diff > 0 ? '+' : ''}${Math.round(analysis.summary.carbs.diff)}g)
                        </span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Lipides</span>
                        <span class="value ${analysis.summary.fats.diff > 0 ? 'over' : 'under'}">
                            ${Math.round(analysis.summary.fats.consumed)}g / ${analysis.summary.fats.target}g
                            (${analysis.summary.fats.diff > 0 ? '+' : ''}${Math.round(analysis.summary.fats.diff)}g)
                        </span>
                    </div>
                </div>
            </div>
        `;

        container.classList.remove('hidden');
        this.aiAnalysis = analysis;
    },

    /**
     * Calculer les macros recommandés
     * @param member
     */
    calculateMacros(member) {
        console.log('🧮 Calcul macros pour:', member.name || member.firstName);

        // Formule de Harris-Benedict pour le métabolisme de base
        let bmr;
        const weight = member.weight || 70;
        const height = member.height || 170;
        const age = member.age || 30;

        if (member.gender === 'male') {
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        } else {
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        }

        // Facteur d'activité
        const activityFactors = {
            'sedentary': 1.2,
            'light': 1.375,
            'moderate': 1.55,
            'active': 1.725,
            'very_active': 1.9
        };

        const activityLevel = member.activity_level || 'moderate';
        const tdee = Math.round(bmr * activityFactors[activityLevel]);

        // Ajustement selon l'objectif
        let calories = tdee;
        const goal = member.goal?.toLowerCase() || '';

        if (goal.includes('perte') || goal.includes('seche')) {
            calories = Math.round(tdee * 0.85); // Déficit 15%
        } else if (goal.includes('prise') || goal.includes('masse')) {
            calories = Math.round(tdee * 1.15); // Surplus 15%
        }

        // Répartition macros (40/30/30 par défaut)
        const proteins = Math.round((calories * 0.30) / 4); // 30% en protéines (4 kcal/g)
        const carbs = Math.round((calories * 0.40) / 4);    // 40% en glucides (4 kcal/g)
        const fats = Math.round((calories * 0.30) / 9);     // 30% en lipides (9 kcal/g)

        console.log('✅ Macros calculés:', { calories, proteins, carbs, fats });

        return { calories, proteins, carbs, fats };
    },

    /**
     * Afficher les paramètres
     */
    showSettings() {
        if (!this.currentMember) {
            Utils.showNotification('Sélectionnez d\'abord un adhérent', 'warning');
            return;
        }

        const currentGoals = this.calculateMacros(this.currentMember);

        const modal = `
            <div class="modal-overlay" onclick="if(event.target === this) NutritionAI.closeModal()">
                <div class="modal-container settings-modal" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3><i class="fas fa-cog mr-2"></i>Paramètres Nutrition</h3>
                        <button onclick="NutritionAI.closeModal()" class="btn-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="settings-section">
                            <h4>Objectifs macros quotidiens</h4>
                            <p class="text-sm text-gray-600 mb-4">
                                Calculés automatiquement selon votre profil. Vous pouvez les ajuster manuellement.
                            </p>

                            <div class="form-group">
                                <label>Calories (kcal/jour)</label>
                                <input type="number" id="settingsCalories" value="${currentGoals.calories}" min="0">
                            </div>

                            <div class="macros-grid">
                                <div class="form-group">
                                    <label>Protéines (g)</label>
                                    <input type="number" id="settingsProteins" value="${currentGoals.proteins}" min="0">
                                </div>
                                <div class="form-group">
                                    <label>Glucides (g)</label>
                                    <input type="number" id="settingsCarbs" value="${currentGoals.carbs}" min="0">
                                </div>
                                <div class="form-group">
                                    <label>Lipides (g)</label>
                                    <input type="number" id="settingsFats" value="${currentGoals.fats}" min="0">
                                </div>
                            </div>

                            <button onclick="NutritionAI.recalculateMacros()" class="btn-secondary mt-3">
                                <i class="fas fa-sync mr-2"></i>Recalculer automatiquement
                            </button>
                        </div>

                        <div class="modal-actions">
                            <button onclick="NutritionAI.closeModal()" class="btn-secondary">Annuler</button>
                            <button onclick="NutritionAI.saveSettings()" class="btn-primary">
                                <i class="fas fa-save mr-2"></i>Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modal);
    },

    /**
     * Recalculer les macros
     */
    recalculateMacros() {
        const goals = this.calculateMacros(this.currentMember);
        document.getElementById('settingsCalories').value = goals.calories;
        document.getElementById('settingsProteins').value = goals.proteins;
        document.getElementById('settingsCarbs').value = goals.carbs;
        document.getElementById('settingsFats').value = goals.fats;
    },

    /**
     * Sauvegarder les paramètres
     */
    async saveSettings() {
        try {
            const calories = parseInt(document.getElementById('settingsCalories').value);
            const proteins = parseInt(document.getElementById('settingsProteins').value);
            const carbs = parseInt(document.getElementById('settingsCarbs').value);
            const fats = parseInt(document.getElementById('settingsFats').value);

            const today = new Date().toISOString().split('T')[0];

            await SupabaseManager.upsertNutritionTracking({
                memberId: this.currentMember.id,
                trackingDate: today,
                targetCalories: calories,
                targetProtein: proteins,
                targetCarbs: carbs,
                targetFats: fats,
                consumedCalories: parseInt(document.getElementById('caloriesValue').textContent),
                consumedProtein: parseInt(document.getElementById('proteinsValue').textContent),
                consumedCarbs: parseInt(document.getElementById('carbsValue').textContent),
                consumedFats: parseInt(document.getElementById('fatsValue').textContent),
                waterIntake: 0
            });

            // Mettre à jour l'affichage
            document.getElementById('caloriesTarget').textContent = calories;
            document.getElementById('proteinsTarget').textContent = proteins;
            document.getElementById('carbsTarget').textContent = carbs;
            document.getElementById('fatsTarget').textContent = fats;

            this.updateProgressBars(
                parseInt(document.getElementById('caloriesValue').textContent),
                parseInt(document.getElementById('proteinsValue').textContent),
                parseInt(document.getElementById('carbsValue').textContent),
                parseInt(document.getElementById('fatsValue').textContent)
            );

            this.closeModal();
            Utils.showNotification('Paramètres enregistrés !', 'success');

        } catch (error) {
            console.error('❌ Erreur sauvegarde paramètres:', error);
            Utils.showNotification('Erreur lors de la sauvegarde', 'error');
        }
    }
};

// Exposer globalement
window.NutritionAI = NutritionAI;
