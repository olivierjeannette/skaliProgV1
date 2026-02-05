'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/auth-store';
import { ROLES } from '@/config/roles';
import {
  Users,
  Calendar,
  Trophy,
  Target,
  RefreshCw,
  Clock,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Bug,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Plus,
  Trash2,
  Check,
  TrendingUp,
  Phone,
  UserPlus,
  Percent,
  ListTodo,
  Sparkles,
  Zap,
  Eye,
  ChevronRight,
} from 'lucide-react';
import type { DashboardStats, TodaySession, RecentPR, CurrentPeppySession } from '@/app/api/dashboard/route';
import type { Task } from '@/app/api/tasks/route';
import type { AppError } from '@/app/api/errors/route';
import type { Lead, LeadStatus } from '@/types';
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, BLOCK_TYPE_CONFIG } from '@/types';

// Priorité des tâches
const PRIORITY_CONFIG = {
  low: { label: 'Basse', color: 'bg-gray-500/20 text-gray-500', icon: null },
  medium: { label: 'Moyenne', color: 'bg-blue-500/20 text-blue-500', icon: null },
  high: { label: 'Haute', color: 'bg-orange-500/20 text-orange-500', icon: Zap },
  urgent: { label: 'Urgente', color: 'bg-red-500/20 text-red-500', icon: AlertTriangle },
};

const CATEGORY_CONFIG = {
  task: { label: 'Tache', icon: ListTodo, color: 'text-blue-500' },
  idea: { label: 'Idee', icon: Lightbulb, color: 'text-yellow-500' },
  bug: { label: 'Bug', icon: Bug, color: 'text-red-500' },
  feature: { label: 'Feature', icon: Sparkles, color: 'text-purple-500' },
};

export default function DashboardPage() {
  const { session } = useAuthStore();
  const roleConfig = session?.role ? ROLES[session.role] : null;

  // States
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todaySessions, setTodaySessions] = useState<TodaySession[]>([]);
  const [recentPrs, setRecentPrs] = useState<RecentPR[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [errors, setErrors] = useState<AppError[]>([]);
  const [currentPeppySession, setCurrentPeppySession] = useState<CurrentPeppySession | null>(null);
  const [taskFilter, setTaskFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');

  // Dialog states
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    category: 'task' as const,
  });

  // Load all data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [dashboardRes, leadsRes, tasksRes, errorsRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/crm/leads?status=prospect,contacte_attente&limit=10').catch(() => null),
        fetch('/api/tasks?limit=20'),
        fetch('/api/errors?resolved=false&limit=10'),
      ]);

      // Dashboard stats
      if (dashboardRes.ok) {
        const data = await dashboardRes.json();
        setStats(data.stats);
        setTodaySessions(data.todaySessions || []);
        setRecentPrs(data.recentPrs || []);
        setCurrentPeppySession(data.currentPeppySession || null);
      }

      // Leads - fallback direct to Supabase if API doesn't exist
      if (leadsRes && leadsRes.ok) {
        const data = await leadsRes.json();
        setLeads(data.leads || []);
      } else {
        // Charger depuis /api directement ou Supabase
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data } = await supabase
          .from('leads')
          .select('*')
          .in('status', ['prospect', 'contacte_attente'])
          .order('created_at', { ascending: false })
          .limit(10);
        setLeads((data as Lead[]) || []);
      }

      // Tasks
      if (tasksRes.ok) {
        const data = await tasksRes.json();
        setTasks(data.tasks || []);
      }

      // Errors
      if (errorsRes.ok) {
        const data = await errorsRes.json();
        setErrors(data.errors || []);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create task
  const createTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });

      if (res.ok) {
        const data = await res.json();
        setTasks(prev => [data.task, ...prev]);
        setNewTask({ title: '', description: '', priority: 'medium', category: 'task' });
        setIsTaskDialogOpen(false);
      }
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status }),
      });

      if (res.ok) {
        setTasks(prev =>
          prev.map(t => (t.id === taskId ? { ...t, status: status as Task['status'] } : t))
        );
      }
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  // Delete task
  const deleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks?id=${taskId}`, { method: 'DELETE' });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  // Resolve/Delete error
  const resolveError = async (errorId: string) => {
    try {
      const res = await fetch('/api/errors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: errorId, resolved: true }),
      });
      if (res.ok) {
        setErrors(prev => prev.filter(e => e.id !== errorId));
      }
    } catch (err) {
      console.error('Error resolving:', err);
    }
  };

  const deleteError = async (errorId: string) => {
    try {
      const res = await fetch(`/api/errors?id=${errorId}`, { method: 'DELETE' });
      if (res.ok) {
        setErrors(prev => prev.filter(e => e.id !== errorId));
      }
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  // Filtered tasks
  const filteredTasks = tasks.filter(t => {
    if (taskFilter === 'all') return t.status !== 'cancelled';
    return t.status === taskFilter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenue,{' '}
            <span style={{ color: roleConfig?.color }}>{roleConfig?.label}</span>
          </p>
        </div>
        <Button onClick={loadData} disabled={isLoading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membres actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.members_total || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.members_new_month || 0} ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PRs ce mois</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.prs_month || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.prs_week || 0} cette semaine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads a traiter</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats?.leads_prospect || 0) + (stats?.leads_contacted || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.leads_prospect || 0} prospects, {stats?.leads_contacted || 0} contactes
            </p>
          </CardContent>
        </Card>

        <Card className={errors.length > 0 ? 'border-red-500/50 bg-red-500/5' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erreurs</CardTitle>
            <Bug className={`h-4 w-4 ${errors.length > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${errors.length > 0 ? 'text-red-500' : ''}`}>
              {stats?.errors_unresolved || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.errors_today || 0} aujourd'hui
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Seance du jour */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Seance du jour
              </CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </CardDescription>
            </div>
            <a href="/calendar">
              <Button variant="ghost" size="sm">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </CardHeader>
          <CardContent>
            {todaySessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Pas de seance programmee aujourd'hui</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaySessions.map(session => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{session.title}</span>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {session.time && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {session.time}
                            </span>
                          )}
                          {session.coach && <span>- {session.coach}</span>}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">{session.category}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Participants cours actuel (Peppy) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                Cours en cours
              </CardTitle>
              <CardDescription>
                {currentPeppySession
                  ? `${currentPeppySession.session_name} - ${currentPeppySession.start_time} a ${currentPeppySession.end_time}`
                  : 'Aucun cours programme'}
              </CardDescription>
            </div>
            {currentPeppySession && (
              <Badge variant="secondary" className="text-sm">
                {currentPeppySession.participant_count}/{currentPeppySession.total_places} places
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {!currentPeppySession ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Pas de cours en ce moment</p>
              </div>
            ) : currentPeppySession.participants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Aucun participant inscrit</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {currentPeppySession.participants.map((participant, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-green-500">
                          {participant.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-sm">{participant.name}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        participant.status === 'Confirmé'
                          ? 'border-green-500 text-green-500'
                          : 'border-yellow-500 text-yellow-500'
                      }
                    >
                      {participant.status === 'Confirmé' ? 'Confirme' : 'Non confirme'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leads CRM */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                Leads a traiter
              </CardTitle>
              <CardDescription>Prospects et contactes en attente</CardDescription>
            </div>
            <a href="/crm">
              <Button variant="ghost" size="sm">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </CardHeader>
          <CardContent>
            {leads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-50 text-green-500" />
                <p>Tous les leads sont traites !</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leads.slice(0, 5).map(lead => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {lead.status === 'prospect' ? (
                        <UserPlus className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Phone className="h-4 w-4 text-yellow-500" />
                      )}
                      <div>
                        <span className="font-medium text-sm">{lead.name}</span>
                        <p className="text-xs text-muted-foreground">{lead.service}</p>
                      </div>
                    </div>
                    <Badge
                      style={{
                        backgroundColor: `${LEAD_STATUS_COLORS[lead.status]}20`,
                        color: LEAD_STATUS_COLORS[lead.status],
                      }}
                    >
                      {lead.status === 'prospect' ? 'Nouveau' : 'Attente'}
                    </Badge>
                  </div>
                ))}
                {leads.length > 5 && (
                  <a href="/crm" className="block text-center text-sm text-primary hover:underline pt-2">
                    Voir {leads.length - 5} autres leads
                  </a>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* PRs recents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                PRs recents
              </CardTitle>
              <CardDescription>
                {stats?.prs_week || 0} cette semaine / {stats?.prs_month || 0} ce mois
              </CardDescription>
            </div>
            <a href="/performance">
              <Button variant="ghost" size="sm">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </CardHeader>
          <CardContent>
            {recentPrs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Aucun PR enregistre</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentPrs.slice(0, 5).map(pr => (
                  <div
                    key={pr.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                      </div>
                      <div>
                        <span className="font-medium text-sm">{pr.member_name}</span>
                        <p className="text-xs text-muted-foreground">{pr.exercise_type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm">
                        {pr.value}
                        {pr.unit}
                        {pr.reps && pr.reps > 1 && ` x${pr.reps}`}
                      </span>
                      <p className="text-xs text-muted-foreground">{formatDate(pr.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Taux de conversion CRM */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-green-500" />
              Taux de conversion
            </CardTitle>
            <CardDescription>Performance CRM ce mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-4">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(stats?.conversion_rate || 0) * 3.52} 352`}
                    className="text-green-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{stats?.conversion_rate || 0}%</span>
                  <span className="text-xs text-muted-foreground">converti</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-500">
                  {stats?.leads_converted_month || 0}
                </div>
                <p className="text-xs text-muted-foreground">Convertis</p>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats?.leads_total_month || 0}</div>
                <p className="text-xs text-muted-foreground">Total leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks & Errors */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Taches / Idees */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="h-5 w-5 text-purple-500" />
                Taches & Idees
              </CardTitle>
              <CardDescription>
                {stats?.tasks_todo || 0} a faire, {stats?.tasks_in_progress || 0} en cours
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => setIsTaskDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs value={taskFilter} onValueChange={v => setTaskFilter(v as typeof taskFilter)}>
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="todo">A faire</TabsTrigger>
                <TabsTrigger value="in_progress">En cours</TabsTrigger>
                <TabsTrigger value="done">Fait</TabsTrigger>
              </TabsList>
            </Tabs>

            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Lightbulb className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Aucune tache</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {filteredTasks.map(task => {
                  const CategoryIcon = CATEGORY_CONFIG[task.category]?.icon || ListTodo;
                  const PriorityIcon = PRIORITY_CONFIG[task.priority]?.icon;

                  return (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        task.status === 'done' ? 'opacity-60 bg-muted/30' : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <CategoryIcon
                          className={`h-4 w-4 flex-shrink-0 ${CATEGORY_CONFIG[task.category]?.color}`}
                        />
                        <div className="flex-1 min-w-0">
                          <span
                            className={`font-medium text-sm ${
                              task.status === 'done' ? 'line-through' : ''
                            }`}
                          >
                            {task.title}
                          </span>
                          {task.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className={PRIORITY_CONFIG[task.priority]?.color}>
                          {PriorityIcon && <PriorityIcon className="h-3 w-3 mr-1" />}
                          {PRIORITY_CONFIG[task.priority]?.label}
                        </Badge>
                        {task.status !== 'done' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              updateTaskStatus(
                                task.id,
                                task.status === 'todo' ? 'in_progress' : 'done'
                              )
                            }
                          >
                            {task.status === 'todo' ? (
                              <ChevronRight className="h-4 w-4" />
                            ) : (
                              <Check className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-600"
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Erreurs */}
        <Card className={errors.length > 0 ? 'border-red-500/30' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Bug className={`h-5 w-5 ${errors.length > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
              Erreurs a corriger
            </CardTitle>
            <CardDescription>
              {errors.length > 0
                ? `${errors.length} erreur(s) non resolue(s)`
                : 'Aucune erreur en attente'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-50 text-green-500" />
                <p>Aucune erreur a corriger</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {errors.map(error => (
                  <div
                    key={error.id}
                    className="flex items-start justify-between p-3 rounded-lg border border-red-500/20 bg-red-500/5"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            error.error_type === 'error'
                              ? 'border-red-500 text-red-500'
                              : error.error_type === 'warning'
                              ? 'border-yellow-500 text-yellow-500'
                              : 'border-blue-500 text-blue-500'
                          }
                        >
                          {error.error_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(error.created_at).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-sm mt-1 font-mono break-all">{error.message}</p>
                      {error.url && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          URL: {error.url}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-green-500 hover:text-green-600"
                        onClick={() => resolveError(error.id)}
                        title="Marquer comme resolu"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-600"
                        onClick={() => deleteError(error.id)}
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle tache / idee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Titre</label>
              <Input
                placeholder="Titre de la tache..."
                value={newTask.title}
                onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description (optionnel)</label>
              <Textarea
                placeholder="Details..."
                value={newTask.description}
                onChange={e => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Categorie</label>
                <Select
                  value={newTask.category}
                  onValueChange={v => setNewTask(prev => ({ ...prev, category: v as typeof newTask.category }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <SelectItem key={key} value={key}>
                          <span className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${config.color}`} />
                            {config.label}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Priorite</label>
                <Select
                  value={newTask.priority}
                  onValueChange={v => setNewTask(prev => ({ ...prev, priority: v as typeof newTask.priority }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={createTask} disabled={!newTask.title.trim()}>
              Creer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
