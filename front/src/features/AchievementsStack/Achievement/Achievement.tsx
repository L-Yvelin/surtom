import { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { AchievementToast, resolveTexture, useResourcePackStore } from '@surtom/design-system';
import { AchievementIcon, MC_TEXTURE_PREFIX } from './utils';

export interface AchievementProps {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

export class Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;

  constructor(title: string, description: string, icon: string = AchievementIcon.BOOK) {
    this.id = Math.random().toString(36).substring(2, 11);
    this.title = title;
    this.description = description;
    this.icon = icon;
  }
}

function AchievementCard({ title, description, icon = AchievementIcon.BOOK }: AchievementProps): JSX.Element {
  const { t } = useTranslation();
  const overrides = useResourcePackStore((s) => s.overrides);
  const iconSrc = icon.startsWith(MC_TEXTURE_PREFIX) ? resolveTexture(icon.slice(MC_TEXTURE_PREFIX.length), overrides) : icon;
  return <AchievementToast title={title} description={description} icon={iconSrc} iconAlt={t('achievement.iconAlt')} />;
}

export default AchievementCard;
