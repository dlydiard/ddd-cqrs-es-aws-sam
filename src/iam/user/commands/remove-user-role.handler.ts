import { Handler, HandlesMessage } from '@node-ts/bus-core';
import { inject, injectable } from 'inversify';

import { UserService } from '../services/user.service';
import { RemoveUserRole } from './remove-user-role.command';

@HandlesMessage(RemoveUserRole)
@injectable()
export class RemoveUserRoleHandler implements Handler<RemoveUserRole> {
  constructor (
    @inject(UserService)
    private readonly userService: UserService) {
  }

  async handle(message: RemoveUserRole): Promise<void> {
     return this.userService.removeRole(message);
  }
}
