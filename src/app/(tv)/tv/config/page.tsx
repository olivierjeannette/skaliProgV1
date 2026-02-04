'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Type,
  Layout,
  Palette,
  Settings2,
  RotateCcw,
  ExternalLink,
  ArrowLeft,
  Maximize,
  Monitor,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useTVSettingsStore, defaultSettings } from '@/stores/tv-settings-store';
import { TVPreview } from '@/components/tv/TVPreview';

export default function TVConfigPage() {
  const {
    settings,
    setTextSettings,
    setLayoutSettings,
    setColorSettings,
    setBehaviorSettings,
    resetToDefaults,
    resetSection,
  } = useTVSettingsStore();

  const [activeTab, setActiveTab] = useState('layout');

  const handleReset = () => {
    if (confirm('Voulez-vous vraiment réinitialiser tous les paramètres TV ?')) {
      resetToDefaults();
      toast.success('Paramètres réinitialisés');
    }
  };

  const openFullscreen = () => {
    window.open('/tv', '_blank', 'fullscreen=yes');
  };

  return (
    <div className="fixed inset-0 flex bg-slate-900">
      {/* Left: Live Preview */}
      <div className="flex-1 flex flex-col p-4">
        <div className="flex items-center justify-between mb-4">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={openFullscreen}>
              <Maximize className="h-4 w-4 mr-2" />
              Plein écran
            </Button>
            <Link href="/tv" target="_blank">
              <Button variant="secondary">
                <Monitor className="h-4 w-4 mr-2" />
                Ouvrir TV
                <ExternalLink className="h-3 w-3 ml-1 opacity-50" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Preview Container with aspect ratio */}
        <div className="flex-1 flex items-center justify-center">
          <div
            className="relative bg-black rounded-lg overflow-hidden shadow-2xl"
            style={{
              width: '100%',
              maxWidth: '1200px',
              aspectRatio: '16/9',
            }}
          >
            <TVPreview />
          </div>
        </div>

        <div className="text-center mt-4 text-white/50 text-sm">
          Aperçu en temps réel - Modifiez les paramètres à droite
        </div>
      </div>

      {/* Right: Controls Panel */}
      <div className="w-[420px] bg-white overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold">Configuration TV</h1>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Les changements s'appliquent en direct
          </p>
        </div>

        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="layout" className="text-xs">
                <Layout className="h-3 w-3 mr-1" />
                Layout
              </TabsTrigger>
              <TabsTrigger value="text" className="text-xs">
                <Type className="h-3 w-3 mr-1" />
                Texte
              </TabsTrigger>
              <TabsTrigger value="colors" className="text-xs">
                <Palette className="h-3 w-3 mr-1" />
                Couleurs
              </TabsTrigger>
              <TabsTrigger value="behavior" className="text-xs">
                <Settings2 className="h-3 w-3 mr-1" />
                Options
              </TabsTrigger>
            </TabsList>

            {/* Layout Tab */}
            <TabsContent value="layout" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Zoom & Marges</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Global Zoom */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <Label>Zoom global</Label>
                      <span className="text-muted-foreground">{settings.layout.globalZoom}%</span>
                    </div>
                    <Slider
                      value={[settings.layout.globalZoom]}
                      onValueChange={([v]) => setLayoutSettings({ globalZoom: v })}
                      min={50}
                      max={150}
                      step={5}
                    />
                  </div>

                  {/* Padding */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Haut</span>
                        <span className="text-muted-foreground">{settings.layout.paddingTop}px</span>
                      </div>
                      <Slider
                        value={[settings.layout.paddingTop]}
                        onValueChange={([v]) => setLayoutSettings({ paddingTop: v })}
                        min={0}
                        max={100}
                        step={5}
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Bas</span>
                        <span className="text-muted-foreground">{settings.layout.paddingBottom}px</span>
                      </div>
                      <Slider
                        value={[settings.layout.paddingBottom]}
                        onValueChange={([v]) => setLayoutSettings({ paddingBottom: v })}
                        min={0}
                        max={100}
                        step={5}
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Gauche</span>
                        <span className="text-muted-foreground">{settings.layout.paddingLeft}px</span>
                      </div>
                      <Slider
                        value={[settings.layout.paddingLeft]}
                        onValueChange={([v]) => setLayoutSettings({ paddingLeft: v })}
                        min={0}
                        max={100}
                        step={5}
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Droite</span>
                        <span className="text-muted-foreground">{settings.layout.paddingRight}px</span>
                      </div>
                      <Slider
                        value={[settings.layout.paddingRight]}
                        onValueChange={([v]) => setLayoutSettings({ paddingRight: v })}
                        min={0}
                        max={100}
                        step={5}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Blocs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Hauteur en-tête</Label>
                    <Select
                      value={settings.layout.headerHeight}
                      onValueChange={(v) => setLayoutSettings({ headerHeight: v as 'compact' | 'normal' | 'large' })}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="large">Grand</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <Label>Espacement</Label>
                      <span className="text-muted-foreground">{settings.layout.blockGap}px</span>
                    </div>
                    <Slider
                      value={[settings.layout.blockGap]}
                      onValueChange={([v]) => setLayoutSettings({ blockGap: v })}
                      min={8}
                      max={32}
                      step={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <Label>Arrondi</Label>
                      <span className="text-muted-foreground">{settings.layout.blockRadius}px</span>
                    </div>
                    <Slider
                      value={[settings.layout.blockRadius]}
                      onValueChange={([v]) => setLayoutSettings({ blockRadius: v })}
                      min={0}
                      max={24}
                      step={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <Label>Blocs/ligne</Label>
                      <span className="text-muted-foreground">{settings.layout.maxBlocksPerRow}</span>
                    </div>
                    <Slider
                      value={[settings.layout.maxBlocksPerRow]}
                      onValueChange={([v]) => setLayoutSettings({ maxBlocksPerRow: v })}
                      min={2}
                      max={6}
                      step={1}
                    />
                  </div>
                </CardContent>
              </Card>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => resetSection('layout')}
                className="w-full text-muted-foreground"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Réinitialiser Layout
              </Button>
            </TabsContent>

            {/* Text Tab */}
            <TabsContent value="text" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Police & Tailles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Police</Label>
                    <Select
                      value={settings.text.fontFamily}
                      onValueChange={(v) => setTextSettings({ fontFamily: v as 'default' | 'mono' | 'serif' })}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Sans-serif</SelectItem>
                        <SelectItem value="mono">Monospace</SelectItem>
                        <SelectItem value="serif">Serif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <Label>Taille titres</Label>
                      <span className="text-muted-foreground">{Math.round(settings.text.titleSize * 100)}%</span>
                    </div>
                    <Slider
                      value={[settings.text.titleSize]}
                      onValueChange={([v]) => setTextSettings({ titleSize: v })}
                      min={0.5}
                      max={2}
                      step={0.1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <Label>Taille contenu</Label>
                      <span className="text-muted-foreground">{Math.round(settings.text.contentSize * 100)}%</span>
                    </div>
                    <Slider
                      value={[settings.text.contentSize]}
                      onValueChange={([v]) => setTextSettings({ contentSize: v })}
                      min={0.5}
                      max={2}
                      step={0.1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <Label>Taille horloge</Label>
                      <span className="text-muted-foreground">{Math.round(settings.text.clockSize * 100)}%</span>
                    </div>
                    <Slider
                      value={[settings.text.clockSize]}
                      onValueChange={([v]) => setTextSettings({ clockSize: v })}
                      min={0.5}
                      max={2}
                      step={0.1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <Label>Interligne</Label>
                      <span className="text-muted-foreground">{settings.text.lineHeight.toFixed(1)}</span>
                    </div>
                    <Slider
                      value={[settings.text.lineHeight]}
                      onValueChange={([v]) => setTextSettings({ lineHeight: v })}
                      min={1}
                      max={2}
                      step={0.1}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Style</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Titres en gras</Label>
                    <Switch
                      checked={settings.text.titleBold}
                      onCheckedChange={(v) => setTextSettings({ titleBold: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Titres majuscules</Label>
                    <Switch
                      checked={settings.text.titleUppercase}
                      onCheckedChange={(v) => setTextSettings({ titleUppercase: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Contenu en gras</Label>
                    <Switch
                      checked={settings.text.contentBold}
                      onCheckedChange={(v) => setTextSettings({ contentBold: v })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => resetSection('text')}
                className="w-full text-muted-foreground"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Réinitialiser Texte
              </Button>
            </TabsContent>

            {/* Colors Tab */}
            <TabsContent value="colors" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Arrière-plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Utiliser dégradé</Label>
                    <Switch
                      checked={settings.colors.useGradient}
                      onCheckedChange={(v) => setColorSettings({ useGradient: v })}
                    />
                  </div>

                  {settings.colors.useGradient ? (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Couleur début</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={settings.colors.gradientFrom}
                            onChange={(e) => setColorSettings({ gradientFrom: e.target.value })}
                            className="w-10 h-9 p-1"
                          />
                          <Input
                            type="text"
                            value={settings.colors.gradientFrom}
                            onChange={(e) => setColorSettings({ gradientFrom: e.target.value })}
                            className="flex-1 h-9 text-xs"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Couleur fin</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={settings.colors.gradientTo}
                            onChange={(e) => setColorSettings({ gradientTo: e.target.value })}
                            className="w-10 h-9 p-1"
                          />
                          <Input
                            type="text"
                            value={settings.colors.gradientTo}
                            onChange={(e) => setColorSettings({ gradientTo: e.target.value })}
                            className="flex-1 h-9 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Label className="text-xs">Couleur de fond</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={settings.colors.backgroundColor}
                          onChange={(e) => setColorSettings({ backgroundColor: e.target.value })}
                          className="w-10 h-9 p-1"
                        />
                        <Input
                          type="text"
                          value={settings.colors.backgroundColor}
                          onChange={(e) => setColorSettings({ backgroundColor: e.target.value })}
                          className="flex-1 h-9 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Éléments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Fond en-tête</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.colors.headerBackground.replace(/rgba?\([^)]+\)/, '#ffffff')}
                        onChange={(e) => setColorSettings({ headerBackground: e.target.value })}
                        className="w-10 h-9 p-1"
                      />
                      <Input
                        type="text"
                        value={settings.colors.headerBackground}
                        onChange={(e) => setColorSettings({ headerBackground: e.target.value })}
                        placeholder="rgba(255,255,255,0.9)"
                        className="flex-1 h-9 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Couleur horloge</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.colors.clockColor}
                        onChange={(e) => setColorSettings({ clockColor: e.target.value })}
                        className="w-10 h-9 p-1"
                      />
                      <Input
                        type="text"
                        value={settings.colors.clockColor}
                        onChange={(e) => setColorSettings({ clockColor: e.target.value })}
                        className="flex-1 h-9 text-xs"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => resetSection('colors')}
                className="w-full text-muted-foreground"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Réinitialiser Couleurs
              </Button>
            </TabsContent>

            {/* Behavior Tab */}
            <TabsContent value="behavior" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Automatisation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Masquer contrôles</Label>
                      <p className="text-xs text-muted-foreground">Après inactivité</p>
                    </div>
                    <Switch
                      checked={settings.behavior.autoHideControls}
                      onCheckedChange={(v) => setBehaviorSettings({ autoHideControls: v })}
                    />
                  </div>

                  {settings.behavior.autoHideControls && (
                    <div className="pl-3 border-l-2 space-y-2">
                      <div className="flex justify-between text-sm">
                        <Label>Délai</Label>
                        <span className="text-muted-foreground">{settings.behavior.autoHideDelay}s</span>
                      </div>
                      <Slider
                        value={[settings.behavior.autoHideDelay]}
                        onValueChange={([v]) => setBehaviorSettings({ autoHideDelay: v })}
                        min={2}
                        max={30}
                        step={1}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Rafraîchir auto</Label>
                      <p className="text-xs text-muted-foreground">Recharge les données</p>
                    </div>
                    <Switch
                      checked={settings.behavior.autoRefresh}
                      onCheckedChange={(v) => setBehaviorSettings({ autoRefresh: v })}
                    />
                  </div>

                  {settings.behavior.autoRefresh && (
                    <div className="pl-3 border-l-2 space-y-2">
                      <div className="flex justify-between text-sm">
                        <Label>Intervalle</Label>
                        <span className="text-muted-foreground">{settings.behavior.autoRefreshInterval}s</span>
                      </div>
                      <Slider
                        value={[settings.behavior.autoRefreshInterval]}
                        onValueChange={([v]) => setBehaviorSettings({ autoRefreshInterval: v })}
                        min={10}
                        max={120}
                        step={5}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Éléments affichés</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Horloge</Label>
                    <Switch
                      checked={settings.behavior.showClock}
                      onCheckedChange={(v) => setBehaviorSettings({ showClock: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Date</Label>
                    <Switch
                      checked={settings.behavior.showDate}
                      onCheckedChange={(v) => setBehaviorSettings({ showDate: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Catégorie</Label>
                    <Switch
                      checked={settings.behavior.showCategory}
                      onCheckedChange={(v) => setBehaviorSettings({ showCategory: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Infos timing</Label>
                    <Switch
                      checked={settings.behavior.showTimingInfo}
                      onCheckedChange={(v) => setBehaviorSettings({ showTimingInfo: v })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => resetSection('behavior')}
                className="w-full text-muted-foreground"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Réinitialiser Options
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
