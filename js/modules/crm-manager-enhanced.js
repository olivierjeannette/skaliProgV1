/**
 * 📊 CRM MANAGER AMÉLIORÉ - Gestion des Leads La Skàli
 *
 * Module de gestion centralisée des leads avec :
 * - Dashboard avec statistiques RÉELLES et graphiques Chart.js
 * - Provenance des formulaires (Instagram, Google, Facebook, etc.)
 * - Graphiques en barres pour visualisation
 * - Système de statuts détaillé (Prospect → Contacté → RDV → Converti)
 * - Filtrage par statuts avec onglets spécifiques
 * - Page d'accueil affichant uniquement Prospects et Contactés
 * - Fonction de suppression de prospects
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

    // Nouveaux statuts détaillés
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
        non_converti_prix: '#fb923c',
        liste_rouge: '#f87171'
    };

    // État local
    let currentTab = 'home'; // home = accueil avec prospects + contactés
    let allLeads = [];
    let stats = {};
    let charts = {}; // Stockage des instances Chart.js

    /**
     * Initialise et affiche le module CRM
     */
    async function show() {
        console.log('📊 Initialisation CRM Manager Amélioré...');

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

                <!-- Graphiques -->
                <div id="chartsContainer" style="margin-bottom: 2rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                    <!-- Graphique provenance -->
                    <div style="background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.5rem;">
                        <h3 style="color: white; font-size: 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-bullhorn" style="color: var(--accent-primary);"></i>
                            Provenance des Leads
                        </h3>
                        <canvas id="sourceChart" style="max-height: 300px;"></canvas>
                    </div>

                    <!-- Graphique par statut -->
                    <div style="background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.5rem;">
                        <h3 style="color: white; font-size: 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-tasks" style="color: var(--accent-primary);"></i>
                            Répartition par Statut
                        </h3>
                        <canvas id="statusChart" style="max-height: 300px;"></canvas>
                    </div>
                </div>

                <!-- Tabs Navigation -->
                <div class="crm-tabs" style="margin-bottom: 2rem; display: flex; gap: 0.5rem; border-bottom: 2px solid rgba(255,255,255,0.1); padding-bottom: 1rem; flex-wrap: wrap;">
                    <button onclick="CRMManager.switchTab('home')" data-tab="home" class="tab-btn active">
                        <i class="fas fa-home"></i> Accueil (0)
                    </button>
                    <button onclick="CRMManager.switchTab('prospect')" data-tab="prospect" class="tab-btn">
                        <i class="fas fa-user-plus"></i> Prospects (0)
                    </button>
                    <button onclick="CRMManager.switchTab('contacte_attente')" data-tab="contacte_attente" class="tab-btn">
                        <i class="fas fa-phone"></i> Contactés (0)
                    </button>
                    <button onclick="CRMManager.switchTab('rdv_essai')" data-tab="rdv_essai" class="tab-btn">
                        <i class="fas fa-calendar-check"></i> RDV Essai (0)
                    </button>
                    <button onclick="CRMManager.switchTab('converti')" data-tab="converti" class="tab-btn">
                        <i class="fas fa-check-circle"></i> Convertis (0)
                    </button>
                    <button onclick="CRMManager.switchTab('non_converti')" data-tab="non_converti" class="tab-btn">
                        <i class="fas fa-times-circle"></i> Non Convertis (0)
                    </button>
                    <button onclick="CRMManager.switchTab('liste_rouge')" data-tab="liste_rouge" class="tab-btn">
                        <i class="fas fa-trash"></i> Liste Rouge (0)
                    </button>
                    <button onclick="CRMManager.switchTab('all')" data-tab="all" class="tab-btn">
                        <i class="fas fa-list"></i> Tous (0)
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
                .crm-container .tab-btn {
                    padding: 0.75rem 1.5rem;
                    background: rgba(255,255,255,0.05);
                    border: none;
                    border-radius: 8px 8px 0 0;
                    color: rgba(255,255,255,0.7);
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .crm-container .tab-btn:hover {
                    background: rgba(255,255,255,0.1) !important;
                    transform: translateY(-2px);
                }

                .crm-container .tab-btn.active {
                    background: var(--accent-primary) !important;
                    color: white !important;
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
                    padding: 0.35rem 0.85rem;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    white-space: nowrap;
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

                .action-btn.delete-btn {
                    background: rgba(239, 68, 68, 0.2);
                    border-color: rgba(239, 68, 68, 0.3);
                }

                .action-btn.delete-btn:hover {
                    background: rgba(239, 68, 68, 0.3);
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

            // Créer les graphiques
            createCharts();
        } catch (error) {
            console.error('❌ Erreur chargement CRM:', error);
            showError('Impossible de charger les données. Vérifiez votre configuration Supabase.');
        }
    }

    /**
     * Charge les statistiques depuis Supabase
     */
    async function loadStats() {
        try {
            const config = getSupabaseConfig();

            // Stats globales
            const globalResponse = await fetch(`${config.url}/rest/v1/stats_globales`, {
                headers: {
                    apikey: config.anonKey,
                    Authorization: `Bearer ${config.anonKey}`
                }
            });

            if (!globalResponse.ok) {
                throw new Error('Erreur chargement stats');
            }

            const globalData = await globalResponse.json();
            stats.global = globalData[0] || {};

            // Stats par source (pour graphique)
            const sourceResponse = await fetch(`${config.url}/rest/v1/stats_top_sources`, {
                headers: {
                    apikey: config.anonKey,
                    Authorization: `Bearer ${config.anonKey}`
                }
            });

            if (sourceResponse.ok) {
                stats.sources = await sourceResponse.json();
            }

            // Stats par statut (pour graphique)
            const statusResponse = await fetch(`${config.url}/rest/v1/stats_par_statut`, {
                headers: {
                    apikey: config.anonKey,
                    Authorization: `Bearer ${config.anonKey}`
                }
            });

            if (statusResponse.ok) {
                stats.statuts = await statusResponse.json();
            }

            // Afficher le dashboard
            renderDashboard();
        } catch (error) {
            console.error('❌ Erreur chargement stats:', error);
        }
    }

    /**
     * Affiche le dashboard avec les statistiques
     */
    function renderDashboard() {
        const container = document.getElementById('dashboardStats');
        if (!container) {
            return;
        }

        const s = stats.global || {};

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                <div class="stat-card">
                    <div class="stat-value" style="color: var(--accent-primary);">${s.total_leads || 0}</div>
                    <div class="stat-label">Total Leads</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: #60a5fa;">${s.total_prospects || 0}</div>
                    <div class="stat-label">Prospects</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: #fbbf24;">${s.total_contacte || 0}</div>
                    <div class="stat-label">Contactés</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: #c084fc;">${s.total_rdv || 0}</div>
                    <div class="stat-label">RDV Essai</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: #4ade80;">${s.total_convertis || 0}</div>
                    <div class="stat-label">Convertis</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: #34d399;">${s.taux_conversion || 0}%</div>
                    <div class="stat-label">Taux de conversion</div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                <div class="stat-card">
                    <i class="fas fa-dumbbell" style="font-size: 2rem; color: var(--accent-primary); margin-bottom: 0.5rem;"></i>
                    <div class="stat-value" style="font-size: 1.75rem;">${s.total_fitness || 0}</div>
                    <div class="stat-label">Fitness</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-spa" style="font-size: 2rem; color: #e79649; margin-bottom: 0.5rem;"></i>
                    <div class="stat-value" style="font-size: 1.75rem;">${s.total_pilates || 0}</div>
                    <div class="stat-label">Pilates</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-user-tie" style="font-size: 2rem; color: #FF6B35; margin-bottom: 0.5rem;"></i>
                    <div class="stat-value" style="font-size: 1.75rem;">${s.total_coaching || 0}</div>
                    <div class="stat-label">Coaching</div>
                </div>
            </div>
        `;
    }

    /**
     * Crée les graphiques Chart.js
     */
    function createCharts() {
        // Détruire les graphiques existants
        if (charts.source) {
            charts.source.destroy();
        }
        if (charts.status) {
            charts.status.destroy();
        }

        // Graphique provenance
        const sourceCtx = document.getElementById('sourceChart');
        if (sourceCtx && stats.sources && stats.sources.length > 0) {
            const sourceLabels = stats.sources.map(s => s.source);
            const sourceData = stats.sources.map(s => s.total);
            const sourceColors = [
                '#E1306C', // Instagram
                '#4267B2', // Facebook
                '#4285F4', // Google
                '#25D366', // WhatsApp
                '#FFD700', // Bouche à oreille
                '#FF6B35', // Autre
                '#c084fc',
                '#fbbf24'
            ];

            charts.source = new Chart(sourceCtx, {
                type: 'bar',
                data: {
                    labels: sourceLabels,
                    datasets: [
                        {
                            label: 'Nombre de leads',
                            data: sourceData,
                            backgroundColor: sourceColors.slice(0, sourceData.length),
                            borderColor: sourceColors.slice(0, sourceData.length),
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: 'rgba(255,255,255,0.7)'
                            },
                            grid: {
                                color: 'rgba(255,255,255,0.1)'
                            }
                        },
                        x: {
                            ticks: {
                                color: 'rgba(255,255,255,0.7)'
                            },
                            grid: {
                                color: 'rgba(255,255,255,0.1)'
                            }
                        }
                    }
                }
            });
        }

        // Graphique par statut
        const statusCtx = document.getElementById('statusChart');
        if (statusCtx && stats.statuts && stats.statuts.length > 0) {
            const statusLabels = stats.statuts.map(s => STATUS_LABELS[s.status] || s.status);
            const statusData = stats.statuts.map(s => s.total);
            const statusColors = stats.statuts.map(s => STATUS_COLORS[s.status] || '#888');

            charts.status = new Chart(statusCtx, {
                type: 'bar',
                data: {
                    labels: statusLabels,
                    datasets: [
                        {
                            label: 'Nombre de leads',
                            data: statusData,
                            backgroundColor: statusColors,
                            borderColor: statusColors,
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: 'rgba(255,255,255,0.7)'
                            },
                            grid: {
                                color: 'rgba(255,255,255,0.1)'
                            }
                        },
                        x: {
                            ticks: {
                                color: 'rgba(255,255,255,0.7)',
                                maxRotation: 45,
                                minRotation: 45
                            },
                            grid: {
                                color: 'rgba(255,255,255,0.1)'
                            }
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
            let url = `${config.url}/rest/v1/${TABLE_NAME}?order=created_at.desc&limit=1000`;

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
     * Met à jour les compteurs dans les onglets
     */
    function updateTabCounts() {
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
        const homeCount = prospectCount + contacteCount;

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
        document.querySelector('[data-tab="non_converti"]').innerHTML =
            `<i class="fas fa-times-circle"></i> Non Convertis (${nonConvertiCount})`;
        document.querySelector('[data-tab="liste_rouge"]').innerHTML =
            `<i class="fas fa-trash"></i> Liste Rouge (${listeRougeCount})`;
        document.querySelector('[data-tab="all"]').innerHTML =
            `<i class="fas fa-list"></i> Tous (${allLeads.length})`;
    }

    /**
     * Change l'onglet actif
     * @param tab
     */
    function switchTab(tab) {
        currentTab = tab;

        // Mettre à jour l'UI des onglets
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Re-render le tableau
        renderTable();
    }

    /**
     * Filtre les leads selon l'onglet actif
     */
    function getFilteredLeads() {
        switch (currentTab) {
            case 'home':
                // Accueil : Prospects + Contactés
                return allLeads.filter(
                    l => l.status === STATUSES.PROSPECT || l.status === STATUSES.CONTACTE_ATTENTE
                );

            case 'prospect':
                return allLeads.filter(l => l.status === STATUSES.PROSPECT);

            case 'contacte_attente':
                return allLeads.filter(l => l.status === STATUSES.CONTACTE_ATTENTE);

            case 'rdv_essai':
                return allLeads.filter(l => l.status === STATUSES.RDV_ESSAI);

            case 'converti':
                return allLeads.filter(
                    l =>
                        l.status === STATUSES.CONVERTI_ABONNEMENT ||
                        l.status === STATUSES.CONVERTI_CARNETS
                );

            case 'non_converti':
                return allLeads.filter(l => l.status === STATUSES.NON_CONVERTI_PRIX);

            case 'liste_rouge':
                return allLeads.filter(l => l.status === STATUSES.LISTE_ROUGE);

            case 'all':
            default:
                return allLeads;
        }
    }

    /**
     * Affiche le tableau des leads
     */
    function renderTable() {
        const container = document.getElementById('leadsTableContainer');
        if (!container) {
            return;
        }

        const filteredLeads = getFilteredLeads();

        if (filteredLeads.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: rgba(255,255,255,0.6);">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>Aucun lead pour le moment</p>
                </div>
            `;
            return;
        }

        const tableHTML = `
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
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredLeads
                            .map(
                                lead => `
                            <tr>
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
                                    ${getStatusBadge(lead.status)}
                                </td>
                                <td style="white-space: nowrap;">
                                    <button class="action-btn" onclick="CRMManager.viewDetails('${lead.id}')" title="Voir détails">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="action-btn" onclick="CRMManager.changeStatus('${lead.id}')" title="Changer statut">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="action-btn delete-btn" onclick="CRMManager.deleteLead('${lead.id}')" title="Supprimer">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `
                            )
                            .join('')}
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = tableHTML;
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
                '<span style="background: rgba(255, 107, 53, 0.2); color: #FF6B35; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;"><i class="fas fa-user-tie"></i> COACHING</span>'
        };
        return badges[serviceType] || serviceType;
    }

    /**
     * Génère un badge pour le statut
     * @param status
     */
    function getStatusBadge(status) {
        const color = STATUS_COLORS[status] || '#888';
        const label = STATUS_LABELS[status] || status;

        return `<span class="status-badge" style="background: ${color}20; color: ${color}; border: 1px solid ${color}40;">
            ${label}
        </span>`;
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

        alert(
            '📋 DÉTAILS DU LEAD\n\n' +
                `Nom: ${lead.prenom}\n` +
                `Email: ${lead.email}\n` +
                `Téléphone: ${lead.telephone}\n` +
                `Service: ${lead.service_type}\n` +
                `Objectif: ${lead.objectif || 'Non renseigné'}\n` +
                `Créneau: ${lead.creneau || 'Non renseigné'}\n` +
                `Source: ${lead.source_manuelle || lead.source_auto}\n` +
                `Statut: ${STATUS_LABELS[lead.status]}\n` +
                `Date: ${new Date(lead.created_at).toLocaleString('fr-FR')}\n` +
                `Notes: ${lead.notes || 'Aucune note'}`
        );
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

        let options = '';
        for (const [key, value] of Object.entries(STATUS_LABELS)) {
            options += `${key === lead.status ? '→ ' : '  '}- ${value}\n`;
        }

        const statusInput = prompt(
            `Changer le statut de ${lead.prenom}\n\n` +
                `Statut actuel: ${STATUS_LABELS[lead.status]}\n\n` +
                `Entrez le nouveau statut :\n${options}\n` +
                'Tapez le code du statut (ex: prospect, contacte_attente, rdv_essai, etc.)',
            lead.status
        );

        if (!statusInput) {
            return;
        }

        const newStatus = statusInput.trim().toLowerCase();

        if (!Object.values(STATUSES).includes(newStatus)) {
            alert('❌ Statut invalide ! Utilisez un des codes affichés.');
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

            alert(`✅ Statut mis à jour vers : ${STATUS_LABELS[newStatus]}`);
            await loadData(); // Recharger les données
        } catch (error) {
            console.error('❌ Erreur:', error);
            alert('❌ Erreur lors de la mise à jour');
        }
    }

    /**
     * Supprime un lead
     * @param leadId
     */
    async function deleteLead(leadId) {
        const lead = allLeads.find(l => l.id === leadId);
        if (!lead) {
            return;
        }

        const confirmation = confirm(
            '⚠️ ATTENTION !\n\n' +
                'Voulez-vous vraiment SUPPRIMER définitivement ce lead ?\n\n' +
                `Nom: ${lead.prenom}\n` +
                `Email: ${lead.email}\n\n` +
                'Cette action est IRRÉVERSIBLE !'
        );

        if (!confirmation) {
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

            alert('✅ Lead supprimé avec succès !');
            await loadData(); // Recharger les données
        } catch (error) {
            console.error('❌ Erreur:', error);
            alert('❌ Erreur lors de la suppression');
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
        deleteLead
    };
})();

// Fonction globale pour ouvrir le CRM
window.CRMManager_show = function () {
    CRMManager.show();
};
