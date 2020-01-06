import { Handler, HandlesMessage } from '@node-ts/bus-core';
import { inject, injectable } from 'inversify';

import { UserService } from '../services/user.service';
import { AddUserRole } from './add-user-role.command';

@HandlesMessage(AddUserRole)
@injectable()
export class AddUserRoleHandler implements Handler<AddUserRole> {
  constructor (
    @inject(UserService)
    private readonly userService: UserService) {
  }

  async handle(message: AddUserRole): Promise<void> {
     return this.userService.addRole(message);
  }
}
