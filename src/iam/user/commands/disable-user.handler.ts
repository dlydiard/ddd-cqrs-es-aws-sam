import { Handler, HandlesMessage } from '@node-ts/bus-core';
import { inject, injectable } from 'inversify';

import { UserService } from '../services/user.service';
import { DisableUser } from './disable-user.command';

@HandlesMessage(DisableUser)
@injectable()
export class DisableUserHandler implements Handler<DisableUser> {
  constructor (
    @inject(UserService)
    private readonly userService: UserService) {
  }

  async handle(message: DisableUser): Promise<void> {
     return this.userService.disable(message);
  }
}
