'use client';

import type { ReactNode } from 'react';
import {
  Camera, Cigarette, Coffee, Compass, Heart, HelpCircle,
  MapPin, Star, Train, Utensils, type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Utensils, Camera, MapPin, Cigarette, Compass,
  HelpCircle, Star, Heart, Train, Coffee,
};

export function getCategoryIcon(name: string, className = 'w-7 h-7'): ReactNode {
  const Icon = ICON_MAP[name] ?? HelpCircle;
  return <Icon className={className} />;
}

export function getIconComponent(name: string): LucideIcon {
  return ICON_MAP[name] ?? HelpCircle;
}
