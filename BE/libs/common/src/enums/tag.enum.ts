import { registerEnumType } from '@nestjs/graphql';

export enum TagStatus {
  /** Platform-managed tag, available to all users */
  SYSTEM = 'SYSTEM',
  /** User-created tag, private to creator */
  CUSTOM = 'CUSTOM',
  /** User-created tag approved for platform-wide use */
  APPROVED = 'APPROVED',
}

registerEnumType(TagStatus, {
  name: 'TagStatus',
  description:
    'Tag status (SYSTEM: platform-managed, CUSTOM: user-created, APPROVED: approved for all)',
});
