import { Clan, Sport, Match, Announcement, Highlight } from '@/types/competition';

export const clans: Clan[] = [
  {
    id: '1',
    name: 'Phoenix Warriors',
    tagline: 'Rise from the ashes',
    color: 'hsl(0 85% 60%)',
    logo: '🔥',
    mascot: 'Phoenix',
    totalPoints: 285,
    rank: 1
  },
  {
    id: '2',
    name: 'Thunder Bolts',
    tagline: 'Strike with power',
    color: 'hsl(214 90% 55%)',
    logo: '⚡',
    mascot: 'Thunder',
    totalPoints: 270,
    rank: 2
  },
  {
    id: '3',
    name: 'Emerald Dragons',
    tagline: 'Breathe fire, win glory',
    color: 'hsl(142 76% 45%)',
    logo: '🐉',
    mascot: 'Dragon',
    totalPoints: 255,
    rank: 3
  },
  {
    id: '4',
    name: 'Mystic Shadows',
    tagline: 'Victory in silence',
    color: 'hsl(270 75% 60%)',
    logo: '🌙',
    mascot: 'Shadow',
    totalPoints: 240,
    rank: 4
  },
  {
    id: '5',
    name: 'Blaze Titans',
    tagline: 'Unstoppable force',
    color: 'hsl(25 95% 55%)',
    logo: '🏆',
    mascot: 'Titan',
    totalPoints: 225,
    rank: 5
  },
  {
    id: '6',
    name: 'Frost Guardians',
    tagline: 'Cool under pressure',
    color: 'hsl(190 90% 50%)',
    logo: '❄️',
    mascot: 'Guardian',
    totalPoints: 210,
    rank: 6
  }
];

export const sports: Sport[] = [
  { id: '1', name: 'Cricket', icon: '🏏', description: 'The gentleman\'s game' },
  { id: '2', name: 'Football', icon: '⚽', description: 'The beautiful game' },
  { id: '3', name: 'Basketball', icon: '🏀', description: 'Above the rim' },
  { id: '4', name: 'Volleyball', icon: '🏐', description: 'Spike and serve' }
];

export const upcomingMatches: Match[] = [
  {
    id: '1',
    sportId: '1',
    sportName: 'Cricket',
    clan1: 'Phoenix Warriors',
    clan2: 'Thunder Bolts',
    date: '2025-02-15',
    time: '16:00',
    venue: 'Main Ground',
    status: 'upcoming'
  },
  {
    id: '2',
    sportId: '2',
    sportName: 'Football',
    clan1: 'Emerald Dragons',
    clan2: 'Mystic Shadows',
    date: '2025-02-15',
    time: '18:00',
    venue: 'Sports Complex',
    status: 'upcoming'
  },
  {
    id: '3',
    sportId: '3',
    sportName: 'Basketball',
    clan1: 'Blaze Titans',
    clan2: 'Frost Guardians',
    date: '2025-02-16',
    time: '10:00',
    venue: 'Indoor Court',
    status: 'live',
    score1: 45,
    score2: 42
  }
];

export const announcements: Announcement[] = [
  {
    id: '1',
    title: 'Cricket Finals Rescheduled',
    message: 'Due to weather conditions, the cricket finals have been moved to February 20th at 4:00 PM.',
    timestamp: '2025-02-10T14:30:00',
    urgent: true
  },
  {
    id: '2',
    title: 'New Venue for Basketball',
    message: 'Basketball semifinals will now be held at the new indoor facility.',
    timestamp: '2025-02-09T10:00:00',
    urgent: false
  }
];

export const highlights: Highlight[] = [
  {
    id: '1',
    date: '2025-02-10',
    description: 'Phoenix Warriors pull off stunning comeback in cricket quarterfinals!'
  },
  {
    id: '2',
    date: '2025-02-09',
    description: 'Thunder Bolts dominate football match with 4-0 victory'
  }
];
