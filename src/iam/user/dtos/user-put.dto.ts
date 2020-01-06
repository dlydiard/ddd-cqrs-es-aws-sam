import { Uuid } from '@node-ts/ddd-types';
import { IsAlpha, IsUUID, Length } from 'class-validator';

/**
 * Update user DTO.
 * Using basic non-domain validation.
 */
export class UserPutDto {
  @IsUUID()
  readonly id!: Uuid;
  readonly firstName!: string;
  readonly lastName!: string
}
