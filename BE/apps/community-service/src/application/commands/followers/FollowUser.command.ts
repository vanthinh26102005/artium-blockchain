import { FollowUserInput } from '../../../domain';

export class FollowUserCommand {
  constructor(public readonly input: FollowUserInput) {}
}
