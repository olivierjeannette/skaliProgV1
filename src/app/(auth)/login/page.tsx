'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { ROLES } from '@/config/roles';
import type { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, Crown, User, Dumbbell } from 'lucide-react';

const ROLE_ICONS = {
  ADMIN: Crown,
  COACH: User,
  ATHLETE: Dumbbell,
};

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(selectedRole, password);
    if (success) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">S</span>
          </div>
          <CardTitle className="text-2xl">Skali Admin</CardTitle>
          <CardDescription>
            Connectez-vous pour accéder à l&apos;interface d&apos;administration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <Tabs
              value={selectedRole}
              onValueChange={(v) => setSelectedRole(v as UserRole)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                {(Object.keys(ROLES) as UserRole[]).map((role) => {
                  const Icon = ROLE_ICONS[role];
                  return (
                    <TabsTrigger
                      key={role}
                      value={role}
                      className="flex items-center gap-2"
                      style={{
                        '--role-color': ROLES[role].color,
                      } as React.CSSProperties}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{ROLES[role].label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              style={{ backgroundColor: ROLES[selectedRole].color }}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <>Se connecter en tant que {ROLES[selectedRole].label}</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
