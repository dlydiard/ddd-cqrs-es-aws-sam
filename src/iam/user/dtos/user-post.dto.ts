import { Uuid } from '@node-ts/ddd-types';
import { IsEmail, IsUUID } from 'class-validator';

/**
 * Create user DTO.
 * Using basic non-domain validation.
 */
export class UserPostDto {
  @IsUUID()
  readonly id!: Uuid;

  @IsEmail()
  readonly email!: string;
}
