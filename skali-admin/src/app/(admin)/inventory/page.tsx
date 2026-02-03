'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Dumbbell, Wrench, AlertTriangle } from 'lucide-react';

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Package className="h-8 w-8 text-orange-500" />
          Inventaire
        </h1>
        <p className="text-muted-foreground">
          Gestion des équipements et méthodologies de la salle
        </p>
      </div>

      {/* Placeholder Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-blue-500" />
              Équipements
            </CardTitle>
            <CardDescription>
              Barres, haltères, kettlebells, machines...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">--</p>
            <p className="text-sm text-muted-foreground">équipements référencés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-yellow-500" />
              Maintenance
            </CardTitle>
            <CardDescription>
              Équipements nécessitant attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">--</p>
            <p className="text-sm text-muted-foreground">en maintenance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Alertes
            </CardTitle>
            <CardDescription>
              Stock bas ou équipement défectueux
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">--</p>
            <p className="text-sm text-muted-foreground">alertes actives</p>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mt-4">Module en cours de migration</h3>
            <p className="text-muted-foreground mt-2">
              Le module Inventaire sera bientôt disponible avec toutes les fonctionnalités
              de gestion des équipements, catégories et méthodologies.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
