'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tv,
  Type,
  Layout,
  Palette,
  Settings2,
  RotateCcw,
  ExternalLink,
  Save,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTVSettingsStore, defaultSettings } from '@/stores/tv-settings-store';

export function TVSettingsTab() {
  const {
    settings,
    setTextSettings,
    setLayoutSettings,
    setColorSettings,
    setBehaviorSettings,
    resetToDefaults,
    resetSection,
  } = useTVSettingsStore();

  const [expandedSections, setExpandedSections] = useState<string[]>(['text', 'layout']);

  const handleReset = () => {
    if (confirm('Voulez-vous vraiment réinitialiser tous les paramètres TV ?')) {
      resetToDefaults();
      toast.success('Paramètres réinitialisés');
    }
  };

  const openTVPreview = () => {
    window.open('/tv', '_blank', 'fullscreen=yes');
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tv className="h-5 w-5 text-primary" />
          <span className="font-medium">Configuration du Mode TV</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openTVPreview}>
            <Eye className="h-4 w-4 mr-2" />
            Prévisualiser
            <ExternalLink className="h-3 w-3 ml-1 opacity-50" />
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
        </div>
      </div>

      {/* Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <p className="text-sm text-blue-800">
            Les modifications sont sauvegardées automatiquement et appliquées en temps réel sur la page TV.
            Utilisez le bouton "Prévisualiser" pour voir le résultat dans une nouvelle fenêtre.
          </p>
        </CardContent>
      </Card>

      {/* Settings Sections */}
      <Accordion
        type="multiple"
        value={expandedSections}
        onValueChange={setExpandedSections}
        className="space-y-4"
      >
        {/* Text Settings */}
        <AccordionItem value="text" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Type className="h-5 w-5 text-primary" />
              <div className="text-left">
                <div className="font-semibold">Texte & Typographie</div>
                <div className="text-sm text-muted-foreground font-normal">
                  Police, tailles, gras, majuscules
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-6">
              {/* Font Family */}
              <div className="grid gap-2">
                <Label>Police de caractères</Label>
                <Select
                  value={settings.text.fontFamily}
                  onValueChange={(v) => setTextSettings({ fontFamily: v as 'default' | 'mono' | 'serif' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Sans-serif (défaut)</SelectItem>
                    <SelectItem value="mono">Monospace</SelectItem>
                    <SelectItem value="serif">Serif</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Title Size */}
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label>Taille des titres</Label>
                  <span className="text-sm text-muted-foreground">{Math.round(settings.text.titleSize * 100)}%</span>
                </div>
                <Slider
                  value={[settings.text.titleSize]}
                  onValueChange={([v]) => setTextSettings({ titleSize: v })}
                  min={0.5}
                  max={2}
                  step={0.1}
                />
              </div>

              {/* Content Size */}
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label>Taille du contenu</Label>
                  <span className="text-sm text-muted-foreground">{Math.round(settings.text.contentSize * 100)}%</span>
                </div>
                <Slider
                  value={[settings.text.contentSize]}
                  onValueChange={([v]) => setTextSettings({ contentSize: v })}
                  min={0.5}
                  max={2}
                  step={0.1}
                />
              </div>

              {/* Clock Size */}
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label>Taille de l'horloge</Label>
                  <span className="text-sm text-muted-foreground">{Math.round(settings.text.clockSize * 100)}%</span>
                </div>
                <Slider
                  value={[settings.text.clockSize]}
                  onValueChange={([v]) => setTextSettings({ clockSize: v })}
                  min={0.5}
                  max={2}
                  step={0.1}
                />
              </div>

              {/* Line Height */}
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label>Interligne</Label>
                  <span className="text-sm text-muted-foreground">{settings.text.lineHeight.toFixed(1)}</span>
                </div>
                <Slider
                  value={[settings.text.lineHeight]}
                  onValueChange={([v]) => setTextSettings({ lineHeight: v })}
                  min={1}
                  max={2}
                  step={0.1}
                />
              </div>

              {/* Text Options */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label>Titres en gras</Label>
                  <Switch
                    checked={settings.text.titleBold}
                    onCheckedChange={(v) => setTextSettings({ titleBold: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Titres en majuscules</Label>
                  <Switch
                    checked={settings.text.titleUppercase}
                    onCheckedChange={(v) => setTextSettings({ titleUppercase: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Contenu en gras</Label>
                  <Switch
                    checked={settings.text.contentBold}
                    onCheckedChange={(v) => setTextSettings({ contentBold: v })}
                  />
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => resetSection('text')}
                className="text-muted-foreground"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Réinitialiser cette section
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Layout Settings */}
        <AccordionItem value="layout" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Layout className="h-5 w-5 text-primary" />
              <div className="text-left">
                <div className="font-semibold">Mise en page</div>
                <div className="text-sm text-muted-foreground font-normal">
                  Zoom, marges, espacement des blocs
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-6">
              {/* Global Zoom */}
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label>Zoom global</Label>
                  <span className="text-sm text-muted-foreground">{settings.layout.globalZoom}%</span>
                </div>
                <Slider
                  value={[settings.layout.globalZoom]}
                  onValueChange={([v]) => setLayoutSettings({ globalZoom: v })}
                  min={50}
                  max={150}
                  step={5}
                />
                <p className="text-xs text-muted-foreground">
                  Ajustez si l'écran TV crop les bords de l'image
                </p>
              </div>

              {/* Padding */}
              <div className="grid gap-4">
                <Label>Marges (compensation écran TV)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
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
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
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
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
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
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
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
              </div>

              {/* Header Height */}
              <div className="grid gap-2">
                <Label>Hauteur de l'en-tête</Label>
                <Select
                  value={settings.layout.headerHeight}
                  onValueChange={(v) => setLayoutSettings({ headerHeight: v as 'compact' | 'normal' | 'large' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="large">Grand</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Block Gap */}
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label>Espacement entre blocs</Label>
                  <span className="text-sm text-muted-foreground">{settings.layout.blockGap}px</span>
                </div>
                <Slider
                  value={[settings.layout.blockGap]}
                  onValueChange={([v]) => setLayoutSettings({ blockGap: v })}
                  min={8}
                  max={32}
                  step={4}
                />
              </div>

              {/* Block Radius */}
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label>Arrondi des blocs</Label>
                  <span className="text-sm text-muted-foreground">{settings.layout.blockRadius}px</span>
                </div>
                <Slider
                  value={[settings.layout.blockRadius]}
                  onValueChange={([v]) => setLayoutSettings({ blockRadius: v })}
                  min={0}
                  max={24}
                  step={2}
                />
              </div>

              {/* Max Blocks Per Row */}
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label>Blocs max par ligne</Label>
                  <span className="text-sm text-muted-foreground">{settings.layout.maxBlocksPerRow}</span>
                </div>
                <Slider
                  value={[settings.layout.maxBlocksPerRow]}
                  onValueChange={([v]) => setLayoutSettings({ maxBlocksPerRow: v })}
                  min={2}
                  max={6}
                  step={1}
                />
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => resetSection('layout')}
                className="text-muted-foreground"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Réinitialiser cette section
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Color Settings */}
        <AccordionItem value="colors" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5 text-primary" />
              <div className="text-left">
                <div className="font-semibold">Couleurs</div>
                <div className="text-sm text-muted-foreground font-normal">
                  Arrière-plan, dégradé, horloge
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-6">
              {/* Use Gradient */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Utiliser un dégradé</Label>
                  <p className="text-sm text-muted-foreground">Pour l'arrière-plan de la page</p>
                </div>
                <Switch
                  checked={settings.colors.useGradient}
                  onCheckedChange={(v) => setColorSettings({ useGradient: v })}
                />
              </div>

              {settings.colors.useGradient ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Couleur début</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.colors.gradientFrom}
                        onChange={(e) => setColorSettings({ gradientFrom: e.target.value })}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={settings.colors.gradientFrom}
                        onChange={(e) => setColorSettings({ gradientFrom: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Couleur fin</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.colors.gradientTo}
                        onChange={(e) => setColorSettings({ gradientTo: e.target.value })}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={settings.colors.gradientTo}
                        onChange={(e) => setColorSettings({ gradientTo: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Couleur de fond</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.colors.backgroundColor}
                      onChange={(e) => setColorSettings({ backgroundColor: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={settings.colors.backgroundColor}
                      onChange={(e) => setColorSettings({ backgroundColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              )}

              {/* Header Background */}
              <div className="space-y-2">
                <Label>Fond de l'en-tête</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.colors.headerBackground.replace(/rgba?\([^)]+\)/, '#ffffff')}
                    onChange={(e) => setColorSettings({ headerBackground: e.target.value })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={settings.colors.headerBackground}
                    onChange={(e) => setColorSettings({ headerBackground: e.target.value })}
                    placeholder="rgba(255,255,255,0.9)"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Supporte rgba() pour la transparence</p>
              </div>

              {/* Clock Color */}
              <div className="space-y-2">
                <Label>Couleur de l'horloge</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.colors.clockColor}
                    onChange={(e) => setColorSettings({ clockColor: e.target.value })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={settings.colors.clockColor}
                    onChange={(e) => setColorSettings({ clockColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => resetSection('colors')}
                className="text-muted-foreground"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Réinitialiser cette section
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Behavior Settings */}
        <AccordionItem value="behavior" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Settings2 className="h-5 w-5 text-primary" />
              <div className="text-left">
                <div className="font-semibold">Comportement</div>
                <div className="text-sm text-muted-foreground font-normal">
                  Auto-refresh, masquage contrôles, éléments affichés
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-6">
              {/* Auto Hide Controls */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Masquer les contrôles</Label>
                  <p className="text-sm text-muted-foreground">Cache les boutons après inactivité</p>
                </div>
                <Switch
                  checked={settings.behavior.autoHideControls}
                  onCheckedChange={(v) => setBehaviorSettings({ autoHideControls: v })}
                />
              </div>

              {settings.behavior.autoHideControls && (
                <div className="grid gap-2 pl-4 border-l-2 border-muted">
                  <div className="flex justify-between">
                    <Label>Délai avant masquage</Label>
                    <span className="text-sm text-muted-foreground">{settings.behavior.autoHideDelay}s</span>
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

              {/* Auto Refresh */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Rafraîchissement auto</Label>
                  <p className="text-sm text-muted-foreground">Recharge les données périodiquement</p>
                </div>
                <Switch
                  checked={settings.behavior.autoRefresh}
                  onCheckedChange={(v) => setBehaviorSettings({ autoRefresh: v })}
                />
              </div>

              {settings.behavior.autoRefresh && (
                <div className="grid gap-2 pl-4 border-l-2 border-muted">
                  <div className="flex justify-between">
                    <Label>Intervalle de rafraîchissement</Label>
                    <span className="text-sm text-muted-foreground">{settings.behavior.autoRefreshInterval}s</span>
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

              {/* Elements to show */}
              <div className="space-y-3">
                <Label>Éléments affichés</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Horloge</span>
                    <Switch
                      checked={settings.behavior.showClock}
                      onCheckedChange={(v) => setBehaviorSettings({ showClock: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Date</span>
                    <Switch
                      checked={settings.behavior.showDate}
                      onCheckedChange={(v) => setBehaviorSettings({ showDate: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Catégorie</span>
                    <Switch
                      checked={settings.behavior.showCategory}
                      onCheckedChange={(v) => setBehaviorSettings({ showCategory: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Infos timing</span>
                    <Switch
                      checked={settings.behavior.showTimingInfo}
                      onCheckedChange={(v) => setBehaviorSettings({ showTimingInfo: v })}
                    />
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => resetSection('behavior')}
                className="text-muted-foreground"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Réinitialiser cette section
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
