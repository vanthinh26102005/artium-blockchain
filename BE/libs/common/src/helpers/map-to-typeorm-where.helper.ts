import {
  Equal,
  Not,
  MoreThan,
  MoreThanOrEqual,
  LessThan,
  LessThanOrEqual,
  In,
  Like,
  IsNull,
  FindOptionsWhere,
} from 'typeorm';
import { WhereOperator } from '../interfaces/repository.interface';

/**
 * Helper: Chuyển `WhereOperator<T>` (toán tử tùy chỉnh) sang `FindOptionsWhere<T>` của TypeORM.
 *
 * Hỗ trợ các toán tử:
 * - $eq, $ne, $gt, $gte, $lt, $lte, $in, $like
 * - Hỗ trợ so sánh `null` (IS NULL / IS NOT NULL)
 */
export function mapToTypeOrmWhere<T>(
  where?: WhereOperator<T>,
): FindOptionsWhere<T> {
  if (!where) return {} as FindOptionsWhere<T>;

  const typeOrmWhere: any = {};

  for (const key in where) {
    if (Object.prototype.hasOwnProperty.call(where, key)) {
      const field = key as keyof T;
      const value = where[field];

      if (typeof value === 'object' && value !== null) {
        if ('$eq' in value) {
          typeOrmWhere[field] =
            value.$eq === null ? IsNull() : Equal(value.$eq);
        } else if ('$ne' in value) {
          typeOrmWhere[field] =
            value.$ne === null ? Not(IsNull()) : Not(value.$ne);
        } else if ('$gt' in value) typeOrmWhere[field] = MoreThan(value.$gt);
        else if ('$gte' in value)
          typeOrmWhere[field] = MoreThanOrEqual(value.$gte);
        else if ('$lt' in value) typeOrmWhere[field] = LessThan(value.$lt);
        else if ('$lte' in value)
          typeOrmWhere[field] = LessThanOrEqual(value.$lte);
        else if ('$in' in value && value.$in !== undefined)
          typeOrmWhere[field] = In(value.$in as any[]);
        else if ('$like' in value) typeOrmWhere[field] = Like(value.$like);
      } else {
        // Cho phép so sánh null trực tiếp
        typeOrmWhere[field] = value === null ? IsNull() : Equal(value as any);
      }
    }
  }

  return typeOrmWhere as FindOptionsWhere<T>;
}
