import { Repository } from './repository.interface';

export interface SetValidationRepository extends Repository<any> {
  /**
   * Get constraint for an event, field, and value.
   *
   * Full constraint examples with different scopes:
   *   iam/user#email:user@domain.com    (default)
   *   iam#email:user@domain.com         (isBoundedContextScope = true)
   *
   * @param eventName
   * @param fieldName
   * @param fieldValue
   * @param isBoundedContextScope
   * @returns constraint value
   */
  getContsraint(eventName: string, fieldName: string, fieldValue: string, isBoundedContextScope?: boolean): string;

  /**
   * Returns true if constraint exists.
   * @param table
   * @param id
   */
  isExists(constraint: string): Promise<boolean>;

  /**
   * insert constraint.
   * @param table
   * @param constraint
   * @returns save output
   */
  insert(constraint: string): Promise<any>;

  /**
   * Remove constraint.
   * @param table
   * @param constraint
   * @returns true if no errors
   */
  remove(constraint: string): Promise<boolean>;
}
