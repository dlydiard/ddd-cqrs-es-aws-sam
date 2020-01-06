import { AggregateRoot } from '@node-ts/ddd';
import { WINSTON_SYMBOLS } from '@node-ts/logger-winston';
import { inject, injectable } from 'inversify';
import { Logger } from 'winston';

import { ApplicationError, ApplicationErrorNumber } from '../../app/application-error';
import { DynamoRepository } from '../../app/repository/dynamo.repository';
import { Event } from '../events/event';
import { EventItem, EventPublisher } from './event-publisher.interface';

@injectable()
export class DynamoEventPublisher extends DynamoRepository<EventItem> implements EventPublisher {
  private static readonly table = process.env.eventSourceLog;

  constructor(
    @inject(WINSTON_SYMBOLS.WinstonConfiguration)
    private readonly logger: Logger
  ) {
    super(logger);
  }

  /**
   * Apply event to this projection model.
   * If the event is org/iam/user/registered => whenRegistered(event) will be called.
   * @param instance object to call function on.
   * @param event event to apply to projection
   */
  private when = (instance: AggregateRoot, event: Event): void => {
    const nameParts = event.$name.split('/');
    const name = nameParts[nameParts.length - 1];
    const localFunctionName = `when${name[0].toUpperCase()}${name.slice(1)}`;
    const localFunction = instance[localFunctionName];

    if (typeof localFunction !== 'function') {
      throw new ApplicationError(`Method ${instance.constructor.name}->${localFunctionName}(event: Event): void, does not exist for event ${event.$name}`, ApplicationErrorNumber.MethodNotFound);
    }

    localFunction.call(instance, event);
  }

  /**
   * @inheritdoc
   */
  async publish<TEvent extends Event>(event: TEvent): Promise<void> {
    event.$version = event.$version ? event.$version : 1; // default to version 1
    event.timestamp = new Date().toISOString();

    const eventData: EventItem = {
      id: event.id,
      $version: event.$version,
      timestamp: event.timestamp,
      event: event
    };

    return super.save(DynamoEventPublisher.table, eventData, {
      ConditionExpression: 'attribute_not_exists(#id) AND attribute_not_exists(#version)',
      ExpressionAttributeNames: { '#id': 'id', '#version': '$version' }
    });
  }

  /**
   * @inheritdoc
   * TODO: create async aggregate snapshotting processor.
   * TODO: attempt to load snapshots first. building aggregates will get progressively slower.
   */
  async getAggregateRoot<T extends AggregateRoot>(instance: T): Promise<T> {
    return super.list(DynamoEventPublisher.table, {
      contains: `id:${instance.id}`
    }).then(result => {
      this.logger.debug(`Loaded ${result.length} aggregate(s) for ${instance.constructor.name} with id ${instance.id}.`);

      if (!result.length) {
        return null;
      }

      return result.map(item => item.event as Event).reduce((aggregate: T, currentEvent: Event) => {
        this.when(aggregate, currentEvent);
        aggregate.version = currentEvent.$version; // override to reflect event version and not when() incremented version

        return aggregate;
      }, instance);
    }
  )};
}
