import { Command } from '@node-ts/bus-messages';
import { Uuid } from '@node-ts/ddd-types';

/**
 * Create role command message
 */
export class CreateRole extends Command {
  /**
   * A unique name that identifies the message. This should be done in namespace style syntax,
   * ie: organisation/domain/command-name
   */
  $name = 'org/iam/role/create';

  /**
   * The contract version of this message. This can be incremented if this message changes the
   * number of properties etc to maintain backwards compatibility
   */
  $version = 0;

  /**
   * Create a role
   * @param id role id
   * @param name name of role
   */
  constructor (readonly id: Uuid, readonly name: string) {
    super();
  }
}
