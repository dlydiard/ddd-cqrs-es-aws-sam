import { Command } from '@node-ts/bus-messages';
import { Uuid } from '@node-ts/ddd-types';

/**
 * Add role to user command message
 */
export class AddUserRole extends Command {
  /**
   * A unique name that identifies the message. This should be done in namespace style syntax,
   * ie: organisation/domain/command-name
   */
  $name = 'org/iam/user/addRole';

  /**
   * The contract version of this message. This can be incremented if this message changes the
   * number of properties etc to maintain backwards compatibility
   */
  $version = 0;

  /**
   * Add role to user
   * @param id user id
   * @param roleId role id
   */
  constructor (readonly id: Uuid, readonly roleId: string) {
    super();
  }
}
