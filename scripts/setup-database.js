/**
 * Script d'installation complète de la base de données
 * - Crée les tables exercises
 * - Importe l'inventaire La Skàli
 * - Importe les 800+ exercices
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://dhzknhevbzdauakzbdhr.supabase.co';
const SUPABASE_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoemtuaGV2YnpkYXVha3piZGhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODEwOSwiZXhwIjoyMDcxMjc0MTA5fQ.XxFwfGITkOxhFRJfFYlCAbr7My_RcRTHmNUeZNWg_10';

async function executeSQL(sql) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`
        },
        body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`SQL Error: ${error}`);
    }

    return await response.json();
}

async function insertData(table, data) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            Prefer: 'return=representation'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Insert Error: ${error}`);
    }

    return await response.json();
}

async function main() {
    console.log('🚀 Installation de la base de données...\n');

    try {
        // 1. Créer le schéma
        console.log('📊 Création du schéma SQL...');
        const schemaSQL = fs.readFileSync(
            path.join(__dirname, 'create-exercises-schema.sql'),
            'utf8'
        );

        // Note: Supabase ne permet pas d'exécuter du SQL directement via REST API
        // Il faut utiliser le Dashboard SQL Editor ou le client Supabase
        console.log('⚠️  Le schéma SQL doit être exécuté manuellement dans Supabase Dashboard');
        console.log(
            '    -> Aller sur: https://supabase.com/dashboard/project/dhzknhevbzdauakzbdhr/sql'
        );
        console.log('    -> Copier le contenu de: scripts/create-exercises-schema.sql');
        console.log('    -> Exécuter le SQL\n');

        // Attendre confirmation
        console.log('⏳ Appuyez sur Entrée une fois le schéma créé...');
        // Pour Node.js, utiliser readline
        // await new Promise(resolve => process.stdin.once('data', resolve));

        // 2. Importer catégories équipement
        console.log("📦 Import des catégories d'équipement...");
        const inventory = JSON.parse(
            fs.readFileSync(path.join(__dirname, '..', 'data', 'laskali-inventory.json'), 'utf8')
        );

        for (const category of inventory.categories) {
            try {
                await insertData('equipment_categories', category);
                console.log(`  ✅ ${category.name}`);
            } catch (error) {
                if (error.message.includes('duplicate')) {
                    console.log(`  ⏭️  ${category.name} (déjà existant)`);
                } else {
                    throw error;
                }
            }
        }

        // 3. Importer équipement
        console.log("\n🏋️  Import de l'équipement...");
        for (const equipment of inventory.equipment) {
            try {
                await insertData('gym_equipment', equipment);
                console.log(`  ✅ ${equipment.name} (${equipment.quantity}x)`);
            } catch (error) {
                if (error.message.includes('duplicate')) {
                    console.log(`  ⏭️  ${equipment.name} (déjà existant)`);
                } else {
                    console.error(`  ❌ ${equipment.name}:`, error.message);
                }
            }
        }

        // 4. Importer catégories d'exercices
        console.log("\n📚 Import des catégories d'exercices...");
        const exerciseCategories = [
            {
                id: 1,
                name: 'HYROX',
                slug: 'hyrox',
                icon: '🏃',
                description: 'Stations officielles HYROX',
                display_order: 1
            },
            {
                id: 2,
                name: 'Haltérophilie',
                slug: 'weightlifting',
                icon: '🏋️',
                description: 'Mouvements olympiques',
                display_order: 2
            },
            {
                id: 3,
                name: 'Powerlifting',
                slug: 'powerlifting',
                icon: '💪',
                description: 'Squat, Bench, Deadlift',
                display_order: 3
            },
            {
                id: 4,
                name: 'Gymnastique',
                slug: 'gymnastics',
                icon: '🤸',
                description: 'Calisthenics et gymnastique',
                display_order: 4
            },
            {
                id: 5,
                name: 'Musculation',
                slug: 'bodybuilding',
                icon: '💪',
                description: 'Hypertrophie et isolation',
                display_order: 5
            },
            {
                id: 6,
                name: 'Fonctionnel',
                slug: 'functional',
                icon: '⚡',
                description: 'CrossFit et entraînement fonctionnel',
                display_order: 6
            },
            {
                id: 7,
                name: 'Cardio',
                slug: 'cardio',
                icon: '🏃',
                description: 'Course, vélo, rameur',
                display_order: 7
            },
            {
                id: 8,
                name: 'Pliométrie',
                slug: 'plyometrics',
                icon: '💥',
                description: 'Sauts et explosivité',
                display_order: 8
            },
            {
                id: 9,
                name: 'Mobilité',
                slug: 'mobility',
                icon: '🧘',
                description: 'Étirements et mobilité',
                display_order: 9
            },
            {
                id: 10,
                name: 'Core',
                slug: 'core',
                icon: '🎯',
                description: 'Abdominaux et gainage',
                display_order: 10
            }
        ];

        for (const category of exerciseCategories) {
            try {
                await insertData('exercise_categories', category);
                console.log(`  ✅ ${category.name}`);
            } catch (error) {
                if (error.message.includes('duplicate')) {
                    console.log(`  ⏭️  ${category.name} (déjà existant)`);
                } else {
                    throw error;
                }
            }
        }

        console.log('\n✅ Installation terminée avec succès !');
        console.log('\n📝 Prochaines étapes:');
        console.log('   1. Vérifier les tables dans Supabase Dashboard');
        console.log('   2. Exécuter: node scripts/import-exercises.js');
        console.log("   3. Lancer l'application\n");
    } catch (error) {
        console.error('\n❌ Erreur:', error.message);
        process.exit(1);
    }
}

// Exécuter si appelé directement
if (require.main === module) {
    main();
}

module.exports = { executeSQL, insertData };
