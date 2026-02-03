'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getSupabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  MessageSquare,
  Bell,
  Sun,
  Link2,
  Bot,
  Save,
  RefreshCw,
  TestTube,
  Cloud,
  Send,
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  Play,
  Terminal,
  Search,
  Link,
  Unlink,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';

// Types
interface DiscordMember {
  discord_id: string;
  discord_username: string;
  discord_global_name?: string;
  discord_avatar?: string;
  server_nickname?: string;
  member_id?: string;
  member_name?: string;
  firstname?: string;
  lastname?: string;
  is_active: boolean;
  last_sync?: string;
}

interface Member {
  id: string;
  name: string;
  email?: string;
  discord_id?: string;
}

interface NotificationConfig {
  webhookUrl: string;
  weatherApiKey: string;
  weatherCity: string;
  sendTime: string;
  enabled: boolean;
}

type FilterType = 'all' | 'linked' | 'unlinked' | 'inactive';

export default function DiscordPage() {
  const [currentTab, setCurrentTab] = useState('notifications');
  const [discordMembers, setDiscordMembers] = useState<DiscordMember[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [botStatus, setBotStatus] = useState<'checking' | 'active' | 'inactive' | 'error'>('checking');
  const [lastSyncMinutes, setLastSyncMinutes] = useState<number | null>(null);

  // Notification config state
  const [notifConfig, setNotifConfig] = useState<NotificationConfig>({
    webhookUrl: '',
    weatherApiKey: '',
    weatherCity: 'Laval,FR',
    sendTime: '07:00',
    enabled: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    const supabase = getSupabase();

    try {
      // Load Discord members from view
      const { data: discordData, error: discordError } = await supabase
        .from('discord_members_full')
        .select('*')
        .order('discord_username');

      if (discordError) throw discordError;
      setDiscordMembers(discordData || []);

      // Load members
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('id, name, email, discord_id')
        .order('name');

      if (membersError) throw membersError;
      setMembers(membersData || []);

      // Check bot status
      const { data: syncData } = await supabase
        .from('discord_members')
        .select('last_sync')
        .order('last_sync', { ascending: false })
        .limit(1);

      if (syncData && syncData.length > 0) {
        const lastSync = new Date(syncData[0].last_sync);
        const now = new Date();
        const diffMinutes = Math.floor((now.getTime() - lastSync.getTime()) / 1000 / 60);
        setLastSyncMinutes(diffMinutes);
        setBotStatus(diffMinutes < 5 ? 'active' : 'inactive');
      } else {
        setBotStatus('inactive');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erreur lors du chargement des données');
      setBotStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter discord members
  const filteredMembers = discordMembers.filter((dm) => {
    // Filter by status
    if (filter === 'linked' && !dm.member_id) return false;
    if (filter === 'unlinked' && dm.member_id) return false;
    if (filter === 'inactive' && dm.is_active) return false;
    if (filter !== 'inactive' && !dm.is_active) return false;

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchDiscord =
        dm.discord_username?.toLowerCase().includes(query) ||
        dm.discord_global_name?.toLowerCase().includes(query) ||
        dm.server_nickname?.toLowerCase().includes(query);
      const matchMember =
        dm.member_name?.toLowerCase().includes(query) ||
        dm.firstname?.toLowerCase().includes(query) ||
        dm.lastname?.toLowerCase().includes(query);
      return matchDiscord || matchMember;
    }

    return true;
  });

  // Stats
  const linkedCount = discordMembers.filter((dm) => dm.member_id).length;
  const unlinkedCount = discordMembers.filter((dm) => !dm.member_id && dm.is_active).length;
  const inactiveCount = discordMembers.filter((dm) => !dm.is_active).length;

  // Link member
  const handleLink = async (discordId: string, memberId: string, memberName: string, discordUsername: string) => {
    const supabase = getSupabase();

    try {
      const { error } = await supabase.rpc('link_discord_to_member', {
        p_discord_id: discordId,
        p_member_id: memberId,
        p_linked_by: 'Admin',
      });

      if (error) throw error;

      toast.success(`${discordUsername} lié à ${memberName}`);
      loadData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Erreur: ' + message);
    }
  };

  // Unlink member
  const handleUnlink = async (discordId: string, memberName: string, discordUsername: string) => {
    if (!confirm(`Délier ${discordUsername} de ${memberName} ?`)) return;

    const supabase = getSupabase();

    try {
      const { error } = await supabase.rpc('unlink_discord_from_member', {
        p_discord_id: discordId,
      });

      if (error) throw error;

      toast.success(`${discordUsername} délié de ${memberName}`);
      loadData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Erreur: ' + message);
    }
  };

  // Save notification config
  const saveNotificationConfig = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage for now (could be saved to Supabase)
      localStorage.setItem('discord_notif_config', JSON.stringify(notifConfig));
      toast.success('Configuration sauvegardée');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  // Test weather
  const testWeather = async () => {
    if (!notifConfig.weatherApiKey) {
      toast.error('Clé API météo non configurée');
      return;
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${notifConfig.weatherCity}&appid=${notifConfig.weatherApiKey}&units=metric&lang=fr`
      );
      const data = await response.json();

      if (data.cod === 200) {
        toast.success(`${data.weather[0].description} - ${Math.round(data.main.temp)}°C à ${notifConfig.weatherCity}`);
      } else {
        toast.error('Erreur météo: ' + data.message);
      }
    } catch {
      toast.error('Erreur lors du test météo');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-indigo-500" />
          Gestion Discord
        </h1>
        <p className="text-muted-foreground">
          Contrôle du bot, liaison membres et notifications
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="morning" className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            Morning Routine
          </TabsTrigger>
          <TabsTrigger value="liaison" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Liaison Membres
          </TabsTrigger>
          <TabsTrigger value="bot" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Bot Discord
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-green-500" />
                Configuration des notifications
              </CardTitle>
              <CardDescription>
                Configurez les webhooks Discord et la météo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Webhook URL */}
              <div className="space-y-2">
                <Label htmlFor="webhook">Webhook Discord</Label>
                <Input
                  id="webhook"
                  placeholder="https://discord.com/api/webhooks/..."
                  value={notifConfig.webhookUrl}
                  onChange={(e) => setNotifConfig({ ...notifConfig, webhookUrl: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Créez un webhook dans les paramètres de votre canal Discord
                </p>
              </div>

              {/* Weather */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weatherKey">Clé API OpenWeatherMap</Label>
                  <Input
                    id="weatherKey"
                    type="password"
                    placeholder="Clé API"
                    value={notifConfig.weatherApiKey}
                    onChange={(e) => setNotifConfig({ ...notifConfig, weatherApiKey: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    placeholder="Laval,FR"
                    value={notifConfig.weatherCity}
                    onChange={(e) => setNotifConfig({ ...notifConfig, weatherCity: e.target.value })}
                  />
                </div>
              </div>

              {/* Schedule */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sendTime">Heure d&apos;envoi quotidien</Label>
                  <Input
                    id="sendTime"
                    type="time"
                    value={notifConfig.sendTime}
                    onChange={(e) => setNotifConfig({ ...notifConfig, sendTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Envoi automatique</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      checked={notifConfig.enabled}
                      onCheckedChange={(checked) => setNotifConfig({ ...notifConfig, enabled: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {notifConfig.enabled ? 'Activé' : 'Désactivé'}
                    </span>
                  </div>
                </div>
              </div>

              <Button onClick={saveNotificationConfig} disabled={isSaving} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder la configuration'}
              </Button>
            </CardContent>
          </Card>

          {/* Preview & Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-purple-500" />
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={testWeather}>
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Météo
                </Button>
                <Button onClick={() => toast.info('Fonctionnalité à implémenter')}>
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer maintenant
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Morning Routine Tab */}
        <TabsContent value="morning" className="space-y-6">
          <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-yellow-500" />
                Morning Coach
              </CardTitle>
              <CardDescription>
                Envoi automatique de la routine matinale générée par IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Cette fonctionnalité sera migrée prochainement. Elle permet de générer et envoyer
                automatiquement une routine d&apos;échauffement personnalisée chaque matin.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Liaison Tab */}
        <TabsContent value="liaison" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Membres Discord</p>
                    <p className="text-3xl font-bold">{discordMembers.length}</p>
                  </div>
                  <Users className="h-10 w-10 text-indigo-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Liés</p>
                    <p className="text-3xl font-bold">{linkedCount}</p>
                  </div>
                  <UserCheck className="h-10 w-10 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">À lier</p>
                    <p className="text-3xl font-bold">{unlinkedCount}</p>
                  </div>
                  <UserX className="h-10 w-10 text-yellow-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-500/10 to-gray-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Inactifs</p>
                    <p className="text-3xl font-bold">{inactiveCount}</p>
                  </div>
                  <AlertTriangle className="h-10 w-10 text-gray-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters & Search */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un membre Discord ou adhérent..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              {(['all', 'linked', 'unlinked', 'inactive'] as FilterType[]).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' && 'Tous'}
                  {f === 'linked' && 'Liés'}
                  {f === 'unlinked' && 'Non liés'}
                  {f === 'inactive' && 'Inactifs'}
                </Button>
              ))}
            </div>

            <Button variant="outline" onClick={loadData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Sync
            </Button>
          </div>

          {/* Members List */}
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground mt-2">Chargement...</p>
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                  <p className="text-xl font-semibold mt-4">Aucun membre trouvé</p>
                  <p className="text-muted-foreground">Essayez un autre filtre ou recherche</p>
                </div>
              ) : (
                filteredMembers.map((dm) => (
                  <Card key={dm.discord_id} className={dm.member_id ? 'border-green-500/30' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {dm.discord_avatar ? (
                            <img
                              src={dm.discord_avatar}
                              alt={dm.discord_username}
                              className={`w-14 h-14 rounded-full border-2 ${dm.member_id ? 'border-green-500' : 'border-border'}`}
                            />
                          ) : (
                            <div className={`w-14 h-14 rounded-full bg-indigo-500/20 flex items-center justify-center border-2 ${dm.member_id ? 'border-green-500' : 'border-border'}`}>
                              <MessageSquare className="h-6 w-6 text-indigo-500" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">
                              {dm.server_nickname || dm.discord_global_name || dm.discord_username}
                            </h3>
                            {!dm.is_active && (
                              <Badge variant="secondary">Inactif</Badge>
                            )}
                            {dm.member_id ? (
                              <Badge className="bg-green-500">
                                <Link className="h-3 w-3 mr-1" />
                                Lié
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                                <Unlink className="h-3 w-3 mr-1" />
                                Non lié
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground font-mono">
                            @{dm.discord_username}
                          </p>

                          {dm.member_id && (
                            <div className="mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded">
                              <p className="text-sm font-semibold text-green-400">
                                <UserCheck className="h-4 w-4 inline mr-1" />
                                {dm.member_name || dm.firstname || 'Adhérent'}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex-shrink-0">
                          {dm.member_id ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnlink(dm.discord_id, dm.member_name || '', dm.discord_username)}
                            >
                              <Unlink className="h-4 w-4 mr-1" />
                              Délier
                            </Button>
                          ) : dm.is_active ? (
                            <LinkMemberDialog
                              discordId={dm.discord_id}
                              discordUsername={dm.discord_username}
                              members={members.filter((m) => !m.discord_id)}
                              onLink={handleLink}
                            />
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Bot Tab */}
        <TabsContent value="bot" className="space-y-6">
          {/* Status Card */}
          <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status du Bot</p>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    {botStatus === 'checking' && (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="text-muted-foreground">Vérification...</span>
                      </>
                    )}
                    {botStatus === 'active' && (
                      <>
                        <CheckCircle className="h-6 w-6 text-green-500" />
                        <span className="text-green-500">Actif</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          (sync il y a {lastSyncMinutes}min)
                        </span>
                      </>
                    )}
                    {botStatus === 'inactive' && (
                      <>
                        <AlertTriangle className="h-6 w-6 text-yellow-500" />
                        <span className="text-yellow-500">Inactif</span>
                        {lastSyncMinutes !== null && (
                          <span className="text-sm text-muted-foreground ml-2">
                            (dernière sync: {lastSyncMinutes}min)
                          </span>
                        )}
                      </>
                    )}
                    {botStatus === 'error' && (
                      <>
                        <XCircle className="h-6 w-6 text-red-500" />
                        <span className="text-red-500">Erreur</span>
                      </>
                    )}
                  </div>
                </div>
                <Bot className="h-16 w-16 text-indigo-500 opacity-30" />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Play className="h-5 w-5 text-green-500" />
                  Démarrer le Bot
                </CardTitle>
                <CardDescription>
                  Lance le bot manuellement via le fichier .bat
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Ouvrir start-bot.bat
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <RefreshCw className="h-5 w-5 text-blue-500" />
                  Synchronisation Manuelle
                </CardTitle>
                <CardDescription>
                  Force une synchronisation (nécessite bot actif)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline" onClick={loadData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Synchroniser
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* PM2 Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-purple-500" />
                Démarrage Automatique avec PM2
              </CardTitle>
              <CardDescription>
                PM2 garde le bot actif 24/7 et le redémarre automatiquement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-4 font-mono text-sm space-y-2">
                <p className="text-muted-foreground"># Installer PM2</p>
                <p className="text-green-400">npm install -g pm2</p>
                <Separator className="my-2" />
                <p className="text-muted-foreground"># Démarrer le bot</p>
                <p className="text-green-400">cd discord-bot</p>
                <p className="text-green-400">pm2 start sync-members.js --name &quot;discord-bot-skali&quot;</p>
                <Separator className="my-2" />
                <p className="text-muted-foreground"># Auto-start au démarrage</p>
                <p className="text-green-400">pm2 startup</p>
                <p className="text-green-400">pm2 save</p>
              </div>
            </CardContent>
          </Card>

          {/* Useful Commands */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-yellow-500" />
                Commandes Utiles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm text-muted-foreground mb-2">Voir les logs</p>
                  <code className="text-xs text-green-400">pm2 logs discord-bot-skali</code>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm text-muted-foreground mb-2">Redémarrer</p>
                  <code className="text-xs text-green-400">pm2 restart discord-bot-skali</code>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm text-muted-foreground mb-2">Vérifier status</p>
                  <code className="text-xs text-green-400">pm2 status</code>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm text-muted-foreground mb-2">Arrêter</p>
                  <code className="text-xs text-green-400">pm2 stop discord-bot-skali</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Link Member Dialog Component
function LinkMemberDialog({
  discordId,
  discordUsername,
  members,
  onLink,
}: {
  discordId: string;
  discordUsername: string;
  members: Member[];
  onLink: (discordId: string, memberId: string, memberName: string, discordUsername: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (member: Member) => {
    if (confirm(`Confirmer la liaison :\n\n${discordUsername} <-> ${member.name}`)) {
      onLink(discordId, member.id, member.name, discordUsername);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Link className="h-4 w-4 mr-1" />
          Lier
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Lier {discordUsername} à un adhérent
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un adhérent..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {filteredMembers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucun adhérent disponible
                </p>
              ) : (
                filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handleSelect(member)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <UserCheck className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{member.name}</p>
                        {member.email && (
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
