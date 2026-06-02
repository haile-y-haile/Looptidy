import type { AppIconName } from '../components/AppIcon';
import type { AttachmentType } from '../types';

export const quickActionIcons = {
  waiting: 'hourglass-outline',
  promise: 'hand-left-outline',
  decision: 'git-branch-outline',
  review: 'journal-outline',
  blindSpots: 'eye-outline',
  meetingDump: 'document-text-outline',
} as const satisfies Record<string, AppIconName>;

export const settingsIcons = {
  profile: 'person-outline',
  security: 'lock-closed-outline',
  privacy: 'shield-outline',
  appearance: 'color-palette-outline',
  language: 'language-outline',
  accessibility: 'accessibility-outline',
  notifications: 'notifications-outline',
  backup: 'cloud-outline',
  legal: 'document-text-outline',
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
  default: 'ellipse-outline',
  waiting: 'hourglass-outline',
  promised: 'hand-left-outline',
  notFound: 'help-circle-outline',
  review: 'journal-outline',
} as const satisfies Record<string, AppIconName>;
