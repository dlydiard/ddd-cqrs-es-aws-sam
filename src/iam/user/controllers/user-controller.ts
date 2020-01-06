// reflect-metadata polyfill should be imported once in the entire application because the Reflect object is meant to be a global singleton.
import 'reflect-metadata';

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import HttpStatus = require('http-status-codes');

import { ApplicationContainer } from '../../../app/application-container';
import { ApplicationController } from '../../../app/application.controller';
import { DynamoProjectionRepository } from '../../../event-store/projections/repository/dynamo-projection.repository';
import { ProjectionRepository } from '../../../event-store/projections/repository/projection-repository.interface';
import { AddUserRole } from '../commands/add-user-role.command';
import { AddUserRoleHandler } from '../commands/add-user-role.handler';
import { DisableUser } from '../commands/disable-user.command';
import { DisableUserHandler } from '../commands/disable-user.handler';
import { RegisterUser } from '../commands/register-user.command';
import { RegisterUserHandler } from '../commands/register-user.handler';
import { RemoveUserRole } from '../commands/remove-user-role.command';
import { RemoveUserRoleHandler } from '../commands/remove-user-role.handler';
import { UpdateUser } from '../commands/update-user.command';
import { UpdateUserHandler } from '../commands/update-user.handler';
import { UserAddRoleDto } from '../dtos/user-addRole.dto';
import { UserDisableDto } from '../dtos/user-disable.dto';
import { UserGetDto } from '../dtos/user-get.dto';
import { UserListDto } from '../dtos/user-list.dto';
import { UserPostDto } from '../dtos/user-post.dto';
import { UserPutDto } from '../dtos/user-put.dto';
import { UserRemoveRoleDto } from '../dtos/user-removeRole.dto';
import { UserProjection } from '../projections/user.projection';

// cache container instance if we get the same lambda container
let _applicationContainer: ApplicationContainer;

function initApplication(): void {
  if (!_applicationContainer) {
    _applicationContainer = ApplicationContainer.instance();
  }
}

/**
 * Fetch users by filter
 * @param event
 * @param context
 */
export const listHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  initApplication();

  try {
    _applicationContainer.logger.debug('User List Handler Event: %o', event);

    const userListDto = Object.assign(new UserListDto(), event.queryStringParameters) as UserListDto;
    await validateOrReject(plainToClass(UserListDto, userListDto));

    const repository = _applicationContainer.get<ProjectionRepository<UserProjection>>(DynamoProjectionRepository);
    const userProjections = await repository.list(process.env.projectionUsersTable, userListDto);

    return { statusCode: HttpStatus.OK, body: JSON.stringify(userProjections) };
  } catch (error) {
    return ApplicationController.handleError(_applicationContainer, error);
  }
};

/**
 * Fetch user by id
 * @param event
 * @param context
 */
export const getHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  initApplication();

  try {
    _applicationContainer.logger.debug('User Get Handler Event: %o', event);

    const userGetDto = Object.assign(new UserGetDto(), event.pathParameters) as UserGetDto;
    await validateOrReject(userGetDto);

    const repository = _applicationContainer.get<ProjectionRepository<UserProjection>>(DynamoProjectionRepository);
    const userProjection = await repository.get(process.env.projectionUsersTable, userGetDto.id);

    return {
      statusCode: userProjection ? HttpStatus.OK : HttpStatus.NOT_FOUND,
      body: userProjection ? JSON.stringify(userProjection) : null
    };
  } catch (error) {
    return ApplicationController.handleError(_applicationContainer, error);
  }
};

/**
 * Create new user
 * @param event
 * @param context
 */
export const postHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  initApplication();

  try {
    _applicationContainer.logger.debug('User Post Handler Event: %o', event);

    const userPostDto = Object.assign(new UserPostDto(), JSON.parse(event.body)) as UserPostDto;
    await validateOrReject(userPostDto);
    await _applicationContainer.get<RegisterUserHandler>(RegisterUserHandler).handle(new RegisterUser(userPostDto.id, userPostDto.email));

    return { statusCode: HttpStatus.ACCEPTED, body: null };
  } catch (error) {
    return ApplicationController.handleError(_applicationContainer, error);
  }
};

/**
 * Update user
 * @param event
 * @param context
 */
export const putHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  initApplication();

  try {
    _applicationContainer.logger.debug('User Put Handler Event: %o', event);

    const userPutDto = Object.assign(new UserPutDto(), JSON.parse(event.body), event.pathParameters) as UserPutDto;

    await validateOrReject(userPutDto);
    await _applicationContainer.get<UpdateUserHandler>(UpdateUserHandler).handle(new UpdateUser(userPutDto.id, userPutDto.firstName, userPutDto.lastName));

    return { statusCode: HttpStatus.ACCEPTED, body: null };
  } catch (error) {
    return ApplicationController.handleError(_applicationContainer, error);
  }
};

/**
 * Disable user
 * @param event
 * @param context
 */
export const disableHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  initApplication();

  try {
    _applicationContainer.logger.debug('User Disable Handler Event: %o', event);

    const userDisableDto = Object.assign(new UserDisableDto(), event.pathParameters) as UserDisableDto;

    await validateOrReject(userDisableDto);
    await _applicationContainer.get<DisableUserHandler>(DisableUserHandler).handle(new DisableUser(userDisableDto.id));

    return { statusCode: HttpStatus.ACCEPTED, body: null };
  } catch (error) {
    return ApplicationController.handleError(_applicationContainer, error);
  }
};

/**
 * Add role to user
 * @param event
 * @param context
 */
export const addRoleHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  initApplication();

  try {
    _applicationContainer.logger.debug('Add Role Handler Event: %o', event);

    const userAddRoleDto = Object.assign(new UserAddRoleDto(), JSON.parse(event.body), event.pathParameters) as UserAddRoleDto;

    await validateOrReject(userAddRoleDto);
    await _applicationContainer.get<AddUserRoleHandler>(AddUserRoleHandler).handle(new AddUserRole(userAddRoleDto.id, userAddRoleDto.roleId));

    return { statusCode: HttpStatus.ACCEPTED, body: null };
  } catch (error) {
    return ApplicationController.handleError(_applicationContainer, error);
  }
};

/**
 * Remove role from user
 * @param event
 * @param context
 */
export const removeRoleHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  initApplication();

  try {
    _applicationContainer.logger.debug('Remove Role Handler Event: %o', event);

    const userRemoveRoleDto = Object.assign(new UserRemoveRoleDto(), event.pathParameters) as UserRemoveRoleDto;

    await validateOrReject(userRemoveRoleDto);
    await _applicationContainer.get<RemoveUserRoleHandler>(RemoveUserRoleHandler).handle(new RemoveUserRole(userRemoveRoleDto.id, userRemoveRoleDto.roleId));

    return { statusCode: HttpStatus.ACCEPTED, body: null };
  } catch (error) {
    return ApplicationController.handleError(_applicationContainer, error);
  }
};
