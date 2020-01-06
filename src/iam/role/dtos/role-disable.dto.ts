import { Uuid } from '@node-ts/ddd-types';
import { IsUUID } from 'class-validator';

/**
 * Disable role DTO.
 * Using basic non-domain validation.
 */
export class RoleDisableDto {
  @IsUUID()
  readonly id!: Uuid;
}
