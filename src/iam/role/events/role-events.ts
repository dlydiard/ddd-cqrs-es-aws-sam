import { Role } from '../models/role';

export class RoleEvents {
  static readonly AggregateRoot = Role?.name?.toLowerCase() || 'role';

  static readonly Created = `org/iam/${RoleEvents.AggregateRoot}/created`;
  static readonly Disabled = `org/iam/${RoleEvents.AggregateRoot}/disabled`;
}
