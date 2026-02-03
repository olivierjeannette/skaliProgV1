// Gestionnaire de rapports et d'export pour les adhérents
const ReportManager = {
    // Afficher le menu des rapports
    showReportsMenu() {
        const html = `
            <div class="reports-container">
                <div class="reports-header">
                    <h1 class="reports-title">
                        <i class="fas fa-chart-bar"></i>
                        Rapports & Export
                    </h1>
                    <p class="reports-subtitle">Générez des rapports détaillés et exportez les données</p>
                </div>
                
                <div class="reports-grid">
                    <div class="report-card" onclick="generateFitnessReport()">
                        <div class="report-icon">
                            <i class="fas fa-heartbeat"></i>
                        </div>
                        <h3>Rapport de Forme</h3>
                        <p>Analyse complète des scores de forme de tous les adhérents</p>
                    </div>
                    
                    <div class="report-card" onclick="generatePerformanceReport()">
                        <div class="report-icon">
                            <i class="fas fa-trophy"></i>
                        </div>
                        <h3>Rapport de Performances</h3>
                        <p>Détails des performances par catégorie et adhérent</p>
                    </div>
                    
                    <div class="report-card" onclick="exportMembersCSV()">
                        <div class="report-icon">
                            <i class="fas fa-file-csv"></i>
                        </div>
                        <h3>Export CSV</h3>
                        <p>Exporter la base de données des adhérents en CSV</p>
                    </div>
                    
                    <div class="report-card" onclick="exportPerformanceData()">
                        <div class="report-icon">
                            <i class="fas fa-download"></i>
                        </div>
                        <h3>Export Performances</h3>
                        <p>Exporter toutes les performances en format Excel</p>
                    </div>
                    
                    <div class="report-card" onclick="generateProgressReport()">
                        <div class="report-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <h3>Rapport de Progrès</h3>
                        <p>Évolution des performances dans le temps</p>
                    </div>
                    
                    <div class="report-card" onclick="generateStatsReport()">
                        <div class="report-icon">
                            <i class="fas fa-chart-pie"></i>
                        </div>
                        <h3>Statistiques Globales</h3>
                        <p>Moyennes, médianes et tendances générales</p>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('mainContent').innerHTML = html;
    },

    // Générer un rapport de forme (VERSION SUPABASE)
    async generateFitnessReport() {
        try {
            const members = await SupabaseManager.getMembers();
            const reportData = await this.analyzeFitnessScores(members);

            const html = `
            <div class="report-view">
                <div class="report-header">
                    <button onclick="ReportManager.showReportsMenu()" class="back-btn">
                        <i class="fas fa-arrow-left"></i>
                        Retour
                    </button>
                    <h1>Rapport de Forme</h1>
                    <button onclick="ReportManager.exportReport('fitness')" class="btn-premium">
                        <i class="fas fa-download"></i>
                        Exporter
                    </button>
                </div>
                
                <div class="report-content">
                    <div class="report-summary">
                        <div class="summary-card">
                            <h3>Score Moyen</h3>
                            <div class="summary-value">${reportData.averageScore}</div>
                        </div>
                        <div class="summary-card">
                            <h3>Meilleur Score</h3>
                            <div class="summary-value">${reportData.bestScore}</div>
                        </div>
                        <div class="summary-card">
                            <h3>Adhérents Actifs</h3>
                            <div class="summary-value">${reportData.activeMembers}</div>
                        </div>
                        <div class="summary-card">
                            <h3>Score Minimum</h3>
                            <div class="summary-value">${reportData.worstScore}</div>
                        </div>
                    </div>
                    
                    <div class="report-chart">
                        <h3>Distribution des Scores</h3>
                        <div class="chart-container">
                            ${this.generateFitnessChart(reportData.distribution)}
                        </div>
                    </div>
                    
                    <div class="report-table">
                        <h3>Détail par Adhérent</h3>
                        <div class="table-container">
                            <table class="report-table-content">
                                <thead>
                                    <tr>
                                        <th>Adhérent</th>
                                        <th>Score</th>
                                        <th>Niveau</th>
                                        <th>Âge</th>
                                        <th>IMC</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.generateFitnessTable(reportData.members)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;

            document.getElementById('mainContent').innerHTML = html;
        } catch (error) {
            console.error('Erreur génération rapport forme:', error);
            Utils.showNotification('Erreur', 'Impossible de générer le rapport', 'error');
        }
    },

    // Analyser les scores de forme
    async analyzeFitnessScores(members) {
        const memberList = Array.isArray(members) ? members : Object.values(members);
        const scores = memberList.map(member => {
            const score = AdvancedMemberManager.calculateFitnessScore(member);
            return {
                member,
                score,
                level: this.getFitnessLevel(score),
                bmi: this.calculateBMI(member)
            };
        });

        const validScores = scores.filter(s => s.score > 0);
        const averageScore =
            validScores.length > 0
                ? Math.round(validScores.reduce((sum, s) => sum + s.score, 0) / validScores.length)
                : 0;

        const bestScore = validScores.length > 0 ? Math.max(...validScores.map(s => s.score)) : 0;

        const worstScore = validScores.length > 0 ? Math.min(...validScores.map(s => s.score)) : 0;

        return {
            members: scores,
            averageScore,
            bestScore,
            worstScore,
            activeMembers: validScores.length,
            distribution: this.calculateDistribution(validScores.map(s => s.score))
        };
    },

    // Calculer la distribution des scores
    calculateDistribution(scores) {
        const ranges = [
            { min: 0, max: 20, label: '0-20', count: 0 },
            { min: 21, max: 40, label: '21-40', count: 0 },
            { min: 41, max: 60, label: '41-60', count: 0 },
            { min: 61, max: 80, label: '61-80', count: 0 },
            { min: 81, max: 100, label: '81-100', count: 0 }
        ];

        scores.forEach(score => {
            const range = ranges.find(r => score >= r.min && score <= r.max);
            if (range) {
                range.count++;
            }
        });

        return ranges;
    },

    // Générer le graphique de distribution
    generateFitnessChart(distribution) {
        const maxCount = Math.max(...distribution.map(d => d.count));

        return `
            <div class="bar-chart">
                ${distribution
                    .map(
                        range => `
                    <div class="bar-group">
                        <div class="bar" style="height: ${(range.count / maxCount) * 100}%"></div>
                        <div class="bar-label">${range.label}</div>
                        <div class="bar-value">${range.count}</div>
                    </div>
                `
                    )
                    .join('')}
            </div>
        `;
    },

    // Générer le tableau de forme
    generateFitnessTable(members) {
        return members
            .map(
                member => `
            <tr>
                <td>${member.member.firstName} ${member.member.lastName}</td>
                <td>
                    <div class="score-badge score-${this.getScoreClass(member.score)}">
                        ${member.score}
                    </div>
                </td>
                <td>
                    <span class="level-badge level-${member.level.toLowerCase()}">
                        ${member.level}
                    </span>
                </td>
                <td>${member.member.age || 'N/A'}</td>
                <td>${member.bmi ? member.bmi.toFixed(1) : 'N/A'}</td>
                <td>
                    <button onclick="AdvancedMemberManager.showMemberProfile('${member.member.id}')" 
                            class="btn-small">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `
            )
            .join('');
    },

    // Obtenir le niveau de forme
    getFitnessLevel(score) {
        if (score >= 80) {
            return 'Excellent';
        }
        if (score >= 60) {
            return 'Bon';
        }
        if (score >= 40) {
            return 'Moyen';
        }
        if (score >= 20) {
            return 'Faible';
        }
        return 'Très Faible';
    },

    // Obtenir la classe CSS du score
    getScoreClass(score) {
        if (score >= 80) {
            return 'excellent';
        }
        if (score >= 60) {
            return 'good';
        }
        if (score >= 40) {
            return 'average';
        }
        if (score >= 20) {
            return 'poor';
        }
        return 'very-poor';
    },

    // Calculer l'IMC
    calculateBMI(member) {
        if (!member.weight || !member.height) {
            return null;
        }
        const heightInMeters = member.height / 100;
        return member.weight / (heightInMeters * heightInMeters);
    },

    // Exporter les adhérents en CSV (VERSION SUPABASE)
    async exportMembersCSV() {
        try {
            const members = await SupabaseManager.getMembers();
            const csvContent = await this.generateMembersCSV(members);
            this.downloadCSV(csvContent, 'adherents.csv');
            Utils.showNotification('Export CSV généré avec succès', 'success');
        } catch (error) {
            console.error('Erreur export CSV:', error);
            Utils.showNotification('Erreur', "Impossible d'exporter les données", 'error');
        }
    },

    // Générer le CSV des adhérents (VERSION SUPABASE)
    async generateMembersCSV(members) {
        const headers = [
            'Nom',
            'Genre',
            'Poids (kg)',
            'Taille (cm)',
            'IMC',
            'Actif',
            'Date de Création'
        ];

        const memberList = Array.isArray(members) ? members : Object.values(members);

        const rows = memberList.map(member => {
            const bmi = this.calculateBMI(member);
            const gender =
                member.gender === 'male' ? 'Homme' : member.gender === 'female' ? 'Femme' : 'Autre';

            return [
                member.name || '',
                gender,
                member.weight || '',
                member.height || '',
                bmi ? bmi.toFixed(1) : '',
                member.is_active ? 'Oui' : 'Non',
                member.created_at ? new Date(member.created_at).toLocaleDateString('fr-FR') : ''
            ];
        });

        return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    },

    // Télécharger un fichier CSV
    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    // Générer un rapport de performances (VERSION SUPABASE)
    async generatePerformanceReport() {
        try {
            const [members, performances] = await Promise.all([
                SupabaseManager.getMembers(),
                SupabaseManager.getPerformances()
            ]);
            const reportData = await this.analyzePerformances(members, performances);

            const html = `
            <div class="report-view">
                <div class="report-header">
                    <button onclick="ReportManager.showReportsMenu()" class="back-btn">
                        <i class="fas fa-arrow-left"></i>
                        Retour
                    </button>
                    <h1>Rapport de Performances</h1>
                    <button onclick="ReportManager.exportReport('performance')" class="btn-premium">
                        <i class="fas fa-download"></i>
                        Exporter
                    </button>
                </div>
                
                <div class="report-content">
                    <div class="performance-categories-report">
                        ${this.generatePerformanceCategoriesReport(reportData)}
                    </div>
                </div>
            </div>
        `;

            document.getElementById('mainContent').innerHTML = html;
        } catch (error) {
            console.error('Erreur génération rapport performances:', error);
            Utils.showNotification('Erreur', 'Impossible de générer le rapport', 'error');
        }
    },

    // Analyser les performances (VERSION SUPABASE)
    async analyzePerformances(members, performances) {
        const categories = ['cardio', 'crosstraining', 'musculation', 'flexibility', 'endurance'];
        const analysis = {};

        categories.forEach(category => {
            analysis[category] = {
                totalMembers: 0,
                activeMembers: 0,
                averageScore: 0,
                bestScore: 0,
                performances: []
            };
        });

        Object.values(members).forEach(member => {
            categories.forEach(category => {
                const score = AdvancedMemberManager.getPerformanceLevelValue(member, category);
                if (score > 0) {
                    analysis[category].activeMembers++;
                    analysis[category].performances.push({
                        member: member,
                        score: score
                    });
                }
                analysis[category].totalMembers++;
            });
        });

        // Calculer les moyennes
        categories.forEach(category => {
            const perf = analysis[category].performances;
            if (perf.length > 0) {
                analysis[category].averageScore = Math.round(
                    perf.reduce((sum, p) => sum + p.score, 0) / perf.length
                );
                analysis[category].bestScore = Math.max(...perf.map(p => p.score));
            }
        });

        return analysis;
    },

    // Générer le rapport des catégories de performance
    generatePerformanceCategoriesReport(data) {
        const categories = ['cardio', 'crosstraining', 'musculation', 'flexibility', 'endurance'];

        return categories
            .map(category => {
                const catData = data[category];
                const categoryName = this.getCategoryDisplayName(category);
                const icon = this.getCategoryIcon(category);

                return `
                <div class="performance-category-report">
                    <div class="category-header">
                        <i class="fas fa-${icon}"></i>
                        <h3>${categoryName}</h3>
                    </div>
                    <div class="category-stats">
                        <div class="stat">
                            <span class="stat-label">Membres Actifs</span>
                            <span class="stat-value">${catData.activeMembers}/${catData.totalMembers}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Score Moyen</span>
                            <span class="stat-value">${catData.averageScore}%</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Meilleur Score</span>
                            <span class="stat-value">${catData.bestScore}%</span>
                        </div>
                    </div>
                    <div class="category-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${catData.averageScore}%"></div>
                        </div>
                    </div>
                </div>
            `;
            })
            .join('');
    },

    // Obtenir le nom d'affichage de la catégorie
    getCategoryDisplayName(category) {
        const names = {
            cardio: 'Cardio',
            crosstraining: 'Cross Training',
            musculation: 'Musculation',
            flexibility: 'Flexibilité',
            endurance: 'Endurance'
        };
        return names[category] || category;
    },

    // Obtenir l'icône de la catégorie
    getCategoryIcon(category) {
        const icons = {
            cardio: 'heart',
            crosstraining: 'fire',
            musculation: 'dumbbell',
            flexibility: 'leaf',
            endurance: 'running'
        };
        return icons[category] || 'chart-line';
    },

    // Générer un rapport de progrès (VERSION SUPABASE)
    async generateProgressReport() {
        try {
            const [members, performances] = await Promise.all([
                SupabaseManager.getMembers(),
                SupabaseManager.getPerformances()
            ]);
            const progressData = await this.analyzeProgress(members, performances);

            const html = `
            <div class="report-view">
                <div class="report-header">
                    <button onclick="ReportManager.showReportsMenu()" class="back-btn">
                        <i class="fas fa-arrow-left"></i>
                        Retour
                    </button>
                    <h1>Rapport de Progrès</h1>
                    <button onclick="ReportManager.exportReport('progress')" class="btn-premium">
                        <i class="fas fa-download"></i>
                        Exporter
                    </button>
                </div>
                
                <div class="report-content">
                    <div class="progress-summary">
                        <div class="summary-card">
                            <h3>Adhérents en Progrès</h3>
                            <div class="summary-value">${progressData.improvingMembers}</div>
                        </div>
                        <div class="summary-card">
                            <h3>Amélioration Moyenne</h3>
                            <div class="summary-value">${progressData.averageImprovement}%</div>
                        </div>
                        <div class="summary-card">
                            <h3>Meilleure Progression</h3>
                            <div class="summary-value">${progressData.bestImprovement}%</div>
                        </div>
                        <div class="summary-card">
                            <h3>Période d'Analyse</h3>
                            <div class="summary-value">${progressData.analysisPeriod}</div>
                        </div>
                    </div>
                    
                    <div class="progress-charts">
                        <div class="progress-trends">
                            <h3>Évolution des Performances</h3>
                            <div class="trends-container">
                                ${this.generateProgressTrends(progressData.trends)}
                            </div>
                        </div>
                        
                        <div class="progress-categories">
                            <h3>Progrès par Catégorie</h3>
                            <div class="categories-progress">
                                ${this.generateCategoriesProgress(progressData.categories)}
                            </div>
                        </div>
                    </div>
                    
                    <div class="progress-members">
                        <h3>Détail des Progrès par Adhérent</h3>
                        <div class="members-progress-table">
                            ${this.generateMembersProgressTable(progressData.members)}
                        </div>
                    </div>
                </div>
            </div>
        `;

            document.getElementById('mainContent').innerHTML = html;
        } catch (error) {
            console.error('Erreur génération rapport progrès:', error);
            Utils.showNotification('Erreur', 'Impossible de générer le rapport', 'error');
        }
    },

    // Analyser les progrès (VERSION SUPABASE)
    async analyzeProgress(members, performances) {
        const memberList = Object.values(members);
        const now = new Date();
        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

        let improvingMembers = 0;
        let totalImprovement = 0;
        let bestImprovement = 0;
        let membersWithProgress = 0;

        const trends = {
            cardio: { current: 0, previous: 0, count: 0 },
            crosstraining: { current: 0, previous: 0, count: 0 },
            musculation: { current: 0, previous: 0, count: 0 },
            flexibility: { current: 0, previous: 0, count: 0 },
            endurance: { current: 0, previous: 0, count: 0 }
        };

        const memberProgress = memberList.map(member => {
            const currentScore = AdvancedMemberManager.calculateFitnessScore(member);
            const progress = this.calculateMemberProgress(member, threeMonthsAgo);

            if (progress.improvement > 0) {
                improvingMembers++;
                totalImprovement += progress.improvement;
                bestImprovement = Math.max(bestImprovement, progress.improvement);
                membersWithProgress++;
            }

            // Analyser les tendances par catégorie
            Object.keys(trends).forEach(category => {
                const currentPerf = AdvancedMemberManager.getPerformanceLevelValue(
                    member,
                    category
                );
                const previousPerf = this.getPreviousPerformance(member, category, threeMonthsAgo);

                if (currentPerf > 0) {
                    trends[category].current += currentPerf;
                    trends[category].count++;
                }
                if (previousPerf > 0) {
                    trends[category].previous += previousPerf;
                }
            });

            return {
                member,
                currentScore,
                progress,
                improvement: progress.improvement
            };
        });

        // Calculer les moyennes des tendances
        Object.keys(trends).forEach(category => {
            if (trends[category].count > 0) {
                trends[category].current = Math.round(
                    trends[category].current / trends[category].count
                );
                trends[category].previous = Math.round(
                    trends[category].previous / trends[category].count
                );
            }
        });

        return {
            members: memberProgress,
            improvingMembers,
            averageImprovement:
                membersWithProgress > 0 ? Math.round(totalImprovement / membersWithProgress) : 0,
            bestImprovement,
            analysisPeriod: '3 derniers mois',
            trends,
            categories: this.analyzeCategoriesProgress(trends)
        };
    },

    // Calculer le progrès d'un adhérent
    calculateMemberProgress(member, sinceDate) {
        const performances = member.performances || {};
        const categories = ['cardio', 'crosstraining', 'musculation', 'flexibility', 'endurance'];

        let totalCurrent = 0;
        let totalPrevious = 0;
        let count = 0;

        categories.forEach(category => {
            const categoryPerf = performances[category] || {};
            const currentPerf = AdvancedMemberManager.getPerformanceLevelValue(member, category);
            const previousPerf = this.getPreviousPerformance(member, category, sinceDate);

            if (currentPerf > 0) {
                totalCurrent += currentPerf;
                count++;
            }
            if (previousPerf > 0) {
                totalPrevious += previousPerf;
            }
        });

        const currentAverage = count > 0 ? totalCurrent / count : 0;
        const previousAverage = count > 0 ? totalPrevious / count : 0;
        const improvement = currentAverage - previousAverage;

        return {
            current: Math.round(currentAverage),
            previous: Math.round(previousAverage),
            improvement: Math.round(improvement),
            trend: improvement > 0 ? 'up' : improvement < 0 ? 'down' : 'stable'
        };
    },

    // Obtenir les performances précédentes
    getPreviousPerformance(member, category, sinceDate) {
        const performances = member.performances || {};
        const categoryPerf = performances[category] || {};

        // Pour simplifier, on retourne une valeur basée sur l'ancienneté des performances
        const keys = Object.keys(categoryPerf);
        if (keys.length === 0) {
            return 0;
        }

        // Simulation d'une performance précédente (en réalité, il faudrait analyser les dates)
        return Math.max(0, AdvancedMemberManager.getPerformanceLevelValue(member, category) - 10);
    },

    // Analyser les progrès par catégorie
    analyzeCategoriesProgress(trends) {
        return Object.keys(trends).map(category => {
            const trend = trends[category];
            const improvement = trend.current - trend.previous;
            const percentage =
                trend.previous > 0 ? Math.round((improvement / trend.previous) * 100) : 0;

            return {
                category,
                name: this.getCategoryDisplayName(category),
                icon: this.getCategoryIcon(category),
                current: trend.current,
                previous: trend.previous,
                improvement,
                percentage,
                trend: improvement > 0 ? 'up' : improvement < 0 ? 'down' : 'stable'
            };
        });
    },

    // Générer les tendances de progrès
    generateProgressTrends(trends) {
        return Object.keys(trends)
            .map(category => {
                const trend = trends[category];
                const improvement = trend.current - trend.previous;
                const percentage =
                    trend.previous > 0 ? Math.round((improvement / trend.previous) * 100) : 0;

                return `
                <div class="trend-item">
                    <div class="trend-header">
                        <i class="fas fa-${this.getCategoryIcon(category)}"></i>
                        <span>${this.getCategoryDisplayName(category)}</span>
                    </div>
                    <div class="trend-values">
                        <div class="trend-value">
                            <span class="label">Actuel</span>
                            <span class="value">${trend.current}%</span>
                        </div>
                        <div class="trend-value">
                            <span class="label">Précédent</span>
                            <span class="value">${trend.previous}%</span>
                        </div>
                        <div class="trend-value ${improvement > 0 ? 'positive' : improvement < 0 ? 'negative' : 'neutral'}">
                            <span class="label">Évolution</span>
                            <span class="value">${improvement > 0 ? '+' : ''}${improvement}%</span>
                        </div>
                    </div>
                    <div class="trend-bar">
                        <div class="trend-bar-fill" style="width: ${Math.min(Math.abs(percentage), 100)}%"></div>
                    </div>
                </div>
            `;
            })
            .join('');
    },

    // Générer le progrès par catégorie
    generateCategoriesProgress(categories) {
        return categories
            .map(
                cat => `
            <div class="category-progress-item">
                <div class="category-header">
                    <i class="fas fa-${cat.icon}"></i>
                    <h4>${cat.name}</h4>
                    <span class="trend-indicator ${cat.trend}">
                        <i class="fas fa-${cat.trend === 'up' ? 'arrow-up' : cat.trend === 'down' ? 'arrow-down' : 'minus'}"></i>
                    </span>
                </div>
                <div class="category-stats">
                    <div class="stat">
                        <span class="stat-label">Actuel</span>
                        <span class="stat-value">${cat.current}%</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Précédent</span>
                        <span class="stat-value">${cat.previous}%</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Amélioration</span>
                        <span class="stat-value ${cat.trend}">${cat.improvement > 0 ? '+' : ''}${cat.improvement}%</span>
                    </div>
                </div>
            </div>
        `
            )
            .join('');
    },

    // Générer le tableau des progrès des adhérents
    generateMembersProgressTable(members) {
        return `
            <div class="table-container">
                <table class="report-table-content">
                    <thead>
                        <tr>
                            <th>Adhérent</th>
                            <th>Score Actuel</th>
                            <th>Score Précédent</th>
                            <th>Amélioration</th>
                            <th>Tendance</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${members
                            .map(
                                member => `
                            <tr>
                                <td>${member.member.firstName} ${member.member.lastName}</td>
                                <td>
                                    <div class="score-badge score-${this.getScoreClass(member.currentScore)}">
                                        ${member.currentScore}
                                    </div>
                                </td>
                                <td>
                                    <div class="score-badge score-${this.getScoreClass(member.progress.previous)}">
                                        ${member.progress.previous}
                                    </div>
                                </td>
                                <td>
                                    <span class="improvement ${member.improvement > 0 ? 'positive' : member.improvement < 0 ? 'negative' : 'neutral'}">
                                        ${member.improvement > 0 ? '+' : ''}${member.improvement}%
                                    </span>
                                </td>
                                <td>
                                    <span class="trend-indicator ${member.progress.trend}">
                                        <i class="fas fa-${member.progress.trend === 'up' ? 'arrow-up' : member.progress.trend === 'down' ? 'arrow-down' : 'minus'}"></i>
                                    </span>
                                </td>
                                <td>
                                    <button onclick="AdvancedMemberManager.showMemberProfile('${member.member.id}')" 
                                            class="btn-small">
                                        <i class="fas fa-eye"></i>
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
    },

    // Générer un rapport de statistiques globales (VERSION SUPABASE)
    async generateStatsReport() {
        try {
            const [members, performances] = await Promise.all([
                SupabaseManager.getMembers(),
                SupabaseManager.getPerformances()
            ]);
            const statsData = await this.analyzeGlobalStats(members, performances);

            const html = `
            <div class="report-view">
                <div class="report-header">
                    <button onclick="ReportManager.showReportsMenu()" class="back-btn">
                        <i class="fas fa-arrow-left"></i>
                        Retour
                    </button>
                    <h1>Statistiques Globales</h1>
                    <button onclick="ReportManager.exportReport('stats')" class="btn-premium">
                        <i class="fas fa-download"></i>
                        Exporter
                    </button>
                </div>
                
                <div class="report-content">
                    <div class="stats-overview">
                        <div class="overview-card">
                            <h3>Total Adhérents</h3>
                            <div class="overview-value">${statsData.totalMembers}</div>
                        </div>
                        <div class="overview-card">
                            <h3>Score Moyen</h3>
                            <div class="overview-value">${statsData.averageScore}</div>
                        </div>
                        <div class="overview-card">
                            <h3>Performances Enregistrées</h3>
                            <div class="overview-value">${statsData.totalPerformances}</div>
                        </div>
                        <div class="overview-card">
                            <h3>Catégories Actives</h3>
                            <div class="overview-value">${statsData.activeCategories}</div>
                        </div>
                    </div>
                    
                    <div class="stats-charts">
                        <div class="stats-distribution">
                            <h3>Distribution des Scores</h3>
                            <div class="distribution-chart">
                                ${this.generateDistributionChart(statsData.distribution)}
                            </div>
                        </div>
                        
                        <div class="stats-categories">
                            <h3>Performances par Catégorie</h3>
                            <div class="categories-stats">
                                ${this.generateCategoriesStats(statsData.categories)}
                            </div>
                        </div>
                    </div>
                    
                    <div class="stats-demographics">
                        <h3>Démographie</h3>
                        <div class="demographics-grid">
                            <div class="demo-card">
                                <h4>Par Genre</h4>
                                <div class="demo-chart">
                                    ${this.generateGenderChart(statsData.demographics.gender)}
                                </div>
                            </div>
                            <div class="demo-card">
                                <h4>Par Âge</h4>
                                <div class="demo-chart">
                                    ${this.generateAgeChart(statsData.demographics.age)}
                                </div>
                            </div>
                            <div class="demo-card">
                                <h4>Par IMC</h4>
                                <div class="demo-chart">
                                    ${this.generateBMIChart(statsData.demographics.bmi)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

            document.getElementById('mainContent').innerHTML = html;
        } catch (error) {
            console.error('Erreur génération rapport stats:', error);
            Utils.showNotification('Erreur', 'Impossible de générer le rapport', 'error');
        }
    },

    // Analyser les statistiques globales (VERSION SUPABASE)
    async analyzeGlobalStats(members, performances) {
        const memberList = Array.isArray(members) ? members : Object.values(members);
        const validMembers = memberList.filter(m => m.name);

        let totalPerformances = 0;
        let totalScore = 0;
        let activeCategories = 0;

        const categories = ['cardio', 'crosstraining', 'musculation', 'flexibility', 'endurance'];
        const categoryStats = {};

        categories.forEach(category => {
            categoryStats[category] = {
                name: this.getCategoryDisplayName(category),
                icon: this.getCategoryIcon(category),
                totalMembers: 0,
                activeMembers: 0,
                averageScore: 0,
                totalScore: 0
            };
        });

        const scores = [];
        const demographics = {
            gender: { homme: 0, femme: 0, non_defini: 0 },
            age: { '16-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '56+': 0 },
            bmi: { sous_poids: 0, normal: 0, surpoids: 0, obesite: 0 }
        };

        // Compter les performances totales
        totalPerformances = performances.length;

        validMembers.forEach(member => {
            // Pour les rapports, on peut utiliser un score basique
            const score = 50; // Score par défaut, peut être calculé à partir des performances
            scores.push(score);
            totalScore += score;

            // Démographie (adapter pour la structure Supabase)
            if (member.gender === 'male') {
                demographics.gender.homme++;
            } else if (member.gender === 'female') {
                demographics.gender.femme++;
            } else {
                demographics.gender.non_defini++;
            }

            if (member.age) {
                if (member.age <= 25) {
                    demographics.age['16-25']++;
                } else if (member.age <= 35) {
                    demographics.age['26-35']++;
                } else if (member.age <= 45) {
                    demographics.age['36-45']++;
                } else if (member.age <= 55) {
                    demographics.age['46-55']++;
                } else {
                    demographics.age['56+']++;
                }
            }

            const bmi = this.calculateBMI(member);
            if (bmi) {
                if (bmi < 18.5) {
                    demographics.bmi.sous_poids++;
                } else if (bmi < 25) {
                    demographics.bmi.normal++;
                } else if (bmi < 30) {
                    demographics.bmi.surpoids++;
                } else {
                    demographics.bmi.obesite++;
                }
            }

            // Statistiques par catégorie (basées sur les performances Supabase)
            categories.forEach(category => {
                categoryStats[category].totalMembers++;

                // Compter les performances du membre pour cette catégorie
                const memberPerfs = performances.filter(
                    p =>
                        p.member_id === member.id &&
                        p.exercise_type?.toLowerCase().includes(category)
                );

                if (memberPerfs.length > 0) {
                    categoryStats[category].activeMembers++;
                    // Score fictif basé sur le nombre de performances
                    const perfScore = Math.min(100, memberPerfs.length * 10);
                    categoryStats[category].totalScore += perfScore;
                }
            });
        });

        // Calculer les moyennes
        categories.forEach(category => {
            const stats = categoryStats[category];
            if (stats.activeMembers > 0) {
                stats.averageScore = Math.round(stats.totalScore / stats.activeMembers);
                activeCategories++;
            }
        });

        return {
            totalMembers: validMembers.length,
            averageScore:
                validMembers.length > 0 ? Math.round(totalScore / validMembers.length) : 0,
            totalPerformances,
            activeCategories,
            distribution: this.calculateDistribution(scores),
            categories: Object.values(categoryStats),
            demographics
        };
    },

    // Générer le graphique de distribution
    generateDistributionChart(distribution) {
        const maxCount = Math.max(...distribution.map(d => d.count));

        return `
            <div class="distribution-bars">
                ${distribution
                    .map(
                        range => `
                    <div class="dist-bar-group">
                        <div class="dist-bar" style="height: ${(range.count / maxCount) * 100}%"></div>
                        <div class="dist-label">${range.label}</div>
                        <div class="dist-value">${range.count}</div>
                    </div>
                `
                    )
                    .join('')}
            </div>
        `;
    },

    // Générer les statistiques par catégorie
    generateCategoriesStats(categories) {
        return categories
            .map(
                cat => `
            <div class="category-stats-item">
                <div class="category-header">
                    <i class="fas fa-${cat.icon}"></i>
                    <h4>${cat.name}</h4>
                </div>
                <div class="category-metrics">
                    <div class="metric">
                        <span class="metric-label">Membres Actifs</span>
                        <span class="metric-value">${cat.activeMembers}/${cat.totalMembers}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Score Moyen</span>
                        <span class="metric-value">${cat.averageScore}%</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Taux d'Activité</span>
                        <span class="metric-value">${Math.round((cat.activeMembers / cat.totalMembers) * 100)}%</span>
                    </div>
                </div>
                <div class="category-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${cat.averageScore}%"></div>
                    </div>
                </div>
            </div>
        `
            )
            .join('');
    },

    // Générer le graphique par genre
    generateGenderChart(genderData) {
        const total = genderData.homme + genderData.femme + genderData.non_defini;
        if (total === 0) {
            return '<p>Aucune donnée</p>';
        }

        return `
            <div class="pie-chart">
                <div class="pie-slice" style="--percentage: ${(genderData.homme / total) * 100}%; --color: var(--green-500);">
                    <span class="pie-label">Hommes</span>
                    <span class="pie-value">${genderData.homme}</span>
                </div>
                <div class="pie-slice" style="--percentage: ${(genderData.femme / total) * 100}%; --color: var(--sport-orange);">
                    <span class="pie-label">Femmes</span>
                    <span class="pie-value">${genderData.femme}</span>
                </div>
                <div class="pie-slice" style="--percentage: ${(genderData.non_defini / total) * 100}%; --color: var(--green-300);">
                    <span class="pie-label">Non défini</span>
                    <span class="pie-value">${genderData.non_defini}</span>
                </div>
            </div>
        `;
    },

    // Générer le graphique par âge
    generateAgeChart(ageData) {
        const total = Object.values(ageData).reduce((sum, count) => sum + count, 0);
        if (total === 0) {
            return '<p>Aucune donnée</p>';
        }

        return Object.entries(ageData)
            .map(
                ([range, count]) => `
            <div class="age-bar">
                <span class="age-label">${range} ans</span>
                <div class="age-bar-fill" style="width: ${(count / total) * 100}%"></div>
                <span class="age-value">${count}</span>
            </div>
        `
            )
            .join('');
    },

    // Générer le graphique par IMC
    generateBMIChart(bmiData) {
        const total = Object.values(bmiData).reduce((sum, count) => sum + count, 0);
        if (total === 0) {
            return '<p>Aucune donnée</p>';
        }

        const labels = {
            sous_poids: 'Sous-poids',
            normal: 'Normal',
            surpoids: 'Surpoids',
            obesite: 'Obésité'
        };

        return Object.entries(bmiData)
            .map(
                ([category, count]) => `
            <div class="bmi-bar">
                <span class="bmi-label">${labels[category]}</span>
                <div class="bmi-bar-fill" style="width: ${(count / total) * 100}%"></div>
                <span class="bmi-value">${count}</span>
            </div>
        `
            )
            .join('');
    },

    // Exporter un rapport
    exportReport(type) {
        // TODO: Implémenter l'export de rapports
        Utils.showNotification("Fonction d'export de rapport en cours de développement", 'info');
    }
};

// Exposer les fonctions globalement pour les événements HTML
window.generateFitnessReport = function () {
    ReportManager.generateFitnessReport();
};

window.generatePerformanceReport = function () {
    ReportManager.generatePerformanceReport();
};

window.generateProgressReport = function () {
    generateProgressReport();
};

window.generateStatsReport = function () {
    generateStatsReport();
};

window.exportMembersCSV = function () {
    exportMembersCSV();
};

window.exportPerformanceData = function () {
    exportPerformanceData();
};
