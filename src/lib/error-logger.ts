/**
 * ErrorLogger - Capture et envoi des erreurs vers l'API
 *
 * Utilisation:
 * - Automatique: Le composant ErrorBoundary capture les erreurs React
 * - Manuel: errorLogger.log('message', { type: 'error', metadata: {...} })
 */

type ErrorType = 'error' | 'warning' | 'info';

interface LogOptions {
  type?: ErrorType;
  stack?: string;
  metadata?: Record<string, unknown>;
}

class ErrorLogger {
  private isInitialized = false;
  private userRole: string | null = null;

  /**
   * Initialise le logger avec capture automatique des erreurs
   */
  init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    // Capturer les erreurs JavaScript non gérées
    window.onerror = (message, source, lineno, colno, error) => {
      this.log(String(message), {
        type: 'error',
        stack: error?.stack,
        metadata: {
          source,
          line: lineno,
          column: colno,
        },
      });
      return false; // Laisser l'erreur se propager
    };

    // Capturer les rejets de Promise non gérés
    window.onunhandledrejection = (event) => {
      const error = event.reason;
      this.log(
        error?.message || 'Unhandled Promise rejection',
        {
          type: 'error',
          stack: error?.stack,
          metadata: {
            type: 'unhandledrejection',
          },
        }
      );
    };

    this.isInitialized = true;
    console.log('[ErrorLogger] Initialized');
  }

  /**
   * Définit le rôle de l'utilisateur pour le logging
   */
  setUserRole(role: string | null) {
    this.userRole = role;
  }

  /**
   * Log une erreur vers l'API
   */
  async log(message: string, options: LogOptions = {}) {
    const { type = 'error', stack, metadata = {} } = options;

    // Ne pas logger en développement sauf si explicitement activé
    if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_LOG_ERRORS) {
      console.log(`[ErrorLogger] ${type.toUpperCase()}: ${message}`, metadata);
      return;
    }

    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          error_type: type,
          stack,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          user_role: this.userRole,
          metadata,
        }),
      });
    } catch (err) {
      // Éviter les boucles infinies en cas d'erreur de logging
      console.error('[ErrorLogger] Failed to log error:', err);
    }
  }

  /**
   * Log une erreur (raccourci)
   */
  error(message: string, metadata?: Record<string, unknown>) {
    return this.log(message, { type: 'error', metadata });
  }

  /**
   * Log un warning
   */
  warn(message: string, metadata?: Record<string, unknown>) {
    return this.log(message, { type: 'warning', metadata });
  }

  /**
   * Log une info
   */
  info(message: string, metadata?: Record<string, unknown>) {
    return this.log(message, { type: 'info', metadata });
  }

  /**
   * Capture une erreur avec son stack trace
   */
  capture(error: Error, metadata?: Record<string, unknown>) {
    return this.log(error.message, {
      type: 'error',
      stack: error.stack,
      metadata: {
        ...metadata,
        name: error.name,
      },
    });
  }
}

// Instance singleton
export const errorLogger = new ErrorLogger();

// Hook pour utiliser dans les composants React
export function useErrorLogger() {
  return errorLogger;
}
