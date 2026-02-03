'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import { toast } from 'sonner';

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
        <div className="flex gap-2">
          <Button variant="outline" disabled>
            <Eye className="mr-2 h-4 w-4" />
            Prévisualiser
          </Button>
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
