import { WINSTON_SYMBOLS } from '@node-ts/logger-winston';
import AWS from 'aws-sdk';
import { inject, injectable } from 'inversify';
import { Logger } from 'winston';

import { Repository, RepositoryFilter } from './repository.interface';


@injectable()
export class DynamoRepository<T> implements Repository<T> {
  private static readonly _defaultLimit = 100;
  private _client: AWS.DynamoDB;

  constructor(
    @inject(WINSTON_SYMBOLS.WinstonConfiguration)
    private readonly repositoryLogger: Logger) {
    this._client = new AWS.DynamoDB();
  }

  /**
   * @inheritdoc
   */
  async get(table: string, keyName: string, keyValue: string): Promise<T> {
    const params = {
      TableName: table,
      KeyConditionExpression: '#id = :id',
      ExpressionAttributeNames: { '#id': keyName },
      ExpressionAttributeValues: { ':id': { S: keyValue } },
      Limit: 1
    };

    return this._client.query(params).promise().then(result => {
      if (result.$response.error) {
        this.repositoryLogger.error(`Error in call to DynamoDB.query() using params %o: %o`, params, result.$response.error);
      }

      return (result.$response.error || result.Count !== 1 ? null : AWS.DynamoDB.Converter.unmarshall(result.Items[0])) as T;
    });
  }

  /**
   * @inheritdoc
   */
  async list(table: string, filter?: RepositoryFilter): Promise<Array<T>> {
    // for simplicity using scan() @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-query-scan.html
    const params: AWS.DynamoDB.ScanInput = {
      TableName: table,
      Limit: filter?.limit || DynamoRepository._defaultLimit
    };

    if (filter?.contains) {
      const attributePair = filter.contains.split(':');

      params.FilterExpression = 'contains(#attribute, :value)';
      params.ExpressionAttributeNames = { '#attribute': attributePair[0] };
      params.ExpressionAttributeValues = { ':value': { S: attributePair[1] } }
    }

    return this._client.scan(params).promise().then(result => {
      if (result.$response.error) {
        this.repositoryLogger.error(`Error in call to DynamoDB.scan() using params %o: %o`, params, result.$response.error);
      }

      return (result.$response.error ? [] : (result.Items).map(item => AWS.DynamoDB.Converter.unmarshall(item) as T)) as Array<T>;
    });
  }

  /**
   * @inheritdoc
   */
  async save(table: string, model: T, optionalParams?: any): Promise<any> {
    const params = Object.assign({
      TableName: table,
      Item: AWS.DynamoDB.Converter.marshall(model)
    }, optionalParams);

    return this._client.putItem(params).promise().then(result => {
      if (result.$response.error) {
        this.repositoryLogger.error(`Error in call to DynamoDB.putItem() using params %o: %o`, params, result.$response.error);
      }

      return result;
    });
  }

  /**
   * @inheritdoc
   */
  async delete(table: string, keyName: string, keyValue: string, optionalParams?: any): Promise<boolean> {
    const params = Object.assign({
      TableName: table,
      Key: { [keyName]: { S: keyValue } }
    }, optionalParams);

    return this._client.deleteItem().promise().then(result => {
      if (result.$response.error) {
        this.repositoryLogger.error(`Error in call to DynamoDB.deleteItem() using params %o: %o`, params, result.$response.error);
      }

      return !result.$response.error;
    });
  }
}
