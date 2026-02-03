// Configuration de la navigation admin

import {
  LayoutDashboard,
  Settings,
  Key,
  MessageSquare,
  Package,
  Users,
  Calendar,
  TrendingUp,
  UsersRound,
  Target,
  Tv,
  Compass,
  Wrench,
  Smartphone,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  children?: NavItem[];
  isSection?: boolean; // Pour les titres de section
  openInNewWindow?: boolean; // Ouvre dans une nouvelle fenêtre (ex: TV Mode)
}

export const ADMIN_NAV: NavItem[] = [
  // Dashboard seul
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },

  // Section Navigation
  {
    title: 'Navigation',
    href: '#navigation',
    icon: Compass,
    isSection: true,
    children: [
      {
        title: 'Planning',
        href: '/calendar',
        icon: Calendar,
      },
      {
        title: 'Adhérents',
        href: '/members',
        icon: Users,
      },
      {
        title: 'TeamBuilder',
        href: '/teams',
        icon: UsersRound,
      },
      {
        title: 'TV Mode',
        href: '/tv',
        icon: Tv,
        openInNewWindow: true, // S'ouvre dans une nouvelle fenêtre pour affichage TV
      },
      {
        title: 'Performance',
        href: '/performance',
        icon: TrendingUp,
      },
    ],
  },

  // CRM seul
  {
    title: 'CRM',
    href: '/crm',
    icon: Target,
  },

  // Section Outils
  {
    title: 'Outils',
    href: '#outils',
    icon: Wrench,
    isSection: true,
    children: [
      {
        title: 'PWA Config',
        href: '/pwa-config',
        icon: Smartphone,
      },
      {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
      },
      {
        title: 'Inventory',
        href: '/inventory',
        icon: Package,
      },
      {
        title: 'Discord',
        href: '/discord',
        icon: MessageSquare,
      },
    ],
  },
];
