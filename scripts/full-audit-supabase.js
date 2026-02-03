// Audit complet de la base Supabase
const SUPABASE_URL = 'https://dhzknhevbzdauakzbdhr.supabase.co';
const SUPABASE_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoemtuaGV2YnpkYXVha3piZGhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTgxMDksImV4cCI6MjA3MTI3NDEwOX0.5L-qsdi8a5Ov7RufgXQQgG27rtAlvIvbG6mZ_fVOk2k';

async function fullAudit() {
    console.log('🔍 AUDIT COMPLET DE LA BASE DE DONNÉES SUPABASE\n');
    console.log('='.repeat(60));

    try {
        // 1. Vérifier la table pokemon_cards
        console.log('\n📋 TABLE POKEMON_CARDS:');
        console.log('-'.repeat(60));

        const cardsResponse = await fetch(`${SUPABASE_URL}/rest/v1/pokemon_cards?limit=1`, {
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`
            }
        });

        if (cardsResponse.ok) {
            const cards = await cardsResponse.json();

            if (cards.length > 0) {
                console.log('✅ Table existe et contient des données');
                console.log('Colonnes présentes:');
                Object.keys(cards[0]).forEach(col => {
                    const value = cards[0][col];
                    const type = typeof value;
                    console.log(`  • ${col}: ${type} = ${value}`);
                });
            } else {
                console.log('⚠️  Table existe mais est VIDE');

                // Essayer de voir la structure en faisant une requête avec select=*
                const structResponse = await fetch(
                    `${SUPABASE_URL}/rest/v1/pokemon_cards?select=*&limit=0`,
                    {
                        headers: {
                            apikey: SUPABASE_KEY,
                            Authorization: `Bearer ${SUPABASE_KEY}`,
                            Prefer: 'return=representation'
                        }
                    }
                );

                console.log('Status de la requête structure:', structResponse.status);
            }
        } else {
            console.log("❌ Table N'EXISTE PAS (code:", cardsResponse.status, ')');
        }

        // 2. Compter les membres et performances
        console.log('\n📊 STATISTIQUES:');
        console.log('-'.repeat(60));

        const membersCount = await fetch(`${SUPABASE_URL}/rest/v1/members?select=count`, {
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
                Prefer: 'count=exact'
            }
        });

        const perfsCount = await fetch(`${SUPABASE_URL}/rest/v1/performances?select=count`, {
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
                Prefer: 'count=exact'
            }
        });

        const membersCountHeader = membersCount.headers.get('content-range');
        const perfsCountHeader = perfsCount.headers.get('content-range');

        const totalMembers = membersCountHeader ? membersCountHeader.split('/')[1] : '?';
        const totalPerfs = perfsCountHeader ? perfsCountHeader.split('/')[1] : '?';

        console.log(`Membres: ${totalMembers}`);
        console.log(`Performances: ${totalPerfs}`);

        // 3. Exemple de performance pour voir les types d'exercices
        console.log('\n🏋️  EXEMPLE DE PERFORMANCES:');
        console.log('-'.repeat(60));

        const samplePerfs = await fetch(
            `${SUPABASE_URL}/rest/v1/performances?select=exercise_type,value,unit&limit=10`,
            {
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`
                }
            }
        );

        const perfs = await samplePerfs.json();
        if (perfs.length > 0) {
            perfs.forEach(p => {
                console.log(`  • ${p.exercise_type}: ${p.value} ${p.unit || ''}`);
            });
        } else {
            console.log('  Aucune performance trouvée');
        }

        // 4. Conclusion et recommandations
        console.log('\n' + '='.repeat(60));
        console.log('📝 CONCLUSION:');
        console.log('='.repeat(60));

        if (!cardsResponse.ok) {
            console.log("❌ La table pokemon_cards N'EXISTE PAS");
            console.log('   → Il faut créer la table avec CREATE TABLE');
        } else {
            const cards = await cardsResponse.json();
            if (cards.length === 0) {
                console.log('⚠️  La table pokemon_cards existe mais est VIDE');
                console.log('   → Il faut vérifier la structure et initialiser les cartes');
            } else {
                console.log('✅ La table pokemon_cards existe et contient des données');
                console.log('   → Le système est opérationnel');
            }
        }
    } catch (error) {
        console.error('❌ ERREUR:', error.message);
    }
}

fullAudit();
