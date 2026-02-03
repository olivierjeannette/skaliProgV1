/**
 * 📊 CRM MANAGER - Gestion des Leads La Skàli
 *
 * Module de gestion centralisée des leads provenant des 3 sites :
 * - Fitness (fitness.html)
 * - Pilates (pilates.html)
 * - Coaching (coaching.html)
 *
 * Fonctionnalités :
 * - Dashboard avec statistiques globales
 * - 3 onglets pour filtrer par service
 * - Tableau avec tous les leads
 * - Actions : Voir détails, Changer statut, Ajouter notes
 */

window.CRMManager = (function () {
    'use strict';

    // Utiliser la configuration Supabase existante de l'app
    function getSupabaseConfig() {
        return {
            url: ENV.get('supabaseUrl'),
            anonKey: ENV.get('supabaseKey')
        };
    }

    const TABLE_NAME = 'leads';
    const SERVICE_TYPES = {
        ALL: null,
        FITNESS: 'fitness',
        PILATES: 'pilates',
        COACHING: 'coaching',
        TEAMBUILDING: 'teambuilding'
    };

    // Numéros WhatsApp de l'équipe
    const TEAM_PHONES = {
        OLIVIER: {
            name: 'Olivier',
            phone: '+33616875437',
            color: '#4CAF50'
        },
        EVA: {
            name: 'Eva',
            phone: '+33627508536',
            color: '#E91E63'
        }
    };

    // Statuts des leads
    const STATUSES = {
        PROSPECT: 'prospect',
        CONTACTE_ATTENTE: 'contacte_attente',
        RDV_ESSAI: 'rdv_essai',
        CONVERTI_ABONNEMENT: 'converti_abonnement',
        CONVERTI_CARNETS: 'converti_carnets',
        NON_CONVERTI_PRIX: 'non_converti_prix',
        LISTE_ROUGE: 'liste_rouge'
    };

    const STATUS_LABELS = {
        prospect: '🆕 Prospect',
        contacte_attente: '📞 Contacté (Attente)',
        rdv_essai: '📅 RDV pris (Essai)',
        converti_abonnement: '✅ Converti (Abonnement)',
        converti_carnets: '🎫 Converti (Carnets)',
        non_converti_prix: '💰 Non converti (Prix)',
        liste_rouge: '🗑️ Liste rouge'
    };

    const STATUS_COLORS = {
        prospect: '#60a5fa',
        contacte_attente: '#fbbf24',
        rdv_essai: '#c084fc',
        converti_abonnement: '#4ade80',
        converti_carnets: '#34d399',
        non_converti_prix: '#f87171',
        liste_rouge: '#94a3b8'
    };

    // Onglets du CRM
    const TABS = {
        HOME: 'home',
        PROSPECT: 'prospect',
        CONTACTE: 'contacte_attente',
        RDV: 'rdv_essai',
        CONVERTI: 'converti',
        NON_CONVERTI: 'non_converti_prix',
        LISTE_ROUGE: 'liste_rouge',
        ALL: 'all'
    };

    // État local
    let currentTab = TABS.HOME;
    let allLeads = [];
    let stats = {};

    /**
     * Initialise et affiche le module CRM
     */
    async function show() {
        console.log('📊 Initialisation CRM Manager...');

        // Créer l'interface
        createInterface();

        // Charger les données
        await loadData();
    }

    /**
     * Crée l'interface HTML du CRM
     */
    function createInterface() {
        const container = document.getElementById('mainContent');
        if (!container) {
            console.error('❌ Container #mainContent introuvable');
            return;
        }

        container.innerHTML = `
            <div class="crm-container" style="padding: 2rem; background: linear-gradient(135deg, #0a0f0a 0%, #0f1810 100%); min-height: 100vh;">
                <!-- Header -->
                <div class="crm-header" style="margin-bottom: 2rem;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                        <h1 style="font-size: 2rem; font-weight: 700; color: white; display: flex; align-items: center; gap: 0.75rem;">
                            <i class="fas fa-chart-line" style="color: var(--accent-primary);"></i>
                            CRM - Gestion des Leads
                        </h1>
                        <button onclick="CRMManager.refresh()" class="btn-refresh" style="padding: 0.75rem 1.5rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: white; cursor: pointer; transition: all 0.2s;">
                            <i class="fas fa-sync-alt"></i> Actualiser
                        </button>
                    </div>
                    <p style="color: rgba(255,255,255,0.6); font-size: 0.95rem;">
                        Centralisation des formulaires de contact des 3 sites La Skàli
                    </p>
                </div>

                <!-- Dashboard Stats -->
                <div id="dashboardStats" style="margin-bottom: 2rem;">
                    <div class="loading-spinner" style="text-align: center; padding: 3rem; color: white;">
                        <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                        <p>Chargement des statistiques...</p>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="crm-tabs" style="margin-bottom: 2rem; display: flex; gap: 0.5rem; border-bottom: 2px solid rgba(255,255,255,0.1); padding-bottom: 1rem; flex-wrap: wrap;">
                    <button onclick="CRMManager.switchTab('home')" data-tab="home" class="tab-btn active" style="padding: 0.75rem 1.5rem; background: rgba(76, 175, 80, 0.3); border: none; border-bottom: 3px solid #4CAF50; border-radius: 8px 8px 0 0; color: #4CAF50; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        <i class="fas fa-home"></i> Accueil (0)
                    </button>
                    <button onclick="CRMManager.switchTab('prospect')" data-tab="prospect" class="tab-btn" style="padding: 0.75rem 1.5rem; background: rgba(255,255,255,0.05); border: none; border-radius: 8px 8px 0 0; color: rgba(255,255,255,0.7); font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        <i class="fas fa-user-plus"></i> Prospects (0)
                    </button>
                    <button onclick="CRMManager.switchTab('contacte_attente')" data-tab="contacte_attente" class="tab-btn" style="padding: 0.75rem 1.5rem; background: rgba(255,255,255,0.05); border: none; border-radius: 8px 8px 0 0; color: rgba(255,255,255,0.7); font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        <i class="fas fa-phone"></i> Contactés (0)
                    </button>
                    <button onclick="CRMManager.switchTab('rdv_essai')" data-tab="rdv_essai" class="tab-btn" style="padding: 0.75rem 1.5rem; background: rgba(255,255,255,0.05); border: none; border-radius: 8px 8px 0 0; color: rgba(255,255,255,0.7); font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        <i class="fas fa-calendar-check"></i> RDV Essai (0)
                    </button>
                    <button onclick="CRMManager.switchTab('converti')" data-tab="converti" class="tab-btn" style="padding: 0.75rem 1.5rem; background: rgba(255,255,255,0.05); border: none; border-radius: 8px 8px 0 0; color: rgba(255,255,255,0.7); font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        <i class="fas fa-check-circle"></i> Convertis (0)
                    </button>
                    <button onclick="CRMManager.switchTab('non_converti_prix')" data-tab="non_converti_prix" class="tab-btn" style="padding: 0.75rem 1.5rem; background: rgba(255,255,255,0.05); border: none; border-radius: 8px 8px 0 0; color: rgba(255,255,255,0.7); font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        <i class="fas fa-times-circle"></i> Non convertis (0)
                    </button>
                    <button onclick="CRMManager.switchTab('liste_rouge')" data-tab="liste_rouge" class="tab-btn" style="padding: 0.75rem 1.5rem; background: rgba(255,255,255,0.05); border: none; border-radius: 8px 8px 0 0; color: rgba(255,255,255,0.7); font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        <i class="fas fa-ban"></i> Liste rouge (0)
                    </button>
                    <button onclick="CRMManager.switchTab('all')" data-tab="all" class="tab-btn" style="padding: 0.75rem 1.5rem; background: rgba(255,255,255,0.05); border: none; border-radius: 8px 8px 0 0; color: rgba(255,255,255,0.7); font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        <i class="fas fa-list"></i> Tous (0)
                    </button>
                    <button onclick="CRMManager.switchTab('stats')" data-tab="stats" class="tab-btn" style="padding: 0.75rem 1.5rem; background: rgba(255,255,255,0.05); border: none; border-radius: 8px 8px 0 0; color: rgba(255,255,255,0.7); font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        <i class="fas fa-chart-line"></i> 📊 Stats
                    </button>
                </div>

                <!-- Table Container -->
                <div id="leadsTableContainer" style="background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.5rem;">
                    <div class="loading-spinner" style="text-align: center; padding: 3rem; color: white;">
                        <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                        <p>Chargement des leads...</p>
                    </div>
                </div>
            </div>

            <style>
                .crm-container .tab-btn:hover {
                    opacity: 0.9;
                    transform: translateY(-2px);
                }

                .crm-container .tab-btn.active {
                    background: rgba(76, 175, 80, 0.3) !important;
                    border-bottom: 3px solid #4CAF50 !important;
                    color: #4CAF50 !important;
                }

                .crm-container .btn-refresh:hover {
                    background: rgba(255,255,255,0.15);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }

                .leads-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .leads-table thead th {
                    background: rgba(255,255,255,0.05);
                    color: rgba(255,255,255,0.9);
                    padding: 1rem;
                    text-align: left;
                    font-weight: 600;
                    border-bottom: 2px solid rgba(255,255,255,0.1);
                }

                .leads-table tbody tr {
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    transition: all 0.2s;
                }

                .leads-table tbody tr:hover {
                    background: rgba(255,255,255,0.05);
                }

                .leads-table tbody td {
                    padding: 1rem;
                    color: rgba(255,255,255,0.8);
                }

                .status-badge {
                    display: inline-block;
                    padding: 0.25rem 0.75rem;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .status-nouveau {
                    background: rgba(59, 130, 246, 0.2);
                    color: #60a5fa;
                    border: 1px solid rgba(59, 130, 246, 0.3);
                }

                .status-contacte {
                    background: rgba(245, 158, 11, 0.2);
                    color: #fbbf24;
                    border: 1px solid rgba(245, 158, 11, 0.3);
                }

                .status-qualifie {
                    background: rgba(168, 85, 247, 0.2);
                    color: #c084fc;
                    border: 1px solid rgba(168, 85, 247, 0.3);
                }

                .status-converti {
                    background: rgba(34, 197, 94, 0.2);
                    color: #4ade80;
                    border: 1px solid rgba(34, 197, 94, 0.3);
                }

                .status-perdu {
                    background: rgba(239, 68, 68, 0.2);
                    color: #f87171;
                    border: 1px solid rgba(239, 68, 68, 0.3);
                }

                .action-btn {
                    padding: 0.5rem 1rem;
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 6px;
                    color: white;
                    cursor: pointer;
                    font-size: 0.85rem;
                    transition: all 0.2s;
                    margin-right: 0.5rem;
                }

                .action-btn:hover {
                    background: rgba(255,255,255,0.15);
                    transform: translateY(-1px);
                }

                .delete-btn {
                    background: rgba(239, 68, 68, 0.2);
                    border-color: rgba(239, 68, 68, 0.4);
                    color: #f87171;
                }

                .delete-btn:hover {
                    background: rgba(239, 68, 68, 0.3);
                    border-color: #f87171;
                }

                .whatsapp-btn {
                    background: rgba(37, 211, 102, 0.2);
                    border-color: rgba(37, 211, 102, 0.4);
                    color: #25D366;
                }

                .whatsapp-btn:hover {
                    background: rgba(37, 211, 102, 0.3);
                    border-color: #25D366;
                }

                .email-btn {
                    background: rgba(59, 130, 246, 0.2);
                    border-color: rgba(59, 130, 246, 0.4);
                    color: #3b82f6;
                }

                .email-btn:hover {
                    background: rgba(59, 130, 246, 0.3);
                    border-color: #3b82f6;
                }

                .stat-card {
                    background: rgba(255,255,255,0.03);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px;
                    padding: 1.5rem;
                    text-align: center;
                }

                .stat-value {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 0.5rem;
                }

                .stat-label {
                    color: rgba(255,255,255,0.6);
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
            </style>
        `;
    }

    /**
     * Charge toutes les données (stats + leads)
     */
    async function loadData() {
        console.log('📥 Chargement des données CRM...');

        try {
            // Charger les statistiques
            await loadStats();

            // Charger les leads
            await loadLeads();
        } catch (error) {
            console.error('❌ Erreur chargement CRM:', error);
            showError('Impossible de charger les données. Vérifiez votre configuration Supabase.');
        }
    }

    /**
     * Charge les statistiques depuis Supabase (optionnel maintenant, calcul depuis allLeads)
     */
    async function loadStats() {
        // On n'utilise plus les vues SQL, tout est calculé depuis allLeads dans renderDashboard()
        console.log('📊 Stats seront calculées depuis les leads');
    }

    /**
     * Affiche le dashboard avec les statistiques
     */
    function renderDashboard() {
        const container = document.getElementById('dashboardStats');
        if (!container) {
            return;
        }

        // Calculer les stats depuis allLeads
        const totalLeads = allLeads.length;
        const convertis = allLeads.filter(
            l => l.status === STATUSES.CONVERTI_ABONNEMENT || l.status === STATUSES.CONVERTI_CARNETS
        ).length;
        const nonConvertis = allLeads.filter(l => l.status === STATUSES.NON_CONVERTI_PRIX).length;
        const tauxConversion = totalLeads > 0 ? ((convertis / totalLeads) * 100).toFixed(1) : 0;

        // Stats par service
        const fitnessCount = allLeads.filter(l => l.service_type === 'fitness').length;
        const pilatesCount = allLeads.filter(l => l.service_type === 'pilates').length;
        const coachingCount = allLeads.filter(l => l.service_type === 'coaching').length;
        const teambuildingCount = allLeads.filter(l => l.service_type === 'teambuilding').length;

        // Stats par provenance
        const sourceStats = {};
        allLeads.forEach(lead => {
            const source = lead.source_manuelle || lead.source_auto || 'Inconnu';
            sourceStats[source] = (sourceStats[source] || 0) + 1;
        });

        container.innerHTML = `
            <!-- Stats Clés -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                <div class="stat-card">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 1rem;">
                        <i class="fas fa-users" style="font-size: 2.5rem; color: #60a5fa;"></i>
                        <div>
                            <div class="stat-value" style="color: #60a5fa; font-size: 2.5rem;">${totalLeads}</div>
                            <div class="stat-label">Total Leads</div>
                        </div>
                    </div>
                </div>
                <div class="stat-card">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 1rem;">
                        <i class="fas fa-check-circle" style="font-size: 2.5rem; color: #4ade80;"></i>
                        <div>
                            <div class="stat-value" style="color: #4ade80; font-size: 2.5rem;">${convertis}</div>
                            <div class="stat-label">Convertis</div>
                        </div>
                    </div>
                </div>
                <div class="stat-card">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 1rem;">
                        <i class="fas fa-times-circle" style="font-size: 2.5rem; color: #f87171;"></i>
                        <div>
                            <div class="stat-value" style="color: #f87171; font-size: 2.5rem;">${nonConvertis}</div>
                            <div class="stat-label">Non convertis</div>
                        </div>
                    </div>
                </div>
                <div class="stat-card">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 1rem;">
                        <i class="fas fa-chart-line" style="font-size: 2.5rem; color: #c084fc;"></i>
                        <div>
                            <div class="stat-value" style="color: #c084fc; font-size: 2.5rem;">${tauxConversion}%</div>
                            <div class="stat-label">Taux de conversion</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Graphiques - 3 sur la même ligne -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;">
                <!-- Provenance des leads -->
                <div class="stat-card" style="padding: 1.5rem;">
                    <h3 style="color: white; font-size: 1.05rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-chart-bar" style="color: #60a5fa;"></i>
                        Provenance
                    </h3>
                    <div style="height: 280px; position: relative;">
                        <canvas id="sourceChart"></canvas>
                    </div>
                </div>

                <!-- Services demandés -->
                <div class="stat-card" style="padding: 1.5rem;">
                    <h3 style="color: white; font-size: 1.05rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-dumbbell" style="color: #4CAF50;"></i>
                        Services
                    </h3>
                    <div style="height: 280px; position: relative;">
                        <canvas id="servicesChart"></canvas>
                    </div>
                </div>

                <!-- Statut de conversion -->
                <div class="stat-card" style="padding: 1.5rem;">
                    <h3 style="color: white; font-size: 1.05rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-chart-pie" style="color: #fbbf24;"></i>
                        Conversion
                    </h3>
                    <div style="height: 280px; position: relative;">
                        <canvas id="conversionChart"></canvas>
                    </div>
                </div>
            </div>
        `;

        // Attendre que les canvas soient dans le DOM
        setTimeout(() => {
            renderCharts(
                sourceStats,
                fitnessCount,
                pilatesCount,
                coachingCount,
                teambuildingCount,
                convertis,
                nonConvertis
            );
        }, 100);
    }

    /**
     * Affiche les graphiques Chart.js
     * @param sourceStats
     * @param fitnessCount
     * @param pilatesCount
     * @param coachingCount
     * @param teambuildingCount
     * @param convertis
     * @param nonConvertis
     */
    function renderCharts(
        sourceStats,
        fitnessCount,
        pilatesCount,
        coachingCount,
        teambuildingCount,
        convertis,
        nonConvertis
    ) {
        // Calculer les convertis par type
        const convertisAbonnement = allLeads.filter(
            l => l.status === STATUSES.CONVERTI_ABONNEMENT
        ).length;
        const convertisCarnets = allLeads.filter(
            l => l.status === STATUSES.CONVERTI_CARNETS
        ).length;

        // Graphique Provenance
        const sourceCtx = document.getElementById('sourceChart');
        if (sourceCtx) {
            new Chart(sourceCtx, {
                type: 'bar',
                data: {
                    labels: Object.keys(sourceStats),
                    datasets: [
                        {
                            label: 'Nombre de leads',
                            data: Object.values(sourceStats),
                            backgroundColor: [
                                'rgba(96, 165, 250, 0.8)',
                                'rgba(251, 191, 36, 0.8)',
                                'rgba(192, 132, 252, 0.8)',
                                'rgba(74, 222, 128, 0.8)',
                                'rgba(248, 113, 113, 0.8)',
                                'rgba(168, 85, 247, 0.8)'
                            ],
                            borderColor: [
                                '#60a5fa',
                                '#fbbf24',
                                '#c084fc',
                                '#4ade80',
                                '#f87171',
                                '#a855f7'
                            ],
                            borderWidth: 2
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: 'rgba(255,255,255,0.8)',
                                font: { weight: '600', size: 12 }
                            },
                            grid: { color: 'rgba(255,255,255,0.1)' }
                        },
                        x: {
                            ticks: {
                                color: 'rgba(255,255,255,0.8)',
                                font: { weight: '600', size: 12 }
                            },
                            grid: { color: 'rgba(255,255,255,0.1)' }
                        }
                    }
                }
            });
        }

        // Graphique Services
        const servicesCtx = document.getElementById('servicesChart');
        if (servicesCtx) {
            new Chart(servicesCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Fitness', 'Pilates', 'Coaching', 'Team Building'],
                    datasets: [
                        {
                            data: [fitnessCount, pilatesCount, coachingCount, teambuildingCount],
                            backgroundColor: [
                                'rgba(76, 175, 80, 0.8)',
                                'rgba(231, 150, 73, 0.8)',
                                'rgba(255, 107, 53, 0.8)',
                                'rgba(147, 51, 234, 0.8)'
                            ],
                            borderColor: ['#4CAF50', '#e79649', '#FF6B35', '#9333ea'],
                            borderWidth: 3
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: 'rgba(255,255,255,0.9)',
                                font: { size: 13, weight: '600' },
                                padding: 15
                            }
                        }
                    }
                }
            });
        }

        // Graphique Conversion (avec détail Abonnement/Carnets)
        const conversionCtx = document.getElementById('conversionChart');
        if (conversionCtx) {
            new Chart(conversionCtx, {
                type: 'bar',
                data: {
                    labels: ['Abonnement', 'Carnets', 'Non Convertis'],
                    datasets: [
                        {
                            label: 'Nombre de leads',
                            data: [convertisAbonnement, convertisCarnets, nonConvertis],
                            backgroundColor: [
                                'rgba(74, 222, 128, 0.8)',
                                'rgba(52, 211, 153, 0.8)',
                                'rgba(248, 113, 113, 0.8)'
                            ],
                            borderColor: ['#4ade80', '#34d399', '#f87171'],
                            borderWidth: 2,
                            barThickness: 60
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: 'rgba(255,255,255,0.8)',
                                font: { weight: '600', size: 13 }
                            },
                            grid: { color: 'rgba(255,255,255,0.1)' }
                        },
                        x: {
                            ticks: {
                                color: 'rgba(255,255,255,0.8)',
                                font: { weight: '600', size: 13 }
                            },
                            grid: { color: 'rgba(255,255,255,0.1)' }
                        }
                    }
                }
            });
        }
    }

    /**
     * Charge les leads depuis Supabase
     */
    async function loadLeads() {
        try {
            const config = getSupabaseConfig();
            let url = `${config.url}/rest/v1/${TABLE_NAME}?order=created_at.desc&limit=500`;

            const response = await fetch(url, {
                headers: {
                    apikey: config.anonKey,
                    Authorization: `Bearer ${config.anonKey}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur chargement leads');
            }

            allLeads = await response.json();
            console.log(`✅ ${allLeads.length} leads chargés`);

            // Afficher le dashboard avec les stats
            renderDashboard();

            // Mettre à jour les compteurs des tabs
            updateTabCounts();

            // Afficher le tableau
            renderTable();
        } catch (error) {
            console.error('❌ Erreur chargement leads:', error);
            showError('Impossible de charger les leads');
        }
    }

    /**
     * Calcule la couleur de fond de la ligne selon l'ancienneté
     * Uniquement pour les prospects et contactés
     * @param lead
     */
    function getRowColor(lead) {
        // Couleur par ancienneté seulement pour prospects et contactés
        if (lead.status !== STATUSES.PROSPECT && lead.status !== STATUSES.CONTACTE_ATTENTE) {
            return 'transparent';
        }

        const now = new Date();
        const createdAt = new Date(lead.created_at);
        const diffHours = (now - createdAt) / (1000 * 60 * 60);
        const diffDays = diffHours / 24;

        if (diffHours < 24) {
            return 'rgba(34, 197, 94, 0.15)'; // Vert clair (moins de 24h)
        } else if (diffDays < 7) {
            return 'rgba(251, 146, 60, 0.15)'; // Orange (moins d'une semaine)
        } else {
            return 'rgba(239, 68, 68, 0.15)'; // Rouge (plus d'une semaine)
        }
    }

    /**
     * Retourne les leads filtrés selon l'onglet actif
     */
    function getFilteredLeads() {
        switch (currentTab) {
            case TABS.HOME:
                // Accueil : Prospects + Contactés
                return allLeads.filter(
                    l => l.status === STATUSES.PROSPECT || l.status === STATUSES.CONTACTE_ATTENTE
                );
            case TABS.PROSPECT:
                return allLeads.filter(l => l.status === STATUSES.PROSPECT);
            case TABS.CONTACTE:
                return allLeads.filter(l => l.status === STATUSES.CONTACTE_ATTENTE);
            case TABS.RDV:
                return allLeads.filter(l => l.status === STATUSES.RDV_ESSAI);
            case TABS.CONVERTI:
                return allLeads.filter(
                    l =>
                        l.status === STATUSES.CONVERTI_ABONNEMENT ||
                        l.status === STATUSES.CONVERTI_CARNETS
                );
            case TABS.NON_CONVERTI:
                return allLeads.filter(l => l.status === STATUSES.NON_CONVERTI_PRIX);
            case TABS.LISTE_ROUGE:
                return allLeads.filter(l => l.status === STATUSES.LISTE_ROUGE);
            case TABS.ALL:
            default:
                return allLeads;
        }
    }

    /**
     * Met à jour les compteurs dans les onglets
     */
    function updateTabCounts() {
        const homeCount = allLeads.filter(
            l => l.status === STATUSES.PROSPECT || l.status === STATUSES.CONTACTE_ATTENTE
        ).length;
        const prospectCount = allLeads.filter(l => l.status === STATUSES.PROSPECT).length;
        const contacteCount = allLeads.filter(l => l.status === STATUSES.CONTACTE_ATTENTE).length;
        const rdvCount = allLeads.filter(l => l.status === STATUSES.RDV_ESSAI).length;
        const convertiCount = allLeads.filter(
            l => l.status === STATUSES.CONVERTI_ABONNEMENT || l.status === STATUSES.CONVERTI_CARNETS
        ).length;
        const nonConvertiCount = allLeads.filter(
            l => l.status === STATUSES.NON_CONVERTI_PRIX
        ).length;
        const listeRougeCount = allLeads.filter(l => l.status === STATUSES.LISTE_ROUGE).length;

        document.querySelector('[data-tab="home"]').innerHTML =
            `<i class="fas fa-home"></i> Accueil (${homeCount})`;
        document.querySelector('[data-tab="prospect"]').innerHTML =
            `<i class="fas fa-user-plus"></i> Prospects (${prospectCount})`;
        document.querySelector('[data-tab="contacte_attente"]').innerHTML =
            `<i class="fas fa-phone"></i> Contactés (${contacteCount})`;
        document.querySelector('[data-tab="rdv_essai"]').innerHTML =
            `<i class="fas fa-calendar-check"></i> RDV Essai (${rdvCount})`;
        document.querySelector('[data-tab="converti"]').innerHTML =
            `<i class="fas fa-check-circle"></i> Convertis (${convertiCount})`;
        document.querySelector('[data-tab="non_converti_prix"]').innerHTML =
            `<i class="fas fa-times-circle"></i> Non convertis (${nonConvertiCount})`;
        document.querySelector('[data-tab="liste_rouge"]').innerHTML =
            `<i class="fas fa-ban"></i> Liste rouge (${listeRougeCount})`;
        document.querySelector('[data-tab="all"]').innerHTML =
            `<i class="fas fa-list"></i> Tous (${allLeads.length})`;
    }

    /**
     * Change l'onglet actif
     * @param tabName
     */
    function switchTab(tabName) {
        currentTab = tabName;

        // Cas spécial : Onglet Stats - Charger le dashboard analytics
        if (tabName === 'stats') {
            loadStatsView();
            return;
        }

        // Mettre à jour l'UI des onglets
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Re-render le tableau
        renderTable();
    }

    /**
     * Charge la vue Statistiques (crm-stats.html content)
     */
    async function loadStatsView() {
        // Mettre à jour l'UI des onglets
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('[data-tab="stats"]').classList.add('active');

        const container = document.getElementById('leadsTableContainer');
        if (!container) {
            return;
        }

        container.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 0; min-height: 80vh;">
                <iframe src="crm-stats.html" style="width: 100%; height: 85vh; border: none; border-radius: 12px;"></iframe>
            </div>
        `;
    }

    /**
     * Affiche le tableau des leads
     */
    function renderTable() {
        const container = document.getElementById('leadsTableContainer');
        if (!container) {
            return;
        }

        // Utiliser getFilteredLeads() pour filtrer selon l'onglet
        const filteredLeads = getFilteredLeads();

        // Séparer les leads classiques et Team Building
        const classicLeads = filteredLeads.filter(l => l.service_type !== 'teambuilding');
        const teambuildingLeads = filteredLeads.filter(l => l.service_type === 'teambuilding');

        if (filteredLeads.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: rgba(255,255,255,0.6);">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>Aucun lead pour le moment</p>
                </div>
            `;
            return;
        }

        // Vérifier si on affiche l'onglet Convertis pour ajouter la colonne Type
        const showConversionType = currentTab === TABS.CONVERTI;

        // === TABLEAU 1 : LEADS CLASSIQUES (Fitness, Pilates, Coaching) ===
        let classicTableHTML = '';
        if (classicLeads.length > 0) {
            classicTableHTML = `
                <div style="margin-bottom: 3rem;">
                    <h3 style="color: rgba(255,255,255,0.9); font-size: 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-dumbbell" style="color: var(--accent-primary);"></i>
                        Fitness, Pilates & Coaching
                        <span style="background: rgba(76, 175, 80, 0.2); color: #4CAF50; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem; font-weight: 700; margin-left: 0.5rem;">
                            ${classicLeads.length}
                        </span>
                    </h3>
                    <div style="overflow-x: auto;">
                        <table class="leads-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Nom</th>
                                    <th>Email</th>
                                    <th>Téléphone</th>
                                    <th>Service</th>
                                    <th>Objectif</th>
                                    <th>Source</th>
                                    <th>Statut</th>
                                    ${showConversionType ? '<th>Type</th>' : ''}
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${classicLeads
                                    .map(lead => {
                                        const rowColor = getRowColor(lead);
                                        return `
                                    <tr style="background: ${rowColor};">
                                        <td style="white-space: nowrap;">
                                            ${new Date(lead.created_at).toLocaleDateString('fr-FR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            })}
                                            <br>
                                            <small style="color: rgba(255,255,255,0.5);">
                                                ${new Date(lead.created_at).toLocaleTimeString('fr-FR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </small>
                                        </td>
                                        <td><strong>${lead.prenom || '-'}</strong></td>
                                        <td>${lead.email || '-'}</td>
                                        <td>${lead.telephone || '-'}</td>
                                        <td>
                                            ${getServiceBadge(lead.service_type)}
                                        </td>
                                        <td>${lead.objectif || '-'}</td>
                                        <td><small>${lead.source_manuelle || lead.source_auto || '-'}</small></td>
                                        <td>
                                            ${getStatusDropdown(lead.id, lead.status)}
                                        </td>
                                        ${showConversionType ? `<td>${getConversionTypeBadge(lead.status)}</td>` : ''}
                                        <td style="white-space: nowrap;">
                                            <button class="action-btn whatsapp-btn" onclick="CRMManager.sendWhatsApp('${lead.id}')" title="Envoyer WhatsApp">
                                                <i class="fab fa-whatsapp"></i>
                                            </button>
                                            <button class="action-btn email-btn" onclick="CRMManager.sendEmail('${lead.id}')" title="Envoyer Email">
                                                <i class="fas fa-envelope"></i>
                                            </button>
                                            <button class="action-btn" onclick="CRMManager.viewDetails('${lead.id}')" title="Voir détails">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button class="action-btn delete-btn" onclick="CRMManager.deleteLead('${lead.id}')" title="Supprimer">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `;
                                    })
                                    .join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        // === TABLEAU 2 : LEADS TEAM BUILDING ===
        let teambuildingTableHTML = '';
        if (teambuildingLeads.length > 0) {
            teambuildingTableHTML = `
                <div>
                    <h3 style="color: rgba(255,255,255,0.9); font-size: 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-building" style="color: #9333ea;"></i>
                        Team Building
                        <span style="background: rgba(147, 51, 234, 0.2); color: #9333ea; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem; font-weight: 700; margin-left: 0.5rem;">
                            ${teambuildingLeads.length}
                        </span>
                    </h3>
                    <div style="overflow-x: auto;">
                        <table class="leads-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Nom</th>
                                    <th>Email</th>
                                    <th>Téléphone</th>
                                    <th>Type événement</th>
                                    <th>Participants</th>
                                    <th>Date souhaitée</th>
                                    <th>Durée</th>
                                    <th>Source</th>
                                    <th>Statut</th>
                                    ${showConversionType ? '<th>Type</th>' : ''}
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${teambuildingLeads
                                    .map(lead => {
                                        const rowColor = getRowColor(lead);
                                        return `
                                    <tr style="background: ${rowColor};">
                                        <td style="white-space: nowrap;">
                                            ${new Date(lead.created_at).toLocaleDateString('fr-FR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            })}
                                            <br>
                                            <small style="color: rgba(255,255,255,0.5);">
                                                ${new Date(lead.created_at).toLocaleTimeString('fr-FR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </small>
                                        </td>
                                        <td><strong>${lead.prenom || '-'}</strong></td>
                                        <td>${lead.email || '-'}</td>
                                        <td>${lead.telephone || '-'}</td>
                                        <td>
                                            <span style="background: rgba(147, 51, 234, 0.2); color: #9333ea; padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600;">
                                                ${lead.type_evenement || '-'}
                                            </span>
                                        </td>
                                        <td style="text-align: center;">
                                            <strong style="color: #9333ea; font-size: 1.1rem;">${lead.nb_participants || '-'}</strong>
                                        </td>
                                        <td style="white-space: nowrap;">
                                            ${lead.date_souhaitee ? new Date(lead.date_souhaitee).toLocaleDateString('fr-FR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            }) : '-'}
                                        </td>
                                        <td>${lead.duree || '-'}</td>
                                        <td><small>${lead.source_manuelle || lead.source_auto || '-'}</small></td>
                                        <td>
                                            ${getStatusDropdown(lead.id, lead.status)}
                                        </td>
                                        ${showConversionType ? `<td>${getConversionTypeBadge(lead.status)}</td>` : ''}
                                        <td style="white-space: nowrap;">
                                            <button class="action-btn whatsapp-btn" onclick="CRMManager.sendWhatsApp('${lead.id}')" title="Envoyer WhatsApp">
                                                <i class="fab fa-whatsapp"></i>
                                            </button>
                                            <button class="action-btn email-btn" onclick="CRMManager.sendEmail('${lead.id}')" title="Envoyer Email">
                                                <i class="fas fa-envelope"></i>
                                            </button>
                                            <button class="action-btn" onclick="CRMManager.viewDetails('${lead.id}')" title="Voir détails">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button class="action-btn delete-btn" onclick="CRMManager.deleteLead('${lead.id}')" title="Supprimer">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `;
                                    })
                                    .join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        // Combiner les 2 tableaux
        container.innerHTML = classicTableHTML + teambuildingTableHTML;
    }

    /**
     * Génère un badge pour le type de service
     * @param serviceType
     */
    function getServiceBadge(serviceType) {
        const badges = {
            fitness:
                '<span style="background: rgba(76, 175, 80, 0.2); color: #4CAF50; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;"><i class="fas fa-dumbbell"></i> FITNESS</span>',
            pilates:
                '<span style="background: rgba(231, 150, 73, 0.2); color: #e79649; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;"><i class="fas fa-spa"></i> PILATES</span>',
            coaching:
                '<span style="background: rgba(255, 107, 53, 0.2); color: #FF6B35; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;"><i class="fas fa-user-tie"></i> COACHING</span>',
            teambuilding:
                '<span style="background: rgba(147, 51, 234, 0.2); color: #9333ea; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;"><i class="fas fa-users"></i> TEAM BUILDING</span>'
        };
        return badges[serviceType] || serviceType;
    }

    /**
     * Génère un badge pour le type de conversion
     * @param status
     */
    function getConversionTypeBadge(status) {
        if (status === STATUSES.CONVERTI_ABONNEMENT) {
            return '<span style="background: rgba(74, 222, 128, 0.2); color: #4ade80; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;"><i class="fas fa-calendar-alt"></i> Abonnement</span>';
        } else if (status === STATUSES.CONVERTI_CARNETS) {
            return '<span style="background: rgba(52, 211, 153, 0.2); color: #34d399; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;"><i class="fas fa-ticket-alt"></i> Carnets</span>';
        }
        return '-';
    }

    /**
     * Génère un dropdown pour changer le statut
     * @param leadId
     * @param currentStatus
     */
    function getStatusDropdown(leadId, currentStatus) {
        const color = STATUS_COLORS[currentStatus] || '#888';

        let optionsHTML = '';
        for (const [statusCode, statusLabel] of Object.entries(STATUS_LABELS)) {
            const statusColor = STATUS_COLORS[statusCode];
            const selected = statusCode === currentStatus ? 'selected' : '';
            optionsHTML += `<option value="${statusCode}" ${selected} data-color="${statusColor}">${statusLabel}</option>`;
        }

        return `
            <select
                class="status-dropdown"
                onchange="CRMManager.updateStatusFromDropdown('${leadId}', this.value)"
                style="
                    background: ${color}20;
                    color: ${color};
                    border: 1px solid ${color}40;
                    padding: 0.35rem 0.85rem;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    cursor: pointer;
                    outline: none;
                    min-width: 180px;
                "
            >
                ${optionsHTML}
            </select>
        `;
    }

    /**
     * Met à jour le statut depuis le dropdown
     * @param leadId
     * @param newStatus
     */
    async function updateStatusFromDropdown(leadId, newStatus) {
        if (!Object.values(STATUSES).includes(newStatus)) {
            alert('❌ Statut invalide !');
            return;
        }

        try {
            const config = getSupabaseConfig();
            const response = await fetch(`${config.url}/rest/v1/${TABLE_NAME}?id=eq.${leadId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    apikey: config.anonKey,
                    Authorization: `Bearer ${config.anonKey}`,
                    Prefer: 'return=minimal'
                },
                body: JSON.stringify({
                    status: newStatus
                })
            });

            if (!response.ok) {
                throw new Error('Erreur mise à jour');
            }

            console.log(`✅ Statut mis à jour vers : ${STATUS_LABELS[newStatus]}`);
            await loadData(); // Recharger les données
        } catch (error) {
            console.error('❌ Erreur:', error);
            alert('❌ Erreur lors de la mise à jour du statut');
        }
    }

    /**
     * Supprime un lead
     * @param leadId
     */
    async function deleteLead(leadId) {
        if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer ce lead ?')) {
            return;
        }

        try {
            const config = getSupabaseConfig();
            const response = await fetch(`${config.url}/rest/v1/${TABLE_NAME}?id=eq.${leadId}`, {
                method: 'DELETE',
                headers: {
                    apikey: config.anonKey,
                    Authorization: `Bearer ${config.anonKey}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur suppression');
            }

            console.log('✅ Lead supprimé');
            await loadData(); // Recharger les données
        } catch (error) {
            console.error('❌ Erreur:', error);
            alert('❌ Erreur lors de la suppression');
        }
    }

    /**
     * Affiche la modale de sélection du numéro d'envoi WhatsApp
     * @param leadId
     */
    function sendWhatsApp(leadId) {
        const lead = allLeads.find(l => l.id === leadId);
        if (!lead) {
            return;
        }

        // Suggestion automatique selon le service
        const suggestedSender = lead.service_type === 'pilates' ? 'EVA' : 'OLIVIER';

        // Créer la modale de sélection
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.2s ease;
        `;

        modal.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                border-radius: 20px;
                padding: 2.5rem;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.1);
                animation: slideUp 0.3s ease;
            ">
                <h3 style="
                    margin: 0 0 1.5rem 0;
                    color: #fff;
                    font-size: 1.5rem;
                    font-weight: 700;
                    text-align: center;
                ">
                    <i class="fab fa-whatsapp" style="color: #25D366; margin-right: 0.5rem;"></i>
                    Choisir l'expéditeur
                </h3>

                <p style="
                    color: rgba(255, 255, 255, 0.7);
                    text-align: center;
                    margin-bottom: 2rem;
                    font-size: 0.95rem;
                ">
                    Sélectionnez le numéro depuis lequel envoyer le message WhatsApp
                </p>

                <div style="display: flex; gap: 1rem; margin-bottom: 2rem;">
                    <button id="select-olivier" style="
                        flex: 1;
                        padding: 1.5rem;
                        border: 2px solid ${suggestedSender === 'OLIVIER' ? '#4CAF50' : 'rgba(255, 255, 255, 0.2)'};
                        background: ${suggestedSender === 'OLIVIER' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 255, 255, 0.05)'};
                        border-radius: 12px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        position: relative;
                    ">
                        <div style="text-align: center;">
                            <div style="
                                font-size: 2rem;
                                margin-bottom: 0.5rem;
                            ">👨‍💼</div>
                            <div style="
                                color: #fff;
                                font-weight: 600;
                                font-size: 1.1rem;
                                margin-bottom: 0.25rem;
                            ">Olivier</div>
                            <div style="
                                color: rgba(255, 255, 255, 0.5);
                                font-size: 0.85rem;
                            ">Fitness • Coaching</div>
                            ${
                                suggestedSender === 'OLIVIER'
                                    ? `
                            <div style="
                                margin-top: 0.5rem;
                                padding: 0.25rem 0.75rem;
                                background: rgba(76, 175, 80, 0.3);
                                border-radius: 20px;
                                font-size: 0.75rem;
                                color: #4CAF50;
                                font-weight: 600;
                            ">✓ Suggéré</div>
                            `
                                    : ''
                            }
                        </div>
                    </button>

                    <button id="select-eva" style="
                        flex: 1;
                        padding: 1.5rem;
                        border: 2px solid ${suggestedSender === 'EVA' ? '#E91E63' : 'rgba(255, 255, 255, 0.2)'};
                        background: ${suggestedSender === 'EVA' ? 'rgba(233, 30, 99, 0.15)' : 'rgba(255, 255, 255, 0.05)'};
                        border-radius: 12px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        position: relative;
                    ">
                        <div style="text-align: center;">
                            <div style="
                                font-size: 2rem;
                                margin-bottom: 0.5rem;
                            ">👩‍💼</div>
                            <div style="
                                color: #fff;
                                font-weight: 600;
                                font-size: 1.1rem;
                                margin-bottom: 0.25rem;
                            ">Eva</div>
                            <div style="
                                color: rgba(255, 255, 255, 0.5);
                                font-size: 0.85rem;
                            ">Pilates</div>
                            ${
                                suggestedSender === 'EVA'
                                    ? `
                            <div style="
                                margin-top: 0.5rem;
                                padding: 0.25rem 0.75rem;
                                background: rgba(233, 30, 99, 0.3);
                                border-radius: 20px;
                                font-size: 0.75rem;
                                color: #E91E63;
                                font-weight: 600;
                            ">✓ Suggéré</div>
                            `
                                    : ''
                            }
                        </div>
                    </button>
                </div>

                <button id="cancel-modal" style="
                    width: 100%;
                    padding: 1rem;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    background: transparent;
                    border-radius: 10px;
                    color: rgba(255, 255, 255, 0.7);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 0.95rem;
                ">
                    Annuler
                </button>
            </div>

            <style>
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                #select-olivier:hover, #select-eva:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
                }
                #cancel-modal:hover {
                    background: rgba(255, 255, 255, 0.05);
                }
            </style>
        `;

        document.body.appendChild(modal);

        // Gestion des événements
        document.getElementById('select-olivier').addEventListener('click', () => {
            openWhatsAppWithSender(lead, TEAM_PHONES.OLIVIER);
            document.body.removeChild(modal);
        });

        document.getElementById('select-eva').addEventListener('click', () => {
            openWhatsAppWithSender(lead, TEAM_PHONES.EVA);
            document.body.removeChild(modal);
        });

        document.getElementById('cancel-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Fermer avec ESC ou clic sur le fond
        modal.addEventListener('click', e => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                if (document.body.contains(modal)) {
                    document.body.removeChild(modal);
                }
                document.removeEventListener('keydown', escHandler);
            }
        });
    }

    /**
     * Ouvre WhatsApp avec le numéro de l'expéditeur sélectionné
     * @param lead
     * @param sender
     */
    function openWhatsAppWithSender(lead, sender) {
        const prenom = lead.prenom || 'Cher prospect';
        const service =
            lead.service_type === 'fitness'
                ? 'Fitness'
                : lead.service_type === 'pilates'
                  ? 'Pilates'
                  : lead.service_type === 'teambuilding'
                    ? 'Team Building'
                    : 'Coaching';
        const objectif = lead.objectif || 'vos objectifs';

        // Message personnalisé avec signature de l'expéditeur
        const message = `Bonjour ${prenom} !

C'est Olivier de La Skàli qui te contacte suite à ta demande d'information pour nos cours. Désolé du petit retard, le weekend fut chargé ^^

Pourquoi souhaites tu venir à la Skàli ? (histoire de te connaitre un peu) et quand serais-tu disponible pour ta séance d'essai ?

Au plaisir

Olivier - Coach et Gérant de La Skàli`;

        // Nettoyer le numéro de téléphone du lead
        let clientPhone = (lead.telephone || '').replace(/[\s\-\(\)]/g, '');

        // Si le numéro commence par 0, le remplacer par +33
        if (clientPhone.startsWith('0')) {
            clientPhone = '+33' + clientPhone.substring(1);
        }

        // Encoder le message pour l'URL
        const encodedMessage = encodeURIComponent(message);

        // Créer l'URL WhatsApp avec le numéro de l'expéditeur
        // Note: Pour utiliser un numéro spécifique, on utilise wa.me avec le paramètre phone
        // L'utilisateur devra être connecté avec ce numéro sur WhatsApp Web
        const whatsappUrl = `https://wa.me/${clientPhone}?text=${encodedMessage}`;

        // Ouvrir WhatsApp
        window.open(whatsappUrl, '_blank');

        // Afficher une notification
        if (window.Utils && window.Utils.showNotification) {
            Utils.showNotification(
                `Message WhatsApp préparé pour ${lead.prenom} (via ${sender.name})`,
                'success'
            );
        }
    }

    /**
     * Envoie un email pré-rempli
     * @param leadId
     */
    function sendEmail(leadId) {
        const lead = allLeads.find(l => l.id === leadId);
        if (!lead) {
            return;
        }

        const prenom = lead.prenom || 'Cher prospect';
        const service =
            lead.service_type === 'fitness'
                ? 'Fitness'
                : lead.service_type === 'pilates'
                  ? 'Pilates'
                  : lead.service_type === 'teambuilding'
                    ? 'Team Building'
                    : 'Coaching';
        const objectif = lead.objectif || 'vos objectifs';

        const subject = `${prenom}, votre séance d'essai gratuite à La Skàli vous attend ! 🎉`;

        const body = `Bonjour ${prenom},

C'est l'équipe de La Skàli qui vous contacte suite à votre demande d'information pour nos cours de ${service}.

Nous avons bien noté votre intérêt pour ${objectif} et nous serions ravis de vous accompagner dans cette démarche !

Nous vous proposons une séance d'essai GRATUITE pour découvrir notre studio et nos coachs dans une ambiance conviviale et bienveillante.

📍 Notre studio se situe à [ADRESSE]
⏰ Nos créneaux disponibles : [HORAIRES]

Quand seriez-vous disponible cette semaine pour votre séance découverte ?

N'hésitez pas à nous répondre directement à cet email ou à nous appeler au [TÉLÉPHONE].

Au plaisir d'échanger avec vous !

Sportivement,
L'équipe La Skàli

---
La Skàli - Studio Fitness, Pilates & Coaching
[ADRESSE]
[TÉLÉPHONE]
[SITE WEB]`;

        // Encoder pour mailto
        const encodedSubject = encodeURIComponent(subject);
        const encodedBody = encodeURIComponent(body);

        // Ouvrir le client email
        window.location.href = `mailto:${lead.email}?subject=${encodedSubject}&body=${encodedBody}`;
    }

    /**
     * Affiche les détails d'un lead
     * @param leadId
     */
    function viewDetails(leadId) {
        const lead = allLeads.find(l => l.id === leadId);
        if (!lead) {
            return;
        }

        let detailsText = '📋 DÉTAILS DU LEAD\n\n' +
            `Nom: ${lead.prenom}\n` +
            `Email: ${lead.email}\n` +
            `Téléphone: ${lead.telephone}\n` +
            `Service: ${lead.service_type}\n` +
            `Objectif: ${lead.objectif || 'Non renseigné'}\n` +
            `Créneau: ${lead.creneau || 'Non renseigné'}\n`;

        // Ajouter les champs spécifiques Team Building
        if (lead.service_type === 'teambuilding') {
            detailsText += `\n🏢 INFOS TEAM BUILDING:\n`;
            detailsText += `Type d'événement: ${lead.type_evenement || 'Non renseigné'}\n`;
            detailsText += `Nombre de participants: ${lead.nb_participants || 'Non renseigné'}\n`;
            detailsText += `Date souhaitée: ${lead.date_souhaitee || 'Non renseigné'}\n`;
            detailsText += `Durée: ${lead.duree || 'Non renseigné'}\n`;
            if (lead.message) {
                detailsText += `Message: ${lead.message}\n`;
            }
            detailsText += '\n';
        }

        detailsText += `Source: ${lead.source_manuelle || lead.source_auto}\n` +
            `Statut: ${lead.status}\n` +
            `Date: ${new Date(lead.created_at).toLocaleString('fr-FR')}\n` +
            `Notes: ${lead.notes || 'Aucune note'}`;

        alert(detailsText);
    }

    /**
     * Change le statut d'un lead
     * @param leadId
     */
    async function changeStatus(leadId) {
        const lead = allLeads.find(l => l.id === leadId);
        if (!lead) {
            return;
        }

        const newStatus = prompt(
            `Changer le statut de ${lead.prenom}\n\n` +
                `Statut actuel: ${lead.status}\n\n` +
                'Nouveau statut ?\n' +
                '- nouveau\n' +
                '- contacte\n' +
                '- qualifie\n' +
                '- converti\n' +
                '- perdu',
            lead.status
        );

        if (!newStatus) {
            return;
        }

        const validStatuses = ['nouveau', 'contacte', 'qualifie', 'converti', 'perdu'];
        if (!validStatuses.includes(newStatus)) {
            alert('❌ Statut invalide !');
            return;
        }

        try {
            const config = getSupabaseConfig();
            const response = await fetch(`${config.url}/rest/v1/${TABLE_NAME}?id=eq.${leadId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    apikey: config.anonKey,
                    Authorization: `Bearer ${config.anonKey}`,
                    Prefer: 'return=minimal'
                },
                body: JSON.stringify({
                    status: newStatus,
                    converted: newStatus === 'converti',
                    converted_at: newStatus === 'converti' ? new Date().toISOString() : null
                })
            });

            if (!response.ok) {
                throw new Error('Erreur mise à jour');
            }

            alert('✅ Statut mis à jour !');
            await loadData(); // Recharger les données
        } catch (error) {
            console.error('❌ Erreur:', error);
            alert('❌ Erreur lors de la mise à jour');
        }
    }

    /**
     * Rafraîchit toutes les données
     */
    async function refresh() {
        console.log('🔄 Rafraîchissement CRM...');
        await loadData();
    }

    /**
     * Affiche un message d'erreur
     * @param message
     */
    function showError(message) {
        const container = document.getElementById('leadsTableContainer');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #f87171;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>${message}</p>
                </div>
            `;
        }
    }

    // API publique
    return {
        show,
        refresh,
        switchTab,
        viewDetails,
        changeStatus,
        updateStatusFromDropdown,
        deleteLead,
        sendWhatsApp,
        sendEmail
    };
})();

// Fonction globale pour ouvrir le CRM
window.CRMManager_show = function () {
    CRMManager.show();
};
