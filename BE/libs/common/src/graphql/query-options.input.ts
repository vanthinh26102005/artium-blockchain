import { Field, InputType, Int } from '@nestjs/graphql';
import { SortDirection } from '../enums/sort-direction.enum';

@InputType({ isAbstract: true })
export abstract class BaseOrderByInput {
  @Field(() => SortDirection, { nullable: true })
  id?: SortDirection;

  @Field(() => SortDirection, { nullable: true })
  createdAt?: SortDirection;

  @Field(() => SortDirection, { nullable: true })
  updatedAt?: SortDirection;
}

@InputType({ isAbstract: true })
export abstract class BaseWhereInput {
  @Field({ nullable: true })
  id?: string;

  @Field(() => [String], {
    nullable: true,
    description: 'Lọc theo một trong các ID',
  })
  id_in?: string[];
}

@InputType({ isAbstract: true })
export abstract class BaseQueryOptionsInput {
  @Field(() => Int, {
    nullable: true,
    description: 'Bỏ qua n bản ghi đầu tiên (phân trang).',
  })
  skip?: number;

  @Field(() => Int, {
    nullable: true,
    description: 'Lấy tối đa n bản ghi (giới hạn).',
  })
  take?: number;

  // `where` và `orderBy` sẽ được định nghĩa ở lớp con
}
