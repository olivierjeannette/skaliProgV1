// Gestionnaire d'import CSV - VERSION SUPABASE UNIQUEMENT
const MemberImport = {
    memberDatabase: [], // Base de données des adhérents importés
    pendingImport: null, // ✅ Import en attente de confirmation
    duplicateActions: null, // ✅ Actions pour les doublons
    duplicateAnalysis: null, // ✅ Analyse des doublons

    // Initialiser le module
    init() {
        console.log('📊 MemberImport initialisé (Supabase uniquement)');
    },

    // Ouvrir la modal d'import
    openImportModal() {
        const html = `
            <div class="fixed inset-0 modal-backdrop flex items-center justify-center z-50 fade-in-premium" onclick="Utils.closeModal(event)">
                <div class="premium-card max-w-2xl w-full mx-4" onclick="event.stopPropagation()">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-2xl font-bold text-green-400">
                            <i class="fas fa-file-csv mr-3"></i>Importer des Adhérents
                        </h3>
                        <button onclick="Utils.closeModal()" class="text-gray-400 hover:text-white">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <!-- Instructions -->
                    <div class="bg-wood-dark bg-opacity-50 rounded-lg p-4 mb-6 border border-wood-accent border-opacity-30">
                        <h4 class="font-semibold text-green-400 mb-2">Format attendu du CSV :</h4>
                        <ul class="text-sm text-gray-300 space-y-1">
                            <li>• Colonne 1 : Prénom</li>
                            <li>• Colonne 2 : Nom</li>
                            <li>• Encodage : UTF-8 (pour les accents)</li>
                            <li>• Séparateur : virgule (,) ou point-virgule (;)</li>
                        </ul>
                    </div>
                    
                    <!-- Zone d'upload -->
                    <div class="border-2 border-dashed border-green-600 border-opacity-30 rounded-lg p-8 text-center hover:border-opacity-60 transition-all">
                        <input type="file" id="csvFileInput" accept=".csv" class="hidden" onchange="MemberImport.handleFileSelect(event)">
                        <label for="csvFileInput" class="cursor-pointer">
                            <i class="fas fa-cloud-upload-alt text-4xl text-green-400 mb-4"></i>
                            <p class="text-lg font-semibold mb-2">Cliquez pour sélectionner un fichier CSV</p>
                            <p class="text-sm text-gray-400">ou glissez-déposez le fichier ici</p>
                        </label>
                    </div>
                    
                    <!-- Aperçu -->
                    <div id="importPreview" class="hidden mt-6">
                        <h4 class="font-semibold text-green-400 mb-3">Aperçu de l'import :</h4>
                        <div id="previewContent" class="max-h-64 overflow-y-auto bg-wood-dark bg-opacity-30 rounded-lg p-4"></div>
                    </div>
                    
                    <!-- Actions -->
                    <div class="flex justify-between items-center mt-6">
                        <div class="text-sm text-gray-400">
                            <span id="importStats"></span>
                        </div>
                        <div class="flex space-x-3">
                            <button onclick="MemberImport.showDatabase()" class="btn-premium btn-save-local">
                                <i class="fas fa-database mr-2"></i>Voir la base (${this.memberDatabase.length})
                            </button>
                            <button id="confirmImportBtn" onclick="MemberImport.confirmImport()" class="btn-premium btn-publish hidden">
                                <i class="fas fa-check mr-2"></i>Confirmer l'import
                            </button>
                            <button onclick="Utils.closeModal()" class="btn-premium btn-save-local">
                                <i class="fas fa-times mr-2"></i>Fermer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('modalContainer').innerHTML = html;

        // Ajouter le drag & drop
        this.setupDragDrop();
    },

    // Configurer le drag & drop
    setupDragDrop() {
        const dropZone = document.querySelector('.border-dashed');
        if (!dropZone) {
            return;
        }

        dropZone.addEventListener('dragover', e => {
            e.preventDefault();
            dropZone.classList.add('bg-green-900', 'bg-opacity-20');
        });

        dropZone.addEventListener('dragleave', e => {
            e.preventDefault();
            dropZone.classList.remove('bg-green-900', 'bg-opacity-20');
        });

        dropZone.addEventListener('drop', e => {
            e.preventDefault();
            dropZone.classList.remove('bg-green-900', 'bg-opacity-20');

            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].name.endsWith('.csv')) {
                this.processFile(files[0]);
            }
        });
    },

    // Gérer la sélection de fichier
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file && file.name.endsWith('.csv')) {
            this.processFile(file);
        }
    },

    // Traiter le fichier CSV
    processFile(file) {
        const reader = new FileReader();

        reader.onload = e => {
            const content = e.target.result;
            this.parseCSV(content);
        };

        reader.readAsText(file, 'UTF-8');
    },

    // Parser le CSV
    parseCSV(content) {
        // Détection automatique du séparateur
        const firstLine = content.split('\n')[0];
        const separator = firstLine.includes(';') ? ';' : ',';

        // Séparer les lignes et nettoyer
        const lines = content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        // Parser chaque ligne
        const members = [];
        let skipped = 0;

        lines.forEach((line, index) => {
            const parts = line.split(separator).map(
                part => part.trim().replace(/^["']|["']$/g, '') // Enlever les guillemets
            );

            if (parts.length >= 2) {
                const firstName = parts[0];
                const lastName = parts[1];

                // Vérifier que ce n'est pas un header
                if (
                    index === 0 &&
                    (firstName.toLowerCase().includes('prenom') ||
                        firstName.toLowerCase().includes('prénom') ||
                        firstName.toLowerCase().includes('firstname'))
                ) {
                    return; // Skip header
                }

                // Vérifier la validité
                if (firstName && lastName) {
                    members.push({
                        firstName: this.capitalizeFirst(firstName),
                        lastName: this.capitalizeFirst(lastName),
                        id: this.generateId(firstName, lastName)
                    });
                } else {
                    skipped++;
                }
            } else {
                skipped++;
            }
        });

        // Afficher l'aperçu
        this.showPreview(members, skipped);

        // Stocker temporairement pour l'import
        this.pendingImport = members;
    },

    // Capitaliser la première lettre
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    // Générer un ID unique
    generateId(firstName, lastName) {
        const base = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`.replace(/\s+/g, '_');
        return `${base}_${Date.now()}`;
    },

    // Afficher l'aperçu
    async showPreview(members, skipped) {
        const preview = document.getElementById('importPreview');
        const content = document.getElementById('previewContent');
        const stats = document.getElementById('importStats');
        const confirmBtn = document.getElementById('confirmImportBtn');

        if (members.length === 0) {
            content.innerHTML = `
                <div class="text-center text-red-400">
                    <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                    <p>Aucun adhérent valide trouvé dans le fichier</p>
                </div>
            `;
            stats.textContent = '';
            confirmBtn.classList.add('hidden');
        } else {
            // Analyser les doublons (VERSION ASYNC pour Supabase)
            const analysis = await this.analyzeDuplicates(members);

            // Créer le tableau d'aperçu
            let html = `
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-wood-accent border-opacity-30">
                            <th class="text-left py-2 text-green-400">#</th>
                            <th class="text-left py-2 text-green-400">Prénom</th>
                            <th class="text-left py-2 text-green-400">Nom</th>
                            <th class="text-left py-2 text-green-400">Statut</th>
                            <th class="text-left py-2 text-green-400">Action</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            // Afficher les 10 premiers
            const displayMembers = members.slice(0, 10);
            displayMembers.forEach((member, index) => {
                const duplicate = analysis.duplicates.find(
                    d => d.firstName === member.firstName && d.lastName === member.lastName
                );

                html += `
                    <tr class="border-b border-gray-700">
                        <td class="py-2 text-gray-400">${index + 1}</td>
                        <td class="py-2">${member.firstName}</td>
                        <td class="py-2">${member.lastName}</td>
                        <td class="py-2">
                            ${
                                duplicate
                                    ? '<span class="text-yellow-400"><i class="fas fa-exclamation-circle mr-1"></i>Doublon détecté</span>'
                                    : '<span class="text-green-400"><i class="fas fa-check-circle mr-1"></i>Nouveau</span>'
                            }
                        </td>
                        <td class="py-2">
                            ${
                                duplicate
                                    ? `
                                <div class="flex space-x-2">
                                    <button onclick="MemberImport.handleDuplicate('${member.id}', 'skip')" 
                                            class="px-2 py-1 bg-gray-600 bg-opacity-20 hover:bg-opacity-30 rounded text-xs text-gray-400 transition">
                                        Ignorer
                                    </button>
                                    <button onclick="MemberImport.handleDuplicate('${member.id}', 'replace')" 
                                            class="px-2 py-1 bg-yellow-600 bg-opacity-20 hover:bg-opacity-30 rounded text-xs text-yellow-400 transition">
                                        Remplacer
                                    </button>
                                </div>
                            `
                                    : ''
                            }
                        </td>
                    </tr>
                `;
            });

            if (members.length > 10) {
                html += `
                    <tr>
                        <td colspan="5" class="py-2 text-center text-gray-400">
                            ... et ${members.length - 10} autres adhérents
                        </td>
                    </tr>
                `;
            }

            html += '</tbody></table>';
            content.innerHTML = html;

            // Statistiques détaillées
            stats.innerHTML = `
                <i class="fas fa-info-circle mr-2"></i>
                Total : ${members.length} adhérents | 
                Nouveaux : ${analysis.newMembers} | 
                Doublons : ${analysis.duplicates.length}
                ${skipped > 0 ? ` | Ignorés : ${skipped}` : ''}
            `;

            // Stocker l'analyse pour l'import
            this.duplicateAnalysis = analysis;
            confirmBtn.classList.remove('hidden');
        }

        preview.classList.remove('hidden');
    },

    // Analyser les doublons (VERSION SUPABASE)
    async analyzeDuplicates(members) {
        const duplicates = [];
        const newMembers = [];
        const duplicateActions = this.duplicateActions || {};

        try {
            // Récupérer les membres existants depuis Supabase
            const existingMembers = await SupabaseManager.getMembers();

            members.forEach(member => {
                const fullName = `${member.firstName} ${member.lastName}`;
                const existing = existingMembers.find(m => m.name === fullName);

                if (existing) {
                    duplicates.push({
                        ...member,
                        existing: existing,
                        action: duplicateActions[member.id] || 'skip'
                    });
                } else {
                    newMembers.push(member);
                }
            });
        } catch (error) {
            console.error('Erreur analyse doublons:', error);
            // En cas d'erreur, considérer tous comme nouveaux
            members.forEach(member => newMembers.push(member));
        }

        return {
            duplicates,
            newMembers: newMembers.length,
            total: members.length
        };
    },

    // Gérer les actions sur les doublons
    async handleDuplicate(memberId, action) {
        if (!this.duplicateActions) {
            this.duplicateActions = {};
        }

        this.duplicateActions[memberId] = action;

        // Mettre à jour l'affichage
        await this.showPreview(this.pendingImport, 0);
    },

    // Confirmer l'import (VERSION SUPABASE - PEPPY COMPATIBLE avec gestion actif/inactif)
    async confirmImport() {
        if (!this.pendingImport || this.pendingImport.length === 0) {
            return;
        }

        try {
            // Récupérer les membres existants depuis Supabase
            const existingMembers = await SupabaseManager.getMembers(true); // Force refresh

            let imported = 0;
            let replaced = 0;
            let skipped = 0;
            let deactivated = 0;

            console.log(`📥 Import Peppy: ${this.pendingImport.length} adhérents à traiter`);
            console.log(`👥 Membres existants dans la base: ${existingMembers.length}`);

            // Créer une liste des noms complets du CSV (adhérents actifs)
            const activeNamesInCSV = this.pendingImport.map(m =>
                `${m.firstName} ${m.lastName}`.toLowerCase().trim()
            );

            console.log('📋 Adhérents actifs dans le CSV:', activeNamesInCSV);

            // ÉTAPE 1: Désactiver tous les adhérents qui ne sont PAS dans le CSV
            for (const existingMember of existingMembers) {
                const existingName = (existingMember.name || '').toLowerCase().trim();

                // Si le membre n'est pas dans le CSV, le marquer comme inactif
                if (!activeNamesInCSV.includes(existingName)) {
                    console.log(
                        `⚠️ Adhérent non trouvé dans le CSV, passage en inactif: ${existingMember.name}`
                    );

                    await SupabaseManager.updateMember(existingMember.id, {
                        is_active: false
                    });
                    deactivated++;
                } else {
                    // S'il est dans le CSV et était inactif, le réactiver
                    if (existingMember.is_active === false) {
                        console.log(`✅ Réactivation de l'adhérent: ${existingMember.name}`);
                        await SupabaseManager.updateMember(existingMember.id, {
                            is_active: true
                        });
                    }
                }
            }

            // ÉTAPE 2: Traiter chaque membre du CSV Peppy
            for (const member of this.pendingImport) {
                const fullName = `${member.firstName} ${member.lastName}`.trim();

                // Recherche insensible à la casse et espaces
                const existing = existingMembers.find(
                    m => m.name.toLowerCase().trim() === fullName.toLowerCase()
                );

                if (existing) {
                    const action = this.duplicateActions?.[member.id] || 'skip';

                    if (action === 'replace') {
                        // Mettre à jour le membre existant dans Supabase (et s'assurer qu'il est actif)
                        await SupabaseManager.updateMember(existing.id, {
                            firstName: member.firstName,
                            lastName: member.lastName,
                            is_active: true
                        });
                        replaced++;
                    } else {
                        // Ignorer mais s'assurer qu'il est actif
                        if (existing.is_active === false) {
                            await SupabaseManager.updateMember(existing.id, {
                                is_active: true
                            });
                        }
                        skipped++;
                    }
                } else {
                    // Créer un nouveau membre dans Supabase (actif par défaut)
                    const newMemberData = {
                        firstName: member.firstName,
                        lastName: member.lastName,
                        is_active: true
                    };

                    console.log('📝 Création adhérent:', newMemberData);
                    await SupabaseManager.createMember(newMemberData);
                    imported++;

                    // Aussi ajouter à la base locale pour historique
                    this.memberDatabase.push({
                        ...member,
                        createdAt: new Date().toISOString(),
                        source: 'csv_import'
                    });
                }
            }

            // Notification détaillée
            let message = 'Import terminé:\n';
            if (imported > 0) {
                message += `• ${imported} nouveau(x) adhérent(s) ajouté(s)\n`;
            }
            if (replaced > 0) {
                message += `• ${replaced} adhérent(s) remplacé(s)\n`;
            }
            if (skipped > 0) {
                message += `• ${skipped} adhérent(s) ignoré(s)\n`;
            }
            if (deactivated > 0) {
                message += `• ${deactivated} adhérent(s) désactivé(s) (absents du CSV)`;
            }

            if (typeof Utils !== 'undefined' && Utils.showNotification) {
                Utils.showNotification(message, 'success');
            } else {
                alert(message);
            }

            // Fermer la modal
            Utils.closeModal();

            // Rafraîchir la vue si on est sur les membres
            if (typeof ViewManager !== 'undefined' && ViewManager.getCurrentView() === 'members') {
                MemberManager.showMembersView();
            }

            // Nettoyer les données temporaires
            this.pendingImport = null;
            this.duplicateActions = null;
            this.duplicateAnalysis = null;
        } catch (error) {
            console.error("❌ Erreur lors de l'import CSV:", error);
            console.error('Stack:', error.stack);
            if (typeof Utils !== 'undefined' && Utils.showNotification) {
                Utils.showNotification(
                    "Erreur lors de l'import des membres: " + error.message,
                    'error'
                );
            } else {
                alert("Erreur lors de l'import: " + error.message);
            }
        }
    },

    // Afficher la base de données
    showDatabase() {
        const html = `
            <div class="fixed inset-0 modal-backdrop flex items-center justify-center z-50 fade-in-premium" onclick="Utils.closeModal(event)">
                <div class="premium-card max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden" onclick="event.stopPropagation()">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-2xl font-bold text-green-400">
                            <i class="fas fa-database mr-3"></i>Base de données (${this.memberDatabase.length} adhérents)
                        </h3>
                        <button onclick="Utils.closeModal()" class="text-gray-400 hover:text-white">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <!-- Recherche -->
                    <div class="mb-4">
                        <div class="relative">
                            <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            <input type="text" id="dbSearch" placeholder="Rechercher dans la base..." 
                                   class="w-full pl-10 pr-4 py-3 rounded-lg"
                                   oninput="MemberImport.filterDatabase()">
                        </div>
                    </div>
                    
                    <!-- Liste -->
                    <div id="databaseList" class="overflow-y-auto max-h-[50vh] space-y-2">
                        ${this.renderDatabaseList(this.memberDatabase)}
                    </div>
                    
                    <!-- Actions -->
                    <div class="flex justify-between items-center mt-6">
                        <div class="flex space-x-3">
                            <button onclick="MemberImport.exportDatabaseJSON()" class="btn-premium btn-publish">
                                <i class="fas fa-file-code mr-2"></i>Exporter JSON
                            </button>
                            <button onclick="MemberImport.exportDatabaseCSV()" class="btn-premium btn-save-local">
                                <i class="fas fa-file-csv mr-2"></i>Exporter CSV
                            </button>
                        </div>
                        <button onclick="MemberImport.clearDatabase()" class="btn-premium bg-red-600 hover:bg-red-700">
                            <i class="fas fa-trash mr-2"></i>Vider la base
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('modalContainer').innerHTML = html;
    },

    // Afficher la liste de la base de données
    renderDatabaseList(members) {
        if (members.length === 0) {
            return `
                <div class="text-center py-8 text-gray-400">
                    <i class="fas fa-database text-4xl mb-4"></i>
                    <p>Base de données vide</p>
                </div>
            `;
        }

        return members
            .map(
                member => `
            <div class="flex items-center justify-between p-3 bg-wood-dark bg-opacity-30 rounded-lg hover:bg-opacity-50 transition">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-green-600 bg-opacity-20 rounded-full flex items-center justify-center">
                        <i class="fas fa-user text-green-400"></i>
                    </div>
                    <div>
                        <div class="font-semibold">${member.firstName} ${member.lastName}</div>
                        <div class="text-xs text-gray-400">
                            Ajouté le ${new Date(member.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button onclick="MemberImport.addToActive('${member.id}')" 
                            class="px-3 py-1 bg-green-600 bg-opacity-20 hover:bg-opacity-30 rounded text-sm text-green-400 transition">
                        <i class="fas fa-plus mr-1"></i>Activer
                    </button>
                    <button onclick="MemberImport.removeMember('${member.id}')" 
                            class="px-3 py-1 bg-red-600 bg-opacity-20 hover:bg-opacity-30 rounded text-sm text-red-400 transition">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `
            )
            .join('');
    },

    // Filtrer la base de données
    filterDatabase() {
        const search = document.getElementById('dbSearch').value.toLowerCase();
        const filtered = this.memberDatabase.filter(m =>
            `${m.firstName} ${m.lastName}`.toLowerCase().includes(search)
        );
        document.getElementById('databaseList').innerHTML = this.renderDatabaseList(filtered);
    },

    // Ajouter un membre aux membres actifs (VERSION SUPABASE)
    async addToActive(memberId) {
        const member = this.memberDatabase.find(m => m.id === memberId);
        if (!member) {
            return;
        }

        try {
            // Créer le membre dans Supabase
            await SupabaseManager.createMember({
                firstName: member.firstName,
                lastName: member.lastName
            });

            Utils.showNotification(
                'Adhérent activé',
                `${member.firstName} ${member.lastName} a été ajouté aux adhérents actifs`,
                'success'
            );

            // Rafraîchir si on est sur la vue membres
            if (ViewManager.getCurrentView() === 'members') {
                MemberManager.showMembersView();
            }
        } catch (error) {
            console.error('Erreur activation membre:', error);
            Utils.showNotification('Erreur', "Impossible d'activer le membre", 'error');
        }
    },

    // Supprimer un membre de la base
    removeMember(memberId) {
        const member = this.memberDatabase.find(m => m.id === memberId);
        if (!member) {
            return;
        }

        if (confirm(`Supprimer ${member.firstName} ${member.lastName} de la base de données ?`)) {
            this.memberDatabase = this.memberDatabase.filter(m => m.id !== memberId);
            this.showDatabase(); // Rafraîchir l'affichage
        }
    },

    // Vider la base de données
    clearDatabase() {
        if (confirm('⚠️ Êtes-vous sûr de vouloir vider complètement la base de données ?')) {
            this.memberDatabase = [];
            this.showDatabase();
            Utils.showNotification('Base vidée', 'La base de données a été vidée', 'info');
        }
    },

    // Exporter la base de données en JSON
    exportDatabaseJSON() {
        if (this.memberDatabase.length === 0) {
            alert('La base de données est vide');
            return;
        }

        // Créer l'objet d'export avec tous les adhérents
        const membersObject = {};
        this.memberDatabase.forEach(member => {
            membersObject[member.id] = member;
        });

        // Créer l'export complet avec métadonnées
        const exportData = {
            version: '2.2',
            exportDate: new Date().toISOString(),
            appName: 'Skali Prog',
            exportType: 'memberDatabase',
            metadata: {
                totalMembers: this.memberDatabase.length,
                exportedBy: 'MemberImport'
            },
            members: membersObject
        };

        // Générer le nom du fichier avec la date
        const date = new Date();
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const timeStr = `${String(date.getHours()).padStart(2, '0')}h${String(date.getMinutes()).padStart(2, '0')}`;
        const filename = `skali-database-${dateStr}-${timeStr}.json`;

        // Créer le blob et télécharger
        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('✅ Export JSON réussi:', filename);
        console.log("📊 Nombre d'adhérents exportés:", this.memberDatabase.length);

        Utils.showNotification(
            'Export réussi',
            `${this.memberDatabase.length} adhérent(s) exporté(s) en JSON`,
            'success'
        );
    },

    // Exporter la base de données en CSV
    exportDatabaseCSV() {
        if (this.memberDatabase.length === 0) {
            alert('La base de données est vide');
            return;
        }

        const csv = [
            "Prénom,Nom,Date d'ajout",
            ...this.memberDatabase.map(
                m =>
                    `${m.firstName},${m.lastName},${new Date(m.createdAt).toLocaleDateString('fr-FR')}`
            )
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `skali-database-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();

        Utils.showNotification(
            'Export réussi',
            `${this.memberDatabase.length} adhérent(s) exporté(s) en CSV`,
            'success'
        );
    },

    // Recherche rapide pour sélection d'adhérent
    openQuickSearch(callback) {
        const html = `
            <div class="fixed inset-0 modal-backdrop flex items-center justify-center z-50 fade-in-premium">
                <div class="premium-card max-w-md w-full mx-4">
                    <h3 class="text-xl font-bold text-green-400 mb-4">
                        <i class="fas fa-search mr-2"></i>Rechercher un adhérent
                    </h3>
                    
                    <input type="text" id="quickSearchInput" 
                           placeholder="Tapez le nom ou prénom..." 
                           class="w-full p-3 rounded-lg mb-4"
                           oninput="MemberImport.performQuickSearch('${callback}')">
                    
                    <div id="quickSearchResults" class="max-h-64 overflow-y-auto space-y-2">
                        <!-- Résultats ici -->
                    </div>
                    
                    <button onclick="Utils.closeModal()" class="btn-premium btn-save-local w-full mt-4">
                        Annuler
                    </button>
                </div>
            </div>
        `;
        document.getElementById('modalContainer').innerHTML = html;

        // Focus sur le champ de recherche
        setTimeout(() => {
            document.getElementById('quickSearchInput')?.focus();
        }, 100);
    },

    // Effectuer la recherche rapide
    async performQuickSearch(callback) {
        const search = document.getElementById('quickSearchInput').value.toLowerCase();
        const results = document.getElementById('quickSearchResults');

        if (search.length < 2) {
            results.innerHTML =
                '<p class="text-center text-gray-400">Tapez au moins 2 caractères...</p>';
            return;
        }

        // Chercher dans la base de données ET les membres actifs
        const dbResults = this.memberDatabase.filter(m =>
            `${m.firstName} ${m.lastName}`.toLowerCase().includes(search)
        );

        const activeMembers = await SupabaseManager.getMembers();
        const activeResults = activeMembers.filter(m =>
            `${m.firstName} ${m.lastName}`.toLowerCase().includes(search)
        );

        // Combiner et dédupliquer
        const allResults = [...dbResults, ...activeResults];
        const uniqueResults = allResults.filter(
            (member, index, self) =>
                index ===
                self.findIndex(
                    m => m.firstName === member.firstName && m.lastName === member.lastName
                )
        );

        if (uniqueResults.length === 0) {
            results.innerHTML = '<p class="text-center text-gray-400">Aucun résultat trouvé</p>';
            return;
        }

        results.innerHTML = uniqueResults
            .map(
                member => `
            <div onclick="${callback}('${member.id}')" 
                 class="p-3 bg-wood-dark bg-opacity-30 rounded-lg hover:bg-opacity-50 cursor-pointer transition flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-green-600 bg-opacity-20 rounded-full flex items-center justify-center">
                        <i class="fas fa-user text-green-400 text-sm"></i>
                    </div>
                    <div>
                        <div class="font-semibold">${member.firstName} ${member.lastName}</div>
                        <div class="text-xs text-gray-400">
                            ${member.performances ? 'Actif' : 'Base de données'}
                        </div>
                    </div>
                </div>
                <i class="fas fa-chevron-right text-gray-400"></i>
            </div>
        `
            )
            .join('');
    }
};

// Initialiser au chargement
if (typeof window !== 'undefined') {
    window.MemberImport = MemberImport;

    // Initialiser après le DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            MemberImport.init();
        });
    } else {
        MemberImport.init();
    }
}
