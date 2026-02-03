'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSupabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { TrainingSession, SessionCategory } from '@/types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Loader2,
  Save,
  X,
  Clock,
  Flame,
  Dumbbell,
  Heart,
  Leaf,
  Activity,
} from 'lucide-react';

// Category configuration
const CATEGORY_CONFIG: Record<SessionCategory, { name: string; color: string; bgColor: string; icon: typeof Flame }> = {
  crosstraining: { name: 'CrossTraining', color: 'text-red-500', bgColor: 'bg-red-500/20', icon: Flame },
  musculation: { name: 'Musculation', color: 'text-blue-500', bgColor: 'bg-blue-500/20', icon: Dumbbell },
  cardio: { name: 'Cardio', color: 'text-green-500', bgColor: 'bg-green-500/20', icon: Heart },
  hyrox: { name: 'Hyrox', color: 'text-orange-500', bgColor: 'bg-orange-500/20', icon: Activity },
  recovery: { name: 'Récupération', color: 'text-purple-500', bgColor: 'bg-purple-500/20', icon: Leaf },
};

// Helpers
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getMonthDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: (Date | null)[] = [];

  // Get the day of week (0 = Sunday, 1 = Monday, etc.)
  // Convert to Monday-first (0 = Monday, 6 = Sunday)
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;

  // Add empty cells for days before the first
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  // Add all days of the month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  return days;
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

export default function CalendarPage() {
  // Date states
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Data states
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: '' as SessionCategory | '',
    description: '',
    work_duration: '',
    rest_duration: '',
    rounds: '',
  });

  // Load sessions
  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    const supabase = getSupabase();

    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Erreur lors du chargement des sessions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Get sessions for a specific date
  const getSessionsForDate = useCallback(
    (date: Date): TrainingSession[] => {
      const dateKey = formatDateKey(date);
      return sessions.filter((s) => s.date === dateKey);
    },
    [sessions]
  );

  // Sessions for selected date
  const selectedDateSessions = useMemo(
    () => getSessionsForDate(selectedDate),
    [selectedDate, getSessionsForDate]
  );

  // Navigation
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(today);
  };

  // Calendar days
  const calendarDays = useMemo(
    () => getMonthDays(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  // Open dialog for new session
  const handleNewSession = () => {
    setEditingSession(null);
    setFormData({
      title: '',
      category: '',
      description: '',
      work_duration: '',
      rest_duration: '',
      rounds: '',
    });
    setIsSessionDialogOpen(true);
  };

  // Open dialog for editing
  const handleEditSession = (session: TrainingSession) => {
    setEditingSession(session);
    setFormData({
      title: session.title,
      category: session.category || '',
      description: session.description || '',
      work_duration: session.work_duration?.toString() || '',
      rest_duration: session.rest_duration?.toString() || '',
      rounds: session.rounds?.toString() || '',
    });
    setIsSessionDialogOpen(true);
  };

  // Save session
  const handleSaveSession = async () => {
    if (!formData.title.trim()) {
      toast.error('Le titre est obligatoire');
      return;
    }

    setIsSaving(true);
    const supabase = getSupabase();

    const sessionData = {
      date: formatDateKey(selectedDate),
      title: formData.title.trim(),
      category: formData.category || null,
      description: formData.description.trim() || null,
      work_duration: formData.work_duration ? parseInt(formData.work_duration) : null,
      rest_duration: formData.rest_duration ? parseInt(formData.rest_duration) : null,
      rounds: formData.rounds ? parseInt(formData.rounds) : null,
    };

    try {
      if (editingSession) {
        // Update
        const { error } = await supabase
          .from('sessions')
          .update(sessionData)
          .eq('id', editingSession.id);

        if (error) throw error;
        toast.success('Session mise à jour');
      } else {
        // Create
        const { error } = await supabase.from('sessions').insert(sessionData);

        if (error) throw error;
        toast.success('Session créée');
      }

      setIsSessionDialogOpen(false);
      loadSessions();
    } catch (error) {
      console.error('Error saving session:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete session
  const handleDeleteSession = async () => {
    if (!editingSession) return;

    setIsDeleting(true);
    const supabase = getSupabase();

    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', editingSession.id);

      if (error) throw error;

      toast.success('Session supprimée');
      setIsSessionDialogOpen(false);
      loadSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  // Stats
  const stats = useMemo(() => {
    const thisMonth = sessions.filter((s) => {
      const d = new Date(s.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const byCategory: Record<string, number> = {};
    thisMonth.forEach((s) => {
      const cat = s.category || 'other';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    });
    return { total: thisMonth.length, byCategory };
  }, [sessions, currentMonth, currentYear]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-purple-500" />
            Calendrier
          </h1>
          <p className="text-muted-foreground">
            Planification et gestion des sessions d&apos;entraînement
          </p>
        </div>
        <Button onClick={loadSessions} variant="outline" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sessions ce mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm font-medium flex items-center gap-2 ${config.color}`}>
                <config.icon className="h-4 w-4" />
                {config.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${config.color}`}>
                {stats.byCategory[key] || 0}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <CardTitle className="min-w-[200px] text-center">
                  {MONTHS[currentMonth]} {currentYear}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Aujourd&apos;hui
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))}

                {/* Calendar cells */}
                {calendarDays.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }

                  const daySessions = getSessionsForDate(date);
                  const isSelected = isSameDay(date, selectedDate);
                  const isTodayDate = isToday(date);

                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={`
                        aspect-square p-1 rounded-lg transition-all relative
                        ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
                        ${isTodayDate && !isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
                      `}
                    >
                      <span className="text-sm font-medium">{date.getDate()}</span>
                      {daySessions.length > 0 && (
                        <div className="flex gap-0.5 justify-center mt-0.5 flex-wrap">
                          {daySessions.slice(0, 3).map((s, i) => {
                            const cat = s.category && CATEGORY_CONFIG[s.category];
                            return (
                              <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  cat ? cat.bgColor.replace('/20', '') : 'bg-gray-400'
                                }`}
                              />
                            );
                          })}
                          {daySessions.length > 3 && (
                            <span className="text-[10px] text-muted-foreground">+{daySessions.length - 3}</span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Day Sessions */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {selectedDate.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </CardTitle>
              <Button size="sm" onClick={handleNewSession}>
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {selectedDateSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto opacity-50 mb-3" />
                <p>Aucune session ce jour</p>
                <Button variant="link" onClick={handleNewSession} className="mt-2">
                  Créer une session
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateSessions.map((session) => {
                  const cat = session.category && CATEGORY_CONFIG[session.category];
                  const Icon = cat?.icon || CalendarIcon;

                  return (
                    <div
                      key={session.id}
                      className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
                        cat ? cat.bgColor : 'bg-muted'
                      }`}
                      onClick={() => handleEditSession(session)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${cat?.color || ''}`} />
                          <span className="font-medium">{session.title}</span>
                        </div>
                        <Pencil className="h-3 w-3 text-muted-foreground" />
                      </div>
                      {cat && (
                        <Badge variant="secondary" className={`mt-2 text-xs ${cat.color}`}>
                          {cat.name}
                        </Badge>
                      )}
                      {session.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {session.description}
                        </p>
                      )}
                      {(session.work_duration || session.rounds) && (
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          {session.work_duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {session.work_duration}s work
                            </span>
                          )}
                          {session.rounds && <span>{session.rounds} rounds</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Session Dialog */}
      <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingSession ? 'Modifier la session' : 'Nouvelle session'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                placeholder="Ex: WOD du jour, Force, Cardio..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v as SessionCategory })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <config.icon className={`h-4 w-4 ${config.color}`} />
                        {config.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Détails de la session..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="work">Travail (s)</Label>
                <Input
                  id="work"
                  type="number"
                  placeholder="60"
                  value={formData.work_duration}
                  onChange={(e) => setFormData({ ...formData, work_duration: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rest">Repos (s)</Label>
                <Input
                  id="rest"
                  type="number"
                  placeholder="30"
                  value={formData.rest_duration}
                  onChange={(e) => setFormData({ ...formData, rest_duration: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rounds">Rounds</Label>
                <Input
                  id="rounds"
                  type="number"
                  placeholder="5"
                  value={formData.rounds}
                  onChange={(e) => setFormData({ ...formData, rounds: e.target.value })}
                />
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Date: {selectedDate.toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <div>
              {editingSession && (
                <Button
                  variant="destructive"
                  onClick={handleDeleteSession}
                  disabled={isDeleting || isSaving}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Supprimer
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsSessionDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button onClick={handleSaveSession} disabled={isSaving || isDeleting}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {editingSession ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
