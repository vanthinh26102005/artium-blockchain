import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ArtworkStatus } from '../../../enums';

@InputType()
export class FindManyArtworkInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sellerId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  q?: string; // search by title or description

  @Field(() => ArtworkStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ArtworkStatus)
  status?: ArtworkStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  skip?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  take?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  includeSellerAuctionLifecycle?: boolean;
}
