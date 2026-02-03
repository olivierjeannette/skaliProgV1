'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { API_KEYS_CONFIG } from '@/config/api-keys';
import { Key, Eye, EyeOff, Save, TestTube, RefreshCw, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export function APIKeysTab() {
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Charger les clés depuis l'API
  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/api-keys');
      const data = await response.json();
      if (data.success) {
        setKeys(data.keys || {});
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des clés');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVisibility = (name: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const handleChange = (name: string, value: string) => {
    setKeys((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Clés sauvegardées avec succès');
      } else {
        toast.error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async (name: string) => {
    setTestResults((prev) => ({ ...prev, [name]: null }));
    try {
      const response = await fetch('/api/api-keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, value: keys[name] }),
      });
      const data = await response.json();
      setTestResults((prev) => ({ ...prev, [name]: data.success }));
      if (data.success) {
        toast.success(`${name}: Connexion réussie`);
      } else {
        toast.error(`${name}: ${data.message || 'Échec du test'}`);
      }
    } catch (error) {
      setTestResults((prev) => ({ ...prev, [name]: false }));
      toast.error(`${name}: Erreur de test`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          <span className="font-medium">Configuration des clés API</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadKeys} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Recharger
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>

      {/* API Keys Grid */}
      <div className="grid gap-4">
        {API_KEYS_CONFIG.map((config) => {
          const value = keys[config.name] || '';
          const isVisible = visibleKeys.has(config.name);
          const testResult = testResults[config.name];

          return (
            <Card key={config.name}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {config.label}
                      {config.required && (
                        <Badge variant="secondary" className="text-xs">
                          Requis
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{config.description}</CardDescription>
                  </div>
                  {testResult !== undefined && (
                    <div className="flex items-center gap-2">
                      {testResult === null ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                      ) : testResult ? (
                        <Badge variant="default" className="bg-green-500">
                          <Check className="h-3 w-3 mr-1" />
                          OK
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <X className="h-3 w-3 mr-1" />
                          Erreur
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={isVisible ? 'text' : 'password'}
                      placeholder={config.placeholder}
                      value={value}
                      onChange={(e) => handleChange(config.name, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => toggleVisibility(config.name)}
                    >
                      {isVisible ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {config.testable && (
                    <Button
                      variant="outline"
                      onClick={() => handleTest(config.name)}
                      disabled={!value}
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      Tester
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
