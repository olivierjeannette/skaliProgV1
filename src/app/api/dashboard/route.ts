import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export interface DashboardStats {
  // Membres
  members_total: number;
  members_new_month: number;

  // Sessions
  sessions_today: number;
  sessions_week: number;

  // PRs
  prs_week: number;
  prs_month: number;
  prs_total: number;

  // CRM
  leads_prospect: number;
  leads_contacted: number;
  leads_converted_month: number;
  leads_total_month: number;
  conversion_rate: number;

  // Errors
  errors_unresolved: number;
  errors_today: number;

  // Tasks
  tasks_todo: number;
  tasks_in_progress: number;

  // Discord
  discord_linked: number;
  discord_unlinked: number;
}

export interface TodaySession {
  id: string;
  title: string;
  category: string;
  time?: string;
  duration?: number;
  coach?: string;
  max_spots?: number;
  blocks?: unknown;
}

export interface RecentPR {
  id: string;
  member_id: string;
  member_name: string;
  exercise_type: string;
  category: string;
  value: number;
  unit: string;
  reps?: number;
  date: string;
}

// GET /api/dashboard - Récupérer toutes les stats du dashboard
export async function GET() {
  try {
    const supabase = await createClient();

    // Dates de référence
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1); // Lundi
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayStr = today.toISOString().split('T')[0];
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const monthStartStr = monthStart.toISOString().split('T')[0];

    // Paralléliser les requêtes
    const [
      membersResult,
      membersNewResult,
      sessionsResult,
      sessionsWeekResult,
      prsWeekResult,
      prsMonthResult,
      prsTotalResult,
      leadsProspectResult,
      leadsContactedResult,
      leadsConvertedResult,
      leadsTotalResult,
      errorsResult,
      errorsTodayResult,
      tasksTodoResult,
      tasksProgressResult,
      discordLinkedResult,
      discordUnlinkedResult,
      todaySessionsResult,
      recentPrsResult
    ] = await Promise.all([
      // Membres
      supabase.from('members').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('members').select('*', { count: 'exact', head: true }).gte('created_at', monthStartStr),

      // Sessions
      supabase.from('sessions').select('*', { count: 'exact', head: true }).eq('date', todayStr),
      supabase.from('sessions').select('*', { count: 'exact', head: true }).gte('date', weekStartStr),

      // PRs
      supabase.from('performances').select('*', { count: 'exact', head: true }).eq('is_pr', true).gte('date', weekStartStr),
      supabase.from('performances').select('*', { count: 'exact', head: true }).eq('is_pr', true).gte('date', monthStartStr),
      supabase.from('performances').select('*', { count: 'exact', head: true }).eq('is_pr', true),

      // CRM
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'prospect'),
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'contacte_attente'),
      supabase.from('leads').select('*', { count: 'exact', head: true }).in('status', ['converti_abonnement', 'converti_carnets']).gte('converted_at', monthStartStr),
      supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', monthStartStr),

      // Errors
      supabase.from('app_errors').select('*', { count: 'exact', head: true }).eq('resolved', false),
      supabase.from('app_errors').select('*', { count: 'exact', head: true }).gte('created_at', todayStr),

      // Tasks
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'todo'),
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),

      // Discord
      supabase.from('discord_members').select('*', { count: 'exact', head: true }).not('member_id', 'is', null),
      supabase.from('discord_members').select('*', { count: 'exact', head: true }).is('member_id', null),

      // Sessions du jour (détails)
      supabase.from('sessions').select('id, title, category, time, duration, coach, max_spots, blocks').eq('date', todayStr).order('time'),

      // PRs récents
      supabase.from('performances')
        .select('id, member_id, exercise_type, category, value, unit, reps, date, members(name)')
        .eq('is_pr', true)
        .order('date', { ascending: false })
        .limit(10)
    ]);

    // Calcul du taux de conversion
    const leadsTotal = leadsTotalResult.count || 0;
    const leadsConverted = leadsConvertedResult.count || 0;
    const conversionRate = leadsTotal > 0 ? Math.round((leadsConverted / leadsTotal) * 100) : 0;

    // Stats
    const stats: DashboardStats = {
      members_total: membersResult.count || 0,
      members_new_month: membersNewResult.count || 0,
      sessions_today: sessionsResult.count || 0,
      sessions_week: sessionsWeekResult.count || 0,
      prs_week: prsWeekResult.count || 0,
      prs_month: prsMonthResult.count || 0,
      prs_total: prsTotalResult.count || 0,
      leads_prospect: leadsProspectResult.count || 0,
      leads_contacted: leadsContactedResult.count || 0,
      leads_converted_month: leadsConverted,
      leads_total_month: leadsTotal,
      conversion_rate: conversionRate,
      errors_unresolved: errorsResult.count || 0,
      errors_today: errorsTodayResult.count || 0,
      tasks_todo: tasksTodoResult.count || 0,
      tasks_in_progress: tasksProgressResult.count || 0,
      discord_linked: discordLinkedResult.count || 0,
      discord_unlinked: discordUnlinkedResult.count || 0
    };

    // Sessions du jour
    const todaySessions: TodaySession[] = todaySessionsResult.data || [];

    // PRs récents avec nom du membre
    const recentPrs: RecentPR[] = (recentPrsResult.data || []).map((pr: Record<string, unknown>) => ({
      id: pr.id as string,
      member_id: pr.member_id as string,
      member_name: (pr.members as { name: string })?.name || 'Inconnu',
      exercise_type: pr.exercise_type as string,
      category: pr.category as string,
      value: pr.value as number,
      unit: pr.unit as string,
      reps: pr.reps as number | undefined,
      date: pr.date as string
    }));

    return NextResponse.json({
      stats,
      todaySessions,
      recentPrs
    });

  } catch (err) {
    console.error('Dashboard API error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
