import { Uuid } from '@node-ts/ddd-types';

import { Event } from '../../../event-store/events/event';
import { UserEvents } from './user-events';

export class UserRoleAdded extends Event {
  $name = UserEvents.RoleAdded;

  /**
   * A role added to user event
   * @param id
   * @param roleId
   * @param $version
   */
  constructor(readonly id: Uuid, readonly roleId: Uuid, readonly $version: number = 0) {
    super();
  }
}
