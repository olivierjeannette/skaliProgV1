import { NextRequest, NextResponse } from 'next/server';

// TODO: Remplacer par Supabase une fois configuré
// Pour l'instant, stockage en mémoire (sera perdu au redémarrage)
let apiKeysStore: Record<string, string> = {};

export async function GET() {
  try {
    // TODO: Charger depuis Supabase
    // const supabase = createServerClient();
    // const { data, error } = await supabase.from('api_keys').select('key_name, key_value');

    return NextResponse.json({
      success: true,
      keys: apiKeysStore,
    });
  } catch (error) {
    console.error('Error loading API keys:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors du chargement' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keys, name, value } = body;

    // Mode batch (plusieurs clés)
    if (keys && typeof keys === 'object') {
      apiKeysStore = { ...apiKeysStore, ...keys };

      // TODO: Sauvegarder dans Supabase
      // for (const [key_name, key_value] of Object.entries(keys)) {
      //   await supabase.from('api_keys').upsert({ key_name, key_value });
      // }

      return NextResponse.json({ success: true });
    }

    // Mode single (une clé)
    if (name && value !== undefined) {
      apiKeysStore[name] = value;

      // TODO: Sauvegarder dans Supabase
      // await supabase.from('api_keys').upsert({ key_name: name, key_value: value });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, message: 'Paramètres invalides' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error saving API keys:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la sauvegarde' },
      { status: 500 }
    );
  }
}
