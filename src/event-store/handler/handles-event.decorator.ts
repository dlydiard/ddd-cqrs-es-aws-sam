import { Event } from '../events/event';
import { HandlesEventService } from './handles-event.service';

/**
 * Marks that the decorated class handles a particular event. When an event
 * matching the given type is received from the underlying transport it will be dispatched
 * to this function.
 *
 * The dispatcher will dispatch received messsages to the `handle(event: any)` method of your EventHandler class.
 * An exception is thrown, if a hanlder cannot be found.
 *
 * @param event The type of event that the function handles
 */
export function HandlesEvent<TEvent extends { new (...args: any[]): Event }>(event: TEvent): ClassDecorator {
  return (target: Function) => HandlesEventService.pushHandler((new event() as Event).$name, target.name);
};
