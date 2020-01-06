import { Handler } from '@node-ts/bus-core';
import { LoggerModule } from '@node-ts/logger-core';
import { WINSTON_SYMBOLS, WinstonModule } from '@node-ts/logger-winston';
import { Container } from 'inversify';
import { createLogger, format, Logger, transports } from 'winston';

import { EventHandler } from '../event-store/handler/event-handler.interface';
import { DynamoProjectionRepository } from '../event-store/projections/repository/dynamo-projection.repository';
import { ProjectionRepository } from '../event-store/projections/repository/projection-repository.interface';
import { DynamoEventPublisher } from '../event-store/publisher/dynamo-event-publisher';
import { EventPublisher } from '../event-store/publisher/event-publisher.interface';
import { CreateRole } from '../iam/role/commands/create-role.command';
import { CreateRoleHandler } from '../iam/role/commands/create-role.handler';
import { DisableRole } from '../iam/role/commands/disable-role.command';
import { DisableUserRoleHandler } from '../iam/role/commands/disable-role.handler';
import { RoleHandler } from '../iam/role/events/role.handler';
import { Role } from '../iam/role/models/role';
import { RoleService } from '../iam/role/services/role.service';
import { AddUserRole } from '../iam/user/commands/add-user-role.command';
import { AddUserRoleHandler } from '../iam/user/commands/add-user-role.handler';
import { DisableUser } from '../iam/user/commands/disable-user.command';
import { DisableUserHandler } from '../iam/user/commands/disable-user.handler';
import { RegisterUser } from '../iam/user/commands/register-user.command';
import { RegisterUserHandler } from '../iam/user/commands/register-user.handler';
import { RemoveUserRole } from '../iam/user/commands/remove-user-role.command';
import { RemoveUserRoleHandler } from '../iam/user/commands/remove-user-role.handler';
import { UpdateUser } from '../iam/user/commands/update-user.command';
import { UpdateUserHandler } from '../iam/user/commands/update-user.handler';
import { UserHandler } from '../iam/user/events/user.handler';
import { User } from '../iam/user/models/user';
import { UserService } from '../iam/user/services/user.service';
import { DynamoSetValidationRepository } from './repository/dynamo-set-validation.repository';
import { DynamoRepository } from './repository/dynamo.repository';
import { Repository } from './repository/repository.interface';
import { SetValidationRepository } from './repository/set-validation-repository.interface';
import { Service } from './service/service.interface';

export class ApplicationContainer extends Container {
  private static _instance: ApplicationContainer;
  private _loggerInstance: Logger;

  /**
   * Initialize and bind IoC components.
   */
  private constructor() {
    super();

    // bind logger
    this.load(new LoggerModule(), new WinstonModule());
    this._loggerInstance = this.createLogger();
    this.rebind<Logger>(WINSTON_SYMBOLS.WinstonConfiguration).toConstantValue(this._loggerInstance);

    // bind command handlers
    this.bind<Handler<RegisterUser>>(RegisterUserHandler).to(RegisterUserHandler);
    this.bind<Handler<UpdateUser>>(UpdateUserHandler).to(UpdateUserHandler);
    this.bind<Handler<AddUserRole>>(AddUserRoleHandler).to(AddUserRoleHandler);
    this.bind<Handler<RemoveUserRole>>(RemoveUserRoleHandler).to(RemoveUserRoleHandler);
    this.bind<Handler<DisableUser>>(DisableUserHandler).to(DisableUserHandler);

    this.bind<Handler<CreateRole>>(CreateRoleHandler).to(CreateRoleHandler);
    this.bind<Handler<DisableRole>>(DisableUserRoleHandler).to(DisableUserRoleHandler);

    // bind event projection handlers
    this.bind<EventHandler>(UserHandler.name).to(UserHandler);
    this.bind<EventHandler>(RoleHandler.name).to(RoleHandler);

    // bind services
    this.bind<EventPublisher>(DynamoEventPublisher).to(DynamoEventPublisher);
    this.bind<Service<User>>(UserService).to(UserService);
    this.bind<Service<Role>>(RoleService).to(RoleService);

    // bind repositories
    this.bind<Repository<any>>(DynamoRepository).to(DynamoRepository);
    this.bind<SetValidationRepository>(DynamoSetValidationRepository).to(DynamoSetValidationRepository);
    this.bind<ProjectionRepository<any>>(DynamoProjectionRepository).to(DynamoProjectionRepository);
  }

  /**
   * Get application container singleton instance.
   * @returns ApplicationContainer instance
   */
  static instance(): ApplicationContainer {
    if (!ApplicationContainer._instance) {
      ApplicationContainer._instance = new ApplicationContainer();
    }

    return ApplicationContainer._instance;
  }

  /**
   * Get logger
   * @returns Logger
   */
  get logger(): Logger {
    return this._loggerInstance;
  }

  /**
   * Create logger
   * @returns Logger
   */
  private createLogger(): Logger {
    return createLogger({
      level: process.env.logLevel || 'debug',
      format: format.combine(
        format.prettyPrint(),
        format.splat(),
        format.simple(),
        format.timestamp(),
        format.printf(info => {
          if (info.message.constructor === Object) {
            info.message = JSON.stringify(info.message, null, 2)
          }

          return `${info.timestamp} ${info.level}: ${info.message}`
        }
      )),
      transports: [new transports.Console()]
    });
  }
}
