import { Uuid } from '@node-ts/ddd-types';
import { inject, injectable } from 'inversify';

import { ApplicationError, ApplicationErrorNumber } from '../../../app/application-error';
import { DynamoSetValidationRepository } from '../../../app/repository/dynamo-set-validation.repository';
import { SetValidationRepository } from '../../../app/repository/set-validation-repository.interface';
import { Service } from '../../../app/service/service.interface';
import { DynamoEventPublisher } from '../../../event-store/publisher/dynamo-event-publisher';
import { EventPublisher } from '../../../event-store/publisher/event-publisher.interface';
import { Role } from '../../role/models/role';
import { RoleService } from '../../role/services/role.service';
import { AddUserRole } from '../commands/add-user-role.command';
import { DisableUser } from '../commands/disable-user.command';
import { RegisterUser } from '../commands/register-user.command';
import { RemoveUserRole } from '../commands/remove-user-role.command';
import { UpdateUser } from '../commands/update-user.command';
import { UserDisabled } from '../events/user-disabled';
import { UserEvents } from '../events/user-events';
import { UserRegistered } from '../events/user-registered';
import { UserRoleAdded } from '../events/user-role-added';
import { UserRoleAddedEnricher } from '../events/user-role-added.enricher';
import { UserRoleRemoved } from '../events/user-role-removed';
import { UserRoleRemovedEnricher } from '../events/user-role-removed.enricher';
import { UserUpdated } from '../events/user-updated';
import { UserUpdatedEnricher } from '../events/user-updated.enricher';
import { User } from '../models/user';

@injectable()
export class UserService {
  constructor (
    @inject(DynamoEventPublisher)
    private readonly eventPublisher: EventPublisher,

    @inject(DynamoSetValidationRepository)
    private readonly setValidator: SetValidationRepository,

    @inject(RoleService)
    private readonly roleService: Service<Role>
  ) {
  }

  /**
   * @inheritdoc
   */
  public async getAggregateRoot(id: Uuid): Promise<User> {
    const user = await this.eventPublisher.getAggregateRoot<User>(new User(id));

    if (!user) {
      throw new ApplicationError(`Aggregate ${User.name} with id ${id} not found.`, ApplicationErrorNumber.RecordNotFound);
    }

    return user;
  }

  /**
   * handle iam/user/register command.
   * @param param0
   */
  async register({ id, email }: RegisterUser): Promise<void> {
    const user = User.register(id, email);
    const constraint = this.setValidator.getContsraint(UserEvents.Registered, nameof<User>(u => u.email), user.email);

    await this.setValidator.insert(constraint).catch((e) => {
      throw new ApplicationError(`${user.email} is already registered.`, ApplicationErrorNumber.UniqueConstraintViolated);
    });

    return this.eventPublisher.publish(new UserRegistered(user.id, user.email, user.version));
  }

  /**
   * handle iam/user/updated command.
   * @param param0 UpdateUser
   */
  async update({ id, firstName, lastName }: UpdateUser): Promise<void> {
    const user = await this.getAggregateRoot(id);

    user.update(id, firstName, lastName);
    return this.eventPublisher.publish(await new UserUpdatedEnricher(user).enrich(new UserUpdated(user.id, user.firstName, user.lastName, user.version)));
  }

  /**
   * handle iam/user/addRole command.
   * @param param0 AddUserRole
   */
  async addRole({ id, roleId }: AddUserRole): Promise<void> {
    const user = await this.getAggregateRoot(id);

    // make sure role exists, then use data for event enrichment
    const role = await this.roleService.getAggregateRoot(roleId);

    user.addRole(id, roleId);
    return this.eventPublisher.publish(await new UserRoleAddedEnricher(user, role).enrich(new UserRoleAdded(user.id, roleId, user.version)));
  }

  /**
   * handle iam/user/removeRole command.
   * @param param0 RemoveUserRole
   */
  async removeRole({ id, roleId }: RemoveUserRole): Promise<void> {
    const user = await this.getAggregateRoot(id);

    // make sure role exists, then use data for event enrichment
    const role = await this.roleService.getAggregateRoot(roleId);

    user.removeRole(id, roleId);
    return this.eventPublisher.publish(await new UserRoleRemovedEnricher(user, role).enrich(new UserRoleRemoved(user.id, roleId, user.version)));
  }

  /**
   * handle iam/user/disabled command.
   * @param param0 DisableUser
   */
  async disable({ id }: DisableUser): Promise<void> {
    const user = await this.getAggregateRoot(id);

    user.disable(id);
    return this.eventPublisher.publish(new UserDisabled(user.id, user.version));
  }
}
