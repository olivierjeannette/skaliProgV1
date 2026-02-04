'use client';

import { useState, useEffect } from 'react';
import {
  Clock,
  Dumbbell,
  Flame,
  Footprints,
  Heart,
} from 'lucide-react';
import { type SessionCategory, type BlockType, BLOCK_TYPE_CONFIG } from '@/types';
import { useTVSettingsStore } from '@/stores/tv-settings-store';

// Category configuration
const CATEGORY_CONFIG: Record<SessionCategory, { name: string; color: string; icon: typeof Flame }> = {
  crossnfit: { name: "Cross'N Fit", color: '#ef4444', icon: Flame },
  hyrox: { name: 'Hyrox', color: '#f97316', icon: Footprints },
  hyrox_long: { name: 'Hyrox Long', color: '#d97706', icon: Footprints },
  power: { name: 'Power', color: '#2563eb', icon: Dumbbell },
  build: { name: 'Build', color: '#a855f7', icon: Dumbbell },
  tactical: { name: 'Tactical', color: '#334155', icon: Footprints },
  hyrox_team: { name: 'Hyrox Team', color: '#22c55e', icon: Heart },
};

// Block type colors
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

// Demo session for preview
const demoSession = {
  id: 'preview-demo',
  date: new Date().toISOString().split('T')[0],
  title: 'Séance Demo',
  category: 'crossnfit' as SessionCategory,
  blocks: [
    { id: 'p1', type: 'warmup' as BlockType, title: 'Échauffement', content: '5 min course\n3 min mobilité', order: 0 },
    { id: 'p2', type: 'strength' as BlockType, title: 'Force', content: 'Back Squat:\n5x5 @ 75%', order: 1 },
    { id: 'p3', type: 'wod' as BlockType, title: 'WOD', content: 'AMRAP 15:\n10 Burpees\n15 KB Swings', order: 2 },
    { id: 'p4', type: 'cooldown' as BlockType, title: 'Retour calme', content: '5 min stretching', order: 3 },
  ],
  work_duration: 45,
  rest_duration: 15,
  rounds: 4,
};

export function TVPreview() {
  const { settings } = useTVSettingsStore();
  const { text: textSettings, layout: layoutSettings, colors: colorSettings, behavior: behaviorSettings } = settings;

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isHydrated, setIsHydrated] = useState(false);

  // Attendre l'hydratation du store
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Effective zoom (scaled down for preview)
  const previewScale = 0.5;
  const effectiveZoom = (layoutSettings.globalZoom / 100) * previewScale;

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

  // Background style
  const backgroundStyle = colorSettings.useGradient
    ? { background: `linear-gradient(to bottom right, ${colorSettings.gradientFrom}, ${colorSettings.gradientTo})` }
    : { backgroundColor: colorSettings.backgroundColor };

  // Header height
  const headerPadding = {
    compact: 'py-1',
    normal: 'py-2',
    large: 'py-3',
  }[layoutSettings.headerHeight];

  const category = CATEGORY_CONFIG[demoSession.category];
  const CategoryIcon = category.icon;

  // Afficher un placeholder pendant l'hydratation
  if (!isHydrated) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
        <div className="text-slate-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 flex flex-col overflow-hidden"
      style={{
        ...backgroundStyle,
        padding: `${layoutSettings.paddingTop * previewScale}px ${layoutSettings.paddingRight * previewScale}px ${layoutSettings.paddingBottom * previewScale}px ${layoutSettings.paddingLeft * previewScale}px`,
      }}
    >
      {/* Header */}
      <header
        className={`flex-shrink-0 px-3 ${headerPadding} border-b border-black/10`}
        style={{ backgroundColor: colorSettings.headerBackground }}
      >
        <div className="grid grid-cols-3 items-center gap-2">
          {/* Left - Session Info */}
          <div className="flex flex-col min-w-0">
            <h1
              className={`tracking-tight text-black truncate ${textSettings.titleBold ? 'font-extrabold' : 'font-medium'} ${textSettings.titleUppercase ? 'uppercase' : ''}`}
              style={{
                fontSize: `${1.2 * textSettings.titleSize * effectiveZoom}rem`,
                fontFamily: FONT_FAMILY_MAP[textSettings.fontFamily],
              }}
            >
              {demoSession.title}
            </h1>
            {behaviorSettings.showDate && (
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="font-semibold text-black/70 capitalize truncate"
                  style={{ fontSize: `${0.55 * textSettings.contentSize * effectiveZoom}rem` }}
                >
                  {formatDate(demoSession.date)}
                </span>
                {behaviorSettings.showCategory && (
                  <span
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-full font-bold text-white whitespace-nowrap"
                    style={{
                      backgroundColor: category.color,
                      fontSize: `${0.45 * textSettings.contentSize * effectiveZoom}rem`,
                    }}
                  >
                    <CategoryIcon style={{ width: `${0.5 * effectiveZoom}rem`, height: `${0.5 * effectiveZoom}rem` }} />
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
                  fontSize: `${2.5 * textSettings.clockSize * effectiveZoom}rem`,
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
              <div className="flex items-center gap-1 text-black/80" style={{ fontSize: `${0.6 * textSettings.contentSize * effectiveZoom}rem` }}>
                <Clock style={{ width: `${0.6 * effectiveZoom}rem`, height: `${0.6 * effectiveZoom}rem` }} />
                <span className="font-bold">{demoSession.work_duration}s travail</span>
                <span className="text-black/60">/ {demoSession.rest_duration}s repos</span>
              </div>
              <div className="text-black/60 font-semibold" style={{ fontSize: `${0.5 * textSettings.contentSize * effectiveZoom}rem` }}>
                {demoSession.rounds} rounds
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Blocks Content */}
      <main
        className="flex-1 overflow-hidden"
        style={{
          padding: `${layoutSettings.blockGap * previewScale}px`,
        }}
      >
        <div
          className="h-full grid"
          style={{
            gridTemplateColumns: `repeat(${Math.min(demoSession.blocks.length, layoutSettings.maxBlocksPerRow)}, 1fr)`,
            gap: `${layoutSettings.blockGap * previewScale}px`,
          }}
        >
          {demoSession.blocks.map((block) => {
            const blockConfig = BLOCK_TYPE_CONFIG[block.type] || BLOCK_TYPE_CONFIG.custom;
            const blockColors = BLOCK_TYPE_COLORS[block.type] || BLOCK_TYPE_COLORS.custom;

            return (
              <div
                key={block.id}
                className="border shadow-sm overflow-hidden flex flex-col"
                style={{
                  backgroundColor: blockColors.bg,
                  borderColor: `${blockColors.border}40`,
                  borderTopColor: blockColors.border,
                  borderTopWidth: '2px',
                  borderRadius: `${layoutSettings.blockRadius * previewScale}px`,
                }}
              >
                {/* Block Header */}
                <div
                  className="px-2 py-1 border-b flex items-center gap-1"
                  style={{
                    borderColor: `${blockColors.border}30`,
                    backgroundColor: `${blockColors.border}15`,
                  }}
                >
                  <span style={{ fontSize: `${0.8 * textSettings.titleSize * effectiveZoom}rem` }}>{blockConfig.icon}</span>
                  <h2
                    className={`flex-1 ${textSettings.titleBold ? 'font-bold' : 'font-medium'} ${textSettings.titleUppercase ? 'uppercase' : ''} tracking-wide truncate`}
                    style={{
                      fontSize: `${0.8 * textSettings.titleSize * effectiveZoom}rem`,
                      color: blockColors.text,
                      fontFamily: FONT_FAMILY_MAP[textSettings.fontFamily],
                    }}
                  >
                    {block.title}
                  </h2>
                </div>

                {/* Block Content */}
                <div className="flex-1 p-2 overflow-hidden">
                  <div
                    className={`whitespace-pre-wrap ${textSettings.contentBold ? 'font-semibold' : ''}`}
                    style={{
                      fontSize: `${0.65 * textSettings.contentSize * effectiveZoom}rem`,
                      color: blockColors.text,
                      lineHeight: textSettings.lineHeight,
                      fontFamily: FONT_FAMILY_MAP[textSettings.fontFamily],
                    }}
                  >
                    {block.content.split('\n').slice(0, 3).map((line, i) => (
                      <div key={i}>{line || '\u00A0'}</div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
