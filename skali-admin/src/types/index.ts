// Types principaux - Skali Admin

export type UserRole = 'ADMIN' | 'COACH' | 'ATHLETE';

export interface Session {
  isAuthenticated: boolean;
  role: UserRole;
  userId?: string;
  expiresAt?: number;
}

export interface Member {
  id: string;
  name: string;
  email?: string;
  weight?: number;
  body_fat_percentage?: number;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DiscordMember {
  id: string;
  discord_id: string;
  discord_username: string;
  discord_avatar?: string;
  member_id?: string;
  member_name?: string;
  is_active: boolean;
  last_sync?: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  quantity: number;
  condition: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface APIKeyConfig {
  name: string;
  label: string;
  description: string;
  placeholder: string;
  testable: boolean;
  required: boolean;
}
