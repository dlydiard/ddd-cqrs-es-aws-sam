import { Enrich } from '../../../event-store/events/enrich.interface';
import { Role, RoleProperties } from '../../role/models/role';
import { User, UserProperties } from '../models/user';
import { UserRoleAdded } from './user-role-added';

export class UserRoleAddedEnricher implements Enrich<UserRoleAdded> {
  constructor(
    private readonly user: User,
    private readonly role: Role) {
  }

  /**
   * @inheritdoc
   */
  async enrich(event: UserRoleAdded): Promise<UserRoleAdded> {
    event.enrichmentData.push({
      aggregateName: this.user.constructor.name,
      data: {
        id: this.user.id,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email
      } as UserProperties
    });

    event.enrichmentData.push({
      aggregateName: this.role.constructor.name,
      data: {
        id: this.role.id,
        name: this.role.name
      } as RoleProperties
    });

    return event;
  }
}
