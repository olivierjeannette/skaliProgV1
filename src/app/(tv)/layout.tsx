import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Mode TV - La Skàli',
  description: 'Affichage des séances et équipes sur grand écran',
  // Open Graph pour le partage/casting
  openGraph: {
    title: 'Mode TV - La Skàli',
    description: 'Affichage des séances et équipes sur grand écran',
    type: 'website',
  },
  // Empêcher l'indexation (page interne)
  robots: {
    index: false,
    follow: false,
  },
  // Pour les appareils de casting
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Optimisé pour TV
  themeColor: '#000000',
};

export default function TVLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Layout minimal sans sidebar, optimisé TV
    <div className="tv-layout">
      {children}
    </div>
  );
}
