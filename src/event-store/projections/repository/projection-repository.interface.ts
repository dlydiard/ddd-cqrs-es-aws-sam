import { Uuid } from '@node-ts/ddd-types';

import { Repository } from '../../../app/repository/repository.interface';
import { Projection } from '../projection';

export interface ProjectionRepository<T extends Projection> extends Repository<T> {
  /**
   * Get projection by id
   * @param table
   * @param id
   */
  get(table: string, id: Uuid): Promise<T>;
}
