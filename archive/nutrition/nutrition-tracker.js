/**
 * NUTRITION TRACKER - Suivi poids et composition corporelle
 * Système de graphiques pour suivre l'évolution des adhérents
 */

const NutritionTracker = {
    /**
     * Initialiser le système de tracking
     */
    init() {
        console.log('📊 Nutrition Tracker initialisé');
        this.measurements = this.loadMeasurements();
    },

    /**
     * Charger les mesures depuis localStorage
     */
    loadMeasurements() {
        const data = localStorage.getItem('nutritionTracker_measurements');
        return data ? JSON.parse(data) : {};
    },

    /**
     * Sauvegarder les mesures dans localStorage
     */
    saveMeasurements() {
        localStorage.setItem('nutritionTracker_measurements', JSON.stringify(this.measurements));
    },

    /**
     * Ajouter une mesure pour un adhérent
     * @param memberId
     * @param data
     */
    addMeasurement(memberId, data) {
        if (!this.measurements[memberId]) {
            this.measurements[memberId] = [];
        }

        const measurement = {
            date: data.date || new Date().toISOString(),
            weight: parseFloat(data.weight),
            bodyFat: data.bodyFat ? parseFloat(data.bodyFat) : null,
            muscleMass: data.muscleMass ? parseFloat(data.muscleMass) : null,
            waist: data.waist ? parseFloat(data.waist) : null,
            chest: data.chest ? parseFloat(data.chest) : null,
            arms: data.arms ? parseFloat(data.arms) : null,
            thighs: data.thighs ? parseFloat(data.thighs) : null,
            notes: data.notes || ''
        };

        this.measurements[memberId].push(measurement);

        // Trier par date
        this.measurements[memberId].sort((a, b) => new Date(a.date) - new Date(b.date));

        this.saveMeasurements();

        return measurement;
    },

    /**
     * Obtenir toutes les mesures d'un adhérent
     * @param memberId
     */
    getMeasurements(memberId) {
        return this.measurements[memberId] || [];
    },

    /**
     * Obtenir la dernière mesure
     * @param memberId
     */
    getLatestMeasurement(memberId) {
        const measurements = this.getMeasurements(memberId);
        return measurements.length > 0 ? measurements[measurements.length - 1] : null;
    },

    /**
     * Supprimer une mesure
     * @param memberId
     * @param index
     */
    deleteMeasurement(memberId, index) {
        if (this.measurements[memberId] && this.measurements[memberId][index]) {
            this.measurements[memberId].splice(index, 1);
            this.saveMeasurements();
            return true;
        }
        return false;
    },

    /**
     * Calculer les statistiques d'évolution
     * @param memberId
     * @param period
     */
    calculateStats(memberId, period = 'all') {
        const measurements = this.getMeasurements(memberId);
        if (measurements.length < 2) {
            return null;
        }

        // Filtrer selon la période
        let filteredData = measurements;
        if (period !== 'all') {
            const now = new Date();
            const startDate = new Date();

            switch (period) {
                case '7d':
                    startDate.setDate(now.getDate() - 7);
                    break;
                case '30d':
                    startDate.setDate(now.getDate() - 30);
                    break;
                case '90d':
                    startDate.setDate(now.getDate() - 90);
                    break;
            }

            filteredData = measurements.filter(m => new Date(m.date) >= startDate);
        }

        if (filteredData.length < 2) {
            return null;
        }

        const first = filteredData[0];
        const last = filteredData[filteredData.length - 1];

        // Calculs d'évolution
        const weightChange = last.weight - first.weight;
        const weightChangePercent = (weightChange / first.weight) * 100;

        const bodyFatChange = last.bodyFat && first.bodyFat ? last.bodyFat - first.bodyFat : null;
        const muscleChange = last.muscleMass && first.muscleMass ? last.muscleMass - first.muscleMass : null;

        // Calculer la masse grasse et la masse maigre
        const firstFatMass = first.bodyFat ? (first.weight * first.bodyFat / 100) : null;
        const lastFatMass = last.bodyFat ? (last.weight * last.bodyFat / 100) : null;
        const fatMassChange = firstFatMass && lastFatMass ? lastFatMass - firstFatMass : null;

        const firstLeanMass = first.bodyFat ? first.weight * (1 - first.bodyFat / 100) : null;
        const lastLeanMass = last.bodyFat ? last.weight * (1 - last.bodyFat / 100) : null;
        const leanMassChange = firstLeanMass && lastLeanMass ? lastLeanMass - firstLeanMass : null;

        // Calcul du taux de changement par semaine
        const daysDiff = (new Date(last.date) - new Date(first.date)) / (1000 * 60 * 60 * 24);
        const weeksDiff = daysDiff / 7;
        const weightChangePerWeek = weeksDiff > 0 ? weightChange / weeksDiff : 0;

        return {
            period: period,
            startDate: first.date,
            endDate: last.date,
            daysDiff: Math.round(daysDiff),
            weeksDiff: Math.round(weeksDiff * 10) / 10,

            weight: {
                start: first.weight,
                end: last.weight,
                change: Math.round(weightChange * 10) / 10,
                changePercent: Math.round(weightChangePercent * 10) / 10,
                changePerWeek: Math.round(weightChangePerWeek * 10) / 10
            },

            bodyFat: bodyFatChange !== null ? {
                start: first.bodyFat,
                end: last.bodyFat,
                change: Math.round(bodyFatChange * 10) / 10
            } : null,

            fatMass: fatMassChange !== null ? {
                start: Math.round(firstFatMass * 10) / 10,
                end: Math.round(lastFatMass * 10) / 10,
                change: Math.round(fatMassChange * 10) / 10
            } : null,

            leanMass: leanMassChange !== null ? {
                start: Math.round(firstLeanMass * 10) / 10,
                end: Math.round(lastLeanMass * 10) / 10,
                change: Math.round(leanMassChange * 10) / 10
            } : null,

            muscleGain: muscleChange !== null ? Math.round(muscleChange * 10) / 10 : null
        };
    },

    /**
     * Afficher le modal de suivi
     * @param memberId
     * @param memberName
     */
    showTrackerModal(memberId, memberName) {
        // Fermer tout modal existant pour éviter les doublons
        const existingModal = document.querySelector('.nutrition-tracker-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const measurements = this.getMeasurements(memberId);
        const stats = this.calculateStats(memberId, '30d');

        const modal = document.createElement('div');
        modal.className = 'nutrition-tracker-modal fixed inset-0 bg-gray-200 bg-opacity-90 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-skali-darker rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border-2 border-green-400">
                <!-- Header -->
                <div class="bg-gradient-to-r from-green-600 to-green-800 p-6 rounded-t-xl sticky top-0 z-10">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-2xl font-bold text-white flex items-center gap-3">
                                <i class="fas fa-chart-line"></i>
                                Suivi Nutritionnel - ${memberName}
                            </h2>
                            <p class="text-green-200 text-sm mt-1">${measurements.length} mesures enregistrées</p>
                        </div>
                        <button onclick="this.closest('.nutrition-tracker-modal').remove()" class="text-white hover:text-red-400 transition-colors">
                            <i class="fas fa-times text-2xl"></i>
                        </button>
                    </div>
                </div>

                <div class="p-6 space-y-6">
                    <!-- Onglets période -->
                    <div class="flex gap-2 mb-4">
                        <button class="tracker-period-btn px-4 py-2 rounded-lg bg-green-600 font-semibold" data-period="7d">7 jours</button>
                        <button class="tracker-period-btn px-4 py-2 rounded-lg glass-button" data-period="30d">30 jours</button>
                        <button class="tracker-period-btn px-4 py-2 rounded-lg glass-button" data-period="90d">90 jours</button>
                        <button class="tracker-period-btn px-4 py-2 rounded-lg glass-button" data-period="all">Tout</button>
                    </div>

                    <!-- Statistiques rapides -->
                    ${stats ? `
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div class="premium-card text-center">
                                <div class="text-3xl font-bold ${stats.weight.change > 0 ? 'text-red-400' : 'text-green-400'}">
                                    ${stats.weight.change > 0 ? '+' : ''}${stats.weight.change}kg
                                </div>
                                <div class="text-secondary text-sm mt-1">Évolution poids</div>
                            </div>
                            ${stats.fatMass ? `
                                <div class="premium-card text-center">
                                    <div class="text-3xl font-bold ${stats.fatMass.change > 0 ? 'text-red-400' : 'text-green-400'}">
                                        ${stats.fatMass.change > 0 ? '+' : ''}${stats.fatMass.change}kg
                                    </div>
                                    <div class="text-secondary text-sm mt-1">Masse grasse</div>
                                </div>
                            ` : ''}
                            ${stats.leanMass ? `
                                <div class="premium-card text-center">
                                    <div class="text-3xl font-bold ${stats.leanMass.change > 0 ? 'text-green-400' : 'text-red-400'}">
                                        ${stats.leanMass.change > 0 ? '+' : ''}${stats.leanMass.change}kg
                                    </div>
                                    <div class="text-secondary text-sm mt-1">Masse maigre</div>
                                </div>
                            ` : ''}
                            <div class="premium-card text-center">
                                <div class="text-3xl font-bold text-blue-400">
                                    ${stats.weight.changePerWeek > 0 ? '+' : ''}${stats.weight.changePerWeek}kg
                                </div>
                                <div class="text-secondary text-sm mt-1">Par semaine</div>
                            </div>
                        </div>
                    ` : '<div class="text-center text-secondary p-8">Ajoutez au moins 2 mesures pour voir les statistiques</div>'}

                    <!-- Graphique compact -->
                    <div class="premium-card">
                        <h3 class="text-lg font-bold mb-3">
                            <i class="fas fa-chart-area text-green-400 mr-2"></i>
                            Évolution
                        </h3>
                        <canvas id="trackerChart" class="w-full" style="max-height: 300px; height: 300px;"></canvas>
                    </div>

                    <!-- Ajouter mesure -->
                    <div class="premium-card">
                        <h3 class="text-xl font-bold mb-4">
                            <i class="fas fa-plus text-green-400 mr-2"></i>
                            Nouvelle mesure
                        </h3>
                        <form id="addMeasurementForm" class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label class="form-label text-sm">Date</label>
                                <input type="date" name="date" value="${new Date().toISOString().split('T')[0]}" required
                                    class="form-input w-full px-3 py-2 rounded-lg">
                            </div>
                            <div>
                                <label class="form-label text-sm">Poids (kg) *</label>
                                <input type="number" step="0.1" name="weight" required
                                    class="form-input w-full px-3 py-2 rounded-lg">
                            </div>
                            <div>
                                <label class="form-label text-sm">% Masse grasse</label>
                                <input type="number" step="0.1" name="bodyFat"
                                    class="form-input w-full px-3 py-2 rounded-lg">
                            </div>
                            <div>
                                <label class="form-label text-sm">Tour de taille (cm)</label>
                                <input type="number" step="0.1" name="waist"
                                    class="form-input w-full px-3 py-2 rounded-lg">
                            </div>
                            <div class="col-span-2 md:col-span-4">
                                <button type="submit" class="w-full bg-gradient-to-r from-green-500 to-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-800 transition-all">
                                    <i class="fas fa-plus mr-2"></i>
                                    Ajouter la mesure
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Historique -->
                    <div class="premium-card">
                        <h3 class="text-xl font-bold mb-4">
                            <i class="fas fa-history text-green-400 mr-2"></i>
                            Historique des mesures
                        </h3>
                        <div id="measurementsList" class="space-y-2 max-h-96 overflow-y-auto">
                            ${measurements.length === 0 ?
        '<div class="text-center text-secondary py-8">Aucune mesure enregistrée</div>' :
        measurements.map((m, i) => `
                                    <div class="glass-list-item flex items-center justify-between p-3 rounded-lg">
                                        <div class="flex-1">
                                            <div class="font-semibold">${new Date(m.date).toLocaleDateString('fr-FR')}</div>
                                            <div class="text-sm text-secondary">
                                                Poids: ${m.weight}kg
                                                ${m.bodyFat ? ` • MG: ${m.bodyFat}%` : ''}
                                                ${m.waist ? ` • Taille: ${m.waist}cm` : ''}
                                            </div>
                                        </div>
                                        <button onclick="event.stopPropagation(); NutritionTracker.deleteMeasurement('${memberId}', ${i}); this.closest('.nutrition-tracker-modal').remove(); setTimeout(() => NutritionTracker.showTrackerModal('${memberId}', '${memberName}'), 50)"
                                            class="text-red-400 hover:text-red-600 transition-colors">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                `).reverse().join('')
}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners avec suppression explicite avant rafraîchissement
        const form = document.getElementById('addMeasurementForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            this.addMeasurement(memberId, data);

            Utils.showNotification('Mesure ajoutée', 'La mesure a été enregistrée avec succès', 'success');

            // IMPORTANT: Supprimer le modal AVANT de recréer
            modal.remove();
            // Puis recréer immédiatement
            setTimeout(() => this.showTrackerModal(memberId, memberName), 50);
        });

        // Boutons période
        const periodButtons = modal.querySelectorAll('.tracker-period-btn');
        periodButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                periodButtons.forEach(b => {
                    b.classList.remove('bg-green-600', 'text-white');
                    b.classList.add('glass-card', 'text-secondary');
                });
                btn.classList.add('bg-green-600', 'text-white');
                btn.classList.remove('glass-card', 'text-secondary');

                const period = btn.dataset.period;
                this.updateChart(memberId, period);
            });
        });

        // Dessiner le graphique initial
        setTimeout(() => this.drawChart(memberId, '7d'), 100);
    },

    /**
     * Dessiner le graphique avec Chart.js
     * @param memberId
     * @param period
     */
    drawChart(memberId, period = '30d') {
        const measurements = this.getMeasurements(memberId);

        if (measurements.length === 0) {
            return;
        }

        // Filtrer par période
        let filteredData = measurements;
        if (period !== 'all') {
            const now = new Date();
            const startDate = new Date();

            switch (period) {
                case '7d':
                    startDate.setDate(now.getDate() - 7);
                    break;
                case '30d':
                    startDate.setDate(now.getDate() - 30);
                    break;
                case '90d':
                    startDate.setDate(now.getDate() - 90);
                    break;
            }

            filteredData = measurements.filter(m => new Date(m.date) >= startDate);
        }

        const canvas = document.getElementById('trackerChart');
        if (!canvas) {return;}

        const ctx = canvas.getContext('2d');

        // Détruire le graphique existant s'il y en a un
        if (this.currentChart) {
            this.currentChart.destroy();
        }

        const labels = filteredData.map(m => new Date(m.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
        const weightData = filteredData.map(m => m.weight);
        const bodyFatData = filteredData.map(m => m.bodyFat);

        const datasets = [
            {
                label: 'Poids (kg)',
                data: weightData,
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                yAxisID: 'y',
                tension: 0.4
            }
        ];

        // Ajouter % masse grasse si disponible
        if (bodyFatData.some(v => v !== null)) {
            datasets.push({
                label: '% Masse grasse',
                data: bodyFatData,
                borderColor: 'rgb(249, 115, 22)',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                yAxisID: 'y1',
                tension: 0.4
            });
        }

        this.currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 3,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'rgb(209, 213, 219)'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        titleColor: 'rgb(209, 213, 219)',
                        bodyColor: 'rgb(209, 213, 219)',
                        borderColor: 'rgb(34, 197, 94)',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Poids (kg)',
                            color: 'rgb(34, 197, 94)'
                        },
                        ticks: {
                            color: 'rgb(156, 163, 175)'
                        },
                        grid: {
                            color: 'rgba(75, 85, 99, 0.3)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: bodyFatData.some(v => v !== null),
                        position: 'right',
                        title: {
                            display: true,
                            text: '% Masse grasse',
                            color: 'rgb(249, 115, 22)'
                        },
                        ticks: {
                            color: 'rgb(156, 163, 175)'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    },
                    x: {
                        ticks: {
                            color: 'rgb(156, 163, 175)'
                        },
                        grid: {
                            color: 'rgba(75, 85, 99, 0.3)'
                        }
                    }
                }
            }
        });
    },

    /**
     * Mettre à jour le graphique selon la période
     * @param memberId
     * @param period
     */
    updateChart(memberId, period) {
        this.drawChart(memberId, period);
    }
};

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    NutritionTracker.init();
});
