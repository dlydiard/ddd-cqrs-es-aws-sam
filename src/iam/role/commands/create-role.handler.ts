import { Handler, HandlesMessage } from '@node-ts/bus-core';
import { inject, injectable } from 'inversify';

import { RoleService } from '../services/role.service';
import { CreateRole } from './create-role.command';

@HandlesMessage(CreateRole)
@injectable()
export class CreateRoleHandler implements Handler<CreateRole> {
  constructor (
    @inject(RoleService)
    private readonly roleService: RoleService) {
  }

  async handle(message: CreateRole): Promise<void> {
     return this.roleService.create(message);
  }
}
