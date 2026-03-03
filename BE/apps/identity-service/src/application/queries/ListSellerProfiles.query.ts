import { ProfileType } from '@app/common';

export class ListSellerProfilesQuery {
  constructor(
    public readonly filters: {
      profileType?: ProfileType;
      isActive?: boolean;
      isVerified?: boolean;
      isFeatured?: boolean;
      location?: string;
      searchQuery?: string;
    },
    public readonly skip: number = 0,
    public readonly take: number = 20,
    public readonly sortBy: string = 'createdAt',
    public readonly sortOrder: 'ASC' | 'DESC' = 'DESC',
  ) {}
}
