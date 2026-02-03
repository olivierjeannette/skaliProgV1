// Gestionnaire de sauvegarde et restauration
const BackupManager = {
    autoBackupInterval: null,

    // Afficher la modal de sauvegarde
    async showBackupModal() {
        // Récupérer les stats depuis Supabase
        const stats = await SupabaseManager.getStats();

        const lastBackup = localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_BACKUP);
        const totalSessions = stats.sessions || 0;
        const totalMembers = stats.members || 0;
        const totalPerformances = stats.performances || 0;

        const html = `
            <div class="fixed inset-0 modal-backdrop flex items-center justify-center z-50 fade-in" onclick="Utils.closeModal(event)">
                <div class="bg-skali-light rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-skali" onclick="event.stopPropagation()">
                    <h3 class="text-2xl font-bold mb-6">
                        <i class="fas fa-shield-alt text-skali-accent mr-3"></i>
                        Sauvegarde & Restauration
                    </h3>
                    
                    <!-- Stats -->
                    <div class="bg-skali-dark rounded-lg p-4 mb-6">
                        <h4 class="font-medium mb-3 text-skali-accent">État des données (Supabase)</h4>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div class="text-center">
                                <div class="text-2xl font-bold text-green-400">${totalSessions}</div>
                                <div class="text-gray-400">Séances</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl font-bold text-blue-400">${totalMembers}</div>
                                <div class="text-gray-400">Adhérents</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl font-bold text-purple-400">${totalPerformances}</div>
                                <div class="text-gray-400">Performances</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl font-bold text-orange-400">
                                    ${lastBackup ? new Date(lastBackup).toLocaleDateString('fr-FR') : 'Jamais'}
                                </div>
                                <div class="text-gray-400">Dernière backup</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Export Options -->
                    <div class="space-y-4 mb-6">
                        <h4 class="font-medium text-skali-accent">Exporter les données</h4>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <button onclick="BackupManager.exportFullBackup()" class="flex items-center justify-between p-4 bg-skali-dark rounded-lg hover:bg-opacity-80 transition">
                                <div class="flex items-center">
                                    <i class="fas fa-database text-green-400 text-xl mr-3"></i>
                                    <div class="text-left">
                                        <div class="font-medium">Sauvegarde complète</div>
                                        <div class="text-sm text-gray-400">Toutes les données (JSON)</div>
                                    </div>
                                </div>
                                <i class="fas fa-download text-gray-400"></i>
                            </button>
                            
                            <button onclick="BackupManager.exportSessionsOnly()" class="flex items-center justify-between p-4 bg-skali-dark rounded-lg hover:bg-opacity-80 transition">
                                <div class="flex items-center">
                                    <i class="fas fa-calendar text-blue-400 text-xl mr-3"></i>
                                    <div class="text-left">
                                        <div class="font-medium">Séances uniquement</div>
                                        <div class="text-sm text-gray-400">Planning sans adhérents</div>
                                    </div>
                                </div>
                                <i class="fas fa-download text-gray-400"></i>
                            </button>
                            
                            <button onclick="BackupManager.exportMembersOnly()" class="flex items-center justify-between p-4 bg-skali-dark rounded-lg hover:bg-opacity-80 transition">
                                <div class="flex items-center">
                                    <i class="fas fa-users text-purple-400 text-xl mr-3"></i>
                                    <div class="text-left">
                                        <div class="font-medium">Adhérents uniquement</div>
                                        <div class="text-sm text-gray-400">Performances sans planning</div>
                                    </div>
                                </div>
                                <i class="fas fa-download text-gray-400"></i>
                            </button>
                            
                            <button onclick="BackupManager.exportToExcel()" class="flex items-center justify-between p-4 bg-skali-dark rounded-lg hover:bg-opacity-80 transition">
                                <div class="flex items-center">
                                    <i class="fas fa-file-excel text-green-500 text-xl mr-3"></i>
                                    <div class="text-left">
                                        <div class="font-medium">Export Excel</div>
                                        <div class="text-sm text-gray-400">Format tableur (.csv)</div>
                                    </div>
                                </div>
                                <i class="fas fa-download text-gray-400"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Import Section -->
                    <div class="space-y-4 mb-6">
                        <h4 class="font-medium text-skali-accent">Restaurer les données</h4>
                        <div class="bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg p-4">
                            <div class="flex items-center">
                                <i class="fas fa-exclamation-triangle text-yellow-400 mr-3"></i>
                                <div class="text-sm">
                                    <strong>Attention :</strong> La restauration remplacera toutes les données actuelles.
                                    Effectuez une sauvegarde avant d'importer.
                                </div>
                            </div>
                        </div>
                        
                        <div class="space-y-3">
                            <div>
                                <label class="block text-sm font-medium mb-2">Fichier de sauvegarde (.json)</label>
                                <input type="file" id="backupFileInput" accept=".json" 
                                       class="w-full rounded-lg p-3 bg-skali-dark border border-gray-600">
                            </div>
                            
                            <div class="flex space-x-2">
                                <button onclick="BackupManager.importBackup(false)" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition">
                                    <i class="fas fa-upload mr-2"></i>Restaurer (Remplacer)
                                </button>
                                <button onclick="BackupManager.importBackup(true)" class="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition">
                                    <i class="fas fa-plus mr-2"></i>Importer (Fusionner)
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Auto Backup -->
                    <div class="bg-skali-dark rounded-lg p-4 mb-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <h4 class="font-medium">Sauvegarde automatique</h4>
                                <p class="text-sm text-gray-400">Télécharge automatiquement une sauvegarde chaque semaine</p>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="autoBackupToggle" class="sr-only peer" 
                                       ${localStorage.getItem(CONFIG.STORAGE_KEYS.AUTO_BACKUP) === 'true' ? 'checked' : ''}
                                       onchange="BackupManager.toggleAutoBackup()">
                                <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-skali-accent"></div>
                            </label>
                        </div>
                    </div>
                    
                    <div class="flex space-x-3">
                        <button onclick="Utils.closeModal()" class="flex-1 btn-secondary py-2 rounded-lg">
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('modalContainer').innerHTML = html;
    },

    // Export sauvegarde complète
    async exportFullBackup() {
        try {
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `skali_prog_backup_${timestamp}.json`;

            // Récupérer toutes les données depuis Supabase
            const [members, sessions, performances] = await Promise.all([
                SupabaseManager.getMembers(),
                SupabaseManager.getSessions(),
                SupabaseManager.getPerformances()
            ]);

            const exportData = {
                version: '2.2',
                exportDate: new Date().toISOString(),
                data: {
                    members,
                    sessions,
                    performances
                }
            };

            Utils.downloadJSON(exportData, filename);

            // Mettre à jour le timestamp de dernière sauvegarde
            localStorage.setItem(CONFIG.STORAGE_KEYS.LAST_BACKUP, new Date().toISOString());

            Utils.showNotification('Sauvegarde complète téléchargée avec succès !', 'success');
        } catch (error) {
            console.error('Erreur export complet:', error);
            Utils.showNotification("Erreur lors de l'export", 'error');
        }
    },

    // Export séances uniquement
    async exportSessionsOnly() {
        try {
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `skali_prog_sessions_${timestamp}.json`;

            const sessions = await SupabaseManager.getSessions();

            const exportData = {
                version: '2.2',
                exportDate: new Date().toISOString(),
                data: { sessions }
            };

            Utils.downloadJSON(exportData, filename);
            Utils.showNotification('Planning exporté avec succès !', 'success');
        } catch (error) {
            console.error('Erreur export sessions:', error);
            Utils.showNotification("Erreur lors de l'export", 'error');
        }
    },

    // Export adhérents uniquement
    async exportMembersOnly() {
        try {
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `skali_prog_members_${timestamp}.json`;

            const [members, performances] = await Promise.all([
                SupabaseManager.getMembers(),
                SupabaseManager.getPerformances()
            ]);

            const exportData = {
                version: '2.2',
                exportDate: new Date().toISOString(),
                data: { members, performances }
            };

            Utils.downloadJSON(exportData, filename);
            Utils.showNotification('Adhérents exportés avec succès !', 'success');
        } catch (error) {
            console.error('Erreur export adhérents:', error);
            Utils.showNotification("Erreur lors de l'export", 'error');
        }
    },

    // Export vers Excel
    async exportToExcel() {
        try {
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `skali_prog_data_${timestamp}.csv`;

            // Récupérer les données depuis Supabase
            const [sessions, performances] = await Promise.all([
                SupabaseManager.getSessions(),
                SupabaseManager.getPerformances()
            ]);

            let csvContent = 'Type,Date,Titre,Catégorie,Nom,Exercice,Valeur,Unité,PR,Notes\n';

            // Ajouter les séances
            sessions.forEach(session => {
                const title = (session.title || 'Séance').replace(/,/g, ';');
                const category = (session.category || '').replace(/,/g, ';');
                const description = (session.description || '').replace(/,/g, ';');
                csvContent += `Séance,${session.date},"${title}","${category}",,,,,,"${description}"\n`;
            });

            // Ajouter les performances
            performances.forEach(perf => {
                const memberName = perf.members?.name || 'Inconnu';
                const exerciseType = (perf.exercise_type || '').replace(/,/g, ';');
                const notes = (perf.notes || '').replace(/,/g, ';');
                const isPR = perf.is_pr ? 'Oui' : 'Non';
                csvContent += `Performance,${perf.date},,,${memberName},"${exerciseType}",${perf.value},${perf.unit},${isPR},"${notes}"\n`;
            });

            Utils.downloadCSV(csvContent, filename);
            Utils.showNotification('Données exportées en Excel avec succès !', 'success');
        } catch (error) {
            console.error('Erreur export Excel:', error);
            Utils.showNotification("Erreur lors de l'export", 'error');
        }
    },

    // Importer une sauvegarde
    importBackup(merge = false) {
        const fileInput = document.getElementById('backupFileInput');
        const file = fileInput.files[0];

        if (!file) {
            Utils.showNotification('Veuillez sélectionner un fichier de sauvegarde', 'error');
            return;
        }

        if (!file.name.endsWith('.json')) {
            Utils.showNotification(
                'Format de fichier invalide. Utilisez un fichier .json',
                'error'
            );
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const importedData = JSON.parse(e.target.result);

                // Valider la structure
                if (!importedData.data || !importedData.version) {
                    throw new Error('Structure de fichier invalide');
                }

                const action = merge ? 'fusionner' : 'remplacer';
                if (confirm(`Êtes-vous sûr de vouloir ${action} les données actuelles ?`)) {
                    // Migration Supabase : l'import local n'est plus supporté
                    // Les données sont maintenant dans Supabase
                    Utils.closeModal();
                    Utils.showNotification(
                        '⚠️ Import local désactivé - utilisez Supabase pour la gestion des données',
                        'warning'
                    );
                }
            } catch (error) {
                console.error('Import error:', error);
                Utils.showNotification(
                    "Erreur lors de l'importation : fichier corrompu ou invalide",
                    'error'
                );
            }
        };

        reader.readAsText(file);
    },

    // Activer/désactiver la sauvegarde automatique
    toggleAutoBackup() {
        const enabled = document.getElementById('autoBackupToggle').checked;
        localStorage.setItem(CONFIG.STORAGE_KEYS.AUTO_BACKUP, enabled.toString());

        if (enabled) {
            this.setupAutoBackup();
            Utils.showNotification('Sauvegarde automatique activée', 'success');
        } else {
            clearInterval(this.autoBackupInterval);
            Utils.showNotification('Sauvegarde automatique désactivée', 'info');
        }
    },

    // Configurer la sauvegarde automatique
    setupAutoBackup() {
        // Vérifier la sauvegarde automatique toutes les heures
        this.autoBackupInterval = setInterval(
            () => {
                const lastBackup = localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_BACKUP);
                const oneWeek = 7 * 24 * 60 * 60 * 1000; // 7 jours en millisecondes

                if (!lastBackup || Date.now() - new Date(lastBackup).getTime() > oneWeek) {
                    this.exportFullBackup();
                    console.log('Auto backup completed');
                }
            },
            60 * 60 * 1000
        ); // Vérifier toutes les heures
    },

    // Initialiser la sauvegarde automatique au chargement
    initAutoBackup() {
        if (localStorage.getItem(CONFIG.STORAGE_KEYS.AUTO_BACKUP) === 'true') {
            this.setupAutoBackup();
        }
    }
};
