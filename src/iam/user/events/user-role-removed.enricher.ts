import { Enrich } from '../../../event-store/events/enrich.interface';
import { Role, RoleProperties } from '../../role/models/role';
import { User, UserProperties } from '../models/user';
import { UserRoleRemoved } from './user-role-removed';

export class UserRoleRemovedEnricher implements Enrich<UserRoleRemoved> {
  constructor(
    private readonly user: User,
    private readonly role: Role) {
  }

  /**
   * @inheritdoc
   */
  async enrich(event: UserRoleRemoved): Promise<UserRoleRemoved> {
    event.enrichmentData.push({
      aggregateName: this.user.constructor.name,
      data: {
        id: this.user.id,
      } as UserProperties
    });

    event.enrichmentData.push({
      aggregateName: this.role.constructor.name,
      data: {
        id: this.role.id,
      } as RoleProperties
    });

    return event;
  }
}
