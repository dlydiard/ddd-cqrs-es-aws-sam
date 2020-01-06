# ddd-cqrs-es-aws-sam
Comprehensive [Domain Driven Design](https://github.com/heynickc/awesome-ddd), [CQRS](https://martinfowler.com/bliki/CQRS.html), and [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html) example utilizing [AWS SAM](https://aws.amazon.com/serverless/sam/).

## Features
* Cloud native microservices using [serverless](https://aws.amazon.com/serverless/) architecture
* [AWS CodeStar](https://aws.amazon.com/codestar/) compatible for CI/CD
* Typescript [building and debugging](https://github.com/SnappyTutorials/aws-sam-webpack-plugin#readme) of Lambda functions
* Domain Driven Design using [node-ts/ddd](https://github.com/node-ts/ddd)
* Decoupled architecture
* [Set Validation](https://stackoverflow.com/questions/31386244/cqrs-event-sourcing-check-username-is-unique-or-not-from-eventstore-while-sendin/56513765#56513765) (as an alternative to [corrective commands](https://foreverframe.net/how-to-guarantee-username-uniqueness-with-cqrses/))
* Command [Concurrency](https://theburningmonk.com/2019/08/a-simple-event-sourcing-example-with-snapshots-using-lambda-and-dynamodb/)
* Cross-aggregate projection support using [Event Enrichment](https://seabites.wordpress.com/2013/06/09/event-enrichment/)
* [Fan-out](https://freecontent.manning.com/patterns-for-solving-problems-in-serverless-architectures/) event processing (queue per aggregate root type)

## Installation
* Clone this repo then follow this [guide](https://docs.aws.amazon.com/toolkit-for-vscode/latest/userguide/create-sam.html) to install SAM CLI, AWS Toolkit, and VS Code
* Install [Docker](https://docs.docker.com/docker-for-mac/install/)
* Install [Postman](https://www.getpostman.com/) and import this [endpoint collection](https://github.com/dlydiard/ddd-cqrs-es-aws-sam/blob/master/ddd-cqrs-es-sam.postman_collection.json)
* Run `npm install` in the project root folder
* Create a `.env` file in the project root

Example `.env` file:
```
environment=development
logLevel=debug
stage=dev
eventLogTable=EventLog
eventStream=event-source-stream
setValidationsTable=set-validations
projectionUsersTable=projection-user
projectionRolesTable=projection-roles
```

## Build
```sh
npm run build:dev
```

## Test
```sh
npm run test
```

## Run and Debug
Use `npm run start` to start a local API Gateway server. This will only invoke Lambda functions tied to API Gateway events.
To run and debug Lambda functions directly use the `sam local invoke` command then use the `Debug and Run` feature in VS Code.
Example:
```sh
sam local invoke DynamoKinesisAdaptor -e ./test/lambda/DynamoKinesisAdaptor.json --debug-port 5858 --parameter-overrides $(cat .env | tr '\r\n' ' ')
```


## Deploy
```sh
npm run package
npm run deploy
```
**Notes**:
* In order for Lambda functions to talk to various AWS services while running locally, you must deploy this application so those services exist.
Once AWS SAM and [localstack](https://github.com/localstack/localstack) are [compatible](https://github.com/localstack/localstack/issues/1783), an abstraction layer for the AWS SDK needs to be created to communicate with local services ([issue #7](https://github.com/dlydiard/ddd-cqrs-es-aws-sam/issues/7)) and this step can be skipped.
* This project currently **does not** include a CodeStar CloudFormation template ([issue #15](https://github.com/dlydiard/ddd-cqrs-es-aws-sam/issues/15)).
* Using an AWS sandbox account is highly recommended.


## Cloud Architecture
![](https://github.com/dlydiard/ddd-cqrs-es-aws-sam/raw/master/ddd-cqrs-es-architecture.png "ddd cqrs es architecture")
#### DynamoDB Event Log (Insert Only)
Events are first logged to DynamoDB with a range key (aggregate root id + version), this solves command concurrency with optimistic locking. Also, DynamoDB allows the application to quickly query and build aggregate root objects. Aggregate snapshots ([issue #3](https://github.com/dlydiard/ddd-cqrs-es-aws-sam/issues/3)) can be used to prevent loading the full history of an aggregate's events.

#### DynamoDB Stream
DynamoDB streams all changes to a stream with 24 hour retention and limited read concurrency. A DynamoDB / Kinesis Apaptor then pumps all events to a Kinesis Stream, which is the [recommended way to read DynamoDB Streams](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.KCLAdapter.html). Event order is guaranteed using Kinesis [Sequences](https://docs.aws.amazon.com/streams/latest/dev/key-concepts.html).

#### Kinesis Stream
Kinesis Streams enable high throughput, FireHose backups to S3 / Data Lake ([issue #4](https://github.com/dlydiard/ddd-cqrs-es-aws-sam/issues/4)), and Enhanced fan-out (2MB/s read per shard). Each Kinesis shard is polled (once every 200ms) by a Lambda Event Broker which fans-out events to a SQS FIFO Queue. Event fan-out enables concurrent processing of aggregates per aggregate type, which increases write throughput of aggregates. If even more throughput is needed, events can be fanned-out even further by creating a queue for each aggregate root id.

#### SQS FIFO Queues
Since SQS FIFO Queues [guarantee order](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues.html), order is guaranteed per aggregate root type. However, this can cause race conditions ([issue #2](https://github.com/dlydiard/ddd-cqrs-es-aws-sam/issues/2)) when creating cross-aggregate projections since processing can happen out of order. For example, if an User was added to a Role but the Role Queue has not created the Role projection record yet. In this case, the User Queue Event handler must wait for the Role projection record to appear (a matter of milliseconds in most cases), to build the cross-aggregate projection.

## Software Architecture
#### IoC
All classes marked `injectable()` must be registered in [application-container.ts](https://github.com/dlydiard/ddd-cqrs-es-aws-sam/blob/master/src/app/application-container.ts). This includes services, command handlers, event handlers, loggers, and repositories.

See [inversify](https://github.com/inversify/InversifyJS) for more documentation.

#### Domain Driven Design (DDD)
To keep things simple and understandable, this project uses Identity and Access Management (IAM) as an example [Bounded Context](https://martinfowler.com/bliki/BoundedContext.html). The [Aggregate Roots](https://martinfowler.com/bliki/DDD_Aggregate.html) for the IAM Bounded Context are [User](https://github.com/dlydiard/ddd-cqrs-es-aws-sam/blob/master/src/iam/user/models/user.ts) and [Role](https://github.com/dlydiard/ddd-cqrs-es-aws-sam/blob/master/src/iam/role/models/role.ts).

See [node-ts/ddd](https://github.com/node-ts/ddd) and [node-ts/bus](https://github.com/node-ts/bus) for more documentation.
**Note:** node-ts/bus is only used for its Command and Handler related Interfaces, since the Bus functionality isn't compatible with serverless architectures.

#### Validation
Controller DTO's use basic non-domain specific validation, and Aggregate Roots actions are validated with domain specific logic.
Since Domain entities should [always be valid entities](https://docs.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations), an ['Always Valid' approach](http://www.kamilgrzybek.com/design/domain-model-validation/) is used. This means a [ValidationError](https://github.com/typestack/class-validator/blob/master/src/validation/ValidationError.ts) is thrown when validation fails.

**Example Domain Validation:**
```typescript
// user.ts
class UpdateValidator extends DomainValidator {
  @Length(1, 50)
  @IsAlpha()
  name!: string;
};

class User extends AggregateRoot {
  update(id: Uuid, name: string): void {
    const userUpdated = new UserUpdated(id, name);
    const validator = Object.assign(new UpdateValidator(), userUpdated);

    validator.validate();
    this.when(userUpdated);
  }
}
```
Although `DomainValidator.validate()` can be overridden if custom validation is needed, it is preferred to write custom class-validator validators.

See [class-validator](https://github.com/typestack/class-validator) for more documentation.

#### Set Validation
Since an Aggregate Root can only know about itself, validations such as unique usernames or unique emails cannot occur within the aggregate. This poses a problem in a CQRS/Event Sourced system. However, there are a few solutions ([#1](https://foreverframe.net/how-to-guarantee-username-uniqueness-with-cqrses/), [#2](https://stackoverflow.com/questions/31386244/cqrs-event-sourcing-check-username-is-unique-or-not-from-eventstore-while-sendin)) to this. The purest solution is to use Sagas with corrective commands when unique constraints are violated while creating projections. When using Sagas you do not lose command write throughput at the cost of eventually consistent validation.

Some determining factors may include how uniqueness effects your Domain within different Bounded Contexts. Is it ok a duplicate email exists for a few seconds? How often will these processes occur? Is uniqueness an invalid concept under a different Bounded Context?

In general, scenarios with uniqueness requirements don't happen that often but can be critical that the requirement is not violated. For this reason a [Set Validation](https://stackoverflow.com/questions/31386244/cqrs-event-sourcing-check-username-is-unique-or-not-from-eventstore-while-sendin/56513765#56513765) implementation is used. Set Validation does not belong in Aggregate Roots, but can be executed in service methods.

**Set Validation Example:**
```typescript
// user.service.ts
@injectable()
class UserService
  async register({ id, email }: RegisterUser): Promise<void> {
    const user = User.register(id, email);
    const constraint = this.setValidator.getContsraint(UserEvents.Registered, nameof<User>(u => u.email), user.email);

    await this.setValidator.insert(constraint).catch((e) => {
      throw new ApplicationError(`${user.email} is already registered.`, ApplicationErrorNumber.UniqueConstraintViolated);
    });

    return this.eventPublisher.publish(new UserRegistered(user.id, user.email, user.version));
  }
}
```

#### Commands and Handlers
Command handlers implement the `Handler` interface and must be `injectable()`. When a command is dispatched, the handler registered to handle that command is executed by the controller.

**Example handler:**
```typescript
/// update-user.command.ts
UpdateUser extends Command {
  $name = 'org/iam/user/update';
  ...
}
```
```typescript
/// update-user.handler.ts
@HandlesMessage(UpdateUser)
@injectable()
class UpdateUserHandler implements Handler<UpdateUser> {
  async handle(message: UpdateUser): Promise<void> {
     return this.userService.update(message);
  }
}
```

```typescript
/// user-controller.ts (lambda)
const putHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  ...
  await _container.get<UpdateUserHandler>(UpdateUserHandler).handle(new UpdateUser(userPutDto.id, userPutDto.name));
};
```

#### Events
[Events](https://github.com/dlydiard/ddd-cqrs-es-aws-sam/blob/master/src/event-store/events/event.ts) are published and handled with the following workflow:
1. Events are published by the [EventPublisher](https://github.com/dlydiard/ddd-cqrs-es-aws-sam/blob/master/src/event-store/publisher/event-publisher.interface.ts) into a DynamoDB Event Log.
2. The Event Log DynamoDB Stream is then streamed to a Kinesis Stream via the [DynamoDB Kinesis Stream Adaptor](https://github.com/dlydiard/ddd-cqrs-es-aws-sam/blob/master/src/event-store/dynamo-kinesis-adaptor.ts).
3. Kinesis Stream events are then brokered (fan-out) to SQS FIFO Queues via the [Event Source Broker](https://github.com/dlydiard/ddd-cqrs-es-aws-sam/blob/master/src/event-store/brokers/event-source-broker.ts) per Aggregate Root type.
SQS Queues are targeted by naming convention based on the Event name.
Example: `org/iam/user/registered => IamUserQueue => https://sqs.us-west-2.amazonaws.com/1234567890/stack-name-IamUserQueue-3QSK4XVJLBU6A.fifo`
4. Events on each SQS Queue are then brokered via the [Queue Broker](https://github.com/dlydiard/ddd-cqrs-es-aws-sam/blob/master/src/event-store/brokers/queue-broker.ts) to all registered Event handlers for that Event type.

**Example of publishing and handling events:**
```typescript
// user-updated.ts
class UserUpdated extends Event {
  $name: 'org/iam/user/updated'
  ...
}
```

```typescript
// user.service.ts
@injectable()
class UserService
  async update({ id, name }: UpdateUser): Promise<void> {
    ...
    return this.eventPublisher.publish(new UserUpdated(user.id, user.name, user.version));
  }
}
```

```typescript
// user.handler.ts
@HandlesEvent(UserUpdated)
@HandlesEvent(...)
@injectable()
class UserHandler implements EventHandler {
  ...
  async handle(event: Event): Promise<any> {
    ...
    projection.apply(event);
    return this.save(projection);
  }
}
```

#### Event Enrichment
[Event enrichment](https://seabites.wordpress.com/2013/06/09/event-enrichment/) adds extra metadata to the Event pertaining to the data that is being mentioned. This information can be used by Event Handlers to create cross-aggregate projections and helps mitigate race conditions and cross-projection dependencies. Event Enrichment can be considered "cheating" if the domain is not modeled correctly.

When the [ProjectionEventHandler](https://github.com/dlydiard/ddd-cqrs-es-aws-sam/blob/master/src/event-store/handler/projection-event.handler.ts) detects a cross-aggregate Event, it will automatically look for and process the Event Enrichment data.

**Event Enricher Example:**
In this example we have a projection with `User.Roles` and a projection with `Role.Users`. When a User is updated the User Projection along with each Role that contains the user needs to be updated. The `RoleHandler` will process the array of User Role Id's and update the user names for each Role projection.

```typescript
// user-updated.enricher.ts
class UserUpdatedEnricher implements Enrich<UserUpdated> {
  async enrich(event: UserUpdated): Promise<UserUpdated> {
    event.enrichmentData.push({
      aggregateName: this.user.constructor.name,
      data: { roles: this.user.roles } as UserProperties
    });

    return event;
  }
}
```

```typescript
// user.service.ts
@injectable()
class UserService
  async update({ id, name }: UpdateUser): Promise<void> {
    const user = await this.getAggregateRoot(id);

    user.update(id, name);
    const enrichedEvent = await new UserUpdatedEnricher(user).enrich(new UserUpdated(user.id, user.name, user.version));
    return this.eventPublisher.publish(enrichedEvent);
  }
}
```

```typescript
@HandlesEvent(RoleCreated)
@HandlesEvent(RoleDisabled)
@HandlesEvent(UserUpdated)
@injectable()
export class RoleHandler extends ProjectionEventHandler<RoleProjection> implements EventHandler {
  ...
}
```

#### Projections
Projections are autonomous and responsible for their own data, they do not belong to any Bounded Contexts, and are the product of domain events.

**Projection Example:**
```typescript
// user.projection.ts
class UserProjection extends Projection {
  name: string

  // If the event is org/iam/user/updated => applyUserUpdated(event) will be called.
  applyUserUpdated(event: UserUpdated): void {
    this.name = event.name;
  }

  ...
}
```

## Questions, Bugs, and Concerns
Please refer to the [issues section](https://github.com/dlydiard/ddd-cqrs-es-aws-sam/issues).

