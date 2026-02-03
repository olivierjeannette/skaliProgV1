'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getSupabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  TrainingSession,
  SessionCategory,
  WeekTemplate,
  WeekTemplateDay,
  SessionBlock,
  BlockType,
  BLOCK_TYPE_CONFIG,
} from '@/types';
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
  Copy,
  FileText,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Wand2,
  CalendarDays,
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
const DAYS_FULL = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonthDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: (Date | null)[] = [];

  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;

  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

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

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function generateBlockId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default function CalendarPage() {
  // Date states
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Data states
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [templates, setTemplates] = useState<WeekTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Template dialog states
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WeekTemplate | null>(null);
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);

  // Manage templates dialog
  const [isManageTemplatesOpen, setIsManageTemplatesOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WeekTemplate | null>(null);
  const [templateFormData, setTemplateFormData] = useState({
    name: '',
    description: '',
    days: [] as WeekTemplateDay[],
  });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: '' as SessionCategory | '',
    description: '',
    blocks: [] as SessionBlock[],
  });

  // Active tab in session dialog
  const [activeTab, setActiveTab] = useState<'info' | 'blocks'>('info');

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

      // Parse blocks from JSONB
      const parsedSessions = (data || []).map(s => ({
        ...s,
        blocks: Array.isArray(s.blocks) ? s.blocks : [],
      }));

      setSessions(parsedSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Erreur lors du chargement des sessions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load templates
  const loadTemplates = useCallback(async () => {
    const supabase = getSupabase();

    try {
      const { data, error } = await supabase
        .from('week_templates')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      // Don't show error toast, templates are optional
    }
  }, []);

  useEffect(() => {
    loadSessions();
    loadTemplates();
  }, [loadSessions, loadTemplates]);

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
      blocks: [],
    });
    setActiveTab('info');
    setIsSessionDialogOpen(true);
  };

  // Open dialog for editing
  const handleEditSession = (session: TrainingSession) => {
    setEditingSession(session);
    setFormData({
      title: session.title,
      category: session.category || '',
      description: session.description || '',
      blocks: Array.isArray(session.blocks) ? session.blocks as SessionBlock[] : [],
    });
    setActiveTab('info');
    setIsSessionDialogOpen(true);
  };

  // Duplicate session
  const handleDuplicateSession = async (session: TrainingSession, targetDate: Date) => {
    const supabase = getSupabase();

    const sessionData = {
      date: formatDateKey(targetDate),
      title: session.title,
      category: session.category || null,
      description: session.description || null,
      blocks: session.blocks || [],
      work_duration: session.work_duration || null,
      rest_duration: session.rest_duration || null,
      rounds: session.rounds || null,
    };

    try {
      const { error } = await supabase.from('sessions').insert(sessionData);
      if (error) throw error;
      toast.success('Session dupliquée');
      loadSessions();
    } catch (error) {
      console.error('Error duplicating session:', error);
      toast.error('Erreur lors de la duplication');
    }
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
      date: editingSession ? editingSession.date : formatDateKey(selectedDate),
      title: formData.title.trim(),
      category: formData.category || null,
      description: formData.description.trim() || null,
      blocks: formData.blocks,
    };

    try {
      if (editingSession) {
        const { error } = await supabase
          .from('sessions')
          .update(sessionData)
          .eq('id', editingSession.id);

        if (error) throw error;
        toast.success('Session mise à jour');
      } else {
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

  // Block management
  const addBlock = (type: BlockType) => {
    const newBlock: SessionBlock = {
      id: generateBlockId(),
      type,
      title: BLOCK_TYPE_CONFIG[type].name,
      content: '',
      order: formData.blocks.length,
    };
    setFormData({ ...formData, blocks: [...formData.blocks, newBlock] });
  };

  const updateBlock = (blockId: string, updates: Partial<SessionBlock>) => {
    setFormData({
      ...formData,
      blocks: formData.blocks.map(b =>
        b.id === blockId ? { ...b, ...updates } : b
      ),
    });
  };

  const deleteBlock = (blockId: string) => {
    setFormData({
      ...formData,
      blocks: formData.blocks.filter(b => b.id !== blockId).map((b, i) => ({ ...b, order: i })),
    });
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const index = formData.blocks.findIndex(b => b.id === blockId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.blocks.length) return;

    const newBlocks = [...formData.blocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];

    setFormData({
      ...formData,
      blocks: newBlocks.map((b, i) => ({ ...b, order: i })),
    });
  };

  const duplicateBlock = (blockId: string) => {
    const block = formData.blocks.find(b => b.id === blockId);
    if (!block) return;

    const newBlock: SessionBlock = {
      ...block,
      id: generateBlockId(),
      title: `${block.title} (copie)`,
      order: formData.blocks.length,
    };
    setFormData({ ...formData, blocks: [...formData.blocks, newBlock] });
  };

  // Apply template to week
  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return;

    setIsApplyingTemplate(true);
    const supabase = getSupabase();
    const weekStart = getWeekStart(selectedDate);

    try {
      const sessionsToCreate = selectedTemplate.days.map((day: WeekTemplateDay) => {
        const sessionDate = new Date(weekStart);
        sessionDate.setDate(weekStart.getDate() + day.dayOfWeek);

        return {
          date: formatDateKey(sessionDate),
          title: day.title,
          category: day.category,
          description: null,
          blocks: [],
        };
      });

      const { error } = await supabase.from('sessions').insert(sessionsToCreate);
      if (error) throw error;

      toast.success(`Template "${selectedTemplate.name}" appliqué`);
      setIsTemplateDialogOpen(false);
      loadSessions();
    } catch (error) {
      console.error('Error applying template:', error);
      toast.error('Erreur lors de l\'application du template');
    } finally {
      setIsApplyingTemplate(false);
    }
  };

  // Template management
  const handleSaveTemplate = async () => {
    if (!templateFormData.name.trim()) {
      toast.error('Le nom du template est obligatoire');
      return;
    }

    const supabase = getSupabase();

    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from('week_templates')
          .update({
            name: templateFormData.name,
            description: templateFormData.description || null,
            days: templateFormData.days,
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;
        toast.success('Template mis à jour');
      } else {
        const { error } = await supabase.from('week_templates').insert({
          name: templateFormData.name,
          description: templateFormData.description || null,
          days: templateFormData.days,
        });

        if (error) throw error;
        toast.success('Template créé');
      }

      setEditingTemplate(null);
      setTemplateFormData({ name: '', description: '', days: [] });
      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    const supabase = getSupabase();

    try {
      const { error } = await supabase
        .from('week_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      toast.success('Template supprimé');
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const addTemplateDay = () => {
    const usedDays = templateFormData.days.map(d => d.dayOfWeek);
    const nextDay = [0, 1, 2, 3, 4, 5, 6].find(d => !usedDays.includes(d as 0|1|2|3|4|5|6));

    if (nextDay === undefined) {
      toast.error('Tous les jours sont déjà définis');
      return;
    }

    setTemplateFormData({
      ...templateFormData,
      days: [...templateFormData.days, {
        dayOfWeek: nextDay as 0|1|2|3|4|5|6,
        title: '',
        category: 'crosstraining' as SessionCategory,
      }],
    });
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-purple-500" />
            Calendrier
          </h1>
          <p className="text-muted-foreground">
            Planification et gestion des sessions d&apos;entraînement
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsManageTemplatesOpen(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Gérer Templates
          </Button>
          <Button variant="outline" onClick={() => setIsTemplateDialogOpen(true)}>
            <Wand2 className="h-4 w-4 mr-2" />
            Appliquer Template
          </Button>
          <Button onClick={loadSessions} variant="outline" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
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
                  const blocks = Array.isArray(session.blocks) ? session.blocks as SessionBlock[] : [];

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
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              const tomorrow = new Date(selectedDate);
                              tomorrow.setDate(tomorrow.getDate() + 1);
                              handleDuplicateSession(session, tomorrow);
                            }}
                            title="Dupliquer demain"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Pencil className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </div>
                      {cat && (
                        <Badge variant="secondary" className={`mt-2 text-xs ${cat.color}`}>
                          {cat.name}
                        </Badge>
                      )}
                      {blocks.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {blocks.map((block) => (
                            <Badge key={block.id} variant="outline" className="text-[10px]">
                              {BLOCK_TYPE_CONFIG[block.type]?.icon} {block.title}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {session.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {session.description}
                        </p>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSession ? 'Modifier la session' : 'Nouvelle session'}
            </DialogTitle>
            <DialogDescription>
              {editingSession
                ? `Session du ${new Date(editingSession.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}`
                : `Session du ${selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}`
              }
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'info' | 'blocks')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Informations</TabsTrigger>
              <TabsTrigger value="blocks">
                Blocs ({formData.blocks.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 pt-4">
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
                <Label htmlFor="description">Description / Notes</Label>
                <Textarea
                  id="description"
                  placeholder="Notes générales sur la session..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="blocks" className="space-y-4 pt-4">
              {/* Add block buttons */}
              <div className="flex flex-wrap gap-2">
                {Object.entries(BLOCK_TYPE_CONFIG).map(([type, config]) => (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    onClick={() => addBlock(type as BlockType)}
                    className={config.color}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {config.icon} {config.name}
                  </Button>
                ))}
              </div>

              {/* Blocks list */}
              {formData.blocks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <p>Aucun bloc</p>
                  <p className="text-sm">Ajoutez des blocs pour structurer votre séance</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.blocks.sort((a, b) => a.order - b.order).map((block, index) => {
                    const config = BLOCK_TYPE_CONFIG[block.type];
                    return (
                      <div
                        key={block.id}
                        className={`p-3 rounded-lg border ${config.color}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                          <span className="text-lg">{config.icon}</span>
                          <Input
                            value={block.title}
                            onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                            className="font-medium h-8"
                            placeholder="Titre du bloc"
                          />
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => moveBlock(block.id, 'up')}
                              disabled={index === 0}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => moveBlock(block.id, 'down')}
                              disabled={index === formData.blocks.length - 1}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => duplicateBlock(block.id)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => deleteBlock(block.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label className="text-xs">Durée (min)</Label>
                          <Input
                            type="number"
                            value={block.duration || ''}
                            onChange={(e) => updateBlock(block.id, { duration: e.target.value ? parseInt(e.target.value) : undefined })}
                            className="w-20 h-7 text-sm"
                            placeholder="15"
                          />
                        </div>
                        <Textarea
                          value={block.content}
                          onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                          placeholder="Contenu du bloc (exercices, sets, reps...)"
                          rows={3}
                          className="text-sm"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex justify-between mt-4">
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

      {/* Apply Template Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Appliquer un template
            </DialogTitle>
            <DialogDescription>
              Génère les séances pour la semaine du {getWeekStart(selectedDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {templates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto opacity-50 mb-3" />
                <p>Aucun template disponible</p>
                <Button
                  variant="link"
                  onClick={() => {
                    setIsTemplateDialogOpen(false);
                    setIsManageTemplatesOpen(true);
                  }}
                >
                  Créer un template
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{template.name}</p>
                        {template.description && (
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        )}
                      </div>
                      <Badge variant="secondary">
                        {Array.isArray(template.days) ? template.days.length : 0} jours
                      </Badge>
                    </div>
                    {Array.isArray(template.days) && template.days.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(template.days as WeekTemplateDay[]).map((day, i) => {
                          const cat = CATEGORY_CONFIG[day.category];
                          return (
                            <Badge key={i} variant="outline" className={`text-xs ${cat?.color || ''}`}>
                              {DAYS[day.dayOfWeek]}: {day.title}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleApplyTemplate}
              disabled={!selectedTemplate || isApplyingTemplate}
            >
              {isApplyingTemplate ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CalendarDays className="h-4 w-4 mr-2" />
              )}
              Appliquer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Templates Dialog */}
      <Dialog open={isManageTemplatesOpen} onOpenChange={setIsManageTemplatesOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Gérer les templates hebdomadaires
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Create/Edit form */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {editingTemplate ? 'Modifier le template' : 'Nouveau template'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom *</Label>
                    <Input
                      value={templateFormData.name}
                      onChange={(e) => setTemplateFormData({ ...templateFormData, name: e.target.value })}
                      placeholder="Ex: Semaine CrossFit"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={templateFormData.description}
                      onChange={(e) => setTemplateFormData({ ...templateFormData, description: e.target.value })}
                      placeholder="Description optionnelle"
                    />
                  </div>
                </div>

                {/* Days */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Jours de la semaine</Label>
                    <Button variant="outline" size="sm" onClick={addTemplateDay}>
                      <Plus className="h-3 w-3 mr-1" />
                      Ajouter jour
                    </Button>
                  </div>

                  {templateFormData.days.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucun jour défini
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {templateFormData.days.map((day, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <Select
                            value={day.dayOfWeek.toString()}
                            onValueChange={(v) => {
                              const newDays = [...templateFormData.days];
                              newDays[index] = { ...day, dayOfWeek: parseInt(v) as 0|1|2|3|4|5|6 };
                              setTemplateFormData({ ...templateFormData, days: newDays });
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DAYS_FULL.map((d, i) => (
                                <SelectItem key={i} value={i.toString()}>{d}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            value={day.title}
                            onChange={(e) => {
                              const newDays = [...templateFormData.days];
                              newDays[index] = { ...day, title: e.target.value };
                              setTemplateFormData({ ...templateFormData, days: newDays });
                            }}
                            placeholder="Titre de la séance"
                            className="flex-1"
                          />
                          <Select
                            value={day.category}
                            onValueChange={(v) => {
                              const newDays = [...templateFormData.days];
                              newDays[index] = { ...day, category: v as SessionCategory };
                              setTemplateFormData({ ...templateFormData, days: newDays });
                            }}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                  <span className={config.color}>{config.name}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setTemplateFormData({
                                ...templateFormData,
                                days: templateFormData.days.filter((_, i) => i !== index),
                              });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  {editingTemplate && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingTemplate(null);
                        setTemplateFormData({ name: '', description: '', days: [] });
                      }}
                    >
                      Annuler modification
                    </Button>
                  )}
                  <Button onClick={handleSaveTemplate}>
                    <Save className="h-4 w-4 mr-2" />
                    {editingTemplate ? 'Mettre à jour' : 'Créer'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Existing templates */}
            <div className="space-y-2">
              <h3 className="font-medium">Templates existants</h3>
              {templates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun template
                </p>
              ) : (
                <div className="space-y-2">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{template.name}</p>
                        {template.description && (
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Array.isArray(template.days) && (template.days as WeekTemplateDay[]).map((day, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {DAYS[day.dayOfWeek]}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingTemplate(template);
                            setTemplateFormData({
                              name: template.name,
                              description: template.description || '',
                              days: Array.isArray(template.days) ? template.days as WeekTemplateDay[] : [],
                            });
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
