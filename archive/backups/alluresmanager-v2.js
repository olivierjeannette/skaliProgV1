/**
 * AlluresManager v2.0 - Tableau des Allures avec Import Automatique
 * Importe les performances cardio depuis Supabase et calcule les allures automatiquement
 *
 * Disciplines supportées:
 * - Course (Running)
 * - Rameur (Rowing)
 * - SkiErg
 * - Assault Bike
 * - BikeErg
 */

const AlluresManager = {
    members: [],
    performances: [],
    selectedDiscipline: 'course',
    selectedMembers: [], // Liste des membres sélectionnés via recherche Peppy

    // Distances de référence par discipline (en mètres)
    referenceDistances: {
        course: {
            name: 'Course',
            icon: '🏃',
            distances: [600, 800, 1000, 1200, 2000, 3000, 5000],
            unit: '/km',
            format: 'pace' // mm:ss/km
        },
        rameur: {
            name: 'Rameur',
            icon: '🚣',
            distances: [500, 1000, 2000, 5000],
            unit: '/500m',
            format: 'pace' // mm:ss/500m
        },
        skierg: {
            name: 'SkiErg',
            icon: '⛷️',
            distances: [500, 1000, 2000, 5000],
            unit: '/500m',
            format: 'pace'
        },
        assault_bike: {
            name: 'Assault Bike',
            icon: '🚴',
            distances: [1000, 2000, 5000],
            unit: ' cal/h',
            format: 'calories' // calories/heure
        },
        bikerg: {
            name: 'BikeErg',
            icon: '🚴',
            distances: [1000, 2000, 5000, 10000],
            unit: '/km',
            format: 'pace'
        }
    },

    /**
     * Afficher la vue des allures
     */
    async showAlluresView() {
        try {
            console.log('📊 Affichage vue Allures...');

            // Charger les données depuis Supabase
            await this.loadData();

            // Générer le HTML
            const html = this.generateHTML();

            // Afficher
            const mainContent = document.getElementById('mainContent');
            if (mainContent) {
                mainContent.innerHTML = html;
            }

            // Activer le bouton de navigation
            if (typeof ViewManager !== 'undefined') {
                ViewManager.clearAllActiveStates();
            }
            const alluresBtn = document.getElementById('alluresBtn');
            if (alluresBtn) alluresBtn.classList.add('active');

            // Charger la discipline par défaut
            this.selectDiscipline('course');
        } catch (error) {
            console.error('❌ Erreur affichage allures:', error);
            Utils.showNotification('Erreur lors du chargement des allures', 'error');
        }
    },

    /**
     * Charger les données depuis Supabase
     */
    async loadData() {
        try {
            console.log('📥 Chargement des données Supabase...');

            const [members, performances] = await Promise.all([
                SupabaseManager.getMembers(),
                SupabaseManager.getPerformances()
            ]);

            this.members = members.filter(m => m.is_active);
            this.performances = performances;

            console.log(
                `✅ ${this.members.length} membres, ${this.performances.length} performances`
            );
        } catch (error) {
            console.error('❌ Erreur chargement données:', error);
            this.members = [];
            this.performances = [];
        }
    },

    /**
     * Générer le HTML principal
     */
    generateHTML() {
        const totalMembers = this.members.length;
        const membersWithPaces = this.members.filter(m => {
            const perfs = this.performances.filter(p => p.member_id === m.id);
            return perfs.length > 0;
        }).length;

        return `
            <div style="min-height: 100vh; background: var(--bg-primary); padding-bottom: 2rem;">
                <!-- Header Glass Minimaliste -->
                <div style="background: var(--glass-bg); backdrop-filter: blur(20px); border-bottom: 1px solid var(--glass-border); padding: 2rem;">
                    <div style="max-width: 1400px; margin: 0 auto; text-align: center;">
                        <h1 style="font-size: 2.5rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.5rem;">
                            <i class="fas fa-tachometer-alt" style="margin-right: 1rem; color: var(--accent-primary);"></i>Tableau des Allures Pro
                        </h1>
                        <p style="color: var(--text-secondary); font-size: 1rem; margin-bottom: 1.5rem;">Allures automatiques basées sur les performances enregistrées</p>
                        <div style="display: flex; justify-content: center; gap: 3rem; margin-top: 1.5rem;">
                            <div>
                                <div style="font-size: 3rem; font-weight: 900; color: var(--text-primary);">${totalMembers}</div>
                                <div style="font-size: 0.875rem; color: var(--text-muted); font-weight: 600;">Total membres</div>
                            </div>
                            <div>
                                <div style="font-size: 3rem; font-weight: 900; color: var(--accent-primary);">${membersWithPaces}</div>
                                <div style="font-size: 0.875rem; color: var(--text-muted); font-weight: 600;">Avec allures</div>
                            </div>
                        </div>
                        <button onclick="AlluresManager.refreshData()"
                                style="margin-top: 1.5rem; padding: 0.75rem 1.5rem; background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 0.75rem; color: var(--text-primary); font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 0.875rem;"
                                onmouseover="this.style.background='var(--glass-bg-hover)'; this.style.borderColor='var(--accent-primary)'"
                                onmouseout="this.style.background='var(--glass-bg)'; this.style.borderColor='var(--glass-border)'">
                            <i class="fas fa-sync-alt" style="margin-right: 0.5rem;"></i>Actualiser
                        </button>
                    </div>
                </div>

                <div style="max-width: 1400px; margin: 0 auto; padding: 2rem;">

                    <!-- Zone de recherche Peppy -->
                    <div class="glass-card" style="padding: 1.5rem; margin-bottom: 2rem;">
                        <h3 style="font-size: 1.125rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">
                            <i class="fas fa-search" style="margin-right: 0.75rem; color: var(--accent-primary);"></i>Filtrer les participants
                        </h3>
                        <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1rem;">Collez la liste des participants depuis Peppy (un nom par ligne)</p>

                        <textarea
                            id="peppySearchInput"
                            placeholder="Jean Dupont&#10;Marie Martin&#10;Pierre Durand..."
                            style="width: 100%; height: 120px; padding: 1rem; background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 0.75rem; color: var(--text-primary); font-family: 'Courier New', monospace; font-size: 0.875rem; resize: vertical; transition: all 0.2s; margin-bottom: 1rem;"
                            oninput="AlluresManager.filterByPeppy()"
                            onfocus="this.style.borderColor='var(--accent-primary)'"
                            onblur="this.style.borderColor='var(--glass-border)'"></textarea>

                        <div style="display: flex; gap: 0.75rem; align-items: center;">
                            <button onclick="AlluresManager.filterByPeppy()"
                                    style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); color: var(--bg-primary); font-size: 0.9375rem; font-weight: 700; border: none; border-radius: 0.75rem; cursor: pointer; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.05em;"
                                    onmouseover="this.style.transform='translateY(-1px)'"
                                    onmouseout="this.style.transform='translateY(0)'">
                                <i class="fas fa-filter" style="margin-right: 0.5rem;"></i>Filtrer
                            </button>
                            <button onclick="AlluresManager.clearPeppyFilter()"
                                    style="padding: 0.75rem 1rem; background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 0.75rem; color: var(--text-primary); font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 0.875rem;"
                                    onmouseover="this.style.background='var(--glass-bg-hover)'"
                                    onmouseout="this.style.background='var(--glass-bg)'">
                                <i class="fas fa-times" style="margin-right: 0.5rem;"></i>Effacer
                            </button>
                            <span id="peppyMatchCount" style="font-size: 0.875rem; color: var(--text-muted); font-weight: 600; margin-left: auto;"></span>
                        </div>
                    </div>

                    <!-- Filtres disciplines modernes (pills) -->
                    <div style="display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; justify-content: center;">
                        <button onclick="AlluresManager.selectDiscipline('course')"
                                id="btn-course"
                                style="padding: 1rem 1.5rem; background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: 9999px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.75rem; font-weight: 700; color: var(--text-primary); font-size: 0.9375rem;"
                                onmouseover="if(!this.classList.contains('active')) { this.style.borderColor='var(--accent-primary)'; this.style.transform='translateY(-2px)'; }"
                                onmouseout="if(!this.classList.contains('active')) { this.style.borderColor='var(--glass-border)'; this.style.transform='translateY(0)'; }">
                            <span style="font-size: 1.5rem;">🏃</span>
                            <span>Course</span>
                        </button>
                        <button onclick="AlluresManager.selectDiscipline('rameur')"
                                id="btn-rameur"
                                style="padding: 1rem 1.5rem; background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: 9999px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.75rem; font-weight: 700; color: var(--text-primary); font-size: 0.9375rem;"
                                onmouseover="if(!this.classList.contains('active')) { this.style.borderColor='var(--accent-primary)'; this.style.transform='translateY(-2px)'; }"
                                onmouseout="if(!this.classList.contains('active')) { this.style.borderColor='var(--glass-border)'; this.style.transform='translateY(0)'; }">
                            <span style="font-size: 1.5rem;">🚣</span>
                            <span>Rameur</span>
                        </button>
                        <button onclick="AlluresManager.selectDiscipline('skierg')"
                                id="btn-skierg"
                                style="padding: 1rem 1.5rem; background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: 9999px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.75rem; font-weight: 700; color: var(--text-primary); font-size: 0.9375rem;"
                                onmouseover="if(!this.classList.contains('active')) { this.style.borderColor='var(--accent-primary)'; this.style.transform='translateY(-2px)'; }"
                                onmouseout="if(!this.classList.contains('active')) { this.style.borderColor='var(--glass-border)'; this.style.transform='translateY(0)'; }">
                            <span style="font-size: 1.5rem;">⛷️</span>
                            <span>SkiErg</span>
                        </button>
                        <button onclick="AlluresManager.selectDiscipline('assault_bike')"
                                id="btn-assault_bike"
                                style="padding: 1rem 1.5rem; background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: 9999px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.75rem; font-weight: 700; color: var(--text-primary); font-size: 0.9375rem;"
                                onmouseover="if(!this.classList.contains('active')) { this.style.borderColor='var(--accent-primary)'; this.style.transform='translateY(-2px)'; }"
                                onmouseout="if(!this.classList.contains('active')) { this.style.borderColor='var(--glass-border)'; this.style.transform='translateY(0)'; }">
                            <span style="font-size: 1.5rem;">🚴</span>
                            <span>Assault Bike</span>
                        </button>
                        <button onclick="AlluresManager.selectDiscipline('bikerg')"
                                id="btn-bikerg"
                                style="padding: 1rem 1.5rem; background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: 9999px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.75rem; font-weight: 700; color: var(--text-primary); font-size: 0.9375rem;"
                                onmouseover="if(!this.classList.contains('active')) { this.style.borderColor='var(--accent-primary)'; this.style.transform='translateY(-2px)'; }"
                                onmouseout="if(!this.classList.contains('active')) { this.style.borderColor='var(--glass-border)'; this.style.transform='translateY(0)'; }">
                            <span style="font-size: 1.5rem;">🚴</span>
                            <span>BikeErg</span>
                        </button>
                    </div>

                    <!-- Tableau des allures -->
                    <div id="alluresTable">
                        <!-- Généré dynamiquement -->
                    </div>

                    <!-- Légende moderne -->
                    <div class="glass-card" style="margin-top: 2rem; padding: 1.5rem;">
                        <div style="display: flex; gap: 3rem; flex-wrap: wrap; justify-content: center; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                <span style="width: 1.5rem; height: 1.5rem; background: #10b981; border-radius: 0.375rem;"></span>
                                <span style="color: var(--text-primary); font-weight: 600; font-size: 0.875rem;">Performance enregistrée</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                <span style="width: 1.5rem; height: 1.5rem; background: #3b82f6; border-radius: 0.375rem;"></span>
                                <span style="color: var(--text-primary); font-weight: 600; font-size: 0.875rem;">Allure calculée</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                <span style="width: 1.5rem; height: 1.5rem; background: #ef4444; border-radius: 0.375rem;"></span>
                                <span style="color: var(--text-primary); font-weight: 600; font-size: 0.875rem;">Record personnel (PR)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                #btn-course.active,
                #btn-rameur.active,
                #btn-skierg.active,
                #btn-assault_bike.active,
                #btn-bikerg.active {
                    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)) !important;
                    color: var(--bg-primary) !important;
                    border-color: var(--accent-primary) !important;
                    box-shadow: 0 0 30px rgba(255, 255, 255, 0.3) !important;
                    transform: translateY(-2px) !important;
                }
            </style>
        `;
    },

    /**
     * Sélectionner une discipline
     */
    async selectDiscipline(discipline) {
        this.selectedDiscipline = discipline;

        // Mettre à jour les boutons
        document.querySelectorAll('.discipline-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const btn = document.getElementById(`btn-${discipline}`);
        if (btn) btn.classList.add('active');

        // Générer le tableau pour cette discipline
        this.generateTable();
    },

    /**
     * Générer le tableau des allures pour la discipline sélectionnée
     */
    generateTable() {
        const discipline = this.referenceDistances[this.selectedDiscipline];
        if (!discipline) return;

        const tableContainer = document.getElementById('alluresTable');
        if (!tableContainer) return;

        // Filtrer les performances de cette discipline
        const disciplinePerfs = this.getPerformancesForDiscipline(this.selectedDiscipline);

        if (this.members.length === 0) {
            tableContainer.innerHTML = `
                <div class="glass-card" style="padding: 3rem; text-align: center;">
                    <i class="fas fa-users" style="font-size: 4rem; color: var(--text-muted); opacity: 0.3; margin-bottom: 1rem;"></i>
                    <p style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">Aucun adhérent trouvé</p>
                    <p style="font-size: 0.875rem; color: var(--text-muted);">Ajoutez des adhérents pour voir leurs allures</p>
                </div>
            `;
            return;
        }

        // Utiliser les membres filtrés ou tous les membres
        const displayMembers =
            this.selectedMembers.length > 0 ? this.selectedMembers : this.members;

        if (displayMembers.length === 0) {
            tableContainer.innerHTML = `
                <div class="glass-card" style="padding: 3rem; text-align: center;">
                    <i class="fas fa-filter" style="font-size: 4rem; color: var(--text-muted); opacity: 0.3; margin-bottom: 1rem;"></i>
                    <p style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">Aucun participant correspondant</p>
                    <p style="font-size: 0.875rem; color: var(--text-muted);">Vérifiez les noms saisis</p>
                </div>
            `;
            return;
        }

        // Créer le tableau moderne
        let html = `
            <div class="glass-card" style="padding: 0; overflow: hidden;">
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: separate; border-spacing: 0;">
                        <thead>
                            <tr style="background: var(--glass-bg); backdrop-filter: blur(10px);">
                                <th style="padding: 1rem; text-align: left; font-weight: 700; color: var(--text-primary); border-bottom: 2px solid var(--glass-border); position: sticky; left: 0; background: var(--glass-bg); z-index: 10; min-width: 180px;">
                                    <i class="fas fa-user" style="margin-right: 0.5rem; color: var(--accent-primary);"></i>Adhérent
                                </th>
                                ${discipline.distances
                                    .map(
                                        d => `
                                    <th style="padding: 1rem; text-align: center; font-weight: 700; color: var(--text-primary); border-bottom: 2px solid var(--glass-border); min-width: 120px;">
                                        <i class="fas fa-running" style="margin-right: 0.5rem; color: var(--accent-primary); font-size: 0.875rem;"></i>${d >= 1000 ? d / 1000 + 'k' : d + 'm'}
                                    </th>
                                `
                                    )
                                    .join('')}
                            </tr>
                        </thead>
                        <tbody>
        `;

        // Pour chaque membre - N'afficher que ceux qui ont des performances
        let rowAdded = false;
        displayMembers.forEach(member => {
            const memberPerfs = disciplinePerfs.filter(p => p.member_id === member.id);

            // Ignorer si pas de performances pour cette discipline
            if (memberPerfs.length === 0) return;

            rowAdded = true;
            html += `
                <tr style="border-bottom: 1px solid var(--glass-border); transition: all 0.2s; cursor: pointer;"
                    onmouseover="this.style.background='var(--glass-bg-hover)'"
                    onmouseout="this.style.background='transparent'">
                    <td style="padding: 1rem; font-weight: 700; color: var(--text-primary); position: sticky; left: 0; background: var(--glass-bg); z-index: 5;">
                        ${member.name}
                    </td>
            `;

            // Pour chaque distance
            discipline.distances.forEach(distance => {
                const pace = this.calculatePace(member, distance, memberPerfs, discipline);
                html += `<td style="padding: 1rem; text-align: center; font-family: 'Courier New', monospace; font-weight: 600; font-size: 0.9375rem;">${pace.html}</td>`;
            });

            html += `</tr>`;
        });

        if (!rowAdded) {
            html += `
                <tr>
                    <td colspan="${discipline.distances.length + 1}" style="padding: 3rem; text-align: center;">
                        <i class="fas fa-inbox" style="font-size: 3rem; color: var(--text-muted); opacity: 0.3; margin-bottom: 1rem;"></i>
                        <p style="font-size: 1rem; font-weight: 600; color: var(--text-muted);">Aucune performance enregistrée pour cette discipline</p>
                    </td>
                </tr>
            `;
        }

        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        tableContainer.innerHTML = html;
    },

    /**
     * Récupérer les performances pour une discipline
     */
    getPerformancesForDiscipline(disciplineKey) {
        const exerciseNames = {
            course: [
                'run',
                'running',
                'course',
                '400m',
                '600m',
                '800m',
                '1000m',
                '1200m',
                '1500m',
                '2000m',
                '3000m',
                '5000m'
            ],
            rameur: ['row', 'rowing', 'rameur', '500m row', '1000m row', '2000m row', '5000m row'],
            skierg: ['ski', 'skierg', '500m ski', '1000m ski', '2000m ski'],
            assault_bike: ['assault', 'bike', 'assault bike', 'air bike'],
            bikerg: ['bikerg', 'bike erg', 'echo bike']
        };

        const keywords = exerciseNames[disciplineKey] || [];

        return this.performances.filter(perf => {
            const exerciseType = (perf.exercise_type || '').toLowerCase();
            return keywords.some(keyword => exerciseType.includes(keyword));
        });
    },

    /**
     * Calculer l'allure pour une distance donnée
     */
    calculatePace(member, distance, memberPerfs, discipline) {
        // Chercher les performances exactes pour cette distance (trier par date décroissante)
        const exactPerfs = memberPerfs
            .filter(p => {
                const perfDistance = this.extractDistance(p.exercise_type);
                return perfDistance === distance;
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date)); // Plus récent en premier

        // Utiliser la performance la plus récente
        if (exactPerfs.length > 0 && exactPerfs[0].value) {
            const mostRecent = exactPerfs[0];
            const time = mostRecent.value; // en secondes
            const pace = this.formatPace(time, distance, discipline);
            const isPR = mostRecent.is_pr;

            return {
                html: `<span style="color: ${isPR ? '#ef4444' : '#10b981'}; font-weight: ${isPR ? '800' : '700'};">${pace}</span>`,
                value: time,
                type: isPR ? 'pr' : 'recorded'
            };
        }

        // Sinon, extrapoler depuis d'autres performances (en priorisant les plus récentes)
        if (memberPerfs.length > 0) {
            const extrapolated = this.extrapolatePace(distance, memberPerfs, discipline);
            if (extrapolated) {
                return {
                    html: `<span style="color: #3b82f6; font-weight: 600;">${extrapolated}</span>`,
                    value: null,
                    type: 'calculated'
                };
            }
        }

        // Pas de données
        return {
            html: '<span style="color: var(--text-muted); font-weight: 400;">-</span>',
            value: null,
            type: 'none'
        };
    },

    /**
     * Extraire la distance d'un nom d'exercice
     */
    extractDistance(exerciseName) {
        const name = exerciseName.toLowerCase();

        // Chercher un pattern comme "500m", "1000m", "2k", etc.
        const match = name.match(/(\d+)(k|m)/);
        if (match) {
            let distance = parseInt(match[1]);
            if (match[2] === 'k') distance *= 1000;
            return distance;
        }

        return null;
    },

    /**
     * Extrapoler une allure depuis d'autres distances (algorithme amélioré)
     */
    extrapolatePace(targetDistance, performances, discipline) {
        if (performances.length === 0) return null;

        // Trier les performances par date (plus récentes en premier) et préparer
        const validPerfs = performances
            .map(perf => ({
                ...perf,
                distance: this.extractDistance(perf.exercise_type),
                date: new Date(perf.date)
            }))
            .filter(p => p.distance && p.value)
            .sort((a, b) => b.date - a.date);

        if (validPerfs.length === 0) return null;

        // Chercher les 2 meilleures performances les plus proches de la distance cible
        const sorted = validPerfs.sort((a, b) => {
            const diffA = Math.abs(a.distance - targetDistance);
            const diffB = Math.abs(b.distance - targetDistance);
            return diffA - diffB;
        });

        const perf1 = sorted[0];

        // Si on a 2 performances, faire une interpolation
        if (sorted.length >= 2 && sorted[1].distance !== perf1.distance) {
            const perf2 = sorted[1];

            // Modèle de Riegel pour l'extrapolation d'endurance
            // T2 = T1 * (D2/D1)^1.06
            // Plus réaliste que la vitesse linéaire
            const fatigueFactor = 1.06;

            // Calculer le temps moyen estimé à partir des 2 perfs
            const est1 = perf1.value * Math.pow(targetDistance / perf1.distance, fatigueFactor);
            const est2 = perf2.value * Math.pow(targetDistance / perf2.distance, fatigueFactor);

            // Moyenne pondérée (favoriser la perf la plus proche)
            const weight1 = 1 / (1 + Math.abs(perf1.distance - targetDistance));
            const weight2 = 1 / (1 + Math.abs(perf2.distance - targetDistance));
            const estimatedTime = (est1 * weight1 + est2 * weight2) / (weight1 + weight2);

            return this.formatPace(estimatedTime, targetDistance, discipline);
        }

        // Sinon, utiliser la formule de Riegel avec une seule performance
        const perfDistance = perf1.distance;
        const perfTime = perf1.value;
        const fatigueFactor = 1.06;

        const estimatedTime = perfTime * Math.pow(targetDistance / perfDistance, fatigueFactor);

        return this.formatPace(estimatedTime, targetDistance, discipline);
    },

    /**
     * Formater une allure
     */
    formatPace(timeInSeconds, distance, discipline) {
        if (discipline.format === 'calories') {
            // Pour Assault Bike : calories/heure
            const caloriesPerHour = Math.round((distance * 3600) / timeInSeconds);
            return `${caloriesPerHour}${discipline.unit}`;
        }

        // Pour les autres : allure en mm:ss par unité
        let paceDistance = 1000; // par défaut /km
        if (discipline.unit === '/500m') paceDistance = 500;

        const paceSeconds = (timeInSeconds / distance) * paceDistance;

        const minutes = Math.floor(paceSeconds / 60);
        const seconds = Math.floor(paceSeconds % 60);

        return `${minutes}:${seconds.toString().padStart(2, '0')}${discipline.unit}`;
    },

    /**
     * Actualiser les données
     */
    async refreshData() {
        Utils.showNotification('🔄 Actualisation des données...', 'info');
        await this.loadData();
        this.generateTable();
        Utils.showNotification('✅ Données actualisées', 'success');
    },

    /**
     * Filtrer les participants à partir d'une liste type Peppy
     */
    filterByPeppy() {
        const input = document.getElementById('peppySearchInput');
        if (!input || !input.value.trim()) {
            this.selectedMembers = [];
            this.generateTable();
            this.updatePeppyMatchCount();
            return;
        }

        // Parser les noms ligne par ligne
        const lines = input.value
            .split('\n')
            .map(line => line.trim())
            .filter(line => line);

        if (lines.length === 0) {
            this.selectedMembers = [];
            this.generateTable();
            this.updatePeppyMatchCount();
            return;
        }

        // Reconnaître chaque nom
        this.selectedMembers = [];
        lines.forEach(line => {
            const cleanName = this.cleanPeppyName(line);
            const member = this.recognizeMember(cleanName);
            if (member && !this.selectedMembers.find(m => m.id === member.id)) {
                this.selectedMembers.push(member);
            }
        });

        console.log(
            `🔍 Peppy: ${this.selectedMembers.length}/${lines.length} participants reconnus`
        );
        this.generateTable();
        this.updatePeppyMatchCount();
    },

    /**
     * Nettoyer un nom issu de Peppy
     */
    cleanPeppyName(line) {
        return line
            .replace(/^\d+\.?\s*/, '') // Enlever les numéros au début
            .replace(/^\s*[-•*]\s*/, '') // Enlever les puces
            .replace(/\s+/g, ' ') // Normaliser les espaces
            .trim();
    },

    /**
     * Reconnaître un membre par son nom (recherche flexible)
     */
    recognizeMember(searchName) {
        if (!searchName) return null;

        const normalized = this.normalizeString(searchName);

        // Chercher une correspondance exacte ou partielle
        let bestMatch = null;
        let bestScore = 0;

        this.members.forEach(member => {
            const memberName = this.normalizeString(member.name);

            // Score de correspondance
            let score = 0;

            // Correspondance exacte
            if (normalized === memberName) {
                score = 100;
            }
            // Contient le nom recherché
            else if (memberName.includes(normalized)) {
                score = 80;
            }
            // Le nom recherché contient le nom du membre
            else if (normalized.includes(memberName)) {
                score = 70;
            }
            // Correspondance par mots
            else {
                const searchWords = normalized.split(' ');
                const memberWords = memberName.split(' ');

                let matchedWords = 0;
                searchWords.forEach(sw => {
                    memberWords.forEach(mw => {
                        if (sw === mw || sw.includes(mw) || mw.includes(sw)) {
                            matchedWords++;
                        }
                    });
                });

                if (matchedWords > 0) {
                    score = (matchedWords / Math.max(searchWords.length, memberWords.length)) * 60;
                }
            }

            if (score > bestScore && score > 40) {
                bestScore = score;
                bestMatch = member;
            }
        });

        return bestMatch;
    },

    /**
     * Normaliser une chaîne pour la comparaison
     */
    normalizeString(str) {
        if (!str) return '';
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
            .replace(/[^\w\s]/g, ' ') // Remplacer la ponctuation
            .replace(/\s+/g, ' ')
            .trim();
    },

    /**
     * Mettre à jour le compteur de correspondances
     */
    updatePeppyMatchCount() {
        const countEl = document.getElementById('peppyMatchCount');
        if (!countEl) return;

        if (this.selectedMembers.length > 0) {
            countEl.textContent = `✅ ${this.selectedMembers.length} participant(s) trouvé(s)`;
            countEl.style.color = '#10b981';
        } else {
            const input = document.getElementById('peppySearchInput');
            if (input && input.value.trim()) {
                countEl.textContent = `❌ Aucun participant reconnu`;
                countEl.style.color = '#ef4444';
            } else {
                countEl.textContent = '';
            }
        }
    },

    /**
     * Effacer le filtre Peppy
     */
    clearPeppyFilter() {
        const input = document.getElementById('peppySearchInput');
        if (input) input.value = '';
        this.selectedMembers = [];
        this.generateTable();
        this.updatePeppyMatchCount();
    }
};

// Exposer AlluresManager globalement
window.AlluresManager = AlluresManager;

// Fonction globale pour compatibilité (ancien système)
function toggleAlluresTableau() {
    AlluresManager.showAlluresView();
}
