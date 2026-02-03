// Gestionnaire Supabase pour Skali Prog - VERSION NOUVELLE ARCHITECTURE
const SupabaseManager = {
    // Configuration chargée depuis ENV (sécurisé)
    supabaseUrl: null,
    supabaseKey: null,

    headers: null,
    isInitialized: false,
    supabase: null,

    // Cache global pour réduire les appels Supabase
    cache: {
        members: null,
        membersTimestamp: 0,
        performances: null,
        performancesTimestamp: 0,
        sessions: {},
        sessionsTimestamp: {},
        cacheDuration: 300000 // 5 minutes (configurable via ENV)
    },

    // Initialiser la connexion Supabase
    async init() {
        // Si déjà initialisé, ne pas recréer le client
        if (this.isInitialized && this.supabase) {
            console.log('✅ SupabaseManager déjà initialisé - réutilisation du client existant');
            return this;
        }

        console.log('🔧 Initialisation SupabaseManager (Nouvelle Architecture Sécurisée)...');

        // Charger configuration sécurisée depuis ENV
        if (!ENV.isLoaded) {
            await ENV.init();
        }

        this.supabaseUrl = ENV.get('supabaseUrl');
        this.supabaseKey = ENV.get('supabaseKey');
        this.cache.cacheDuration = ENV.get('cacheDuration', 300000);

        if (!this.supabaseUrl || !this.supabaseKey) {
            console.error('❌ Configuration Supabase manquante !');
            console.log('💡 Ouvrez la configuration sécurisée via le menu admin');
            return false;
        }

        console.log('📡 URL Supabase:', this.supabaseUrl);
        console.log('🔑 Clé chargée depuis ENV');
        console.log('⏱️  Durée cache:', this.cache.cacheDuration + 'ms');

        this.headers = {
            'Content-Type': 'application/json',
            apikey: this.supabaseKey,
            Authorization: `Bearer ${this.supabaseKey}`,
            Prefer: 'return=representation'
        };

        // Initialiser le client Supabase si disponible (une seule fois)
        if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
            this.supabase = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
            this.client = this.supabase; // ✨ Alias pour compatibilité avec SettingsManager et APIKeysManager
            console.log('✅ Client Supabase JS créé');
        } else {
            console.error(
                '❌ Supabase CDN non chargé ! Vérifiez que le script CDN est inclus dans index.html'
            );
        }

        this.isInitialized = true;
        console.log('✅ SupabaseManager initialisé');
        console.log(
            '📋 Méthodes disponibles:',
            Object.keys(this).filter(k => typeof this[k] === 'function')
        );

        // Test de connexion automatique
        setTimeout(() => this.testConnection(), 1000);

        return this;
    },

    // Test de connexion à Supabase (utilise la nouvelle architecture)
    async testConnection() {
        console.log('🧪 Test de connexion Supabase (Nouvelle Architecture)...');

        try {
            // Tester avec la table members au lieu de app_data
            const response = await fetch(`${this.supabaseUrl}/rest/v1/members?limit=1`, {
                method: 'GET',
                headers: {
                    apikey: this.supabaseKey,
                    Authorization: `Bearer ${this.supabaseKey}`
                }
            });

            console.log('📊 Status de la réponse:', response.status);
            console.log(
                '📊 Headers de la réponse:',
                Object.fromEntries(response.headers.entries())
            );

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Connexion Supabase réussie !');
                console.log(
                    '📄 Membres dans la base:',
                    data.length > 0 ? data.length : 'Table vide'
                );

                // Obtenir les stats complètes
                await this.getStats();

                if (typeof Utils !== 'undefined' && Utils.showNotification) {
                    Utils.showNotification('Connexion Supabase OK', 'success');
                }
                return true;
            } else {
                const errorText = await response.text();
                console.error('❌ Erreur de connexion:', response.status, errorText);
                if (typeof Utils !== 'undefined' && Utils.showNotification) {
                    Utils.showNotification(`Erreur Supabase: ${response.status}`, 'error');
                }
                return false;
            }
        } catch (error) {
            console.error('💥 Erreur test connexion:', error);
            if (typeof Utils !== 'undefined' && Utils.showNotification) {
                Utils.showNotification('Erreur de connexion Supabase', 'error');
            }
            return false;
        }
    },

    // Obtenir les statistiques de la base
    async getStats() {
        console.log('📊 Récupération des statistiques...');

        try {
            const [membersRes, sessionsRes, performancesRes] = await Promise.all([
                fetch(`${this.supabaseUrl}/rest/v1/members?select=count`, {
                    method: 'HEAD',
                    headers: this.headers
                }),
                fetch(`${this.supabaseUrl}/rest/v1/sessions?select=count`, {
                    method: 'HEAD',
                    headers: this.headers
                }),
                fetch(`${this.supabaseUrl}/rest/v1/performances?select=count`, {
                    method: 'HEAD',
                    headers: this.headers
                })
            ]);

            const stats = {
                members: parseInt(membersRes.headers.get('content-range')?.split('/')[1] || '0'),
                sessions: parseInt(sessionsRes.headers.get('content-range')?.split('/')[1] || '0'),
                performances: parseInt(
                    performancesRes.headers.get('content-range')?.split('/')[1] || '0'
                )
            };

            console.log('📊 Statistiques:', stats);
            return stats;
        } catch (error) {
            console.error('❌ Erreur récupération stats:', error);
            return { members: 0, sessions: 0, performances: 0 };
        }
    },

    // Invalider le cache (appeler après create/update/delete)
    invalidateCache(type = 'all') {
        if (type === 'all' || type === 'members') {
            this.cache.members = null;
            this.cache.membersTimestamp = 0;
        }
        if (type === 'all' || type === 'performances') {
            this.cache.performances = null;
            this.cache.performancesTimestamp = 0;
        }
        if (type === 'all' || type === 'sessions') {
            this.cache.sessions = {};
            this.cache.sessionsTimestamp = {};
        }
        console.log('🗑️ Cache invalidé:', type);
    },

    // ========================================
    // MEMBRES
    // ========================================

    async getMembers(forceRefresh = false) {
        // Vérifier le cache
        const now = Date.now();
        if (
            !forceRefresh &&
            this.cache.members &&
            now - this.cache.membersTimestamp < this.cache.cacheDuration
        ) {
            console.log('📦 Utilisation cache membres');
            return this.cache.members;
        }

        const response = await fetch(
            `${this.supabaseUrl}/rest/v1/members?select=*&order=created_at.desc`,
            {
                method: 'GET',
                headers: this.headers
            }
        );

        if (!response.ok) {
            throw new Error(`Erreur chargement membres: ${response.status}`);
        }

        const members = await response.json();

        // Adapter le format pour chaque membre
        const formattedMembers = members.map(member => {
            const nameParts = (member.name || '').split(' ');
            member.firstName = nameParts[0] || '';
            member.lastName = nameParts.slice(1).join(' ') || '';

            // Calculer l'âge
            if (member.birthdate) {
                const today = new Date();
                const birth = new Date(member.birthdate);
                let age = today.getFullYear() - birth.getFullYear();
                const monthDiff = today.getMonth() - birth.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                    age--;
                }
                member.age = age;
            }

            // Alias pour compatibilité UI
            member.bodyFat = member.body_fat_percentage;
            member.leanMass = member.lean_mass;

            return member;
        });

        // Mettre en cache
        this.cache.members = formattedMembers;
        this.cache.membersTimestamp = now;
        console.log('✅ Cache membres mis à jour:', formattedMembers.length);

        return formattedMembers;
    },

    async getMember(id) {
        const response = await fetch(`${this.supabaseUrl}/rest/v1/members?id=eq.${id}&select=*`, {
            method: 'GET',
            headers: this.headers
        });

        if (!response.ok) {
            throw new Error(`Erreur chargement membre: ${response.status}`);
        }

        const data = await response.json();
        const member = data[0] || null;

        // Adapter le format Supabase vers le format attendu par l'UI
        if (member) {
            // Parser le nom complet en firstName/lastName
            const nameParts = (member.name || '').split(' ');
            member.firstName = nameParts[0] || '';
            member.lastName = nameParts.slice(1).join(' ') || '';

            // Calculer l'âge depuis birthdate
            if (member.birthdate) {
                const today = new Date();
                const birth = new Date(member.birthdate);
                let age = today.getFullYear() - birth.getFullYear();
                const monthDiff = today.getMonth() - birth.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                    age--;
                }
                member.age = age;
            }

            // Alias pour compatibilité UI
            member.bodyFat = member.body_fat_percentage;
            member.leanMass = member.lean_mass;
        }

        return member;
    },

    async createMember(memberData) {
        const response = await fetch(`${this.supabaseUrl}/rest/v1/members`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                name:
                    `${memberData.firstName || ''} ${memberData.lastName || ''}`.trim() ||
                    'Sans nom',
                email: memberData.email || null,
                phone: memberData.phone || null,
                birthdate: memberData.birthdate || null,
                gender: memberData.gender || null,
                height: memberData.height || null,
                weight: memberData.weight || null,
                body_fat_percentage: memberData.body_fat_percentage || null,
                lean_mass: memberData.lean_mass || null,
                vma: memberData.vma || null,
                ftp: memberData.ftp || null,
                max_heart_rate: memberData.max_heart_rate || null,
                resting_heart_rate: memberData.resting_heart_rate || null,
                goal: memberData.goal || null,
                activity_level: memberData.activity_level || null,
                is_active: true
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur création membre: ${response.status} - ${error}`);
        }

        const data = await response.json();
        this.invalidateCache('members');
        console.log('✅ Membre créé:', data);
        return data[0];
    },

    async updateMember(id, updates) {
        const updateData = {
            updated_at: new Date().toISOString()
        };

        // Construire le nom complet si firstName ou lastName fournis
        if (updates.firstName !== undefined || updates.lastName !== undefined) {
            updateData.name = `${updates.firstName || ''} ${updates.lastName || ''}`.trim();
        }

        // Tous les champs possibles
        if (updates.email !== undefined) {
            updateData.email = updates.email;
        }
        if (updates.phone !== undefined) {
            updateData.phone = updates.phone;
        }
        if (updates.birthdate !== undefined) {
            updateData.birthdate = updates.birthdate;
        }
        if (updates.gender !== undefined) {
            updateData.gender = updates.gender;
        }
        if (updates.height !== undefined) {
            updateData.height = updates.height;
        }
        if (updates.weight !== undefined) {
            updateData.weight = updates.weight;
        }
        if (updates.body_fat_percentage !== undefined) {
            updateData.body_fat_percentage = updates.body_fat_percentage;
        }
        if (updates.lean_mass !== undefined) {
            updateData.lean_mass = updates.lean_mass;
        }
        if (updates.vma !== undefined) {
            updateData.vma = updates.vma;
        }
        if (updates.ftp !== undefined) {
            updateData.ftp = updates.ftp;
        }
        if (updates.max_heart_rate !== undefined) {
            updateData.max_heart_rate = updates.max_heart_rate;
        }
        if (updates.resting_heart_rate !== undefined) {
            updateData.resting_heart_rate = updates.resting_heart_rate;
        }
        if (updates.goal !== undefined) {
            updateData.goal = updates.goal;
        }
        if (updates.activity_level !== undefined) {
            updateData.activity_level = updates.activity_level;
        }

        // Discord linking
        if (updates.discord_id !== undefined) {
            updateData.discord_id = updates.discord_id;
        }
        if (updates.discord_username !== undefined) {
            updateData.discord_username = updates.discord_username;
        }

        // Statut actif/inactif
        if (updates.is_active !== undefined) {
            updateData.is_active = updates.is_active;
        }

        const response = await fetch(`${this.supabaseUrl}/rest/v1/members?id=eq.${id}`, {
            method: 'PATCH',
            headers: this.headers,
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur mise à jour membre: ${response.status} - ${error}`);
        }

        this.invalidateCache('members');
        console.log('✅ Membre mis à jour:', id);
        return await response.json();
    },

    async deleteMember(id) {
        const response = await fetch(`${this.supabaseUrl}/rest/v1/members?id=eq.${id}`, {
            method: 'DELETE',
            headers: {
                ...this.headers,
                Prefer: 'return=minimal'
            }
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur suppression membre: ${response.status} - ${error}`);
        }

        this.invalidateCache('members');

        console.log('✅ Membre supprimé:', id);
    },

    // ========================================
    // SESSIONS
    // ========================================

    async getSessions(dateKey = null, forceRefresh = false) {
        // Si une date spécifique est demandée
        if (dateKey) {
            // Vérifier le cache
            const now = Date.now();
            if (
                !forceRefresh &&
                this.cache.sessions[dateKey] &&
                now - (this.cache.sessionsTimestamp[dateKey] || 0) < this.cache.cacheDuration
            ) {
                console.log('📦 Utilisation cache session pour date:', dateKey);
                return this.cache.sessions[dateKey];
            }

            // Récupérer depuis Supabase
            const response = await fetch(
                `${this.supabaseUrl}/rest/v1/sessions?date=eq.${dateKey}&select=*&order=created_at.desc`,
                {
                    method: 'GET',
                    headers: this.headers
                }
            );

            if (!response.ok) {
                throw new Error(`Erreur chargement sessions pour ${dateKey}: ${response.status}`);
            }

            const sessions = await response.json();

            // Mettre en cache
            this.cache.sessions[dateKey] = sessions;
            this.cache.sessionsTimestamp[dateKey] = now;
            console.log(`✅ Sessions récupérées pour ${dateKey}:`, sessions.length);

            return sessions;
        }

        // Sinon, récupérer toutes les sessions
        const response = await fetch(
            `${this.supabaseUrl}/rest/v1/sessions?select=*&order=date.desc`,
            {
                method: 'GET',
                headers: this.headers
            }
        );

        if (!response.ok) {
            throw new Error(`Erreur chargement sessions: ${response.status}`);
        }

        return await response.json();
    },

    async getSession(id) {
        const response = await fetch(`${this.supabaseUrl}/rest/v1/sessions?id=eq.${id}&select=*`, {
            method: 'GET',
            headers: this.headers
        });

        if (!response.ok) {
            throw new Error(`Erreur chargement session: ${response.status}`);
        }

        const data = await response.json();
        return data[0] || null;
    },

    async createSession(sessionData) {
        const data = {
            date: sessionData.date,
            title: sessionData.title || 'Sans titre',
            category: sessionData.category || null,
            description: sessionData.description || null,
            blocks: sessionData.blocks || null, // Support des blocks (JSONB)
            rfid_enabled: sessionData.rfid_enabled || false,
            rfid_mode: sessionData.rfid_mode || null,
            work_duration: sessionData.work_duration || null,
            rest_duration: sessionData.rest_duration || null,
            rounds: sessionData.rounds || null
        };

        const response = await fetch(`${this.supabaseUrl}/rest/v1/sessions`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur création session: ${response.status} - ${error}`);
        }

        const result = await response.json();
        this.invalidateCache('sessions');
        console.log('✅ Session créée:', result);
        return result[0];
    },

    async updateSession(id, sessionData) {
        const updateData = {
            updated_at: new Date().toISOString()
        };

        if (sessionData.date !== undefined) {
            updateData.date = sessionData.date;
        } // Support déplacement de date
        if (sessionData.title !== undefined) {
            updateData.title = sessionData.title;
        }
        if (sessionData.category !== undefined) {
            updateData.category = sessionData.category;
        }
        if (sessionData.description !== undefined) {
            updateData.description = sessionData.description;
        }
        if (sessionData.blocks !== undefined) {
            updateData.blocks = sessionData.blocks;
        } // Support blocks
        if (sessionData.rfid_enabled !== undefined) {
            updateData.rfid_enabled = sessionData.rfid_enabled;
        }
        if (sessionData.rfid_mode !== undefined) {
            updateData.rfid_mode = sessionData.rfid_mode;
        }
        if (sessionData.work_duration !== undefined) {
            updateData.work_duration = sessionData.work_duration;
        }
        if (sessionData.rest_duration !== undefined) {
            updateData.rest_duration = sessionData.rest_duration;
        }
        if (sessionData.rounds !== undefined) {
            updateData.rounds = sessionData.rounds;
        }

        const response = await fetch(`${this.supabaseUrl}/rest/v1/sessions?id=eq.${id}`, {
            method: 'PATCH',
            headers: this.headers,
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur mise à jour session: ${response.status} - ${error}`);
        }

        this.invalidateCache('sessions');
        console.log('✅ Session mise à jour:', id);
        return await response.json();
    },

    async deleteSession(id) {
        const response = await fetch(`${this.supabaseUrl}/rest/v1/sessions?id=eq.${id}`, {
            method: 'DELETE',
            headers: this.headers
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur suppression session: ${response.status} - ${error}`);
        }

        this.invalidateCache('sessions');
        console.log('✅ Session supprimée:', id);
    },

    // ========================================
    // PERFORMANCES
    // ========================================

    async getPerformances(memberId = null) {
        let url = `${this.supabaseUrl}/rest/v1/performances?select=*,members(name)&order=date.desc`;

        if (memberId) {
            url += `&member_id=eq.${memberId}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: this.headers
        });

        if (!response.ok) {
            throw new Error(`Erreur chargement performances: ${response.status}`);
        }

        const performances = await response.json();

        // Format adapter: Supabase → UI
        return performances.map(perf => {
            // Add 'exercise' alias for 'exercise_type' (UI compatibility)
            perf.exercise = perf.exercise_type;
            return perf;
        });
    },

    async createPerformance(perfData) {
        const response = await fetch(`${this.supabaseUrl}/rest/v1/performances`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                member_id: perfData.memberId,
                exercise_type: perfData.exerciseType,
                category: perfData.category || null,
                value: perfData.value,
                unit: perfData.unit,
                date: perfData.date,
                session_id: perfData.sessionId || null,
                is_pr: perfData.isPR || false,
                notes: perfData.notes || null
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur création performance: ${response.status} - ${error}`);
        }

        const data = await response.json();
        this.invalidateCache('performances');
        console.log('✅ Performance créée:', data);
        return data[0];
    },

    async getMemberPerformances(memberId) {
        const response = await fetch(
            `${this.supabaseUrl}/rest/v1/performances?member_id=eq.${memberId}&select=*&order=date.desc`,
            {
                method: 'GET',
                headers: this.headers
            }
        );

        if (!response.ok) {
            throw new Error(`Erreur chargement performances membre: ${response.status}`);
        }

        const performances = await response.json();
        console.log('✅ Performances membre récupérées:', performances.length);

        // Retourner tel quel (la base utilise déjà exercise_type, category, date)
        return performances;
    },

    async updatePerformance(performanceId, updates) {
        const updateData = {
            updated_at: new Date().toISOString()
        };

        if (updates.exerciseType !== undefined) {
            updateData.exercise_type = updates.exerciseType;
        }
        if (updates.category !== undefined) {
            updateData.category = updates.category;
        }
        if (updates.value !== undefined) {
            updateData.value = updates.value;
        }
        if (updates.unit !== undefined) {
            updateData.unit = updates.unit;
        }
        if (updates.date !== undefined) {
            updateData.date = updates.date;
        }
        if (updates.isPR !== undefined) {
            updateData.is_pr = updates.isPR;
        }
        if (updates.notes !== undefined) {
            updateData.notes = updates.notes;
        }

        const response = await fetch(
            `${this.supabaseUrl}/rest/v1/performances?id=eq.${performanceId}`,
            {
                method: 'PATCH',
                headers: this.headers,
                body: JSON.stringify(updateData)
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur mise à jour performance: ${response.status} - ${error}`);
        }

        this.invalidateCache('performances');
        console.log('✅ Performance mise à jour:', performanceId);
        return await response.json();
    },

    async deletePerformance(performanceId) {
        const response = await fetch(
            `${this.supabaseUrl}/rest/v1/performances?id=eq.${performanceId}`,
            {
                method: 'DELETE',
                headers: this.headers
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur suppression performance: ${response.status} - ${error}`);
        }

        this.invalidateCache('performances');
        console.log('✅ Performance supprimée:', performanceId);
        return true;
    },

    // ========================================
    // EXERCICES (Catalogue statique)
    // ========================================

    getExercises() {
        return {
            Musculation: [
                'Back Squat',
                'Front Squat',
                'Overhead Squat',
                'Deadlift',
                'Sumo Deadlift',
                'Bench Press',
                'Shoulder Press',
                'Push Press',
                'Jerk',
                'Snatch',
                'Clean',
                'Clean & Jerk',
                'Pull-ups',
                'Chin-ups',
                'Muscle-ups',
                'Thrusters',
                'Wall Balls'
            ],
            Crosstraining: [
                'WOD',
                'AMRAP',
                'For Time',
                'EMOM',
                'Tabata',
                'Burpees',
                'Box Jumps',
                'Double Unders',
                'Kettlebell Swings',
                'Turkish Get-ups'
            ],
            Endurance: [
                // Format utilisé dans la base : "600m Run" (distance en premier)
                '600m Run',
                '800m Run',
                '1000m Run',
                '1200m Run',
                '2000m Run',
                '3000m Run',
                '5000m Run',
                '500m Row',
                '1000m Row',
                '2000m Row',
                '5000m Row',
                '1km Bike',
                '2km Bike',
                '5km Bike',
                '10km Bike',
                '500m Skierg',
                '1000m Skierg',
                '2000m Skierg'
            ],
            Gymnastique: [
                'Handstand Push-ups',
                'Handstand Walk',
                'Ring Dips',
                'Bar Muscle-ups',
                'Ring Muscle-ups',
                'Toes to Bar',
                'Knees to Elbows',
                'L-sit',
                'Rope Climb'
            ]
        };
    },

    // ========================================
    // MODULE NUTRITION AI
    // ========================================

    async createNutritionMeal(meal) {
        console.log('🍽️ Création repas nutrition:', meal);

        const response = await fetch(`${this.supabaseUrl}/rest/v1/nutrition_meals`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                member_id: meal.memberId,
                meal_type: meal.mealType,
                meal_time: meal.mealTime,
                foods: meal.foods || [],
                total_calories: meal.totalCalories || 0,
                total_protein: meal.totalProtein || 0,
                total_carbs: meal.totalCarbs || 0,
                total_fats: meal.totalFats || 0,
                notes: meal.notes || null
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur création repas: ${response.status} - ${error}`);
        }

        const data = await response.json();
        this.invalidateCache('nutrition');
        console.log('✅ Repas créé:', data);
        return data[0];
    },

    async getNutritionMeals(memberId, startDate = null, endDate = null) {
        console.log('🍽️ Récupération repas pour membre:', memberId);

        let url = `${this.supabaseUrl}/rest/v1/nutrition_meals?member_id=eq.${memberId}&order=meal_time.desc`;

        if (startDate) {
            url += `&meal_time=gte.${startDate}`;
        }
        if (endDate) {
            url += `&meal_time=lte.${endDate}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: this.headers
        });

        if (!response.ok) {
            throw new Error(`Erreur chargement repas: ${response.status}`);
        }

        const meals = await response.json();
        console.log('✅ Repas récupérés:', meals.length);
        return meals;
    },

    async updateNutritionMeal(mealId, updates) {
        console.log('🍽️ Mise à jour repas:', mealId, updates);

        const updateData = {
            updated_at: new Date().toISOString()
        };

        if (updates.mealType !== undefined) {
            updateData.meal_type = updates.mealType;
        }
        if (updates.mealTime !== undefined) {
            updateData.meal_time = updates.mealTime;
        }
        if (updates.foods !== undefined) {
            updateData.foods = updates.foods;
        }
        if (updates.totalCalories !== undefined) {
            updateData.total_calories = updates.totalCalories;
        }
        if (updates.totalProtein !== undefined) {
            updateData.total_protein = updates.totalProtein;
        }
        if (updates.totalCarbs !== undefined) {
            updateData.total_carbs = updates.totalCarbs;
        }
        if (updates.totalFats !== undefined) {
            updateData.total_fats = updates.totalFats;
        }
        if (updates.notes !== undefined) {
            updateData.notes = updates.notes;
        }

        const response = await fetch(
            `${this.supabaseUrl}/rest/v1/nutrition_meals?id=eq.${mealId}`,
            {
                method: 'PATCH',
                headers: this.headers,
                body: JSON.stringify(updateData)
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur mise à jour repas: ${response.status} - ${error}`);
        }

        this.invalidateCache('nutrition');
        console.log('✅ Repas mis à jour:', mealId);
        return await response.json();
    },

    async deleteNutritionMeal(mealId) {
        console.log('🍽️ Suppression repas:', mealId);

        const response = await fetch(
            `${this.supabaseUrl}/rest/v1/nutrition_meals?id=eq.${mealId}`,
            {
                method: 'DELETE',
                headers: this.headers
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur suppression repas: ${response.status} - ${error}`);
        }

        this.invalidateCache('nutrition');
        console.log('✅ Repas supprimé:', mealId);
        return true;
    },

    async getNutritionTracking(memberId, date) {
        console.log('📊 Récupération suivi nutrition:', memberId, date);

        const response = await fetch(
            `${this.supabaseUrl}/rest/v1/nutrition_tracking?member_id=eq.${memberId}&tracking_date=eq.${date}`,
            {
                method: 'GET',
                headers: this.headers
            }
        );

        if (!response.ok) {
            throw new Error(`Erreur chargement suivi nutrition: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Suivi nutrition récupéré:', data);
        return data[0] || null;
    },

    async upsertNutritionTracking(tracking) {
        console.log('📊 Upsert suivi nutrition:', tracking);

        const response = await fetch(`${this.supabaseUrl}/rest/v1/nutrition_tracking`, {
            method: 'POST',
            headers: {
                ...this.headers,
                Prefer: 'resolution=merge-duplicates,return=representation'
            },
            body: JSON.stringify({
                member_id: tracking.memberId,
                tracking_date: tracking.trackingDate,
                target_calories: tracking.targetCalories || 0,
                target_protein: tracking.targetProtein || 0,
                target_carbs: tracking.targetCarbs || 0,
                target_fats: tracking.targetFats || 0,
                consumed_calories: tracking.consumedCalories || 0,
                consumed_protein: tracking.consumedProtein || 0,
                consumed_carbs: tracking.consumedCarbs || 0,
                consumed_fats: tracking.consumedFats || 0,
                water_intake: tracking.waterIntake || 0,
                notes: tracking.notes || null
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur upsert suivi nutrition: ${response.status} - ${error}`);
        }

        const data = await response.json();
        this.invalidateCache('nutrition');
        console.log('✅ Suivi nutrition upsert:', data);
        return data[0];
    },

    async analyzeNutritionWithAI(memberId, period) {
        console.log('🤖 Analyse nutrition IA:', memberId, period);

        const response = await fetch(`${this.supabaseUrl}/rest/v1/nutrition_ai_analyses`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                member_id: memberId,
                period_start: period.start,
                period_end: period.end,
                analysis_type: period.type || 'weekly',
                status: 'pending'
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur création analyse IA: ${response.status} - ${error}`);
        }

        const data = await response.json();
        console.log('✅ Analyse IA créée:', data);
        return data[0];
    },

    async getNutritionAIAnalyses(memberId) {
        console.log('🤖 Récupération analyses IA:', memberId);

        const response = await fetch(
            `${this.supabaseUrl}/rest/v1/nutrition_ai_analyses?member_id=eq.${memberId}&order=created_at.desc`,
            {
                method: 'GET',
                headers: this.headers
            }
        );

        if (!response.ok) {
            throw new Error(`Erreur chargement analyses IA: ${response.status}`);
        }

        const analyses = await response.json();
        console.log('✅ Analyses IA récupérées:', analyses.length);
        return analyses;
    },

    // ========================================
    // MODULE CARDIO MONITOR
    // ========================================

    async createHeartRateSession(session) {
        console.log('❤️ Création session cardio:', session);

        const response = await fetch(`${this.supabaseUrl}/rest/v1/heart_rate_sessions`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                member_id: session.memberId,
                session_id: session.sessionId || null,
                session_type: session.sessionType || 'workout',
                start_time: session.startTime,
                end_time: session.endTime || null,
                avg_heart_rate: session.avgHeartRate || null,
                max_heart_rate: session.maxHeartRate || null,
                min_heart_rate: session.minHeartRate || null,
                calories_burned: session.caloriesBurned || null,
                zone_1_time: session.zone1Time || 0,
                zone_2_time: session.zone2Time || 0,
                zone_3_time: session.zone3Time || 0,
                zone_4_time: session.zone4Time || 0,
                zone_5_time: session.zone5Time || 0,
                notes: session.notes || null
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur création session cardio: ${response.status} - ${error}`);
        }

        const data = await response.json();
        this.invalidateCache('cardio');
        console.log('✅ Session cardio créée:', data);
        return data[0];
    },

    async getHeartRateSessions(memberId, limit = 50) {
        console.log('❤️ Récupération sessions cardio:', memberId);

        // Construire l'URL avec ou sans filtre member_id
        let url = `${this.supabaseUrl}/rest/v1/heart_rate_sessions?`;

        if (memberId && memberId !== null) {
            url += `member_id=eq.${memberId}&`;
        }

        url += `order=start_time.desc&limit=${limit}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: this.headers
        });

        if (!response.ok) {
            throw new Error(`Erreur chargement sessions cardio: ${response.status}`);
        }

        const sessions = await response.json();
        console.log('✅ Sessions cardio récupérées:', sessions.length);
        return sessions;
    },

    async updateHeartRateSession(sessionId, updates) {
        console.log('❤️ Mise à jour session cardio:', sessionId, updates);

        const updateData = {
            updated_at: new Date().toISOString()
        };

        if (updates.endTime !== undefined) {
            updateData.end_time = updates.endTime;
        }
        if (updates.avgHeartRate !== undefined) {
            updateData.avg_heart_rate = updates.avgHeartRate;
        }
        if (updates.maxHeartRate !== undefined) {
            updateData.max_heart_rate = updates.maxHeartRate;
        }
        if (updates.minHeartRate !== undefined) {
            updateData.min_heart_rate = updates.minHeartRate;
        }
        if (updates.caloriesBurned !== undefined) {
            updateData.calories_burned = updates.caloriesBurned;
        }
        if (updates.zone1Time !== undefined) {
            updateData.zone_1_time = updates.zone1Time;
        }
        if (updates.zone2Time !== undefined) {
            updateData.zone_2_time = updates.zone2Time;
        }
        if (updates.zone3Time !== undefined) {
            updateData.zone_3_time = updates.zone3Time;
        }
        if (updates.zone4Time !== undefined) {
            updateData.zone_4_time = updates.zone4Time;
        }
        if (updates.zone5Time !== undefined) {
            updateData.zone_5_time = updates.zone5Time;
        }
        if (updates.notes !== undefined) {
            updateData.notes = updates.notes;
        }

        const response = await fetch(
            `${this.supabaseUrl}/rest/v1/heart_rate_sessions?id=eq.${sessionId}`,
            {
                method: 'PATCH',
                headers: this.headers,
                body: JSON.stringify(updateData)
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur mise à jour session cardio: ${response.status} - ${error}`);
        }

        this.invalidateCache('cardio');
        console.log('✅ Session cardio mise à jour:', sessionId);
        return await response.json();
    },

    async saveHeartRateDataPoint(dataPoint) {
        console.log('❤️ Sauvegarde point HR:', dataPoint);

        const response = await fetch(`${this.supabaseUrl}/rest/v1/heart_rate_data`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                session_id: dataPoint.sessionId,
                timestamp: dataPoint.timestamp,
                heart_rate: dataPoint.heartRate,
                zone: dataPoint.zone || null
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur sauvegarde point HR: ${response.status} - ${error}`);
        }

        const data = await response.json();
        console.log('✅ Point HR sauvegardé:', data);
        return data[0];
    },

    async getHeartRateDataPoints(sessionId) {
        console.log('❤️ Récupération points HR session:', sessionId);

        const response = await fetch(
            `${this.supabaseUrl}/rest/v1/heart_rate_data?session_id=eq.${sessionId}&order=timestamp.asc`,
            {
                method: 'GET',
                headers: this.headers
            }
        );

        if (!response.ok) {
            throw new Error(`Erreur chargement points HR: ${response.status}`);
        }

        const dataPoints = await response.json();
        console.log('✅ Points HR récupérés:', dataPoints.length);
        return dataPoints;
    },

    async calculateHRZones(memberId, heartRate) {
        console.log('❤️ Calcul zones cardio:', memberId, heartRate);

        try {
            const member = await this.getMember(memberId);
            const maxHR = member.max_heart_rate || 220 - (member.age || 30);

            const zones = {
                zone1: { min: Math.round(maxHR * 0.5), max: Math.round(maxHR * 0.6) },
                zone2: { min: Math.round(maxHR * 0.6), max: Math.round(maxHR * 0.7) },
                zone3: { min: Math.round(maxHR * 0.7), max: Math.round(maxHR * 0.8) },
                zone4: { min: Math.round(maxHR * 0.8), max: Math.round(maxHR * 0.9) },
                zone5: { min: Math.round(maxHR * 0.9), max: maxHR }
            };

            // Déterminer la zone actuelle
            let currentZone = null;
            if (heartRate >= zones.zone5.min) {
                currentZone = 5;
            } else if (heartRate >= zones.zone4.min) {
                currentZone = 4;
            } else if (heartRate >= zones.zone3.min) {
                currentZone = 3;
            } else if (heartRate >= zones.zone2.min) {
                currentZone = 2;
            } else if (heartRate >= zones.zone1.min) {
                currentZone = 1;
            }

            console.log('✅ Zones cardio calculées:', { zones, currentZone });
            return { zones, currentZone, maxHR };
        } catch (error) {
            console.error('❌ Erreur calcul zones:', error);
            throw error;
        }
    },

    // ========================================
    // MODULE RFID RUNNING
    // ========================================

    async createRFIDTag(tag) {
        console.log('🏷️ Création puce RFID:', tag);

        const response = await fetch(`${this.supabaseUrl}/rest/v1/rfid_tags`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                member_id: tag.memberId,
                tag_id: tag.tagId,
                tag_type: tag.tagType || 'runner',
                assigned_date: tag.assignedDate || new Date().toISOString(),
                is_active: tag.isActive !== undefined ? tag.isActive : true,
                notes: tag.notes || null
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur création RFID tag: ${response.status} - ${error}`);
        }

        const data = await response.json();
        this.invalidateCache('rfid');
        console.log('✅ RFID tag créé:', data);
        return data[0];
    },

    async getRFIDTags(memberId = null) {
        console.log('🏷️ Récupération puces RFID:', memberId);

        let url = `${this.supabaseUrl}/rest/v1/rfid_tags?order=created_at.desc`;
        if (memberId) {
            url += `&member_id=eq.${memberId}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: this.headers
        });

        if (!response.ok) {
            throw new Error(`Erreur chargement RFID tags: ${response.status}`);
        }

        const tags = await response.json();
        console.log('✅ RFID tags récupérés:', tags.length);
        return tags;
    },

    async updateRFIDTag(tagId, updates) {
        console.log('🏷️ Mise à jour RFID tag:', tagId, updates);

        const updateData = {
            updated_at: new Date().toISOString()
        };

        if (updates.memberId !== undefined) {
            updateData.member_id = updates.memberId;
        }
        if (updates.tagType !== undefined) {
            updateData.tag_type = updates.tagType;
        }
        if (updates.isActive !== undefined) {
            updateData.is_active = updates.isActive;
        }
        if (updates.notes !== undefined) {
            updateData.notes = updates.notes;
        }

        const response = await fetch(`${this.supabaseUrl}/rest/v1/rfid_tags?id=eq.${tagId}`, {
            method: 'PATCH',
            headers: this.headers,
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur mise à jour RFID tag: ${response.status} - ${error}`);
        }

        this.invalidateCache('rfid');
        console.log('✅ RFID tag mis à jour:', tagId);
        return await response.json();
    },

    async getRFIDTagByTagId(tagId) {
        console.log('🏷️ Recherche puce RFID par tag_id:', tagId);

        const response = await fetch(
            `${this.supabaseUrl}/rest/v1/rfid_tags?tag_id=eq.${tagId}&select=*,members(*)`,
            {
                method: 'GET',
                headers: this.headers
            }
        );

        if (!response.ok) {
            throw new Error(`Erreur recherche RFID tag: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ RFID tag trouvé:', data[0]);
        return data[0] || null;
    },

    async createRFIDSession(session) {
        console.log('🏃 Création session RFID:', session);

        const response = await fetch(`${this.supabaseUrl}/rest/v1/rfid_sessions`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                session_id: session.sessionId || null,
                session_name: session.sessionName || 'Session RFID',
                session_type: session.sessionType || 'running',
                start_time: session.startTime,
                end_time: session.endTime || null,
                status: session.status || 'active',
                lap_distance: session.lapDistance || 400,
                total_laps: session.totalLaps || 0,
                notes: session.notes || null
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur création session RFID: ${response.status} - ${error}`);
        }

        const data = await response.json();
        this.invalidateCache('rfid');
        console.log('✅ Session RFID créée:', data);
        return data[0];
    },

    async getRFIDSessions(status = null, limit = 50) {
        console.log('🏃 Récupération sessions RFID:', status);

        let url = `${this.supabaseUrl}/rest/v1/rfid_sessions?order=start_time.desc&limit=${limit}`;
        if (status) {
            url += `&status=eq.${status}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: this.headers
        });

        if (!response.ok) {
            throw new Error(`Erreur chargement sessions RFID: ${response.status}`);
        }

        const sessions = await response.json();
        console.log('✅ Sessions RFID récupérées:', sessions.length);
        return sessions;
    },

    async updateRFIDSession(sessionId, updates) {
        console.log('🏃 Mise à jour session RFID:', sessionId, updates);

        const updateData = {
            updated_at: new Date().toISOString()
        };

        if (updates.endTime !== undefined) {
            updateData.end_time = updates.endTime;
        }
        if (updates.status !== undefined) {
            updateData.status = updates.status;
        }
        if (updates.totalLaps !== undefined) {
            updateData.total_laps = updates.totalLaps;
        }
        if (updates.notes !== undefined) {
            updateData.notes = updates.notes;
        }

        const response = await fetch(
            `${this.supabaseUrl}/rest/v1/rfid_sessions?id=eq.${sessionId}`,
            {
                method: 'PATCH',
                headers: this.headers,
                body: JSON.stringify(updateData)
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur mise à jour session RFID: ${response.status} - ${error}`);
        }

        this.invalidateCache('rfid');
        console.log('✅ Session RFID mise à jour:', sessionId);
        return await response.json();
    },

    async saveRFIDLap(lap) {
        console.log('🏁 Sauvegarde tour RFID:', lap);

        const response = await fetch(`${this.supabaseUrl}/rest/v1/rfid_laps`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                rfid_session_id: lap.rfidSessionId,
                member_id: lap.memberId,
                tag_id: lap.tagId,
                lap_number: lap.lapNumber,
                lap_time: lap.lapTime,
                split_time: lap.splitTime,
                timestamp: lap.timestamp,
                speed_kmh: lap.speedKmh || null
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur sauvegarde tour RFID: ${response.status} - ${error}`);
        }

        const data = await response.json();
        this.invalidateCache('rfid');
        console.log('✅ Tour RFID sauvegardé:', data);
        return data[0];
    },

    async getRFIDLaps(sessionId) {
        console.log('🏁 Récupération tours RFID session:', sessionId);

        const response = await fetch(
            `${this.supabaseUrl}/rest/v1/rfid_laps?rfid_session_id=eq.${sessionId}&select=*,members(name)&order=timestamp.asc`,
            {
                method: 'GET',
                headers: this.headers
            }
        );

        if (!response.ok) {
            throw new Error(`Erreur chargement tours RFID: ${response.status}`);
        }

        const laps = await response.json();
        console.log('✅ Tours RFID récupérés:', laps.length);
        return laps;
    },

    async getRFIDLeaderboard(sessionId) {
        console.log('🏆 Récupération classement RFID:', sessionId);

        try {
            const laps = await this.getRFIDLaps(sessionId);

            // Grouper par membre et calculer meilleur temps
            const memberStats = {};

            laps.forEach(lap => {
                if (!memberStats[lap.member_id]) {
                    memberStats[lap.member_id] = {
                        memberId: lap.member_id,
                        memberName: lap.members?.name || 'Inconnu',
                        totalLaps: 0,
                        bestLapTime: Infinity,
                        avgLapTime: 0,
                        totalTime: 0
                    };
                }

                const stats = memberStats[lap.member_id];
                stats.totalLaps++;
                stats.totalTime += lap.lap_time;
                stats.bestLapTime = Math.min(stats.bestLapTime, lap.lap_time);
            });

            // Calculer moyenne et trier
            const leaderboard = Object.values(memberStats)
                .map(stats => {
                    stats.avgLapTime = stats.totalTime / stats.totalLaps;
                    return stats;
                })
                .sort((a, b) => a.bestLapTime - b.bestLapTime);

            console.log('✅ Classement RFID calculé:', leaderboard);
            return leaderboard;
        } catch (error) {
            console.error('❌ Erreur calcul classement:', error);
            throw error;
        }
    },

    // ========================================
    // MODULE VIDEO AI
    // ========================================

    async createVideoAnalysis(analysis) {
        console.log('🎥 Création analyse vidéo:', analysis);

        const response = await fetch(`${this.supabaseUrl}/rest/v1/video_analyses`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                member_id: analysis.memberId,
                session_id: analysis.sessionId || null,
                video_url: analysis.videoUrl,
                exercise_type: analysis.exerciseType || null,
                upload_date: analysis.uploadDate || new Date().toISOString(),
                status: analysis.status || 'pending',
                analysis_result: analysis.analysisResult || null,
                feedback: analysis.feedback || null,
                score: analysis.score || null,
                notes: analysis.notes || null
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur création analyse vidéo: ${response.status} - ${error}`);
        }

        const data = await response.json();
        this.invalidateCache('video');
        console.log('✅ Analyse vidéo créée:', data);
        return data[0];
    },

    async getVideoAnalyses(memberId = null, status = null) {
        console.log('🎥 Récupération analyses vidéo:', memberId, status);

        let url = `${this.supabaseUrl}/rest/v1/video_analyses?select=*,members(name)&order=upload_date.desc`;

        if (memberId) {
            url += `&member_id=eq.${memberId}`;
        }
        if (status) {
            url += `&status=eq.${status}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: this.headers
        });

        if (!response.ok) {
            throw new Error(`Erreur chargement analyses vidéo: ${response.status}`);
        }

        const analyses = await response.json();
        console.log('✅ Analyses vidéo récupérées:', analyses.length);
        return analyses;
    },

    async updateVideoAnalysis(analysisId, updates) {
        console.log('🎥 Mise à jour analyse vidéo:', analysisId, updates);

        const updateData = {
            updated_at: new Date().toISOString()
        };

        if (updates.status !== undefined) {
            updateData.status = updates.status;
        }
        if (updates.analysisResult !== undefined) {
            updateData.analysis_result = updates.analysisResult;
        }
        if (updates.feedback !== undefined) {
            updateData.feedback = updates.feedback;
        }
        if (updates.score !== undefined) {
            updateData.score = updates.score;
        }
        if (updates.notes !== undefined) {
            updateData.notes = updates.notes;
        }

        const response = await fetch(
            `${this.supabaseUrl}/rest/v1/video_analyses?id=eq.${analysisId}`,
            {
                method: 'PATCH',
                headers: this.headers,
                body: JSON.stringify(updateData)
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur mise à jour analyse vidéo: ${response.status} - ${error}`);
        }

        this.invalidateCache('video');
        console.log('✅ Analyse vidéo mise à jour:', analysisId);
        return await response.json();
    },

    async savePoseDetection(detection) {
        console.log('🤸 Sauvegarde détection pose:', detection);

        const response = await fetch(`${this.supabaseUrl}/rest/v1/pose_detections`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                video_analysis_id: detection.videoAnalysisId,
                frame_number: detection.frameNumber,
                timestamp: detection.timestamp,
                keypoints: detection.keypoints || [],
                pose_score: detection.poseScore || null,
                issues_detected: detection.issuesDetected || [],
                recommendations: detection.recommendations || []
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur sauvegarde détection pose: ${response.status} - ${error}`);
        }

        const data = await response.json();
        console.log('✅ Détection pose sauvegardée:', data);
        return data[0];
    },

    async getPoseDetections(analysisId, frameRange = null) {
        console.log('🤸 Récupération détections pose:', analysisId, frameRange);

        let url = `${this.supabaseUrl}/rest/v1/pose_detections?video_analysis_id=eq.${analysisId}&order=frame_number.asc`;

        if (frameRange) {
            if (frameRange.start !== undefined) {
                url += `&frame_number=gte.${frameRange.start}`;
            }
            if (frameRange.end !== undefined) {
                url += `&frame_number=lte.${frameRange.end}`;
            }
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: this.headers
        });

        if (!response.ok) {
            throw new Error(`Erreur chargement détections pose: ${response.status}`);
        }

        const detections = await response.json();
        console.log('✅ Détections pose récupérées:', detections.length);
        return detections;
    },

    async getVideoAnalysisStats(memberId) {
        console.log('📊 Récupération stats analyses vidéo:', memberId);

        try {
            const analyses = await this.getVideoAnalyses(memberId);

            const stats = {
                total: analyses.length,
                pending: analyses.filter(a => a.status === 'pending').length,
                completed: analyses.filter(a => a.status === 'completed').length,
                failed: analyses.filter(a => a.status === 'failed').length,
                avgScore: 0,
                exerciseBreakdown: {}
            };

            // Calculer score moyen
            const scoredAnalyses = analyses.filter(a => a.score !== null);
            if (scoredAnalyses.length > 0) {
                stats.avgScore =
                    scoredAnalyses.reduce((sum, a) => sum + a.score, 0) / scoredAnalyses.length;
            }

            // Breakdown par exercice
            analyses.forEach(a => {
                if (a.exercise_type) {
                    if (!stats.exerciseBreakdown[a.exercise_type]) {
                        stats.exerciseBreakdown[a.exercise_type] = 0;
                    }
                    stats.exerciseBreakdown[a.exercise_type]++;
                }
            });

            console.log('✅ Stats analyses vidéo calculées:', stats);
            return stats;
        } catch (error) {
            console.error('❌ Erreur calcul stats vidéo:', error);
            throw error;
        }
    },

    // ========================================
    // MODULE POKEMON CARDS
    // ========================================

    async createPokemonCard(card) {
        console.log('⚡ Création carte Pokemon:', card);

        const response = await fetch(`${this.supabaseUrl}/rest/v1/pokemon_cards`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                member_id: card.memberId,
                pokemon_name: card.pokemonName || 'Pikachu',
                pokemon_type: card.pokemonType || 'electric',
                level: card.level || 1,
                experience: card.experience || 0,
                hp_stat: card.hpStat || 50,
                attack_stat: card.attackStat || 50,
                defense_stat: card.defenseStat || 50,
                speed_stat: card.speedStat || 50,
                special_stat: card.specialStat || 50,
                total_workouts: card.totalWorkouts || 0,
                total_prs: card.totalPrs || 0,
                evolution_stage: card.evolutionStage || 1,
                card_image_url: card.cardImageUrl || null
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur création carte Pokemon: ${response.status} - ${error}`);
        }

        const data = await response.json();
        this.invalidateCache('pokemon');
        console.log('✅ Carte Pokemon créée:', data);
        return data[0];
    },

    async getPokemonCard(memberId) {
        console.log('⚡ Récupération carte Pokemon:', memberId);

        const response = await fetch(
            `${this.supabaseUrl}/rest/v1/pokemon_cards?member_id=eq.${memberId}&select=*`,
            {
                method: 'GET',
                headers: this.headers
            }
        );

        if (!response.ok) {
            throw new Error(`Erreur chargement carte Pokemon: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Carte Pokemon récupérée:', data[0]);
        return data[0] || null;
    },

    async updatePokemonCard(cardId, updates) {
        console.log('⚡ Mise à jour carte Pokemon:', cardId, updates);

        const updateData = {
            updated_at: new Date().toISOString()
        };

        if (updates.pokemonName !== undefined) {
            updateData.pokemon_name = updates.pokemonName;
        }
        if (updates.pokemonType !== undefined) {
            updateData.pokemon_type = updates.pokemonType;
        }
        if (updates.level !== undefined) {
            updateData.level = updates.level;
        }
        if (updates.experience !== undefined) {
            updateData.experience = updates.experience;
        }
        if (updates.hpStat !== undefined) {
            updateData.hp_stat = updates.hpStat;
        }
        if (updates.attackStat !== undefined) {
            updateData.attack_stat = updates.attackStat;
        }
        if (updates.defenseStat !== undefined) {
            updateData.defense_stat = updates.defenseStat;
        }
        if (updates.speedStat !== undefined) {
            updateData.speed_stat = updates.speedStat;
        }
        if (updates.specialStat !== undefined) {
            updateData.special_stat = updates.specialStat;
        }
        if (updates.totalWorkouts !== undefined) {
            updateData.total_workouts = updates.totalWorkouts;
        }
        if (updates.totalPrs !== undefined) {
            updateData.total_prs = updates.totalPrs;
        }
        if (updates.evolutionStage !== undefined) {
            updateData.evolution_stage = updates.evolutionStage;
        }
        if (updates.cardImageUrl !== undefined) {
            updateData.card_image_url = updates.cardImageUrl;
        }

        const response = await fetch(`${this.supabaseUrl}/rest/v1/pokemon_cards?id=eq.${cardId}`, {
            method: 'PATCH',
            headers: this.headers,
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur mise à jour carte Pokemon: ${response.status} - ${error}`);
        }

        this.invalidateCache('pokemon');
        console.log('✅ Carte Pokemon mise à jour:', cardId);
        return await response.json();
    },

    async updatePokemonStats(memberId) {
        console.log('⚡ Recalcul stats Pokemon depuis performances:', memberId);

        try {
            // Récupérer la carte et les performances
            const [card, performances] = await Promise.all([
                this.getPokemonCard(memberId),
                this.getPerformances(memberId)
            ]);

            if (!card) {
                throw new Error('Carte Pokemon non trouvée');
            }

            // Calculer nouvelles stats basées sur performances
            const totalWorkouts = performances.length;
            const totalPrs = performances.filter(p => p.is_pr).length;

            // Calculer niveau basé sur nombre de performances
            const level = this.calculatePokemonLevel(totalWorkouts);

            // Calculer stats basées sur performances récentes
            const recentPerfs = performances.slice(0, 20); // 20 dernières perfs
            const avgValue =
                recentPerfs.reduce((sum, p) => sum + (p.value || 0), 0) / (recentPerfs.length || 1);

            const updates = {
                totalWorkouts,
                totalPrs,
                level,
                experience: totalWorkouts * 100,
                attackStat: Math.min(100, 50 + Math.floor(totalPrs * 2)),
                defenseStat: Math.min(100, 50 + Math.floor(totalWorkouts / 10)),
                speedStat: Math.min(100, 50 + Math.floor(avgValue / 10)),
                hpStat: Math.min(100, 50 + Math.floor(level * 3)),
                specialStat: Math.min(100, 50 + Math.floor((totalPrs + totalWorkouts) / 20))
            };

            const updatedCard = await this.updatePokemonCard(card.id, updates);
            console.log('✅ Stats Pokemon recalculées:', updatedCard);
            return updatedCard;
        } catch (error) {
            console.error('❌ Erreur recalcul stats Pokemon:', error);
            throw error;
        }
    },

    async saveStatsSnapshot(cardId, reason = 'manual') {
        console.log('📸 Sauvegarde snapshot stats:', cardId, reason);

        try {
            // Récupérer carte actuelle
            const response = await fetch(
                `${this.supabaseUrl}/rest/v1/pokemon_cards?id=eq.${cardId}`,
                {
                    method: 'GET',
                    headers: this.headers
                }
            );

            if (!response.ok) {
                throw new Error('Carte non trouvée');
            }

            const cards = await response.json();
            const card = cards[0];

            // Créer snapshot
            const snapshotResponse = await fetch(
                `${this.supabaseUrl}/rest/v1/pokemon_stats_snapshots`,
                {
                    method: 'POST',
                    headers: this.headers,
                    body: JSON.stringify({
                        card_id: cardId,
                        snapshot_date: new Date().toISOString(),
                        level: card.level,
                        experience: card.experience,
                        hp_stat: card.hp_stat,
                        attack_stat: card.attack_stat,
                        defense_stat: card.defense_stat,
                        speed_stat: card.speed_stat,
                        special_stat: card.special_stat,
                        total_workouts: card.total_workouts,
                        total_prs: card.total_prs,
                        evolution_stage: card.evolution_stage,
                        snapshot_reason: reason
                    })
                }
            );

            if (!snapshotResponse.ok) {
                const error = await snapshotResponse.text();
                throw new Error(
                    `Erreur sauvegarde snapshot: ${snapshotResponse.status} - ${error}`
                );
            }

            const snapshot = await snapshotResponse.json();
            console.log('✅ Snapshot sauvegardé:', snapshot);
            return snapshot[0];
        } catch (error) {
            console.error('❌ Erreur sauvegarde snapshot:', error);
            throw error;
        }
    },

    async getPokemonLeaderboard(limit = 20) {
        console.log('🏆 Récupération classement Pokemon:', limit);

        const response = await fetch(
            `${this.supabaseUrl}/rest/v1/pokemon_cards?select=*,members(name)&order=level.desc,experience.desc&limit=${limit}`,
            {
                method: 'GET',
                headers: this.headers
            }
        );

        if (!response.ok) {
            throw new Error(`Erreur chargement classement Pokemon: ${response.status}`);
        }

        const leaderboard = await response.json();

        // Calculer total power pour chaque carte
        const enrichedLeaderboard = leaderboard.map((card, index) => ({
            ...card,
            rank: index + 1,
            totalPower:
                card.hp_stat +
                card.attack_stat +
                card.defense_stat +
                card.speed_stat +
                card.special_stat,
            memberName: card.members?.name || 'Inconnu'
        }));

        console.log('✅ Classement Pokemon récupéré:', enrichedLeaderboard.length);
        return enrichedLeaderboard;
    },

    calculatePokemonLevel(performanceCount) {
        console.log('⚡ Calcul niveau Pokemon:', performanceCount);

        // Formule: 1 niveau tous les 10 entraînements, max 100
        const level = Math.min(100, Math.floor(performanceCount / 10) + 1);

        console.log('✅ Niveau calculé:', level);
        return level;
    },

    // ========================================
    // MIGRATION DEPUIS LOCALSTORAGE
    // ========================================

    async migrateFromLocalStorage() {
        console.log('🔄 Migration depuis localStorage...');

        if (typeof DataManager === 'undefined' || !DataManager.workoutData) {
            console.error('❌ DataManager non disponible');
            alert('❌ Erreur: DataManager non disponible pour la migration');
            return false;
        }

        const localData = DataManager.workoutData;
        const members = Object.values(localData.members || {});

        console.log(`📦 ${members.length} membres à migrer`);

        let success = 0;
        let errors = 0;

        for (const member of members) {
            try {
                await this.createMember({
                    firstName: member.firstName,
                    lastName: member.lastName,
                    gender: member.gender,
                    height: member.height,
                    weight: member.weight
                });
                success++;
            } catch (error) {
                console.error('❌ Erreur migration membre:', member.firstName, error);
                errors++;
            }
        }

        console.log(`✅ Migration terminée: ${success} succès, ${errors} erreurs`);
        alert(`Migration terminée:\n${success} membres migrés\n${errors} erreurs`);

        return errors === 0;
    },

    // ==================== NUTRITION PRO ====================

    /**
     * Récupérer les mesures d'un membre
     * @param memberId
     */
    async getMemberMeasurements(memberId) {
        console.log('📏 Récupération mesures membre:', memberId);

        const response = await fetch(
            `${this.supabaseUrl}/rest/v1/member_measurements?member_id=eq.${memberId}&order=measured_at.desc`,
            {
                method: 'GET',
                headers: this.headers
            }
        );

        if (!response.ok) {
            throw new Error(`Erreur chargement mesures: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Mesures récupérées:', data.length);
        return data;
    },

    /**
     * Ajouter une mesure
     * @param memberId
     * @param measurementData
     */
    async addMemberMeasurement(memberId, measurementData) {
        console.log('📏 Ajout mesure:', memberId, measurementData);

        const response = await fetch(`${this.supabaseUrl}/rest/v1/member_measurements`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                member_id: memberId,
                weight_kg: measurementData.weight_kg,
                body_fat_percentage: measurementData.body_fat_percentage || null,
                muscle_mass_kg: measurementData.muscle_mass_kg || null,
                measurement_type: measurementData.measurement_type || 'manual',
                notes: measurementData.notes || null
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur ajout mesure: ${response.status} - ${error}`);
        }

        const data = await response.json();
        console.log('✅ Mesure ajoutée:', data);
        return data[0];
    },

    /**
     * Créer un plan nutritionnel
     * @param planData
     */
    async createNutritionPlan(planData) {
        console.log('🥗 Création plan nutritionnel:', planData);

        // Utiliser le VRAI nom de table: member_nutrition_pdfs (pas nutrition_plans)
        const response = await fetch(`${this.supabaseUrl}/rest/v1/member_nutrition_pdfs`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(planData)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur création plan: ${response.status} - ${error}`);
        }

        const data = await response.json();
        console.log('✅ Plan créé:', data);
        return data[0];
    },

    /**
     * Créer un bucket Storage s'il n'existe pas
     * @param bucketName
     */
    async ensureBucketExists(bucketName) {
        console.log(`🪣 Vérification bucket: ${bucketName}`);

        try {
            // Lister les buckets existants
            const { data: buckets, error: listError } = await this.supabase.storage.listBuckets();

            if (listError) {
                console.error('❌ Erreur listing buckets:', listError);
                throw listError;
            }

            // Vérifier si le bucket existe
            const bucketExists = buckets.some(b => b.name === bucketName);

            if (bucketExists) {
                console.log(`✅ Bucket ${bucketName} existe déjà`);
                return true;
            }

            // Créer le bucket s'il n'existe pas
            console.log(`🆕 Création du bucket ${bucketName}...`);
            const { data, error } = await this.supabase.storage.createBucket(bucketName, {
                public: true,
                fileSizeLimit: 10485760, // 10MB
                allowedMimeTypes: ['application/pdf']
            });

            if (error) {
                console.error('❌ Erreur création bucket:', error);
                throw error;
            }

            console.log(`✅ Bucket ${bucketName} créé avec succès`);
            return true;
        } catch (error) {
            console.error('❌ Erreur gestion bucket:', error);
            throw error;
        }
    },

    /**
     * Upload un fichier vers Supabase Storage
     * @param bucket
     * @param filePath
     * @param file
     */
    async uploadToStorage(bucket, filePath, file) {
        console.log(`📤 Upload vers Storage - Bucket: ${bucket}, Path: ${filePath}`);

        // Vérifier que le client Supabase existe
        if (!this.supabase) {
            throw new Error('Client Supabase non initialisé');
        }

        try {
            // S'assurer que le bucket existe
            await this.ensureBucketExists(bucket);

            // Upload le fichier
            const { data, error } = await this.supabase.storage
                .from(bucket)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (error) {
                console.error('❌ Erreur upload Storage:', error);
                throw error;
            }

            console.log('✅ Fichier uploadé:', data);

            // Récupérer l'URL publique
            const { data: urlData } = this.supabase.storage.from(bucket).getPublicUrl(filePath);

            console.log('✅ URL publique:', urlData.publicUrl);
            return urlData.publicUrl;
        } catch (error) {
            console.error('❌ Erreur upload:', error);
            throw error;
        }
    },

    /**
     * Upload un PDF de programme vers Storage
     * @param memberId
     * @param file
     */
    async uploadProgramPDF(memberId, file) {
        console.log('📄 Upload PDF programme:', memberId, file.name);

        // Créer un nom de fichier unique
        const timestamp = Date.now();
        const fileName = `program-${memberId}-${timestamp}.pdf`;
        const filePath = `${memberId}/${fileName}`;

        // Upload vers le bucket training-programs
        const publicUrl = await this.uploadToStorage('training-programs', filePath, file);

        console.log('✅ PDF programme uploadé:', publicUrl);
        return publicUrl;
    },

    /**
     * Upload un PDF de nutrition vers Storage
     * @param memberId
     * @param file
     */
    async uploadNutritionPDF(memberId, file) {
        console.log('📄 Upload PDF nutrition:', memberId, file.name);

        // Créer un nom de fichier unique
        const timestamp = Date.now();
        const fileName = `nutrition-${memberId}-${timestamp}.pdf`;
        const filePath = `${memberId}/${fileName}`;

        // Upload vers le bucket nutrition-pdfs (nom correct!)
        const publicUrl = await this.uploadToStorage('nutrition-pdfs', filePath, file);

        console.log('✅ PDF nutrition uploadé:', publicUrl);
        return publicUrl;
    },

    /**
     * Lister les fichiers dans un bucket Storage
     * @param bucketName
     * @param path
     */
    async listStorageFiles(bucketName, path = '') {
        console.log(`📂 Listing fichiers - Bucket: ${bucketName}, Path: ${path}`);

        try {
            const { data, error } = await this.supabase.storage.from(bucketName).list(path, {
                limit: 100,
                offset: 0,
                sortBy: { column: 'created_at', order: 'desc' }
            });

            if (error) {
                console.error('❌ Erreur listing fichiers:', error);
                throw error;
            }

            console.log('✅ Fichiers trouvés:', data.length);
            return data;
        } catch (error) {
            console.error('❌ Erreur listing Storage:', error);
            throw error;
        }
    },

    /**
     * Lister tous les buckets Storage
     */
    async listAllBuckets() {
        console.log('🪣 Listing tous les buckets...');

        try {
            const { data: buckets, error } = await this.supabase.storage.listBuckets();

            if (error) {
                console.error('❌ Erreur listing buckets:', error);
                throw error;
            }

            console.log('✅ Buckets trouvés:', buckets.length);
            console.table(
                buckets.map(b => ({
                    Nom: b.name,
                    Public: b.public ? 'Oui' : 'Non',
                    Créé: new Date(b.created_at).toLocaleString('fr-FR')
                }))
            );

            // Pour chaque bucket, lister les fichiers
            for (const bucket of buckets) {
                console.log(`\n📦 Contenu du bucket "${bucket.name}":`);
                try {
                    const files = await this.listStorageFiles(bucket.name);
                    if (files.length > 0) {
                        console.table(
                            files.slice(0, 10).map(f => ({
                                Nom: f.name,
                                Taille: `${(f.metadata?.size / 1024).toFixed(2)} KB`,
                                Créé: new Date(f.created_at).toLocaleString('fr-FR')
                            }))
                        );
                    } else {
                        console.log('  Vide');
                    }
                } catch (error) {
                    console.log('  Erreur lecture:', error.message);
                }
            }

            return buckets;
        } catch (error) {
            console.error('❌ Erreur listing buckets:', error);
            throw error;
        }
    },

    /**
     * Récupérer les plans nutritionnels d'un membre
     * @param memberId
     */
    async getMemberNutritionPlans(memberId) {
        console.log('🥗 Récupération plans nutrition:', memberId);

        // Utiliser le VRAI nom de table: member_nutrition_pdfs
        const response = await fetch(
            `${this.supabaseUrl}/rest/v1/member_nutrition_pdfs?member_id=eq.${memberId}&order=created_at.desc`,
            {
                method: 'GET',
                headers: this.headers
            }
        );

        if (!response.ok) {
            throw new Error(`Erreur chargement plans: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Plans récupérés:', data.length);
        return data;
    }
};

// Fonction pour attendre que window.supabase soit disponible
function waitForSupabase(callback, attempts = 0) {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        console.log('✅ window.supabase disponible, initialisation SupabaseManager...');
        callback();
    } else if (attempts < 50) {
        // Max 5 secondes (50 x 100ms)
        console.log(`⏳ Attente du CDN Supabase... (tentative ${attempts + 1}/50)`);
        setTimeout(() => waitForSupabase(callback, attempts + 1), 100);
    } else {
        console.error('❌ TIMEOUT : window.supabase non disponible après 5 secondes');
        console.error('💡 Vérifiez que le CDN Supabase est bien chargé AVANT supabasemanager.js');
        callback(); // Initialiser quand même, mais supabase sera null
    }
}

// Auto-initialisation quand le script est chargé
console.log(
    '📜 Script SupabaseManager chargé (Nouvelle Architecture), état DOM:',
    document.readyState
);

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        console.log('🚀 DOM chargé, attente du CDN Supabase...');
        waitForSupabase(() => SupabaseManager.init());
    });
} else {
    // Le DOM est déjà chargé
    console.log('🚀 DOM déjà chargé, attente du CDN Supabase...');
    waitForSupabase(() => SupabaseManager.init());
}

// Exposer globalement
window.SupabaseManager = SupabaseManager;
