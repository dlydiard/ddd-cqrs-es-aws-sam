import { Event } from './event';

export interface Enrich<T extends Event> {
  /**
   * Add enrichment data to the event.
   *
   * Event.enrichmentData[] must contain EventEnrichmentData (id & aggregateName) of the aggregate the target projection uses.
   * Event.enrichmentData[] should also include enrichment data from different aggregate(s), or there's nothing to enrich in the projection.
   *
   * @see Event.enrichmentData[]
   * @param event
   */
  enrich(event: T): Promise<T>;
}
