// reflect-metadata polyfill should be imported once in the entire application because the Reflect object is meant to be a global singleton.
import 'reflect-metadata';

import { Context, SQSEvent } from 'aws-lambda';

import { ApplicationContainer } from '../../app/application-container';
import { Event } from '../events/event';
import { EventHandler } from '../handler/event-handler.interface';
import { HandlesEventService } from '../handler/handles-event.service';

// cache container instance if we get the same lambda container
let _applicationContainer: ApplicationContainer;

/**
 * Broker each SQS message to the registered event handlers.
 * @param event
 * @param context
 */
export const handler = async (event: SQSEvent, context: Context): Promise<void> => {
  if (!_applicationContainer) {
    _applicationContainer = ApplicationContainer.instance();
  }

  _applicationContainer.logger.debug('Queue Broker: %o', event);

  // process each record by calling registered handlers for the event type
  for (const record of event.Records) {
    const currentEvent: Event = JSON.parse(record.body);

    // call handlers for this event
    for (const handlerName of HandlesEventService.getHandlers(currentEvent.$name)) {
      await callHandler(currentEvent, handlerName);
    }
  };
};

/**
 * Get and call Event Handler.
 * @param currentEvent
 * @param handlerName
 */
const callHandler = async (currentEvent: Event, handlerName: string): Promise<void> => {
  const handler = _applicationContainer.get<EventHandler>(handlerName);

  if (handler) {
    await handler.handle(currentEvent)
      .then(() => _applicationContainer.logger.debug('Successfully called Handler %s for event %o', handlerName, currentEvent))
      .catch(err => _applicationContainer.logger.error('Error in Handler %s for event %o: %o', handlerName, currentEvent, err));
  } else {
    _applicationContainer.logger.error('Event Handler %s not found for event %o', handlerName, currentEvent);
  }
}
