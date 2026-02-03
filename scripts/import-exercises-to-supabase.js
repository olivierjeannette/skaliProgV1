/**
 * Script pour importer exercises-complete.json dans Supabase
 * 326 exercices avec toutes les variantes
 */

const fs = require('fs');
const path = require('path');

// Import Supabase client (utiliser le même que l'app)
const SUPABASE_URL = 'https://dhzknhevbzdauakzbdhr.supabase.co';
const SUPABASE_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoemtuaGV2YnpkYXVha3piZGhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODEwOSwiZXhwIjoyMDcxMjc0MTA5fQ.XxFwfGITkOxhFRJfFYlCAbr7My_RcRTHmNUeZNWg_10';

async function importExercises() {
    console.log('🔄 Import des exercices dans Supabase...');

    try {
        // 1. Charger le JSON
        const jsonPath = path.join(__dirname, '..', 'data', 'exercises-complete.json');
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

        console.log(`✅ ${data.total_exercises} exercices chargés du JSON`);

        // 2. Filtrer uniquement les exercices (pas les comments)
        const exercises = data.exercises.filter(ex => ex.name && ex.slug);
        console.log(`📋 ${exercises.length} exercices à importer`);

        // 3. Préparer les données pour Supabase
        const exercisesForSupabase = exercises.map(ex => ({
            // Champs obligatoires
            name: ex.name,
            slug: ex.slug,
            category_id: ex.category_id,
            subcategory: ex.subcategory || 'general',
            level: ex.level || 'beginner',
            force_type: ex.force_type || 'push',
            mechanic: ex.mechanic || 'compound',

            // Tableaux JSON
            primary_muscles: ex.primary_muscles || [],
            secondary_muscles: ex.secondary_muscles || [],
            equipment_required: ex.equipment_required || [],
            typology_tags: ex.typology_tags || [],

            // Optionnels
            difficulty_rank: ex.difficulty_rank || 5,
            energy_system: ex.energy_system || 'mixed',
            can_do_without_equipment: ex.can_do_without_equipment || false,
            is_hyrox_station: ex.is_hyrox_station || false,
            hyrox_station_number: ex.hyrox_station_number || null,
            instructions: ex.instructions || [],
            coaching_tips: ex.coaching_tips || [],

            // Timestamps
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }));

        // 4. Import par batch (Supabase limite à 1000 par requête)
        const BATCH_SIZE = 100;
        let imported = 0;

        console.log("\n🚀 Début de l'import...");

        for (let i = 0; i < exercisesForSupabase.length; i += BATCH_SIZE) {
            const batch = exercisesForSupabase.slice(i, i + BATCH_SIZE);

            const response = await fetch(`${SUPABASE_URL}/rest/v1/exercises`, {
                method: 'POST',
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    Prefer: 'return=minimal'
                },
                body: JSON.stringify(batch)
            });

            if (!response.ok) {
                const error = await response.text();
                console.error(`❌ Erreur batch ${i}-${i + batch.length}:`, error);

                // Si erreur de doublon, essayer en mode upsert
                if (error.includes('duplicate') || error.includes('unique')) {
                    console.log('⚠️ Doublons détectés, tentative en mode upsert...');

                    // Insérer un par un en mode upsert
                    for (const ex of batch) {
                        const upsertResponse = await fetch(
                            `${SUPABASE_URL}/rest/v1/exercises?on_conflict=slug`,
                            {
                                method: 'POST',
                                headers: {
                                    apikey: SUPABASE_KEY,
                                    Authorization: `Bearer ${SUPABASE_KEY}`,
                                    'Content-Type': 'application/json',
                                    Prefer: 'resolution=merge-duplicates,return=minimal'
                                },
                                body: JSON.stringify(ex)
                            }
                        );

                        if (upsertResponse.ok) {
                            imported++;
                        }
                    }
                }
            } else {
                imported += batch.length;
            }

            console.log(`   ✓ ${imported}/${exercisesForSupabase.length} exercices importés`);
        }

        console.log('\n✅ TERMINÉ!');
        console.log(`   Total importé: ${imported}/${exercisesForSupabase.length}`);

        // 5. Vérification
        const verifyResponse = await fetch(`${SUPABASE_URL}/rest/v1/exercises?select=count`, {
            method: 'HEAD',
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
                Prefer: 'count=exact'
            }
        });

        const count = verifyResponse.headers.get('content-range')?.split('/')[1];
        console.log(`\n📊 Total dans Supabase: ${count} exercices`);
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

// Lancer l'import
importExercises();
