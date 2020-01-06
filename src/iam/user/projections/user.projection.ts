import { Uuid } from '@node-ts/ddd-types';

import { EventEnrichmentData } from '../../../event-store/events/event';
import { Projection } from '../../../event-store/projections/projection';
import { Role, RoleProperties } from '../../role/models/role';
import { UserDisabled } from '../events/user-disabled';
import { UserRegistered } from '../events/user-registered';
import { UserRoleAdded } from '../events/user-role-added';
import { UserRoleRemoved } from '../events/user-role-removed';
import { UserUpdated } from '../events/user-updated';

interface UserRole {
  id: Uuid
  name: string;
};

export class UserProjection extends Projection {
  email: string;
  firstName: string;
  lastName: string;
  roles: Array<UserRole> = new Array<UserRole>();
  disabled: boolean;

  applyUserRegistered(event: UserRegistered): void {
    this.id = event.id;
    this.email = event.email;
  }

  applyUserUpdated(event: UserUpdated): void {
    this.firstName = event.firstName;
    this.lastName = event.lastName;
  }

  applyUserDisabled(event: UserDisabled): void {
    this.disabled = true;
  }

  applyUserRoleAdded(event: UserRoleAdded): void {
    const roleEnricher = event.enrichmentData?.find(x => x.aggregateName === Role.name) as EventEnrichmentData;
    const roleData = roleEnricher.data as RoleProperties;

    // remove any dupes then push role data
    this.roles = this.roles.filter(r => r.id !== roleData.id);
    this.roles.push({
      id: event.roleId,
      name: roleData. name
    });
  }

  applyUserRoleRemoved(event: UserRoleRemoved): void {
    this.roles = this.roles.filter(u => u.id !== event.id);
  }
}
