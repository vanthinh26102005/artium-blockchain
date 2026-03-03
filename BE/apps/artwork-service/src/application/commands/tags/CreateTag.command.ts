export class CreateTagCommand {
  constructor(
    public readonly payload: {
      name: string;
      sellerId?: string;
      status?: string;
    },
  ) {}
}
