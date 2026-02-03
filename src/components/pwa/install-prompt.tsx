'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Download, Share, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if user dismissed the prompt recently
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedAt = new Date(dismissed);
      const now = new Date();
      const daysSinceDismissed = (now.getTime() - dismissedAt.getTime()) / (1000 * 60 * 60 * 24);
      // Don't show again for 7 days
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Listen for beforeinstallprompt event (Chrome, Edge, etc.)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a short delay
      setTimeout(() => setShowPrompt(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For iOS, show the prompt after a delay if not standalone
    if (iOS && !standalone) {
      setTimeout(() => setShowPrompt(true), 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    setShowPrompt(false);
  };

  // Don't show if already installed
  if (isStandalone) return null;

  return (
    <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#228B22]">
              <span className="text-lg font-bold text-white">S</span>
            </div>
            Installer Skali Prog
          </DialogTitle>
          <DialogDescription>
            Installez l&apos;application pour un acces rapide et une meilleure experience !
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Benefits */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#228B22]" />
              <span>Acces rapide depuis l&apos;ecran d&apos;accueil</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#228B22]" />
              <span>Fonctionne meme hors ligne</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#228B22]" />
              <span>Notifications de seances</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#228B22]" />
              <span>Experience plein ecran</span>
            </div>
          </div>

          {isIOS ? (
            // iOS instructions
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="mb-2 font-medium">Comment installer sur iOS :</p>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#228B22] text-xs text-white">1</span>
                  <span>Appuyez sur <Share className="inline h-4 w-4" /> en bas de Safari</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#228B22] text-xs text-white">2</span>
                  <span>Faites defiler et selectionnez &quot;Sur l&apos;ecran d&apos;accueil&quot;</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#228B22] text-xs text-white">3</span>
                  <span>Appuyez sur &quot;Ajouter&quot;</span>
                </li>
              </ol>
            </div>
          ) : (
            // Android/Desktop button
            <Button
              onClick={handleInstall}
              className="w-full bg-[#228B22] hover:bg-[#1a6b1a]"
              size="lg"
            >
              <Download className="mr-2 h-5 w-5" />
              Installer l&apos;application
            </Button>
          )}

          <Button variant="ghost" onClick={handleDismiss} className="w-full">
            <X className="mr-2 h-4 w-4" />
            Plus tard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
