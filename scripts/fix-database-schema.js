// ================================================================
// SCRIPT DE CORRECTION DU SCHÉMA DE BASE DE DONNÉES
// Exécute les modifications SQL directement sur Supabase
// ================================================================

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (depuis ENV)
const SUPABASE_URL = 'https://dhzknhevbzdauakzbdhr.supabase.co';
const SUPABASE_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoemtuaGV2YnpkYXVha3piZGhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTgxMDksImV4cCI6MjA3MTI3NDEwOX0.5L-qsdi8a5Ov7RufgXQQgG27rtAlvIvbG6mZ_fVOk2k';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// SQL à exécuter (avec lowercase column names)
const SQL_QUERIES = [
    // 1. Créer ou modifier la table members
    `
    CREATE TABLE IF NOT EXISTS members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        firstname TEXT,
        lastname TEXT,
        email TEXT,
        phone TEXT,
        birthdate DATE,
        gender TEXT,
        weight NUMERIC,
        height NUMERIC,
        avatar TEXT,
        discord_id TEXT UNIQUE,
        discord_username TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    `,

    // 2. Créer les index members
    'CREATE INDEX IF NOT EXISTS idx_members_discord_id ON members(discord_id);',
    'CREATE INDEX IF NOT EXISTS idx_members_name ON members(name);',
    'CREATE INDEX IF NOT EXISTS idx_members_firstname ON members(firstname);',

    // 3. Créer ou modifier la table performances
    `
    CREATE TABLE IF NOT EXISTS performances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
        exercise_type TEXT NOT NULL,
        category TEXT,
        value NUMERIC NOT NULL,
        unit TEXT,
        notes TEXT,
        date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    `,

    // 4. Créer les index performances
    'CREATE INDEX IF NOT EXISTS idx_performances_member_id ON performances(member_id);',
    'CREATE INDEX IF NOT EXISTS idx_performances_date ON performances(date DESC);',
    'CREATE INDEX IF NOT EXISTS idx_performances_exercise_type ON performances(exercise_type);',
    'CREATE INDEX IF NOT EXISTS idx_performances_category ON performances(category);',

    // 5. Créer la table pokemon_cards (nouvelle table)
    `
    CREATE TABLE IF NOT EXISTS pokemon_cards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
        cardio INTEGER DEFAULT 5 CHECK (cardio >= 0 AND cardio <= 100),
        force INTEGER DEFAULT 5 CHECK (force >= 0 AND force <= 100),
        gym INTEGER DEFAULT 5 CHECK (gym >= 0 AND gym <= 100),
        puissance INTEGER DEFAULT 5 CHECK (puissance >= 0 AND puissance <= 100),
        niveau INTEGER DEFAULT 1 CHECK (niveau >= 1 AND niveau <= 100),
        hp INTEGER DEFAULT 1 CHECK (hp >= 1 AND hp <= 100),
        pokemon_type VARCHAR(50) DEFAULT 'normal',
        evolution_stage VARCHAR(50) DEFAULT 'rookie',
        performance_count INTEGER DEFAULT 0,
        last_updated TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(member_id)
    );
    `,

    // 6. Créer la table sessions
    `
    CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        member_id UUID REFERENCES members(id) ON DELETE CASCADE,
        discord_id TEXT,
        token TEXT UNIQUE,
        expires_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );
    `,

    // 7. Créer les index sessions
    'CREATE INDEX IF NOT EXISTS idx_sessions_member_id ON sessions(member_id);',
    'CREATE INDEX IF NOT EXISTS idx_sessions_discord_id ON sessions(discord_id);',
    'CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);',

    // 8. Créer les vues
    `
    CREATE OR REPLACE VIEW pokemon_cards_full AS
    SELECT
        pc.*,
        m.name,
        m.firstname,
        m.lastname,
        m.gender,
        m.discord_id,
        m.discord_username,
        m.email
    FROM pokemon_cards pc
    INNER JOIN members m ON pc.member_id = m.id;
    `,

    `
    CREATE OR REPLACE VIEW pokemon_leaderboard AS
    SELECT
        m.firstname || ' ' || COALESCE(m.lastname, '') AS full_name,
        pc.niveau,
        pc.cardio,
        pc.force,
        pc.gym,
        pc.puissance,
        pc.pokemon_type,
        pc.evolution_stage,
        pc.performance_count,
        ROW_NUMBER() OVER (ORDER BY pc.niveau DESC, pc.performance_count DESC) AS rank
    FROM pokemon_cards pc
    INNER JOIN members m ON pc.member_id = m.id
    ORDER BY pc.niveau DESC, pc.performance_count DESC;
    `,

    // 9. Trigger updated_at
    `
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    `,

    'DROP TRIGGER IF EXISTS update_members_updated_at ON members;',
    `
    CREATE TRIGGER update_members_updated_at
        BEFORE UPDATE ON members
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `,

    'DROP TRIGGER IF EXISTS update_performances_updated_at ON performances;',
    `
    CREATE TRIGGER update_performances_updated_at
        BEFORE UPDATE ON performances
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `
];

async function executeSQL() {
    console.log('🚀 Démarrage de la modification du schéma de base de données...\n');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < SQL_QUERIES.length; i++) {
        const query = SQL_QUERIES[i].trim();

        if (!query) {
            continue;
        }

        // Afficher un aperçu de la requête
        const preview = query.substring(0, 60).replace(/\n/g, ' ') + '...';
        console.log(`[${i + 1}/${SQL_QUERIES.length}] Exécution: ${preview}`);

        try {
            const { data, error } = await supabase.rpc('exec_sql', { sql: query });

            if (error) {
                // Essayer avec la méthode directe si RPC échoue
                const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        apikey: SUPABASE_KEY,
                        Authorization: `Bearer ${SUPABASE_KEY}`
                    },
                    body: JSON.stringify({ query })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                console.log('  ✅ Succès\n');
                successCount++;
            } else {
                console.log('  ✅ Succès\n');
                successCount++;
            }
        } catch (error) {
            console.error(`  ❌ Erreur: ${error.message}\n`);
            errorCount++;
        }

        // Petit délai pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Succès: ${successCount}`);
    console.log(`❌ Erreurs: ${errorCount}`);
    console.log('='.repeat(60));

    if (errorCount === 0) {
        console.log('\n🎉 Schéma de base de données mis à jour avec succès !');
        console.log(
            '\nProchaine étape: Exécuter le script de calcul automatique des cartes Pokémon'
        );
    } else {
        console.log('\n⚠️ Certaines requêtes ont échoué. Vérifiez les erreurs ci-dessus.');
    }
}

// Exécuter
executeSQL().catch(console.error);
