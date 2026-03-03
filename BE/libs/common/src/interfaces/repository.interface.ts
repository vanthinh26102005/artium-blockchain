import { EntityManager } from 'typeorm';

export type WhereOperator<T> = {
  [P in keyof T]?:
    | T[P] // so sánh bằng (=)
    | { $eq?: T[P] | null } // bằng
    | { $ne?: T[P] | null } // khác
    | { $gt?: T[P] } // lớn hơn
    | { $gte?: T[P] } // lớn hơn hoặc bằng
    | { $lt?: T[P] } // nhỏ hơn
    | { $lte?: T[P] } // nhỏ hơn hoặc bằng
    | { $in?: T[P][] | null } // nằm trong tập
    | { $like?: string }; // LIKE '%abc%'
};

export type OrderByCondition<T> = {
  [P in keyof T]?: 'asc' | 'desc';
};

export interface BaseFindOptions<T> {
  where?: WhereOperator<T>; // điều kiện lọc
  orderBy?: OrderByCondition<T>; // sắp xếp
  select?: (keyof T)[]; // chỉ lấy một số cột
  relations?: string[]; // eager load quan hệ
}

export interface FindOneOptions<T> extends BaseFindOptions<T> {}

export interface FindManyOptions<T> extends BaseFindOptions<T> {
  skip?: number;
  take?: number;
  distinct?: (keyof T)[];
}

export interface IRepository<T, IdType = string> {
  create(
    data: Omit<T, 'id' | 'createdAt'>,
    transactionManager?: EntityManager,
  ): Promise<T>;
  update(
    id: IdType,
    data: Partial<T>,
    transactionManager?: EntityManager,
  ): Promise<T | null>;
  delete(id: IdType, transactionManager?: EntityManager): Promise<boolean>;

  findById(id: IdType, transactionManager?: EntityManager): Promise<T | null>;
  findOne(
    options: FindOneOptions<T>,
    transactionManager?: EntityManager,
  ): Promise<T | null>;
  find(
    options?: FindManyOptions<T>,
    transactionManager?: EntityManager,
  ): Promise<T[]>;

  count(
    where?: WhereOperator<T>,
    transactionManager?: EntityManager,
  ): Promise<number>;
  exists(
    where: WhereOperator<T>,
    transactionManager?: EntityManager,
  ): Promise<boolean>;

  createMany(
    data: Omit<T, 'id'>[],
    transactionManager?: EntityManager,
  ): Promise<T[]>;
  updateMany(
    where: WhereOperator<T>,
    data: Partial<T>,
    transactionManager?: EntityManager,
  ): Promise<number>;
  deleteMany(
    where: WhereOperator<T>,
    transactionManager?: EntityManager,
  ): Promise<number>;
}
