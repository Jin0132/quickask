export type CategoryConfig = {
  id: string;
  label: string;
  icon: string;
  accent: string;
  visible: boolean;
};

export type AnalyticsData = {
  categoryTaps: Record<string, number>;
  inputTypeSelections: { text: number; voice: number };
  conversions: number;
};

export type TrackEvent =
  | { type: 'category_select'; categoryId: string }
  | { type: 'input_type'; inputType: 'text' | 'voice' }
  | { type: 'conversion' };

export const ADMIN_SESSION_COOKIE = 'quickask_admin';
export const ADMIN_UI_SESSION_KEY = 'quickask:admin';
