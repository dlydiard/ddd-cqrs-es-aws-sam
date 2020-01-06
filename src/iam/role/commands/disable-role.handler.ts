import { Handler, HandlesMessage } from '@node-ts/bus-core';
import { inject, injectable } from 'inversify';

import { RoleService } from '../services/role.service';
import { DisableRole } from './disable-role.command';

@HandlesMessage(DisableRole)
@injectable()
export class DisableUserRoleHandler implements Handler<DisableRole> {
  constructor (
    @inject(RoleService)
    private readonly roleService: RoleService) {
  }

  async handle(message: DisableRole): Promise<void> {
     return this.roleService.disable(message);
  }
}
