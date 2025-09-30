export interface Clan {
  id: string;
  name: string;
  tagline: string;
  color: string;
  logo: string;
  mascot: string;
  totalPoints: number;
  rank: number;
}

export interface Sport {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Match {
  id: string;
  sportId: string;
  sportName: string;
  clan1: string;
  clan2: string;
  date: string;
  time: string;
  venue: string;
  status: 'upcoming' | 'live' | 'completed';
  score1?: number;
  score2?: number;
  winner?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  urgent: boolean;
}

export interface Highlight {
  id: string;
  date: string;
  description: string;
  imageUrl?: string;
}

export type UserRole = 'admin' | 'clan_leader' | 'student';
