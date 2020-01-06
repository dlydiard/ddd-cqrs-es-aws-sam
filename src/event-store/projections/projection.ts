import { Uuid } from '@node-ts/ddd-types';

import { ApplicationError, ApplicationErrorNumber } from '../../app/application-error';
import { Event } from '../events/event';

export abstract class Projection {
  id: Uuid;
  timestamp: Date;

  /**
   * Get 'apply' + function name for an event.
   * @param event
   * @returns event: org/iam/user/registered => applyUserRegistered
   */
  private resolveLocalFunctionName(event: Event): string {
    const namespace = event.$name;
    const nameParts = namespace.split('/');
    const aggregateName = nameParts[nameParts.length - 2];
    const actionName = nameParts[nameParts.length - 1];

    return `apply${aggregateName[0].toUpperCase()}${aggregateName.slice(1)}${actionName[0].toUpperCase()}${actionName.slice(1)}`;
  }

  /**
   * Apply event to this projection model.
   * If the event is org/iam/user/registered => applyUserRegistered(event) will be called.
   * @param event event to apply to projection
   */
  apply(event: Event): void {
    const localFunctionName = this.resolveLocalFunctionName(event);
    const localFunction = this[localFunctionName];

    if (typeof localFunction !== 'function') {
      throw new ApplicationError(`Method ${event.constructor.name}->${localFunctionName}(event: Event): void, does not exist for event ${event.$name}`, ApplicationErrorNumber.MethodNotFound);
    }

    localFunction.call(this, event);
  }
}
