import { Uuid } from '@node-ts/ddd-types';

import { Event } from '../../../event-store/events/event';
import { UserEvents } from './user-events';

export class UserDisabled extends Event {
  $name = UserEvents.Disabled;

  /**
   * A disabled event
   * @param id
   * @param $version
   */
  constructor(readonly id: Uuid, readonly $version: number = 0) {
    super();
  }
}
