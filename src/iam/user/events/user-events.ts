import { User } from '../models/user';

export class UserEvents {
  static readonly AggregateRoot = User?.name?.toLowerCase() || 'user';

  static readonly Registered = `org/iam/${UserEvents.AggregateRoot}/registered`;
  static readonly Updated = `org/iam/${UserEvents.AggregateRoot}/updated`;
  static readonly Disabled = `org/iam/${UserEvents.AggregateRoot}/disabled`;
  static readonly RoleAdded = `org/iam/${UserEvents.AggregateRoot}/roleAdded`;
  static readonly RoleRemoved = `org/iam/${UserEvents.AggregateRoot}/roleRemoved`;
}
