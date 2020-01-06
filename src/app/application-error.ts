export enum ApplicationErrorNumber {
  Internal = 500,
  RecordNotFound,
  FileNotFound,
  MethodNotFound,
  UniqueConstraintViolated,
  TimedOut,
  ConnectionRefused
}

export class ApplicationError extends Error {
  public errorNumber: ApplicationErrorNumber = 0;

  constructor(message?: string, errorNumber: ApplicationErrorNumber = ApplicationErrorNumber.Internal) {
    super(message); // 'Error' breaks prototype chain here

    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    this.errorNumber = errorNumber;
  }

  toJSON(): Object {
    const alt = {};

    Object.getOwnPropertyNames(this).filter(key => key !== 'stack').forEach(function (key) {
      alt[key] = this[key];
    }, this);

    return alt;
  }
}
