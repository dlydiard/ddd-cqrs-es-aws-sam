import { AggregateRoot } from '@node-ts/ddd';
import { AggregateRootProperties, Uuid } from '@node-ts/ddd-types';

import { UserDisableValidator } from '../../user/models/user.validator';
import { RoleCreated } from '../events/role-created';
import { RoleDisabled } from '../events/role-disabled';
import { RoleCreateValidator } from './role.validator';

export interface RoleProperties extends AggregateRootProperties {
  name: string;
  users: Set<Uuid> | Array<Uuid>;
  disabled: boolean;
}

export class Role extends AggregateRoot implements RoleProperties {
  name: string;
  users: Set<Uuid>;
  disabled: boolean;

  /**
   * Creation static method. Aggregates are never "newed" by consumers.
   * @param id
   * @param name
   */
  static create(id: Uuid, name: string): Role {
    const roleCreated = new RoleCreated(id, name);
    const role = new Role(id);
    const validator = Object.assign(new RoleCreateValidator(), roleCreated);

    validator.validate();
    role.when(roleCreated);
    return role
  }

  /**
   * Disable role
   * @param id
   */
  disable(id: Uuid): void {
    const roleDisabled = new RoleDisabled(id);
    const validator = Object.assign(new UserDisableValidator(), roleDisabled);

    validator.disabled = this.disabled;
    validator.validate();
    this.when(roleDisabled);
  }

  /**
   * When role is created.
   *
   * Update aggregate root when() event. Based on Event.$name.
   * Version # and newEvents[] are updated per when() call.
   * @param event
   */
  protected whenCreated(event: RoleCreated): void {
    this.name = event.name;
    this.users = new Set<Uuid>();
  }

  /**
   * When role is disabled.
   * Update aggregate root when event. Based on Event.$name.
   * @param event
   */
  protected whenDisabled(event: RoleDisabled): void {
    this.disabled = true
  }
}
