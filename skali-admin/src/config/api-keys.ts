// Configuration des clés API gérables

import type { APIKeyConfig } from '@/types';

export const API_KEYS_CONFIG: APIKeyConfig[] = [
  {
    name: 'SUPABASE_URL',
    label: 'Supabase URL',
    description: 'URL de votre projet Supabase',
    placeholder: 'https://xxx.supabase.co',
    testable: true,
    required: true,
  },
  {
    name: 'SUPABASE_ANON_KEY',
    label: 'Supabase Anon Key',
    description: 'Clé anonyme Supabase (publique)',
    placeholder: 'eyJ...',
    testable: true,
    required: true,
  },
  {
    name: 'DISCORD_WEBHOOK_URL',
    label: 'Discord Webhook URL',
    description: 'URL du webhook Discord pour les notifications',
    placeholder: 'https://discord.com/api/webhooks/...',
    testable: true,
    required: false,
  },
  {
    name: 'DISCORD_BOT_TOKEN',
    label: 'Discord Bot Token',
    description: 'Token du bot Discord',
    placeholder: 'MTIz...',
    testable: false,
    required: false,
  },
  {
    name: 'CLAUDE_API_KEY',
    label: 'Claude API Key',
    description: 'Clé API Anthropic Claude (pour Morning Coach IA)',
    placeholder: 'sk-ant-...',
    testable: true,
    required: false,
  },
  {
    name: 'OPENWEATHER_API_KEY',
    label: 'OpenWeather API Key',
    description: 'Clé API OpenWeather (météo pour Morning Coach)',
    placeholder: 'abc123...',
    testable: true,
    required: false,
  },
];
