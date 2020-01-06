import { Command } from '@node-ts/bus-messages';
import { Uuid } from '@node-ts/ddd-types';

/**
 * Disable role command message
 */
export class DisableRole extends Command {
  /**
   * A unique name that identifies the message. This should be done in namespace style syntax,
   * ie: organisation/domain/command-name
   */
  $name = 'org/iam/role/disable';

  /**
   * The contract version of this message. This can be incremented if this message changes the
   * number of properties etc to maintain backwards compatibility
   */
  $version = 0;

  /**
   * Disable a role
   * @param id role id
   */
  constructor (readonly id: Uuid) {
    super();
  }
}
