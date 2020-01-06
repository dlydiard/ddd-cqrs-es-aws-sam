import { Uuid } from '@node-ts/ddd-types';

import { Event } from '../../../event-store/events/event';
import { RoleEvents } from './role-events';

export class RoleDisabled extends Event {
  $name = RoleEvents.Disabled;

  /**
   * A disabled event
   * @param id
   * @param $version
   */
  constructor(readonly id: Uuid, readonly $version: number = 0) {
    super();
  }
}
