import { registerEnumType } from '@nestjs/graphql';

/**
 * Query sort direction
 * Used in: Various listing queries
 */
export enum SortDirection {
  /** Ascending order (A-Z, 0-9, oldest first) */
  ASC = 'asc',
  /** Descending order (Z-A, 9-0, newest first) */
  DESC = 'desc',
}

registerEnumType(SortDirection, {
  name: 'SortDirection',
  description: 'Sort direction for queries (ASC: ascending, DESC: descending)',
});
