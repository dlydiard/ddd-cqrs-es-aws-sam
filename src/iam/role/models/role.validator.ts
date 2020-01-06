import { Equals, IsAlpha, MaxLength, MinLength, ValidateIf } from 'class-validator';

import { DomainValidator } from '../../../app/validation/domain-validator';

export class RoleCreateValidator extends DomainValidator {
  @IsAlpha()
  @MinLength(1)
  @MaxLength(30)
  name!: string;
};

export class RoleDisableValidator extends DomainValidator {
  @ValidateIf(o => o.disabled !== undefined)
  @Equals(false)
  disabled!: boolean;
};
