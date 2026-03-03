import { FindManyArtworkInput } from 'apps/artwork-service/src/domain';

export class ListArtworksQuery {
  constructor(public readonly options: FindManyArtworkInput = {}) {}
}
