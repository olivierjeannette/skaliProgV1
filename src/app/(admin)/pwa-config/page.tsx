'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Smartphone,
  Palette,
  Layout,
  Bell,
  Shield,
  Save,
  Eye,
  Calendar,
  Users,
  TrendingUp,
  Trophy,
  Target,
  MessageSquare,
  Settings,
  Home,
  QrCode,
  Copy,
  ExternalLink,
  Send,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

// Types pour la config PWA
interface PWAModule {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
  route: string;
}

interface PWAConfig {
  general: {
    appName: string;
    shortName: string;
    description: string;
    themeColor: string;
    backgroundColor: string;
  };
  modules: PWAModule[];
  features: {
    pushNotifications: boolean;
    offlineMode: boolean;
    biometricAuth: boolean;
    darkMode: boolean;
    autoSync: boolean;
  };
  branding: {
    primaryColor: string;
    accentColor: string;
    logoUrl: string;
    splashScreen: boolean;
  };
  navigation: {
    showBottomNav: boolean;
    maxBottomNavItems: number;
    bottomNavItems: string[];
  };
}

const defaultModules: PWAModule[] = [
  {
    id: 'dashboard',
    name: 'Tableau de bord',
    description: 'Vue d\'ensemble et statistiques personnelles',
    icon: Home,
    enabled: true,
    route: '/portal',
  },
  {
    id: 'planning',
    name: 'Planning',
    description: 'Calendrier des séances et réservations',
    icon: Calendar,
    enabled: true,
    route: '/portal/planning',
  },
  {
    id: 'workouts',
    name: 'Mes WODs',
    description: 'Historique et suivi des entraînements',
    icon: TrendingUp,
    enabled: true,
    route: '/portal/workouts',
  },
  {
    id: 'performance',
    name: 'Performance',
    description: 'Carte Pokemon et statistiques',
    icon: Trophy,
    enabled: true,
    route: '/portal/performance',
  },
  {
    id: 'leaderboard',
    name: 'Classement',
    description: 'Leaderboard de la box',
    icon: Target,
    enabled: false,
    route: '/portal/leaderboard',
  },
  {
    id: 'community',
    name: 'Communauté',
    description: 'Feed social et échanges entre membres',
    icon: Users,
    enabled: false,
    route: '/portal/community',
  },
  {
    id: 'chat',
    name: 'Messages',
    description: 'Discussion avec coachs et membres',
    icon: MessageSquare,
    enabled: false,
    route: '/portal/chat',
  },
  {
    id: 'profile',
    name: 'Mon Profil',
    description: 'Paramètres et informations personnelles',
    icon: Settings,
    enabled: true,
    route: '/portal/profile',
  },
];

const defaultConfig: PWAConfig = {
  general: {
    appName: 'Skali Prog',
    shortName: 'Skali',
    description: 'Application membre La Skali CrossFit',
    themeColor: '#228B22',
    backgroundColor: '#0a0a0a',
  },
  modules: defaultModules,
  features: {
    pushNotifications: true,
    offlineMode: true,
    biometricAuth: false,
    darkMode: true,
    autoSync: true,
  },
  branding: {
    primaryColor: '#228B22',
    accentColor: '#32CD32',
    logoUrl: '',
    splashScreen: true,
  },
  navigation: {
    showBottomNav: true,
    maxBottomNavItems: 5,
    bottomNavItems: ['dashboard', 'planning', 'workouts', 'performance', 'profile'],
  },
};

// Composant Preview Mobile
function MobilePreview({ config }: { config: PWAConfig }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="relative mx-auto" style={{ width: 280, height: 560 }}>
      {/* Phone frame */}
      <div
        className="absolute inset-0 rounded-[36px] border-4 border-gray-800 shadow-xl"
        style={{ backgroundColor: config.general.backgroundColor }}
      >
        {/* Notch */}
        <div className="absolute left-1/2 top-2 h-6 w-24 -translate-x-1/2 rounded-full bg-gray-800" />

        {/* Status bar */}
        <div
          className="absolute left-0 right-0 top-0 h-10 rounded-t-[32px]"
          style={{ backgroundColor: config.branding.primaryColor }}
        >
          <div className="flex h-full items-end justify-center pb-1">
            <span className="text-xs font-medium text-white">{config.general.shortName}</span>
          </div>
        </div>

        {/* Content area */}
        <div className="absolute bottom-16 left-2 right-2 top-12 overflow-hidden rounded-lg bg-background/95">
          {/* Header */}
          <div className="border-b p-3" style={{ borderColor: config.branding.primaryColor + '30' }}>
            <h3 className="text-sm font-semibold">{config.general.appName}</h3>
            <p className="text-xs text-muted-foreground">Bienvenue !</p>
          </div>

          {/* Mock content */}
          <div className="space-y-2 p-3">
            <div className="h-16 rounded-lg bg-muted/50" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-12 rounded-lg bg-muted/50" />
              <div className="h-12 rounded-lg bg-muted/50" />
            </div>
            <div className="h-24 rounded-lg bg-muted/50" />
          </div>
        </div>

        {/* Bottom nav */}
        {config.navigation.showBottomNav && (
          <div className="absolute bottom-2 left-2 right-2 rounded-xl border bg-background/95 p-1">
            <div className="flex justify-around">
              {config.navigation.bottomNavItems.slice(0, 5).map((id) => {
                const module = config.modules.find((m) => m.id === id);
                if (!module) return null;
                const Icon = module.icon;
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex flex-col items-center gap-0.5 rounded-lg p-1.5 transition-colors ${
                      isActive ? 'text-white' : 'text-muted-foreground'
                    }`}
                    style={isActive ? { backgroundColor: config.branding.primaryColor } : {}}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[8px]">{module.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Composant QR Code et partage
function ShareDialog({ config }: { config: PWAConfig }) {
  const [appUrl, setAppUrl] = useState('');

  useEffect(() => {
    setAppUrl(window.location.origin + '/portal');
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(appUrl);
    toast.success('Lien copié !');
  };

  const shareToDiscord = () => {
    const message = encodeURIComponent(
      `**${config.general.appName}** est disponible !\n\n` +
      `Installez l'application sur votre smartphone pour :\n` +
      `- Consulter le planning des séances\n` +
      `- Suivre vos performances\n` +
      `- Recevoir les notifications\n\n` +
      `Scannez le QR code ou cliquez sur le lien :\n${appUrl}`
    );
    // Ouvre Discord avec le message pré-rempli (webhook ou lien direct)
    window.open(`https://discord.com/channels/@me?message=${message}`, '_blank');
    toast.info('Copiez le message dans votre serveur Discord');
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 512, 512);
        ctx.drawImage(img, 0, 0, 512, 512);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = 'skali-prog-qrcode.png';
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    toast.success('QR Code téléchargé !');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <QrCode className="mr-2 h-4 w-4" />
          Partager
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Partager l&apos;application</DialogTitle>
          <DialogDescription>
            Partagez le QR code ou le lien avec vos adhérents
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* QR Code */}
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-xl border bg-white p-4">
              <QRCodeSVG
                id="qr-code-svg"
                value={appUrl}
                size={180}
                level="H"
                includeMargin
                fgColor={config.branding.primaryColor}
              />
            </div>
            <Button variant="outline" size="sm" onClick={downloadQR}>
              Télécharger le QR
            </Button>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Lien de l&apos;application</Label>
              <div className="flex gap-2">
                <Input value={appUrl} readOnly className="text-xs" />
                <Button variant="outline" size="icon" onClick={copyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Partager sur</Label>
              <div className="grid gap-2">
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={shareToDiscord}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                  Discord
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => {
                    window.open(appUrl, '_blank');
                  }}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ouvrir l&apos;app
                </Button>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground">
              <p className="font-medium mb-1">Instructions pour les adhérents :</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Scanner le QR code avec leur téléphone</li>
                <li>Cliquer sur &quot;Installer&quot; quand proposé</li>
                <li>Se connecter avec Discord</li>
              </ol>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Preview Dialog
function PreviewDialog({ config }: { config: PWAConfig }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Eye className="mr-2 h-4 w-4" />
          Prévisualiser
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-fit">
        <DialogHeader>
          <DialogTitle>Aperçu mobile</DialogTitle>
          <DialogDescription>
            Voici à quoi ressemblera l&apos;application sur smartphone
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <MobilePreview config={config} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PWAConfigPage() {
  const [config, setConfig] = useState<PWAConfig>(defaultConfig);
  const [hasChanges, setHasChanges] = useState(false);

  const updateConfig = <K extends keyof PWAConfig>(
    section: K,
    updates: Partial<PWAConfig[K]>
  ) => {
    setConfig((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...updates },
    }));
    setHasChanges(true);
  };

  const toggleModule = (moduleId: string) => {
    setConfig((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId ? { ...m, enabled: !m.enabled } : m
      ),
    }));
    setHasChanges(true);
  };

  const toggleBottomNavItem = (moduleId: string) => {
    setConfig((prev) => {
      const items = prev.navigation.bottomNavItems;
      const isSelected = items.includes(moduleId);

      let newItems: string[];
      if (isSelected) {
        newItems = items.filter((id) => id !== moduleId);
      } else if (items.length < prev.navigation.maxBottomNavItems) {
        newItems = [...items, moduleId];
      } else {
        toast.error(`Maximum ${prev.navigation.maxBottomNavItems} items dans la barre de navigation`);
        return prev;
      }

      return {
        ...prev,
        navigation: { ...prev.navigation, bottomNavItems: newItems },
      };
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    // TODO: Sauvegarder en base
    toast.success('Configuration PWA sauvegardée');
    setHasChanges(false);
  };

  const enabledModulesCount = config.modules.filter((m) => m.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Configuration PWA</h1>
          <p className="text-muted-foreground">
            Personnalisez l&apos;application mobile pour vos adhérents
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PreviewDialog config={config} />
          <ShareDialog config={config} />
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="mr-2 h-4 w-4" />
            Sauvegarder
          </Button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Modules actifs</CardTitle>
            <Layout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enabledModulesCount}</div>
            <p className="text-xs text-muted-foreground">
              sur {config.modules.length} disponibles
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Nav items</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {config.navigation.bottomNavItems.length}
            </div>
            <p className="text-xs text-muted-foreground">
              max {config.navigation.maxBottomNavItems}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Couleur primaire</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div
                className="h-6 w-6 rounded border"
                style={{ backgroundColor: config.branding.primaryColor }}
              />
              <span className="text-sm font-mono">{config.branding.primaryColor}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {config.features.pushNotifications ? 'ON' : 'OFF'}
            </div>
            <p className="text-xs text-muted-foreground">Push notifications</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de configuration */}
      <Tabs defaultValue="modules" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:w-auto lg:grid-cols-4">
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
          <TabsTrigger value="features">Fonctionnalités</TabsTrigger>
        </TabsList>

        {/* MODULES */}
        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Modules disponibles</CardTitle>
              <CardDescription>
                Activez ou désactivez les fonctionnalités accessibles aux adhérents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {config.modules.map((module) => {
                  const Icon = module.icon;
                  return (
                    <div
                      key={module.id}
                      className="flex items-start gap-4 rounded-lg border p-4"
                    >
                      <div
                        className={`rounded-lg p-2 ${
                          module.enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{module.name}</p>
                          <Switch
                            checked={module.enabled}
                            onCheckedChange={() => toggleModule(module.id)}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {module.description}
                        </p>
                        <code className="text-xs text-muted-foreground">
                          {module.route}
                        </code>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BRANDING */}
        <TabsContent value="branding" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
                <CardDescription>Nom et description de l&apos;application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="appName">Nom de l&apos;application</Label>
                  <Input
                    id="appName"
                    value={config.general.appName}
                    onChange={(e) =>
                      updateConfig('general', { appName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortName">Nom court (icône)</Label>
                  <Input
                    id="shortName"
                    value={config.general.shortName}
                    onChange={(e) =>
                      updateConfig('general', { shortName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={config.general.description}
                    onChange={(e) =>
                      updateConfig('general', { description: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Couleurs</CardTitle>
                <CardDescription>Personnalisez l&apos;apparence de l&apos;app</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Couleur primaire</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={config.branding.primaryColor}
                      onChange={(e) =>
                        updateConfig('branding', { primaryColor: e.target.value })
                      }
                      className="w-14 h-10 p-1"
                    />
                    <Input
                      value={config.branding.primaryColor}
                      onChange={(e) =>
                        updateConfig('branding', { primaryColor: e.target.value })
                      }
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accentColor">Couleur d&apos;accent</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={config.branding.accentColor}
                      onChange={(e) =>
                        updateConfig('branding', { accentColor: e.target.value })
                      }
                      className="w-14 h-10 p-1"
                    />
                    <Input
                      value={config.branding.accentColor}
                      onChange={(e) =>
                        updateConfig('branding', { accentColor: e.target.value })
                      }
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="themeColor">Couleur thème (barre status)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="themeColor"
                      type="color"
                      value={config.general.themeColor}
                      onChange={(e) =>
                        updateConfig('general', { themeColor: e.target.value })
                      }
                      className="w-14 h-10 p-1"
                    />
                    <Input
                      value={config.general.themeColor}
                      onChange={(e) =>
                        updateConfig('general', { themeColor: e.target.value })
                      }
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backgroundColor">Couleur de fond</Label>
                  <div className="flex gap-2">
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={config.general.backgroundColor}
                      onChange={(e) =>
                        updateConfig('general', { backgroundColor: e.target.value })
                      }
                      className="w-14 h-10 p-1"
                    />
                    <Input
                      value={config.general.backgroundColor}
                      onChange={(e) =>
                        updateConfig('general', { backgroundColor: e.target.value })
                      }
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* NAVIGATION */}
        <TabsContent value="navigation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Barre de navigation mobile</CardTitle>
              <CardDescription>
                Sélectionnez jusqu&apos;à {config.navigation.maxBottomNavItems} modules pour la barre
                de navigation en bas de l&apos;écran
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Afficher la barre de navigation</Label>
                  <p className="text-sm text-muted-foreground">
                    Navigation rapide en bas de l&apos;écran
                  </p>
                </div>
                <Switch
                  checked={config.navigation.showBottomNav}
                  onCheckedChange={(checked) =>
                    updateConfig('navigation', { showBottomNav: checked })
                  }
                />
              </div>

              {config.navigation.showBottomNav && (
                <>
                  <div className="space-y-2">
                    <Label>Modules dans la barre ({config.navigation.bottomNavItems.length}/{config.navigation.maxBottomNavItems})</Label>
                    <div className="flex flex-wrap gap-2">
                      {config.modules
                        .filter((m) => m.enabled)
                        .map((module) => {
                          const isSelected = config.navigation.bottomNavItems.includes(
                            module.id
                          );
                          const Icon = module.icon;
                          return (
                            <Badge
                              key={module.id}
                              variant={isSelected ? 'default' : 'outline'}
                              className="cursor-pointer py-2 px-3"
                              onClick={() => toggleBottomNavItem(module.id)}
                            >
                              <Icon className="mr-1 h-3 w-3" />
                              {module.name}
                            </Badge>
                          );
                        })}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="space-y-2">
                    <Label>Aperçu</Label>
                    <div className="mx-auto max-w-sm rounded-lg border bg-background p-2">
                      <div className="flex justify-around">
                        {config.navigation.bottomNavItems.map((id) => {
                          const module = config.modules.find((m) => m.id === id);
                          if (!module) return null;
                          const Icon = module.icon;
                          return (
                            <div
                              key={id}
                              className="flex flex-col items-center gap-1 p-2"
                            >
                              <Icon className="h-5 w-5" />
                              <span className="text-xs">{module.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FEATURES */}
        <TabsContent value="features" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Rappels de séances, résultats, messages
                    </p>
                  </div>
                  <Switch
                    checked={config.features.pushNotifications}
                    onCheckedChange={(checked) =>
                      updateConfig('features', { pushNotifications: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Synchronisation auto</Label>
                    <p className="text-sm text-muted-foreground">
                      Mise à jour des données en arrière-plan
                    </p>
                  </div>
                  <Switch
                    checked={config.features.autoSync}
                    onCheckedChange={(checked) =>
                      updateConfig('features', { autoSync: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Sécurité & Accès
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mode hors-ligne</Label>
                    <p className="text-sm text-muted-foreground">
                      Accès aux données sans connexion
                    </p>
                  </div>
                  <Switch
                    checked={config.features.offlineMode}
                    onCheckedChange={(checked) =>
                      updateConfig('features', { offlineMode: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Authentification biométrique</Label>
                    <p className="text-sm text-muted-foreground">
                      Face ID / Touch ID / Empreinte
                    </p>
                  </div>
                  <Switch
                    checked={config.features.biometricAuth}
                    onCheckedChange={(checked) =>
                      updateConfig('features', { biometricAuth: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Apparence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mode sombre</Label>
                    <p className="text-sm text-muted-foreground">
                      Permettre le thème sombre
                    </p>
                  </div>
                  <Switch
                    checked={config.features.darkMode}
                    onCheckedChange={(checked) =>
                      updateConfig('features', { darkMode: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Écran de démarrage</Label>
                    <p className="text-sm text-muted-foreground">
                      Splash screen au lancement
                    </p>
                  </div>
                  <Switch
                    checked={config.branding.splashScreen}
                    onCheckedChange={(checked) =>
                      updateConfig('branding', { splashScreen: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
