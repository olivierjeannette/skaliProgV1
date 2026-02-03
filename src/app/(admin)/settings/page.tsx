'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Key, Tv, Settings } from 'lucide-react';
import { APIKeysTab } from '@/components/settings/APIKeysTab';
import { TVSettingsTab } from '@/components/settings/TVSettingsTab';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('api-keys');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          Paramètres
        </h1>
        <p className="text-muted-foreground">
          Configuration de l'application et des intégrations
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Clés API
          </TabsTrigger>
          <TabsTrigger value="tv-config" className="flex items-center gap-2">
            <Tv className="h-4 w-4" />
            Mode TV
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys">
          <APIKeysTab />
        </TabsContent>

        <TabsContent value="tv-config">
          <TVSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
