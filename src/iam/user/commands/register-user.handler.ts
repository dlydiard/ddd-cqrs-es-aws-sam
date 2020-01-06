import { Handler, HandlesMessage } from '@node-ts/bus-core';
import { inject, injectable } from 'inversify';

import { UserService } from '../services/user.service';
import { RegisterUser } from './register-user.command';

@HandlesMessage(RegisterUser)
@injectable()
export class RegisterUserHandler implements Handler<RegisterUser> {
  constructor (
    @inject(UserService)
    private readonly userService: UserService) {
  }

  async handle(message: RegisterUser): Promise<void> {
     return this.userService.register(message);
  }
}
