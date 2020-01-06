// reflect-metadata polyfill should be imported once in the entire application because the Reflect object is meant to be a global singleton.
import 'reflect-metadata';

import { Context, KinesisStreamEvent } from 'aws-lambda';
import AWS from 'aws-sdk';
import uuid from 'uuid';

import { ApplicationContainer } from '../../app/application-container';
import { Event } from '../events/event';

// cache container instance if we get the same lambda container
let _applicationContainer: ApplicationContainer;
let _queueEndpointCache: Map<string, string>;

/**
 * Capitalize a string.
 * @param s string to capitalize
 */
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Convert event name to queue name.
 * e.g. org/iam/user/registered => IamUserQueue
 * @param event
 */
function getQueueNameFromEvent(event: Event) {
  const tokens = event.$name.split('/');
  const domain = tokens[tokens.length - 2];
  const boundedContext = tokens[tokens.length - 3];

  return `${capitalize(boundedContext)}${capitalize(domain)}Queue`;
}

/**
 * Build SQS endpoint cache keyed by SQS queue name e.g. 'IamUserQueue'.
 * example endpoint: https://sqs.us-west-2.amazonaws.com/1234567890/stack-name-IamUserQueue-3QSK4XVJLBU6A.fifo
 * @param sqs
 */
async function buildEndpointCache(sqs: AWS.SQS): Promise<Map<string, string>> {
  const endpointCache = new Map<string, string>();

  await sqs.listQueues().promise().then(result => {
    result.QueueUrls.forEach(url => {
      const queueName = url.split('-');
      endpointCache.set(queueName[queueName.length - 2], url);
    });
  });

  return endpointCache;
}

/**
 * Broker events on Kinesis Stream to SQS queues per aggregate type.
 * SQS queue names are convention based @see buildEndpointCache().
 * @param event
 * @param context
 */
export const handler = async (event: KinesisStreamEvent, context: Context): Promise<void> => {
  const sqs = new AWS.SQS();

  if (!_applicationContainer) {
    _applicationContainer = ApplicationContainer.instance();
  }

  if (!_queueEndpointCache) {
    _queueEndpointCache = await buildEndpointCache(sqs);
  }

  _applicationContainer.logger.debug('Event Source Broker: %o', event);

  const batches = new Map<string, AWS.SQS.Types.SendMessageBatchRequest>();
  const messageGroupId = uuid();

  // fan out Kinesis stream Event by event name convention to a SQS FIFO event handler
  event.Records.forEach(record => {
    const currentEvent: Event = JSON.parse(Buffer.from(record.kinesis.data, 'base64').toString('utf8'));
    const endpoint = _queueEndpointCache.get(getQueueNameFromEvent(currentEvent));
    const id = uuid();

    if (!batches.get(endpoint)) {
      batches.set(endpoint, { Entries: [], QueueUrl: endpoint });
    }

    batches.get(endpoint).Entries.push({ Id: id, MessageBody: JSON.stringify(currentEvent), MessageDeduplicationId: id, MessageGroupId: messageGroupId });
  });

  for (const batch of Array.from(batches.values())) {
    await sqs.sendMessageBatch(batch).promise();
    _applicationContainer.logger.debug('Sent SQS Batch: %o', batch);
  }
};
