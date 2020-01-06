import { AggregateRoot } from '@node-ts/ddd';
import { Uuid } from '@node-ts/ddd-types';

import { Event } from '../events/event';

export interface EventItem {
  id: Uuid, // id + $version used for concurrency
  $version: number,
  timestamp: string | Date,
  event: Event
}

export interface EventPublisher {
  /**
   * Publish event
   * @param event
   * @returns Promise
   */
  publish<TEvent extends Event>(event: TEvent): Promise<void>;

  /**
   * Load an Aggregate Root by id from the event store.
   * @param id
   * @param instance new T(id)
   * @returns Promise containing AggregateRoot
   */
  getAggregateRoot<T extends AggregateRoot>(instance: T): Promise<T>;
}
