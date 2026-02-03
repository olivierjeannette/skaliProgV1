'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';

export default function MembersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-500" />
          Membres
        </h1>
        <p className="text-muted-foreground">
          Gestion des adhérents et de leurs informations
        </p>
      </div>

      {/* Placeholder Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Membres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">--</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-500" />
              Actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">--</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <UserX className="h-4 w-4 text-red-500" />
              Inactifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-500">--</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Ce mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-500">--</p>
            <p className="text-xs text-muted-foreground">nouvelles inscriptions</p>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mt-4">Module en cours de migration</h3>
            <p className="text-muted-foreground mt-2">
              Le module Membres sera bientôt disponible avec la liste complète des adhérents,
              leurs profils, statistiques et historique.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
