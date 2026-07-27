import type { AppIconName } from '../components/AppIcon';
import type { AttachmentType } from '../types';

export const settingsIcons = {
  security: 'lock-closed-outline',
  privacy: 'shield-outline',
  notifications: 'notifications-outline',
  backup: 'download-outline',
  support: 'chatbubble-ellipses-outline',
  about: 'information-circle-outline',
  danger: 'warning-outline',
} as const satisfies Record<string, AppIconName>;

export const attachmentIcons: Record<AttachmentType, AppIconName> = {
  link: 'link-outline',
  document: 'document-text-outline',
  photo: 'image-outline',
  audio: 'mic-outline',
  video: 'videocam-outline',
};

export const emptyStateIcons = {
  default: 'albums-outline',
  notFound: 'help-circle-outline',
} as const satisfies Record<string, AppIconName>;
