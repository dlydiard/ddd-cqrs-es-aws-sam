import { Uuid } from '@node-ts/ddd-types';
import { inject, injectable } from 'inversify';

import { ApplicationError, ApplicationErrorNumber } from '../../../app/application-error';
import { DynamoSetValidationRepository } from '../../../app/repository/dynamo-set-validation.repository';
import { SetValidationRepository } from '../../../app/repository/set-validation-repository.interface';
import { Service } from '../../../app/service/service.interface';
import { DynamoEventPublisher } from '../../../event-store/publisher/dynamo-event-publisher';
import { EventPublisher } from '../../../event-store/publisher/event-publisher.interface';
import { CreateRole } from '../commands/create-role.command';
import { DisableRole } from '../commands/disable-role.command';
import { RoleCreated } from '../events/role-created';
import { RoleDisabled } from '../events/role-disabled';
import { RoleEvents } from '../events/role-events';
import { Role } from '../models/role';

@injectable()
export class RoleService implements Service<Role> {
  constructor (
    @inject(DynamoEventPublisher)
    private readonly eventPublisher: EventPublisher,

    @inject(DynamoSetValidationRepository)
    private readonly setValidator: SetValidationRepository
  ) {
  }

  /**
   * @inheritdoc
   */
  async getAggregateRoot(id: Uuid): Promise<Role> {
    const role = await this.eventPublisher.getAggregateRoot<Role>(new Role(id));

    if (!role) {
      throw new ApplicationError(`Aggregate ${Role.name} with id ${id} not found.`, ApplicationErrorNumber.RecordNotFound);
    }

    return role;
  }

  /**
   * handle iam/role/created command.
   * @param param0
   */
  async create({ id, name }: CreateRole): Promise<void> {
    const role = Role.create(id, name);
    const constraint = this.setValidator.getContsraint(RoleEvents.Created, nameof<Role>(r => r.name), role.name);

    await this.setValidator.insert(constraint).catch((e) => {
      throw new ApplicationError(`${role.name} already exists.`, ApplicationErrorNumber.UniqueConstraintViolated);
    });

    return this.eventPublisher.publish(new RoleCreated(role.id, role.name, role.version));
  }

  /**
   * handle iam/role/disable command.
   * @param param0 AddUserRole
   */
  async disable({ id }: DisableRole): Promise<void> {
    const role = await this.getAggregateRoot(id);

    role.disable(id);
    return this.eventPublisher.publish(new RoleDisabled(role.id, role.version));
  }
}
