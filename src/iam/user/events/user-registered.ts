import { Uuid } from '@node-ts/ddd-types';

import { Event } from '../../../event-store/events/event';
import { UserEvents } from './user-events';

export class UserRegistered extends Event {
  $name = UserEvents.Registered;

  /**
   * A registered event
   * @param id
   * @param email
   * @param $version
   */
  constructor(readonly id: Uuid, readonly email: string, readonly $version: number = 0) {
    super();
  }
}
