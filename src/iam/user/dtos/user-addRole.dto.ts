import { Uuid } from '@node-ts/ddd-types';
import { IsUUID } from 'class-validator';

/**
 * Add role to user DTO.
 * Using basic non-domain validation.
 */
export class UserAddRoleDto {
  @IsUUID()
  readonly id!: Uuid;

  @IsUUID()
  readonly roleId!: Uuid;
}
