import { Command } from '@node-ts/bus-messages';
import { Uuid } from '@node-ts/ddd-types';

/**
 * Disable user command message
 */
export class DisableUser extends Command {
  /**
   * A unique name that identifies the message. This should be done in namespace style syntax,
   * ie: organisation/domain/command-name
   */
  $name = 'org/iam/user/disable';

  /**
   * The contract version of this message. This can be incremented if this message changes the
   * number of properties etc to maintain backwards compatibility
   */
  $version = 0;


  /**
   * Disable user
   * @param id
   */
  constructor (readonly id: Uuid) {
    super();
  }
}
