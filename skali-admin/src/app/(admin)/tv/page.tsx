'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Maximize,
  Minimize,
  Settings2,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff,
  RefreshCw,
  Calendar,
  Clock,
  Dumbbell,
  Heart,
  Flame,
  Footprints,
  Leaf,
  Users,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Home,
} from 'lucide-react';
import { type TrainingSession, type SessionCategory, type Team } from '@/types';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

// Category configuration
const CATEGORY_CONFIG: Record<SessionCategory, { name: string; color: string; icon: typeof Flame }> = {
  crosstraining: { name: 'CrossTraining', color: '#22c55e', icon: Flame },
  musculation: { name: 'Musculation', color: '#3b82f6', icon: Dumbbell },
  cardio: { name: 'Cardio', color: '#ef4444', icon: Heart },
  hyrox: { name: 'Hyrox', color: '#f97316', icon: Footprints },
  recovery: { name: 'Récupération', color: '#8b5cf6', icon: Leaf },
};

// TV Mode Content Component
function TVModeContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');
  const showTeams = searchParams.get('teams') === 'true';

  const [session, setSession] = useState<TrainingSession | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-hide controls after 5 seconds
  useEffect(() => {
    if (showControls) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showControls]);

  // Load session or teams
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (showTeams) {
          // Load teams from localStorage
          const savedTeams = localStorage.getItem('tv_teams');
          if (savedTeams) {
            setTeams(JSON.parse(savedTeams));
          } else {
            setError('Aucune équipe à afficher');
          }
        } else if (sessionId) {
          // Load session from Supabase
          const supabase = createClient();
          const { data, error: fetchError } = await supabase
            .from('sessions')
            .select('*')
            .eq('id', sessionId)
            .single();

          if (fetchError) {
            throw new Error(fetchError.message);
          }

          if (data) {
            setSession(data as TrainingSession);
          } else {
            setError('Séance non trouvée');
          }
        } else {
          // Load today's session
          const today = new Date().toISOString().split('T')[0];
          const supabase = createClient();
          const { data, error: fetchError } = await supabase
            .from('sessions')
            .select('*')
            .eq('date', today)
            .order('created_at', { ascending: true })
            .limit(1)
            .single();

          if (data) {
            setSession(data as TrainingSession);
          } else {
            // Create demo session for testing
            setSession({
              id: 'demo',
              date: today,
              title: 'Séance Demo',
              category: 'crosstraining',
              description: 'Mode TV prêt',
              blocks: [
                { name: 'Échauffement', content: '5 min course\n3 min étirements dynamiques\n2 min mobilité' },
                { name: 'WOD', content: 'AMRAP 20 min:\n10 Burpees\n15 KB Swings\n20 Air Squats' },
                { name: 'Récupération', content: '5 min marche\n3 min étirements\nHydratation' },
              ],
              work_duration: 45,
              rest_duration: 15,
              rounds: 4,
              created_at: new Date().toISOString(),
            });
          }
        }
      } catch (err) {
        console.error('Error loading TV data:', err);
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [sessionId, showTeams]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  // Parse blocks from session
  const parseBlocks = (session: TrainingSession) => {
    if (!session.blocks) return [];
    if (Array.isArray(session.blocks)) {
      return session.blocks as { name: string; content: string }[];
    }
    return [];
  };

  // Render session view
  const renderSession = () => {
    if (!session) return null;

    const blocks = parseBlocks(session);
    const category = session.category ? CATEGORY_CONFIG[session.category] : null;
    const CategoryIcon = category?.icon || Flame;

    return (
      <>
        {/* Header */}
        <header
          className="flex-shrink-0 px-6 py-4 border-b-2 border-black/10"
          style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
        >
          <div className="grid grid-cols-3 items-center gap-4">
            {/* Left - Session Info */}
            <div className="flex flex-col">
              <h1
                className="font-extrabold uppercase tracking-tight text-black truncate"
                style={{ fontSize: `${2.4 * fontSize}rem` }}
              >
                {session.title || 'Séance du jour'}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span
                  className="font-semibold text-black/70 capitalize"
                  style={{ fontSize: `${1.1 * fontSize}rem` }}
                >
                  {formatDate(session.date)}
                </span>
                {category && (
                  <span
                    className="flex items-center gap-2 px-3 py-1 rounded-full font-bold text-white"
                    style={{
                      backgroundColor: category.color,
                      fontSize: `${0.9 * fontSize}rem`,
                    }}
                  >
                    <CategoryIcon className="w-4 h-4" />
                    {category.name}
                  </span>
                )}
              </div>
            </div>

            {/* Center - Clock */}
            <div className="flex justify-center">
              <div
                className="font-black text-black tabular-nums"
                style={{ fontSize: `${5 * fontSize}rem`, lineHeight: 1 }}
              >
                {formatTime(currentTime)}
              </div>
            </div>

            {/* Right - Timing Info */}
            <div className="flex flex-col items-end">
              {session.work_duration && (
                <div className="flex items-center gap-2 text-black/80" style={{ fontSize: `${1.2 * fontSize}rem` }}>
                  <Clock className="w-5 h-5" />
                  <span className="font-bold">{session.work_duration}s travail</span>
                  {session.rest_duration && (
                    <span className="text-black/60">/ {session.rest_duration}s repos</span>
                  )}
                </div>
              )}
              {session.rounds && (
                <div className="text-black/60 font-semibold" style={{ fontSize: `${1 * fontSize}rem` }}>
                  {session.rounds} rounds
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Blocks Content */}
        <main className="flex-1 p-4 overflow-hidden">
          <div className="h-full grid gap-4" style={{
            gridTemplateColumns: `repeat(${Math.min(blocks.length, 4)}, 1fr)`,
          }}>
            {blocks.map((block, index) => (
              <div
                key={index}
                className="bg-white/95 rounded-xl border-2 border-black/10 shadow-lg overflow-hidden flex flex-col"
                style={{ borderTopColor: category?.color || '#22c55e', borderTopWidth: '4px' }}
              >
                {/* Block Header */}
                <div
                  className="px-4 py-3 border-b border-black/10 bg-black/5"
                >
                  <h2
                    className="font-bold text-black uppercase tracking-wide"
                    style={{ fontSize: `${1.8 * fontSize}rem` }}
                  >
                    {block.name}
                  </h2>
                </div>

                {/* Block Content */}
                <div className="flex-1 p-4 overflow-auto">
                  <div
                    className="text-black/90 whitespace-pre-wrap leading-relaxed"
                    style={{ fontSize: `${1.4 * fontSize}rem` }}
                  >
                    {block.content.split('\n').map((line, i) => (
                      <div
                        key={i}
                        className={line.trim().startsWith('-') || line.trim().startsWith('•')
                          ? 'pl-4'
                          : ''
                        }
                      >
                        {line || '\u00A0'}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </>
    );
  };

  // Render teams view
  const renderTeams = () => {
    if (teams.length === 0) return null;

    const TEAM_COLORS = [
      '#3b82f6', '#22c55e', '#a855f7', '#f97316',
      '#ec4899', '#06b6d4', '#eab308', '#ef4444',
    ];

    return (
      <>
        {/* Header */}
        <header
          className="flex-shrink-0 px-6 py-4 border-b-2 border-black/10"
          style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
        >
          <div className="grid grid-cols-3 items-center gap-4">
            <div className="flex items-center gap-3">
              <Users className="w-10 h-10 text-primary" />
              <h1
                className="font-extrabold uppercase tracking-tight text-black"
                style={{ fontSize: `${2.4 * fontSize}rem` }}
              >
                Équipes du jour
              </h1>
            </div>

            <div className="flex justify-center">
              <div
                className="font-black text-black tabular-nums"
                style={{ fontSize: `${5 * fontSize}rem`, lineHeight: 1 }}
              >
                {formatTime(currentTime)}
              </div>
            </div>

            <div className="flex justify-end items-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <span
                className="font-bold text-black/80"
                style={{ fontSize: `${1.4 * fontSize}rem` }}
              >
                {teams.length} équipes
              </span>
            </div>
          </div>
        </header>

        {/* Teams Grid */}
        <main className="flex-1 p-4 overflow-hidden">
          <div
            className="h-full grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${Math.min(teams.length, 4)}, 1fr)`,
            }}
          >
            {teams.map((team, index) => (
              <div
                key={team.id}
                className="bg-white/95 rounded-xl border-2 shadow-lg overflow-hidden flex flex-col"
                style={{
                  borderColor: `${TEAM_COLORS[index % TEAM_COLORS.length]}50`,
                  borderTopColor: TEAM_COLORS[index % TEAM_COLORS.length],
                  borderTopWidth: '4px',
                }}
              >
                {/* Team Header */}
                <div
                  className="px-4 py-3 border-b flex items-center justify-between"
                  style={{
                    backgroundColor: `${TEAM_COLORS[index % TEAM_COLORS.length]}15`,
                    borderColor: `${TEAM_COLORS[index % TEAM_COLORS.length]}30`,
                  }}
                >
                  <h2
                    className="font-bold text-black"
                    style={{ fontSize: `${1.8 * fontSize}rem` }}
                  >
                    {team.name}
                  </h2>
                  <span
                    className="font-bold px-3 py-1 rounded-full text-white"
                    style={{
                      backgroundColor: TEAM_COLORS[index % TEAM_COLORS.length],
                      fontSize: `${1 * fontSize}rem`,
                    }}
                  >
                    {team.totalPoints} pts
                  </span>
                </div>

                {/* Team Members */}
                <div className="flex-1 p-4 overflow-auto">
                  <ul className="space-y-2">
                    {team.participants.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center gap-3 py-2 px-3 rounded-lg bg-black/5"
                        style={{ fontSize: `${1.3 * fontSize}rem` }}
                      >
                        <span
                          className={`w-3 h-3 rounded-full ${
                            p.gender === 'homme' ? 'bg-blue-500' :
                            p.gender === 'femme' ? 'bg-pink-500' : 'bg-gray-400'
                          }`}
                        />
                        <span className="flex-1 font-medium text-black">{p.cleanName}</span>
                        <span className="text-black/50 text-sm">{p.points}pt</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Team Footer */}
                <div
                  className="px-4 py-2 border-t text-black/60 flex justify-center gap-4"
                  style={{
                    borderColor: `${TEAM_COLORS[index % TEAM_COLORS.length]}20`,
                    fontSize: `${0.9 * fontSize}rem`,
                  }}
                >
                  <span className="text-blue-500">♂ {team.maleCount}</span>
                  <span className="text-pink-500">♀ {team.femaleCount}</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-2xl font-semibold text-black/80">Chargement...</p>
          <p className="text-black/50">Mode TV Sport & Santé</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-black mb-2">{error}</h1>
          <p className="text-black/50 mb-6">Vérifiez les paramètres ou réessayez</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Recharger
            </Button>
            <Link href="/calendar">
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Calendrier
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex flex-col bg-gradient-to-br from-slate-100 to-slate-200"
      onMouseMove={() => setShowControls(true)}
      onClick={() => setShowControls(true)}
    >
      {/* Main Content */}
      {showTeams ? renderTeams() : renderSession()}

      {/* Controls Overlay */}
      <div
        className={`fixed top-4 right-4 flex gap-2 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <Link href="/dashboard">
          <Button variant="secondary" size="icon" className="shadow-lg">
            <Home className="w-5 h-5" />
          </Button>
        </Link>
        <Button
          variant="secondary"
          size="icon"
          className="shadow-lg"
          onClick={() => setFontSize(f => Math.max(0.5, f - 0.1))}
        >
          <ZoomOut className="w-5 h-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="shadow-lg"
          onClick={() => setFontSize(f => Math.min(2, f + 0.1))}
        >
          <ZoomIn className="w-5 h-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="shadow-lg"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </Button>
      </div>

      {/* Zoom indicator */}
      {showControls && (
        <div className="fixed bottom-4 right-4 px-3 py-1 bg-black/50 text-white rounded-full text-sm font-medium">
          Zoom: {Math.round(fontSize * 100)}%
        </div>
      )}
    </div>
  );
}

// Main Page Component with Suspense
export default function TVModePage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-2xl font-semibold text-black/80">Chargement...</p>
        </div>
      </div>
    }>
      <TVModeContent />
    </Suspense>
  );
}
