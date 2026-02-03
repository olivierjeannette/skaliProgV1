/**
 * Script d'import des exercices dans Supabase
 * SIMPLE ET RAPIDE
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://dhzknhevbzdauakzbdhr.supabase.co';
const SUPABASE_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoemtuaGV2YnpkYXVha3piZGhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODEwOSwiZXhwIjoyMDcxMjc0MTA5fQ.XxFwfGITkOxhFRJfFYlCAbr7My_RcRTHmNUeZNWg_10';

async function insertExercises(exercises) {
    console.log(`📚 Import de ${exercises.length} exercices...`);

    let success = 0;
    let skipped = 0;
    let errors = 0;

    for (const exercise of exercises) {
        // Skip les commentaires
        if (exercise.comment) {
            continue;
        }

        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/exercises`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`,
                    Prefer: 'return=representation'
                },
                body: JSON.stringify(exercise)
            });

            if (response.ok) {
                success++;
                process.stdout.write(
                    `\r✅ Importé: ${success} | ⏭️  Ignoré: ${skipped} | ❌ Erreurs: ${errors}`
                );
            } else {
                const error = await response.text();
                if (error.includes('duplicate') || error.includes('unique')) {
                    skipped++;
                } else {
                    errors++;
                    console.error(`\n❌ Erreur sur ${exercise.name}:`, error);
                }
            }
        } catch (error) {
            errors++;
            console.error(`\n❌ Exception sur ${exercise.name}:`, error.message);
        }

        // Petit délai pour ne pas surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log('\n\n📊 RÉSUMÉ:');
    console.log(`   ✅ Importés: ${success}`);
    console.log(`   ⏭️  Ignorés (déjà existants): ${skipped}`);
    console.log(`   ❌ Erreurs: ${errors}`);

    return { success, skipped, errors };
}

async function main() {
    console.log('🚀 Import des exercices dans Supabase\n');

    try {
        // Charger les exercices
        const exercisesPath = path.join(__dirname, '..', 'data', 'exercises-complete.json');
        const data = JSON.parse(fs.readFileSync(exercisesPath, 'utf8'));

        console.log(
            `📖 ${data.exercises.length} exercices chargés depuis exercises-complete.json\n`
        );

        // Import
        const result = await insertExercises(data.exercises);

        if (result.success > 0) {
            console.log('\n✅ Import terminé avec succès!\n');
            console.log(
                "💡 Prochaine étape: Ouvrir l'application et aller dans Configuration → Mouvements\n"
            );
        } else {
            console.log('\n⚠️  Aucun exercice importé. Ils existent peut-être déjà.\n');
        }
    } catch (error) {
        console.error('\n❌ Erreur:', error.message);
        console.error('\n💡 Vérifiez que:');
        console.error('   1. Les tables ont été créées dans Supabase (EXECUTE-IN-SUPABASE.sql)');
        console.error('   2. Le fichier exercises-complete.json existe');
        console.error('   3. La connexion Supabase fonctionne\n');
        process.exit(1);
    }
}

// Exécuter
if (require.main === module) {
    main();
}

module.exports = { insertExercises };
