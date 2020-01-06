import { Handler, HandlesMessage } from '@node-ts/bus-core';
import { inject, injectable } from 'inversify';

import { UserService } from '../services/user.service';
import { UpdateUser } from './update-user.command';

@HandlesMessage(UpdateUser)
@injectable()
export class UpdateUserHandler implements Handler<UpdateUser> {
  constructor (
    @inject(UserService)
    private readonly userService: UserService) {
  }

  async handle(message: UpdateUser): Promise<void> {
     return this.userService.update(message);
  }
}
