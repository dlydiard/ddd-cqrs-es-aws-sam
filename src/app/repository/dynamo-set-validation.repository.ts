import { WINSTON_SYMBOLS } from '@node-ts/logger-winston';
import { inject, injectable } from 'inversify';
import { Logger } from 'winston';

import { DynamoRepository } from './dynamo.repository';
import { SetValidationRepository } from './set-validation-repository.interface';


@injectable()
export class DynamoSetValidationRepository extends DynamoRepository<any> implements SetValidationRepository {
  private static readonly _table = process.env.setValidationsTable;
  private static readonly _keyName = 'constraint';

  constructor(
    @inject(WINSTON_SYMBOLS.WinstonConfiguration)
    private readonly setValidationLogger: Logger) {
    super(setValidationLogger);
  }

  /**
   * @inheritdoc
   */
  getContsraint(eventName: string, fieldName: string, fieldValue: string, isBoundedContextScope?: boolean): string {
    const lastindex = eventName.lastIndexOf('/');

    if (!lastindex || !fieldValue || !fieldValue) {
      return null;
    }

    return isBoundedContextScope
      ? `${eventName.substring(0, eventName.lastIndexOf('/', lastindex - 1))}#${fieldName}:${fieldValue}`
      : `${eventName.substring(0, lastindex)}#${fieldName}:${fieldValue}`;
  }

  /**
   * @inheritdoc
   */
  isExists(constraint: string): Promise<boolean> {
    return super.get(DynamoSetValidationRepository._table, DynamoSetValidationRepository._keyName, constraint);
  }

  /**
   * @inheritdoc
   */
  insert(constraint: string): Promise<any> {
    return super.save(DynamoSetValidationRepository._table, { constraint }, {
      ConditionExpression: 'attribute_not_exists(#id)',
      ExpressionAttributeNames: { '#id': DynamoSetValidationRepository._keyName }
    });
  }

  /**
   * @inheritdoc
   */
  remove(constraint: string): Promise<boolean> {
    return super.delete(DynamoSetValidationRepository._table, DynamoSetValidationRepository._keyName, constraint);
  }
}
