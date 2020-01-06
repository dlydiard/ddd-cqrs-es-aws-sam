import { Uuid } from '@node-ts/ddd-types';
import { WINSTON_SYMBOLS } from '@node-ts/logger-winston';
import { inject, injectable } from 'inversify';
import { Logger } from 'winston';

import { Event, EventEnrichmentData } from '../../../event-store/events/event';
import { EventHandler } from '../../../event-store/handler/event-handler.interface';
import { HandlesEvent } from '../../../event-store/handler/handles-event.decorator';
import { ProjectionEventHandler } from '../../../event-store/handler/projection-event.handler';
import { DynamoProjectionRepository } from '../../../event-store/projections/repository/dynamo-projection.repository';
import { ProjectionRepository } from '../../../event-store/projections/repository/projection-repository.interface';
import { UserRoleAdded } from '../../user/events/user-role-added';
import { UserRoleRemoved } from '../../user/events/user-role-removed';
import { UserUpdated } from '../../user/events/user-updated';
import { User, UserProperties } from '../../user/models/user';
import { Role, RoleProperties } from '../models/role';
import { RoleProjection } from '../projections/role.projection';
import { RoleCreated } from './role-created';
import { RoleDisabled } from './role-disabled';

@HandlesEvent(RoleCreated)
@HandlesEvent(RoleDisabled)
@HandlesEvent(UserRoleAdded)
@HandlesEvent(UserRoleRemoved)
@HandlesEvent(UserUpdated)
@injectable()
export class RoleHandler extends ProjectionEventHandler<RoleProjection> implements EventHandler {
  private static projectionTable = process.env.projectionRolesTable;

  constructor (
    @inject(DynamoProjectionRepository)
    private readonly repository: ProjectionRepository<RoleProjection>,

    @inject(WINSTON_SYMBOLS.WinstonConfiguration)
    private readonly logger: Logger
    ) {
    super(repository, RoleProjection, Role.name, RoleHandler.projectionTable, logger);
  }

  /**
   * @inheritdoc
   */
  async handleEnrichmentEvent(event: Event): Promise<any> {
    const userEnricher = event.enrichmentData?.find(x => x.aggregateName === User.name) as EventEnrichmentData;
    const userData = userEnricher?.data as UserProperties;

    // if enrichment data contains user roles, update user data for each role
    if (userData?.roles) {
      for (const roleId of userData.roles)  {
        await this.getAndApplyProjection(roleId, event);
      }

      return Promise.resolve();
    }

    // get role id from event or enrichment data
    const roleEnricher = event.enrichmentData?.find(x => x.aggregateName === Role.name) as EventEnrichmentData;
    const roleData = roleEnricher.data as RoleProperties;

    return this.getAndApplyProjection(roleData.id, event);
  }

  /**
   * Get role projection and apply event and save.
   * @param event
   * @param roleId
   * @returns Promise
   */
  async getAndApplyProjection(roleId: Uuid, event: Event): Promise<any> {
    const roleProjection = Object.assign(new RoleProjection(), await this.getProjectionById(roleId));

    roleProjection.apply(event);
    return this.repository.save(RoleHandler.projectionTable, roleProjection);
  }
}
