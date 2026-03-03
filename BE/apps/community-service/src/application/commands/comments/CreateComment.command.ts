import { CreateCommentInput } from '../../../domain';

export class CreateCommentCommand {
  constructor(public readonly input: CreateCommentInput) {}
}
