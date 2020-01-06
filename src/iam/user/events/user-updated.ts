import { Uuid } from '@node-ts/ddd-types';

import { Event } from '../../../event-store/events/event';
import { UserEvents } from './user-events';

export class UserUpdated extends Event {
  $name = UserEvents.Updated;

  /**
   * An updated event
   * @param id
   * @param firstName
   * @param lastName
   * @param $version
   */
  constructor(readonly id: Uuid, readonly firstName: string, readonly lastName: string, readonly $version: number = 0) {
    super();
  }
}
