import HttpStatus = require('http-status-codes');

import { ApplicationContainer } from './application-container';
import { ApplicationError, ApplicationErrorNumber } from './application-error';

export class ApplicationController {
  /**
   * Handle application error output.
   * @param applicationContainer
   * @param error
   * @returns JSON response object*
   */
  static handleError(applicationContainer: ApplicationContainer, error: any): any {
    applicationContainer.logger.error(error);

    if (error instanceof ApplicationError) {
      switch (error.errorNumber) {
        case ApplicationErrorNumber.FileNotFound:
        case ApplicationErrorNumber.RecordNotFound:
          return { statusCode: HttpStatus.NOT_FOUND, body: JSON.stringify({ error })};
        default:
          return { statusCode: HttpStatus.BAD_REQUEST, body: JSON.stringify({ error })};
      }
    }

    if (error?.length > 0) {
      return { statusCode: HttpStatus.BAD_REQUEST, body: JSON.stringify({ errors: error })};
    }

    return { statusCode: HttpStatus.BAD_REQUEST, body: JSON.stringify({ error })};
  }
}
