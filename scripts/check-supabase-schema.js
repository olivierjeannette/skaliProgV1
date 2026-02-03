// Script pour vérifier le schéma exact de la base Supabase
const SUPABASE_URL = 'https://dhzknhevbzdauakzbdhr.supabase.co';
const SUPABASE_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoemtuaGV2YnpkYXVha3piZGhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTgxMDksImV4cCI6MjA3MTI3NDEwOX0.5L-qsdi8a5Ov7RufgXQQgG27rtAlvIvbG6mZ_fVOk2k';

async function checkSchema() {
    console.log('🔍 Vérification du schéma Supabase...\n');

    try {
        // 1. Récupérer un membre pour voir les colonnes
        console.log('1️⃣ Structure de la table MEMBERS:');
        const membersResponse = await fetch(`${SUPABASE_URL}/rest/v1/members?limit=1`, {
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`
            }
        });

        if (!membersResponse.ok) {
            throw new Error(`Erreur members: ${membersResponse.status}`);
        }

        const members = await membersResponse.json();
        if (members.length > 0) {
            console.log('Colonnes trouvées:');
            Object.keys(members[0]).forEach(col => {
                console.log(`  - ${col}: ${typeof members[0][col]}`);
            });
        } else {
            console.log('  Aucun membre trouvé');
        }

        console.log('\n2️⃣ Structure de la table PERFORMANCES:');
        const perfsResponse = await fetch(`${SUPABASE_URL}/rest/v1/performances?limit=1`, {
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`
            }
        });

        if (!perfsResponse.ok) {
            throw new Error(`Erreur performances: ${perfsResponse.status}`);
        }

        const perfs = await perfsResponse.json();
        if (perfs.length > 0) {
            console.log('Colonnes trouvées:');
            Object.keys(perfs[0]).forEach(col => {
                console.log(`  - ${col}: ${typeof perfs[0][col]}`);
            });
        } else {
            console.log('  Aucune performance trouvée');
        }

        console.log('\n3️⃣ Vérification table POKEMON_CARDS:');
        const cardsResponse = await fetch(`${SUPABASE_URL}/rest/v1/pokemon_cards?limit=1`, {
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`
            }
        });

        if (cardsResponse.ok) {
            const cards = await cardsResponse.json();
            if (cards.length > 0) {
                console.log('Table existe! Colonnes:');
                Object.keys(cards[0]).forEach(col => {
                    console.log(`  - ${col}: ${typeof cards[0][col]}`);
                });
            } else {
                console.log('  Table existe mais est vide');
            }
        } else {
            console.log("  Table n'existe pas encore (code:", cardsResponse.status, ')');
        }

        console.log('\n✅ Vérification terminée!');
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

checkSchema();
