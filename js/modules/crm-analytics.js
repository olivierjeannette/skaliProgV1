/**
 * 📊 CRM ANALYTICS - Dashboard Statistiques La Skàli
 * Connexion directe à Supabase analytics_events
 */

window.CRMAnalytics = (function () {
    'use strict';

    // Configuration Supabase
    const SUPABASE_URL = 'https://dhzknhevbzdauakzbdhr.supabase.co';
    const SUPABASE_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoemtuaGV2YnpkYXVha3piZGhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODEwOSwiZXhwIjoyMDcxMjc0MTA5fQ.XxFwfGITkOxhFRJfFYlCAbr7My_RcRTHmNUeZNWg_10';

    let currentPeriod = '7d';
    let refreshInterval = null;

    /**
     * Affiche la vue Analytics
     */
    function show() {
        console.log('📊 CRM Analytics - Ouverture...');

        const mainContent = document.getElementById('mainContent');
        if (!mainContent) {
            console.error('❌ mainContent non trouvé');
            return;
        }

        mainContent.innerHTML = getAnalyticsHTML();
        initEvents();
        loadData();

        // Plus d'auto-refresh
        if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
        }
    }

    /**
     * HTML du dashboard
     */
    function getAnalyticsHTML() {
        return `
            <div class="analytics-dashboard">
                <div class="analytics-header">
                    <h1>📊 Analytics Dashboard</h1>
                    <div class="analytics-controls">
                        <div class="time-filter">
                            <button class="filter-btn active" data-period="today">Aujourd'hui</button>
                            <button class="filter-btn" data-period="7d">7 jours</button>
                            <button class="filter-btn" data-period="30d">30 jours</button>
                            <button class="filter-btn" data-period="all">Tout</button>
                        </div>
                        <div style="display: flex; gap: 1rem;">
                            <button class="refresh-btn" onclick="window.CRMAnalytics.refresh()">
                                🔄 Actualiser
                            </button>
                            <button class="reset-btn" onclick="window.CRMAnalytics.resetData()">
                                🗑️ Réinitialiser
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Stats Cards -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="stat-label">Visiteurs</span>
                            <span class="stat-icon">👥</span>
                        </div>
                        <div class="stat-value" id="stat-visitors">-</div>
                        <div class="stat-change">Sessions uniques</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="stat-label">Pages vues</span>
                            <span class="stat-icon">📄</span>
                        </div>
                        <div class="stat-value" id="stat-pageviews">-</div>
                        <div class="stat-change">Total pages</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="stat-label">Clics CTA</span>
                            <span class="stat-icon">🖱️</span>
                        </div>
                        <div class="stat-value" id="stat-cta-clicks">-</div>
                        <div class="stat-change">Boutons importants</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="stat-label">Taux conversion</span>
                            <span class="stat-icon">✅</span>
                        </div>
                        <div class="stat-value" id="stat-conversion">-</div>
                        <div class="stat-change">Formulaires soumis</div>
                    </div>
                </div>

                <!-- Top Pages -->
                <div class="analytics-section">
                    <h2>🔥 Top Pages</h2>
                    <div class="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Page</th>
                                    <th>Vues</th>
                                    <th>Sessions</th>
                                </tr>
                            </thead>
                            <tbody id="top-pages-tbody">
                                <tr><td colspan="3" class="loading">Chargement...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Choix de services -->
                <div class="analytics-section">
                    <h2>🎯 Choix de services</h2>
                    <div id="services-chart" style="height: 300px; display: flex; align-items: center; justify-content: center;">
                        <span class="loading">Chargement...</span>
                    </div>
                </div>

                <!-- Formulaires -->
                <div class="analytics-section">
                    <h2>📝 Formulaires</h2>
                    <div class="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Action</th>
                                    <th>Focus</th>
                                    <th>Soumis</th>
                                    <th>Taux</th>
                                </tr>
                            </thead>
                            <tbody id="forms-tbody">
                                <tr><td colspan="4" class="loading">Chargement...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style>
                .analytics-dashboard {
                    padding: 2rem;
                    color: white;
                }

                .analytics-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid rgba(255,255,255,0.1);
                }

                .analytics-header h1 {
                    font-size: 2rem;
                    margin: 0;
                }

                .analytics-controls {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                }

                .time-filter {
                    display: flex;
                    gap: 0.5rem;
                    background: rgba(255,255,255,0.05);
                    padding: 0.5rem;
                    border-radius: 12px;
                }

                .filter-btn {
                    padding: 0.6rem 1rem;
                    border: none;
                    background: transparent;
                    color: rgba(255,255,255,0.6);
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s;
                }

                .filter-btn.active {
                    background: #4CAF50;
                    color: white;
                }

                .filter-btn:hover {
                    background: rgba(76, 175, 80, 0.2);
                    color: white;
                }

                .refresh-btn {
                    padding: 0.6rem 1.2rem;
                    background: rgba(76, 175, 80, 0.2);
                    border: 2px solid #4CAF50;
                    color: #4CAF50;
                    border-radius: 12px;
                    cursor: pointer;
                    font-weight: 700;
                    transition: all 0.3s;
                }

                .refresh-btn:hover {
                    background: #4CAF50;
                    color: white;
                }

                .reset-btn {
                    padding: 0.6rem 1.2rem;
                    background: rgba(244, 67, 54, 0.2);
                    border: 2px solid #f44336;
                    color: #f44336;
                    border-radius: 12px;
                    cursor: pointer;
                    font-weight: 700;
                    transition: all 0.3s;
                }

                .reset-btn:hover {
                    background: #f44336;
                    color: white;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .stat-card {
                    background: rgba(255,255,255,0.03);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 15px;
                    padding: 1.5rem;
                    transition: all 0.3s;
                }

                .stat-card:hover {
                    transform: translateY(-5px);
                    border-color: rgba(76, 175, 80, 0.4);
                    box-shadow: 0 10px 40px rgba(76, 175, 80, 0.2);
                }

                .stat-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .stat-label {
                    font-size: 0.9rem;
                    color: rgba(255,255,255,0.6);
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .stat-icon {
                    font-size: 2rem;
                }

                .stat-value {
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: #4CAF50;
                    margin-bottom: 0.5rem;
                }

                .stat-change {
                    font-size: 0.85rem;
                    color: rgba(255,255,255,0.5);
                }

                .analytics-section {
                    background: rgba(255,255,255,0.03);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 15px;
                    padding: 2rem;
                    margin-bottom: 2rem;
                }

                .analytics-section h2 {
                    margin: 0 0 1.5rem 0;
                    font-size: 1.3rem;
                }

                .table-wrapper {
                    overflow-x: auto;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                }

                th {
                    text-align: left;
                    padding: 1rem;
                    background: rgba(255,255,255,0.05);
                    font-weight: 700;
                    color: rgba(255,255,255,0.8);
                    border-bottom: 2px solid rgba(76, 175, 80, 0.3);
                }

                td {
                    padding: 1rem;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    color: rgba(255,255,255,0.8);
                }

                tr:hover {
                    background: rgba(255,255,255,0.05);
                }

                .loading {
                    text-align: center;
                    color: rgba(255,255,255,0.5);
                    padding: 2rem;
                }
            </style>
        `;
    }

    /**
     * Initialiser les événements
     */
    function initEvents() {
        // Filtres de période
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentPeriod = btn.dataset.period;
                loadData();
            });
        });
    }

    /**
     * Charger les données depuis Supabase
     */
    async function loadData() {
        console.log('[Analytics] Chargement des données...');

        try {
            // Calculer la date de début selon la période
            const now = new Date();
            let startDate = new Date();

            switch (currentPeriod) {
                case 'today':
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case '7d':
                    startDate.setDate(now.getDate() - 7);
                    break;
                case '30d':
                    startDate.setDate(now.getDate() - 30);
                    break;
                case 'all':
                    startDate = new Date('2020-01-01');
                    break;
            }

            // Query Supabase
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/analytics_events?select=*&created_at=gte.${startDate.toISOString()}&order=created_at.desc&limit=10000`,
                {
                    headers: {
                        apikey: SUPABASE_KEY,
                        Authorization: `Bearer ${SUPABASE_KEY}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Supabase error: ${response.status}`);
            }

            const events = await response.json();
            console.log(`[Analytics] ${events.length} événements chargés`);

            // Calculer les stats
            const stats = calculateStats(events);

            // Mettre à jour l'UI
            updateUI(stats);
        } catch (error) {
            console.error('[Analytics] Erreur:', error);
            showError();
        }
    }

    /**
     * Calculer les statistiques
     * @param events
     */
    function calculateStats(events) {
        const stats = {
            visitors: new Set(events.map(e => e.session_id)).size,
            pageViews: events.filter(e => e.event_type === 'page_view').length,
            ctaClicks: events.filter(e => e.event_type === 'cta_click').length,
            formsStarted: events.filter(e => e.event_type === 'form_focus').length,
            formsSubmitted: events.filter(e => e.event_type === 'form_submit').length,
            topPages: {},
            serviceChoices: {}
        };

        // Taux de conversion
        stats.conversionRate =
            stats.visitors > 0 ? ((stats.formsSubmitted / stats.visitors) * 100).toFixed(1) : 0;

        // Top pages
        events
            .filter(e => e.event_type === 'page_view')
            .forEach(e => {
                const page = e.page || 'unknown';
                if (!stats.topPages[page]) {
                    stats.topPages[page] = {
                        views: 0,
                        sessions: new Set()
                    };
                }
                stats.topPages[page].views++;
                stats.topPages[page].sessions.add(e.session_id);
            });

        // Choix de services
        events
            .filter(e => e.event_type === 'service_choice')
            .forEach(e => {
                const service = e.event_data?.service || 'unknown';
                stats.serviceChoices[service] = (stats.serviceChoices[service] || 0) + 1;
            });

        return stats;
    }

    /**
     * Mettre à jour l'UI
     * @param stats
     */
    function updateUI(stats) {
        // Stats cards
        document.getElementById('stat-visitors').textContent = stats.visitors;
        document.getElementById('stat-pageviews').textContent = stats.pageViews;
        document.getElementById('stat-cta-clicks').textContent = stats.ctaClicks;
        document.getElementById('stat-conversion').textContent = stats.conversionRate + '%';

        // Top pages
        const tbody = document.getElementById('top-pages-tbody');
        const sortedPages = Object.entries(stats.topPages)
            .sort((a, b) => b[1].views - a[1].views)
            .slice(0, 10);

        if (sortedPages.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="loading">Aucune donnée</td></tr>';
        } else {
            tbody.innerHTML = sortedPages
                .map(
                    ([page, data]) => `
                <tr>
                    <td><strong>${page}</strong></td>
                    <td>${data.views}</td>
                    <td>${data.sessions.size}</td>
                </tr>
            `
                )
                .join('');
        }

        // Services
        updateServicesChart(stats.serviceChoices);

        // Formulaires
        updateFormsTable(stats);
    }

    /**
     * Afficher les services
     * @param services
     */
    function updateServicesChart(services) {
        const container = document.getElementById('services-chart');

        if (Object.keys(services).length === 0) {
            container.innerHTML = '<span class="loading">Aucune donnée</span>';
            return;
        }

        const total = Object.values(services).reduce((a, b) => a + b, 0);
        const html = Object.entries(services)
            .map(([service, count]) => {
                const percent = ((count / total) * 100).toFixed(1);
                const emoji = service === 'fitness' ? '🏋️' : service === 'pilates' ? '🧘' : '🎯';
                return `
                <div style="margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span>${emoji} ${service.charAt(0).toUpperCase() + service.slice(1)}</span>
                        <span><strong>${count}</strong> (${percent}%)</span>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); border-radius: 10px; height: 20px; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, #4CAF50, #2D8B3E); width: ${percent}%; height: 100%; transition: width 0.5s;"></div>
                    </div>
                </div>
            `;
            })
            .join('');

        container.innerHTML = `<div style="width: 100%;">${html}</div>`;
    }

    /**
     * Tableau formulaires
     * @param stats
     */
    function updateFormsTable(stats) {
        const tbody = document.getElementById('forms-tbody');
        const rate =
            stats.formsStarted > 0
                ? ((stats.formsSubmitted / stats.formsStarted) * 100).toFixed(1)
                : 0;

        tbody.innerHTML = `
            <tr>
                <td><strong>Formulaires contact</strong></td>
                <td>${stats.formsStarted}</td>
                <td>${stats.formsSubmitted}</td>
                <td><strong>${rate}%</strong></td>
            </tr>
        `;
    }

    /**
     * Afficher erreur
     */
    function showError() {
        document.querySelectorAll('.stat-value').forEach(el => (el.textContent = 'Erreur'));
        document.getElementById('top-pages-tbody').innerHTML =
            '<tr><td colspan="3" class="loading">Erreur de chargement</td></tr>';
    }

    /**
     * Rafraîchir
     */
    function refresh() {
        loadData();
    }

    /**
     * Réinitialiser toutes les données analytics
     */
    async function resetData() {
        if (
            !confirm(
                '⚠️ Voulez-vous vraiment supprimer TOUTES les données analytics ?\n\nCette action est irréversible !'
            )
        ) {
            return;
        }

        try {
            console.log('🗑️ Suppression des données analytics...');

            // Méthode simplifiée: DELETE direct avec service_role
            console.log('🔄 Tentative de suppression directe...');
            const response = await fetch(`${SUPABASE_URL}/rest/v1/analytics_events`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`,
                    Prefer: 'return=minimal'
                },
                // Supprimer TOUTES les lignes (pas de filtre WHERE)
                body: JSON.stringify({})
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Erreur DELETE:', response.status, errorText);

                // Essayer avec un filtre id >= 0 (toutes les lignes)
                console.log('🔄 Tentative avec filtre id...');
                const altResponse = await fetch(
                    `${SUPABASE_URL}/rest/v1/analytics_events?id=gte.0`,
                    {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            apikey: SUPABASE_KEY,
                            Authorization: `Bearer ${SUPABASE_KEY}`,
                            Prefer: 'return=minimal'
                        }
                    }
                );

                if (!altResponse.ok) {
                    const altErrorText = await altResponse.text();
                    console.error(
                        '❌ Erreur DELETE avec filtre:',
                        altResponse.status,
                        altErrorText
                    );
                    throw new Error(`Impossible de supprimer: ${response.status} - ${errorText}`);
                }
            }

            alert('✅ Toutes les données analytics ont été supprimées !');
            console.log('✅ Données supprimées avec succès');

            // Recharger le dashboard
            loadData();
        } catch (err) {
            console.error('❌ Erreur suppression:', err);
            alert(`❌ Erreur lors de la suppression des données:\n${err.message}`);
        }
    }

    /**
     * Détruire
     */
    function destroy() {
        if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
        }
    }

    return {
        show,
        refresh,
        resetData,
        destroy
    };
})();

// Fonction globale pour le bouton sidebar
window.CRMAnalytics_show = function () {
    window.CRMAnalytics.show();
};
