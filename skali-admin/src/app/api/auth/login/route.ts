import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_PASSWORDS } from '@/config/roles';
import type { UserRole } from '@/types';

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

    // Vérifier le mot de passe
    // TODO: Récupérer les mots de passe depuis Supabase settings
    const expectedPassword = DEFAULT_PASSWORDS[role];

    if (password !== expectedPassword) {
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
