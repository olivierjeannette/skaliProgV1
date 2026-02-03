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
  Settings,
} from 'lucide-react';
import { type TrainingSession, type SessionCategory, type Team, type SessionBlock, type BlockType, BLOCK_TYPE_CONFIG } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { useTVSettingsStore } from '@/stores/tv-settings-store';
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

// Font family mapping
const FONT_FAMILY_MAP = {
  default: 'var(--font-geist-sans), system-ui, sans-serif',
  mono: 'var(--font-geist-mono), ui-monospace, monospace',
  serif: 'Georgia, Cambria, serif',
};

// TV Mode Content Component
function TVModeContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');
  const showTeams = searchParams.get('teams') === 'true';

  // Get settings from store
  const { settings } = useTVSettingsStore();
  const { text: textSettings, layout: layoutSettings, colors: colorSettings, behavior: behaviorSettings } = settings;

  const [session, setSession] = useState<TrainingSession | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [manualZoom, setManualZoom] = useState(1); // Local zoom override
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCasting, setIsCasting] = useState(false);

  // Computed zoom (combines settings + manual adjustments)
  const effectiveZoom = (layoutSettings.globalZoom / 100) * manualZoom;

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-hide controls
  useEffect(() => {
    if (!behaviorSettings.autoHideControls) return;
    if (showControls) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, behaviorSettings.autoHideDelay * 1000);
      return () => clearTimeout(timer);
    }
  }, [showControls, behaviorSettings.autoHideControls, behaviorSettings.autoHideDelay]);

  // Auto-refresh des données
  useEffect(() => {
    if (!behaviorSettings.autoRefresh) return;

    const refreshInterval = setInterval(() => {
      loadData();
    }, behaviorSettings.autoRefreshInterval * 1000);

    return () => clearInterval(refreshInterval);
  }, [behaviorSettings.autoRefresh, behaviorSettings.autoRefreshInterval, sessionId, showTeams]);

  // Load session or teams
  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (showTeams) {
        const savedTeams = localStorage.getItem('tv_teams');
        if (savedTeams) {
          setTeams(JSON.parse(savedTeams));
        } else {
          setError('Aucune équipe à afficher');
        }
      } else if (sessionId) {
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from('sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (fetchError) throw new Error(fetchError.message);
        if (data) {
          setSession(data as TrainingSession);
        } else {
          setError('Séance non trouvée');
        }
      } else {
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
          // Demo session
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

  // Cast handling
  const handleCast = useCallback(async () => {
    if ('presentation' in navigator) {
      try {
        // @ts-ignore
        const presentationRequest = new PresentationRequest([window.location.href]);
        const connection = await presentationRequest.start();
        setIsCasting(true);
        connection.addEventListener('close', () => setIsCasting(false));
      } catch (err) {
        console.log('Casting non disponible ou annulé');
      }
    } else {
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

  // Parse blocks
  const parseBlocks = (session: TrainingSession): SessionBlock[] => {
    if (!session.blocks || !Array.isArray(session.blocks)) return [];
    const blocks = session.blocks as Array<SessionBlock | { name: string; content: string }>;

    return blocks.map((block, index) => {
      if ('type' in block && 'id' in block) return block as SessionBlock;
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

  // Compute background style
  const backgroundStyle = colorSettings.useGradient
    ? { background: `linear-gradient(to bottom right, ${colorSettings.gradientFrom}, ${colorSettings.gradientTo})` }
    : { backgroundColor: colorSettings.backgroundColor };

  // Header height based on setting
  const headerPadding = {
    compact: 'py-2',
    normal: 'py-4',
    large: 'py-6',
  }[layoutSettings.headerHeight];

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
          className={`flex-shrink-0 px-6 ${headerPadding} border-b-2 border-black/10`}
          style={{ backgroundColor: colorSettings.headerBackground }}
        >
          <div className="grid grid-cols-3 items-center gap-4">
            {/* Left - Session Info */}
            <div className="flex flex-col">
              <h1
                className={`tracking-tight text-black truncate ${textSettings.titleBold ? 'font-extrabold' : 'font-medium'} ${textSettings.titleUppercase ? 'uppercase' : ''}`}
                style={{
                  fontSize: `${2.4 * textSettings.titleSize * effectiveZoom}rem`,
                  fontFamily: FONT_FAMILY_MAP[textSettings.fontFamily],
                }}
              >
                {session.title || 'Séance du jour'}
              </h1>
              {behaviorSettings.showDate && (
                <div className="flex items-center gap-3 mt-1">
                  <span
                    className="font-semibold text-black/70 capitalize"
                    style={{ fontSize: `${1.1 * textSettings.contentSize * effectiveZoom}rem` }}
                  >
                    {formatDate(session.date)}
                  </span>
                  {behaviorSettings.showCategory && category && (
                    <span
                      className="flex items-center gap-2 px-3 py-1 rounded-full font-bold text-white"
                      style={{
                        backgroundColor: category.color,
                        fontSize: `${0.9 * textSettings.contentSize * effectiveZoom}rem`,
                      }}
                    >
                      <CategoryIcon className="w-4 h-4" />
                      {category.name}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Center - Clock */}
            {behaviorSettings.showClock && (
              <div className="flex justify-center">
                <div
                  className="font-black tabular-nums"
                  style={{
                    fontSize: `${5 * textSettings.clockSize * effectiveZoom}rem`,
                    lineHeight: 1,
                    color: colorSettings.clockColor,
                    fontFamily: FONT_FAMILY_MAP[textSettings.fontFamily],
                  }}
                >
                  {formatTime(currentTime)}
                </div>
              </div>
            )}

            {/* Right - Timing Info */}
            {behaviorSettings.showTimingInfo && (
              <div className="flex flex-col items-end">
                {session.work_duration && (
                  <div className="flex items-center gap-2 text-black/80" style={{ fontSize: `${1.2 * textSettings.contentSize * effectiveZoom}rem` }}>
                    <Clock className="w-5 h-5" />
                    <span className="font-bold">{session.work_duration}s travail</span>
                    {session.rest_duration && (
                      <span className="text-black/60">/ {session.rest_duration}s repos</span>
                    )}
                  </div>
                )}
                {session.rounds && (
                  <div className="text-black/60 font-semibold" style={{ fontSize: `${1 * textSettings.contentSize * effectiveZoom}rem` }}>
                    {session.rounds} rounds
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Blocks Content */}
        <main
          className="flex-1 overflow-hidden"
          style={{
            padding: `${layoutSettings.blockGap}px`,
          }}
        >
          <div
            className="h-full grid"
            style={{
              gridTemplateColumns: `repeat(${Math.min(blocks.length, layoutSettings.maxBlocksPerRow)}, 1fr)`,
              gap: `${layoutSettings.blockGap}px`,
            }}
          >
            {blocks.map((block) => {
              const blockConfig = BLOCK_TYPE_CONFIG[block.type] || BLOCK_TYPE_CONFIG.custom;
              const blockColors = BLOCK_TYPE_COLORS[block.type] || BLOCK_TYPE_COLORS.custom;

              return (
                <div
                  key={block.id}
                  className="border-2 shadow-lg overflow-hidden flex flex-col"
                  style={{
                    backgroundColor: blockColors.bg,
                    borderColor: `${blockColors.border}40`,
                    borderTopColor: blockColors.border,
                    borderTopWidth: '4px',
                    borderRadius: `${layoutSettings.blockRadius}px`,
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
                    <span style={{ fontSize: `${1.6 * textSettings.titleSize * effectiveZoom}rem` }}>{blockConfig.icon}</span>
                    <h2
                      className={`flex-1 ${textSettings.titleBold ? 'font-bold' : 'font-medium'} ${textSettings.titleUppercase ? 'uppercase' : ''} tracking-wide`}
                      style={{
                        fontSize: `${1.6 * textSettings.titleSize * effectiveZoom}rem`,
                        color: blockColors.text,
                        fontFamily: FONT_FAMILY_MAP[textSettings.fontFamily],
                      }}
                    >
                      {block.title}
                    </h2>
                  </div>

                  {/* Block Content */}
                  <div className="flex-1 p-4 overflow-auto">
                    <div
                      className={`whitespace-pre-wrap ${textSettings.contentBold ? 'font-semibold' : ''}`}
                      style={{
                        fontSize: `${1.3 * textSettings.contentSize * effectiveZoom}rem`,
                        color: blockColors.text,
                        lineHeight: textSettings.lineHeight,
                        fontFamily: FONT_FAMILY_MAP[textSettings.fontFamily],
                      }}
                    >
                      {block.content.split('\n').map((line, i) => {
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
          className={`flex-shrink-0 px-6 ${headerPadding} border-b-2 border-black/10`}
          style={{ backgroundColor: colorSettings.headerBackground }}
        >
          <div className="grid grid-cols-3 items-center gap-4">
            <div className="flex items-center gap-3">
              <Users className="w-10 h-10 text-primary" />
              <h1
                className={`tracking-tight text-black ${textSettings.titleBold ? 'font-extrabold' : 'font-medium'} ${textSettings.titleUppercase ? 'uppercase' : ''}`}
                style={{
                  fontSize: `${2.4 * textSettings.titleSize * effectiveZoom}rem`,
                  fontFamily: FONT_FAMILY_MAP[textSettings.fontFamily],
                }}
              >
                Équipes du jour
              </h1>
            </div>

            {behaviorSettings.showClock && (
              <div className="flex justify-center">
                <div
                  className="font-black tabular-nums"
                  style={{
                    fontSize: `${5 * textSettings.clockSize * effectiveZoom}rem`,
                    lineHeight: 1,
                    color: colorSettings.clockColor,
                  }}
                >
                  {formatTime(currentTime)}
                </div>
              </div>
            )}

            <div className="flex justify-end items-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <span
                className="font-bold text-black/80"
                style={{ fontSize: `${1.4 * textSettings.contentSize * effectiveZoom}rem` }}
              >
                {teams.length} équipes
              </span>
            </div>
          </div>
        </header>

        {/* Teams Grid */}
        <main
          className="flex-1 overflow-hidden"
          style={{ padding: `${layoutSettings.blockGap}px` }}
        >
          <div
            className="h-full grid"
            style={{
              gridTemplateColumns: `repeat(${Math.min(teams.length, layoutSettings.maxBlocksPerRow)}, 1fr)`,
              gap: `${layoutSettings.blockGap}px`,
            }}
          >
            {teams.map((team, index) => (
              <div
                key={team.id}
                className="bg-white/95 border-2 shadow-lg overflow-hidden flex flex-col"
                style={{
                  borderColor: `${TEAM_COLORS[index % TEAM_COLORS.length]}50`,
                  borderTopColor: TEAM_COLORS[index % TEAM_COLORS.length],
                  borderTopWidth: '4px',
                  borderRadius: `${layoutSettings.blockRadius}px`,
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
                    className={`text-black ${textSettings.titleBold ? 'font-bold' : 'font-medium'}`}
                    style={{
                      fontSize: `${1.8 * textSettings.titleSize * effectiveZoom}rem`,
                      fontFamily: FONT_FAMILY_MAP[textSettings.fontFamily],
                    }}
                  >
                    {team.name}
                  </h2>
                  <span
                    className="font-bold px-3 py-1 rounded-full text-white"
                    style={{
                      backgroundColor: TEAM_COLORS[index % TEAM_COLORS.length],
                      fontSize: `${1 * textSettings.contentSize * effectiveZoom}rem`,
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
                        style={{
                          fontSize: `${1.3 * textSettings.contentSize * effectiveZoom}rem`,
                          fontFamily: FONT_FAMILY_MAP[textSettings.fontFamily],
                        }}
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
                    fontSize: `${0.9 * textSettings.contentSize * effectiveZoom}rem`,
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
      <div className="fixed inset-0 flex items-center justify-center" style={backgroundStyle}>
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
      <div className="fixed inset-0 flex items-center justify-center" style={backgroundStyle}>
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
      className="fixed inset-0 flex flex-col"
      style={{
        ...backgroundStyle,
        paddingTop: `${layoutSettings.paddingTop}px`,
        paddingBottom: `${layoutSettings.paddingBottom}px`,
        paddingLeft: `${layoutSettings.paddingLeft}px`,
        paddingRight: `${layoutSettings.paddingRight}px`,
      }}
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
        style={{ marginTop: `${layoutSettings.paddingTop}px`, marginRight: `${layoutSettings.paddingRight}px` }}
      >
        <Link href="/dashboard">
          <Button variant="secondary" size="icon" className="shadow-lg" title="Retour au dashboard">
            <Home className="w-5 h-5" />
          </Button>
        </Link>

        <Link href="/settings" target="_blank">
          <Button variant="secondary" size="icon" className="shadow-lg" title="Paramètres TV">
            <Settings className="w-5 h-5" />
          </Button>
        </Link>

        <Button
          variant={isCasting ? 'default' : 'secondary'}
          size="icon"
          className="shadow-lg"
          onClick={handleCast}
          title={isCasting ? 'Casting en cours' : 'Caster sur un écran'}
        >
          <Cast className={`w-5 h-5 ${isCasting ? 'animate-pulse' : ''}`} />
        </Button>

        <Button
          variant="secondary"
          size="icon"
          className="shadow-lg"
          onClick={() => window.open(window.location.href, '_blank', 'fullscreen=yes')}
          title="Ouvrir dans une nouvelle fenêtre"
        >
          <Monitor className="w-5 h-5" />
        </Button>

        <Button
          variant="secondary"
          size="icon"
          className="shadow-lg"
          onClick={() => setManualZoom(z => Math.max(0.5, z - 0.1))}
          title="Réduire le texte"
        >
          <ZoomOut className="w-5 h-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="shadow-lg"
          onClick={() => setManualZoom(z => Math.min(2, z + 0.1))}
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
        <div
          className="fixed bottom-4 left-4 right-4 flex justify-between items-center"
          style={{
            marginBottom: `${layoutSettings.paddingBottom}px`,
            marginLeft: `${layoutSettings.paddingLeft}px`,
            marginRight: `${layoutSettings.paddingRight}px`,
          }}
        >
          {isCasting && (
            <div className="px-3 py-1 bg-primary text-white rounded-full text-sm font-medium flex items-center gap-2">
              <Cast className="w-4 h-4 animate-pulse" />
              Casting actif
            </div>
          )}

          <div className="px-3 py-1 bg-black/30 text-white rounded-full text-xs font-medium ml-auto">
            {typeof window !== 'undefined' ? window.location.host : ''}/tv
          </div>

          <div className="px-3 py-1 bg-black/50 text-white rounded-full text-sm font-medium ml-2">
            Zoom: {Math.round(effectiveZoom * 100)}%
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
