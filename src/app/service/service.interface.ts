import { AggregateRoot } from '@node-ts/ddd';
import { Uuid } from '@node-ts/ddd-types';

export interface Service<T extends AggregateRoot> {
  /**
   * Fetch aggregate root from event log.
   * @param id
   */
  getAggregateRoot(id: Uuid): Promise<T>;
}
