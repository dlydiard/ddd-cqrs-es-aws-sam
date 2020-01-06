import { WINSTON_SYMBOLS } from '@node-ts/logger-winston';
import { inject, injectable } from 'inversify';
import { Logger } from 'winston';

import { EventHandler } from '../../../event-store/handler/event-handler.interface';
import { HandlesEvent } from '../../../event-store/handler/handles-event.decorator';
import { ProjectionEventHandler } from '../../../event-store/handler/projection-event.handler';
import { DynamoProjectionRepository } from '../../../event-store/projections/repository/dynamo-projection.repository';
import { ProjectionRepository } from '../../../event-store/projections/repository/projection-repository.interface';
import { User } from '../models/user';
import { UserProjection } from '../projections/user.projection';
import { UserDisabled } from './user-disabled';
import { UserRegistered } from './user-registered';
import { UserRoleAdded } from './user-role-added';
import { UserRoleRemoved } from './user-role-removed';
import { UserUpdated } from './user-updated';

@HandlesEvent(UserRegistered)
@HandlesEvent(UserUpdated)
@HandlesEvent(UserRoleAdded)
@HandlesEvent(UserRoleRemoved)
@HandlesEvent(UserDisabled)
@injectable()
export class UserHandler extends ProjectionEventHandler<UserProjection> implements EventHandler {
  constructor (
    @inject(DynamoProjectionRepository)
    private readonly repository: ProjectionRepository<UserProjection>,

    @inject(WINSTON_SYMBOLS.WinstonConfiguration)
    private readonly logger: Logger
    ) {
    super(repository, UserProjection, User.name, process.env.projectionUsersTable, logger);
  }
}
