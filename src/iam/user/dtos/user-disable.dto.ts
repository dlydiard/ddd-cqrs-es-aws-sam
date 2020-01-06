import { Uuid } from '@node-ts/ddd-types';
import { IsUUID } from 'class-validator';

/**
 * Disable user by id DTO.
 * Using basic non-domain validation.
 */
export class UserDisableDto {
  @IsUUID()
  readonly id!: Uuid;
}
