import { Uuid } from '@node-ts/ddd-types';
import { WINSTON_SYMBOLS } from '@node-ts/logger-winston';
import { inject, injectable } from 'inversify';
import { Logger } from 'winston';

import { DynamoRepository } from '../../../app/repository/dynamo.repository';
import { Projection } from '../projection';
import { ProjectionRepository } from './projection-repository.interface';

@injectable()
export class DynamoProjectionRepository<P extends Projection> extends DynamoRepository<P> implements ProjectionRepository<P> {
  constructor(
    @inject(WINSTON_SYMBOLS.WinstonConfiguration)
    private readonly projectionLogger: Logger) {
    super(projectionLogger);
  }

  /**
   * Get projection by id
   * @param table
   * @param id
   */
  async get(table: string, id: Uuid): Promise<P> {
    return super.get(table, 'id', id);
  }
}
