import { Command } from '@node-ts/bus-messages';
import { Uuid } from '@node-ts/ddd-types';

/**
 * Remove role from user command message
 */
export class RemoveUserRole extends Command {
  /**
   * A unique name that identifies the message. This should be done in namespace style syntax,
   * ie: organisation/domain/command-name
   */
  $name = 'org/iam/user/removeRole';

  /**
   * The contract version of this message. This can be incremented if this message changes the
   * number of properties etc to maintain backwards compatibility
   */
  $version = 0;

  /**
   * Remove a role from an user
   * @param id role id
   * @param roleId role id
   */
  constructor (readonly id: Uuid, readonly roleId: string) {
    super();
  }
}
