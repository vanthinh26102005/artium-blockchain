import { SendEventInvitationsDto } from '../../domain';

export class SendEventInvitationsCommand {
  constructor(public readonly data: SendEventInvitationsDto) {}
}
