import { Uuid } from '@node-ts/ddd-types';

import { Event } from '../../../event-store/events/event';
import { RoleEvents } from './role-events';

export class RoleCreated extends Event {
  $name = RoleEvents.Created;

  /**
   * A created event
   * @param id
   * @param name
   * @param $version
   */
  constructor(readonly id: Uuid, readonly name: string, readonly $version: number = 0) {
    super();
  }
}
