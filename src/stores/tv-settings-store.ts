import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types pour les settings TV
export interface TVTextSettings {
  fontFamily: 'default' | 'mono' | 'serif';
  titleSize: number; // multiplier (0.5 - 2)
  contentSize: number; // multiplier (0.5 - 2)
  clockSize: number; // multiplier (0.5 - 2)
  titleBold: boolean;
  titleUppercase: boolean;
  contentBold: boolean;
  lineHeight: number; // 1 - 2
}

export interface TVLayoutSettings {
  globalZoom: number; // 50 - 150 (pourcentage)
  paddingTop: number; // 0 - 100 px
  paddingBottom: number; // 0 - 100 px
  paddingLeft: number; // 0 - 100 px
  paddingRight: number; // 0 - 100 px
  headerHeight: 'compact' | 'normal' | 'large';
  blockGap: number; // 8 - 32 px
  blockRadius: number; // 0 - 24 px
  maxBlocksPerRow: number; // 2 - 6
}

export interface TVColorSettings {
  backgroundColor: string;
  headerBackground: string;
  clockColor: string;
  useGradient: boolean;
  gradientFrom: string;
  gradientTo: string;
}

export interface TVBehaviorSettings {
  autoHideControls: boolean;
  autoHideDelay: number; // seconds
  autoRefresh: boolean;
  autoRefreshInterval: number; // seconds
  showClock: boolean;
  showDate: boolean;
  showCategory: boolean;
  showTimingInfo: boolean;
}

export interface TVSettings {
  text: TVTextSettings;
  layout: TVLayoutSettings;
  colors: TVColorSettings;
  behavior: TVBehaviorSettings;
}

// Valeurs par défaut
const defaultSettings: TVSettings = {
  text: {
    fontFamily: 'default',
    titleSize: 1,
    contentSize: 1,
    clockSize: 1,
    titleBold: true,
    titleUppercase: true,
    contentBold: false,
    lineHeight: 1.5,
  },
  layout: {
    globalZoom: 100,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    headerHeight: 'normal',
    blockGap: 16,
    blockRadius: 12,
    maxBlocksPerRow: 4,
  },
  colors: {
    backgroundColor: '#f1f5f9', // slate-100
    headerBackground: 'rgba(255,255,255,0.9)',
    clockColor: '#000000',
    useGradient: true,
    gradientFrom: '#f1f5f9',
    gradientTo: '#e2e8f0',
  },
  behavior: {
    autoHideControls: true,
    autoHideDelay: 5,
    autoRefresh: true,
    autoRefreshInterval: 30,
    showClock: true,
    showDate: true,
    showCategory: true,
    showTimingInfo: true,
  },
};

interface TVSettingsStore {
  settings: TVSettings;
  setTextSettings: (settings: Partial<TVTextSettings>) => void;
  setLayoutSettings: (settings: Partial<TVLayoutSettings>) => void;
  setColorSettings: (settings: Partial<TVColorSettings>) => void;
  setBehaviorSettings: (settings: Partial<TVBehaviorSettings>) => void;
  resetToDefaults: () => void;
  resetSection: (section: keyof TVSettings) => void;
}

export const useTVSettingsStore = create<TVSettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,

      setTextSettings: (textSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            text: { ...state.settings.text, ...textSettings },
          },
        })),

      setLayoutSettings: (layoutSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            layout: { ...state.settings.layout, ...layoutSettings },
          },
        })),

      setColorSettings: (colorSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            colors: { ...state.settings.colors, ...colorSettings },
          },
        })),

      setBehaviorSettings: (behaviorSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            behavior: { ...state.settings.behavior, ...behaviorSettings },
          },
        })),

      resetToDefaults: () =>
        set({ settings: defaultSettings }),

      resetSection: (section) =>
        set((state) => ({
          settings: {
            ...state.settings,
            [section]: defaultSettings[section],
          },
        })),
    }),
    {
      name: 'tv-settings',
    }
  )
);

// Export des defaults pour la page settings
export { defaultSettings };
