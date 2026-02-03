/**
 * MemberManager - Gestionnaire des adhérents
 * Module professionnel pour la gestion complète des adhérents et leurs performances
 * Architecture modulaire - Responsive - Qualité professionnelle
 */

const MemberManager = {
    // Configuration
    config: {
        itemsPerPage: 12,
        searchDebounce: 800, // Délai de 0.8 seconde pour laisser le temps d'écrire
        animationDuration: 300
    },

    // État du module
    state: {
        currentView: 'list',
        currentMember: null,
        searchTerm: '',
        sortBy: 'name',
        sortOrder: 'asc',
        currentPage: 1,
        isLoading: false,
        activeTab: 'data' // Onglet actif dans le profil membre
    },

    /**
     * Initialisation du module (VERSION SUPABASE)
     */
    async init() {
        try {
            this.state.isLoading = true;

            // Vérifier les dépendances
            if (typeof SupabaseManager === 'undefined') {
                throw new Error('SupabaseManager non disponible');
            }

            console.log('✅ MemberManager initialisé avec succès (Supabase)');
            this.state.isLoading = false;
        } catch (error) {
            console.error("❌ Erreur lors de l'initialisation de MemberManager:", error);
            this.state.isLoading = false;
            throw error;
        }
    },

    /**
     * Afficher la vue principale des adhérents (VERSION SUPABASE)
     */
    async showMembersView() {
        try {
            await this.init();

            // Charger les membres, performances et training profiles depuis Supabase
            const [allMembers, allPerformances, trainingProfiles] = await Promise.all([
                SupabaseManager.getMembers(true), // Force refresh pour avoir le statut is_active à jour
                SupabaseManager.getPerformances(),
                this.getAllTrainingProfiles()
            ]);

            // Filtrer pour ne garder que les membres actifs (is_active = true ou non défini pour rétrocompatibilité)
            const membersList = allMembers.filter(member => member.is_active !== false);

            console.log('👥 Affichage vue membres - Total:', allMembers.length);
            console.log('✅ Membres actifs:', membersList.length);
            console.log('⚠️ Membres inactifs:', allMembers.length - membersList.length);
            console.log('📊 Performances chargées:', allPerformances.length);
            console.log('🎯 Training profiles chargés:', trainingProfiles.length);

            // Attacher les performances et training profiles à chaque membre
            membersList.forEach(member => {
                member._performances = allPerformances.filter(p => p.member_id === member.id);
                member._trainingProfile =
                    trainingProfiles.find(tp => tp.member_id === member.id) || null;
            });

            this.state.currentView = 'list';

            const html = this.renderMainView(membersList);
            document.getElementById('mainContent').innerHTML = html;

            // Attacher les événements
            this.attachEventListeners();
        } catch (error) {
            console.error("Erreur lors de l'affichage des adhérents:", error);
            this.showError('Impossible de charger les adhérents', error.message);
        }
    },

    /**
     * Rendu de la vue principale
     * @param membersList
     */
    renderMainView(membersList) {
        const totalMembers = membersList.length;
        const filteredMembers = this.filterMembers(membersList);
        const withPerf = filteredMembers.filter(m => this.getMemberPerformances(m).length > 0);
        const withoutPerf = filteredMembers.filter(m => this.getMemberPerformances(m).length === 0);

        // Déterminer quels membres afficher
        const displayMembers = this.state.searchTerm ? filteredMembers : membersList;

        // Trier les membres
        const sortedMembers = this.sortMembers(displayMembers);

        return `
            <div class="members-table-container">
                <!-- Header simplifié -->
                <div class="members-table-header">
                    <div class="members-table-title">
                        <i class="fas fa-users"></i>
                        <h1>Adhérents</h1>
                        <span class="members-count">${displayMembers.length}</span>
                    </div>
                    <div class="members-table-actions">
                        <div class="search-input-wrapper">
                            <i class="fas fa-search search-icon"></i>
                            <input type="text"
                                   id="memberSearch"
                                   class="table-search-input"
                                   placeholder="Rechercher..."
                                   value="${this.state.searchTerm}">
                            ${
                                this.state.searchTerm
                                    ? `
                                <button onclick="MemberManager.clearSearch()" class="search-clear-btn">
                                    <i class="fas fa-times"></i>
                                </button>
                            `
                                    : ''
                            }
                        </div>
                        <button onclick="MemberManager.showInactiveMembersView()" class="btn-inactive-members" title="Voir les membres inactifs">
                            <i class="fas fa-user-slash"></i>
                            <span>Membres Inactifs</span>
                        </button>
                        <button onclick="MemberImport.openImportModal()" class="btn-export-db" title="Importer adhérents depuis Peppy">
                            <i class="fas fa-file-csv"></i>
                            <span>Importer CSV</span>
                        </button>
                        <button onclick="MemberManager.openQuickPerformanceSelector()" class="btn-add-performance" title="Ajouter une performance">
                            <i class="fas fa-bolt"></i>
                            <span>Ajouter Performance</span>
                        </button>
                        <button onclick="MemberManager.openAddMemberModal()" class="btn-add-member">
                            <i class="fas fa-plus"></i>
                            <span>Nouvel Adhérent</span>
                        </button>
                    </div>
                </div>

                <!-- Tableau des adhérents -->
                <div class="members-table-wrapper">
                    ${this.renderMembersTable(sortedMembers)}
                </div>
            </div>
        `;
    },

    /**
     * Rendu du tableau des adhérents
     * @param members
     */
    renderMembersTable(members) {
        if (members.length === 0) {
            return this.renderEmptyState();
        }

        return `
            <table class="members-table">
                <thead>
                    <tr>
                        <th onclick="MemberManager.sortByColumn('firstName')" class="sortable ${this.state.sortBy === 'firstName' ? 'active' : ''}">
                            <span>Prénom</span>
                            <i class="fas fa-sort${this.state.sortBy === 'firstName' ? '-' + (this.state.sortOrder === 'asc' ? 'up' : 'down') : ''}"></i>
                        </th>
                        <th onclick="MemberManager.sortByColumn('lastName')" class="sortable ${this.state.sortBy === 'lastName' ? 'active' : ''}">
                            <span>Nom</span>
                            <i class="fas fa-sort${this.state.sortBy === 'lastName' ? '-' + (this.state.sortOrder === 'asc' ? 'up' : 'down') : ''}"></i>
                        </th>
                        <th onclick="MemberManager.sortByColumn('age')" class="sortable ${this.state.sortBy === 'age' ? 'active' : ''}">
                            <span>Âge</span>
                            <i class="fas fa-sort${this.state.sortBy === 'age' ? '-' + (this.state.sortOrder === 'asc' ? 'up' : 'down') : ''}"></i>
                        </th>
                        <th onclick="MemberManager.sortByColumn('gender')" class="sortable ${this.state.sortBy === 'gender' ? 'active' : ''}">
                            <span>Genre</span>
                            <i class="fas fa-sort${this.state.sortBy === 'gender' ? '-' + (this.state.sortOrder === 'asc' ? 'up' : 'down') : ''}"></i>
                        </th>
                        <th onclick="MemberManager.sortByColumn('weight')" class="sortable ${this.state.sortBy === 'weight' ? 'active' : ''}">
                            <span>Poids (kg)</span>
                            <i class="fas fa-sort${this.state.sortBy === 'weight' ? '-' + (this.state.sortOrder === 'asc' ? 'up' : 'down') : ''}"></i>
                        </th>
                        <th onclick="MemberManager.sortByColumn('height')" class="sortable ${this.state.sortBy === 'height' ? 'active' : ''}">
                            <span>Taille (cm)</span>
                            <i class="fas fa-sort${this.state.sortBy === 'height' ? '-' + (this.state.sortOrder === 'asc' ? 'up' : 'down') : ''}"></i>
                        </th>
                        <th onclick="MemberManager.sortByColumn('bodyFat')" class="sortable ${this.state.sortBy === 'bodyFat' ? 'active' : ''}">
                            <span>Masse grasse (%)</span>
                            <i class="fas fa-sort${this.state.sortBy === 'bodyFat' ? '-' + (this.state.sortOrder === 'asc' ? 'up' : 'down') : ''}"></i>
                        </th>
                        <th onclick="MemberManager.sortByColumn('fitnessIndex')" class="sortable ${this.state.sortBy === 'fitnessIndex' ? 'active' : ''}">
                            <span>Niveau</span>
                            <i class="fas fa-sort${this.state.sortBy === 'fitnessIndex' ? '-' + (this.state.sortOrder === 'asc' ? 'up' : 'down') : ''}"></i>
                        </th>
                        <th onclick="MemberManager.sortByColumn('performances')" class="sortable ${this.state.sortBy === 'performances' ? 'active' : ''}">
                            <span>Perfs</span>
                            <i class="fas fa-sort${this.state.sortBy === 'performances' ? '-' + (this.state.sortOrder === 'asc' ? 'up' : 'down') : ''}"></i>
                        </th>
                        <th class="actions-column">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${members.map(member => this.renderMemberRow(member)).join('')}
                </tbody>
            </table>
        `;
    },

    /**
     * Rendu d'une ligne de membre dans le tableau (VERSION SUPABASE - NO INLINE EDIT)
     * @param member
     */
    renderMemberRow(member) {
        const fitness = this.calculateFitnessIndex(member);
        const fitnessIndex = fitness ? fitness.fitnessIndex : '--';
        const performanceCount = this.getPerformanceCount(member);
        const tier = this.getIndexTier(fitness ? fitness.fitnessIndex : 0);

        // Parser le nom complet depuis Supabase
        const nameParts = (member.name || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Récupérer le niveau de forme depuis training profile
        const trainingLevel = member._trainingProfile?.level || null;
        const levelBadge = this.renderLevelBadge(trainingLevel);

        return `
            <tr class="member-row ${tier.className} cursor-pointer" onclick="MemberManager.showMemberProfile('${member.id}')">
                <td>${firstName || '--'}</td>
                <td>${lastName || '--'}</td>
                <td>${member.age || '--'}</td>
                <td>${member.gender === 'male' ? 'H' : member.gender === 'female' ? 'F' : '--'}</td>
                <td>${member.weight ? member.weight.toFixed(1) : '--'}</td>
                <td>${member.height ? member.height.toFixed(0) : '--'}</td>
                <td>${member.body_fat_percentage ? member.body_fat_percentage.toFixed(1) : '--'}</td>
                <td class="fitness-cell">
                    ${levelBadge}
                </td>
                <td class="performance-count">${performanceCount}</td>
                <td class="actions-cell" onclick="event.stopPropagation()">
                    <button onclick="MemberManager.addPerformance('${member.id}')" class="btn-action btn-add" title="Ajouter une performance">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button onclick="MemberManager.showMemberProfile('${member.id}'); MemberManager.switchTab('data');" class="btn-action btn-edit" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="MemberManager.deleteMember('${member.id}')" class="btn-action btn-delete" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    },

    /**
     * Générer une pastille de couleur pour le niveau de forme
     * @param level
     */
    renderLevelBadge(level) {
        const levels = {
            debutant: {
                label: 'Débutant',
                color: '#94a3b8', // Slate-400
                icon: '🔵'
            },
            intermediaire: {
                label: 'Intermédiaire',
                color: '#22c55e', // Green-500
                icon: '🟢'
            },
            enforme: {
                label: 'En forme',
                color: '#f59e0b', // Amber-500
                icon: '🟠'
            },
            tresenforme: {
                label: 'Très en forme',
                color: '#ef4444', // Red-500
                icon: '🔴'
            }
        };

        if (!level || !levels[level]) {
            return '<span style="color: var(--text-tertiary); font-size: 0.875rem;">--</span>';
        }

        const levelData = levels[level];

        return `
            <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.75rem; background: ${levelData.color}20; border: 1px solid ${levelData.color}; border-radius: var(--radius-lg); font-size: 0.75rem; font-weight: 600;">
                <span style="font-size: 0.875rem;">${levelData.icon}</span>
                <span style="color: ${levelData.color};">${levelData.label}</span>
            </div>
        `;
    },

    /**
     * Trier les membres selon la colonne et l'ordre (VERSION SUPABASE)
     * @param members
     */
    sortMembers(members) {
        const sortBy = this.state.sortBy || 'firstName';
        const order = this.state.sortOrder === 'asc' ? 1 : -1;

        return [...members].sort((a, b) => {
            let valA, valB;

            switch (sortBy) {
                case 'firstName':
                    // Utiliser le premier mot du name
                    valA = ((a.name || '').split(' ')[0] || '').toLowerCase();
                    valB = ((b.name || '').split(' ')[0] || '').toLowerCase();
                    return valA.localeCompare(valB) * order;

                case 'lastName':
                    // Utiliser les mots après le premier du name
                    valA = ((a.name || '').split(' ').slice(1).join(' ') || '').toLowerCase();
                    valB = ((b.name || '').split(' ').slice(1).join(' ') || '').toLowerCase();
                    return valA.localeCompare(valB) * order;

                case 'age':
                    valA = a.age || 0;
                    valB = b.age || 0;
                    return (valA - valB) * order;

                case 'gender':
                    valA = a.gender || '';
                    valB = b.gender || '';
                    return valA.localeCompare(valB) * order;

                case 'weight':
                    valA = a.weight || 0;
                    valB = b.weight || 0;
                    return (valA - valB) * order;

                case 'height':
                    valA = a.height || 0;
                    valB = b.height || 0;
                    return (valA - valB) * order;

                case 'bodyFat':
                case 'body_fat_percentage':
                    valA = a.body_fat_percentage || 0;
                    valB = b.body_fat_percentage || 0;
                    return (valA - valB) * order;

                case 'fitnessIndex':
                    const fitnessA = this.calculateFitnessIndex(a);
                    const fitnessB = this.calculateFitnessIndex(b);
                    valA = fitnessA ? fitnessA.fitnessIndex : 0;
                    valB = fitnessB ? fitnessB.fitnessIndex : 0;
                    return (valB - valA) * order;

                case 'performances':
                    valA = this.getPerformanceCount(a);
                    valB = this.getPerformanceCount(b);
                    return (valA - valB) * order;

                default:
                    return 0;
            }
        });
    },

    /**
     * Trier par colonne
     * @param column
     */
    sortByColumn(column) {
        if (this.state.sortBy === column) {
            this.state.sortOrder = this.state.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.state.sortBy = column;
            this.state.sortOrder = 'asc';
        }
        this.showMembersView();
    },

    /**
     * Éditer une cellule inline (VERSION SUPABASE)
     * @param memberId
     * @param field
     * @param cellElement
     */
    async editCell(memberId, field, cellElement) {
        const member = await SupabaseManager.getMember(memberId);
        if (!member) {
            return;
        }

        // Parser le nom pour firstName et lastName
        let currentValue;
        if (field === 'firstName') {
            currentValue = (member.name || '').split(' ')[0] || '';
        } else if (field === 'lastName') {
            currentValue = (member.name || '').split(' ').slice(1).join(' ') || '';
        } else if (field === 'bodyFat') {
            currentValue = member.body_fat_percentage || '';
        } else {
            currentValue = member[field] || '';
        }

        let inputHtml = '';

        // Créer le bon type d'input selon le champ
        switch (field) {
            case 'gender':
                inputHtml = `
                    <select class="cell-edit-input"
                            onchange="MemberManager.pendingGenderValue='${memberId}:'+this.value"
                            onblur="if(MemberManager.pendingGenderValue && MemberManager.pendingGenderValue.startsWith('${memberId}:')) { MemberManager.saveCellEdit('${memberId}', '${field}', MemberManager.pendingGenderValue.split(':')[1]); MemberManager.pendingGenderValue=null; }"
                            onkeydown="if(event.key==='Enter') this.blur(); if(event.key==='Escape') { MemberManager.pendingGenderValue=null; MemberManager.showMembersView(); }">
                        <option value="">--</option>
                        <option value="male" ${currentValue === 'male' ? 'selected' : ''}>H</option>
                        <option value="female" ${currentValue === 'female' ? 'selected' : ''}>F</option>
                    </select>
                `;
                break;
            case 'age':
            case 'weight':
            case 'height':
            case 'body_fat_percentage':
                inputHtml = `<input type="number" class="cell-edit-input" value="${currentValue}" step="${field === 'age' || field === 'height' ? '1' : '0.1'}" onblur="MemberManager.saveCellEdit('${memberId}', '${field}', this.value)" onkeydown="if(event.key==='Enter') this.blur(); if(event.key==='Escape') MemberManager.showMembersView()">`;
                break;
            default:
                inputHtml = `<input type="text" class="cell-edit-input" value="${currentValue}" onblur="MemberManager.saveCellEdit('${memberId}', '${field}', this.value)" onkeydown="if(event.key==='Enter') this.blur(); if(event.key==='Escape') MemberManager.showMembersView()">`;
        }

        cellElement.innerHTML = inputHtml;
        const input = cellElement.querySelector('.cell-edit-input');
        if (input) {
            input.focus();
            if (input.select) {
                input.select();
            }
        }
    },

    /**
     * Sauvegarder l'édition d'une cellule (VERSION SUPABASE)
     * @param memberId
     * @param field
     * @param value
     */
    async saveCellEdit(memberId, field, value) {
        try {
            const member = await SupabaseManager.getMember(memberId);
            if (!member) {
                return;
            }

            // Préparer les updates selon le champ
            const updates = {};

            // Convertir la valeur selon le type de champ
            if (field === 'firstName' || field === 'lastName') {
                // Récupérer les parties du nom actuel
                const nameParts = (member.name || '').split(' ');
                const currentFirstName = nameParts[0] || '';
                const currentLastName = nameParts.slice(1).join(' ') || '';

                if (field === 'firstName') {
                    updates.firstName = value.trim();
                    updates.lastName = currentLastName;
                } else {
                    updates.firstName = currentFirstName;
                    updates.lastName = value.trim();
                }
            } else if (field === 'age') {
                updates.age = value ? parseInt(value) : null;
            } else if (field === 'weight') {
                updates.weight = value ? parseFloat(value) : null;
            } else if (field === 'height') {
                updates.height = value ? parseFloat(value) : null;
            } else if (field === 'body_fat_percentage' || field === 'bodyFat') {
                updates.body_fat_percentage = value ? parseFloat(value) : null;
            } else if (field === 'gender') {
                updates.gender = value || null;
            }

            await SupabaseManager.updateMember(memberId, updates);
            this.showNotification('Modification enregistrée', 'success');
            this.showMembersView();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            this.showNotification('Erreur lors de la sauvegarde', 'error');
        }
    },

    /**
     * Rendu d'une carte d'adhérent
     * @param member
     */
    renderMemberCard(member) {
        return '';
    },

    renderRatingCard(member) {
        const performanceCount = this.getPerformanceCount(member);
        const fitness = this.calculateFitnessIndex(member);
        const tier = this.getIndexTier(fitness ? fitness.fitnessIndex : 0);
        const comps = fitness
            ? fitness.components
            : { cardio: 0, strength: 0, muscularEndurance: 0, power: 0 };
        const hasPerformances = performanceCount > 0;

        return `
        <div class="rating-card ${tier.className} ${!hasPerformances ? 'no-performances' : ''}" onclick="MemberManager.showMemberProfile('${member.id}')">
            <div class="rating-top">
                <div class="rating-overall">${fitness ? fitness.fitnessIndex : '--'}</div>
                <div class="rating-photo">
                    ${member.photo ? `<img src="${member.photo}" alt="${member.firstName}"/>` : '<i class="fas fa-user"></i>'}
                </div>
            </div>
            <div class="rating-name">${member.firstName} ${member.lastName}</div>
            ${!hasPerformances ? '<div class="performance-badge">Aucune performance</div>' : ''}
            <div class="rating-subs">
                <div class="sub"><span>${comps.cardio || 0}</span><label>CAR</label></div>
                <div class="sub"><span>${comps.strength || 0}</span><label>FOR</label></div>
                <div class="sub"><span>${comps.muscularEndurance || 0}</span><label>END</label></div>
                <div class="sub"><span>${comps.power || 0}</span><label>PUI</label></div>
            </div>
            <div class="rating-footer">
                <span>${performanceCount} perfs</span>
                <button onclick="event.stopPropagation(); MemberManager.addPerformance('${member.id}')" class="btn-rating">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        </div>`;
    },

    getIndexTier(score) {
        if (score >= 85) {
            return { className: 'tier-elite', label: 'International' };
        }
        if (score >= 70) {
            return { className: 'tier-expert', label: 'National' };
        }
        if (score >= 55) {
            return { className: 'tier-advanced', label: 'Régional' };
        }
        if (score >= 40) {
            return { className: 'tier-intermediate', label: 'Départemental' };
        }
        return { className: 'tier-beginner', label: 'Débutant' };
    },

    /**
     * Rendu de l'état vide
     */
    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-users"></i>
                </div>
                <h3 class="empty-title">Aucun adhérent trouvé</h3>
                <p class="empty-description">
                    ${
                        this.state.searchTerm
                            ? 'Aucun adhérent ne correspond à votre recherche.'
                            : 'Commencez par ajouter des adhérents pour suivre leurs performances.'
                    }
                </p>
                ${
                    !this.state.searchTerm
                        ? `
                    <button onclick="MemberManager.openAddMemberModal()" class="btn btn-primary">
                        <i class="fas fa-user-plus mr-2"></i>
                        Ajouter le premier adhérent
                    </button>
                `
                        : `
                    <button onclick="MemberManager.clearSearch()" class="btn btn-secondary">
                        <i class="fas fa-times mr-2"></i>
                        Effacer la recherche
                    </button>
                `
                }
            </div>
        `;
    },

    /**
     * Rendu de la pagination moderne
     * @param totalItems
     */
    renderPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.config.itemsPerPage);

        if (totalPages <= 1) {
            return '';
        }

        // Générer les numéros de page
        const pageNumbers = [];
        const startPage = Math.max(1, this.state.currentPage - 2);
        const endPage = Math.min(totalPages, this.state.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return `
            <div class="modern-pagination">
                <button onclick="MemberManager.goToPage(1)" 
                        class="pagination-btn ${this.state.currentPage === 1 ? 'disabled' : ''}" 
                        ${this.state.currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-angle-double-left"></i>
                </button>
                <button onclick="MemberManager.goToPage(${this.state.currentPage - 1})" 
                        class="pagination-btn ${this.state.currentPage === 1 ? 'disabled' : ''}" 
                        ${this.state.currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-angle-left"></i>
                </button>
                
                ${pageNumbers
                    .map(
                        page => `
                    <button onclick="MemberManager.goToPage(${page})" 
                            class="pagination-btn ${this.state.currentPage === page ? 'active' : ''}">
                        ${page}
                    </button>
                `
                    )
                    .join('')}
                
                <button onclick="MemberManager.goToPage(${this.state.currentPage + 1})" 
                        class="pagination-btn ${this.state.currentPage === totalPages ? 'disabled' : ''}" 
                        ${this.state.currentPage === totalPages ? 'disabled' : ''}>
                    <i class="fas fa-angle-right"></i>
                </button>
                <button onclick="MemberManager.goToPage(${totalPages})" 
                        class="pagination-btn ${this.state.currentPage === totalPages ? 'disabled' : ''}" 
                        ${this.state.currentPage === totalPages ? 'disabled' : ''}>
                    <i class="fas fa-angle-double-right"></i>
                </button>
                
                <div class="pagination-info">
                    ${this.state.currentPage} / ${totalPages}
                </div>
            </div>
        `;
    },

    /**
     * Afficher le profil d'un adhérent (VERSION SUPABASE)
     * @param memberId
     */
    async showMemberProfile(memberId) {
        try {
            const [member, performances, trainingProfile] = await Promise.all([
                SupabaseManager.getMember(memberId),
                SupabaseManager.getPerformances(memberId),
                this.getTrainingProfile(memberId)
            ]);

            if (!member) {
                throw new Error('Adhérent non trouvé');
            }

            // Attacher les performances au membre
            member._performances = performances || [];

            // Attacher le profil d'entraînement
            member._trainingProfile = trainingProfile;

            this.state.currentMember = member;
            this.state.currentView = 'profile';

            const html = this.renderMemberProfile(member);
            document.getElementById('mainContent').innerHTML = html;

            // Attacher les événements du profil
            this.attachProfileEventListeners();
        } catch (error) {
            console.error("Erreur lors de l'affichage du profil:", error);
            this.showError("Impossible d'afficher le profil", error.message);
        }
    },

    /**
     * Récupérer tous les profils d'entraînement depuis member_training_profiles
     */
    async getAllTrainingProfiles() {
        try {
            const { data, error } = await SupabaseManager.supabase
                .from('member_training_profiles')
                .select('*');

            if (error) {
                console.warn('⚠️ getAllTrainingProfiles error:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('❌ Exception getAllTrainingProfiles:', error);
            return [];
        }
    },

    /**
     * Récupérer le profil d'entraînement depuis member_training_profiles
     * @param memberId
     */
    async getTrainingProfile(memberId) {
        try {
            const { data, error } = await SupabaseManager.supabase
                .from('member_training_profiles')
                .select('*')
                .eq('member_id', memberId)
                .maybeSingle(); // maybeSingle au lieu de single pour éviter l'erreur 406 si pas de résultat

            if (error) {
                console.error('⚠️ Erreur récupération profil entraînement:', error);
                return null;
            }

            return data || null;
        } catch (error) {
            console.error('❌ Exception getTrainingProfile:', error);
            return null;
        }
    },

    /**
     * Changer d'onglet dans le profil
     * @param tabName
     */
    switchTab(tabName) {
        this.state.activeTab = tabName;
        this.showMemberProfile(this.state.currentMember.id);
    },

    /**
     * Rendu du profil d'adhérent
     * @param member
     */
    renderMemberProfile(member) {
        const performances = this.getMemberPerformances(member);
        const fitnessIndex = this.calculateFitnessIndex(member);
        const activeTab = this.state.activeTab || 'data';

        // Parse member name for firstName/lastName
        const nameParts = (member.name || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        member.firstName = firstName;
        member.lastName = lastName;

        return `
            <div class="member-profile-container fade-in">
                <!-- Header du profil -->
                <div class="profile-header">
                    <button onclick="MemberManager.showMembersView()" class="btn btn-secondary btn-back">
                        <i class="fas fa-arrow-left mr-2"></i>
                        Retour à la liste
                    </button>
                    <div class="profile-title">
                        <h2>Profil de ${firstName} ${lastName}</h2>
                    </div>
                    <div class="profile-actions">
                        <button onclick="MemberManager.editMember('${member.id}')" class="btn btn-primary">
                            <i class="fas fa-edit mr-2"></i>
                            Modifier
                        </button>
                    </div>
                </div>

                <!-- TABS NAVIGATION -->
                <div class="profile-tabs">
                    <button class="tab-btn ${activeTab === 'data' ? 'active' : ''}"
                            onclick="MemberManager.switchTab('data')">
                        <i class="fas fa-user"></i> Données
                    </button>
                    <button class="tab-btn ${activeTab === 'perf' ? 'active' : ''}"
                            onclick="MemberManager.switchTab('perf')">
                        <i class="fas fa-chart-line"></i> Performances
                    </button>
                    <button class="tab-btn ${activeTab === 'nutrition' ? 'active' : ''}"
                            onclick="MemberManager.switchTab('nutrition')">
                        <i class="fas fa-apple-alt"></i> Nutrition
                    </button>
                    <button class="tab-btn ${activeTab === 'prog' ? 'active' : ''}"
                            onclick="MemberManager.switchTab('prog')">
                        <i class="fas fa-dumbbell"></i> Programmation
                    </button>
                </div>

                <!-- TAB CONTENT -->
                <div class="tab-content" id="tabContent">
                    ${this.renderTabContent(activeTab, member, performances, fitnessIndex)}
                </div>
            </div>
        `;
    },

    /**
     * Rendu du niveau de forme
     * @param fitnessData
     */
    renderFitnessIndex(fitnessData) {
        const { fitnessIndex, badge, components, vo2 } = fitnessData;
        const badgeClass = this.getFitnessBadgeClass(fitnessIndex);

        return `
            <div class="profile-section">
                <h3 class="section-title">Niveau de Forme</h3>
                <div class="fitness-index-card">
                    <div class="fitness-score-display">
                        <div class="score-circle">
                            <span class="score-value">${fitnessIndex}</span>
                            <span class="score-label">Niveau</span>
                        </div>
                        <div class="score-badge ${badgeClass}">
                            ${badge}
                        </div>
                    </div>
                    
                    <div class="fitness-components">
                        <div class="component">
                            <div class="component-label">Cardio</div>
                            <div class="component-value cardio">${components.cardio}</div>
                        </div>
                        <div class="component">
                            <div class="component-label">Force</div>
                            <div class="component-value strength">${components.strength}</div>
                        </div>
                        <div class="component">
                            <div class="component-label">Endurance</div>
                            <div class="component-value endurance">${components.muscularEndurance}</div>
                        </div>
                        <div class="component">
                            <div class="component-label">Puissance</div>
                            <div class="component-value power">${components.power}</div>
                </div>
                    </div>
                    
                    ${
                        vo2.estimatedVO2max
                            ? `
                        <div class="vo2-info">
                            <i class="fas fa-heartbeat mr-2"></i>
                            VO₂ Max estimé: ${vo2.estimatedVO2max} ml/kg/min
                        </div>
                    `
                            : ''
                    }
                </div>
            </div>
        `;
    },

    /**
     * Rendu de la liste des performances
     * @param performances
     */
    renderPerformancesList(performances) {
        return `
            <div class="performances-list">
                ${performances
                    .map(
                        perf => `
                    <div class="performance-item">
                        <div class="performance-header">
                            <h4 class="performance-exercise">${perf.exercise}</h4>
                            <span class="performance-date">${this.formatDate(perf.date)}</span>
                        </div>
                        <div class="performance-details">
                            <div class="performance-value">
                                <span class="value">${perf.value}</span>
                                <span class="unit">${perf.unit || 'kg'}</span>
                            </div>
                            ${
                                perf.oneRM
                                    ? `
                                <div class="performance-1rm">
                                    1RM: ${perf.oneRM} kg
                                                </div>
                                            `
                                    : ''
                            }
                        </div>
                        <div class="performance-actions">
                            <button onclick="MemberManager.editPerformance('${perf.id}')" class="btn-icon btn-edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="MemberManager.deletePerformance('${perf.id || `${exercise}_${perf.date}_${perf.value}`}')" class="btn-icon btn-delete">
                                <i class="fas fa-trash"></i>
                            </button>
                                            </div>
                                        </div>
                `
                    )
                    .join('')}
                                    </div>
        `;
    },

    /**
     * Rendu de l'état "aucune performance"
     */
    renderNoPerformances() {
        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <h3 class="empty-title">Aucune performance</h3>
                <p class="empty-description">Commencez par enregistrer des performances pour suivre la progression</p>
                <button onclick="MemberManager.addPerformance('${this.state.currentMember.id}')" class="btn btn-primary">
                    <i class="fas fa-plus mr-2"></i>
                    Ajouter une performance
                </button>
            </div>
        `;
    },

    /**
     * Rendu du contenu d'un onglet
     * @param tab
     * @param member
     * @param performances
     * @param fitnessIndex
     */
    renderTabContent(tab, member, performances, fitnessIndex) {
        switch (tab) {
            case 'data':
                return this.renderDataTab(member, fitnessIndex);

            case 'perf':
                return this.renderPerfTab(member, performances);

            case 'nutrition':
                return this.renderNutritionTab(member);

            case 'prog':
                return this.renderProgTab(member);

            default:
                return this.renderDataTab(member, fitnessIndex);
        }
    },

    /**
     * Onglet Données - Formulaire d'édition
     * @param member
     * @param fitnessIndex
     */
    renderDataTab(member, fitnessIndex) {
        const isEditing = this.state.editingData || false;

        return `
            <!-- Informations personnelles -->
            <div class="profile-section">
                <div class="section-header">
                    <h3 class="section-title">
                        <i class="fas fa-user-circle"></i> Informations Personnelles
                    </h3>
                    ${
                        !isEditing
                            ? `
                        <button onclick="MemberManager.enableDataEdit()" class="btn btn-primary">
                            <i class="fas fa-edit"></i> Modifier
                        </button>
                    `
                            : ''
                    }
                </div>

                ${!isEditing ? this.renderDataView(member) : this.renderDataEditForm(member)}
            </div>

            <!-- Niveau de forme -->
            ${fitnessIndex ? this.renderFitnessIndex(fitnessIndex) : ''}
        `;
    },

    /**
     * Vue lecture des données
     * @param member
     */
    renderDataView(member) {
        // Obtenir les infos du profil d'entraînement
        const trainingProfile = member._trainingProfile || {};
        const trainingLevel = trainingProfile.level || 'Non renseigné';
        const trainingGender =
            trainingProfile.gender ||
            (member.gender === 'male'
                ? 'homme'
                : member.gender === 'female'
                  ? 'femme'
                  : 'Non renseigné');

        // Convertir les valeurs pour affichage
        const levelLabels = {
            debutant: 'Débutant',
            intermediaire: 'Intermédiaire',
            enforme: 'En forme',
            tresenforme: 'Très en forme'
        };
        const genderLabels = {
            homme: '♂ Homme',
            femme: '♀ Femme',
            autre: 'Autre'
        };

        return `
            <div class="profile-info-grid">
                <div class="info-item">
                    <label>Prénom</label>
                    <span>${member.firstName || 'Non renseigné'}</span>
                </div>
                <div class="info-item">
                    <label>Nom</label>
                    <span>${member.lastName || 'Non renseigné'}</span>
                </div>
                <div class="info-item">
                    <label>Âge</label>
                    <span>${member.age || 'Non renseigné'}</span>
                </div>
                <div class="info-item">
                    <label>Genre</label>
                    <span>${member.gender === 'male' ? 'Homme' : member.gender === 'female' ? 'Femme' : 'Non renseigné'}</span>
                </div>
                <div class="info-item">
                    <label>Poids</label>
                    <span>${member.weight ? `${member.weight} kg` : 'Non renseigné'}</span>
                </div>
                <div class="info-item">
                    <label>Taille</label>
                    <span>${member.height ? `${member.height} cm` : 'Non renseigné'}</span>
                </div>
                <div class="info-item">
                    <label>Masse grasse</label>
                    <span>${member.body_fat_percentage ? `${member.body_fat_percentage.toFixed(1)} %` : 'Non renseigné'}</span>
                </div>
                <div class="info-item">
                    <label>Discord ID</label>
                    <span>${member.discord_id || 'Non renseigné'}</span>
                </div>

                <!-- PROFIL D'ENTRAÎNEMENT -->
                <div class="info-item" style="grid-column: 1 / -1; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--glass-border);">
                    <label style="font-size: 1.1rem; font-weight: 700; color: var(--accent-primary);">
                        <i class="fas fa-dumbbell" style="margin-right: 0.5rem;"></i>Profil d'entraînement
                    </label>
                </div>
                <div class="info-item">
                    <label>Niveau de forme</label>
                    <span>${levelLabels[trainingLevel] || trainingLevel}</span>
                </div>
                <div class="info-item">
                    <label>Genre (équipes)</label>
                    <span>${genderLabels[trainingGender] || trainingGender}</span>
                </div>
            </div>
        `;
    },

    /**
     * Formulaire d'édition des données
     * @param member
     */
    renderDataEditForm(member) {
        // Obtenir les infos du profil d'entraînement
        const trainingProfile = member._trainingProfile || {};
        const trainingLevel = trainingProfile.level || 'intermediaire';
        const trainingGender =
            trainingProfile.gender ||
            (member.gender === 'male' ? 'homme' : member.gender === 'female' ? 'femme' : 'autre');

        return `
            <form id="editDataForm" class="profile-info-grid">
                <div class="info-item">
                    <label for="editFirstName">Prénom *</label>
                    <input type="text" id="editFirstName" name="firstName" value="${member.firstName || ''}" required>
                </div>
                <div class="info-item">
                    <label for="editLastName">Nom *</label>
                    <input type="text" id="editLastName" name="lastName" value="${member.lastName || ''}" required>
                </div>
                <div class="info-item">
                    <label for="editAge">Âge</label>
                    <input type="number" id="editAge" name="age" value="${member.age || ''}" min="1" max="120">
                </div>
                <div class="info-item">
                    <label for="editGender">Genre</label>
                    <select id="editGender" name="gender">
                        <option value="">Sélectionner</option>
                        <option value="male" ${member.gender === 'male' ? 'selected' : ''}>Homme</option>
                        <option value="female" ${member.gender === 'female' ? 'selected' : ''}>Femme</option>
                    </select>
                </div>
                <div class="info-item">
                    <label for="editWeight">Poids (kg)</label>
                    <input type="number" id="editWeight" name="weight" value="${member.weight || ''}" min="1" step="0.1">
                </div>
                <div class="info-item">
                    <label for="editHeight">Taille (cm)</label>
                    <input type="number" id="editHeight" name="height" value="${member.height || ''}" min="1" step="0.1">
                </div>
                <div class="info-item">
                    <label for="editBodyFat">Masse grasse (%)</label>
                    <input type="number" id="editBodyFat" name="bodyFat" value="${member.body_fat_percentage || ''}" min="0" max="100" step="0.1">
                </div>
                <div class="info-item">
                    <label for="editDiscordId">Discord ID</label>
                    <input type="text" id="editDiscordId" name="discordId" value="${member.discord_id || ''}" placeholder="123456789012345678">
                </div>

                <!-- PROFIL D'ENTRAÎNEMENT -->
                <div class="info-item" style="grid-column: 1 / -1; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--glass-border);">
                    <label style="font-size: 1.1rem; font-weight: 700; color: var(--accent-primary);">
                        <i class="fas fa-dumbbell" style="margin-right: 0.5rem;"></i>Profil d'entraînement
                    </label>
                </div>
                <div class="info-item">
                    <label for="editTrainingLevel">Niveau de forme *</label>
                    <select id="editTrainingLevel" name="trainingLevel" required>
                        <option value="debutant" ${trainingLevel === 'debutant' ? 'selected' : ''}>Débutant</option>
                        <option value="intermediaire" ${trainingLevel === 'intermediaire' ? 'selected' : ''}>Intermédiaire</option>
                        <option value="enforme" ${trainingLevel === 'enforme' ? 'selected' : ''}>En forme</option>
                        <option value="tresenforme" ${trainingLevel === 'tresenforme' ? 'selected' : ''}>Très en forme</option>
                    </select>
                </div>
                <div class="info-item">
                    <label for="editTrainingGender">Genre (équipes) *</label>
                    <select id="editTrainingGender" name="trainingGender" required>
                        <option value="homme" ${trainingGender === 'homme' ? 'selected' : ''}>♂ Homme</option>
                        <option value="femme" ${trainingGender === 'femme' ? 'selected' : ''}>♀ Femme</option>
                    </select>
                </div>
            </form>

            <div class="edit-mode-actions">
                <button onclick="MemberManager.cancelDataEdit()" class="btn btn-secondary">
                    <i class="fas fa-times"></i> Annuler
                </button>
                <button onclick="MemberManager.saveDataEdit()" class="btn btn-primary">
                    <i class="fas fa-save"></i> Enregistrer
                </button>
            </div>
        `;
    },

    /**
     * Activer le mode édition
     */
    enableDataEdit() {
        this.state.editingData = true;
        this.showMemberProfile(this.state.currentMember.id);
    },

    /**
     * Annuler l'édition
     */
    cancelDataEdit() {
        this.state.editingData = false;
        this.showMemberProfile(this.state.currentMember.id);
    },

    /**
     * Sauvegarder les modifications
     */
    async saveDataEdit() {
        try {
            const form = document.getElementById('editDataForm');
            const formData = new FormData(form);

            const age = formData.get('age') ? parseInt(formData.get('age')) : null;
            const birthdate = age
                ? new Date(new Date().getFullYear() - age, 0, 1).toISOString().split('T')[0]
                : null;

            const updates = {
                firstName: (formData.get('firstName') || '').trim(),
                lastName: (formData.get('lastName') || '').trim(),
                birthdate: birthdate,
                gender: formData.get('gender') || 'other',
                weight: formData.get('weight') ? parseFloat(formData.get('weight')) : null,
                height: formData.get('height') ? parseFloat(formData.get('height')) : null,
                body_fat_percentage: formData.get('bodyFat')
                    ? parseFloat(formData.get('bodyFat'))
                    : null,
                discord_id: formData.get('discordId') ? formData.get('discordId').trim() : null
            };

            // Mettre à jour les données de base
            await SupabaseManager.updateMember(this.state.currentMember.id, updates);

            // Mettre à jour ou créer le profil d'entraînement
            const trainingLevel = formData.get('trainingLevel');
            const trainingGender = formData.get('trainingGender');

            if (trainingLevel && trainingGender) {
                await this.saveTrainingProfile(this.state.currentMember.id, {
                    level: trainingLevel,
                    gender: trainingGender
                });
            }

            this.state.editingData = false;
            this.showNotification('Données mises à jour', 'success');
            this.showMemberProfile(this.state.currentMember.id);
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            this.showNotification('Erreur lors de la sauvegarde', 'error');
        }
    },

    /**
     * Sauvegarder ou mettre à jour le profil d'entraînement
     * @param memberId
     * @param profile
     */
    async saveTrainingProfile(memberId, profile) {
        try {
            console.log('💾 Tentative sauvegarde profil pour member:', memberId, profile);

            // D'abord, vérifier si un profil existe
            const { data: existing, error: checkError } = await SupabaseManager.supabase
                .from('member_training_profiles')
                .select('id')
                .eq('member_id', memberId)
                .maybeSingle();

            if (checkError) {
                console.error('⚠️ Erreur vérification profil existant:', checkError);
            }

            // Données à sauvegarder (NE PAS envoyer updated_at ni points - gérés par triggers)
            const profileData = {
                member_id: memberId,
                level: profile.level,
                gender: profile.gender
            };

            console.log('📤 Données à envoyer:', profileData);

            let result;
            if (existing) {
                // UPDATE
                console.log('🔄 Mise à jour du profil existant...');
                result = await SupabaseManager.supabase
                    .from('member_training_profiles')
                    .update({
                        level: profile.level,
                        gender: profile.gender
                    })
                    .eq('member_id', memberId)
                    .select();
            } else {
                // INSERT
                console.log("➕ Création d'un nouveau profil...");
                result = await SupabaseManager.supabase
                    .from('member_training_profiles')
                    .insert([profileData])
                    .select();
            }

            if (result.error) {
                console.error('❌ Erreur SQL:', result.error);
                throw result.error;
            }

            console.log("✅ Profil d'entraînement sauvegardé:", result.data);
        } catch (error) {
            console.error('❌ Exception saveTrainingProfile:', error);
            throw error;
        }
    },

    /**
     * Onglet Performances - Tableau professionnel
     * @param member
     * @param performances
     */
    renderPerfTab(member, performances) {
        return `
            <div class="profile-section">
                <div class="section-header">
                    <h3 class="section-title">
                        <i class="fas fa-chart-line"></i> Historique des Performances
                    </h3>
                    <button onclick="MemberManager.addPerformance('${member.id}')" class="btn btn-primary">
                        <i class="fas fa-plus"></i> Ajouter
                    </button>
                </div>
                ${performances.length > 0 ? this.renderPerformancesTable(performances) : this.renderNoPerformances()}
            </div>
        `;
    },

    /**
     * Tableau des performances
     * @param performances
     */
    renderPerformancesTable(performances) {
        return `
            <div class="performances-table-wrapper">
                <table class="performances-table">
                    <thead>
                        <tr>
                            <th>Exercice</th>
                            <th>Valeur</th>
                            <th>1RM</th>
                            <th>Date</th>
                            <th>Notes</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${performances
                            .map(
                                perf => `
                            <tr>
                                <td class="perf-exercise">${perf.exercise_type || perf.exercise || 'N/A'}</td>
                                <td>
                                    <div class="perf-value">
                                        <span>${this.formatPerfValue(perf)}</span>
                                        <span class="perf-unit">${perf.unit || ''}</span>
                                    </div>
                                </td>
                                <td>${perf.one_rm ? `${perf.one_rm} kg` : '--'}</td>
                                <td class="perf-date">${this.formatDate(perf.date || perf.created_at)}</td>
                                <td>${perf.notes || '--'}</td>
                                <td>
                                    <div class="perf-actions">
                                        <button onclick="MemberManager.editPerformance('${perf.id}')"
                                                class="btn-action btn-edit"
                                                title="Modifier">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button onclick="MemberManager.deletePerformance('${perf.id}')"
                                                class="btn-action btn-delete"
                                                title="Supprimer">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
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

    /**
     * Formater la valeur de performance
     * @param perf
     */
    formatPerfValue(perf) {
        const value = perf.value;
        const unit = perf.unit;

        // Si c'est du temps en secondes, convertir en mm:ss
        if (unit === 'sec' && value) {
            const minutes = Math.floor(value / 60);
            const seconds = Math.floor(value % 60);
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }

        // Sinon retourner la valeur brute
        return value || '--';
    },

    /**
     * Onglet Nutrition - Avec upload
     * @param member
     */
    renderNutritionTab(member) {
        const containerId = 'nutritionTabContent';

        // Déclencher le chargement des plans après le rendu
        setTimeout(() => this.loadAndRenderNutritionPlans(member.id, containerId), 0);

        return `
            <div class="profile-section">
                <div class="section-header">
                    <h3 class="section-title">
                        <i class="fas fa-apple-alt"></i> Plans Nutrition
                    </h3>
                </div>

                <!-- Upload Section -->
                <div class="upload-section">
                    <div class="upload-icon">
                        <i class="fas fa-cloud-upload-alt"></i>
                    </div>
                    <h4>Ajouter un plan nutrition</h4>
                    <p>Uploadez un PDF de plan nutrition pour ${member.firstName}</p>
                    <input type="file"
                           id="nutritionPdfUpload"
                           accept=".pdf"
                           style="display: none;"
                           onchange="MemberManager.handleNutritionPdfUpload(event, '${member.id}')">
                    <button onclick="document.getElementById('nutritionPdfUpload').click()" class="btn-upload">
                        <i class="fas fa-file-pdf"></i> Choisir un PDF
                    </button>
                </div>

                <!-- PDF List -->
                <div id="${containerId}">
                    <div class="loading-state">
                        <i class="fas fa-spinner fa-spin"></i> Chargement...
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Onglet Programmation - Avec upload
     * @param member
     */
    renderProgTab(member) {
        const containerId = 'progTabContent';

        // Déclencher le chargement des programmes après le rendu
        setTimeout(() => this.loadAndRenderPrograms(member.id, containerId), 0);

        return `
            <div class="profile-section">
                <div class="section-header">
                    <h3 class="section-title">
                        <i class="fas fa-dumbbell"></i> Programmes d'Entraînement
                    </h3>
                </div>

                <!-- Upload Section -->
                <div class="upload-section">
                    <div class="upload-icon">
                        <i class="fas fa-cloud-upload-alt"></i>
                    </div>
                    <h4>Ajouter un programme d'entraînement</h4>
                    <p>Uploadez un PDF de programme pour ${member.firstName}</p>
                    <input type="file"
                           id="programPdfUpload"
                           accept=".pdf"
                           style="display: none;"
                           onchange="MemberManager.handleProgramPdfUpload(event, '${member.id}')">
                    <button onclick="document.getElementById('programPdfUpload').click()" class="btn-upload">
                        <i class="fas fa-file-pdf"></i> Choisir un PDF
                    </button>
                </div>

                <!-- PDF List -->
                <div id="${containerId}">
                    <div class="loading-state">
                        <i class="fas fa-spinner fa-spin"></i> Chargement...
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Ouvrir la modal d'ajout d'adhérent
     */
    openAddMemberModal() {
        const content = `
            <form id="addMemberForm" class="member-form">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="firstName" class="form-label">Prénom *</label>
                        <input type="text" id="firstName" name="firstName" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label for="lastName" class="form-label">Nom *</label>
                        <input type="text" id="lastName" name="lastName" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label for="age" class="form-label">Âge</label>
                        <input type="number" id="age" name="age" class="form-input" min="1" max="120">
                    </div>
                    <div class="form-group">
                        <label for="gender" class="form-label">Genre</label>
                        <select id="gender" name="gender" class="form-select">
                            <option value="">Sélectionner</option>
                            <option value="male">Homme</option>
                            <option value="female">Femme</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="weight" class="form-label">Poids (kg)</label>
                        <input type="number" id="weight" name="weight" class="form-input" min="1" step="0.1">
                    </div>
                    <div class="form-group">
                        <label for="height" class="form-label">Taille (cm)</label>
                        <input type="number" id="height" name="height" class="form-input" min="1" step="0.1">
                    </div>
                    <div class="form-group">
                        <label for="bodyFat" class="form-label">Masse grasse (%)</label>
                        <input type="number" id="bodyFat" name="bodyFat" class="form-input" min="0" max="100" step="0.1">
                    </div>
                </div>

                <div class="form-group">
                    <label for="photo" class="form-label">Photo de profil</label>
                    <div class="photo-upload">
                        <input type="file" id="photo" name="photo" accept="image/*" class="photo-input">
                        <label for="photo" class="photo-label">
                            <i class="fas fa-camera mr-2"></i>
                            Choisir une photo
                        </label>
                        <div id="photoPreview" class="photo-preview"></div>
                    </div>
                </div>
            </form>

            <div class="modal-actions">
                <button type="button" onclick="Utils.closeModal()" class="btn btn-cancel">
                    Annuler
                </button>
                <button type="button" onclick="MemberManager.saveMember()" class="btn btn-primary">
                    <i class="fas fa-save mr-2"></i>
                    Enregistrer
                </button>
            </div>
        `;

        Utils.openModal({
            title: 'Nouvel Adhérent',
            subtitle: 'Ajouter un nouvel adhérent à la base de données',
            content,
            size: 'large',
            draggable: true
        });

        this.attachModalEventListeners('add');
    },

    /**
     * Sauvegarder un adhérent (VERSION SUPABASE)
     */
    async saveMember() {
        try {
            const form = document.getElementById('addMemberForm');
            const formData = new FormData(form);

            // Validation
            const firstName = formData.get('firstName')?.trim();
            const lastName = formData.get('lastName')?.trim();

            if (!firstName || !lastName) {
                this.showNotification('Veuillez remplir le prénom et le nom', 'error');
                return;
            }

            // Vérifier les doublons
            const fullName = `${firstName} ${lastName}`;
            const existingMembers = await SupabaseManager.getMembers();
            const duplicate = existingMembers.find(
                m => m.name.toLowerCase() === fullName.toLowerCase()
            );

            if (duplicate) {
                const confirm = window.confirm(
                    `⚠️ Un membre "${fullName}" existe déjà.\n\nVoulez-vous créer un doublon ?`
                );
                if (!confirm) {
                    this.showNotification('Création annulée - Membre déjà existant', 'warning');
                    return;
                }
            }

            // Préparer les données pour Supabase
            const age = formData.get('age') ? parseInt(formData.get('age')) : null;
            const birthdate = age
                ? new Date(new Date().getFullYear() - age, 0, 1).toISOString().split('T')[0]
                : null;

            const memberData = {
                firstName,
                lastName,
                birthdate, // Convertir âge en birthdate approximative
                gender: formData.get('gender') || 'other',
                weight: formData.get('weight') ? parseFloat(formData.get('weight')) : null,
                height: formData.get('height') ? parseFloat(formData.get('height')) : null,
                body_fat_percentage: formData.get('bodyFat')
                    ? parseFloat(formData.get('bodyFat'))
                    : null
            };

            // Créer dans Supabase
            await SupabaseManager.createMember(memberData);

            this.showNotification('Adhérent ajouté avec succès', 'success');
            Utils.closeModal();
            this.showMembersView();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            this.showNotification('Erreur lors de la sauvegarde', 'error');
        }
    },

    /**
     * Filtrer les adhérents (VERSION SUPABASE)
     * @param members
     */
    filterMembers(members) {
        if (!this.state.searchTerm) {
            return members;
        }

        const searchTerm = this.state.searchTerm.toLowerCase();
        return members.filter(
            member =>
                (member.name || '').toLowerCase().includes(searchTerm) ||
                (member.age && member.age.toString().includes(searchTerm)) ||
                (member.gender && member.gender.toLowerCase().includes(searchTerm))
        );
    },

    /**
     * Paginer les adhérents
     * @param members
     */
    paginateMembers(members) {
        const start = (this.state.currentPage - 1) * this.config.itemsPerPage;
        const end = start + this.config.itemsPerPage;
        return members.slice(start, end);
    },

    /**
     * Calculer le niveau de forme (VERSION SUPABASE)
     * @param member
     */
    calculateFitnessIndex(member) {
        try {
            if (typeof calculateFitnessIndexV2 === 'undefined') {
                return null;
            }

            const inputData = {
                age: member.age || 25,
                gender: member.gender || 'male',
                weight: member.weight || 70,
                height: member.height || 175
            };

            // Extraire les performances
            const performances = this.getMemberPerformances(member);
            if (performances.length > 0) {
                performances.forEach(perf => {
                    const exercise = (perf.exercise || '').toLowerCase();
                    const rawVal = perf.value;
                    const type = perf.type || '';

                    // Cardio (convertir mm:ss en secondes si possible)
                    const toSec = val =>
                        typeof Utils !== 'undefined' &&
                        Utils.parseTimeToSeconds &&
                        typeof val === 'string'
                            ? Utils.parseTimeToSeconds(val)
                            : parseFloat(val);

                    // 600m / 1200m Run → estimation 2k
                    if (exercise.includes('600m run')) {
                        const t = toSec(rawVal);
                        if (isFinite(t)) {
                            inputData.run2kTimeSec = Math.round(t * (2000 / 600));
                        }
                        return;
                    }
                    if (exercise.includes('1200m run')) {
                        const t = toSec(rawVal);
                        if (isFinite(t)) {
                            inputData.run2kTimeSec = Math.round(t * (2000 / 1200));
                        }
                        return;
                    }
                    if (exercise.includes('2k') || exercise.includes('2000m')) {
                        const t = toSec(rawVal);
                        if (isFinite(t)) {
                            inputData.run2kTimeSec = t;
                        }
                        return;
                    }
                    if (exercise.includes('5k') || exercise.includes('5000m')) {
                        const t = toSec(rawVal);
                        if (isFinite(t)) {
                            inputData.run5kTimeSec = t;
                        }
                        return;
                    }

                    // Force (1RM poids du jour)
                    const num = parseFloat(rawVal);
                    if (exercise.includes('back squat')) {
                        inputData.backSquat1RM = num;
                        return;
                    }
                    if (exercise.includes('front squat')) {
                        /* non utilisé directement */ return;
                    }
                    if (exercise.includes('bench')) {
                        inputData.bench1RM = num;
                        return;
                    }
                    if (exercise.includes('deadlift')) {
                        inputData.deadlift1RM = num;
                        return;
                    }
                    if (exercise.includes('strict press')) {
                        /* non utilisé directement */ return;
                    }
                    if (exercise.includes('snatch')) {
                        inputData.snatch1RM = num;
                        return;
                    }
                    if (exercise.includes('clean') && exercise.includes('jerk')) {
                        inputData.cleanJerk1RM = num;
                        return;
                    }

                    // Endurance muscu / Gym
                    if (
                        exercise.includes('pullups') ||
                        (exercise.includes('pull') && exercise.includes('up'))
                    ) {
                        inputData.pullUpsMax = parseInt(num);
                        return;
                    }
                    if (exercise.includes('push') && exercise.includes('up')) {
                        inputData.pushUpsMax = parseInt(num);
                        return;
                    }
                    if (exercise.includes('toes') && exercise.includes('bar')) {
                        inputData.toesToBarMax = parseInt(num);
                        return;
                    }
                    if (exercise.includes('dips')) {
                        inputData.dipsMax = parseInt(num);
                        return;
                    }
                    if (exercise.includes('burpees')) {
                        inputData.burpees2min = parseInt(num);
                        return;
                    }

                    // Puissance additionnelle
                    if (exercise.includes('assault') && exercise.includes('watt')) {
                        inputData.assaultBikePeakW = parseFloat(rawVal);
                        return;
                    }
                    if (exercise.includes('skierg') && exercise.includes('watt')) {
                        inputData.skiergPeakW = parseFloat(rawVal);
                        return;
                    }
                    if (exercise.includes('broad') && exercise.includes('jump')) {
                        // stocker en cm
                        inputData.broadJumpCm = parseFloat(rawVal);
                        return;
                    }
                });
            }

            return calculateFitnessIndexV2(inputData);
        } catch (error) {
            console.error('Erreur lors du calcul du niveau de forme:', error);
            return null;
        }
    },

    /**
     * Obtenir le nombre de performances
     * @param member
     */
    getPerformanceCount(member) {
        return this.getMemberPerformances(member).length;
    },

    /**
     * Obtenir la dernière performance
     * @param member
     */
    getLastPerformance(member) {
        const performances = this.getMemberPerformances(member);
        if (performances.length === 0) {
            return null;
        }

        return performances.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    },

    /**
     * Obtenir les performances d'un membre (VERSION SUPABASE)
     * Note: Dans Supabase, les performances sont stockées séparément
     * Cette fonction doit être appelée de manière async pour récupérer les performances
     * @param member
     */
    getMemberPerformances(member) {
        // Pour l'instant, retourner un tableau vide
        // Les performances doivent être chargées séparément via SupabaseManager.getPerformances(member.id)
        // TODO: Charger les performances de manière centralisée lors de showMembersView
        return member._performances || [];
    },

    /**
     * S'assurer que les performances sont correctement initialisées
     * @param member
     */
    ensurePerformancesStructure(member) {
        if (!member.performances) {
            member.performances = {};
        }

        // Si c'est un tableau, le convertir en objet
        if (Array.isArray(member.performances)) {
            const performancesObj = {};
            member.performances.forEach(perf => {
                if (perf.exercise) {
                    if (!performancesObj[perf.exercise]) {
                        performancesObj[perf.exercise] = [];
                    }
                    performancesObj[perf.exercise].push(perf);
                }
            });
            member.performances = performancesObj;
        }

        return member;
    },

    /**
     * Obtenir la classe CSS du badge de fitness
     * @param fitnessIndex
     */
    getFitnessBadgeClass(fitnessIndex) {
        if (fitnessIndex >= 85) {
            return 'badge-elite';
        }
        if (fitnessIndex >= 70) {
            return 'badge-expert';
        }
        if (fitnessIndex >= 55) {
            return 'badge-advanced';
        }
        if (fitnessIndex >= 40) {
            return 'badge-intermediate';
        }
        return 'badge-beginner';
    },

    /**
     * Formater une date
     * @param dateString
     */
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('fr-FR');
    },

    /**
     * Convertir un fichier en Base64
     * @param file
     */
    convertFileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    /**
     * Attacher les événements
     */
    attachEventListeners() {
        // Recherche avec debounce et indicateur visuel
        const searchInput = document.getElementById('memberSearch');
        if (searchInput) {
            let timeout;
            let isSearching = false;

            searchInput.addEventListener('input', e => {
                const value = e.target.value;

                // Afficher l'indicateur de recherche
                this.showSearchIndicator(true);

                // Effacer le timeout précédent
                clearTimeout(timeout);

                // Si le champ est vide, rechercher immédiatement
                if (value.trim() === '') {
                    this.state.searchTerm = '';
                    this.state.currentPage = 1;
                    this.showMembersView();
                    this.showSearchIndicator(false);
                    return;
                }

                // Programmer la recherche avec délai
                timeout = setTimeout(() => {
                    this.state.searchTerm = value;
                    this.state.currentPage = 1;
                    this.showMembersView();
                    this.showSearchIndicator(false);
                }, this.config.searchDebounce);
            });
        }

        // Tri
        const sortSelect = document.getElementById('memberSort');
        if (sortSelect) {
            sortSelect.addEventListener('change', e => {
                this.state.sortBy = e.target.value;
                this.state.currentPage = 1;
                this.showMembersView();
            });
        }
    },

    /**
     * Attacher les événements du profil
     */
    attachProfileEventListeners() {
        // Événements spécifiques au profil
    },

    /**
     * Attacher les événements des modals
     * @param type
     */
    attachModalEventListeners(type) {
        if (type === 'add') {
            // Gestion de l'upload de photo
            const photoInput = document.getElementById('photo');
            const photoPreview = document.getElementById('photoPreview');

            if (photoInput && photoPreview) {
                photoInput.addEventListener('change', e => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = e => {
                            photoPreview.innerHTML = `
                                <img src="${e.target.result}" alt="Preview" class="preview-image">
                            `;
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }
        }
    },

    /**
     * Effacer la recherche
     */
    clearSearch() {
        this.state.searchTerm = '';
        this.state.currentPage = 1;
        this.showMembersView();
    },

    /**
     * Afficher/masquer l'indicateur de recherche
     * @param show
     */
    showSearchIndicator(show) {
        const searchInput = document.getElementById('memberSearch');
        const searchIcon = document.querySelector('.search-icon');

        if (searchInput && searchIcon) {
            if (show) {
                // Remplacer l'icône de recherche par un spinner
                searchIcon.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                searchIcon.style.color = 'var(--primary)';
                searchInput.classList.add('searching');
            } else {
                // Remettre l'icône de recherche normale
                searchIcon.innerHTML = '<i class="fas fa-search"></i>';
                searchIcon.style.color = 'var(--text-secondary)';
                searchInput.classList.remove('searching');
            }
        }
    },

    /**
     * Basculer l'ordre de tri
     */
    toggleSortOrder() {
        this.state.sortOrder = this.state.sortOrder === 'asc' ? 'desc' : 'asc';
        this.showMembersView();
    },

    /**
     * Aller à une page
     * @param page
     */
    goToPage(page) {
        this.state.currentPage = page;
        this.showMembersView();
    },

    /**
     * Afficher une erreur
     * @param title
     * @param message
     */
    showError(title, message) {
        document.getElementById('mainContent').innerHTML = `
            <div class="error-state">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 class="error-title">${title}</h3>
                <p class="error-message">${message}</p>
                <button onclick="MemberManager.showMembersView()" class="btn btn-primary">
                    <i class="fas fa-refresh mr-2"></i>
                    Réessayer
                </button>
            </div>
        `;
    },

    /**
     * Afficher une notification
     * @param message
     * @param type
     */
    showNotification(message, type = 'info') {
        if (typeof Utils !== 'undefined' && Utils.showNotification) {
            Utils.showNotification(message, type);
        } else {
            alert(message);
        }
    },

    // Méthodes de gestion des adhérents (VERSION SUPABASE)
    async editMember(memberId) {
        const member = await SupabaseManager.getMember(memberId);
        if (!member) {
            return;
        }

        // Parser le nom
        const nameParts = (member.name || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const content = `
            <form id="editMemberForm" class="member-form">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="firstName" class="form-label">Prénom *</label>
                        <input type="text" id="firstName" name="firstName" class="form-input" value="${firstName}" required>
                    </div>
                    <div class="form-group">
                        <label for="lastName" class="form-label">Nom *</label>
                        <input type="text" id="lastName" name="lastName" class="form-input" value="${lastName}" required>
                    </div>
                    <div class="form-group">
                        <label for="age" class="form-label">Âge</label>
                        <input type="number" id="age" name="age" class="form-input" min="1" max="120" value="${this.calculateAge(member.birthdate) || ''}">
                    </div>
                    <div class="form-group">
                        <label for="gender" class="form-label">Genre</label>
                        <select id="gender" name="gender" class="form-select">
                            <option value="" ${!member.gender || member.gender === 'other' ? 'selected' : ''}>Sélectionner</option>
                            <option value="male" ${member.gender === 'male' ? 'selected' : ''}>Homme</option>
                            <option value="female" ${member.gender === 'female' ? 'selected' : ''}>Femme</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="weight" class="form-label">Poids (kg)</label>
                        <input type="number" id="weight" name="weight" class="form-input" min="1" step="0.1" value="${member.weight ?? ''}">
                    </div>
                    <div class="form-group">
                        <label for="height" class="form-label">Taille (cm)</label>
                        <input type="number" id="height" name="height" class="form-input" min="1" step="0.1" value="${member.height ?? ''}">
                    </div>
                    <div class="form-group">
                        <label for="bodyFat" class="form-label">Masse grasse (%)</label>
                        <input type="number" id="bodyFat" name="bodyFat" class="form-input" min="0" max="100" step="0.1" value="${member.body_fat_percentage ?? ''}">
                    </div>
                </div>

                <!-- Section Discord -->
                <div class="discord-section">
                    <h4 class="discord-section-title">
                        <i class="fab fa-discord"></i>
                        Liaison Discord
                    </h4>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="discordId" class="form-label">Discord ID</label>
                            <input type="text" id="discordId" name="discordId" class="form-input" value="${member.discord_id || ''}" placeholder="123456789012345678">
                            <small class="form-hint">
                                <i class="fas fa-info-circle"></i> ID Discord de l'adhérent pour verrouiller son profil
                            </small>
                        </div>
                        <div class="form-group">
                            <label for="discordUsername" class="form-label">Discord Username</label>
                            <input type="text" id="discordUsername" name="discordUsername" class="form-input" value="${member.discord_username || ''}" placeholder="username#1234">
                            <small class="form-hint">
                                <i class="fas fa-info-circle"></i> Optionnel - pour affichage uniquement
                            </small>
                        </div>
                    </div>
                    ${
                        member.discord_id
                            ? `
                        <div class="alert-info">
                            <p class="alert-message">
                                <i class="fas fa-lock"></i> Profil verrouillé - Seul ce Discord ID peut modifier les performances
                            </p>
                        </div>
                    `
                            : `
                        <div class="alert-warning">
                            <p class="alert-message">
                                <i class="fas fa-exclamation-triangle"></i> Aucun Discord lié - Tout le monde peut modifier les performances
                            </p>
                        </div>
                    `
                    }
                </div>
            </form>

            <div class="modal-actions">
                <button type="button" onclick="Utils.closeModal()" class="btn btn-cancel">Annuler</button>
                <button type="button" onclick="MemberManager.updateMember('${member.id}')" class="btn btn-primary">
                    <i class="fas fa-save mr-2"></i>Enregistrer
                </button>
            </div>
        `;

        Utils.openModal({
            title: 'Modifier le profil',
            subtitle: member.name,
            content,
            size: 'large',
            draggable: true
        });
    },

    async updateMember(memberId) {
        try {
            const form = document.getElementById('editMemberForm');
            const formData = new FormData(form);

            // Convertir l'âge en birthdate
            const age = formData.get('age') ? parseInt(formData.get('age')) : null;
            const birthdate = age
                ? new Date(new Date().getFullYear() - age, 0, 1).toISOString().split('T')[0]
                : null;

            const updates = {
                firstName: (formData.get('firstName') || '').toString().trim(),
                lastName: (formData.get('lastName') || '').toString().trim(),
                birthdate: birthdate,
                gender: formData.get('gender') || 'other',
                weight: formData.get('weight') ? parseFloat(formData.get('weight')) : null,
                height: formData.get('height') ? parseFloat(formData.get('height')) : null,
                body_fat_percentage: formData.get('bodyFat')
                    ? parseFloat(formData.get('bodyFat'))
                    : null,
                discord_id: formData.get('discordId') ? formData.get('discordId').trim() : null,
                discord_username: formData.get('discordUsername')
                    ? formData.get('discordUsername').trim()
                    : null
            };

            await SupabaseManager.updateMember(memberId, updates);
            Utils.closeModal();
            this.showNotification('Profil mis à jour', 'success');

            // rafraîchir vue
            if (
                this.state.currentView === 'profile' &&
                this.state.currentMember &&
                this.state.currentMember.id === memberId
            ) {
                this.showMemberProfile(memberId);
            } else {
                this.showMembersView();
            }
        } catch (e) {
            console.error(e);
            this.showNotification('Erreur lors de la mise à jour', 'error');
        }
    },

    async deleteMember(memberId) {
        if (confirm('Supprimer définitivement cet adhérent et toutes ses performances ?')) {
            try {
                await SupabaseManager.deleteMember(memberId);
                this.showMembersView();
                this.showNotification('Adhérent supprimé', 'success');
            } catch (error) {
                console.error('Erreur suppression:', error);
                this.showNotification('Erreur lors de la suppression', 'error');
            }
        }
    },

    async addPerformance(memberId) {
        // Rediriger vers PerformanceManager (VERSION SUPABASE)
        if (
            typeof PerformanceManager !== 'undefined' &&
            PerformanceManager.openAddPerformanceModal
        ) {
            PerformanceManager.openAddPerformanceModal(memberId);
            return;
        }

        // Fallback: simple modal
        const member = await SupabaseManager.getMember(memberId);
        if (!member) {
            return;
        }

        const categories = {
            Cardio: [
                '600m Run',
                '1200m Run',
                '1km Skierg',
                '1km Rameur',
                '2km Bikerg',
                'Max burpees (2 min)'
            ],
            Gym: ['Max pullups', 'Max Toes to bar', 'Max dips', 'Max pushups'],
            Musculation: [
                '1RM Bench Press',
                '1RM Deadlift',
                '1RM Front squat',
                '1RM Back squat',
                '1RM Strict press'
            ],
            Puissance: ['Assault bike (Pic watts)', 'Skierg (Pic watts)', 'Broad jump (cm)']
        };

        const renderExerciseOptions = cat => {
            return categories[cat].map(ex => `<option value="${ex}">${ex}</option>`).join('');
        };

        const content = `
            <form id="addPerformanceForm" class="member-form">
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">Catégorie</label>
                        <select id="perfCategory" class="form-select">
                            ${Object.keys(categories)
                                .map(c => `<option value="${c}">${c}</option>`)
                                .join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Exercice</label>
                        <select id="perfExercise" class="form-select">
                            ${renderExerciseOptions('Cardio')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Date</label>
                        <input type="date" id="perfDate" class="form-input" value="${new Date().toISOString().slice(0, 10)}">
                    </div>
                </div>

                <div id="dynamicFields" class="form-grid mt-2">
                    <!-- champs dynamiques -->
                </div>
            </form>

            <div class="modal-actions">
                <button type="button" onclick="Utils.closeModal()" class="btn btn-cancel">Annuler</button>
                <button type="button" onclick="MemberManager.savePerformance('${member.id}')" class="btn btn-primary">
                    <i class="fas fa-save mr-2"></i>Enregistrer
                </button>
            </div>
        `;

        Utils.openModal({
            title: 'Ajouter une performance',
            subtitle: `${member.firstName} ${member.lastName}`,
            content,
            size: 'large',
            draggable: true
        });

        const perfCategory = document.getElementById('perfCategory');
        const perfExercise = document.getElementById('perfExercise');
        const dynamicFields = document.getElementById('dynamicFields');

        const renderFields = () => {
            const ex = perfExercise.value;
            // Champs par défaut selon exercice
            if (
                ex.includes('Run') ||
                ex.includes('Skierg') ||
                ex.includes('Rameur') ||
                ex.includes('Bikerg')
            ) {
                dynamicFields.innerHTML = `
                    <div class="form-group">
                        <label class="form-label">Temps (mm:ss)</label>
                        <input type="text" id="perfValue" class="form-input" placeholder="ex: 04:30">
                    </div>
                `;
            } else if (ex.toLowerCase().includes('burpees')) {
                dynamicFields.innerHTML = `
                    <div class="form-group">
                        <label class="form-label">Répétitions (2 min)</label>
                        <input type="number" id="perfValue" class="form-input" placeholder="ex: 45" min="0">
                    </div>
                `;
            } else if (
                ex.toLowerCase().includes('max') &&
                (ex.toLowerCase().includes('pull') ||
                    ex.toLowerCase().includes('toes') ||
                    ex.toLowerCase().includes('dips') ||
                    ex.toLowerCase().includes('push'))
            ) {
                dynamicFields.innerHTML = `
                    <div class="form-group">
                        <label class="form-label">Répétitions</label>
                        <input type="number" id="perfValue" class="form-input" placeholder="ex: 20" min="0">
                    </div>
                `;
            } else if (ex.toLowerCase().includes('pic watts')) {
                dynamicFields.innerHTML = `
                    <div class="form-group">
                        <label class="form-label">Puissance (W)</label>
                        <input type="number" id="perfValue" class="form-input" placeholder="ex: 950" min="0" step="1">
                    </div>
                `;
            } else if (ex.toLowerCase().includes('broad jump')) {
                dynamicFields.innerHTML = `
                    <div class="form-group">
                        <label class="form-label">Longueur (cm)</label>
                        <input type="number" id="perfValue" class="form-input" placeholder="ex: 230" min="0" step="0.5">
                    </div>
                `;
            } else {
                // Musculation 1RM
                dynamicFields.innerHTML = `
                    <div class="form-group">
                        <label class="form-label">Charge (kg)</label>
                        <input type="number" id="perfValue" class="form-input" placeholder="ex: 120" min="0" step="0.5">
                    </div>
                `;
            }
        };

        perfCategory.addEventListener('change', () => {
            perfExercise.innerHTML = renderExerciseOptions(perfCategory.value);
            renderFields();
        });
        perfExercise.addEventListener('change', renderFields);
        renderFields();
    },

    editPerformance(performanceId) {
        console.log('Édition de la performance:', performanceId);
        // TODO: Implémenter l'édition de performance
    },

    async deletePerformance(performanceId) {
        try {
            const member = this.state.currentMember || null;
            if (!member) {
                this.showNotification('Aucun adhérent sélectionné', 'error');
                return;
            }

            if (!confirm('Supprimer définitivement cette performance ?')) {
                return;
            }

            await SupabaseManager.deletePerformance(performanceId);

            // Rafraîchir l'affichage courant
            if (this.state.currentView === 'profile') {
                this.showMemberProfile(member.id);
            } else {
                this.showMembersView();
            }

            this.showNotification('Performance supprimée', 'success');
        } catch (e) {
            console.error(e);
            this.showNotification('Erreur lors de la suppression', 'error');
        }
    },

    /**
     * Ouvrir un sélecteur rapide d'adhérent pour ajouter une performance (VERSION SUPABASE)
     */
    async openQuickPerformanceSelector() {
        const allMembersRaw = await SupabaseManager.getMembers(true);

        // Filtrer pour ne garder que les membres actifs
        const allMembers = allMembersRaw.filter(member => member.is_active !== false);

        console.log("📊 Nombre total d'adhérents:", allMembersRaw.length);
        console.log('✅ Adhérents actifs:', allMembers.length);
        console.log('📊 Premier adhérent:', allMembers[0]);

        if (allMembers.length === 0) {
            Utils.openModal({
                title: 'Aucun Adhérent',
                subtitle: "Vous devez d'abord ajouter des adhérents",
                content: `
                    <div class="empty-state-content">
                        <i class="fas fa-users empty-state-icon"></i>
                        <p class="empty-state-text">Aucun adhérent trouvé dans la base de données.</p>
                        <p class="empty-state-text mt-2">Commencez par ajouter des adhérents ou importez votre base de données.</p>
                    </div>
                    <div class="modal-actions">
                        <button type="button" onclick="Utils.closeModal(); MemberManager.openAddMemberModal();" class="btn btn-primary">
                            <i class="fas fa-user-plus mr-2"></i>
                            Ajouter un adhérent
                        </button>
                    </div>
                `,
                size: 'large',
                draggable: true
            });
            return;
        }

        // Séparer les membres avec et sans performances
        const withoutPerf = allMembers.filter(m => this.getPerformanceCount(m) === 0);
        const withPerf = allMembers.filter(m => this.getPerformanceCount(m) > 0);

        console.log('📊 Sans performances:', withoutPerf.length);
        console.log('📊 Avec performances:', withPerf.length);

        const renderMemberOption = member => {
            const perfCount = this.getPerformanceCount(member);
            const fitness = this.calculateFitnessIndex(member);
            const fitnessScore = fitness ? fitness.fitnessIndex : '--';

            return `
                <div class="member-selector-item" onclick="MemberManager.selectMemberForPerformance('${member.id}')">
                    <div class="member-selector-info">
                        <div class="member-selector-name">${member.firstName} ${member.lastName}</div>
                        <div class="member-selector-stats">
                            <span class="member-stat">Niveau: ${fitnessScore}</span>
                            <span class="member-stat">${perfCount} perf${perfCount > 1 ? 's' : ''}</span>
                        </div>
                    </div>
                    <i class="fas fa-chevron-right"></i>
                </div>
            `;
        };

        const content = `
            <div class="member-selector-container">
                <div class="member-selector-search">
                    <i class="fas fa-search"></i>
                    <input type="text"
                           id="memberSelectorSearch"
                           class="member-selector-search-input"
                           placeholder="Rechercher un adhérent..."
                           oninput="MemberManager.filterMemberSelector(this.value)">
                </div>

                ${
                    withoutPerf.length > 0
                        ? `
                    <div class="member-selector-section">
                        <h4 class="member-selector-section-title">
                            <i class="fas fa-exclamation-circle"></i>
                            Sans performances (${withoutPerf.length})
                        </h4>
                        <div id="withoutPerfList" class="member-selector-list">
                            ${withoutPerf.map(renderMemberOption).join('')}
                        </div>
                    </div>
                `
                        : ''
                }

                ${
                    withPerf.length > 0
                        ? `
                    <div class="member-selector-section">
                        <h4 class="member-selector-section-title">
                            <i class="fas fa-check-circle"></i>
                            Avec performances (${withPerf.length})
                        </h4>
                        <div id="withPerfList" class="member-selector-list">
                            ${withPerf.map(renderMemberOption).join('')}
                        </div>
                    </div>
                `
                        : ''
                }
            </div>

            <div class="modal-actions">
                <button type="button" onclick="Utils.closeModal()" class="btn btn-cancel">
                    Annuler
                </button>
            </div>
        `;

        Utils.openModal({
            title: 'Ajouter une Performance',
            subtitle: 'Sélectionnez un adhérent',
            content,
            size: 'large',
            draggable: true
        });
    },

    /**
     * Filtrer la liste des adhérents dans le sélecteur
     * @param searchTerm
     */
    filterMemberSelector(searchTerm) {
        const term = searchTerm.toLowerCase();
        const allItems = document.querySelectorAll('.member-selector-item');

        allItems.forEach(item => {
            const name = item.querySelector('.member-selector-name').textContent.toLowerCase();
            if (name.includes(term)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    },

    /**
     * Sélectionner un membre et ouvrir le formulaire de performance
     * @param memberId
     */
    selectMemberForPerformance(memberId) {
        Utils.closeModal();
        setTimeout(() => {
            this.addPerformance(memberId);
        }, 200);
    },

    async savePerformance(memberId) {
        try {
            const exEl = document.getElementById('perfExercise');
            const catEl = document.getElementById('perfCategory');
            const dateEl = document.getElementById('perfDate');
            const valEl = document.getElementById('perfValue');

            console.log('Elements:', { exEl, catEl, dateEl, valEl });

            const ex = (exEl?.value || '').toString().trim();
            const cat = (catEl?.value || '').toString().trim();
            const date = (dateEl?.value || new Date().toISOString().slice(0, 10)).toString();
            const rawVal = (valEl?.value || '').toString().trim();

            console.log('Values:', { ex, cat, date, rawVal });

            if (!ex || !rawVal) {
                this.showNotification("Veuillez renseigner l'exercice et la valeur", 'error');
                return;
            }

            // Construire l'objet performance pour Supabase (camelCase pour SupabaseManager)
            let perfData = {
                memberId: memberId,
                exerciseType: ex,
                date: date,
                notes: cat || null
            };

            // Déterminer le type et l'unité selon l'exercice
            if (
                ex.includes('Run') ||
                ex.includes('Skierg') ||
                ex.includes('Rameur') ||
                ex.includes('Bikerg')
            ) {
                const seconds = this.parseTimeToSeconds(rawVal);
                perfData.value = seconds; // Stocker en secondes
                perfData.unit = 'sec';
            } else if (
                ex.toLowerCase().includes('burpees') ||
                (ex.toLowerCase().includes('max') &&
                    (ex.toLowerCase().includes('pull') ||
                        ex.toLowerCase().includes('toes') ||
                        ex.toLowerCase().includes('dips') ||
                        ex.toLowerCase().includes('push')))
            ) {
                perfData.value = parseInt(rawVal);
                perfData.unit = 'reps';
            } else if (ex.toLowerCase().includes('pic watts')) {
                perfData.value = parseFloat(rawVal);
                perfData.unit = 'W';
            } else if (ex.toLowerCase().includes('broad jump')) {
                perfData.value = parseFloat(rawVal);
                perfData.unit = 'cm';
            } else {
                // Force / poids
                perfData.value = parseFloat(rawVal);
                perfData.unit = 'kg';
            }

            // Créer dans Supabase
            await SupabaseManager.createPerformance(perfData);

            Utils.closeModal();
            this.showNotification('Performance ajoutée', 'success');

            // Si sur la fiche, rafraîchir pour voir le niveau et la liste
            if (
                this.state.currentView === 'profile' &&
                this.state.currentMember &&
                this.state.currentMember.id === memberId
            ) {
                await this.showMemberProfile(memberId);
            } else {
                await this.showMembersView();
            }
        } catch (e) {
            console.error(e);
            this.showNotification("Erreur lors de l'ajout de performance", 'error');
        }
    },

    // Convertir un temps mm:ss en secondes
    parseTimeToSeconds(timeStr) {
        if (!timeStr) {
            return null;
        }
        const parts = timeStr.split(':');
        if (parts.length === 2) {
            return parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
        return parseInt(timeStr); // Si c'est déjà en secondes
    },

    // Calculer l'âge depuis une date de naissance
    calculateAge(birthdate) {
        if (!birthdate) {
            return null;
        }
        const today = new Date();
        const birth = new Date(birthdate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    },

    /**
     * Exporter la base de données en JSON
     */
    async exportDatabaseJSON() {
        try {
            const allMembers = await SupabaseManager.getMembers();
            const allPerformances = await SupabaseManager.getPerformances();

            if (allMembers.length === 0) {
                this.showNotification('Aucun adhérent à exporter', 'warning');
                return;
            }

            // Attacher les performances à chaque membre pour l'export
            const membersWithPerfs = allMembers.map(member => ({
                ...member,
                performances: allPerformances.filter(p => p.member_id === member.id)
            }));

            // Créer l'objet d'export avec tous les adhérents
            const membersObject = {};
            membersWithPerfs.forEach(member => {
                membersObject[member.id] = member;
            });

            // Créer l'export complet avec métadonnées
            const exportData = {
                version: '2.2',
                exportDate: new Date().toISOString(),
                appName: 'Skali Prog',
                exportType: 'members',
                metadata: {
                    totalMembers: allMembers.length,
                    membersWithPerformances: allMembers.filter(m => this.getPerformanceCount(m) > 0)
                        .length,
                    membersWithoutPerformances: allMembers.filter(
                        m => this.getPerformanceCount(m) === 0
                    ).length,
                    exportedBy: 'MemberManager'
                },
                members: membersObject
            };

            // Générer le nom du fichier avec la date
            const date = new Date();
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const timeStr = `${String(date.getHours()).padStart(2, '0')}h${String(date.getMinutes()).padStart(2, '0')}`;
            const filename = `skaliprog-adherents-${dateStr}-${timeStr}.json`;

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
            console.log("📊 Nombre d'adhérents exportés:", allMembers.length);

            this.showNotification(
                `${allMembers.length} adhérent(s) exporté(s) avec succès`,
                'success'
            );
        } catch (error) {
            console.error("❌ Erreur lors de l'export JSON:", error);
            this.showNotification("Erreur lors de l'export: " + error.message, 'error');
        }
    },

    /**
     * Charger et afficher les plans nutrition
     * @param memberId
     * @param containerId
     */
    async loadAndRenderNutritionPlans(memberId, containerId) {
        try {
            const plans = await this.loadNutritionPlans(memberId);
            const container = document.getElementById(containerId);

            if (!container) {
                return;
            }

            if (plans.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">🍎</div>
                        <h4>Aucun plan nutrition</h4>
                        <p>Uploadez un PDF ci-dessus pour commencer</p>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="pdf-table-wrapper">
                        <table class="pdf-table">
                            <thead>
                                <tr>
                                    <th>PDF</th>
                                    <th>Titre</th>
                                    <th>Date de création</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${plans
                                    .map(
                                        plan => `
                                    <tr>
                                        <td><div class="pdf-icon">📄</div></td>
                                        <td><div class="pdf-title">${plan.title || plan.filename || 'Plan Nutrition'}</div></td>
                                        <td>
                                            <div class="pdf-meta-item">
                                                <i class="fas fa-calendar"></i>
                                                ${this.formatDateFull(plan.created_at)}
                                            </div>
                                        </td>
                                        <td>
                                            <div class="pdf-actions">
                                                ${
                                                    plan.file_path
                                                        ? `
                                                    <a href="${plan.file_path}" target="_blank" class="btn btn-sm btn-primary" title="Ouvrir le PDF">
                                                        <i class="fas fa-download"></i>
                                                    </a>
                                                `
                                                        : ''
                                                }
                                                <button onclick="MemberManager.deleteNutritionPlan('${plan.id}')"
                                                        class="btn btn-sm btn-danger">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `
                                    )
                                    .join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Erreur chargement plans nutrition:', error);
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '<div class="error-state">Erreur de chargement</div>';
            }
        }
    },

    /**
     * Charger et afficher les programmes
     * @param memberId
     * @param containerId
     */
    async loadAndRenderPrograms(memberId, containerId) {
        try {
            const programs = await this.loadPrograms(memberId);
            const container = document.getElementById(containerId);

            if (!container) {
                return;
            }

            if (programs.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">🏋️</div>
                        <h4>Aucun programme</h4>
                        <p>Uploadez un PDF ci-dessus pour commencer</p>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="pdf-table-wrapper">
                        <table class="pdf-table">
                            <thead>
                                <tr>
                                    <th>PDF</th>
                                    <th>Titre</th>
                                    <th>Durée</th>
                                    <th>Fréquence</th>
                                    <th>Date de création</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${programs
                                    .map(
                                        prog => `
                                    <tr>
                                        <td><div class="pdf-icon">📄</div></td>
                                        <td><div class="pdf-title">${prog.title || 'Programme'}</div></td>
                                        <td>
                                            ${
                                                prog.duration_weeks
                                                    ? `
                                                <div class="pdf-meta-item">
                                                    <i class="fas fa-calendar-week"></i>
                                                    ${prog.duration_weeks} sem
                                                </div>
                                            `
                                                    : '--'
                                            }
                                        </td>
                                        <td>
                                            ${
                                                prog.frequency
                                                    ? `
                                                <div class="pdf-meta-item">
                                                    <i class="fas fa-sync"></i>
                                                    ${prog.frequency}x/sem
                                                </div>
                                            `
                                                    : '--'
                                            }
                                        </td>
                                        <td>
                                            <div class="pdf-meta-item">
                                                <i class="fas fa-calendar"></i>
                                                ${this.formatDateFull(prog.created_at)}
                                            </div>
                                        </td>
                                        <td>
                                            <div class="pdf-actions">
                                                ${
                                                    prog.pdf_url
                                                        ? `
                                                    <a href="${prog.pdf_url}" target="_blank" class="btn btn-sm btn-primary" title="Ouvrir le PDF">
                                                        <i class="fas fa-download"></i>
                                                    </a>
                                                `
                                                        : ''
                                                }
                                                <button onclick="MemberManager.deleteProgram('${prog.id}')"
                                                        class="btn btn-sm btn-danger">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `
                                    )
                                    .join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Erreur chargement programmes:', error);
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '<div class="error-state">Erreur de chargement</div>';
            }
        }
    },

    /**
     * Charger plans nutrition
     * @param memberId
     */
    async loadNutritionPlans(memberId) {
        try {
            // Utiliser le VRAI nom de table: member_nutrition_pdfs
            const { data, error } = await window.SupabaseManager.supabase
                .from('member_nutrition_pdfs')
                .select('*')
                .eq('member_id', memberId)
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }
            return data || [];
        } catch (error) {
            console.error('❌ Erreur chargement plans nutrition:', error);
            return [];
        }
    },

    /**
     * Charger programmes
     * @param memberId
     */
    async loadPrograms(memberId) {
        try {
            const { data, error } = await window.SupabaseManager.supabase
                .from('training_programs')
                .select('*')
                .eq('member_id', memberId)
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }
            return data || [];
        } catch (error) {
            console.error('❌ Erreur chargement programmes:', error);
            return [];
        }
    },

    /**
     * Gérer l'upload de PDF Nutrition
     * @param event
     * @param memberId
     */
    async handleNutritionPdfUpload(event, memberId) {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        if (file.type !== 'application/pdf') {
            this.showNotification('Veuillez sélectionner un fichier PDF', 'error');
            return;
        }

        try {
            this.showNotification('Upload en cours...', 'info');

            // Upload vers Supabase Storage
            const pdfUrl = await window.SupabaseManager.uploadNutritionPDF(memberId, file);

            // Créer l'entrée dans la table nutrition_plans avec les bons champs SQL
            const planData = {
                member_id: memberId,
                filename: file.name,
                file_path: pdfUrl, // file_path au lieu de pdf_url selon le SQL
                file_size: file.size,
                title: file.name.replace('.pdf', ''),
                created_at: new Date().toISOString()
            };

            // Créer l'entrée via SupabaseManager
            const data = await window.SupabaseManager.createNutritionPlan(planData);

            if (!data) {
                throw new Error('Erreur lors de la création du plan');
            }

            this.showNotification('PDF ajouté avec succès', 'success');

            // Reset input et recharger
            event.target.value = '';
            this.state.activeTab = 'nutrition';
            this.showMemberProfile(memberId);
        } catch (error) {
            console.error('❌ Erreur upload:', error);
            this.showNotification(
                "Erreur lors de l'upload: " + (error.message || 'Erreur inconnue'),
                'error'
            );
        }
    },

    /**
     * Gérer l'upload de PDF Programme
     * @param event
     * @param memberId
     */
    async handleProgramPdfUpload(event, memberId) {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        if (file.type !== 'application/pdf') {
            this.showNotification('Veuillez sélectionner un fichier PDF', 'error');
            return;
        }

        try {
            this.showNotification('Upload en cours...', 'info');

            // Upload vers Supabase Storage
            const pdfUrl = await window.SupabaseManager.uploadProgramPDF(memberId, file);

            // Calculer end_date (start_date + 4 semaines)
            const startDate = new Date();
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 4 * 7); // 4 semaines = 28 jours

            // Créer l'entrée dans Supabase avec TOUS les champs requis (NOT NULL)
            const { data, error } = await window.SupabaseManager.supabase
                .from('training_programs')
                .insert({
                    member_id: memberId,
                    title: file.name.replace('.pdf', ''),
                    pdf_url: pdfUrl,

                    // Champs obligatoires (NOT NULL)
                    duration_weeks: 4,
                    frequency: 3,
                    start_date: startDate.toISOString().split('T')[0],
                    end_date: endDate.toISOString().split('T')[0],
                    objective_primary: 'Programme personnalisé',
                    session_duration: 60, // minutes
                    level: 'intermediate',
                    program_structure: {} // JSONB vide pour un PDF uploadé manuellement
                })
                .select();

            if (error) {
                console.error('Erreur Supabase:', error);
                throw error;
            }

            this.showNotification('PDF ajouté avec succès', 'success');

            // Reset input et recharger
            event.target.value = '';
            this.state.activeTab = 'prog';
            this.showMemberProfile(memberId);
        } catch (error) {
            console.error('❌ Erreur upload:', error);
            this.showNotification(
                "Erreur lors de l'upload: " + (error.message || 'Erreur inconnue'),
                'error'
            );
        }
    },

    /**
     * Convertir fichier en base64
     * @param file
     */
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    /**
     * Supprimer plan nutrition
     * @param planId
     */
    async deleteNutritionPlan(planId) {
        if (!confirm('Supprimer ce plan nutrition ?')) {
            return;
        }

        try {
            // Utiliser le VRAI nom de table: member_nutrition_pdfs
            const { error } = await window.SupabaseManager.supabase
                .from('member_nutrition_pdfs')
                .delete()
                .eq('id', planId);

            if (error) {
                throw error;
            }

            // Recharger profil
            this.state.activeTab = 'nutrition';
            this.showMemberProfile(this.state.currentMember.id);
            this.showNotification('Plan nutrition supprimé', 'success');
        } catch (error) {
            console.error('❌ Erreur suppression:', error);
            this.showNotification('Erreur lors de la suppression', 'error');
        }
    },

    /**
     * Supprimer programme
     * @param programId
     */
    async deleteProgram(programId) {
        if (!confirm('Supprimer ce programme ?')) {
            return;
        }

        try {
            const { error } = await window.SupabaseManager.supabase
                .from('training_programs')
                .delete()
                .eq('id', programId);

            if (error) {
                throw error;
            }

            // Recharger profil
            this.state.activeTab = 'prog';
            this.showMemberProfile(this.state.currentMember.id);
            this.showNotification('Programme supprimé', 'success');
        } catch (error) {
            console.error('❌ Erreur suppression:', error);
            this.showNotification('Erreur lors de la suppression', 'error');
        }
    },

    /**
     * Formater date complète
     * @param dateString
     */
    formatDateFull(dateString) {
        if (!dateString) {
            return 'N/A';
        }
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    },

    /**
     * Afficher la vue des membres inactifs
     */
    async showInactiveMembersView() {
        try {
            // Récupérer tous les membres inactifs
            const { data: inactiveMembers, error } = await SupabaseManager.supabase
                .from('members')
                .select('*')
                .eq('is_active', false)
                .order('name');

            if (error) {
                throw error;
            }

            console.log('⏸️ Membres inactifs trouvés:', inactiveMembers.length);

            // Afficher dans mainContent
            const html = `
                <div class="members-table-container">
                    <!-- Header -->
                    <div class="members-table-header">
                        <div class="members-table-title">
                            <i class="fas fa-user-slash"></i>
                            <h1>Membres Inactifs</h1>
                            <span class="members-count">${inactiveMembers.length}</span>
                        </div>
                        <div class="members-table-actions">
                            <button onclick="MemberManager.show()" class="btn-back">
                                <i class="fas fa-arrow-left"></i>
                                <span>Retour</span>
                            </button>
                        </div>
                    </div>

                    <!-- Tableau -->
                    <div class="members-table-wrapper">
                        <table class="members-table">
                            <thead>
                                <tr>
                                    <th>Nom Complet</th>
                                    <th>Email</th>
                                    <th>Téléphone</th>
                                    <th class="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${
                                    inactiveMembers.length === 0
                                        ? `
                                    <tr>
                                        <td colspan="4" class="text-center text-gray-400 py-8">
                                            Aucun membre inactif
                                        </td>
                                    </tr>
                                `
                                        : inactiveMembers
                                              .map(
                                                  member => `
                                    <tr class="member-row cursor-pointer">
                                        <td>${member.name || '-'}</td>
                                        <td>${member.email || '-'}</td>
                                        <td>${member.phone || '-'}</td>
                                        <td class="text-center">
                                            <button onclick="MemberManager.reactivateMember('${member.id}')"
                                                    class="btn-action btn-success"
                                                    title="Réactiver">
                                                <i class="fas fa-redo"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `
                                              )
                                              .join('')
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            document.getElementById('mainContent').innerHTML = html;
        } catch (error) {
            console.error('❌ Erreur chargement membres inactifs:', error);
            Utils.showNotification('Erreur lors du chargement', 'error');
        }
    },

    /**
     * Réactiver un membre inactif
     * @param memberId
     */
    async reactivateMember(memberId) {
        try {
            await SupabaseManager.updateMember(memberId, { is_active: true });
            Utils.showNotification('Membre réactivé avec succès !', 'success');

            // Recharger la vue des inactifs
            this.showInactiveMembersView();
        } catch (error) {
            console.error('❌ Erreur réactivation:', error);
            Utils.showNotification('Erreur lors de la réactivation', 'error');
        }
    }
};

// Exposer globalement
window.MemberManager = MemberManager;
