import { Command } from '@node-ts/bus-messages';
import { Uuid } from '@node-ts/ddd-types';

/**
 * Update user command message
 */
export class UpdateUser extends Command {
  /**
   * A unique name that identifies the message. This should be done in namespace style syntax,
   * ie: organisation/domain/command-name
   */
  $name = 'org/iam/user/update';

  /**
   * The contract version of this message. This can be incremented if this message changes the
   * number of properties etc to maintain backwards compatibility
   */
  $version = 0;


  /**
   * Update user
   * @param id
   * @param firstName
   * @param lastName
   */
  constructor (readonly id: Uuid, readonly firstName: string, readonly lastName: string) {
    super();
  }
}
