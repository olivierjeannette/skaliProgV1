'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
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
  Home,
  Cast,
  Monitor,
} from 'lucide-react';
import { type TrainingSession, type SessionCategory, type Team, type SessionBlock, type BlockType, BLOCK_TYPE_CONFIG } from '@/types';
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

// Block type colors for TV mode (hex values for inline styles)
const BLOCK_TYPE_COLORS: Record<BlockType, { bg: string; border: string; text: string }> = {
  warmup: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
  strength: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
  wod: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
  skill: { bg: '#f3e8ff', border: '#a855f7', text: '#6b21a8' },
  accessory: { bg: '#dcfce7', border: '#22c55e', text: '#166534' },
  cooldown: { bg: '#cffafe', border: '#06b6d4', text: '#155e75' },
  custom: { bg: '#f3f4f6', border: '#6b7280', text: '#374151' },
};

// TV Mode Content Component
function TVModeContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');
  const showTeams = searchParams.get('teams') === 'true';
  const autoRefresh = searchParams.get('refresh') !== 'false'; // Auto-refresh par défaut

  const [session, setSession] = useState<TrainingSession | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCasting, setIsCasting] = useState(false);

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

  // Auto-refresh des données toutes les 30 secondes
  useEffect(() => {
    if (!autoRefresh) return;

    const refreshInterval = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [autoRefresh, sessionId, showTeams]);

  // Load session or teams
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
        const { data } = await supabase
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
              { id: 'demo-1', type: 'warmup', title: 'Échauffement', content: '5 min course\n3 min étirements dynamiques\n2 min mobilité', order: 0 },
              { id: 'demo-2', type: 'strength', title: 'Force', content: 'Back Squat:\n5x5 @ 75%\nRepos: 2-3 min', order: 1 },
              { id: 'demo-3', type: 'wod', title: 'WOD', content: 'AMRAP 20 min:\n10 Burpees\n15 KB Swings\n20 Air Squats', order: 2 },
              { id: 'demo-4', type: 'cooldown', title: 'Retour au calme', content: '5 min marche\n3 min étirements\nHydratation', order: 3 },
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

  useEffect(() => {
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

  // Cast to Chromecast/AirPlay (utilise l'API native du navigateur)
  const handleCast = useCallback(async () => {
    // Vérifie si l'API de présentation est disponible
    if ('presentation' in navigator) {
      try {
        // @ts-ignore - L'API Presentation n'est pas encore dans les types TS standard
        const presentationRequest = new PresentationRequest([window.location.href]);
        const connection = await presentationRequest.start();
        setIsCasting(true);

        connection.addEventListener('close', () => {
          setIsCasting(false);
        });
      } catch (err) {
        console.log('Casting non disponible ou annulé');
      }
    } else {
      // Fallback: ouvrir dans une nouvelle fenêtre pour projection
      window.open(window.location.href, '_blank', 'fullscreen=yes');
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

  // Parse blocks from session - supports both old and new format
  const parseBlocks = (session: TrainingSession): SessionBlock[] => {
    if (!session.blocks) return [];
    if (!Array.isArray(session.blocks)) return [];

    // Check if it's the new format (has 'type' property) or old format (has 'name' property)
    const blocks = session.blocks as Array<SessionBlock | { name: string; content: string }>;

    return blocks.map((block, index) => {
      // New format - SessionBlock
      if ('type' in block && 'id' in block) {
        return block as SessionBlock;
      }
      // Old format - convert to SessionBlock
      const oldBlock = block as { name: string; content: string };
      return {
        id: `legacy-${index}`,
        type: 'custom' as BlockType,
        title: oldBlock.name || 'Bloc',
        content: oldBlock.content || '',
        order: index,
      };
    }).sort((a, b) => a.order - b.order);
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
            {blocks.map((block) => {
              const blockConfig = BLOCK_TYPE_CONFIG[block.type] || BLOCK_TYPE_CONFIG.custom;
              const blockColors = BLOCK_TYPE_COLORS[block.type] || BLOCK_TYPE_COLORS.custom;

              return (
                <div
                  key={block.id}
                  className="rounded-xl border-2 shadow-lg overflow-hidden flex flex-col"
                  style={{
                    backgroundColor: blockColors.bg,
                    borderColor: `${blockColors.border}40`,
                    borderTopColor: blockColors.border,
                    borderTopWidth: '4px',
                  }}
                >
                  {/* Block Header */}
                  <div
                    className="px-4 py-3 border-b flex items-center gap-3"
                    style={{
                      borderColor: `${blockColors.border}30`,
                      backgroundColor: `${blockColors.border}15`,
                    }}
                  >
                    <span style={{ fontSize: `${1.6 * fontSize}rem` }}>{blockConfig.icon}</span>
                    <h2
                      className="font-bold uppercase tracking-wide flex-1"
                      style={{ fontSize: `${1.6 * fontSize}rem`, color: blockColors.text }}
                    >
                      {block.title}
                    </h2>
                  </div>

                  {/* Block Content */}
                  <div className="flex-1 p-4 overflow-auto">
                    <div
                      className="whitespace-pre-wrap leading-relaxed"
                      style={{ fontSize: `${1.3 * fontSize}rem`, color: blockColors.text }}
                    >
                      {block.content.split('\n').map((line, i) => {
                        // Style different line types
                        const isListItem = line.trim().startsWith('-') || line.trim().startsWith('•') || /^\d+[\.\)]/.test(line.trim());
                        const isHeader = line.trim().endsWith(':') && line.trim().length < 30;

                        return (
                          <div
                            key={i}
                            className={`${isListItem ? 'pl-4' : ''} ${isHeader ? 'font-bold mt-2' : ''}`}
                          >
                            {line || '\u00A0'}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
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
                  <span className="text-blue-500">M {team.maleCount}</span>
                  <span className="text-pink-500">F {team.femaleCount}</span>
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
            <span className="text-4xl">!</span>
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
          <Button variant="secondary" size="icon" className="shadow-lg" title="Retour au dashboard">
            <Home className="w-5 h-5" />
          </Button>
        </Link>

        {/* Bouton Cast */}
        <Button
          variant={isCasting ? 'default' : 'secondary'}
          size="icon"
          className="shadow-lg"
          onClick={handleCast}
          title={isCasting ? 'Casting en cours' : 'Caster sur un écran'}
        >
          <Cast className={`w-5 h-5 ${isCasting ? 'animate-pulse' : ''}`} />
        </Button>

        {/* Bouton ouvrir dans nouvelle fenêtre (pour projection) */}
        <Button
          variant="secondary"
          size="icon"
          className="shadow-lg"
          onClick={() => window.open(window.location.href, '_blank', 'fullscreen=yes')}
          title="Ouvrir dans une nouvelle fenêtre (projection)"
        >
          <Monitor className="w-5 h-5" />
        </Button>

        <Button
          variant="secondary"
          size="icon"
          className="shadow-lg"
          onClick={() => setFontSize(f => Math.max(0.5, f - 0.1))}
          title="Réduire le texte"
        >
          <ZoomOut className="w-5 h-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="shadow-lg"
          onClick={() => setFontSize(f => Math.min(2, f + 0.1))}
          title="Agrandir le texte"
        >
          <ZoomIn className="w-5 h-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="shadow-lg"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
        >
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </Button>
      </div>

      {/* Status bar en bas */}
      {showControls && (
        <div className="fixed bottom-4 left-4 right-4 flex justify-between items-center">
          {/* Indicateur casting */}
          {isCasting && (
            <div className="px-3 py-1 bg-primary text-white rounded-full text-sm font-medium flex items-center gap-2">
              <Cast className="w-4 h-4 animate-pulse" />
              Casting actif
            </div>
          )}

          {/* Info URL pour partage */}
          <div className="px-3 py-1 bg-black/30 text-white rounded-full text-xs font-medium ml-auto">
            {typeof window !== 'undefined' ? window.location.host : ''}/tv
          </div>

          {/* Zoom indicator */}
          <div className="px-3 py-1 bg-black/50 text-white rounded-full text-sm font-medium ml-2">
            Zoom: {Math.round(fontSize * 100)}%
          </div>
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
          <p className="text-black/50 mt-2">Mode TV - La Skàli</p>
        </div>
      </div>
    }>
      <TVModeContent />
    </Suspense>
  );
}
