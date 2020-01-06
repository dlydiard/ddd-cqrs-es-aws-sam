import { Command } from '@node-ts/bus-messages';
import { Uuid } from '@node-ts/ddd-types';

/**
 * Register user command message
 */
export class RegisterUser extends Command {
  /**
   * A unique name that identifies the message. This should be done in namespace style syntax,
   * ie: organisation/domain/command-name
   */
  $name = 'org/iam/user/register';

  /**
   * The contract version of this message. This can be incremented if this message changes the
   * number of properties etc to maintain backwards compatibility
   */
  $version = 0;

  /**
   * Register user
   * @param id user id
   * @param email email address
   */
  constructor (readonly id: Uuid, readonly email: string) {
    super();
  }
}
