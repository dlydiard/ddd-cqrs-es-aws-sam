import { Uuid } from '@node-ts/ddd-types';

import { EventEnrichmentData } from '../../../event-store/events/event';
import { Projection } from '../../../event-store/projections/projection';
import { UserRoleAdded } from '../../user/events/user-role-added';
import { UserRoleRemoved } from '../../user/events/user-role-removed';
import { UserUpdated } from '../../user/events/user-updated';
import { User, UserProperties } from '../../user/models/user';
import { RoleCreated } from '../events/role-created';
import { RoleDisabled } from '../events/role-disabled';

interface RoleUser {
  id: Uuid
  firstName: string;
  lastName: string;
  email: string;
};

export class RoleProjection extends Projection {
  name: string;
  disabled: boolean;
  users: Array<RoleUser> = [];

  applyRoleCreated(event: RoleCreated): void {
    this.id = event.id;
    this.name = event.name;
  }

  applyRoleDisabled(event: RoleDisabled): void {
    this.disabled = true;
  }

  applyUserRoleAdded(event: UserRoleAdded): void {
    const userEnricher = event.enrichmentData?.find(x => x.aggregateName === User.name) as EventEnrichmentData;
    const userData = userEnricher.data as UserProperties;

    // remove any dupes then push user data
    this.users = this.users.filter(u => u.id !== userData.id);
    this.users.push({
      id: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email
    });
  }

  applyUserUpdated(event: UserUpdated): void {
    const userEnricher = event.enrichmentData?.find(x => x.aggregateName === User.name) as EventEnrichmentData;
    const userData = userEnricher.data as UserProperties;
    const currentUserIndex = this.users.findIndex(u => u.id === userData.id);

    this.users[currentUserIndex] = {
      id: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email
    };
  }

  applyUserRoleRemoved(event: UserRoleRemoved): void {
    this.users = this.users.filter(u => u.id !== event.id);
  }
}
