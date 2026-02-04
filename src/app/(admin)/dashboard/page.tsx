'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth-store';
import { ROLES } from '@/config/roles';
import {
  Users,
  Calendar,
  Package,
  MessageSquare,
  RefreshCw,
  UserCheck,
  Clock,
  ArrowRight,
  Loader2,
} from 'lucide-react';

interface PeppyParticipant {
  name: string;
  status: string;
}

interface PeppySession {
  sessionName: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
  date: string;
  participantCount: number;
  totalPlaces: number;
  participants: PeppyParticipant[];
  scrapedAt: string;
}

const STATS = [
  { title: 'Membres', value: '24', icon: Users, description: 'Membres actifs' },
  { title: 'Sessions', value: '12', icon: Calendar, description: 'Cette semaine' },
  { title: 'Équipements', value: '48', icon: Package, description: 'Dans l\'inventaire' },
  { title: 'Discord', value: '18', icon: MessageSquare, description: 'Membres liés' },
];

export default function DashboardPage() {
  const { session } = useAuthStore();
  const roleConfig = session?.role ? ROLES[session.role] : null;

  const [peppySession, setPeppySession] = useState<PeppySession | null>(null);
  const [isPeppyLoading, setIsPeppyLoading] = useState(false);
  const [peppyError, setPeppyError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  // Charger la session Peppy au montage
  useEffect(() => {
    loadPeppySession();
  }, []);

  const loadPeppySession = async (forceRefresh = false) => {
    setIsPeppyLoading(true);
    setPeppyError(null);

    try {
      const url = forceRefresh ? '/api/peppy/sync?refresh=true' : '/api/peppy/sync';
      const response = await fetch(url);
      const data = await response.json();

      if (data.success && data.data) {
        setPeppySession(data.data);
        setLastSync(data.fromCache ? data.cachedAt : data.syncedAt);
      } else {
        setPeppyError(data.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Peppy load error:', error);
      setPeppyError('Erreur de connexion');
    } finally {
      setIsPeppyLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenue,{' '}
          <span style={{ color: roleConfig?.color }}>
            {roleConfig?.label}
          </span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Peppy Current Session Widget */}
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-emerald-500" />
                Cours Actuel
              </CardTitle>
              <CardDescription>Participants inscrits sur Peppy</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadPeppySession(true)}
              disabled={isPeppyLoading}
            >
              {isPeppyLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          <CardContent>
            {isPeppyLoading && !peppySession ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : peppyError ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-2">{peppyError}</p>
                <Button variant="outline" size="sm" onClick={() => loadPeppySession(true)}>
                  Réessayer
                </Button>
              </div>
            ) : peppySession ? (
              <div className="space-y-4">
                {/* Session info */}
                <div className="flex items-center justify-between bg-emerald-500/10 rounded-lg p-3">
                  <div>
                    <div className="font-semibold text-emerald-600">{peppySession.sessionName || 'Session'}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {peppySession.startTime} - {peppySession.endTime}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-lg">
                    {peppySession.participantCount}/{peppySession.totalPlaces}
                  </Badge>
                </div>

                {/* Participants list */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Participants ({peppySession.participants.length})
                  </div>
                  <div className="max-h-[200px] overflow-y-auto space-y-1">
                    {peppySession.participants.length > 0 ? (
                      peppySession.participants.map((participant, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-sm">{participant.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {participant.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        Aucun participant inscrit
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">
                    Sync: {lastSync ? new Date(lastSync).toLocaleTimeString('fr-FR') : '-'}
                  </span>
                  <a href="/teams">
                    <Button variant="link" size="sm" className="text-emerald-600">
                      TeamBuilder <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                Cliquez sur refresh pour charger les participants
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
            <CardDescription>Accès direct aux fonctionnalités principales</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <a
              href="/teams"
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors border-emerald-500/30 bg-emerald-500/5"
            >
              <Users className="h-5 w-5 text-emerald-500" />
              <div>
                <div className="font-medium">TeamBuilder</div>
                <div className="text-sm text-muted-foreground">Créer des équipes équilibrées</div>
              </div>
            </a>
            <a
              href="/discord"
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <MessageSquare className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Discord</div>
                <div className="text-sm text-muted-foreground">Notifications, liaison membres</div>
              </div>
            </a>
            <a
              href="/inventory"
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <Package className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Inventaire</div>
                <div className="text-sm text-muted-foreground">Gérer les équipements</div>
              </div>
            </a>
            <a
              href="/members"
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <Users className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Membres</div>
                <div className="text-sm text-muted-foreground">Liste et gestion</div>
              </div>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
