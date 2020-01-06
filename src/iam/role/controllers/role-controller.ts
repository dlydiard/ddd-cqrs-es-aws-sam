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
import { CreateRole } from '../commands/create-role.command';
import { CreateRoleHandler } from '../commands/create-role.handler';
import { DisableRole } from '../commands/disable-role.command';
import { DisableUserRoleHandler } from '../commands/disable-role.handler';
import { RoleDisableDto } from '../dtos/role-disable.dto';
import { RoleGetDto } from '../dtos/role-get.dto';
import { RoleListDto } from '../dtos/role-list.dto';
import { RolePostDto } from '../dtos/role-post.dto';
import { RoleProjection } from '../projections/role.projection';

// cache container instance if we get the same lambda container
let _applicationContainer: ApplicationContainer;

function initApplication(): void {
  if (!_applicationContainer) {
    _applicationContainer = ApplicationContainer.instance();
  }
}

/**
 * Fetch roles by filter
 * @param event
 * @param context
 */
export const listHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  initApplication();

  try {
    _applicationContainer.logger.debug('Role List Handler Event: %o', event);

    const roleListDto = Object.assign(new RoleListDto(), event.queryStringParameters) as RoleListDto;
    await validateOrReject(plainToClass(RoleListDto, roleListDto));

    const repository = _applicationContainer.get<ProjectionRepository<RoleProjection>>(DynamoProjectionRepository);
    const roleProjections = await repository.list(process.env.projectionRolesTable, roleListDto);

    return { statusCode: HttpStatus.OK, body: JSON.stringify(roleProjections) };
  } catch (error) {
    return ApplicationController.handleError(_applicationContainer, error);
  }
};

/**
 * Fetch role by id
 * @param event
 * @param context
 */
export const getHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  initApplication();

  try {
    _applicationContainer.logger.debug('Role Get Handler Event: %o', event);

    const roleGetDto = Object.assign(new RoleGetDto(), event.pathParameters) as RoleGetDto;
    await validateOrReject(roleGetDto);

    const repository = _applicationContainer.get<ProjectionRepository<RoleProjection>>(DynamoProjectionRepository);
    const roleProjection = await repository.get(process.env.projectionRolesTable, roleGetDto.id);

    return {
      statusCode: roleProjection ? HttpStatus.OK : HttpStatus.NOT_FOUND,
      body: roleProjection ? JSON.stringify(roleProjection) : null
    };
  } catch (error) {
    return ApplicationController.handleError(_applicationContainer, error);
  }
};

/**
 * Create new role
 * @param event
 * @param context
 */
export const postHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  initApplication();

  try {
    _applicationContainer.logger.debug('Role Post Handler Event: %o', event);

    const rolePostDto = Object.assign(new RolePostDto(), JSON.parse(event.body)) as RolePostDto;
    await validateOrReject(rolePostDto);
    await _applicationContainer.get<CreateRoleHandler>(CreateRoleHandler).handle(new CreateRole(rolePostDto.id, rolePostDto.name));

    return { statusCode: HttpStatus.ACCEPTED, body: null };
  } catch (error) {
    return ApplicationController.handleError(_applicationContainer, error);
  }
};

/**
 * Disable role
 * @param event
 * @param context
 */
export const disableHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  initApplication();

  try {
    _applicationContainer.logger.debug('Role Disable Handler Event: %o', event);

    const roleDisableDto = Object.assign(new RoleDisableDto(), event.pathParameters) as RoleDisableDto;

    await validateOrReject(roleDisableDto);
    await _applicationContainer.get<DisableUserRoleHandler>(DisableUserRoleHandler).handle(new DisableRole(roleDisableDto.id));

    return { statusCode: HttpStatus.ACCEPTED, body: null };
  } catch (error) {
    return ApplicationController.handleError(_applicationContainer, error);
  }
};
