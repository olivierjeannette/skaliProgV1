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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getSupabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  Bell,
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
  Search,
  Link,
  Unlink,
  CheckCircle,
  XCircle,
  Loader2,
  Settings,
  Webhook,
  Clock,
  Smartphone,
  ExternalLink,
  Copy,
  Info,
  Zap,
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
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  last_sync?: string;
  linked_at?: string;
  linked_by?: string;
}

interface Member {
  id: string;
  name: string;
  email?: string;
  discord_id?: string;
}

interface DiscordConfig {
  webhookUrl: string;
  weatherApiKey: string;
  weatherCity: string;
  guildId: string;
  botToken: string;
  notificationsEnabled: boolean;
}

type FilterType = 'all' | 'linked' | 'unlinked' | 'inactive';

// Discord icon SVG
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

export default function DiscordPage() {
  const [currentTab, setCurrentTab] = useState('liaison');
  const [discordMembers, setDiscordMembers] = useState<DiscordMember[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [botStatus, setBotStatus] = useState<'checking' | 'active' | 'inactive' | 'error'>('checking');
  const [lastSyncMinutes, setLastSyncMinutes] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Config state
  const [config, setConfig] = useState<DiscordConfig>({
    webhookUrl: '',
    weatherApiKey: '',
    weatherCity: 'Laval,FR',
    guildId: '',
    botToken: '',
    notificationsEnabled: false,
  });

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

      if (discordError) {
        console.warn('View discord_members_full not found, using fallback');
        // Fallback: load from discord_members directly
        const { data: fallbackData } = await supabase
          .from('discord_members')
          .select('*')
          .order('discord_username');
        setDiscordMembers(fallbackData || []);
      } else {
        setDiscordMembers(discordData || []);
      }

      // Load members
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('id, name, email, discord_id')
        .eq('is_active', true)
        .order('name');

      if (!membersError) {
        setMembers(membersData || []);
      }

      // Load config from settings
      const { data: settingsData } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', [
          'discord_webhook_url',
          'discord_guild_id',
          'discord_bot_token',
          'discord_notifications_enabled',
          'weather_api_key',
          'weather_city',
        ]);

      if (settingsData) {
        const settingsMap = Object.fromEntries(
          settingsData.map((s) => [s.key, s.value])
        );
        setConfig({
          webhookUrl: settingsMap.discord_webhook_url || '',
          guildId: settingsMap.discord_guild_id || '',
          botToken: settingsMap.discord_bot_token || '',
          notificationsEnabled: settingsMap.discord_notifications_enabled === 'true',
          weatherApiKey: settingsMap.weather_api_key || '',
          weatherCity: settingsMap.weather_city || 'Laval,FR',
        });
      }

      // Check bot status
      const { data: syncData } = await supabase
        .from('discord_members')
        .select('last_sync')
        .order('last_sync', { ascending: false })
        .limit(1);

      if (syncData && syncData.length > 0 && syncData[0].last_sync) {
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
      toast.error('Erreur lors du chargement');
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
        dm.first_name?.toLowerCase().includes(query) ||
        dm.last_name?.toLowerCase().includes(query);
      return matchDiscord || matchMember;
    }

    return true;
  });

  // Stats
  const totalCount = discordMembers.filter((dm) => dm.is_active).length;
  const linkedCount = discordMembers.filter((dm) => dm.member_id && dm.is_active).length;
  const unlinkedCount = discordMembers.filter((dm) => !dm.member_id && dm.is_active).length;
  const inactiveCount = discordMembers.filter((dm) => !dm.is_active).length;

  // Link member
  const handleLink = async (discordId: string, memberId: string, memberName: string, discordUsername: string) => {
    const supabase = getSupabase();

    try {
      const { error } = await supabase.rpc('link_discord_to_member', {
        p_discord_id: discordId,
        p_member_id: memberId,
        p_linked_by: 'admin',
      });

      if (error) {
        // Fallback si RPC n'existe pas
        console.warn('RPC failed, using fallback');
        await supabase
          .from('discord_members')
          .update({ member_id: memberId, linked_at: new Date().toISOString(), linked_by: 'admin' })
          .eq('discord_id', discordId);
        await supabase
          .from('members')
          .update({ discord_id: discordId })
          .eq('id', memberId);
      }

      toast.success(`${discordUsername} lie a ${memberName}`);
      loadData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur';
      toast.error('Erreur: ' + message);
    }
  };

  // Unlink member
  const handleUnlink = async (discordId: string, memberName: string, discordUsername: string) => {
    if (!confirm(`Delier ${discordUsername} de ${memberName} ?`)) return;

    const supabase = getSupabase();

    try {
      const { error } = await supabase.rpc('unlink_discord_from_member', {
        p_discord_id: discordId,
      });

      if (error) {
        // Fallback
        const { data: dm } = await supabase
          .from('discord_members')
          .select('member_id')
          .eq('discord_id', discordId)
          .single();

        if (dm?.member_id) {
          await supabase
            .from('members')
            .update({ discord_id: null })
            .eq('id', dm.member_id);
        }
        await supabase
          .from('discord_members')
          .update({ member_id: null, linked_at: null, linked_by: null })
          .eq('discord_id', discordId);
      }

      toast.success(`${discordUsername} delie`);
      loadData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur';
      toast.error('Erreur: ' + message);
    }
  };

  // Save config
  const saveConfig = async () => {
    setIsSaving(true);
    const supabase = getSupabase();

    try {
      const settings = [
        { key: 'discord_webhook_url', value: config.webhookUrl },
        { key: 'discord_guild_id', value: config.guildId },
        { key: 'discord_bot_token', value: config.botToken },
        { key: 'discord_notifications_enabled', value: config.notificationsEnabled.toString() },
        { key: 'weather_api_key', value: config.weatherApiKey },
        { key: 'weather_city', value: config.weatherCity },
      ];

      for (const setting of settings) {
        await supabase
          .from('settings')
          .upsert({ key: setting.key, value: setting.value }, { onConflict: 'key' });
      }

      toast.success('Configuration sauvegardee');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  // Test weather
  const testWeather = async () => {
    if (!config.weatherApiKey) {
      toast.error('Cle API meteo non configuree');
      return;
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${config.weatherCity}&appid=${config.weatherApiKey}&units=metric&lang=fr`
      );
      const data = await response.json();

      if (data.cod === 200) {
        toast.success(`${data.weather[0].description} - ${Math.round(data.main.temp)}C a ${config.weatherCity}`);
      } else {
        toast.error('Erreur meteo: ' + data.message);
      }
    } catch {
      toast.error('Erreur lors du test meteo');
    }
  };

  // Test webhook
  const testWebhook = async () => {
    if (!config.webhookUrl) {
      toast.error('Webhook URL non configuree');
      return;
    }

    try {
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: 'Test Skali Prog',
            description: 'Webhook fonctionne correctement !',
            color: 0x228B22,
            timestamp: new Date().toISOString(),
          }],
        }),
      });

      if (response.ok) {
        toast.success('Message test envoye sur Discord !');
      } else {
        toast.error('Erreur webhook: ' + response.status);
      }
    } catch {
      toast.error('Erreur lors du test webhook');
    }
  };

  const copyPortalUrl = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/portal` : '';
    navigator.clipboard.writeText(url);
    toast.success('URL copiee !');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl flex items-center gap-3">
            <DiscordIcon className="h-8 w-8 text-indigo-500" />
            Discord & PWA
          </h1>
          <p className="text-muted-foreground">
            Gestion de la liaison membres et configuration Discord
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button variant="outline" onClick={copyPortalUrl}>
            <Smartphone className="h-4 w-4 mr-2" />
            Lien Portal
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border-indigo-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Membres Discord</p>
                <p className="text-3xl font-bold">{totalCount}</p>
              </div>
              <Users className="h-10 w-10 text-indigo-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lies</p>
                <p className="text-3xl font-bold">{linkedCount}</p>
              </div>
              <UserCheck className="h-10 w-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">A lier</p>
                <p className="text-3xl font-bold">{unlinkedCount}</p>
              </div>
              <UserX className="h-10 w-10 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-500/10 to-gray-500/5 border-gray-500/20">
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

        <Card className={`border-2 ${
          botStatus === 'active' ? 'border-green-500/50 bg-green-500/5' :
          botStatus === 'inactive' ? 'border-yellow-500/50 bg-yellow-500/5' :
          'border-red-500/50 bg-red-500/5'
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bot Status</p>
                <div className="flex items-center gap-2">
                  {botStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin" />}
                  {botStatus === 'active' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {botStatus === 'inactive' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                  {botStatus === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                  <span className="text-lg font-bold">
                    {botStatus === 'active' ? 'Actif' : botStatus === 'inactive' ? 'Inactif' : botStatus === 'error' ? 'Erreur' : '...'}
                  </span>
                </div>
                {lastSyncMinutes !== null && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Sync il y a {lastSyncMinutes} min
                  </p>
                )}
              </div>
              <Bot className="h-10 w-10 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="liaison" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            <span className="hidden sm:inline">Liaison Membres</span>
            <span className="sm:hidden">Liaison</span>
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Configuration</span>
            <span className="sm:hidden">Config</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
            <span className="sm:hidden">Notifs</span>
          </TabsTrigger>
        </TabsList>

        {/* LIAISON TAB */}
        <TabsContent value="liaison" className="space-y-4">
          {/* Info PWA */}
          <Card className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-emerald-500/20">
                    <Smartphone className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Portail Membre PWA</h3>
                    <p className="text-sm text-muted-foreground">
                      Les adherents peuvent se connecter avec Discord et lier leur compte
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 ml-auto">
                  <Button variant="outline" size="sm" onClick={copyPortalUrl}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copier URL
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('/portal', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ouvrir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un membre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les actifs</SelectItem>
                <SelectItem value="linked">Lies seulement</SelectItem>
                <SelectItem value="unlinked">Non lies</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Members List */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Membres Discord ({filteredMembers.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="text-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground mt-2">Chargement...</p>
                    </div>
                  ) : filteredMembers.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                      <p className="text-xl font-semibold mt-4">Aucun membre trouve</p>
                      <p className="text-muted-foreground">Essayez un autre filtre</p>
                    </div>
                  ) : (
                    filteredMembers.map((dm) => (
                      <div
                        key={dm.discord_id}
                        className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                          dm.member_id
                            ? 'border-green-500/30 bg-green-500/5'
                            : 'border-border hover:border-muted-foreground/30'
                        }`}
                      >
                        {/* Avatar */}
                        {dm.discord_avatar ? (
                          <img
                            src={dm.discord_avatar}
                            alt={dm.discord_username}
                            className={`w-12 h-12 rounded-full border-2 ${
                              dm.member_id ? 'border-green-500' : 'border-border'
                            }`}
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            dm.member_id ? 'bg-green-500/20' : 'bg-muted'
                          }`}>
                            <DiscordIcon className="h-6 w-6 text-indigo-500" />
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold truncate">
                              {dm.server_nickname || dm.discord_global_name || dm.discord_username}
                            </h3>
                            {!dm.is_active && (
                              <Badge variant="secondary" className="text-xs">Inactif</Badge>
                            )}
                            {dm.member_id ? (
                              <Badge className="bg-green-500/20 text-green-600 border-green-500/30 text-xs">
                                <Link className="h-3 w-3 mr-1" />
                                Lie
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-yellow-500/50 text-yellow-600 text-xs">
                                <Unlink className="h-3 w-3 mr-1" />
                                Non lie
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground font-mono">
                            @{dm.discord_username}
                          </p>
                          {dm.member_name && (
                            <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                              <UserCheck className="h-3 w-3" />
                              {dm.member_name}
                            </p>
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
                              Delier
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
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONFIG TAB */}
        <TabsContent value="config" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DiscordIcon className="h-5 w-5 text-indigo-500" />
                  Discord OAuth
                </CardTitle>
                <CardDescription>
                  Configuration pour l&apos;authentification Discord
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="guildId">Guild ID (Serveur)</Label>
                  <Input
                    id="guildId"
                    placeholder="123456789012345678"
                    value={config.guildId}
                    onChange={(e) => setConfig({ ...config, guildId: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    ID du serveur Discord La Skali
                  </p>
                </div>
                <Separator />
                <div className="rounded-lg border bg-muted/50 p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Variables d&apos;environnement
                  </h4>
                  <div className="space-y-1 text-xs font-mono text-muted-foreground">
                    <p>DISCORD_CLIENT_ID=...</p>
                    <p>DISCORD_CLIENT_SECRET=...</p>
                    <p>DISCORD_REDIRECT_URI=.../api/auth/discord/callback</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5 text-purple-500" />
                  Webhook Discord
                </CardTitle>
                <CardDescription>
                  Pour envoyer des notifications automatiques
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook">URL du Webhook</Label>
                  <Input
                    id="webhook"
                    type="password"
                    placeholder="https://discord.com/api/webhooks/..."
                    value={config.webhookUrl}
                    onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                  />
                </div>
                <Button variant="outline" onClick={testWebhook} className="w-full">
                  <TestTube className="h-4 w-4 mr-2" />
                  Tester le webhook
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-blue-500" />
                  Meteo (Morning Routine)
                </CardTitle>
                <CardDescription>
                  API OpenWeatherMap pour les routines matinales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="weatherKey">Cle API OpenWeatherMap</Label>
                  <Input
                    id="weatherKey"
                    type="password"
                    placeholder="Cle API"
                    value={config.weatherApiKey}
                    onChange={(e) => setConfig({ ...config, weatherApiKey: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    placeholder="Laval,FR"
                    value={config.weatherCity}
                    onChange={(e) => setConfig({ ...config, weatherCity: e.target.value })}
                  />
                </div>
                <Button variant="outline" onClick={testWeather} className="w-full">
                  <TestTube className="h-4 w-4 mr-2" />
                  Tester la meteo
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-green-500" />
                  Bot Discord (Sync)
                </CardTitle>
                <CardDescription>
                  Token du bot pour synchroniser les membres
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="botToken">Bot Token</Label>
                  <Input
                    id="botToken"
                    type="password"
                    placeholder="Token du bot Discord"
                    value={config.botToken}
                    onChange={(e) => setConfig({ ...config, botToken: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Necessaire pour la sync automatique des membres
                  </p>
                </div>
                <Separator />
                <div className="rounded-lg border bg-muted/50 p-3 text-xs">
                  <p className="font-medium mb-2">Demarrer le bot avec PM2:</p>
                  <code className="text-emerald-500">pm2 start sync-members.js --name discord-bot</code>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveConfig} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder la configuration'}
            </Button>
          </div>
        </TabsContent>

        {/* NOTIFICATIONS TAB */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-500" />
                Notifications automatiques
              </CardTitle>
              <CardDescription>
                Configurez les notifications envoyees automatiquement sur Discord
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Activer les notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Envoie automatique des notifications programmees
                  </p>
                </div>
                <Switch
                  checked={config.notificationsEnabled}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, notificationsEnabled: checked })
                  }
                />
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-yellow-500/20">
                        <Zap className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">Morning Routine</h4>
                        <p className="text-xs text-muted-foreground">Echauffement quotidien</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">Bientot disponible</Badge>
                  </CardContent>
                </Card>

                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <Clock className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">Rappels seances</h4>
                        <p className="text-xs text-muted-foreground">Rappel 1h avant</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">Bientot disponible</Badge>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={testWebhook}>
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer un test
                </Button>
                <Button onClick={saveConfig} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
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
    onLink(discordId, member.id, member.name, discordUsername);
    setOpen(false);
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
          <DialogTitle>Lier a un adherent</DialogTitle>
          <DialogDescription>
            Selectionnez l&apos;adherent a lier a @{discordUsername}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {filteredMembers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucun adherent disponible
                </p>
              ) : (
                filteredMembers.map((member) => (
                  <button
                    key={member.id}
                    className="w-full p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors text-left flex items-center gap-3"
                    onClick={() => handleSelect(member)}
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{member.name}</p>
                      {member.email && (
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
