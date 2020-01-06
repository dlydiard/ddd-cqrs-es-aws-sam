import { Uuid } from '@node-ts/ddd-types';
import { IsUUID } from 'class-validator';

/**
 * Create role DTO.
 * Using basic non-domain validation.
 */
export class RolePostDto {
  @IsUUID()
  readonly id!: Uuid;

  readonly name!: string;
}
