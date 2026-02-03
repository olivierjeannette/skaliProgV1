'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Settings2,
  Shuffle,
  Copy,
  Trash2,
  UserPlus,
  Database,
  Save,
  Tv,
  Trophy,
  RefreshCw,
  X,
  UserCheck,
  Layers,
  Scale,
} from 'lucide-react';
import {
  type TeamParticipant,
  type Team,
  type TeamSettings,
  type TeamMode,
  type BalanceMode,
  type ParticipantLevel,
  type Member,
  LEVEL_POINTS,
  LEVEL_LABELS,
} from '@/types';
import { createClient } from '@/lib/supabase/client';

// Default settings
const DEFAULT_SETTINGS: TeamSettings = {
  mode: 'teams',
  numberOfTeams: 2,
  teamSize: 4,
  balanceMode: 'level',
};

// Team colors for display
const TEAM_COLORS = [
  'bg-blue-500/20 border-blue-500/50',
  'bg-green-500/20 border-green-500/50',
  'bg-purple-500/20 border-purple-500/50',
  'bg-orange-500/20 border-orange-500/50',
  'bg-pink-500/20 border-pink-500/50',
  'bg-cyan-500/20 border-cyan-500/50',
  'bg-yellow-500/20 border-yellow-500/50',
  'bg-red-500/20 border-red-500/50',
];

export default function TeamsPage() {
  const [settings, setSettings] = useState<TeamSettings>(DEFAULT_SETTINGS);
  const [inputText, setInputText] = useState('');
  const [participants, setParticipants] = useState<TeamParticipant[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [membersCache, setMembersCache] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Load members cache on mount
  useEffect(() => {
    loadMembersCache();
    loadSavedSettings();
  }, []);

  const loadMembersCache = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (!error && data) {
      setMembersCache(data as Member[]);
    }
  };

  const loadSavedSettings = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('teambuilder_settings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        } catch (e) {
          console.error('Error loading settings:', e);
        }
      }
    }
  };

  const saveSettings = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('teambuilder_settings', JSON.stringify(settings));
    }
  };

  // Parse participant name and find in database
  const parseParticipant = useCallback((line: string): TeamParticipant | null => {
    const cleanName = line.trim();
    if (!cleanName) return null;

    // Try to find in members cache (fuzzy match)
    const foundMember = membersCache.find(member => {
      const memberName = member.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const searchName = cleanName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return memberName.includes(searchName) || searchName.includes(memberName);
    });

    return {
      id: foundMember?.id || `temp-${Date.now()}-${Math.random()}`,
      name: cleanName,
      cleanName: cleanName,
      gender: foundMember?.gender === 'male' ? 'homme' : foundMember?.gender === 'female' ? 'femme' : null,
      level: 'intermediaire',
      points: LEVEL_POINTS.intermediaire,
      isInDatabase: !!foundMember,
      memberId: foundMember?.id,
    };
  }, [membersCache]);

  // Auto-parse input text
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!inputText.trim()) {
        setParticipants([]);
        return;
      }

      const lines = inputText.split('\n').filter(line => line.trim());
      const newParticipants: TeamParticipant[] = [];

      lines.forEach(line => {
        const participant = parseParticipant(line);
        if (participant) {
          // Avoid duplicates
          const exists = newParticipants.some(
            p => p.cleanName.toLowerCase() === participant.cleanName.toLowerCase()
          );
          if (!exists) {
            newParticipants.push(participant);
          }
        }
      });

      setParticipants(newParticipants);
    }, 500);

    return () => clearTimeout(timer);
  }, [inputText, parseParticipant]);

  // Update participant gender
  const updateGender = (id: string, gender: 'homme' | 'femme') => {
    setParticipants(prev =>
      prev.map(p => (p.id === id ? { ...p, gender } : p))
    );
  };

  // Update participant level
  const updateLevel = (id: string, level: ParticipantLevel) => {
    setParticipants(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, level, points: LEVEL_POINTS[level] }
          : p
      )
    );
  };

  // Remove participant
  const removeParticipant = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  // Clear all
  const clearAll = () => {
    setInputText('');
    setParticipants([]);
    setTeams([]);
    setShowResults(false);
  };

  // Generate teams
  const generateTeams = () => {
    const recognized = participants.filter(p => p.isInDatabase);
    if (recognized.length < 2) {
      alert('Il faut au moins 2 participants reconnus pour créer des équipes.');
      return;
    }

    setIsLoading(true);

    // Calculate number of teams
    let numTeams = settings.mode === 'teams'
      ? settings.numberOfTeams
      : Math.ceil(recognized.length / settings.teamSize);

    numTeams = Math.max(2, Math.min(numTeams, 10));

    // Sort participants for balancing
    let sortedParticipants = [...recognized];

    if (settings.balanceMode === 'level') {
      // Group by level, then distribute
      sortedParticipants.sort((a, b) => b.points - a.points);
    } else {
      // Homogeneous: shuffle then sort by points for snake draft
      sortedParticipants = sortedParticipants
        .sort(() => Math.random() - 0.5)
        .sort((a, b) => b.points - a.points);
    }

    // Initialize teams
    const newTeams: Team[] = Array.from({ length: numTeams }, (_, i) => ({
      id: i + 1,
      name: `Équipe ${i + 1}`,
      participants: [],
      totalPoints: 0,
      maleCount: 0,
      femaleCount: 0,
    }));

    // Snake draft distribution
    let teamIndex = 0;
    let direction = 1;

    sortedParticipants.forEach(participant => {
      newTeams[teamIndex].participants.push(participant);
      newTeams[teamIndex].totalPoints += participant.points;
      if (participant.gender === 'homme') newTeams[teamIndex].maleCount++;
      if (participant.gender === 'femme') newTeams[teamIndex].femaleCount++;

      teamIndex += direction;
      if (teamIndex >= numTeams) {
        teamIndex = numTeams - 1;
        direction = -1;
      } else if (teamIndex < 0) {
        teamIndex = 0;
        direction = 1;
      }
    });

    setTeams(newTeams);
    setShowResults(true);
    setIsLoading(false);
  };

  // Copy teams to clipboard
  const copyToClipboard = () => {
    const text = teams
      .map(team => {
        const members = team.participants.map(p => `  - ${p.cleanName}`).join('\n');
        return `${team.name} (${team.totalPoints}pts)\n${members}`;
      })
      .join('\n\n');

    navigator.clipboard.writeText(text);
  };

  // Stats
  const recognizedCount = participants.filter(p => p.isInDatabase).length;
  const maleCount = participants.filter(p => p.gender === 'homme').length;
  const femaleCount = participants.filter(p => p.gender === 'femme').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            TeamBuilder Pro
          </h1>
          <p className="text-muted-foreground mt-1">
            Configuration → Import → Génération
          </p>
        </div>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            1. Configuration
          </CardTitle>
          <Button variant="outline" size="sm" onClick={saveSettings}>
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            {/* Mode */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground uppercase">Mode</label>
              <div className="flex gap-2">
                <Button
                  variant={settings.mode === 'teams' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setSettings(s => ({ ...s, mode: 'teams' as TeamMode }))}
                >
                  Nb Équipes
                </Button>
                <Button
                  variant={settings.mode === 'size' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setSettings(s => ({ ...s, mode: 'size' as TeamMode }))}
                >
                  Taille
                </Button>
              </div>
              <div className="mt-3">
                {settings.mode === 'teams' ? (
                  <Input
                    type="number"
                    min={2}
                    max={10}
                    value={settings.numberOfTeams}
                    onChange={(e) => setSettings(s => ({ ...s, numberOfTeams: parseInt(e.target.value) || 2 }))}
                    className="text-2xl font-bold text-center h-14"
                  />
                ) : (
                  <Input
                    type="number"
                    min={2}
                    max={8}
                    value={settings.teamSize}
                    onChange={(e) => setSettings(s => ({ ...s, teamSize: parseInt(e.target.value) || 4 }))}
                    className="text-2xl font-bold text-center h-14"
                  />
                )}
              </div>
            </div>

            {/* Balance Mode */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground uppercase">Équilibrage</label>
              <div className="flex gap-2">
                <Button
                  variant={settings.balanceMode === 'level' ? 'secondary' : 'outline'}
                  className="flex-1 flex-col h-auto py-3"
                  onClick={() => setSettings(s => ({ ...s, balanceMode: 'level' as BalanceMode }))}
                >
                  <Layers className="h-5 w-5 mb-1" />
                  <span className="text-xs">Par Niveau</span>
                </Button>
                <Button
                  variant={settings.balanceMode === 'homogeneous' ? 'secondary' : 'outline'}
                  className="flex-1 flex-col h-auto py-3"
                  onClick={() => setSettings(s => ({ ...s, balanceMode: 'homogeneous' as BalanceMode }))}
                >
                  <Scale className="h-5 w-5 mb-1" />
                  <span className="text-xs">Équilibré</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import & Participants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              2. Import & Liste des Participants
            </span>
            <Badge variant="outline" className="text-lg px-3">
              {participants.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Textarea */}
          <Textarea
            placeholder="Collez la liste des noms (un par ligne)...

Jean Dupont
Marie Martin
Pierre Durand"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[150px] font-mono"
          />

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" onClick={() => loadMembersCache()}>
              <Database className="h-4 w-4 mr-2" />
              Sync BDD
            </Button>
            <Button variant="outline" onClick={() => setInputText('')}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset texte
            </Button>
            <Button variant="outline" onClick={clearAll} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Tout effacer
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{recognizedCount}</div>
              <div className="text-xs text-muted-foreground uppercase">Reconnus</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">{maleCount}</div>
              <div className="text-xs text-muted-foreground">♂ Hommes</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-pink-500">{femaleCount}</div>
              <div className="text-xs text-muted-foreground">♀ Femmes</div>
            </div>
          </div>

          {/* Participants list */}
          {participants.filter(p => p.isInDatabase).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Participants reconnus
                <Badge variant="secondary">{recognizedCount}</Badge>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto p-1">
                {participants.filter(p => p.isInDatabase).map(participant => (
                  <Card key={participant.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <UserCheck className="h-4 w-4 text-primary" />
                        <span className="font-medium truncate">{participant.cleanName}</span>
                      </div>

                      {/* Gender buttons */}
                      <div className="flex gap-1 mb-3">
                        <Button
                          size="sm"
                          variant={participant.gender === 'homme' ? 'default' : 'outline'}
                          className={`flex-1 ${participant.gender === 'homme' ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                          onClick={() => updateGender(participant.id, 'homme')}
                        >
                          ♂
                        </Button>
                        <Button
                          size="sm"
                          variant={participant.gender === 'femme' ? 'default' : 'outline'}
                          className={`flex-1 ${participant.gender === 'femme' ? 'bg-pink-500 hover:bg-pink-600' : ''}`}
                          onClick={() => updateGender(participant.id, 'femme')}
                        >
                          ♀
                        </Button>
                      </div>

                      {/* Level select */}
                      <Select
                        value={participant.level}
                        onValueChange={(value) => updateLevel(participant.id, value as ParticipantLevel)}
                      >
                        <SelectTrigger className="text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(LEVEL_LABELS) as ParticipantLevel[]).map(level => (
                            <SelectItem key={level} value={level}>
                              {LEVEL_LABELS[level]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Remove button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeParticipant(participant.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate & Results */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3 mb-6">
            <Button
              size="lg"
              className="flex-1"
              onClick={generateTeams}
              disabled={isLoading || recognizedCount < 2}
            >
              <Shuffle className="h-5 w-5 mr-2" />
              Générer les Équipes
            </Button>
            <Button variant="outline" size="lg" disabled={teams.length === 0}>
              <Tv className="h-5 w-5 mr-2" />
              Mode TV
            </Button>
          </div>

          {/* Results */}
          {showResults && teams.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Équipes créées
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={generateTeams}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Régénérer
                  </Button>
                  <Button variant="secondary" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copier
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {teams.map((team, index) => (
                  <Card key={team.id} className={`border-2 ${TEAM_COLORS[index % TEAM_COLORS.length]}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between text-base">
                        <span>{team.name}</span>
                        <Badge variant="secondary">{team.totalPoints} pts</Badge>
                      </CardTitle>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span className="text-blue-500">♂ {team.maleCount}</span>
                        <span className="text-pink-500">♀ {team.femaleCount}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-1">
                        {team.participants.map(p => (
                          <li key={p.id} className="text-sm flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              p.gender === 'homme' ? 'bg-blue-500' :
                              p.gender === 'femme' ? 'bg-pink-500' : 'bg-gray-500'
                            }`} />
                            <span className="truncate">{p.cleanName}</span>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {p.points}pt
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
