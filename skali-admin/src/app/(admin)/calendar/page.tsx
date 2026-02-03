'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CalendarDays, Clock, Users } from 'lucide-react';

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Calendar className="h-8 w-8 text-purple-500" />
          Calendrier
        </h1>
        <p className="text-muted-foreground">
          Planning des séances et événements
        </p>
      </div>

      {/* Placeholder Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-500" />
              Cette semaine
            </CardTitle>
            <CardDescription>
              Séances programmées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">--</p>
            <p className="text-sm text-muted-foreground">séances</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              Aujourd&apos;hui
            </CardTitle>
            <CardDescription>
              Prochaine séance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">--:--</p>
            <p className="text-sm text-muted-foreground">Aucune séance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-500" />
              Participants
            </CardTitle>
            <CardDescription>
              Inscrits cette semaine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">--</p>
            <p className="text-sm text-muted-foreground">personnes</p>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mt-4">Module en cours de migration</h3>
            <p className="text-muted-foreground mt-2">
              Le module Calendrier sera bientôt disponible avec la vue hebdomadaire,
              la gestion des séances et les inscriptions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
