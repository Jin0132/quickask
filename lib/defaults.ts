import type { AnalyticsData, CategoryConfig } from './types';

export const DEFAULT_CATEGORIES: CategoryConfig[] = [
  { id: 'food', label: 'Food / Bar', icon: 'Utensils', accent: 'from-orange-400 to-rose-500', visible: true },
  { id: 'photo', label: 'Photo Spot', icon: 'Camera', accent: 'from-violet-400 to-purple-600', visible: true },
  { id: 'lost', label: 'Lost / Train', icon: 'MapPin', accent: 'from-sky-400 to-blue-600', visible: true },
  { id: 'smoking', label: 'Smoking Area', icon: 'Cigarette', accent: 'from-emerald-400 to-teal-600', visible: true },
  { id: 'attractions', label: 'Attractions', icon: 'Compass', accent: 'from-amber-400 to-orange-500', visible: false },
  { id: 'others', label: 'Others', icon: 'HelpCircle', accent: 'from-slate-400 to-slate-600', visible: false },
];

export const DEFAULT_ANALYTICS: AnalyticsData = {
  categoryTaps: {},
  inputTypeSelections: { text: 0, voice: 0 },
  conversions: 0,
};

export const STORAGE_KEYS = {
  categories: 'quickask:categories',
  analytics: 'quickask:analytics',
} as const;

export const ICON_OPTIONS = [
  'Utensils', 'Camera', 'MapPin', 'Cigarette', 'Compass',
  'HelpCircle', 'Star', 'Heart', 'Train', 'Coffee',
] as const;

export const ACCENT_OPTIONS = [
  'from-orange-400 to-rose-500',
  'from-violet-400 to-purple-600',
  'from-sky-400 to-blue-600',
  'from-emerald-400 to-teal-600',
  'from-amber-400 to-orange-500',
  'from-pink-400 to-fuchsia-600',
  'from-slate-400 to-slate-600',
] as const;
