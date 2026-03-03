export class FindArtworksByTagsQuery {
  constructor(
    public readonly sellerId: string,
    public readonly tagIds: string[],
    public readonly options: { match?: 'any' | 'all' } = { match: 'any' },
    public readonly paging: { skip?: number; take?: number } = {},
  ) {}
}
