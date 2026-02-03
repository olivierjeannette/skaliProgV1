/**
 * ===================================================================
 * POKEMON CARDS MODULE - VERSION COMPLÈTE & FINALISÉE
 * ===================================================================
 *
 * Système complet de cartes Pokémon pour adhérents avec:
 * - Génération automatique basée sur performances
 * - Système de niveau et XP (1-100)
 * - Calcul intelligent des stats (ATK/DEF/SPD/END/TEC)
 * - Types Pokémon selon discipline dominante
 * - Génération d'attaques personnalisées
 * - Export image haute qualité (HTML to Canvas to PNG)
 * - Galerie avec filtres avancés
 * - Système d'évolution avec historique
 * - Leaderboard compétitif
 * - Intégration Supabase complète
 *
 * ===================================================================
 */

const PokemonCards = {
    // ===================================================================
    // DONNÉES & CACHE
    // ===================================================================
    members: [],
    performances: [],
    pokemonCards: new Map(), // Cache des cartes générées
    currentFilter: { type: 'all', level: 'all', search: '' },
    currentSort: 'name', // 'name', 'level', 'recent'
    currentPreviewCard: null,
    usedPokemon: new Set(), // Pokémon déjà attribués pour éviter doublons

    // ===================================================================
    // SYSTÈME D'ÉVOLUTION PAR PALIERS
    // ===================================================================
    evolutionStages: {
        rookie: { minLevel: 1, maxLevel: 20, tier: 'Débutant', rarity: 'Commun' },
        intermediate: { minLevel: 21, maxLevel: 40, tier: 'Intermédiaire', rarity: 'Peu Commun' },
        advanced: { minLevel: 41, maxLevel: 60, tier: 'Avancé', rarity: 'Rare' },
        elite: { minLevel: 61, maxLevel: 80, tier: 'Élite', rarity: 'Épique' },
        master: { minLevel: 81, maxLevel: 100, tier: 'Maître', rarity: 'Légendaire' }
    },

    // Pokémon Gen 1 - Classés selon tiers compétitifs Smogon
    // NU (NeverUsed) → UU (UnderUsed) → OU (OverUsed) → Ubers (Légendaires)
    pokemonNames: {
        fighting: {
            // Niveau 1-20: NU tier + évolutions de base (Pokémon faibles)
            rookie: [
                { name: 'Machoc', id: 66 },
                { name: 'Férosinge', id: 56 },
                { name: 'Sabelette', id: 27 },
                { name: 'Taupiqueur', id: 50 },
                { name: 'Racaillou', id: 74 },
                { name: 'Ptitard', id: 60 },
                { name: 'Kokiyas', id: 90 },
                { name: 'Krabby', id: 98 },
                { name: 'Osselait', id: 104 }
            ],
            // Niveau 21-40: UU tier bas (Pokémon moyens)
            intermediate: [
                { name: 'Machopeur', id: 67 },
                { name: 'Colossinge', id: 57 },
                { name: 'Sablaireau', id: 28 },
                { name: 'Triopikeur', id: 51 },
                { name: 'Gravalanch', id: 75 },
                { name: 'Têtarte', id: 61 },
                { name: 'Crustabri', id: 91 },
                { name: 'Krabboss', id: 99 },
                { name: 'Ossatueur', id: 105 }
            ],
            // Niveau 41-60: UU tier haut (Pokémon forts)
            advanced: [
                { name: 'Mackogneur', id: 68 },
                { name: 'Kicklee', id: 106 },
                { name: 'Tygnon', id: 107 },
                { name: 'Grolem', id: 76 },
                { name: 'Onix', id: 95 },
                { name: 'Tartard', id: 62 }
            ],
            // Niveau 61-80: OU tier (Pokémon très forts)
            elite: [
                { name: 'Rhinoféros', id: 112 },
                { name: 'Ectoplasma', id: 94 },
                { name: 'Lokhlass', id: 131 },
                { name: 'Ronflex', id: 143 }
            ],
            // Niveau 81-100: Ubers (Légendaires uniquement)
            master: [
                { name: 'Mewtwo', id: 150 },
                { name: 'Mew', id: 151 }
            ]
        },
        flying: {
            rookie: [
                { name: 'Roucool', id: 16 },
                { name: 'Piafabec', id: 21 },
                { name: 'Nosferapti', id: 41 },
                { name: 'Chenipan', id: 10 },
                { name: 'Aspicot', id: 13 },
                { name: 'Doduo', id: 84 }
            ],
            intermediate: [
                { name: 'Roucoups', id: 17 },
                { name: 'Rapasdepic', id: 22 },
                { name: 'Nosferalto', id: 42 },
                { name: 'Chrysacier', id: 11 },
                { name: 'Coconfort', id: 14 },
                { name: 'Dodrio', id: 85 }
            ],
            advanced: [
                { name: 'Roucarnage', id: 18 },
                { name: 'Papilusion', id: 12 },
                { name: 'Dardargnan', id: 15 },
                { name: 'Insécateur', id: 123 },
                { name: 'Minidraco', id: 147 }
            ],
            elite: [
                { name: 'Ptéra', id: 142 },
                { name: 'Dracolosse', id: 149 },
                { name: 'Draco', id: 148 }
            ],
            master: [
                { name: 'Artikodin', id: 144 },
                { name: 'Électhor', id: 145 },
                { name: 'Sulfura', id: 146 }
            ]
        },
        electric: {
            rookie: [
                { name: 'Magnéti', id: 81 },
                { name: 'Voltorbe', id: 100 },
                { name: 'Pikachu', id: 25 }
            ],
            intermediate: [
                { name: 'Magnéton', id: 82 },
                { name: 'Électrode', id: 101 },
                { name: 'Raichu', id: 26 },
                { name: 'Élektek', id: 125 }
            ],
            advanced: [{ name: 'Voltali', id: 135 }],
            elite: [{ name: 'Électhor', id: 145 }],
            master: [{ name: 'Zapdos', id: 145 }]
        },
        fire: {
            rookie: [
                { name: 'Salamèche', id: 4 },
                { name: 'Goupix', id: 37 },
                { name: 'Caninos', id: 58 },
                { name: 'Ponyta', id: 77 }
            ],
            intermediate: [
                { name: 'Reptincel', id: 5 },
                { name: 'Galopa', id: 78 },
                { name: 'Feunard', id: 38 }
            ],
            advanced: [
                { name: 'Dracaufeu', id: 6 },
                { name: 'Arcanin', id: 59 },
                { name: 'Pyroli', id: 136 },
                { name: 'Magmar', id: 126 }
            ],
            elite: [{ name: 'Sulfura', id: 146 }],
            master: [{ name: 'Sulfura', id: 146 }]
        },
        psychic: {
            rookie: [
                { name: 'Abra', id: 63 },
                { name: 'Soporifik', id: 96 },
                { name: 'Ramoloss', id: 79 },
                { name: 'Mystherbe', id: 43 },
                { name: 'Chetiflor', id: 69 },
                { name: 'Fantominus', id: 92 }
            ],
            intermediate: [
                { name: 'Kadabra', id: 64 },
                { name: 'Hypnomade', id: 97 },
                { name: 'Flagadoss', id: 80 },
                { name: 'Ortide', id: 44 },
                { name: 'Boustiflor', id: 70 },
                { name: 'Spectrum', id: 93 }
            ],
            advanced: [
                { name: 'Alakazam', id: 65 },
                { name: 'Noadkoko', id: 103 },
                { name: 'Rafflesia', id: 45 },
                { name: 'Empiflor', id: 71 },
                { name: 'Ectoplasma', id: 94 }
            ],
            elite: [
                { name: 'Staross', id: 121 },
                { name: 'Lippoutou', id: 124 },
                { name: 'Noadkoko', id: 103 },
                { name: 'Leveinard', id: 113 }
            ],
            master: [
                { name: 'Mewtwo', id: 150 },
                { name: 'Mew', id: 151 }
            ]
        },
        normal: {
            rookie: [
                { name: 'Rattata', id: 19 },
                { name: 'Roucool', id: 16 },
                { name: 'Nidoran♀', id: 29 },
                { name: 'Nidoran♂', id: 32 },
                { name: 'Mélofée', id: 35 },
                { name: 'Évoli', id: 133 },
                { name: 'Miaouss', id: 52 },
                { name: 'Psykokwak', id: 54 },
                { name: 'Otaria', id: 86 }
            ],
            intermediate: [
                { name: 'Rattatac', id: 20 },
                { name: 'Nidorina', id: 30 },
                { name: 'Nidorino', id: 33 },
                { name: 'Mélodelfe', id: 36 },
                { name: 'Persian', id: 53 },
                { name: 'Akwakwak', id: 55 },
                { name: 'Lamantine', id: 87 },
                { name: 'Excelangue', id: 108 }
            ],
            advanced: [
                { name: 'Nidoqueen', id: 31 },
                { name: 'Nidoking', id: 34 },
                { name: 'Kangourex', id: 115 },
                { name: 'Porygon', id: 137 },
                { name: 'Lokhlass', id: 131 },
                { name: 'Léviator', id: 130 }
            ],
            elite: [
                { name: 'Tauros', id: 128 },
                { name: 'Ronflex', id: 143 },
                { name: 'Leveinard', id: 113 },
                { name: 'Staross', id: 121 }
            ],
            master: [
                { name: 'Mewtwo', id: 150 },
                { name: 'Mew', id: 151 },
                { name: 'Dracolosse', id: 149 }
            ]
        }
    },

    // ===================================================================
    // CONFIGURATION DES TYPES POKÉMON
    // ===================================================================
    pokemonTypes: {
        fighting: {
            name: 'Combat',
            icon: '🥊',
            color: '#C03028',
            gradient: 'linear-gradient(135deg, #C03028 0%, #F08030 100%)',
            description: 'Spécialiste en force et musculation'
        },
        flying: {
            name: 'Vol',
            icon: '🦅',
            color: '#A890F0',
            gradient: 'linear-gradient(135deg, #A890F0 0%, #6D5CAE 100%)',
            description: 'Expert en endurance et cardio'
        },
        electric: {
            name: 'Électrik',
            icon: '⚡',
            color: '#F8D030',
            gradient: 'linear-gradient(135deg, #F8D030 0%, #F0C108 100%)',
            description: 'Maître de la vitesse et explosivité'
        },
        fire: {
            name: 'Feu',
            icon: '🔥',
            color: '#F08030',
            gradient: 'linear-gradient(135deg, #F08030 0%, #C03028 100%)',
            description: 'Champion de puissance et ballistic'
        },
        normal: {
            name: 'Normal',
            icon: '⭐',
            color: '#A8A878',
            gradient: 'linear-gradient(135deg, #A8A878 0%, #6D6D4E 100%)',
            description: 'Athlète équilibré et polyvalent'
        },
        psychic: {
            name: 'Psy',
            icon: '🧠',
            color: '#F85888',
            gradient: 'linear-gradient(135deg, #F85888 0%, #A13959 100%)',
            description: 'Technicien et tacticien'
        }
    },

    // ===================================================================
    // CONFIGURATION DES ATTAQUES
    // ===================================================================
    attackTemplates: {
        atk: [
            { name: 'Power Lift', base: 1.8, cost: 3, desc: 'Soulève des charges titanesques' },
            { name: 'Iron Grip', base: 2.0, cost: 4, desc: 'Prise de fer destructrice' },
            { name: 'Muscle Slam', base: 2.2, cost: 4, desc: 'Frappe de masse pure' },
            { name: 'Heavy Strike', base: 1.6, cost: 3, desc: 'Coup lourd et puissant' }
        ],
        def: [
            { name: 'Endurance Wall', base: 1.5, cost: 2, desc: 'Mur défensif infranchissable' },
            { name: 'Core Shield', base: 1.4, cost: 2, desc: 'Bouclier de gainage' },
            { name: 'Steel Body', base: 1.6, cost: 3, desc: "Corps d'acier résistant" },
            { name: 'Fortress Mode', base: 1.7, cost: 3, desc: 'Mode forteresse activé' }
        ],
        spd: [
            { name: 'Lightning Sprint', base: 2.1, cost: 4, desc: 'Sprint foudroyant' },
            { name: 'Quick Strike', base: 1.9, cost: 3, desc: 'Frappe éclair' },
            { name: 'Agility Burst', base: 2.0, cost: 4, desc: 'Explosion de vitesse' },
            { name: 'Speed Demon', base: 1.8, cost: 3, desc: 'Démon de rapidité' }
        ],
        end: [
            { name: 'Marathon Force', base: 1.7, cost: 3, desc: "Force d'endurance infinie" },
            { name: 'Aerobic Blast', base: 1.8, cost: 3, desc: 'Souffle aérobique' },
            { name: 'Stamina Wave', base: 1.6, cost: 2, desc: "Vague d'endurance" },
            { name: 'Cardio Storm', base: 1.9, cost: 4, desc: 'Tempête cardiovasculaire' }
        ],
        tec: [
            { name: 'Perfect Form', base: 2.0, cost: 4, desc: 'Exécution technique parfaite' },
            { name: 'Skill Master', base: 2.2, cost: 4, desc: 'Maîtrise technique absolue' },
            { name: 'Precision Hit', base: 1.9, cost: 3, desc: 'Frappe de précision' },
            { name: 'Tech Combo', base: 2.1, cost: 4, desc: 'Combo technique dévastateur' }
        ]
    },

    // ===================================================================
    // BADGES D'ÉVOLUTION
    // ===================================================================
    evolutionBadges: {
        1: { name: 'Rookie', icon: '🌱', color: '#10b981' },
        10: { name: 'Apprentice', icon: '🔰', color: '#3b82f6' },
        25: { name: 'Athlete', icon: '💪', color: '#8b5cf6' },
        50: { name: 'Champion', icon: '🏆', color: '#f59e0b' },
        75: { name: 'Master', icon: '👑', color: '#ef4444' },
        100: { name: 'Legend', icon: '⭐', color: '#fbbf24' }
    },

    // ===================================================================
    // VUE PRINCIPALE
    // ===================================================================
    // Alias pour compatibilité
    async showPokemonView() {
        return this.showPokemonCardsView();
    },

    async showPokemonCardsView() {
        try {
            console.log('🎴 Ouverture module Cartes Pokémon COMPLÈTE...');

            await this.loadData();
            await this.generateAllCards();

            const html = `
                <div class="pokemon-cards-container">
                    <!-- Header avec stats globales -->
                    <div class="pokemon-header">
                        <div class="header-title">
                            <h2>
                                <i class="fas fa-id-card text-yellow-400 mr-3"></i>
                                Vitrine Pokémon - Athlètes Skali
                            </h2>
                            <p class="text-gray-400 mt-2">
                                Collection de ${this.pokemonCards.size} cartes d'athlètes • Mise à jour en temps réel
                            </p>
                        </div>
                        <div class="header-actions">
                            <button onclick="PokemonCards.refreshAllCards()" class="btn-refresh">
                                <i class="fas fa-sync-alt mr-2"></i>
                                Actualiser
                            </button>
                        </div>
                    </div>

                    <!-- Barre de recherche et filtres -->
                    <div class="search-card">
                        <div class="search-bar">
                            <i class="fas fa-search"></i>
                            <input type="text"
                                   id="cardSearch"
                                   placeholder="Rechercher un adhérent..."
                                   oninput="PokemonCards.handleSearch(this.value)">
                        </div>

                        <!-- Filtres par type -->
                        <div class="filter-section">
                            <label class="filter-label">Type:</label>
                            <div class="filter-options">
                                <button onclick="PokemonCards.filterByType('all')" class="filter-btn active" data-type="all">
                                    Tous
                                </button>
                                ${Object.entries(this.pokemonTypes)
                                    .map(
                                        ([key, type]) => `
                                    <button onclick="PokemonCards.filterByType('${key}')" class="filter-btn" data-type="${key}">
                                        ${type.icon} ${type.name}
                                    </button>
                                `
                                    )
                                    .join('')}
                            </div>
                        </div>

                        <!-- Filtres par niveau -->
                        <div class="filter-section">
                            <label class="filter-label">Niveau:</label>
                            <div class="filter-options">
                                <button onclick="PokemonCards.filterByLevel('all')" class="filter-btn active" data-level="all">
                                    Tous
                                </button>
                                <button onclick="PokemonCards.filterByLevel('1-20')" class="filter-btn" data-level="1-20">
                                    1-20
                                </button>
                                <button onclick="PokemonCards.filterByLevel('21-50')" class="filter-btn" data-level="21-50">
                                    21-50
                                </button>
                                <button onclick="PokemonCards.filterByLevel('51-75')" class="filter-btn" data-level="51-75">
                                    51-75
                                </button>
                                <button onclick="PokemonCards.filterByLevel('76-100')" class="filter-btn" data-level="76-100">
                                    76-100
                                </button>
                            </div>
                        </div>

                        <!-- Tri -->
                        <div class="filter-section">
                            <label class="filter-label">Trier par:</label>
                            <div class="filter-options">
                                <button onclick="PokemonCards.sortBy('name')" class="filter-btn active" data-sort="name">
                                    <i class="fas fa-sort-alpha-down mr-1"></i>
                                    Alphabétique
                                </button>
                                <button onclick="PokemonCards.sortBy('level')" class="filter-btn" data-sort="level">
                                    <i class="fas fa-sort-numeric-down mr-1"></i>
                                    Niveau
                                </button>
                                <button onclick="PokemonCards.sortBy('recent')" class="filter-btn" data-sort="recent">
                                    <i class="fas fa-clock mr-1"></i>
                                    Récent
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Galerie de cartes -->
                    <div class="cards-gallery" id="cardsGallery">
                        ${this.renderCardsGallery()}
                    </div>

                    <!-- Modal de prévisualisation détaillée -->
                    ${this.renderPreviewModal()}
                </div>
            `;

            const mainContent = document.getElementById('mainContent');
            if (mainContent) {
                mainContent.innerHTML = html;
            }

            // Activer le bouton de navigation
            document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
            const pokemonBtn = document.getElementById('pokemonBtn');
            if (pokemonBtn) {
                pokemonBtn.classList.add('active');
            }

            console.log('✅ Module Cartes Pokémon chargé avec succès');
        } catch (error) {
            console.error('❌ Erreur affichage Cartes Pokémon:', error);
            Utils.showNotification('Erreur lors du chargement du module Cartes', 'error');
        }
    },

    // ===================================================================
    // CHARGEMENT DES DONNÉES
    // ===================================================================
    async loadData() {
        try {
            console.log('📊 Chargement des données...');
            [this.members, this.performances] = await Promise.all([
                SupabaseManager.getMembers(),
                SupabaseManager.getPerformances()
            ]);
            console.log(
                `✅ ${this.members.length} membres et ${this.performances.length} performances chargés`
            );
        } catch (error) {
            console.error('❌ Erreur chargement données:', error);
            this.members = [];
            this.performances = [];
        }
    },

    // ===================================================================
    // GÉNÉRATION AUTOMATIQUE DES CARTES
    // ===================================================================
    async generateAllCards() {
        console.log('🎴 Génération de toutes les cartes...');
        this.pokemonCards.clear();
        this.usedPokemon.clear(); // Reset des Pokémon utilisés

        for (const member of this.members) {
            const card = this.generateCard(member);
            this.pokemonCards.set(member.id, card);
        }

        console.log(`✅ ${this.pokemonCards.size} cartes générées`);
    },

    /**
     * Générer une carte pour un membre
     * @param member
     */
    generateCard(member) {
        const memberPerfs = this.performances.filter(p => p.member_id === member.id);

        // Calculs simplifiés - comparaison relative entre adhérents
        const stats = this.calculateStatsAdvanced(memberPerfs, member); // ATK, DEF, SPD relatifs
        const hp = this.calculateHP(stats, member); // HP = indice général
        const level = this.calculateLevelFromHP(hp); // Niveau basé sur le HP
        const type = this.determineType(stats, memberPerfs);

        // Nouveau : déterminer le palier et le Pokémon (sans doublon)
        const evolutionStage = this.getEvolutionStage(level);
        const pokemonData = this.getPokemonName(type, evolutionStage, member.id);
        const pokemonImage = this.generatePokemonImageURL(pokemonData.id, pokemonData.name);

        return {
            id: member.id,
            name: `${member.firstName} ${member.lastName}`,
            firstName: member.firstName,
            lastName: member.lastName,
            level,
            hp,
            stats,
            type,
            performanceCount: memberPerfs.length,
            createdAt: new Date(),
            avatar: member.avatar || null,
            // Nouveau système évolutif
            evolutionStage: evolutionStage,
            pokemonName: pokemonData.name,
            pokemonId: pokemonData.id,
            pokemonImage: pokemonImage,
            rarity: this.evolutionStages[evolutionStage].rarity
        };
    },

    // ===================================================================
    // DÉTERMINATION DU PALIER D'ÉVOLUTION
    // ===================================================================
    getEvolutionStage(level) {
        if (level >= 1 && level <= 20) {
            return 'rookie';
        }
        if (level >= 21 && level <= 40) {
            return 'intermediate';
        }
        if (level >= 41 && level <= 60) {
            return 'advanced';
        }
        if (level >= 61 && level <= 80) {
            return 'elite';
        }
        return 'master'; // 81-100
    },

    // ===================================================================
    // SÉLECTION DU POKÉMON (Sans doublon) - Retourne {name, id}
    // ===================================================================
    getPokemonName(type, stage, memberId) {
        const defaultPokemon = { name: 'Évoli', id: 133 };

        // Vérifier que le type existe
        if (!this.pokemonNames[type]) {
            type = 'normal';
        }

        // Vérifier que le stage existe pour ce type
        const pokemons = this.pokemonNames[type]?.[stage];
        if (!pokemons || pokemons.length === 0) {
            const normalPokemons = this.pokemonNames.normal?.[stage];
            return normalPokemons?.[0] || defaultPokemon;
        }

        // Priorité 1: Pokémon non utilisés du même stage
        const availablePokemons = pokemons.filter(
            p => p && p.id && p.name && !this.usedPokemon.has(p.id)
        );

        if (availablePokemons.length > 0) {
            // Sélection aléatoire basée sur memberId pour cohérence
            const index = Math.abs(memberId?.charCodeAt?.(0) || 0) % availablePokemons.length;
            const selected = availablePokemons[index];
            this.usedPokemon.add(selected.id);
            return selected;
        }

        // Priorité 2: Pokémon non utilisés du MÊME stage ou stages inférieurs (jamais supérieurs!)
        // Pour éviter qu'un rookie obtienne un master
        const stageOrder = ['rookie', 'intermediate', 'advanced', 'elite', 'master'];
        const currentStageIndex = stageOrder.indexOf(stage);

        // Chercher dans le même stage et les stages inférieurs seulement
        for (let i = currentStageIndex; i >= 0; i--) {
            const stageToCheck = stageOrder[i];
            const stagePokemon = this.pokemonNames[type]?.[stageToCheck];
            if (stagePokemon) {
                const available = stagePokemon.filter(
                    p => p && p.id && !this.usedPokemon.has(p.id)
                );
                if (available.length > 0) {
                    const selected = available[0];
                    this.usedPokemon.add(selected.id);
                    return selected;
                }
            }
        }

        // Priorité 3: Autoriser doublons du MÊME stage uniquement (jamais de légendaires pour les rookies!)
        // Sélection aléatoire dans le stage approprié
        const index = Math.abs(memberId?.charCodeAt?.(0) || 0) % pokemons.length;
        return pokemons[index] || defaultPokemon;
    },

    // ===================================================================
    // GÉNÉRATION URL IMAGE POKÉMON (Sprites officiels)
    // ===================================================================
    generatePokemonImageURL(pokemonId, pokemonName) {
        // Utiliser plusieurs sources de sprites officiels avec fallback

        // 1. PokeAPI - Artwork officiel haute qualité
        const pokeApiUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;

        // 2. Fallback: Home sprites
        const homeUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemonId}.png`;

        // 3. Fallback: Dream World
        const dreamWorldUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemonId}.svg`;

        // Retourner l'artwork officiel (meilleure qualité)
        return pokeApiUrl;
    },

    // ===================================================================
    // CALCUL DU NIVEAU (Courbe logarithmique)
    // ===================================================================
    calculateLevel(performances) {
        const totalPerfs = performances.length;

        if (totalPerfs === 0) {
            return 1;
        }

        // Courbe logarithmique: level = floor(log10(perfs + 1) * 20) + 1
        // Plus de perfs = montée de niveau plus lente (réaliste)
        let level = Math.floor(Math.log10(totalPerfs + 1) * 20) + 1;

        // Ajustements selon les paliers
        if (totalPerfs <= 50) {
            level = Math.floor(totalPerfs / 5) + 1;
        } else if (totalPerfs <= 100) {
            level = 10 + Math.floor((totalPerfs - 50) / 5);
        } else if (totalPerfs <= 500) {
            level = 20 + Math.floor((totalPerfs - 100) / 10);
        } else {
            level = 60 + Math.floor(Math.log10(totalPerfs - 499) * 15);
        }

        return Math.min(100, Math.max(1, level));
    },

    // ===================================================================
    // CALCUL DE L'XP
    // ===================================================================
    calculateXP(performances, currentLevel) {
        const totalPerfs = performances.length;

        // XP nécessaire pour le niveau suivant (exponentiel)
        const xpForNextLevel = Math.pow(10, (currentLevel + 1) / 20);
        const xpForCurrentLevel = Math.pow(10, currentLevel / 20);

        const currentXP = totalPerfs;
        const xpProgress = currentXP - xpForCurrentLevel;
        const xpNeeded = xpForNextLevel - xpForCurrentLevel;

        return {
            current: Math.floor(xpProgress),
            toNext: Math.floor(xpNeeded),
            percentage: Math.min(100, (xpProgress / xpNeeded) * 100)
        };
    },

    // ===================================================================
    // CALCUL DES STATS RELATIF (Comparaison entre adhérents)
    // ===================================================================
    // ATK = Puissance (force/explosivité)
    // DEF = Gym & Musculation (volume, endurance musculaire)
    // SPD = Cardio (endurance cardiovasculaire)
    // ===================================================================
    calculateStatsAdvanced(performances, member) {
        if (performances.length === 0) {
            return { atk: 5, def: 5, spd: 5 };
        }

        // Calculer les meilleures performances brutes par catégorie pour CET adhérent
        const memberBests = this.getMemberBestPerformances(performances);

        // Obtenir les meilleures performances de TOUS les adhérents (références)
        const globalBests = this.getGlobalBestPerformances();

        // Calculer les scores relatifs (0-100) en comparant aux meilleurs adhérents
        const atk = this.calculateRelativeStat(memberBests.power, globalBests.power);
        const def = this.calculateRelativeStat(memberBests.gym, globalBests.gym);
        const spd = this.calculateRelativeStat(memberBests.cardio, globalBests.cardio);

        return {
            atk: Math.max(5, Math.min(100, atk)),
            def: Math.max(5, Math.min(100, def)),
            spd: Math.max(5, Math.min(100, spd))
        };
    },

    // ===================================================================
    // OBTENIR LES MEILLEURES PERFORMANCES D'UN ADHÉRENT PAR CATÉGORIE
    // ===================================================================
    getMemberBestPerformances(performances) {
        const bests = { power: 0, gym: 0, cardio: 0 };

        performances.forEach(perf => {
            const exercise = (perf.exercise_type || '').toLowerCase();
            const value = parseFloat(perf.value) || 0;

            // ATK = Puissance (force explosive, max lifts)
            if (
                exercise.includes('squat') ||
                exercise.includes('deadlift') ||
                exercise.includes('bench') ||
                exercise.includes('press') ||
                exercise.includes('clean') ||
                exercise.includes('snatch') ||
                exercise.includes('jerk')
            ) {
                bests.power = Math.max(bests.power, value);
            }

            // DEF = Gym & Musculation (TOUT exercice de musculation/force compte)
            if (
                exercise.includes('squat') ||
                exercise.includes('deadlift') ||
                exercise.includes('bench') ||
                exercise.includes('press') ||
                exercise.includes('pull') ||
                exercise.includes('push') ||
                exercise.includes('plank') ||
                exercise.includes('abs') ||
                exercise.includes('curl') ||
                exercise.includes('row') ||
                exercise.includes('dip') ||
                exercise.includes('chin') ||
                exercise.includes('lift') ||
                exercise.includes('clean') ||
                exercise.includes('snatch') ||
                exercise.includes('jerk') ||
                exercise.includes('lunge') ||
                exercise.includes('shoulder')
            ) {
                bests.gym = Math.max(bests.gym, value);
            }

            // SPD = Cardio (courses, vélo, natation)
            if (
                exercise.includes('run') ||
                exercise.includes('bike') ||
                exercise.includes('swim') ||
                exercise.includes('marathon') ||
                exercise.includes('km') ||
                exercise.includes('sprint') ||
                exercise.includes('row') ||
                exercise.includes('ski')
            ) {
                bests.cardio = Math.max(bests.cardio, value);
            }
        });

        return bests;
    },

    // ===================================================================
    // OBTENIR LES MEILLEURES PERFORMANCES GLOBALES (tous adhérents)
    // ===================================================================
    getGlobalBestPerformances() {
        const globalBests = { power: 0, gym: 0, cardio: 0 };

        this.performances.forEach(perf => {
            const exercise = (perf.exercise_type || '').toLowerCase();
            const value = parseFloat(perf.value) || 0;

            // ATK = Puissance (force explosive, max lifts)
            if (
                exercise.includes('squat') ||
                exercise.includes('deadlift') ||
                exercise.includes('bench') ||
                exercise.includes('press') ||
                exercise.includes('clean') ||
                exercise.includes('snatch') ||
                exercise.includes('jerk')
            ) {
                globalBests.power = Math.max(globalBests.power, value);
            }

            // DEF = Gym & Musculation (TOUT exercice de musculation/force compte)
            if (
                exercise.includes('squat') ||
                exercise.includes('deadlift') ||
                exercise.includes('bench') ||
                exercise.includes('press') ||
                exercise.includes('pull') ||
                exercise.includes('push') ||
                exercise.includes('plank') ||
                exercise.includes('abs') ||
                exercise.includes('curl') ||
                exercise.includes('row') ||
                exercise.includes('dip') ||
                exercise.includes('chin') ||
                exercise.includes('lift') ||
                exercise.includes('clean') ||
                exercise.includes('snatch') ||
                exercise.includes('jerk') ||
                exercise.includes('lunge') ||
                exercise.includes('shoulder')
            ) {
                globalBests.gym = Math.max(globalBests.gym, value);
            }

            // SPD = Cardio (courses, vélo, natation)
            if (
                exercise.includes('run') ||
                exercise.includes('bike') ||
                exercise.includes('swim') ||
                exercise.includes('marathon') ||
                exercise.includes('km') ||
                exercise.includes('sprint') ||
                exercise.includes('row') ||
                exercise.includes('ski')
            ) {
                globalBests.cardio = Math.max(globalBests.cardio, value);
            }
        });

        // Valeurs minimales pour éviter division par zéro
        return {
            power: Math.max(globalBests.power, 1),
            gym: Math.max(globalBests.gym, 1),
            cardio: Math.max(globalBests.cardio, 1)
        };
    },

    // ===================================================================
    // CALCULER UN STAT RELATIF (0-100) par rapport au meilleur
    // ===================================================================
    calculateRelativeStat(memberValue, globalBest) {
        if (memberValue === 0 || globalBest === 0) {
            return 5;
        }

        // Score relatif : (performance adhérent / meilleure performance globale) * 100
        const relativeScore = (memberValue / globalBest) * 100;

        return Math.round(relativeScore);
    },

    // ===================================================================
    // CALCUL DES STATS (ATK/DEF/SPD) 0-100 - MÉTHODE CLASSIQUE (FALLBACK)
    // ===================================================================
    calculateStats(performances) {
        if (performances.length === 0) {
            return { atk: 5, def: 5, spd: 5 };
        }

        // Analyse simplifiée des exercices
        const categories = {
            power: ['squat', 'deadlift', 'bench', 'press', 'clean', 'snatch'],
            gym: ['pull', 'push', 'plank', 'abs', 'curl', 'row', 'dip', 'chin'],
            cardio: ['run', 'bike', 'swim', 'marathon', 'km', 'sprint']
        };

        // Compter par catégorie
        const counts = { power: 0, gym: 0, cardio: 0 };

        performances.forEach(perf => {
            const exercise = (perf.exercise_type || '').toLowerCase();

            for (const [category, keywords] of Object.entries(categories)) {
                if (keywords.some(keyword => exercise.includes(keyword))) {
                    counts[category]++;
                }
            }
        });

        const totalPerfs = performances.length;

        return {
            atk: Math.max(5, Math.min(100, Math.floor((counts.power / totalPerfs) * 100))),
            def: Math.max(5, Math.min(100, Math.floor((counts.gym / totalPerfs) * 100))),
            spd: Math.max(5, Math.min(100, Math.floor((counts.cardio / totalPerfs) * 100)))
        };
    },

    // ===================================================================
    // DÉTERMINATION DU TYPE POKÉMON (simplifié)
    // ===================================================================
    determineType(stats, performances) {
        // Type basé sur la stat dominante
        const maxStat = Math.max(stats.atk, stats.def, stats.spd);

        // Analyser la discipline dominante
        const powerPerfs = performances.filter(p => {
            const ex = (p.exercise_type || '').toLowerCase();
            return (
                ex.includes('squat') ||
                ex.includes('deadlift') ||
                ex.includes('bench') ||
                ex.includes('press')
            );
        }).length;

        const gymPerfs = performances.filter(p => {
            const ex = (p.exercise_type || '').toLowerCase();
            return (
                ex.includes('pull') ||
                ex.includes('push') ||
                ex.includes('plank') ||
                ex.includes('abs')
            );
        }).length;

        const cardioPerfs = performances.filter(p => {
            const ex = (p.exercise_type || '').toLowerCase();
            return (
                ex.includes('run') ||
                ex.includes('bike') ||
                ex.includes('swim') ||
                ex.includes('marathon')
            );
        }).length;

        const totalPerfs = performances.length || 1;

        // Détermination du type selon la stat dominante et la discipline
        if (stats.atk === maxStat && powerPerfs / totalPerfs > 0.4) {
            return 'fighting'; // ATK dominant + beaucoup de force
        } else if (stats.spd === maxStat && cardioPerfs / totalPerfs > 0.4) {
            return 'electric'; // SPD dominant + beaucoup de cardio
        } else if (stats.atk === maxStat && maxStat > 70) {
            return 'fire'; // ATK très élevé
        } else if (stats.def === maxStat && gymPerfs / totalPerfs > 0.4) {
            return 'psychic'; // DEF dominant + beaucoup de gym
        } else if (stats.spd === maxStat) {
            return 'flying'; // SPD dominant
        } else {
            return 'normal'; // Équilibré
        }
    },

    // ===================================================================
    // GÉNÉRATION DES ATTAQUES (jusqu'à 4)
    // ===================================================================
    generateAttacks(performances, stats) {
        const attacks = [];

        // Identifier les stats dominantes
        const statPairs = [
            { key: 'atk', value: stats.atk },
            { key: 'def', value: stats.def },
            { key: 'spd', value: stats.spd },
            { key: 'end', value: stats.end },
            { key: 'tec', value: stats.tec }
        ].sort((a, b) => b.value - a.value);

        // Générer 4 attaques basées sur les 2 meilleures stats
        for (let i = 0; i < Math.min(4, statPairs.length); i++) {
            const statKey = statPairs[i].key;
            const statValue = statPairs[i].value;

            const templates = this.attackTemplates[statKey];
            if (templates && templates.length > 0) {
                const template = templates[i % templates.length];

                const power = Math.floor(statValue * template.base);

                attacks.push({
                    name: template.name,
                    power: Math.min(250, power),
                    cost: template.cost,
                    description: template.desc,
                    type: statKey
                });
            }
        }

        // Attaque signature (basée sur meilleur exercice)
        if (performances.length > 0) {
            const exerciseCounts = {};
            performances.forEach(p => {
                const ex = p.exercise_type || 'Unknown';
                exerciseCounts[ex] = (exerciseCounts[ex] || 0) + 1;
            });

            const bestExercise = Object.entries(exerciseCounts).sort((a, b) => b[1] - a[1])[0];

            if (bestExercise) {
                const [exName, count] = bestExercise;
                const maxStat = Math.max(stats.atk, stats.def, stats.spd, stats.end, stats.tec);

                attacks.unshift({
                    name: `${exName} Master`,
                    power: Math.floor(maxStat * 2.5),
                    cost: 5,
                    description: `Attaque signature basée sur ${count} exécutions`,
                    type: 'signature'
                });
            }
        }

        return attacks.slice(0, 4);
    },

    // ===================================================================
    // CALCUL DES HP (Indice général mondial)
    // ===================================================================
    calculateHP(stats, member) {
        // HP = Indice général = moyenne des 3 stats (ATK, DEF, SPD)
        // Représente le niveau de la personne dans le monde
        const generalIndex = Math.round((stats.atk + stats.def + stats.spd) / 3);
        return Math.min(100, Math.max(5, generalIndex));
    },

    // ===================================================================
    // CALCUL DU NIVEAU (basé sur le HP)
    // ===================================================================
    calculateLevelFromHP(hp) {
        // Le niveau correspond directement au HP (indice général)
        // HP 1-20 = Niveau 1-20 (Rookie)
        // HP 21-40 = Niveau 21-40 (Intermediate)
        // HP 41-60 = Niveau 41-60 (Advanced)
        // HP 61-80 = Niveau 61-80 (Elite)
        // HP 81-100 = Niveau 81-100 (Master)
        return hp;
    },

    // ===================================================================
    // OBTENIR LE BADGE
    // ===================================================================
    getBadge(level) {
        const badges = Object.keys(this.evolutionBadges)
            .map(Number)
            .sort((a, b) => b - a);

        for (const threshold of badges) {
            if (level >= threshold) {
                return this.evolutionBadges[threshold];
            }
        }

        return this.evolutionBadges[1];
    },

    // ===================================================================
    // RENDU DE LA GALERIE
    // ===================================================================
    renderCardsGallery() {
        if (this.pokemonCards.size === 0) {
            return `
                <div class="no-data">
                    <i class="fas fa-users text-6xl mb-4 text-gray-500"></i>
                    <p class="text-gray-400 text-lg">Aucune carte à afficher</p>
                    <button onclick="PokemonCards.refreshAllCards()" class="btn-refresh mt-4">
                        <i class="fas fa-sync-alt mr-2"></i>
                        Générer les cartes
                    </button>
                </div>
            `;
        }

        // Filtrer et trier les cartes
        const cards = Array.from(this.pokemonCards.values());
        const filtered = this.applyFilters(cards);
        const sorted = this.applySorting(filtered);

        return sorted.map(card => this.renderCardMini(card)).join('');
    },

    /**
     * Appliquer les filtres
     * @param cards
     */
    applyFilters(cards) {
        return cards.filter(card => {
            // Filtre par recherche
            if (this.currentFilter.search) {
                const search = this.currentFilter.search.toLowerCase();
                if (!card.name.toLowerCase().includes(search)) {
                    return false;
                }
            }

            // Filtre par type
            if (this.currentFilter.type !== 'all' && card.type !== this.currentFilter.type) {
                return false;
            }

            // Filtre par niveau
            if (this.currentFilter.level !== 'all') {
                const [min, max] = this.currentFilter.level.split('-').map(Number);
                if (card.level < min || card.level > max) {
                    return false;
                }
            }

            return true;
        });
    },

    /**
     * Appliquer le tri
     * @param cards
     */
    applySorting(cards) {
        return cards.sort((a, b) => {
            switch (this.currentSort) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'level':
                    return b.level - a.level;
                case 'recent':
                    // Tri par nombre de performances (plus récent = plus actif)
                    return b.performanceCount - a.performanceCount;
                default:
                    return a.name.localeCompare(b.name);
            }
        });
    },

    /**
     * Rendu d'une mini carte (galerie)
     * @param card
     */
    renderCardMini(card) {
        const typeData = this.pokemonTypes[card.type];

        return `
            <div class="pokemon-card"
                 data-type="${card.type}"
                 data-level="${card.level}"
                 onclick="PokemonCards.openPreview('${card.id}')"
                 style="background: ${typeData.gradient};">

                <div class="card-shine"></div>

                <div class="card-inner">
                    <!-- Header -->
                    <div class="card-header">
                        <div class="card-name">${card.firstName}</div>
                        <div class="card-hp">HP ${card.hp}</div>
                    </div>

                    <div class="card-level-badge">Niv. ${card.level}</div>

                    <!-- Image Pokémon officielle -->
                    <div class="card-image pokemon-image-container" style="background: ${typeData.gradient};">
                        <img src="${card.pokemonImage}"
                             alt="${card.pokemonName}"
                             class="pokemon-ai-image"
                             loading="lazy"
                             onerror="this.onerror=null; this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${card.pokemonId || 133}.png';">
                        <div class="type-icon">${typeData.icon}</div>
                        <div class="pokemon-name-badge">${card.pokemonName}</div>
                        <div class="rarity-badge rarity-${card.rarity.toLowerCase().replace(/\s+/g, '-')}">${card.rarity}</div>
                    </div>

                    <!-- Stats principales -->
                    <div class="card-stats-mini">
                        <div class="stat-mini">
                            <span class="stat-label">ATK</span>
                            <span class="stat-value">${card.stats.atk}</span>
                        </div>
                        <div class="stat-mini">
                            <span class="stat-label">DEF</span>
                            <span class="stat-value">${card.stats.def}</span>
                        </div>
                        <div class="stat-mini">
                            <span class="stat-label">SPD</span>
                            <span class="stat-value">${card.stats.spd}</span>
                        </div>
                    </div>

                    <!-- Type -->
                    <div class="card-footer">
                        <div class="card-type">
                            ${typeData.icon} ${typeData.name}
                        </div>
                    </div>

                    <!-- Badge -->
                    ${
                        card.badge
                            ? `
                        <div class="evolution-badge" style="background: ${card.badge.color};">
                            ${card.badge.icon} ${card.badge.name}
                        </div>
                    `
                            : ''
                    }
                </div>
            </div>
        `;
    },

    /**
     * Rendu d'une carte complète (preview)
     * @param card
     */
    renderCardFull(card) {
        const typeData = this.pokemonTypes[card.type];

        return `
            <div class="pokemon-card-full"
                 id="cardExport"
                 style="background: ${typeData.gradient};">

                <div class="card-full-inner">
                    <!-- Header complet -->
                    <div class="card-full-header">
                        <div>
                            <h3 class="card-full-name">${card.name}</h3>
                            <div class="card-full-type">${typeData.icon} ${typeData.name}</div>
                        </div>
                        <div class="card-full-hp">HP ${card.hp}</div>
                    </div>

                    <!-- Niveau -->
                    <div class="card-full-level">
                        <div class="level-info">
                            <span>Niveau ${card.level}</span>
                            ${card.badge ? `<span class="badge-mini" style="background: ${card.badge.color};">${card.badge.icon} ${card.badge.name}</span>` : ''}
                        </div>
                    </div>

                    <!-- Image Pokémon officielle (grande) -->
                    <div class="card-full-image pokemon-image-full" style="background: ${typeData.gradient};">
                        <img src="${card.pokemonImage}"
                             alt="${card.pokemonName}"
                             class="pokemon-ai-image-large"
                             crossorigin="anonymous"
                             onerror="this.onerror=null; this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${card.pokemonId || 133}.png';">
                        <div class="pokemon-name-badge-large">${card.pokemonName}</div>
                        <div class="rarity-badge-large rarity-${card.rarity.toLowerCase().replace(/\s+/g, '-')}">
                            ${card.rarity} - ${this.evolutionStages[card.evolutionStage].tier}
                        </div>
                    </div>

                    <!-- Stats simplifiées -->
                    <div class="card-full-stats">
                        ${this.renderStatBar('ATK - Puissance', card.stats.atk, '#ef4444')}
                        ${this.renderStatBar('DEF - Gym/Muscu', card.stats.def, '#3b82f6')}
                        ${this.renderStatBar('SPD - Cardio', card.stats.spd, '#f59e0b')}
                    </div>

                    <!-- Footer -->
                    <div class="card-full-footer">
                        <div class="footer-stats">
                            <div>
                                <i class="fas fa-chart-line"></i>
                                ${card.performanceCount} performances
                            </div>
                            <div>
                                <i class="fas fa-trophy"></i>
                                Indice général: ${card.hp}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Rendu d'une barre de stat
     * @param label
     * @param value
     * @param color
     */
    renderStatBar(label, value, color) {
        return `
            <div class="stat-bar-container">
                <div class="stat-bar-label">${label}</div>
                <div class="stat-bar-bg">
                    <div class="stat-bar-fill" style="width: ${value}%; background: ${color};"></div>
                </div>
                <div class="stat-bar-value">${value}</div>
            </div>
        `;
    },

    // ===================================================================
    // MODALS
    // ===================================================================
    renderPreviewModal() {
        return `
            <div id="cardPreviewModal" class="modal-overlay hidden" onclick="PokemonCards.closePreview(event)">
                <div class="modal-content-card-preview" onclick="event.stopPropagation()">
                    <button onclick="PokemonCards.closePreview()" class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>

                    <!-- Contenu de la carte -->
                    <div id="cardPreviewContent" class="card-preview-wrapper"></div>

                    <!-- Actions redesignées -->
                    <div class="card-preview-actions">
                        <button onclick="PokemonCards.downloadCurrentCard()" class="card-action-btn download-btn">
                            <i class="fas fa-download"></i>
                            <span>Télécharger PNG</span>
                        </button>
                        <button onclick="PokemonCards.updateCardStats()" class="card-action-btn refresh-btn">
                            <i class="fas fa-sync-alt"></i>
                            <span>Actualiser</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // ===================================================================
    // INTERACTIONS
    // ===================================================================

    /**
     * Recherche
     * @param value
     */
    handleSearch(value) {
        this.currentFilter.search = value;
        this.refreshGallery();
    },

    /**
     * Filtrer par type
     * @param type
     */
    filterByType(type) {
        this.currentFilter.type = type;

        // Mettre à jour UI
        document.querySelectorAll('[data-type]').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-type="${type}"]`)?.classList.add('active');

        this.refreshGallery();
    },

    /**
     * Filtrer par niveau
     * @param level
     */
    filterByLevel(level) {
        this.currentFilter.level = level;

        // Mettre à jour UI
        document.querySelectorAll('[data-level]').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-level="${level}"]`)?.classList.add('active');

        this.refreshGallery();
    },

    /**
     * Trier
     * @param sortType
     */
    sortBy(sortType) {
        this.currentSort = sortType;

        // Mettre à jour UI
        document.querySelectorAll('[data-sort]').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-sort="${sortType}"]`)?.classList.add('active');

        this.refreshGallery();
    },

    /**
     * Rafraîchir la galerie
     */
    refreshGallery() {
        const gallery = document.getElementById('cardsGallery');
        if (gallery) {
            gallery.innerHTML = this.renderCardsGallery();
        }
    },

    /**
     * Ouvrir la prévisualisation
     * @param memberId
     */
    openPreview(memberId) {
        const card = this.pokemonCards.get(memberId);
        if (!card) {
            return;
        }

        this.currentPreviewCard = card;

        const content = document.getElementById('cardPreviewContent');
        const modal = document.getElementById('cardPreviewModal');

        if (content && modal) {
            content.innerHTML = this.renderCardFull(card);
            modal.classList.remove('hidden');
        }
    },

    /**
     * Fermer la prévisualisation
     * @param event
     */
    closePreview(event) {
        if (!event || event.target === event.currentTarget) {
            const modal = document.getElementById('cardPreviewModal');
            if (modal) {
                modal.classList.add('hidden');
                this.currentPreviewCard = null;
            }
        }
    },

    // ===================================================================
    // EXPORT & PARTAGE
    // ===================================================================

    /**
     * Télécharger la carte actuelle
     */
    async downloadCurrentCard() {
        if (!this.currentPreviewCard) {
            return;
        }

        try {
            Utils.showNotification("Génération de l'image...", 'info');

            const cardElement = document.getElementById('cardExport');
            if (!cardElement) {
                Utils.showNotification('Erreur: élément non trouvé', 'error');
                return;
            }

            // Utiliser html2canvas
            if (typeof html2canvas === 'undefined') {
                Utils.showNotification('html2canvas non chargé. Chargement...', 'warning');
                await this.loadHtml2Canvas();
            }

            // Attendre que toutes les images soient chargées
            const images = cardElement.querySelectorAll('img');
            const imagePromises = Array.from(images).map(img => {
                return new Promise(resolve => {
                    if (img.complete) {
                        resolve();
                    } else {
                        img.onload = resolve;
                        img.onerror = resolve; // Continuer même si l'image échoue
                    }
                });
            });

            await Promise.all(imagePromises);

            // Petit délai supplémentaire pour être sûr que le rendu est complet
            await new Promise(resolve => setTimeout(resolve, 300));

            const canvas = await html2canvas(cardElement, {
                scale: 2, // Haute résolution
                backgroundColor: null,
                logging: false,
                useCORS: true, // Permettre les images cross-origin (GitHub)
                allowTaint: true // Fallback si CORS échoue
            });

            // Convertir en PNG et télécharger
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `pokemon_${this.currentPreviewCard.name.replace(/\s+/g, '_')}_lvl${this.currentPreviewCard.level}.png`;
                link.href = url;
                link.click();

                URL.revokeObjectURL(url);
                Utils.showNotification('Carte téléchargée !', 'success');
            });
        } catch (error) {
            console.error('Erreur export:', error);
            Utils.showNotification("Erreur lors de l'export", 'error');
        }
    },

    /**
     * Charger html2canvas dynamiquement
     */
    async loadHtml2Canvas() {
        return new Promise((resolve, reject) => {
            if (typeof html2canvas !== 'undefined') {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },

    /**
     * Partager la carte actuelle
     */
    shareCurrentCard() {
        if (!this.currentPreviewCard) {
            return;
        }

        const card = this.currentPreviewCard;
        const text =
            `🎴 Carte Pokémon de ${card.name} !\n` +
            `⚡ Niveau ${card.level} - ${this.pokemonTypes[card.type].name}\n` +
            `💪 Power Total: ${card.totalPower}\n` +
            `🏆 ${card.badge.name}`;

        if (navigator.share) {
            navigator
                .share({
                    title: `Carte Pokémon - ${card.name}`,
                    text: text
                })
                .catch(err => console.log('Partage annulé:', err));
        } else {
            // Copier dans le presse-papier
            navigator.clipboard.writeText(text).then(() => {
                Utils.showNotification('Texte copié dans le presse-papier !', 'success');
            });
        }
    },

    /**
     * Mettre à jour les stats de la carte
     */
    async updateCardStats() {
        if (!this.currentPreviewCard) {
            return;
        }

        try {
            Utils.showNotification('Actualisation des stats...', 'info');

            // Recharger les performances
            this.performances = await SupabaseManager.getPerformances();

            // Régénérer la carte
            const member = this.members.find(m => m.id === this.currentPreviewCard.id);
            if (member) {
                const updatedCard = this.generateCard(member);
                this.pokemonCards.set(member.id, updatedCard);
                this.currentPreviewCard = updatedCard;

                // Rafraîchir l'affichage
                document.getElementById('cardPreviewContent').innerHTML =
                    this.renderCardFull(updatedCard);
                this.refreshGallery();

                Utils.showNotification('Stats mises à jour !', 'success');
            }
        } catch (error) {
            console.error('Erreur mise à jour:', error);
            Utils.showNotification('Erreur lors de la mise à jour', 'error');
        }
    },

    /**
     * Rafraîchir toutes les cartes
     */
    async refreshAllCards() {
        try {
            Utils.showNotification('Actualisation en cours...', 'info');
            await this.loadData();
            await this.generateAllCards();
            this.refreshGallery();
            Utils.showNotification('Cartes actualisées !', 'success');
        } catch (error) {
            console.error('Erreur refresh:', error);
            Utils.showNotification("Erreur lors de l'actualisation", 'error');
        }
    },

    // ===================================================================
    // UTILITAIRES
    // ===================================================================

    getAverageLevel() {
        if (this.pokemonCards.size === 0) {
            return 0;
        }
        const total = Array.from(this.pokemonCards.values()).reduce(
            (sum, card) => sum + card.level,
            0
        );
        return Math.floor(total / this.pokemonCards.size);
    },

    getAveragePower() {
        if (this.pokemonCards.size === 0) {
            return 0;
        }
        const total = Array.from(this.pokemonCards.values()).reduce(
            (sum, card) => sum + card.totalPower,
            0
        );
        return Math.floor(total / this.pokemonCards.size);
    }

    // ===================================================================
    // STYLES CSS COMPLETS
    // ===================================================================
};

// Exposer globalement
window.PokemonCards = PokemonCards;
