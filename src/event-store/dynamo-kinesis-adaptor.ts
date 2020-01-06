// reflect-metadata polyfill should be imported once in the entire application because the Reflect object is meant to be a global singleton.
import 'reflect-metadata';

import { Context, DynamoDBStreamEvent } from 'aws-lambda';
import AWS from 'aws-sdk';

import { ApplicationContainer } from '../app/application-container';
import { EventItem } from './publisher/event-publisher.interface';

// cache container instance if we get the same lambda container
let _applicationContainer: ApplicationContainer;

export const handler = async (event: DynamoDBStreamEvent, context: Context): Promise<void> => {
  const kinesis = new AWS.Kinesis();

  if (!_applicationContainer) {
    _applicationContainer = ApplicationContainer.instance();
  }

  _applicationContainer.logger.debug('Dynamo Kinesis Adaptor Event: %o', event);

  // push each dynamo stream EventItem record to a Kinesis Stream Event record
  const records = event.Records.filter(record => record.eventName === 'INSERT' && record.eventSource === 'aws:dynamodb').map(record => {
    const eventItem: EventItem = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage) as EventItem;

    return {
      Data: JSON.stringify(eventItem.event),
      PartitionKey: record.dynamodb.Keys.id.S,
      SequenceNumberForOrdering: record.dynamodb.Keys.$version.N,
      StreamName: process.env.eventSourceStream
    };
  });

  // push each kinesis record in order
  for (const record of records)  {
    const result = await kinesis.putRecord(record).promise();
    _applicationContainer.logger.debug('Inserted Kinesis record: %o\n\rResult: %o', record, result);
  }
};
