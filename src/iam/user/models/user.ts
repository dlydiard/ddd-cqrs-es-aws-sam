import { AggregateRoot } from '@node-ts/ddd';
import { AggregateRootProperties, Uuid } from '@node-ts/ddd-types';
import { UserRole } from 'aws-sdk/clients/workmail';

import { UserDisabled } from '../events/user-disabled';
import { UserRegistered } from '../events/user-registered';
import { UserRoleAdded } from '../events/user-role-added';
import { UserRoleRemoved } from '../events/user-role-removed';
import { UserUpdated } from '../events/user-updated';
import {
  UserDisableValidator,
  UserRegisterValidator,
  UserRoleAddValidator,
  UserRoleRemoveValidator,
  UserUpdateValidator,
} from './user.validator';

export interface UserProperties extends AggregateRootProperties {
  email: string;
  firstName: string;
  lastName: string;
  roles: Set<Uuid> | Array<Uuid>;
  disabled: boolean;
}

export class User extends AggregateRoot implements UserProperties {
  email: string;
  firstName: string;
  lastName: string;
  roles: Set<Uuid>;
  disabled: boolean;

  /**
   * Creation static method. Aggregates are never "newed" by consumers.
   * @param id
   * @param email
   */
  static register(id: Uuid, email: string): User {
    const userRegistered = new UserRegistered(id, email);
    const user = new User(id);
    const validator = Object.assign(new UserRegisterValidator(), userRegistered);

    validator.validate();
    user.when(userRegistered);
    return user
  }

  /**
   * Update user properties.
   * @param id
   * @param firstName
   * @param lastName
   */
  update(id: Uuid, firstName: string, lastName: string): void {
    const userUpdated = new UserUpdated(id, firstName, lastName);
    const validator = Object.assign(new UserUpdateValidator(), userUpdated);

    validator.disabled = this.disabled;
    validator.validate();
    this.when(userUpdated);
  }

  /**
   * Disable user
   * @param id
   */
  disable(id: Uuid): void {
    const userDisabled = new UserDisabled(id);
    const validator = Object.assign(new UserDisableValidator(), userDisabled);

    validator.disabled = this.disabled;
    validator.validate();
    this.when(userDisabled);
  }

  /**
   * Add role to user.
   * @param id
   * @param roleId
   */
  addRole(id: Uuid, roleId: Uuid): void {
    const userRoleAdded = new UserRoleAdded(id, roleId);
    const validator = Object.assign(new UserRoleAddValidator(), userRoleAdded);

    validator.roles = this.roles;
    validator.disabled = this.disabled;
    validator.validate();
    this.when(userRoleAdded);
  }

  /**
   * Remove role from user.
   * @param id
   * @param userId
   */
  removeRole(id: Uuid, roleId: Uuid): void {
    const userRoleRemoved = new UserRoleRemoved(id, roleId);
    const validator = Object.assign(new UserRoleRemoveValidator(), userRoleRemoved);

    validator.roles = this.roles;
    validator.validate();
    this.when(userRoleRemoved);
  }

  /**
   * When user is registered.
   *
   * Update aggregate root when() event. Based on Event.$name.
   * Version # and newEvents[] are updated per when() call.
   * @param event
   */
  protected whenRegistered(event: UserRegistered): void {
    this.email = event.email;
    this.roles = new Set<UserRole>();
  }

  /**
   * When user is updated.
   * Update aggregate root when event. Based on Event.$name.
   * @param event
   */
  protected whenUpdated(event: UserUpdated): void {
    this.firstName = event.firstName;
    this.lastName = event.lastName;
  }

  /**
   * When role is added.
   * Update aggregate root when event. Based on Event.$name.
   * @param event
   */
  protected whenRoleAdded(event: UserRoleAdded): void {
    this.roles.add(event.roleId);
  }

  /**
   * When role is removed.
   * Update aggregate root when event. Based on Event.$name.
   * @param event
   */
  protected whenRoleRemoved(event: UserRoleRemoved): void {
    this.roles.delete(event.roleId);
  }

  /**
   * When user is disabled.
   * Update aggregate root when event. Based on Event.$name.
   * @param event
   */
  protected whenDisabled(event: UserDisabled): void {
    this.disabled = true
  }
}
