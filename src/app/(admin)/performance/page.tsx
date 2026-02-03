'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getSupabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Member, Performance, PokemonStats, OneRMFormulas, EXERCISE_MAPPING, PokemonStatCategory } from '@/types';
import {
  TrendingUp,
  Trophy,
  Target,
  Dumbbell,
  Zap,
  Wind,
  Heart,
  RefreshCw,
  Loader2,
  Save,
  X,
  Plus,
  Search,
  Medal,
  Flame,
  ArrowUp,
  User,
} from 'lucide-react';

// Exercise categories with their exercises
const EXERCISES_BY_CATEGORY: Record<string, string[]> = {
  Musculation: ['Bench Press', 'Deadlift', 'Back Squat', 'Front Squat', 'Strict Press', 'Snatch', 'Clean & Jerk'],
  Crosstraining: ['Pullups', 'Toes to Bar', 'Burpees', 'Wall Balls', 'Box Jumps', 'Thrusters', 'Muscle Ups'],
  Endurance: ['1200m Run', '2000m Run', '1km Rameur', '2km BikeErg', '1km SkiErg', '5km Run'],
  Gymnastique: ['Handstand Hold', 'L-Sit Hold', 'Ring Dips', 'Pistol Squats', 'Strict HSPU'],
};

// Pokemon stat colors
const STAT_COLORS: Record<PokemonStatCategory, { bg: string; text: string; icon: React.ReactNode }> = {
  cardio: { bg: 'bg-red-500/20', text: 'text-red-400', icon: <Heart className="h-4 w-4" /> },
  force: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: <Dumbbell className="h-4 w-4" /> },
  gym: { bg: 'bg-green-500/20', text: 'text-green-400', icon: <Target className="h-4 w-4" /> },
  puissance: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: <Zap className="h-4 w-4" /> },
};

// Calculate 1RM
function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps <= 0 || weight <= 0) return 0;
  return Math.round(OneRMFormulas.epley(weight, reps) * 2) / 2;
}

// Parse member name
function parseName(fullName: string): { firstName: string; lastName: string } {
  const parts = (fullName || '').trim().split(' ');
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || '',
  };
}

// Calculate Pokemon stats for a member based on their performances
function calculatePokemonStats(
  memberPerfs: Performance[],
  allPerfs: Performance[],
  memberGender: 'male' | 'female' | null
): PokemonStats {
  const defaultStats: PokemonStats = { cardio: 5, force: 5, gym: 5, puissance: 5, niveau: 5 };

  if (memberPerfs.length === 0) return defaultStats;

  // Filter by same gender for fair comparison
  const sameGenderPerfs = allPerfs; // TODO: Filter by gender when we have gender on performances

  // Calculate best performances by exercise
  const calculateBestByExercise = (perfs: Performance[]) => {
    const bestByExercise = new Map<string, { value: number; category: PokemonStatCategory | null }>();

    perfs.forEach((perf) => {
      const exercise = perf.exercise_type.toLowerCase();
      const value = perf.value;

      // Determine category
      let category: PokemonStatCategory | null = null;
      for (const [cat, keywords] of Object.entries(EXERCISE_MAPPING)) {
        if (keywords.some((kw) => exercise.includes(kw))) {
          category = cat as PokemonStatCategory;
          break;
        }
      }

      if (!category) return;

      const existing = bestByExercise.get(exercise);
      if (!existing) {
        bestByExercise.set(exercise, { value, category });
      } else if (category === 'cardio') {
        // For cardio: lower is better
        if (value < existing.value) {
          bestByExercise.set(exercise, { value, category });
        }
      } else {
        // For others: higher is better
        if (value > existing.value) {
          bestByExercise.set(exercise, { value, category });
        }
      }
    });

    return bestByExercise;
  };

  const memberBest = calculateBestByExercise(memberPerfs);
  const globalBest = calculateBestByExercise(sameGenderPerfs);

  // Calculate score for each category
  const calculateCategoryScore = (category: PokemonStatCategory): number => {
    const memberInCategory = Array.from(memberBest.entries()).filter(([_, data]) => data.category === category);

    if (memberInCategory.length === 0) return 5;

    let totalPercentage = 0;
    let validComparisons = 0;

    memberInCategory.forEach(([exercise, memberData]) => {
      const globalData = globalBest.get(exercise);
      if (!globalData) {
        totalPercentage += 50;
        validComparisons++;
        return;
      }

      let percentage: number;
      if (category === 'cardio') {
        // Lower is better for cardio
        percentage = (globalData.value / memberData.value) * 100;
      } else {
        // Higher is better for others
        percentage = (memberData.value / globalData.value) * 100;
      }

      totalPercentage += Math.min(100, percentage);
      validComparisons++;
    });

    if (validComparisons === 0) return 5;

    const avgPercentage = totalPercentage / validComparisons;
    const diversityBonus = Math.min(5, validComparisons);

    return Math.round(Math.max(5, Math.min(100, avgPercentage + diversityBonus)));
  };

  const stats: PokemonStats = {
    cardio: calculateCategoryScore('cardio'),
    force: calculateCategoryScore('force'),
    gym: calculateCategoryScore('gym'),
    puissance: calculateCategoryScore('puissance'),
    niveau: 0,
  };

  stats.niveau = Math.round((stats.cardio + stats.force + stats.gym + stats.puissance) / 4);

  return stats;
}

// Pokemon Card Component
function PokemonCard({ member, stats }: { member: Member; stats: PokemonStats }) {
  const { firstName, lastName } = parseName(member.name);
  const level = stats.niveau;

  // Determine tier
  let tier = 'Débutant';
  let tierColor = 'text-gray-400';
  if (level >= 81) {
    tier = 'Légendaire';
    tierColor = 'text-yellow-400';
  } else if (level >= 61) {
    tier = 'Élite';
    tierColor = 'text-purple-400';
  } else if (level >= 41) {
    tier = 'Avancé';
    tierColor = 'text-blue-400';
  } else if (level >= 21) {
    tier = 'Intermédiaire';
    tierColor = 'text-green-400';
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        {/* Header with gradient */}
        <div className="h-24 bg-gradient-to-br from-primary/30 via-primary/20 to-background flex items-center justify-center">
          <div className="h-16 w-16 rounded-full bg-background/80 flex items-center justify-center border-2 border-primary">
            {member.photo ? (
              <img src={member.photo} alt={member.name} className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <User className="h-8 w-8 text-primary" />
            )}
          </div>
        </div>

        {/* Level badge */}
        <div className="absolute top-2 right-2 bg-background/90 px-2 py-1 rounded-full text-xs font-bold">
          Nv. {level}
        </div>
      </div>

      <CardContent className="pt-4">
        {/* Name and tier */}
        <div className="text-center mb-4">
          <h3 className="font-bold text-lg">{firstName}</h3>
          <p className="text-xs text-muted-foreground">{lastName}</p>
          <Badge variant="outline" className={`mt-1 ${tierColor}`}>
            {tier}
          </Badge>
        </div>

        {/* Stats bars */}
        <div className="space-y-2">
          {(['cardio', 'force', 'gym', 'puissance'] as PokemonStatCategory[]).map((stat) => (
            <div key={stat} className="flex items-center gap-2">
              <div className={`p-1 rounded ${STAT_COLORS[stat].bg}`}>{STAT_COLORS[stat].icon}</div>
              <span className="text-xs w-16 capitalize">{stat}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${STAT_COLORS[stat].bg.replace('/20', '')} transition-all`}
                  style={{ width: `${stats[stat]}%` }}
                />
              </div>
              <span className="text-xs font-mono w-8 text-right">{stats[stat]}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function PerformancePage() {
  // Data states
  const [members, setMembers] = useState<Member[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Add performance dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [addForm, setAddForm] = useState({
    member_id: '',
    category: '' as string,
    exercise_type: '',
    value: '',
    reps: '',
    unit: 'kg' as string,
  });

  // Load data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    const supabase = getSupabase();

    try {
      const [membersRes, performancesRes] = await Promise.all([
        supabase.from('members').select('*').eq('is_active', true).order('name'),
        supabase.from('performances').select('*').order('date', { ascending: false }),
      ]);

      if (membersRes.error) throw membersRes.error;
      if (performancesRes.error) throw performancesRes.error;

      setMembers(membersRes.data || []);
      setPerformances(performancesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculate member stats
  const memberStats = useMemo(() => {
    const statsMap = new Map<string, PokemonStats>();

    members.forEach((member) => {
      const memberPerfs = performances.filter((p) => p.member_id === member.id);
      const stats = calculatePokemonStats(memberPerfs, performances, member.gender || null);
      statsMap.set(member.id, stats);
    });

    return statsMap;
  }, [members, performances]);

  // Leaderboard (sorted by level)
  const leaderboard = useMemo(() => {
    return [...members]
      .map((member) => ({
        member,
        stats: memberStats.get(member.id) || { cardio: 5, force: 5, gym: 5, puissance: 5, niveau: 5 },
      }))
      .sort((a, b) => b.stats.niveau - a.stats.niveau)
      .slice(0, 10);
  }, [members, memberStats]);

  // Global stats
  const globalStats = useMemo(() => {
    const totalPRs = performances.filter((p) => p.is_pr).length;
    const totalPerfs = performances.length;
    const avgLevel =
      memberStats.size > 0
        ? Math.round(Array.from(memberStats.values()).reduce((sum, s) => sum + s.niveau, 0) / memberStats.size)
        : 0;
    const activeMembersWithPerf = new Set(performances.map((p) => p.member_id)).size;

    return { totalPRs, totalPerfs, avgLevel, activeMembersWithPerf };
  }, [performances, memberStats]);

  // Recent PRs
  const recentPRs = useMemo(() => {
    return performances
      .filter((p) => p.is_pr)
      .slice(0, 5)
      .map((p) => ({
        ...p,
        member: members.find((m) => m.id === p.member_id),
      }));
  }, [performances, members]);

  // Filtered members for cards
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const query = searchQuery.toLowerCase();
    return members.filter((m) => m.name?.toLowerCase().includes(query));
  }, [members, searchQuery]);

  // Handle add performance
  const handleAddPerformance = async () => {
    if (!addForm.member_id || !addForm.exercise_type || !addForm.value) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSaving(true);
    const supabase = getSupabase();

    try {
      const value = parseFloat(addForm.value);
      const reps = addForm.reps ? parseInt(addForm.reps) : undefined;

      // Calculate 1RM if weight with reps
      let notes = '';
      if (addForm.unit === 'kg' && reps) {
        const oneRM = calculate1RM(value, reps);
        notes = `${value}kg x ${reps} reps (1RM: ${oneRM}kg)`;
      }

      // Check if it's a PR
      const previousPerfs = performances.filter(
        (p) => p.member_id === addForm.member_id && p.exercise_type === addForm.exercise_type
      );
      const previousBest = previousPerfs.length > 0 ? Math.max(...previousPerfs.map((p) => p.value)) : 0;
      const isPR = value > previousBest;

      const { error } = await supabase.from('performances').insert({
        member_id: addForm.member_id,
        exercise_type: addForm.exercise_type,
        category: addForm.category,
        value: value,
        unit: addForm.unit,
        reps: reps || null,
        date: new Date().toISOString().split('T')[0],
        is_pr: isPR,
        notes: notes || null,
      });

      if (error) throw error;

      if (isPR) {
        toast.success(`🏆 Nouveau PR! ${addForm.exercise_type}: ${value}${addForm.unit}`);
      } else {
        toast.success('Performance enregistrée');
      }

      setIsAddDialogOpen(false);
      setAddForm({ member_id: '', category: '', exercise_type: '', value: '', reps: '', unit: 'kg' });
      loadData();
    } catch (error) {
      console.error('Error saving performance:', error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-green-500" />
            Performance
          </h1>
          <p className="text-muted-foreground">Suivi des performances et cartes Pokémon</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
          <Button onClick={loadData} variant="outline" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="cards">Cartes Pokémon</TabsTrigger>
          <TabsTrigger value="leaderboard">Classement</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  Total Performances
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{globalStats.totalPerfs}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  Records Personnels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-500">{globalStats.totalPRs}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Medal className="h-4 w-4 text-purple-500" />
                  Niveau Moyen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-500">{globalStats.avgLevel}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  Membres Actifs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-500">{globalStats.activeMembersWithPerf}</p>
                <p className="text-xs text-muted-foreground">avec performances</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent PRs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Records Personnels Récents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentPRs.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Aucun PR récent</p>
              ) : (
                <div className="space-y-3">
                  {recentPRs.map((pr) => (
                    <div
                      key={pr.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div>
                          <p className="font-medium">{pr.member?.name || 'Inconnu'}</p>
                          <p className="text-sm text-muted-foreground">{pr.exercise_type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {pr.value} {pr.unit}
                        </p>
                        <p className="text-xs text-muted-foreground">{pr.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pokemon Cards Tab */}
        <TabsContent value="cards" className="space-y-6">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un membre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Cards Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <p className="mt-4 text-muted-foreground">Aucun membre trouvé</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMembers.map((member) => (
                <PokemonCard
                  key={member.id}
                  member={member}
                  stats={memberStats.get(member.id) || { cardio: 5, force: 5, gym: 5, puissance: 5, niveau: 5 }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Medal className="h-5 w-5 text-yellow-500" />
                Top 10 - Classement Général
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Aucune donnée de classement</p>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.member.id}
                      className={`flex items-center gap-4 p-3 rounded-lg ${
                        index === 0
                          ? 'bg-yellow-500/20'
                          : index === 1
                          ? 'bg-gray-400/20'
                          : index === 2
                          ? 'bg-orange-600/20'
                          : 'bg-muted/50'
                      }`}
                    >
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0
                            ? 'bg-yellow-500 text-yellow-950'
                            : index === 1
                            ? 'bg-gray-400 text-gray-950'
                            : index === 2
                            ? 'bg-orange-600 text-orange-950'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {entry.member.photo ? (
                          <img
                            src={entry.member.photo}
                            alt={entry.member.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{entry.member.name}</p>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span className="text-red-400">❤️ {entry.stats.cardio}</span>
                          <span className="text-blue-400">💪 {entry.stats.force}</span>
                          <span className="text-green-400">🎯 {entry.stats.gym}</span>
                          <span className="text-yellow-400">⚡ {entry.stats.puissance}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{entry.stats.niveau}</p>
                        <p className="text-xs text-muted-foreground">Niveau</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Performance Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Enregistrer une Performance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {/* Member select */}
            <div className="space-y-2">
              <Label>Membre *</Label>
              <Select
                value={addForm.member_id}
                onValueChange={(v) => setAddForm({ ...addForm, member_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un membre" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category & Exercise */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Catégorie *</Label>
                <Select
                  value={addForm.category}
                  onValueChange={(v) => setAddForm({ ...addForm, category: v, exercise_type: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(EXERCISES_BY_CATEGORY).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Exercice *</Label>
                <Select
                  value={addForm.exercise_type}
                  onValueChange={(v) => setAddForm({ ...addForm, exercise_type: v })}
                  disabled={!addForm.category}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Exercice" />
                  </SelectTrigger>
                  <SelectContent>
                    {addForm.category &&
                      EXERCISES_BY_CATEGORY[addForm.category]?.map((ex) => (
                        <SelectItem key={ex} value={ex}>
                          {ex}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Unit */}
            <div className="space-y-2">
              <Label>Type de mesure</Label>
              <Select value={addForm.unit} onValueChange={(v) => setAddForm({ ...addForm, unit: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Poids (kg) + Répétitions</SelectItem>
                  <SelectItem value="seconds">Temps (secondes)</SelectItem>
                  <SelectItem value="meters">Distance (mètres)</SelectItem>
                  <SelectItem value="reps">Répétitions seules</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Value & Reps */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valeur *</Label>
                <Input
                  type="number"
                  step="0.5"
                  placeholder={addForm.unit === 'kg' ? 'Ex: 80' : addForm.unit === 'seconds' ? 'Ex: 330' : 'Ex: 1000'}
                  value={addForm.value}
                  onChange={(e) => setAddForm({ ...addForm, value: e.target.value })}
                />
              </div>
              {addForm.unit === 'kg' && (
                <div className="space-y-2">
                  <Label>Répétitions</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 5"
                    value={addForm.reps}
                    onChange={(e) => setAddForm({ ...addForm, reps: e.target.value })}
                  />
                </div>
              )}
            </div>

            {/* 1RM Preview */}
            {addForm.unit === 'kg' && addForm.value && addForm.reps && (
              <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/30">
                <p className="text-sm text-muted-foreground">1RM Théorique Calculé</p>
                <p className="text-xl font-bold text-green-400">
                  {calculate1RM(parseFloat(addForm.value), parseInt(addForm.reps))} kg
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button onClick={handleAddPerformance} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
