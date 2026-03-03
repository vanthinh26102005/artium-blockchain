export class SearchArtworksQuery {
  constructor(
    public readonly sellerId: string,
    public readonly q: string,
    public readonly opts: { skip?: number; take?: number } = {},
  ) {}
}
