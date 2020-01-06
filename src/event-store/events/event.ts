import { Event as BusEvent } from '@node-ts/bus-messages';
import { AggregateRootProperties, Uuid } from '@node-ts/ddd-types';

export interface EventEnrichmentData {
  aggregateName: string;
  data: AggregateRootProperties<any>;
};

export abstract class Event extends BusEvent {
  id: Uuid;
  $version: number;
  timestamp: string // ISO Date
  correlationId?: Uuid; // used by sagas
  enrichmentData: Array<EventEnrichmentData> = [];
  metadata: any;
}
