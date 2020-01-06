import { Uuid } from '@node-ts/ddd-types';
import { IsUUID } from 'class-validator';

/**
 * Remove role from user DTO.
 * Using basic non-domain validation.
 */
export class UserRemoveRoleDto {
  @IsUUID()
  readonly id!: Uuid;

  @IsUUID()
  readonly roleId!: Uuid;
}
