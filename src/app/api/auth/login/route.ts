import { NextRequest, NextResponse } from 'next/server';
import type { UserRole } from '@/types';

// Récupérer le mot de passe depuis les variables d'environnement
// SÉCURISÉ: Les mots de passe ne sont plus stockés en base de données
function getPasswordFromEnv(role: string): string | null {
  const envKey = `AUTH_PASSWORD_${role.toUpperCase()}`;
  return process.env[envKey] || null;
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

    // Récupérer le mot de passe depuis les variables d'environnement
    const storedPassword = getPasswordFromEnv(role);

    if (!storedPassword) {
      console.error(`Missing password for role: ${role}. Set AUTH_PASSWORD_${role.toUpperCase()} in .env`);
      return NextResponse.json(
        { success: false, message: 'Configuration manquante. Contactez l\'administrateur.' },
        { status: 500 }
      );
    }

    // Vérifier le mot de passe
    const isValid = password === storedPassword;

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
