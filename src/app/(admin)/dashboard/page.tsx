'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';
import { ROLES } from '@/config/roles';
import { Users, Calendar, Package, MessageSquare } from 'lucide-react';

const STATS = [
  { title: 'Membres', value: '24', icon: Users, description: 'Membres actifs' },
  { title: 'Sessions', value: '12', icon: Calendar, description: 'Cette semaine' },
  { title: 'Équipements', value: '48', icon: Package, description: 'Dans l\'inventaire' },
  { title: 'Discord', value: '18', icon: MessageSquare, description: 'Membres liés' },
];

export default function DashboardPage() {
  const { session } = useAuthStore();
  const roleConfig = session?.role ? ROLES[session.role] : null;

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

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
            <CardDescription>Accès direct aux fonctionnalités principales</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <a
              href="/admin/discord"
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <MessageSquare className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Discord</div>
                <div className="text-sm text-muted-foreground">Notifications, liaison membres</div>
              </div>
            </a>
            <a
              href="/admin/inventory"
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <Package className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Inventaire</div>
                <div className="text-sm text-muted-foreground">Gérer les équipements</div>
              </div>
            </a>
            <a
              href="/admin/members"
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

        <Card>
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
            <CardDescription>Dernières actions sur la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Aucune activité récente
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
