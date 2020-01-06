import { Uuid } from '@node-ts/ddd-types';
import { Equals, IsAlpha, IsEmail, IsUUID, Length, MaxLength, ValidateIf, ValidationError } from 'class-validator';

import { DomainValidator } from '../../../app/validation/domain-validator';

export class UserRegisterValidator extends DomainValidator {
  @IsEmail()
  @MaxLength(255)
  email!: string;
};

export class UserUpdateValidator extends DomainValidator {
  @Length(1, 50)
  @IsAlpha()
  firstName!: string;

  @Length(1, 50)
  @IsAlpha()
  lastName!: string

  @ValidateIf(o => o.disabled !== undefined)
  @Equals(false)
  disabled!: boolean
};

export class UserDisableValidator extends DomainValidator {
  @ValidateIf(o => o.disabled !== undefined)
  @Equals(false)
  disabled!: boolean
};

export class UserRoleAddValidator extends DomainValidator {
  @IsUUID()
  roleId!: Uuid;

  @IsUUID(undefined, { each: true })
  roles!: Set<Uuid>;

  @ValidateIf(o => o.disabled !== undefined)
  @Equals(false)
  disabled!: boolean;

  validate(): void {
    super.validate();

    // Cannot add an role that's already in the set
    if (this.roles.has(this.roleId)) {
      const error = new ValidationError();

      error.target = this;
      error.property = nameof<UserRoleAddValidator>(u => u.roleId);
      error.value = this.roleId;
      error.constraints = { isRoleNotExists: `${nameof<UserRoleAddValidator>(u => u.roleId)} already exists for User` };
      error.children = [];

      throw error;
    }
  }
};

export class UserRoleRemoveValidator extends DomainValidator {
  @IsUUID()
  roleId!: Uuid;

  @IsUUID(undefined, { each: true })
  roles!: Set<Uuid>;

  validate(): void {
    super.validate();

    // Cannot remove an role that's not in the set
    if (!this.roles.has(this.roleId)) {
      const error = new ValidationError();

      error.target = this;
      error.property = nameof<UserRoleRemoveValidator>(u => u.roleId);
      error.value = this.roleId;
      error.constraints = { isRoleExists: `${nameof<UserRoleRemoveValidator>(u => u.roleId)} does not exists for User` };
      error.children = [];

      throw error;
    }
  }
};
