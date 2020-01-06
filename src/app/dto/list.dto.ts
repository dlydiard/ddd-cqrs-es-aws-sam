import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Matches, Max, Min } from 'class-validator';

import { RepositoryFilter } from '../repository/repository.interface';

/**
 * Lists DTO.
 * Using basic non-domain validation.
 */
export class ListDto implements RepositoryFilter {
  @IsOptional()
  @Matches(/\w\:.+/)
  contains?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}
