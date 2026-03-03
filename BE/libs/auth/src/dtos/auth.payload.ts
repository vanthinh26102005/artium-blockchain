import { UserRole } from '@app/common';

export interface AuthPayload {
  sub: string;
  roles?: UserRole[];
  scopes?: string[];
}
