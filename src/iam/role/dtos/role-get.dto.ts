import { Uuid } from '@node-ts/ddd-types';
import { IsUUID } from 'class-validator';

/**
 * Get role by id DTO.
 * Using basic non-domain validation.
 */
export class RoleGetDto {
  @IsUUID()
  readonly id!: Uuid;
}
