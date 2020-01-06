/**
 * Manage handlers for events.
 */
export class HandlesEventService {
  private static readonly _registeredEventHandlers: Array<Set<string>> = [];

  /**
   * push handler for a given event name.
   *
   * @param event event name
   * @param handler handler class name
   */
  static pushHandler(event: string, handler: string): void {
    if (!HandlesEventService._registeredEventHandlers[event]) {
      HandlesEventService._registeredEventHandlers[event] = new Set();
    }

    HandlesEventService._registeredEventHandlers[event].add(handler);
  }

  /**
   * returns event handler class names for a given event name.
   */
  static getHandlers(event: string): ReadonlySet<string> {
    return HandlesEventService._registeredEventHandlers[event] || new Set<string>();
  }
}
