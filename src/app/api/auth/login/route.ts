import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { UserRole } from '@/types';

// Créer un client Supabase avec la clé service pour accéder aux settings
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Missing Supabase configuration');
  }

  return createClient(url, serviceKey);
}

// Simple hash comparison (en production, utiliser bcrypt)
async function verifyPassword(input: string, storedHash: string): Promise<boolean> {
  // Si le hash stocké commence par '$2', c'est un hash bcrypt
  // Sinon, on compare en clair (pour la migration)
  if (storedHash.startsWith('$2')) {
    // TODO: Implémenter bcrypt.compare quand le package est installé
    // Pour l'instant, on refuse la connexion si c'est hashé
    return false;
  }

  // Comparaison simple pour la phase de migration
  // IMPORTANT: Remplacer par bcrypt une fois les passwords migrés
  return input === storedHash;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, password } = body as { role: UserRole; password: string };

    // Vérifier le rôle
    if (!role || !['ADMIN', 'COACH', 'ATHLETE'].includes(role)) {
      return NextResponse.json(
        { success: false, message: 'Rôle invalide' },
        { status: 400 }
      );
    }

    // Récupérer le mot de passe depuis Supabase settings
    const supabase = getSupabaseAdmin();

    const settingKey = `auth_password_${role.toLowerCase()}`;
    const { data: setting, error } = await supabase
      .from('settings')
      .select('setting_value')
      .eq('setting_key', settingKey)
      .single();

    if (error || !setting) {
      console.error('Error fetching password setting:', error);
      return NextResponse.json(
        { success: false, message: 'Configuration manquante. Contactez l\'administrateur.' },
        { status: 500 }
      );
    }

    // Vérifier le mot de passe
    const isValid = await verifyPassword(password, setting.setting_value);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Créer la session
    const session = {
      isAuthenticated: true,
      role,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24h
    };

    // Créer la réponse avec cookie
    const response = NextResponse.json({ success: true, session });

    // Set cookie httpOnly pour la session
    response.cookies.set('skali-session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24h
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
