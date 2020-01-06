import { Enrich } from '../../../event-store/events/enrich.interface';
import { User, UserProperties } from '../models/user';
import { UserUpdated } from './user-updated';

export class UserUpdatedEnricher implements Enrich<UserUpdated> {
  constructor(
    private readonly user: User) {
  }

  /**
   * @inheritdoc
   */
  async enrich(event: UserUpdated): Promise<UserUpdated> {
    event.enrichmentData.push({
      aggregateName: this.user.constructor.name,
      data: {
        id: this.user.id,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        roles: Array.from(this.user.roles.values())
      } as UserProperties
    });

    return event;
  }
}
