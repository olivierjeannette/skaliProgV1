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
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  children?: NavItem[];
}

export const ADMIN_NAV: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Discord',
    href: '/discord',
    icon: MessageSquare,
  },
  {
    title: 'Inventory',
    href: '/inventory',
    icon: Package,
  },
  {
    title: 'Members',
    href: '/members',
    icon: Users,
  },
  {
    title: 'Calendar',
    href: '/calendar',
    icon: Calendar,
  },
  {
    title: 'Performance',
    href: '/performance',
    icon: TrendingUp,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    children: [
      {
        title: 'API Keys',
        href: '/settings/api-keys',
        icon: Key,
      },
    ],
  },
];
