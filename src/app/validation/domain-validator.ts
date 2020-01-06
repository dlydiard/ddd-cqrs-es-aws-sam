import { Uuid } from '@node-ts/ddd-types';
import { IsUUID, validateSync } from 'class-validator';

/**
 * Basic domain validator.
 */
export class DomainValidator {
  @IsUUID()
  id!: Uuid;

  /**
   * Throw ValidationError if model is not valid.
   * @throws ValidationError
   */
  validate(): void {
    const errors = validateSync(this);

    if (errors.length) {
      throw errors;
    }
  }
}
