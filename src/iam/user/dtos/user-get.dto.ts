import { Uuid } from '@node-ts/ddd-types';
import { IsUUID } from 'class-validator';

/**
 * Get user by id DTO.
 * Using basic non-domain validation.
 */
export class UserGetDto {
  @IsUUID()
  readonly id!: Uuid;
}
