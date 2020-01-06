import { Uuid } from '@node-ts/ddd-types';
import { injectable, unmanaged } from 'inversify';
import { Logger } from 'winston';

import { ApplicationError, ApplicationErrorNumber } from '../../app/application-error';
import { Event } from '../events/event';
import { Projection } from '../projections/projection';
import { ProjectionRepository } from '../projections/repository/projection-repository.interface';
import { EventHandler } from './event-handler.interface';

@injectable()
export abstract class ProjectionEventHandler<P extends Projection> implements EventHandler {
  constructor (
    protected readonly projectionRepository: ProjectionRepository<Projection>,

    @unmanaged()
    protected readonly projection: new() => P,

    @unmanaged()
    protected readonly projectionForAggregateRootName: string,

    @unmanaged()
    protected readonly projectionTableName: string,

    protected readonly projectionLogger: Logger) {
  }

  /**
   * Get Projection by id.
   *
   * TODO: Race condition can happen where projection doesn't exist when dealing with event enrichment, since aggregates are managed within their own queues.
   * This scenario should be rare since the API consumer would have to issue updates without first doing reads.
   * Add https://github.com/mauricedb/polly-js to use wait/retry logic. Must also account for new record creation (skip fetching record).
   *
   * @param id
   * @throws ApplicationError if not found
   */
  public async getProjectionById(id: Uuid): Promise<Projection> {
    const currentProjection = await this.projectionRepository.get(this.projectionTableName, id);

    if (currentProjection === null) {
      throw new ApplicationError(`Projection with id ${id} could not be found in ${this.projectionTableName}.`, ApplicationErrorNumber.RecordNotFound);
    }

    return currentProjection;
  }

  /**
   * Save projection to projection repository.
   * @param projection
   */
  protected async save(projection: Projection): Promise<any> {
    return this.projectionRepository.save(this.projectionTableName, projection);
  }

  /**
   * Get name of aggregate root for the event.
   * @param event
   * @returns event: org/iam/user/registered => User
   */
  protected getAggregateRootForEvent(event: Event): string {
    const namespace = event.$name;
    const nameParts = namespace.split('/');
    const aggregateRoot = nameParts[nameParts.length - 2];

    return `${aggregateRoot[0].toUpperCase()}${aggregateRoot.slice(1)}`;
  }

  /**
   * @inheritdoc
   */
  async handle(event: Event): Promise<any> {
    const currentAggregateName = this.getAggregateRootForEvent(event);

    // event is for the current aggregate projection
    if (currentAggregateName === this.projectionForAggregateRootName) {
      return this.populateAndSave(event);
    }

    // event is for a different aggregate, so call enrichment process
    return this.handleEnrichmentEvent(event);
  }

  /**
   * Populate and apply event to projection and save.
   * @param event
   * @returns Promise
   */
  protected async populateAndSave(event: Event): Promise<any> {
    let projection = new this.projection();

    // fetch original projection
    try {
      Object.assign(projection, await this.getProjectionById(event.id));
    } catch (error) {
      // if record not found, ignore error (new record).
      if (!(error instanceof ApplicationError) || error.errorNumber !== ApplicationErrorNumber.RecordNotFound) {
        throw error;
      }
    }

    // apply event to current projection
    projection.apply(event);
    return this.save(projection);
  }

  /**
   * Handle cross aggregate enrichment event for a projection.
   * @param event
   * @returns Promise
   */
  async handleEnrichmentEvent(event: Event): Promise<any> {
    throw new ApplicationError(`Got event ${event.$name}, but handleEnrichmentEvent() is not implemented for ProjectionHandler ${this.projection.name}.`);
  }
}
