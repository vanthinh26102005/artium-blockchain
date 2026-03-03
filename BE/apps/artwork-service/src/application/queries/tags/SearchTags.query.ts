export class SearchTagsQuery {
  constructor(
    public readonly sellerId: string | null,
    public readonly q: string,
    public readonly limit = 10,
  ) {}
}
