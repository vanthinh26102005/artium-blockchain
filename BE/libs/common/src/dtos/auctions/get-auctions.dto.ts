import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { AuctionCategoryKey, AuctionStatusKey } from './auction-read.dto';

export class GetAuctionsDto {
  @ApiPropertyOptional({ enum: AuctionStatusKey })
  @IsOptional()
  @IsEnum(AuctionStatusKey)
  status?: AuctionStatusKey;

  @ApiPropertyOptional({ enum: AuctionCategoryKey })
  @IsOptional()
  @IsEnum(AuctionCategoryKey)
  category?: AuctionCategoryKey;

  @ApiPropertyOptional({ description: 'Minimum current bid in ETH', minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minBidEth?: number;

  @ApiPropertyOptional({ description: 'Maximum current bid in ETH', minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxBidEth?: number;

  @ApiPropertyOptional({ description: 'Number of records to skip', minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  skip?: number;

  @ApiPropertyOptional({ description: 'Maximum number of records to return', minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  take?: number;

  @ApiPropertyOptional({ description: 'Optional text query reserved for future auction search' })
  @IsOptional()
  @IsString()
  q?: string;
}
