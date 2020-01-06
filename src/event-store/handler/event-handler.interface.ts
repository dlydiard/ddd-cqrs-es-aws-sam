import { Event } from '../events/event';

/**
 * An interface used by `HandlesEvent` used to dispatch events to.
 * @param event A event that has been received from event store and passed to the handler for processing
 * @returns An awaitable promise that resolves when the handler operation has completed
 */
export interface EventHandler {
  handle (event: Event): Promise<any>
}
